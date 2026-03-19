import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';

export interface ShardConnection {
  pool: Pool;
  prisma: PrismaClient;
  region: string;
  shardId: string;
}

export interface OrganizationLocation {
  region: string;
  shard: string;
  schema: string;
}

@Injectable()
export class ShardManager implements OnModuleInit, OnModuleDestroy {
  private shards: Map<string, ShardConnection> = new Map();
  private readonly TOTAL_SHARDS = 50;
  private readonly SHARDS_PER_REGION = 10;
  private readonly REGIONS = [
    'us-east', 'us-west', 'eu-west', 'eu-central',
    'ap-south', 'ap-southeast', 'ap-northeast',
    'me-south', 'af-south', 'sa-east'
  ];

  async onModuleInit() {
    await this.initializeShards();
    console.log(`🗄️ Initialized ${this.shards.size} database shards`);
  }

  async onModuleDestroy() {
    for (const [shardId, connection] of this.shards) {
      await connection.pool.end();
      await connection.prisma.$disconnect();
    }
    console.log('🗄️ Closed all database connections');
  }

  private async initializeShards() {
    for (let regionIndex = 0; regionIndex < this.REGIONS.length; regionIndex++) {
      const region = this.REGIONS[regionIndex];

      for (let shardIndex = 0; shardIndex < this.SHARDS_PER_REGION; shardIndex++) {
        const globalShardId = regionIndex * this.SHARDS_PER_REGION + shardIndex;
        const shardId = `${regionIndex.toString().padStart(2, '0')}-${shardIndex.toString().padStart(4, '0')}`;

        const pool = new Pool({
          host: process.env[`DB_HOST_${shardId}`] || `db-${region}-${shardIndex}.cluster.local`,
          port: parseInt(process.env[`DB_PORT_${shardId}`] || '5432'),
          database: `shard_${shardId}`,
          user: process.env.DB_USER || 'orgstatus',
          password: process.env.DB_PASSWORD,
          max: parseInt(process.env.DB_MAX_CONNECTIONS || '50'),
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        });

        const prisma = new PrismaClient({
          datasourceUrl: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${pool.options.host}:${pool.options.port}/${pool.options.database}`
        });

        this.shards.set(shardId, {
          pool,
          prisma,
          region,
          shardId
        });
      }
    }
  }

  /**
   * Get shard connection for organization
   */
  getShardConnection(orgId: string): ShardConnection {
    const location = this.parseOrgId(orgId);
    const shardId = `${location.region}-${location.shard}`;

    const connection = this.shards.get(shardId);
    if (!connection) {
      throw new Error(`Shard ${shardId} not found for organization ${orgId}`);
    }

    return connection;
  }

  /**
   * Get organization location info
   */
  getOrganizationLocation(orgId: string): OrganizationLocation {
    const parsed = this.parseOrgId(orgId);
    return {
      region: this.REGIONS[parseInt(parsed.region)],
      shard: parsed.shard,
      schema: `org_${orgId.replace(/-/g, '')}`
    };
  }

  /**
   * Parse organization ID to extract region and shard
   * Format: RR-SSSS-OOOOOO
   * RR: Region (00-49)
   * SSSS: Shard within region (0000-9999)
   * OOOOOO: Sequential within shard (000000-999999)
   */
  private parseOrgId(orgId: string): { region: string, shard: string, sequence: string } {
    const parts = orgId.split('-');
    if (parts.length !== 3) {
      throw new Error(`Invalid organization ID format: ${orgId}`);
    }

    return {
      region: parts[0],
      shard: parts[1],
      sequence: parts[2]
    };
  }

  /**
   * Generate new organization ID for region/shard
   */
  async generateOrgId(region: string, shard: string): Promise<string> {
    const regionIndex = this.REGIONS.indexOf(region);
    if (regionIndex === -1) {
      throw new Error(`Invalid region: ${region}`);
    }

    const shardConnection = this.getShardConnection(`${regionIndex.toString().padStart(2, '0')}-${shard}-000000`);
    const result = await shardConnection.pool.query(`
      SELECT nextval('organization_id_seq') as next_id
    `);

    const sequence = result.rows[0].next_id.toString().padStart(6, '0');
    return `${regionIndex.toString().padStart(2, '0')}-${shard}-${sequence}`;
  }

  /**
   * Get all shard connections for cross-shard operations
   */
  getAllShards(): ShardConnection[] {
    return Array.from(this.shards.values());
  }

  /**
   * Health check for all shards
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [shardId, connection] of this.shards) {
      try {
        await connection.pool.query('SELECT 1');
        results[shardId] = true;
      } catch (error) {
        console.error(`Shard ${shardId} health check failed:`, error);
        results[shardId] = false;
      }
    }

    return results;
  }

  /**
   * Execute query on specific shard
   */
  async executeOnShard(orgId: string, query: string, params: any[] = []): Promise<any> {
    const connection = this.getShardConnection(orgId);
    const location = this.getOrganizationLocation(orgId);

    try {
      // Set search path to organization schema
      await connection.pool.query(`SET search_path TO ${location.schema}, global, public`);

      const result = await connection.pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error(`Query failed on shard ${connection.shardId}:`, error);
      throw error;
    }
  }

  /**
   * Execute transaction across multiple shards
   */
  async executeDistributedTransaction(
    operations: Array<{ orgId: string, query: string, params?: any[] }>
  ): Promise<any[]> {
    const results: any[] = [];

    // Group operations by shard
    const operationsByShard = new Map<string, typeof operations>();

    for (const op of operations) {
      const location = this.getOrganizationLocation(op.orgId);
      const shardKey = `${location.region}-${location.shard}`;

      if (!operationsByShard.has(shardKey)) {
        operationsByShard.set(shardKey, []);
      }
      operationsByShard.get(shardKey)!.push(op);
    }

    // Execute on each shard
    for (const [shardKey, shardOps] of operationsByShard) {
      const connection = Array.from(this.shards.values())
        .find(conn => `${conn.region}-${conn.shardId.split('-')[1]}` === shardKey);

      if (!connection) continue;

      const client = await connection.pool.connect();

      try {
        await client.query('BEGIN');

        for (const op of shardOps) {
          const location = this.getOrganizationLocation(op.orgId);
          await client.query(`SET search_path TO ${location.schema}, global, public`);
          const result = await client.query(op.query, op.params || []);
          results.push(result.rows);
        }

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }

    return results;
  }
}