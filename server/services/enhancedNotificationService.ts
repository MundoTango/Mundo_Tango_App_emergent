/**
 * ESA LIFE CEO 61x21 - Layer 16: Enhanced Notification System
 * Email, push, in-app notifications with advanced delivery and preferences
 */

import { EventEmitter } from 'events';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'push' | 'in_app' | 'sms';
  subject?: string;
  body: string;
  variables: string[];
  category: 'social' | 'system' | 'marketing' | 'security';
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
  sms: boolean;
  categories: {
    social: boolean;
    system: boolean;
    marketing: boolean;
    security: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
    timezone: string;
  };
  frequency: {
    digest: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
    mentions: 'immediate' | 'batched' | 'never';
    events: 'immediate' | 'daily' | 'never';
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: 'email' | 'push' | 'in_app' | 'sms';
  category: 'social' | 'system' | 'marketing' | 'security';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: string[];
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  createdAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  metadata: {
    templateId?: string;
    actionUrl?: string;
    expiresAt?: Date;
    retryCount: number;
    trackingId?: string;
  };
}

export interface NotificationDeliveryResult {
  notificationId: string;
  channel: string;
  status: 'success' | 'failed';
  details?: any;
  timestamp: Date;
}

class EnhancedNotificationService extends EventEmitter {
  private notifications = new Map<string, Notification>();
  private templates = new Map<string, NotificationTemplate>();
  private userPreferences = new Map<string, NotificationPreferences>();
  private deliveryQueue: Notification[] = [];
  private isProcessing = false;

  // Delivery providers (mocked - replace with real implementations)
  private emailProvider: any = null;
  private pushProvider: any = null;
  private smsProvider: any = null;

  constructor() {
    super();
    this.setupDefaultTemplates();
    this.startDeliveryProcessor();
    console.log('[ESA Layer 16] Enhanced notification service initialized');
  }

  private setupDefaultTemplates() {
    const templates: NotificationTemplate[] = [
      {
        id: 'welcome',
        name: 'Welcome to Mundo Tango',
        type: 'email',
        subject: '¡Bienvenido a Mundo Tango! Welcome to the global tango community',
        body: 'Welcome {{name}} to Mundo Tango! Your journey in the tango community begins now.',
        variables: ['name'],
        category: 'system',
        priority: 'normal'
      },
      {
        id: 'event_invitation',
        name: 'Event Invitation',
        type: 'push',
        body: '{{inviter}} invited you to "{{event_name}}" on {{date}}',
        variables: ['inviter', 'event_name', 'date'],
        category: 'social',
        priority: 'high'
      },
      {
        id: 'post_mention',
        name: 'Post Mention',
        type: 'in_app',
        body: '{{author}} mentioned you in their post',
        variables: ['author'],
        category: 'social',
        priority: 'normal'
      },
      {
        id: 'friend_request',
        name: 'Friend Request',
        type: 'push',
        body: '{{requester}} wants to connect with you on Mundo Tango',
        variables: ['requester'],
        category: 'social',
        priority: 'normal'
      },
      {
        id: 'event_reminder',
        name: 'Event Reminder',
        type: 'push',
        body: 'Reminder: "{{event_name}}" starts in {{time_until}}',
        variables: ['event_name', 'time_until'],
        category: 'social',
        priority: 'high'
      },
      {
        id: 'security_alert',
        name: 'Security Alert',
        type: 'email',
        subject: 'Security Alert - Mundo Tango',
        body: 'We detected a login from a new device. If this wasn\'t you, please secure your account.',
        variables: [],
        category: 'security',
        priority: 'urgent'
      },
      {
        id: 'weekly_digest',
        name: 'Weekly Community Digest',
        type: 'email',
        subject: 'Your Weekly Tango Community Update',
        body: 'Here\'s what happened in your tango community this week...',
        variables: ['events_count', 'new_posts', 'new_members'],
        category: 'marketing',
        priority: 'low'
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });

    console.log(`[ESA Layer 16] Loaded ${templates.length} notification templates`);
  }

  async sendNotification(
    userId: string,
    templateId: string,
    variables: Record<string, string> = {},
    options: {
      channels?: string[];
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      actionUrl?: string;
      expiresAt?: Date;
    } = {}
  ): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const preferences = await this.getUserPreferences(userId);
    const channels = this.determineChannels(template, preferences, options.channels);
    
    if (channels.length === 0) {
      console.log(`[ESA Layer 16] No delivery channels for user ${userId}, template ${templateId}`);
      return '';
    }

    const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notification: Notification = {
      id: notificationId,
      userId,
      type: template.type,
      category: template.category,
      priority: options.priority || template.priority,
      title: this.processTemplate(template.subject || template.name, variables),
      message: this.processTemplate(template.body, variables),
      channels,
      status: 'pending',
      createdAt: new Date(),
      metadata: {
        templateId,
        actionUrl: options.actionUrl,
        expiresAt: options.expiresAt,
        retryCount: 0
      }
    };

    this.notifications.set(notificationId, notification);
    
    // Add to delivery queue based on priority
    if (notification.priority === 'urgent') {
      this.deliveryQueue.unshift(notification);
    } else {
      this.deliveryQueue.push(notification);
    }

    this.emit('notificationCreated', notification);
    console.log(`[ESA Layer 16] Created notification ${notificationId} for user ${userId}`);

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processDeliveryQueue();
    }

    return notificationId;
  }

  private determineChannels(
    template: NotificationTemplate,
    preferences: NotificationPreferences,
    requestedChannels?: string[]
  ): string[] {
    const channels: string[] = [];

    // If specific channels requested, use those (but still check preferences)
    if (requestedChannels && requestedChannels.length > 0) {
      requestedChannels.forEach(channel => {
        if (this.isChannelAllowed(channel, template, preferences)) {
          channels.push(channel);
        }
      });
      return channels;
    }

    // Auto-determine based on template type and user preferences
    if (template.type === 'email' && preferences.email && preferences.categories[template.category]) {
      channels.push('email');
    }

    if (template.type === 'push' && preferences.push && preferences.categories[template.category]) {
      // Check quiet hours
      if (!this.isInQuietHours(preferences)) {
        channels.push('push');
      }
    }

    if (template.type === 'in_app' && preferences.inApp && preferences.categories[template.category]) {
      channels.push('in_app');
    }

    if (template.type === 'sms' && preferences.sms && preferences.categories[template.category]) {
      channels.push('sms');
    }

    // Always allow urgent security notifications
    if (template.category === 'security' && template.priority === 'urgent') {
      if (!channels.includes('email')) channels.push('email');
      if (!channels.includes('push')) channels.push('push');
    }

    return channels;
  }

  private isChannelAllowed(
    channel: string,
    template: NotificationTemplate,
    preferences: NotificationPreferences
  ): boolean {
    if (!preferences.categories[template.category]) return false;

    switch (channel) {
      case 'email': return preferences.email;
      case 'push': return preferences.push && !this.isInQuietHours(preferences);
      case 'in_app': return preferences.inApp;
      case 'sms': return preferences.sms;
      default: return false;
    }
  }

  private isInQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quietHours.enabled) return false;

    const now = new Date();
    const userTime = new Intl.DateTimeFormat('en-US', {
      timeZone: preferences.quietHours.timezone || 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now);

    const currentTime = userTime.replace(':', '');
    const startTime = preferences.quietHours.start.replace(':', '');
    const endTime = preferences.quietHours.end.replace(':', '');

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    }

    return currentTime >= startTime && currentTime <= endTime;
  }

  private processTemplate(template: string, variables: Record<string, string>): string {
    let processed = template;
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processed = processed.replace(new RegExp(placeholder, 'g'), value);
    });
    return processed;
  }

  private async processDeliveryQueue() {
    if (this.isProcessing || this.deliveryQueue.length === 0) return;

    this.isProcessing = true;
    console.log(`[ESA Layer 16] Processing ${this.deliveryQueue.length} notifications in queue`);

    while (this.deliveryQueue.length > 0) {
      const notification = this.deliveryQueue.shift()!;
      await this.deliverNotification(notification);
      
      // Small delay to prevent overwhelming external services
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
  }

  private async deliverNotification(notification: Notification) {
    const deliveryPromises = notification.channels.map(channel => 
      this.deliverToChannel(notification, channel)
    );

    const results = await Promise.allSettled(deliveryPromises);
    
    let anySuccess = false;
    results.forEach((result, index) => {
      const channel = notification.channels[index];
      if (result.status === 'fulfilled' && result.value.status === 'success') {
        anySuccess = true;
        console.log(`[ESA Layer 16] Delivered notification ${notification.id} via ${channel}`);
      } else {
        console.error(`[ESA Layer 16] Failed to deliver ${notification.id} via ${channel}:`, 
          result.status === 'rejected' ? result.reason : result.value.details);
      }
    });

    // Update notification status
    notification.status = anySuccess ? 'sent' : 'failed';
    notification.sentAt = new Date();

    this.emit('notificationDelivered', notification, results);
  }

  private async deliverToChannel(notification: Notification, channel: string): Promise<NotificationDeliveryResult> {
    const result: NotificationDeliveryResult = {
      notificationId: notification.id,
      channel,
      status: 'failed',
      timestamp: new Date()
    };

    try {
      switch (channel) {
        case 'email':
          if (this.emailProvider) {
            await this.emailProvider.send({
              to: await this.getUserEmail(notification.userId),
              subject: notification.title,
              body: notification.message,
              trackingId: notification.id
            });
          } else {
            // Simulate email delivery
            console.log(`[ESA Layer 16] EMAIL to user ${notification.userId}: ${notification.title}`);
          }
          result.status = 'success';
          break;

        case 'push':
          if (this.pushProvider) {
            await this.pushProvider.send({
              userId: notification.userId,
              title: notification.title,
              body: notification.message,
              data: notification.data
            });
          } else {
            // Simulate push delivery
            console.log(`[ESA Layer 16] PUSH to user ${notification.userId}: ${notification.message}`);
          }
          result.status = 'success';
          break;

        case 'in_app':
          // Store in-app notification for user to see when they're online
          await this.storeInAppNotification(notification);
          result.status = 'success';
          break;

        case 'sms':
          if (this.smsProvider) {
            await this.smsProvider.send({
              to: await this.getUserPhone(notification.userId),
              message: `${notification.title}: ${notification.message}`
            });
          } else {
            // Simulate SMS delivery
            console.log(`[ESA Layer 16] SMS to user ${notification.userId}: ${notification.message}`);
          }
          result.status = 'success';
          break;

        default:
          throw new Error(`Unknown channel: ${channel}`);
      }
    } catch (error) {
      result.details = error;
    }

    return result;
  }

  private async storeInAppNotification(notification: Notification) {
    // This would typically store in database for user to see in UI
    console.log(`[ESA Layer 16] Stored in-app notification for user ${notification.userId}`);
  }

  private async getUserEmail(userId: string): Promise<string> {
    // This would fetch from user database
    return `user${userId}@example.com`;
  }

  private async getUserPhone(userId: string): Promise<string> {
    // This would fetch from user database
    return `+1234567890`;
  }

  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    let preferences = this.userPreferences.get(userId);
    
    if (!preferences) {
      // Create default preferences
      preferences = {
        userId,
        email: true,
        push: true,
        inApp: true,
        sms: false,
        categories: {
          social: true,
          system: true,
          marketing: false,
          security: true
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
          timezone: 'America/New_York'
        },
        frequency: {
          digest: 'daily',
          mentions: 'immediate',
          events: 'immediate'
        }
      };
      
      this.userPreferences.set(userId, preferences);
    }

    return preferences;
  }

  async updateUserPreferences(userId: string, updates: Partial<NotificationPreferences>): Promise<void> {
    const current = await this.getUserPreferences(userId);
    const updated = { ...current, ...updates };
    
    this.userPreferences.set(userId, updated);
    this.emit('preferencesUpdated', userId, updated);
    
    console.log(`[ESA Layer 16] Updated preferences for user ${userId}`);
  }

  // Specialized notification methods for Mundo Tango platform
  async notifyEventInvitation(inviterId: string, inviteeId: string, eventId: string, eventName: string, eventDate: string) {
    const inviterName = await this.getUserName(inviterId);
    return this.sendNotification(inviteeId, 'event_invitation', {
      inviter: inviterName,
      event_name: eventName,
      date: eventDate
    }, {
      priority: 'high',
      actionUrl: `/events/${eventId}`
    });
  }

  async notifyPostMention(authorId: string, mentionedUserId: string, postId: string) {
    const authorName = await this.getUserName(authorId);
    return this.sendNotification(mentionedUserId, 'post_mention', {
      author: authorName
    }, {
      actionUrl: `/posts/${postId}`
    });
  }

  async notifyFriendRequest(requesterId: string, targetUserId: string) {
    const requesterName = await this.getUserName(requesterId);
    return this.sendNotification(targetUserId, 'friend_request', {
      requester: requesterName
    }, {
      actionUrl: `/users/${requesterId}`
    });
  }

  async sendEventReminder(userId: string, eventName: string, timeUntil: string, eventId: string) {
    return this.sendNotification(userId, 'event_reminder', {
      event_name: eventName,
      time_until: timeUntil
    }, {
      priority: 'high',
      actionUrl: `/events/${eventId}`
    });
  }

  async sendSecurityAlert(userId: string) {
    return this.sendNotification(userId, 'security_alert', {}, {
      priority: 'urgent',
      channels: ['email', 'push']
    });
  }

  async sendWeeklyDigest(userId: string, stats: { events_count: number; new_posts: number; new_members: number }) {
    const preferences = await this.getUserPreferences(userId);
    if (preferences.frequency.digest === 'never') return '';

    return this.sendNotification(userId, 'weekly_digest', {
      events_count: stats.events_count.toString(),
      new_posts: stats.new_posts.toString(),
      new_members: stats.new_members.toString()
    });
  }

  private async getUserName(userId: string): Promise<string> {
    // This would fetch from user database
    return `User ${userId}`;
  }

  async getNotificationHistory(userId: string, limit = 50): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (!notification) return false;

    notification.status = 'read';
    notification.readAt = new Date();
    
    this.emit('notificationRead', notification);
    return true;
  }

  getSystemMetrics() {
    const notifications = Array.from(this.notifications.values());
    const last24h = notifications.filter(n => 
      n.createdAt.getTime() > Date.now() - 24 * 60 * 60 * 1000
    );

    return {
      totalNotifications: notifications.length,
      last24Hours: last24h.length,
      pending: notifications.filter(n => n.status === 'pending').length,
      sent: notifications.filter(n => n.status === 'sent').length,
      failed: notifications.filter(n => n.status === 'failed').length,
      queueSize: this.deliveryQueue.length,
      templates: this.templates.size,
      userPreferences: this.userPreferences.size
    };
  }
}

export const enhancedNotificationService = new EnhancedNotificationService();

// Export for Layer 57 (Automation Management) integration
export const setupNotificationAutomation = () => {
  // Send weekly digests every Sunday at 9 AM
  const sendWeeklyDigests = () => {
    const now = new Date();
    if (now.getDay() === 0 && now.getHours() === 9) { // Sunday 9 AM
      console.log('[ESA Layer 16] Sending weekly digests...');
      // This would iterate through users and send digests
    }
  };

  setInterval(sendWeeklyDigests, 60 * 60 * 1000); // Check every hour

  // Clean up old notifications every day
  setInterval(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let cleaned = 0;
    
    for (const [id, notification] of enhancedNotificationService['notifications'].entries()) {
      if (notification.createdAt < sevenDaysAgo && notification.status === 'read') {
        enhancedNotificationService['notifications'].delete(id);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`[ESA Layer 16] Cleaned up ${cleaned} old notifications`);
    }
  }, 24 * 60 * 60 * 1000);
};