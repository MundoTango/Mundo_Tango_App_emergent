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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Plus, Check, Clock, FileCode, AlertTriangle, Target, Users, Shield, Link2, CheckSquare, Code, FileText, Layers, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AgentSelector, MultiAgentSelector } from '@/components/tracker/AgentSelector';
import { CodeLinkInput, CodeLinkDisplay } from '@/components/tracker/CodeLinkInput';
import { GitHubIssueLink, SyncToGitHubButton, GitHubPRBadge, LinkPRButton } from '@/components/admin/GitHubIntegration';
import AdminLayout from '@/components/admin/AdminLayout';

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
      <div className="container mx-auto space-y-6" data-testid="page-story-detail">
        {/* Breadcrumbs */}
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
            <div className="flex gap-2">
              <SyncToGitHubButton 
                storyId={story.id} 
                storyKey={story.key} 
                existingIssueNumber={story.githubIssueNumber}
              />
              <Button onClick={() => navigate(story.epicId ? `/admin/projects/epic/${story.epicId}` : '/admin/projects')} variant="outline" data-testid="button-back">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>

          {/* GitHub Integration */}
          {(story.githubIssueNumber || story.githubIssueUrl) && (
            <GitHubIssueLink 
              issueNumber={story.githubIssueNumber}
              issueUrl={story.githubIssueUrl}
              repoName={story.githubRepoName}
              syncedAt={story.githubSyncedAt}
            />
          )}

          {/* ESA Human Review Metadata - 9 Sections with Mobile Accordion */}
          {story.metadata && Object.keys(story.metadata).length > 0 && (
            <div className="mt-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-turquoise-600 dark:text-turquoise-400" />
                ESA Human Review Metadata
              </h2>
              
              {/* Desktop: Card Layout */}
              <div className="hidden md:block space-y-4">

              {/* 1. Review Category & Notes */}
              {(story.metadata.review_category || story.metadata.review_notes) && (
                <GlassCard className="glassmorphic-card p-5">
                  {story.metadata.review_category && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm px-3 py-1 mb-3">
                      {story.metadata.review_category}
                    </Badge>
                  )}
                  {story.metadata.review_notes && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Review Notes</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{story.metadata.review_notes}</p>
                      </div>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* 2. Documentation Links */}
              {story.metadata.documentation_links && story.metadata.documentation_links.length > 0 && (
                <GlassCard className="glassmorphic-card p-5">
                  <div className="flex items-start gap-3">
                    <Link2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Documentation Links</h3>
                      <ul className="space-y-2">
                        {story.metadata.documentation_links.map((link, idx) => (
                          <li key={idx}>
                            <a 
                              href={link.startsWith('http') ? link : `/${link}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                            >
                              📄 {link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* 3. ESA Layers */}
              {story.metadata.esa_layers && story.metadata.esa_layers.length > 0 && (
                <GlassCard className="glassmorphic-card p-5">
                  <div className="flex items-start gap-3">
                    <Layers className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">ESA Layers Affected</h3>
                      <div className="flex flex-wrap gap-2">
                        {story.metadata.esa_layers.map(layer => (
                          <Badge key={layer} variant="outline" className="border-cyan-500 text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/20">
                            Layer {layer}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* 4. Quality Metrics */}
              {(story.metadata.current_metrics || story.metadata.target_metrics) && (
                <GlassCard className="glassmorphic-card p-5">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quality Metrics</h3>
                      {story.metadata.gap_percentage !== undefined && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Current Progress</span>
                            <span className="text-gray-900 dark:text-white font-medium">{100 - story.metadata.gap_percentage}%</span>
                          </div>
                          <Progress value={100 - story.metadata.gap_percentage} className="h-2 bg-gray-200 dark:bg-gray-700" />
                        </div>
                      )}
                      <div className="grid md:grid-cols-2 gap-4">
                        {story.metadata.current_metrics && Object.keys(story.metadata.current_metrics).length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Current</h4>
                            <div className="text-xs space-y-1">
                              {Object.entries(story.metadata.current_metrics).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                                  <span className="text-gray-900 dark:text-white font-medium">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {story.metadata.target_metrics && Object.keys(story.metadata.target_metrics).length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Target</h4>
                            <div className="text-xs space-y-1">
                              {Object.entries(story.metadata.target_metrics).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                                  <span className="text-green-600 dark:text-green-400 font-medium">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* 5. Risk Assessment */}
              {(story.metadata.risk_level || story.metadata.risk_description) && (
                <GlassCard className="glassmorphic-card p-5">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Risk Assessment</h3>
                        {story.metadata.risk_level && (
                          <Badge className={
                            story.metadata.risk_level === 'critical' ? 'bg-red-600 text-white' :
                            story.metadata.risk_level === 'high' ? 'bg-orange-600 text-white' :
                            story.metadata.risk_level === 'medium' ? 'bg-yellow-600 text-white' :
                            'bg-green-600 text-white'
                          }>
                            {story.metadata.risk_level.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      {story.metadata.risk_description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">{story.metadata.risk_description}</p>
                      )}
                      {story.metadata.escalation_path && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Escalation: {story.metadata.escalation_path}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* 6. Complexity & Technical Details */}
              {(story.metadata.complexity || story.metadata.technologies || story.metadata.tools_required) && (
                <GlassCard className="glassmorphic-card p-5">
                  <div className="flex items-start gap-3">
                    <Code className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Technical Details</h3>
                        {story.metadata.complexity && (
                          <Badge variant="outline" className="border-indigo-500 text-indigo-700 dark:text-indigo-300">
                            {story.metadata.complexity} complexity
                          </Badge>
                        )}
                      </div>
                      {story.metadata.technologies && story.metadata.technologies.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Technologies</h4>
                          <div className="flex flex-wrap gap-1">
                            {story.metadata.technologies.map((tech, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{tech}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {story.metadata.tools_required && story.metadata.tools_required.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Tools Required</h4>
                          <div className="flex flex-wrap gap-1">
                            {story.metadata.tools_required.map((tool, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{tool}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {story.metadata.affected_files && story.metadata.affected_files.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Affected Files</h4>
                          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            {story.metadata.affected_files.slice(0, 5).map((file, idx) => (
                              <li key={idx} className="font-mono">{file}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* 7. Review Checklist & Acceptance Criteria */}
              {(story.metadata.review_checklist || story.metadata.acceptance_criteria) && (
                <GlassCard className="glassmorphic-card p-5">
                  <div className="flex items-start gap-3">
                    <CheckSquare className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Review Checklist</h3>
                      {story.metadata.review_checklist && story.metadata.review_checklist.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Checklist Items</h4>
                          <ul className="space-y-1">
                            {story.metadata.review_checklist.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="text-teal-600 dark:text-teal-400 mt-0.5">✓</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {story.metadata.acceptance_criteria && story.metadata.acceptance_criteria.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Acceptance Criteria</h4>
                          <ul className="space-y-1">
                            {story.metadata.acceptance_criteria.map((criteria, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="text-green-600 dark:text-green-400 mt-0.5">→</span>
                                {criteria}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* 8. Human Review Workflow */}
              {(story.metadata.manual_testing_required !== undefined || story.metadata.expert_review_needed !== undefined || story.metadata.expert_agents) && (
                <GlassCard className="glassmorphic-card p-5">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Human Review Workflow</h3>
                      <div className="space-y-2 text-sm">
                        {story.metadata.manual_testing_required !== undefined && (
                          <div className="flex items-center gap-2">
                            <Badge variant={story.metadata.manual_testing_required ? "default" : "secondary"}>
                              {story.metadata.manual_testing_required ? 'Manual Testing Required' : 'Automated Testing Only'}
                            </Badge>
                          </div>
                        )}
                        {story.metadata.expert_review_needed !== undefined && (
                          <div className="flex items-center gap-2">
                            <Badge variant={story.metadata.expert_review_needed ? "default" : "secondary"}>
                              {story.metadata.expert_review_needed ? 'Expert Review Needed' : 'Standard Review'}
                            </Badge>
                          </div>
                        )}
                        {story.metadata.expert_agents && story.metadata.expert_agents.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Expert Agents</h4>
                            <div className="flex flex-wrap gap-1">
                              {story.metadata.expert_agents.map(agentNum => (
                                <Badge key={agentNum} className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs">
                                  Agent #{agentNum}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* 9. Compliance Requirements */}
              {story.metadata.compliance_requirements && story.metadata.compliance_requirements.length > 0 && (
                <GlassCard className="glassmorphic-card p-5">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Compliance Requirements</h3>
                      <ul className="space-y-1">
                        {story.metadata.compliance_requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </GlassCard>
              )}
              </div>

              {/* Mobile: Accordion Layout (auto-collapse) */}
              <Accordion type="single" collapsible className="md:hidden space-y-2">
                {/* 1. Review Category & Notes */}
                {(story.metadata.review_category || story.metadata.review_notes) && (
                  <AccordionItem value="review-notes" className="glassmorphic-card border-none">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="font-semibold">Review Notes</span>
                        {story.metadata.review_category && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs ml-2">
                            {story.metadata.review_category}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      {story.metadata.review_notes && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{story.metadata.review_notes}</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* 2. Documentation Links */}
                {story.metadata.documentation_links && story.metadata.documentation_links.length > 0 && (
                  <AccordionItem value="docs" className="glassmorphic-card border-none">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold">Documentation</span>
                        <Badge variant="outline" className="ml-2 text-xs">{story.metadata.documentation_links.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <ul className="space-y-2">
                        {story.metadata.documentation_links.map((link, idx) => (
                          <li key={idx}>
                            <a href={link.startsWith('http') ? link : `/${link}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                              📄 {link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* 3. ESA Layers */}
                {story.metadata.esa_layers && story.metadata.esa_layers.length > 0 && (
                  <AccordionItem value="layers" className="glassmorphic-card border-none">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                        <span className="font-semibold">ESA Layers</span>
                        <Badge variant="outline" className="ml-2 text-xs">{story.metadata.esa_layers.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="flex flex-wrap gap-2">
                        {story.metadata.esa_layers.map(layer => (
                          <Badge key={layer} variant="outline" className="border-cyan-500 text-cyan-700 dark:text-cyan-300">
                            Layer {layer}
                          </Badge>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* 4. Quality Metrics */}
                {(story.metadata.current_metrics || story.metadata.target_metrics) && (
                  <AccordionItem value="metrics" className="glassmorphic-card border-none">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="font-semibold">Quality Metrics</span>
                        {story.metadata.gap_percentage !== undefined && (
                          <Badge variant="outline" className="ml-2 text-xs">{100 - story.metadata.gap_percentage}%</Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      {story.metadata.gap_percentage !== undefined && (
                        <div className="mb-3">
                          <Progress value={100 - story.metadata.gap_percentage} className="h-2" />
                        </div>
                      )}
                      <div className="space-y-3">
                        {story.metadata.current_metrics && (
                          <div>
                            <h4 className="text-xs font-semibold mb-1">Current</h4>
                            <div className="text-xs space-y-1">
                              {Object.entries(story.metadata.current_metrics).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                                  <span className="font-medium">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {story.metadata.target_metrics && (
                          <div>
                            <h4 className="text-xs font-semibold mb-1">Target</h4>
                            <div className="text-xs space-y-1">
                              {Object.entries(story.metadata.target_metrics).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                                  <span className="text-green-600 dark:text-green-400 font-medium">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* 5. Risk Assessment */}
                {(story.metadata.risk_level || story.metadata.risk_description) && (
                  <AccordionItem value="risk" className="glassmorphic-card border-none">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="font-semibold">Risk Assessment</span>
                        {story.metadata.risk_level && (
                          <Badge className={
                            story.metadata.risk_level === 'critical' ? 'bg-red-600' :
                            story.metadata.risk_level === 'high' ? 'bg-orange-600' :
                            story.metadata.risk_level === 'medium' ? 'bg-yellow-600' :
                            'bg-green-600'
                          }>
                            {story.metadata.risk_level.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      {story.metadata.risk_description && (
                        <p className="text-sm mb-2">{story.metadata.risk_description}</p>
                      )}
                      {story.metadata.escalation_path && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t">Escalation: {story.metadata.escalation_path}</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* 6. Technical Details */}
                {(story.metadata.complexity || story.metadata.technologies || story.metadata.tools_required) && (
                  <AccordionItem value="technical" className="glassmorphic-card border-none">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-semibold">Technical Details</span>
                        {story.metadata.complexity && (
                          <Badge variant="outline" className="ml-2 text-xs">{story.metadata.complexity}</Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-3">
                      {story.metadata.technologies && (
                        <div>
                          <h4 className="text-xs font-semibold mb-1">Technologies</h4>
                          <div className="flex flex-wrap gap-1">
                            {story.metadata.technologies.map((tech, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{tech}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {story.metadata.tools_required && (
                        <div>
                          <h4 className="text-xs font-semibold mb-1">Tools</h4>
                          <div className="flex flex-wrap gap-1">
                            {story.metadata.tools_required.map((tool, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{tool}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* 7. Review Checklist */}
                {(story.metadata.review_checklist || story.metadata.acceptance_criteria) && (
                  <AccordionItem value="checklist" className="glassmorphic-card border-none">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <span className="font-semibold">Review Checklist</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-3">
                      {story.metadata.review_checklist && (
                        <ul className="space-y-1">
                          {story.metadata.review_checklist.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-teal-600 dark:text-teal-400">✓</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                      {story.metadata.acceptance_criteria && (
                        <ul className="space-y-1">
                          {story.metadata.acceptance_criteria.map((criteria, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-green-600 dark:text-green-400">→</span>
                              {criteria}
                            </li>
                          ))}
                        </ul>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* 8. Human Review Workflow */}
                {(story.metadata.manual_testing_required !== undefined || story.metadata.expert_review_needed !== undefined || story.metadata.expert_agents) && (
                  <AccordionItem value="workflow" className="glassmorphic-card border-none">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        <span className="font-semibold">Human Review</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-2">
                      {story.metadata.manual_testing_required !== undefined && (
                        <Badge variant={story.metadata.manual_testing_required ? "default" : "secondary"} className="text-xs">
                          {story.metadata.manual_testing_required ? 'Manual Testing Required' : 'Automated Testing'}
                        </Badge>
                      )}
                      {story.metadata.expert_review_needed !== undefined && (
                        <Badge variant={story.metadata.expert_review_needed ? "default" : "secondary"} className="text-xs">
                          {story.metadata.expert_review_needed ? 'Expert Review Needed' : 'Standard Review'}
                        </Badge>
                      )}
                      {story.metadata.expert_agents && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {story.metadata.expert_agents.map(agentNum => (
                            <Badge key={agentNum} className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs">
                              Agent #{agentNum}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* 9. Compliance */}
                {story.metadata.compliance_requirements && story.metadata.compliance_requirements.length > 0 && (
                  <AccordionItem value="compliance" className="glassmorphic-card border-none">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold">Compliance</span>
                        <Badge variant="outline" className="ml-2 text-xs">{story.metadata.compliance_requirements.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <ul className="space-y-1">
                        {story.metadata.compliance_requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-blue-600 dark:text-blue-400">✓</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          )}

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
        </div>
      </div>
    </AdminLayout>
  );
}
