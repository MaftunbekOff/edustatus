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
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles('admin', 'accountant', 'manager')
  create(
    @Request() req: any,
    @Body() body: {
      name: string;
      code?: string;
      description?: string;
      managerName?: string;
      specialty?: string;
      course?: number;
      year?: number;
    },
  ) {
    return this.departmentsService.create(req.user.organizationId, body);
  }

  @Get()
  @Roles('admin', 'accountant', 'manager', 'operator')
  findAll(@Request() req: any) {
    return this.departmentsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  @Roles('admin', 'accountant', 'manager', 'operator')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.departmentsService.findOne(req.user.organizationId, id);
  }

  @Patch(':id')
  @Roles('admin', 'accountant', 'manager')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: Partial<{
      name: string;
      code: string;
      description: string;
      managerName: string;
      specialty: string;
      course: number;
      year: number;
    }>,
  ) {
    return this.departmentsService.update(req.user.organizationId, id, body);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.departmentsService.remove(req.user.organizationId, id);
  }
}
