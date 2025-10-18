/**
 * J2: Active User Journey Agent
 * Phase 0 Task 0.5: Journey Orchestration
 * 
 * Purpose: Support regular engagement and content consumption
 * 
 * Key Responsibilities:
 * - Personalize content feed
 * - Recommend events
 * - Suggest communities
 * - Track engagement patterns
 * - Encourage social interactions
 */

export interface J2ActiveUserAgent {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'active' | 'inactive';
}

export const j2ActiveUserAgent: J2ActiveUserAgent = {
  id: 'J2',
  name: 'Active User Journey',
  description: 'Regular engagement and content consumption support',
  version: '1.0.0',
  status: 'active',
};

/**
 * Get personalized suggestions for active users
 */
export function getPersonalizedSuggestions(userLocation: string, interests: string[]): Array<{
  type: 'event' | 'connection' | 'community' | 'content';
  title: string;
  description: string;
  action: string;
}> {
  return [
    {
      type: 'event',
      title: `Upcoming Events in ${userLocation}`,
      description: 'Milongas and workshops happening near you',
      action: '/events?location=nearby',
    },
    {
      type: 'connection',
      title: 'Dancers You May Know',
      description: 'Connect with dancers who share your interests',
      action: '/connections/suggestions',
    },
    {
      type: 'community',
      title: 'Join Your City\'s Community',
      description: 'Connect with local tango dancers',
      action: `/communities/${userLocation}`,
    },
    {
      type: 'content',
      title: 'Trending Memories',
      description: 'See what the community is sharing',
      action: '/feed',
    },
  ];
}

/**
 * Get engagement goals for active users
 */
export function getEngagementGoals(): Array<{
  id: string;
  title: string;
  target: number;
  reward: string;
}> {
  return [
    {
      id: 'weekly-login',
      title: 'Stay Connected',
      target: 3, // 3 logins per week
      reward: 'Active member badge',
    },
    {
      id: 'event-attendance',
      title: 'Join Events',
      target: 1, // 1 event per month
      reward: 'Event explorer badge',
    },
    {
      id: 'content-creation',
      title: 'Share Memories',
      target: 5, // 5 memories total
      reward: 'Storyteller badge',
    },
    {
      id: 'network-growth',
      title: 'Build Network',
      target: 10, // 10 connections
      reward: 'Social butterfly badge',
    },
  ];
}

/**
 * Check if user should graduate to J3 Power User
 */
export function shouldGraduateToJ3(metrics: {
  memoriesCount: number;
  connectionsCount: number;
  eventsOrganized: number;
  subscriptionTier: string;
  hasUsedAIFeatures: boolean;
}): boolean {
  return (
    metrics.memoriesCount >= 50 &&
    metrics.connectionsCount >= 50 &&
    metrics.eventsOrganized >= 3 &&
    (metrics.subscriptionTier === 'basic' ||
     metrics.subscriptionTier === 'enthusiast' ||
     metrics.subscriptionTier === 'professional' ||
     metrics.subscriptionTier === 'enterprise')
  );
}

// Export agent for registration
export default j2ActiveUserAgent;
