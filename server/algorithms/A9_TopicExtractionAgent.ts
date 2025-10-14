/**
 * A9: Topic Extraction Algorithm Agent
 * Content categorization and topic modeling
 */

import { AlgorithmAgent, Parameter, SimulationResult } from './AlgorithmAgent';

export class A9_TopicExtractionAgent extends AlgorithmAgent {
  id = 'A9';
  name = 'Topic Extraction Algorithm';
  description = 'AI-powered content categorization and automatic topic tagging using NLP';
  filePath = 'server/services/topicExtractionService.ts';
  algorithmType: 'prediction' = 'prediction';
  esaLayers = [33, 44, 25];
  
  constructor() {
    super();
    
    this.parameters.set('maxTopicsPerDocument', {
      name: 'maxTopicsPerDocument',
      type: 'number',
      currentValue: 5,
      defaultValue: 5,
      min: 1,
      max: 15,
      description: 'Maximum topics to extract per post/document',
      impact: 'More topics = better categorization but noisier'
    });
    
    this.parameters.set('topicConfidenceThreshold', {
      name: 'topicConfidenceThreshold',
      type: 'number',
      currentValue: 0.4,
      defaultValue: 0.4,
      min: 0.1,
      max: 0.9,
      description: 'Minimum confidence for topic assignment',
      impact: 'Higher values = fewer but more certain topics'
    });
    
    this.parameters.set('extractionMethod', {
      name: 'extractionMethod',
      type: 'enum',
      currentValue: 'hybrid',
      defaultValue: 'hybrid',
      enumValues: ['keyword', 'semantic', 'hybrid'],
      description: 'Topic extraction method',
      impact: 'keyword: fast/simple, semantic: AI/accurate, hybrid: best of both'
    });
    
    this.parameters.set('customTopicsEnabled', {
      name: 'customTopicsEnabled',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Enable custom tango-specific topics (milonga, practica, vals)',
      impact: 'Recognizes tango terminology and events'
    });
    
    this.parameters.set('languageSupport', {
      name: 'languageSupport',
      type: 'enum',
      currentValue: 'multilingual',
      defaultValue: 'multilingual',
      enumValues: ['english', 'spanish', 'multilingual'],
      description: 'Language support for topic extraction',
      impact: 'multilingual: supports all languages but slower'
    });
  }
  
  explain(): string {
    return `I'm the Topic Extraction Algorithm. I automatically categorize content into topics.

**My Topic Detection System:**

1. **Extraction Method** (${this.parameters.get('extractionMethod')?.currentValue}):
   - Keyword: TF-IDF, word frequency
   - Semantic: AI embeddings, concept matching
   - Hybrid: Combines both for accuracy

2. **Tango-Specific Topics** ${this.parameters.get('customTopicsEnabled')?.currentValue ? '(Enabled)' : '(Disabled)'}:
   - Events: Milonga, Practica, Festival
   - Styles: Salon, Nuevo, Vals, Milonga
   - Learning: Classes, Workshops, Technique
   - Social: Community, Travel, Housing

3. **Topic Assignment**:
   - Max topics: ${this.parameters.get('maxTopicsPerDocument')?.currentValue} per post
   - Confidence: >${(this.parameters.get('topicConfidenceThreshold')?.currentValue * 100).toFixed(0)}%
   - Multi-language: ${this.parameters.get('languageSupport')?.currentValue}

**Applications:**
- Content organization
- Search improvement
- Personalized feeds
- Trending topics
- Related content suggestions

I help organize the tango world!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A9: Parameter ${name} updated to ${value}`);
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
          text: "Amazing vals class at La Viruta tonight! New technique for volcadas.",
          topicsBefore: ['vals', 'classes', 'technique', 'milonga'],
          topicsAfter: ['vals', 'classes', 'technique', 'milonga']
        }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 85;
  }
}

export const topicExtractionAgent = new A9_TopicExtractionAgent();
