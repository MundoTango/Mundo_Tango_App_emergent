import { AlgorithmAgent, Parameter } from './AlgorithmAgent';

export class A3_EventRecommendationsAgent extends AlgorithmAgent {
  id = 'A3';
  name = 'Event Recommendations Algorithm';
  description = 'Smart event recommendations based on location, interests, attendance history, and social connections';
  filePath = 'server/services/eventRecommendationService.ts';
  algorithmType: 'recommendation' = 'recommendation';
  esaLayers = [22, 26, 24];
  
  constructor() {
    super();
    
    this.parameters.set('locationProximityWeight', {
      name: 'locationProximityWeight',
      type: 'number',
      currentValue: 1.2,
      defaultValue: 1.2,
      min: 0.1,
      max: 3.0,
      description: 'Weight for event proximity to user location',
      impact: 'Higher values prioritize nearby events'
    });
    
    this.parameters.set('interestMatchWeight', {
      name: 'interestMatchWeight',
      type: 'number',
      currentValue: 1.0,
      defaultValue: 1.0,
      min: 0.1,
      max: 3.0,
      description: 'Weight for matching user interests/preferences',
      impact: 'Higher values prioritize events matching user interests'
    });
    
    this.parameters.set('historicalAttendanceWeight', {
      name: 'historicalAttendanceWeight',
      type: 'number',
      currentValue: 0.8,
      defaultValue: 0.8,
      min: 0.1,
      max: 2.0,
      description: 'Weight for similar past events attended',
      impact: 'Higher values recommend similar events to past attendance'
    });
    
    this.parameters.set('socialConnectionsWeight', {
      name: 'socialConnectionsWeight',
      type: 'number',
      currentValue: 0.6,
      defaultValue: 0.6,
      min: 0.1,
      max: 2.0,
      description: 'Weight for friends attending',
      impact: 'Higher values prioritize events with friends going'
    });
  }
  
  explain(): string {
    return `I'm the Event Recommendations Algorithm. I help you discover events you'll love!

**My 4-Factor Scoring:**

1. **Location Proximity (0-35 points)** - Events near you
2. **Interest Match (0-30 points)** - Aligned with your preferences
3. **Historical Attendance (0-20 points)** - Similar to events you've enjoyed
4. **Social Connections (0-15 points)** - Friends attending

I learn from your attendance patterns to improve recommendations over time!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A3: Parameter ${name} updated to ${value}`);
  }
  
  async simulate(changes: Record<string, any>) {
    const before = this.getCurrentConfig();
    const after = { ...before, ...changes };
    
    return {
      before,
      after,
      impact: 'Event recommendations will be reordered based on new priorities',
      changes: Object.keys(changes).map(key => 
        `${key}: ${before[key]} → ${after[key]}`
      ),
      preview: [
        { example: 'Nearby milonga with 3 friends attending', scoreBefore: 70, scoreAfter: 85 }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 80;
  }
}
