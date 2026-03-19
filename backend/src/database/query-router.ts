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
    });
  }

  /**
    * Route and execute query using Go service
    */
  async routeQuery(query: ParsedQuery): Promise<QueryResult> {
    const startTime = Date.now();

    try {
      // Call Go Query Router service
      const response = await firstValueFrom(
        this.httpService.post(`${this.queryRouterUrl}/query`, query)
      );

      const result: QueryResult = response.data;
      result.executionTime = Date.now() - startTime;

      this.logger.debug(`Query executed via Go service:`, {
        operation: query.operation,
        table: query.table,
        executionTime: result.executionTime
      });

      return result;

    } catch (error) {
      this.logger.error(`Query execution failed:`, {
        query,
        error: error.message,
        executionTime: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Execute query on specific shard
   */
  private async executeOnShard(query: ParsedQuery): Promise<QueryResult> {
    const location = this.shardManager.getOrganizationLocation(query.orgId);
    const shardConnection = this.shardManager.getShardConnection(query.orgId);

    // Build SQL query
    const sql = this.buildSqlQuery(query, location.schema);

    this.logger.debug(`Executing query on shard ${shardConnection.shardId}:`, { sql, params: query.data });

    const result = await shardConnection.pool.query(sql, this.extractParams(query));

    return {
      rows: result.rows,
      count: result.rowCount,
      executionTime: 0 // Will be set by caller
    };
  }

  /**
   * Build SQL query from parsed query
   */
  private buildSqlQuery(query: ParsedQuery, schema: string): string {
    const { table, operation, conditions, data, joins, orderBy, limit, offset } = query;

    switch (operation) {
      case 'SELECT':
        return this.buildSelectQuery(schema, table, conditions, joins, orderBy, limit, offset);

      case 'INSERT':
        return this.buildInsertQuery(schema, table, data!);

      case 'UPDATE':
        return this.buildUpdateQuery(schema, table, data!, conditions!);

      case 'DELETE':
        return this.buildDeleteQuery(schema, table, conditions!);

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
    let query = `SELECT * FROM ${schema}.${table}`;

    if (joins && joins.length > 0) {
      for (const join of joins) {
        query += ` JOIN ${schema}.${join.table} ON ${join.on}`;
      }
    }

    if (conditions && Object.keys(conditions).length > 0) {
      const whereClause = this.buildWhereClause(conditions);
      query += ` WHERE ${whereClause}`;
    }

    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
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
    const columns = Object.keys(data);
    const placeholders = columns.map((_, i) => `$${i + 1}`);

    return `INSERT INTO ${schema}.${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
  }

  private buildUpdateQuery(schema: string, table: string, data: Record<string, any>, conditions: Record<string, any>): string {
    const setClause = Object.keys(data).map((col, i) => `${col} = $${i + 1}`).join(', ');
    const whereClause = this.buildWhereClause(conditions, Object.keys(data).length);

    return `UPDATE ${schema}.${table} SET ${setClause} WHERE ${whereClause} RETURNING *`;
  }

  private buildDeleteQuery(schema: string, table: string, conditions: Record<string, any>): string {
    const whereClause = this.buildWhereClause(conditions);
    return `DELETE FROM ${schema}.${table} WHERE ${whereClause} RETURNING *`;
  }

  private buildWhereClause(conditions: Record<string, any>, paramOffset = 0): string {
    const clauses: string[] = [];

    for (const [key, value] of Object.entries(conditions)) {
      if (value === null) {
        clauses.push(`${key} IS NULL`);
      } else if (Array.isArray(value)) {
        clauses.push(`${key} = ANY($${paramOffset + clauses.length + 1})`);
      } else {
        clauses.push(`${key} = $${paramOffset + clauses.length + 1}`);
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
    const connection = this.shardManager.getShardConnection(orgId);
    const location = this.shardManager.getOrganizationLocation(orgId);

    const client = await connection.pool.connect();
    const results: QueryResult[] = [];

    try {
      await client.query('BEGIN');
      await client.query(`SET search_path TO ${location.schema}, global, public`);

      for (const operation of operations) {
        const sql = this.buildSqlQuery(operation.query, location.schema);
        const params = this.extractParams(operation.query);

        const startTime = Date.now();
        const result = await client.query(sql, params);
        const executionTime = Date.now() - startTime;

        results.push({
          rows: result.rows,
          count: result.rowCount,
          executionTime
        });
      }

      await client.query('COMMIT');
      return results;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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
}