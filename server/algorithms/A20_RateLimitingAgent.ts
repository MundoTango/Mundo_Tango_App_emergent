/**
 * A20: Rate Limiting Algorithm Agent
 * Abuse prevention and fair usage enforcement
 */

import { AlgorithmAgent, Parameter, SimulationResult } from './AlgorithmAgent';

export class A20_RateLimitingAgent extends AlgorithmAgent {
  id = 'A20';
  name = 'Rate Limiting Algorithm';
  description = 'Intelligent abuse prevention and fair usage policy enforcement';
  filePath = 'server/services/rateLimitingService.ts';
  algorithmType: 'scoring' = 'scoring';
  esaLayers = [29, 37, 44];
  
  constructor() {
    super();
    
    this.parameters.set('requestsPerMinute', {
      name: 'requestsPerMinute',
      type: 'number',
      currentValue: 60,
      defaultValue: 60,
      min: 10,
      max: 500,
      description: 'Max requests per minute per user',
      impact: 'Lower = stricter limits, higher = more permissive'
    });
    
    this.parameters.set('burstAllowance', {
      name: 'burstAllowance',
      type: 'number',
      currentValue: 20,
      defaultValue: 20,
      min: 0,
      max: 100,
      description: 'Additional requests allowed in bursts',
      impact: 'Allows temporary spikes without blocking'
    });
    
    this.parameters.set('limitingAlgorithm', {
      name: 'limitingAlgorithm',
      type: 'enum',
      currentValue: 'token-bucket',
      defaultValue: 'token-bucket',
      enumValues: ['fixed-window', 'sliding-window', 'token-bucket', 'leaky-bucket'],
      description: 'Rate limiting algorithm',
      impact: 'token-bucket: smooth, sliding-window: precise, leaky-bucket: queue-based'
    });
    
    this.parameters.set('trustedUserMultiplier', {
      name: 'trustedUserMultiplier',
      type: 'number',
      currentValue: 3.0,
      defaultValue: 3.0,
      min: 1.0,
      max: 10.0,
      description: 'Rate limit multiplier for trusted users',
      impact: 'Higher limits for verified/power users'
    });
    
    this.parameters.set('dynamicThrottling', {
      name: 'dynamicThrottling',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Adjust limits based on server load',
      impact: 'Reduces limits under high load'
    });
    
    this.parameters.set('whitelistAPIs', {
      name: 'whitelistAPIs',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Exempt certain APIs from rate limiting',
      impact: 'Health checks, monitoring excluded'
    });
  }
  
  explain(): string {
    return `I'm the Rate Limiting Algorithm. I prevent abuse while allowing fair usage.

**My Rate Limiting System** (${this.parameters.get('limitingAlgorithm')?.currentValue}):

1. **Base Limits**:
   - ${this.parameters.get('requestsPerMinute')?.currentValue} req/min per user
   - +${this.parameters.get('burstAllowance')?.currentValue} burst allowance
   - Trusted users: ${this.parameters.get('requestsPerMinute')?.currentValue * this.parameters.get('trustedUserMultiplier')?.currentValue} req/min (${this.parameters.get('trustedUserMultiplier')?.currentValue}x)

2. **Algorithms**:
   - Fixed window: Simple, minute-based
   - Sliding window: Precise, no boundary issues
   - Token bucket: Smooth bursts (current)
   - Leaky bucket: Queue requests

3. **Dynamic Throttling** ${this.parameters.get('dynamicThrottling')?.currentValue ? '(Active)' : '(Off)'}:
   - Normal load: Full limits
   - High load (>80%): 50% reduced
   - Critical load (>95%): 75% reduced

4. **Exemptions** ${this.parameters.get('whitelistAPIs')?.currentValue ? '(Enabled)' : '(Disabled)'}:
   - Health checks
   - Monitoring endpoints
   - Admin actions
   - Critical APIs

**Response Headers**:
- X-RateLimit-Limit: Max requests
- X-RateLimit-Remaining: Requests left
- X-RateLimit-Reset: Reset timestamp

I keep the platform fair and available for all!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A20: Parameter ${name} updated to ${value}`);
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
          userType: 'Regular user',
          beforeLimit: `${before.requestsPerMinute} req/min`,
          afterLimit: `${after.requestsPerMinute} req/min`,
          burstBefore: before.burstAllowance,
          burstAfter: after.burstAllowance
        },
        {
          userType: 'Trusted user',
          beforeLimit: `${before.requestsPerMinute * before.trustedUserMultiplier} req/min`,
          afterLimit: `${after.requestsPerMinute * after.trustedUserMultiplier} req/min`,
          multiplier: after.trustedUserMultiplier
        }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 90;
  }
}

export const rateLimitingAgent = new A20_RateLimitingAgent();
