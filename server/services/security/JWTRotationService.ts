/**
 * Phase 9 - Track D1: JWT Token Rotation Service
 * Implements secure token rotation with refresh tokens
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../../db';
import { refreshTokens } from '../../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: Date;
  refreshTokenExpiry: Date;
}

export interface TokenPayload {
  userId: string;
  email?: string;
  role?: string;
}

export class JWTRotationService {
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private accessTokenExpiry = '15m';  // 15 minutes
  private refreshTokenExpiry = '7d';  // 7 days

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || crypto.randomBytes(32).toString('hex');
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || crypto.randomBytes(32).toString('hex');

    if (!process.env.JWT_ACCESS_SECRET) {
      console.warn('⚠️  JWT_ACCESS_SECRET not set - using random secret (not suitable for production)');
    }
  }

  /**
   * Generate access + refresh token pair
   */
  async generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      payload,
      this.accessTokenSecret,
      { expiresIn: this.accessTokenExpiry }
    );

    // Generate refresh token with unique ID
    const tokenId = crypto.randomUUID();
    const refreshToken = jwt.sign(
      { ...payload, tokenId },
      this.refreshTokenSecret,
      { expiresIn: this.refreshTokenExpiry }
    );

    // Hash refresh token before storing
    const hashedToken = await bcrypt.hash(refreshToken, 10);

    // Store in database
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    try {
      // Upsert: Update if exists, insert if not
      await db
        .insert(refreshTokens)
        .values({
          userId: payload.userId,
          tokenHash: hashedToken,
          expiresAt: expiryDate
        })
        .onConflictDoUpdate({
          target: refreshTokens.userId,
          set: {
            tokenHash: hashedToken,
            expiresAt: expiryDate,
            createdAt: new Date()
          }
        });
    } catch (error) {
      console.error('Error storing refresh token:', error);
    }

    return {
      accessToken,
      refreshToken,
      accessTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
      refreshTokenExpiry: expiryDate
    };
  }

  /**
   * Refresh token rotation
   * Validates old refresh token and issues new token pair
   */
  async rotateToken(oldRefreshToken: string): Promise<TokenPair | null> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(oldRefreshToken, this.refreshTokenSecret) as TokenPayload & { tokenId: string };

      // Get stored token from database
      const [storedToken] = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.userId, decoded.userId))
        .limit(1);

      if (!storedToken) {
        console.warn(`⚠️  [JWT] No stored token found for user ${decoded.userId}`);
        return null;
      }

      // Check expiry
      if (new Date() > storedToken.expiresAt) {
        console.warn(`⚠️  [JWT] Refresh token expired for user ${decoded.userId}`);
        await this.revokeTokens(decoded.userId);
        return null;
      }

      // Verify token hash matches
      const isValid = await bcrypt.compare(oldRefreshToken, storedToken.tokenHash);
      if (!isValid) {
        // Possible token theft - invalidate all tokens
        console.error(`❌ [JWT] Token reuse detected for user ${decoded.userId} - revoking all tokens`);
        await this.revokeTokens(decoded.userId);
        return null;
      }

      // Generate new token pair
      const newTokenPair = await this.generateTokenPair({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      });

      console.log(`✅ [JWT] Token rotated successfully for user ${decoded.userId}`);

      return newTokenPair;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        console.warn('[JWT] Refresh token expired');
      } else if (error.name === 'JsonWebTokenError') {
        console.error('[JWT] Invalid refresh token');
      } else {
        console.error('[JWT] Token rotation error:', error);
      }
      return null;
    }
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as TokenPayload;
      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        console.warn('[JWT] Access token expired');
      } else {
        console.error('[JWT] Access token verification failed:', error);
      }
      return null;
    }
  }

  /**
   * Revoke all tokens for a user (logout)
   */
  async revokeTokens(userId: string): Promise<void> {
    try {
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.userId, userId));

      console.log(`✅ [JWT] All tokens revoked for user ${userId}`);
    } catch (error) {
      console.error('Error revoking tokens:', error);
    }
  }

  /**
   * Cleanup expired tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await db
        .delete(refreshTokens)
        .where(sql`${refreshTokens.expiresAt} < NOW()`);

      const deletedCount = result.rowCount || 0;
      if (deletedCount > 0) {
        console.log(`🧹 [JWT] Cleaned up ${deletedCount} expired tokens`);
      }
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up tokens:', error);
      return 0;
    }
  }

  /**
   * Start automatic cleanup
   */
  startCleanup(intervalMs: number = 60 * 60 * 1000): NodeJS.Timeout {
    console.log(`🧹 [JWT] Starting token cleanup (interval: ${intervalMs}ms)`);
    return setInterval(() => this.cleanupExpiredTokens(), intervalMs);
  }
}

// Singleton instance
export const jwtRotationService = new JWTRotationService();
