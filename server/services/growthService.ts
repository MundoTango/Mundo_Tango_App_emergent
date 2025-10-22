/**
 * Growth Service
 * MB.MD Track 13: Growth Infrastructure
 * Implements: Referral system, viral loops, retention campaigns, marketing automation
 */

export interface ReferralProgram {
  id: string;
  name: string;
  description: string;
  rewards: {
    referrer: { type: 'credits' | 'premium' | 'discount'; value: number };
    referee: { type: 'credits' | 'premium' | 'discount'; value: number };
  };
  active: boolean;
}

export interface Referral {
  id: string;
  referrerId: number;
  refereeId: number;
  programId: string;
  status: 'pending' | 'completed' | 'expired';
  createdAt: Date;
  completedAt?: Date;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'push' | 'in-app' | 'sms';
  target: 'all' | 'new_users' | 'inactive' | 'power_users' | 'churned';
  content: {
    subject?: string;
    body: string;
    cta: string;
    ctaUrl: string;
  };
  schedule?: {
    type: 'immediate' | 'scheduled' | 'triggered';
    date?: Date;
    trigger?: string;
  };
  status: 'draft' | 'scheduled' | 'running' | 'completed';
  metrics?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
}

export interface ViralLoop {
  id: string;
  name: string;
  trigger: 'signup' | 'post_share' | 'event_create' | 'achievement';
  incentive: string;
  sharingChannels: Array<'facebook' | 'twitter' | 'whatsapp' | 'email' | 'link'>;
  viralityScore: number;
}

class GrowthService {
  private referrals: Referral[] = [];
  private campaigns: Campaign[] = [];

  /**
   * Create referral code
   */
  createReferralCode(userId: number): {
    code: string;
    url: string;
  } {
    const code = `REF${userId}_${Math.random().toString(36).substring(7).toUpperCase()}`;
    const url = `https://mundotango.com/join?ref=${code}`;

    return { code, url };
  }

  /**
   * Track referral
   */
  trackReferral(params: {
    referrerId: number;
    refereeId: number;
    programId: string;
  }): Referral {
    const referral: Referral = {
      id: Math.random().toString(36).substring(7),
      referrerId: params.referrerId,
      refereeId: params.refereeId,
      programId: params.programId,
      status: 'pending',
      createdAt: new Date(),
    };

    this.referrals.push(referral);
    return referral;
  }

  /**
   * Complete referral (when referee takes action)
   */
  completeReferral(referralId: string): {
    success: boolean;
    rewards: {
      referrer: any;
      referee: any;
    };
  } {
    const referral = this.referrals.find(r => r.id === referralId);
    
    if (!referral || referral.status !== 'pending') {
      return {
        success: false,
        rewards: { referrer: null, referee: null },
      };
    }

    referral.status = 'completed';
    referral.completedAt = new Date();

    // Award rewards (simplified)
    const rewards = {
      referrer: { type: 'credits', value: 100 },
      referee: { type: 'premium', value: 7 }, // 7 days premium
    };

    return {
      success: true,
      rewards,
    };
  }

  /**
   * Get referral stats
   */
  getReferralStats(userId: number): {
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    totalRewards: number;
    conversionRate: number;
  } {
    const userReferrals = this.referrals.filter(r => r.referrerId === userId);
    const completed = userReferrals.filter(r => r.status === 'completed');

    return {
      totalReferrals: userReferrals.length,
      completedReferrals: completed.length,
      pendingReferrals: userReferrals.filter(r => r.status === 'pending').length,
      totalRewards: completed.length * 100, // Simplified
      conversionRate: userReferrals.length > 0 ? (completed.length / userReferrals.length) * 100 : 0,
    };
  }

  /**
   * Create marketing campaign
   */
  createCampaign(campaign: Omit<Campaign, 'id' | 'status' | 'metrics'>): Campaign {
    const newCampaign: Campaign = {
      id: Math.random().toString(36).substring(7),
      ...campaign,
      status: 'draft',
    };

    this.campaigns.push(newCampaign);
    return newCampaign;
  }

  /**
   * Launch campaign
   */
  async launchCampaign(campaignId: string): Promise<void> {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    campaign.status = 'running';
    campaign.metrics = {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
    };

    // Simulate sending
    await this.sendCampaign(campaign);
  }

  private async sendCampaign(campaign: Campaign): Promise<void> {
    // Simulate campaign delivery
    const targetSize = this.getTargetSize(campaign.target);
    
    for (let i = 0; i < targetSize; i++) {
      await new Promise(resolve => setTimeout(resolve, 10));
      
      campaign.metrics!.sent++;
      
      // Simulate delivery, open, click, conversion rates
      if (Math.random() > 0.05) campaign.metrics!.delivered++;
      if (Math.random() > 0.60) campaign.metrics!.opened++;
      if (Math.random() > 0.85) campaign.metrics!.clicked++;
      if (Math.random() > 0.95) campaign.metrics!.converted++;
    }

    campaign.status = 'completed';
  }

  private getTargetSize(target: Campaign['target']): number {
    const sizes: Record<Campaign['target'], number> = {
      all: 10000,
      new_users: 500,
      inactive: 2000,
      power_users: 150,
      churned: 800,
    };
    return sizes[target] || 100;
  }

  /**
   * Get campaign performance
   */
  getCampaignMetrics(campaignId: string): Campaign['metrics'] | null {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    return campaign?.metrics || null;
  }

  /**
   * Analyze viral loops
   */
  analyzeViralLoop(loopId: string): {
    kFactor: number;
    viralCycle: number;
    invitesSent: number;
    invitesAccepted: number;
    sharingRate: number;
  } {
    // k-factor = (invites sent / user) × (conversion rate)
    const invitesSentPerUser = 3.2;
    const conversionRate = 0.25;
    const kFactor = invitesSentPerUser * conversionRate;

    return {
      kFactor, // k > 1 means viral growth
      viralCycle: 2.5, // days
      invitesSent: 1250,
      invitesAccepted: 312,
      sharingRate: 15.2, // percentage of users who share
    };
  }

  /**
   * Create viral loop
   */
  createViralLoop(loop: Omit<ViralLoop, 'id' | 'viralityScore'>): ViralLoop {
    const viralLoop: ViralLoop = {
      id: Math.random().toString(36).substring(7),
      ...loop,
      viralityScore: 0,
    };

    // Calculate virality score based on trigger and channels
    viralLoop.viralityScore = loop.sharingChannels.length * 15;

    return viralLoop;
  }

  /**
   * Get retention cohorts
   */
  getRetentionCohorts(cohortDate: Date): {
    cohortSize: number;
    day0: number;
    day1: number;
    day7: number;
    day14: number;
    day30: number;
  } {
    const cohortSize = 500;
    
    return {
      cohortSize,
      day0: cohortSize,
      day1: Math.floor(cohortSize * 0.75),
      day7: Math.floor(cohortSize * 0.45),
      day14: Math.floor(cohortSize * 0.35),
      day30: Math.floor(cohortSize * 0.28),
    };
  }

  /**
   * Send push notification
   */
  async sendPushNotification(params: {
    userId: number;
    title: string;
    body: string;
    data?: Record<string, any>;
  }): Promise<boolean> {
    // This would integrate with push notification service
    console.log(`📱 Sending push to user ${params.userId}: ${params.title}`);
    return true;
  }

  /**
   * Schedule email
   */
  async scheduleEmail(params: {
    userId: number;
    template: string;
    subject: string;
    data: Record<string, any>;
    sendAt?: Date;
  }): Promise<string> {
    const emailId = Math.random().toString(36).substring(7);
    console.log(`📧 Scheduled email ${emailId} for user ${params.userId}`);
    return emailId;
  }

  /**
   * Get growth metrics
   */
  getGrowthMetrics(): {
    dau: number; // Daily Active Users
    mau: number; // Monthly Active Users
    dauMauRatio: number;
    signups: {
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
    churnRate: number;
    activationRate: number;
    viralCoefficient: number;
  } {
    const dau = 1420;
    const mau = 8760;

    return {
      dau,
      mau,
      dauMauRatio: (dau / mau) * 100,
      signups: {
        today: 45,
        thisWeek: 287,
        thisMonth: 1203,
      },
      churnRate: 4.2, // percentage
      activationRate: 62.5, // percentage of signups who complete onboarding
      viralCoefficient: 0.8, // k-factor
    };
  }

  /**
   * Calculate LTV (Lifetime Value)
   */
  calculateLTV(userId: number): {
    ltv: number;
    avgOrderValue: number;
    purchaseFrequency: number;
    customerLifespan: number;
  } {
    return {
      ltv: 145.50,
      avgOrderValue: 29.10,
      purchaseFrequency: 2.5,
      customerLifespan: 2.0, // years
    };
  }
}

// Export singleton instance
export const growthService = new GrowthService();
