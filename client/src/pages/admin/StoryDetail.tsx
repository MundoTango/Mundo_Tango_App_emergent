// ESA Agent #65: Story Detail Page - Agent Assignment & Code Links
// Architecture: docs/features/project-tracker/pages/story-detail-architecture.md

import { useParams, Link, useLocation } from 'wouter';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { GlassCard } from '@/components/glass/GlassComponents';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Plus, Check, Clock, FileCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AgentSelector, MultiAgentSelector } from '@/components/tracker/AgentSelector';
import { CodeLinkInput, CodeLinkDisplay } from '@/components/tracker/CodeLinkInput';

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
    <div className="min-h-screen bg-gradient-to-br from-turquoise-500/10 via-ocean-500/10 to-blue-600/10 dark:from-turquoise-900/20 dark:via-ocean-900/20 dark:to-blue-900/20 py-6" data-testid="page-story-detail">
      <div className="container mx-auto space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/admin/projects" className="hover:text-turquoise-600 dark:hover:text-turquoise-400 transition-colors" data-testid="link-projects">
            Projects
          </Link>
          <span>/</span>
          {story.epicId && (
            <>
              <Link href={`/admin/projects/epic/${story.epicId}`} className="hover:text-turquoise-600 dark:hover:text-turquoise-400 transition-colors" data-testid="link-epic">
                Epic
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 dark:text-white font-medium">{story.key}</span>
        </div>

        {/* Story Header */}
        <GlassCard className="glassmorphic-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="border-ocean-500 text-ocean-600 dark:border-ocean-400 dark:text-ocean-400 text-lg" data-testid="badge-story-key">
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" data-testid="text-story-summary">
                {story.summary}
              </h1>
              {story.description && (
                <p className="text-gray-600 dark:text-gray-400" data-testid="text-story-description">
                  {story.description}
                </p>
              )}
            </div>
            <Button onClick={() => navigate(story.epicId ? `/admin/projects/epic/${story.epicId}` : '/admin/projects')} variant="outline" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Agent Assignments */}
          <div className="mb-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[120px]">Primary Agent:</span>
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
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[120px]">Team Agents:</span>
                <div className="flex items-center gap-2">
                  {story.teamAgentIds.map(agentId => (
                    <div key={agentId} className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-white">
                      {agentId.split('-')[1]}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Task Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {completedTasks} / {totalTasks} tasks ({progressPercent}%)
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" data-testid="progress-story" />
          </div>

          {/* Effort Stats */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Estimated: <span className="font-medium text-gray-900 dark:text-white">{totalEstimatedHours}h</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Tasks: <span className="font-medium text-gray-900 dark:text-white">{totalTasks}</span>
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Tasks Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks ({totalTasks})</h2>
            <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-turquoise-500 to-ocean-600 hover:from-turquoise-600 hover:to-ocean-700 text-white" data-testid="button-create-task">
                  <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="glassmorphic-card backdrop-blur-xl max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">Create New Task</DialogTitle>
                </DialogHeader>
                <Form {...taskForm}>
                  <form onSubmit={taskForm.handleSubmit((data) => createTaskMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={taskForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Add dark mode to header" {...field} data-testid="input-task-title" />
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
                  </div>
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
        </div>
      </div>
    </div>
  );
}
