/**
 * A3: Event Rankings Algorithm Agent
 * Engagement + proximity scoring for event recommendations
 */

import { AlgorithmAgent, Parameter, SimulationResult } from './AlgorithmAgent';

export class A3_EventRankingsAgent extends AlgorithmAgent {
  id = 'A3';
  name = 'Event Rankings Algorithm';
  description = 'Engagement + proximity scoring for personalized event recommendations';
  filePath = 'server/services/eventRecommendationService.ts';
  algorithmType: 'ranking' = 'ranking';
  esaLayers = [23, 26, 27];
  
  constructor() {
    super();
    
    this.parameters.set('proximityWeight', {
      name: 'proximityWeight',
      type: 'number',
      currentValue: 1.8,
      defaultValue: 1.8,
      min: 0.1,
      max: 3.0,
      description: 'Weight for event distance from user location',
      impact: 'Higher values prioritize nearby events'
    });
    
    this.parameters.set('friendAttendanceWeight', {
      name: 'friendAttendanceWeight',
      type: 'number',
      currentValue: 1.5,
      defaultValue: 1.5,
      min: 0.1,
      max: 3.0,
      description: 'Weight for friends attending the event',
      impact: 'Higher values prioritize events with friend attendance'
    });
    
    this.parameters.set('timeRelevanceWeight', {
      name: 'timeRelevanceWeight',
      type: 'number',
      currentValue: 1.2,
      defaultValue: 1.2,
      min: 0.1,
      max: 2.5,
      description: 'Weight for event timing (upcoming vs distant)',
      impact: 'Higher values prioritize sooner events'
    });
    
    this.parameters.set('popularityWeight', {
      name: 'popularityWeight',
      type: 'number',
      currentValue: 0.9,
      defaultValue: 0.9,
      min: 0.1,
      max: 2.0,
      description: 'Weight for event popularity and engagement',
      impact: 'Higher values prioritize well-attended events'
    });
    
    this.parameters.set('maxDistanceKm', {
      name: 'maxDistanceKm',
      type: 'number',
      currentValue: 50,
      defaultValue: 50,
      min: 5,
      max: 200,
      description: 'Maximum distance in kilometers for event suggestions',
      impact: 'Controls geographical range of recommendations'
    });
  }
  
  explain(): string {
    return `I'm the Event Rankings Algorithm. I help you discover the best tango events near you.

**My 4-Factor Scoring System:**

1. **Proximity (0-35 points)**: Location matters for attendance
   - Within 5km: Full points
   - 5-20km: High points
   - Beyond ${this.parameters.get('maxDistanceKm')?.currentValue}km: Excluded

2. **Friend Attendance (0-30 points)**: Social connections enhance events
   - Each attending friend adds value
   - Close friends weighted higher
   - Group dynamics considered

3. **Time Relevance (0-25 points)**: Timing impacts relevance
   - This week: High priority
   - This month: Medium priority
   - Future months: Lower priority

4. **Popularity (0-10 points)**: Community validation
   - RSVP count
   - Comments and engagement
   - Host reputation

I combine these factors to surface the most relevant events for you!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A3: Parameter ${name} updated to ${value}`);
  }
  
  async simulate(changes: Record<string, any>): Promise<SimulationResult> {
    const before = this.getCurrentConfig();
    const after = { ...before, ...changes };
    
    const impactAnalysis: string[] = [];
    
    Object.keys(changes).forEach(key => {
      if (before[key] !== changes[key]) {
        const diff = ((changes[key] - before[key]) / before[key] * 100).toFixed(0);
        impactAnalysis.push(`${key}: ${diff}% change`);
      }
    });
    
    return {
      before,
      after,
      impact: impactAnalysis.join('; '),
      changes: impactAnalysis,
      preview: [
        {
          example: 'Milonga 3km away, 8 friends attending, this weekend',
          scoreBefore: 35 * before.proximityWeight + 24 * before.friendAttendanceWeight + 20 * before.timeRelevanceWeight,
          scoreAfter: 35 * after.proximityWeight + 24 * after.friendAttendanceWeight + 20 * after.timeRelevanceWeight
        }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 88;
  }
}

export const eventRankingsAgent = new A3_EventRankingsAgent();
