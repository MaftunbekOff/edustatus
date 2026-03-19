import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createPaymentDto: CreatePaymentDto, userId: string) {
    const { clientId, amount, paymentMethod, paymentDate, description } = createPaymentDto;

    // Get client
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, organizationId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Create payment and update client debt
    const payment = await this.prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          organizationId,
          clientId,
          amount,
          paymentMethod,
          paymentDate: new Date(paymentDate),
          description,
          status: 'pending',
        },
      });

      // Update client paid amount and debt
      await tx.client.update({
        where: { id: clientId },
        data: {
          paidAmount: { increment: amount },
          debtAmount: { decrement: amount },
        },
      });

      return newPayment;
    });

    return payment;
  }

  async findAll(organizationId: string, filters?: {
    clientId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const where: any = { organizationId };

    if (filters?.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.paymentDate = {};
      if (filters.dateFrom) {
        where.paymentDate.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.paymentDate.lte = new Date(filters.dateTo);
      }
    }

    return this.prisma.payment.findMany({
      where,
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, organizationId },
      include: { client: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async confirm(organizationId: string, id: string, userId: string) {
    const payment = await this.findOne(organizationId, id);

    return this.prisma.payment.update({
      where: { id },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
        confirmedBy: userId,
      },
    });
  }

  async reject(organizationId: string, id: string) {
    const payment = await this.findOne(organizationId, id);

    // Revert client paid amount
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id },
        data: { status: 'rejected' },
      });

      await tx.client.update({
        where: { id: payment.clientId },
        data: {
          paidAmount: { decrement: payment.amount },
          debtAmount: { increment: payment.amount },
        },
      });
    });

    return { message: 'Payment rejected and reverted' };
  }

  async getStats(organizationId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayPayments = await this.prisma.payment.aggregate({
      where: {
        organizationId,
        paymentDate: { gte: today },
        status: 'confirmed',
      },
      _sum: { amount: true },
      _count: true,
    });

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyPayments = await this.prisma.payment.aggregate({
      where: {
        organizationId,
        paymentDate: { gte: monthStart },
        status: 'confirmed',
      },
      _sum: { amount: true },
    });

    return {
      todayAmount: todayPayments._sum.amount || 0,
      todayCount: todayPayments._count,
      monthlyAmount: monthlyPayments._sum.amount || 0,
    };
  }
}
