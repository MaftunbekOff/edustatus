import { Injectable } from '@nestjs/common';
import { getMetricsInstance } from '../common/performance.interceptor';

/**
 * Metrics Service
 *
 * Performance metrics va monitoring ma'lumotlarini taqdim etish uchun service.
 */
@Injectable()
export class MetricsService {
  /**
   * Get current performance metrics
   */
  getMetrics() {
    return {
      performance: getMetricsInstance().getMetrics(),
      system: this.getSystemMetrics(),
      memory: this.getMemoryMetrics(),
    };
  }

  /**
   * Get system health metrics
   */
  private getSystemMetrics() {
    return {
      uptime: process.uptime(),
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
      cpuUsage: process.cpuUsage(),
    };
  }

  /**
   * Get memory usage metrics
   */
  private getMemoryMetrics() {
    const memUsage = process.memoryUsage();
    return {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round((memUsage as any).arrayBuffers / 1024 / 1024) || 0, // MB
    };
  }
}