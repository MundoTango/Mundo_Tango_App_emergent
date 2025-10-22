/**
 * AUTH UTILITIES
 * Standardized authentication and authorization helpers
 */

export interface User {
  id: number;
  email: string | null;
  tangoRoles?: string[] | null;
  role?: string;
  username?: string;
}

/**
 * Check if user is super admin
 * 
 * Standardized logic used across all endpoints:
 * - Email is 'admin@mundotango.life' (production super admin)
 * - User ID is 1 (development super admin - elena_tango)
 * - tangoRoles includes 'super_admin'
 * - context.user.role is 'super_admin'
 */
export function isSuperAdmin(user: User | null | undefined, context?: any): boolean {
  if (!user) return false;
  
  // Check email (production)
  if (user.email === 'admin@mundotango.life') return true;
  
  // Check user ID (development - elena_tango is user #1)
  if (user.id === 1) return true;
  
  // Check tangoRoles array
  if (user.tangoRoles?.includes('super_admin')) return true;
  
  // Check context role (if provided)
  if (context?.user?.role === 'super_admin') return true;
  
  return false;
}

/**
 * Check if environment is development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}
