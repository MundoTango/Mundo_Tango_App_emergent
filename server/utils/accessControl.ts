/**
 * Access Control Utilities
 * MB.MD Option A - Recursive Testing System
 */

import { AuthenticatedUser } from '../middleware/auth';

/**
 * Check if user is a super admin
 */
export function isSuperAdmin(user: AuthenticatedUser): boolean {
  return user.isSuperAdmin === true || user.role === 'superadmin' || user.role === 'admin';
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: AuthenticatedUser, role: string): boolean {
  return user.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: AuthenticatedUser, roles: string[]): boolean {
  return user.role ? roles.includes(user.role) : false;
}
