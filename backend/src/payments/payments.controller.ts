import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Request() req: any, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(
      req.user.organizationId,
      createPaymentDto,
      req.user.id,
    );
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.paymentsService.findAll(req.user.organizationId, {
      clientId,
      status,
      dateFrom,
      dateTo,
    });
  }

  @Get('stats')
  getStats(@Request() req: any) {
    return this.paymentsService.getStats(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.paymentsService.findOne(req.user.organizationId, id);
  }

  @Post(':id/confirm')
  confirm(@Request() req: any, @Param('id') id: string) {
    return this.paymentsService.confirm(req.user.organizationId, id, req.user.id);
  }

  @Post(':id/reject')
  reject(@Request() req: any, @Param('id') id: string) {
    return this.paymentsService.reject(req.user.organizationId, id);
  }
}
