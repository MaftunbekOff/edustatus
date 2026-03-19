import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@Request() req: any) {
    if (req.user.role === 'creator') {
      return this.dashboardService.getSuperAdminStats();
    }
    return this.dashboardService.getOrganizationStats(req.user.organizationId);
  }
}
