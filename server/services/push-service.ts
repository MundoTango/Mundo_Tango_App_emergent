/**
 * ESA LIFE CEO 61x21 - Push Notification Service (Phase 16)
 * Server-side web push implementation
 */

import webpush from 'web-push';
import { db } from '@/db';
import { pushSubscriptions, users, notifications } from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

// VAPID keys (should be generated and stored securely in production)
const VAPID_KEYS = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BNbxGYNMhEAi9QRh5XYVtALXZNfJuIbY5LZnSvRkc5foF0eyCnOcbCE3Ps6hEp8tUslXOyNJ0XLkfRJ8DcvXhA4',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'private_key_here',
  subject: process.env.VAPID_SUBJECT || 'mailto:support@mundotango.life'
};

// Configure web-push
webpush.setVapidDetails(
  VAPID_KEYS.subject,
  VAPID_KEYS.publicKey,
  VAPID_KEYS.privateKey
);

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: any;
  silent?: boolean;
  vibrate?: number[];
  timestamp?: number;
}

export class PushNotificationService {
  private static instance: PushNotificationService;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Save push subscription for a user
   */
  async saveSubscription(userId: string, subscription: PushSubscriptionData): Promise<void> {
    try {
      // Check if subscription already exists
      const existing = await db
        .select()
        .from(pushSubscriptions)
        .where(and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.endpoint, subscription.endpoint)
        ))
        .limit(1);

      if (existing.length > 0) {
        // Update existing subscription
        await db
          .update(pushSubscriptions)
          .set({
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            updatedAt: new Date()
          })
          .where(eq(pushSubscriptions.id, existing[0].id));
      } else {
        // Create new subscription
        await db.insert(pushSubscriptions).values({
          userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      console.log(`Push subscription saved for user ${userId}`);
    } catch (error) {
      console.error('Error saving push subscription:', error);
      throw error;
    }
  }

  /**
   * Remove push subscription
   */
  async removeSubscription(userId: string, endpoint: string): Promise<void> {
    try {
      await db
        .delete(pushSubscriptions)
        .where(and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.endpoint, endpoint)
        ));

      console.log(`Push subscription removed for user ${userId}`);
    } catch (error) {
      console.error('Error removing push subscription:', error);
      throw error;
    }
  }

  /**
   * Send notification to a specific user
   */
  async sendToUser(userId: string, payload: NotificationPayload): Promise<void> {
    try {
      // Get user's push subscriptions
      const subscriptions = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, userId));

      if (subscriptions.length === 0) {
        console.log(`No push subscriptions found for user ${userId}`);
        return;
      }

      // Prepare notification payload
      const notificationPayload = JSON.stringify({
        ...payload,
        timestamp: payload.timestamp || Date.now(),
        icon: payload.icon || '/icons/icon-192.png',
        badge: payload.badge || '/icons/icon-96.png'
      });

      // Send to all user's devices
      const sendPromises = subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        try {
          await webpush.sendNotification(pushSubscription, notificationPayload);
          console.log(`Notification sent to user ${userId} device`);
        } catch (error: any) {
          console.error(`Error sending notification to device:`, error);
          
          // Remove invalid subscriptions
          if (error.statusCode === 410) {
            await this.removeSubscription(userId, sub.endpoint);
          }
        }
      });

      await Promise.all(sendPromises);

      // Log notification in database
      await this.logNotification(userId, payload);
    } catch (error) {
      console.error('Error sending notification to user:', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendToUsers(userIds: string[], payload: NotificationPayload): Promise<void> {
    const sendPromises = userIds.map(userId => this.sendToUser(userId, payload));
    await Promise.all(sendPromises);
  }

  /**
   * Send notification to all users with specific role
   */
  async sendToRole(role: string, payload: NotificationPayload): Promise<void> {
    try {
      // Get users with specific role
      const usersWithRole = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.role, role));

      const userIds = usersWithRole.map(u => u.id);
      
      if (userIds.length > 0) {
        await this.sendToUsers(userIds, payload);
      }
    } catch (error) {
      console.error('Error sending notification to role:', error);
      throw error;
    }
  }

  /**
   * Send notification to users in a specific community
   */
  async sendToCommunity(communityId: string, payload: NotificationPayload): Promise<void> {
    try {
      // Get community members
      const members = await db
        .select({ userId: users.id })
        .from(users)
        .where(eq(users.communityId, communityId));

      const userIds = members.map(m => m.userId);
      
      if (userIds.length > 0) {
        await this.sendToUsers(userIds, payload);
      }
    } catch (error) {
      console.error('Error sending notification to community:', error);
      throw error;
    }
  }

  /**
   * Send broadcast notification to all users
   */
  async broadcast(payload: NotificationPayload): Promise<void> {
    try {
      // Get all push subscriptions
      const subscriptions = await db
        .select()
        .from(pushSubscriptions);

      const notificationPayload = JSON.stringify({
        ...payload,
        timestamp: Date.now(),
        icon: payload.icon || '/icons/icon-192.png',
        badge: payload.badge || '/icons/icon-96.png'
      });

      // Send to all devices
      const sendPromises = subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        try {
          await webpush.sendNotification(pushSubscription, notificationPayload);
        } catch (error: any) {
          if (error.statusCode === 410) {
            await db
              .delete(pushSubscriptions)
              .where(eq(pushSubscriptions.id, sub.id));
          }
        }
      });

      await Promise.all(sendPromises);
      console.log(`Broadcast notification sent to ${subscriptions.length} devices`);
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      throw error;
    }
  }

  /**
   * Log notification in database
   */
  private async logNotification(userId: string, payload: NotificationPayload): Promise<void> {
    try {
      await db.insert(notifications).values({
        userId,
        title: payload.title,
        body: payload.body || '',
        type: payload.tag || 'general',
        data: payload.data || {},
        read: false,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  /**
   * Send notification templates
   */
  async sendNewMessage(fromUserId: string, toUserId: string, message: string): Promise<void> {
    const fromUser = await db
      .select()
      .from(users)
      .where(eq(users.id, fromUserId))
      .limit(1);

    if (fromUser.length === 0) return;

    await this.sendToUser(toUserId, {
      title: `New message from ${fromUser[0].name}`,
      body: message.substring(0, 100),
      tag: 'message',
      data: {
        type: 'message',
        fromUserId,
        url: '/messages'
      },
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
  }

  async sendEventReminder(userId: string, eventId: string, eventName: string, startTime: Date): Promise<void> {
    await this.sendToUser(userId, {
      title: 'Event Reminder',
      body: `${eventName} starts in 1 hour`,
      tag: 'event',
      requireInteraction: true,
      data: {
        type: 'event',
        eventId,
        url: `/events/${eventId}`
      },
      actions: [
        { action: 'view', title: 'View Event' },
        { action: 'snooze', title: 'Snooze' }
      ]
    });
  }

  async sendLifeCEOAlert(userId: string, message: string): Promise<void> {
    await this.sendToUser(userId, {
      title: 'Life CEO Assistant',
      body: message,
      icon: '/life-ceo-icon-192.png',
      tag: 'lifeceo',
      data: {
        type: 'lifeceo',
        url: '/life-ceo'
      }
    });
  }

  async sendCommunityUpdate(communityId: string, communityName: string, update: string): Promise<void> {
    await this.sendToCommunity(communityId, {
      title: `${communityName} Community`,
      body: update,
      tag: 'community',
      data: {
        type: 'community',
        communityId,
        url: `/community/${communityId}`
      }
    });
  }

  /**
   * Get notification preferences for user
   */
  async getPreferences(userId: string): Promise<any> {
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) return null;

      return user[0].notificationPreferences || {
        messages: true,
        events: true,
        lifeceo: true,
        community: true
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId: string, preferences: any): Promise<void> {
    try {
      await db
        .update(users)
        .set({
          notificationPreferences: preferences,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const pushService = PushNotificationService.getInstance();