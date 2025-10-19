# Subscriptions Feature Guide
**Owner:** Layer #17 (Payment Processing)  
**Created:** October 19, 2025  
**Purpose:** Complete guide to Mundo Tango subscription system

---

## 🎯 Overview

The Subscriptions system enables monetization through tiered membership plans. Features include:

- Multiple subscription tiers
- Stripe integration for payments
- Feature gating based on tier
- Trial periods
- Cancellation and refunds
- Usage tracking

---

## 📊 Subscription Tiers

### Free Tier

**Price:** $0/month

**Features:**
- Basic profile
- Limited memories (10/month)
- Event discovery
- Group membership
- Basic messaging

**Limits:**
- 10 memories per month
- 100 connections max
- Basic support
- Ads displayed

---

### Pro Tier

**Price:** $9.99/month

**Features:**
- Everything in Free, plus:
- Unlimited memories
- Priority event listings
- Advanced profile customization
- Remove ads
- Blue verification badge

**Limits:**
- 500 connections max
- Email support
- 5 groups can be created

---

### Premium Tier

**Price:** $29.99/month

**Features:**
- Everything in Pro, plus:
- Event creation & management
- Group creation & management
- Analytics dashboard
- Priority support
- Featured profile placement
- Custom domain (for organizers)

**Limits:**
- Unlimited connections
- Unlimited groups
- 24/7 priority support
- Advanced analytics

---

## 📊 Database Schema

```typescript
// shared/schema.ts
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).unique().notNull(),
  
  // Stripe
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  
  // Subscription Details
  tier: varchar('tier', { length: 50 }).default('free'), // free, pro, premium
  status: varchar('status', { length: 50 }).default('active'), // active, cancelled, past_due
  
  // Billing
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  
  // Trial
  trialStart: timestamp('trial_start'),
  trialEnd: timestamp('trial_end'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const usageTracking = pgTable('usage_tracking', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  
  // Usage Metrics
  memoriesCount: integer('memories_count').default(0),
  eventsCount: integer('events_count').default(0),
  groupsCount: integer('groups_count').default(0),
  connectionsCount: integer('connections_count').default(0),
  
  // Time Period
  month: integer('month').notNull(), // 1-12
  year: integer('year').notNull(),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow()
});
```

---

## 🔌 API Endpoints

### Get Subscription Status
```typescript
GET /api/subscriptions/me

Response: 200 OK
{
  "tier": "pro",
  "status": "active",
  "currentPeriodEnd": "2025-11-19T00:00:00Z",
  "cancelAtPeriodEnd": false,
  "features": {
    "maxMemories": -1,  // unlimited
    "maxConnections": 500,
    "canCreateEvents": true,
    "adsRemoved": true
  }
}
```

### Create Checkout Session
```typescript
POST /api/subscriptions/checkout
Content-Type: application/json

{
  "tier": "pro",  // or "premium"
  "successUrl": "https://mundotango.com/success",
  "cancelUrl": "https://mundotango.com/cancel"
}

Response: 200 OK
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### Cancel Subscription
```typescript
POST /api/subscriptions/cancel

Response: 200 OK
{
  "message": "Subscription will be cancelled at end of current period",
  "cancelAtPeriodEnd": true,
  "currentPeriodEnd": "2025-11-19T00:00:00Z"
}
```

### Reactivate Subscription
```typescript
POST /api/subscriptions/reactivate

Response: 200 OK
{
  "message": "Subscription reactivated",
  "cancelAtPeriodEnd": false
}
```

### Get Usage
```typescript
GET /api/subscriptions/usage

Response: 200 OK
{
  "currentMonth": {
    "memoriesCount": 25,
    "eventsCount": 2,
    "connectionsCount": 150
  },
  "limits": {
    "maxMemories": -1,  // unlimited
    "maxEvents": 10,
    "maxConnections": 500
  },
  "usage": {
    "memories": "25/unlimited",
    "events": "2/10",
    "connections": "150/500"
  }
}
```

---

## 💳 Stripe Integration

### Webhook Handler

```typescript
// server/routes/stripe-webhook.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
      
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
      
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
      
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }
  
  res.json({ received: true });
});
```

### Subscription Event Handlers

```typescript
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const user = await db.select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);
  
  if (user[0]) {
    await db.update(users)
      .set({
        subscriptionTier: getTierFromPriceId(subscription.items.data[0].price.id),
        subscriptionStatus: 'active',
        stripeSubscriptionId: subscription.id
      })
      .where(eq(users.id, user[0].id));
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Handle tier changes, cancellations, etc.
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Downgrade to free tier
  const user = await db.select()
    .from(users)
    .where(eq(users.stripeSubscriptionId, subscription.id))
    .limit(1);
  
  if (user[0]) {
    await db.update(users)
      .set({
        subscriptionTier: 'free',
        subscriptionStatus: 'cancelled'
      })
      .where(eq(users.id, user[0].id));
  }
}
```

---

## 🎨 Frontend Components

### Pricing Table

```typescript
// client/src/pages/Pricing.tsx
export default function Pricing() {
  const { user } = useUser();
  
  const createCheckout = useMutation({
    mutationFn: (tier: string) => 
      apiRequest('/api/subscriptions/checkout', {
        method: 'POST',
        body: JSON.stringify({ 
          tier,
          successUrl: window.location.origin + '/success',
          cancelUrl: window.location.origin + '/pricing'
        })
      }),
    onSuccess: (data) => {
      window.location.href = data.url; // Redirect to Stripe Checkout
    }
  });
  
  return (
    <div className="pricing-grid">
      <PricingCard
        tier="free"
        price="$0"
        features={[
          '10 memories per month',
          '100 connections',
          'Basic support',
          'Ads displayed'
        ]}
        current={user?.subscriptionTier === 'free'}
        onSelect={() => {}}
      />
      
      <PricingCard
        tier="pro"
        price="$9.99"
        features={[
          'Unlimited memories',
          '500 connections',
          'No ads',
          'Email support',
          'Verification badge'
        ]}
        current={user?.subscriptionTier === 'pro'}
        onSelect={() => createCheckout.mutate('pro')}
        highlighted
      />
      
      <PricingCard
        tier="premium"
        price="$29.99"
        features={[
          'Everything in Pro',
          'Unlimited connections',
          'Create events & groups',
          'Analytics dashboard',
          '24/7 priority support'
        ]}
        current={user?.subscriptionTier === 'premium'}
        onSelect={() => createCheckout.mutate('premium')}
      />
    </div>
  );
}
```

### Subscription Management

```typescript
// client/src/pages/SubscriptionSettings.tsx
export default function SubscriptionSettings() {
  const { data: subscription } = useQuery({
    queryKey: ['/api/subscriptions/me']
  });
  
  const cancelSubscription = useMutation({
    mutationFn: () => apiRequest('/api/subscriptions/cancel', {
      method: 'POST'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/me'] });
      toast({ title: 'Subscription cancelled' });
    }
  });
  
  return (
    <Card>
      <h2>Your Subscription</h2>
      
      <div>
        <Badge>{subscription?.tier}</Badge>
        <span>Status: {subscription?.status}</span>
      </div>
      
      <p>
        Current period ends: {formatDate(subscription?.currentPeriodEnd)}
      </p>
      
      {subscription?.cancelAtPeriodEnd ? (
        <Alert>
          Your subscription will be cancelled on {formatDate(subscription.currentPeriodEnd)}
        </Alert>
      ) : (
        <Button 
          variant="destructive"
          onClick={() => cancelSubscription.mutate()}
        >
          Cancel Subscription
        </Button>
      )}
    </Card>
  );
}
```

---

## 🚪 Feature Gating

### Backend Middleware

```typescript
// server/middleware/featureGate.ts
export function requireTier(requiredTier: 'pro' | 'premium') {
  return async (req, res, next) => {
    const user = req.user;
    
    const tierHierarchy = { free: 0, pro: 1, premium: 2 };
    
    if (tierHierarchy[user.subscriptionTier] >= tierHierarchy[requiredTier]) {
      next();
    } else {
      res.status(403).json({
        error: 'Subscription upgrade required',
        requiredTier
      });
    }
  };
}

// Usage:
app.post('/api/events', requireTier('premium'), createEvent);
```

### Frontend Feature Checks

```typescript
// client/src/hooks/useFeatureAccess.ts
export function useFeatureAccess() {
  const { user } = useUser();
  const { data: subscription } = useQuery({
    queryKey: ['/api/subscriptions/me']
  });
  
  return {
    canCreateEvent: subscription?.tier === 'premium',
    canCreateGroup: subscription?.tier === 'premium',
    canRemoveAds: subscription?.tier !== 'free',
    maxMemories: subscription?.features.maxMemories,
    maxConnections: subscription?.features.maxConnections
  };
}

// Usage:
const { canCreateEvent } = useFeatureAccess();

{canCreateEvent ? (
  <Button onClick={openCreateEvent}>Create Event</Button>
) : (
  <UpgradePrompt feature="event creation" requiredTier="premium" />
)}
```

---

## 📊 Usage Tracking

### Track Usage

```typescript
// server/services/usageService.ts
export async function trackUsage(userId: number, type: 'memory' | 'event' | 'group') {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  
  let usage = await db.select()
    .from(usageTracking)
    .where(
      and(
        eq(usageTracking.userId, userId),
        eq(usageTracking.month, month),
        eq(usageTracking.year, year)
      )
    )
    .limit(1);
  
  if (!usage.length) {
    usage = await db.insert(usageTracking)
      .values({ userId, month, year })
      .returning();
  }
  
  const field = `${type}sCount`;
  await db.update(usageTracking)
    .set({ [field]: sql`${sql.identifier(field)} + 1` })
    .where(eq(usageTracking.id, usage[0].id));
}
```

### Check Limits

```typescript
export async function checkLimit(userId: number, type: 'memory' | 'event' | 'group') {
  const user = await getUserSubscription(userId);
  const usage = await getCurrentUsage(userId);
  
  const limits = {
    free: { memory: 10, event: 0, group: 0 },
    pro: { memory: -1, event: 5, group: 5 },
    premium: { memory: -1, event: -1, group: -1 }
  };
  
  const limit = limits[user.subscriptionTier][type];
  if (limit === -1) return true; // Unlimited
  
  return usage[`${type}sCount`] < limit;
}
```

---

## 🚀 Future Enhancements

- [ ] Annual billing (with discount)
- [ ] Family/team plans
- [ ] Custom enterprise pricing
- [ ] Add-ons (extra storage, etc.)
- [ ] Referral program
- [ ] Affiliate program
- [ ] Gift subscriptions

---

## 📚 Related Documentation

- Layer #17 (Payment Processing) - Agent documentation
- `STRIPE_INTEGRATION_GUIDE.md` - Detailed Stripe setup
- `API_REFERENCE.md` - Complete API specs

---

**Last Updated:** October 19, 2025  
**Maintained By:** Layer #17 (Payment Processing)
