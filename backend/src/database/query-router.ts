import { Injectable, Logger } from '@nestjs/common';
import { ShardManager } from './shard-manager';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import Redis from 'ioredis';

export interface ParsedQuery {
  orgId: string;
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  conditions?: Record<string, any>;
  data?: Record<string, any>;
  joins?: Array<{ table: string, on: string }>;
  orderBy?: string;
  limit?: number;
  offset?: number;
}

export interface QueryResult {
  rows: any[];
  count?: number;
  executionTime: number;
}

@Injectable()
export class QueryRouter {
  private readonly logger = new Logger(QueryRouter.name);
  private redis: Redis;
  private queryRouterUrl: string;
  private readonly maxRetryAttempts = parseInt(process.env.QUERY_ROUTER_RETRIES || '2', 10);
  private readonly requestTimeoutMs = parseInt(process.env.QUERY_ROUTER_TIMEOUT_MS || '5000', 10);
  private readonly allowedTables = new Set([
    'organizations',
    'organization_admins',
    'clients',
    'payments',
    'departments',
    'audit_logs',
  ]);
  private readonly allowedColumnsByTable: Record<string, Set<string>> = {
    organizations: new Set([
      'id', 'name', 'inn', 'type', 'industry', 'is_government', 'region', 'district', 'subdomain',
      'custom_domain', 'plan', 'status', 'email', 'phone', 'address', 'logo', 'created_at', 'updated_at',
    ]),
    organization_admins: new Set([
      'id', 'organization_id', 'email', 'full_name', 'phone', 'role', 'status', 'last_login', 'created_at', 'updated_at',
    ]),
    clients: new Set([
      'id', 'organization_id', 'pinfl', 'contract_number', 'full_name', 'phone', 'email', 'address', 'birth_date',
      'department_id', 'total_amount', 'paid_amount', 'debt_amount', 'status', 'additional_info', 'contact_phone',
      'contact_name', 'created_at', 'updated_at',
    ]),
    payments: new Set([
      'id', 'organization_id', 'client_id', 'amount', 'currency', 'payment_method', 'status', 'transaction_id',
      'reference_number', 'bank_account', 'bank_mfo', 'bank_name', 'payment_date', 'confirmed_at', 'confirmed_by',
      'description', 'reconciled', 'reconciled_at', 'reconciled_with', 'category', 'created_at', 'updated_at',
    ]),
    departments: new Set([
      'id', 'organization_id', 'name', 'code', 'description', 'manager_name', 'specialty', 'course', 'year',
      'created_at', 'updated_at',
    ]),
    audit_logs: new Set([
      'id', 'organization_id', 'user_id', 'action', 'entity', 'entity_id', 'old_value', 'new_value', 'ip_address',
      'user_agent', 'created_at',
    ]),
  };

  constructor(
    private shardManager: ShardManager,
    private httpService: HttpService,
  ) {
    this.queryRouterUrl = process.env.QUERY_ROUTER_URL || 'http://localhost:8080';
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      lazyConnect: true,
      enableOfflineQueue: false,
    });
  }

  /**
    * Route and execute query using Go service
    */
  async routeQuery(query: ParsedQuery): Promise<QueryResult> {
    const startTime = Date.now();
    let lastError: any = null;

    for (let attempt = 1; attempt <= this.maxRetryAttempts + 1; attempt++) {
      try {
        const response = await firstValueFrom(
          this.httpService.post(`${this.queryRouterUrl}/query`, query, {
            timeout: this.requestTimeoutMs,
          }),
        );

        const result = this.normalizeResult(response.data);
        result.executionTime = Date.now() - startTime;

        // Invalidate org cache on write operations.
        if (query.operation !== 'SELECT') {
          await this.invalidateOrgCache(query.orgId);
        }

        this.logger.debug(`Query executed via Go service`, {
          operation: query.operation,
          table: query.table,
          executionTime: result.executionTime,
          attempt,
        });

        return result;
      } catch (error: any) {
        lastError = error;

        const canRetry = attempt <= this.maxRetryAttempts;
        this.logger.warn(`Query router call failed`, {
          operation: query.operation,
          table: query.table,
          attempt,
          canRetry,
          error: error?.message || 'unknown error',
        });

        if (!canRetry) {
          break;
        }

        await this.sleep(attempt * 100);
      }
    }

    this.logger.error(`Query execution failed after retries`, {
      query,
      attempts: this.maxRetryAttempts + 1,
      error: lastError?.message || 'unknown error',
      executionTime: Date.now() - startTime,
    });

    throw lastError;
  }

  async getHealth(): Promise<{ queryRouter: boolean; redis: boolean; details?: Record<string, any> }> {
    let queryRouter = false;
    let redis = false;
    const details: Record<string, any> = {};

    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.queryRouterUrl}/query`,
          {
            orgId: '00-0000-00000000',
            table: 'organizations',
            operation: 'SELECT',
            limit: 1,
          },
          { timeout: this.requestTimeoutMs },
        ),
      );
      queryRouter = true;
    } catch (error: any) {
      details.queryRouterError = error?.message || 'query-router is unavailable';
    }

    try {
      const pong = await this.redis.ping();
      redis = pong === 'PONG';
      if (!redis) {
        details.redisError = `unexpected ping response: ${pong}`;
      }
    } catch (error: any) {
      details.redisError = error?.message || 'redis ping failed';
    }

    return { queryRouter, redis, details };
  }

  /**
   * Execute query on specific shard
   */
  private async executeOnShard(query: ParsedQuery): Promise<QueryResult> {
    const location = await this.shardManager.getOrganizationLocation(query.orgId);

    // Build SQL query
    const sql = this.buildSqlQuery(query, location.schema);

    this.logger.debug(`Executing query on shard for org ${query.orgId}:`, { sql, params: query.data });

    const result = await this.shardManager.executeOnShard(query.orgId, sql, this.extractParams(query));

    return {
      rows: result.rows || [],
      count: result.count || 0,
      executionTime: 0 // Will be set by caller
    };
  }

  /**
   * Build SQL query from parsed query
   */
  private buildSqlQuery(query: ParsedQuery, schema: string): string {
    const { table, operation, conditions, data, joins, orderBy, limit, offset } = query;
    const safeSchema = this.validateIdentifier(schema, 'schema');
    const safeTable = this.validateTable(table);

    switch (operation) {
      case 'SELECT':
        return this.buildSelectQuery(safeSchema, safeTable, conditions, joins, orderBy, limit, offset);

      case 'INSERT':
        return this.buildInsertQuery(safeSchema, safeTable, data || {});

      case 'UPDATE':
        return this.buildUpdateQuery(safeSchema, safeTable, data || {}, conditions || {});

      case 'DELETE':
        return this.buildDeleteQuery(safeSchema, safeTable, conditions || {});

      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }

  private buildSelectQuery(
    schema: string,
    table: string,
    conditions?: Record<string, any>,
    joins?: Array<{ table: string, on: string }>,
    orderBy?: string,
    limit?: number,
    offset?: number
  ): string {
    this.validateColumnMap(table, conditions, 'conditions');

    let query = `SELECT * FROM ${schema}.${table}`;

    if (joins && joins.length > 0) {
      for (const join of joins) {
        const joinTable = this.validateTable(join.table);
        const joinOn = this.validateJoinCondition(table, joinTable, join.on);
        query += ` JOIN ${schema}.${joinTable} ON ${joinOn}`;
      }
    }

    if (conditions && Object.keys(conditions).length > 0) {
      const whereClause = this.buildWhereClause(conditions);
      query += ` WHERE ${whereClause}`;
    }

    if (orderBy) {
      query += ` ORDER BY ${this.validateOrderBy(table, orderBy)}`;
    }

    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    if (offset) {
      query += ` OFFSET ${offset}`;
    }

    return query;
  }

  private buildInsertQuery(schema: string, table: string, data: Record<string, any>): string {
    this.validateColumnMap(table, data, 'data');

    const columns = Object.keys(data);
    const placeholders = columns.map((_, i) => `$${i + 1}`);

    return `INSERT INTO ${schema}.${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
  }

  private buildUpdateQuery(schema: string, table: string, data: Record<string, any>, conditions: Record<string, any>): string {
    this.validateColumnMap(table, data, 'data');
    this.validateColumnMap(table, conditions, 'conditions');

    const setClause = Object.keys(data).map((col, i) => `${col} = $${i + 1}`).join(', ');
    const whereClause = this.buildWhereClause(conditions, Object.keys(data).length);

    return `UPDATE ${schema}.${table} SET ${setClause} WHERE ${whereClause} RETURNING *`;
  }

  private buildDeleteQuery(schema: string, table: string, conditions: Record<string, any>): string {
    this.validateColumnMap(table, conditions, 'conditions');

    const whereClause = this.buildWhereClause(conditions);
    return `DELETE FROM ${schema}.${table} WHERE ${whereClause} RETURNING *`;
  }

  private buildWhereClause(conditions: Record<string, any>, paramOffset = 0): string {
    const clauses: string[] = [];

    for (const [key, value] of Object.entries(conditions)) {
      const safeKey = this.validateIdentifier(key, 'column');

      if (value === null) {
        clauses.push(`${safeKey} IS NULL`);
      } else if (Array.isArray(value)) {
        clauses.push(`${safeKey} = ANY($${paramOffset + clauses.length + 1})`);
      } else {
        clauses.push(`${safeKey} = $${paramOffset + clauses.length + 1}`);
      }
    }

    return clauses.join(' AND ');
  }

  private extractParams(query: ParsedQuery): any[] {
    const params: any[] = [];

    if (query.data) {
      params.push(...Object.values(query.data));
    }

    if (query.conditions) {
      params.push(...Object.values(query.conditions));
    }

    return params;
  }

  /**
   * Cache management
   */
  private buildCacheKey(query: ParsedQuery): string {
    const { orgId, table, operation, conditions, data, joins, orderBy, limit, offset } = query;

    const keyParts = [
      'query',
      orgId,
      table,
      operation,
      JSON.stringify(conditions || {}),
      JSON.stringify(data || {}),
      JSON.stringify(joins || []),
      orderBy || '',
      limit || '',
      offset || ''
    ];

    return keyParts.join(':');
  }

  private async getFromCache(key: string): Promise<QueryResult | null> {
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      this.logger.warn(`Cache read failed:`, error);
      return null;
    }
  }

  private async setCache(key: string, data: QueryResult, ttl: number): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      this.logger.warn(`Cache write failed:`, error);
    }
  }

  private normalizeResult(payload: any): QueryResult {
    if (!payload || typeof payload !== 'object') {
      return { rows: [], count: 0, executionTime: 0 };
    }

    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    const count = typeof payload.count === 'number' ? payload.count : rows.length;
    const executionTime = typeof payload.executionTime === 'number' ? payload.executionTime : 0;

    return { rows, count, executionTime };
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getCacheTtl(table: string): number {
    // Different TTL for different tables
    const ttlMap: Record<string, number> = {
      organizations: 3600,  // 1 hour
      clients: 1800,        // 30 minutes
      payments: 900,        // 15 minutes
      departments: 3600,    // 1 hour
      default: 1800         // 30 minutes
    };

    return ttlMap[table] || ttlMap.default;
  }

  /**
   * Invalidate cache for organization
   */
  async invalidateOrgCache(orgId: string): Promise<void> {
    try {
      const pattern = `query:${orgId}:*`;
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.debug(`Invalidated ${keys.length} cache entries for org ${orgId}`);
      }
    } catch (error) {
      this.logger.warn(`Cache invalidation failed:`, error);
    }
  }

  /**
   * Execute transaction across shards
   */
  async executeTransaction(
    orgId: string,
    operations: Array<{ query: ParsedQuery, dependsOn?: number[] }>
  ): Promise<QueryResult[]> {
    const location = await this.shardManager.getOrganizationLocation(orgId);
    const results: QueryResult[] = [];

    for (const operation of operations) {
      const sql = this.buildSqlQuery(operation.query, location.schema);
      const params = this.extractParams(operation.query);
      const startTime = Date.now();
      const response = await this.shardManager.executeOnShard(orgId, sql, params);
      const executionTime = Date.now() - startTime;

      results.push({
        rows: Array.isArray(response) ? response : (response?.rows || []),
        count: Array.isArray(response) ? response.length : (response?.count || 0),
        executionTime,
      });
    }

    return results;
  }

  /**
   * Health check
   */
  async getMetrics(): Promise<Record<string, any>> {
    const info = await this.redis.info();
    const cacheStats = {
      connected_clients: info.match(/connected_clients:(\d+)/)?.[1],
      used_memory: info.match(/used_memory:(\d+)/)?.[1],
      total_connections_received: info.match(/total_connections_received:(\d+)/)?.[1],
    };

    return {
      cache: cacheStats,
      timestamp: new Date().toISOString()
    };
  }

  private validateIdentifier(identifier: string, label: string): string {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
      throw new Error(`Invalid ${label}: ${identifier}`);
    }
    return identifier;
  }

  private validateTable(table: string): string {
    const safeTable = this.validateIdentifier(table, 'table');
    if (!this.allowedTables.has(safeTable)) {
      throw new Error(`Table is not allowed: ${table}`);
    }
    return safeTable;
  }

  private validateColumnMap(table: string, record: Record<string, any> | undefined, name: string): void {
    if (!record) {
      return;
    }
    const tableColumns = this.allowedColumnsByTable[table];
    if (!tableColumns) {
      throw new Error(`Columns are not configured for table: ${table}`);
    }

    for (const key of Object.keys(record)) {
      const safeKey = this.validateIdentifier(key, 'column');
      if (!tableColumns.has(safeKey)) {
        throw new Error(`Column "${key}" is not allowed in ${name} for table "${table}"`);
      }
    }
  }

  private validateOrderBy(table: string, orderBy: string): string {
    const trimmed = orderBy.trim();
    const match = /^([a-zA-Z_][a-zA-Z0-9_]*)(\s+(ASC|DESC))?$/i.exec(trimmed);
    if (!match) {
      throw new Error(`Invalid orderBy: ${orderBy}`);
    }

    const column = match[1];
    const direction = (match[3] || 'ASC').toUpperCase();
    const tableColumns = this.allowedColumnsByTable[table];
    if (!tableColumns?.has(column)) {
      throw new Error(`Column "${column}" is not allowed for orderBy on "${table}"`);
    }

    return `${column} ${direction}`;
  }

  private validateJoinCondition(baseTable: string, joinTable: string, clause: string): string {
    const trimmed = clause.trim();
    const match = /^([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)$/.exec(trimmed);
    if (!match) {
      throw new Error(`Invalid join condition: ${clause}`);
    }

    const [, leftTable, leftColumn, rightTable, rightColumn] = match;
    const allowedTables = new Set([baseTable, joinTable]);
    if (!allowedTables.has(leftTable) || !allowedTables.has(rightTable)) {
      throw new Error(`Join clause references unknown table: ${clause}`);
    }

    if (!this.allowedColumnsByTable[leftTable]?.has(leftColumn)) {
      throw new Error(`Join column "${leftColumn}" is not allowed for table "${leftTable}"`);
    }
    if (!this.allowedColumnsByTable[rightTable]?.has(rightColumn)) {
      throw new Error(`Join column "${rightColumn}" is not allowed for table "${rightTable}"`);
    }

    return `${leftTable}.${leftColumn} = ${rightTable}.${rightColumn}`;
  }
}