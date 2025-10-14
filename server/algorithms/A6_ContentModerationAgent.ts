/**
 * A6: Content Moderation Algorithm Agent
 * AI safety scoring for content filtering
 */

import { AlgorithmAgent, Parameter, SimulationResult } from './AlgorithmAgent';

export class A6_ContentModerationAgent extends AlgorithmAgent {
  id = 'A6';
  name = 'Content Moderation Algorithm';
  description = 'AI-powered safety scoring for proactive content moderation and filtering';
  filePath = 'server/services/contentModerationService.ts';
  algorithmType: 'scoring' = 'scoring';
  esaLayers = [29, 33, 44];
  
  constructor() {
    super();
    
    this.parameters.set('toxicityThreshold', {
      name: 'toxicityThreshold',
      type: 'number',
      currentValue: 0.7,
      defaultValue: 0.7,
      min: 0.3,
      max: 0.95,
      description: 'Threshold for toxic content detection (0-1)',
      impact: 'Lower values = stricter moderation'
    });
    
    this.parameters.set('spamThreshold', {
      name: 'spamThreshold',
      type: 'number',
      currentValue: 0.8,
      defaultValue: 0.8,
      min: 0.5,
      max: 0.95,
      description: 'Threshold for spam detection (0-1)',
      impact: 'Lower values = more aggressive spam filtering'
    });
    
    this.parameters.set('nudityThreshold', {
      name: 'nudityThreshold',
      type: 'number',
      currentValue: 0.85,
      defaultValue: 0.85,
      min: 0.5,
      max: 0.95,
      description: 'Threshold for inappropriate image detection (0-1)',
      impact: 'Lower values = stricter image filtering'
    });
    
    this.parameters.set('autoFlagEnabled', {
      name: 'autoFlagEnabled',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Automatically flag high-risk content for review',
      impact: 'Enables proactive moderation queue'
    });
    
    this.parameters.set('autoHideThreshold', {
      name: 'autoHideThreshold',
      type: 'number',
      currentValue: 0.95,
      defaultValue: 0.95,
      min: 0.8,
      max: 1.0,
      description: 'Threshold for auto-hiding extremely problematic content',
      impact: 'Content above this score is immediately hidden'
    });
  }
  
  explain(): string {
    return `I'm the Content Moderation Algorithm. I keep the community safe using AI-powered detection.

**My Safety Scoring System:**

1. **Toxicity Detection (0-100)**: Language analysis
   - Hate speech
   - Harassment
   - Threats
   - Threshold: ${(this.parameters.get('toxicityThreshold')?.currentValue * 100).toFixed(0)}%

2. **Spam Detection (0-100)**: Pattern recognition
   - Repetitive content
   - External links
   - Promotional patterns
   - Threshold: ${(this.parameters.get('spamThreshold')?.currentValue * 100).toFixed(0)}%

3. **Image Safety (0-100)**: Visual analysis
   - Inappropriate content
   - Violence
   - Adult content
   - Threshold: ${(this.parameters.get('nudityThreshold')?.currentValue * 100).toFixed(0)}%

**Actions:**
- Flag for review: ${this.parameters.get('autoFlagEnabled')?.currentValue ? 'Enabled' : 'Disabled'}
- Auto-hide: Content > ${(this.parameters.get('autoHideThreshold')?.currentValue * 100).toFixed(0)}% score
- Human review queue: 70-95% scores

I balance safety with freedom of expression!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A6: Parameter ${name} updated to ${value}`);
  }
  
  async simulate(changes: Record<string, any>): Promise<SimulationResult> {
    const before = this.getCurrentConfig();
    const after = { ...before, ...changes };
    
    const impactAnalysis: string[] = [];
    
    Object.keys(changes).forEach(key => {
      if (before[key] !== changes[key]) {
        if (key.includes('Threshold')) {
          const direction = changes[key] < before[key] ? 'stricter' : 'more lenient';
          impactAnalysis.push(`${key}: ${direction} filtering`);
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
          example: 'Borderline toxic comment (0.72 score)',
          beforeAction: before.toxicityThreshold > 0.72 ? 'Allowed' : 'Flagged',
          afterAction: after.toxicityThreshold > 0.72 ? 'Allowed' : 'Flagged'
        },
        {
          example: 'Promotional post (0.83 spam score)',
          beforeAction: before.spamThreshold > 0.83 ? 'Allowed' : 'Flagged',
          afterAction: after.spamThreshold > 0.83 ? 'Allowed' : 'Flagged'
        }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 95;
  }
}

export const contentModerationAgent = new A6_ContentModerationAgent();
