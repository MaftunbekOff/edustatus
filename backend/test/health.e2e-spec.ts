import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Enable global prefix
    app.setGlobalPrefix('api');

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
          expect(res.body).toHaveProperty('memory');
          expect(res.body).toHaveProperty('database');
        });
    });
  });

  describe('/api/health/metrics (GET)', () => {
    it('should return performance metrics', () => {
      return request(app.getHttpServer())
        .get('/api/health/metrics')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('performance');
          expect(res.body).toHaveProperty('system');
          expect(res.body).toHaveProperty('memory');

          // Check performance metrics structure
          const performance = res.body.performance;
          expect(performance).toHaveProperty('totalRequests');
          expect(performance).toHaveProperty('slowRequests');
          expect(performance).toHaveProperty('verySlowRequests');
          expect(performance).toHaveProperty('slowRequestPercentage');
          expect(performance).toHaveProperty('verySlowRequestPercentage');
          expect(performance).toHaveProperty('averageResponseTime');
          expect(performance).toHaveProperty('thresholds');
          expect(performance).toHaveProperty('timestamp');

          // Check thresholds
          expect(performance.thresholds).toHaveProperty('slow', 1000);
          expect(performance.thresholds).toHaveProperty('verySlow', 5000);
        });
    });
  });

  describe('/api/health/liveness (GET)', () => {
    it('should return liveness status', () => {
      return request(app.getHttpServer())
        .get('/api/health/liveness')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
        });
    });
  });

  describe('/api/health/readiness (GET)', () => {
    it('should return readiness status', () => {
      return request(app.getHttpServer())
        .get('/api/health/readiness')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('database');
          expect(res.body).toHaveProperty('redis');
        });
    });
  });
});