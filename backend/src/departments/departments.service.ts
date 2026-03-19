import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, data: {
    name: string;
    code?: string;
    description?: string;
    managerName?: string;
    specialty?: string;
    course?: number;
    year?: number;
  }) {
    return this.prisma.department.create({
      data: {
        organizationId,
        ...data,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.department.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { clients: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, organizationId },
      include: {
        clients: true,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(organizationId: string, id: string, data: Partial<{
    name: string;
    code: string;
    description: string;
    managerName: string;
    specialty: string;
    course: number;
    year: number;
  }>) {
    // Verify department belongs to organization
    await this.findOne(organizationId, id);

    return this.prisma.department.update({
      where: { id },
      data,
    });
  }

  async remove(organizationId: string, id: string) {
    // Verify department belongs to organization
    await this.findOne(organizationId, id);

    return this.prisma.department.delete({ where: { id } });
  }
}
