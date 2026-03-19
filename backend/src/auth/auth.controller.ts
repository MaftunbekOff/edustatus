import { Controller, Post, Body, UseGuards, Get, Request, Ip, Headers, Param, Query, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.login(loginDto, {
      ipAddress: ip || 'unknown',
      userAgent: userAgent || 'unknown',
    });

    // Set httpOnly cookies for tokens
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    if (result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    // Return user info (not tokens)
    return res.json({
      user: result.user,
      message: 'Login successful',
    });
  }

  @Post('refresh')
  async refreshToken(
    @Request() req: any,
    @Body('refreshToken') refreshToken: string,
    @Res() res: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const token = refreshToken || req?.cookies?.refreshToken;
    const result = await this.authService.refreshToken(token, ip || 'unknown', userAgent || 'unknown');

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ message: 'Token refreshed' });
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    // Clear httpOnly cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.json({ message: 'Logged out successfully' });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAll(@Request() req: { user: any }) {
    const userType = req.user.role === 'creator' ? 'creator' : 'organization_admin';
    return this.authService.logoutAll(req.user.userId, userType);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: { user: any }) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getSessions(@Request() req: { user: any }) {
    const userType = req.user.role === 'creator' ? 'creator' : 'organization_admin';
    return this.authService.getActiveSessions(req.user.userId, userType);
  }

  @UseGuards(JwtAuthGuard)
  @Get('login-history')
  async getLoginHistory(
    @Request() req: { user: any },
    @Query('limit') limit?: string,
  ) {
    const userType = req.user.role === 'creator' ? 'creator' : 'organization_admin';
    return this.authService.getLoginHistory(
      req.user.userId,
      userType,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
