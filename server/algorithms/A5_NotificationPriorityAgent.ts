/**
 * A5: Notification Priority Algorithm Agent
 * Urgency scoring for smart notification delivery
 */

import { AlgorithmAgent, Parameter, SimulationResult } from './AlgorithmAgent';

export class A5_NotificationPriorityAgent extends AlgorithmAgent {
  id = 'A5';
  name = 'Notification Priority Algorithm';
  description = 'Urgency scoring for intelligent notification delivery and batching';
  filePath = 'server/services/notificationService.ts';
  algorithmType: 'scoring' = 'scoring';
  esaLayers = [28, 33, 44];
  
  constructor() {
    super();
    
    this.parameters.set('urgencyWeight', {
      name: 'urgencyWeight',
      type: 'number',
      currentValue: 2.0,
      defaultValue: 2.0,
      min: 0.5,
      max: 4.0,
      description: 'Weight for notification urgency (mentions, direct messages)',
      impact: 'Higher values prioritize urgent notifications'
    });
    
    this.parameters.set('socialRelevanceWeight', {
      name: 'socialRelevanceWeight',
      type: 'number',
      currentValue: 1.5,
      defaultValue: 1.5,
      min: 0.1,
      max: 3.0,
      description: 'Weight for social context (close friends, important connections)',
      impact: 'Higher values prioritize notifications from close connections'
    });
    
    this.parameters.set('actionableWeight', {
      name: 'actionableWeight',
      type: 'number',
      currentValue: 1.3,
      defaultValue: 1.3,
      min: 0.1,
      max: 2.5,
      description: 'Weight for actionable notifications (friend requests, event invites)',
      impact: 'Higher values prioritize notifications requiring action'
    });
    
    this.parameters.set('batchingThreshold', {
      name: 'batchingThreshold',
      type: 'number',
      currentValue: 5,
      defaultValue: 5,
      min: 1,
      max: 20,
      description: 'Number of low-priority notifications to batch',
      impact: 'Higher values batch more notifications together'
    });
    
    this.parameters.set('quietHoursEnabled', {
      name: 'quietHoursEnabled',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Enable quiet hours (22:00-08:00)',
      impact: 'Delays non-urgent notifications during sleep hours'
    });
  }
  
  explain(): string {
    return `I'm the Notification Priority Algorithm. I help manage your attention by prioritizing what matters.

**My 3-Tier Priority System:**

1. **Urgent (Immediate Delivery)**:
   - Direct mentions (@you)
   - Direct messages
   - Event starting soon
   - Friend requests from close connections
   - Score > 80 points

2. **Important (Quick Delivery)**:
   - Comments on your posts
   - Likes from friends
   - Event invites
   - Group updates
   - Score 50-80 points

3. **Low Priority (Batched)**:
   - Generic likes
   - Follower updates
   - System notifications
   - Score < 50 points
   - Batched into ${this.parameters.get('batchingThreshold')?.currentValue} notifications

**Quiet Hours**: ${this.parameters.get('quietHoursEnabled')?.currentValue ? 'Enabled' : 'Disabled'} (22:00-08:00)
- Only urgent notifications delivered
- Others queued for morning

I keep you informed without overwhelming you!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A5: Parameter ${name} updated to ${value}`);
  }
  
  async simulate(changes: Record<string, any>): Promise<SimulationResult> {
    const before = this.getCurrentConfig();
    const after = { ...before, ...changes };
    
    const impactAnalysis: string[] = [];
    
    Object.keys(changes).forEach(key => {
      if (before[key] !== changes[key]) {
        if (typeof changes[key] === 'number' && typeof before[key] === 'number') {
          const diff = ((changes[key] - before[key]) / before[key] * 100).toFixed(0);
          impactAnalysis.push(`${key}: ${diff}% change`);
        } else {
          impactAnalysis.push(`${key}: ${before[key]} → ${changes[key]}`);
        }
      }
    });
    
    return {
      before,
      after,
      impact: impactAnalysis.join('; '),
      changes: impactAnalysis,
      preview: [
        {
          example: 'Direct mention from close friend',
          scoreBefore: 50 * before.urgencyWeight + 30 * before.socialRelevanceWeight,
          scoreAfter: 50 * after.urgencyWeight + 30 * after.socialRelevanceWeight,
          priority: 'Urgent'
        },
        {
          example: 'Generic like from follower',
          scoreBefore: 10 * before.socialRelevanceWeight,
          scoreAfter: 10 * after.socialRelevanceWeight,
          priority: 'Low (batched)'
        }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 87;
  }
}

export const notificationPriorityAgent = new A5_NotificationPriorityAgent();
