import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Zap, 
  Network, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  TestTube2,
  Users,
  BookOpen,
  Layers,
  Shield
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AgentStats {
  stats: {
    totalLearnings: number;
    totalTests: number;
    totalKnowledge: number;
    totalMessages: number;
    totalCollaborations: number;
    totalComponents: number;
    systemHealth: string;
  };
}

interface AgentActivity {
  agentId: string;
  agentType: string;
  action: string;
  timestamp: string;
  metadata?: any;
}

interface AgentCommunication {
  id: number;
  fromAgent: string;
  toAgent: string;
  messageType: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

interface AgentTestResult {
  id: number;
  agentId: string;
  testType: string;
  status: string;
  score: number;
  executedAt: string;
}

interface AgentCollaboration {
  id: number;
  agentId: string;
  collaboratorId: string;
  issue: string;
  status: string;
  createdAt: string;
}

export default function AgentIntelligenceNetwork() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");

  const { data: stats, refetch: refetchStats } = useQuery<AgentStats>({
    queryKey: ['/api/agent-intelligence/stats'],
    queryFn: async () => {
      const res = await fetch('/api/agent-intelligence/stats');
      return res.json();
    }
  });

  const { data: activities, refetch: refetchActivities } = useQuery<{activities: AgentActivity[], count: number}>({
    queryKey: ['/api/agent-intelligence/activities'],
    queryFn: async () => {
      const res = await fetch('/api/agent-intelligence/activities?limit=10');
      return res.json();
    }
  });

  const { data: learnings, refetch: refetchLearnings } = useQuery<{learnings: any[], count: number}>({
    queryKey: ['/api/agent-intelligence/learnings/recent'],
    queryFn: async () => {
      const res = await fetch('/api/agent-intelligence/learnings/recent?limit=10');
      return res.json();
    }
  });

  const { data: testResults, refetch: refetchTests } = useQuery<{tests: AgentTestResult[], count: number}>({
    queryKey: ['/api/agent-intelligence/tests/recent'],
    queryFn: async () => {
      const res = await fetch('/api/agent-intelligence/tests/recent?limit=10');
      return res.json();
    }
  });

  const { data: messages, refetch: refetchMessages } = useQuery<{messages: any[], count: number}>({
    queryKey: ['/api/agent-intelligence/messages/recent'],
    queryFn: async () => {
      const res = await fetch('/api/agent-intelligence/messages/recent?limit=10');
      return res.json();
    }
  });

  const { data: collaborations, refetch: refetchCollaborations } = useQuery<{collaborations: AgentCollaboration[], count: number}>({
    queryKey: ['/api/agent-intelligence/collaborations/recent'],
    queryFn: async () => {
      const res = await fetch('/api/agent-intelligence/collaborations/recent?limit=10');
      return res.json();
    }
  });

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refetchStats();
      refetchActivities();
      refetchLearnings();
      refetchTests();
      refetchMessages();
      refetchCollaborations();
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh, refetchStats, refetchActivities, refetchLearnings, refetchTests, refetchMessages, refetchCollaborations]);

  const totalTests = stats?.stats?.totalTests || 0;
  const totalLearnings = stats?.stats?.totalLearnings || 0;
  const totalMessages = stats?.stats?.totalMessages || 0;
  const totalComponents = stats?.stats?.totalComponents || 0;
  const systemHealth = stats?.stats?.systemHealth || 'unknown';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Network className="w-10 h-10 text-blue-400" />
              Agent Intelligence Network
            </h1>
            <p className="text-blue-200">
              Self-Learning System • 150+ Agents • Phase 6 Complete
            </p>
          </div>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
            data-testid="button-toggle-refresh"
          >
            <Activity className={`w-4 h-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
            {autoRefresh ? 'Live Updates' : 'Paused'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/10 border-blue-500/30 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-200 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Total Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white" data-testid="text-total-agents">
                {totalComponents}
              </div>
              <p className="text-xs text-blue-300 mt-1">
                {totalLearnings} learnings • {totalMessages} messages
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-blue-500/30 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-200 flex items-center gap-2">
                <TestTube2 className="w-4 h-4" />
                Self-Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white" data-testid="text-total-tests">
                {totalTests}
              </div>
              <p className="text-xs text-blue-300 mt-1">
                Self-tests running • {totalTests} total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-blue-500/30 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Communications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white" data-testid="text-total-communications">
                {totalMessages}
              </div>
              <p className="text-xs text-blue-300 mt-1">
                Agent-to-agent messages
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-blue-500/30 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-200 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white" data-testid="text-health-score">
                {systemHealth === 'operational' ? '100' : '0.0'}
              </div>
              <Progress 
                value={systemHealth === 'operational' ? 100 : 0} 
                className="w-full h-2 mt-2"
              />
              <p className="text-xs text-blue-300 mt-1">System {systemHealth}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="communications" data-testid="tab-communications">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="tests" data-testid="tab-tests">
              <TestTube2 className="w-4 h-4 mr-2" />
              Tests
            </TabsTrigger>
            <TabsTrigger value="collaborations" data-testid="tab-collaborations">
              <Users className="w-4 h-4 mr-2" />
              Collaborations
            </TabsTrigger>
            <TabsTrigger value="learning" data-testid="tab-learning">
              <Brain className="w-4 h-4 mr-2" />
              Learning
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-white/10 border-blue-500/30 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Recent Agent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {activities?.activities?.map((activity, index) => (
                      <div
                        key={index}
                        className="bg-white/5 rounded-lg p-4 border border-blue-500/20 hover:border-blue-400/40 transition-colors"
                        data-testid={`activity-${index}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-blue-300 border-blue-500/50">
                                {activity.agentType}
                              </Badge>
                              <span className="text-sm text-blue-200 font-mono">
                                {activity.agentId}
                              </span>
                            </div>
                            <p className="text-white font-medium">{activity.action}</p>
                          </div>
                          <span className="text-xs text-blue-300">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {!activities?.activities || activities.activities.length === 0 && (
                      <div className="text-center text-blue-300 py-8">
                        No recent activity
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="space-y-4">
            <Card className="bg-white/10 border-blue-500/30 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  Agent-to-Agent Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {communications?.map((comm) => (
                      <div
                        key={comm.id}
                        className={`bg-white/5 rounded-lg p-4 border transition-colors ${
                          comm.isRead 
                            ? 'border-blue-500/20 hover:border-blue-400/40' 
                            : 'border-yellow-500/50 bg-yellow-500/10'
                        }`}
                        data-testid={`communication-${comm.id}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-blue-300 border-blue-500/50">
                              {comm.fromAgent}
                            </Badge>
                            <span className="text-blue-400">→</span>
                            <Badge variant="outline" className="text-blue-300 border-blue-500/50">
                              {comm.toAgent}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {!comm.isRead && (
                              <Badge className="bg-yellow-500 text-white">New</Badge>
                            )}
                            <span className="text-xs text-blue-300">
                              {new Date(comm.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="mb-2">
                          <Badge className="bg-blue-500/30 text-blue-200">
                            {comm.messageType}
                          </Badge>
                        </div>
                        <p className="text-white">{comm.message}</p>
                      </div>
                    ))}
                    {!communications || communications.length === 0 && (
                      <div className="text-center text-blue-300 py-8">
                        No communications
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests" className="space-y-4">
            <Card className="bg-white/10 border-blue-500/30 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <TestTube2 className="w-5 h-5 text-blue-400" />
                  Self-Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {testResults?.map((test) => (
                      <div
                        key={test.id}
                        className="bg-white/5 rounded-lg p-4 border border-blue-500/20 hover:border-blue-400/40 transition-colors"
                        data-testid={`test-result-${test.id}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-blue-200 font-mono">
                              {test.agentId}
                            </span>
                            <Badge variant="outline" className="text-blue-300 border-blue-500/50">
                              {test.testType}
                            </Badge>
                          </div>
                          <span className="text-xs text-blue-300">
                            {new Date(test.executedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {test.status === 'passed' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-400" />
                            )}
                            <Badge className={
                              test.status === 'passed' 
                                ? 'bg-green-500/30 text-green-200' 
                                : 'bg-red-500/30 text-red-200'
                            }>
                              {test.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={test.score} 
                              className="w-24 h-2"
                            />
                            <span className="text-sm text-white font-medium">
                              {test.score.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!testResults || testResults.length === 0 && (
                      <div className="text-center text-blue-300 py-8">
                        No test results
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collaborations Tab */}
          <TabsContent value="collaborations" className="space-y-4">
            <Card className="bg-white/10 border-blue-500/30 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Agent Collaborations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {collaborations?.map((collab) => (
                      <div
                        key={collab.id}
                        className="bg-white/5 rounded-lg p-4 border border-blue-500/20 hover:border-blue-400/40 transition-colors"
                        data-testid={`collaboration-${collab.id}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-blue-300 border-blue-500/50">
                              {collab.agentId}
                            </Badge>
                            <span className="text-blue-400">↔</span>
                            <Badge variant="outline" className="text-blue-300 border-blue-500/50">
                              {collab.collaboratorId}
                            </Badge>
                          </div>
                          <span className="text-xs text-blue-300">
                            {new Date(collab.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-white mb-2">{collab.issue}</p>
                        <Badge className={
                          collab.status === 'resolved' 
                            ? 'bg-green-500/30 text-green-200' 
                            : collab.status === 'active'
                            ? 'bg-blue-500/30 text-blue-200'
                            : 'bg-yellow-500/30 text-yellow-200'
                        }>
                          {collab.status.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                    {!collaborations || collaborations.length === 0 && (
                      <div className="text-center text-blue-300 py-8">
                        No collaborations
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-4">
            <Card className="bg-white/10 border-blue-500/30 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  Agent Learning & Memory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-6 border border-blue-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Knowledge Base</h3>
                      <Badge className="bg-blue-500/30 text-blue-200">
                        {stats?.totalMemories || 0} memories
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded p-4">
                        <div className="text-2xl font-bold text-white mb-1">
                          {stats?.learningAgents || 0}
                        </div>
                        <p className="text-sm text-blue-300">Active Learners</p>
                      </div>
                      <div className="bg-white/5 rounded p-4">
                        <div className="text-2xl font-bold text-white mb-1">
                          {stats?.totalCollaborations || 0}
                        </div>
                        <p className="text-sm text-blue-300">Total Collaborations</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-6 border border-blue-500/20">
                    <h3 className="text-lg font-semibold text-white mb-4">Learning Capabilities</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-200">Self-Testing Framework</span>
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-200">Peer Collaboration</span>
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-200">Mr Blue Coordination</span>
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-200">Auto-Fix Issues</span>
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-200">Context Preservation</span>
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
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
