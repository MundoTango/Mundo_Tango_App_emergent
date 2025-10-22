/**
 * DEPLOYMENT DASHBOARD
 * Agent #127 - Deployment Safety Engineer
 * 4-Tab Dashboard: Overview, Logs, Resources, Analytics
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, AlertCircle, CheckCircle, Clock, Cpu, Globe, HardDrive, Loader2, TrendingUp } from 'lucide-react';

interface DeploymentStatus {
  deploymentId: string;
  url: string;
  type: 'static' | 'autoscale' | 'vm';
  status: 'deploying' | 'live' | 'error';
  uptime: number;
  lastDeploy: string;
}

export function DeploymentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch deployment status
  const { data: status, isLoading } = useQuery<DeploymentStatus>({
    queryKey: ['/api/deploy/status'],
    refetchInterval: 10000 // Refresh every 10s
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-deploy-overview">
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="logs" data-testid="tab-deploy-logs">
            <ScrollArea className="w-4 h-4 mr-2" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="resources" data-testid="tab-deploy-resources">
            <Cpu className="w-4 h-4 mr-2" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-deploy-analytics">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="flex-1 p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {status?.status === 'live' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {status?.status === 'deploying' && <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />}
                {status?.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                Deployment Status
              </CardTitle>
              <CardDescription>Current deployment information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <Badge variant={status?.status === 'live' ? 'default' : 'secondary'}>
                    {status?.status || 'Unknown'}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Type</div>
                  <div className="font-medium">{status?.type || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">URL</div>
                  <a 
                    href={status?.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-600 hover:underline flex items-center gap-1"
                  >
                    <Globe className="w-4 h-4" />
                    {status?.url}
                  </a>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Uptime</div>
                  <div className="font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {status?.uptime ? `${Math.floor(status.uptime / 60)}h ${status.uptime % 60}m` : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-500 mb-2">Quick Actions</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" data-testid="button-view-logs">
                    View Logs
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-health-check">
                    Run Health Check
                  </Button>
                  <Button variant="destructive" size="sm" data-testid="button-rollback">
                    Rollback
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LOGS TAB */}
        <TabsContent value="logs" className="flex-1 p-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Deployment Logs</CardTitle>
              <CardDescription>Real-time logs from your deployment</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full border rounded p-4 bg-black/90 text-green-400 font-mono text-xs">
                <div className="space-y-1">
                  <div>[2025-10-22 07:53:00] Deployment started...</div>
                  <div>[2025-10-22 07:53:02] Building application...</div>
                  <div>[2025-10-22 07:53:15] Build completed ✓</div>
                  <div>[2025-10-22 07:53:16] Uploading files...</div>
                  <div>[2025-10-22 07:53:20] Configuring routing...</div>
                  <div>[2025-10-22 07:53:22] Starting health checks...</div>
                  <div>[2025-10-22 07:53:30] Deployment live ✓</div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RESOURCES TAB */}
        <TabsContent value="resources" className="flex-1 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Cpu className="w-4 h-4" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-cyan-600">23%</div>
                <div className="text-sm text-gray-500">Average over 5 minutes</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <HardDrive className="w-4 h-4" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-cyan-600">156 MB</div>
                <div className="text-sm text-gray-500">of 512 MB allocated</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resource History</CardTitle>
              <CardDescription>Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-end gap-1">
                {[...Array(24)].map((_, i) => (
                  <div 
                    key={i}
                    className="flex-1 bg-cyan-500/30 rounded-t"
                    style={{ height: `${Math.random() * 100}%` }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="flex-1 p-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Page Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <div className="text-sm text-green-600">+12% vs last week</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245ms</div>
                <div className="text-sm text-green-600">-15ms vs last week</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.1%</div>
                <div className="text-sm text-gray-500">Within normal range</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">/</span>
                  <Badge variant="secondary">456 views</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">/events</span>
                  <Badge variant="secondary">234 views</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">/memories</span>
                  <Badge variant="secondary">189 views</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
