/**
 * Journey Service Layer
 * MB.MD Phase 4: Deployment - Oct 19, 2025
 * 
 * Business logic for Journey Agents J1-J5
 * Handles journey progress, achievements, feature unlocks, and analytics
 */

import { db } from '../db';
import { 
  userJourneyProgress, 
  userAchievements, 
  userFeatureUnlocks,
  userTooltipDismissals,
  type JourneyProgress,
  type UserAchievement,
  type FeatureUnlock
} from '@shared/schema';
import { eq, and, isNull, desc, gte } from 'drizzle-orm';

// Journey configuration
const JOURNEY_CONFIGS = {
  J1: { name: 'Anonymous → Registration', totalSteps: 7 },
  J2: { name: 'Standard User Core', totalSteps: 8 }, // 8 feature clusters
  J3: { name: 'Premium/Life CEO', totalSteps: 5 },
  J4: { name: 'Admin Access', totalSteps: 8 },
  J5: { name: 'Super Admin', totalSteps: 10 }
} as const;

type JourneyId = keyof typeof JOURNEY_CONFIGS;

/**
 * Start a new journey for a user
 */
export async function startJourney(userId: number, journeyId: JourneyId): Promise<JourneyProgress> {
  const config = JOURNEY_CONFIGS[journeyId];

  // Check if journey already exists
  const existing = await db.select()
    .from(userJourneyProgress)
    .where(and(
      eq(userJourneyProgress.userId, userId),
      eq(userJourneyProgress.journeyId, journeyId)
    ))
    .limit(1);

  if (existing.length > 0) {
    // Journey already exists, return it
    return existing[0];
  }

  // Create new journey
  const [progress] = await db.insert(userJourneyProgress).values({
    userId,
    journeyId,
    currentStep: 1,
    totalSteps: config.totalSteps,
    completedSteps: [],
    skippedSteps: [],
    metadata: {}
  }).returning();

  return progress;
}

/**
 * Get user's journey progress
 * If journeyId is provided, returns that specific journey
 * Otherwise returns the current active (incomplete) journey
 */
export async function getJourneyProgress(
  userId: number, 
  journeyId?: JourneyId
): Promise<JourneyProgress | null> {
  if (journeyId) {
    const [progress] = await db.select()
      .from(userJourneyProgress)
      .where(and(
        eq(userJourneyProgress.userId, userId),
        eq(userJourneyProgress.journeyId, journeyId)
      ))
      .limit(1);
    return progress || null;
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

  return progress || null;
}

/**
 * Complete a step in the user's current journey
 */
export async function completeStep(
  userId: number, 
  step: number, 
  metadata: Record<string, unknown> = {}
): Promise<JourneyProgress> {
  const progress = await getJourneyProgress(userId);
  if (!progress) {
    throw new Error('No active journey found for user');
  }

  // Ensure step is valid
  if (step > progress.totalSteps || step < 1) {
    throw new Error(`Invalid step: ${step}. Journey has ${progress.totalSteps} steps.`);
  }

  // Add step to completed steps if not already there
  const completedSteps = Array.isArray(progress.completedSteps) 
    ? [...new Set([...progress.completedSteps, step])] 
    : [step];

  const currentStep = step + 1;
  const isComplete = currentStep > progress.totalSteps;

  // Update journey progress
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

/**
 * Skip a step in the user's current journey
 */
export async function skipStep(userId: number, step: number): Promise<JourneyProgress> {
  const progress = await getJourneyProgress(userId);
  if (!progress) {
    throw new Error('No active journey found for user');
  }

  // Add step to skipped steps if not already there
  const skippedSteps = Array.isArray(progress.skippedSteps)
    ? [...new Set([...progress.skippedSteps, step])]
    : [step];

  const currentStep = step + 1;

  // Update journey progress
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

/**
 * Get next suggested action for user based on current journey
 */
export async function getNextAction(userId: number): Promise<{
  page: string;
  action: string;
  tooltip: string;
} | null> {
  const progress = await getJourneyProgress(userId);
  if (!progress) return null;

  // Journey-specific next actions
  const nextActions: Record<string, Record<number, { page: string; action: string; tooltip: string }>> = {
    J1: {
      1: { page: '/', action: 'Click "Get Started"', tooltip: 'Begin your journey!' },
      2: { page: '/login', action: 'Create account', tooltip: 'New? Register here!' },
      3: { page: '/register', action: 'Fill registration form', tooltip: 'Just a few details' },
      4: { page: '/verify-email', action: 'Check your email', tooltip: 'Verify your account' },
      5: { page: '/welcome-setup', action: 'Complete welcome survey', tooltip: 'Personalize your experience' },
      6: { page: '/profile-setup', action: 'Upload profile photo', tooltip: 'Add a photo to connect with others' },
      7: { page: '/preferences', action: 'Set preferences', tooltip: 'Almost done!' }
    },
    J2: {
      1: { page: '/memories', action: 'Create first post', tooltip: 'Share your tango journey!' },
      2: { page: '/events', action: 'RSVP to an event', tooltip: 'Find milongas near you' },
      3: { page: '/community', action: 'Join your city group', tooltip: 'Connect with local dancers' },
      4: { page: '/housing', action: 'Explore housing', tooltip: 'Find accommodation for festivals' },
      5: { page: '/messages', action: 'Send first message', tooltip: 'Start a conversation' },
      6: { page: '/friends', action: 'Add friends', tooltip: 'Build your network' },
      7: { page: '/search', action: 'Search platform', tooltip: 'Discover new connections' },
      8: { page: '/settings', action: 'Customize settings', tooltip: 'Make it yours' }
    },
    J3: {
      1: { page: '/subscribe', action: 'View pricing', tooltip: 'See premium features' },
      2: { page: '/subscribe', action: 'Start checkout', tooltip: '7-day free trial' },
      3: { page: '/life-ceo', action: 'Explore AI agents', tooltip: 'Meet your AI team' },
      4: { page: '/life-ceo/health', action: 'Chat with agent', tooltip: 'Try your first AI session' },
      5: { page: '/analytics', action: 'View insights', tooltip: 'See your ROI' }
    },
    J4: {
      1: { page: '/admin', action: 'Explore dashboard', tooltip: 'Get familiar with admin tools' },
      2: { page: '/admin/users', action: 'Manage users', tooltip: 'Search and edit user accounts' },
      3: { page: '/admin/moderation', action: 'Review content', tooltip: 'Moderate flagged posts' },
      4: { page: '/admin/analytics', action: 'View analytics', tooltip: 'Monitor platform health' },
      5: { page: '/admin/projects', action: 'Check projects', tooltip: 'Track development tasks' },
      6: { page: '/admin/esa-mind', action: 'View agents', tooltip: 'Explore 350+ agent system' },
      7: { page: '/admin/settings', action: 'Configure platform', tooltip: 'Adjust settings' },
      8: { page: '/admin/support', action: 'Handle tickets', tooltip: 'Support users' }
    },
    J5: {
      1: { page: '/admin/developer', action: 'Developer tools', tooltip: 'Full system access granted' },
      2: { page: '/admin/visual-editor', action: 'Try Visual Editor', tooltip: '7-tab IDE for pages' },
      3: { page: '/admin/esa-mind', action: 'View MindMap', tooltip: 'Global agent visualization' },
      4: { page: '/admin/ai-intelligence', action: 'AI metrics', tooltip: 'Monitor agent performance' },
      5: { page: '/admin/database', action: 'Query database', tooltip: '84 tables, millions of rows' },
      6: { page: '/admin/api-docs', action: 'Test APIs', tooltip: '100+ REST endpoints' },
      7: { page: '/admin/diagnostics', action: 'View logs', tooltip: 'Real-time debugging' },
      8: { page: '/admin/webhooks', action: 'Set up webhooks', tooltip: 'Event subscriptions' },
      9: { page: '/admin/cli', action: 'CLI access', tooltip: 'Terminal access' },
      10: { page: '/admin/super-admin', action: 'Configure', tooltip: 'Platform-level settings' }
    }
  };

  const journeyActions = nextActions[progress.journeyId];
  if (!journeyActions || !progress.currentStep) return null;
  return journeyActions[progress.currentStep] || null;
}

/**
 * Award an achievement to a user
 */
export async function awardAchievement(
  userId: number, 
  achievementId: string, 
  journeyId?: JourneyId
): Promise<UserAchievement> {
  // Check if achievement already exists
  const existing = await db.select()
    .from(userAchievements)
    .where(and(
      eq(userAchievements.userId, userId),
      eq(userAchievements.achievementId, achievementId)
    ))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Award new achievement
  const [achievement] = await db.insert(userAchievements).values({
    userId,
    achievementId,
    journeyId: journeyId || null
  }).returning();

  return achievement;
}

/**
 * Get all achievements for a user
 */
export async function getUserAchievements(userId: number): Promise<UserAchievement[]> {
  return db.select()
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId))
    .orderBy(desc(userAchievements.earnedAt));
}

/**
 * Unlock a feature for a user
 */
export async function unlockFeature(userId: number, featureId: string): Promise<FeatureUnlock> {
  // Check if feature already unlocked
  const existing = await db.select()
    .from(userFeatureUnlocks)
    .where(and(
      eq(userFeatureUnlocks.userId, userId),
      eq(userFeatureUnlocks.featureId, featureId)
    ))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Unlock feature
  const [unlock] = await db.insert(userFeatureUnlocks).values({
    userId,
    featureId
  }).returning();

  return unlock;
}

/**
 * Check if user has access to a feature
 */
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

/**
 * Get journey analytics (admin only)
 */
export async function getJourneyAnalytics(journeyId?: JourneyId, period: string = '7d') {
  const periodDays = parseInt(period.replace('d', ''));
  const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

  const whereConditions = journeyId
    ? and(
        gte(userJourneyProgress.createdAt, since),
        eq(userJourneyProgress.journeyId, journeyId)
      )
    : gte(userJourneyProgress.createdAt, since);

  const journeys = await db.select()
    .from(userJourneyProgress)
    .where(whereConditions);

  const totalStarted = journeys.length;
  const totalCompleted = journeys.filter(j => j.completedAt).length;
  const completionRate = totalStarted > 0 ? (totalCompleted / totalStarted) * 100 : 0;

  // Calculate average completion time
  const completedJourneys = journeys.filter(j => j.completedAt && j.startedAt);
  const avgCompletionTime = completedJourneys.length > 0
    ? completedJourneys.reduce((sum, j) => {
        const duration = j.completedAt!.getTime() - (j.startedAt?.getTime() || 0);
        return sum + duration;
      }, 0) / completedJourneys.length
    : 0;

  // Calculate drop-off by step
  const dropOffByStep: Record<number, number> = {};
  const config = journeyId ? JOURNEY_CONFIGS[journeyId] : null;
  if (config) {
    for (let step = 1; step <= config.totalSteps; step++) {
      const reachedStep = journeys.filter(j => 
        Array.isArray(j.completedSteps) && j.completedSteps.includes(step)
      ).length;
      dropOffByStep[step] = totalStarted > 0 ? (reachedStep / totalStarted) * 100 : 0;
    }
  }

  return {
    totalStarted,
    totalCompleted,
    completionRate: Math.round(completionRate * 100) / 100,
    averageCompletionTimeMs: Math.round(avgCompletionTime),
    averageCompletionTimeHuman: formatDuration(avgCompletionTime),
    dropOffByStep,
    period: `${periodDays} days`
  };
}

/**
 * Trigger journey completion celebration and start next journey
 */
export async function triggerJourneyComplete(userId: number, completedJourneyId: JourneyId) {
  // Award completion achievement
  await awardAchievement(userId, `${completedJourneyId}-complete`, completedJourneyId);

  // Determine next journey
  const nextJourneyMap: Partial<Record<JourneyId, JourneyId>> = {
    J1: 'J2', // Registration → Standard User
    // J2: null, // Standard User stays in J2 (or upgrades to J3 via payment)
    // J3: null, // Premium stays in J3
    // J4: null, // Admin stays in J4
    // J5: null  // Super Admin stays in J5
  };

  const nextJourneyId = nextJourneyMap[completedJourneyId];
  if (nextJourneyId) {
    await startJourney(userId, nextJourneyId);
  }
}

/**
 * Helper: Format duration in ms to human-readable string
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
