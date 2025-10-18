import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { insertUserSchema } from '../../shared/schema';
import { authService } from '../services/authService';
import { randomBytes } from 'crypto';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../middleware/auth';
import { InvalidTokenError, ValidationError } from '../middleware/errorHandler';
import { success } from '../utils/apiResponse';
import rateLimit from 'express-rate-limit';

// Phase 11 Task 4.3: Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { 
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      statusCode: 429
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

// User authentication status check
router.get("/auth/user", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      // Auto-create user if doesn't exist
      const newUser = await storage.createUser({
        replitId: userId,
        email: req.user.claims.email,
        username: req.user.claims.username || `user${userId}`,
        name: req.user.claims.name || 'Anonymous User',
        profileImage: req.user.claims.profile_image_url || '/images/default-avatar.svg'
      });
      return res.json(newUser);
    }
    
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Logout endpoint
router.post("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.json({ success: true });
  });
});

// Password reset request
router.post("/auth/reset-password-request", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Generate reset token
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour
    
    // Store reset token in database
    await storage.createPasswordResetToken(email, token, expires);
    
    // TODO: Send email with reset link
    
    res.json({ 
      success: true, 
      message: "Password reset email sent if account exists" 
    });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});

// Password reset
router.post("/auth/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    // Verify token
    const resetToken = await storage.getPasswordResetToken(token);
    
    if (!resetToken || resetToken.expires < new Date()) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    await storage.updateUserPassword(resetToken.email, hashedPassword);
    
    // Delete used token
    await storage.deletePasswordResetToken(token);
    
    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// Phase 11 Task 4.2: Token refresh endpoint
router.post("/auth/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken, 'refresh');
    
    // Get user to ensure they still exist and are active
    const user = await storage.getUser(decoded.userId);
    
    if (!user) {
      throw new InvalidTokenError('User not found');
    }

    if (user.isActive === false) {
      throw new InvalidTokenError('User account is inactive');
    }

    // Generate new token pair
    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    // TODO: In production, store refresh tokens in database and invalidate old one
    // For now, we just generate new tokens

    res.json(success({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    }, 'Tokens refreshed successfully'));
  } catch (error) {
    next(error);
  }
});

// Legacy CSRF endpoint - kept for compatibility
router.get("/auth/csrf", (req, res) => {
  // Skip if AUTH_BYPASS is enabled
  if (process.env.AUTH_BYPASS?.toLowerCase() === 'true') {
    return res.json({ csrfToken: 'bypass-mode' });
  }
  
  const session = req.session as any;
  if (!session) {
    return res.json({ csrfToken: 'no-session' });
  }
  
  if (!session.csrfToken) {
    session.csrfToken = randomBytes(32).toString('hex');
  }
  
  res.json({ csrfToken: session.csrfToken });
});

// CSRF token endpoint for frontend security
router.get("/auth/csrf-token", (req, res) => {
  try {
    const session = req.session as any;
    
    // Skip if AUTH_BYPASS is enabled
    if (process.env.AUTH_BYPASS?.toLowerCase() === 'true') {
      return res.json({ csrfToken: 'bypass-mode' });
    }
    
    if (!session) {
      return res.status(401).json({ error: 'No session available' });
    }
    
    // Generate CSRF token if not exists
    if (!session.csrfToken) {
      session.csrfToken = randomBytes(32).toString('hex');
    }
    
    res.json({ csrfToken: session.csrfToken });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    res.status(500).json({ error: 'Failed to generate CSRF token' });
  }
});

export default router;