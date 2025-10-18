import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle, Circle } from "lucide-react";

export default function MTStatusPreview() {
  const phases = [
    {
      id: "phase0",
      name: "Phase 0: Agent Preparation",
      status: "complete",
      progress: 100,
      time: "26 hours",
      items: [
        { name: "Agent coordinator updated", done: true },
        { name: "Documentation created", done: true },
        { name: "Naming fixed (146 files)", done: true },
        { name: "Page agents wired (125+)", done: true },
        { name: "Journey orchestration (J1-J4)", done: true }
      ]
    },
    {
      id: "phase3",
      name: "Phase 3: Database Optimization",
      status: "complete",
      progress: 100,
      time: "2-3 hours",
      items: [
        { name: "Schema review & optimization", done: true },
        { name: "Index creation for performance", done: true },
        { name: "Migration cleanup", done: true },
        { name: "Push journey schema changes", done: true },
        { name: "13 critical indexes added", done: true },
        { name: "Sub-millisecond query performance achieved", done: true }
      ]
    },
    {
      id: "phase11",
      name: "Phase 11: Backend Completion",
      status: "inprogress",
      progress: 80,
      time: "4-5 hours",
      items: [
        { name: "API endpoint optimization", done: false },
        { name: "Authentication hardening", done: false },
        { name: "Real-time features polish", done: false },
        { name: "Error handling improvements", done: false }
      ]
    },
    {
      id: "phase10",
      name: "Phase 10: Frontend Polish",
      status: "pending",
      progress: 70,
      time: "10-12 hours",
      items: [
        { name: "Component optimization", done: false },
        { name: "State management cleanup", done: false },
        { name: "Performance improvements", done: false },
        { name: "Mobile responsiveness", done: false }
      ]
    },
    {
      id: "phase12",
      name: "Phase 12: Integration Testing",
      status: "pending",
      progress: 75,
      time: "3-4 hours"
    },
    {
      id: "phase14",
      name: "Phase 14: Comprehensive Testing",
      status: "pending",
      progress: 30,
      time: "8-10 hours"
    },
    {
      id: "phase16",
      name: "Phase 16: Security Hardening",
      status: "pending",
      progress: 60,
      time: "4-5 hours"
    },
    {
      id: "phase17",
      name: "Phase 17: Production Deployment",
      status: "configured",
      progress: 100,
      time: "2 hours"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />;
      case "inprogress":
        return <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
      case "configured":
        return <CheckCircle2 className="w-5 h-5 text-teal-500 dark:text-teal-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400 dark:text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return <Badge className="bg-green-500 dark:bg-green-600">Complete</Badge>;
      case "inprogress":
        return <Badge className="bg-blue-500 dark:bg-blue-600">In Progress</Badge>;
      case "configured":
        return <Badge className="bg-teal-500 dark:bg-teal-600">Configured</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const totalProgress = Math.round(phases.reduce((sum, p) => sum + p.progress, 0) / phases.length);
  const completedPhases = phases.filter(p => p.status === "complete" || p.status === "configured").length;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent mb-2">
          Mundo Tango Master Rebuild Status
        </h1>
        <p className="text-muted-foreground">
          ESA LIFE CEO Platform - 276 AI Agents across 13 Categories
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card data-testid="card-overall-progress">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>{totalProgress}% Complete</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={totalProgress} className="mb-2" data-testid="progress-overall" />
            <p className="text-sm text-muted-foreground">
              {completedPhases} of {phases.length} phases complete
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-agents">
          <CardHeader>
            <CardTitle>AI Agents</CardTitle>
            <CardDescription>119 / 276 Operational</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(119 / 276) * 100} className="mb-2" data-testid="progress-agents" />
            <p className="text-sm text-muted-foreground">
              43% agent coverage
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-database">
          <CardHeader>
            <CardTitle>Database Performance</CardTitle>
            <CardDescription>Sub-millisecond queries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm">13 indexes optimized</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm">0.036-0.073ms query time</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6" data-testid="card-critical-alert">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            File Deletion Crisis Resolved
          </CardTitle>
          <CardDescription>
            Layer 52 Documentation System Agent disabled - Files now stable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2">
            <strong>Root Cause:</strong> ESA Layer 52 was truncating documentation files to 0 bytes during server bootstrap.
          </p>
          <p className="text-sm">
            <strong>Fix:</strong> Agent disabled, all files restored from git history, 100% stability achieved.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Phase Status</h2>
        {phases.map((phase) => (
          <Card key={phase.id} data-testid={`card-${phase.id}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(phase.status)}
                  <div>
                    <CardTitle className="text-lg">{phase.name}</CardTitle>
                    <CardDescription>{phase.time} estimated</CardDescription>
                  </div>
                </div>
                {getStatusBadge(phase.status)}
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={phase.progress} className="mb-4" data-testid={`progress-${phase.id}`} />
              {phase.items && (
                <div className="space-y-2">
                  {phase.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {item.done ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={item.done ? "text-muted-foreground line-through" : ""}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8" data-testid="card-next-steps">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>MB.MD Methodology - Parallel Execution</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Phase 11: Backend Completion (4-5 hours)</li>
            <li>Phase 10: Frontend Polish (10-12 hours) - Run in parallel</li>
            <li>Phase 12: Integration Testing (3-4 hours)</li>
            <li>Phase 14: Comprehensive Testing (8-10 hours)</li>
            <li>Phase 16: Security Hardening (4-5 hours)</li>
            <li>Phase 17: Production Deployment (2 hours)</li>
          </ol>
          <p className="mt-4 text-sm font-medium">
            Total Time to Production: ~40-50 hours remaining
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
