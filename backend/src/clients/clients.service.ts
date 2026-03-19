import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createClientDto: CreateClientDto) {
    // Check for duplicate PINFL if provided
    if (createClientDto.pinfl) {
      const existingClient = await this.prisma.client.findFirst({
        where: {
          organizationId,
          pinfl: createClientDto.pinfl,
        },
      });

      if (existingClient) {
        throw new ConflictException('Client with this PINFL already exists');
      }
    }

    const client = await this.prisma.client.create({
      data: {
        organizationId,
        ...createClientDto,
        debtAmount: (createClientDto.totalAmount || 0) - (createClientDto.paidAmount || 0),
      },
      include: { department: true },
    });

    return client;
  }

  async findAll(organizationId: string, filters?: {
    search?: string;
    departmentId?: string;
    status?: string;
  }) {
    const where: any = { organizationId };

    if (filters?.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { pinfl: { contains: filters.search } },
        { contractNumber: { contains: filters.search } },
        { phone: { contains: filters.search } },
      ];
    }

    if (filters?.departmentId) {
      where.departmentId = filters.departmentId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.client.findMany({
      where,
      include: { department: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, organizationId },
      include: {
        department: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async update(organizationId: string, id: string, updateClientDto: UpdateClientDto) {
    const client = await this.findOne(organizationId, id);

    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
      include: { department: true },
    });
  }

  async remove(organizationId: string, id: string) {
    await this.findOne(organizationId, id);
    return this.prisma.client.delete({ where: { id } });
  }

  /**
   * Find duplicate clients by PINFL within the same organization only
   * This prevents cross-organization data exposure (privacy concern)
   */
  async findDuplicates(organizationId: string) {
    // Find clients with same PINFL within the same organization
    const clients = await this.prisma.client.findMany({
      where: { organizationId },
      select: { pinfl: true },
    });

    const pinfls = clients.filter(c => c.pinfl).map(c => c.pinfl);
    
    if (pinfls.length === 0) {
      return [];
    }

    // Find duplicates within the same organization only
    // Group by PINFL and return only those with count > 1
    const duplicates = await this.prisma.client.findMany({
      where: {
        organizationId,
        pinfl: { in: pinfls as string[] },
      },
      include: { department: true },
    });

    // Group by PINFL to identify actual duplicates
    const pinflCounts = new Map<string, number>();
    duplicates.forEach(c => {
      if (c.pinfl) {
        pinflCounts.set(c.pinfl, (pinflCounts.get(c.pinfl) || 0) + 1);
      }
    });

    // Return only clients that have duplicate PINFLs
    const duplicatePinfls = Array.from(pinflCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([pinfl]) => pinfl);

    return duplicates.filter(c => c.pinfl && duplicatePinfls.includes(c.pinfl));
  }

  async getDebtors(organizationId: string) {
    return this.prisma.client.findMany({
      where: {
        organizationId,
        debtAmount: { gt: 0 },
      },
      include: { department: true },
      orderBy: { debtAmount: 'desc' },
    });
  }
}
