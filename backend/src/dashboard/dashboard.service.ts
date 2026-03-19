import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOrganizationStats(organizationId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get all stats in parallel
    const [
      todayPayments,
      todayCount,
      monthlyPayments,
      totalClients,
      activeClients,
      totalDebt,
      recentPayments,
      departmentDebts,
    ] = await Promise.all([
      // Today's payments
      this.prisma.payment.aggregate({
        where: {
          organizationId,
          paymentDate: { gte: today },
          status: 'confirmed',
        },
        _sum: { amount: true },
      }),
      // Today's payment count
      this.prisma.payment.count({
        where: {
          organizationId,
          paymentDate: { gte: today },
          status: 'confirmed',
        },
      }),
      // Monthly payments
      this.prisma.payment.aggregate({
        where: {
          organizationId,
          paymentDate: { gte: monthStart },
          status: 'confirmed',
        },
        _sum: { amount: true },
      }),
      // Total clients
      this.prisma.client.count({
        where: { organizationId },
      }),
      // Active clients
      this.prisma.client.count({
        where: { organizationId, status: 'active' },
      }),
      // Total debt
      this.prisma.client.aggregate({
        where: { organizationId },
        _sum: { debtAmount: true },
      }),
      // Recent payments
      this.prisma.payment.findMany({
        where: { organizationId },
        include: { client: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      // Department debts
      this.prisma.client.groupBy({
        by: ['departmentId'],
        where: { organizationId, debtAmount: { gt: 0 } },
        _sum: { debtAmount: true },
        _count: true,
      }),
    ]);

    // Get department names
    const departmentIds = departmentDebts.filter(d => d.departmentId).map((d) => d.departmentId) as string[];
    const departments = await this.prisma.department.findMany({
      where: { id: { in: departmentIds } },
    });

    const departmentDebtsWithNames = departmentDebts.map((d) => ({
      departmentId: d.departmentId,
      departmentName: departments.find((dep) => dep.id === d.departmentId)?.name || 'Unknown',
      totalDebt: d._sum.debtAmount || 0,
      clientCount: d._count,
    }));

    return {
      todayPayments: todayPayments._sum.amount || 0,
      todayCount,
      monthlyPayments: monthlyPayments._sum.amount || 0,
      monthlyActual: monthlyPayments._sum.amount || 0,
      monthlyPlan: 500000000, // Default monthly plan
      monthlyPercent: Math.round(((monthlyPayments._sum.amount || 0) / 500000000) * 100),
      totalClients,
      activeClients,
      totalDebt: totalDebt._sum.debtAmount || 0,
      recentPayments,
      departmentDebts: departmentDebtsWithNames,
    };
  }

  async getSuperAdminStats() {
    const [totalOrganizations, activeOrganizations, totalClients, totalRevenue] = await Promise.all([
      this.prisma.organization.count(),
      this.prisma.organization.count({ where: { status: 'active' } }),
      this.prisma.client.count(),
      this.prisma.payment.aggregate({
        where: { status: 'confirmed' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalOrganizations,
      activeOrganizations,
      totalClients,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }
}
