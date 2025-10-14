/**
 * A7: Housing Match Algorithm Agent
 * Preference matching for housing listings and roommate compatibility
 */

import { AlgorithmAgent, Parameter, SimulationResult } from './AlgorithmAgent';

export class A7_HousingMatchAgent extends AlgorithmAgent {
  id = 'A7';
  name = 'Housing Match Algorithm';
  description = 'Intelligent preference matching for housing listings and roommate compatibility';
  filePath = 'server/services/housingMatchService.ts';
  algorithmType: 'recommendation' = 'recommendation';
  esaLayers = [19, 26, 27];
  
  constructor() {
    super();
    
    this.parameters.set('locationWeight', {
      name: 'locationWeight',
      type: 'number',
      currentValue: 2.0,
      defaultValue: 2.0,
      min: 0.5,
      max: 4.0,
      description: 'Weight for location match (city, neighborhood)',
      impact: 'Higher values prioritize location preferences'
    });
    
    this.parameters.set('budgetMatchWeight', {
      name: 'budgetMatchWeight',
      type: 'number',
      currentValue: 1.8,
      defaultValue: 1.8,
      min: 0.5,
      max: 3.0,
      description: 'Weight for budget/price compatibility',
      impact: 'Higher values prioritize budget alignment'
    });
    
    this.parameters.set('lifestyleWeight', {
      name: 'lifestyleWeight',
      type: 'number',
      currentValue: 1.3,
      defaultValue: 1.3,
      min: 0.1,
      max: 2.5,
      description: 'Weight for lifestyle preferences (smoking, pets, quiet)',
      impact: 'Higher values prioritize lifestyle compatibility'
    });
    
    this.parameters.set('amenitiesWeight', {
      name: 'amenitiesWeight',
      type: 'number',
      currentValue: 0.9,
      defaultValue: 0.9,
      min: 0.1,
      max: 2.0,
      description: 'Weight for amenities match (wifi, parking, etc)',
      impact: 'Higher values prioritize amenity preferences'
    });
    
    this.parameters.set('durationWeight', {
      name: 'durationWeight',
      type: 'number',
      currentValue: 1.1,
      defaultValue: 1.1,
      min: 0.1,
      max: 2.0,
      description: 'Weight for stay duration compatibility',
      impact: 'Higher values prioritize duration alignment'
    });
    
    this.parameters.set('verifiedHostBonus', {
      name: 'verifiedHostBonus',
      type: 'number',
      currentValue: 15,
      defaultValue: 15,
      min: 0,
      max: 30,
      description: 'Bonus points for verified hosts',
      impact: 'Extra points for trusted hosts'
    });
  }
  
  explain(): string {
    return `I'm the Housing Match Algorithm. I connect guests with perfect housing matches.

**My 5-Factor Matching System:**

1. **Location (0-35 points)**: Geography is crucial
   - Exact city: Full points
   - Preferred neighborhood: Bonus
   - Distance to landmarks: Considered

2. **Budget (0-30 points)**: Price compatibility
   - Within budget: Maximum points
   - Slightly over/under: Partial points
   - Good value indicators

3. **Lifestyle (0-20 points)**: Compatible living
   - Smoking preferences
   - Pet policies
   - Noise levels
   - Cleanliness standards

4. **Amenities (0-10 points)**: Must-have features
   - WiFi, parking, kitchen
   - Laundry, workspace
   - Matched to preferences

5. **Duration (0-5 points)**: Timing alignment
   - Short-term vs long-term
   - Availability match
   - Flexible dates bonus

**Trust Bonus**: Verified hosts get +${this.parameters.get('verifiedHostBonus')?.currentValue} points!

I help you find your perfect tango home away from home!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A7: Parameter ${name} updated to ${value}`);
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
          example: 'Perfect location, budget match, verified host',
          scoreBefore: 35 * before.locationWeight + 30 * before.budgetMatchWeight + before.verifiedHostBonus,
          scoreAfter: 35 * after.locationWeight + 30 * after.budgetMatchWeight + after.verifiedHostBonus
        },
        {
          example: 'Good match with all amenities',
          scoreBefore: 25 * before.locationWeight + 20 * before.lifestyleWeight + 10 * before.amenitiesWeight,
          scoreAfter: 25 * after.locationWeight + 20 * after.lifestyleWeight + 10 * after.amenitiesWeight
        }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 91;
  }
}

export const housingMatchAgent = new A7_HousingMatchAgent();
