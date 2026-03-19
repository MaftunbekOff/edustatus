import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import { CustomDomainsService } from './custom-domains.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCustomDomainDto } from './dto/create-custom-domain.dto';

@Controller('organizations/:organizationId/custom-domains')
@UseGuards(JwtAuthGuard)
export class CustomDomainsController {
  constructor(private readonly customDomainsService: CustomDomainsService) {}

  /**
   * Yangi custom domain qo'shish
   * POST /api/organizations/:organizationId/custom-domains
   */
  @Post()
  create(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateCustomDomainDto,
    @Request() req: any,
  ) {
    // TODO: Check user has access to this organization
    return this.customDomainsService.create(organizationId, dto);
  }

  /**
   * Tashkilotning barcha domainlarini olish
   * GET /api/organizations/:organizationId/custom-domains
   */
  @Get()
  findAll(@Param('organizationId') organizationId: string) {
    return this.customDomainsService.findAll(organizationId);
  }

  /**
   * Bitta domainni olish
   * GET /api/organizations/:organizationId/custom-domains/:id
   */
  @Get(':id')
  findOne(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.customDomainsService.findOne(organizationId, id);
  }

  /**
   * Domain verification ma'lumotlarini olish
   * GET /api/organizations/:organizationId/custom-domains/:id/verification
   */
  @Get(':id/verification')
  getVerificationInfo(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.customDomainsService.getVerificationInfo(organizationId, id);
  }

  /**
   * Domainni tasdiqlash (verify)
   * POST /api/organizations/:organizationId/custom-domains/:id/verify
   */
  @Post(':id/verify')
  verify(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.customDomainsService.verify(organizationId, id);
  }

  /**
   * Primary domainni o'zgartirish
   * PUT /api/organizations/:organizationId/custom-domains/:id/primary
   */
  @Put(':id/primary')
  setPrimary(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.customDomainsService.setPrimary(organizationId, id);
  }

  /**
   * Domainni o'chirish
   * DELETE /api/organizations/:organizationId/custom-domains/:id
   */
  @Delete(':id')
  remove(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.customDomainsService.remove(organizationId, id);
  }
}

/**
 * Super Admin uchun - barcha domainlarni ko'rish
 */
@Controller('admin/custom-domains')
@UseGuards(JwtAuthGuard)
export class AdminCustomDomainsController {
  constructor(private readonly customDomainsService: CustomDomainsService) {}

  @Get()
  findAllActive() {
    return this.customDomainsService.findAllActive();
  }

  /**
   * Domain orqali tashkilotni topish
   * GET /api/admin/custom-domains/resolve?domain=talaba.example.uz
   */
  @Get('resolve')
  async resolveOrganization(@Body('domain') domain: string) {
    const organization = await this.customDomainsService.resolveOrganization(domain);
    return { organization };
  }
}
