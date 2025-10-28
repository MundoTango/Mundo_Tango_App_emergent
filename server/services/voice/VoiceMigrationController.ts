/**
 * Voice Mode Migration Controller
 * Manages gradual rollout from OpenAI → Open Source (Whisper + Groq + Bark)
 * 
 * Week 4: Feature Flags & Gradual Rollout
 * Created: October 28, 2025
 */

import { isFeatureEnabled, updateFeatureFlag } from '../../lib/feature-flags';
import type { User } from '@shared/schema';
import { createMBMDLogger } from '../mbmd/Logger';

const logger = createMBMDLogger('voice-migration', undefined);

export interface VoiceMigrationStatus {
  openSourceEnabled: boolean;
  rolloutPercentage: number;
  userEligible: boolean;
  provider: 'openai' | 'opensource';
  components: {
    stt: 'openai' | 'whisper';
    llm: 'openai' | 'groq';
    tts: 'openai' | 'bark';
  };
}

export class VoiceMigrationController {
  /**
   * Determine which voice provider to use for this user
   */
  static getVoiceProvider(user?: User): VoiceMigrationStatus {
    const userId = user?.id;
    const userGroups = user?.role ? [user.role] : [];

    // Check if user is in open-source voice rollout
    const sttEnabled = isFeatureEnabled('voice-open-source-stt', userId, userGroups);
    const llmEnabled = isFeatureEnabled('voice-open-source-llm', userId, userGroups);
    const ttsEnabled = isFeatureEnabled('voice-open-source-tts', userId, userGroups);
    const migrationActive = isFeatureEnabled('voice-migration-active', userId, userGroups);

    const allEnabled = sttEnabled && llmEnabled && ttsEnabled && migrationActive;

    return {
      openSourceEnabled: allEnabled,
      rolloutPercentage: this.getCurrentRolloutPercentage(),
      userEligible: allEnabled,
      provider: allEnabled ? 'opensource' : 'openai',
      components: {
        stt: sttEnabled ? 'whisper' : 'openai',
        llm: llmEnabled ? 'groq' : 'openai',
        tts: ttsEnabled ? 'bark' : 'openai',
      },
    };
  }

  /**
   * Get current rollout percentage across all voice flags
   */
  static getCurrentRolloutPercentage(): number {
    // In production, this would query feature-flags service
    // For now, return hardcoded value
    return 0; // Will update to 20 → 50 → 100 during Week 4
  }

  /**
   * Update rollout percentage for Voice Mode migration
   * @param percentage - 0-100
   */
  static async updateRollout(percentage: number): Promise<void> {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Rollout percentage must be 0-100');
    }

    logger.deployment(`Updating Voice Mode rollout to ${percentage}%`);

    // Update all voice feature flags
    updateFeatureFlag('voice-open-source-stt', { 
      enabled: percentage > 0,
      rolloutPercentage: percentage 
    });
    updateFeatureFlag('voice-open-source-llm', { 
      enabled: percentage > 0,
      rolloutPercentage: percentage 
    });
    updateFeatureFlag('voice-open-source-tts', { 
      enabled: percentage > 0,
      rolloutPercentage: percentage 
    });
    updateFeatureFlag('voice-migration-active', { 
      enabled: percentage > 0,
      rolloutPercentage: percentage 
    });

    logger.deployment(`✅ Voice Mode rollout updated to ${percentage}%`);
  }

  /**
   * Get rollout schedule (Week 4 plan)
   */
  static getRolloutSchedule(): Array<{ day: number; percentage: number; description: string }> {
    return [
      { day: 1, percentage: 0, description: 'Pre-rollout: All users on OpenAI' },
      { day: 2, percentage: 20, description: '20% rollout: Super admins + early adopters' },
      { day: 4, percentage: 50, description: '50% rollout: Half of all users' },
      { day: 7, percentage: 100, description: '100% rollout: All users on Open Source' },
      { day: 8, percentage: 100, description: 'Post-rollout: Deprecate OpenAI Realtime API' },
    ];
  }

  /**
   * Get cost savings based on current rollout
   */
  static getCostSavings(usersOnOpenSource: number, avgMinutesPerUser: number): {
    openAICost: number;
    openSourceCost: number;
    savings: number;
    savingsPercent: number;
  } {
    // OpenAI Realtime API: $0.06/min input + $0.24/min output = $0.30/min total
    const openAICostPerMinute = 0.30;
    const openAICost = usersOnOpenSource * avgMinutesPerUser * openAICostPerMinute;

    // Open Source: $0 (Whisper + Groq + Bark all free)
    const openSourceCost = 0;

    const savings = openAICost - openSourceCost;
    const savingsPercent = openAICost > 0 ? (savings / openAICost) * 100 : 0;

    return {
      openAICost,
      openSourceCost,
      savings,
      savingsPercent,
    };
  }

  /**
   * Monitor migration health
   */
  static async getHealthMetrics(): Promise<{
    totalUsers: number;
    usersOnOpenSource: number;
    usersOnOpenAI: number;
    rolloutPercentage: number;
    errorRate: number;
    avgLatency: number;
  }> {
    // In production, query actual metrics from database/monitoring
    return {
      totalUsers: 1000, // Placeholder
      usersOnOpenSource: 0, // Will increase during rollout
      usersOnOpenAI: 1000,
      rolloutPercentage: this.getCurrentRolloutPercentage(),
      errorRate: 0,
      avgLatency: 0,
    };
  }
}
