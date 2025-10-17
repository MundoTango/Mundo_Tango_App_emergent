/**
 * ESA LIFE CEO 61x21 - Layer 27: Gamification Service
 * Points, badges, achievements, leaderboards, challenges
 */

import { EventEmitter } from 'events';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'social' | 'learning' | 'event' | 'community' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: {
    type: string;
    target: number;
    timeframe?: string;
  }[];
  unlockConditions?: string[];
}

export interface UserGameProfile {
  userId: string;
  level: number;
  totalPoints: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  streak: {
    current: number;
    longest: number;
    type: 'daily_login' | 'event_attendance' | 'post_activity';
    lastUpdate: Date;
  };
  achievements: {
    achievementId: string;
    unlockedAt: Date;
    progress?: number;
  }[];
  badges: string[];
  stats: {
    eventsAttended: number;
    postsCreated: number;
    commentsPosted: number;
    friendsReferred: number;
    daysActive: number;
    tangoStylesLearned: number;
  };
  challenges: {
    challengeId: string;
    progress: number;
    target: number;
    startedAt: Date;
    completedAt?: Date;
  }[];
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  category: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  target: number;
  metric: string;
  reward: {
    points: number;
    badge?: string;
    achievement?: string;
  };
  duration: number; // in hours
  isActive: boolean;
  participants: string[];
  startDate: Date;
  endDate: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatar?: string;
  points: number;
  level: number;
  position: number;
  badges: string[];
  change: number; // position change from previous period
}

class GamificationService extends EventEmitter {
  private userProfiles = new Map<string, UserGameProfile>();
  private achievements = new Map<string, Achievement>();
  private challenges = new Map<string, Challenge>();
  private leaderboards = new Map<string, LeaderboardEntry[]>();

  constructor() {
    super();
    this.setupAchievements();
    this.setupChallenges();
    console.log('[ESA Layer 27] Gamification service initialized');
  }

  private setupAchievements() {
    const achievements: Achievement[] = [
      // Social Achievements
      {
        id: 'first_post',
        name: 'First Steps',
        description: 'Posted your first content in the community',
        icon: '👶',
        category: 'social',
        rarity: 'common',
        points: 50,
        requirements: [{ type: 'posts_created', target: 1 }]
      },
      {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Made 50 connections in the tango community',
        icon: '🦋',
        category: 'social',
        rarity: 'rare',
        points: 300,
        requirements: [{ type: 'friends_made', target: 50 }]
      },
      {
        id: 'community_leader',
        name: 'Community Leader',
        description: 'Received 100 likes on your posts',
        icon: '👑',
        category: 'social',
        rarity: 'epic',
        points: 500,
        requirements: [{ type: 'post_likes_received', target: 100 }]
      },

      // Learning Achievements
      {
        id: 'tango_student',
        name: 'Tango Student',
        description: 'Attended your first tango workshop',
        icon: '📚',
        category: 'learning',
        rarity: 'common',
        points: 75,
        requirements: [{ type: 'workshops_attended', target: 1 }]
      },
      {
        id: 'style_explorer',
        name: 'Style Explorer',
        description: 'Tried 3 different tango styles',
        icon: '🌟',
        category: 'learning',
        rarity: 'rare',
        points: 250,
        requirements: [{ type: 'tango_styles_learned', target: 3 }]
      },
      {
        id: 'tango_master',
        name: 'Tango Master',
        description: 'Mastered 5 tango styles and taught others',
        icon: '🎖️',
        category: 'learning',
        rarity: 'legendary',
        points: 1000,
        requirements: [
          { type: 'tango_styles_learned', target: 5 },
          { type: 'workshops_taught', target: 1 }
        ]
      },

      // Event Achievements
      {
        id: 'milonga_regular',
        name: 'Milonga Regular',
        description: 'Attended 10 milongas',
        icon: '💃',
        category: 'event',
        rarity: 'common',
        points: 200,
        requirements: [{ type: 'milongas_attended', target: 10 }]
      },
      {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Danced until 3 AM at 5 different milongas',
        icon: '🦉',
        category: 'event',
        rarity: 'rare',
        points: 300,
        requirements: [{ type: 'late_night_events', target: 5 }]
      },
      {
        id: 'festival_goer',
        name: 'Festival Goer',
        description: 'Attended 3 tango festivals',
        icon: '🎪',
        category: 'event',
        rarity: 'epic',
        points: 600,
        requirements: [{ type: 'festivals_attended', target: 3 }]
      },

      // Community Achievements
      {
        id: 'event_organizer',
        name: 'Event Organizer',
        description: 'Organized your first tango event',
        icon: '📅',
        category: 'community',
        rarity: 'rare',
        points: 400,
        requirements: [{ type: 'events_organized', target: 1 }]
      },
      {
        id: 'community_builder',
        name: 'Community Builder',
        description: 'Created a group with 50+ members',
        icon: '🏗️',
        category: 'community',
        rarity: 'epic',
        points: 750,
        requirements: [{ type: 'group_members_recruited', target: 50 }]
      },

      // Special Achievements
      {
        id: 'early_adopter',
        name: 'Early Adopter',
        description: 'One of the first 100 users on Mundo Tango',
        icon: '🚀',
        category: 'special',
        rarity: 'legendary',
        points: 1500,
        requirements: [{ type: 'user_id_number', target: 100 }]
      },
      {
        id: 'streak_champion',
        name: 'Streak Champion',
        description: 'Maintained a 30-day activity streak',
        icon: '🔥',
        category: 'special',
        rarity: 'epic',
        points: 500,
        requirements: [{ type: 'activity_streak_days', target: 30 }]
      }
    ];

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });

    console.log(`[ESA Layer 27] Loaded ${achievements.length} achievements`);
  }

  private setupChallenges() {
    const challenges: Challenge[] = [
      {
        id: 'weekly_social',
        name: 'Social Week Challenge',
        description: 'Make 3 new connections this week',
        category: 'weekly',
        target: 3,
        metric: 'friends_made',
        reward: { points: 200, badge: 'social_week_winner' },
        duration: 168, // 7 days in hours
        isActive: true,
        participants: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'monthly_events',
        name: 'Event Enthusiast',
        description: 'Attend 8 events this month',
        category: 'monthly',
        target: 8,
        metric: 'events_attended',
        reward: { points: 500, achievement: 'event_champion' },
        duration: 720, // 30 days in hours
        isActive: true,
        participants: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'daily_login',
        name: 'Daily Dedication',
        description: 'Log in every day this week',
        category: 'daily',
        target: 7,
        metric: 'daily_logins',
        reward: { points: 100, badge: 'dedicated_dancer' },
        duration: 168,
        isActive: true,
        participants: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ];

    challenges.forEach(challenge => {
      this.challenges.set(challenge.id, challenge);
    });

    console.log(`[ESA Layer 27] Loaded ${challenges.length} active challenges`);
  }

  async getUserProfile(userId: string): Promise<UserGameProfile> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = this.createDefaultProfile(userId);
      this.userProfiles.set(userId, profile);
    }

    return profile;
  }

  private createDefaultProfile(userId: string): UserGameProfile {
    return {
      userId,
      level: 1,
      totalPoints: 0,
      currentLevelPoints: 0,
      nextLevelPoints: 100,
      streak: {
        current: 0,
        longest: 0,
        type: 'daily_login',
        lastUpdate: new Date()
      },
      achievements: [],
      badges: [],
      stats: {
        eventsAttended: 0,
        postsCreated: 0,
        commentsPosted: 0,
        friendsReferred: 0,
        daysActive: 0,
        tangoStylesLearned: 0
      },
      challenges: []
    };
  }

  async awardPoints(
    userId: string, 
    points: number, 
    reason: string, 
    category: 'post' | 'event' | 'social' | 'challenge' | 'achievement' = 'post'
  ): Promise<void> {
    const profile = await this.getUserProfile(userId);
    
    profile.totalPoints += points;
    profile.currentLevelPoints += points;
    
    // Check for level up
    while (profile.currentLevelPoints >= profile.nextLevelPoints) {
      profile.currentLevelPoints -= profile.nextLevelPoints;
      profile.level++;
      profile.nextLevelPoints = this.calculateNextLevelPoints(profile.level);
      
      await this.handleLevelUp(userId, profile.level);
    }

    this.userProfiles.set(userId, profile);
    
    this.emit('pointsAwarded', { userId, points, reason, category, newLevel: profile.level });
    console.log(`[ESA Layer 27] Awarded ${points} points to user ${userId}: ${reason}`);
  }

  private calculateNextLevelPoints(level: number): number {
    // Exponential growth: each level requires more points
    return Math.floor(100 * Math.pow(1.2, level - 1));
  }

  private async handleLevelUp(userId: string, newLevel: number): Promise<void> {
    // Level up rewards
    const bonusPoints = newLevel * 10;
    const profile = await this.getUserProfile(userId);
    profile.totalPoints += bonusPoints;

    // Special level milestone rewards
    if (newLevel === 5) {
      await this.unlockAchievement(userId, 'tango_student');
    } else if (newLevel === 10) {
      await this.awardBadge(userId, 'veteran_dancer');
    } else if (newLevel === 25) {
      await this.unlockAchievement(userId, 'community_leader');
    }

    this.emit('levelUp', { userId, newLevel, bonusPoints });
    console.log(`[ESA Layer 27] User ${userId} leveled up to level ${newLevel}! Bonus: ${bonusPoints} points`);
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<boolean> {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) return false;

    const profile = await this.getUserProfile(userId);
    
    // Check if already unlocked
    if (profile.achievements.some(a => a.achievementId === achievementId)) {
      return false;
    }

    // Check requirements
    const meetsRequirements = await this.checkAchievementRequirements(userId, achievement);
    if (!meetsRequirements) return false;

    // Unlock achievement
    profile.achievements.push({
      achievementId,
      unlockedAt: new Date()
    });

    // Award points
    await this.awardPoints(userId, achievement.points, `Achievement: ${achievement.name}`, 'achievement');

    this.userProfiles.set(userId, profile);
    
    this.emit('achievementUnlocked', { userId, achievement });
    console.log(`[ESA Layer 27] User ${userId} unlocked achievement: ${achievement.name} (+${achievement.points} points)`);

    return true;
  }

  private async checkAchievementRequirements(userId: string, achievement: Achievement): Promise<boolean> {
    const profile = await this.getUserProfile(userId);
    
    for (const requirement of achievement.requirements) {
      let currentValue = 0;
      
      switch (requirement.type) {
        case 'posts_created':
          currentValue = profile.stats.postsCreated;
          break;
        case 'events_attended':
          currentValue = profile.stats.eventsAttended;
          break;
        case 'friends_made':
          currentValue = profile.stats.friendsReferred;
          break;
        case 'tango_styles_learned':
          currentValue = profile.stats.tangoStylesLearned;
          break;
        case 'activity_streak_days':
          currentValue = profile.streak.current;
          break;
        default:
          currentValue = 0;
      }
      
      if (currentValue < requirement.target) {
        return false;
      }
    }
    
    return true;
  }

  async awardBadge(userId: string, badgeId: string): Promise<void> {
    const profile = await this.getUserProfile(userId);
    
    if (!profile.badges.includes(badgeId)) {
      profile.badges.push(badgeId);
      this.userProfiles.set(userId, profile);
      
      this.emit('badgeAwarded', { userId, badgeId });
      console.log(`[ESA Layer 27] User ${userId} earned badge: ${badgeId}`);
    }
  }

  async updateUserStats(userId: string, statUpdates: Partial<UserGameProfile['stats']>): Promise<void> {
    const profile = await this.getUserProfile(userId);
    
    Object.entries(statUpdates).forEach(([key, value]) => {
      if (typeof value === 'number') {
        (profile.stats as any)[key] = value;
      }
    });
    
    this.userProfiles.set(userId, profile);
    
    // Check for new achievements
    await this.checkAndUnlockAchievements(userId);
    
    this.emit('statsUpdated', { userId, statUpdates });
  }

  private async checkAndUnlockAchievements(userId: string): Promise<void> {
    const profile = await this.getUserProfile(userId);
    const unlockedAchievementIds = profile.achievements.map(a => a.achievementId);
    
    for (const [achievementId, achievement] of this.achievements) {
      if (!unlockedAchievementIds.includes(achievementId)) {
        await this.unlockAchievement(userId, achievementId);
      }
    }
  }

  async updateStreak(userId: string, streakType: UserGameProfile['streak']['type']): Promise<void> {
    const profile = await this.getUserProfile(userId);
    const now = new Date();
    const lastUpdate = profile.streak.lastUpdate;
    
    // Check if it's been more than 24 hours (for daily streaks)
    const timeDiff = now.getTime() - lastUpdate.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff >= 24 && hoursDiff < 48) {
      // Continue streak
      profile.streak.current++;
      if (profile.streak.current > profile.streak.longest) {
        profile.streak.longest = profile.streak.current;
      }
    } else if (hoursDiff >= 48) {
      // Break streak
      profile.streak.current = 1;
    }
    // If less than 24 hours, do nothing (already counted today)
    
    profile.streak.type = streakType;
    profile.streak.lastUpdate = now;
    
    this.userProfiles.set(userId, profile);
    
    // Award streak milestone points
    if (profile.streak.current > 0 && profile.streak.current % 7 === 0) {
      await this.awardPoints(userId, 50 * (profile.streak.current / 7), `${profile.streak.current}-day streak milestone!`);
    }
    
    this.emit('streakUpdated', { userId, streak: profile.streak });
  }

  async joinChallenge(userId: string, challengeId: string): Promise<boolean> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge || !challenge.isActive) return false;
    
    const profile = await this.getUserProfile(userId);
    
    // Check if already participating
    if (profile.challenges.some(c => c.challengeId === challengeId)) {
      return false;
    }
    
    // Add to user's challenges
    profile.challenges.push({
      challengeId,
      progress: 0,
      target: challenge.target,
      startedAt: new Date()
    });
    
    // Add to challenge participants
    if (!challenge.participants.includes(userId)) {
      challenge.participants.push(userId);
    }
    
    this.userProfiles.set(userId, profile);
    this.challenges.set(challengeId, challenge);
    
    this.emit('challengeJoined', { userId, challengeId });
    console.log(`[ESA Layer 27] User ${userId} joined challenge: ${challenge.name}`);
    
    return true;
  }

  async updateChallengeProgress(userId: string, metric: string, increment = 1): Promise<void> {
    const profile = await this.getUserProfile(userId);
    
    for (const userChallenge of profile.challenges) {
      if (userChallenge.completedAt) continue; // Skip completed challenges
      
      const challenge = this.challenges.get(userChallenge.challengeId);
      if (!challenge || challenge.metric !== metric) continue;
      
      userChallenge.progress += increment;
      
      // Check if challenge completed
      if (userChallenge.progress >= userChallenge.target) {
        userChallenge.completedAt = new Date();
        
        // Award challenge rewards
        await this.awardPoints(userId, challenge.reward.points, `Challenge completed: ${challenge.name}`, 'challenge');
        
        if (challenge.reward.badge) {
          await this.awardBadge(userId, challenge.reward.badge);
        }
        
        if (challenge.reward.achievement) {
          await this.unlockAchievement(userId, challenge.reward.achievement);
        }
        
        this.emit('challengeCompleted', { userId, challenge });
        console.log(`[ESA Layer 27] User ${userId} completed challenge: ${challenge.name}`);
      }
    }
    
    this.userProfiles.set(userId, profile);
  }

  async getLeaderboard(
    type: 'points' | 'level' | 'achievements' | 'streak',
    period: 'all_time' | 'monthly' | 'weekly' = 'all_time',
    limit = 50
  ): Promise<LeaderboardEntry[]> {
    const users = Array.from(this.userProfiles.values());
    
    let leaderboard: LeaderboardEntry[] = users.map(profile => ({
      userId: profile.userId,
      userName: `User ${profile.userId}`, // Would fetch real name from user service
      points: profile.totalPoints,
      level: profile.level,
      position: 0,
      badges: profile.badges,
      change: 0 // Would calculate from historical data
    }));
    
    // Sort based on type
    switch (type) {
      case 'points':
        leaderboard.sort((a, b) => b.points - a.points);
        break;
      case 'level':
        leaderboard.sort((a, b) => b.level - a.level || b.points - a.points);
        break;
      case 'achievements':
        leaderboard.sort((a, b) => {
          const aAchievements = users.find(u => u.userId === a.userId)?.achievements.length || 0;
          const bAchievements = users.find(u => u.userId === b.userId)?.achievements.length || 0;
          return bAchievements - aAchievements;
        });
        break;
      case 'streak':
        leaderboard.sort((a, b) => {
          const aStreak = users.find(u => u.userId === a.userId)?.streak.longest || 0;
          const bStreak = users.find(u => u.userId === b.userId)?.streak.longest || 0;
          return bStreak - aStreak;
        });
        break;
    }
    
    // Assign positions
    leaderboard.forEach((entry, index) => {
      entry.position = index + 1;
    });
    
    const result = leaderboard.slice(0, limit);
    this.leaderboards.set(`${type}_${period}`, result);
    
    return result;
  }

  getActiveChallenges(): Challenge[] {
    return Array.from(this.challenges.values()).filter(c => c.isActive);
  }

  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  getUserAchievements(userId: string): Achievement[] {
    const profile = this.userProfiles.get(userId);
    if (!profile) return [];
    
    return profile.achievements.map(ua => this.achievements.get(ua.achievementId)!).filter(Boolean);
  }

  getSystemMetrics() {
    const profiles = Array.from(this.userProfiles.values());
    const totalAchievementsUnlocked = profiles.reduce((acc, p) => acc + p.achievements.length, 0);
    const totalChallengesCompleted = profiles.reduce((acc, p) => 
      acc + p.challenges.filter(c => c.completedAt).length, 0);
    
    return {
      totalUsers: profiles.length,
      totalAchievements: this.achievements.size,
      totalChallenges: this.challenges.size,
      activeChallenges: Array.from(this.challenges.values()).filter(c => c.isActive).length,
      achievementsUnlocked: totalAchievementsUnlocked,
      challengesCompleted: totalChallengesCompleted,
      averageLevel: profiles.reduce((acc, p) => acc + p.level, 0) / profiles.length || 0,
      averagePoints: profiles.reduce((acc, p) => acc + p.totalPoints, 0) / profiles.length || 0,
      topStreak: Math.max(...profiles.map(p => p.streak.longest), 0)
    };
  }
}

export const gamificationService = new GamificationService();

// Export for Layer 57 (Automation Management) integration
export const setupGamificationAutomation = () => {
  // Update challenge status every hour
  setInterval(() => {
    const now = new Date();
    let expiredCount = 0;
    
    for (const [id, challenge] of gamificationService['challenges'].entries()) {
      if (challenge.isActive && challenge.endDate < now) {
        challenge.isActive = false;
        gamificationService['challenges'].set(id, challenge);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      console.log(`[ESA Layer 27] Expired ${expiredCount} challenges`);
    }
  }, 60 * 60 * 1000);

  // Generate leaderboards every 6 hours
  setInterval(async () => {
    console.log('[ESA Layer 27] Updating leaderboards...');
    await gamificationService.getLeaderboard('points');
    await gamificationService.getLeaderboard('level');
    await gamificationService.getLeaderboard('achievements');
  }, 6 * 60 * 60 * 1000);
};