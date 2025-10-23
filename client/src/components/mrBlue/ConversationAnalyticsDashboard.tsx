/**
 * TRACK C: Conversation Analytics Dashboard
 * MB.MD SIMULTANEOUS BUILD - Oct 23, 2025
 * Agent #126 (UI)
 * 
 * Visual analytics with charts and metrics
 */

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Mic,
  Coins,
  Clock,
  Zap,
  Globe,
} from 'lucide-react';

interface AnalyticsSummary {
  overview: {
    totalProjects: number;
    totalMessages: number;
    totalVoiceTurns: number;
    totalTokens: number;
    totalCost: number;
  };
  models: {
    name: string;
    count: number;
    percentage: number;
  }[];
  activity: {
    date: string;
    messages: number;
    voiceTurns: number;
  }[];
  topProjects: {
    id: number;
    name: string;
    messageCount: number;
    lastActivity: Date;
  }[];
  languages: {
    code: string;
    count: number;
    percentage: number;
  }[];
  toolUsage: {
    tool: string;
    count: number;
  }[];
}

interface ConversationAnalyticsDashboardProps {
  days?: number;
}

export function ConversationAnalyticsDashboard({ days = 30 }: ConversationAnalyticsDashboardProps) {
  const { data: analytics, isLoading } = useQuery<AnalyticsSummary>({
    queryKey: ['/api/conversations/analytics', { days }],
  });

  if (isLoading) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (!analytics) {
    return (
      <div className="p-6 text-center text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-500" />
          Conversation Analytics
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Last {days} days of activity
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          icon={MessageSquare}
          label="Total Messages"
          value={analytics.overview.totalMessages.toLocaleString()}
          color="blue"
          data-testid="metric-total-messages"
        />
        <MetricCard
          icon={Mic}
          label="Voice Turns"
          value={analytics.overview.totalVoiceTurns.toLocaleString()}
          color="purple"
          data-testid="metric-total-voice"
        />
        <MetricCard
          icon={TrendingUp}
          label="Projects"
          value={analytics.overview.totalProjects.toLocaleString()}
          color="green"
          data-testid="metric-total-projects"
        />
        <MetricCard
          icon={Zap}
          label="Tokens Used"
          value={formatNumber(analytics.overview.totalTokens)}
          color="yellow"
          data-testid="metric-total-tokens"
        />
        <MetricCard
          icon={Coins}
          label="Total Cost"
          value={`$${analytics.overview.totalCost.toFixed(2)}`}
          color="orange"
          data-testid="metric-total-cost"
        />
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models" data-testid="tab-models">
            <Zap className="w-4 h-4 mr-2" />
            Models
          </TabsTrigger>
          <TabsTrigger value="projects" data-testid="tab-projects">
            <TrendingUp className="w-4 h-4 mr-2" />
            Top Projects
          </TabsTrigger>
          <TabsTrigger value="languages" data-testid="tab-languages">
            <Globe className="w-4 h-4 mr-2" />
            Languages
          </TabsTrigger>
        </TabsList>

        {/* Model Usage */}
        <TabsContent value="models" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Model Distribution</h3>
            
            {analytics.models.length === 0 ? (
              <p className="text-sm text-gray-500">No model data available</p>
            ) : (
              <div className="space-y-3">
                {analytics.models.map((model) => (
                  <div key={model.name} className="space-y-1" data-testid={`model-${model.name}`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {model.count} ({model.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${model.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Top Projects */}
        <TabsContent value="projects" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Most Active Projects</h3>
            
            {analytics.topProjects.length === 0 ? (
              <p className="text-sm text-gray-500">No project data available</p>
            ) : (
              <div className="space-y-3">
                {analytics.topProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    data-testid={`top-project-${project.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-semibold">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-xs text-gray-500">
                          Last active: {new Date(project.lastActivity).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{project.messageCount}</div>
                      <div className="text-xs text-gray-500">messages</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Languages */}
        <TabsContent value="languages" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Language Distribution</h3>
            
            {analytics.languages.length === 0 ? (
              <p className="text-sm text-gray-500">No language data available</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {analytics.languages.map((lang) => (
                  <div
                    key={lang.code}
                    className="p-4 border rounded-lg text-center"
                    data-testid={`language-${lang.code}`}
                  >
                    <div className="text-2xl mb-2">
                      {getLanguageFlag(lang.code)}
                    </div>
                    <div className="font-semibold text-lg">{lang.code.toUpperCase()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {lang.count} turns ({lang.percentage.toFixed(1)}%)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MetricCardProps {
  icon: any;
  label: string;
  value: string;
  color: 'blue' | 'purple' | 'green' | 'yellow' | 'orange';
  'data-testid'?: string;
}

function MetricCard({ icon: Icon, label, value, color, 'data-testid': testId }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    green: 'bg-green-500/10 text-green-700 dark:text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    orange: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  };

  return (
    <Card className="p-4" data-testid={testId}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

function getLanguageFlag(code: string): string {
  const flags: Record<string, string> = {
    en: '🇺🇸',
    es: '🇪🇸',
    fr: '🇫🇷',
    de: '🇩🇪',
    it: '🇮🇹',
    pt: '🇵🇹',
    ru: '🇷🇺',
    zh: '🇨🇳',
    ja: '🇯🇵',
    ko: '🇰🇷',
  };
  return flags[code] || '🌍';
}
