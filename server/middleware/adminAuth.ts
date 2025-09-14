// ESA LIFE CEO 61x21 - Phase 19: Admin Authentication Middleware
import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users, userRoles, roles, auditLogs } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
        roles: string[];
      };
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
    const hasAdminRole = req.user.roles?.some(role => 
      role === 'admin' || role === 'super_admin' || role === 'platform_admin'
    );

    if (!hasAdminRole) {
      // Log unauthorized access attempt
      await logAuditEvent({
        userId: req.user.id,
        action: 'unauthorized_admin_access',
        resource: req.path,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: 'failed'
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
    const hasModeratorRole = req.user.roles?.some(role => 
      role === 'moderator' || role === 'admin' || role === 'super_admin' || role === 'platform_admin'
    );

    if (!hasModeratorRole) {
      // Log unauthorized access attempt
      await logAuditEvent({
        userId: req.user.id,
        action: 'unauthorized_moderator_access',
        resource: req.path,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: 'failed'
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
    const hasSuperAdminRole = req.user.roles?.some(role => 
      role === 'super_admin' || role === 'platform_admin'
    );

    if (!hasSuperAdminRole) {
      // Log unauthorized access attempt
      await logAuditEvent({
        userId: req.user.id,
        action: 'unauthorized_super_admin_access',
        resource: req.path,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: 'failed'
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
          action: action,
          resource: req.path,
          method: req.method,
          requestBody: JSON.stringify(req.body),
          responseStatus: res.statusCode,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          status: res.statusCode < 400 ? 'success' : 'failed'
        });
      }
    });
    
    next();
  };
};

// Helper function to log audit events
async function logAuditEvent(event: {
  userId: number;
  action: string;
  resource?: string;
  method?: string;
  requestBody?: string;
  responseStatus?: number;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failed';
}) {
  try {
    await db.insert(auditLogs).values({
      userId: event.userId,
      action: event.action,
      resource: event.resource || '',
      method: event.method || '',
      requestBody: event.requestBody,
      responseStatus: event.responseStatus,
      ipAddress: event.ipAddress || '',
      userAgent: event.userAgent || '',
      status: event.status,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw - audit logging failure shouldn't break the request
  }
}

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
    if (req.user.roles?.includes('super_admin')) {
      return next();
    }
    
    // Check specific permission in user's roles
    // This would be more complex in production with a proper permission system
    const hasPermission = await checkUserPermission(req.user.id, permission);
    
    if (!hasPermission) {
      await logAuditEvent({
        userId: req.user.id,
        action: `unauthorized_permission_${permission}`,
        resource: req.path,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: 'failed'
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