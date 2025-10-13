import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { MetaTags } from "@/components/seo/MetaTags";

interface AgentLearning {
  id: number;
  agentId: string;
  agentName: string;
  patternName: string;
  patternDescription: string;
  confidence: number;
  applications: number;
  category: string;
  impact: string;
  createdAt: string;
}

export default function AgentLearnings() {
  const { data: learnings = [], isLoading } = useQuery<AgentLearning[]>({
    queryKey: ['/api/agent-learning/patterns'],
  });

  const stats = {
    totalPatterns: learnings.length,
    highConfidence: learnings.filter(l => l.confidence >= 0.9).length,
    activeApplications: learnings.reduce((sum, l) => sum + l.applications, 0),
    recentLearnings: learnings.filter(l => {
      const created = new Date(l.createdAt);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return created > dayAgo;
    }).length,
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.95) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.85) return 'text-blue-600 dark:text-blue-400';
    if (confidence >= 0.75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <MetaTags
        title="Agent Learning Dashboard"
        description="Monitor AI agent learning patterns, captured knowledge, and collaborative intelligence across the ESA Framework"
        keywords="agent learning, AI patterns, collaborative intelligence, ESA Framework"
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Agent Learning Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitor captured patterns and collaborative intelligence
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patterns</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-patterns">
              {stats.totalPatterns}
            </div>
            <p className="text-xs text-muted-foreground">
              Captured knowledge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-high-confidence">
              {stats.highConfidence}
            </div>
            <p className="text-xs text-muted-foreground">
              ≥90% confidence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-applications">
              {stats.activeApplications}
            </div>
            <p className="text-xs text-muted-foreground">
              Times applied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent (24h)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-recent">
              {stats.recentLearnings}
            </div>
            <p className="text-xs text-muted-foreground">
              New patterns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Learnings List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Captured Patterns
        </h2>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading agent learnings...
          </div>
        ) : learnings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Brain className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No patterns captured yet. Agents will learn from system interactions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {learnings.map((learning) => (
              <Card key={learning.id} data-testid={`card-learning-${learning.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{learning.agentId}</Badge>
                        <Badge variant={getImpactColor(learning.impact)}>
                          {learning.impact}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{learning.patternName}</CardTitle>
                      <CardDescription className="mt-1">
                        {learning.patternDescription}
                      </CardDescription>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`text-2xl font-bold ${getConfidenceColor(learning.confidence)}`}>
                        {(learning.confidence * 100).toFixed(0)}%
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        confidence
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Category</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {learning.category}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Applications</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {learning.applications}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(learning.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
