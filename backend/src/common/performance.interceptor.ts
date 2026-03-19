import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Performance Monitoring Interceptor
 *
 * API response times va performance metrics larini monitoring qilish uchun interceptor.
 * Slow queries va performance issues larini aniqlash uchun.
 *
 * @example
 * // Global qo'shish
 * app.useGlobalInterceptors(new PerformanceInterceptor());
 */

// Singleton metrics instance
let metricsInstance: PerformanceMetrics | null = null;

export class PerformanceMetrics {
  totalRequests = 0;
  slowRequests = 0;
  verySlowRequests = 0;
  averageResponseTime = 0;
  responseTimes: number[] = [];

  // Performance thresholds (ms)
  private readonly SLOW_REQUEST_THRESHOLD = 1000; // 1 second
  private readonly VERY_SLOW_REQUEST_THRESHOLD = 5000; // 5 seconds

  recordMetrics(responseTime: number): void {
    this.totalRequests++;
    this.responseTimes.push(responseTime);

    if (responseTime > this.VERY_SLOW_REQUEST_THRESHOLD) {
      this.verySlowRequests++;
    } else if (responseTime > this.SLOW_REQUEST_THRESHOLD) {
      this.slowRequests++;
    }

    // Keep only last 1000 response times for average calculation
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }

    // Calculate rolling average
    this.averageResponseTime =
      this.responseTimes.reduce((a, b) => a + b, 0) /
      this.responseTimes.length;
  }

  getMetrics() {
    const slowRequestPercentage = (this.slowRequests / this.totalRequests) * 100;
    const verySlowRequestPercentage = (this.verySlowRequests / this.totalRequests) * 100;

    return {
      totalRequests: this.totalRequests,
      slowRequests: this.slowRequests,
      verySlowRequests: this.verySlowRequests,
      slowRequestPercentage: Math.round(slowRequestPercentage * 100) / 100,
      verySlowRequestPercentage: Math.round(verySlowRequestPercentage * 100) / 100,
      averageResponseTime: Math.round(this.averageResponseTime),
      thresholds: {
        slow: this.SLOW_REQUEST_THRESHOLD,
        verySlow: this.VERY_SLOW_REQUEST_THRESHOLD,
      },
      timestamp: new Date().toISOString(),
    };
  }

  resetMetrics(): void {
    this.totalRequests = 0;
    this.slowRequests = 0;
    this.verySlowRequests = 0;
    this.averageResponseTime = 0;
    this.responseTimes = [];
  }
}

// Get singleton metrics instance
export function getMetricsInstance(): PerformanceMetrics {
  if (!metricsInstance) {
    metricsInstance = new PerformanceMetrics();
  }
  return metricsInstance;
}

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  private metrics = getMetricsInstance();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    const { method, url, ip } = request;
    const userAgent = request.headers['user-agent'] || 'unknown';

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          this.metrics.recordMetrics(responseTime);

          // Log slow requests
          if (responseTime > 5000) {
            this.logger.warn(
              `VERY SLOW REQUEST: ${method} ${url} - ${responseTime}ms`,
              {
                method,
                url,
                responseTime,
                statusCode: response.statusCode,
                ip,
                userAgent: userAgent.substring(0, 100),
              },
            );
          } else if (responseTime > 1000) {
            this.logger.warn(
              `SLOW REQUEST: ${method} ${url} - ${responseTime}ms`,
              {
                method,
                url,
                responseTime,
                statusCode: response.statusCode,
              },
            );
          }

          // Add response time header for client-side monitoring
          response.setHeader('X-Response-Time', `${responseTime}ms`);
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.metrics.recordMetrics(responseTime);

          this.logger.error(
            `REQUEST ERROR: ${method} ${url} - ${responseTime}ms`,
            {
              method,
              url,
              responseTime,
              statusCode: error.status || 500,
              error: error.message,
              ip,
            },
          );
        },
      }),
    );
  }

}