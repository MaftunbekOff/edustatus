import { SetMetadata } from '@nestjs/common';

/**
 * Roles Decorator
 * 
 * Use this decorator to specify required roles for an endpoint.
 * Must be used together with RolesGuard.
 * 
 * Example:
 * @Roles('super_admin')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Get('admin-only')
 * adminOnly() { ... }
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
