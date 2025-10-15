/**
 * Phase 11 - Track 1B: Self-Testing Framework
 * React hook for component self-testing and autonomous validation
 */

import { useState, useEffect, useCallback } from 'react';

export interface SelfTestConfig {
  agentId: string;
  tests: ComponentTest[];
  dependencies?: any[];
  autoRunOnMount?: boolean;
  autoRunOnChange?: boolean;
}

export interface ComponentTest {
  name: string;
  run: () => Promise<TestResult> | TestResult;
  critical?: boolean; // If true, failure blocks component from functioning
}

export interface TestResult {
  passed: boolean;
  issue?: Issue;
  metadata?: any;
}

export interface Issue {
  description: string;
  context?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedFix?: string;
}

export type TestStatus = 'unknown' | 'testing' | 'healthy' | 'warning' | 'error';

/**
 * Self-testing hook for components
 * Every component can validate its own correctness
 */
export function useSelfTest(config: SelfTestConfig) {
  const [testStatus, setTestStatus] = useState<TestStatus>('unknown');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [lastTested, setLastTested] = useState<Date | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  /**
   * Run all tests for this component
   */
  const runTests = useCallback(async () => {
    if (isTesting) return;

    setIsTesting(true);
    setTestStatus('testing');

    try {
      console.log(`🧪 [Self-Test] ${config.agentId} - Running ${config.tests.length} tests`);

      const results = await Promise.all(
        config.tests.map(async test => {
          try {
            const result = await test.run();
            return { test, result };
          } catch (error) {
            return {
              test,
              result: {
                passed: false,
                issue: {
                  description: `Test "${test.name}" threw error: ${error}`,
                  severity: test.critical ? 'critical' : 'high'
                } as Issue
              }
            };
          }
        })
      );

      const failed = results.filter(r => !r.result.passed);
      const criticalFailed = failed.filter(f => f.test.critical);

      if (criticalFailed.length > 0) {
        setTestStatus('error');
        setIssues(failed.map(f => f.result.issue!));
        console.error(`❌ [Self-Test] ${config.agentId} - ${criticalFailed.length} CRITICAL failures`);

        // Record failure in Agent Registry
        await recordTestResults(config.agentId, false);

        // Trigger auto-fix for critical issues
        await triggerAutoFix(config.agentId, failed.map(f => f.result.issue!));
      } else if (failed.length > 0) {
        setTestStatus('warning');
        setIssues(failed.map(f => f.result.issue!));
        console.warn(`⚠️  [Self-Test] ${config.agentId} - ${failed.length} non-critical failures`);

        // Record test results
        await recordTestResults(config.agentId, false);
      } else {
        setTestStatus('healthy');
        setIssues([]);
        console.log(`✅ [Self-Test] ${config.agentId} - All tests passed`);

        // Record success
        await recordTestResults(config.agentId, true);
      }

      setLastTested(new Date());
    } catch (error) {
      console.error(`[Self-Test] ${config.agentId} - Test execution error:`, error);
      setTestStatus('error');
    } finally {
      setIsTesting(false);
    }
  }, [config, isTesting]);

  /**
   * Auto-run tests on mount
   */
  useEffect(() => {
    if (config.autoRunOnMount !== false) {
      runTests();
    }
  }, []);

  /**
   * Auto-run tests when dependencies change
   */
  useEffect(() => {
    if (config.autoRunOnChange && config.dependencies) {
      runTests();
    }
  }, config.dependencies || []);

  return {
    testStatus,
    issues,
    lastTested,
    isTesting,
    runTests
  };
}

/**
 * Record test results in Agent Registry
 */
async function recordTestResults(agentId: string, passed: boolean): Promise<void> {
  try {
    await fetch('/api/agent-registry/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, passed })
    });
  } catch (error) {
    console.error('[Self-Test] Failed to record test results:', error);
  }
}

/**
 * Trigger auto-fix via Quality Validator (Agent #79)
 */
async function triggerAutoFix(agentId: string, issues: Issue[]): Promise<void> {
  try {
    for (const issue of issues) {
      // Call Agent #79 for analysis
      const response = await fetch('/api/quality-validator/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: issue.description,
          type: agentId,
          context: issue.context,
          severity: issue.severity
        })
      });

      if (response.ok) {
        const analysis = await response.json();
        console.log(`🔍 [Auto-Fix] ${agentId} - Analysis received (confidence: ${analysis.confidence})`);

        // If confidence > 0.8, attempt auto-fix
        if (analysis.confidence > 0.8) {
          console.log(`🔧 [Auto-Fix] ${agentId} - High confidence fix available, logging for manual review`);
          // In production: Attempt to apply fix automatically
          // For now: Log the suggested fix
        }
      }
    }
  } catch (error) {
    console.error('[Auto-Fix] Failed to trigger auto-fix:', error);
  }
}
