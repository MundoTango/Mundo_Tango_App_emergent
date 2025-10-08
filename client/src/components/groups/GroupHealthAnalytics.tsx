import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Activity, Users, MessageSquare, AlertCircle } from 'lucide-react';

interface GroupHealthMetrics {
  score: number;
  engagementScore: number;
  growthRate: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  postsPerDay: number;
  newMembersPerWeek: number;
}

interface GroupInsights {
  peakActivityTimes: Array<{ hour: number; count: number }>;
  topContributors: Array<{ userId: number; username: string; postCount: number }>;
  trends: {
    engagement: 'up' | 'down' | 'stable';
    growth: 'up' | 'down' | 'stable';
    activity: 'up' | 'down' | 'stable';
  };
}

interface GroupHealthAnalyticsProps {
  groupId: number;
}

export function GroupHealthAnalytics({ groupId }: GroupHealthAnalyticsProps) {
  const { data: healthMetrics, isLoading: healthLoading } = useQuery<GroupHealthMetrics>({
    queryKey: ['/api/groups', groupId, 'analytics/health']
  });

  const { data: insights, isLoading: insightsLoading } = useQuery<GroupInsights>({
    queryKey: ['/api/groups', groupId, 'analytics/insights']
  });

  if (healthLoading || insightsLoading) {
    return (
      <Card data-testid="card-analytics-loading">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!healthMetrics || !insights) {
    return (
      <Card data-testid="card-analytics-error">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <AlertCircle className="mr-2 h-5 w-5" />
            Unable to load analytics data
          </div>
        </CardContent>
      </Card>
    );
  }

  const sentimentColor = {
    positive: 'bg-green-500/10 text-green-700 dark:text-green-400',
    neutral: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    negative: 'bg-red-500/10 text-red-700 dark:text-red-400'
  };

  const sentimentIcon = {
    positive: <TrendingUp className="h-4 w-4" />,
    neutral: <Activity className="h-4 w-4" />,
    negative: <TrendingDown className="h-4 w-4" />
  };

  return (
    <div className="space-y-6" data-testid="container-group-analytics">
      <Card data-testid="card-health-overview">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Group Health Score
            <Badge 
              variant={healthMetrics.score >= 70 ? 'default' : healthMetrics.score >= 40 ? 'secondary' : 'destructive'}
              className="text-lg"
              data-testid="badge-health-score"
            >
              {healthMetrics.score}/100
            </Badge>
          </CardTitle>
          <CardDescription>
            Overall group vitality based on engagement, growth, and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2" data-testid="metric-engagement">
              <div className="text-sm text-muted-foreground">Engagement</div>
              <div className="text-2xl font-bold">{healthMetrics.engagementScore}/100</div>
              <div className="text-xs text-muted-foreground">
                {healthMetrics.postsPerDay.toFixed(1)} posts/day
              </div>
            </div>
            
            <div className="space-y-2" data-testid="metric-growth">
              <div className="text-sm text-muted-foreground">Growth Rate</div>
              <div className="text-2xl font-bold">{healthMetrics.growthRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">
                {healthMetrics.newMembersPerWeek.toFixed(1)} new/week
              </div>
            </div>
            
            <div className="space-y-2" data-testid="metric-sentiment">
              <div className="text-sm text-muted-foreground">Sentiment</div>
              <Badge className={sentimentColor[healthMetrics.sentiment]}>
                <span className="flex items-center gap-1">
                  {sentimentIcon[healthMetrics.sentiment]}
                  {healthMetrics.sentiment}
                </span>
              </Badge>
            </div>
            
            <div className="space-y-2" data-testid="metric-activity">
              <div className="text-sm text-muted-foreground">Activity Level</div>
              <div className="text-2xl font-bold">
                {healthMetrics.postsPerDay >= 5 ? 'High' : 
                 healthMetrics.postsPerDay >= 2 ? 'Medium' : 'Low'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="contributors" data-testid="tabs-analytics">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contributors" data-testid="tab-contributors">
            <Users className="h-4 w-4 mr-2" />
            Top Contributors
          </TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">
            <Activity className="h-4 w-4 mr-2" />
            Peak Times
          </TabsTrigger>
          <TabsTrigger value="trends" data-testid="tab-trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contributors" data-testid="content-contributors">
          <Card>
            <CardHeader>
              <CardTitle>Most Active Members</CardTitle>
              <CardDescription>Members contributing the most to group discussions (last 7 days)</CardDescription>
            </CardHeader>
            <CardContent>
              {insights.topContributors.length > 0 ? (
                <div className="space-y-4">
                  {insights.topContributors.map((contributor, index) => (
                    <div 
                      key={contributor.userId}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      data-testid={`contributor-${contributor.userId}`}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <div className="font-medium">{contributor.username}</div>
                          <div className="text-sm text-muted-foreground">
                            {contributor.postCount} {contributor.postCount === 1 ? 'post' : 'posts'}
                          </div>
                        </div>
                      </div>
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity to display
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" data-testid="content-activity">
          <Card>
            <CardHeader>
              <CardTitle>Peak Activity Times</CardTitle>
              <CardDescription>Hours with the most group activity (last 7 days)</CardDescription>
            </CardHeader>
            <CardContent>
              {insights.peakActivityTimes.length > 0 ? (
                <div className="space-y-3">
                  {insights.peakActivityTimes.map((time) => (
                    <div 
                      key={time.hour}
                      className="flex items-center gap-4"
                      data-testid={`peak-hour-${time.hour}`}
                    >
                      <div className="w-20 text-sm font-medium">
                        {time.hour.toString().padStart(2, '0')}:00
                      </div>
                      <div className="flex-1">
                        <div 
                          className="h-8 rounded bg-gradient-to-r from-turquoise via-dodgerblue to-cobalt flex items-center justify-end px-3 text-white text-sm font-medium"
                          style={{ 
                            width: `${Math.min(100, (time.count / Math.max(...insights.peakActivityTimes.map(t => t.count))) * 100)}%` 
                          }}
                        >
                          {time.count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No activity data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" data-testid="content-trends">
          <Card>
            <CardHeader>
              <CardTitle>Group Trends</CardTitle>
              <CardDescription>Recent patterns in group activity and growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50" data-testid="trend-engagement">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Engagement</div>
                      <div className="text-sm text-muted-foreground">Member participation</div>
                    </div>
                  </div>
                  <Badge variant={insights.trends.engagement === 'up' ? 'default' : insights.trends.engagement === 'down' ? 'destructive' : 'secondary'}>
                    {insights.trends.engagement === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : 
                     insights.trends.engagement === 'down' ? <TrendingDown className="h-4 w-4 mr-1" /> : 
                     <Activity className="h-4 w-4 mr-1" />}
                    {insights.trends.engagement}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50" data-testid="trend-growth">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Growth</div>
                      <div className="text-sm text-muted-foreground">New member acquisition</div>
                    </div>
                  </div>
                  <Badge variant={insights.trends.growth === 'up' ? 'default' : insights.trends.growth === 'down' ? 'destructive' : 'secondary'}>
                    {insights.trends.growth === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : 
                     insights.trends.growth === 'down' ? <TrendingDown className="h-4 w-4 mr-1" /> : 
                     <Activity className="h-4 w-4 mr-1" />}
                    {insights.trends.growth}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50" data-testid="trend-activity">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Activity</div>
                      <div className="text-sm text-muted-foreground">Overall group activity</div>
                    </div>
                  </div>
                  <Badge variant={insights.trends.activity === 'up' ? 'default' : insights.trends.activity === 'down' ? 'destructive' : 'secondary'}>
                    {insights.trends.activity === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : 
                     insights.trends.activity === 'down' ? <TrendingDown className="h-4 w-4 mr-1" /> : 
                     <Activity className="h-4 w-4 mr-1" />}
                    {insights.trends.activity}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
