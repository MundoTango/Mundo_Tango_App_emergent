/**
 * Agent Detail Page
 * Phase 7: ESA Integration
 * 
 * Shows comprehensive information about a single agent with 5 tabs:
 * - Overview: Agent info, capabilities, status
 * - Tests: Self-test execution history
 * - Learnings: Pattern library and memory
 * - Auto-Fixes: Automated resolution history
 * - Metrics: Performance analytics
 */

import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Activity, 
  TestTube2, 
  Brain, 
  Zap, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  Layers,
  Code,
  GitBranch
} from 'lucide-react';
import { useState } from 'react';

export default function AgentDetail() {
  const params = useParams();
  const agentId = params.agentId as string;
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch agent details
  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: [`/api/agent-intelligence/esa/agent/${agentId}`],
    enabled: !!agentId
  });

  // Fetch agent metrics
  const { data: metrics } = useQuery({
    queryKey: [`/api/agent-intelligence/${agentId}/metrics`],
    enabled: !!agentId
  });

  // Fetch agent learnings
  const { data: learnings } = useQuery({
    queryKey: [`/api/agent-intelligence/${agentId}/learnings`],
    enabled: !!agentId
  });

  // Fetch auto-fix history
  const { data: fixHistory } = useQuery({
    queryKey: [`/api/agent-intelligence/${agentId}/fix-history`],
    enabled: !!agentId
  });

  // Fetch agent expertise
  const { data: expertise } = useQuery({
    queryKey: [`/api/agent-intelligence/${agentId}/expertise`],
    enabled: !!agentId
  });

  if (agentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-8">
        <div className="text-center text-white py-20">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Loading agent details...</p>
        </div>
      </div>
    );
  }

  if (!agent?.agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-8">
        <div className="text-center text-white py-20">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p>Agent not found</p>
          <Link href="/agent-intelligence">
            <a className="text-blue-300 hover:text-blue-200 mt-4 inline-block">
              ← Back to Network
            </a>
          </Link>
        </div>
      </div>
    );
  }

  const agentData = agent.agent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/agent-intelligence">
              <a className="text-white hover:text-blue-300 transition-colors" data-testid="link-back">
                <ArrowLeft className="w-6 h-6" />
              </a>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {agentData.name}
              </h1>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-blue-300 border-blue-500/50">
                  {agentData.type}
                </Badge>
                {agentData.division && (
                  <Badge variant="outline" className="text-purple-300 border-purple-500/50">
                    {agentData.division} Division
                  </Badge>
                )}
                <Badge className={`${agentData.status === 'active' ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                  {agentData.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-300 mb-1">Agent ID</div>
            <div className="text-xl font-mono text-white" data-testid="text-agent-id">{agentData.id}</div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800/10 border-blue-500/30 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-200 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Expertise Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {((agentData.expertiseScore || 0.5) * 100).toFixed(0)}%
              </div>
              <Progress value={(agentData.expertiseScore || 0.5) * 100} className="w-full h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800/10 border-blue-500/30 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-200 flex items-center gap-2">
                <TestTube2 className="w-4 h-4" />
                Tests Run
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {metrics?.summary?.testsRun || 0}
              </div>
              <p className="text-xs text-blue-300 mt-1">
                {((metrics?.summary?.passRate || 0) * 100).toFixed(0)}% pass rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800/10 border-blue-500/30 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-200 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Auto-Fixes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {fixHistory?.length || 0}
              </div>
              <p className="text-xs text-blue-300 mt-1">
                {((metrics?.summary?.autoFixRate || 0) * 100).toFixed(0)}% success rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800/10 border-blue-500/30 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-200 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Learnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {learnings?.learnings?.length || 0}
              </div>
              <p className="text-xs text-blue-300 mt-1">Pattern library</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-800/10 backdrop-blur">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tests" data-testid="tab-tests">
              <TestTube2 className="w-4 h-4 mr-2" />
              Tests
            </TabsTrigger>
            <TabsTrigger value="learnings" data-testid="tab-learnings">
              <Brain className="w-4 h-4 mr-2" />
              Learnings
            </TabsTrigger>
            <TabsTrigger value="fixes" data-testid="tab-fixes">
              <Zap className="w-4 h-4 mr-2" />
              Auto-Fixes
            </TabsTrigger>
            <TabsTrigger value="metrics" data-testid="tab-metrics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Agent Capabilities */}
              <Card className="bg-white dark:bg-gray-800/10 border-blue-500/30 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agentData.capabilities && typeof agentData.capabilities === 'object' ? (
                      Object.entries(agentData.capabilities).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-blue-200 capitalize">{key.replace(/_/g, ' ')}</span>
                          {value ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-blue-300 text-sm">No capabilities defined</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Agent Domains */}
              <Card className="bg-white dark:bg-gray-800/10 border-blue-500/30 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-400" />
                    Domains
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {agentData.domains && Array.isArray(agentData.domains) && agentData.domains.length > 0 ? (
                      agentData.domains.map((domain: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-blue-300 border-blue-500/50 mr-2">
                          {domain}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-blue-300 text-sm">No domains assigned</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* ESA Layers */}
              <Card className="bg-white dark:bg-gray-800/10 border-blue-500/30 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-400" />
                    ESA Layers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {agentData.esaLayers && Array.isArray(agentData.esaLayers) && agentData.esaLayers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {agentData.esaLayers.map((layer: number, idx: number) => (
                          <Badge key={idx} className="bg-purple-500/30 text-purple-200">
                            Layer {layer}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-blue-300 text-sm">No layers assigned</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Reporting Structure */}
              <Card className="bg-white dark:bg-gray-800/10 border-blue-500/30 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-blue-400" />
                    Reports To
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {agentData.reportsTo && Array.isArray(agentData.reportsTo) && agentData.reportsTo.length > 0 ? (
                      agentData.reportsTo.map((supervisor: string, idx: number) => (
                        <div key={idx} className="text-blue-200 text-sm">
                          → {supervisor}
                        </div>
                      ))
                    ) : (
                      <p className="text-blue-300 text-sm">Independent agent</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests" className="space-y-4">
            <TestsTabContent agentId={agentId} metrics={metrics} />
          </TabsContent>

          {/* Learnings Tab */}
          <TabsContent value="learnings" className="space-y-4">
            <LearningsTabContent agentId={agentId} learnings={learnings} />
          </TabsContent>

          {/* Auto-Fixes Tab */}
          <TabsContent value="fixes" className="space-y-4">
            <AutoFixesTabContent agentId={agentId} fixHistory={fixHistory} />
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <MetricsTabContent agentId={agentId} metrics={metrics} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============================================================================
// TAB COMPONENTS
// ============================================================================

function TestsTabContent({ agentId, metrics }: any) {
  const { data: tests } = useQuery({
    queryKey: [`/api/agent-intelligence/${agentId}/tests`],
    enabled: !!agentId
  });

  return (
    <Card className="bg-white dark:bg-gray-800/10 border-blue-500/30 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl text-white">Test Execution History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {metrics?.metrics?.filter((m: any) => m.metricType === 'test_execution').map((metric: any, idx: number) => (
              <div
                key={idx}
                className={`bg-white/5 rounded-lg p-4 border transition-colors ${
                  metric.result === 'pass' 
                    ? 'border-green-500/30' 
                    : 'border-red-500/30'
                }`}
                data-testid={`test-${idx}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`${metric.result === 'pass' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                      {metric.result === 'pass' ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {metric.result}
                    </Badge>
                    {metric.autoFixed && (
                      <Badge className="bg-blue-500 text-white">
                        <Zap className="w-3 h-3 mr-1" />
                        Auto-Fixed
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-blue-300">
                    {new Date(metric.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-blue-200">
                  <div>
                    <span className="text-blue-300">Execution Time:</span>
                    <span className="text-white ml-1">{metric.executionTime}ms</span>
                  </div>
                </div>
              </div>
            ))}
            {(!metrics?.metrics || metrics.metrics.filter((m: any) => m.metricType === 'test_execution').length === 0) && (
              <div className="text-center text-blue-300 py-8">
                No test history yet
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function LearningsTabContent({ agentId, learnings }: any) {
  return (
    <Card className="bg-white dark:bg-gray-800/10 border-blue-500/30 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl text-white">Pattern Library & Memory</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {learnings?.learnings?.map((learning: any) => (
              <div
                key={learning.id}
                className="bg-white dark:bg-gray-800/5 rounded-lg p-4 border border-blue-500/20"
                data-testid={`learning-${learning.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-semibold">{learning.pattern}</h4>
                  <Badge className="bg-blue-500/30 text-blue-200">
                    Confidence: {(parseFloat(learning.confidence) * 100).toFixed(0)}%
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-blue-300 font-medium">Problem:</span>
                    <p className="text-white mt-1">{learning.problem}</p>
                  </div>
                  <div>
                    <span className="text-blue-300 font-medium">Solution:</span>
                    <p className="text-white mt-1">{learning.solution}</p>
                  </div>
                </div>
                {learning.codeExample && (
                  <div className="bg-black/30 rounded p-3 mt-2">
                    <pre className="text-xs text-green-300 overflow-x-auto">
                      {learning.codeExample}
                    </pre>
                  </div>
                )}
              </div>
            ))}
            {(!learnings?.learnings || learnings.learnings.length === 0) && (
              <div className="text-center text-blue-300 py-8">
                No learnings yet
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function AutoFixesTabContent({ agentId, fixHistory }: any) {
  return (
    <Card className="bg-white dark:bg-gray-800/10 border-blue-500/30 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl text-white">Automated Resolution History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {fixHistory && fixHistory.length > 0 ? (
              fixHistory.map((fix: any, idx: number) => (
                <div
                  key={idx}
                  className={`bg-white/5 rounded-lg p-4 border transition-colors ${
                    fix.success 
                      ? 'border-green-500/30' 
                      : 'border-red-500/30'
                  }`}
                  data-testid={`fix-${idx}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${fix.success ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                        {fix.success ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {fix.success ? 'Fixed' : 'Failed'}
                      </Badge>
                      <Badge className="bg-blue-500/30 text-blue-200">
                        {fix.fixStrategy}
                      </Badge>
                    </div>
                    <span className="text-xs text-blue-300">
                      {new Date(fix.appliedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-blue-200">
                    <div>
                      <span className="text-blue-300">Confidence:</span>
                      <span className="text-white ml-1">{((fix.confidence || 0) * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-blue-300">Execution:</span>
                      <span className="text-white ml-1">{fix.executionTime}ms</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-blue-300 py-8">
                No auto-fixes yet
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function MetricsTabContent({ agentId, metrics }: any) {
  const summary = metrics?.summary || {};

  return (
    <div className="space-y-4">
      <Card className="bg-white dark:bg-gray-800/10 border-blue-500/30 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl text-white">Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800/5 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2">Tests Run</h4>
              <p className="text-3xl font-bold text-white">{summary.testsRun || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800/5 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2">Pass Rate</h4>
              <p className="text-3xl font-bold text-green-400">
                {((summary.passRate || 0) * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800/5 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2">Avg Execution</h4>
              <p className="text-3xl font-bold text-white">{summary.avgExecutionTime || 0}ms</p>
            </div>
            <div className="bg-white dark:bg-gray-800/5 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2">Auto-Fix Rate</h4>
              <p className="text-3xl font-bold text-blue-400">
                {((summary.autoFixRate || 0) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
