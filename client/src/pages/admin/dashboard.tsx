// ESA LIFE CEO 61x21 - Phase 19: Admin Dashboard Overview
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  TrendingUp,
  Activity,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Heart,
  Image,
  Video,
  FileText,
  Shield,
  Zap,
  Globe,
  Server,
  Database,
  Brain,
  Layers,
  BarChart3,
  Flag,
  UserPlus,
  CreditCard,
  Mail,
  Bell,
  Settings,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  GitBranch,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Helmet } from 'react-helmet';

// Dashboard data types
interface DashboardStats {
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
  content: {
    posts: number;
    comments: number;
    likes: number;
    shares: number;
  };
  events: {
    total: number;
    upcoming: number;
    rsvps: number;
    attendance: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    growth: number;
    churn: number;
  };
  system: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    queueSize: number;
  };
  agents: {
    active: number;
    tasks: number;
    performance: number;
    errors: number;
  };
}

interface ActivityItem {
  id: number;
  type: string;
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}

export default function AdminDashboardPage() {
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Fetch dashboard statistics
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['/api/admin/dashboard/stats'],
    refetchInterval: refreshInterval,
  });

  // Fetch activity feed
  const { data: activity } = useQuery({
    queryKey: ['/api/admin/dashboard/activity'],
    refetchInterval: 10000, // 10 seconds
  });

  // Fetch chart data
  const { data: chartData } = useQuery({
    queryKey: ['/api/admin/dashboard/charts'],
  });

  // Mock data for demonstration
  const userGrowthData = chartData?.userGrowth || [
    { name: 'Jan', users: 1200 },
    { name: 'Feb', users: 1400 },
    { name: 'Mar', users: 1650 },
    { name: 'Apr', users: 1900 },
    { name: 'May', users: 2200 },
    { name: 'Jun', users: 2500 },
  ];

  const revenueData = chartData?.revenue || [
    { name: 'Basic', value: 35, color: '#5EEAD4' },
    { name: 'Enthusiast', value: 25, color: '#14B8A6' },
    { name: 'Professional', value: 30, color: '#0D9488' },
    { name: 'Enterprise', value: 10, color: '#155E75' },
  ];

  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      user: UserPlus,
      post: FileText,
      comment: MessageSquare,
      like: Heart,
      event: Calendar,
      payment: CreditCard,
      moderation: Shield,
      system: Settings,
    };
    const Icon = icons[type] || Activity;
    return <Icon className="w-4 h-4" />;
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      user: 'text-blue-600',
      post: 'text-green-600',
      comment: 'text-purple-600',
      like: 'text-red-600',
      event: 'text-orange-600',
      payment: 'text-emerald-600',
      moderation: 'text-yellow-600',
      system: 'text-gray-600',
    };
    return colors[type] || 'text-gray-600';
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | Life CEO</title>
      </Helmet>
      
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 text-transparent bg-clip-text">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1 dark:text-neutral-600 dark:text-neutral-400">
              Platform overview and real-time monitoring
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1">
              <Clock className="w-3 h-3 mr-1" />
              Last updated: {format(new Date(), 'h:mm a')}
            </Badge>
            <Button 
              variant="outline" 
              onClick={() => refetchStats()}
              data-testid="refresh-dashboard"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <Card className="border-teal-100 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-neutral-600 dark:text-neutral-400">
                  Total Users
                </CardTitle>
                <Users className="w-4 h-4 text-ocean-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-neutral-100">
                {stats?.users?.total?.toLocaleString() || '0'}
              </div>
              <div className="flex items-center mt-2 text-sm">
                {stats?.users?.growth > 0 ? (
                  <>
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">
                      +{stats.users.growth}% this month
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-red-600">
                      {stats?.users?.growth}% this month
                    </span>
                  </>
                )}
              </div>
              <Progress 
                value={stats?.users?.active / stats?.users?.total * 100 || 0} 
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                {stats?.users?.active?.toLocaleString() || '0'} active users
              </p>
            </CardContent>
          </Card>

          {/* Monthly Revenue */}
          <Card className="border-cyan-100 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-neutral-600 dark:text-neutral-400">
                  Monthly Revenue
                </CardTitle>
                <DollarSign className="w-4 h-4 text-ocean-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-neutral-100">
                ${stats?.revenue?.mrr?.toLocaleString() || '0'}
              </div>
              <div className="flex items-center mt-2 text-sm">
                {stats?.revenue?.growth > 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">
                      +{stats.revenue.growth}% growth
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-red-600">
                      {stats?.revenue?.growth}% decline
                    </span>
                  </>
                )}
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">ARR</span>
                  <span className="font-medium">
                    ${stats?.revenue?.arr?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Churn</span>
                  <span className="font-medium text-orange-600">
                    {stats?.revenue?.churn || '0'}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Activity */}
          <Card className="border-purple-100 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-neutral-600 dark:text-neutral-400">
                  Content Activity
                </CardTitle>
                <Activity className="w-4 h-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-neutral-100">
                {stats?.content?.posts?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-500">posts today</div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center">
                  <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400 mx-auto" />
                  <p className="text-xs font-medium mt-1">
                    {stats?.content?.comments || '0'}
                  </p>
                </div>
                <div className="text-center">
                  <Heart className="w-4 h-4 text-gray-600 dark:text-gray-400 mx-auto" />
                  <p className="text-xs font-medium mt-1">
                    {stats?.content?.likes || '0'}
                  </p>
                </div>
                <div className="text-center">
                  <Image className="w-4 h-4 text-gray-600 dark:text-gray-400 mx-auto" />
                  <p className="text-xs font-medium mt-1">
                    {stats?.content?.shares || '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="border-green-100 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-neutral-600 dark:text-neutral-400">
                  System Health
                </CardTitle>
                <Monitor className="w-4 h-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-neutral-100">
                {stats?.system?.uptime || '99.9'}%
              </div>
              <div className="text-sm text-gray-500">uptime</div>
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Response</span>
                  <Badge variant="outline" className="text-green-600">
                    {stats?.system?.responseTime || '45'}ms
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Errors</span>
                  <Badge variant="outline" className="text-orange-600">
                    {stats?.system?.errorRate || '0.1'}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Queue</span>
                  <Badge variant="outline">
                    {stats?.system?.queueSize || '0'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Growth</CardTitle>
                <Badge variant="outline">Last 6 months</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5EEAD4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#5EEAD4" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#14B8A6" 
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Distribution */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Revenue by Tier</CardTitle>
                <Badge variant="outline">Current month</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={revenueData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed and Agent Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-time Activity Feed */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Real-time Activity</CardTitle>
                <Badge className="bg-green-500">
                  <span className="animate-pulse mr-1">●</span>
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {activity?.items?.map((item: ActivityItem) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors dark:bg-neutral-800"
                      data-testid={`activity-${item.id}`}
                    >
                      <div className={cn(
                        "p-2 rounded-full bg-opacity-10",
                        getActivityColor(item.type)
                      )}>
                        {getActivityIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm">
                            <span className="font-medium">{item.user}</span>
                            <span className="text-gray-600 ml-1 dark:text-neutral-600 dark:text-neutral-400">{item.action}</span>
                          </p>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {format(new Date(item.timestamp), 'h:mm a')}
                          </span>
                        </div>
                        {item.details && (
                          <p className="text-xs text-gray-500 mt-1">{item.details}</p>
                        )}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      No recent activity
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Agent Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>ESA Agents</CardTitle>
                <Brain className="w-4 h-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-neutral-600 dark:text-neutral-400">Active Agents</span>
                <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500">
                  {stats?.agents?.active || 61}/61
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-neutral-600 dark:text-neutral-400">Tasks Processed</span>
                  <span className="font-medium">{stats?.agents?.tasks || '1,234'}</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-neutral-600 dark:text-neutral-400">Performance</span>
                  <span className="font-medium text-green-600">
                    {stats?.agents?.performance || 95}%
                  </span>
                </div>
                <Progress value={stats?.agents?.performance || 95} className="h-2" />
              </div>

              <div className="pt-3 border-t">
                <div className="space-y-2">
                  {['Layer 1-10', 'Layer 11-20', 'Layer 21-30', 'Layer 31-40', 'Layer 41-50', 'Layer 51-61'].map((layer, idx) => (
                    <div key={layer} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{layer}</span>
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
                size="sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Agents
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col">
                <Mail className="w-5 h-5 mb-2 text-teal-600" />
                <span className="text-xs">Send Announcement</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col">
                <Shield className="w-5 h-5 mb-2 text-cyan-600" />
                <span className="text-xs">Moderation Queue</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col">
                <Database className="w-5 h-5 mb-2 text-purple-600" />
                <span className="text-xs">Database Backup</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col">
                <BarChart3 className="w-5 h-5 mb-2 text-orange-600" />
                <span className="text-xs">Export Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  
    </>
  );
}