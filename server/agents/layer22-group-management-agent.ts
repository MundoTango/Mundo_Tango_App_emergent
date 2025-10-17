/**
 * ESA LIFE CEO 61x21 - Layer 22 Agent: Group Management
 * Expert agent responsible for tango community group organization and management
 */

import { EventEmitter } from 'events';

export interface TangoGroup {
  id: string;
  name: string;
  type: 'milonga' | 'practica' | 'school' | 'community' | 'performance' | 'social';
  location: {
    city: string;
    venue: string;
    coordinates?: { lat: number; lng: number };
  };
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  members: {
    total: number;
    active: number;
    leaders: number;
    followers: number;
    beginners: number;
    intermediate: number;
    advanced: number;
  };
  activity: {
    lastActivity: Date;
    eventsThisMonth: number;
    engagement: number; // 0-100
    growth: number; // percentage
  };
  features: {
    hasEvents: boolean;
    hasChat: boolean;
    hasResources: boolean;
    hasPhotos: boolean;
    hasReviews: boolean;
  };
  moderation: {
    rules: string[];
    moderators: number;
    reports: number;
    autoModeration: boolean;
  };
}

export interface GroupManagementMetrics {
  totalGroups: number;
  activeGroups: number;
  newGroupsThisMonth: number;
  averageGroupSize: number;
  topCategories: { type: string; count: number }[];
  geographicDistribution: { city: string; groups: number }[];
  engagementStats: {
    highEngagement: number; // >80%
    mediumEngagement: number; // 40-80%
    lowEngagement: number; // <40%
  };
  moderationStats: {
    totalReports: number;
    resolvedReports: number;
    averageResolutionTime: number; // hours
  };
}

export interface GroupManagementStatus {
  metrics: GroupManagementMetrics;
  groups: TangoGroup[];
  categoryHealth: {
    [type: string]: {
      totalGroups: number;
      avgMembers: number;
      avgEngagement: number;
      healthScore: number;
    };
  };
  systemHealth: {
    groupCreationRate: number;
    memberRetentionRate: number;
    moderationEfficiency: number;
    overallSatisfaction: number;
  };
  compliance: {
    layerCompliance: number;
    criticalIssues: string[];
    recommendations: string[];
  };
}

class Layer22GroupManagementAgent extends EventEmitter {
  private layerId = 22;
  private layerName = 'Group Management';
  private status: GroupManagementStatus;
  private groups = new Map<string, TangoGroup>();

  constructor() {
    super();
    this.status = this.initializeStatus();
    this.generateSampleGroups();
    console.log(`[ESA Layer ${this.layerId}] ${this.layerName} Agent initialized`);
  }

  private initializeStatus(): GroupManagementStatus {
    return {
      metrics: {
        totalGroups: 0,
        activeGroups: 0,
        newGroupsThisMonth: 0,
        averageGroupSize: 0,
        topCategories: [],
        geographicDistribution: [],
        engagementStats: {
          highEngagement: 0,
          mediumEngagement: 0,
          lowEngagement: 0
        },
        moderationStats: {
          totalReports: 0,
          resolvedReports: 0,
          averageResolutionTime: 0
        }
      },
      groups: [],
      categoryHealth: {},
      systemHealth: {
        groupCreationRate: 0,
        memberRetentionRate: 0,
        moderationEfficiency: 0,
        overallSatisfaction: 0
      },
      compliance: {
        layerCompliance: 0,
        criticalIssues: [],
        recommendations: []
      }
    };
  }

  private generateSampleGroups(): void {
    const sampleGroups: Omit<TangoGroup, 'activity' | 'features' | 'moderation'>[] = [
      {
        id: 'group_001',
        name: 'Buenos Aires Tango Society',
        type: 'community',
        location: { city: 'Buenos Aires', venue: 'Centro Cultural' },
        status: 'active',
        members: {
          total: 145,
          active: 120,
          leaders: 65,
          followers: 80,
          beginners: 35,
          intermediate: 70,
          advanced: 40
        }
      },
      {
        id: 'group_002',
        name: 'Milonga del Corazón',
        type: 'milonga',
        location: { city: 'Buenos Aires', venue: 'Salon Canning' },
        status: 'active',
        members: {
          total: 89,
          active: 75,
          leaders: 42,
          followers: 47,
          beginners: 15,
          intermediate: 45,
          advanced: 29
        }
      },
      {
        id: 'group_003',
        name: 'New York Tango Collective',
        type: 'community',
        location: { city: 'New York', venue: 'Brooklyn Studios' },
        status: 'active',
        members: {
          total: 67,
          active: 58,
          leaders: 30,
          followers: 37,
          beginners: 25,
          intermediate: 32,
          advanced: 10
        }
      },
      {
        id: 'group_004',
        name: 'Paris Tango Academy',
        type: 'school',
        location: { city: 'Paris', venue: 'Studio Harmonic' },
        status: 'active',
        members: {
          total: 156,
          active: 132,
          leaders: 78,
          followers: 78,
          beginners: 60,
          intermediate: 66,
          advanced: 30
        }
      },
      {
        id: 'group_005',
        name: 'London Practica Group',
        type: 'practica',
        location: { city: 'London', venue: 'Dance Works' },
        status: 'active',
        members: {
          total: 43,
          active: 38,
          leaders: 22,
          followers: 21,
          beginners: 12,
          intermediate: 23,
          advanced: 8
        }
      },
      {
        id: 'group_006',
        name: 'Tokyo Tango Connection',
        type: 'community',
        location: { city: 'Tokyo', venue: 'Shibuya Studio' },
        status: 'active',
        members: {
          total: 78,
          active: 65,
          leaders: 35,
          followers: 43,
          beginners: 28,
          intermediate: 35,
          advanced: 15
        }
      },
      {
        id: 'group_007',
        name: 'Berlin Tango Festival Committee',
        type: 'performance',
        location: { city: 'Berlin', venue: 'Kulturzentrum' },
        status: 'active',
        members: {
          total: 34,
          active: 29,
          leaders: 17,
          followers: 17,
          beginners: 5,
          intermediate: 15,
          advanced: 14
        }
      },
      {
        id: 'group_008',
        name: 'SF Bay Area Social Tango',
        type: 'social',
        location: { city: 'San Francisco', venue: 'Mission District' },
        status: 'inactive',
        members: {
          total: 92,
          active: 45,
          leaders: 48,
          followers: 44,
          beginners: 20,
          intermediate: 42,
          advanced: 30
        }
      }
    ];

    sampleGroups.forEach(group => {
      const fullGroup: TangoGroup = {
        ...group,
        activity: {
          lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
          eventsThisMonth: Math.floor(Math.random() * 12) + 1,
          engagement: group.status === 'active' ? 60 + Math.random() * 40 : Math.random() * 40,
          growth: (Math.random() - 0.5) * 20 // -10% to +10%
        },
        features: {
          hasEvents: Math.random() > 0.2,
          hasChat: Math.random() > 0.3,
          hasResources: Math.random() > 0.4,
          hasPhotos: Math.random() > 0.3,
          hasReviews: Math.random() > 0.5
        },
        moderation: {
          rules: ['Respect all members', 'No spam', 'Tango-related content only'],
          moderators: Math.floor(group.members.total / 30) + 1,
          reports: Math.floor(Math.random() * 5),
          autoModeration: Math.random() > 0.5
        }
      };
      
      this.groups.set(group.id, fullGroup);
    });

    console.log(`[ESA Layer ${this.layerId}] Generated ${sampleGroups.length} sample tango groups`);
  }

  async auditLayer(): Promise<GroupManagementStatus> {
    console.log(`[ESA Layer ${this.layerId}] Starting comprehensive audit...`);

    // Calculate metrics
    this.calculateMetrics();
    
    // Analyze category health
    this.analyzeCategoryHealth();
    
    // Assess system health
    this.assessSystemHealth();
    
    // Calculate compliance score
    this.calculateComplianceScore();
    
    // Generate recommendations
    this.generateRecommendations();

    this.emit('auditCompleted', this.status);
    return this.status;
  }

  private calculateMetrics(): void {
    const groups = Array.from(this.groups.values());
    
    // Basic metrics
    this.status.metrics.totalGroups = groups.length;
    this.status.metrics.activeGroups = groups.filter(g => g.status === 'active').length;
    this.status.metrics.newGroupsThisMonth = Math.floor(groups.length * 0.15); // Simulate 15% new groups
    this.status.metrics.averageGroupSize = Math.round(
      groups.reduce((sum, g) => sum + g.members.total, 0) / groups.length
    );

    // Top categories
    const categoryCount: { [type: string]: number } = {};
    groups.forEach(group => {
      categoryCount[group.type] = (categoryCount[group.type] || 0) + 1;
    });
    
    this.status.metrics.topCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .map(([type, count]) => ({ type, count }));

    // Geographic distribution
    const cityCount: { [city: string]: number } = {};
    groups.forEach(group => {
      cityCount[group.location.city] = (cityCount[group.location.city] || 0) + 1;
    });
    
    this.status.metrics.geographicDistribution = Object.entries(cityCount)
      .sort(([,a], [,b]) => b - a)
      .map(([city, groups]) => ({ city, groups }));

    // Engagement statistics
    let highEngagement = 0;
    let mediumEngagement = 0;
    let lowEngagement = 0;
    
    groups.forEach(group => {
      if (group.activity.engagement > 80) highEngagement++;
      else if (group.activity.engagement > 40) mediumEngagement++;
      else lowEngagement++;
    });

    this.status.metrics.engagementStats = {
      highEngagement,
      mediumEngagement,
      lowEngagement
    };

    // Moderation statistics
    const totalReports = groups.reduce((sum, g) => sum + g.moderation.reports, 0);
    const resolvedReports = Math.floor(totalReports * 0.85); // 85% resolution rate
    
    this.status.metrics.moderationStats = {
      totalReports,
      resolvedReports,
      averageResolutionTime: 24 + Math.random() * 48 // 24-72 hours
    };

    // Update groups array for compatibility
    this.status.groups = groups;
  }

  private analyzeCategoryHealth(): void {
    const groups = Array.from(this.groups.values());
    const categoryHealth: GroupManagementStatus['categoryHealth'] = {};

    // Group by category
    const categories = ['milonga', 'practica', 'school', 'community', 'performance', 'social'];
    
    categories.forEach(category => {
      const categoryGroups = groups.filter(g => g.type === category);
      
      if (categoryGroups.length > 0) {
        const avgMembers = Math.round(
          categoryGroups.reduce((sum, g) => sum + g.members.total, 0) / categoryGroups.length
        );
        
        const avgEngagement = Math.round(
          categoryGroups.reduce((sum, g) => sum + g.activity.engagement, 0) / categoryGroups.length
        );
        
        // Calculate health score based on multiple factors
        let healthScore = 0;
        healthScore += avgEngagement * 0.4; // 40% based on engagement
        healthScore += Math.min((avgMembers / 50) * 100, 100) * 0.3; // 30% based on size (normalized to 50 members)
        healthScore += (categoryGroups.filter(g => g.status === 'active').length / categoryGroups.length) * 100 * 0.3; // 30% based on active ratio
        
        categoryHealth[category] = {
          totalGroups: categoryGroups.length,
          avgMembers,
          avgEngagement,
          healthScore: Math.round(healthScore)
        };
      }
    });

    this.status.categoryHealth = categoryHealth;
  }

  private assessSystemHealth(): void {
    const groups = Array.from(this.groups.values());
    const activeGroups = groups.filter(g => g.status === 'active');

    // Group creation rate (simulate based on current data)
    const groupCreationRate = (this.status.metrics.newGroupsThisMonth / this.status.metrics.totalGroups) * 100;

    // Member retention rate (simulate based on active vs total members)
    const totalMembers = groups.reduce((sum, g) => sum + g.members.total, 0);
    const activeMembers = groups.reduce((sum, g) => sum + g.members.active, 0);
    const memberRetentionRate = totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;

    // Moderation efficiency
    const { totalReports, resolvedReports } = this.status.metrics.moderationStats;
    const moderationEfficiency = totalReports > 0 ? (resolvedReports / totalReports) * 100 : 100;

    // Overall satisfaction (based on engagement and activity)
    const avgEngagement = groups.reduce((sum, g) => sum + g.activity.engagement, 0) / groups.length;
    const overallSatisfaction = Math.round(avgEngagement);

    this.status.systemHealth = {
      groupCreationRate: Math.round(groupCreationRate),
      memberRetentionRate: Math.round(memberRetentionRate),
      moderationEfficiency: Math.round(moderationEfficiency),
      overallSatisfaction
    };
  }

  private calculateComplianceScore(): void {
    let score = 0;
    const maxScore = 100;

    // Group Management Coverage (25 points)
    if (this.status.metrics.totalGroups >= 5) score += 10;
    if (this.status.metrics.activeGroups >= 4) score += 15;

    // Category Diversity (20 points)
    const categories = Object.keys(this.status.categoryHealth).length;
    if (categories >= 4) score += 20;
    else score += (categories / 4) * 20;

    // System Health (25 points)
    if (this.status.systemHealth.memberRetentionRate >= 80) score += 10;
    if (this.status.systemHealth.moderationEfficiency >= 85) score += 8;
    if (this.status.systemHealth.overallSatisfaction >= 70) score += 7;

    // Engagement Quality (20 points)
    const highEngagementRatio = this.status.metrics.engagementStats.highEngagement / this.status.metrics.totalGroups;
    if (highEngagementRatio >= 0.4) score += 20;
    else score += highEngagementRatio * 50; // Scale to 20 points

    // Geographic Distribution (10 points)
    const cities = this.status.metrics.geographicDistribution.length;
    if (cities >= 5) score += 10;
    else score += (cities / 5) * 10;

    this.status.compliance.layerCompliance = Math.min(Math.round(score), maxScore);
  }

  private generateRecommendations(): void {
    const recommendations: string[] = [];
    const criticalIssues: string[] = [];

    // Check for critical issues
    if (this.status.metrics.activeGroups < 3) {
      criticalIssues.push('Too few active groups for sustainable community');
      recommendations.push('Focus on activating existing groups and creating new ones');
    }

    if (this.status.systemHealth.memberRetentionRate < 60) {
      criticalIssues.push('Low member retention rate indicates engagement problems');
      recommendations.push('Implement member engagement initiatives and feedback systems');
    }

    if (this.status.systemHealth.moderationEfficiency < 70) {
      criticalIssues.push('Poor moderation efficiency may harm community trust');
      recommendations.push('Improve moderation tools and increase moderator training');
    }

    // Engagement recommendations
    const lowEngagementGroups = this.status.metrics.engagementStats.lowEngagement;
    if (lowEngagementGroups > this.status.metrics.totalGroups * 0.3) {
      recommendations.push('Implement engagement boost programs for underperforming groups');
    }

    // Category-specific recommendations
    Object.entries(this.status.categoryHealth).forEach(([category, health]) => {
      if (health.healthScore < 60) {
        recommendations.push(`Improve ${category} group support and resources`);
      }
      
      if (health.avgMembers < 20) {
        recommendations.push(`Focus on member acquisition for ${category} groups`);
      }
    });

    // Geographic expansion
    if (this.status.metrics.geographicDistribution.length < 5) {
      recommendations.push('Expand to new geographic markets for tango communities');
    }

    // Feature recommendations
    const groups = Array.from(this.groups.values());
    const groupsWithEvents = groups.filter(g => g.features.hasEvents).length;
    if (groupsWithEvents / groups.length < 0.7) {
      recommendations.push('Encourage more groups to organize regular events');
    }

    const groupsWithChat = groups.filter(g => g.features.hasChat).length;
    if (groupsWithChat / groups.length < 0.6) {
      recommendations.push('Implement better communication tools for groups');
    }

    // General recommendations
    recommendations.push('Create group leader training and support programs');
    recommendations.push('Implement group discovery and recommendation features');
    recommendations.push('Add group analytics dashboard for leaders');
    recommendations.push('Create cross-group collaboration opportunities');
    recommendations.push('Implement automated group health monitoring');

    this.status.compliance.criticalIssues = criticalIssues;
    this.status.compliance.recommendations = recommendations;
  }

  getGroup(groupId: string): TangoGroup | null {
    return this.groups.get(groupId) || null;
  }

  getGroupsByType(type: string): TangoGroup[] {
    return Array.from(this.groups.values()).filter(group => group.type === type);
  }

  getGroupsByCity(city: string): TangoGroup[] {
    return Array.from(this.groups.values()).filter(group => group.location.city === city);
  }

  async getHumanReadableReport(): Promise<string> {
    const status = await this.auditLayer();
    
    return `
# ESA Layer ${this.layerId}: ${this.layerName} - Compliance Report

## Overall Compliance: ${status.compliance.layerCompliance}%

### Group Management Overview
- **Total Groups**: ${status.metrics.totalGroups}
- **Active Groups**: ${status.metrics.activeGroups}
- **New Groups This Month**: ${status.metrics.newGroupsThisMonth}
- **Average Group Size**: ${status.metrics.averageGroupSize} members

### Group Categories
${status.metrics.topCategories.map(cat => 
  `- **${cat.type.charAt(0).toUpperCase() + cat.type.slice(1)}**: ${cat.count} groups`
).join('\n')}

### Geographic Distribution
${status.metrics.geographicDistribution.map(geo => 
  `- **${geo.city}**: ${geo.groups} groups`
).join('\n')}

### Engagement Statistics
- **High Engagement (>80%)**: ${status.metrics.engagementStats.highEngagement} groups
- **Medium Engagement (40-80%)**: ${status.metrics.engagementStats.mediumEngagement} groups
- **Low Engagement (<40%)**: ${status.metrics.engagementStats.lowEngagement} groups

### Category Health Scores
${Object.entries(status.categoryHealth).map(([category, health]) => 
  `- **${category.charAt(0).toUpperCase() + category.slice(1)}**: ${health.healthScore}% (${health.totalGroups} groups, avg ${health.avgMembers} members)`
).join('\n')}

### System Health Metrics
- **Group Creation Rate**: ${status.systemHealth.groupCreationRate}%
- **Member Retention Rate**: ${status.systemHealth.memberRetentionRate}%
- **Moderation Efficiency**: ${status.systemHealth.moderationEfficiency}%
- **Overall Satisfaction**: ${status.systemHealth.overallSatisfaction}%

### Moderation Statistics
- **Total Reports**: ${status.metrics.moderationStats.totalReports}
- **Resolved Reports**: ${status.metrics.moderationStats.resolvedReports}
- **Average Resolution Time**: ${Math.round(status.metrics.moderationStats.averageResolutionTime)} hours

### Top Performing Groups
${Array.from(this.groups.values())
  .sort((a, b) => b.activity.engagement - a.activity.engagement)
  .slice(0, 5)
  .map(g => `- **${g.name}** (${g.location.city}): ${Math.round(g.activity.engagement)}% engagement, ${g.members.total} members`)
  .join('\n')}

### Critical Issues
${status.compliance.criticalIssues.map(issue => `- ⚠️ ${issue}`).join('\n')}

### Recommendations
${status.compliance.recommendations.map(rec => `- 💡 ${rec}`).join('\n')}

---
*Generated by Layer ${this.layerId} Agent - ${new Date().toISOString()}*
    `;
  }

  getStatus(): GroupManagementStatus {
    return { ...this.status };
  }

  getMetrics(): GroupManagementMetrics {
    return { ...this.status.metrics };
  }
}

export const layer22Agent = new Layer22GroupManagementAgent();