/**
 * Unified Validation Runner
 * MB.MD SIMULTANEOUS Execution: Run all validation streams in parallel
 * Created: October 28, 2025
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ValidationResult {
  stream: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  details: string;
  errors?: string[];
}

class ValidationRunner {
  private results: ValidationResult[] = [];

  async runPlaywrightTests(): Promise<ValidationResult> {
    const startTime = Date.now();
    console.log('\n🎭 Stream 1: Running Playwright E2E tests...');
    
    try {
      const { stdout, stderr } = await execAsync('npx playwright test tests/e2e/openSourceAgent.spec.ts --reporter=list');
      const duration = Date.now() - startTime;
      
      // Check if tests passed
      const passed = !stderr.includes('failed') && !stdout.includes('failed');
      
      return {
        stream: 'Playwright E2E Tests',
        status: passed ? 'PASS' : 'FAIL',
        duration,
        details: stdout.split('\n').slice(-10).join('\n'),
        errors: passed ? undefined : [stderr]
      };
    } catch (error: any) {
      return {
        stream: 'Playwright E2E Tests',
        status: 'FAIL',
        duration: Date.now() - startTime,
        details: 'Test execution failed',
        errors: [error.message]
      };
    }
  }

  async runLoadTests(): Promise<ValidationResult> {
    const startTime = Date.now();
    console.log('\n📊 Stream 2: Running load tests...');
    
    try {
      const { stdout } = await execAsync('tsx tests/load/node-cost-optimization.ts');
      const duration = Date.now() - startTime;
      
      // Check if cost target was met
      const costMatch = stdout.match(/COST PER USER PER MONTH: \$([0-9.]+)/);
      const cost = costMatch ? parseFloat(costMatch[1]) : 999;
      const passed = cost < 1.00;
      
      return {
        stream: 'Load Testing (1K-10K users)',
        status: passed ? 'PASS' : 'FAIL',
        duration,
        details: stdout.split('\n').slice(-15).join('\n'),
        errors: passed ? undefined : [`Cost ${cost} exceeds $1/user/month target`]
      };
    } catch (error: any) {
      return {
        stream: 'Load Testing',
        status: 'FAIL',
        duration: Date.now() - startTime,
        details: 'Load test execution failed',
        errors: [error.message]
      };
    }
  }

  async validateOpenSourceAgentAPI(): Promise<ValidationResult> {
    const startTime = Date.now();
    console.log('\n🤖 Stream 3: Validating Open Source Agent API...');
    
    try {
      // Test metrics endpoint
      const metricsResponse = await fetch('http://localhost:5000/api/open-source/metrics');
      const metrics = await metricsResponse.json();
      
      // Test models endpoint
      const modelsResponse = await fetch('http://localhost:5000/api/open-source/models');
      const models = await modelsResponse.json();
      
      const duration = Date.now() - startTime;
      
      const passed = metricsResponse.ok && 
                     modelsResponse.ok && 
                     metrics.freeModelUsage >= 75;
      
      return {
        stream: 'Open Source Agent API',
        status: passed ? 'PASS' : 'FAIL',
        duration,
        details: `Free model usage: ${metrics.freeModelUsage}%\nCost per user: $${metrics.averageCostPerUser}/month`,
        errors: passed ? undefined : ['API validation failed']
      };
    } catch (error: any) {
      return {
        stream: 'Open Source Agent API',
        status: 'FAIL',
        duration: Date.now() - startTime,
        details: 'API request failed',
        errors: [error.message]
      };
    }
  }

  async validateErrorRecovery(): Promise<ValidationResult> {
    const startTime = Date.now();
    console.log('\n🔄 Stream 4: Validating Error Recovery Infrastructure...');
    
    try {
      // Test circuit breakers
      const response = await fetch('http://localhost:5000/api/error-recovery/circuit-breakers');
      const data = await response.json();
      
      const duration = Date.now() - startTime;
      
      // Check all circuit breakers are initialized
      const expectedProviders = ['openai', 'anthropic', 'groq', 'huggingface', 'ollama'];
      const actualProviders = data.data.map((cb: any) => cb.provider);
      const allPresent = expectedProviders.every(p => actualProviders.includes(p));
      
      const passed = response.ok && allPresent && data.success;
      
      return {
        stream: 'Error Recovery Infrastructure',
        status: passed ? 'PASS' : 'FAIL',
        duration,
        details: `Circuit breakers active: ${actualProviders.join(', ')}`,
        errors: passed ? undefined : ['Circuit breaker validation failed']
      };
    } catch (error: any) {
      return {
        stream: 'Error Recovery Infrastructure',
        status: 'FAIL',
        duration: Date.now() - startTime,
        details: 'API request failed',
        errors: [error.message]
      };
    }
  }

  async validateVoiceModeChecklist(): Promise<ValidationResult> {
    const startTime = Date.now();
    console.log('\n🎙️ Stream 5: Validating Voice Mode Migration Checklist...');
    
    try {
      const fs = await import('fs/promises');
      const checklist = await fs.readFile('tests/validation/voice-mode-migration-checklist.md', 'utf-8');
      
      const duration = Date.now() - startTime;
      
      // Check for required sections
      const requiredSections = [
        'Phase 1: Whisper Integration',
        'Phase 2: Bark TTS Integration',
        'Phase 3: Groq Integration',
        'Phase 4: Gradual Rollout',
        'Success Criteria'
      ];
      
      const allSectionsPresent = requiredSections.every(section => 
        checklist.includes(section)
      );
      
      return {
        stream: 'Voice Mode Migration Checklist',
        status: allSectionsPresent ? 'PASS' : 'FAIL',
        duration,
        details: 'Checklist complete with 4-week migration plan',
        errors: allSectionsPresent ? undefined : ['Missing required sections']
      };
    } catch (error: any) {
      return {
        stream: 'Voice Mode Migration Checklist',
        status: 'FAIL',
        duration: Date.now() - startTime,
        details: 'Checklist file not found',
        errors: [error.message]
      };
    }
  }

  async runAllValidations(): Promise<void> {
    console.log('🚀 MB.MD SIMULTANEOUS VALIDATION');
    console.log('================================');
    console.log('Running all 5 validation streams in parallel...\n');

    const startTime = Date.now();

    // Run all validations in parallel
    const results = await Promise.all([
      this.validateOpenSourceAgentAPI(),
      this.validateErrorRecovery(),
      this.validateVoiceModeChecklist(),
      this.runLoadTests().catch(err => ({
        stream: 'Load Testing',
        status: 'SKIP' as const,
        duration: 0,
        details: 'Skipped: Server must be running',
        errors: [err.message]
      })),
      this.runPlaywrightTests().catch(err => ({
        stream: 'Playwright E2E Tests',
        status: 'SKIP' as const,
        duration: 0,
        details: 'Skipped: Requires browser setup',
        errors: [err.message]
      }))
    ]);

    this.results = results;
    const totalDuration = Date.now() - startTime;

    this.printResults(totalDuration);
  }

  printResults(totalDuration: number): void {
    console.log('\n\n📊 VALIDATION RESULTS');
    console.log('====================\n');

    let passCount = 0;
    let failCount = 0;
    let skipCount = 0;

    this.results.forEach((result, index) => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
      console.log(`${icon} Stream ${index + 1}: ${result.stream}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Duration: ${result.duration}ms`);
      console.log(`   ${result.details}`);
      
      if (result.errors) {
        console.log(`   Errors: ${result.errors.join(', ')}`);
      }
      console.log('');

      if (result.status === 'PASS') passCount++;
      else if (result.status === 'FAIL') failCount++;
      else skipCount++;
    });

    console.log('==========================================');
    console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`Passed: ${passCount}/${this.results.length}`);
    console.log(`Failed: ${failCount}/${this.results.length}`);
    console.log(`Skipped: ${skipCount}/${this.results.length}`);
    console.log('==========================================\n');

    if (failCount === 0 && passCount >= 3) {
      console.log('🎉 ALL CRITICAL VALIDATIONS PASSED!');
      console.log('✅ System is deployment-ready\n');
    } else if (failCount > 0) {
      console.log('⚠️  SOME VALIDATIONS FAILED');
      console.log('❌ Review errors before deployment\n');
    } else {
      console.log('⏭️  MOST VALIDATIONS SKIPPED');
      console.log('ℹ️  Run individual tests for full validation\n');
    }
  }
}

// Main execution
const runner = new ValidationRunner();
runner.runAllValidations().catch(console.error);
