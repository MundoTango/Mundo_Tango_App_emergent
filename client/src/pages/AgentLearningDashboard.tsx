import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Zap, Database, TrendingUp, Activity, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LearningStats {
  totalPatterns: number;
  highConfidence: number;
  jobQueue: Array<{ status: string; count: number; avg_duration: number }>;
  workerStatus: string;
}

interface Pattern {
  id: number;
  pattern: string;
  problem: string;
  solution: string;
  confidence: string;
  esaLayers: string[];
  agentDomains: string[];
  discoveredBy: string;
  createdAt: string;
}

export default function AgentLearningDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: stats, refetch: refetchStats } = useQuery<LearningStats>({
    queryKey: ['/api/agent-learning/stats'],
  });

  const { data: patterns, refetch: refetchPatterns } = useQuery<Pattern[]>({
    queryKey: ['/api/agent-learning/learnings'],
  });

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refetchStats();
      refetchPatterns();
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh, refetchStats, refetchPatterns]);

  const queuedJobs = stats?.jobQueue?.find(q => q.status === 'queued')?.count || 0;
  const runningJobs = stats?.jobQueue?.find(q => q.status === 'running')?.count || 0;
  const completedJobs = stats?.jobQueue?.find(q => q.status === 'done')?.count || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Brain className="w-10 h-10 text-purple-400" />
              AGI Agent Learning Dashboard
            </h1>
            <p className="text-purple-200">Real-time self-improving agent monitoring • ESA Layers 11, 18, 48</p>
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
          <Card className="bg-white/10 border-purple-500/30 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Total Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white" data-testid="text-total-patterns">
                {stats?.totalPatterns || 0}
              </div>
              <p className="text-xs text-purple-300 mt-1">Across all ESA layers</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-purple-500/30 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                High Confidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white" data-testid="text-high-confidence">
                {stats?.highConfidence || 0}
              </div>
              <p className="text-xs text-purple-300 mt-1">≥90% confidence score</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-purple-500/30 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Job Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-white" data-testid="text-queued-jobs">{queuedJobs}</div>
                <div className="text-sm text-purple-300">queued</div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="text-sm text-green-400">{runningJobs} running</div>
                <div className="text-sm text-purple-300">• {completedJobs} done</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-purple-500/30 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-purple-200 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Worker Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-500 text-white">
                  {stats?.workerStatus === 'active' ? 'OPERATIONAL' : 'OFFLINE'}
                </Badge>
              </div>
              <p className="text-xs text-purple-300 mt-1">6 modular workers active</p>
            </CardContent>
          </Card>
        </div>

        {/* Pattern Discovery Feed */}
        <Card className="bg-white/10 border-purple-500/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              Recent Pattern Discoveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {patterns?.map((pattern) => (
                <div
                  key={pattern.id}
                  className="bg-white/5 rounded-lg p-4 border border-purple-500/20 hover:border-purple-400/40 transition-colors"
                  data-testid={`card-pattern-${pattern.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{pattern.pattern}</h3>
                      <p className="text-sm text-purple-200 mb-2">{pattern.problem}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={parseFloat(pattern.confidence) * 100} 
                        className="w-20 h-2"
                      />
                      <span className="text-sm text-purple-300">{(parseFloat(pattern.confidence) * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-purple-300 mb-3">
                    <div className="flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      {pattern.discoveredBy}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(pattern.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded p-3 mb-3">
                    <p className="text-sm text-green-300 mb-1">✅ Solution:</p>
                    <p className="text-sm text-purple-100">{pattern.solution}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {pattern.esaLayers?.map((layer) => (
                      <Badge key={layer} variant="outline" className="border-blue-400 text-blue-300">
                        Layer {layer}
                      </Badge>
                    ))}
                    {pattern.agentDomains?.map((domain) => (
                      <Badge key={domain} variant="outline" className="border-purple-400 text-purple-300">
                        {domain}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Architecture Info */}
        <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30 backdrop-blur">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  PostgreSQL Queue
                </h3>
                <p className="text-sm text-purple-200">FOR UPDATE SKIP LOCKED pattern for zero-contention job processing</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  LangGraph Orchestration
                </h3>
                <p className="text-sm text-purple-200">Multi-agent collaboration with checkpointing and durable execution</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  Modular Workers
                </h3>
                <p className="text-sm text-purple-200">Domain-specific pattern detection: memory, cache, events, social, ai</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
