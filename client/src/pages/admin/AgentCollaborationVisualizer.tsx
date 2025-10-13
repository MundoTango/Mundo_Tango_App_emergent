import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Network, Share2, Brain, ArrowRight, Zap } from "lucide-react";
import { MetaTags } from "@/components/seo/MetaTags";

interface Agent {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'idle' | 'learning';
  connections: string[];
  patternsShared: number;
}

interface CollaborationFlow {
  from: string;
  to: string;
  pattern: string;
  confidence: number;
  timestamp: string;
}

export default function AgentCollaborationVisualizer() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Mock data - would come from API
  const agents: Agent[] = [
    { id: 'ESA1', name: 'Project Orchestrator', category: 'Meta-Agent', status: 'active', connections: ['ESA6', 'ESA11', 'ESA80'], patternsShared: 25 },
    { id: 'ESA6', name: 'State Management', category: 'Division Chief', status: 'active', connections: ['ESA1', 'ESA11', 'ESA48'], patternsShared: 18 },
    { id: 'ESA11', name: 'UI/UX', category: 'Division Chief', status: 'active', connections: ['ESA1', 'ESA6', 'ESA48', 'ESA53'], patternsShared: 32 },
    { id: 'ESA48', name: 'Dark Mode', category: 'Division Chief', status: 'learning', connections: ['ESA6', 'ESA11', 'ESA55'], patternsShared: 15 },
    { id: 'ESA53', name: 'Translation', category: 'Division Chief', status: 'learning', connections: ['ESA11', 'ESA55'], patternsShared: 12 },
    { id: 'ESA55', name: 'SEO', category: 'Division Chief', status: 'active', connections: ['ESA11', 'ESA48', 'ESA53'], patternsShared: 20 },
    { id: 'ESA65', name: 'The Plan', category: 'Division Chief', status: 'active', connections: ['ESA1', 'ESA80'], patternsShared: 22 },
    { id: 'ESA80', name: 'Learning Coordinator', category: 'Meta-Agent', status: 'active', connections: ['ESA1', 'ESA6', 'ESA11', 'ESA65', 'ESA79'], patternsShared: 45 },
    { id: 'ESA79', name: 'Quality Validator', category: 'Meta-Agent', status: 'active', connections: ['ESA80', 'ESA11'], patternsShared: 28 },
  ];

  const flows: CollaborationFlow[] = [
    { from: 'ESA11', to: 'ESA48', pattern: 'Dark Mode UI Pattern', confidence: 0.92, timestamp: '2 mins ago' },
    { from: 'ESA6', to: 'ESA11', pattern: 'State Synchronization', confidence: 0.98, timestamp: '5 mins ago' },
    { from: 'ESA80', to: 'ESA1', pattern: 'Cross-Agent Learning', confidence: 0.95, timestamp: '8 mins ago' },
    { from: 'ESA53', to: 'ESA11', pattern: 'i18n Integration', confidence: 0.88, timestamp: '12 mins ago' },
  ];

  const selectedAgentData = selectedAgent ? agents.find(a => a.id === selectedAgent) : null;

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'learning': return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
      case 'idle': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <MetaTags
        title="Agent Collaboration Visualizer"
        description="Visualize real-time collaboration and knowledge sharing between ESA agents"
        keywords="agent collaboration, AI network, knowledge sharing, ESA visualization"
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white flex items-center gap-2">
          <Network className="w-8 h-8" />
          Agent Collaboration Network
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Real-time visualization of agent knowledge sharing and collaboration
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">
              {agents.filter(a => a.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {agents.filter(a => a.status === 'learning').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Patterns Shared</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">
              {agents.reduce((sum, a) => sum + a.patternsShared, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Flows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {flows.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Network */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              ESA Agent Network
            </CardTitle>
            <CardDescription>
              Click an agent to see collaboration details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  selectedAgent === agent.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                data-testid={`agent-${agent.id}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{agent.id}</Badge>
                      <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white dark:text-white mt-1">
                      {agent.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {agent.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">
                      {agent.patternsShared}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      patterns
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Collaboration Details */}
        <div className="space-y-4">
          {selectedAgentData ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Agent Details: {selectedAgentData.name}</CardTitle>
                  <CardDescription>
                    {selectedAgentData.id} - {selectedAgentData.category}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    <Badge className={getStatusColor(selectedAgentData.status)}>
                      {selectedAgentData.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Connected Agents
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgentData.connections.map((connId) => (
                        <Badge key={connId} variant="outline">
                          {connId}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Patterns Shared
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white">
                      {selectedAgentData.patternsShared}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Network className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Select an agent to view collaboration details
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recent Flows */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Recent Knowledge Flows
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {flows.map((flow, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 rounded-lg"
                  data-testid={`flow-${idx}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{flow.from}</Badge>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <Badge variant="outline">{flow.to}</Badge>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white dark:text-white">
                      {flow.pattern}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Confidence: {(flow.confidence * 100).toFixed(0)}%
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {flow.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
