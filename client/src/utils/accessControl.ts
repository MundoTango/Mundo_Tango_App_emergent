/**
 * ESA Framework - Unified Access Control System
 * Centralized Super Admin detection to prevent inconsistencies
 * Used by: ESAMindMap, MrBlueFloatingButton, Admin routes
 */

interface User {
  id?: number;
  username?: string;
  email?: string;
  role?: 'user' | 'admin' | 'super_admin'; // Oct 23, 2025: Database role field
  profile?: {
    role?: string;
    primary_role?: string;
  };
  isSuperAdmin?: boolean;
}

/**
 * Check if user has Super Admin access
 * Supports multiple detection patterns for compatibility
 */
export function isSuperAdmin(user: User | null | undefined): boolean {
  if (!user) return false;

  // Pattern 1: Database role field (PRIMARY - Oct 23, 2025)
  if (user.role === 'super_admin') return true;

  // Pattern 2: Explicit super admin flag
  if (user.isSuperAdmin === true) return true;

  // Pattern 3: Username-based (legacy)
  if (user.username === 'admin') return true;

  // Pattern 4: Email-based
  if (user.email === 'admin@mundotango.life') return true;
  if (user.email?.includes('admin@')) return true;

  // Pattern 5: Profile role-based
  if (user.profile?.role === 'super_admin') return true;
  if (user.profile?.primary_role === 'super_admin') return true;

  // MB.MD Oct 21, 2025: Dev mode override DISABLED to enable proper access control testing
  // Pattern 5: Development mode override (DISABLED - was breaking access control)
  // if (import.meta.env.DEV) {
  //   if (typeof window !== 'undefined' && localStorage.getItem('dev_super_admin_mode') === 'true') {
  //     console.log('🔓 [Access Control] Dev mode Super Admin enabled via localStorage');
  //     return true;
  //   }
  //   if ((window as any).__DEV_SUPER_ADMIN__ === true) {
  //     return true;
  //   }
  //   if (import.meta.env.VITE_ENABLE_SUPER_ADMIN === 'true') {
  //     return true;
  //   }
  // }

  return false;
}

/**
 * Check if ESA MindMap should be shown
 * For Super Admins on ALL pages
 */
export function shouldShowESAMindMap(user: User | null | undefined): boolean {
  // Feature flag check
  const isFeatureEnabled = import.meta.env.VITE_ESA_MIND_ENABLED !== 'false';
  
  const isAdmin = isSuperAdmin(user);
  
  // Debug logging
  if (import.meta.env.DEV) {
    console.log('🗺️ [ESA MindMap] Access check:', {
      user: user?.email || user?.username,
      isAdmin,
      isFeatureEnabled,
      shouldShow: isAdmin || isFeatureEnabled
    });
  }
  
  // Show if super admin (regardless of feature flag)
  if (isAdmin) return true;
  
  // Show if feature enabled
  return isFeatureEnabled;
}
