/**
 * SUBSCRIPTION ROUTES - Stripe Integration API
 * MB.MD Build: Real Stripe checkout and subscription management
 * Completeness Law: Actual Stripe API calls, not mock data
 */

import { Router } from 'express';
import Stripe from 'stripe';
import { isAuthenticated } from '../replitAuth';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq, sql } from 'drizzle-orm';

const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil'
});

// POST /api/subscriptions/create-checkout - Create Stripe checkout session
router.post('/create-checkout', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user!.id;
    const { tier } = req.body; // 'basic', 'enthusiast', 'professional', 'enterprise'

    // Get or create Stripe customer
    let user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: userId.toString()
        }
      });
      customerId = customer.id;

      // Save customer ID
      await db.update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, userId));
    }

    // Price IDs (replace with your actual Stripe price IDs)
    const priceIds: Record<string, string> = {
      basic: process.env.STRIPE_PRICE_BASIC || 'price_basic',
      enthusiast: process.env.STRIPE_PRICE_ENTHUSIAST || 'price_enthusiast',
      professional: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional',
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise'
    };

    const priceId = priceIds[tier] || priceIds.basic;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.REPLIT_DOMAINS || 'http://localhost:5000'}/settings?subscription=success`,
      cancel_url: `${process.env.REPLIT_DOMAINS || 'http://localhost:5000'}/settings?subscription=cancelled`,
      metadata: {
        userId: userId.toString(),
        tier
      }
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Checkout creation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create checkout session'
    });
  }
});

// POST /api/subscriptions/cancel - Cancel subscription
router.post('/cancel', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user!.id;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user?.stripeSubscriptionId) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    // Cancel at period end (don't cancel immediately)
    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      {
        cancel_at_period_end: true
      }
    );

    res.json({
      success: true,
      message: 'Subscription will cancel at period end',
      cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null
    });
  } catch (error) {
    console.error('Subscription cancel error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel subscription'
    });
  }
});

// GET /api/subscriptions/status - Get subscription status
router.get('/status', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user!.id;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.stripeSubscriptionId) {
      return res.json({
        success: true,
        status: 'none',
        tier: user.subscriptionTier || 'free'
      });
    }

    // Get subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId) as any;

    res.json({
      success: true,
      status: subscription.status,
      tier: user.subscriptionTier,
      currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get subscription status'
    });
  }
});

// GET /api/subscriptions/usage - Get usage metrics
router.get('/usage', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user!.id;

    // Get real usage from database
    const [postsCount, eventsCount] = await Promise.all([
      db.execute(sql`SELECT COUNT(*) as count FROM posts WHERE user_id = ${userId}`),
      db.execute(sql`SELECT COUNT(*) as count FROM events WHERE created_by = ${userId}`)
    ]);

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    // Calculate usage percentages based on tier limits
    const tierLimits: Record<string, { events: number; storage: number; aiCredits: number }> = {
      free: { events: 10, storage: 1024, aiCredits: 100 },
      basic: { events: 100, storage: 10240, aiCredits: 1000 },
      enthusiast: { events: 500, storage: 51200, aiCredits: 5000 },
      professional: { events: -1, storage: 102400, aiCredits: 10000 }, // -1 = unlimited
      enterprise: { events: -1, storage: 512000, aiCredits: 50000 }
    };

    const tier = user?.subscriptionTier || 'free';
    const limits = tierLimits[tier];

    res.json({
      success: true,
      usage: {
        events: {
          used: Number((eventsCount.rows[0] as any).count || 0),
          limit: limits.events,
          percentage: limits.events > 0 ? Math.round((Number((eventsCount.rows[0] as any).count || 0) / limits.events) * 100) : 0
        },
        storage: {
          used: 0, // TODO: Calculate from media uploads
          limit: limits.storage,
          percentage: 0
        },
        aiCredits: {
          used: 0, // TODO: Calculate from AI usage
          limit: limits.aiCredits,
          percentage: 0
        }
      }
    });
  } catch (error) {
    console.error('Usage fetch error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get usage data'
    });
  }
});

export default router;
