// ESA LIFE CEO 61x21 - Phase 13: Two-Factor Authentication (2FA)
// TOTP implementation with QR codes and backup codes

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { randomBytes } from 'crypto';
import { db } from '../db';
import { users, twoFactorAuth, twoFactorBackupCodes } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

// 2FA configuration
const APP_NAME = 'ESA LIFE CEO';
const BACKUP_CODES_COUNT = 10;
const TOTP_WINDOW = 2; // Time window for TOTP validation

// Generate 2FA secret
export function generate2FASecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `${APP_NAME} (${email})`,
    issuer: APP_NAME,
    length: 32,
  });

  return {
    secret: secret.base32,
    url: secret.otpauth_url,
  };
}

// Generate QR code for 2FA setup
export async function generateQRCode(otpAuthUrl: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

// Generate backup codes
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
    const code = randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  
  return codes;
}

// Enable 2FA for user
export async function enable2FA(userId: number, token: string) {
  try {
    // Get user's 2FA secret
    const userAuth = await db
      .select()
      .from(twoFactorAuth)
      .where(eq(twoFactorAuth.userId, userId))
      .limit(1);

    if (!userAuth[0]?.tempSecret) {
      throw new Error('No 2FA setup in progress');
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: userAuth[0].tempSecret,
      encoding: 'base32',
      token,
      window: TOTP_WINDOW,
    });

    if (!verified) {
      throw new Error('Invalid verification code');
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Save backup codes (hashed)
    const bcrypt = await import('bcryptjs');
    for (const code of backupCodes) {
      const hashedCode = await bcrypt.hash(code, 10);
      await db.insert(twoFactorBackupCodes).values({
        userId,
        code: hashedCode,
        used: false,
        createdAt: new Date(),
      });
    }

    // Enable 2FA
    await db
      .update(twoFactorAuth)
      .set({
        secret: userAuth[0].tempSecret,
        tempSecret: null,
        enabled: true,
        enabledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(twoFactorAuth.userId, userId));

    // Update user record
    await db
      .update(users)
      .set({
        twoFactorEnabled: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return {
      success: true,
      backupCodes,
    };
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    throw error;
  }
}

// Verify 2FA token
export async function verify2FAToken(userId: number, token: string): Promise<boolean> {
  try {
    const userAuth = await db
      .select()
      .from(twoFactorAuth)
      .where(
        and(
          eq(twoFactorAuth.userId, userId),
          eq(twoFactorAuth.enabled, true)
        )
      )
      .limit(1);

    if (!userAuth[0]?.secret) {
      return false;
    }

    const verified = speakeasy.totp.verify({
      secret: userAuth[0].secret,
      encoding: 'base32',
      token,
      window: TOTP_WINDOW,
    });

    if (verified) {
      // Update last used timestamp
      await db
        .update(twoFactorAuth)
        .set({
          lastUsedAt: new Date(),
        })
        .where(eq(twoFactorAuth.userId, userId));
    }

    return verified;
  } catch (error) {
    console.error('Error verifying 2FA token:', error);
    return false;
  }
}

// Verify backup code
export async function verifyBackupCode(userId: number, code: string): Promise<boolean> {
  try {
    const bcrypt = await import('bcryptjs');
    
    // Get unused backup codes
    const backupCodes = await db
      .select()
      .from(twoFactorBackupCodes)
      .where(
        and(
          eq(twoFactorBackupCodes.userId, userId),
          eq(twoFactorBackupCodes.used, false)
        )
      );

    for (const backupCode of backupCodes) {
      const isMatch = await bcrypt.compare(code, backupCode.code);
      
      if (isMatch) {
        // Mark code as used
        await db
          .update(twoFactorBackupCodes)
          .set({
            used: true,
            usedAt: new Date(),
          })
          .where(eq(twoFactorBackupCodes.id, backupCode.id));

        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error verifying backup code:', error);
    return false;
  }
}

// Disable 2FA
export async function disable2FA(userId: number, password: string): Promise<boolean> {
  try {
    const bcrypt = await import('bcryptjs');
    
    // Verify user password first
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) {
      throw new Error('User not found');
    }

    const passwordValid = await bcrypt.compare(password, user[0].password);
    if (!passwordValid) {
      throw new Error('Invalid password');
    }

    // Disable 2FA
    await db
      .update(twoFactorAuth)
      .set({
        enabled: false,
        secret: null,
        tempSecret: null,
        updatedAt: new Date(),
      })
      .where(eq(twoFactorAuth.userId, userId));

    // Update user record
    await db
      .update(users)
      .set({
        twoFactorEnabled: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Delete backup codes
    await db
      .delete(twoFactorBackupCodes)
      .where(eq(twoFactorBackupCodes.userId, userId));

    return true;
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return false;
  }
}

// Initialize 2FA setup
export async function initialize2FASetup(userId: number) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) {
      throw new Error('User not found');
    }

    const { secret, url } = generate2FASecret(user[0].email);
    const qrCode = await generateQRCode(url!);

    // Check if 2FA record exists
    const existing = await db
      .select()
      .from(twoFactorAuth)
      .where(eq(twoFactorAuth.userId, userId))
      .limit(1);

    if (existing[0]) {
      // Update existing record
      await db
        .update(twoFactorAuth)
        .set({
          tempSecret: secret,
          updatedAt: new Date(),
        })
        .where(eq(twoFactorAuth.userId, userId));
    } else {
      // Create new record
      await db.insert(twoFactorAuth).values({
        userId,
        tempSecret: secret,
        enabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return {
      secret,
      qrCode,
      manualEntry: secret,
    };
  } catch (error) {
    console.error('Error initializing 2FA setup:', error);
    throw error;
  }
}

// Check if 2FA is required for user
export async function is2FARequired(userId: number): Promise<boolean> {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user[0]?.twoFactorEnabled || false;
  } catch (error) {
    console.error('Error checking 2FA requirement:', error);
    return false;
  }
}

// Regenerate backup codes
export async function regenerateBackupCodes(userId: number, password: string) {
  try {
    const bcrypt = await import('bcryptjs');
    
    // Verify user password
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) {
      throw new Error('User not found');
    }

    const passwordValid = await bcrypt.compare(password, user[0].password);
    if (!passwordValid) {
      throw new Error('Invalid password');
    }

    // Delete old backup codes
    await db
      .delete(twoFactorBackupCodes)
      .where(eq(twoFactorBackupCodes.userId, userId));

    // Generate new backup codes
    const backupCodes = generateBackupCodes();

    // Save new backup codes (hashed)
    for (const code of backupCodes) {
      const hashedCode = await bcrypt.hash(code, 10);
      await db.insert(twoFactorBackupCodes).values({
        userId,
        code: hashedCode,
        used: false,
        createdAt: new Date(),
      });
    }

    return {
      success: true,
      backupCodes,
    };
  } catch (error) {
    console.error('Error regenerating backup codes:', error);
    throw error;
  }
}

// Enforce 2FA for role
export async function enforce2FAForRole(role: string): Promise<void> {
  try {
    // This would typically update a configuration that enforces 2FA for specific roles
    console.log(`2FA enforcement set for role: ${role}`);
    
    // In production, you'd update a configuration table or similar
    // For now, we'll just log it
  } catch (error) {
    console.error('Error enforcing 2FA for role:', error);
  }
}

export default {
  generate2FASecret,
  generateQRCode,
  generateBackupCodes,
  enable2FA,
  verify2FAToken,
  verifyBackupCode,
  disable2FA,
  initialize2FASetup,
  is2FARequired,
  regenerateBackupCodes,
  enforce2FAForRole,
};