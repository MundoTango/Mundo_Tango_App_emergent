# Journey Agent J3: Premium / Life CEO
## MB.MD Journey Agent Specification

**Agent ID:** J3  
**Journey Name:** Premium Subscription & Life CEO Features  
**User Role:** Premium Subscriber  
**Pages:** 15  
**Success Metric:** >15% free→premium conversion  
**Created:** October 19, 2025

---

## 🎯 Journey Overview

**Purpose:** Convert free users to premium, onboard to Life CEO AI agents, demonstrate ROI through personalized insights.

**User Flow:**
```
Upgrade Prompt (triggered in J2) 
  ↓
Pricing Page (/subscribe) 
  ↓
Stripe Checkout 
  ↓
Welcome to Premium (/life-ceo) 
  ↓
16 AI Agents Tour 
  ↓
Analytics Dashboard (/analytics) 
  ↓
→ Continue using platform with premium features
```

---

## 📋 Page-by-Page Breakdown

### Step 1: Pricing Page `/subscribe`
**Goal:** Show clear value proposition, convert to premium

**Pricing Tiers:**
```typescript
const PRICING_TIERS = [
  {
    name: 'Free',
    price: 0,
    features: ['Core social features', 'Event discovery', 'Community access']
  },
  {
    name: 'Premium',
    price: 9.99, // monthly
    features: ['All Free features', '16 AI Life CEO agents', 'Advanced analytics', 'Priority support', 'Ad-free']
  },
  {
    name: 'Premium Plus',
    price: 19.99,
    features: ['All Premium features', 'Unlimited AI coaching', 'Custom integrations', 'White-label options']
  }
];
```

**Onboarding Elements:**
- Feature comparison table
- "7-day free trial" badge
- Social proof: "{X} dancers upgraded this week"
- ROI calculator: "Save 5 hours/month = $XX value"
- Testimonials from premium users

**Tooltips:**
- "What is Life CEO?" → Explainer modal
- "Cancel anytime" → Refund policy

---

### Step 2: Stripe Checkout
**Goal:** Secure payment, minimal friction

**Integration:** `blueprint:javascript_stripe`

**Onboarding Elements:**
- "Secure checkout powered by Stripe" trust badge
- Payment options (card, Apple Pay, Google Pay)
- Auto-fill billing info
- "Your trial starts today, billing on {date+7}"

**Journey Logic:**
```typescript
onPaymentSuccess() {
  upgradeUserToPremium(userId);
  createJourneyProgress(userId, 'J3', 1);
  sendWelcomeEmail();
  redirect('/life-ceo');
}
```

---

### Step 3: Life CEO Dashboard `/life-ceo`
**Goal:** Showcase 16 AI agents, encourage first interaction

**Onboarding Flow:** "Meet Your AI Team"
```typescript
{
  steps: [
    { title: "Welcome to Life CEO!", subtitle: "16 AI agents to manage your life" },
    { title: "Pick an Agent", tooltip: "Click any agent to start a conversation" },
    { title: "Ask Anything", tooltip: "Health, finance, career, relationships - we've got you covered" },
    { title: "First Session!", celebration: true }
  ]
}
```

**16 AI Agents Display:**
```typescript
<AgentGrid>
  <AgentCard agent="Health & Wellness" icon="🏃" status="ready" />
  <AgentCard agent="Financial Coach" icon="💰" status="ready" />
  <AgentCard agent="Career Advisor" icon="💼" status="ready" />
  <AgentCard agent="Relationship Coach" icon="❤️" status="ready" />
  // ... 12 more agents
</AgentGrid>
```

**First Interaction:**
- "Try asking: 'Help me create a workout plan'"
- "Or: 'Review my monthly budget'"
- Show example conversations

---

### Step 4-18: AI Agent Pages (15 pages)
**Structure:** Each agent has dedicated page

**Example:** `/life-ceo/health`
- AI chat interface (streaming with Claude)
- Conversation history
- Saved insights
- Export conversation
- Schedule recurring sessions

**Onboarding per Agent:**
- Quick intro: "I'm your Health & Wellness coach. I can help with..."
- Suggested prompts: "Create workout plan", "Track nutrition", "Sleep analysis"
- First message: "What's your #1 health goal?"

---

### Step 19: Analytics Dashboard `/analytics`
**Goal:** Demonstrate value through personalized insights

**Onboarding Flow:** "Your Personal Insights"
```typescript
{
  steps: [
    { title: "Platform Activity", tooltip: "See your engagement trends" },
    { title: "AI Sessions", tooltip: "Track time saved with Life CEO" },
    { title: "ROI Calculator", tooltip: "Premium value vs. cost" },
    { title: "Insights!", celebration: true }
  ]
}
```

**Analytics Widgets:**
- Posts created, events attended (vs. community average)
- AI coaching hours (time saved metric)
- Network growth graph
- Feature usage breakdown
- Premium ROI: "You've saved 12 hours this month = $240 value"

---

## 🎨 Premium Feature Discovery

**Unlock Indicators:**
```typescript
<FeatureUnlocked
  feature="Advanced Analytics"
  badge="✨ PREMIUM"
  tooltip="Available with your Premium subscription"
/>
```

**Gradual Rollout:**
- Week 1: Unlock all 16 AI agents + analytics
- Week 2: Unlock advanced filters, priority support
- Week 3: Unlock white-label options, API access
- Month 2+: Unlock custom integrations

---

## 💰 Stripe Integration

**Setup:**
```typescript
import { blueprint } from 'blueprint:javascript_stripe';

const checkout = await stripe.checkout.sessions.create({
  line_items: [{
    price: PREMIUM_PRICE_ID,
    quantity: 1
  }],
  mode: 'subscription',
  success_url: `${DOMAIN}/life-ceo?success=true`,
  cancel_url: `${DOMAIN}/subscribe?canceled=true`,
  subscription_data: {
    trial_period_days: 7
  }
});
```

**Webhook Handling:**
```typescript
app.post('/api/stripe/webhook', async (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case 'checkout.session.completed':
      await upgradeUserToPremium(event.data.object.client_reference_id);
      break;
    case 'customer.subscription.deleted':
      await downgradeUser(event.data.object.metadata.userId);
      break;
  }
});
```

---

## 📊 Analytics & Metrics

**Conversion Funnel:**
- Upgrade prompt shown → Click pricing: Target >25%
- View pricing → Start checkout: Target >40%
- Start checkout → Complete payment: Target >60%
- **Overall free→premium conversion: Target >15%**

**Engagement:**
- First AI session within 24h: Target >80%
- Active AI usage (weekly): Target >60%
- Analytics view rate: Target >70%
- Retention (30-day): Target >85%

**Churn Prevention:**
- Trial reminder (Day 5): "2 days left in trial"
- First bill reminder (Day 6): "Billing tomorrow, cancel anytime"
- Winback campaign (if canceled): "We miss you! 50% off for 3 months"

---

## 🎯 Success Criteria

**Journey J3 complete when:**
- [ ] Stripe integration working
- [ ] 16 AI agents accessible
- [ ] Analytics dashboard functional
- [ ] Trial flow tested
- [ ] >15% conversion rate
- [ ] <10% churn rate (monthly)

---

**Created by:** Agent #64  
**Status:** ✅ SPECIFICATION COMPLETE  
**Estimated Build Time:** 1.5 hours
