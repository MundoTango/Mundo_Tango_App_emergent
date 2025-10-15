/**
 * MB.MD TRACK B: Autonomous Test Runner
 * Integrates functional tests with autonomous learning system
 * 
 * Features:
 * - Runs tests continuously in background
 * - Reports results to learning coordinator
 * - Auto-detects regressions
 * - Triggers agent escalation on failures
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TestResult {
  testName: string;
  status: 'passed' | 'failed';
  duration: number;
  error?: string;
  timestamp: string;
}

class AutonomousTestRunner {
  private isRunning = false;
  private testHistory: TestResult[] = [];
  
  async runContinuousValidation() {
    if (this.isRunning) {
      console.log('⚠️ Test runner already active');
      return;
    }
    
    this.isRunning = true;
    console.log('🚀 Starting autonomous test runner...');
    
    // Run tests every hour
    setInterval(async () => {
      await this.executeTestSuite();
    }, 60 * 60 * 1000); // 1 hour
    
    // Run immediately on start
    await this.executeTestSuite();
  }
  
  async executeTestSuite() {
    console.log('🧪 Running Mr Blue functional tests...');
    const startTime = Date.now();
    
    try {
      // Run Playwright tests
      const { stdout, stderr } = await execAsync(
        'npx playwright test tests/mr-blue/functional-ai-validation.spec.ts --reporter=json'
      );
      
      const duration = Date.now() - startTime;
      
      // Parse results
      const results = this.parseTestResults(stdout);
      
      // Report to autonomous learning
      await this.reportToLearningSystem(results, duration);
      
      // Check for regressions
      await this.detectRegressions(results);
      
      console.log(`✅ Test suite completed in ${duration}ms`);
    } catch (error) {
      console.error('🔴 Test suite failed:', error);
      
      // Escalate to Quality Validator (Agent #79)
      await this.escalateToAgent79({
        component: 'MrBlueChat',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  private parseTestResults(stdout: string): TestResult[] {
    try {
      const jsonOutput = JSON.parse(stdout);
      return jsonOutput.suites.flatMap((suite: any) => 
        suite.specs.map((spec: any) => ({
          testName: spec.title,
          status: spec.ok ? 'passed' : 'failed',
          duration: spec.tests[0]?.results[0]?.duration || 0,
          error: spec.tests[0]?.results[0]?.error?.message,
          timestamp: new Date().toISOString()
        }))
      );
    } catch (e) {
      console.error('Failed to parse test results:', e);
      return [];
    }
  }
  
  private async reportToLearningSystem(results: TestResult[], duration: number) {
    const passedCount = results.filter(r => r.status === 'passed').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    
    // Store in test history
    this.testHistory.push(...results);
    
    // Keep last 100 results
    if (this.testHistory.length > 100) {
      this.testHistory = this.testHistory.slice(-100);
    }
    
    // Report to Component Learning History
    await fetch('/api/component-learning/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        componentName: 'MrBlueChat',
        learningType: 'automated-test',
        metadata: {
          totalTests: results.length,
          passed: passedCount,
          failed: failedCount,
          duration,
          timestamp: new Date().toISOString()
        }
      })
    });
    
    console.log(`📊 Reported to learning system: ${passedCount} passed, ${failedCount} failed`);
  }
  
  private async detectRegressions(results: TestResult[]) {
    // Get last 10 test runs
    const recentRuns = this.testHistory.slice(-10);
    
    // Calculate failure rate
    const totalTests = recentRuns.length;
    const failures = recentRuns.filter(r => r.status === 'failed').length;
    const failureRate = (failures / totalTests) * 100;
    
    // Regression detected if failure rate > 20%
    if (failureRate > 20) {
      console.warn(`⚠️ REGRESSION DETECTED: ${failureRate.toFixed(1)}% failure rate`);
      
      await this.escalateToAgent79({
        component: 'MrBlueChat',
        regressionType: 'high-failure-rate',
        failureRate,
        recentFailures: failures,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  private async escalateToAgent79(issue: any) {
    console.log('🚨 Escalating to Quality Validator (Agent #79)...');
    
    try {
      await fetch('/api/quality-validator/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'AutonomousTestRunner',
          severity: 'high',
          ...issue
        })
      });
      
      console.log('✅ Escalation sent to Agent #79');
    } catch (error) {
      console.error('Failed to escalate:', error);
    }
  }
  
  // Get test health status
  getHealthStatus() {
    const recent = this.testHistory.slice(-5);
    const passed = recent.filter(r => r.status === 'passed').length;
    const total = recent.length;
    
    return {
      healthy: passed === total,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      lastRun: recent[recent.length - 1]?.timestamp,
      totalTests: this.testHistory.length
    };
  }
}

// Export singleton
export const autonomousTestRunner = new AutonomousTestRunner();

// Auto-start if running in production
if (process.env.NODE_ENV === 'production') {
  autonomousTestRunner.runContinuousValidation();
}
