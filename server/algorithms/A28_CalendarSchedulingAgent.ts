/**
 * A28: Calendar Scheduling Algorithm Agent
 * Availability matching and event coordination
 */

import { AlgorithmAgent, Parameter, SimulationResult } from './AlgorithmAgent';

export class A28_CalendarSchedulingAgent extends AlgorithmAgent {
  id = 'A28';
  name = 'Calendar Scheduling Algorithm';
  description = 'Intelligent availability matching and automatic event scheduling';
  filePath = 'server/services/schedulingService.ts';
  algorithmType: 'optimization' = 'optimization';
  esaLayers = [23, 35, 44];
  
  constructor() {
    super();
    
    this.parameters.set('conflictDetectionEnabled', {
      name: 'conflictDetectionEnabled',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Detect scheduling conflicts automatically',
      impact: 'Prevents double-booking'
    });
    
    this.parameters.set('smartSuggestionsEnabled', {
      name: 'smartSuggestionsEnabled',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'AI-powered optimal time suggestions',
      impact: 'Finds best times for all attendees'
    });
    
    this.parameters.set('timezoneHandling', {
      name: 'timezoneHandling',
      type: 'enum',
      currentValue: 'auto-convert',
      defaultValue: 'auto-convert',
      enumValues: ['user-timezone', 'auto-convert', 'event-timezone'],
      description: 'Timezone conversion strategy',
      impact: 'Prevents timezone confusion'
    });
    
    this.parameters.set('preferredDayParts', {
      name: 'preferredDayParts',
      type: 'enum',
      currentValue: 'evening',
      defaultValue: 'evening',
      enumValues: ['morning', 'afternoon', 'evening', 'any'],
      description: 'Preferred time of day for events',
      impact: 'Biases suggestions to preferred times'
    });
    
    this.parameters.set('bufferTimeMinutes', {
      name: 'bufferTimeMinutes',
      type: 'number',
      currentValue: 30,
      defaultValue: 30,
      min: 0,
      max: 120,
      description: 'Buffer time between events in minutes',
      impact: 'Travel/preparation time between events'
    });
    
    this.parameters.set('recurringEventSupport', {
      name: 'recurringEventSupport',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Handle recurring events (weekly milongas)',
      impact: 'Automatic scheduling of regular events'
    });
  }
  
  explain(): string {
    return `I'm the Calendar Scheduling Algorithm. I find the perfect time for everyone.

**My Scheduling System:**

1. **Conflict Detection** ${this.parameters.get('conflictDetectionEnabled')?.currentValue ? '(Active)' : '(Off)'}:
   - Check existing events
   - Detect overlaps
   - Suggest alternatives
   - ${this.parameters.get('bufferTimeMinutes')?.currentValue}min buffer between events

2. **Smart Suggestions** ${this.parameters.get('smartSuggestionsEnabled')?.currentValue ? '(Enabled)' : '(Disabled)'}:
   - Analyze all attendees' calendars
   - Find mutual availability
   - Optimize for ${this.parameters.get('preferredDayParts')?.currentValue} times
   - Consider timezone differences

3. **Timezone Handling** (${this.parameters.get('timezoneHandling')?.currentValue}):
   - User timezone: Show in user's time
   - Auto-convert: Smart conversion
   - Event timezone: Use event's location

4. **Features**:
   - Recurring events: ${this.parameters.get('recurringEventSupport')?.currentValue ? 'Supported' : 'One-time only'}
   - Multi-attendee coordination
   - Calendar integrations (Google, Outlook)
   - Reminder management

**Common Use Cases**:
- Weekly milonga scheduling
- Practice session coordination
- Group class planning
- Festival attendance

I make scheduling effortless!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A28: Parameter ${name} updated to ${value}`);
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
          scenario: 'Schedule practice with 5 dancers',
          beforeSuggestions: ['Tue 7pm', 'Wed 8pm', 'Thu 7pm'],
          afterSuggestions: after.smartSuggestionsEnabled ? ['Thu 7pm (all free)', 'Tue 7pm (4/5 free)'] : ['Tue 7pm', 'Wed 8pm'],
          optimalTime: 'Thursday 7pm'
        },
        {
          scenario: 'Buenos Aires milonga from NYC',
          beforeTime: '8:00 PM',
          afterTime: after.timezoneHandling === 'auto-convert' ? '8:00 PM ART (7:00 PM EST)' : '8:00 PM',
          clarity: 'Timezone shown'
        }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 86;
  }
}

export const calendarSchedulingAgent = new A28_CalendarSchedulingAgent();
