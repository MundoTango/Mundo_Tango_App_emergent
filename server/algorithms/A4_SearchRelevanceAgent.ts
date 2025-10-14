/**
 * A4: Search Relevance Algorithm Agent
 * Multi-factor search result ranking system
 */

import { AlgorithmAgent, Parameter, SimulationResult } from './AlgorithmAgent';

export class A4_SearchRelevanceAgent extends AlgorithmAgent {
  id = 'A4';
  name = 'Search Relevance Algorithm';
  description = 'Multi-factor search result ranking with semantic understanding and personalization';
  filePath = 'server/services/searchService.ts';
  algorithmType: 'ranking' = 'ranking';
  esaLayers = [25, 26, 44];
  
  constructor() {
    super();
    
    this.parameters.set('textMatchWeight', {
      name: 'textMatchWeight',
      type: 'number',
      currentValue: 2.0,
      defaultValue: 2.0,
      min: 0.5,
      max: 4.0,
      description: 'Weight for exact and fuzzy text matching',
      impact: 'Higher values prioritize keyword matches'
    });
    
    this.parameters.set('semanticWeight', {
      name: 'semanticWeight',
      type: 'number',
      currentValue: 1.3,
      defaultValue: 1.3,
      min: 0.1,
      max: 3.0,
      description: 'Weight for semantic similarity (AI embeddings)',
      impact: 'Higher values find conceptually related results'
    });
    
    this.parameters.set('recencyWeight', {
      name: 'recencyWeight',
      type: 'number',
      currentValue: 0.8,
      defaultValue: 0.8,
      min: 0.1,
      max: 2.0,
      description: 'Weight for content recency',
      impact: 'Higher values prioritize recent content'
    });
    
    this.parameters.set('popularityWeight', {
      name: 'popularityWeight',
      type: 'number',
      currentValue: 0.6,
      defaultValue: 0.6,
      min: 0.1,
      max: 2.0,
      description: 'Weight for content popularity',
      impact: 'Higher values prioritize popular results'
    });
    
    this.parameters.set('personalizationWeight', {
      name: 'personalizationWeight',
      type: 'number',
      currentValue: 1.0,
      defaultValue: 1.0,
      min: 0.0,
      max: 2.5,
      description: 'Weight for personalized relevance (connections, interests)',
      impact: 'Higher values personalize results to user'
    });
    
    this.parameters.set('fuzzyMatchThreshold', {
      name: 'fuzzyMatchThreshold',
      type: 'number',
      currentValue: 0.7,
      defaultValue: 0.7,
      min: 0.3,
      max: 1.0,
      description: 'Threshold for fuzzy text matching (0-1)',
      impact: 'Lower values allow more typo tolerance'
    });
  }
  
  explain(): string {
    return `I'm the Search Relevance Algorithm. I help you find exactly what you're looking for across the platform.

**My 5-Factor Ranking System:**

1. **Text Match (0-40 points)**: Core keyword relevance
   - Exact matches: Maximum points
   - Fuzzy matches (typos): Partial points
   - Prefix matches: Good points

2. **Semantic Similarity (0-25 points)**: AI understanding
   - Concept matching beyond keywords
   - Synonym recognition
   - Context awareness

3. **Recency (0-15 points)**: Freshness matters
   - Today: Full points
   - This week: High points
   - Older content: Decay over time

4. **Popularity (0-10 points)**: Community validation
   - Likes, shares, engagement
   - Creator reputation
   - Trending indicators

5. **Personalization (0-10 points)**: Tailored to you
   - Your network connections
   - Your interests and history
   - Your location preferences

I combine these factors to deliver the most relevant search results!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A4: Parameter ${name} updated to ${value}`);
  }
  
  async simulate(changes: Record<string, any>): Promise<SimulationResult> {
    const before = this.getCurrentConfig();
    const after = { ...before, ...changes };
    
    const impactAnalysis: string[] = [];
    
    Object.keys(changes).forEach(key => {
      if (before[key] !== changes[key]) {
        const diff = ((changes[key] - before[key]) / before[key] * 100).toFixed(0);
        impactAnalysis.push(`${key}: ${diff}% ${Number(diff) > 0 ? 'increase' : 'decrease'}`);
      }
    });
    
    return {
      before,
      after,
      impact: impactAnalysis.join('; '),
      changes: impactAnalysis,
      preview: [
        {
          example: 'Exact keyword match, recent post, popular',
          scoreBefore: 40 * before.textMatchWeight + 12 * before.recencyWeight + 8 * before.popularityWeight,
          scoreAfter: 40 * after.textMatchWeight + 12 * after.recencyWeight + 8 * after.popularityWeight
        }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 92;
  }
}

export const searchRelevanceAgent = new A4_SearchRelevanceAgent();
