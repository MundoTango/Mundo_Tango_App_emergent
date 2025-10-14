/**
 * A1: Memories Feed Algorithm Agent
 * Interactive chat interface for the Memories Feed Algorithm
 */

import { AlgorithmAgent, Parameter, SimulationResult, AgentResponse } from './AlgorithmAgent';
import { MemoriesFeedAlgorithm } from '../services/memoriesFeedAlgorithm';

export class A1_MemoriesFeedAgent extends AlgorithmAgent {
  id = 'A1';
  name = 'Memories Feed Algorithm';
  description = 'Sophisticated 4-factor scoring system for surfacing meaningful memories: Temporal (30pts) + Social (25pts) + Emotional (25pts) + Content (20pts)';
  filePath = 'server/services/memoriesFeedAlgorithm.ts';
  algorithmType: 'scoring' = 'scoring';
  esaLayers = [26, 36, 24]; // Recommendation Engine + Memory Systems + Social Features
  
  constructor() {
    super();
    
    // Initialize parameters
    this.parameters.set('temporalWeight', {
      name: 'temporalWeight',
      type: 'number',
      currentValue: 1.0,
      defaultValue: 1.0,
      min: 0.1,
      max: 3.0,
      description: 'Weight for temporal scoring (anniversaries, "on this day")',
      impact: 'Higher values prioritize memories from significant dates and anniversaries'
    });
    
    this.parameters.set('socialWeight', {
      name: 'socialWeight',
      type: 'number',
      currentValue: 1.0,
      defaultValue: 1.0,
      min: 0.1,
      max: 3.0,
      description: 'Weight for social scoring (friend closeness, mentions, engagement)',
      impact: 'Higher values prioritize memories with close friends and high engagement'
    });
    
    this.parameters.set('emotionalWeight', {
      name: 'emotionalWeight',
      type: 'number',
      currentValue: 1.0,
      defaultValue: 1.0,
      min: 0.1,
      max: 3.0,
      description: 'Weight for emotional scoring (achievements, positive sentiment, travel/family)',
      impact: 'Higher values prioritize emotionally significant memories'
    });
    
    this.parameters.set('contentWeight', {
      name: 'contentWeight',
      type: 'number',
      currentValue: 1.0,
      defaultValue: 1.0,
      min: 0.1,
      max: 3.0,
      description: 'Weight for content scoring (media richness, video, location, detail)',
      impact: 'Higher values prioritize media-rich and detailed memories'
    });
    
    this.parameters.set('maxMemoriesPerDay', {
      name: 'maxMemoriesPerDay',
      type: 'number',
      currentValue: 2,
      defaultValue: 2,
      min: 1,
      max: 10,
      description: 'Maximum memories from the same day',
      impact: 'Prevents memory clustering from single days'
    });
    
    this.parameters.set('maxMemoriesPerWeek', {
      name: 'maxMemoriesPerWeek',
      type: 'number',
      currentValue: 3,
      defaultValue: 3,
      min: 1,
      max: 20,
      description: 'Maximum memories from the same week',
      impact: 'Ensures diversity across different time periods'
    });
  }
  
  explain(): string {
    return `I'm the Memories Feed Algorithm, and I help you rediscover meaningful moments from your past.

Here's how I work:

**4-Factor Scoring System** (0-100 points total):

1. **Temporal Score (0-30 points)**: I prioritize memories from significant dates
   - "On This Day" (1-5 years ago): 15-30 points
   - Seasonal memories (same month): 8 points
   - Weekly anniversaries: 5 points
   - Recent fresh content: 3 points

2. **Social Score (0-25 points)**: I value your social connections
   - Close friends (80%+ closeness): 15 points
   - Good friends (60-79%): 10 points
   - Mentions (@username): 3 points each
   - Popular in network (>10 likes): 5 points
   - Comments: 2 points each

3. **Emotional Score (0-25 points)**: I recognize emotional significance
   - Achievement words (graduated, married): 15 points
   - Positive sentiment (happy, love, joy): 3 points each
   - Travel/family moments: 6-8 points
   - High engagement (>15 total): 10 points

4. **Content Score (0-20 points)**: I appreciate rich content
   - Has media: 8 points
   - Has video: 5 points bonus
   - Has location: 4 points
   - Detailed (>200 chars): 3 points

**Diversity Rules**: I prevent clustering by limiting memories to max ${this.parameters.get('maxMemoriesPerDay')?.currentValue}/day and ${this.parameters.get('maxMemoriesPerWeek')?.currentValue}/week.

**Filters**: I support All Memories / Following / Nearby filtering, plus tags, visibility, and location radius.

You can adjust my weights to personalize what kinds of memories you see most!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    // The MemoriesFeedAlgorithm already accepts weights as parameters
    // Changes are applied in real-time when the algorithm is called
    console.log(`✅ A1: Parameter ${name} updated to ${value}`);
  }
  
  async simulate(changes: Record<string, any>): Promise<SimulationResult> {
    // Simulate impact of parameter changes
    const before = {
      temporalWeight: this.parameters.get('temporalWeight')?.currentValue,
      socialWeight: this.parameters.get('socialWeight')?.currentValue,
      emotionalWeight: this.parameters.get('emotionalWeight')?.currentValue,
      contentWeight: this.parameters.get('contentWeight')?.currentValue
    };
    
    const after = { ...before, ...changes };
    
    // Calculate how scores would shift
    const impactAnalysis: string[] = [];
    
    if (changes.temporalWeight && changes.temporalWeight !== before.temporalWeight) {
      const diff = ((changes.temporalWeight - before.temporalWeight) / before.temporalWeight * 100).toFixed(0);
      impactAnalysis.push(`Temporal scoring ${diff}% ${Number(diff) > 0 ? 'increase' : 'decrease'} - ${Number(diff) > 0 ? 'more' : 'fewer'} anniversary memories`);
    }
    
    if (changes.socialWeight && changes.socialWeight !== before.socialWeight) {
      const diff = ((changes.socialWeight - before.socialWeight) / before.socialWeight * 100).toFixed(0);
      impactAnalysis.push(`Social scoring ${diff}% ${Number(diff) > 0 ? 'increase' : 'decrease'} - ${Number(diff) > 0 ? 'more' : 'fewer'} memories with close friends`);
    }
    
    if (changes.emotionalWeight && changes.emotionalWeight !== before.emotionalWeight) {
      const diff = ((changes.emotionalWeight - before.emotionalWeight) / before.emotionalWeight * 100).toFixed(0);
      impactAnalysis.push(`Emotional scoring ${diff}% ${Number(diff) > 0 ? 'increase' : 'decrease'} - ${Number(diff) > 0 ? 'more' : 'fewer'} achievement/milestone memories`);
    }
    
    if (changes.contentWeight && changes.contentWeight !== before.contentWeight) {
      const diff = ((changes.contentWeight - before.contentWeight) / before.contentWeight * 100).toFixed(0);
      impactAnalysis.push(`Content scoring ${diff}% ${Number(diff) > 0 ? 'increase' : 'decrease'} - ${Number(diff) > 0 ? 'more' : 'fewer'} media-rich memories`);
    }
    
    return {
      before,
      after,
      impact: impactAnalysis.join('; '),
      changes: impactAnalysis,
      preview: [
        {
          example: 'Memory from 1 year ago with close friend and video',
          scoreBefore: 30 * before.temporalWeight + 15 * before.socialWeight + 5 * before.contentWeight,
          scoreAfter: 30 * after.temporalWeight + 15 * after.socialWeight + 5 * after.contentWeight
        },
        {
          example: 'Achievement memory with media',
          scoreBefore: 15 * before.emotionalWeight + 8 * before.contentWeight,
          scoreAfter: 15 * after.emotionalWeight + 8 * after.contentWeight
        }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    // Memories Feed is high impact (used daily by all users)
    return 95; // 0-100 scale
  }
}

// Export singleton instance
export const memoriesFeedAgent = new A1_MemoriesFeedAgent();
