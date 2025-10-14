/**
 * A2: Friend Recommendations Algorithm Agent
 * Social graph scoring for intelligent friend suggestions
 */

import { AlgorithmAgent, Parameter, SimulationResult } from './AlgorithmAgent';

export class A2_FriendRecommendationsAgent extends AlgorithmAgent {
  id = 'A2';
  name = 'Friend Recommendations Algorithm';
  description = 'Social graph scoring for friend suggestions based on mutual connections, shared interests, and proximity';
  filePath = 'server/services/friendSuggestionService.ts';
  algorithmType: 'ranking' = 'ranking';
  esaLayers = [21, 24, 26];
  
  constructor() {
    super();
    
    this.parameters.set('mutualFriendsWeight', {
      name: 'mutualFriendsWeight',
      type: 'number',
      currentValue: 1.5,
      defaultValue: 1.5,
      min: 0.1,
      max: 3.0,
      description: 'Weight for mutual friend connections',
      impact: 'Higher values prioritize users with more shared friends'
    });
    
    this.parameters.set('locationProximityWeight', {
      name: 'locationProximityWeight',
      type: 'number',
      currentValue: 1.2,
      defaultValue: 1.2,
      min: 0.1,
      max: 3.0,
      description: 'Weight for same city/nearby users',
      impact: 'Higher values prioritize geographically close users'
    });
    
    this.parameters.set('sharedInterestsWeight', {
      name: 'sharedInterestsWeight',
      type: 'number',
      currentValue: 1.0,
      defaultValue: 1.0,
      min: 0.1,
      max: 2.5,
      description: 'Weight for shared tango roles, levels, and interests',
      impact: 'Higher values prioritize similar dancers'
    });
    
    this.parameters.set('activityLevelWeight', {
      name: 'activityLevelWeight',
      type: 'number',
      currentValue: 0.8,
      defaultValue: 0.8,
      min: 0.1,
      max: 2.0,
      description: 'Weight for user engagement and activity',
      impact: 'Higher values prioritize active community members'
    });
    
    this.parameters.set('maxSuggestions', {
      name: 'maxSuggestions',
      type: 'number',
      currentValue: 20,
      defaultValue: 20,
      min: 5,
      max: 50,
      description: 'Maximum number of friend suggestions to return',
      impact: 'Controls the size of recommendations list'
    });
  }
  
  explain(): string {
    return `I'm the Friend Recommendations Algorithm. I help you discover meaningful connections in the tango community.

**My 4-Factor Scoring System:**

1. **Mutual Friends (0-35 points)**: Strong indicator of compatibility
   - Each mutual friend adds value
   - More shared connections = higher relevance

2. **Location Proximity (0-30 points)**: Geography matters for real connections
   - Same city: Full points
   - Nearby cities: Partial points
   - Distance-based decay

3. **Shared Interests (0-25 points)**: Common ground for connection
   - Matching tango roles/levels
   - Shared groups and communities
   - Similar engagement patterns

4. **Activity Level (0-10 points)**: Active users make better connections
   - Recent posts and interactions
   - Event attendance
   - Platform engagement

I combine these factors with adjustable weights to surface the most relevant friend suggestions for you!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A2: Parameter ${name} updated to ${value}`);
  }
  
  async simulate(changes: Record<string, any>): Promise<SimulationResult> {
    const before = this.getCurrentConfig();
    const after = { ...before, ...changes };
    
    const impactAnalysis: string[] = [];
    
    if (changes.mutualFriendsWeight) {
      const diff = ((changes.mutualFriendsWeight - before.mutualFriendsWeight) / before.mutualFriendsWeight * 100).toFixed(0);
      impactAnalysis.push(`Mutual friends ${diff}% ${Number(diff) > 0 ? 'more' : 'less'} influential`);
    }
    
    if (changes.locationProximityWeight) {
      const diff = ((changes.locationProximityWeight - before.locationProximityWeight) / before.locationProximityWeight * 100).toFixed(0);
      impactAnalysis.push(`Location proximity ${diff}% ${Number(diff) > 0 ? 'more' : 'less'} important`);
    }
    
    return {
      before,
      after,
      impact: impactAnalysis.join('; '),
      changes: impactAnalysis,
      preview: [
        {
          example: '5 mutual friends, same city, matching tango level',
          scoreBefore: 35 * before.mutualFriendsWeight + 30 * before.locationProximityWeight + 15 * before.sharedInterestsWeight,
          scoreAfter: 35 * after.mutualFriendsWeight + 30 * after.locationProximityWeight + 15 * after.sharedInterestsWeight
        }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 90;
  }
}

export const friendRecommendationsAgent = new A2_FriendRecommendationsAgent();
