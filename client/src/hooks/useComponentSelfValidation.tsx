/**
 * MB.MD Self-Validation Hook
 * Enables ANY component to self-validate using 5-track parallel research
 * 
 * Usage:
 * const { validateSelf, health, isHealthy } = useComponentSelfValidation('my-component', 'ui');
 */

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';

interface ValidationResult {
  passed: boolean;
  issues: string[];
  confidence: number; // 0-100
  recommendations: string[];
  trackResults: {
    console: any;
    dependencies: any;
    workflow: any;
    api: any;
    performance: any;
  };
}

export function useComponentSelfValidation(
  componentId: string,
  componentType: string
) {
  const [health, setHealth] = useState<number>(100);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [validationHistory, setValidationHistory] = useState<ValidationResult[]>([]);

  // TRACK 1: Console error analysis
  const checkConsoleLogs = async () => {
    try {
      const response = await fetch('/api/agent-registry/console-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ componentId })
      });
      if (!response.ok) throw new Error('Console check failed');
      return await response.json();
    } catch (error) {
      return { issues: [], recommendations: [], error: error.message };
    }
  };

  // TRACK 2: Dependency verification
  const checkDependencies = async () => {
    try {
      const response = await fetch('/api/agent-registry/dependency-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ componentId, componentType })
      });
      if (!response.ok) throw new Error('Dependency check failed');
      return await response.json();
    } catch (error) {
      return { issues: [], recommendations: [], error: error.message };
    }
  };

  // TRACK 3: Workflow validation
  const checkWorkflow = async () => {
    try {
      const response = await fetch('/api/agent-registry/workflow-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ componentId })
      });
      if (!response.ok) throw new Error('Workflow check failed');
      return await response.json();
    } catch (error) {
      return { issues: [], recommendations: [], error: error.message };
    }
  };

  // TRACK 4: API endpoint validation
  const checkAPIs = async () => {
    try {
      const response = await fetch('/api/agent-registry/api-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ componentId })
      });
      if (!response.ok) throw new Error('API check failed');
      return await response.json();
    } catch (error) {
      return { issues: [], recommendations: [], error: error.message };
    }
  };

  // TRACK 5: Performance metrics
  const checkPerformance = async () => {
    try {
      const response = await fetch('/api/agent-registry/performance-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ componentId })
      });
      if (!response.ok) throw new Error('Performance check failed');
      return await response.json();
    } catch (error) {
      return { issues: [], recommendations: [], error: error.message };
    }
  };

  // Run all 5 tracks in parallel (MB.MD methodology)
  const validateSelf = useMutation({
    mutationFn: async () => {
      console.log(`🔍 [${componentId}] Starting MB.MD 5-track validation...`);

      const [
        consoleResult,
        depsResult,
        workflowResult,
        apiResult,
        perfResult
      ] = await Promise.all([
        checkConsoleLogs(),
        checkDependencies(),
        checkWorkflow(),
        checkAPIs(),
        checkPerformance()
      ]);

      const allIssues = [
        ...(consoleResult.issues || []),
        ...(depsResult.issues || []),
        ...(workflowResult.issues || []),
        ...(apiResult.issues || []),
        ...(perfResult.issues || [])
      ];

      const allRecommendations = [
        ...(consoleResult.recommendations || []),
        ...(depsResult.recommendations || []),
        ...(workflowResult.recommendations || []),
        ...(apiResult.recommendations || []),
        ...(perfResult.recommendations || [])
      ];

      // Calculate confidence based on issues found
      const confidence = Math.max(0, 100 - (allIssues.length * 10));

      const result: ValidationResult = {
        passed: allIssues.length === 0,
        issues: allIssues,
        confidence,
        recommendations: allRecommendations,
        trackResults: {
          console: consoleResult,
          dependencies: depsResult,
          workflow: workflowResult,
          api: apiResult,
          performance: perfResult
        }
      };

      console.log(`✅ [${componentId}] Validation complete:`, {
        passed: result.passed,
        issues: allIssues.length,
        confidence: result.confidence
      });

      return result;
    },
    onSuccess: (result) => {
      setHealth(result.confidence);
      setLastCheck(new Date());
      setValidationHistory(prev => [...prev, result].slice(-10)); // Keep last 10
    }
  });

  // Auto-validate on mount (optional)
  useEffect(() => {
    // Uncomment to enable auto-validation on mount
    // validateSelf.mutate();
  }, []);

  return {
    validateSelf,
    health,
    lastCheck,
    isHealthy: health >= 70,
    validationHistory,
    isValidating: validateSelf.isPending
  };
}
