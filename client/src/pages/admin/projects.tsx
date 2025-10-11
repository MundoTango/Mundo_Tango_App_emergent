// ESA Agent #65: Self-Hosted Project Tracker Admin UI (Aurora Tide Compliant)
// Design Spec: docs/design-specs/project-tracker-aurora-tide-spec.md
// Agent #11 Approval: ✅ October 11, 2025

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, LayoutDashboard, ListTodo, Target, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Form schemas
const epicSchema = z.object({
  key: z.string().min(1, "Key is required").regex(/^[A-Z]+-\d+$/, "Format: PROJECT-123"),
  summary: z.string().min(1, "Summary is required"),
  description: z.string().optional(),
  status: z.enum(['to_do', 'in_progress', 'done', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  labels: z.array(z.string()).default([]),
  dueDate: z.string().optional()
});

const storySchema = z.object({
  key: z.string().min(1, "Key is required"),
  epicId: z.number().optional(),
  summary: z.string().min(1, "Summary is required"),
  description: z.string().optional(),
  status: z.enum(['to_do', 'in_progress', 'done', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  storyPoints: z.number().optional()
});

type Epic = {
  id: number;
  key: string;
  summary: string;
  description: string | null;
  status: string;
  priority: string;
  labels: string[];
  storyCount?: number;
  createdAt: Date;
};

type Story = {
  id: number;
  key: string;
  epicId: number | null;
  summary: string;
  status: string;
  priority: string;
  storyPoints: number | null;
};

type DashboardStats = {
  epics: { status: string; count: number }[];
  stories: { status: string; count: number; totalPoints: number }[];
  activeSprint: any;
};

export default function ProjectTrackerAdmin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [createEpicOpen, setCreateEpicOpen] = useState(false);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const { toast } = useToast();

  // Queries
  const { data: dashboard } = useQuery<{ data: DashboardStats }>({
    queryKey: ['/api/tracker/dashboard'],
  });

  const { data: epicsData } = useQuery<{ data: Epic[] }>({
    queryKey: ['/api/tracker/epics'],
  });

  const { data: storiesData } = useQuery<{ data: Story[] }>({
    queryKey: ['/api/tracker/stories'],
  });

  const epics = epicsData?.data || [];
  const stories = storiesData?.data || [];
  const stats = dashboard?.data;

  // Create epic mutation
  const createEpicMutation = useMutation({
    mutationFn: (data: z.infer<typeof epicSchema>) =>
      apiRequest('/api/tracker/epics', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tracker/epics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tracker/dashboard'] });
      setCreateEpicOpen(false);
      toast({ title: 'Epic created successfully!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error creating epic', description: error.message, variant: 'destructive' });
    }
  });

  // Create story mutation
  const createStoryMutation = useMutation({
    mutationFn: (data: z.infer<typeof storySchema>) =>
      apiRequest('/api/tracker/stories', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tracker/stories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tracker/dashboard'] });
      setCreateStoryOpen(false);
      toast({ title: 'Story created successfully!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error creating story', description: error.message, variant: 'destructive' });
    }
  });

  // Forms
  const epicForm = useForm<z.infer<typeof epicSchema>>({
    resolver: zodResolver(epicSchema),
    defaultValues: {
      status: 'to_do',
      priority: 'medium',
      labels: []
    }
  });

  const storyForm = useForm<z.infer<typeof storySchema>>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      status: 'to_do',
      priority: 'medium'
    }
  });

  // Aurora Tide Status Colors (MT Ocean Theme)
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

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-turquoise-500/10 via-ocean-500/10 to-blue-600/10 dark:from-turquoise-900/20 dark:via-ocean-900/20 dark:to-blue-900/20 py-6" 
      data-testid="page-admin-projects"
    >
      <div className="container mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 
              className="text-4xl font-bold bg-gradient-to-r from-turquoise-600 to-ocean-600 bg-clip-text text-transparent" 
              data-testid="heading-project-tracker"
            >
              Self-Hosted Project Tracker
            </h1>
            <p className="text-gray-700 dark:text-gray-300 mt-2">Manage Epics, Stories, and Tasks - No Jira Needed</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={createEpicOpen} onOpenChange={setCreateEpicOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-turquoise-500 to-ocean-600 hover:from-turquoise-600 hover:to-ocean-700 text-white" 
                  data-testid="button-create-epic"
                >
                  <Plus className="mr-2 h-4 w-4" /> Create Epic
                </Button>
              </DialogTrigger>
              <DialogContent className="glassmorphic-card backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">Create New Epic</DialogTitle>
                </DialogHeader>
                <Form {...epicForm}>
                  <form onSubmit={epicForm.handleSubmit((data) => createEpicMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={epicForm.control}
                      name="key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key</FormLabel>
                          <FormControl>
                            <Input placeholder="MUN-1" {...field} data-testid="input-epic-key" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={epicForm.control}
                      name="summary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Summary</FormLabel>
                          <FormControl>
                            <Input placeholder="Epic summary" {...field} data-testid="input-epic-summary" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={epicForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Detailed description" {...field} data-testid="textarea-epic-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={epicForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-epic-status">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="to_do">To Do</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="done">Done</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={epicForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-epic-priority">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-turquoise-500 to-ocean-600 hover:from-turquoise-600 hover:to-ocean-700" disabled={createEpicMutation.isPending} data-testid="button-submit-epic">
                      {createEpicMutation.isPending ? 'Creating...' : 'Create Epic'}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <Dialog open={createStoryOpen} onOpenChange={setCreateStoryOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-turquoise-500 text-turquoise-600 hover:bg-turquoise-50 dark:border-turquoise-400 dark:text-turquoise-400 dark:hover:bg-turquoise-950" 
                  data-testid="button-create-story"
                >
                  <Plus className="mr-2 h-4 w-4" /> Create Story
                </Button>
              </DialogTrigger>
              <DialogContent className="glassmorphic-card backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">Create New Story</DialogTitle>
                </DialogHeader>
                <Form {...storyForm}>
                  <form onSubmit={storyForm.handleSubmit((data) => createStoryMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={storyForm.control}
                      name="key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key</FormLabel>
                          <FormControl>
                            <Input placeholder="MUN-6" {...field} data-testid="input-story-key" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={storyForm.control}
                      name="epicId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Epic (Optional)</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger data-testid="select-story-epic">
                                <SelectValue placeholder="Select epic" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {epics.map(epic => (
                                <SelectItem key={epic.id} value={epic.id.toString()}>
                                  {epic.key}: {epic.summary}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={storyForm.control}
                      name="summary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Summary</FormLabel>
                          <FormControl>
                            <Input placeholder="Story summary" {...field} data-testid="input-story-summary" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={storyForm.control}
                      name="storyPoints"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Story Points</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="5" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} data-testid="input-story-points" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-gradient-to-r from-turquoise-500 to-ocean-600 hover:from-turquoise-600 hover:to-ocean-700" disabled={createStoryMutation.isPending} data-testid="button-submit-story">
                      {createStoryMutation.isPending ? 'Creating...' : 'Create Story'}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg border border-white/20 dark:border-white/10">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-500 data-[state=active]:to-ocean-600 data-[state=active]:text-white" 
              data-testid="tab-dashboard"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="epics" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-500 data-[state=active]:to-ocean-600 data-[state=active]:text-white" 
              data-testid="tab-epics"
            >
              <Target className="mr-2 h-4 w-4" /> Epics ({epics.length})
            </TabsTrigger>
            <TabsTrigger 
              value="stories" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-500 data-[state=active]:to-ocean-600 data-[state=active]:text-white" 
              data-testid="tab-stories"
            >
              <ListTodo className="mr-2 h-4 w-4" /> Stories ({stories.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4 mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <GlassCard className="p-6 glassmorphic-card beautiful-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Epics</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-turquoise-600 to-ocean-600 bg-clip-text text-transparent mt-1" data-testid="stat-total-epics">
                      {epics.length}
                    </p>
                    <div className="flex gap-2 mt-3">
                      {stats?.epics.map(s => (
                        <Badge key={s.status} className={statusColors[s.status as keyof typeof statusColors]}>
                          {s.count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Target className="h-10 w-10 text-turquoise-500" />
                </div>
              </GlassCard>
              
              <GlassCard className="p-6 glassmorphic-card beautiful-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Stories</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-turquoise-600 to-ocean-600 bg-clip-text text-transparent mt-1" data-testid="stat-total-stories">
                      {stories.length}
                    </p>
                    <div className="flex gap-2 mt-3">
                      {stats?.stories.map(s => (
                        <Badge key={s.status} className={statusColors[s.status as keyof typeof statusColors]}>
                          {s.count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ListTodo className="h-10 w-10 text-ocean-500" />
                </div>
              </GlassCard>
              
              <GlassCard className="p-6 glassmorphic-card beautiful-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Story Points</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-turquoise-600 to-ocean-600 bg-clip-text text-transparent mt-1" data-testid="stat-story-points">
                      {stats?.stories.reduce((acc, s) => acc + (s.totalPoints || 0), 0) || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Total across all stories</p>
                  </div>
                  <Calendar className="h-10 w-10 text-blue-600" />
                </div>
              </GlassCard>

              <GlassCard className="p-6 glassmorphic-card beautiful-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-turquoise-600 to-ocean-600 bg-clip-text text-transparent mt-1">
                      {stats?.stories.find(s => s.status === 'in_progress')?.count || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Active work items</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-emerald-600" />
                </div>
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="epics" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {epics.map(epic => (
                <GlassCard key={epic.id} className="glassmorphic-card card-lift p-4" data-testid={`card-epic-${epic.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="border-turquoise-500 text-turquoise-600 dark:border-turquoise-400 dark:text-turquoise-400" data-testid={`badge-epic-key-${epic.id}`}>
                          {epic.key}
                        </Badge>
                        <Badge className={statusColors[epic.status as keyof typeof statusColors]} data-testid={`badge-epic-status-${epic.id}`}>
                          {epic.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={priorityColors[epic.priority as keyof typeof priorityColors]} data-testid={`badge-epic-priority-${epic.id}`}>
                          {epic.priority}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white" data-testid={`text-epic-summary-${epic.id}`}>
                        {epic.summary}
                      </h3>
                      {epic.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-epic-description-${epic.id}`}>
                          {epic.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" data-testid={`badge-story-count-${epic.id}`}>
                      {epic.storyCount || 0} stories
                    </Badge>
                  </div>
                </GlassCard>
              ))}
              {epics.length === 0 && (
                <GlassCard className="glassmorphic-card p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-turquoise-400 to-ocean-500 flex items-center justify-center">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400" data-testid="text-no-epics">
                      No epics created yet. Click "Create Epic" to get started.
                    </p>
                  </div>
                </GlassCard>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stories" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {stories.map(story => (
                <GlassCard key={story.id} className="glassmorphic-card card-lift p-4" data-testid={`card-story-${story.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="border-turquoise-500 text-turquoise-600 dark:border-turquoise-400 dark:text-turquoise-400" data-testid={`badge-story-key-${story.id}`}>
                          {story.key}
                        </Badge>
                        <Badge className={statusColors[story.status as keyof typeof statusColors]} data-testid={`badge-story-status-${story.id}`}>
                          {story.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={priorityColors[story.priority as keyof typeof priorityColors]} data-testid={`badge-story-priority-${story.id}`}>
                          {story.priority}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white" data-testid={`text-story-summary-${story.id}`}>
                        {story.summary}
                      </h3>
                    </div>
                    {story.storyPoints && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" data-testid={`badge-story-points-${story.id}`}>
                        {story.storyPoints} pts
                      </Badge>
                    )}
                  </div>
                </GlassCard>
              ))}
              {stories.length === 0 && (
                <GlassCard className="glassmorphic-card p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-turquoise-400 to-ocean-500 flex items-center justify-center">
                      <ListTodo className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400" data-testid="text-no-stories">
                      No stories created yet. Click "Create Story" to get started.
                    </p>
                  </div>
                </GlassCard>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
