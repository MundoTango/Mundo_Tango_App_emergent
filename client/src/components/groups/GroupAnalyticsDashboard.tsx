import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Users, MessageCircle, Clock, User } from 'lucide-react';

interface GroupAnalyticsDashboardProps {
  groupId: number;
}

export default function GroupAnalyticsDashboard({ groupId }: GroupAnalyticsDashboardProps) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: [`/api/groups/${groupId}/analytics`],
    queryFn: async () => {
      const response = await fetch(`/api/groups/${groupId}/analytics`, {
        credentials: 'include'
      });
      const data = await response.json();
      return data.success ? data.data : null;
    }
  });
  
  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="analytics-loading">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }
  
  if (!analytics) {
    return (
      <div className="text-center py-12 text-gray-500">
        Unable to load analytics data
      </div>
    );
  }
  
  const health = analytics.health;
  const insights = analytics.insights;
  
  const getHealthColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };
  
  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === 'positive') return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (sentiment === 'negative') return <TrendingDown className="h-5 w-5 text-red-600" />;
    return <Activity className="h-5 w-5 text-gray-600" />;
  };
  
  return (
    <div className="space-y-6" data-testid="analytics-dashboard">
      <Card data-testid="health-score-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Group Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full text-4xl font-bold ${getHealthColor(health.score)}`}
                 aria-label={`Health score: ${health.score} out of 100`}>
              {health.score}
              <span className="text-2xl">/100</span>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              {getSentimentIcon(health.sentiment)}
              <span className="capitalize font-medium">{health.sentiment} Trend</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="engagement-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">Posts per Day</div>
                <div className="text-2xl font-bold">{health.postsPerDay.toFixed(1)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="growth-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-sm text-gray-600">New Members/Week</div>
                <div className="text-2xl font-bold">{health.newMembersPerWeek}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="engagement-score-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-sm text-gray-600">Engagement Score</div>
                <div className="text-2xl font-bold">{health.engagementScore}/100</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card data-testid="peak-activity-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Peak Activity Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {insights.peakActivityTimes.length > 0 ? (
              insights.peakActivityTimes.map((time: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                     data-testid={`peak-time-${index}`}>
                  <span className="font-medium">
                    {time.hour}:00 - {time.hour + 1}:00
                  </span>
                  <Badge variant="secondary">{time.count} posts</Badge>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">No activity data yet</div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card data-testid="top-contributors-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {insights.topContributors.length > 0 ? (
              insights.topContributors.map((contributor: any, index: number) => (
                <div key={contributor.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                     data-testid={`contributor-${contributor.userId}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">@{contributor.username}</span>
                  </div>
                  <Badge variant="secondary">{contributor.postCount} posts</Badge>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">No contributors yet</div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {insights.trendingTopics.length > 0 && (
        <Card data-testid="trending-topics-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trending Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights.trendingTopics.map((topic: string, index: number) => (
                <Badge key={index} variant="outline" className="text-sm capitalize"
                       data-testid={`topic-${index}`}>
                  #{topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
