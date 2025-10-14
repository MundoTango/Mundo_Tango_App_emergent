import { AlgorithmAgent, Parameter } from './AlgorithmAgent';

export class A2_FriendSuggestionsAgent extends AlgorithmAgent {
  id = 'A2';
  name = 'Friend Suggestions Algorithm';
  description = 'Intelligent friend recommendations based on city, mutual friends, profile similarity, and activity level';
  filePath = 'server/services/friendSuggestionService.ts';
  algorithmType: 'ranking' = 'ranking';
  esaLayers = [21, 24, 26];
  
  constructor() {
    super();
    
    this.parameters.set('cityMatchWeight', {
      name: 'cityMatchWeight',
      type: 'number',
      currentValue: 1.0,
      defaultValue: 1.0,
      min: 0.1,
      max: 3.0,
      description: 'Weight for same-city matches',
      impact: 'Higher values prioritize users in the same city'
    });
    
    this.parameters.set('mutualFriendsWeight', {
      name: 'mutualFriendsWeight',
      type: 'number',
      currentValue: 1.0,
      defaultValue: 1.0,
      min: 0.1,
      max: 3.0,
      description: 'Weight for mutual friend connections',
      impact: 'Higher values prioritize users with shared friends'
    });
    
    this.parameters.set('profileSimilarityWeight', {
      name: 'profileSimilarityWeight',
      type: 'number',
      currentValue: 0.8,
      defaultValue: 0.8,
      min: 0.1,
      max: 2.0,
      description: 'Weight for profile similarity (tango roles, levels)',
      impact: 'Higher values prioritize similar dancers'
    });
    
    this.parameters.set('activityLevelWeight', {
      name: 'activityLevelWeight',
      type: 'number',
      currentValue: 0.5,
      defaultValue: 0.5,
      min: 0.1,
      max: 2.0,
      description: 'Weight for user activity level',
      impact: 'Higher values prioritize active users'
    });
  }
  
  explain(): string {
    return `I'm the Friend Suggestions Algorithm. I help you discover potential friends in the tango community.

**My 4-Factor Ranking System:**

1. **City Match (0-30 points)** - Same city connections
2. **Mutual Friends (0-30 points)** - Shared network connections  
3. **Profile Similarity (0-25 points)** - Matching tango roles & levels
4. **Activity Level (0-15 points)** - Recent platform engagement

I combine these factors with your custom weights to rank potential friends!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A2: Parameter ${name} updated to ${value}`);
  }
  
  async simulate(changes: Record<string, any>) {
    const before = this.getCurrentConfig();
    const after = { ...before, ...changes };
    
    return {
      before,
      after,
      impact: 'Friend suggestions will be re-ranked based on new weights',
      changes: Object.keys(changes).map(key => 
        `${key}: ${before[key]} → ${after[key]}`
      ),
      preview: [
        { example: 'Same city, 5 mutual friends', scoreBefore: 50, scoreAfter: 60 }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 75;
  }
}
