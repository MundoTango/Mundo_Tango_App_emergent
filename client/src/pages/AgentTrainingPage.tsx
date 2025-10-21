import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Circle, AlertTriangle, BookOpen, Award, TrendingUp } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AgentCertification, Learning, AgentTrainingProgress } from "@shared/schema";

// Agent Training Certification UI
// MB.MD Phase 1C - Oct 21, 2025

interface TrainingStats {
  agents: {
    totalAgents: number;
    certified: number;
    pending: number;
    recertificationNeeded: number;
  };
  learnings: {
    totalLearnings: number;
    criticalLearnings: number;
    totalApplications: number;
  };
}

export default function AgentTrainingPage() {
  // Fetch training statistics
  const { data: stats, isLoading: statsLoading } = useQuery<TrainingStats>({
    queryKey: ["/api/learning/stats"],
  });

  // Fetch all certifications
  const { data: certifications = [], isLoading: certsLoading } = useQuery<AgentCertification[]>({
    queryKey: ["/api/learning/certifications"],
  });

  // Fetch critical learnings
  const { data: criticalLearnings = [], isLoading: learningsLoading } = useQuery<Learning[]>({
    queryKey: ["/api/learning/learnings/critical"],
  });

  const certificationRate = stats
    ? Math.round((stats.agents.certified / stats.agents.totalAgents) * 100)
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Agent Training & Certification
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            MB.MD Quality Assurance Protocol v1.0 - Phase 1C
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {certificationRate}% Certified
        </Badge>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-total-agents">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {statsLoading ? "..." : stats?.agents.totalAgents || 0}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-certified-agents">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Certified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {statsLoading ? "..." : stats?.agents.certified || 0}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-agents">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Circle className="h-5 w-5 text-yellow-500" />
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {statsLoading ? "..." : stats?.agents.pending || 0}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-critical-learnings">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Critical Learnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {statsLoading ? "..." : stats?.learnings.criticalLearnings || 0}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="certifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="certifications" data-testid="tab-certifications">
            <Award className="h-4 w-4 mr-2" />
            Certifications
          </TabsTrigger>
          <TabsTrigger value="learnings" data-testid="tab-learnings">
            <BookOpen className="h-4 w-4 mr-2" />
            Critical Learnings
          </TabsTrigger>
          <TabsTrigger value="progress" data-testid="tab-progress">
            <TrendingUp className="h-4 w-4 mr-2" />
            Training Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Certifications</CardTitle>
              <CardDescription>
                All 350+ agents must complete MB.MD training before starting work
              </CardDescription>
            </CardHeader>
            <CardContent>
              {certsLoading ? (
                <p className="text-gray-600 dark:text-gray-400">Loading certifications...</p>
              ) : certifications.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No certifications found. Start training agents.</p>
              ) : (
                <div className="space-y-3">
                  {certifications.slice(0, 20).map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      data-testid={`certification-${cert.agentId}`}
                    >
                      <div className="flex items-center gap-3">
                        {cert.trainingCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {cert.agentName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {cert.agentId} • {cert.agentType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={cert.status === "certified" ? "default" : "secondary"}>
                          {cert.status}
                        </Badge>
                        {cert.quizScore && (
                          <Badge variant="outline">
                            Score: {cert.quizScore}/100
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical Learnings</CardTitle>
              <CardDescription>
                Mandatory reading from AGENT_SESSION_LOG.md and MB_MD_QA_PROTOCOL.md
              </CardDescription>
            </CardHeader>
            <CardContent>
              {learningsLoading ? (
                <p className="text-gray-600 dark:text-gray-400">Loading learnings...</p>
              ) : criticalLearnings.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No critical learnings yet.</p>
              ) : (
                <div className="space-y-4">
                  {criticalLearnings.map((learning) => (
                    <div
                      key={learning.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      data-testid={`learning-${learning.id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {learning.title}
                        </h3>
                        <Badge
                          variant={learning.severity === "critical" ? "destructive" : "default"}
                        >
                          {learning.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Problem:</strong> {learning.problem}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Root Cause:</strong> {learning.rootCause}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Solution:</strong> {learning.solution}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-600 dark:text-gray-400">
                        <span>Category: {learning.category}</span>
                        <span>Applied: {learning.applicationCount} times</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overall Training Progress</CardTitle>
              <CardDescription>
                Certification progress across all agent types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Overall Certification Rate
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {certificationRate}%
                  </span>
                </div>
                <Progress value={certificationRate} className="h-2" />
              </div>

              {stats && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Learnings</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.learnings.totalLearnings}
                    </p>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.learnings.totalApplications}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
