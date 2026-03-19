import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orgId = request.params.id || request.params.organizationId || request.body?.organizationId;

    if (!user) {
      return false;
    }

    // Super admin can access all organizations
    if (user.role === 'super_admin' || user.role === 'creator') {
      return true;
    }

    // Check if user belongs to the organization
    if (orgId) {
      const membership = await this.prisma.organizationAdmin.findFirst({
        where: {
          organizationId: orgId,
          email: user.email,
          status: 'active',
        },
      });

      if (!membership) {
        throw new ForbiddenException(
          'You do not have access to this organization'
        );
      }
    }

    return true;
  }
}

// Specialized guard for organization-specific operations
@Injectable()
export class OrganizationAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const user = request.user;
    const orgId = request.params.id || request.params.organizationId;

    if (!user || !orgId) {
      return false;
    }

    // Super admin bypass
    if (user.role === 'super_admin' || user.role === 'creator') {
      // Super admin can access all organizations
      return true;
    }

    // Check organization membership
    const admin = await this.prisma.organizationAdmin.findFirst({
      where: {
        organizationId: orgId,
        email: user.email,
        status: 'active',
      },
      include: {
        organization: true,
      },
    });

    if (!admin) {
      throw new ForbiddenException(
        `Access denied: You are not a member of this organization`
      );
    }

    // Add organization context to request for later use
    request.organization = admin.organization;
    request.userOrganizationRole = admin.role;

    return true;
  }
}

// Guard for checking if user can perform specific actions on organization
@Injectable()
export class OrganizationActionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orgId = request.params.id || request.params.organizationId;

    if (!user || !orgId) {
      return false;
    }

    // Get user's role in the organization
    const admin = await this.prisma.organizationAdmin.findFirst({
      where: {
        organizationId: orgId,
        email: user.email,
        status: 'active',
      },
    });

    if (!admin) {
      throw new ForbiddenException('Organization access denied');
    }

    const userRole = admin.role;
    const handler = context.getHandler();
    const requiredRoles = this.getRequiredRoles(handler);

    // Check if user's role has sufficient permissions
    return this.checkRolePermissions(userRole, requiredRoles);
  }

  private getRequiredRoles(handler: any): string[] {
    // This would be enhanced with metadata from decorators
    // For now, use handler name to determine requirements
    const handlerName = handler.name;

    const roleRequirements: Record<string, string[]> = {
      'remove': ['admin'],           // Only admins can delete
      'update': ['admin', 'manager'], // Admins and managers can update
      'createAdmin': ['admin'],      // Only admins can create other admins
      'tabulaRasa': ['super_admin'], // Only super admin can destroy data
    };

    return roleRequirements[handlerName] || ['admin', 'manager', 'accountant'];
  }

  private checkRolePermissions(userRole: string, requiredRoles: string[]): boolean {
    const roleHierarchy: Record<string, number> = {
      'super_admin': 100,
      'admin': 80,
      'manager': 60,
      'accountant': 40,
      'operator': 20,
    };

    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = Math.min(...requiredRoles.map(role => roleHierarchy[role] || 0));

    return userLevel >= requiredLevel;
  }
}