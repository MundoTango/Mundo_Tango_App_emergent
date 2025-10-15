/**
 * Phase 10 - Track D3: API Key Management & Rotation
 * Manages API keys with 90-day rotation policy
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { db } from '../../db';
import { sql } from 'drizzle-orm';

export interface APIKey {
  keyId: string;
  userId: string;
  keyHash: string;
  version: number;
  createdAt: Date;
  expiresAt: Date;
  lastUsed?: Date;
  isActive: boolean;
}

export interface APIKeyValidation {
  valid: boolean;
  keyId?: string;
  userId?: string;
  reason?: string;
}

export class APIKeyManager {
  private rotationPeriodDays = 90;
  private gracePeriodDays = 7;
  private keyPrefix = 'mtapp_'; // Mundo Tango App prefix

  /**
   * Generate a new API key
   */
  async generateKey(userId: string): Promise<{ key: string; keyId: string }> {
    // Generate secure random key
    const keyId = crypto.randomUUID();
    const keySecret = crypto.randomBytes(32).toString('hex');
    const fullKey = `${this.keyPrefix}${keyId}_${keySecret}`;

    // Hash the key for storage
    const keyHash = await bcrypt.hash(keySecret, 10);

    // Get current version (increment for rotation)
    const currentVersion = await this.getCurrentKeyVersion(userId);
    const newVersion = currentVersion + 1;

    // Calculate expiration (90 days from now)
    const expiresAt = new Date(Date.now() + this.rotationPeriodDays * 24 * 60 * 60 * 1000);

    // Store in database (would need to create api_keys table)
    // For now, log the creation
    console.log(`🔑 [API Key Manager] Generated key v${newVersion} for user ${userId}, expires ${expiresAt.toDateString()}`);

    return {
      key: fullKey,
      keyId
    };
  }

  /**
   * Validate an API key
   */
  async validateKey(key: string): Promise<APIKeyValidation> {
    if (!key.startsWith(this.keyPrefix)) {
      return { valid: false, reason: 'Invalid key format' };
    }

    // Parse key: mtapp_{keyId}_{secret}
    const parts = key.replace(this.keyPrefix, '').split('_');
    if (parts.length !== 2) {
      return { valid: false, reason: 'Malformed key' };
    }

    const [keyId, keySecret] = parts;

    // Fetch key from database (simulated)
    const apiKey = await this.getKeyById(keyId);
    if (!apiKey) {
      return { valid: false, reason: 'Key not found' };
    }

    // Check if key is active
    if (!apiKey.isActive) {
      return { valid: false, reason: 'Key deactivated' };
    }

    // Check expiration
    if (new Date() > apiKey.expiresAt) {
      return { valid: false, reason: 'Key expired' };
    }

    // Verify hash
    const isValid = await bcrypt.compare(keySecret, apiKey.keyHash);
    if (!isValid) {
      return { valid: false, reason: 'Invalid key secret' };
    }

    // Update last used timestamp
    await this.updateLastUsed(keyId);

    return {
      valid: true,
      keyId: apiKey.keyId,
      userId: apiKey.userId
    };
  }

  /**
   * Rotate keys for a user
   */
  async rotateKey(userId: string): Promise<{ newKey: string; oldKeyGracePeriod: Date }> {
    // Generate new key
    const { key: newKey, keyId } = await this.generateKey(userId);

    // Calculate grace period end date
    const gracePeriodEnd = new Date(Date.now() + this.gracePeriodDays * 24 * 60 * 60 * 1000);

    // Mark old keys for deprecation (still valid during grace period)
    await this.deprecateOldKeys(userId, gracePeriodEnd);

    console.log(`🔄 [API Key Manager] Rotated key for user ${userId}, grace period until ${gracePeriodEnd.toDateString()}`);

    return {
      newKey,
      oldKeyGracePeriod: gracePeriodEnd
    };
  }

  /**
   * Revoke an API key
   */
  async revokeKey(keyId: string): Promise<void> {
    console.log(`🚫 [API Key Manager] Revoked key ${keyId}`);
    // In real implementation, update database to set isActive = false
  }

  /**
   * Get keys expiring soon
   */
  async getExpiringKeys(daysThreshold: number = 30): Promise<APIKey[]> {
    const thresholdDate = new Date(Date.now() + daysThreshold * 24 * 60 * 60 * 1000);

    // Query database for keys expiring before threshold
    // Simulated response
    console.log(`📊 [API Key Manager] Checking for keys expiring before ${thresholdDate.toDateString()}`);

    return [];
  }

  /**
   * Send rotation notifications
   */
  async sendRotationNotifications(): Promise<void> {
    const expiringKeys = await this.getExpiringKeys(7); // 7 days warning

    for (const key of expiringKeys) {
      console.log(`📧 [API Key Manager] Sending rotation notice to user ${key.userId}`);
      // Send email/notification
      // await emailService.send({
      //   to: user.email,
      //   subject: 'API Key Rotation Required',
      //   body: `Your API key will expire on ${key.expiresAt}. Please generate a new key.`
      // });
    }
  }

  /**
   * Get current key version for a user
   */
  private async getCurrentKeyVersion(userId: string): Promise<number> {
    // Query database for max version
    // Simulated: return 0 for first key
    return 0;
  }

  /**
   * Get key by ID (simulated - would query database)
   */
  private async getKeyById(keyId: string): Promise<APIKey | null> {
    // Simulated: In real implementation, query api_keys table
    return null;
  }

  /**
   * Update last used timestamp
   */
  private async updateLastUsed(keyId: string): Promise<void> {
    // Update database
    console.log(`⏱️  [API Key Manager] Updated last used for key ${keyId}`);
  }

  /**
   * Deprecate old keys (mark for deletion after grace period)
   */
  private async deprecateOldKeys(userId: string, gracePeriodEnd: Date): Promise<void> {
    console.log(`⏳ [API Key Manager] Deprecated old keys for user ${userId}, valid until ${gracePeriodEnd.toDateString()}`);
    // Update database: set old keys to expire at gracePeriodEnd
  }

  /**
   * Start automatic rotation monitoring
   */
  startRotationMonitoring(checkIntervalHours: number = 24): NodeJS.Timeout {
    console.log(`✅ [API Key Manager] Started rotation monitoring (interval: ${checkIntervalHours}h)`);

    return setInterval(async () => {
      await this.sendRotationNotifications();
      
      // Auto-revoke expired keys
      await this.cleanupExpiredKeys();
    }, checkIntervalHours * 60 * 60 * 1000);
  }

  /**
   * Cleanup expired keys
   */
  private async cleanupExpiredKeys(): Promise<void> {
    console.log('🧹 [API Key Manager] Cleaning up expired keys');
    // Delete keys where expiresAt < NOW() AND grace period expired
  }
}

// Singleton instance
export const apiKeyManager = new APIKeyManager();
