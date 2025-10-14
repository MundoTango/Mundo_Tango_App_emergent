/**
 * A15: Voice Commands Algorithm Agent
 * Speech processing and intent recognition
 */

import { AlgorithmAgent, Parameter, SimulationResult } from './AlgorithmAgent';

export class A15_VoiceCommandsAgent extends AlgorithmAgent {
  id = 'A15';
  name = 'Voice Commands Algorithm';
  description = 'AI-powered speech processing and natural language command understanding';
  filePath = 'server/services/voiceCommandsService.ts';
  algorithmType: 'prediction' = 'prediction';
  esaLayers = [31, 33, 44];
  
  constructor() {
    super();
    
    this.parameters.set('intentConfidenceThreshold', {
      name: 'intentConfidenceThreshold',
      type: 'number',
      currentValue: 0.7,
      defaultValue: 0.7,
      min: 0.4,
      max: 0.95,
      description: 'Minimum confidence for intent recognition',
      impact: 'Higher = stricter command understanding'
    });
    
    this.parameters.set('multilingualSupport', {
      name: 'multilingualSupport',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Support voice commands in multiple languages',
      impact: 'EN/ES/FR/IT voice recognition'
    });
    
    this.parameters.set('contextMemorySize', {
      name: 'contextMemorySize',
      type: 'number',
      currentValue: 5,
      defaultValue: 5,
      min: 1,
      max: 20,
      description: 'Number of previous commands to remember for context',
      impact: 'Larger memory = better conversational flow'
    });
    
    this.parameters.set('noiseReductionLevel', {
      name: 'noiseReductionLevel',
      type: 'enum',
      currentValue: 'medium',
      defaultValue: 'medium',
      enumValues: ['low', 'medium', 'high', 'adaptive'],
      description: 'Background noise reduction level',
      impact: 'Higher = works in noisy environments but may cut speech'
    });
    
    this.parameters.set('wakePhraseEnabled', {
      name: 'wakePhraseEnabled',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Require wake phrase ("Hey Tango") before commands',
      impact: 'Prevents accidental activation'
    });
    
    this.parameters.set('confirmationRequired', {
      name: 'confirmationRequired',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Require confirmation for destructive actions',
      impact: 'Prevents accidental deletes/posts'
    });
  }
  
  explain(): string {
    return `I'm the Voice Commands Algorithm. I understand and execute spoken commands.

**My Speech Processing System:**

1. **Wake Phrase** ${this.parameters.get('wakePhraseEnabled')?.currentValue ? '(Active)' : '(Disabled)'}:
   - Trigger: "Hey Tango" or "OK Tango"
   - Prevents accidental activation
   - Always-listening mode available

2. **Intent Recognition** (${(this.parameters.get('intentConfidenceThreshold')?.currentValue * 100).toFixed(0)}% confidence):
   - Navigation: "Go to events", "Show my profile"
   - Actions: "Post about...", "Message friend"
   - Search: "Find milongas in Buenos Aires"
   - Playback: "Play tango music"

3. **Multilingual** ${this.parameters.get('multilingualSupport')?.currentValue ? '(Enabled)' : '(Disabled)'}:
   - English, Spanish, French, Italian
   - Auto language detection
   - Mixed language support

4. **Context Memory**: ${this.parameters.get('contextMemorySize')?.currentValue} commands
   - Follows conversation flow
   - Understands "that", "there", "it"
   - Multi-turn dialogs

5. **Noise Reduction**: ${this.parameters.get('noiseReductionLevel')?.currentValue}
   - Works at milongas
   - Street noise filtering
   - Music background handling

**Safety**: Confirmation ${this.parameters.get('confirmationRequired')?.currentValue ? 'required' : 'optional'} for posts, deletes, payments

I make hands-free navigation easy!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A15: Parameter ${name} updated to ${value}`);
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
          speech: "Hey Tango, find milongas near me",
          intentBefore: { action: 'search', target: 'events', location: 'nearby', confidence: 0.92 },
          intentAfter: { action: 'search', target: 'events', location: 'nearby', confidence: 0.92 },
          executed: true
        },
        {
          speech: "Post about last night's milonga",
          intentBefore: { action: 'create_post', content: "last night's milonga", confidence: 0.78 },
          intentAfter: { action: 'create_post', content: "last night's milonga", confidence: 0.78 },
          executed: before.confirmationRequired ? 'pending_confirm' : true
        }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 72;
  }
}

export const voiceCommandsAgent = new A15_VoiceCommandsAgent();
