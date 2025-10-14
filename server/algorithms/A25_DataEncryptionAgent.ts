/**
 * A25: Data Encryption Algorithm Agent
 * Security strength and encryption policy management
 */

import { AlgorithmAgent, Parameter, SimulationResult } from './AlgorithmAgent';

export class A25_DataEncryptionAgent extends AlgorithmAgent {
  id = 'A25';
  name = 'Data Encryption Algorithm';
  description = 'Intelligent encryption policy management and security strength optimization';
  filePath = 'server/services/encryptionService.ts';
  algorithmType: 'optimization' = 'optimization';
  esaLayers = [29, 40, 44];
  
  constructor() {
    super();
    
    this.parameters.set('encryptionStrength', {
      name: 'encryptionStrength',
      type: 'enum',
      currentValue: 'aes-256',
      defaultValue: 'aes-256',
      enumValues: ['aes-128', 'aes-256', 'aes-256-gcm'],
      description: 'Encryption algorithm strength',
      impact: 'Higher = more secure but slower performance'
    });
    
    this.parameters.set('dataAtRestEncryption', {
      name: 'dataAtRestEncryption',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Encrypt data in database',
      impact: 'Protects against database breaches'
    });
    
    this.parameters.set('dataInTransitEncryption', {
      name: 'dataInTransitEncryption',
      type: 'enum',
      currentValue: 'tls-1.3',
      defaultValue: 'tls-1.3',
      enumValues: ['tls-1.2', 'tls-1.3', 'tls-1.3-only'],
      description: 'TLS version for data in transit',
      impact: 'Latest version = best security'
    });
    
    this.parameters.set('keyRotationDays', {
      name: 'keyRotationDays',
      type: 'number',
      currentValue: 90,
      defaultValue: 90,
      min: 30,
      max: 365,
      description: 'Encryption key rotation interval in days',
      impact: 'Shorter = more secure but more complexity'
    });
    
    this.parameters.set('sensitiveFieldEncryption', {
      name: 'sensitiveFieldEncryption',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Encrypt sensitive fields (PII, passwords)',
      impact: 'Field-level encryption for sensitive data'
    });
    
    this.parameters.set('hashingAlgorithm', {
      name: 'hashingAlgorithm',
      type: 'enum',
      currentValue: 'argon2',
      defaultValue: 'argon2',
      enumValues: ['bcrypt', 'scrypt', 'argon2'],
      description: 'Password hashing algorithm',
      impact: 'argon2 = most secure, bcrypt = fast'
    });
  }
  
  explain(): string {
    return `I'm the Data Encryption Algorithm. I protect sensitive data with encryption.

**My Encryption Strategy:**

1. **Encryption Strength** (${this.parameters.get('encryptionStrength')?.currentValue}):
   - AES-128: Fast, good security
   - AES-256: Slower, better security (current)
   - AES-256-GCM: Authenticated encryption

2. **Data Protection**:
   - At rest: ${this.parameters.get('dataAtRestEncryption')?.currentValue ? 'Encrypted' : 'Plaintext'}
   - In transit: ${this.parameters.get('dataInTransitEncryption')?.currentValue}
   - Sensitive fields: ${this.parameters.get('sensitiveFieldEncryption')?.currentValue ? 'Encrypted' : 'Plaintext'}

3. **Key Management**:
   - Rotation: Every ${this.parameters.get('keyRotationDays')?.currentValue} days
   - Storage: HSM/Key vault
   - Access: Role-based

4. **Password Security** (${this.parameters.get('hashingAlgorithm')?.currentValue}):
   - Argon2: Memory-hard, ASIC-resistant
   - Scrypt: Configurable cost
   - Bcrypt: Industry standard

**Encrypted Data**:
- Passwords (hashed)
- Personal info (PII)
- Messages (E2E option)
- Payment details
- API keys/tokens

I ensure your data stays private and secure!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A25: Parameter ${name} updated to ${value}`);
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
          aspect: 'Encryption strength',
          beforeValue: before.encryptionStrength,
          afterValue: after.encryptionStrength,
          securityImpact: 'Quantum-resistant upgrade'
        },
        {
          aspect: 'Key rotation',
          beforeValue: `${before.keyRotationDays} days`,
          afterValue: `${after.keyRotationDays} days`,
          complianceImpact: after.keyRotationDays < before.keyRotationDays ? 'More compliant' : 'Less frequent'
        }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 96;
  }
}

export const dataEncryptionAgent = new A25_DataEncryptionAgent();
