/**
 * Stripe Webhook Handler
 * Processes Stripe events securely with signature verification
 * MB.MD MVP: Logs events, database writes added in later phase
 */

import { Router, raw } from 'express';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2024-12-18.acacia' 
});
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

    console.log(`✅ [Stripe Webhook] Verified event: ${event.type}`);

    try {
      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
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
// EVENT HANDLERS (MVP: Logging only)
// TODO: Add database writes in Phase 2
// ===========================

function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`💳 [Stripe] Checkout session completed: ${session.id}`);
  console.log(`   Customer: ${session.customer_email}`);
  console.log(`   Amount: $${(session.amount_total || 0) / 100}`);
  console.log(`   Metadata:`, session.metadata);
  
  // TODO Phase 2: Save payment to database
  // const userId = session.metadata?.userId;
  // await db.insert(payments).values({...});
}

function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log(`📅 [Stripe] Subscription updated: ${subscription.id}`);
  console.log(`   Customer: ${subscription.customer}`);
  console.log(`   Status: ${subscription.status}`);
  console.log(`   Metadata:`, subscription.metadata);
  
  // TODO Phase 2: Save subscription to database
  // const userId = subscription.metadata?.userId;
  // await db.update(subscriptions).set({...});
}

function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`🗑️ [Stripe] Subscription deleted: ${subscription.id}`);
  console.log(`   Customer: ${subscription.customer}`);
  console.log(`   Metadata:`, subscription.metadata);
  
  // TODO Phase 2: Mark subscription as canceled in database
}

function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`✅ [Stripe] Invoice payment succeeded: ${invoice.id}`);
  console.log(`   Amount: $${(invoice.amount_paid || 0) / 100}`);
  console.log(`   Customer: ${invoice.customer}`);
  
  // TODO Phase 2: Update subscription status to active
}

function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`❌ [Stripe] Invoice payment failed: ${invoice.id}`);
  console.log(`   Amount: $${(invoice.amount_due || 0) / 100}`);
  console.log(`   Customer: ${invoice.customer}`);
  
  // TODO Phase 2: Update subscription status to past_due
  // TODO Phase 2: Send email notification to user
}

export default router;
