import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface ShardConnection {
  region: string;
  shardId: string;
  pool?: any; // Optional runtime field for legacy migration flows
}

export interface OrganizationLocation {
  region: string;
  shard: string;
  schema: string;
}

@Injectable()
export class ShardManager {
  private readonly logger = new Logger(ShardManager.name);
  private shardManagerUrl: string;
  private readonly timeoutMs = parseInt(process.env.SHARD_MANAGER_TIMEOUT_MS || '5000', 10);

  constructor(private httpService: HttpService) {
    this.shardManagerUrl = process.env.SHARD_MANAGER_URL || 'http://shard-manager:8081';
  }

  /**
   * Get shard connection for organization
   */
  async getShardConnection(orgId: string): Promise<ShardConnection> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.shardManagerUrl}/shard/${orgId}`, { timeout: this.timeoutMs })
    );

    const payload = response.data;
    if (!payload || typeof payload.region !== 'string' || typeof payload.shard_id !== 'string') {
      this.logger.error(`Invalid shard connection payload for org ${orgId}`);
      throw new Error('Invalid shard connection response from shard-manager');
    }

    return {
      region: payload.region,
      shardId: payload.shard_id,
    };
  }

  /**
   * Get organization location info
   */
  async getOrganizationLocation(orgId: string): Promise<OrganizationLocation> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.shardManagerUrl}/location/${orgId}`, { timeout: this.timeoutMs })
    );

    const payload = response.data;
    if (!payload || typeof payload.region !== 'string' || typeof payload.shard !== 'string' || typeof payload.schema !== 'string') {
      this.logger.error(`Invalid organization location payload for org ${orgId}`);
      throw new Error('Invalid location response from shard-manager');
    }

    return payload;
  }

  /**
   * Health check for all shards
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.shardManagerUrl}/health`, { timeout: this.timeoutMs })
    );

    const payload = response.data;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new Error('Invalid health response from shard-manager');
    }

    return payload;
  }

  /**
   * Execute query on specific shard
   */
  async executeOnShard(orgId: string, query: string, params: any[] = []): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(`${this.shardManagerUrl}/execute`, {
        org_id: orgId,
        query,
        params,
      }, { timeout: Math.max(this.timeoutMs, 10000) })
    );

    const payload = response.data;
    if (!Array.isArray(payload)) {
      this.logger.error(`Invalid execute response for org ${orgId}`);
      throw new Error('Invalid execute response from shard-manager');
    }

    return payload;
  }

  async getHealth(): Promise<{ shardManager: boolean; shardsHealthy: boolean; shardCount: number; details?: Record<string, any> }> {
    try {
      const health = await this.healthCheck();
      const values = Object.values(health);
      const shardCount = values.length;
      const shardsHealthy = shardCount > 0 ? values.every(Boolean) : true;

      return {
        shardManager: true,
        shardsHealthy,
        shardCount,
      };
    } catch (error: any) {
      this.logger.warn(`Shard manager health check failed`, {
        error: error?.message || 'unknown error',
      });

      return {
        shardManager: false,
        shardsHealthy: false,
        shardCount: 0,
        details: {
          error: error?.message || 'shard-manager is unavailable',
        },
      };
    }
  }

  // Keep other methods as stubs or implement if needed
  async generateOrgId(region: string, shard: string): Promise<string> {
    // Placeholder - implement if needed
    throw new Error('Not implemented');
  }

  getAllShards(): ShardConnection[] {
    // Placeholder - implement if needed
    return [];
  }

  async executeDistributedTransaction(
    operations: Array<{ orgId: string, query: string, params?: any[] }>
  ): Promise<any[]> {
    // Placeholder - implement if needed
    throw new Error('Not implemented');
  }

}