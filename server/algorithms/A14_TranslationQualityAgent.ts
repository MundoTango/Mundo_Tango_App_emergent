/**
 * A14: Translation Quality Algorithm Agent
 * Language scoring and translation optimization
 */

import { AlgorithmAgent, Parameter, SimulationResult } from './AlgorithmAgent';

export class A14_TranslationQualityAgent extends AlgorithmAgent {
  id = 'A14';
  name = 'Translation Quality Algorithm';
  description = 'AI-powered translation quality scoring and optimization for multilingual content';
  filePath = 'server/services/translationService.ts';
  algorithmType: 'scoring' = 'scoring';
  esaLayers = [30, 33, 44];
  
  constructor() {
    super();
    
    this.parameters.set('qualityThreshold', {
      name: 'qualityThreshold',
      type: 'number',
      currentValue: 0.75,
      defaultValue: 0.75,
      min: 0.5,
      max: 0.95,
      description: 'Minimum quality score for auto-publish',
      impact: 'Higher = stricter translation standards'
    });
    
    this.parameters.set('contextPreservationWeight', {
      name: 'contextPreservationWeight',
      type: 'number',
      currentValue: 1.5,
      defaultValue: 1.5,
      min: 0.5,
      max: 3.0,
      description: 'Weight for cultural/contextual preservation',
      impact: 'Higher = prioritizes meaning over literal translation'
    });
    
    this.parameters.set('tangoTerminologyWeight', {
      name: 'tangoTerminologyWeight',
      type: 'number',
      currentValue: 2.0,
      defaultValue: 2.0,
      min: 0.5,
      max: 3.0,
      description: 'Weight for tango-specific terminology accuracy',
      impact: 'Higher = preserves dance terms (milonga, abrazo, etc)'
    });
    
    this.parameters.set('formalityDetection', {
      name: 'formalityDetection',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Detect and preserve formality level (tú/usted)',
      impact: 'Maintains social context in translations'
    });
    
    this.parameters.set('fallbackStrategy', {
      name: 'fallbackStrategy',
      type: 'enum',
      currentValue: 'hybrid',
      defaultValue: 'hybrid',
      enumValues: ['original', 'machine', 'hybrid'],
      description: 'Strategy when quality is low',
      impact: 'original: show untranslated, machine: show anyway, hybrid: flag + show'
    });
    
    this.parameters.set('supportedLanguages', {
      name: 'supportedLanguages',
      type: 'number',
      currentValue: 10,
      defaultValue: 10,
      min: 3,
      max: 30,
      description: 'Number of active translation languages',
      impact: 'More languages = broader reach but more complexity'
    });
  }
  
  explain(): string {
    return `I'm the Translation Quality Algorithm. I ensure translations preserve meaning and context.

**My Quality Scoring System:**

1. **Quality Metrics** (0-100 score):
   - Fluency: Natural language flow
   - Accuracy: Semantic preservation (${this.parameters.get('contextPreservationWeight')?.currentValue}x)
   - Terminology: Tango-specific terms (${this.parameters.get('tangoTerminologyWeight')?.currentValue}x)
   - Formality: ${this.parameters.get('formalityDetection')?.currentValue ? 'Preserved' : 'Ignored'} (tú/usted, vous/tu)

2. **Tango Terminology Protection**:
   - Dance terms: milonga, tanda, cortina, vals
   - Techniques: abrazo, ocho, gancho, boleo
   - Social: tanguero, milonguero, código
   - Kept in original or carefully translated

3. **Quality Threshold**: ${(this.parameters.get('qualityThreshold')?.currentValue * 100).toFixed(0)}%
   - Above: Auto-publish
   - Below: ${this.parameters.get('fallbackStrategy')?.currentValue} fallback

4. **Supported Languages**: ${this.parameters.get('supportedLanguages')?.currentValue} active
   - ES ↔ EN (high quality)
   - FR, IT, PT, DE (good quality)
   - Others (machine translation)

**Cultural Context**: I preserve idioms, humor, and cultural references!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A14: Parameter ${name} updated to ${value}`);
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
          original: '¡La milonga estuvo increíble! El abrazo fue perfecto.',
          translation: 'The milonga was incredible! The embrace was perfect.',
          scoreBefore: 0.92,
          scoreAfter: 0.92,
          notes: 'Tango terms preserved'
        },
        {
          original: 'Tu bailas muy bien, ¿quieres bailar?',
          translation: 'You dance very well, would you like to dance?',
          scoreBefore: 0.85,
          scoreAfter: 0.85,
          notes: 'Informal tú preserved as informal you'
        }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 78;
  }
}

export const translationQualityAgent = new A14_TranslationQualityAgent();
