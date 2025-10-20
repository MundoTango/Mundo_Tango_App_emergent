/**
 * Mundo Tango - Recommendation Widget
 * MB.MD TRACK 4: Home Page Recommendations Integration
 * Created: October 20, 2025
 * 
 * Features:
 * - Personalized recommendations from ML engine
 * - Multi-context support (events, users, groups)
 * - Aurora Tide design system
 * - Click tracking for algorithm improvement
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Users, MapPin, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

interface RecommendationWidgetProps {
  context: 'home_feed' | 'events' | 'users' | 'groups' | 'discover';
  limit?: number;
  className?: string;
}

interface Recommendation {
  id: string;
  type: 'event' | 'user' | 'group' | 'post';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  score: number;
  reason: string;
  link: string;
}

export function RecommendationWidget({ 
  context, 
  limit = 5,
  className 
}: RecommendationWidgetProps) {
  
  // Fetch recommendations from ML engine (using standard query client pattern)
  const { data, isLoading, error } = useQuery<{ recommendations: Recommendation[] }>({
    queryKey: [`/api/recommendations/${context}`, { limit }],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Track recommendation clicks
  const { mutate: trackClick } = useMutation({
    mutationFn: async ({ targetId, targetType }: { targetId: string; targetType: string }) => {
      return apiRequest('/api/recommendations/track', {
        method: 'POST',
        body: {
          action: 'view',
          targetId,
          targetType,
        },
      });
    },
  });

  const handleRecommendationClick = (rec: Recommendation) => {
    trackClick({ 
      targetId: rec.id, 
      targetType: rec.type 
    });
    window.location.href = rec.link;
  };

  const recommendations: Recommendation[] = data?.recommendations || [];

  if (isLoading) {
    return (
      <Card className={cn(
        "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-cyan-200/30",
        className
      )}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-500" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return null; // Fail silently for recommendations (non-critical feature)
  }

  if (!recommendations.length) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      case 'group': return <Users className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  return (
    <Card 
      className={cn(
        "bg-gradient-to-br from-white/95 to-cyan-50/95 dark:from-gray-900/95 dark:to-cyan-900/20",
        "backdrop-blur-lg border border-cyan-200/50 dark:border-cyan-800/50 shadow-xl",
        className
      )}
      data-testid="widget-recommendations"
    >
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
          <TrendingUp className="h-5 w-5 text-cyan-500" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <button
              key={rec.id}
              onClick={() => handleRecommendationClick(rec)}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg transition-all",
                "hover:bg-cyan-100/40 dark:hover:bg-cyan-800/20",
                "border border-transparent hover:border-cyan-300/50 dark:hover:border-cyan-700/50",
                "text-left group"
              )}
              data-testid={`recommendation-${index}`}
            >
              {/* Icon/Avatar */}
              <Avatar className="h-12 w-12 border-2 border-cyan-400/50">
                {rec.imageUrl ? (
                  <AvatarImage src={rec.imageUrl} alt={rec.title} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-white">
                    {getIcon(rec.type)}
                  </AvatarFallback>
                )}
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                  {rec.title}
                </h4>
                {rec.subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {rec.subtitle}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {rec.reason}
                </p>
              </div>

              {/* Score indicator */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                  <Star className="h-3 w-3 fill-current" />
                  {Math.round(rec.score * 100)}%
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
