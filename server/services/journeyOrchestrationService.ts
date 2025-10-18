/**
 * Phase 0 Task 0.5: Journey Orchestration Service
 * 
 * Detects and updates customer journey state (J1-J4) based on user metrics
 * 
 * Journey States:
 * - J1: New User (onboarding, first-time experience)
 * - J2: Active User (regular engagement, content consumption)
 * - J3: Power User (advanced features, content creation)
 * - J4: Super Admin (platform management, analytics)
 */

import type { User } from '@db/schema';

export type JourneyState = 'J1' | 'J2' | 'J3' | 'J4';

/**
 * Check if user has super admin role
 */
function isSuperAdmin(user: Partial<User>): boolean {
  return user.role === 'super-admin';
}

export interface UserMetrics {
  memoriesCount: number;
  connectionsCount: number;
  eventsOrganized: number;
  eventsAttended: number;
  daysSinceRegistration: number;
  loginCount: number;
  hasUsedAIFeatures: boolean;
}

export interface JourneyTransition {
  from: JourneyState;
  to: JourneyState;
  reason: string;
  metricsSnapshot: UserMetrics;
  transitionedAt: Date;
}

/**
 * Detect which journey state a user should be in based on their metrics
 */
export function detectUserJourney(user: Partial<User>, metrics: UserMetrics): JourneyState {
  // J4: Super Admin (highest priority)
  if (isSuperAdmin(user as any)) {
    return 'J4';
  }
  
  // J3: Power User - Content creator, community leader
  if (
    metrics.memoriesCount >= 50 &&
    metrics.connectionsCount >= 50 &&
    metrics.eventsOrganized >= 3 &&
    (user.subscriptionTier === 'basic' || 
     user.subscriptionTier === 'enthusiast' || 
     user.subscriptionTier === 'professional' ||
     user.subscriptionTier === 'enterprise')
  ) {
    return 'J3';
  }
  
  // J2: Active User - Regular engagement
  if (
    user.isOnboardingComplete &&
    metrics.memoriesCount >= 1 &&
    metrics.connectionsCount >= 1 &&
    metrics.daysSinceRegistration >= 7
  ) {
    return 'J2';
  }
  
  // J1: New User (default) - Still onboarding
  return 'J1';
}

/**
 * Calculate metrics needed for journey detection
 * In production, these would come from database queries
 */
export async function calculateUserMetrics(userId: number): Promise<UserMetrics> {
  // TODO: Replace with actual database queries
  // For now, return mock data to get infrastructure working
  
  return {
    memoriesCount: 0,
    connectionsCount: 0,
    eventsOrganized: 0,
    eventsAttended: 0,
    daysSinceRegistration: 0,
    loginCount: 0,
    hasUsedAIFeatures: false,
  };
}

/**
 * Check if user should transition to a different journey state
 * Returns transition info if state change is needed, null otherwise
 */
export function shouldTransition(
  currentState: JourneyState,
  detectedState: JourneyState,
  user: Partial<User>,
  metrics: UserMetrics
): JourneyTransition | null {
  if (currentState === detectedState) {
    return null; // No transition needed
  }
  
  // Determine reason for transition
  const reasons: Record<string, string> = {
    'J1->J2': 'Completed onboarding and became active',
    'J2->J3': 'Became a power user and content creator',
    'J3->J4': 'Promoted to super admin',
    'J1->J4': 'Directly promoted to super admin',
    'J2->J4': 'Promoted to super admin',
  };
  
  const transitionKey = `${currentState}->${detectedState}`;
  const reason = reasons[transitionKey] || `Journey state changed from ${currentState} to ${detectedState}`;
  
  return {
    from: currentState,
    to: detectedState,
    reason,
    metricsSnapshot: metrics,
    transitionedAt: new Date(),
  };
}

/**
 * Get journey agent info for a given state
 */
export function getJourneyAgentInfo(journeyState: JourneyState): {
  id: string;
  name: string;
  description: string;
  features: string[];
} {
  const agents = {
    J1: {
      id: 'J1',
      name: 'New User Journey',
      description: 'Onboarding and first-time experience',
      features: [
        'Welcome tour',
        'Profile setup guidance',
        'First connection suggestions',
        'Event discovery',
        'First post creation help',
      ],
    },
    J2: {
      id: 'J2',
      name: 'Active User Journey',
      description: 'Regular engagement and content consumption',
      features: [
        'Personalized content feed',
        'Event recommendations',
        'Community discovery',
        'Social engagement prompts',
        'Regular activity tracking',
      ],
    },
    J3: {
      id: 'J3',
      name: 'Power User Journey',
      description: 'Advanced features and content creation',
      features: [
        'Event organization tools',
        'AI content enhancement',
        'Community leadership',
        'Advanced analytics',
        'Priority support',
      ],
    },
    J4: {
      id: 'J4',
      name: 'Super Admin Journey',
      description: 'Platform management and analytics',
      features: [
        'ESA Mind Map access',
        'Visual Editor',
        'Platform analytics',
        'User management',
        'Agent monitoring',
      ],
    },
  };
  
  return agents[journeyState];
}

/**
 * Get milestone checklist for current journey
 */
export function getJourneyMilestones(journeyState: JourneyState, metrics: UserMetrics): Array<{
  id: string;
  title: string;
  description: string;
  completed: boolean;
  progress: number;
}> {
  const milestones = {
    J1: [
      {
        id: 'profile-setup',
        title: 'Complete Your Profile',
        description: 'Add bio, tango roles, and experience level',
        completed: metrics.daysSinceRegistration > 0,
        progress: 100,
      },
      {
        id: 'first-connection',
        title: 'Make Your First Connection',
        description: 'Connect with other tango dancers',
        completed: metrics.connectionsCount >= 1,
        progress: Math.min(100, metrics.connectionsCount * 100),
      },
      {
        id: 'first-post',
        title: 'Create Your First Memory',
        description: 'Share your tango experience',
        completed: metrics.memoriesCount >= 1,
        progress: Math.min(100, metrics.memoriesCount * 100),
      },
      {
        id: 'explore-events',
        title: 'Explore Events',
        description: 'Find tango events near you',
        completed: metrics.eventsAttended >= 1,
        progress: Math.min(100, metrics.eventsAttended * 100),
      },
    ],
    J2: [
      {
        id: 'regular-activity',
        title: 'Stay Active',
        description: 'Log in regularly and engage with content',
        completed: metrics.loginCount >= 10,
        progress: Math.min(100, (metrics.loginCount / 10) * 100),
      },
      {
        id: 'build-network',
        title: 'Build Your Network',
        description: 'Connect with 5+ tango dancers',
        completed: metrics.connectionsCount >= 5,
        progress: Math.min(100, (metrics.connectionsCount / 5) * 100),
      },
      {
        id: 'attend-event',
        title: 'Attend Your First Event',
        description: 'Join a tango event from the platform',
        completed: metrics.eventsAttended >= 1,
        progress: Math.min(100, metrics.eventsAttended * 100),
      },
      {
        id: 'create-memories',
        title: 'Share Your Journey',
        description: 'Create 5+ memories',
        completed: metrics.memoriesCount >= 5,
        progress: Math.min(100, (metrics.memoriesCount / 5) * 100),
      },
    ],
    J3: [
      {
        id: 'organize-event',
        title: 'Organize Events',
        description: 'Create and manage 3+ events',
        completed: metrics.eventsOrganized >= 3,
        progress: Math.min(100, (metrics.eventsOrganized / 3) * 100),
      },
      {
        id: 'power-network',
        title: 'Expand Your Network',
        description: 'Connect with 50+ dancers',
        completed: metrics.connectionsCount >= 50,
        progress: Math.min(100, (metrics.connectionsCount / 50) * 100),
      },
      {
        id: 'content-creator',
        title: 'Become a Content Creator',
        description: 'Create 50+ memories',
        completed: metrics.memoriesCount >= 50,
        progress: Math.min(100, (metrics.memoriesCount / 50) * 100),
      },
      {
        id: 'use-ai',
        title: 'Unlock AI Features',
        description: 'Use AI content enhancement',
        completed: metrics.hasUsedAIFeatures,
        progress: metrics.hasUsedAIFeatures ? 100 : 0,
      },
    ],
    J4: [
      {
        id: 'manage-users',
        title: 'User Management',
        description: 'Access user management tools',
        completed: true,
        progress: 100,
      },
      {
        id: 'platform-analytics',
        title: 'Platform Analytics',
        description: 'Monitor platform health',
        completed: true,
        progress: 100,
      },
      {
        id: 'esa-access',
        title: 'ESA Mind Map',
        description: 'Access agent orchestration',
        completed: true,
        progress: 100,
      },
      {
        id: 'visual-editor',
        title: 'Visual Editor',
        description: 'Edit platform UI',
        completed: true,
        progress: 100,
      },
    ],
  };
  
  return milestones[journeyState] || [];
}
