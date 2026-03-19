import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Get all system users (SuperAdmins)
  async findAll() {
    return this.prisma.superAdmin.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get single user
  async findOne(id: string) {
    const user = await this.prisma.superAdmin.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // Create new system user
  async create(data: {
    email: string;
    password: string;
    fullName: string;
    role?: string;
  }) {
    // Check if email exists
    const existing = await this.prisma.superAdmin.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictException('Bu email allaqachon ro\'yxatdan o\'tgan');
    }

    // Prevent creating more than one Creator
    if (data.role === 'creator') {
      const existingCreator = await this.prisma.superAdmin.findFirst({
        where: { role: 'creator' },
      });
      if (existingCreator) {
        throw new ForbiddenException('Faqat bitta Creator bo\'lishi mumkin');
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.superAdmin.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        role: data.role || 'admin',
      },
    });
  }

  // Update system user
  async update(id: string, data: {
    email?: string;
    password?: string;
    fullName?: string;
    role?: string;
  }) {
    // Check if user exists
    const user = await this.prisma.superAdmin.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent changing Creator's role
    if (user.role === 'creator' && data.role && data.role !== 'creator') {
      throw new ForbiddenException('Creator rolini o\'zgartirish mumkin emas');
    }

    // Prevent creating more than one Creator
    if (data.role === 'creator' && user.role !== 'creator') {
      const existingCreator = await this.prisma.superAdmin.findFirst({
        where: { role: 'creator' },
      });
      if (existingCreator) {
        throw new ForbiddenException('Faqat bitta Creator bo\'lishi mumkin');
      }
    }

    // If email is being changed, check for duplicates
    if (data.email && data.email !== user.email) {
      const existing = await this.prisma.superAdmin.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        throw new ConflictException('Bu email allaqachon ro\'yxatdan o\'tgan');
      }
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.superAdmin.update({
      where: { id },
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        role: data.role,
      },
    });
  }

  // Delete system user
  async remove(id: string) {
    const user = await this.prisma.superAdmin.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deleting Creator
    if (user.role === 'creator') {
      throw new ForbiddenException('Creator foydalanuvchini o\'chirish mumkin emas');
    }

    return this.prisma.superAdmin.delete({
      where: { id },
    });
  }

  // Update user status (for blocking/unblocking)
  async updateStatus(id: string, status: string) {
    const user = await this.prisma.superAdmin.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Note: SuperAdmin model doesn't have status field
    // This is a placeholder for future implementation
    return { message: 'Status updated', id, status };
  }

  // Legacy methods for auth
  async createSuperAdmin(email: string, password: string, fullName: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.superAdmin.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
      },
    });
  }

  async createOrganizationAdmin(data: {
    organizationId: string;
    email: string;
    password: string;
    fullName: string;
    role?: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.organizationAdmin.create({
      data: {
        organizationId: data.organizationId,
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        role: data.role || 'admin',
      },
    });
  }

  async findByEmail(email: string) {
    const superAdmin = await this.prisma.superAdmin.findUnique({
      where: { email },
    });
    if (superAdmin) return { ...superAdmin, type: 'creator' };

    const organizationAdmin = await this.prisma.organizationAdmin.findUnique({
      where: { email },
      include: { organization: true },
    });
    if (organizationAdmin) return { ...organizationAdmin, type: 'organization_admin' };

    return null;
  }
}
