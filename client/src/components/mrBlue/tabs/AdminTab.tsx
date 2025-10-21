/**
 * Admin Tab - System health and agent management (admin only)
 * MB.MD Phase 3Q - Oct 21, 2025
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, Activity, Database, Server, Users, 
  AlertCircle, CheckCircle, Clock, TrendingUp 
} from 'lucide-react';

export default function AdminTab() {
  const systemHealth = {
    status: 'healthy',
    uptime: '99.9%',
    responseTime: '130ms',
    activeUsers: 1247,
    totalAgents: 350,
    certifiedAgents: 23,
  };

  const apiEndpoints = [
    { name: '/api/mrblue/conversations', status: 'operational', latency: '120ms' },
    { name: '/api/learning/*', status: 'operational', latency: '95ms' },
    { name: '/api/events/*', status: 'operational', latency: '145ms' },
    { name: '/api/groups/*', status: 'operational', latency: '110ms' },
  ];

  const recentActivity = [
    { time: '2 min ago', event: 'Agent #80 completed learning session', type: 'success' },
    { time: '5 min ago', event: 'New conversation created', type: 'info' },
    { time: '12 min ago', event: 'Agent CEO routed 15 intents', type: 'info' },
    { time: '20 min ago', event: 'Quality score updated: 95/100', type: 'success' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            System Administration
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Platform health, agent status, and deployment controls
          </p>
        </div>
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          All Systems Operational
        </Badge>
      </div>

      {/* System Health Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-5 w-5 text-green-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemHealth.uptime}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-cyan-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemHealth.responseTime}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-blue-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemHealth.activeUsers}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-5 w-5 text-purple-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Agents</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemHealth.totalAgents}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Certified Agents</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemHealth.certifiedAgents}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-teal-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Quality Score</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">95/100</p>
        </Card>
      </div>

      {/* API Endpoints Status */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Server className="h-6 w-6 text-cyan-500" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">API Endpoints</h4>
        </div>
        
        <div className="space-y-3">
          {apiEndpoints.map((endpoint, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              data-testid={`endpoint-${i}`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <code className="text-sm font-mono text-gray-900 dark:text-white">{endpoint.name}</code>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{endpoint.latency}</Badge>
                <Badge className="bg-green-500">{endpoint.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="h-6 w-6 text-cyan-500" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h4>
        </div>
        
        <div className="space-y-3">
          {recentActivity.map((activity, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              data-testid={`activity-${i}`}
            >
              {activity.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">{activity.event}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Admin Actions */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6 text-cyan-500" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Actions</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" data-testid="button-view-logs">
            <Database className="h-4 w-4 mr-2" />
            View System Logs
          </Button>
          <Button variant="outline" data-testid="button-manage-agents">
            <Users className="h-4 w-4 mr-2" />
            Manage Agents
          </Button>
          <Button variant="outline" data-testid="button-learning-analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Learning Analytics
          </Button>
          <Button variant="outline" data-testid="button-deploy-controls">
            <Server className="h-4 w-4 mr-2" />
            Deployment Controls
          </Button>
        </div>
      </Card>
    </div>
  );
}
