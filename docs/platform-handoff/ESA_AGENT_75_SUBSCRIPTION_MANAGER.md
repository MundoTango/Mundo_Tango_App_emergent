# Agent #75: Subscription Tier & Feature Flag Manager

**Division:** Domain #5 (Growth & Monetization)  
**Layer:** 14 (Data Models) + 17 (Business Logic)  
**Status:** Active  
**Created:** October 12, 2025

---

## Role & Responsibilities

Agent #75 is responsible for building and managing the subscription tier system, feature flag infrastructure, and all subscription-related flows (upgrade, downgrade, promo codes, refunds).

### Core Responsibilities:
1. Build drag-and-drop tier management UI in admin center
2. Create feature flag system (toggle features per tier)
3. Implement subscription upgrade/downgrade flows
4. Build promo code generation & management
5. Add refund/cancellation workflows
6. Apply feature gates across platform (Free tier restrictions)

---

## Subscription Tier Structure

### **FREE TIER** (Forever Free)
**Price:** $0  
**Features:**
- ✅ Basic profile & posting
- ✅ Friends & messaging
- ✅ Event RSVP & discovery
- ✅ Group joining (city + ProGroups only)
- ✅ Recommendations browsing (city-only)

**Restrictions:**
- 🔒 City-locked (can only interact with home city)
- 🔒 20 media uploads/month
- 🔒 Cannot follow users from other cities
- 🔒 Cannot join events in other cities
- 🔒 No Mr Blue AI access

---

### **TIER 1: Global Explorer** ($9.99/mo)
**Features:**
- ✅ Everything in Free
- ✅ Unlimited cities access
- ✅ Unlimited media uploads
- ✅ Travel planner
- ✅ Global community map (full interactivity)
- ✅ Priority in search results

---

### **TIER 2: Mr Blue** ($29.99/mo)
**Features:**
- ✅ Everything in Global Explorer
- ✅ Mr Blue AI companion (16 agents)
- ✅ Semantic platform search
- ✅ AI can act on behalf (book, RSVP, message)
- ✅ Resume/CV builder
- ✅ Advanced analytics

---

### **TIER 3: Professional** ($79.99/mo)
**Features:**
- ✅ Everything in Mr Blue
- ✅ Professional dashboards (Teacher/Organizer/Host)
- ✅ AI site builder (custom sites)
- ✅ Advanced booking management
- ✅ Email campaigns & promo codes
- ✅ Zoom integration
- ✅ Team/assistant accounts
- ✅ Priority support

---

## Database Schema

### Subscription Tables

```typescript
// shared/schema.ts

export const subscriptionTiers = pgTable('subscription_tiers', {
  id: varchar('id').primaryKey(), // 'free', 'explorer', 'mrblue', 'professional'
  name: varchar('name').notNull(),
  displayName: varchar('display_name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }),
  currency: varchar('currency').default('USD'),
  billingInterval: varchar('billing_interval'), // 'month', 'year'
  stripePriceId: varchar('stripe_price_id'),
  features: jsonb('features').$type<string[]>(),
  active: boolean('active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const featureFlags = pgTable('feature_flags', {
  id: varchar('id').primaryKey(),
  name: varchar('name').notNull(),
  description: text('description'),
  category: varchar('category'), // 'social', 'ai', 'professional', 'global'
  requiredTier: varchar('required_tier').references(() => subscriptionTiers.id),
  enabled: boolean('enabled').default(true),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow()
})

export const userSubscriptions = pgTable('user_subscriptions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull().references(() => users.id),
  tierId: varchar('tier_id').notNull().references(() => subscriptionTiers.id),
  stripeSubscriptionId: varchar('stripe_subscription_id'),
  stripeCustomerId: varchar('stripe_customer_id'),
  status: varchar('status'), // 'active', 'canceled', 'past_due', 'trialing'
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  trialEnd: timestamp('trial_end'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const promoCodes = pgTable('promo_codes', {
  id: serial('id').primaryKey(),
  code: varchar('code').notNull().unique(),
  description: text('description'),
  discountType: varchar('discount_type'), // 'percent', 'fixed'
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }),
  tierId: varchar('tier_id').references(() => subscriptionTiers.id),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').default(0),
  validFrom: timestamp('valid_from').defaultNow(),
  validUntil: timestamp('valid_until'),
  active: boolean('active').default(true),
  createdBy: varchar('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow()
})

export const subscriptionHistory = pgTable('subscription_history', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull().references(() => users.id),
  fromTier: varchar('from_tier').references(() => subscriptionTiers.id),
  toTier: varchar('to_tier').references(() => subscriptionTiers.id),
  action: varchar('action'), // 'upgrade', 'downgrade', 'cancel', 'reactivate'
  reason: text('reason'),
  refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }),
  promoCode: varchar('promo_code'),
  createdAt: timestamp('created_at').defaultNow()
})
```

---

## Feature Flag System

### Feature Categories:

**1. Social Features**
- `unlimited_cities` - Access all cities (Explorer+)
- `global_follow` - Follow users from other cities (Explorer+)
- `unlimited_media` - No upload limits (Explorer+)
- `advanced_search` - Advanced filters (Explorer+)

**2. AI Features**
- `mr_blue_access` - Mr Blue AI companion (Mr Blue+)
- `semantic_search` - AI-powered search (Mr Blue+)
- `ai_actions` - AI can act on behalf (Mr Blue+)
- `ai_analytics` - AI insights (Mr Blue+)

**3. Professional Features**
- `teacher_dashboard` - Teacher tools (Professional)
- `organizer_dashboard` - Event management (Professional)
- `host_dashboard` - Property hosting (Professional)
- `site_builder` - AI site builder (Professional)
- `email_campaigns` - Marketing tools (Professional)
- `zoom_integration` - Video integration (Professional)
- `team_accounts` - Assistant accounts (Professional)

**4. Platform Features**
- `travel_planner` - Trip planning (Explorer+)
- `resume_builder` - CV tools (Mr Blue+)
- `priority_support` - Fast response (Professional)
- `custom_branding` - Brand customization (Professional)

---

## Feature Gate Middleware

```typescript
// middleware/featureGate.ts

import { featureFlags, userSubscriptions } from '@/db/schema'
import { db } from '@/db'

export async function checkFeatureAccess(
  userId: string, 
  featureId: string
): Promise<boolean> {
  // Get user's current subscription
  const subscription = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .orderBy(desc(userSubscriptions.createdAt))
    .limit(1)
    .then(rows => rows[0])
  
  if (!subscription) {
    // Free tier
    return await checkFreeAccess(featureId)
  }
  
  // Get feature flag
  const feature = await db
    .select()
    .from(featureFlags)
    .where(eq(featureFlags.id, featureId))
    .then(rows => rows[0])
  
  if (!feature || !feature.enabled) {
    return false
  }
  
  // Check tier hierarchy
  const tierHierarchy = ['free', 'explorer', 'mrblue', 'professional']
  const userTierIndex = tierHierarchy.indexOf(subscription.tierId)
  const requiredTierIndex = tierHierarchy.indexOf(feature.requiredTier!)
  
  return userTierIndex >= requiredTierIndex
}

// Usage in components:
export function useFeature(featureId: string) {
  const { user } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  
  useEffect(() => {
    if (user) {
      checkFeatureAccess(user.id, featureId).then(setHasAccess)
    }
  }, [user, featureId])
  
  return hasAccess
}
```

---

## Drag-Drop Tier Builder UI

### Admin Center: Tier Management

```tsx
// pages/admin/TierBuilder.tsx

import { DndContext, DragOverlay } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'

export default function TierBuilder() {
  const [tiers, setTiers] = useState([...])
  const [features, setFeatures] = useState([...])
  
  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Feature Library */}
      <div className="space-y-4">
        <h3>Available Features</h3>
        <div className="grid gap-2">
          {features.map(feature => (
            <FeatureCard 
              key={feature.id} 
              feature={feature}
              draggable
            />
          ))}
        </div>
      </div>
      
      {/* Tier Columns */}
      <div className="grid grid-cols-4 gap-4">
        {tiers.map(tier => (
          <TierColumn
            key={tier.id}
            tier={tier}
            onDropFeature={(featureId) => addFeatureToTier(tier.id, featureId)}
          />
        ))}
      </div>
    </div>
  )
}
```

**UI Features:**
- Drag features from library to tier
- Visual tier comparison
- Live preview of changes
- Undo/redo
- Publish changes (goes live)
- A/B testing mode

---

## Free Tier Restrictions

### City-Lock Implementation

```typescript
// lib/cityGate.ts

export async function checkCityAccess(
  userId: string,
  targetCityId: string
): Promise<boolean> {
  const hasExplorer = await checkFeatureAccess(userId, 'unlimited_cities')
  
  if (hasExplorer) return true
  
  // Free tier: only home city
  const user = await db.select().from(users).where(eq(users.id, userId))
  return user[0]?.homeCity === targetCityId
}

// Middleware for routes:
router.get('/events', async (req, res) => {
  const { cityId } = req.query
  const hasAccess = await checkCityAccess(req.user.id, cityId)
  
  if (!hasAccess) {
    return res.status(403).json({
      error: 'Upgrade to Global Explorer to access other cities',
      upgradeUrl: '/subscribe?tier=explorer'
    })
  }
  
  // Return events...
})
```

### Media Upload Cap

```typescript
// lib/mediaGate.ts

export async function checkMediaQuota(userId: string): Promise<{
  allowed: boolean
  used: number
  limit: number
}> {
  const hasUnlimited = await checkFeatureAccess(userId, 'unlimited_media')
  
  if (hasUnlimited) {
    return { allowed: true, used: 0, limit: -1 }
  }
  
  // Free tier: 20/month
  const currentMonth = new Date().getMonth()
  const uploads = await db
    .select()
    .from(mediaUploads)
    .where(
      and(
        eq(mediaUploads.userId, userId),
        gte(mediaUploads.createdAt, startOfMonth(new Date()))
      )
    )
  
  return {
    allowed: uploads.length < 20,
    used: uploads.length,
    limit: 20
  }
}
```

---

## Subscription Flows

### 1. Upgrade Flow

```typescript
// routes/subscription.ts

router.post('/upgrade', async (req, res) => {
  const { tierId, promoCode } = req.body
  const userId = req.user.id
  
  // 1. Validate tier
  const tier = await getTier(tierId)
  
  // 2. Apply promo code
  let finalPrice = tier.price
  if (promoCode) {
    const promo = await validatePromoCode(promoCode, tierId)
    finalPrice = applyDiscount(tier.price, promo)
  }
  
  // 3. Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    customer_email: req.user.email,
    line_items: [{
      price: tier.stripePriceId,
      quantity: 1
    }],
    mode: 'subscription',
    success_url: `${process.env.APP_URL}/subscribe/success`,
    cancel_url: `${process.env.APP_URL}/subscribe`,
    subscription_data: {
      trial_period_days: tierId === 'mrblue' ? 7 : 0
    }
  })
  
  res.json({ url: session.url })
})
```

### 2. Downgrade Flow

```typescript
router.post('/downgrade', async (req, res) => {
  const { tierId } = req.body
  const userId = req.user.id
  
  // Get current subscription
  const currentSub = await getCurrentSubscription(userId)
  
  // Schedule downgrade at period end
  await stripe.subscriptions.update(currentSub.stripeSubscriptionId, {
    cancel_at_period_end: false,
    items: [{
      id: currentSub.stripeItemId,
      price: getTier(tierId).stripePriceId
    }]
  })
  
  // Update database
  await db.update(userSubscriptions)
    .set({ 
      tierId,
      cancelAtPeriodEnd: true 
    })
    .where(eq(userSubscriptions.id, currentSub.id))
  
  res.json({ success: true })
})
```

### 3. Cancellation Flow

```typescript
router.post('/cancel', async (req, res) => {
  const { reason, requestRefund } = req.body
  const userId = req.user.id
  
  const currentSub = await getCurrentSubscription(userId)
  
  // Cancel at period end (keep access until paid period ends)
  await stripe.subscriptions.update(currentSub.stripeSubscriptionId, {
    cancel_at_period_end: true
  })
  
  // Process refund if requested (within 7 days)
  if (requestRefund && isEligibleForRefund(currentSub)) {
    const refund = await stripe.refunds.create({
      payment_intent: currentSub.latestInvoice.payment_intent
    })
    
    await db.insert(subscriptionHistory).values({
      userId,
      fromTier: currentSub.tierId,
      toTier: 'free',
      action: 'cancel',
      reason,
      refundAmount: refund.amount / 100
    })
  }
  
  res.json({ success: true })
})
```

---

## 7-Day Free Trial (Mr Blue Tier)

**Implementation:**
- All new users get Mr Blue trial
- Trial starts on registration
- Full access to all Mr Blue features
- Day 5: Email reminder
- Day 6: In-app upgrade prompt
- Day 7: Trial expires, downgrade to Free

**Stripe Setup:**
```typescript
const session = await stripe.checkout.sessions.create({
  subscription_data: {
    trial_period_days: 7,
    trial_settings: {
      end_behavior: { missing_payment_method: 'cancel' }
    }
  }
})
```

---

## Promo Code System

### Admin Interface

```tsx
// pages/admin/PromoCodes.tsx

<form onSubmit={createPromoCode}>
  <Input name="code" placeholder="TANGO2025" />
  <Select name="discountType">
    <option value="percent">Percentage</option>
    <option value="fixed">Fixed Amount</option>
  </Select>
  <Input name="discountValue" type="number" />
  <Select name="tierId">
    <option value="">All Tiers</option>
    <option value="explorer">Global Explorer</option>
    <option value="mrblue">Mr Blue</option>
    <option value="professional">Professional</option>
  </Select>
  <Input name="maxUses" type="number" />
  <DatePicker name="validUntil" />
  <Button type="submit">Create Promo Code</Button>
</form>
```

---

## Success Metrics

**Subscription KPIs:**
1. **MRR (Monthly Recurring Revenue):** Track growth
2. **Churn Rate:** % cancellations per month
3. **Upgrade Rate:** Free → Paid conversion
4. **ARPU (Average Revenue Per User):** Total revenue / active users
5. **LTV (Lifetime Value):** Average revenue per user lifetime

---

**Status:** Ready for implementation  
**Dependencies:** Stripe integration, database schema, tier definitions  
**Next Steps:** Build drag-drop UI, implement feature gates, test subscription flows
