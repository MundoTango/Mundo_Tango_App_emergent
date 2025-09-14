import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/secureAuth';
import { paymentService } from '../services/paymentService';
import { z } from 'zod';
import { db } from '../db';
import { users, subscriptions, payments, paymentMethods } from '../../shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

const router = Router();

// ESA LIFE CEO 61x21 - Phase 18: Payment & Subscriptions Routes

// Enhanced subscription tiers configuration
export const SUBSCRIPTION_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      'Basic access to platform',
      '3 AI agents per month',
      '1GB storage',
      'Community support',
      'Basic analytics'
    ],
    limits: {
      agents: 3,
      storage: 1024, // MB
      apiCalls: 100,
      projects: 5
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 999, // $9.99 in cents
    priceId: process.env.STRIPE_PRICE_ID_PRO || 'price_pro_placeholder',
    features: [
      'Everything in Free',
      'Unlimited AI agents',
      '10GB storage',
      'Priority support',
      'Advanced analytics',
      'Custom workflows',
      'API access'
    ],
    limits: {
      agents: -1, // Unlimited
      storage: 10240, // MB
      apiCalls: 10000,
      projects: 50
    }
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 2999, // $29.99 in cents
    priceId: process.env.STRIPE_PRICE_ID_BUSINESS || 'price_business_placeholder',
    features: [
      'Everything in Pro',
      'Team collaboration',
      '100GB storage',
      'Dedicated support',
      'Custom integrations',
      'Advanced security',
      'Audit logs',
      'White-label options'
    ],
    limits: {
      agents: -1, // Unlimited
      storage: 102400, // MB
      apiCalls: 100000,
      projects: -1, // Unlimited
      teamMembers: 10
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: -1, // Custom pricing
    priceId: null,
    features: [
      'Everything in Business',
      'Unlimited everything',
      'Custom AI models',
      'SLA guarantee',
      'Dedicated account manager',
      'On-premise deployment',
      'Custom features',
      'Priority feature requests'
    ],
    limits: {
      agents: -1,
      storage: -1,
      apiCalls: -1,
      projects: -1,
      teamMembers: -1
    }
  }
};

// Get subscription tiers with pricing
router.get('/api/payments/subscription-tiers', async (req: Request, res: Response) => {
  try {
    res.json({
      tiers: SUBSCRIPTION_TIERS,
      currency: 'USD',
      billingCycles: [
        { id: 'monthly', name: 'Monthly', discount: 0 },
        { id: 'annual', name: 'Annual', discount: 0.20 } // 20% discount
      ]
    });
  } catch (error) {
    console.error('Error fetching subscription tiers:', error);
    res.status(500).json({ error: 'Failed to fetch subscription tiers' });
  }
});

// Get user's current subscription
router.get('/api/payments/subscription', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    if (subscription.length === 0) {
      return res.json({
        tier: 'free',
        status: 'active',
        features: SUBSCRIPTION_TIERS.free.features,
        limits: SUBSCRIPTION_TIERS.free.limits
      });
    }

    const tierMetadata = subscription[0].metadata as any;
    const tier = tierMetadata?.tier || 'free';
    const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];

    res.json({
      subscription: subscription[0],
      tier,
      features: tierConfig.features,
      limits: tierConfig.limits
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Create checkout session for subscription
router.post('/api/payments/create-subscription', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    const { tier, billingCycle } = z.object({
      tier: z.enum(['pro', 'business']),
      billingCycle: z.enum(['monthly', 'annual']).default('monthly')
    }).parse(req.body);

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(400).json({ 
        error: 'Payment system not configured',
        message: 'Please configure Stripe API keys first'
      });
    }

    const subscription = await paymentService.createSubscription(userId, tier);
    const clientSecret = await paymentService.getSubscriptionClientSecret(subscription.providerSubscriptionId);

    res.json({
      subscriptionId: subscription.id,
      clientSecret,
      publicKey: process.env.VITE_STRIPE_PUBLIC_KEY
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message || 'Failed to create subscription' });
  }
});

// Cancel subscription
router.post('/api/payments/cancel-subscription', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    await paymentService.cancelSubscription(userId);
    res.json({ success: true, message: 'Subscription will be canceled at the end of the billing period' });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: error.message || 'Failed to cancel subscription' });
  }
});

// Resume canceled subscription
router.post('/api/payments/resume-subscription', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    await paymentService.resumeSubscription(userId);
    res.json({ success: true, message: 'Subscription resumed successfully' });
  } catch (error: any) {
    console.error('Error resuming subscription:', error);
    res.status(500).json({ error: error.message || 'Failed to resume subscription' });
  }
});

// Create payment intent for one-time payment
router.post('/api/payments/create-payment-intent', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    const { amount, currency, description } = z.object({
      amount: z.number().min(100), // Minimum $1.00
      currency: z.string().default('usd'),
      description: z.string().optional()
    }).parse(req.body);

    const { clientSecret } = await paymentService.createPaymentIntent(userId, amount, currency);

    res.json({
      clientSecret,
      publicKey: process.env.VITE_STRIPE_PUBLIC_KEY
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment' });
  }
});

// Get payment history
router.get('/api/payments/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    const paymentHistory = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt))
      .limit(50);

    res.json(paymentHistory);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Get payment methods
router.get('/api/payments/methods', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const methods = await paymentService.getUserPaymentMethods(userId);
    res.json(methods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

// Add payment method
router.post('/api/payments/add-method', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    const { paymentMethodId } = z.object({
      paymentMethodId: z.string()
    }).parse(req.body);

    const method = await paymentService.addPaymentMethod(userId, paymentMethodId);
    res.json(method);
  } catch (error: any) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ error: error.message || 'Failed to add payment method' });
  }
});

// Set default payment method
router.post('/api/payments/set-default-method', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    const { paymentMethodId } = z.object({
      paymentMethodId: z.string()
    }).parse(req.body);

    await paymentService.setDefaultPaymentMethod(userId, paymentMethodId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error setting default payment method:', error);
    res.status(500).json({ error: error.message || 'Failed to set default payment method' });
  }
});

// Check subscription features
router.get('/api/payments/check-feature', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const feature = req.query.feature as string;
    
    if (!feature) {
      return res.status(400).json({ error: 'Feature name required' });
    }

    const status = await paymentService.checkUserSubscriptionStatus(userId);
    const tierConfig = SUBSCRIPTION_TIERS[status.tier as keyof typeof SUBSCRIPTION_TIERS];
    
    // Check if feature is available in tier
    const hasFeature = tierConfig.features.some(f => 
      f.toLowerCase().includes(feature.toLowerCase())
    );

    res.json({
      hasAccess: hasFeature,
      tier: status.tier,
      requiresTier: hasFeature ? status.tier : 'pro' // Suggest upgrade tier
    });
  } catch (error) {
    console.error('Error checking feature:', error);
    res.status(500).json({ error: 'Failed to check feature access' });
  }
});

// Stripe webhook endpoint
router.post('/api/payments/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe signature' });
    }

    // Raw body is needed for webhook verification
    const rawBody = req.body;
    
    await paymentService.processWebhook(signature, rawBody);
    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get subscription analytics (admin only)
router.get('/api/payments/analytics', requireAuth, async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    const userId = (req as any).user?.id;
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user[0] || user[0].email !== 'admin@mundotango.life') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get subscription metrics
    const metrics = await db.execute(sql`
      SELECT 
        COUNT(DISTINCT user_id) as total_subscribers,
        COUNT(DISTINCT CASE WHEN status = 'active' THEN user_id END) as active_subscribers,
        COUNT(DISTINCT CASE WHEN status = 'canceled' THEN user_id END) as canceled_subscribers,
        AVG(CASE WHEN metadata->>'tier' = 'pro' THEN 9.99 
             WHEN metadata->>'tier' = 'business' THEN 29.99 
             ELSE 0 END) as avg_revenue_per_user
      FROM subscriptions
    `);

    // Get revenue by month
    const monthlyRevenue = await db.execute(sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(amount / 100.0) as revenue
      FROM payments
      WHERE status = 'succeeded'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);

    res.json({
      metrics: metrics.rows[0],
      monthlyRevenue: monthlyRevenue.rows,
      tiers: SUBSCRIPTION_TIERS
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Apply coupon code
router.post('/api/payments/apply-coupon', requireAuth, async (req: Request, res: Response) => {
  try {
    const { couponCode } = z.object({
      couponCode: z.string().min(1)
    }).parse(req.body);

    // Mock coupon validation for now
    const validCoupons = {
      'WELCOME20': { discount: 0.20, description: '20% off first month' },
      'ANNUAL15': { discount: 0.15, description: '15% off annual plans' },
      'TANGO50': { discount: 0.50, description: '50% off for tango community' }
    };

    const coupon = validCoupons[couponCode as keyof typeof validCoupons];
    
    if (!coupon) {
      return res.status(400).json({ error: 'Invalid coupon code' });
    }

    res.json({
      valid: true,
      discount: coupon.discount,
      description: coupon.description
    });
  } catch (error: any) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ error: error.message || 'Failed to apply coupon' });
  }
});

export default router;