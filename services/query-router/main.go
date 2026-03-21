package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"
	"sort"
	"strings"
	"time"

	redis "github.com/redis/go-redis/v9"
	"github.com/gorilla/mux"
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

// ShardManagerLocation mirrors shard-manager's OrganizationLocation response.
type ShardManagerLocation struct {
	Region string `json:"region"`
	Shard  string `json:"shard"`
	Schema string `json:"schema"`
}

// ShardManagerExecuteRequest mirrors shard-manager's QueryRequest.
type ShardManagerExecuteRequest struct {
	OrgID  string               `json:"org_id"`
	Query  string               `json:"query"`
	Params []interface{}        `json:"params"`
}

var safeIdentifierRegex = regexp.MustCompile(`^[a-zA-Z_][a-zA-Z0-9_]*$`)

var allowedTables = map[string]struct{}{
	"organizations": {},
	"org_admins":    {},
	"clients":       {},
	"payments":      {},
	"departments":   {},
	"audit_logs":    {},
}

// Column names match rust-core Postgres schema (org_id, dept_id, logo_url, …).
var allowedColumnsByTable = map[string]map[string]struct{}{
	"organizations": {
		"id": {}, "name": {}, "inn": {}, "type": {}, "industry": {}, "is_government": {}, "region": {}, "district": {},
		"parent_id": {}, "subdomain": {}, "custom_domain": {}, "plan": {}, "status": {}, "email": {}, "phone": {}, "address": {}, "logo_url": {},
		"has_clients": {}, "has_payments": {}, "has_reports": {}, "has_bank_integration": {}, "has_telegram_bot": {},
		"has_sms_notifications": {}, "has_excel_import": {}, "has_pdf_reports": {}, "allow_sub_orgs": {},
		"client_limit": {}, "department_limit": {}, "subscription_ends_at": {}, "trial_ends_at": {},
		"shard_region": {}, "shard_instance": {}, "created_at": {}, "updated_at": {},
	},
	"org_admins": {
		"id": {}, "org_id": {}, "email": {}, "password_hash": {}, "full_name": {}, "phone": {}, "role": {}, "status": {},
		"last_login": {}, "created_at": {}, "updated_at": {},
	},
	"clients": {
		"id": {}, "org_id": {}, "pinfl": {}, "contract_number": {}, "full_name": {}, "phone": {}, "email": {}, "address": {},
		"birth_date": {}, "dept_id": {}, "total_amount": {}, "paid_amount": {}, "debt_amount": {}, "status": {},
		"additional_info": {}, "contact_phone": {}, "contact_name": {}, "created_at": {}, "updated_at": {},
	},
	"payments": {
		"id": {}, "org_id": {}, "client_id": {}, "amount": {}, "currency": {}, "payment_method": {}, "status": {},
		"transaction_id": {}, "reference_number": {}, "bank_account": {}, "bank_mfo": {}, "bank_name": {},
		"payment_date": {}, "confirmed_at": {}, "confirmed_by": {}, "description": {}, "reconciled": {},
		"reconciled_at": {}, "reconciled_with": {}, "category": {}, "created_at": {}, "updated_at": {},
	},
	"departments": {
		"id": {}, "org_id": {}, "name": {}, "code": {}, "description": {}, "manager_name": {}, "specialty": {},
		"course": {}, "year": {}, "created_at": {}, "updated_at": {},
	},
	"audit_logs": {
		"id": {}, "org_id": {}, "user_id": {}, "action": {}, "entity": {}, "entity_id": {}, "old_value": {}, "new_value": {},
		"ip_address": {}, "user_agent": {}, "created_at": {},
	},
}

type QueryRouter struct {
	logger          zerolog.Logger
	redis           *redis.Client
	shardManagerURL string
	httpClient      *http.Client
}

func NewQueryRouter() *QueryRouter {
	logger := zerolog.New(os.Stdout).With().Timestamp().Logger()

	rdb := redis.NewClient(&redis.Options{
		Addr:     getEnv("REDIS_ADDR", "localhost:6379"),
		Password: getEnv("REDIS_PASSWORD", ""),
		DB:       0,
	})

	shardManagerURL := strings.TrimRight(
		getEnv("SHARD_MANAGER_URL", "http://shard-manager:8081"),
		"/",
	)

	httpClient := &http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			MaxIdleConns:    20,
			IdleConnTimeout: 90 * time.Second,
		},
	}

	return &QueryRouter{
		logger:          logger,
		redis:           rdb,
		shardManagerURL: shardManagerURL,
		httpClient:      httpClient,
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

	// Return cached result for SELECT operations
	if query.Operation == "SELECT" {
		if cached := qr.getFromCache(cacheKey); cached != nil {
			cached.ExecutionTime = time.Since(startTime).Milliseconds()
			qr.respondJSON(w, cached)
			return
		}
	}

	// Execute on shard via shard-manager
	result, err := qr.executeOnShard(query)
	if err != nil {
		qr.logger.Error().Err(err).Str("orgId", query.OrgID).Msg("Query execution failed")
		http.Error(w, "Query execution failed", http.StatusInternalServerError)
		return
	}

	// Cache SELECT results
	if query.Operation == "SELECT" {
		qr.setCache(cacheKey, result, qr.getCacheTTL(query.Table))
	}

	result.ExecutionTime = time.Since(startTime).Milliseconds()
	qr.respondJSON(w, result)
}

// getOrganizationSchema calls shard-manager to resolve the DB schema for an org.
func (qr *QueryRouter) getOrganizationSchema(orgID string) (string, error) {
	url := fmt.Sprintf("%s/location/%s", qr.shardManagerURL, orgID)

	resp, err := qr.httpClient.Get(url)
	if err != nil {
		return "", fmt.Errorf("shard-manager unreachable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return "", fmt.Errorf("organization %s not found in any shard", orgID)
	}
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("shard-manager returned %d: %s", resp.StatusCode, string(body))
	}

	var loc ShardManagerLocation
	if err := json.NewDecoder(resp.Body).Decode(&loc); err != nil {
		return "", fmt.Errorf("invalid location response: %w", err)
	}

	if loc.Schema == "" {
		return "public", nil
	}
	return loc.Schema, nil
}

// executeOnShard builds the SQL query, then delegates execution to shard-manager.
func (qr *QueryRouter) executeOnShard(query ParsedQuery) (*QueryResult, error) {
	schema, err := qr.getOrganizationSchema(query.OrgID)
	if err != nil {
		return nil, err
	}

	rawSQL := qr.buildSQLQuery(query, schema)
	params := qr.extractParams(query)

	reqBody := ShardManagerExecuteRequest{
		OrgID:  query.OrgID,
		Query:  rawSQL,
		Params: params,
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("marshal execute request: %w", err)
	}

	url := fmt.Sprintf("%s/execute", qr.shardManagerURL)
	resp, err := qr.httpClient.Post(url, "application/json", bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("shard-manager execute failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("shard-manager execute returned %d: %s", resp.StatusCode, string(body))
	}

	// shard-manager returns []serde_json::Value (array of row objects)
	var rows []map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&rows); err != nil {
		return nil, fmt.Errorf("decode execute response: %w", err)
	}

	return &QueryResult{
		Rows:  rows,
		Count: len(rows),
	}, nil
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
			params = append(params, query.Data[k])
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

func (qr *QueryRouter) respondJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func healthHandler(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok","service":"query-router"}`))
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

// validateShardManagerConnection checks that shard-manager is reachable at startup.
func (qr *QueryRouter) validateShardManagerConnection() error {
	url := fmt.Sprintf("%s/health", qr.shardManagerURL)
	resp, err := qr.httpClient.Get(url)
	if err != nil {
		return fmt.Errorf("cannot reach shard-manager at %s: %w", qr.shardManagerURL, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return errors.New("shard-manager health check failed")
	}
	return nil
}

func main() {
	qr := NewQueryRouter()

	if err := qr.validateShardManagerConnection(); err != nil {
		qr.logger.Fatal().Err(err).Msg("shard-manager not available")
	}

	r := mux.NewRouter()
	r.HandleFunc("/query", qr.RouteQuery).Methods("POST")
	r.HandleFunc("/health", healthHandler).Methods("GET")

	port := getEnv("PORT", "8082")
	qr.logger.Info().Str("port", port).Str("shardManager", qr.shardManagerURL).Msg("Starting Query Router")

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		qr.logger.Fatal().Err(err).Msg("server error")
	}
}
