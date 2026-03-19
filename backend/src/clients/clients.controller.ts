import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles('admin', 'accountant', 'manager')
  create(@Request() req: any, @Body() createClientDto: CreateClientDto) {
    if (!req.user.organizationId) {
      throw new ForbiddenException('Creator cannot create clients directly');
    }
    return this.clientsService.create(req.user.organizationId, createClientDto);
  }

  @Get()
  @Roles('admin', 'accountant', 'manager', 'operator')
  findAll(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
  ) {
    if (!req.user.organizationId) {
      throw new ForbiddenException('Creator cannot access clients directly');
    }
    return this.clientsService.findAll(req.user.organizationId, { search, departmentId, status });
  }

  @Get('duplicates')
  @Roles('admin', 'accountant', 'manager')
  findDuplicates(@Request() req: any) {
    if (!req.user.organizationId) {
      throw new ForbiddenException('Creator cannot access clients directly');
    }
    return this.clientsService.findDuplicates(req.user.organizationId);
  }

  @Get('debtors')
  @Roles('admin', 'accountant', 'manager')
  findDebtors(@Request() req: any) {
    if (!req.user.organizationId) {
      throw new ForbiddenException('Creator cannot access clients directly');
    }
    return this.clientsService.getDebtors(req.user.organizationId);
  }

  @Get(':id')
  @Roles('admin', 'accountant', 'manager', 'operator')
  findOne(@Request() req: any, @Param('id') id: string) {
    if (!req.user.organizationId) {
      throw new ForbiddenException('Creator cannot access clients directly');
    }
    return this.clientsService.findOne(req.user.organizationId, id);
  }

  @Patch(':id')
  @Roles('admin', 'accountant', 'manager')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    if (!req.user.organizationId) {
      throw new ForbiddenException('Creator cannot update clients directly');
    }
    return this.clientsService.update(req.user.organizationId, id, updateClientDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Request() req: any, @Param('id') id: string) {
    if (!req.user.organizationId) {
      throw new ForbiddenException('Creator cannot delete clients directly');
    }
    return this.clientsService.remove(req.user.organizationId, id);
  }
}
