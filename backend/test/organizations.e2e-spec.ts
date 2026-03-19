import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Organizations (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let refreshToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);

    // Enable global prefix
    app.setGlobalPrefix('api');

    await app.init();

    // Login as super admin to get tokens
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'admin@edustatus.uz',
        password: 'admin123',
      });

    const cookies = loginResponse.headers['set-cookie'];
    const cookieArray = Array.isArray(cookies) ? cookies : [cookies];

    // Extract tokens from cookies
    accessToken = cookieArray
      .find((cookie: string) => cookie.includes('accessToken'))
      ?.split('accessToken=')[1]?.split(';')[0] || '';

    refreshToken = cookieArray
      .find((cookie: string) => cookie.includes('refreshToken'))
      ?.split('refreshToken=')[1]?.split(';')[0] || '';
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/organizations (GET)', () => {
    it('should return organizations list', () => {
      return request(app.getHttpServer())
        .get('/api/organizations')
        .set('Cookie', [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('name');
            expect(res.body[0]).toHaveProperty('status');
          }
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/api/organizations')
        .expect(401);
    });
  });

  describe('/api/organizations (POST)', () => {
    it('should create new organization', () => {
      const newOrg = {
        name: 'Test Organization E2E',
        inn: '123456789',
        type: 'education',
        region: 'Toshkent',
        district: 'Yunusobod',
        phone: '+998901234567',
        address: 'Test Address',
        isGovernment: true,
        hasClients: true,
        hasPayments: true,
        clientLimit: 50,
        departmentLimit: 3,
      };

      return request(app.getHttpServer())
        .post('/api/organizations')
        .set('Cookie', [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
        .send(newOrg)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', newOrg.name);
          expect(res.body).toHaveProperty('inn', newOrg.inn);
          expect(res.body).toHaveProperty('status', 'trial');
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/organizations')
        .set('Cookie', [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
        .send({
          name: '', // Invalid: empty name
          inn: '123', // Invalid: too short
        })
        .expect(400);
    });
  });

  describe('/api/organizations/:id (GET)', () => {
    let testOrgId: string;

    beforeEach(async () => {
      // Create a test organization
      const org = await prisma.organization.create({
        data: {
          name: 'Test Org for GET',
          inn: '987654321',
          region: 'Toshkent',
          district: 'Mirzo Ulugbek',
          phone: '+998907654321',
          address: 'Test Address',
        },
      });
      testOrgId = org.id;
    });

    afterEach(async () => {
      // Clean up
      await prisma.organization.delete({ where: { id: testOrgId } }).catch(() => {});
    });

    it('should return organization by id', () => {
      return request(app.getHttpServer())
        .get(`/api/organizations/${testOrgId}`)
        .set('Cookie', [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', testOrgId);
          expect(res.body).toHaveProperty('name', 'Test Org for GET');
          expect(res.body).toHaveProperty('inn', '987654321');
        });
    });

    it('should return 404 for non-existent organization', () => {
      return request(app.getHttpServer())
        .get('/api/organizations/non-existent-id')
        .set('Cookie', [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
        .expect(404);
    });
  });
});