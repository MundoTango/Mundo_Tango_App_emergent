// ESA LIFE CEO 61x21 - Phase 13: Security Routes
// OAuth, 2FA, and API key management routes

import { Router, Request, Response } from 'express';
import passport from 'passport';
import { 
  requireAuth,
  authenticateUser,
  csrfProtection,
} from '../middleware/secureAuth';
import { 
  initializeOAuth,
  createOAuthJWT,
} from '../security/oauth-config';
import {
  initialize2FASetup,
  enable2FA,
  verify2FAToken,
  disable2FA,
  regenerateBackupCodes,
  is2FARequired,
} from '../security/two-factor-auth';
import {
  createAPIKey,
  rotateAPIKey,
  revokeAPIKey,
  getAPIKeyStatistics,
  APIScope,
} from '../security/api-security';
import { 
  logAuditEvent,
  AuditLevel,
  AuditEventType,
} from '../security/audit-logger';
import { db } from '../db';
import { apiKeys } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Initialize OAuth strategies
initializeOAuth();

// ============================================
// OAuth Routes
// ============================================

// Google OAuth
router.get('/auth/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req: Request, res: Response) => {
    const user = req.user as any;
    
    // Log successful OAuth login
    await logAuditEvent({
      userId: user.userId,
      eventType: AuditEventType.OAUTH_LOGIN,
      level: AuditLevel.INFO,
      message: 'Successful Google OAuth login',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });
    
    // Set JWT cookie
    res.cookie('jwt', user.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    res.redirect('/dashboard');
  }
);

// GitHub OAuth
router.get('/auth/github',
  passport.authenticate('github', { 
    scope: ['user:email', 'read:user'] 
  })
);

router.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  async (req: Request, res: Response) => {
    const user = req.user as any;
    
    // Log successful OAuth login
    await logAuditEvent({
      userId: user.userId,
      eventType: AuditEventType.OAUTH_LOGIN,
      level: AuditLevel.INFO,
      message: 'Successful GitHub OAuth login',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });
    
    // Set JWT cookie
    res.cookie('jwt', user.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    res.redirect('/dashboard');
  }
);

// ============================================
// Two-Factor Authentication Routes
// ============================================

// Initialize 2FA setup
router.post('/security/2fa/setup', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const setup = await initialize2FASetup(userId);
    
    // Log 2FA setup initiation
    await logAuditEvent({
      userId,
      eventType: AuditEventType.TWO_FACTOR_ENABLED,
      level: AuditLevel.INFO,
      message: '2FA setup initiated',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });
    
    res.json({
      success: true,
      qrCode: setup.qrCode,
      secret: setup.manualEntry,
    });
  } catch (error: any) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      error: 'Failed to initialize 2FA setup',
      message: error.message,
    });
  }
});

// Enable 2FA
router.post('/security/2fa/enable', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        error: 'Verification token required',
      });
    }
    
    const result = await enable2FA(userId, token);
    
    if (result.success) {
      // Log 2FA enablement
      await logAuditEvent({
        userId,
        eventType: AuditEventType.TWO_FACTOR_ENABLED,
        level: AuditLevel.SECURITY,
        message: '2FA successfully enabled',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
      });
      
      res.json({
        success: true,
        backupCodes: result.backupCodes,
        message: 'Two-factor authentication enabled successfully',
      });
    } else {
      res.status(400).json({
        error: 'Invalid verification code',
      });
    }
  } catch (error: any) {
    console.error('2FA enable error:', error);
    res.status(500).json({
      error: 'Failed to enable 2FA',
      message: error.message,
    });
  }
});

// Verify 2FA token
router.post('/security/2fa/verify', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        error: 'Verification token required',
      });
    }
    
    const valid = await verify2FAToken(userId, token);
    
    if (valid) {
      res.json({
        success: true,
        message: '2FA verification successful',
      });
    } else {
      // Log failed 2FA attempt
      await logAuditEvent({
        userId,
        eventType: AuditEventType.TWO_FACTOR_FAILED,
        level: AuditLevel.WARNING,
        message: 'Failed 2FA verification attempt',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
      });
      
      res.status(401).json({
        error: 'Invalid 2FA token',
      });
    }
  } catch (error: any) {
    console.error('2FA verify error:', error);
    res.status(500).json({
      error: 'Failed to verify 2FA token',
      message: error.message,
    });
  }
});

// Disable 2FA
router.post('/security/2fa/disable', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        error: 'Password required to disable 2FA',
      });
    }
    
    const success = await disable2FA(userId, password);
    
    if (success) {
      // Log 2FA disablement
      await logAuditEvent({
        userId,
        eventType: AuditEventType.TWO_FACTOR_DISABLED,
        level: AuditLevel.SECURITY,
        message: '2FA disabled',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
      });
      
      res.json({
        success: true,
        message: 'Two-factor authentication disabled',
      });
    } else {
      res.status(401).json({
        error: 'Invalid password',
      });
    }
  } catch (error: any) {
    console.error('2FA disable error:', error);
    res.status(500).json({
      error: 'Failed to disable 2FA',
      message: error.message,
    });
  }
});

// Regenerate backup codes
router.post('/security/2fa/regenerate-codes', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        error: 'Password required to regenerate backup codes',
      });
    }
    
    const result = await regenerateBackupCodes(userId, password);
    
    if (result.success) {
      res.json({
        success: true,
        backupCodes: result.backupCodes,
        message: 'Backup codes regenerated successfully',
      });
    } else {
      res.status(401).json({
        error: 'Invalid password',
      });
    }
  } catch (error: any) {
    console.error('Backup codes regeneration error:', error);
    res.status(500).json({
      error: 'Failed to regenerate backup codes',
      message: error.message,
    });
  }
});

// ============================================
// API Key Management Routes
// ============================================

// List API keys
router.get('/security/api-keys', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        key: apiKeys.key,
        scopes: apiKeys.scopes,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId));
    
    res.json({
      success: true,
      apiKeys: keys.map(key => ({
        ...key,
        key: `${key.key.substring(0, 10)}...`, // Mask API key
        scopes: key.scopes.split(','),
      })),
    });
  } catch (error: any) {
    console.error('List API keys error:', error);
    res.status(500).json({
      error: 'Failed to list API keys',
      message: error.message,
    });
  }
});

// Create API key
router.post('/security/api-keys', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, scopes, expiresIn } = req.body;
    
    if (!name || !scopes || !Array.isArray(scopes)) {
      return res.status(400).json({
        error: 'Name and scopes are required',
      });
    }
    
    // Validate scopes
    const validScopes = Object.values(APIScope);
    const invalidScopes = scopes.filter(scope => !validScopes.includes(scope));
    
    if (invalidScopes.length > 0) {
      return res.status(400).json({
        error: 'Invalid scopes',
        invalidScopes,
        validScopes,
      });
    }
    
    // Calculate expiration
    let expiresAt;
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn);
    }
    
    const apiKey = await createAPIKey(userId, name, scopes, expiresAt);
    
    // Log API key creation
    await logAuditEvent({
      userId,
      eventType: AuditEventType.API_KEY_CREATED,
      level: AuditLevel.INFO,
      message: `API key created: ${name}`,
      metadata: { scopes, expiresAt },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });
    
    res.json({
      success: true,
      apiKey,
      message: 'API key created successfully. Store the secret securely as it will not be shown again.',
    });
  } catch (error: any) {
    console.error('Create API key error:', error);
    res.status(500).json({
      error: 'Failed to create API key',
      message: error.message,
    });
  }
});

// Rotate API key
router.post('/security/api-keys/:id/rotate', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const apiKeyId = parseInt(req.params.id);
    
    const newCredentials = await rotateAPIKey(apiKeyId, userId);
    
    // Log API key rotation
    await logAuditEvent({
      userId,
      eventType: AuditEventType.API_KEY_ROTATED,
      level: AuditLevel.SECURITY,
      message: `API key rotated: ${apiKeyId}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });
    
    res.json({
      success: true,
      key: newCredentials.key,
      secret: newCredentials.secret,
      message: 'API key rotated successfully. Store the new credentials securely.',
    });
  } catch (error: any) {
    console.error('Rotate API key error:', error);
    res.status(500).json({
      error: 'Failed to rotate API key',
      message: error.message,
    });
  }
});

// Revoke API key
router.delete('/security/api-keys/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const apiKeyId = parseInt(req.params.id);
    
    const success = await revokeAPIKey(apiKeyId, userId);
    
    if (success) {
      // Log API key revocation
      await logAuditEvent({
        userId,
        eventType: AuditEventType.API_KEY_REVOKED,
        level: AuditLevel.INFO,
        message: `API key revoked: ${apiKeyId}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
      });
      
      res.json({
        success: true,
        message: 'API key revoked successfully',
      });
    } else {
      res.status(404).json({
        error: 'API key not found',
      });
    }
  } catch (error: any) {
    console.error('Revoke API key error:', error);
    res.status(500).json({
      error: 'Failed to revoke API key',
      message: error.message,
    });
  }
});

// Get API key statistics
router.get('/security/api-keys/:id/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const apiKeyId = parseInt(req.params.id);
    const days = parseInt(req.query.days as string) || 30;
    
    const stats = await getAPIKeyStatistics(apiKeyId, days);
    
    res.json({
      success: true,
      statistics: stats,
    });
  } catch (error: any) {
    console.error('API key stats error:', error);
    res.status(500).json({
      error: 'Failed to get API key statistics',
      message: error.message,
    });
  }
});

export default router;