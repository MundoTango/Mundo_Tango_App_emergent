/**
 * TRACK 7: UI Sub-Agents Dashboard
 * Super Admin control panel for autonomous UI agents
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play,
  Pause,
  RefreshCw,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Zap,
  Eye,
  Settings,
  TrendingUp,
  FileText,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Agent summary type
interface AgentSummary {
  totalAgents: number;
  activeSchedules: number;
  darkMode: {
    issuesFound: number;
    issuesFixed: number;
    coverage: number;
  } | null;
  translation: {
    stringsFound: number;
    stringsFixed: number;
    coverage: number;
  } | null;
  watcher: {
    filesWatched: number;
    changesDetected: number;
    agentsTriggered: number;
  } | null;
}

interface AgentSchedule {
  id: number;
  agentId: string;
  agentName: string;
  schedule: string;
  lastRun: string | null;
  nextRun: string | null;
  status: 'active' | 'paused' | 'failed';
  runCount: number;
  successCount: number;
  failCount: number;
  lastError: string | null;
}

export default function UISubAgentsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch summary
  const { data: summary, isLoading, refetch } = useQuery<AgentSummary>({
    queryKey: ['/api/ui-sub-agents/summary'],
  });

  // Fetch schedules
  const { data: schedules } = useQuery<AgentSchedule[]>({
    queryKey: ['/api/ui-sub-agents/schedules'],
  });

  // Trigger scan mutation
  const triggerScanMutation = useMutation({
    mutationFn: async ({ agent, autoFix }: { agent: string; autoFix: boolean }) => {
      return await apiRequest({
        method: 'POST',
        url: `/api/ui-sub-agents/${agent}/scan`,
        body: { autoFix, reportOnly: !autoFix },
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Scan Complete',
        description: `${variables.agent} scan finished successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ui-sub-agents/summary'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Scan Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Component watcher mutations
  const watcherMutation = useMutation({
    mutationFn: async (action: 'start' | 'stop') => {
      return await apiRequest({
        method: 'POST',
        url: `/api/ui-sub-agents/component-watcher/${action}`,
      });
    },
    onSuccess: (data, action) => {
      toast({
        title: action === 'start' ? 'Watcher Started' : 'Watcher Stopped',
        description: `Component watcher ${action}ed successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ui-sub-agents/summary'] });
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout data-testid="page-ui-sub-agents">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold dark:text-white" data-testid="text-page-title">
              {t('UI Sub-Agents Dashboard')}
            </h1>
            <p className="text-muted-foreground dark:text-gray-400 mt-1">
              {t('Monitor and control autonomous UI/UX agents')}
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            data-testid="button-refresh"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('Refresh')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="card-total-agents">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t('Total Agents')}
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-agents">
                {summary?.totalAgents || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary?.activeSchedules || 0} active schedules
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-dark-mode">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t('Dark Mode Coverage')}
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-dark-mode-coverage">
                {summary?.darkMode?.coverage || 0}%
              </div>
              <Progress value={summary?.darkMode?.coverage || 0} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {summary?.darkMode?.issuesFixed || 0} / {summary?.darkMode?.issuesFound || 0} fixed
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-translation">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t('Translation Coverage')}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-translation-coverage">
                {summary?.translation?.coverage || 0}%
              </div>
              <Progress value={summary?.translation?.coverage || 0} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {summary?.translation?.stringsFixed || 0} / {summary?.translation?.stringsFound || 0} fixed
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-watcher">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t('Component Watcher')}
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-files-watched">
                {summary?.watcher?.filesWatched || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary?.watcher?.changesDetected || 0} changes detected
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="agents" data-testid="tab-agents">
              Agents
            </TabsTrigger>
            <TabsTrigger value="schedules" data-testid="tab-schedules">
              Schedules
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card data-testid="card-agent-controls">
              <CardHeader>
                <CardTitle>{t('Agent Controls')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Dark Mode Fixer */}
                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                  <div className="flex-1">
                    <h3 className="font-semibold dark:text-white">Agent #11.1: Dark Mode Fixer</h3>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      Auto-fixes missing dark: variants
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => triggerScanMutation.mutate({ agent: 'dark-mode-fixer', autoFix: false })}
                      variant="outline"
                      size="sm"
                      disabled={triggerScanMutation.isPending}
                      data-testid="button-dark-mode-scan"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Scan Only
                    </Button>
                    <Button
                      onClick={() => triggerScanMutation.mutate({ agent: 'dark-mode-fixer', autoFix: true })}
                      size="sm"
                      disabled={triggerScanMutation.isPending}
                      data-testid="button-dark-mode-fix"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Scan & Fix
                    </Button>
                  </div>
                </div>

                {/* Translation Fixer */}
                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                  <div className="flex-1">
                    <h3 className="font-semibold dark:text-white">Agent #11.2: Translation Fixer</h3>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      Auto-fixes hardcoded text strings
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => triggerScanMutation.mutate({ agent: 'translation-fixer', autoFix: false })}
                      variant="outline"
                      size="sm"
                      disabled={triggerScanMutation.isPending}
                      data-testid="button-translation-scan"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Scan Only
                    </Button>
                    <Button
                      onClick={() => triggerScanMutation.mutate({ agent: 'translation-fixer', autoFix: true })}
                      size="sm"
                      disabled={triggerScanMutation.isPending}
                      data-testid="button-translation-fix"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Scan & Fix
                    </Button>
                  </div>
                </div>

                {/* Component Watcher */}
                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                  <div className="flex-1">
                    <h3 className="font-semibold dark:text-white">Agent #11.5: Component Watcher</h3>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      Monitors file changes and triggers agents
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => watcherMutation.mutate('start')}
                      variant="outline"
                      size="sm"
                      disabled={watcherMutation.isPending}
                      data-testid="button-watcher-start"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                    <Button
                      onClick={() => watcherMutation.mutate('stop')}
                      variant="outline"
                      size="sm"
                      disabled={watcherMutation.isPending}
                      data-testid="button-watcher-stop"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('Agent Performance')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Agent performance metrics would go here */}
                  <p className="text-sm text-muted-foreground">
                    Detailed agent performance metrics coming soon...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedules Tab */}
          <TabsContent value="schedules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('Agent Schedules')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {schedules && schedules.length > 0 ? (
                    <div className="space-y-2">
                      {schedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700"
                          data-testid={`schedule-${schedule.agentId}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium dark:text-white">{schedule.agentName}</h4>
                              <Badge
                                variant={schedule.status === 'active' ? 'default' : 'secondary'}
                                data-testid={`status-${schedule.agentId}`}
                              >
                                {schedule.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">
                              Schedule: {schedule.schedule}
                            </p>
                            <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                              <span>Runs: {schedule.runCount}</span>
                              <span>Success: {schedule.successCount}</span>
                              <span>Failed: {schedule.failCount}</span>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            {schedule.nextRun && (
                              <p className="text-muted-foreground dark:text-gray-400">
                                Next: {format(new Date(schedule.nextRun), 'MMM d, h:mm a')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No schedules configured yet
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
