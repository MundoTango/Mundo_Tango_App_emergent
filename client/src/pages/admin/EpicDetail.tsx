// ESA Agent #65: Epic Detail Page - Story Breakdown & Progress
// Architecture: docs/features/project-tracker/pages/epic-detail-architecture.md

import { useParams, Link, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { GlassCard } from '@/components/glass/GlassComponents';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Plus, Target, Users, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type Story = {
  id: number;
  key: string;
  summary: string;
  status: string;
  priority: string;
  storyPoints: number | null;
  assignedAgentId?: string | null;
  teamAgentIds?: string[];
  metadata?: {
    story_points?: number;
    review_category?: string;
  };
};

type Epic = {
  id: number;
  key: string;
  summary: string;
  description: string | null;
  status: string;
  priority: string;
  stories?: Story[];
};

export default function EpicDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: epicData, isLoading, error } = useQuery({
    queryKey: [`/api/tracker/epics/${id}`],
  });

  const epic = (epicData as any)?.data as Epic | undefined;
  const stories = epic?.stories || [];

  // Calculate progress
  const totalStories = stories.length;
  const completedStories = stories.filter((s: Story) => s.status === 'done').length;
  const progressPercent = totalStories > 0 ? Math.round((completedStories / totalStories) * 100) : 0;
  // Check both storyPoints (top-level) and metadata.story_points for audit-generated stories
  const totalPoints = stories.reduce((acc: number, s: Story) => {
    const points = s.storyPoints || s.metadata?.story_points || 0;
    return acc + points;
  }, 0);

  // Status breakdown for chart
  const statusData = [
    { name: 'To Do', value: stories.filter((s: Story) => s.status === 'to_do').length, color: '#6B7280' },
    { name: 'In Progress', value: stories.filter((s: Story) => s.status === 'in_progress').length, color: '#0694A2' },
    { name: 'Done', value: stories.filter((s: Story) => s.status === 'done').length, color: '#0E9F6E' },
  ].filter((d: any) => d.value > 0);

  const statusColors = {
    to_do: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
    in_progress: 'bg-gradient-to-r from-turquoise-500 to-ocean-600 text-white',
    done: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
    cancelled: 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
  };

  const priorityColors = {
    low: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800',
    medium: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white',
    high: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
    critical: 'bg-gradient-to-r from-red-600 to-rose-700 text-white'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-turquoise-500/10 via-ocean-500/10 to-blue-600/10">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-turquoise-500 border-t-transparent animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading epic...</p>
        </div>
      </div>
    );
  }

  if (!epic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-turquoise-500/10 via-ocean-500/10 to-blue-600/10">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">Epic not found</p>
          <Button onClick={() => navigate('/admin/projects')} className="mt-4">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-500/10 via-ocean-500/10 to-blue-600/10 dark:from-turquoise-900/20 dark:via-ocean-900/20 dark:to-blue-900/20 py-6" data-testid="page-epic-detail">
      <div className="container mx-auto space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/admin/projects" className="hover:text-turquoise-600 dark:hover:text-turquoise-400 transition-colors" data-testid="link-projects">
            Projects
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">{epic.key}</span>
        </div>

        {/* Epic Header */}
        <GlassCard className="glassmorphic-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="border-turquoise-500 text-turquoise-600 dark:border-turquoise-400 dark:text-turquoise-400 text-lg" data-testid="badge-epic-key">
                  {epic.key}
                </Badge>
                <Badge className={statusColors[epic.status as keyof typeof statusColors] || statusColors.to_do} data-testid="badge-epic-status">
                  {epic.status?.replace('_', ' ') || 'Unknown'}
                </Badge>
                <Badge className={priorityColors[epic.priority as keyof typeof priorityColors] || priorityColors.medium} data-testid="badge-epic-priority">
                  {epic.priority || 'Medium'}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" data-testid="text-epic-summary">
                {epic.summary}
              </h1>
              {epic.description && (
                <p className="text-gray-600 dark:text-gray-400" data-testid="text-epic-description">
                  {epic.description}
                </p>
              )}
            </div>
            <Button onClick={() => navigate('/admin/projects')} variant="outline" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Epic Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {completedStories} / {totalStories} stories ({progressPercent}%)
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" data-testid="progress-epic" />
          </div>
        </GlassCard>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <GlassCard className="glassmorphic-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Stories</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-turquoise-600 to-ocean-600 bg-clip-text text-transparent" data-testid="stat-total-stories">
                  {totalStories}
                </p>
              </div>
              <Target className="h-8 w-8 text-turquoise-500" />
            </div>
          </GlassCard>

          <GlassCard className="glassmorphic-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Story Points</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-turquoise-600 to-ocean-600 bg-clip-text text-transparent" data-testid="stat-total-points">
                  {totalPoints}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-ocean-500" />
            </div>
          </GlassCard>

          <GlassCard className="glassmorphic-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent" data-testid="stat-completed">
                  {completedStories}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                ✓
              </div>
            </div>
          </GlassCard>

          <GlassCard className="glassmorphic-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-turquoise-600 to-ocean-600 bg-clip-text text-transparent" data-testid="stat-in-progress">
                  {stories.filter(s => s.status === 'in_progress').length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-turquoise-400 to-ocean-500 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Status Chart */}
        {statusData.length > 0 && (
          <GlassCard className="glassmorphic-card p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Status Breakdown</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {statusData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Stories List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Stories ({totalStories})</h2>
          </div>
          <div className="grid gap-3">
            {stories.map((story: Story) => (
              <GlassCard
                key={story.id}
                className="glassmorphic-card card-lift p-4 cursor-pointer hover:border-turquoise-500/50 transition-all"
                onClick={() => navigate(`/admin/projects/story/${story.id}`)}
                data-testid={`card-story-${story.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="border-ocean-500 text-ocean-600 dark:border-ocean-400 dark:text-ocean-400" data-testid={`badge-story-key-${story.id}`}>
                        {story.key}
                      </Badge>
                      <Badge className={statusColors[story.status as keyof typeof statusColors]} data-testid={`badge-story-status-${story.id}`}>
                        {story.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={priorityColors[story.priority as keyof typeof priorityColors]} data-testid={`badge-story-priority-${story.id}`}>
                        {story.priority}
                      </Badge>
                      {story.storyPoints && (
                        <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800" data-testid={`badge-story-points-${story.id}`}>
                          {story.storyPoints} pts
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white" data-testid={`text-story-summary-${story.id}`}>
                      {story.summary}
                    </h3>
                  </div>
                  {story.assignedAgentId && (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-white">
                        {story.assignedAgentId.split('-')[1]}
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            ))}
            {stories.length === 0 && (
              <GlassCard className="glassmorphic-card p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-turquoise-400 to-ocean-500 flex items-center justify-center">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No stories yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first story in this epic</p>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
