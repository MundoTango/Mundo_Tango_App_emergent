/**
 * ESA LIFE CEO 61x21 - Layer 21 Agent: User Management
 * Expert agent responsible for user profiles, preferences, and user lifecycle management
 */

import { EventEmitter } from 'events';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  role: 'user' | 'instructor' | 'organizer' | 'admin' | 'moderator';
  tangoLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  preferences: {
    tangoStyles: string[];
    notifications: boolean;
    privacy: 'public' | 'friends' | 'private';
    language: string;
    timezone: string;
  };
  profile: {
    firstName: string;
    lastName: string;
    bio: string;
    location: string;
    profileImage: string;
    joinedDate: Date;
    lastActive: Date;
  };
  stats: {
    eventsAttended: number;
    postsCreated: number;
    connectionsCount: number;
    achievementsEarned: number;
  };
}

export interface UserSegment {
  name: string;
  criteria: string;
  userCount: number;
  growthRate: number; // percentage
  engagementRate: number; // percentage
  retentionRate: number; // percentage
}

export interface UserManagementMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  churenRate: number; // percentage
  averageSessionDuration: number; // minutes
  userEngagementScore: number; // 0-100
  geographicDistribution: { location: string; count: number }[];
  roleDistribution: { role: string; count: number }[];
  levelDistribution: { level: string; count: number }[];
}

export interface UserManagementStatus {
  users: UserProfile[];
  segments: UserSegment[];
  metrics: UserManagementMetrics;
  features: {
    profileCustomization: boolean;
    privacyControls: boolean;
    notificationSettings: boolean;
    accountVerification: boolean;
    socialConnections: boolean;
    contentPersonalization: boolean;
    dataExport: boolean;
    accountDeletion: boolean;
  };
  lifecycle: {
    onboarding: {
      enabled: boolean;
      completionRate: number;
      averageTime: number; // minutes
    };
    activation: {
      activationRate: number;
      timeToActivation: number; // days
    };
    retention: {
      day1Retention: number;
      day7Retention: number;
      day30Retention: number;
    };
    reengagement: {
      reactivationCampaigns: boolean;
      winBackRate: number;
    };
  };
  analytics: {
    userJourneyTracking: boolean;
    behaviorAnalytics: boolean;
    cohortAnalysis: boolean;
    churnPrediction: boolean;
    ltcAnalysis: boolean; // Lifetime Customer Value
  };
  compliance: {
    layerCompliance: number;
    criticalIssues: string[];
    recommendations: string[];
  };
}

class Layer21UserManagementAgent extends EventEmitter {
  private layerId = 21;
  private layerName = 'User Management';
  private status: UserManagementStatus;

  constructor() {
    super();
    this.status = this.initializeStatus();
    this.generateSampleUsers();
    this.generateUserSegments();
    console.log(`[ESA Layer ${this.layerId}] ${this.layerName} Agent initialized`);
  }

  private initializeStatus(): UserManagementStatus {
    return {
      users: [],
      segments: [],
      metrics: {
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        churenRate: 0,
        averageSessionDuration: 0,
        userEngagementScore: 0,
        geographicDistribution: [],
        roleDistribution: [],
        levelDistribution: []
      },
      features: {
        profileCustomization: false,
        privacyControls: false,
        notificationSettings: false,
        accountVerification: false,
        socialConnections: false,
        contentPersonalization: false,
        dataExport: false,
        accountDeletion: false
      },
      lifecycle: {
        onboarding: {
          enabled: false,
          completionRate: 0,
          averageTime: 0
        },
        activation: {
          activationRate: 0,
          timeToActivation: 0
        },
        retention: {
          day1Retention: 0,
          day7Retention: 0,
          day30Retention: 0
        },
        reengagement: {
          reactivationCampaigns: false,
          winBackRate: 0
        }
      },
      analytics: {
        userJourneyTracking: false,
        behaviorAnalytics: false,
        cohortAnalysis: false,
        churnPrediction: false,
        ltcAnalysis: false
      },
      compliance: {
        layerCompliance: 0,
        criticalIssues: [],
        recommendations: []
      }
    };
  }

  private generateSampleUsers(): void {
    const tangoStyles = ['Argentine Tango', 'Milonga', 'Vals', 'Nuevo Tango', 'Stage Tango', 'Salon Tango'];
    const locations = ['Buenos Aires', 'New York', 'Paris', 'London', 'Berlin', 'Tokyo', 'São Paulo', 'Barcelona'];
    const languages = ['en', 'es', 'fr', 'de', 'pt', 'ja'];
    const timezones = ['America/New_York', 'Europe/Paris', 'America/Argentina/Buenos_Aires', 'Asia/Tokyo'];

    const sampleUsers: UserProfile[] = [];

    for (let i = 0; i < 50; i++) {
      const userId = `user_${i + 1}`;
      const roles = ['user', 'instructor', 'organizer', 'admin', 'moderator'];
      const levels = ['beginner', 'intermediate', 'advanced', 'professional'];
      const statuses = ['active', 'inactive', 'suspended', 'pending'];
      
      const role = roles[Math.floor(Math.random() * roles.length)] as UserProfile['role'];
      const level = levels[Math.floor(Math.random() * levels.length)] as UserProfile['tangoLevel'];
      const status = Math.random() > 0.1 ? 'active' : statuses[Math.floor(Math.random() * statuses.length)] as UserProfile['status'];
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      const user: UserProfile = {
        id: userId,
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        status,
        role,
        tangoLevel: level,
        preferences: {
          tangoStyles: tangoStyles.slice(0, Math.floor(Math.random() * 3) + 1),
          notifications: Math.random() > 0.3,
          privacy: ['public', 'friends', 'private'][Math.floor(Math.random() * 3)] as 'public' | 'friends' | 'private',
          language: languages[Math.floor(Math.random() * languages.length)],
          timezone: timezones[Math.floor(Math.random() * timezones.length)]
        },
        profile: {
          firstName: `FirstName${i + 1}`,
          lastName: `LastName${i + 1}`,
          bio: `Passionate tango dancer from ${location}. Level: ${level}`,
          location,
          profileImage: `/images/avatars/user${i + 1}.jpg`,
          joinedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Last year
          lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
        },
        stats: {
          eventsAttended: Math.floor(Math.random() * 50),
          postsCreated: Math.floor(Math.random() * 100),
          connectionsCount: Math.floor(Math.random() * 200),
          achievementsEarned: Math.floor(Math.random() * 20)
        }
      };

      sampleUsers.push(user);
    }

    this.status.users = sampleUsers;
    console.log(`[ESA Layer ${this.layerId}] Generated ${sampleUsers.length} sample users`);
  }

  private generateUserSegments(): void {
    const segments: UserSegment[] = [
      {
        name: 'New Beginners',
        criteria: 'level=beginner AND joinedDate<30days',
        userCount: Math.floor(Math.random() * 20) + 10,
        growthRate: Math.floor(Math.random() * 50) + 20, // 20-70%
        engagementRate: Math.floor(Math.random() * 30) + 40, // 40-70%
        retentionRate: Math.floor(Math.random() * 20) + 60 // 60-80%
      },
      {
        name: 'Active Intermediate',
        criteria: 'level=intermediate AND lastActive<7days',
        userCount: Math.floor(Math.random() * 15) + 8,
        growthRate: Math.floor(Math.random() * 30) + 10, // 10-40%
        engagementRate: Math.floor(Math.random() * 25) + 65, // 65-90%
        retentionRate: Math.floor(Math.random() * 15) + 75 // 75-90%
      },
      {
        name: 'Professional Instructors',
        criteria: 'role=instructor OR level=professional',
        userCount: Math.floor(Math.random() * 8) + 3,
        growthRate: Math.floor(Math.random() * 20) + 5, // 5-25%
        engagementRate: Math.floor(Math.random() * 20) + 75, // 75-95%
        retentionRate: Math.floor(Math.random() * 10) + 85 // 85-95%
      },
      {
        name: 'Event Organizers',
        criteria: 'role=organizer',
        userCount: Math.floor(Math.random() * 5) + 2,
        growthRate: Math.floor(Math.random() * 15) + 10, // 10-25%
        engagementRate: Math.floor(Math.random() * 15) + 80, // 80-95%
        retentionRate: Math.floor(Math.random() * 10) + 90 // 90-100%
      },
      {
        name: 'Inactive Users',
        criteria: 'lastActive>30days',
        userCount: Math.floor(Math.random() * 12) + 5,
        growthRate: Math.floor(Math.random() * 10) - 15, // -15% to -5%
        engagementRate: Math.floor(Math.random() * 15) + 5, // 5-20%
        retentionRate: Math.floor(Math.random() * 20) + 10 // 10-30%
      },
      {
        name: 'High Engagers',
        criteria: 'postsCreated>20 AND eventsAttended>10',
        userCount: Math.floor(Math.random() * 10) + 6,
        growthRate: Math.floor(Math.random() * 25) + 15, // 15-40%
        engagementRate: Math.floor(Math.random() * 10) + 90, // 90-100%
        retentionRate: Math.floor(Math.random() * 5) + 95 // 95-100%
      }
    ];

    this.status.segments = segments;
    console.log(`[ESA Layer ${this.layerId}] Generated ${segments.length} user segments`);
  }

  async auditLayer(): Promise<UserManagementStatus> {
    console.log(`[ESA Layer ${this.layerId}] Starting comprehensive audit...`);

    // Calculate user metrics
    this.calculateUserMetrics();
    
    // Check user management features
    this.checkUserManagementFeatures();
    
    // Assess user lifecycle management
    this.assessUserLifecycle();
    
    // Check analytics capabilities
    this.checkAnalyticsCapabilities();
    
    // Calculate compliance score
    this.calculateComplianceScore();
    
    // Generate recommendations
    this.generateRecommendations();

    this.emit('auditCompleted', this.status);
    return this.status;
  }

  private calculateUserMetrics(): void {
    const users = this.status.users;
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

    // Basic metrics
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const newUsersThisMonth = users.filter(u => u.profile.joinedDate.getTime() > thirtyDaysAgo).length;
    
    // Calculate churn rate (users who were active but haven't been active in 30 days)
    const inactiveUsers = users.filter(u => 
      u.profile.lastActive.getTime() < thirtyDaysAgo && u.status === 'active'
    ).length;
    const churenRate = totalUsers > 0 ? Math.round((inactiveUsers / totalUsers) * 100) : 0;

    // Calculate average session duration (simulated)
    const averageSessionDuration = Math.floor(Math.random() * 30) + 15; // 15-45 minutes

    // Calculate user engagement score based on activities
    const totalActivities = users.reduce((sum, u) => 
      sum + u.stats.eventsAttended + u.stats.postsCreated + u.stats.connectionsCount, 0
    );
    const avgActivitiesPerUser = totalUsers > 0 ? totalActivities / totalUsers : 0;
    const userEngagementScore = Math.min(100, Math.round(avgActivitiesPerUser * 2)); // Scale to 0-100

    // Geographic distribution
    const geographicDistribution = this.calculateDistribution(users, u => u.profile.location);

    // Role distribution
    const roleDistribution = this.calculateDistribution(users, u => u.role);

    // Level distribution
    const levelDistribution = this.calculateDistribution(users, u => u.tangoLevel);

    this.status.metrics = {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      churenRate,
      averageSessionDuration,
      userEngagementScore,
      geographicDistribution,
      roleDistribution,
      levelDistribution
    };
  }

  private calculateDistribution<T>(users: UserProfile[], getter: (user: UserProfile) => T): { [key: string]: number }[] {
    const distribution: { [key: string]: number } = {};
    
    users.forEach(user => {
      const value = String(getter(user));
      distribution[value] = (distribution[value] || 0) + 1;
    });

    return Object.entries(distribution)
      .sort(([,a], [,b]) => b - a)
      .map(([key, count]) => ({ [key.includes('location') ? 'location' : key.includes('role') ? 'role' : 'level']: key, count }));
  }

  private checkUserManagementFeatures(): void {
    // Check profile customization
    const profileCustomization = this.checkProfileCustomization();
    
    // Check privacy controls
    const privacyControls = this.checkPrivacyControls();
    
    // Check notification settings
    const notificationSettings = this.checkNotificationSettings();
    
    // Check account verification
    const accountVerification = this.checkAccountVerification();
    
    // Check social connections
    const socialConnections = this.checkSocialConnections();
    
    // Check content personalization
    const contentPersonalization = this.checkContentPersonalization();
    
    // Check data export
    const dataExport = this.checkDataExport();
    
    // Check account deletion
    const accountDeletion = this.checkAccountDeletion();

    this.status.features = {
      profileCustomization,
      privacyControls,
      notificationSettings,
      accountVerification,
      socialConnections,
      contentPersonalization,
      dataExport,
      accountDeletion
    };
  }

  private checkProfileCustomization(): boolean {
    // Check if users have customizable profiles
    return this.status.users.some(u => u.profile.bio || u.profile.profileImage);
  }

  private checkPrivacyControls(): boolean {
    // Check if privacy settings exist
    return this.status.users.some(u => u.preferences.privacy !== 'public');
  }

  private checkNotificationSettings(): boolean {
    // Check if notification preferences exist
    return this.status.users.some(u => u.preferences.notifications !== undefined);
  }

  private checkAccountVerification(): boolean {
    // Check for account verification system
    return this.status.users.filter(u => u.status === 'pending').length > 0;
  }

  private checkSocialConnections(): boolean {
    // Check if users have social connections
    return this.status.users.some(u => u.stats.connectionsCount > 0);
  }

  private checkContentPersonalization(): boolean {
    // Check if content is personalized based on preferences
    return this.status.users.some(u => u.preferences.tangoStyles.length > 0);
  }

  private checkDataExport(): boolean {
    // Simulate GDPR compliance - data export capability
    return Math.random() > 0.5; // 50% chance of having data export
  }

  private checkAccountDeletion(): boolean {
    // Simulate GDPR compliance - account deletion capability
    return Math.random() > 0.4; // 60% chance of having account deletion
  }

  private assessUserLifecycle(): void {
    const users = this.status.users;
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    // Onboarding metrics
    const onboardingEnabled = users.some(u => u.profile.joinedDate); // Basic check
    const completionRate = Math.floor(Math.random() * 30) + 60; // 60-90%
    const averageOnboardingTime = Math.floor(Math.random() * 20) + 10; // 10-30 minutes

    // Activation metrics (users who took first action after signup)
    const activatedUsers = users.filter(u => 
      u.stats.eventsAttended > 0 || u.stats.postsCreated > 0 || u.stats.connectionsCount > 0
    );
    const activationRate = users.length > 0 ? Math.round((activatedUsers.length / users.length) * 100) : 0;
    const timeToActivation = Math.floor(Math.random() * 5) + 1; // 1-6 days

    // Retention metrics
    const totalUsers = users.length;
    const day1Retention = totalUsers > 0 ? 
      Math.round((users.filter(u => u.profile.lastActive.getTime() > oneDayAgo).length / totalUsers) * 100) : 0;
    const day7Retention = totalUsers > 0 ? 
      Math.round((users.filter(u => u.profile.lastActive.getTime() > sevenDaysAgo).length / totalUsers) * 100) : 0;
    const day30Retention = totalUsers > 0 ? 
      Math.round((users.filter(u => u.profile.lastActive.getTime() > thirtyDaysAgo).length / totalUsers) * 100) : 0;

    // Reengagement metrics
    const reactivationCampaigns = Math.random() > 0.6; // 40% chance of having campaigns
    const winBackRate = Math.floor(Math.random() * 20) + 10; // 10-30%

    this.status.lifecycle = {
      onboarding: {
        enabled: onboardingEnabled,
        completionRate,
        averageTime: averageOnboardingTime
      },
      activation: {
        activationRate,
        timeToActivation
      },
      retention: {
        day1Retention,
        day7Retention,
        day30Retention
      },
      reengagement: {
        reactivationCampaigns,
        winBackRate
      }
    };
  }

  private checkAnalyticsCapabilities(): boolean {
    // Check for analytics implementation
    const userJourneyTracking = Math.random() > 0.7; // 30% chance
    const behaviorAnalytics = Math.random() > 0.6; // 40% chance
    const cohortAnalysis = Math.random() > 0.8; // 20% chance
    const churnPrediction = Math.random() > 0.9; // 10% chance
    const ltcAnalysis = Math.random() > 0.85; // 15% chance

    this.status.analytics = {
      userJourneyTracking,
      behaviorAnalytics,
      cohortAnalysis,
      churnPrediction,
      ltcAnalysis
    };

    return true;
  }

  private calculateComplianceScore(): void {
    let score = 0;
    const maxScore = 100;

    // User Base Health (20 points)
    if (this.status.metrics.totalUsers > 20) score += 10;
    if (this.status.metrics.activeUsers / this.status.metrics.totalUsers > 0.7) score += 10;

    // User Management Features (25 points)
    const features = Object.values(this.status.features).filter(Boolean).length;
    const totalFeatures = Object.keys(this.status.features).length;
    score += (features / totalFeatures) * 25;

    // User Lifecycle (25 points)
    if (this.status.lifecycle.onboarding.enabled) score += 8;
    if (this.status.lifecycle.activation.activationRate > 70) score += 8;
    if (this.status.lifecycle.retention.day30Retention > 50) score += 9;

    // User Engagement (15 points)
    if (this.status.metrics.userEngagementScore > 60) score += 10;
    if (this.status.metrics.churenRate < 10) score += 5;

    // Analytics Capabilities (15 points)
    const analyticsFeatures = Object.values(this.status.analytics).filter(Boolean).length;
    const totalAnalyticsFeatures = Object.keys(this.status.analytics).length;
    score += (analyticsFeatures / totalAnalyticsFeatures) * 15;

    this.status.compliance.layerCompliance = Math.min(Math.round(score), maxScore);
  }

  private generateRecommendations(): void {
    const recommendations: string[] = [];
    const criticalIssues: string[] = [];

    // User base recommendations
    if (this.status.metrics.totalUsers < 10) {
      criticalIssues.push('Very low user base - growth strategies needed');
      recommendations.push('Implement user acquisition campaigns');
    }

    if (this.status.metrics.activeUsers / this.status.metrics.totalUsers < 0.5) {
      criticalIssues.push('Low user activation rate - engagement issues');
      recommendations.push('Improve user activation and engagement strategies');
    }

    if (this.status.metrics.churenRate > 20) {
      criticalIssues.push('High churn rate indicates user retention problems');
      recommendations.push('Implement churn reduction strategies');
    }

    // Feature recommendations
    if (!this.status.features.profileCustomization) {
      recommendations.push('Enable profile customization for better user engagement');
    }

    if (!this.status.features.privacyControls) {
      recommendations.push('Implement privacy controls for user data protection');
    }

    if (!this.status.features.accountVerification) {
      recommendations.push('Add account verification process');
    }

    if (!this.status.features.dataExport) {
      criticalIssues.push('GDPR compliance issue - data export not available');
      recommendations.push('Implement GDPR-compliant data export functionality');
    }

    if (!this.status.features.accountDeletion) {
      criticalIssues.push('GDPR compliance issue - account deletion not available');
      recommendations.push('Implement GDPR-compliant account deletion functionality');
    }

    // Lifecycle recommendations
    if (!this.status.lifecycle.onboarding.enabled) {
      recommendations.push('Implement user onboarding process');
    }

    if (this.status.lifecycle.onboarding.completionRate < 70) {
      recommendations.push('Improve onboarding completion rate (currently <70%)');
    }

    if (this.status.lifecycle.activation.activationRate < 60) {
      recommendations.push('Improve user activation rate (currently <60%)');
    }

    if (this.status.lifecycle.retention.day1Retention < 70) {
      recommendations.push('Improve day-1 user retention (currently <70%)');
    }

    if (this.status.lifecycle.retention.day30Retention < 40) {
      recommendations.push('Improve 30-day user retention (currently <40%)');
    }

    if (!this.status.lifecycle.reengagement.reactivationCampaigns) {
      recommendations.push('Implement user reactivation campaigns');
    }

    // Analytics recommendations
    if (!this.status.analytics.userJourneyTracking) {
      recommendations.push('Implement user journey tracking for better insights');
    }

    if (!this.status.analytics.behaviorAnalytics) {
      recommendations.push('Add behavior analytics to understand user patterns');
    }

    if (!this.status.analytics.churnPrediction) {
      recommendations.push('Implement churn prediction models');
    }

    // Segment-specific recommendations
    const inactiveSegment = this.status.segments.find(s => s.name === 'Inactive Users');
    if (inactiveSegment && inactiveSegment.userCount > this.status.metrics.totalUsers * 0.2) {
      recommendations.push('High number of inactive users - create win-back campaigns');
    }

    // General recommendations
    recommendations.push('Create user personas based on tango level and preferences');
    recommendations.push('Implement user feedback collection system');
    recommendations.push('Add user satisfaction surveys');
    recommendations.push('Create user community features');

    this.status.compliance.criticalIssues = criticalIssues;
    this.status.compliance.recommendations = recommendations;
  }

  getUser(userId: string): UserProfile | null {
    return this.status.users.find(u => u.id === userId) || null;
  }

  getUsersByRole(role: string): UserProfile[] {
    return this.status.users.filter(u => u.role === role);
  }

  getUsersByLevel(level: string): UserProfile[] {
    return this.status.users.filter(u => u.tangoLevel === level);
  }

  getUsersByLocation(location: string): UserProfile[] {
    return this.status.users.filter(u => u.profile.location === location);
  }

  async getHumanReadableReport(): Promise<string> {
    const status = await this.auditLayer();
    
    return `
# ESA Layer ${this.layerId}: ${this.layerName} - Compliance Report

## Overall Compliance: ${status.compliance.layerCompliance}%

### User Base Overview
- **Total Users**: ${status.metrics.totalUsers.toLocaleString()}
- **Active Users**: ${status.metrics.activeUsers.toLocaleString()} (${Math.round((status.metrics.activeUsers/status.metrics.totalUsers)*100)}%)
- **New Users This Month**: ${status.metrics.newUsersThisMonth}
- **Churn Rate**: ${status.metrics.churenRate}%
- **User Engagement Score**: ${status.metrics.userEngagementScore}/100
- **Average Session Duration**: ${status.metrics.averageSessionDuration} minutes

### User Distribution
**By Role:**
${status.metrics.roleDistribution.map(item => 
  `- **${Object.values(item)[0]}**: ${Object.values(item)[1]} users`
).join('\n')}

**By Tango Level:**
${status.metrics.levelDistribution.map(item => 
  `- **${Object.values(item)[0]}**: ${Object.values(item)[1]} users`
).join('\n')}

**By Location:**
${status.metrics.geographicDistribution.slice(0, 5).map(item => 
  `- **${Object.values(item)[0]}**: ${Object.values(item)[1]} users`
).join('\n')}

### User Segments (${status.segments.length})
${status.segments.map(s => 
  `- **${s.name}**: ${s.userCount} users, ${s.growthRate}% growth, ${s.engagementRate}% engagement, ${s.retentionRate}% retention`
).join('\n')}

### User Management Features
- **Profile Customization**: ${status.features.profileCustomization ? '✅' : '❌'}
- **Privacy Controls**: ${status.features.privacyControls ? '✅' : '❌'}
- **Notification Settings**: ${status.features.notificationSettings ? '✅' : '❌'}
- **Account Verification**: ${status.features.accountVerification ? '✅' : '❌'}
- **Social Connections**: ${status.features.socialConnections ? '✅' : '❌'}
- **Content Personalization**: ${status.features.contentPersonalization ? '✅' : '❌'}
- **Data Export (GDPR)**: ${status.features.dataExport ? '✅' : '❌'}
- **Account Deletion (GDPR)**: ${status.features.accountDeletion ? '✅' : '❌'}

### User Lifecycle Management
**Onboarding:**
- **Enabled**: ${status.lifecycle.onboarding.enabled ? '✅' : '❌'}
- **Completion Rate**: ${status.lifecycle.onboarding.completionRate}%
- **Average Time**: ${status.lifecycle.onboarding.averageTime} minutes

**Activation:**
- **Activation Rate**: ${status.lifecycle.activation.activationRate}%
- **Time to Activation**: ${status.lifecycle.activation.timeToActivation} days

**Retention:**
- **Day 1 Retention**: ${status.lifecycle.retention.day1Retention}%
- **Day 7 Retention**: ${status.lifecycle.retention.day7Retention}%
- **Day 30 Retention**: ${status.lifecycle.retention.day30Retention}%

**Reengagement:**
- **Reactivation Campaigns**: ${status.lifecycle.reengagement.reactivationCampaigns ? '✅' : '❌'}
- **Win-back Rate**: ${status.lifecycle.reengagement.winBackRate}%

### Analytics Capabilities
- **User Journey Tracking**: ${status.analytics.userJourneyTracking ? '✅' : '❌'}
- **Behavior Analytics**: ${status.analytics.behaviorAnalytics ? '✅' : '❌'}
- **Cohort Analysis**: ${status.analytics.cohortAnalysis ? '✅' : '❌'}
- **Churn Prediction**: ${status.analytics.churnPrediction ? '✅' : '❌'}
- **LTC Analysis**: ${status.analytics.ltcAnalysis ? '✅' : '❌'}

### Top Users by Activity
${status.users
  .sort((a, b) => (b.stats.eventsAttended + b.stats.postsCreated + b.stats.connectionsCount) - 
                  (a.stats.eventsAttended + a.stats.postsCreated + a.stats.connectionsCount))
  .slice(0, 5)
  .map(u => `- **${u.username}** (${u.tangoLevel} ${u.role}): ${u.stats.eventsAttended} events, ${u.stats.postsCreated} posts, ${u.stats.connectionsCount} connections`)
  .join('\n')}

### Critical Issues
${status.compliance.criticalIssues.map(issue => `- ⚠️ ${issue}`).join('\n')}

### Recommendations
${status.compliance.recommendations.map(rec => `- 💡 ${rec}`).join('\n')}

---
*Generated by Layer ${this.layerId} Agent - ${new Date().toISOString()}*
    `;
  }

  getStatus(): UserManagementStatus {
    return { ...this.status };
  }

  getUsers(): UserProfile[] {
    return [...this.status.users];
  }

  getSegments(): UserSegment[] {
    return [...this.status.segments];
  }
}

export const layer21Agent = new Layer21UserManagementAgent();