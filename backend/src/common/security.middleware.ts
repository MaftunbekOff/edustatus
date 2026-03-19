import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Rate Limiting Middleware
 * 
 * DDoS himoyasi uchun rate limiting.
 * Har bir IP manzildan kelgan so'rovlar sonini cheklaydi.
 * 
 * ISO 27001 A.13 - Aloqa xavfsizligi
 * PCI DSS Req 1 - Tarmoq xavfsizligi
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimitMiddleware.name);

  // IP manzillar bo'yicha so'rovlar soni
  private readonly requests = new Map<string, { count: number; resetTime: number }>();

  // Cheklovlar
  private readonly limits = {
    // Umumiy API so'rovlar
    default: { max: 100, window: 60000 }, // 100 so'rov / daqiqa

    // Login endpoint (ko'proq cheklov)
    login: { max: 5, window: 300000 }, // 5 urinish / 5 daqiqa

    // Parol tiklash
    passwordReset: { max: 3, window: 3600000 }, // 3 urinish / soat
  };

  use(req: Request, res: Response, next: NextFunction) {
    const ip = this.getClientIp(req);
    const path = req.path;

    // Limitni aniqlash
    const limit = this.getLimit(path);

    // Joriy holatni olish
    const now = Date.now();
    const record = this.requests.get(ip);

    if (!record || now > record.resetTime) {
      // Yangi oyna boshlanishi
      this.requests.set(ip, {
        count: 1,
        resetTime: now + limit.window,
      });
      next();
      return;
    }

    if (record.count >= limit.max) {
      // Limit oshib ketdi
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);

      this.logger.warn(`Rate limit exceeded for IP: ${ip} on ${path}`);

      res.setHeader('Retry-After', retryAfter);
      res.setHeader('X-RateLimit-Limit', limit.max);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', record.resetTime);

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Juda ko\'p so\'rov. Keyinroq urinib ko\'ring.',
          error: 'Too Many Requests',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Hisobni yangilash
    record.count++;
    this.requests.set(ip, record);

    // Header qo'shish
    res.setHeader('X-RateLimit-Limit', limit.max);
    res.setHeader('X-RateLimit-Remaining', limit.max - record.count);
    res.setHeader('X-RateLimit-Reset', record.resetTime);

    next();
  }

  /**
   * Client IP manzilini olish
   */
  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Path ga qarab limit aniqlash
   */
  private getLimit(path: string): { max: number; window: number } {
    if (path.includes('/auth/login')) {
      return this.limits.login;
    }
    if (path.includes('/auth/password-reset')) {
      return this.limits.passwordReset;
    }
    return this.limits.default;
  }

  /**
   * Eski yozuvlarni tozalash (har soatda)
   */
  cleanup() {
    const now = Date.now();
    for (const [ip, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(ip);
      }
    }
  }
}

/**
 * Security Headers Middleware
 * 
 * HTTP header xavfsizligi.
 * OWASP tavsiyalari asosida.
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // X-Content-Type-Options
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // X-Frame-Options
    res.setHeader('X-Frame-Options', 'DENY');

    // X-XSS-Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Strict-Transport-Security (HTTPS)
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );

    // Content-Security-Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self'; " +
        "connect-src 'self'; " +
        "frame-ancestors 'none';",
    );

    // Referrer-Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions-Policy
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=()',
    );

    // Cache-Control (maxfiy ma'lumotlar uchun)
    if (req.path.includes('/api/')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    // X-Request-ID (tracing uchun)
    const requestId = this.generateRequestId();
    res.setHeader('X-Request-ID', requestId);
    req.headers['x-request-id'] = requestId;

    next();
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * CORS Middleware
 * 
 * Cross-Origin Resource Sharing sozlamalari.
 */
@Injectable()
export class CorsMiddleware implements NestMiddleware {
  private readonly allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    // Production domenlari qo'shiladi
  ];

  use(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin;

    if (origin && this.allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, X-Request-ID',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }

    next();
  }
}

/**
 * Request Validation Middleware
 * 
 * So'rov validatsiyasi va sanitizatsiyasi.
 */
@Injectable()
export class RequestValidationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestValidationMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Content-Type tekshirish
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      const contentType = req.headers['content-type'];
      if (!contentType?.includes('application/json')) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
            message: 'Content-Type application/json bo\'lishi kerak',
          },
          HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        );
      }
    }

    // Body o'lchamini tekshirish (1MB)
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > 1024 * 1024) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
          message: 'So\'rov hajmi 1MB dan oshmasligi kerak',
        },
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }

    // SQL Injection belgilarini tekshirish
    if (req.body) {
      const bodyStr = JSON.stringify(req.body);
      if (this.hasSqlInjection(bodyStr)) {
        this.logger.warn(`Potential SQL injection detected from IP: ${req.ip}`);
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Noto\'g\'ri ma\'lumot',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // XSS belgilarini tekshirish
    if (req.body) {
      this.sanitizeBody(req.body);
    }

    next();
  }

  /**
   * SQL Injection belgilarini tekshirish
   */
  private hasSqlInjection(str: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
      /(--)|(\/\*)|(\*\/)/,
      /(\bOR\b|\bAND\b)\s*['"]?\d+['"]?\s*=\s*['"]?\d+/i,
      /['"];\s*(SELECT|INSERT|UPDATE|DELETE|DROP)/i,
    ];

    return sqlPatterns.some((pattern) => pattern.test(str));
  }

  /**
   * Body ni sanitizatsiya qilish
   */
  private sanitizeBody(obj: any): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // XSS belgilarini olib tashlash
        obj[key] = obj[key]
          .replace(/</g, '<')
          .replace(/>/g, '>')
          .replace(/"/g, '"')
          .replace(/'/g, '&#x27;');
      } else if (typeof obj[key] === 'object') {
        this.sanitizeBody(obj[key]);
      }
    }
  }
}
