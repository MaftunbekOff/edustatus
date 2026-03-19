package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/mux"
	"github.com/lib/pq"
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
	logger        zerolog.Logger
	redis         *redis.Client
	shardManager  *ShardManager // Placeholder, will need to integrate
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
	switch query.Operation {
	case "SELECT":
		return qr.buildSelectQuery(schema, query)
	case "INSERT":
		return qr.buildInsertQuery(schema, query)
	case "UPDATE":
		return qr.buildUpdateQuery(schema, query)
	case "DELETE":
		return qr.buildDeleteQuery(schema, query)
	default:
		panic(fmt.Sprintf("Unsupported operation: %s", query.Operation))
	}
}

func (qr *QueryRouter) buildSelectQuery(schema string, query ParsedQuery) string {
	sql := fmt.Sprintf("SELECT * FROM %s.%s", schema, query.Table)

	if len(query.Joins) > 0 {
		for _, join := range query.Joins {
			sql += fmt.Sprintf(" JOIN %s.%s ON %s", schema, join.Table, join.On)
		}
	}

	if len(query.Conditions) > 0 {
		where := qr.buildWhereClause(query.Conditions)
		sql += " WHERE " + where
	}

	if query.OrderBy != "" {
		sql += " ORDER BY " + query.OrderBy
	}

	if query.Limit > 0 {
		sql += fmt.Sprintf(" LIMIT %d", query.Limit)
	}

	if query.Offset > 0 {
		sql += fmt.Sprintf(" OFFSET %d", query.Offset)
	}

	return sql
}

func (qr *QueryRouter) buildInsertQuery(schema string, query ParsedQuery) string {
	cols := make([]string, 0, len(query.Data))
	placeholders := make([]string, 0, len(query.Data))

	i := 1
	for col := range query.Data {
		cols = append(cols, col)
		placeholders = append(placeholders, fmt.Sprintf("$%d", i))
		i++
	}

	return fmt.Sprintf("INSERT INTO %s.%s (%s) VALUES (%s) RETURNING *",
		schema, query.Table, strings.Join(cols, ", "), strings.Join(placeholders, ", "))
}

func (qr *QueryRouter) buildUpdateQuery(schema string, query ParsedQuery) string {
	sets := make([]string, 0, len(query.Data))
	i := 1
	for col := range query.Data {
		sets = append(sets, fmt.Sprintf("%s = $%d", col, i))
		i++
	}

	where := qr.buildWhereClause(query.Conditions)
	return fmt.Sprintf("UPDATE %s.%s SET %s WHERE %s RETURNING *",
		schema, query.Table, strings.Join(sets, ", "), where)
}

func (qr *QueryRouter) buildDeleteQuery(schema string, query ParsedQuery) string {
	where := qr.buildWhereClause(query.Conditions)
	return fmt.Sprintf("DELETE FROM %s.%s WHERE %s RETURNING *", schema, query.Table, where)
}

func (qr *QueryRouter) buildWhereClause(conditions map[string]interface{}) string {
	clauses := make([]string, 0, len(conditions))
	for key, value := range conditions {
		if value == nil {
			clauses = append(clauses, fmt.Sprintf("%s IS NULL", key))
		} else {
			clauses = append(clauses, fmt.Sprintf("%s = ?", key))
		}
	}
	return strings.Join(clauses, " AND ")
}

func (qr *QueryRouter) extractParams(query ParsedQuery) []interface{} {
	params := []interface{}{}

	if query.Data != nil {
		for _, v := range query.Data {
			params = append(params, v)
		}
	}

	if query.Conditions != nil {
		for _, v := range query.Conditions {
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
	// In real implementation, get from ShardManager
	db, err := sql.Open("postgres", "postgres://user:pass@localhost/db?sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}
	return db
}

func (qr *QueryRouter) getOrganizationLocation(orgID string) OrganizationLocation {
	// Placeholder
	return OrganizationLocation{Schema: "org_" + orgID}
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

func main() {
	qr := NewQueryRouter()

	r := mux.NewRouter()
	r.HandleFunc("/query", qr.RouteQuery).Methods("POST")

	port := getEnv("PORT", "8080")
	qr.logger.Info().Str("port", port).Msg("Starting Query Router service")
	log.Fatal(http.ListenAndServe(":"+port, r))
}