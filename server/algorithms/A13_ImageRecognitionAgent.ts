/**
 * A13: Image Recognition Algorithm Agent
 * Visual classification and scene understanding
 */

import { AlgorithmAgent, Parameter, SimulationResult } from './AlgorithmAgent';

export class A13_ImageRecognitionAgent extends AlgorithmAgent {
  id = 'A13';
  name = 'Image Recognition Algorithm';
  description = 'AI-powered visual classification for automatic tagging and content understanding';
  filePath = 'server/services/imageRecognitionService.ts';
  algorithmType: 'prediction' = 'prediction';
  esaLayers = [33, 44, 25];
  
  constructor() {
    super();
    
    this.parameters.set('confidenceThreshold', {
      name: 'confidenceThreshold',
      type: 'number',
      currentValue: 0.6,
      defaultValue: 0.6,
      min: 0.3,
      max: 0.95,
      description: 'Minimum confidence for tag assignment',
      impact: 'Higher = fewer but more accurate tags'
    });
    
    this.parameters.set('maxTagsPerImage', {
      name: 'maxTagsPerImage',
      type: 'number',
      currentValue: 8,
      defaultValue: 8,
      min: 3,
      max: 20,
      description: 'Maximum automatic tags per image',
      impact: 'More tags = better search but noisier'
    });
    
    this.parameters.set('tangoSceneDetection', {
      name: 'tangoSceneDetection',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Specialized tango scene detection (milonga, embrace, stage)',
      impact: 'Recognizes tango-specific contexts'
    });
    
    this.parameters.set('faceRecognitionEnabled', {
      name: 'faceRecognitionEnabled',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Detect and count faces in images',
      impact: 'Enables face counting and group photos detection'
    });
    
    this.parameters.set('sceneComplexity', {
      name: 'sceneComplexity',
      type: 'enum',
      currentValue: 'detailed',
      defaultValue: 'detailed',
      enumValues: ['basic', 'detailed', 'comprehensive'],
      description: 'Level of scene analysis detail',
      impact: 'basic: objects only, detailed: +scenes, comprehensive: +relationships'
    });
    
    this.parameters.set('aestheticScoring', {
      name: 'aestheticScoring',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Score image aesthetic quality',
      impact: 'Ranks images by visual appeal for feeds'
    });
  }
  
  explain(): string {
    return `I'm the Image Recognition Algorithm. I understand what's in your photos using AI vision.

**My Visual Analysis System:**

1. **Object Detection** (${this.parameters.get('sceneComplexity')?.currentValue} mode):
   - Basic: Objects (people, places, things)
   - Detailed: + Scenes (milonga, restaurant, street)
   - Comprehensive: + Relationships (dancing, sitting, performing)

2. **Tango-Specific Detection** ${this.parameters.get('tangoSceneDetection')?.currentValue ? '(Enabled)' : '(Disabled)'}:
   - Dance contexts: Milonga, practica, stage performance
   - Dance elements: Embrace, volcada, gancho, sacada
   - Venues: Dance halls, outdoor events
   - Groups: Solo, couple, group photos

3. **Face Analysis** ${this.parameters.get('faceRecognitionEnabled')?.currentValue ? '(Active)' : '(Disabled)'}:
   - Face count detection
   - Group size estimation
   - No identity recognition (privacy)

4. **Quality Scoring** ${this.parameters.get('aestheticScoring')?.currentValue ? '(On)' : '(Off)'}:
   - Composition quality
   - Lighting and color
   - Sharpness and clarity

**Auto-Tagging**: Up to ${this.parameters.get('maxTagsPerImage')?.currentValue} tags @ ${(this.parameters.get('confidenceThreshold')?.currentValue * 100).toFixed(0)}% confidence

I make your memories searchable and discoverable!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A13: Parameter ${name} updated to ${value}`);
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
          image: 'Couple dancing at milonga',
          tagsBefore: ['dance', 'people', 'indoor', 'tango', 'milonga', 'couple'],
          tagsAfter: ['dance', 'people', 'indoor', 'tango', 'milonga', 'couple'],
          confidence: 0.89
        },
        {
          image: 'Group photo at festival',
          tagsBefore: ['group', 'people', 'outdoor', 'event'],
          tagsAfter: ['group', 'people', 'outdoor', 'event', 'festival'],
          confidence: 0.76
        }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 84;
  }
}

export const imageRecognitionAgent = new A13_ImageRecognitionAgent();
