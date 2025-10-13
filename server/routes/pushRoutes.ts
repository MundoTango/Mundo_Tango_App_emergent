/**
 * MB.MD TRACK 3: Push Notification Routes
 * Web Push Notification System
 */

import { Router } from 'express';
import { storage } from '../storage';
import { setUserContext } from '../middleware/tenantMiddleware';
import { getUserId } from '../utils/authHelper';
import { z } from 'zod';

const router = Router();

const subscriptionSchema = z.object({
  endpoint: z.string(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

// Subscribe to push notifications
router.get('/push/subscribe', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get subscription details from query params or body
    const subscription = await storage.getPushSubscription(Number(userId));
    res.json({ success: true, subscription });
  } catch (error: any) {
    console.error('Error subscribing to push:', error);
    res.status(500).json({ error: 'Failed to subscribe to push notifications' });
  }
});

// Create push subscription
router.post('/push/subscribe', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validatedData = subscriptionSchema.parse(req.body);
    const subscription = await storage.createPushSubscription(Number(userId), validatedData);
    res.json({ success: true, subscription });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating push subscription:', error);
    res.status(500).json({ error: 'Failed to create push subscription' });
  }
});

// Unsubscribe from push notifications
router.get('/push/unsubscribe', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await storage.deletePushSubscription(Number(userId));
    res.json({ success: true, message: 'Unsubscribed from push notifications' });
  } catch (error: any) {
    console.error('Error unsubscribing from push:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from push notifications' });
  }
});

// Get push notification preferences
router.get('/push/preferences', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const preferences = await storage.getPushPreferences(Number(userId));
    res.json({ success: true, preferences });
  } catch (error: any) {
    console.error('Error getting push preferences:', error);
    res.status(500).json({ error: 'Failed to get push preferences' });
  }
});

// Update push notification preferences
router.post('/push/preferences', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const preferences = await storage.updatePushPreferences(Number(userId), req.body);
    res.json({ success: true, preferences });
  } catch (error: any) {
    console.error('Error updating push preferences:', error);
    res.status(500).json({ error: 'Failed to update push preferences' });
  }
});

// Send push notification (admin/system use)
router.post('/push/send', setUserContext, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { targetUserId, title, body, data } = req.body;
    await storage.sendPushNotification(targetUserId, { title, body, data });
    res.json({ success: true, message: 'Push notification sent' });
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    res.status(500).json({ error: 'Failed to send push notification' });
  }
});

export default router;
