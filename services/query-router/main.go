package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"sort"
	"strings"
	"time"

	redis "github.com/redis/go-redis/v9"
	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"github.com/rs/zerolog"
)

type ParsedQuery struct {
	OrgID      string                 `json:"orgId"`
	Table      string                 `json:"table"`
	Operation  string                 `json:"operation"` // SELECT, INSERT, UPDATE, DELETE
	Conditions map[string]interface{} `json:"conditions,omitempty"`
	Data       map[string]interface{} `json:"data,omitempty"`
	Joins      []Join                 `json:"joins,omitempty"`
	OrderBy    string                 `json:"orderBy,omitempty"`
	Limit      int                    `json:"limit,omitempty"`
	Offset     int                    `json:"offset,omitempty"`
}

type Join struct {
	Table string `json:"table"`
	On    string `json:"on"`
}

type QueryResult struct {
	Rows          []map[string]interface{} `json:"rows"`
	Count         int                      `json:"count,omitempty"`
	ExecutionTime int64                    `json:"executionTime"`
}

type ShardConnection struct {
	ShardID string
	Pool    *sql.DB
}

type OrganizationLocation struct {
	Schema string
}

type QueryRouter struct {
	logger zerolog.Logger
	redis  *redis.Client
}

var safeIdentifierRegex = regexp.MustCompile(`^[a-zA-Z_][a-zA-Z0-9_]*$`)

var allowedTables = map[string]struct{}{
	"organizations":      {},
	"organization_admins": {},
	"clients":            {},
	"payments":           {},
	"departments":        {},
	"audit_logs":         {},
}

var allowedColumnsByTable = map[string]map[string]struct{}{
	"organizations": {"id": {}, "name": {}, "inn": {}, "type": {}, "industry": {}, "is_government": {}, "region": {}, "district": {}, "subdomain": {}, "custom_domain": {}, "plan": {}, "status": {}, "email": {}, "phone": {}, "address": {}, "logo": {}, "created_at": {}, "updated_at": {}},
	"organization_admins": {"id": {}, "organization_id": {}, "email": {}, "full_name": {}, "phone": {}, "role": {}, "status": {}, "last_login": {}, "created_at": {}, "updated_at": {}},
	"clients": {"id": {}, "organization_id": {}, "pinfl": {}, "contract_number": {}, "full_name": {}, "phone": {}, "email": {}, "address": {}, "birth_date": {}, "department_id": {}, "total_amount": {}, "paid_amount": {}, "debt_amount": {}, "status": {}, "additional_info": {}, "contact_phone": {}, "contact_name": {}, "created_at": {}, "updated_at": {}},
	"payments": {"id": {}, "organization_id": {}, "client_id": {}, "amount": {}, "currency": {}, "payment_method": {}, "status": {}, "transaction_id": {}, "reference_number": {}, "bank_account": {}, "bank_mfo": {}, "bank_name": {}, "payment_date": {}, "confirmed_at": {}, "confirmed_by": {}, "description": {}, "reconciled": {}, "reconciled_at": {}, "reconciled_with": {}, "category": {}, "created_at": {}, "updated_at": {}},
	"departments": {"id": {}, "organization_id": {}, "name": {}, "code": {}, "description": {}, "manager_name": {}, "specialty": {}, "course": {}, "year": {}, "created_at": {}, "updated_at": {}},
	"audit_logs": {"id": {}, "organization_id": {}, "user_id": {}, "action": {}, "entity": {}, "entity_id": {}, "old_value": {}, "new_value": {}, "ip_address": {}, "user_agent": {}, "created_at": {}},
}

func NewQueryRouter() *QueryRouter {
	logger := zerolog.New(os.Stdout).With().Timestamp().Logger()

	rdb := redis.NewClient(&redis.Options{
		Addr:     getEnv("REDIS_ADDR", "localhost:6379"),
		Password: getEnv("REDIS_PASSWORD", ""),
		DB:       0,
	})

	return &QueryRouter{
		logger: logger,
		redis:  rdb,
		// shardManager will be set later
	}
}

func (qr *QueryRouter) RouteQuery(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if recovered := recover(); recovered != nil {
			qr.logger.Warn().Interface("panic", recovered).Msg("Rejected unsafe query input")
			http.Error(w, "Invalid query", http.StatusBadRequest)
		}
	}()

	startTime := time.Now()

	var query ParsedQuery
	if err := json.NewDecoder(r.Body).Decode(&query); err != nil {
		qr.logger.Error().Err(err).Msg("Failed to decode query")
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	cacheKey := qr.buildCacheKey(query)

	// Check cache for read operations
	if query.Operation == "SELECT" {
		if cached := qr.getFromCache(cacheKey); cached != nil {
			cached.ExecutionTime = time.Since(startTime).Milliseconds()
			qr.respondJSON(w, cached)
			return
		}
	}

	// Execute on shard
	result, err := qr.executeOnShard(query)
	if err != nil {
		qr.logger.Error().Err(err).Str("orgId", query.OrgID).Msg("Query execution failed")
		http.Error(w, "Query execution failed", http.StatusInternalServerError)
		return
	}

	// Cache read results
	if query.Operation == "SELECT" {
		qr.setCache(cacheKey, result, qr.getCacheTTL(query.Table))
	}

	result.ExecutionTime = time.Since(startTime).Milliseconds()
	qr.respondJSON(w, result)
}

func (qr *QueryRouter) executeOnShard(query ParsedQuery) (*QueryResult, error) {
	// Placeholder: get shard connection
	// In real implementation, integrate with ShardManager
	conn := qr.getShardConnection(query.OrgID)
	if conn == nil {
		return nil, errors.New("database connection is not available")
	}
	location := qr.getOrganizationLocation(query.OrgID)

	sql := qr.buildSQLQuery(query, location.Schema)
	params := qr.extractParams(query)

	qr.logger.Debug().Str("sql", sql).Interface("params", params).Msg("Executing query")

	rows, err := conn.Query(sql, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result QueryResult
	cols, err := rows.Columns()
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		values := make([]interface{}, len(cols))
		valuePtrs := make([]interface{}, len(cols))
		for i := range values {
			valuePtrs[i] = &values[i]
		}

		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, err
		}

		row := make(map[string]interface{})
		for i, col := range cols {
			val := values[i]
			if b, ok := val.([]byte); ok {
				val = string(b)
			}
			row[col] = val
		}
		result.Rows = append(result.Rows, row)
	}

	result.Count = len(result.Rows)
	return &result, nil
}

func (qr *QueryRouter) buildSQLQuery(query ParsedQuery, schema string) string {
	safeSchema := validateIdentifier(schema, "schema")
	safeTable := validateTable(query.Table)

	switch query.Operation {
	case "SELECT":
		return qr.buildSelectQuery(safeSchema, safeTable, query)
	case "INSERT":
		return qr.buildInsertQuery(safeSchema, safeTable, query)
	case "UPDATE":
		return qr.buildUpdateQuery(safeSchema, safeTable, query)
	case "DELETE":
		return qr.buildDeleteQuery(safeSchema, safeTable, query)
	default:
		panic(fmt.Sprintf("Unsupported operation: %s", query.Operation))
	}
}

func (qr *QueryRouter) buildSelectQuery(schema string, table string, query ParsedQuery) string {
	mustValidateColumnMap(table, query.Conditions, "conditions")
	sql := fmt.Sprintf("SELECT * FROM %s.%s", schema, table)

	if len(query.Joins) > 0 {
		for _, join := range query.Joins {
			joinTable := validateTable(join.Table)
			joinClause := mustValidateJoinCondition(table, joinTable, join.On)
			sql += fmt.Sprintf(" JOIN %s.%s ON %s", schema, joinTable, joinClause)
		}
	}

	if len(query.Conditions) > 0 {
		where := qr.buildWhereClause(query.Conditions)
		sql += " WHERE " + where
	}

	if query.OrderBy != "" {
		sql += " ORDER BY " + mustValidateOrderBy(table, query.OrderBy)
	}

	if query.Limit > 0 {
		sql += fmt.Sprintf(" LIMIT %d", query.Limit)
	}

	if query.Offset > 0 {
		sql += fmt.Sprintf(" OFFSET %d", query.Offset)
	}

	return sql
}

func (qr *QueryRouter) buildInsertQuery(schema string, table string, query ParsedQuery) string {
	mustValidateColumnMap(table, query.Data, "data")
	keys := sortedKeys(query.Data)
	cols := make([]string, 0, len(keys))
	placeholders := make([]string, 0, len(keys))

	for i, col := range keys {
		cols = append(cols, validateIdentifier(col, "column"))
		placeholders = append(placeholders, fmt.Sprintf("$%d", i+1))
	}

	return fmt.Sprintf("INSERT INTO %s.%s (%s) VALUES (%s) RETURNING *",
		schema, table, strings.Join(cols, ", "), strings.Join(placeholders, ", "))
}

func (qr *QueryRouter) buildUpdateQuery(schema string, table string, query ParsedQuery) string {
	mustValidateColumnMap(table, query.Data, "data")
	mustValidateColumnMap(table, query.Conditions, "conditions")
	dataKeys := sortedKeys(query.Data)
	sets := make([]string, 0, len(dataKeys))
	for i, col := range dataKeys {
		sets = append(sets, fmt.Sprintf("%s = $%d", validateIdentifier(col, "column"), i+1))
	}

	where := qr.buildWhereClauseWithOffset(query.Conditions, len(dataKeys))
	return fmt.Sprintf("UPDATE %s.%s SET %s WHERE %s RETURNING *",
		schema, table, strings.Join(sets, ", "), where)
}

func (qr *QueryRouter) buildDeleteQuery(schema string, table string, query ParsedQuery) string {
	mustValidateColumnMap(table, query.Conditions, "conditions")
	where := qr.buildWhereClause(query.Conditions)
	return fmt.Sprintf("DELETE FROM %s.%s WHERE %s RETURNING *", schema, table, where)
}

func (qr *QueryRouter) buildWhereClause(conditions map[string]interface{}) string {
	return qr.buildWhereClauseWithOffset(conditions, 0)
}

func (qr *QueryRouter) buildWhereClauseWithOffset(conditions map[string]interface{}, offset int) string {
	clauses := make([]string, 0, len(conditions))
	keys := sortedKeys(conditions)
	for idx, key := range keys {
		value := conditions[key]
		safeColumn := validateIdentifier(key, "column")
		if value == nil {
			clauses = append(clauses, fmt.Sprintf("%s IS NULL", safeColumn))
		} else {
			clauses = append(clauses, fmt.Sprintf("%s = $%d", safeColumn, offset+idx+1))
		}
	}
	return strings.Join(clauses, " AND ")
}

func (qr *QueryRouter) extractParams(query ParsedQuery) []interface{} {
	params := []interface{}{}

	if query.Data != nil {
		for _, k := range sortedKeys(query.Data) {
			v := query.Data[k]
			params = append(params, v)
		}
	}

	if query.Conditions != nil {
		for _, k := range sortedKeys(query.Conditions) {
			v := query.Conditions[k]
			if v != nil {
				params = append(params, v)
			}
		}
	}

	return params
}

func (qr *QueryRouter) buildCacheKey(query ParsedQuery) string {
	key := fmt.Sprintf("query:%s:%s:%s", query.OrgID, query.Table, query.Operation)

	cond, _ := json.Marshal(query.Conditions)
	data, _ := json.Marshal(query.Data)
	joins, _ := json.Marshal(query.Joins)

	key += fmt.Sprintf(":%s:%s:%s:%s:%d:%d",
		string(cond), string(data), string(joins),
		query.OrderBy, query.Limit, query.Offset)

	return key
}

func (qr *QueryRouter) getFromCache(key string) *QueryResult {
	val, err := qr.redis.Get(context.Background(), key).Result()
	if err != nil {
		return nil
	}

	var result QueryResult
	if err := json.Unmarshal([]byte(val), &result); err != nil {
		qr.logger.Warn().Err(err).Msg("Failed to unmarshal cached data")
		return nil
	}

	return &result
}

func (qr *QueryRouter) setCache(key string, data *QueryResult, ttl time.Duration) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		qr.logger.Warn().Err(err).Msg("Failed to marshal data for cache")
		return
	}

	qr.redis.Set(context.Background(), key, jsonData, ttl)
}

func (qr *QueryRouter) getCacheTTL(table string) time.Duration {
	ttlMap := map[string]time.Duration{
		"organizations": 1 * time.Hour,
		"clients":       30 * time.Minute,
		"payments":      15 * time.Minute,
		"departments":   1 * time.Hour,
	}

	if ttl, ok := ttlMap[table]; ok {
		return ttl
	}
	return 30 * time.Minute
}

// Placeholder methods - need to integrate with actual ShardManager
func (qr *QueryRouter) getShardConnection(orgID string) *sql.DB {
	// Placeholder implementation
	// In real implementation, call Shard Manager service
	// For now, return a mock DB connection
	db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Printf("Failed to connect to DB: %v", err)
		return nil
	}
	return db
}

func (qr *QueryRouter) getOrganizationLocation(orgID string) OrganizationLocation {
	// Placeholder - in real implementation, call Shard Manager service
	// For now, parse orgID to get schema
	parts := strings.Split(orgID, "-")
	if len(parts) != 3 {
		return OrganizationLocation{Schema: "public"}
	}
	return OrganizationLocation{Schema: "org_" + strings.ReplaceAll(orgID, "-", "")}
}

func (qr *QueryRouter) respondJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func sortedKeys(input map[string]interface{}) []string {
	keys := make([]string, 0, len(input))
	for key := range input {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	return keys
}

func validateIdentifier(identifier string, label string) string {
	if !safeIdentifierRegex.MatchString(identifier) {
		panic(fmt.Sprintf("invalid %s: %s", label, identifier))
	}
	return identifier
}

func validateTable(table string) string {
	safeTable := validateIdentifier(table, "table")
	if _, ok := allowedTables[safeTable]; !ok {
		panic(fmt.Sprintf("table is not allowed: %s", table))
	}
	return safeTable
}

func mustValidateColumnMap(table string, payload map[string]interface{}, payloadName string) {
	if payload == nil {
		return
	}
	tableColumns, ok := allowedColumnsByTable[table]
	if !ok {
		panic(fmt.Sprintf("column map is not configured for table: %s", table))
	}

	for key := range payload {
		safeKey := validateIdentifier(key, "column")
		if _, allowed := tableColumns[safeKey]; !allowed {
			panic(fmt.Sprintf("column %s is not allowed in %s for table %s", key, payloadName, table))
		}
	}
}

func mustValidateOrderBy(table string, orderBy string) string {
	parts := strings.Fields(strings.TrimSpace(orderBy))
	if len(parts) == 0 || len(parts) > 2 {
		panic(fmt.Sprintf("invalid orderBy clause: %s", orderBy))
	}

	column := validateIdentifier(parts[0], "order column")
	tableColumns := allowedColumnsByTable[table]
	if _, ok := tableColumns[column]; !ok {
		panic(fmt.Sprintf("order column %s is not allowed for table %s", column, table))
	}

	direction := "ASC"
	if len(parts) == 2 {
		dir := strings.ToUpper(parts[1])
		if dir != "ASC" && dir != "DESC" {
			panic(fmt.Sprintf("invalid order direction: %s", parts[1]))
		}
		direction = dir
	}

	return fmt.Sprintf("%s %s", column, direction)
}

func mustValidateJoinCondition(baseTable string, joinTable string, clause string) string {
	re := regexp.MustCompile(`^([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)$`)
	match := re.FindStringSubmatch(strings.TrimSpace(clause))
	if len(match) != 5 {
		panic(fmt.Sprintf("invalid join clause: %s", clause))
	}

	leftTable := validateIdentifier(match[1], "join table")
	leftColumn := validateIdentifier(match[2], "join column")
	rightTable := validateIdentifier(match[3], "join table")
	rightColumn := validateIdentifier(match[4], "join column")

	if leftTable != baseTable && leftTable != joinTable {
		panic(fmt.Sprintf("join table %s is not allowed in clause %s", leftTable, clause))
	}
	if rightTable != baseTable && rightTable != joinTable {
		panic(fmt.Sprintf("join table %s is not allowed in clause %s", rightTable, clause))
	}

	if _, ok := allowedColumnsByTable[leftTable][leftColumn]; !ok {
		panic(fmt.Sprintf("join column %s is not allowed for table %s", leftColumn, leftTable))
	}
	if _, ok := allowedColumnsByTable[rightTable][rightColumn]; !ok {
		panic(fmt.Sprintf("join column %s is not allowed for table %s", rightColumn, rightTable))
	}

	return fmt.Sprintf("%s.%s = %s.%s", leftTable, leftColumn, rightTable, rightColumn)
}

func main() {
	qr := NewQueryRouter()

	r := mux.NewRouter()
	r.HandleFunc("/query", qr.RouteQuery).Methods("POST")

	port := getEnv("PORT", "8080")
	qr.logger.Info().Str("port", port).Msg("Starting Query Router service")
	log.Fatal(http.ListenAndServe(":"+port, r))
}