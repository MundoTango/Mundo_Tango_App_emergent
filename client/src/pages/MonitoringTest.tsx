/**
 * ESA Life CEO 61x21 - Monitoring Test Page
 * Test page to verify all monitoring tools are working properly
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMonitoring } from '@/hooks/useMonitoring';
import { useMonitoringContext } from '@/components/MonitoringProvider';
import { monitoring } from '@/services/monitoring';
import { CheckCircle, XCircle, AlertCircle, Activity, Shield, BarChart, Eye } from 'lucide-react';

export default function MonitoringTest() {
  const { trackEvent, trackPageView, captureException } = useMonitoring();
  const { hasConsent, isInitialized, requestConsent, showPrivacySettings, setShowPrivacySettings } = useMonitoringContext();
  const [testResults, setTestResults] = useState<Record<string, boolean | string>>({});
  const [isTestRunning, setIsTestRunning] = useState(false);

  // Check environment variables
  const checkEnvironmentVariables = () => {
    return {
      sentryDsn: !!import.meta.env.VITE_SENTRY_DSN,
      posthogApiKey: !!import.meta.env.VITE_POSTHOG_API_KEY,
      posthogHost: !!import.meta.env.VITE_POSTHOG_HOST,
      openReplayKey: !!import.meta.env.VITE_OPENREPLAY_PROJECT_KEY,
      openReplayEnabled: import.meta.env.VITE_ENABLE_OPENREPLAY === 'true',
    };
  };

  const runTests = async () => {
    setIsTestRunning(true);
    const results: Record<string, boolean | string> = {};

    // Test 1: Check environment variables
    const envVars = checkEnvironmentVariables();
    results['env_vars'] = Object.values(envVars).every(v => v !== false);
    results['env_details'] = JSON.stringify(envVars);

    // Test 2: Check consent status
    results['consent'] = hasConsent;

    // Test 3: Check initialization status
    results['initialized'] = isInitialized;

    // Test 4: Test event tracking
    try {
      trackEvent('monitoring_test_event', {
        test: true,
        timestamp: new Date().toISOString(),
        source: 'monitoring_test_page'
      });
      results['event_tracking'] = true;
    } catch (error) {
      results['event_tracking'] = false;
      results['event_error'] = (error as Error).message;
    }

    // Test 5: Test page view tracking
    try {
      trackPageView('/monitoring-test');
      results['page_tracking'] = true;
    } catch (error) {
      results['page_tracking'] = false;
      results['page_error'] = (error as Error).message;
    }

    // Test 6: Test error tracking
    try {
      const testError = new Error('Test error for monitoring');
      captureException(testError, {
        context: 'monitoring_test',
        intentional: true
      });
      results['error_tracking'] = true;
    } catch (error) {
      results['error_tracking'] = false;
      results['error_error'] = (error as Error).message;
    }

    // Test 7: Test Life CEO agent tracking
    try {
      monitoring.trackAgentInteraction('test_agent', 'test_action', {
        test: true,
        layer: 48
      });
      results['agent_tracking'] = true;
    } catch (error) {
      results['agent_tracking'] = false;
      results['agent_error'] = (error as Error).message;
    }

    // Test 8: Check feature flags (PostHog)
    try {
      const featureFlag = monitoring.getFeatureFlag('test_feature');
      results['feature_flags'] = true;
      results['feature_flag_value'] = String(featureFlag ?? 'undefined');
    } catch (error) {
      results['feature_flags'] = false;
      results['feature_error'] = (error as Error).message;
    }

    setTestResults(results);
    setIsTestRunning(false);

    // Send test completion event
    trackEvent('monitoring_test_completed', {
      results: Object.keys(results).reduce((acc, key) => {
        if (!key.includes('error') && !key.includes('details')) {
          acc[key] = results[key];
        }
        return acc;
      }, {} as Record<string, any>)
    });
  };

  const triggerTestError = () => {
    throw new Error('Intentional test error to verify Sentry integration');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Monitoring Test Page</h1>
        <p className="text-gray-600 dark:text-gray-400">ESA Layer 48 - Performance Monitoring Agent</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-500" />
              Consent Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {hasConsent ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">Granted</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 dark:text-red-400">Not Granted</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-500" />
              Initialization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isInitialized ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">Active</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 dark:text-red-400">Inactive</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart className="w-4 h-4 text-teal-500" />
              Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${import.meta.env.VITE_SENTRY_DSN ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-gray-600 dark:text-gray-400">Sentry</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${import.meta.env.VITE_POSTHOG_API_KEY ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-gray-600 dark:text-gray-400">PostHog</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${import.meta.env.VITE_OPENREPLAY_PROJECT_KEY ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-gray-600 dark:text-gray-400">OpenReplay</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
          <CardDescription>Test the monitoring integration and verify all services are working</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {!hasConsent && (
              <Button onClick={requestConsent} variant="default">
                Request Consent
              </Button>
            )}
            <Button onClick={() => setShowPrivacySettings(true)} variant="outline">
              Privacy Settings
            </Button>
            <Button 
              onClick={runTests} 
              disabled={isTestRunning || !hasConsent}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            >
              {isTestRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            <Button 
              onClick={triggerTestError} 
              variant="destructive"
              disabled={!hasConsent}
            >
              Trigger Test Error
            </Button>
          </div>

          {!hasConsent && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Consent Required</AlertTitle>
              <AlertDescription>
                Please grant consent to enable monitoring services and run tests.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(testResults).map(([key, value]) => {
                if (key.includes('error') || key.includes('details')) {
                  return null;
                }
                
                const isSuccess = value === true;
                const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                return (
                  <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {displayKey}
                    </span>
                    <div className="flex items-center gap-2">
                      {isSuccess ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      {typeof value === 'string' && value !== 'true' && value !== 'false' && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{value}</span>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Show errors if any */}
              {Object.entries(testResults)
                .filter(([key]) => key.includes('error'))
                .map(([key, value]) => (
                  <Alert key={key} variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</AlertTitle>
                    <AlertDescription>{value as string}</AlertDescription>
                  </Alert>
                ))}
              
              {/* Show details if any */}
              {Object.entries(testResults)
                .filter(([key]) => key.includes('details'))
                .map(([key, value]) => (
                  <div key={key} className="mt-2 p-2 rounded bg-gray-100 dark:bg-gray-800">
                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400">{value as string}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}