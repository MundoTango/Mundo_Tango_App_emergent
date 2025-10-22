/**
 * Onboarding Service
 * MB.MD Track 7: Onboarding Infrastructure
 * Implements: User tutorials, interactive guides, progress tracking, gamification
 */

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: string;
  completed: boolean;
  order: number;
  category: 'setup' | 'discovery' | 'engagement' | 'mastery';
}

export interface UserProgress {
  userId: number;
  completedSteps: string[];
  currentStep: string | null;
  level: number;
  xp: number;
  achievements: string[];
  streakDays: number;
  lastActive: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  category: 'social' | 'content' | 'engagement' | 'milestone';
  requirement: {
    type: 'count' | 'streak' | 'unique';
    metric: string;
    target: number;
  };
}

class OnboardingService {
  private readonly XP_PER_LEVEL = 1000;
  
  /**
   * Get onboarding steps for user
   */
  getOnboardingSteps(userId: number): OnboardingStep[] {
    return [
      {
        id: 'complete_profile',
        title: 'Complete Your Profile',
        description: 'Add a photo and bio to help others connect with you',
        action: '/profile/edit',
        completed: false,
        order: 1,
        category: 'setup',
      },
      {
        id: 'create_first_memory',
        title: 'Share Your First Memory',
        description: 'Post a photo or story about your tango journey',
        action: '/memories/new',
        completed: false,
        order: 2,
        category: 'engagement',
      },
      {
        id: 'join_local_group',
        title: 'Join Your Local Community',
        description: 'Connect with dancers in your city',
        action: '/groups/local',
        completed: false,
        order: 3,
        category: 'discovery',
      },
      {
        id: 'rsvp_first_event',
        title: 'RSVP to an Event',
        description: 'Find and attend a tango event near you',
        action: '/events',
        completed: false,
        order: 4,
        category: 'engagement',
      },
      {
        id: 'connect_friends',
        title: 'Connect with Dancers',
        description: 'Follow at least 5 other dancers',
        action: '/discover',
        completed: false,
        order: 5,
        category: 'social',
      },
    ];
  }

  /**
   * Mark step as completed
   */
  completeStep(userId: number, stepId: string): {
    xpGained: number;
    levelUp: boolean;
    newLevel?: number;
  } {
    const xpGained = 100;
    const levelUp = false; // Would check against user's current XP
    
    return {
      xpGained,
      levelUp,
      newLevel: levelUp ? 2 : undefined,
    };
  }

  /**
   * Get user progress
   */
  getUserProgress(userId: number): UserProgress {
    return {
      userId,
      completedSteps: ['complete_profile'],
      currentStep: 'create_first_memory',
      level: 1,
      xp: 250,
      achievements: ['first_steps'],
      streakDays: 3,
      lastActive: new Date(),
    };
  }

  /**
   * Award XP to user
   */
  awardXP(userId: number, amount: number, reason: string): {
    newXP: number;
    levelUp: boolean;
    newLevel?: number;
  } {
    // This would update database
    const currentXP = 250; // Mock current XP
    const newXP = currentXP + amount;
    const currentLevel = Math.floor(currentXP / this.XP_PER_LEVEL) + 1;
    const newLevel = Math.floor(newXP / this.XP_PER_LEVEL) + 1;
    const levelUp = newLevel > currentLevel;

    console.log(`🎖️ User ${userId} earned ${amount} XP for: ${reason}`);

    return {
      newXP,
      levelUp,
      newLevel: levelUp ? newLevel : undefined,
    };
  }

  /**
   * Check and unlock achievements
   */
  checkAchievements(userId: number): Achievement[] {
    const allAchievements = this.getAllAchievements();
    const unlocked: Achievement[] = [];

    // This would check user's actual metrics
    // For now, return mock data
    return unlocked;
  }

  /**
   * Get all available achievements
   */
  getAllAchievements(): Achievement[] {
    return [
      {
        id: 'first_steps',
        title: 'First Steps',
        description: 'Complete your first onboarding step',
        icon: '👣',
        xpReward: 50,
        category: 'milestone',
        requirement: {
          type: 'count',
          metric: 'onboarding_steps',
          target: 1,
        },
      },
      {
        id: 'social_butterfly',
        title: 'Social Butterfly',
        description: 'Connect with 10 dancers',
        icon: '🦋',
        xpReward: 200,
        category: 'social',
        requirement: {
          type: 'count',
          metric: 'connections',
          target: 10,
        },
      },
      {
        id: 'memory_keeper',
        title: 'Memory Keeper',
        description: 'Share 10 memories',
        icon: '📸',
        xpReward: 300,
        category: 'content',
        requirement: {
          type: 'count',
          metric: 'memories',
          target: 10,
        },
      },
      {
        id: 'event_enthusiast',
        title: 'Event Enthusiast',
        description: 'RSVP to 5 events',
        icon: '🎭',
        xpReward: 250,
        category: 'engagement',
        requirement: {
          type: 'count',
          metric: 'event_rsvps',
          target: 5,
        },
      },
      {
        id: 'streak_master',
        title: 'Streak Master',
        description: 'Visit 7 days in a row',
        icon: '🔥',
        xpReward: 500,
        category: 'engagement',
        requirement: {
          type: 'streak',
          metric: 'daily_login',
          target: 7,
        },
      },
    ];
  }

  /**
   * Generate tooltip for UI element
   */
  generateTooltip(elementId: string): {
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right';
  } | null {
    const tooltips: Record<string, any> = {
      mr_blue_button: {
        title: 'Meet Mr Blue',
        content: 'Your AI companion for all things Mundo Tango',
        position: 'left',
      },
      visual_editor_button: {
        title: 'Visual Editor',
        content: 'Design and customize your experience',
        position: 'left',
      },
      create_memory: {
        title: 'Share a Memory',
        content: 'Post photos and stories from your tango journey',
        position: 'top',
      },
    };

    return tooltips[elementId] || null;
  }

  /**
   * Get interactive tour for page
   */
  getPageTour(page: string): Array<{
    step: number;
    target: string;
    title: string;
    content: string;
    placement: 'top' | 'bottom' | 'left' | 'right';
  }> {
    const tours: Record<string, any[]> = {
      feed: [
        {
          step: 1,
          target: '#create-memory',
          title: 'Share Your Moments',
          content: 'Click here to post photos and stories',
          placement: 'bottom',
        },
        {
          step: 2,
          target: '#feed-filters',
          title: 'Filter Your Feed',
          content: 'Customize what you see from your community',
          placement: 'bottom',
        },
        {
          step: 3,
          target: '#mr-blue',
          title: 'AI Assistant',
          content: 'Get help from Mr Blue anytime',
          placement: 'left',
        },
      ],
    };

    return tours[page] || [];
  }
}

// Export singleton instance
export const onboardingService = new OnboardingService();
