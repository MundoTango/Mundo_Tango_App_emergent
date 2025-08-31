/**
 * ESA LIFE CEO 61x21 - Layer 26: Recommendation Engine Service
 * Personalization, ML suggestions, content discovery
 */

import { EventEmitter } from 'events';

export interface UserProfile {
  userId: string;
  preferences: {
    tangoStyles: string[];
    eventTypes: string[];
    locations: string[];
    timeSlots: string[];
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  };
  behavior: {
    eventAttendance: string[];
    postInteractions: string[];
    searchHistory: string[];
    followedUsers: string[];
    joinedGroups: string[];
  };
  demographics: {
    age?: number;
    location: string;
    experience: number; // years dancing
  };
}

export interface RecommendationItem {
  id: string;
  type: 'event' | 'user' | 'group' | 'post' | 'venue';
  score: number;
  reasons: string[];
  metadata: Record<string, any>;
}

export interface RecommendationSet {
  userId: string;
  recommendations: RecommendationItem[];
  generatedAt: Date;
  algorithm: string;
  context: string;
}

class RecommendationEngineService extends EventEmitter {
  private userProfiles = new Map<string, UserProfile>();
  private recommendations = new Map<string, RecommendationSet[]>();
  private contentVectors = new Map<string, number[]>();
  
  constructor() {
    super();
    this.setupDefaultProfiles();
    console.log('[ESA Layer 26] Recommendation engine service initialized');
  }

  private setupDefaultProfiles() {
    // Sample user profiles for demonstration
    const sampleProfiles: UserProfile[] = [
      {
        userId: 'user1',
        preferences: {
          tangoStyles: ['argentinian', 'nuevo'],
          eventTypes: ['milonga', 'workshop'],
          locations: ['buenos aires', 'paris'],
          timeSlots: ['evening', 'weekend'],
          skillLevel: 'intermediate'
        },
        behavior: {
          eventAttendance: ['milonga_central', 'tango_festival_2024'],
          postInteractions: ['post1', 'post5', 'post12'],
          searchHistory: ['milonga tonight', 'tango shoes', 'dance partners'],
          followedUsers: ['instructor1', 'dancer2'],
          joinedGroups: ['paris_tango', 'nuevo_tango_lovers']
        },
        demographics: {
          age: 32,
          location: 'Paris, France',
          experience: 3
        }
      }
    ];

    sampleProfiles.forEach(profile => {
      this.userProfiles.set(profile.userId, profile);
    });
  }

  async generateRecommendations(
    userId: string,
    context: 'home_feed' | 'events' | 'users' | 'groups' | 'discover',
    limit = 10
  ): Promise<RecommendationItem[]> {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) {
      return this.getFallbackRecommendations(context, limit);
    }

    let recommendations: RecommendationItem[] = [];

    switch (context) {
      case 'events':
        recommendations = await this.recommendEvents(userProfile, limit);
        break;
      case 'users':
        recommendations = await this.recommendUsers(userProfile, limit);
        break;
      case 'groups':
        recommendations = await this.recommendGroups(userProfile, limit);
        break;
      case 'home_feed':
        recommendations = await this.recommendHomeFeed(userProfile, limit);
        break;
      case 'discover':
        recommendations = await this.recommendDiscover(userProfile, limit);
        break;
    }

    // Store recommendations
    const recommendationSet: RecommendationSet = {
      userId,
      recommendations,
      generatedAt: new Date(),
      algorithm: 'collaborative_content_hybrid',
      context
    };

    const userRecommendations = this.recommendations.get(userId) || [];
    userRecommendations.push(recommendationSet);
    this.recommendations.set(userId, userRecommendations.slice(-10)); // Keep last 10

    console.log(`[ESA Layer 26] Generated ${recommendations.length} recommendations for user ${userId} in context ${context}`);
    this.emit('recommendationsGenerated', recommendationSet);

    return recommendations;
  }

  private async recommendEvents(profile: UserProfile, limit: number): Promise<RecommendationItem[]> {
    // Simulate event recommendations based on user preferences
    const events = [
      {
        id: 'event1',
        title: 'Milonga at Salon Canning',
        location: 'Buenos Aires',
        style: 'argentinian',
        type: 'milonga',
        date: '2025-09-01',
        skillLevel: 'all'
      },
      {
        id: 'event2',
        title: 'Nuevo Tango Workshop',
        location: 'Paris',
        style: 'nuevo',
        type: 'workshop',
        date: '2025-09-05',
        skillLevel: 'intermediate'
      },
      {
        id: 'event3',
        title: 'Traditional Tango Evening',
        location: 'Madrid',
        style: 'traditional',
        type: 'milonga',
        date: '2025-09-10',
        skillLevel: 'advanced'
      }
    ];

    return events.map((event, index) => {
      let score = 0.5; // Base score
      const reasons: string[] = [];

      // Style preference match
      if (profile.preferences.tangoStyles.includes(event.style)) {
        score += 0.3;
        reasons.push(`Matches your ${event.style} tango preference`);
      }

      // Event type match
      if (profile.preferences.eventTypes.includes(event.type)) {
        score += 0.2;
        reasons.push(`${event.type} is in your preferred event types`);
      }

      // Skill level match
      if (event.skillLevel === profile.preferences.skillLevel || event.skillLevel === 'all') {
        score += 0.2;
        reasons.push(`Suitable for your ${profile.preferences.skillLevel} level`);
      }

      // Location preference
      const eventLocation = event.location.toLowerCase();
      if (profile.preferences.locations.some(loc => eventLocation.includes(loc))) {
        score += 0.15;
        reasons.push(`In your preferred location: ${event.location}`);
      }

      return {
        id: event.id,
        type: 'event' as const,
        score: Math.min(1, score),
        reasons,
        metadata: event
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  }

  private async recommendUsers(profile: UserProfile, limit: number): Promise<RecommendationItem[]> {
    // Simulate user recommendations based on common interests
    const users = [
      {
        id: 'user_instructor_maria',
        name: 'María González',
        role: 'instructor',
        location: 'Buenos Aires',
        specialties: ['argentinian', 'traditional'],
        followers: 1250,
        mutualConnections: 5
      },
      {
        id: 'user_dancer_carlos',
        name: 'Carlos Pérez',
        role: 'dancer',
        location: 'Paris',
        specialties: ['nuevo', 'vals'],
        followers: 450,
        mutualConnections: 12
      }
    ];

    return users.map(user => {
      let score = 0.4;
      const reasons: string[] = [];

      // Mutual connections boost
      if (user.mutualConnections > 0) {
        score += Math.min(0.3, user.mutualConnections * 0.02);
        reasons.push(`${user.mutualConnections} mutual connections`);
      }

      // Specialty match
      const commonSpecialties = user.specialties.filter(s => profile.preferences.tangoStyles.includes(s));
      if (commonSpecialties.length > 0) {
        score += 0.25;
        reasons.push(`Specializes in ${commonSpecialties.join(', ')}`);
      }

      // Location match
      if (user.location.toLowerCase() === profile.demographics.location.toLowerCase()) {
        score += 0.2;
        reasons.push('From your city');
      }

      // Popular users boost
      if (user.followers > 1000) {
        score += 0.1;
        reasons.push('Popular in the community');
      }

      return {
        id: user.id,
        type: 'user' as const,
        score: Math.min(1, score),
        reasons,
        metadata: user
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  }

  private async recommendGroups(profile: UserProfile, limit: number): Promise<RecommendationItem[]> {
    const groups = [
      {
        id: 'group_paris_tango',
        name: 'Paris Tango Community',
        location: 'Paris',
        focus: ['argentinian', 'social'],
        members: 850,
        activity: 'high'
      },
      {
        id: 'group_nuevo_lovers',
        name: 'Nuevo Tango Lovers',
        location: 'Global',
        focus: ['nuevo', 'contemporary'],
        members: 420,
        activity: 'medium'
      }
    ];

    return groups.map(group => {
      let score = 0.5;
      const reasons: string[] = [];

      // Style match
      const matchingStyles = group.focus.filter(s => profile.preferences.tangoStyles.includes(s));
      if (matchingStyles.length > 0) {
        score += 0.3;
        reasons.push(`Focuses on ${matchingStyles.join(', ')}`);
      }

      // Location match
      if (group.location === profile.demographics.location.split(',')[0]) {
        score += 0.2;
        reasons.push('Local community');
      }

      // Activity level
      if (group.activity === 'high') {
        score += 0.15;
        reasons.push('Very active community');
      }

      return {
        id: group.id,
        type: 'group' as const,
        score: Math.min(1, score),
        reasons,
        metadata: group
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  }

  private async recommendHomeFeed(profile: UserProfile, limit: number): Promise<RecommendationItem[]> {
    // Mix of different content types for home feed
    const eventRecs = await this.recommendEvents(profile, Math.ceil(limit * 0.4));
    const userRecs = await this.recommendUsers(profile, Math.ceil(limit * 0.3));
    const groupRecs = await this.recommendGroups(profile, Math.ceil(limit * 0.3));

    const allRecommendations = [...eventRecs, ...userRecs, ...groupRecs];
    return allRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async recommendDiscover(profile: UserProfile, limit: number): Promise<RecommendationItem[]> {
    // Discovery focuses on new and trending content
    const discoveries = [
      {
        id: 'trending_venue_1',
        type: 'venue' as const,
        score: 0.8,
        reasons: ['Trending in your area'],
        metadata: { name: 'New Tango Club', location: 'Downtown', trend_score: 95 }
      },
      {
        id: 'viral_post_1',
        type: 'post' as const,
        score: 0.75,
        reasons: ['Viral in tango community'],
        metadata: { title: 'Perfect tango embrace technique', engagement: 1250 }
      }
    ];

    return discoveries.slice(0, limit);
  }

  private getFallbackRecommendations(context: string, limit: number): RecommendationItem[] {
    // Generic recommendations for new users
    const fallbacks = [
      {
        id: 'beginner_guide',
        type: 'post' as const,
        score: 0.9,
        reasons: ['Great for beginners'],
        metadata: { title: 'Complete Tango Beginner Guide' }
      },
      {
        id: 'local_groups',
        type: 'group' as const,
        score: 0.85,
        reasons: ['Popular local community'],
        metadata: { name: 'Local Tango Meetup' }
      }
    ];

    return fallbacks.slice(0, limit);
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const currentProfile = this.userProfiles.get(userId);
    if (currentProfile) {
      const updatedProfile = { ...currentProfile, ...updates };
      this.userProfiles.set(userId, updatedProfile);
    } else {
      // Create new profile
      const newProfile: UserProfile = {
        userId,
        preferences: {
          tangoStyles: [],
          eventTypes: [],
          locations: [],
          timeSlots: [],
          skillLevel: 'beginner'
        },
        behavior: {
          eventAttendance: [],
          postInteractions: [],
          searchHistory: [],
          followedUsers: [],
          joinedGroups: []
        },
        demographics: {
          location: 'Unknown'
        },
        ...updates
      };
      this.userProfiles.set(userId, newProfile);
    }

    // Clear old recommendations to force regeneration
    this.recommendations.delete(userId);
    
    console.log(`[ESA Layer 26] Updated user profile: ${userId}`);
    this.emit('userProfileUpdated', userId);
  }

  async trackUserAction(
    userId: string, 
    action: 'view' | 'like' | 'attend' | 'join' | 'follow',
    targetId: string,
    targetType: 'event' | 'user' | 'group' | 'post'
  ): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    switch (action) {
      case 'attend':
        if (targetType === 'event' && !profile.behavior.eventAttendance.includes(targetId)) {
          profile.behavior.eventAttendance.push(targetId);
        }
        break;
      case 'like':
        if (targetType === 'post' && !profile.behavior.postInteractions.includes(targetId)) {
          profile.behavior.postInteractions.push(targetId);
        }
        break;
      case 'follow':
        if (targetType === 'user' && !profile.behavior.followedUsers.includes(targetId)) {
          profile.behavior.followedUsers.push(targetId);
        }
        break;
      case 'join':
        if (targetType === 'group' && !profile.behavior.joinedGroups.includes(targetId)) {
          profile.behavior.joinedGroups.push(targetId);
        }
        break;
    }

    this.userProfiles.set(userId, profile);
    
    // Update recommendations based on new behavior
    setTimeout(() => {
      this.generateRecommendations(userId, 'home_feed').catch(console.error);
    }, 1000);

    console.log(`[ESA Layer 26] Tracked action: ${userId} ${action} ${targetType} ${targetId}`);
  }

  getUserRecommendations(userId: string, context?: string): RecommendationSet[] {
    const userRecs = this.recommendations.get(userId) || [];
    return context ? userRecs.filter(r => r.context === context) : userRecs;
  }

  getSystemMetrics() {
    return {
      totalUserProfiles: this.userProfiles.size,
      totalRecommendationSets: Array.from(this.recommendations.values()).reduce((acc, sets) => acc + sets.length, 0),
      averageRecommendationsPerUser: this.recommendations.size > 0 
        ? Array.from(this.recommendations.values()).reduce((acc, sets) => acc + sets.length, 0) / this.recommendations.size 
        : 0,
      recentActivity: {
        last24h: Array.from(this.recommendations.values())
          .flat()
          .filter(r => r.generatedAt.getTime() > Date.now() - 24 * 60 * 60 * 1000)
          .length
      }
    };
  }
}

export const recommendationEngineService = new RecommendationEngineService();

// Export for Layer 57 (Automation Management) integration
export const setupRecommendationAutomation = () => {
  // Refresh recommendations for active users every 4 hours
  setInterval(() => {
    console.log('[ESA Layer 26] Refreshing recommendations for active users...');
    // This would identify active users and refresh their recommendations
  }, 4 * 60 * 60 * 1000);

  // Clean up old recommendation sets every day
  setInterval(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let cleaned = 0;
    
    for (const [userId, sets] of recommendationEngineService['recommendations'].entries()) {
      const validSets = sets.filter(set => set.generatedAt > sevenDaysAgo);
      if (validSets.length !== sets.length) {
        recommendationEngineService['recommendations'].set(userId, validSets);
        cleaned += sets.length - validSets.length;
      }
    }
    
    if (cleaned > 0) {
      console.log(`[ESA Layer 26] Cleaned up ${cleaned} old recommendation sets`);
    }
  }, 24 * 60 * 60 * 1000);
};