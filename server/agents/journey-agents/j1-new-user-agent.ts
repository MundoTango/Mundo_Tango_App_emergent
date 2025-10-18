/**
 * J1: New User Journey Agent
 * Phase 0 Task 0.5: Journey Orchestration
 * 
 * Purpose: Guide users through onboarding and first-time experience
 * 
 * Key Responsibilities:
 * - Welcome new users
 * - Guide profile setup
 * - Suggest first connections
 * - Introduce event discovery
 * - Encourage first post creation
 */

export interface J1NewUserAgent {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'active' | 'inactive';
}

export const j1NewUserAgent: J1NewUserAgent = {
  id: 'J1',
  name: 'New User Journey',
  description: 'Onboarding and first-time experience guide',
  version: '1.0.0',
  status: 'active',
};

/**
 * Get welcome message for new users
 */
export function getWelcomeMessage(userName: string): string {
  return `¡Hola ${userName}! 👋 Welcome to Mundo Tango, your global tango community. Let's get you started!`;
}

/**
 * Get onboarding tasks for new users
 */
export function getOnboardingTasks(): Array<{
  id: string;
  title: string;
  description: string;
  action: string;
  icon: string;
}> {
  return [
    {
      id: 'complete-profile',
      title: 'Complete Your Profile',
      description: 'Tell us about your tango journey - roles, experience, location',
      action: '/profile/edit',
      icon: 'User',
    },
    {
      id: 'first-connection',
      title: 'Make Your First Connection',
      description: 'Connect with other tango dancers in your city',
      action: '/connections/discover',
      icon: 'Users',
    },
    {
      id: 'explore-events',
      title: 'Explore Events',
      description: 'Find tango events and milongas near you',
      action: '/events',
      icon: 'Calendar',
    },
    {
      id: 'create-memory',
      title: 'Share Your First Memory',
      description: 'Post your first tango memory or experience',
      action: '/memories/create',
      icon: 'PlusCircle',
    },
    {
      id: 'accept-conduct',
      title: 'Review Code of Conduct',
      description: 'Understand our community guidelines',
      action: '/code-of-conduct',
      icon: 'Shield',
    },
  ];
}

/**
 * Get contextual tips based on onboarding progress
 */
export function getContextualTip(
  hasProfile: boolean,
  hasConnections: boolean,
  hasMemories: boolean
): string | null {
  if (!hasProfile) {
    return '💡 Complete your profile to help other dancers find you!';
  }
  
  if (!hasConnections) {
    return '💡 Connect with dancers in your city to discover events together!';
  }
  
  if (!hasMemories) {
    return '💡 Share your first tango memory to start building your story!';
  }
  
  return null; // User has completed basic onboarding
}

/**
 * Check if user should graduate from J1 to J2
 */
export function shouldGraduateToJ2(metrics: {
  hasCompletedOnboarding: boolean;
  memoriesCount: number;
  connectionsCount: number;
  daysSinceRegistration: number;
}): boolean {
  return (
    metrics.hasCompletedOnboarding &&
    metrics.memoriesCount >= 1 &&
    metrics.connectionsCount >= 1 &&
    metrics.daysSinceRegistration >= 7
  );
}

// Export agent for registration
export default j1NewUserAgent;
