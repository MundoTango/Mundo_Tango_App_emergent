/**
 * H2AC Pattern: Full-Screen Project Workspace
 * Interactive story card breakdown with agent chat integration
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, ChevronRight, MessageSquare, CheckCircle2, Circle, Clock } from 'lucide-react';
import type { Feature, SubFeature, Component, Task } from '@shared/schema';

interface ProjectWorkspaceProps {
  featureId: number;
  open: boolean;
  onClose: () => void;
}

export function ProjectWorkspace({ featureId, open, onClose }: ProjectWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'story' | 'chat'>('story');
  
  // Fetch complete story hierarchy
  const { data: storyData, isLoading } = useQuery<{
    feature: Feature & {
      subFeatures: (SubFeature & {
        components: (Component & {
          tasks: Task[];
        })[];
      })[];
    };
  }>({
    queryKey: ['/api/project-tracker/story', featureId],
    enabled: open && !!featureId,
  });

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">
            {storyData?.feature.title || 'Loading...'}
          </DialogTitle>
          <div className="flex gap-2 mt-2">
            {storyData?.feature.pageAgentId && (
              <Badge variant="outline">{storyData.feature.pageAgentId}</Badge>
            )}
            {storyData?.feature.journeyAgentId && (
              <Badge variant="outline">{storyData.feature.journeyAgentId}</Badge>
            )}
            <Badge className="capitalize">{storyData?.feature.status}</Badge>
          </div>
        </DialogHeader>

        <div className="flex h-full overflow-hidden">
          {/* LEFT: Story Hierarchy */}
          <div className="w-1/2 border-r flex flex-col">
            <div className="px-6 py-3 bg-muted/30">
              <h3 className="text-sm font-semibold">Story Breakdown</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Complete hierarchy with tasks and status
              </p>
            </div>
            
            <ScrollArea className="flex-1 px-6 py-4">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading hierarchy...</div>
              ) : (
                <StoryHierarchy story={storyData!} />
              )}
            </ScrollArea>
          </div>

          {/* RIGHT: Agent Chat */}
          <div className="w-1/2 flex flex-col">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
              <div className="px-6 py-3 bg-muted/30">
                <TabsList>
                  <TabsTrigger value="story">Details</TabsTrigger>
                  <TabsTrigger value="chat">Ask Agents</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="story" className="flex-1 overflow-auto px-6 py-4 mt-0">
                <StoryDetails story={storyData?.feature} />
              </TabsContent>

              <TabsContent value="chat" className="flex-1 overflow-auto px-6 py-4 mt-0">
                <AgentChat featureId={featureId} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Story Hierarchy Component
interface StoryHierarchyProps {
  story: {
    feature: Feature & {
      subFeatures: (SubFeature & {
        components: (Component & {
          tasks: Task[];
        })[];
      })[];
    };
  };
}

function StoryHierarchy({ story }: StoryHierarchyProps) {
  const [expandedSubs, setExpandedSubs] = useState<Set<number>>(new Set());
  const [expandedComps, setExpandedComps] = useState<Set<number>>(new Set());

  const toggleSub = (id: number) => {
    setExpandedSubs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleComp = (id: number) => {
    setExpandedComps(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!story.feature.subFeatures?.length) {
    return <div className="text-sm text-muted-foreground">No sub-features yet</div>;
  }

  return (
    <div className="space-y-3">
      {story.feature.subFeatures.map((sub) => (
        <div key={sub.id} className="space-y-2">
          {/* Sub-Feature */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
            onClick={() => toggleSub(sub.id)}
          >
            {expandedSubs.has(sub.id) ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <StatusIcon status={sub.status} />
            <span className="text-sm font-medium">{sub.title}</span>
          </div>

          {/* Components */}
          {expandedSubs.has(sub.id) && sub.components?.map((comp) => (
            <div key={comp.id} className="ml-6 space-y-2">
              <div
                className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                onClick={() => toggleComp(comp.id)}
              >
                {expandedComps.has(comp.id) ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <StatusIcon status={comp.status} />
                <span className="text-sm">{comp.title}</span>
              </div>

              {/* Tasks */}
              {expandedComps.has(comp.id) && comp.tasks?.map((task) => (
                <div key={task.id} className="ml-6 flex items-center gap-2 p-2">
                  <Checkbox checked={task.status === 'done'} />
                  <StatusIcon status={task.status} size="sm" />
                  <span className="text-xs">{task.title}</span>
                  {task.agentResponsible && (
                    <Badge variant="outline" className="text-xs ml-auto">
                      {task.agentResponsible}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Status Icon Component
function StatusIcon({ status, size = 'md' }: { status?: string; size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  
  if (status === 'done') {
    return <CheckCircle2 className={`${iconSize} text-green-500`} />;
  } else if (status === 'in-progress' || status === 'active') {
    return <Clock className={`${iconSize} text-amber-500`} />;
  }
  return <Circle className={`${iconSize} text-muted-foreground`} />;
}

// Story Details Component
function StoryDetails({ story }: { story?: Feature }) {
  if (!story) return null;

  return (
    <div className="space-y-4">
      {story.description && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Description</h4>
          <p className="text-sm text-muted-foreground">{story.description}</p>
        </div>
      )}

      <Separator />

      <div>
        <h4 className="text-sm font-semibold mb-2">Assignment</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Assigned to:</span>
            <span className="font-medium">{story.assignedTo || 'Unassigned'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Category:</span>
            <Badge variant="outline" className="capitalize">{story.category}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge className="capitalize">{story.status}</Badge>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="text-sm font-semibold mb-2">Agents</h4>
        <div className="flex gap-2">
          {story.pageAgentId && (
            <Badge variant="secondary">{story.pageAgentId}</Badge>
          )}
          {story.journeyAgentId && (
            <Badge variant="secondary">{story.journeyAgentId}</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// Agent Chat Component (placeholder)
function AgentChat({ featureId }: { featureId: number }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm">Chat with matched agents</p>
          <p className="text-xs mt-1">Coming soon: Real-time collaboration</p>
        </div>
      </div>
    </div>
  );
}
