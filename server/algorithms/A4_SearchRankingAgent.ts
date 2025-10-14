import { AlgorithmAgent, Parameter } from './AlgorithmAgent';

export class A4_SearchRankingAgent extends AlgorithmAgent {
  id = 'A4';
  name = 'Search Ranking Algorithm';
  description = 'Intelligent search result ranking using relevance, recency, popularity, and personalization';
  filePath = 'server/services/searchService.ts';
  algorithmType: 'ranking' = 'ranking';
  esaLayers = [26, 21, 24];
  
  constructor() {
    super();
    
    this.parameters.set('relevanceWeight', {
      name: 'relevanceWeight',
      type: 'number',
      currentValue: 1.5,
      defaultValue: 1.5,
      min: 0.5,
      max: 3.0,
      description: 'Weight for text relevance/match quality',
      impact: 'Higher values prioritize exact/close matches'
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
      description: 'Weight for content popularity (views, engagement)',
      impact: 'Higher values prioritize popular content'
    });
    
    this.parameters.set('personalizationWeight', {
      name: 'personalizationWeight',
      type: 'number',
      currentValue: 0.4,
      defaultValue: 0.4,
      min: 0.0,
      max: 1.5,
      description: 'Weight for personalized relevance',
      impact: 'Higher values customize results to user preferences'
    });
  }
  
  explain(): string {
    return `I'm the Search Ranking Algorithm. I order search results to show you the most relevant content first.

**My 4-Factor Ranking:**

1. **Relevance (0-40 points)** - How well content matches your query
2. **Recency (0-25 points)** - How recent the content is
3. **Popularity (0-20 points)** - Engagement and views
4. **Personalization (0-15 points)** - Tailored to your interests

I balance universal relevance with personalized recommendations!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A4: Parameter ${name} updated to ${value}`);
  }
  
  async simulate(changes: Record<string, any>) {
    const before = this.getCurrentConfig();
    const after = { ...before, ...changes };
    
    return {
      before,
      after,
      impact: 'Search results will be reordered based on new ranking priorities',
      changes: Object.keys(changes).map(key => 
        `${key}: ${before[key]} → ${after[key]}`
      ),
      preview: [
        { example: 'Recent post with exact keyword match', scoreBefore: 65, scoreAfter: 80 }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 85;
  }
}
