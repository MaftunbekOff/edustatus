import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

// Bcrypt rounds - 12 for strong security
const BCRYPT_ROUNDS = 12;

// Token expiry times
const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days
const MAX_SESSIONS_PER_USER = 3;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto, requestInfo: { ipAddress: string; userAgent: string }) {
    const { username, password } = loginDto;
    const { ipAddress, userAgent } = requestInfo;

    // Try to find in SuperAdmin
    const superAdmin = await this.prisma.superAdmin.findUnique({
      where: { email: username },
    });

    if (superAdmin) {
      const isPasswordValid = await bcrypt.compare(password, superAdmin.password);
      
      // Log login attempt
      await this.logLoginAttempt({
        userId: superAdmin.id,
        userType: 'creator',
        email: username,
        success: isPasswordValid,
        failureReason: isPasswordValid ? null : 'invalid_password',
        ipAddress,
        userAgent,
      });

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check and limit sessions
      await this.limitSessions(superAdmin.id, 'creator');

      // Generate tokens
      const tokens = await this.generateTokens(
        superAdmin.id,
        superAdmin.email,
        'creator',
        null,
        ipAddress,
        userAgent,
      );

      // Create session
      await this.createSession(superAdmin.id, 'creator', tokens.refreshToken, ipAddress, userAgent);

      return {
        ...tokens,
        user: {
          id: superAdmin.id,
          email: superAdmin.email,
          fullName: superAdmin.fullName,
          role: 'creator',
        },
      };
    }

    // Try to find in OrganizationAdmin
    const organizationAdmin = await this.prisma.organizationAdmin.findUnique({
      where: { email: username },
      include: { organization: true },
    });

    if (organizationAdmin) {
      // Check if account is blocked
      if (organizationAdmin.status === 'blocked') {
        await this.logLoginAttempt({
          userId: organizationAdmin.id,
          userType: 'organization_admin',
          email: username,
          success: false,
          failureReason: 'account_blocked',
          ipAddress,
          userAgent,
        });
        throw new UnauthorizedException('Account is blocked');
      }

      const isPasswordValid = await bcrypt.compare(password, organizationAdmin.password);
      
      // Log login attempt
      await this.logLoginAttempt({
        userId: organizationAdmin.id,
        userType: 'organization_admin',
        email: username,
        success: isPasswordValid,
        failureReason: isPasswordValid ? null : 'invalid_password',
        ipAddress,
        userAgent,
      });

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Update last login
      await this.prisma.organizationAdmin.update({
        where: { id: organizationAdmin.id },
        data: { lastLogin: new Date() },
      });

      // Check and limit sessions
      await this.limitSessions(organizationAdmin.id, 'organization_admin');

      // Generate tokens
      const tokens = await this.generateTokens(
        organizationAdmin.id,
        organizationAdmin.email,
        organizationAdmin.role,
        organizationAdmin.organizationId,
        ipAddress,
        userAgent,
      );

      // Create session
      await this.createSession(
        organizationAdmin.id,
        'organization_admin',
        tokens.refreshToken,
        ipAddress,
        userAgent,
      );

      return {
        ...tokens,
        user: {
          id: organizationAdmin.id,
          email: organizationAdmin.email,
          fullName: organizationAdmin.fullName,
          role: organizationAdmin.role,
          organizationId: organizationAdmin.organizationId,
          organization: organizationAdmin.organization,
        },
      };
    }

    // User not found - log attempt
    await this.logLoginAttempt({
      userId: null,
      userType: 'unknown',
      email: username,
      success: false,
      failureReason: 'user_not_found',
      ipAddress,
      userAgent,
    });

    throw new UnauthorizedException('Invalid credentials');
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    organizationId: string | null,
    ipAddress: string,
    userAgent: string,
  ) {
    // Minimal payload for access token
    const payload = { sub: userId, role, organizationId };
    
    // Generate access token (15 minutes)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    // Generate refresh token (7 days)
    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { expiresIn: REFRESH_TOKEN_EXPIRY },
    );

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        userType: role === 'creator' ? 'creator' : 'organization_admin',
        expiresAt,
        deviceInfo: userAgent,
        ipAddress,
      },
    });

    return { accessToken, refreshToken };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string, ipAddress: string, userAgent: string) {
    // Verify refresh token
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is of type refresh
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Check if token exists in database and not revoked
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.revoked) {
      throw new UnauthorizedException('Refresh token revoked or not found');
    }

    // Check if token expired
    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Get user
    const userId = payload.sub;
    let user: any;
    let role: string;
    let organizationId: string | null = null;

    if (storedToken.userType === 'creator') {
      user = await this.prisma.superAdmin.findUnique({ where: { id: userId } });
      role = 'creator';
    } else {
      user = await this.prisma.organizationAdmin.findUnique({ where: { id: userId } });
      role = user?.role || 'admin';
      organizationId = user?.organizationId;
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Mark old refresh token as replaced
    const newTokens = await this.generateTokens(
      userId,
      user.email,
      role,
      organizationId,
      ipAddress,
      userAgent,
    );

    await this.prisma.refreshToken.update({
      where: { token: refreshToken },
      data: {
        revoked: true,
        revokedAt: new Date(),
        replacedBy: newTokens.refreshToken,
      },
    });

    // Update session
    await this.prisma.userSession.updateMany({
      where: { userId, userType: storedToken.userType },
      data: { sessionToken: newTokens.refreshToken, lastActivity: new Date() },
    });

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  }

  /**
   * Logout - revoke refresh token and session
   */
  async logout(refreshToken: string) {
    if (!refreshToken) {
      return { success: true };
    }

    // Mark refresh token as revoked
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });

    // Delete session
    await this.prisma.userSession.deleteMany({
      where: { sessionToken: refreshToken },
    });

    return { success: true };
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId: string, userType: string) {
    // Revoke all refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId, userType, revoked: false },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });

    // Delete all sessions
    await this.prisma.userSession.deleteMany({
      where: { userId, userType },
    });

    return { success: true };
  }

  /**
   * Get active sessions
   */
  async getActiveSessions(userId: string, userType: string) {
    return this.prisma.userSession.findMany({
      where: { userId, userType, expiresAt: { gt: new Date() } },
      orderBy: { lastActivity: 'desc' },
    });
  }

  /**
   * Get login history
   */
  async getLoginHistory(userId: string, userType: string, limit: number = 20) {
    return this.prisma.loginHistory.findMany({
      where: { userId, userType },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Log login attempt
   */
  private async logLoginAttempt(data: {
    userId: string | null;
    userType: string;
    email: string;
    success: boolean;
    failureReason: string | null;
    ipAddress: string;
    userAgent: string;
  }) {
    try {
      await this.prisma.loginHistory.create({
        data: {
          // Use empty string for unknown users instead of 'unknown' string
          // This prevents confusion when querying by userId
          userId: data.userId || '',
          userType: data.userType,
          email: data.email,
          success: data.success,
          failureReason: data.failureReason,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          deviceType: this.parseDeviceType(data.userAgent),
          browser: this.parseBrowser(data.userAgent),
          os: this.parseOS(data.userAgent),
        },
      });
    } catch (error) {
      this.logger.error('Failed to log login attempt', error);
    }
  }

  /**
   * Create session
   */
  private async createSession(
    userId: string,
    userType: string,
    sessionToken: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.userSession.create({
      data: {
        userId,
        userType,
        sessionToken,
        deviceInfo: userAgent,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });
  }

  /**
   * Limit sessions to MAX_SESSIONS_PER_USER
   */
  private async limitSessions(userId: string, userType: string) {
    const sessions = await this.prisma.userSession.findMany({
      where: { userId, userType, expiresAt: { gt: new Date() } },
      orderBy: { lastActivity: 'asc' },
    });

    if (sessions.length >= MAX_SESSIONS_PER_USER) {
      // Delete oldest sessions
      const toDelete = sessions.length - MAX_SESSIONS_PER_USER + 1;
      const sessionsToDelete = sessions.slice(0, toDelete);

      for (const session of sessionsToDelete) {
        await this.prisma.userSession.delete({ where: { id: session.id } });
        await this.prisma.refreshToken.updateMany({
          where: { token: session.sessionToken },
          data: { revoked: true, revokedAt: new Date() },
        });
      }

      this.logger.log(`Deleted ${toDelete} old sessions for user ${userId}`);
    }
  }

  /**
   * Validate user by ID
   */
  async validateUser(userId: string) {
    // Try SuperAdmin first
    const superAdmin = await this.prisma.superAdmin.findUnique({
      where: { id: userId },
    });

    if (superAdmin) {
      return { ...superAdmin, role: 'creator' };
    }

    // Try OrganizationAdmin
    const organizationAdmin = await this.prisma.organizationAdmin.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    return organizationAdmin;
  }

  /**
   * Hash password with bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  /**
   * Parse device type from user agent
   */
  private parseDeviceType(userAgent: string): string {
    if (/mobile/i.test(userAgent)) return 'mobile';
    if (/tablet/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  /**
   * Parse browser from user agent
   */
  private parseBrowser(userAgent: string): string {
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent)) return 'Safari';
    if (/edge/i.test(userAgent)) return 'Edge';
    return 'Unknown';
  }

  /**
   * Parse OS from user agent
   */
  private parseOS(userAgent: string): string {
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/mac/i.test(userAgent)) return 'MacOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    if (/android/i.test(userAgent)) return 'Android';
    if (/ios/i.test(userAgent)) return 'iOS';
    return 'Unknown';
  }
}
