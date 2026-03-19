import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get all system users (SuperAdmins)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Get single user
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // Create new system user
  @Post()
  create(
    @Body() body: {
      email: string;
      password: string;
      fullName: string;
      role?: string;
    },
  ) {
    return this.usersService.create(body);
  }

  // Update system user
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: {
      email?: string;
      password?: string;
      fullName?: string;
      role?: string;
    },
  ) {
    return this.usersService.update(id, body);
  }

  // Delete system user
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // Block/Unblock user
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.usersService.updateStatus(id, body.status);
  }
}
