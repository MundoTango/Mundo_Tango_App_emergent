/**
 * A8: Sentiment Analysis Algorithm Agent
 * Emotion detection scoring for content understanding
 */

import { AlgorithmAgent, Parameter, SimulationResult } from './AlgorithmAgent';

export class A8_SentimentAnalysisAgent extends AlgorithmAgent {
  id = 'A8';
  name = 'Sentiment Analysis Algorithm';
  description = 'AI-powered emotion detection and sentiment scoring for posts, comments, and messages';
  filePath = 'server/services/sentimentAnalysisService.ts';
  algorithmType: 'prediction' = 'prediction';
  esaLayers = [33, 44, 26];
  
  constructor() {
    super();
    
    this.parameters.set('positivityWeight', {
      name: 'positivityWeight',
      type: 'number',
      currentValue: 1.0,
      defaultValue: 1.0,
      min: 0.1,
      max: 2.0,
      description: 'Weight for positive sentiment detection',
      impact: 'Higher values amplify positive emotion scores'
    });
    
    this.parameters.set('negativityWeight', {
      name: 'negativityWeight',
      type: 'number',
      currentValue: 1.0,
      defaultValue: 1.0,
      min: 0.1,
      max: 2.0,
      description: 'Weight for negative sentiment detection',
      impact: 'Higher values amplify negative emotion scores'
    });
    
    this.parameters.set('emotionGranularity', {
      name: 'emotionGranularity',
      type: 'enum',
      currentValue: 'detailed',
      defaultValue: 'detailed',
      enumValues: ['simple', 'detailed', 'nuanced'],
      description: 'Level of emotion classification detail',
      impact: 'simple: positive/negative/neutral, detailed: joy/anger/sad/etc, nuanced: 27 emotions'
    });
    
    this.parameters.set('contextWindowSize', {
      name: 'contextWindowSize',
      type: 'number',
      currentValue: 512,
      defaultValue: 512,
      min: 128,
      max: 2048,
      description: 'Text context window for sentiment analysis',
      impact: 'Larger windows consider more context but slower'
    });
    
    this.parameters.set('confidenceThreshold', {
      name: 'confidenceThreshold',
      type: 'number',
      currentValue: 0.6,
      defaultValue: 0.6,
      min: 0.3,
      max: 0.95,
      description: 'Minimum confidence for sentiment classification',
      impact: 'Higher values require stronger signal for classification'
    });
  }
  
  explain(): string {
    return `I'm the Sentiment Analysis Algorithm. I understand emotions in text using AI.

**My Emotion Detection System:**

1. **Polarity Analysis**: Positive vs Negative
   - Positive: Joy, excitement, love, gratitude
   - Negative: Anger, sadness, frustration, fear
   - Neutral: Factual, informative content

2. **Emotion Classification** (${this.parameters.get('emotionGranularity')?.currentValue} mode):
   - Simple: 3 categories (pos/neg/neutral)
   - Detailed: 8 emotions (joy, anger, sad, fear, etc)
   - Nuanced: 27 fine-grained emotions

3. **Confidence Scoring**:
   - High confidence (>${(this.parameters.get('confidenceThreshold')?.currentValue * 100).toFixed(0)}%): Clear signal
   - Low confidence: Mixed or ambiguous
   - Context window: ${this.parameters.get('contextWindowSize')?.currentValue} tokens

**Applications:**
- Feed personalization (show uplifting content)
- Content moderation (detect negativity)
- User insights (mood tracking)
- Response suggestions (empathetic replies)

I help the platform understand how users feel!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A8: Parameter ${name} updated to ${value}`);
  }
  
  async simulate(changes: Record<string, any>): Promise<SimulationResult> {
    const before = this.getCurrentConfig();
    const after = { ...before, ...changes };
    
    const impactAnalysis: string[] = [];
    
    Object.keys(changes).forEach(key => {
      if (before[key] !== changes[key]) {
        impactAnalysis.push(`${key}: ${before[key]} → ${changes[key]}`);
      }
    });
    
    return {
      before,
      after,
      impact: impactAnalysis.join('; '),
      changes: impactAnalysis,
      preview: [
        {
          text: "I'm so excited about the milonga tonight! 💃",
          sentimentBefore: { emotion: 'joy', score: 0.92, polarity: 'positive' },
          sentimentAfter: { emotion: 'joy', score: 0.92, polarity: 'positive' }
        },
        {
          text: "This event was disappointing, bad organization",
          sentimentBefore: { emotion: 'disappointment', score: 0.78, polarity: 'negative' },
          sentimentAfter: { emotion: 'disappointment', score: 0.78, polarity: 'negative' }
        }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 82;
  }
}

export const sentimentAnalysisAgent = new A8_SentimentAnalysisAgent();
