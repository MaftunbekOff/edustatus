import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Audit Interceptor
 * 
 * Barcha API so'rovlarini avtomatik log qilish uchun interceptor.
 * ISO 27001 talablariga muvofiq audit trail yaratish.
 * 
 * @example
 * // Controller da ishlatish
 * @UseInterceptors(AuditInterceptor)
 * @Controller('students')
 * export class StudentsController {}
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  // E'tiborsiz qoldiriladigan endpointlar
  private readonly ignoredPaths = [
    '/api/auth/login',
    '/api/auth/me',
    '/api/dashboard/stats',
    '/api/health',
  ];

  // Faqat o'qish uchun bo'lgan methodlar (log qilinmaydi)
  private readonly readMethods = ['GET', 'HEAD', 'OPTIONS'];

  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const { method, url, ip, headers, body, query, params } = request;
    const user = request.user;

    // E'tiborsiz qoldirish
    if (this.shouldIgnore(method, url)) {
      return next.handle();
    }

    const startTime = Date.now();

    // Request ma'lumotlari
    const auditData = {
      organizationId: user?.organizationId || null,
      userId: user?.userId || null,
      action: this.getAction(method),
      entity: this.getEntity(url),
      entityId: params?.id || body?.id || null,
      ipAddress: ip || headers['x-forwarded-for'] || null,
      userAgent: headers['user-agent'] || null,
      requestMethod: method,
      requestUrl: url,
      requestBody: this.sanitizeBody(body),
      requestQuery: JSON.stringify(query),
    };

    return next.handle().pipe(
      tap({
        next: (data) => {
          // Muvaffaqiyatli so'rov
          this.logAudit({
            ...auditData,
            statusCode: response.statusCode,
            responseTime: Date.now() - startTime,
            newValue: this.sanitizeResponse(data),
          });
        },
        error: (error) => {
          // Xatolik
          this.logAudit({
            ...auditData,
            statusCode: error.status || 500,
            responseTime: Date.now() - startTime,
            errorMessage: error.message,
          });
        },
      }),
    );
  }

  /**
   * Audit log ni database ga yozish
   */
  private async logAudit(data: any): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          organizationId: data.organizationId,
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          oldValue: null, // Update da old value ni olish uchun qo'shimcha logic kerak
          newValue: data.newValue ? JSON.stringify(data.newValue) : null,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });

      this.logger.debug(
        `Audit: ${data.action} ${data.entity} by ${data.userId} (${data.responseTime}ms)`,
      );
    } catch (error) {
      this.logger.error('Failed to write audit log', error);
    }
  }

  /**
   * HTTP method ga qarab action aniqlash
   */
  private getAction(method: string): string {
    const actions: Record<string, string> = {
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
    };
    return actions[method] || method.toLowerCase();
  }

  /**
   * URL dan entity nomi aniqlash
   */
  private getEntity(url: string): string {
    const match = url.match(/\/api\/([a-zA-Z]+)/);
    return match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : 'Unknown';
  }

  /**
   * E'tiborsiz qoldirish kerakmi?
   */
  private shouldIgnore(method: string, url: string): boolean {
    // READ methodlarni log qilmaslik
    if (this.readMethods.includes(method)) {
      return true;
    }

    // Ignored pathlarni tekshirish
    return this.ignoredPaths.some((path) => url.startsWith(path));
  }

  /**
   * Body dan maxfiy ma'lumotlarni olib tashlash
   */
  private sanitizeBody(body: any): string | null {
    if (!body) return null;

    const sanitized = { ...body };

    // Maxfiy maydonlarni yashirish
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return JSON.stringify(sanitized);
  }

  /**
   * Response dan ma'lumotlarni tozalash
   */
  private sanitizeResponse(data: any): any {
    if (!data) return null;

    // Agar array bo'lsa, faqat birinchi 3 ta elementni olish
    if (Array.isArray(data)) {
      return {
        count: data.length,
        sample: data.slice(0, 3),
      };
    }

    // Agar object bo'lsa, faqat muhim maydonlarni olish
    if (typeof data === 'object') {
      const { id, _count, ...rest } = data;
      return { id, _count };
    }

    return null;
  }
}
