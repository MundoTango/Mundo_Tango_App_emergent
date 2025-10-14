/**
 * A12: Spam Detection Algorithm Agent
 * Content filtering and abuse prevention
 */

import { AlgorithmAgent, Parameter, SimulationResult } from './AlgorithmAgent';

export class A12_SpamDetectionAgent extends AlgorithmAgent {
  id = 'A12';
  name = 'Spam Detection Algorithm';
  description = 'ML-powered spam and abuse detection for posts, comments, and messages';
  filePath = 'server/services/spamDetectionService.ts';
  algorithmType: 'scoring' = 'scoring';
  esaLayers = [29, 33, 44];
  
  constructor() {
    super();
    
    this.parameters.set('spamThreshold', {
      name: 'spamThreshold',
      type: 'number',
      currentValue: 0.75,
      defaultValue: 0.75,
      min: 0.4,
      max: 0.95,
      description: 'Probability threshold for spam classification',
      impact: 'Lower = more aggressive spam filtering'
    });
    
    this.parameters.set('repetitionWeight', {
      name: 'repetitionWeight',
      type: 'number',
      currentValue: 1.8,
      defaultValue: 1.8,
      min: 0.5,
      max: 3.0,
      description: 'Weight for repetitive content detection',
      impact: 'Higher = more sensitive to duplicate/similar posts'
    });
    
    this.parameters.set('linkWeight', {
      name: 'linkWeight',
      type: 'number',
      currentValue: 1.5,
      defaultValue: 1.5,
      min: 0.5,
      max: 3.0,
      description: 'Weight for external links in content',
      impact: 'Higher = more suspicious of links'
    });
    
    this.parameters.set('promotionalWeight', {
      name: 'promotionalWeight',
      type: 'number',
      currentValue: 1.3,
      defaultValue: 1.3,
      min: 0.5,
      max: 3.0,
      description: 'Weight for promotional language detection',
      impact: 'Higher = stricter on marketing/sales language'
    });
    
    this.parameters.set('newUserPenalty', {
      name: 'newUserPenalty',
      type: 'number',
      currentValue: 0.3,
      defaultValue: 0.3,
      min: 0.0,
      max: 1.0,
      description: 'Additional scrutiny for new user accounts',
      impact: 'Higher = stricter checks on new accounts'
    });
    
    this.parameters.set('autoBlockEnabled', {
      name: 'autoBlockEnabled',
      type: 'boolean',
      currentValue: false,
      defaultValue: false,
      description: 'Automatically block high-confidence spam',
      impact: 'Enables instant blocking of obvious spam'
    });
  }
  
  explain(): string {
    return `I'm the Spam Detection Algorithm. I protect the community from spam and abuse.

**My Detection System:**

1. **Spam Signals**:
   - Repetition (${this.parameters.get('repetitionWeight')?.currentValue}x): Duplicate/similar content
   - Links (${this.parameters.get('linkWeight')?.currentValue}x): External URLs
   - Promotional (${this.parameters.get('promotionalWeight')?.currentValue}x): Sales language, emojis
   - Velocity: Posting frequency spikes
   - New User: ${(this.parameters.get('newUserPenalty')?.currentValue * 100).toFixed(0)}% extra scrutiny

2. **Spam Score** (0-100):
   - Low Risk (<50): Normal content
   - Moderate (50-${(this.parameters.get('spamThreshold')?.currentValue * 100).toFixed(0)}): Flag for review
   - High (>${(this.parameters.get('spamThreshold')?.currentValue * 100).toFixed(0)}): Likely spam

3. **Actions**:
   - Flag for review: Medium-high scores
   - Shadow ban: Repeated offenders
   - Auto-block: ${this.parameters.get('autoBlockEnabled')?.currentValue ? 'Enabled' : 'Disabled'} (very high confidence)
   - User reports: Amplify signal

**Pattern Detection**:
- Promotional keywords (buy, sale, discount)
- Link farms and shortened URLs
- Copy-paste identical posts
- Bot-like behavior patterns

I keep the feed clean and authentic!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A12: Parameter ${name} updated to ${value}`);
  }
  
  async simulate(changes: Record<string, any>): Promise<SimulationResult> {
    const before = this.getCurrentConfig();
    const after = { ...before, ...changes };
    
    const impactAnalysis: string[] = [];
    
    Object.keys(changes).forEach(key => {
      if (before[key] !== changes[key]) {
        if (typeof changes[key] === 'boolean') {
          impactAnalysis.push(`${key}: ${changes[key] ? 'enabled' : 'disabled'}`);
        } else if (typeof changes[key] === 'number' && typeof before[key] === 'number') {
          const diff = ((changes[key] - before[key]) / before[key] * 100).toFixed(0);
          impactAnalysis.push(`${key}: ${diff}% change`);
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
          content: "Check out this amazing deal! Buy now at bit.ly/xyz",
          scoreBefore: 25 * before.linkWeight + 20 * before.promotionalWeight,
          scoreAfter: 25 * after.linkWeight + 20 * after.promotionalWeight,
          classification: 'Promotional Spam'
        },
        {
          content: "Join our milonga tonight! Details on our website",
          scoreBefore: 10 * before.linkWeight + 8 * before.promotionalWeight,
          scoreAfter: 10 * after.linkWeight + 8 * after.promotionalWeight,
          classification: 'Legitimate Event'
        }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 92;
  }
}

export const spamDetectionAgent = new A12_SpamDetectionAgent();
