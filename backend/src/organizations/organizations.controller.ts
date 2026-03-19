import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CreateChildOrganizationDto } from './dto/create-child-organization.dto';
import { CreateOrganizationAdminDto } from './dto/create-organization-admin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { OrganizationAccessGuard } from '../auth/organization.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles('super_admin', 'creator')
  create(@Body() createOrganizationDto: CreateOrganizationDto, @Request() req: any) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @Roles('creator')
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @Roles('creator', 'admin', 'accountant', 'manager', 'operator')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.organizationsService.findOneWithAuth(id, req.user);
  }

  @Get(':id/stats')
  @Roles('creator', 'admin', 'accountant', 'manager')
  getStats(@Param('id') id: string, @Request() req: any) {
    return this.organizationsService.getStatsWithAuth(id, req.user);
  }

  // Tashkilot to'lovlarini olish
  @Get(':id/payments')
  @Roles('creator', 'admin', 'accountant')
  getPayments(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.organizationsService.getPaymentsWithAuth(id, req.user);
  }

  // Quyi tashkilotlarni olish
  @Get(':id/children')
  @Roles('creator', 'admin')
  getChildren(@Param('id') id: string, @Request() req: any) {
    return this.organizationsService.getChildrenWithAuth(id, req.user);
  }

  // Yangi quyi tashkilot yaratish
  @Post(':id/children')
  @Roles('creator', 'admin')
  createChild(
    @Param('id') id: string,
    @Body() createChildOrganizationDto: CreateChildOrganizationDto,
    @Request() req: any,
  ) {
    return this.organizationsService.createChildWithAuth(id, createChildOrganizationDto, req.user);
  }

  // Administrator qo'shish
  @Post(':id/admins')
  @Roles('creator', 'admin')
  createAdmin(
    @Param('id') id: string,
    @Body() createOrganizationAdminDto: CreateOrganizationAdminDto,
    @Request() req: any,
  ) {
    return this.organizationsService.createAdminWithAuth(id, createOrganizationAdminDto, req.user);
  }

  // Administratorlarni olish
  @Get(':id/admins')
  @Roles('creator', 'admin')
  getAdmins(@Param('id') id: string, @Request() req: any) {
    return this.organizationsService.getAdminsWithAuth(id, req.user);
  }

  // Administratorni tahrirlash
  @Patch(':id/admins/:adminId')
  @Roles('creator', 'admin')
  updateAdmin(
    @Param('id') id: string,
    @Param('adminId') adminId: string,
    @Body() body: {
      fullName?: string;
      email?: string;
      phone?: string;
      password?: string;
      role?: string;
      status?: string;
    },
    @Request() req: any,
  ) {
    return this.organizationsService.updateAdminWithAuth(id, adminId, body, req.user);
  }

  // Administratorni o'chirish
  @Delete(':id/admins/:adminId')
  @Roles('creator', 'admin')
  deleteAdmin(
    @Param('id') id: string,
    @Param('adminId') adminId: string,
    @Request() req: any,
  ) {
    return this.organizationsService.deleteAdminWithAuth(id, adminId, req.user);
  }

  @Patch(':id')
  @UseGuards(OrganizationAccessGuard)
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @Request() req: any
  ) {
    return this.organizationsService.updateWithAuth(id, updateOrganizationDto, req.user);
  }

  @Post(':id/tabula-rasa')
  @Roles('super_admin', 'creator')
  @UseGuards(OrganizationAccessGuard)
  async tabulaRasa(
    @Param('id') id: string,
    @Body() body: { confirmation: string; reason: string },
    @Request() req: any
  ) {
    // Validate confirmation
    if (body.confirmation !== 'DELETE_ALL_DATA_PERMANENTLY') {
      throw new BadRequestException('Invalid confirmation phrase');
    }

    if (!body.reason || body.reason.trim().length < 10) {
      throw new BadRequestException('Reason must be at least 10 characters');
    }

    // Schedule for delayed execution (24 hours)
    // Note: This should be implemented as a background job
    await this.organizationsService.tabulaRasa(id);

    return {
      message: 'Tabula rasa scheduled for execution in 24 hours',
      executionTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      organizationId: id,
    };
  }

  @Delete(':id')
  @Roles('creator')
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
