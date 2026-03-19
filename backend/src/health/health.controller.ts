import { Controller, Get, UseGuards, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { QueryRouter } from '../database/query-router';
import { ShardManager } from '../database/shard-manager';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private metricsService: MetricsService,
    private queryRouter: QueryRouter,
    private shardManager: ShardManager,
  ) {}
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async check() {
    const [queryRouterHealth, shardHealth] = await Promise.all([
      this.queryRouter.getHealth(),
      this.shardManager.getHealth(),
    ]);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      memory: process.memoryUsage(),
      database: {
        queryRouter: queryRouterHealth.queryRouter,
        shardManager: shardHealth.shardManager,
        shardsHealthy: shardHealth.shardsHealthy,
        shardCount: shardHealth.shardCount,
      },
      redis: queryRouterHealth.redis,
    };
  }

  @Get('ready')
  @Get('readiness')
  @ApiOperation({ summary: 'Readiness check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async ready() {
    const [queryRouterHealth, shardHealth] = await Promise.all([
      this.queryRouter.getHealth(),
      this.shardManager.getHealth(),
    ]);

    const ready = queryRouterHealth.queryRouter && queryRouterHealth.redis && shardHealth.shardManager;
    if (!ready) {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        database: {
          queryRouter: queryRouterHealth.queryRouter,
          shardManager: shardHealth.shardManager,
          shardsHealthy: shardHealth.shardsHealthy,
        },
        redis: queryRouterHealth.redis,
      });
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        queryRouter: queryRouterHealth.queryRouter,
        shardManager: shardHealth.shardManager,
        shardsHealthy: shardHealth.shardsHealthy,
      },
      redis: queryRouterHealth.redis,
    };
  }

  @Get('live')
  @Get('liveness')
  @ApiOperation({ summary: 'Liveness check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  live() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator')
  @ApiOperation({ summary: 'Performance metrics endpoint' })
  @ApiResponse({ status: 200, description: 'Performance metrics' })
  metrics() {
    return this.metricsService.getMetrics();
  }
}
