// ESA LIFE CEO 61x21 - Phase 19: Admin Authentication Middleware
import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users, userRoles, roles } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { logAuditEvent, AuditEventType, AuditLevel } from '../security/audit-logger';

// Extend Express Request type to include adminAction
declare global {
  namespace Express {
    interface Request {
      adminAction?: string;
    }
  }
}

// Check if user has admin role
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has admin or super_admin role
    // Using role field from the standard auth middleware user type
    const userRole = (req.user as any).role || 'user';
    const hasAdminRole = userRole === 'admin' || userRole === 'super_admin' || userRole === 'platform_admin';

    if (!hasAdminRole) {
      // Log unauthorized access attempt
      await logAuditEvent({
        userId: req.user.id,
        eventType: AuditEventType.UNAUTHORIZED_ACCESS,
        level: AuditLevel.WARNING,
        message: `Unauthorized admin access attempt to ${req.path}`,
        metadata: { resource: req.path, requiredRole: 'admin' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Check if user has moderator role (less restrictive than admin)
export const requireModerator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has moderator, admin, or super_admin role
    const userRole = (req.user as any).role || 'user';
    const hasModeratorRole = userRole === 'moderator' || userRole === 'admin' || userRole === 'super_admin' || userRole === 'platform_admin';

    if (!hasModeratorRole) {
      // Log unauthorized access attempt
      await logAuditEvent({
        userId: req.user.id,
        eventType: AuditEventType.UNAUTHORIZED_ACCESS,
        level: AuditLevel.WARNING,
        message: `Unauthorized moderator access attempt to ${req.path}`,
        metadata: { resource: req.path, requiredRole: 'moderator' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return res.status(403).json({ error: 'Moderator access required' });
    }

    next();
  } catch (error) {
    console.error('Moderator auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Check for super admin role
export const requireSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has super_admin role
    const userRole = (req.user as any).role || 'user';
    const hasSuperAdminRole = userRole === 'super_admin' || userRole === 'platform_admin';

    if (!hasSuperAdminRole) {
      // Log unauthorized access attempt
      await logAuditEvent({
        userId: req.user.id,
        eventType: AuditEventType.UNAUTHORIZED_ACCESS,
        level: AuditLevel.WARNING,
        message: `Unauthorized super admin access attempt to ${req.path}`,
        metadata: { resource: req.path, requiredRole: 'super_admin' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return res.status(403).json({ error: 'Super admin access required' });
    }

    next();
  } catch (error) {
    console.error('Super admin auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Audit logging middleware
export const auditLog = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store the action for later use
    req.adminAction = action;
    
    // Log the action after the request completes
    res.on('finish', async () => {
      if (req.user) {
        await logAuditEvent({
          userId: req.user.id,
          eventType: AuditEventType.ADMIN_ACTION,
          level: res.statusCode < 400 ? AuditLevel.INFO : AuditLevel.ERROR,
          message: `Admin action: ${action} on ${req.path}`,
          metadata: {
            action: action,
            resource: req.path,
            method: req.method,
            requestBody: req.body,
            responseStatus: res.statusCode
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        });
      }
    });
    
    next();
  };
};

// Helper function removed - using the correct one from audit-logger.ts

// IP restriction middleware
export const restrictIP = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.socket.remoteAddress || '';
    
    // Allow localhost in development
    if (process.env.NODE_ENV === 'development' && 
        (clientIP === '::1' || clientIP === '127.0.0.1' || clientIP.includes('localhost'))) {
      return next();
    }
    
    // Check if IP is in allowed list
    if (!allowedIPs.includes(clientIP)) {
      console.warn(`Blocked admin access attempt from IP: ${clientIP}`);
      return res.status(403).json({ error: 'Access denied from this IP address' });
    }
    
    next();
  };
};

// Rate limiting for admin endpoints
const adminRateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const adminRateLimit = (maxRequests: number = 100, windowMs: number = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.user?.id || req.ip}`;
    const now = Date.now();
    
    const limit = adminRateLimitMap.get(key);
    
    if (!limit || limit.resetTime < now) {
      // Create new limit window
      adminRateLimitMap.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (limit.count >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests', 
        retryAfter: Math.ceil((limit.resetTime - now) / 1000) 
      });
    }
    
    // Increment count
    limit.count++;
    adminRateLimitMap.set(key, limit);
    next();
  };
};

// Permission check for specific actions
export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Super admins have all permissions
    const userRole = (req.user as any).role || 'user';
    if (userRole === 'super_admin' || userRole === 'platform_admin') {
      return next();
    }
    
    // Check specific permission in user's roles
    // This would be more complex in production with a proper permission system
    const hasPermission = await checkUserPermission(req.user.id, permission);
    
    if (!hasPermission) {
      await logAuditEvent({
        userId: req.user.id,
        eventType: AuditEventType.UNAUTHORIZED_ACCESS,
        level: AuditLevel.WARNING,
        message: `Unauthorized permission access: ${permission} on ${req.path}`,
        metadata: { permission: permission, resource: req.path },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      return res.status(403).json({ error: `Permission required: ${permission}` });
    }
    
    next();
  };
};

// Helper function to check user permissions
async function checkUserPermission(userId: number, permission: string): Promise<boolean> {
  try {
    // Get user's roles
    const userRoleRecords = await db
      .select()
      .from(userRoles)
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));
    
    // Check if any role has the required permission
    for (const record of userRoleRecords) {
      if (record.roles?.permissions) {
        const permissions = record.roles.permissions as any;
        if (permissions[permission] === true) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

// Clean up old audit logs periodically
setInterval(() => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  // Clean up old rate limit entries
  const now = Date.now();
  for (const [key, limit] of adminRateLimitMap.entries()) {
    if (limit.resetTime < now) {
      adminRateLimitMap.delete(key);
    }
  }
}, 3600000); // Run every hour

export default {
  requireAdmin,
  requireModerator,
  requireSuperAdmin,
  auditLog,
  restrictIP,
  adminRateLimit,
  requirePermission
};