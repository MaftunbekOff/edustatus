import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v7 as uuidv7 } from 'uuid';
import * as bcrypt from 'bcrypt';

// Bcrypt rounds - 12 for strong security (consistent with auth.service.ts)
const BCRYPT_ROUNDS = 12;

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if user has access to organization
   * Creator has access to all organizations
   * Organization admin only has access to their own organization
   */
  private async checkOrganizationAccess(organizationId: string, user: any): Promise<void> {
    // Creator has access to all organizations
    if (user.role === 'creator') {
      return;
    }

    // Organization admin only has access to their own organization
    if (user.organizationId !== organizationId) {
      throw new ForbiddenException('You do not have access to this organization');
    }
  }

  async create(data: {
    name: string;
    inn: string;
    type?: string;
    industry?: string;
    isGovernment?: boolean;
    region: string;
    district: string;
    email?: string;
    phone: string;
    address: string;
    subdomain?: string;
    plan?: string;
    parentId?: string; // Quyi tashkilot uchun
  }) {
    return this.prisma.organization.create({
      data: {
        id: uuidv7(), // UUID v7 - time-ordered UUID
        name: data.name,
        inn: data.inn,
        type: data.type || 'other',
        industry: data.industry || 'other',
        isGovernment: data.isGovernment ?? true,
        region: data.region,
        district: data.district,
        parentId: data.parentId || null, // Ota tashkilot
        subdomain: data.subdomain || null,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        plan: data.plan || 'basic',
        status: 'trial',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      },
    });
  }

  async findAll() {
    return this.prisma.organization.findMany({
      where: {
        parentId: null, // Faqat asosiy tashkilotlar
      },
      include: {
        _count: {
          select: { clients: true, departments: true, children: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        departments: true,
        admins: true,
        parent: true, // Ota tashkilot
        children: {   // Quyi tashkilotlar
          include: {
            _count: {
              select: { clients: true, departments: true },
            },
          },
        },
        _count: {
          select: { clients: true, payments: true, children: true },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  // Quyi tashkilotlarni olish
  async getChildren(id: string) {
    return this.prisma.organization.findMany({
      where: { parentId: id },
      include: {
        _count: {
          select: { clients: true, departments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Yangi quyi tashkilot yaratish
  async createChild(parentId: string, data: {
    name: string;
    inn: string;
    type?: string;
    industry?: string;
    isGovernment?: boolean;
    region?: string;
    district?: string;
    email?: string;
    phone: string;
    address: string;
  }) {
    // Ota tashkilotni tekshirish
    const parent = await this.prisma.organization.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException('Parent organization not found');
    }

    return this.prisma.organization.create({
      data: {
        id: uuidv7(),
        name: data.name,
        inn: data.inn,
        type: data.type || parent.type, // Default to parent's type
        industry: data.industry || parent.industry,
        isGovernment: data.isGovernment ?? parent.isGovernment,
        region: data.region || parent.region, // Default to parent's region
        district: data.district || parent.district,
        parentId: parentId,
        phone: data.phone,
        address: data.address,
        email: data.email,
        plan: 'basic', // O'zining mustaqil tarifi
        status: 'trial', // Sinov muddati
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      },
    });
  }

  // Administratorlarni olish
  async getAdmins(organizationId: string) {
    return this.prisma.organizationAdmin.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Yangi administrator yaratish
  async createAdmin(organizationId: string, data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    role?: string;
  }) {
    // Tashkilotni tekshirish
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Email mavjudligini tekshirish
    const existingAdmin = await this.prisma.organizationAdmin.findUnique({
      where: { email: data.email },
    });

    if (existingAdmin) {
      throw new ConflictException('Bu email allaqachon ro\'yxatdan o\'tgan');
    }

    // Parolni hash qilish
    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    return this.prisma.organizationAdmin.create({
      data: {
        id: uuidv7(),
        organizationId: organizationId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
        password: hashedPassword,
        role: data.role || 'admin',
        status: 'active',
      },
    });
  }

  // Administratorni tahrirlash
  async updateAdmin(organizationId: string, adminId: string, data: {
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    role?: string;
    status?: string;
  }) {
    // Verify admin belongs to this organization
    const admin = await this.prisma.organizationAdmin.findFirst({
      where: { id: adminId, organizationId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found in this organization');
    }

    // Agar parol berilgan bo'lsa, hash qilish
    let hashedPassword: string | undefined;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    }

    // Agar email o'zgartirilgan bo'lsa, tekshirish
    if (data.email) {
      const existingAdmin = await this.prisma.organizationAdmin.findFirst({
        where: {
          email: data.email,
          NOT: { id: adminId },
        },
      });

      if (existingAdmin) {
        throw new ConflictException('Bu email allaqachon ro\'yxatdan o\'tgan');
      }
    }

    return this.prisma.organizationAdmin.update({
      where: { id: adminId },
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: data.role,
        status: data.status,
      },
    });
  }

  // Administratorni o'chirish
  async deleteAdmin(organizationId: string, adminId: string) {
    // Verify admin belongs to this organization
    const admin = await this.prisma.organizationAdmin.findFirst({
      where: { id: adminId, organizationId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found in this organization');
    }

    return this.prisma.organizationAdmin.delete({
      where: { id: adminId },
    });
  }

  async update(id: string, data: Partial<{
    name: string;
    inn: string;
    subdomain: string;
    customDomain: string;
    plan: string;
    status: string;
    email: string;
    phone: string;
    address: string;
    hasClients: boolean;
    hasPayments: boolean;
    hasReports: boolean;
    hasBankIntegration: boolean;
    hasTelegramBot: boolean;
    hasSmsNotifications: boolean;
    hasExcelImport: boolean;
    hasPdfReports: boolean;
    allowSubOrganizations: boolean;
    clientLimit: number;
    departmentLimit: number;
  }>) {
    return this.prisma.organization.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.organization.delete({ where: { id } });
  }

  async getStats(id: string) {
    const [clientsCount, paymentsSum, departmentsCount] = await Promise.all([
      this.prisma.client.count({ where: { organizationId: id } }),
      this.prisma.payment.aggregate({
        where: { organizationId: id, status: 'confirmed' },
        _sum: { amount: true },
      }),
      this.prisma.department.count({ where: { organizationId: id } }),
    ]);

    return {
      clientsCount,
      totalRevenue: paymentsSum._sum.amount || 0,
      departmentsCount,
    };
  }

  // Tashkilot to'lovlarini olish
  async getPayments(organizationId: string, user: any) {
    // Admin user ekanligini tekshirish (cabinet dan foydalanayotgan)
    const payments = await this.prisma.payment.findMany({
      where: { organizationId },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            department: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10, // So'nggi 10 ta to'lov
    });

    return payments;
  }

  async tabulaRasa(id: string) {
    // Delete all related data in transaction
    await this.prisma.$transaction(async (tx) => {
      // Delete attendance records
      await tx.attendance.deleteMany({ where: { organizationId: id } });
      
      // Delete reminders
      await tx.reminder.deleteMany({ where: { organizationId: id } });
      
      // Delete contracts
      await tx.contract.deleteMany({ where: { organizationId: id } });
      
      // Delete bank records
      await tx.bankRecord.deleteMany({ where: { organizationId: id } });
      
      // Delete payments
      await tx.payment.deleteMany({ where: { organizationId: id } });
      
      // Delete clients
      await tx.client.deleteMany({ where: { organizationId: id } });
      
      // Delete departments
      await tx.department.deleteMany({ where: { organizationId: id } });
      
      // Delete custom domains
      await tx.customDomain.deleteMany({ where: { organizationId: id } });
      
      // Delete organization admins
      await tx.organizationAdmin.deleteMany({ where: { organizationId: id } });
      
      // Update organization createdAt to now
      await tx.organization.update({
        where: { id },
        data: {
          createdAt: new Date(),
        },
      });
    });

    // Return updated organization
    return this.findOne(id);
  }

  // ==================== AUTHORIZED METHODS ====================
  // These methods include organization access verification

  async findOneWithAuth(id: string, user: any) {
    await this.checkOrganizationAccess(id, user);
    return this.findOne(id);
  }

  async getStatsWithAuth(id: string, user: any) {
    await this.checkOrganizationAccess(id, user);
    return this.getStats(id);
  }

  async getChildrenWithAuth(id: string, user: any) {
    await this.checkOrganizationAccess(id, user);
    return this.getChildren(id);
  }

  async createChildWithAuth(parentId: string, data: {
    name: string;
    inn: string;
    type?: string;
    industry?: string;
    isGovernment?: boolean;
    region?: string;
    district?: string;
    email?: string;
    phone: string;
    address: string;
  }, user: any) {
    await this.checkOrganizationAccess(parentId, user);
    return this.createChild(parentId, data);
  }

  async createAdminWithAuth(organizationId: string, data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    role?: string;
  }, user: any) {
    await this.checkOrganizationAccess(organizationId, user);
    return this.createAdmin(organizationId, data);
  }

  async getAdminsWithAuth(organizationId: string, user: any) {
    await this.checkOrganizationAccess(organizationId, user);
    return this.getAdmins(organizationId);
  }

  async updateAdminWithAuth(organizationId: string, adminId: string, data: {
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    role?: string;
    status?: string;
  }, user: any) {
    await this.checkOrganizationAccess(organizationId, user);
    return this.updateAdmin(organizationId, adminId, data);
  }

  async deleteAdminWithAuth(organizationId: string, adminId: string, user: any) {
    await this.checkOrganizationAccess(organizationId, user);
    return this.deleteAdmin(organizationId, adminId);
  }

  async updateWithAuth(id: string, data: Partial<{
    name: string;
    inn: string;
    subdomain: string;
    customDomain: string;
    plan: string;
    status: string;
    email: string;
    phone: string;
    address: string;
    hasClients: boolean;
    hasPayments: boolean;
    hasReports: boolean;
    hasBankIntegration: boolean;
    hasTelegramBot: boolean;
    hasSmsNotifications: boolean;
    hasExcelImport: boolean;
    hasPdfReports: boolean;
    allowSubOrganizations: boolean;
    clientLimit: number;
    departmentLimit: number;
  }>, user: any) {
    await this.checkOrganizationAccess(id, user);
    return this.update(id, data);
  }

  async getPaymentsWithAuth(organizationId: string, user: any) {
    await this.checkOrganizationAccess(organizationId, user);
    return this.getPayments(organizationId, user);
  }
}
