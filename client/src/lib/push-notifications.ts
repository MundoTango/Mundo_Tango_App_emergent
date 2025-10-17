/**
 * ESA LIFE CEO 61x21 - Push Notifications System (Phase 16)
 * Web Push Notifications implementation
 */

import { pwaManager } from './pwa-utils';

// VAPID public key (this should be generated server-side and stored securely)
const VAPID_PUBLIC_KEY = 'BNbxGYNMhEAi9QRh5XYVtALXZNfJuIbY5LZnSvRkc5foF0eyCnOcbCE3Ps6hEp8tUslXOyNJ0XLkfRJ8DcvXhA4';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  data?: any;
  silent?: boolean;
  vibrate?: number[];
}

export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private subscription: PushSubscription | null = null;
  private isSubscribed = false;

  private constructor() {
    this.init();
  }

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  private async init() {
    if (!this.isSupported()) {
      console.log('Push notifications not supported');
      return;
    }

    // Check existing subscription
    await this.checkSubscription();

    // Setup message listeners
    this.setupMessageListeners();
  }

  isSupported(): boolean {
    return 'Notification' in window && 'PushManager' in window && 'serviceWorker' in navigator;
  }

  private async checkSubscription() {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        this.subscription = subscription;
        this.isSubscribed = true;
        console.log('Existing push subscription found');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }

  private setupMessageListeners() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'NOTIFICATION_CLICKED') {
        this.handleNotificationClick(event.data);
      }
    });
  }

  private handleNotificationClick(data: any) {
    console.log('Notification clicked:', data);
    
    // Navigate based on notification type
    if (data.action === 'view_message') {
      window.location.href = '/messages';
    } else if (data.action === 'view_event') {
      window.location.href = `/events/${data.eventId}`;
    } else if (data.action === 'view_profile') {
      window.location.href = '/profile';
    }
    
    // Track click
    this.trackEvent('notification_clicked', data);
  }

  async subscribe(): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Push notifications not supported');
    }

    // Request notification permission
    const permission = await pwaManager.requestNotificationPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      this.subscription = subscription;
      this.isSubscribed = true;

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      console.log('Push subscription successful');
      this.trackEvent('push_subscribed');
      
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      console.log('No subscription to unsubscribe from');
      return false;
    }

    try {
      await this.subscription.unsubscribe();
      
      // Remove subscription from server
      await this.removeSubscriptionFromServer(this.subscription);
      
      this.subscription = null;
      this.isSubscribed = false;
      
      console.log('Push unsubscription successful');
      this.trackEvent('push_unsubscribed');
      
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
      }
    };

    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(subscriptionData)
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      throw error;
    }
  }

  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          endpoint: subscription.endpoint
        })
      });
    } catch (error) {
      console.error('Error removing subscription from server:', error);
    }
  }

  // Show local notification (for testing or immediate notifications)
  async showNotification(options: NotificationOptions): Promise<void> {
    if (!this.isSupported()) {
      console.log('Notifications not supported');
      return;
    }

    const permission = await pwaManager.requestNotificationPermission();
    if (permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    
    const notificationOptions: NotificationOptions = {
      icon: options.icon || '/icons/icon-192.png',
      badge: options.badge || '/icons/icon-96.png',
      vibrate: options.vibrate || [100, 50, 100],
      tag: options.tag || 'mundo-tango',
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      data: {
        ...options.data,
        timestamp: Date.now()
      },
      ...options
    };

    await registration.showNotification(options.title, notificationOptions);
    this.trackEvent('notification_shown', { title: options.title });
  }

  // Update badge count
  async updateBadge(count: number): Promise<void> {
    await pwaManager.setBadge(count);
  }

  async clearBadge(): Promise<void> {
    await pwaManager.clearBadge();
  }

  // Get subscription status
  getStatus() {
    return {
      isSupported: this.isSupported(),
      isSubscribed: this.isSubscribed,
      subscription: this.subscription
    };
  }

  // Notification preferences
  async updatePreferences(preferences: {
    messages?: boolean;
    events?: boolean;
    lifeceo?: boolean;
    community?: boolean;
  }): Promise<void> {
    try {
      await fetch('/api/push/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(preferences)
      });
      
      this.trackEvent('notification_preferences_updated', preferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // Utility functions
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return window.btoa(binary);
  }

  private trackEvent(event: string, data?: any) {
    if (typeof window.plausible !== 'undefined') {
      window.plausible('Push', { props: { event, ...data } });
    }
    console.log(`[Push Event] ${event}`, data);
  }
}

// Export singleton instance
export const pushNotifications = PushNotificationManager.getInstance();

// Example notification templates
export const notificationTemplates = {
  newMessage: (from: string, preview: string): NotificationOptions => ({
    title: `New message from ${from}`,
    body: preview,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: 'message',
    actions: [
      { action: 'view_message', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: { type: 'message' }
  }),

  eventReminder: (eventName: string, time: string): NotificationOptions => ({
    title: 'Event Reminder',
    body: `${eventName} starts at ${time}`,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: 'event',
    requireInteraction: true,
    actions: [
      { action: 'view_event', title: 'View Event' },
      { action: 'snooze', title: 'Snooze' }
    ],
    data: { type: 'event' }
  }),

  lifeCEOAlert: (message: string): NotificationOptions => ({
    title: 'Life CEO Assistant',
    body: message,
    icon: '/life-ceo-icon-192.png',
    badge: '/icons/icon-96.png',
    tag: 'lifeceo',
    data: { type: 'lifeceo' }
  }),

  communityUpdate: (community: string, update: string): NotificationOptions => ({
    title: `${community} Community`,
    body: update,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: 'community',
    data: { type: 'community', community }
  })
};