// ESA LIFE CEO 61x21 - Phase 13: Audit Logging
// Comprehensive audit logging and security monitoring

import { db } from '../db';
import { auditLogs, securityEvents, suspiciousActivities } from '../../shared/schema';
import { Request } from 'express';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { and, gte, lte, eq, desc } from 'drizzle-orm';

// Audit log levels
export enum AuditLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
  SECURITY = 'security',
}

// Audit event types
export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET = 'password_reset',
  TWO_FACTOR_ENABLED = '2fa_enabled',
  TWO_FACTOR_DISABLED = '2fa_disabled',
  TWO_FACTOR_FAILED = '2fa_failed',
  OAUTH_LOGIN = 'oauth_login',
  
  // Authorization events
  PERMISSION_DENIED = 'permission_denied',
  ROLE_CHANGED = 'role_changed',
  ACCESS_GRANTED = 'access_granted',
  ACCESS_REVOKED = 'access_revoked',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  ADMIN_ACTION = 'admin_action',
  
  // Data events
  DATA_CREATED = 'data_created',
  DATA_READ = 'data_read',
  DATA_UPDATED = 'data_updated',
  DATA_DELETED = 'data_deleted',
  DATA_EXPORTED = 'data_exported',
  DATA_IMPORTED = 'data_imported',
  
  // API events
  API_KEY_CREATED = 'api_key_created',
  API_KEY_ROTATED = 'api_key_rotated',
  API_KEY_REVOKED = 'api_key_revoked',
  API_RATE_LIMIT = 'api_rate_limit',
  API_REQUEST = 'api_request',
  
  // Security events
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SECURITY_SCAN = 'security_scan',
  INTRUSION_ATTEMPT = 'intrusion_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  CSRF_ATTEMPT = 'csrf_attempt',
  
  // Admin events
  CONFIG_CHANGED = 'config_changed',
  USER_BANNED = 'user_banned',
  USER_UNBANNED = 'user_unbanned',
  SYSTEM_MAINTENANCE = 'system_maintenance',
}

// Audit log entry interface
interface AuditLogEntry {
  userId?: number;
  eventType: AuditEventType;
  level: AuditLevel;
  message: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  sessionId?: string;
}

// Security monitoring thresholds
const SECURITY_THRESHOLDS = {
  failedLogins: { count: 5, window: 300000 }, // 5 attempts in 5 minutes
  apiRateLimit: { count: 100, window: 60000 }, // 100 requests per minute
  suspiciousPatterns: { count: 3, window: 600000 }, // 3 suspicious activities in 10 minutes
  dataExport: { count: 10, window: 3600000 }, // 10 exports per hour
};

// Activity tracker for anomaly detection
const activityTracker = new Map<string, { count: number; firstSeen: number; lastSeen: number }>();

// Log audit event
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: entry.userId || null,
      eventType: entry.eventType,
      level: entry.level,
      message: entry.message,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
      ipAddress: entry.ipAddress || null,
      userAgent: entry.userAgent || null,
      requestId: entry.requestId || null,
      sessionId: entry.sessionId || null,
      timestamp: new Date(),
    });
    
    // Check for security events
    if (entry.level === AuditLevel.SECURITY || entry.level === AuditLevel.CRITICAL) {
      await logSecurityEvent(entry);
    }
    
    // Check for suspicious patterns
    await detectSuspiciousActivity(entry);
    
    // Write to file for backup
    await writeToAuditFile(entry);
  } catch (error) {
    console.error('Error logging audit event:', error);
    // Fallback to file logging
    await writeToAuditFile(entry);
  }
}

// Log security event
async function logSecurityEvent(entry: AuditLogEntry): Promise<void> {
  try {
    await db.insert(securityEvents).values({
      eventType: entry.eventType,
      severity: mapLevelToSeverity(entry.level),
      description: entry.message,
      source: entry.ipAddress || 'unknown',
      userId: entry.userId,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
      resolved: false,
      timestamp: new Date(),
    });
    
    // Send alerts for critical events
    if (entry.level === AuditLevel.CRITICAL) {
      await sendSecurityAlert(entry);
    }
  } catch (error) {
    console.error('Error logging security event:', error);
  }
}

// Detect suspicious activity
async function detectSuspiciousActivity(entry: AuditLogEntry): Promise<void> {
  const key = `${entry.userId || entry.ipAddress}:${entry.eventType}`;
  const now = Date.now();
  
  // Track activity
  const activity = activityTracker.get(key) || { count: 0, firstSeen: now, lastSeen: now };
  activity.count++;
  activity.lastSeen = now;
  activityTracker.set(key, activity);
  
  // Check thresholds
  let isSuspicious = false;
  let reason = '';
  
  switch (entry.eventType) {
    case AuditEventType.LOGIN_FAILED:
      if (activity.count >= SECURITY_THRESHOLDS.failedLogins.count &&
          now - activity.firstSeen <= SECURITY_THRESHOLDS.failedLogins.window) {
        isSuspicious = true;
        reason = 'Too many failed login attempts';
      }
      break;
      
    case AuditEventType.API_RATE_LIMIT:
      if (activity.count >= SECURITY_THRESHOLDS.apiRateLimit.count &&
          now - activity.firstSeen <= SECURITY_THRESHOLDS.apiRateLimit.window) {
        isSuspicious = true;
        reason = 'API rate limit exceeded multiple times';
      }
      break;
      
    case AuditEventType.DATA_EXPORTED:
      if (activity.count >= SECURITY_THRESHOLDS.dataExport.count &&
          now - activity.firstSeen <= SECURITY_THRESHOLDS.dataExport.window) {
        isSuspicious = true;
        reason = 'Excessive data export activity';
      }
      break;
  }
  
  // Log suspicious activity
  if (isSuspicious) {
    await db.insert(suspiciousActivities).values({
      userId: entry.userId,
      activityType: entry.eventType,
      description: reason,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      metadata: JSON.stringify({
        count: activity.count,
        window: now - activity.firstSeen,
        ...entry.metadata,
      }),
      severity: 'high',
      investigated: false,
      timestamp: new Date(),
    });
    
    // Reset tracker
    activityTracker.delete(key);
    
    // Send alert
    await sendSecurityAlert({
      ...entry,
      level: AuditLevel.SECURITY,
      message: `Suspicious activity detected: ${reason}`,
    });
  }
  
  // Clean up old entries
  cleanupActivityTracker();
}

// Clean up old activity tracker entries
function cleanupActivityTracker(): void {
  const now = Date.now();
  const maxAge = 3600000; // 1 hour
  
  for (const [key, activity] of activityTracker.entries()) {
    if (now - activity.lastSeen > maxAge) {
      activityTracker.delete(key);
    }
  }
}

// Map audit level to severity
function mapLevelToSeverity(level: AuditLevel): string {
  switch (level) {
    case AuditLevel.CRITICAL:
      return 'critical';
    case AuditLevel.SECURITY:
      return 'high';
    case AuditLevel.ERROR:
      return 'medium';
    case AuditLevel.WARNING:
      return 'low';
    default:
      return 'info';
  }
}

// Send security alert
async function sendSecurityAlert(entry: AuditLogEntry): Promise<void> {
  // In production, this would send emails, Slack messages, etc.
  console.error(`🚨 SECURITY ALERT: ${entry.message}`, {
    eventType: entry.eventType,
    level: entry.level,
    userId: entry.userId,
    ipAddress: entry.ipAddress,
    metadata: entry.metadata,
  });
  
  // Log to special security file
  const securityLogPath = path.join(process.cwd(), 'logs', 'security.log');
  const logEntry = `[${new Date().toISOString()}] ${entry.level.toUpperCase()}: ${entry.message}\n` +
                   `  Event: ${entry.eventType}\n` +
                   `  User: ${entry.userId || 'anonymous'}\n` +
                   `  IP: ${entry.ipAddress || 'unknown'}\n` +
                   `  Metadata: ${JSON.stringify(entry.metadata)}\n\n`;
  
  try {
    await fs.promises.appendFile(securityLogPath, logEntry);
  } catch (error) {
    console.error('Error writing to security log:', error);
  }
}

// Write to audit file
async function writeToAuditFile(entry: AuditLogEntry): Promise<void> {
  const logsDir = path.join(process.cwd(), 'logs');
  const auditLogPath = path.join(logsDir, 'audit.log');
  
  // Ensure logs directory exists
  try {
    await fs.promises.mkdir(logsDir, { recursive: true });
  } catch (error) {
    console.error('Error creating logs directory:', error);
  }
  
  const logEntry = `[${new Date().toISOString()}] ${entry.level.toUpperCase()}: ${entry.message}\n` +
                   `  Event: ${entry.eventType}\n` +
                   `  User: ${entry.userId || 'anonymous'}\n` +
                   `  IP: ${entry.ipAddress || 'unknown'}\n` +
                   `  Session: ${entry.sessionId || 'none'}\n` +
                   `  Request: ${entry.requestId || 'none'}\n` +
                   `  Metadata: ${JSON.stringify(entry.metadata)}\n\n`;
  
  try {
    await fs.promises.appendFile(auditLogPath, logEntry);
  } catch (error) {
    console.error('Error writing to audit log:', error);
  }
}

// Audit middleware
export const auditMiddleware = (eventType: AuditEventType, level: AuditLevel = AuditLevel.INFO) => {
  return async (req: Request, res: any, next: any) => {
    const startTime = Date.now();
    
    // Generate request ID
    const requestId = generateRequestId();
    (req as any).requestId = requestId;
    
    // Log request
    await logAuditEvent({
      userId: (req as any).user?.id,
      eventType,
      level,
      message: `${req.method} ${req.path}`,
      metadata: {
        method: req.method,
        path: req.path,
        query: req.query,
        body: sanitizeForLogging(req.body),
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] as string,
      requestId,
      sessionId: (req.session as any)?.id,
    });
    
    // Capture response
    const originalSend = res.send;
    res.send = function(data: any) {
      const responseTime = Date.now() - startTime;
      
      // Log response
      logAuditEvent({
        userId: (req as any).user?.id,
        eventType: AuditEventType.API_REQUEST,
        level: res.statusCode >= 400 ? AuditLevel.ERROR : AuditLevel.INFO,
        message: `Response: ${res.statusCode} in ${responseTime}ms`,
        metadata: {
          statusCode: res.statusCode,
          responseTime,
          requestId,
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] as string,
        requestId,
        sessionId: (req.session as any)?.id,
      }).catch(console.error);
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Generate request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Sanitize data for logging (remove sensitive information)
function sanitizeForLogging(data: any): any {
  if (!data) return data;
  
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn'];
  
  if (typeof data === 'string') {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForLogging(item));
  }
  
  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const key in data) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '***REDACTED***';
      } else {
        sanitized[key] = sanitizeForLogging(data[key]);
      }
    }
    return sanitized;
  }
  
  return data;
}

// Audit search and analysis
export async function searchAuditLogs(filters: {
  userId?: number;
  eventType?: AuditEventType;
  level?: AuditLevel;
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
  limit?: number;
}) {
  try {
    let query = db.select().from(auditLogs);
    
    // Apply filters
    const conditions = [];
    if (filters.userId) conditions.push(`userId = ${filters.userId}`);
    if (filters.eventType) conditions.push(`eventType = '${filters.eventType}'`);
    if (filters.level) conditions.push(`level = '${filters.level}'`);
    if (filters.ipAddress) conditions.push(`ipAddress = '${filters.ipAddress}'`);
    if (filters.startDate) conditions.push(`timestamp >= '${filters.startDate.toISOString()}'`);
    if (filters.endDate) conditions.push(`timestamp <= '${filters.endDate.toISOString()}'`);
    
    // This is a simplified query - in production, use proper query builder
    const results = await query.limit(filters.limit || 100);
    
    return results;
  } catch (error) {
    console.error('Error searching audit logs:', error);
    return [];
  }
}

// Generate audit report
export async function generateAuditReport(startDate: Date, endDate: Date) {
  const logs = await searchAuditLogs({ startDate, endDate, limit: 10000 });
  
  const report = {
    period: {
      start: startDate,
      end: endDate,
    },
    summary: {
      totalEvents: logs.length,
      byLevel: {} as Record<string, number>,
      byEventType: {} as Record<string, number>,
      uniqueUsers: new Set(),
      uniqueIPs: new Set(),
    },
    criticalEvents: [] as any[],
    suspiciousActivities: [] as any[],
  };
  
  // Analyze logs
  for (const log of logs) {
    // Count by level
    report.summary.byLevel[log.level] = (report.summary.byLevel[log.level] || 0) + 1;
    
    // Count by event type
    report.summary.byEventType[log.eventType] = (report.summary.byEventType[log.eventType] || 0) + 1;
    
    // Track unique users and IPs
    if (log.userId) report.summary.uniqueUsers.add(log.userId);
    if (log.ipAddress) report.summary.uniqueIPs.add(log.ipAddress);
    
    // Collect critical events
    if (log.level === AuditLevel.CRITICAL || log.level === AuditLevel.SECURITY) {
      report.criticalEvents.push(log);
    }
  }
  
  // Get suspicious activities
  const suspicious = await db
    .select()
    .from(suspiciousActivities)
    .where(and(
      gte(suspiciousActivities.timestamp, startDate),
      lte(suspiciousActivities.timestamp, endDate)
    ))
    .limit(100);
  
  report.suspiciousActivities = suspicious;
  
  // Convert sets to counts
  report.summary.uniqueUsers = report.summary.uniqueUsers.size as any;
  report.summary.uniqueIPs = report.summary.uniqueIPs.size as any;
  
  return report;
}

// Compliance reporting (GDPR, HIPAA, etc.)
export async function generateComplianceReport(userId: number) {
  const logs = await searchAuditLogs({ userId });
  
  return {
    userId,
    dataAccess: logs.filter(log => log.eventType === AuditEventType.DATA_READ),
    dataModifications: logs.filter(log => 
      log.eventType === AuditEventType.DATA_UPDATED || 
      log.eventType === AuditEventType.DATA_DELETED
    ),
    dataExports: logs.filter(log => log.eventType === AuditEventType.DATA_EXPORTED),
    authenticationEvents: logs.filter(log => 
      log.eventType === AuditEventType.LOGIN_SUCCESS || 
      log.eventType === AuditEventType.LOGIN_FAILED
    ),
    permissionChanges: logs.filter(log => 
      log.eventType === AuditEventType.ROLE_CHANGED || 
      log.eventType === AuditEventType.ACCESS_GRANTED || 
      log.eventType === AuditEventType.ACCESS_REVOKED
    ),
  };
}

export default {
  logAuditEvent,
  auditMiddleware,
  searchAuditLogs,
  generateAuditReport,
  generateComplianceReport,
  AuditLevel,
  AuditEventType,
};