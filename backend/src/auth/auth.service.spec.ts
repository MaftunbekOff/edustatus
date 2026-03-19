import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            superAdmin: {
              findUnique: jest.fn(),
            },
            organizationAdmin: {
              findUnique: jest.fn(),
            },
            refreshToken: {
              create: jest.fn(),
            },
            loginHistory: {
              create: jest.fn(),
            },
            userSession: {
              findMany: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'testpassword';
      const hashedPassword = await AuthService.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(password.length);
    });
  });

  describe('validateUser', () => {
    it('should return super admin user', async () => {
      const mockUser = { id: '1', email: 'admin@test.com', fullName: 'Admin' };
      jest.spyOn(prismaService.superAdmin, 'findUnique').mockResolvedValue(mockUser as any);

      const result = await service.validateUser('1');

      expect(result).toEqual({ ...mockUser, role: 'creator' });
    });

    it('should return organization admin user', async () => {
      const mockUser = {
        id: '1',
        email: 'admin@test.com',
        fullName: 'Admin',
        role: 'admin',
        organizationId: 'org1'
      };
      jest.spyOn(prismaService.superAdmin, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.organizationAdmin, 'findUnique').mockResolvedValue(mockUser as any);

      const result = await service.validateUser('1');

      expect(result).toEqual(mockUser);
    });
  });
});