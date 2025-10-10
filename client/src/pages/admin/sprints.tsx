// ESA Agent #63: Sprint Management UI
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, TrendingUp, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const sprintSchema = z.object({
  name: z.string().min(1, "Sprint name is required"),
  goal: z.string().optional(),
  status: z.enum(['planning', 'active', 'completed', 'cancelled']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  velocityTarget: z.number().optional()
});

type Sprint = {
  id: number;
  name: string;
  goal: string | null;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  velocityTarget: number | null;
  actualVelocity: number | null;
  createdAt: Date;
};

export default function SprintManagement() {
  const [createSprintOpen, setCreateSprintOpen] = useState(false);
  const { toast } = useToast();

  const { data: sprintsData } = useQuery<{ data: Sprint[] }>({
    queryKey: ['/api/tracker/sprints'],
  });

  const { data: dashboardData } = useQuery<{ data: any }>({
    queryKey: ['/api/tracker/dashboard'],
  });

  const sprints = sprintsData?.data || [];
  const activeSprint = sprints.find(s => s.status === 'active');
  
  // Mock velocity data for chart
  const velocityData = [
    { sprint: 'Sprint 1', planned: 25, actual: 23 },
    { sprint: 'Sprint 2', planned: 30, actual: 28 },
    { sprint: 'Sprint 3', planned: 28, actual: 30 },
    { sprint: 'Sprint 4', planned: 32, actual: 0 }, // Current sprint
  ];

  const createSprintMutation = useMutation({
    mutationFn: (data: z.infer<typeof sprintSchema>) =>
      apiRequest('/api/tracker/sprints', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tracker/sprints'] });
      setCreateSprintOpen(false);
      toast({ title: 'Sprint created successfully!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error creating sprint', description: error.message, variant: 'destructive' });
    }
  });

  const sprintForm = useForm<z.infer<typeof sprintSchema>>({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      status: 'planning'
    }
  });

  const statusColors = {
    planning: 'bg-gray-500',
    active: 'bg-blue-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500'
  };

  const calculateProgress = (sprint: Sprint) => {
    if (!sprint.startDate || !sprint.endDate) return 0;
    const now = new Date();
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  return (
    <div className="container mx-auto py-6 space-y-6" data-testid="page-sprint-management">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold dark:text-white" data-testid="heading-sprint-management">Sprint Management</h1>
          <p className="text-muted-foreground mt-1">Plan sprints, track velocity, and monitor team capacity</p>
        </div>
        <Dialog open={createSprintOpen} onOpenChange={setCreateSprintOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-sprint">
              <Plus className="mr-2 h-4 w-4" /> Create Sprint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Sprint</DialogTitle>
            </DialogHeader>
            <Form {...sprintForm}>
              <form onSubmit={sprintForm.handleSubmit((data) => createSprintMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={sprintForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sprint Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Sprint 4" {...field} data-testid="input-sprint-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={sprintForm.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sprint Goal</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Complete self-hosted project tracker" {...field} data-testid="textarea-sprint-goal" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={sprintForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-sprint-start" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={sprintForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-sprint-end" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={sprintForm.control}
                  name="velocityTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Velocity Target (Story Points)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="32" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} data-testid="input-velocity-target" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createSprintMutation.isPending} data-testid="button-submit-sprint">
                  {createSprintMutation.isPending ? 'Creating...' : 'Create Sprint'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sprint</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-active-sprint">
              {activeSprint?.name || 'None'}
            </div>
            {activeSprint && (
              <div className="mt-2">
                <Progress value={calculateProgress(activeSprint)} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(calculateProgress(activeSprint))}% complete
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Velocity Target</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-velocity-target">
              {activeSprint?.velocityTarget || 0} pts
            </div>
            <p className="text-xs text-muted-foreground mt-1">Story points planned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Velocity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-avg-velocity">
              27 pts
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 3 sprints</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Velocity Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sprint" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="planned" stroke="#3b82f6" name="Planned" />
              <Line type="monotone" dataKey="actual" stroke="#10b981" name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold dark:text-white">All Sprints</h2>
        {sprints.map(sprint => (
          <Card key={sprint.id} data-testid={`card-sprint-${sprint.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle data-testid={`text-sprint-name-${sprint.id}`}>{sprint.name}</CardTitle>
                    <Badge className={statusColors[sprint.status as keyof typeof statusColors]} data-testid={`badge-sprint-status-${sprint.id}`}>
                      {sprint.status}
                    </Badge>
                  </div>
                  {sprint.goal && (
                    <p className="text-sm text-muted-foreground" data-testid={`text-sprint-goal-${sprint.id}`}>{sprint.goal}</p>
                  )}
                  {sprint.startDate && sprint.endDate && (
                    <p className="text-sm text-muted-foreground">
                      {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" data-testid={`text-sprint-velocity-${sprint.id}`}>
                    {sprint.actualVelocity || sprint.velocityTarget || 0} pts
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {sprint.actualVelocity ? 'Completed' : 'Target'}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
        {sprints.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground" data-testid="text-no-sprints">No sprints created yet. Click "Create Sprint" to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
