import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Star, RefreshCw, UserPlus, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export default function RecommendedGroups() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showAll, setShowAll] = useState(false);
  
  const { data: recommendations = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/groups/recommendations'],
    queryFn: async () => {
      const response = await fetch('/api/groups/recommendations', {
        credentials: 'include'
      });
      const data = await response.json();
      return data.success ? data.data : [];
    }
  });
  
  const joinGroupMutation = useMutation({
    mutationFn: async (slug: string) => {
      const response = await fetch(`/api/user/join-group/${slug}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to join group');
      return response.json();
    },
    onSuccess: (data, slug) => {
      toast({
        title: "Joined Community!",
        description: "You have successfully joined this community.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/groups/recommendations'] });
    }
  });
  
  const displayedRecommendations = showAll ? recommendations : recommendations.slice(0, 5);
  
  if (isLoading) {
    return (
      <Card className="mb-6" data-testid="recommended-groups-loading">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-[var(--color-neutral-100)] rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (recommendations.length === 0) {
    return null;
  }
  
  return (
    <Card className="mb-6" data-testid="recommended-groups-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Recommended for You
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            data-testid="button-refresh-recommendations"
            aria-label="Refresh recommendations"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedRecommendations.map((group: any) => (
            <div
              key={group.id}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors"
              data-testid={`recommended-group-${group.id}`}
              role="article"
              aria-labelledby={`rec-group-name-${group.id}`}
            >
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => setLocation(`/groups/${group.slug} aria-label="Button"`)}
                  className="text-left w-full"
                  data-testid={`link-group-${group.id}`}
                >
                  <h4 id={`rec-group-name-${group.id}`} className="font-semibold text-lg mb-1 hover:text-blue-600">
                    {group.name}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{group.city}, {group.country}</span>
                    <Users className="h-4 w-4 ml-2" />
                    <span aria-label={`${group.memberCount} members in this group`}>
                      {group.memberCount} members
                    </span>
                  </div>
                  {group.reason && (
                    <Badge variant="outline" className="text-xs" data-testid={`reason-${group.id}`}>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {group.reason}
                    </Badge>
                  )}
                </button>
              </div>
              <Button
                onClick={() => joinGroupMutation.mutate(group.slug)}
                disabled={joinGroupMutation.isPending}
                size="sm"
                data-testid={`button-join-${group.id}`}
                aria-label={`Join ${group.name} group`}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Join
              </Button>
            </div>
          ))}
        </div>
        
        {recommendations.length > 5 && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => setShowAll(!showAll)}
            data-testid="button-see-more"
            aria-label={showAll ? "Show fewer recommendations" : "Show more recommendations"}
          >
            {showAll ? 'Show Less' : `See ${recommendations.length - 5} More`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
