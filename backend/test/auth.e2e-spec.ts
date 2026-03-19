import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Response } from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);

    // Enable CORS and validation pipes
    app.setGlobalPrefix('api');

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/auth/login (POST)', () => {
    it('should login super admin successfully', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'admin@edustatus.uz',
          password: 'admin123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('email', 'admin@edustatus.uz');
          expect(res.body.user).toHaveProperty('role', 'creator');
          expect(res.body).toHaveProperty('message', 'Login successful');
        });
    });

    it('should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'invalid@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should set httpOnly cookies on successful login', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'admin@edustatus.uz',
          password: 'admin123',
        })
        .expect(200)
        .expect((res: Response) => {
          const cookies = res.headers['set-cookie'];
          expect(cookies).toBeDefined();
          const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
          expect(cookieArray.some((cookie: string) => cookie.includes('accessToken'))).toBe(true);
          expect(cookieArray.some((cookie: string) => cookie.includes('refreshToken'))).toBe(true);
        });
    });
  });

  describe('/api/auth/me (GET)', () => {
    it('should return current user when authenticated', async () => {
      // First login to get cookies
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'admin@edustatus.uz',
          password: 'admin123',
        });

      const cookies = loginResponse.headers['set-cookie'];

      // Then make authenticated request
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', cookies)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', 'admin@edustatus.uz');
          expect(res.body).toHaveProperty('role', 'creator');
        });
    });

    it('should return 401 when not authenticated', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });
  });

  describe('/api/auth/logout (POST)', () => {
    it('should clear cookies on logout', async () => {
      // First login to get cookies
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'admin@edustatus.uz',
          password: 'admin123',
        });

      const cookies = loginResponse.headers['set-cookie'];

      // Then logout
      return request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Cookie', cookies)
        .expect(200)
        .expect((res: Response) => {
          const logoutCookies = res.headers['set-cookie'];
          expect(logoutCookies).toBeDefined();
          const cookieArray = Array.isArray(logoutCookies) ? logoutCookies : [logoutCookies];
          // Check that cookies are cleared (should have expired dates)
          expect(cookieArray.some((cookie: string) =>
            cookie.includes('accessToken') && cookie.includes('Thu, 01 Jan 1970')
          )).toBe(true);
        });
    });
  });
});