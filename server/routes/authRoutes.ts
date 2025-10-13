import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { insertUserSchema } from '../../shared/schema';
import { authService } from '../services/authService';
import { randomBytes } from 'crypto';
import { setUserContext } from '../middleware/tenantMiddleware';
import { getUserId } from '../utils/authHelper';

const router = Router();

// MB.MD TRACK 15: User login GET endpoint (for auth-context.tsx)
router.get('/user/login', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Login endpoint - use POST for actual login'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login endpoint error' });
  }
});

// ESA LIFE CEO 61x21 - Phase 2: Secure user authentication check
// User authentication status check - returns user if authenticated, null if not
router.get("/api/auth/user", async (req: any, res) => {
  try {
    // Development bypass - ONLY in development mode
    if (process.env.NODE_ENV === 'development' && process.env.AUTH_BYPASS === 'true') {
      console.log('🔧 [DEV ONLY] Auth bypass for /auth/user endpoint');
      const defaultUser = await storage.getUser(7); // Pierre Dubois - admin user for testing
      if (defaultUser) {
        const userWithRole = await authService.getUserWithRole(defaultUser.id);
        const role = userWithRole?.role || 'admin';
        return res.json({
          ...defaultUser,
          role,
          roles: [role] // Add roles array for frontend AdminLayout compatibility
        });
      }
    }

    // Check if user is authenticated (Replit OAuth)
    if (req.user?.claims?.sub) {
      const userId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(userId);
      
      if (!user) {
        // Auto-create user if doesn't exist
        const newUser = await storage.createUser({
          replitId: userId,
          email: req.user.claims.email || '',
          username: req.user.claims.username || `user${userId}`,
          name: req.user.claims.name || 'Anonymous User',
          password: 'oauth-user', // Required field
          profileImage: req.user.claims.profile_image_url || '/images/default-avatar.svg'
        });
        
        // Get role information
        const userWithRole = await authService.getUserWithRole(newUser.id);
        const role = userWithRole?.role || 'user';
        return res.json({
          ...newUser,
          role,
          roles: [role] // Add roles array for frontend compatibility
        });
      }
      
      // Get role information for existing user
      const userWithRole = await authService.getUserWithRole(user.id);
      const role = userWithRole?.role || 'user';
      return res.json({
        ...user,
        role,
        roles: [role] // Add roles array for frontend compatibility
      });
    }
    
    // Return null for anonymous users (allows public pages to work)
    return res.json(null);
  } catch (error) {
    console.error("Error fetching user:", error);
    // Return null on error for graceful degradation
    res.json(null);
  }
});

// Logout endpoint
router.post("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.json({ success: true });
  });
});

// Password reset request
router.post("/api/auth/reset-password-request", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Generate reset token
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour
    
    // Use password reset service to send email
    const { passwordResetService } = await import('../services/passwordResetService');
    const result = await passwordResetService.sendPasswordResetEmail(email);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error || 'Failed to send reset email' });
    }
    
    res.json({ 
      success: true, 
      message: "If an account exists with this email, you will receive reset instructions" 
    });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});

// Password reset
router.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    // Use password reset service
    const { passwordResetService } = await import('../services/passwordResetService');
    const result = await passwordResetService.resetPassword(token, password);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error || 'Failed to reset password' });
    }
    
    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// ESA LIFE CEO 61x21 - Phase 2: CSRF Token Generation
router.get("/api/auth/csrf", (req, res) => {
  // Development bypass
  if (process.env.NODE_ENV === 'development' && process.env.AUTH_BYPASS === 'true') {
    return res.json({ csrfToken: 'dev-token-only' });
  }
  
  // Generate or retrieve CSRF token from session
  const session = req.session as any;
  if (!session.csrfToken) {
    session.csrfToken = randomBytes(32).toString('hex');
  }
  
  res.json({ csrfToken: session.csrfToken });
});

// MB.MD TRACK 11: Missing auth GET endpoints
router.get('/auth/reset-password', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token required' });
  
  const isValid = await storage.validateResetToken(token as string);
  res.json({ success: true, valid: isValid });
});

router.get('/auth/reset-password-request', async (req, res) => {
  res.json({ success: true, message: 'Use POST to request password reset' });
});

router.get('/auth/user', setUserContext, async (req: any, res) => {
  const userId = getUserId(req);
  if (!userId) return res.json(null);
  
  const user = await storage.getUser(Number(userId));
  res.json({ success: true, data: user });
});

export default router;