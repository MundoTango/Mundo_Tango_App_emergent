/**
 * Stripe Webhook Handler
 * Processes Stripe events securely with signature verification
 */

import { Router, raw } from 'express';
import Stripe from 'stripe';
import { db } from '../db.js';
import { users, subscriptions, payments } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * POST /api/stripe/webhook
 * Stripe webhook endpoint - Must use raw body parser!
 */
router.post(
  '/webhook',
  raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;

    if (!sig) {
      console.error('[Stripe Webhook] Missing signature header');
      return res.status(400).send('Missing signature');
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err: any) {
      console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    try {
      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error(`[Stripe Webhook] Error processing event: ${error.message}`);
      res.status(500).send('Webhook handler failed');
    }
  }
);

// ===========================
// EVENT HANDLERS
// ===========================

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Stripe] Checkout session completed: ${session.id}`);

  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('[Stripe] No userId in session metadata');
    return;
  }

  // Create payment record
  await db.insert(payments).values({
    userId: parseInt(userId),
    stripePaymentId: session.payment_intent as string,
    amount: session.amount_total! / 100, // Convert cents to dollars
    currency: session.currency!,
    status: 'succeeded',
    metadata: {
      sessionId: session.id,
      customerEmail: session.customer_email,
    },
  });

  console.log(`[Stripe] Payment recorded for user ${userId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log(`[Stripe] Subscription updated: ${subscription.id}`);

  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error('[Stripe] No userId in subscription metadata');
    return;
  }

  // Upsert subscription
  const existingSub = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, parseInt(userId)))
    .limit(1);

  const subscriptionData = {
    userId: parseInt(userId),
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    stripePriceId: subscription.items.data[0]?.price.id,
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };

  if (existingSub.length > 0) {
    await db
      .update(subscriptions)
      .set(subscriptionData)
      .where(eq(subscriptions.userId, parseInt(userId)));
  } else {
    await db.insert(subscriptions).values(subscriptionData);
  }

  console.log(`[Stripe] Subscription updated for user ${userId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`[Stripe] Subscription deleted: ${subscription.id}`);

  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await db
    .update(subscriptions)
    .set({ status: 'canceled' })
    .where(eq(subscriptions.userId, parseInt(userId)));

  console.log(`[Stripe] Subscription marked as canceled for user ${userId}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`[Stripe] Invoice payment succeeded: ${invoice.id}`);

  const subscription = invoice.subscription as string;
  if (!subscription) return;

  // Update subscription payment status
  await db
    .update(subscriptions)
    .set({ status: 'active' })
    .where(eq(subscriptions.stripeSubscriptionId, subscription));
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[Stripe] Invoice payment failed: ${invoice.id}`);

  const subscription = invoice.subscription as string;
  if (!subscription) return;

  // Update subscription payment status
  await db
    .update(subscriptions)
    .set({ status: 'past_due' })
    .where(eq(subscriptions.stripeSubscriptionId, subscription));

  // TODO: Send email notification to user
}

export default router;
