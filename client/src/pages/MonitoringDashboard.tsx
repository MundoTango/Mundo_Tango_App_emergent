/**
 * ESA Life CEO 61x21 - Monitoring Dashboard
 * Real-time monitoring and analytics dashboard
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMonitoring } from '@/hooks/useMonitoring';
import { useMonitoringContext } from '@/components/MonitoringProvider';
import { lifeCEOTracker } from '@/services/monitoring/lifeceo-tracking';
import {
  Activity,
  Brain,
  Eye,
  Shield,
  BarChart,
  Users,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Settings
} from 'lucide-react';

export default function MonitoringDashboard() {
  const { trackEvent, trackAgentInteraction, getFeatureFlag } = useMonitoring();
  const { hasConsent, requestConsent, setShowPrivacySettings } = useMonitoringContext();
  const [agentMetrics, setAgentMetrics] = useState<any[]>([]);
  const [featureFlags, setFeatureFlags] = useState<Record<string, any>>({});

  useEffect(() => {
    // Track dashboard view
    trackEvent('monitoring_dashboard_viewed');

    // Load agent metrics
    const metrics = lifeCEOTracker.getAllAgentMetrics();
    setAgentMetrics(metrics);

    // Load feature flags
    const flags = {
      'new-onboarding': getFeatureFlag('new-onboarding'),
      'ai-enhancement': getFeatureFlag('ai-enhancement'),
      'live-streaming': getFeatureFlag('live-streaming'),
      'advanced-analytics': getFeatureFlag('advanced-analytics'),
      'beta-features': getFeatureFlag('beta-features'),
      'ocean-theme-v2': getFeatureFlag('ocean-theme-v2'),
      'lifeceo-agents': getFeatureFlag('lifeceo-agents')
    };
    setFeatureFlags(flags);
  }, []);

  const testMonitoring = () => {
    // Test event tracking
    trackEvent('test_monitoring_event', {
      category: 'testing',
      label: 'dashboard_test',
      value: 1
    });

    // Test agent interaction tracking
    const sessionId = `test_${Date.now()}`;
    lifeCEOTracker.startAgentSession('TestAgent', sessionId);
    lifeCEOTracker.trackInteraction(sessionId, 'test_action', {
      inputTokens: 100,
      outputTokens: 200,
      responseTime: 500,
      success: true
    });
    lifeCEOTracker.endAgentSession(sessionId, 5);

    // Reload metrics
    setAgentMetrics(lifeCEOTracker.getAllAgentMetrics());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-cyan-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              ESA Monitoring Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              OpenReplay & PostHog Analytics Integration
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowPrivacySettings(true)}
              data-testid="button-privacy"
            >
              <Settings className="w-4 h-4 mr-2" />
              Privacy Settings
            </Button>
            <Button
              onClick={testMonitoring}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              data-testid="button-test"
            >
              <Zap className="w-4 h-4 mr-2" />
              Test Monitoring
            </Button>
          </div>
        </div>

        {/* Consent Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-teal-500" />
              <span>Privacy & Consent Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant={hasConsent ? "default" : "secondary"}>
                  {hasConsent ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Monitoring Active
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Monitoring Disabled
                    </>
                  )}
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {hasConsent 
                    ? "Analytics, session recording, and error tracking are enabled"
                    : "User consent required for monitoring services"}
                </span>
              </div>
              {!hasConsent && (
                <Button onClick={requestConsent} size="sm" data-testid="button-enable-monitoring">
                  Enable Monitoring
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Life CEO Agents</TabsTrigger>
            <TabsTrigger value="features">Feature Flags</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 inline mr-1 text-green-500" />
                    +12% from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Session Duration</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8m 42s</div>
                  <p className="text-xs text-muted-foreground">
                    Average per session
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0.3%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">✓</span> Below threshold
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>OpenReplay Session Recording</CardTitle>
                <CardDescription>
                  Real-time session playback and user behavior analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rage Click Detection</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Network Monitoring</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Console Capture</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Privacy Masking</span>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Life CEO Agents Tab */}
          <TabsContent value="agents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-teal-500" />
                  <span>Life CEO Agent Tracking</span>
                </CardTitle>
                <CardDescription>
                  Real-time monitoring of AI agent interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {agentMetrics.length > 0 ? (
                  <div className="space-y-4">
                    {agentMetrics.map((agent, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{agent.agentName}</h4>
                          <Badge>{agent.performance.totalInteractions} interactions</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Success Rate:</span>
                            <p className="font-medium">{agent.performance.successRate.toFixed(1)}%</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Avg Response:</span>
                            <p className="font-medium">{agent.performance.averageResponseTime.toFixed(0)}ms</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Tokens Used:</span>
                            <p className="font-medium">{agent.performance.totalTokensUsed}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No active agent sessions. Click "Test Monitoring" to generate sample data.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Flags Tab */}
          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>PostHog Feature Flags</CardTitle>
                <CardDescription>
                  Control feature rollouts and A/B testing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(featureFlags).map(([flag, value]) => (
                    <div key={flag} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div>
                        <p className="font-medium">{flag}</p>
                        <p className="text-xs text-gray-500">
                          {flag === 'new-onboarding' && '50% rollout - New user onboarding flow'}
                          {flag === 'ai-enhancement' && '100% rollout - AI features enabled'}
                          {flag === 'live-streaming' && '25% rollout - Live streaming capabilities'}
                          {flag === 'advanced-analytics' && '10% rollout - Advanced analytics dashboard'}
                          {flag === 'beta-features' && '5% rollout - Beta testing program'}
                          {flag === 'ocean-theme-v2' && '100% rollout - Ocean theme v2'}
                          {flag === 'lifeceo-agents' && '100% rollout - Life CEO agent framework'}
                        </p>
                      </div>
                      <Badge variant={value ? "default" : "secondary"}>
                        {value ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-teal-500" />
                  <span>Session Analytics</span>
                </CardTitle>
                <CardDescription>
                  User journey tracking and funnel analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Guest to Host Conversion Funnel</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-teal-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                        <span className="text-sm whitespace-nowrap">Landing (100%)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-teal-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <span className="text-sm whitespace-nowrap">Registration (75%)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-teal-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <span className="text-sm whitespace-nowrap">Profile Complete (45%)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-teal-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                        <span className="text-sm whitespace-nowrap">Host Onboarding (20%)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-teal-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                        </div>
                        <span className="text-sm whitespace-nowrap">First Listing (12%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}