// Mundo Tango ESA LIFE CEO - Phase 19: Analytics Dashboard
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  DollarSign,
  Globe,
  Smartphone,
  Monitor,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Hash,
  MessageSquare,
  Heart,
  Share2,
  Eye,
  Clock,
  MapPin,
  CreditCard,
  UserCheck,
  UserX,
  ArrowUp,
  ArrowDown,
  Layers
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface AnalyticsData {
  userMetrics: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    retention: number;
    churnRate: number;
    growthRate: number;
  };
  engagementMetrics: {
    avgSessionDuration: string;
    pagesPerSession: number;
    bounceRate: number;
    engagementRate: number;
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
  };
  contentMetrics: {
    totalPosts: number;
    postsPerUser: number;
    avgLikesPerPost: number;
    avgCommentsPerPost: number;
    topHashtags: Array<{ tag: string; count: number }>;
    contentTypes: Array<{ type: string; count: number; percentage: number }>;
  };
  revenueMetrics: {
    mrr: number;
    arr: number;
    avgRevenuePerUser: number;
    lifetimeValue: number;
    conversionRate: number;
    churnRate: number;
    subscriptionsByTier: Array<{ tier: string; count: number; revenue: number }>;
  };
  demographicData: {
    byCountry: Array<{ country: string; users: number; percentage: number }>;
    byCity: Array<{ city: string; users: number }>;
    byAge: Array<{ range: string; count: number }>;
    byGender: Array<{ gender: string; count: number }>;
    byLanguage: Array<{ language: string; count: number }>;
  };
  deviceData: {
    byDevice: Array<{ device: string; count: number; percentage: number }>;
    byBrowser: Array<{ browser: string; count: number; percentage: number }>;
    byOS: Array<{ os: string; count: number; percentage: number }>;
  };
}

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('users');

  // Fetch analytics data
  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/analytics', { dateRange }],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });

  // Mock data for demonstration
  const userGrowthData = [
    { date: 'Mon', users: 1200, sessions: 3400 },
    { date: 'Tue', users: 1350, sessions: 3800 },
    { date: 'Wed', users: 1400, sessions: 4200 },
    { date: 'Thu', users: 1600, sessions: 4600 },
    { date: 'Fri', users: 1750, sessions: 5200 },
    { date: 'Sat', users: 1900, sessions: 5800 },
    { date: 'Sun', users: 2100, sessions: 6400 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 12000, subscriptions: 240 },
    { month: 'Feb', revenue: 14500, subscriptions: 290 },
    { month: 'Mar', revenue: 16800, subscriptions: 336 },
    { month: 'Apr', revenue: 19200, subscriptions: 384 },
    { month: 'May', revenue: 22000, subscriptions: 440 },
    { month: 'Jun', revenue: 25500, subscriptions: 510 },
  ];

  const engagementData = [
    { name: 'Posts', value: 35, fullMark: 100 },
    { name: 'Comments', value: 65, fullMark: 100 },
    { name: 'Likes', value: 80, fullMark: 100 },
    { name: 'Shares', value: 45, fullMark: 100 },
    { name: 'Views', value: 90, fullMark: 100 },
  ];

  const deviceData = [
    { name: 'Mobile', value: 55, color: '#5EEAD4' },
    { name: 'Desktop', value: 35, color: '#14B8A6' },
    { name: 'Tablet', value: 10, color: '#0D9488' },
  ];

  const topCountries = [
    { country: 'Argentina', users: 4500, color: '#5EEAD4' },
    { country: 'USA', users: 3200, color: '#14B8A6' },
    { country: 'Spain', users: 2800, color: '#0D9488' },
    { country: 'France', users: 2100, color: '#155E75' },
    { country: 'Italy', users: 1800, color: '#06B6D4' },
  ];

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    value: string | number; 
    change?: number; 
    icon: any; 
    color: string;
  }) => (
    <Card className={cn("border-l-4", color)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        {change !== undefined && (
          <div className="flex items-center mt-2 text-sm">
            {change > 0 ? (
              <>
                <ArrowUp className="w-4 h-4 text-green-500 dark:text-green-400 mr-1" />
                <span className="text-green-600">+{change}%</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-4 h-4 text-red-500 dark:text-red-400 mr-1" />
                <span className="text-red-600">{change}%</span>
              </>
            )}
            <span className="text-gray-500 dark:text-gray-400 ml-1">{t('common.vs_last_period')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 text-transparent bg-clip-text">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Comprehensive platform insights and metrics
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40" data-testid="date-range-selector">
                <SelectValue placeholder={t('common.inputs.select_range')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">{t('common.last_24_hours')}</SelectItem>
                <SelectItem value="7d">{t('common.last_7_days')}</SelectItem>
                <SelectItem value="30d">{t('common.last_30_days')}</SelectItem>
                <SelectItem value="90d">{t('common.last_90_days')}</SelectItem>
                <SelectItem value="1y">{t('common.last_year')}</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Users"
            value={analytics?.userMetrics?.totalUsers?.toLocaleString() || '0'}
            change={analytics?.userMetrics?.growthRate}
            icon={Users}
            color="border-teal-500"
          />
          <MetricCard
            title="Monthly Revenue"
            value={`$${analytics?.revenueMetrics?.mrr?.toLocaleString() || '0'}`}
            change={12.5}
            icon={DollarSign}
            color="border-cyan-500"
          />
          <MetricCard
            title="Active Users"
            value={analytics?.engagementMetrics?.monthlyActiveUsers?.toLocaleString() || '0'}
            change={8.3}
            icon={Activity}
            color="border-purple-500"
          />
          <MetricCard
            title="Engagement Rate"
            value={`${analytics?.engagementMetrics?.engagementRate || 0}%`}
            change={-2.1}
            icon={Heart}
            color="border-pink-500"
          />
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">{t('common.users')}</TabsTrigger>
            <TabsTrigger value="engagement">{t('common.engagement')}</TabsTrigger>
            <TabsTrigger value="content">{t('common.content')}</TabsTrigger>
            <TabsTrigger value="revenue">{t('common.revenue')}</TabsTrigger>
            <TabsTrigger value="demographics">{t('common.demographics')}</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('common.user_growth_trend')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={userGrowthData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5EEAD4" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#5EEAD4" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="users" stroke="#14B8A6" fillOpacity={1} fill="url(#colorUsers)" />
                      <Area type="monotone" dataKey="sessions" stroke="#06B6D4" fillOpacity={1} fill="url(#colorSessions)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* User Retention */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('common.user_retention_cohort')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, idx) => {
                      const retention = 100 - (idx * 15);
                      return (
                        <div key={week} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{week}</span>
                            <span className="font-medium">{retention}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full"
                              style={{ width: `${retention}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                    <div>
                      <p className="text-sm text-gray-600">{t('common.avg_retention')}</p>
                      <p className="text-xl font-bold text-teal-600">{t('common.625')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('common.churn_rate')}</p>
                      <p className="text-xl font-bold text-red-600">{t('common.375')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Radar */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('common.engagement_metrics')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={engagementData}>
                      <PolarGrid stroke="#e0e0e0" />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Engagement" dataKey="value" stroke="#14B8A6" fill="#5EEAD4" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Session Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('common.session_analytics')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">{t('common.avg_session_duration')}</p>
                      <p className="text-2xl font-bold">{t('common.5m_32s')}</p>
                      <Badge variant="outline" className="text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +12%
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">{t('common.pages_per_session')}</p>
                      <p className="text-2xl font-bold">4.2</p>
                      <Badge variant="outline" className="text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +8%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{t('common.active_users')}</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t('common.daily_dau')}</span>
                        <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500">
                          {analytics?.engagementMetrics?.dailyActiveUsers?.toLocaleString() || '1,234'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t('common.weekly_wau')}</span>
                        <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500">
                          {analytics?.engagementMetrics?.weeklyActiveUsers?.toLocaleString() || '5,678'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t('common.monthly_mau')}</span>
                        <Badge className="bg-gradient-to-r from-blue-500 dark:from-blue-600 to-purple-500">
                          {analytics?.engagementMetrics?.monthlyActiveUsers?.toLocaleString() || '12,345'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Content Types */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('common.content_distribution')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Posts', value: 45, color: '#5EEAD4' },
                          { name: 'Comments', value: 30, color: '#14B8A6' },
                          { name: 'Photos', value: 15, color: '#0D9488' },
                          { name: 'Videos', value: 10, color: '#155E75' },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Hashtags */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('common.trending_hashtags')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['#tango', '#milonga', '#buenosaires', '#tangoargentino', '#tangodance'].map((tag, idx) => (
                      <div key={tag} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-teal-500" />
                          <span className="text-sm font-medium">{tag}</span>
                        </div>
                        <Badge variant="outline">
                          {(1000 - idx * 150).toLocaleString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Content Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('common.engagement_metrics')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('common.avg_likes_per_post')}</span>
                      <span className="font-bold">24.5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('common.avg_comments_per_post')}</span>
                      <span className="font-bold">8.3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('common.avg_shares_per_post')}</span>
                      <span className="font-bold">3.7</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('common.posts_per_user')}</span>
                      <span className="font-bold">2.1</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t('common.top_performing_post')}</p>
                    <div className="p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg">
                      <p className="text-sm font-medium text-teal-700">
                        "First milonga after lockdown..."
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-teal-600">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> 12.5k
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> 856
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> 234
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('common.revenue_growth')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#14B8A6" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="subscriptions" stroke="#06B6D4" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Subscription Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('common.subscription_tiers')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { tier: 'Free', users: 450, revenue: 0, color: 'bg-gray-500' },
                      { tier: 'Basic', users: 320, revenue: 3200, color: 'bg-blue-500' },
                      { tier: 'Enthusiast', users: 180, revenue: 5400, color: 'bg-purple-500' },
                      { tier: 'Professional', users: 120, revenue: 7200, color: 'bg-amber-500' },
                      { tier: 'Enterprise', users: 30, revenue: 6000, color: 'bg-red-500' },
                    ].map((tier) => (
                      <div key={tier.tier} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full", tier.color)} />
                            <span className="font-medium">{tier.tier}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${tier.revenue.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{tier.users} users</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={cn("h-2 rounded-full", tier.color)}
                            style={{ width: `${(tier.users / 1100) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">{t('common.mrr')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{t('common.21800')}</p>
                  <Badge variant="outline" className="mt-2 text-green-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15.3%
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">{t('common.arr')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{t('common.261600')}</p>
                  <Badge variant="outline" className="mt-2 text-green-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +18.7%
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">{t('common.arpu')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{t('common.1982')}</p>
                  <Badge variant="outline" className="mt-2 text-orange-600">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -2.1%
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">{t('common.ltv')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{t('common.23784')}</p>
                  <Badge variant="outline" className="mt-2 text-green-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +5.6%
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Demographics Tab */}
          <TabsContent value="demographics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Geographic Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('common.top_countries')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topCountries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="country" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="#14B8A6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Device Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('common.device_usage')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Demographics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Age Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('common.age_groups')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {['18-24', '25-34', '35-44', '45-54', '55+'].map((age, idx) => (
                    <div key={age} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{age}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: `${80 - idx * 15}%` }}
                          />
                        </div>
                        <span className="font-medium text-xs w-10 text-right">
                          {80 - idx * 15}%
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Language Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('common.languages')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { lang: 'Spanish', pct: 45 },
                    { lang: 'English', pct: 35 },
                    { lang: 'French', pct: 10 },
                    { lang: 'Italian', pct: 7 },
                    { lang: 'Portuguese', pct: 3 },
                  ].map((item) => (
                    <div key={item.lang} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{item.lang}</span>
                      <Badge variant="outline">{item.pct}%</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Gender Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('common.gender')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('common.female')}</span>
                      <span className="font-bold">{t('common.52')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('common.male')}</span>
                      <span className="font-bold">{t('common.46')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('common.other')}</span>
                      <span className="font-bold">{t('common.2')}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex h-4 rounded-full overflow-hidden">
                      <div className="bg-pink-500" style={{ width: '52%' }} />
                      <div className="bg-blue-500" style={{ width: '46%' }} />
                      <div className="bg-purple-500" style={{ width: '2%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}