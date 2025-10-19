# Journey Agent API & Coordination Specification
## MB.MD System Integration Design

**Created:** October 19, 2025  
**Purpose:** API routes, database schema, and Journey ↔ Page Agent coordination protocol

---

## 🗄️ DATABASE SCHEMA

**Location:** `shared/schema.ts`

```typescript
import { pgTable, serial, varchar, integer, jsonb, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './schema'; // Existing users table

// Journey Progress Tracking
export const userJourneyProgress = pgTable('user_journey_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  journeyId: varchar('journey_id', { length: 10 }).notNull(), // 'J1' through 'J5'
  currentStep: integer('current_step').default(1),
  totalSteps: integer('total_steps').notNull(),
  completedSteps: jsonb('completed_steps').$type<number[]>().default([]),
  skippedSteps: jsonb('skipped_steps').$type<number[]>().default([]),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Journey Achievements
export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  achievementId: varchar('achievement_id', { length: 50 }).notNull(), // 'first-post', 'storyteller', etc
  journeyId: varchar('journey_id', { length: 10 }), // Which journey unlocked it
  earnedAt: timestamp('earned_at').defaultNow()
});

// Feature Unlocks
export const userFeatureUnlocks = pgTable('user_feature_unlocks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  featureId: varchar('feature_id', { length: 50 }).notNull(), // 'messaging', 'housing', etc
  unlockedAt: timestamp('unlocked_at').defaultNow()
});

// Tooltip Dismissals (localStorage backup)
export const userTooltipDismissals = pgTable('user_tooltip_dismissals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  tooltipId: varchar('tooltip_id', { length: 100 }).notNull(),
  dismissedAt: timestamp('dismissed_at').defaultNow()
});

// Indexes for performance
CREATE INDEX idx_user_journey ON user_journey_progress(user_id, journey_id);
CREATE INDEX idx_journey_incomplete ON user_journey_progress(journey_id, completed_at) WHERE completed_at IS NULL;
CREATE INDEX idx_user_achievements ON user_achievements(user_id);
CREATE INDEX idx_user_feature_unlocks ON user_feature_unlocks(user_id, feature_id);
```

**Drizzle Zod Schemas:**
```typescript
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const insertJourneyProgressSchema = createInsertSchema(userJourneyProgress).omit({ id: true, createdAt: true, updatedAt: true });
export const selectJourneyProgressSchema = createSelectSchema(userJourneyProgress);
export type InsertJourneyProgress = z.infer<typeof insertJourneyProgressSchema>;
export type SelectJourneyProgress = typeof userJourneyProgress.$inferSelect;
```

**Migration:**
```bash
# Add to shared/schema.ts, then run:
npm run db:push --force
```

---

## 🛤️ API ROUTES

**Location:** `server/routes/journeyRoutes.ts`

```typescript
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import * as journeyService from '../services/journeyService';

const router = Router();

// ============ JOURNEY PROGRESS ============

/**
 * START JOURNEY
 * POST /api/journeys/start
 * Body: { journeyId: string }
 */
router.post('/start', requireAuth, async (req, res) => {
  const schema = z.object({
    journeyId: z.enum(['J1', 'J2', 'J3', 'J4', 'J5'])
  });

  const { journeyId } = schema.parse(req.body);
  const userId = req.user!.id;

  const progress = await journeyService.startJourney(userId, journeyId);

  res.json({
    success: true,
    data: progress
  });
});

/**
 * GET JOURNEY PROGRESS
 * GET /api/journeys/:userId/progress
 * Query: ?journeyId=J1 (optional, returns current active journey if omitted)
 */
router.get('/:userId/progress', requireAuth, async (req, res) => {
  const userId = parseInt(req.params.userId);
  const journeyId = req.query.journeyId as string | undefined;

  const progress = await journeyService.getJourneyProgress(userId, journeyId);

  res.json({
    success: true,
    data: progress
  });
});

/**
 * COMPLETE STEP
 * PUT /api/journeys/:userId/complete/:step
 * Body: { metadata?: Record<string, any> }
 */
router.put('/:userId/complete/:step', requireAuth, async (req, res) => {
  const userId = parseInt(req.params.userId);
  const step = parseInt(req.params.step);
  const metadata = req.body.metadata || {};

  const progress = await journeyService.completeStep(userId, step, metadata);

  // Check if journey complete
  if (progress.completedAt) {
    // Trigger completion celebration
    await journeyService.triggerJourneyComplete(userId, progress.journeyId);
  }

  res.json({
    success: true,
    data: progress,
    nextStep: step + 1 <= progress.totalSteps ? step + 1 : null
  });
});

/**
 * SKIP STEP
 * PUT /api/journeys/:userId/skip/:step
 */
router.put('/:userId/skip/:step', requireAuth, async (req, res) => {
  const userId = parseInt(req.params.userId);
  const step = parseInt(req.params.step);

  const progress = await journeyService.skipStep(userId, step);

  res.json({
    success: true,
    data: progress,
    nextStep: step + 1
  });
});

/**
 * GET NEXT SUGGESTED ACTION
 * GET /api/journeys/:userId/next
 */
router.get('/:userId/next', requireAuth, async (req, res) => {
  const userId = parseInt(req.params.userId);

  const suggestion = await journeyService.getNextAction(userId);

  res.json({
    success: true,
    data: suggestion
  });
});

// ============ ACHIEVEMENTS ============

/**
 * GET USER ACHIEVEMENTS
 * GET /api/journeys/:userId/achievements
 */
router.get('/:userId/achievements', requireAuth, async (req, res) => {
  const userId = parseInt(req.params.userId);

  const achievements = await journeyService.getUserAchievements(userId);

  res.json({
    success: true,
    data: achievements
  });
});

/**
 * AWARD ACHIEVEMENT
 * POST /api/journeys/:userId/achievements
 * Body: { achievementId: string, journeyId?: string }
 */
router.post('/:userId/achievements', requireAuth, async (req, res) => {
  const userId = parseInt(req.params.userId);
  const { achievementId, journeyId } = req.body;

  const achievement = await journeyService.awardAchievement(userId, achievementId, journeyId);

  res.json({
    success: true,
    data: achievement
  });
});

// ============ FEATURE UNLOCKS ============

/**
 * CHECK FEATURE ACCESS
 * GET /api/journeys/:userId/features/:featureId
 */
router.get('/:userId/features/:featureId', requireAuth, async (req, res) => {
  const userId = parseInt(req.params.userId);
  const featureId = req.params.featureId;

  const hasAccess = await journeyService.hasFeatureAccess(userId, featureId);

  res.json({
    success: true,
    hasAccess
  });
});

/**
 * UNLOCK FEATURE
 * POST /api/journeys/:userId/features/:featureId/unlock
 */
router.post('/:userId/features/:featureId/unlock', requireAuth, async (req, res) => {
  const userId = parseInt(req.params.userId);
  const featureId = req.params.featureId;

  const unlock = await journeyService.unlockFeature(userId, featureId);

  res.json({
    success: true,
    data: unlock
  });
});

// ============ ANALYTICS (ADMIN ONLY) ============

/**
 * GET JOURNEY ANALYTICS
 * GET /api/journeys/analytics
 * Query: ?journeyId=J1&period=7d
 */
router.get('/analytics', requireAuth, async (req, res) => {
  // Check if user is admin
  if (!req.user!.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const journeyId = req.query.journeyId as string | undefined;
  const period = req.query.period as string || '7d';

  const analytics = await journeyService.getJourneyAnalytics(journeyId, period);

  res.json({
    success: true,
    data: analytics
  });
});

export default router;
```

**Register in:** `server/routes.ts`
```typescript
import journeyRoutes from './routes/journeyRoutes';
app.use('/api/journeys', journeyRoutes);
```

---

## 💼 SERVICE LAYER

**Location:** `server/services/journeyService.ts`

```typescript
import { db } from '../db';
import { userJourneyProgress, userAchievements, userFeatureUnlocks } from '@shared/schema';
import { eq, and, isNull } from 'drizzle-orm';

const JOURNEY_CONFIGS = {
  J1: { name: 'Anonymous → Registration', totalSteps: 7 },
  J2: { name: 'Standard User Core', totalSteps: 8 }, // 8 feature clusters
  J3: { name: 'Premium/Life CEO', totalSteps: 5 },
  J4: { name: 'Admin Access', totalSteps: 8 },
  J5: { name: 'Super Admin', totalSteps: 10 }
};

export async function startJourney(userId: number, journeyId: string) {
  const config = JOURNEY_CONFIGS[journeyId as keyof typeof JOURNEY_CONFIGS];

  const [progress] = await db.insert(userJourneyProgress).values({
    userId,
    journeyId,
    currentStep: 1,
    totalSteps: config.totalSteps,
    completedSteps: [],
    metadata: {}
  }).returning();

  return progress;
}

export async function getJourneyProgress(userId: number, journeyId?: string) {
  if (journeyId) {
    const [progress] = await db.select()
      .from(userJourneyProgress)
      .where(and(
        eq(userJourneyProgress.userId, userId),
        eq(userJourneyProgress.journeyId, journeyId)
      ))
      .limit(1);
    return progress;
  }

  // Get current active journey (not completed)
  const [progress] = await db.select()
    .from(userJourneyProgress)
    .where(and(
      eq(userJourneyProgress.userId, userId),
      isNull(userJourneyProgress.completedAt)
    ))
    .orderBy(desc(userJourneyProgress.createdAt))
    .limit(1);

  return progress;
}

export async function completeStep(userId: number, step: number, metadata: Record<string, any>) {
  const progress = await getJourneyProgress(userId);
  if (!progress) throw new Error('No active journey');

  const completedSteps = [...progress.completedSteps, step];
  const currentStep = step + 1;
  const isComplete = currentStep > progress.totalSteps;

  const [updated] = await db.update(userJourneyProgress)
    .set({
      currentStep: isComplete ? progress.totalSteps : currentStep,
      completedSteps,
      completedAt: isComplete ? new Date() : undefined,
      metadata: { ...progress.metadata, ...metadata },
      updatedAt: new Date()
    })
    .where(eq(userJourneyProgress.id, progress.id))
    .returning();

  return updated;
}

export async function skipStep(userId: number, step: number) {
  const progress = await getJourneyProgress(userId);
  if (!progress) throw new Error('No active journey');

  const skippedSteps = [...progress.skippedSteps, step];
  const currentStep = step + 1;

  const [updated] = await db.update(userJourneyProgress)
    .set({
      currentStep,
      skippedSteps,
      updatedAt: new Date()
    })
    .where(eq(userJourneyProgress.id, progress.id))
    .returning();

  return updated;
}

export async function getNextAction(userId: number) {
  const progress = await getJourneyProgress(userId);
  if (!progress) return null;

  // Journey-specific next actions
  const nextActions = {
    J1: {
      1: { page: '/', action: 'Click "Get Started"', tooltip: 'Begin your journey!' },
      2: { page: '/login', action: 'Create account', tooltip: 'New? Register here!' },
      3: { page: '/register', action: 'Fill form', tooltip: 'Just a few details' },
      // ... etc
    },
    // ... other journeys
  };

  const journeyActions = nextActions[progress.journeyId as keyof typeof nextActions];
  return journeyActions?.[progress.currentStep as keyof typeof journeyActions] || null;
}

export async function awardAchievement(userId: number, achievementId: string, journeyId?: string) {
  const [achievement] = await db.insert(userAchievements).values({
    userId,
    achievementId,
    journeyId
  }).returning();

  return achievement;
}

export async function getUserAchievements(userId: number) {
  return db.select()
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));
}

export async function unlockFeature(userId: number, featureId: string) {
  const [unlock] = await db.insert(userFeatureUnlocks).values({
    userId,
    featureId
  }).returning();

  return unlock;
}

export async function hasFeatureAccess(userId: number, featureId: string): Promise<boolean> {
  const [unlock] = await db.select()
    .from(userFeatureUnlocks)
    .where(and(
      eq(userFeatureUnlocks.userId, userId),
      eq(userFeatureUnlocks.featureId, featureId)
    ))
    .limit(1);

  return !!unlock;
}
```

---

## 🔗 JOURNEY ↔ PAGE AGENT COORDINATION

### Coordination Flow

**1. Page Load → Query Journey Progress**
```typescript
// In any Page Agent (e.g., /memories)
import { useQuery } from '@tanstack/react-query';

function MemoriesPage() {
  const { user } = useAuth();
  
  // Query user's current journey
  const { data: journey } = useQuery({
    queryKey: ['/api/journeys', user.id, 'progress'],
    enabled: !!user
  });

  useEffect(() => {
    if (journey) {
      handleJourneyState(journey);
    }
  }, [journey]);

  const handleJourneyState = (journey: Journey) => {
    // Journey J2, Step 1: Show "Create First Memory" wizard
    if (journey.journeyId === 'J2' && journey.currentStep === 1) {
      showOnboardingWizard('create-first-memory');
    }

    // Journey J2, Step 3: Show tooltip on event button
    if (journey.journeyId === 'J2' && journey.currentStep === 3) {
      highlightElement('[data-testid="button-create-event"]');
    }
  };

  return (
    <div>
      {/* Page content */}
    </div>
  );
}
```

**2. User Completes Action → Update Journey**
```typescript
// When user creates first post
async function handlePostCreate(postData) {
  // Create post
  const post = await createPost(postData);

  // Update journey progress
  await fetch(`/api/journeys/${user.id}/complete/1`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metadata: { firstPostId: post.id }
    })
  });

  // Show celebration
  showSuccessCelebration({
    message: 'First Post Created! 🎉',
    cta: 'Continue',
    onContinue: () => {
      // Journey Agent suggests next step
      getNextAction().then(action => {
        showTooltip(action.tooltip);
      });
    }
  });
}
```

**3. Journey Agent → Mr Blue Integration**
```typescript
// In MrBlueComplete.tsx
const { data: journey } = useQuery({
  queryKey: ['/api/journeys', user.id, 'progress']
});

// Adapt Mr Blue greeting based on journey
const getGreeting = () => {
  if (!journey) return "Hi! How can I help?";

  switch (journey.journeyId) {
    case 'J1':
      return `Welcome! You're on step ${journey.currentStep}/7 of getting started. Need help?`;
    case 'J2':
      return `Hi ${user.displayName}! Ready to explore more features?`;
    case 'J3':
      return `Premium member! Let's make the most of your Life CEO agents.`;
    default:
      return "Hi! What can I help with today?";
  }
};

// START trigger (when chat opens)
const onChatOpen = async () => {
  const nextAction = await fetch(`/api/journeys/${user.id}/next`).then(r => r.json());
  
  if (nextAction) {
    suggestAction(nextAction.action);
  }
};

// END trigger (when user completes action via Mr Blue guidance)
const onActionComplete = async (action: string) => {
  await fetch(`/api/journeys/${user.id}/complete/${journey.currentStep}`, {
    method: 'PUT',
    body: JSON.stringify({ metadata: { completedVia: 'mrblue', action } })
  });
};
```

---

## 📊 Analytics & Tracking

**Journey Funnel Metrics:**
```typescript
export async function getJourneyAnalytics(journeyId?: string, period: string = '7d') {
  const periodDays = parseInt(period);
  const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

  const query = db.select()
    .from(userJourneyProgress)
    .where(gte(userJourneyProgress.createdAt, since));

  if (journeyId) {
    query.where(eq(userJourneyProgress.journeyId, journeyId));
  }

  const journeys = await query;

  return {
    totalStarted: journeys.length,
    totalCompleted: journeys.filter(j => j.completedAt).length,
    completionRate: (journeys.filter(j => j.completedAt).length / journeys.length) * 100,
    averageCompletionTime: calculateAvgTime(journeys),
    dropOffByStep: calculateDropOff(journeys),
    conversionFunnel: buildFunnel(journeys)
  };
}
```

---

## ✅ Success Criteria

**API is complete when:**
- [ ] All 13 endpoints functional
- [ ] Database schema migrated
- [ ] Service layer tested
- [ ] Journey ↔ Page coordination working
- [ ] Mr Blue integration active
- [ ] Analytics tracking operational

---

**Created by:** Agent #64  
**Status:** ✅ API & COORDINATION COMPLETE  
**Files to Create:** 2 backend files (routes + service)  
**Estimated Build Time:** 2 hours
