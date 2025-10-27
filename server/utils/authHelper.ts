import { db } from '../db';
import { users, userRoles } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Unified authentication helper to handle multiple auth patterns
 * ✅ FIX (Oct 27): Returns database primary key ID, not Replit ID
 */
export const getUserId = async (req: any): Promise<number | null> => {
  // ESA Framework Layer 13: Systematic authentication with retro fixes
  
  // Primary authentication patterns
  if (req.user?.id) {
    console.log('🔐 ESA Auth: Found req.user.id:', req.user.id);
    return typeof req.user.id === 'string' ? parseInt(req.user.id) : req.user.id;
  }
  
  // ✅ FIX: Look up database user from Replit ID
  if (req.user?.claims?.sub) {
    console.log('🔐 ESA Auth: Found req.user.claims.sub (Replit ID):', req.user.claims.sub);
    try {
      const user = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.replitId, req.user.claims.sub))
        .limit(1);
      
      if (user.length > 0) {
        console.log('🔐 ESA Auth: Mapped Replit ID to database user ID:', user[0].id);
        return user[0].id;
      }
      console.error('❌ ESA Auth: No user found for Replit ID:', req.user.claims.sub);
      return null;
    } catch (error) {
      console.error('❌ ESA Auth: Error looking up user:', error);
      return null;
    }
  }
  
  // Session-based authentication  
  if (req.session?.passport?.user?.id) {
    console.log('🔐 ESA Auth: Found session user id:', req.session.passport.user.id);
    return typeof req.session.passport.user.id === 'string' ? parseInt(req.session.passport.user.id) : req.session.passport.user.id;
  }
  
  if (req.session?.passport?.user?.claims?.sub) {
    console.log('🔐 ESA Auth: Found session claims sub (Replit ID):', req.session.passport.user.claims.sub);
    try {
      const user = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.replitId, req.session.passport.user.claims.sub))
        .limit(1);
      
      if (user.length > 0) {
        console.log('🔐 ESA Auth: Mapped session Replit ID to database user ID:', user[0].id);
        return user[0].id;
      }
      console.error('❌ ESA Auth: No user found for session Replit ID:', req.session.passport.user.claims.sub);
      return null;
    } catch (error) {
      console.error('❌ ESA Auth: Error looking up session user:', error);
      return null;
    }
  }
  
  // Development fallback with enhanced logging
  // ⚠️ SECURITY: This bypass MUST NEVER run in production
  // It is gated by NODE_ENV and AUTH_BYPASS env vars
  if (process.env.NODE_ENV === 'development' || process.env.AUTH_BYPASS === 'true') {
    // Triple-check we're not in production
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 CRITICAL: Auth bypass attempted in production - BLOCKED');
      return null;
    }
    console.warn('⚠️  Development Mode: Auth bypass active - using default admin user');
    console.warn('⚠️  This MUST be disabled in production (set NODE_ENV=production)');
    return 7; // Scott Boddye's admin user ID (dev/test only)
  }
  
  console.log('❌ ESA Layer 13: No valid authentication found');
  return null;
};

/**
 * Check if user has super admin role - ESA Layer 13 Enhanced
 */
export const checkSuperAdminRole = async (userId: number | string): Promise<boolean> => {
  try {
    // Convert string userId to number if needed
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    if (isNaN(numericUserId)) {
      console.error('❌ ESA Layer 13: Invalid userId for super admin check:', userId);
      return false;
    }

    const userRoleData = await db
      .select({
        roleName: userRoles.roleName
      })
      .from(userRoles)
      .where(and(
        eq(userRoles.userId, numericUserId),
        eq(userRoles.roleName, 'super_admin')
      ))
      .limit(1);
    
    return userRoleData.length > 0;
  } catch (error) {
    console.error('❌ ESA Layer 13: Error checking super admin role:', error);
    return false;
  }
};

/**
 * Super admin middleware
 */
export const requireSuperAdmin = async (req: any, res: any, next: any) => {
  const userId = await getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const isSuperAdmin = await checkSuperAdminRole(userId);
  if (!isSuperAdmin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  
  // Add user info to request for downstream use
  req.userId = userId;
  req.isSuperAdmin = true;
  
  next();
};

/**
 * Flexible authentication middleware - ESA Layer 13 Enhanced
 */
export const flexibleAuth = async (req: any, res: any, next: any) => {
  const userId = await getUserId(req);
  if (userId) {
    req.userId = userId;
    
    // Check if super admin
    req.isSuperAdmin = await checkSuperAdminRole(userId);
  }
  next();
};