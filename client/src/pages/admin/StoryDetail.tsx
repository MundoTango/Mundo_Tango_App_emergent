// ESA Agent #65: Story Detail Page - Agent Assignment & Code Links
// Architecture: docs/features/project-tracker/pages/story-detail-architecture.md

import { useParams, Link, useLocation } from 'wouter';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { GlassCard } from '@/components/glass/GlassComponents';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Check, Clock, FileCode, AlertTriangle, Target, Users, Shield, Link2, CheckSquare, Code, FileText, Layers, ChevronRight, Eye, GitBranch, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AgentSelector, MultiAgentSelector } from '@/components/tracker/AgentSelector';
import { CodeLinkInput, CodeLinkDisplay } from '@/components/tracker/CodeLinkInput';
import { GitHubIssueLink, SyncToGitHubButton, GitHubPRBadge, LinkPRButton } from '@/components/admin/GitHubIntegration';
import AdminLayout from '@/components/admin/AdminLayout';
import { getLayerName } from '@/lib/esaLayers';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { StoryComments } from '@/components/tracker/StoryComments';

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  estimatedHours: number | null;
  actualHours: number | null;
  assignedAgentId: string | null;
  codeFilePath: string | null;
  codeLineRange: string | null;
  acceptanceCriteria: string[];
  githubPrNumber: number | null;
  githubPrUrl: string | null;
  githubBranch: string | null;
  githubSyncedAt: string | null;
};

type StoryMetadata = {
  review_notes?: string;
  documentation_links?: string[];
  review_checklist?: string[];
  review_category?: string;
  esa_layers?: number[];
  current_metrics?: Record<string, string>;
  target_metrics?: Record<string, string>;
  gap_percentage?: number;
  risk_level?: "critical" | "high" | "medium" | "low";
  risk_description?: string;
  escalation_path?: string;
  expert_agents?: number[];
  technologies?: string[];
  tools_required?: string[];
  affected_files?: string[];
  compliance_requirements?: string[];
  complexity?: string;
  acceptance_criteria?: string[];
  manual_testing_required?: boolean;
  expert_review_needed?: boolean;
};

type Story = {
  id: number;
  key: string;
  summary: string;
  description: string | null;
  status: string;
  priority: string;
  storyPoints: number | null;
  assignedAgentId: string | null;
  teamAgentIds: string[];
  estimatedHours: number | null;
  actualHours: number | null;
  tasks?: Task[];
  epicId: number | null;
  githubIssueNumber: number | null;
  githubIssueUrl: string | null;
  githubRepoName: string | null;
  githubSyncedAt: string | null;
  metadata?: StoryMetadata;
};

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  estimatedHours: z.number().min(0.5).optional(),
  assignedAgentId: z.string().optional(),
  codeFilePath: z.string().optional(),
  codeLineRange: z.string().optional(),
  acceptanceCriteria: z.array(z.string()).default([]),
});

export default function StoryDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [taskFilePath, setTaskFilePath] = useState('');
  const [taskLineRange, setTaskLineRange] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');

  const { data: storyData, isLoading, error } = useQuery({
    queryKey: [`/api/tracker/stories/${id}`],
  });

  const story = (storyData as any)?.data as Story | undefined;
  const tasks = (story?.tasks as Task[] | undefined) || [];

  // Calculate progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalEstimatedHours = tasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);

  const createTaskMutation = useMutation({
    mutationFn: (data: z.infer<typeof taskSchema>) =>
      apiRequest(`/api/tracker/tasks`, { 
        method: 'POST', 
        body: {
          ...data,
          storyId: parseInt(id!),
          codeFilePath: taskFilePath || null,
          codeLineRange: taskLineRange || null,
          assignedAgentId: selectedAgent || null,
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tracker/stories/${id}`] });
      setCreateTaskOpen(false);
      taskForm.reset();
      setTaskFilePath('');
      setTaskLineRange('');
      setSelectedAgent('');
      toast({ title: 'Task created successfully!' });
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: string }) =>
      apiRequest(`/api/tracker/tasks/${taskId}`, { 
        method: 'PUT', 
        body: { status }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tracker/stories/${id}`] });
      toast({ title: 'Task status updated!' });
    },
  });

  const taskForm = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      acceptanceCriteria: [],
    }
  });

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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-turquoise-500/10 via-ocean-500/10 to-blue-600/10">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">Story not found</p>
          <Button onClick={() => navigate('/admin/projects')} className="mt-4">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4" data-testid="page-story-detail">
        {/* Breadcrumbs & Back Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="text-gray-500 dark:text-gray-400">Admin</span>
            <ChevronRight className="h-4 w-4" />
            <Link href="/admin/projects" className="hover:text-turquoise-600 dark:hover:text-turquoise-400 transition-colors" data-testid="link-projects">
              Projects
            </Link>
            {story.epicId && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link href={`/admin/projects/epic/${story.epicId}`} className="hover:text-turquoise-600 dark:hover:text-turquoise-400 transition-colors" data-testid="link-epic">
                  Epic
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 dark:text-white font-medium">{story.key}</span>
          </div>
          <Button onClick={() => navigate(story.epicId ? `/admin/projects/epic/${story.epicId}` : '/admin/projects')} variant="outline" size="sm" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Jira-Style 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT COLUMN: Main Content (70%) */}
          <div className="flex-1 lg:w-[70%] space-y-6">
            {/* Story Header */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="border-ocean-500 text-ocean-600 dark:border-ocean-400 dark:text-ocean-400 text-lg px-3 py-1" data-testid="badge-story-key">
                  {story.key}
                </Badge>
                <Badge className={statusColors[story.status as keyof typeof statusColors]} data-testid="badge-story-status">
                  {story.status.replace('_', ' ')}
                </Badge>
                <Badge className={priorityColors[story.priority as keyof typeof priorityColors]} data-testid="badge-story-priority">
                  {story.priority}
                </Badge>
                {story.storyPoints && (
                  <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800" data-testid="badge-story-points">
                    {story.storyPoints} pts
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3" data-testid="text-story-summary">
                {story.summary}
              </h1>
              {story.description && (
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed" data-testid="text-story-description">
                  {story.description}
                </p>
              )}
            </div>

            {/* Tasks Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-turquoise-600 dark:text-turquoise-400" />
                  Tasks
                </h2>
                <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-turquoise-500 to-ocean-600 hover:from-turquoise-600 hover:to-ocean-700" data-testid="button-create-task">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Task</DialogTitle>
                    </DialogHeader>
                    <Form {...taskForm}>
                      <form onSubmit={taskForm.handleSubmit((data) => createTaskMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={taskForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Task Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Implement feature..." {...field} data-testid="input-task-title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={taskForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Task details..." {...field} data-testid="textarea-task-description" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">Assign Agent</label>
                          <AgentSelector
                            value={selectedAgent}
                            onChange={setSelectedAgent}
                            placeholder="Select agent for this task..."
                            data-testid="select-task-agent"
                          />
                        </div>

                        <CodeLinkInput
                          filePath={taskFilePath}
                          lineRange={taskLineRange}
                          onFileChange={setTaskFilePath}
                          onLineChange={setTaskLineRange}
                        />

                        <FormField
                          control={taskForm.control}
                          name="estimatedHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estimated Hours</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.5"
                                  placeholder="2.5" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                                  data-testid="input-task-hours" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="w-full bg-gradient-to-r from-turquoise-500 to-ocean-600 hover:from-turquoise-600 hover:to-ocean-700" disabled={createTaskMutation.isPending} data-testid="button-submit-task">
                          {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-3">
                {tasks.map(task => (
                  <GlassCard key={task.id} className="glassmorphic-card p-4" data-testid={`card-task-${task.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[task.status as keyof typeof statusColors]} data-testid={`badge-task-status-${task.id}`}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                          {task.assignedAgentId && (
                            <div className="flex items-center gap-1">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-white">
                                {task.assignedAgentId.split('-')[1]}
                              </div>
                              <span className="text-xs text-gray-600 dark:text-gray-400">Agent #{task.assignedAgentId.split('-')[1]}</span>
                            </div>
                          )}
                          {task.estimatedHours && (
                            <Badge variant="outline" className="text-xs" data-testid={`badge-task-hours-${task.id}`}>
                              {task.estimatedHours}h
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white" data-testid={`text-task-title-${task.id}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-task-description-${task.id}`}>
                            {task.description}
                          </p>
                        )}
                        {task.codeFilePath && (
                          <CodeLinkDisplay 
                            filePath={task.codeFilePath} 
                            lineRange={task.codeLineRange || undefined}
                            data-testid={`code-link-${task.id}`}
                          />
                        )}
                        {task.githubPrNumber && task.githubPrUrl && (
                          <GitHubPRBadge
                            prNumber={task.githubPrNumber}
                            prUrl={task.githubPrUrl}
                            branch={task.githubBranch}
                            syncedAt={task.githubSyncedAt}
                          />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <LinkPRButton taskId={task.id} existingPRNumber={task.githubPrNumber} />
                        {task.status !== 'done' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTaskStatusMutation.mutate({ taskId: task.id, status: task.status === 'to_do' ? 'in_progress' : 'done' })}
                            disabled={updateTaskStatusMutation.isPending}
                            data-testid={`button-update-task-${task.id}`}
                          >
                            {task.status === 'to_do' ? 'Start' : 'Complete'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                ))}
                {tasks.length === 0 && (
                  <GlassCard className="glassmorphic-card p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-turquoise-400 to-ocean-500 flex items-center justify-center">
                        <Check className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tasks yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Break down this story into actionable tasks</p>
                      </div>
                    </div>
                  </GlassCard>
                )}
              </div>

              {/* Comments Section */}
              <StoryComments storyId={story.id} />
            </div>
          </div>

          {/* RIGHT SIDEBAR: Metadata & Details (30% / 380px) */}
          <aside className="lg:w-[380px] space-y-4">
            <div className="lg:sticky lg:top-4 space-y-4">
              {/* Details Section */}
              <GlassCard className="glassmorphic-card p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-turquoise-600 dark:text-turquoise-400" />
                  Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Status</label>
                    <Select value={story.status} disabled>
                      <SelectTrigger className="w-full" data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="to_do">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Priority</label>
                    <Select value={story.priority} disabled>
                      <SelectTrigger className="w-full" data-testid="select-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Story Points</label>
                    <Input type="number" value={story.storyPoints || ''} disabled data-testid="input-story-points" className="w-full" />
                  </div>
                </div>
              </GlassCard>

              {/* People Section */}
              <GlassCard className="glassmorphic-card p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-turquoise-600 dark:text-turquoise-400" />
                  People
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Assigned Agent</label>
                    {story.assignedAgentId ? (
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-white">
                          {story.assignedAgentId.split('-')[1]}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Agent #{story.assignedAgentId.split('-')[1]}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">Not assigned</span>
                    )}
                  </div>
                  {story.teamAgentIds && story.teamAgentIds.length > 0 && (
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">Team Agents</label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {story.teamAgentIds.map(agentId => (
                          <div key={agentId} className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-white">
                            {agentId.split('-')[1]}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Progress Section */}
              <GlassCard className="glassmorphic-card p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-turquoise-600 dark:text-turquoise-400" />
                  Progress
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Task Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {completedTasks} / {totalTasks} ({progressPercent}%)
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2" data-testid="progress-story" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {totalEstimatedHours}h est.
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileCode className="h-3 w-3 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {totalTasks} tasks
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* GitHub Section */}
              <GlassCard className="glassmorphic-card p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-turquoise-600 dark:text-turquoise-400" />
                  GitHub
                </h3>
                <div className="space-y-2">
                  {story.githubIssueNumber && story.githubIssueUrl ? (
                    <GitHubIssueLink
                      issueNumber={story.githubIssueNumber}
                      issueUrl={story.githubIssueUrl}
                      repoName={story.githubRepoName}
                      syncedAt={story.githubSyncedAt}
                    />
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Not synced to GitHub</p>
                  )}
                  <SyncToGitHubButton 
                    storyId={story.id} 
                    storyKey={story.key} 
                    existingIssueNumber={story.githubIssueNumber}
                  />
                </div>
              </GlassCard>

              {/* ESA Layers Section */}
              {story.metadata?.esa_layers && story.metadata.esa_layers.length > 0 && (
                <GlassCard className="glassmorphic-card p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-turquoise-600 dark:text-turquoise-400" />
                    ESA Layers
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <TooltipProvider>
                      {story.metadata.esa_layers.map(layer => (
                        <Tooltip key={layer}>
                          <TooltipTrigger asChild>
                            <Badge 
                              variant="outline" 
                              className="border-cyan-500 text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/20 cursor-pointer hover:bg-cyan-100 dark:hover:bg-cyan-800/40 transition-colors text-xs"
                              onClick={() => navigate(story.epicId ? `/admin/projects/epic/${story.epicId}?layer=${layer}` : `/admin/projects?layer=${layer}`)}
                              data-testid={`badge-layer-${layer}`}
                            >
                              Layer {layer}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-900 text-white">
                            <p className="font-semibold text-xs">{getLayerName(layer)}</p>
                            <p className="text-xs text-gray-300 mt-1">Click to filter</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>
                </GlassCard>
              )}

              {/* Actions Section */}
              <GlassCard className="glassmorphic-card p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-watch">
                    <Eye className="h-4 w-4 mr-2" />
                    Watch
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-add-dependency">
                    <Link2 className="h-4 w-4 mr-2" />
                    Add Dependency
                  </Button>
                </div>
              </GlassCard>

              {/* Metadata Sections - Compact Format */}
              {story.metadata && Object.keys(story.metadata).length > 0 && (
                <>
                  {/* Review Notes */}
                  {story.metadata.review_notes && (
                    <GlassCard className="glassmorphic-card p-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        Review Notes
                      </h3>
                      {story.metadata.review_category && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs mb-2">
                          {story.metadata.review_category}
                        </Badge>
                      )}
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{story.metadata.review_notes}</p>
                    </GlassCard>
                  )}

                  {/* Risk Assessment */}
                  {(story.metadata.risk_level || story.metadata.risk_description) && (
                    <GlassCard className="glassmorphic-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                          Risk
                        </h3>
                        {story.metadata.risk_level && (
                          <Badge className={
                            story.metadata.risk_level === 'critical' ? 'bg-red-600 text-white text-xs' :
                            story.metadata.risk_level === 'high' ? 'bg-orange-600 text-white text-xs' :
                            story.metadata.risk_level === 'medium' ? 'bg-yellow-600 text-white text-xs' :
                            'bg-green-600 text-white text-xs'
                          }>
                            {story.metadata.risk_level.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      {story.metadata.risk_description && (
                        <p className="text-xs text-gray-700 dark:text-gray-300">{story.metadata.risk_description}</p>
                      )}
                    </GlassCard>
                  )}

                  {/* Technical Details */}
                  {(story.metadata.complexity || story.metadata.technologies) && (
                    <GlassCard className="glassmorphic-card p-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Code className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        Technical
                      </h3>
                      {story.metadata.complexity && (
                        <Badge variant="outline" className="text-xs mb-2">{story.metadata.complexity}</Badge>
                      )}
                      {story.metadata.technologies && story.metadata.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {story.metadata.technologies.slice(0, 3).map((tech, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{tech}</Badge>
                          ))}
                          {story.metadata.technologies.length > 3 && (
                            <Badge variant="secondary" className="text-xs">+{story.metadata.technologies.length - 3}</Badge>
                          )}
                        </div>
                      )}
                    </GlassCard>
                  )}
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
