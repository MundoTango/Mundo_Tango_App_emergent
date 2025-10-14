/**
 * A23: Fraud Detection Algorithm Agent
 * Anomaly scoring for fraud prevention
 */

import { AlgorithmAgent, Parameter, SimulationResult } from './AlgorithmAgent';

export class A23_FraudDetectionAgent extends AlgorithmAgent {
  id = 'A23';
  name = 'Fraud Detection Algorithm';
  description = 'ML-powered anomaly detection for fraud prevention and suspicious activity identification';
  filePath = 'server/services/fraudDetectionService.ts';
  algorithmType: 'scoring' = 'scoring';
  esaLayers = [29, 33, 44];
  
  constructor() {
    super();
    
    this.parameters.set('anomalyThreshold', {
      name: 'anomalyThreshold',
      type: 'number',
      currentValue: 0.8,
      defaultValue: 0.8,
      min: 0.5,
      max: 0.99,
      description: 'Threshold for fraud classification (0-1)',
      impact: 'Lower = more sensitive, higher = fewer false positives'
    });
    
    this.parameters.set('velocityCheckEnabled', {
      name: 'velocityCheckEnabled',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Monitor rapid successive actions',
      impact: 'Detects automated/bot behavior'
    });
    
    this.parameters.set('deviceFingerprintingEnabled', {
      name: 'deviceFingerprintingEnabled',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Track unique device characteristics',
      impact: 'Identifies device switching and spoofing'
    });
    
    this.parameters.set('behavioralAnalysisWeight', {
      name: 'behavioralAnalysisWeight',
      type: 'number',
      currentValue: 1.5,
      defaultValue: 1.5,
      min: 0.5,
      max: 3.0,
      description: 'Weight for behavioral pattern deviation',
      impact: 'Higher = more emphasis on unusual behavior'
    });
    
    this.parameters.set('autoBlockHighRisk', {
      name: 'autoBlockHighRisk',
      type: 'boolean',
      currentValue: false,
      defaultValue: false,
      description: 'Automatically block very high-risk accounts',
      impact: 'Immediate protection but risk of false positives'
    });
  }
  
  explain(): string {
    return `I'm the Fraud Detection Algorithm. I protect the platform from fraudulent activity.

**My Fraud Detection System** (${(this.parameters.get('anomalyThreshold')?.currentValue * 100).toFixed(0)}% threshold):

1. **Anomaly Signals**:
   - Velocity: ${this.parameters.get('velocityCheckEnabled')?.currentValue ? 'Monitoring' : 'Off'} (rapid actions)
   - Device: ${this.parameters.get('deviceFingerprintingEnabled')?.currentValue ? 'Fingerprinting' : 'Off'}
   - Behavior: ${this.parameters.get('behavioralAnalysisWeight')?.currentValue}x weight
   - Location: Impossible travel detection
   - Network: IP reputation checking

2. **Risk Indicators**:
   - Multiple accounts from same device
   - Rapid friend requests/messages
   - Unusual login patterns
   - Payment anomalies
   - Profile similarity (fake accounts)

3. **Risk Levels**:
   - Low (<50%): Normal activity
   - Medium (50-${(this.parameters.get('anomalyThreshold')?.currentValue * 100).toFixed(0)}%): Flag for review
   - High (>${(this.parameters.get('anomalyThreshold')?.currentValue * 100).toFixed(0)}%): Suspicious
   - Critical (>95%): ${this.parameters.get('autoBlockHighRisk')?.currentValue ? 'Auto-block' : 'Manual review'}

4. **Protections**:
   - Account takeover prevention
   - Payment fraud detection
   - Fake profile identification
   - Bot/automation detection

I keep the community safe and authentic!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A23: Parameter ${name} updated to ${value}`);
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
          scenario: 'Rapid friend requests from new account',
          scoreBefore: 0.72,
          scoreAfter: 0.72,
          action: before.anomalyThreshold > 0.72 ? 'Monitor' : 'Flag',
          signals: ['velocity', 'new account', 'device fingerprint']
        },
        {
          scenario: 'Login from impossible location',
          scoreBefore: 0.91,
          scoreAfter: 0.91,
          action: after.autoBlockHighRisk ? 'Auto-block' : 'Manual review',
          signals: ['impossible travel', 'device change']
        }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 94;
  }
}

export const fraudDetectionAgent = new A23_FraudDetectionAgent();
