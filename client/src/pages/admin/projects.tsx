// ESA Agent #65: Self-Hosted Project Tracker Admin UI
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, LayoutDashboard, ListTodo, Target, Calendar } from 'lucide-react';
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

  const statusColors = {
    to_do: 'bg-gray-500',
    in_progress: 'bg-blue-500',
    done: 'bg-green-500',
    cancelled: 'bg-red-500'
  };

  const priorityColors = {
    low: 'bg-gray-400',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-600'
  };

  return (
    <div className="container mx-auto py-6 space-y-6" data-testid="page-admin-projects">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold dark:text-white" data-testid="heading-project-tracker">Self-Hosted Project Tracker</h1>
          <p className="text-muted-foreground mt-1">Manage Epics, Stories, and Tasks - No Jira Needed</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={createEpicOpen} onOpenChange={setCreateEpicOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-epic">
                <Plus className="mr-2 h-4 w-4" /> Create Epic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Epic</DialogTitle>
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
                  <Button type="submit" className="w-full" disabled={createEpicMutation.isPending} data-testid="button-submit-epic">
                    {createEpicMutation.isPending ? 'Creating...' : 'Create Epic'}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={createStoryOpen} onOpenChange={setCreateStoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-create-story">
                <Plus className="mr-2 h-4 w-4" /> Create Story
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Story</DialogTitle>
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
                  <Button type="submit" className="w-full" disabled={createStoryMutation.isPending} data-testid="button-submit-story">
                    {createStoryMutation.isPending ? 'Creating...' : 'Create Story'}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="epics" data-testid="tab-epics">
            <Target className="mr-2 h-4 w-4" /> Epics ({epics.length})
          </TabsTrigger>
          <TabsTrigger value="stories" data-testid="tab-stories">
            <ListTodo className="mr-2 h-4 w-4" /> Stories ({stories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Epics</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-total-epics">{epics.length}</div>
                <div className="flex gap-2 mt-2">
                  {stats?.epics.map(s => (
                    <Badge key={s.status} className={statusColors[s.status as keyof typeof statusColors]}>
                      {s.count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-total-stories">{stories.length}</div>
                <div className="flex gap-2 mt-2">
                  {stats?.stories.map(s => (
                    <Badge key={s.status} className={statusColors[s.status as keyof typeof statusColors]}>
                      {s.count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Story Points</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-story-points">
                  {stats?.stories.reduce((acc, s) => acc + (s.totalPoints || 0), 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total across all stories</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="epics" className="space-y-4">
          <div className="grid gap-4">
            {epics.map(epic => (
              <Card key={epic.id} data-testid={`card-epic-${epic.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" data-testid={`badge-epic-key-${epic.id}`}>{epic.key}</Badge>
                        <Badge className={statusColors[epic.status as keyof typeof statusColors]} data-testid={`badge-epic-status-${epic.id}`}>
                          {epic.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={priorityColors[epic.priority as keyof typeof priorityColors]} data-testid={`badge-epic-priority-${epic.id}`}>
                          {epic.priority}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl" data-testid={`text-epic-summary-${epic.id}`}>{epic.summary}</CardTitle>
                      {epic.description && (
                        <p className="text-sm text-muted-foreground" data-testid={`text-epic-description-${epic.id}`}>{epic.description}</p>
                      )}
                    </div>
                    <Badge variant="secondary" data-testid={`badge-story-count-${epic.id}`}>
                      {epic.storyCount || 0} stories
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
            {epics.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground" data-testid="text-no-epics">No epics created yet. Click "Create Epic" to get started.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="stories" className="space-y-4">
          <div className="grid gap-4">
            {stories.map(story => (
              <Card key={story.id} data-testid={`card-story-${story.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" data-testid={`badge-story-key-${story.id}`}>{story.key}</Badge>
                        <Badge className={statusColors[story.status as keyof typeof statusColors]} data-testid={`badge-story-status-${story.id}`}>
                          {story.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={priorityColors[story.priority as keyof typeof priorityColors]} data-testid={`badge-story-priority-${story.id}`}>
                          {story.priority}
                        </Badge>
                      </div>
                      <CardTitle data-testid={`text-story-summary-${story.id}`}>{story.summary}</CardTitle>
                    </div>
                    {story.storyPoints && (
                      <Badge variant="secondary" data-testid={`badge-story-points-${story.id}`}>
                        {story.storyPoints} pts
                      </Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
            {stories.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground" data-testid="text-no-stories">No stories created yet. Click "Create Story" to get started.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
