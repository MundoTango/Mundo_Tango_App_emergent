/**
 * H2AC Pattern: My Work Tab
 * Shows story cards assigned to current user in Mr Blue interface
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { Feature } from '@shared/schema';

export function MyWorkTab() {
  const { user } = useAuth();
  const [selectedStory, setSelectedStory] = useState<number | null>(null);

  // Fetch stories assigned to current user
  const { data: stories, isLoading, error } = useQuery<Feature[]>({
    queryKey: ['/api/project-tracker/my-work', user?.id],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-turquoise-500" />
        <span className="ml-2 text-sm text-muted-foreground">Loading your work...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm">Failed to load work items</span>
      </div>
    );
  }

  if (!stories || stories.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No work items assigned yet.</p>
        <p className="text-xs text-muted-foreground mt-2">
          Story cards will appear here when audits find items for your role.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Work ({stories.length})</h3>
        <Badge variant="outline" className="text-xs">
          {stories.filter(s => s.status === 'active').length} Active
        </Badge>
      </div>

      {stories.map((story) => (
        <StoryCardPreview
          key={story.id}
          story={story}
          onClick={() => setSelectedStory(story.id)}
        />
      ))}
    </div>
  );
}

interface StoryCardPreviewProps {
  story: Feature;
  onClick: () => void;
}

function StoryCardPreview({ story, onClick }: StoryCardPreviewProps) {
  const statusColors = {
    backlog: 'bg-gray-500',
    active: 'bg-turquoise-500',
    review: 'bg-amber-500',
    done: 'bg-green-500',
  };

  const statusColor = statusColors[story.status as keyof typeof statusColors] || 'bg-gray-500';

  return (
    <Card 
      className="glassmorphic-card cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
      onClick={onClick}
      data-testid={`story-card-${story.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{story.title}</CardTitle>
            <CardDescription className="mt-1 text-xs">
              {story.pageAgentId && <Badge variant="outline" className="mr-1">{story.pageAgentId}</Badge>}
              {story.journeyAgentId && <Badge variant="outline">{story.journeyAgentId}</Badge>}
            </CardDescription>
          </div>
          <div className={`h-2 w-2 rounded-full ${statusColor}`} />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>{story.category}</span>
            {story.assignedTo && <span>• {story.assignedTo}</span>}
          </div>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <span className="text-xs">View Details</span>
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </div>

        {story.description && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
            {story.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
