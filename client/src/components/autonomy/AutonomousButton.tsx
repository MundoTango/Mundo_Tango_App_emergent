/**
 * Phase 11 - Demo: Autonomous Button Component
 * Self-aware button that can self-test and self-fix
 */

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSelfTest, createTestSuite } from '@/lib/autonomy/useSelfTest';
import { agentRegistry } from '@/lib/autonomy/AgentRegistryClient';

interface AutonomousButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  agentId?: string;
}

/**
 * Example autonomous component that demonstrates Phase 11 capabilities
 */
export function AutonomousButton({ 
  children, 
  onClick, 
  variant = 'default',
  agentId = 'BUTTON_DEMO'
}: AutonomousButtonProps) {
  
  // Self-testing framework - component validates itself
  const { testStatus, issues, runTests } = useSelfTest({
    agentId,
    tests: createTestSuite('button'),
    autoRunOnMount: true,
    autoRunOnChange: false
  });

  // Register this component-agent when it mounts
  useEffect(() => {
    agentRegistry.register({
      agentId,
      componentName: 'AutonomousButton',
      componentPath: 'client/src/components/autonomy/AutonomousButton.tsx',
      componentType: 'button',
      healthStatus: 'healthy',
      testCoverage: 0,
      learningCount: 0
    });

    return () => {
      // Component unmounting - update registry
      console.log(`[${agentId}] Component unmounted`);
    };
  }, [agentId]);

  // Visual feedback based on test status
  const getStatusColor = () => {
    switch (testStatus) {
      case 'healthy': return 'border-green-500';
      case 'warning': return 'border-yellow-500';
      case 'error': return 'border-red-500';
      case 'testing': return 'border-blue-500 animate-pulse';
      default: return '';
    }
  };

  return (
    <div className="relative">
      <Button
        variant={variant}
        onClick={onClick}
        data-agent-id={agentId}
        data-test-status={testStatus}
        data-testid={`button-${agentId.toLowerCase()}`}
        className={`${getStatusColor()} ${testStatus === 'testing' ? 'opacity-75' : ''}`}
        aria-label={typeof children === 'string' ? children : undefined}
      >
        {children}
      </Button>
      
      {/* Show test status badge (development only) */}
      {process.env.NODE_ENV === 'development' && testStatus !== 'unknown' && (
        <div className="absolute -top-2 -right-2 text-xs px-2 py-1 rounded-full bg-background border shadow-sm">
          {testStatus === 'healthy' && '✅'}
          {testStatus === 'warning' && '⚠️'}
          {testStatus === 'error' && '❌'}
          {testStatus === 'testing' && '🧪'}
        </div>
      )}

      {/* Show issues (development only) */}
      {process.env.NODE_ENV === 'development' && issues.length > 0 && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs max-w-sm z-50">
          <div className="font-semibold mb-1">Issues detected:</div>
          {issues.map((issue, i) => (
            <div key={i} className="text-red-700 dark:text-red-300">
              • {issue.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
