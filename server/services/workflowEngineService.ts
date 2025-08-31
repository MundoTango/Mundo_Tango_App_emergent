/**
 * ESA LIFE CEO 61x21 - Layer 20: Workflow Engine Service
 * Business processes, automation flows, event-driven workflows
 */

import { EventEmitter } from 'events';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'condition' | 'action' | 'delay' | 'approval' | 'notification' | 'integration';
  config: Record<string, any>;
  nextSteps: string[];
  onError?: string;
  timeout?: number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'user_management' | 'content' | 'events' | 'payments' | 'community';
  trigger: {
    type: 'manual' | 'event' | 'schedule' | 'webhook';
    config: Record<string, any>;
  };
  steps: WorkflowStep[];
  variables: Record<string, any>;
  status: 'active' | 'inactive' | 'draft';
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  currentStep: string;
  context: Record<string, any>;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  executionLog: WorkflowLogEntry[];
}

export interface WorkflowLogEntry {
  stepId: string;
  stepName: string;
  timestamp: Date;
  status: 'started' | 'completed' | 'failed' | 'skipped';
  input?: any;
  output?: any;
  error?: string;
  duration?: number;
}

class WorkflowEngineService extends EventEmitter {
  private workflows = new Map<string, Workflow>();
  private executions = new Map<string, WorkflowExecution>();
  private activeExecutions = new Set<string>();
  private scheduledWorkflows = new Map<string, NodeJS.Timeout>();

  constructor() {
    super();
    this.setupDefaultWorkflows();
    console.log('[ESA Layer 20] Workflow engine service initialized');
  }

  private setupDefaultWorkflows() {
    const workflows: Workflow[] = [
      {
        id: 'user_onboarding',
        name: 'New User Onboarding',
        description: 'Automated onboarding process for new Mundo Tango users',
        category: 'user_management',
        trigger: {
          type: 'event',
          config: { event: 'user.registered' }
        },
        steps: [
          {
            id: 'send_welcome_email',
            name: 'Send Welcome Email',
            type: 'notification',
            config: { template: 'welcome', channel: 'email' },
            nextSteps: ['create_default_profile']
          },
          {
            id: 'create_default_profile',
            name: 'Create Default Profile',
            type: 'action',
            config: { action: 'create_profile', defaults: { bio: 'New to tango', interests: ['tango', 'music'] } },
            nextSteps: ['suggest_communities']
          },
          {
            id: 'suggest_communities',
            name: 'Suggest Local Communities',
            type: 'action',
            config: { action: 'suggest_groups', based_on: 'location' },
            nextSteps: ['schedule_follow_up']
          },
          {
            id: 'schedule_follow_up',
            name: 'Schedule Follow-up',
            type: 'delay',
            config: { delay: '7d' },
            nextSteps: ['send_engagement_email']
          },
          {
            id: 'send_engagement_email',
            name: 'Send Engagement Email',
            type: 'notification',
            config: { template: 'week_one_tips', channel: 'email' },
            nextSteps: []
          }
        ],
        variables: { user_id: '', location: '', email: '' },
        status: 'active',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      },
      {
        id: 'event_publication',
        name: 'Event Publication Workflow',
        description: 'Process for publishing and promoting tango events',
        category: 'events',
        trigger: {
          type: 'event',
          config: { event: 'event.created' }
        },
        steps: [
          {
            id: 'validate_event',
            name: 'Validate Event Details',
            type: 'condition',
            config: { 
              conditions: ['has_title', 'has_date', 'has_location', 'has_valid_organizer']
            },
            nextSteps: ['check_duplicate'],
            onError: 'reject_event'
          },
          {
            id: 'check_duplicate',
            name: 'Check for Duplicates',
            type: 'condition',
            config: { action: 'check_duplicate_events', threshold: 0.8 },
            nextSteps: ['auto_approve_or_review'],
            onError: 'manual_review'
          },
          {
            id: 'auto_approve_or_review',
            name: 'Auto-Approve or Flag for Review',
            type: 'condition',
            config: { 
              conditions: ['organizer_verified', 'venue_known', 'content_appropriate']
            },
            nextSteps: ['publish_event'],
            onError: 'manual_review'
          },
          {
            id: 'manual_review',
            name: 'Manual Review Required',
            type: 'approval',
            config: { 
              approvers: ['event_moderator'], 
              timeout: '24h',
              escalation: 'admin'
            },
            nextSteps: ['publish_event'],
            onError: 'reject_event'
          },
          {
            id: 'publish_event',
            name: 'Publish Event',
            type: 'action',
            config: { action: 'publish_event', notify_followers: true },
            nextSteps: ['notify_community']
          },
          {
            id: 'notify_community',
            name: 'Notify Community',
            type: 'notification',
            config: { 
              template: 'new_event_notification',
              audience: 'nearby_users',
              radius: '50km'
            },
            nextSteps: ['schedule_reminders']
          },
          {
            id: 'schedule_reminders',
            name: 'Schedule Event Reminders',
            type: 'action',
            config: { 
              reminders: [
                { time: '24h_before', template: 'event_reminder_1d' },
                { time: '2h_before', template: 'event_reminder_2h' }
              ]
            },
            nextSteps: []
          },
          {
            id: 'reject_event',
            name: 'Reject Event',
            type: 'action',
            config: { action: 'reject_event', notify_organizer: true },
            nextSteps: []
          }
        ],
        variables: { event_id: '', organizer_id: '', location: '' },
        status: 'active',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      },
      {
        id: 'content_moderation',
        name: 'Content Moderation Workflow',
        description: 'Automated content review and moderation process',
        category: 'content',
        trigger: {
          type: 'event',
          config: { event: 'content.created' }
        },
        steps: [
          {
            id: 'auto_moderate',
            name: 'Automatic Moderation Check',
            type: 'action',
            config: { action: 'run_content_moderation', ai_check: true },
            nextSteps: ['check_moderation_score']
          },
          {
            id: 'check_moderation_score',
            name: 'Check Moderation Score',
            type: 'condition',
            config: { condition: 'moderation_score > 80' },
            nextSteps: ['auto_approve'],
            onError: 'flag_for_review'
          },
          {
            id: 'auto_approve',
            name: 'Auto-Approve Content',
            type: 'action',
            config: { action: 'approve_content', publish: true },
            nextSteps: []
          },
          {
            id: 'flag_for_review',
            name: 'Flag for Manual Review',
            type: 'action',
            config: { action: 'flag_content', priority: 'based_on_score' },
            nextSteps: ['manual_review']
          },
          {
            id: 'manual_review',
            name: 'Manual Review',
            type: 'approval',
            config: {
              approvers: ['content_moderator'],
              timeout: '2h',
              escalation: 'senior_moderator'
            },
            nextSteps: [],
            onError: 'escalate_review'
          },
          {
            id: 'escalate_review',
            name: 'Escalate to Senior Moderator',
            type: 'approval',
            config: {
              approvers: ['senior_moderator'],
              timeout: '24h'
            },
            nextSteps: []
          }
        ],
        variables: { content_id: '', author_id: '', content_type: '' },
        status: 'active',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      },
      {
        id: 'community_engagement',
        name: 'Weekly Community Engagement',
        description: 'Automated weekly community engagement and analytics',
        category: 'community',
        trigger: {
          type: 'schedule',
          config: { cron: '0 9 * * 1' } // Every Monday at 9 AM
        },
        steps: [
          {
            id: 'generate_analytics',
            name: 'Generate Weekly Analytics',
            type: 'action',
            config: { action: 'generate_community_stats', period: '1week' },
            nextSteps: ['identify_top_contributors']
          },
          {
            id: 'identify_top_contributors',
            name: 'Identify Top Contributors',
            type: 'action',
            config: { action: 'rank_users', criteria: ['posts', 'events', 'engagement'] },
            nextSteps: ['send_digest']
          },
          {
            id: 'send_digest',
            name: 'Send Community Digest',
            type: 'notification',
            config: {
              template: 'weekly_community_digest',
              audience: 'all_users',
              personalize: true
            },
            nextSteps: ['schedule_featured_content']
          },
          {
            id: 'schedule_featured_content',
            name: 'Schedule Featured Content',
            type: 'action',
            config: { action: 'feature_top_content', duration: '7d' },
            nextSteps: []
          }
        ],
        variables: {},
        status: 'active',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      }
    ];

    workflows.forEach(workflow => {
      this.workflows.set(workflow.id, workflow);
      if (workflow.trigger.type === 'schedule') {
        this.scheduleWorkflow(workflow);
      }
    });

    console.log(`[ESA Layer 20] Loaded ${workflows.length} default workflows`);
  }

  async triggerWorkflow(
    workflowId: string,
    context: Record<string, any> = {},
    triggeredBy?: string
  ): Promise<string | null> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || workflow.status !== 'active') {
      console.error(`[ESA Layer 20] Workflow not found or inactive: ${workflowId}`);
      return null;
    }

    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'running',
      currentStep: workflow.steps[0]?.id || '',
      context: { ...workflow.variables, ...context },
      startedAt: new Date(),
      executionLog: []
    };

    this.executions.set(executionId, execution);
    this.activeExecutions.add(executionId);

    console.log(`[ESA Layer 20] Started workflow execution ${executionId} for workflow ${workflowId}`);
    this.emit('workflowStarted', execution, triggeredBy);

    // Start execution
    this.executeWorkflow(executionId);

    return executionId;
  }

  private async executeWorkflow(executionId: string) {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    const workflow = this.workflows.get(execution.workflowId);
    if (!workflow) return;

    try {
      while (execution.currentStep && execution.status === 'running') {
        const step = workflow.steps.find(s => s.id === execution.currentStep);
        if (!step) {
          execution.status = 'failed';
          execution.error = `Step not found: ${execution.currentStep}`;
          break;
        }

        const stepResult = await this.executeStep(execution, step);
        
        if (stepResult.status === 'failed') {
          execution.status = 'failed';
          execution.error = stepResult.error;
          
          // Handle error flow
          if (step.onError) {
            execution.currentStep = step.onError;
            execution.status = 'running';
            continue;
          }
          break;
        }

        // Determine next step
        if (step.nextSteps.length === 0) {
          // Workflow complete
          execution.status = 'completed';
          execution.completedAt = new Date();
          break;
        } else if (step.nextSteps.length === 1) {
          execution.currentStep = step.nextSteps[0];
        } else {
          // Multiple next steps - use condition result
          execution.currentStep = stepResult.nextStep || step.nextSteps[0];
        }
      }

      this.activeExecutions.delete(executionId);
      this.emit('workflowCompleted', execution);
      
      console.log(`[ESA Layer 20] Workflow execution ${executionId} ${execution.status}`);

    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      execution.completedAt = new Date();
      
      this.activeExecutions.delete(executionId);
      this.emit('workflowFailed', execution, error);
      
      console.error(`[ESA Layer 20] Workflow execution ${executionId} failed:`, error);
    }
  }

  private async executeStep(
    execution: WorkflowExecution,
    step: WorkflowStep
  ): Promise<{ status: 'completed' | 'failed'; nextStep?: string; error?: string; output?: any }> {
    const startTime = Date.now();
    
    const logEntry: WorkflowLogEntry = {
      stepId: step.id,
      stepName: step.name,
      timestamp: new Date(),
      status: 'started'
    };

    execution.executionLog.push(logEntry);
    
    try {
      let result: any = null;
      let nextStep: string | undefined;

      switch (step.type) {
        case 'action':
          result = await this.executeAction(step.config, execution.context);
          break;
          
        case 'condition':
          const conditionResult = await this.evaluateCondition(step.config, execution.context);
          result = conditionResult.result;
          nextStep = conditionResult.nextStep;
          break;
          
        case 'delay':
          await this.executeDelay(step.config);
          result = { delayed: true };
          break;
          
        case 'notification':
          result = await this.executeNotification(step.config, execution.context);
          break;
          
        case 'approval':
          result = await this.executeApproval(step.config, execution.context);
          break;
          
        case 'integration':
          result = await this.executeIntegration(step.config, execution.context);
          break;
          
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      logEntry.status = 'completed';
      logEntry.output = result;
      logEntry.duration = Date.now() - startTime;

      return { status: 'completed', nextStep, output: result };

    } catch (error) {
      logEntry.status = 'failed';
      logEntry.error = error instanceof Error ? error.message : String(error);
      logEntry.duration = Date.now() - startTime;

      return { 
        status: 'failed', 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  private async executeAction(config: any, context: Record<string, any>): Promise<any> {
    const { action } = config;
    
    switch (action) {
      case 'create_profile':
        console.log(`[ESA Layer 20] Creating default profile for user ${context.user_id}`);
        return { profile_created: true, defaults_applied: config.defaults };
        
      case 'suggest_groups':
        console.log(`[ESA Layer 20] Suggesting groups based on ${config.based_on}`);
        return { suggested_groups: ['Buenos Aires Tango', 'Local Milonga Group'] };
        
      case 'publish_event':
        console.log(`[ESA Layer 20] Publishing event ${context.event_id}`);
        return { published: true, notify_followers: config.notify_followers };
        
      case 'run_content_moderation':
        console.log(`[ESA Layer 20] Running content moderation for ${context.content_id}`);
        // Simulate moderation score
        const score = Math.floor(Math.random() * 40) + 60; // 60-100
        return { moderation_score: score, ai_checked: config.ai_check };
        
      case 'approve_content':
        console.log(`[ESA Layer 20] Approving content ${context.content_id}`);
        return { approved: true, published: config.publish };
        
      case 'generate_community_stats':
        console.log(`[ESA Layer 20] Generating community stats for ${config.period}`);
        return {
          period: config.period,
          stats: { posts: 150, events: 12, new_users: 25, engagement: 85 }
        };
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async evaluateCondition(
    config: any, 
    context: Record<string, any>
  ): Promise<{ result: boolean; nextStep?: string }> {
    if (config.condition) {
      // Simple condition evaluation
      const condition = config.condition;
      
      if (condition === 'moderation_score > 80') {
        const score = context.moderation_score || 0;
        return { result: score > 80 };
      }
      
      // Add more condition types as needed
      return { result: true };
    }
    
    if (config.conditions) {
      // Multiple conditions (AND logic)
      const conditions = config.conditions as string[];
      let allPassed = true;
      
      for (const condition of conditions) {
        switch (condition) {
          case 'has_title':
            if (!context.title) allPassed = false;
            break;
          case 'has_date':
            if (!context.date) allPassed = false;
            break;
          case 'organizer_verified':
            // Simulate verification check
            allPassed = Math.random() > 0.2; // 80% pass rate
            break;
          default:
            allPassed = true; // Unknown conditions pass by default
        }
        
        if (!allPassed) break;
      }
      
      return { result: allPassed };
    }
    
    return { result: true };
  }

  private async executeDelay(config: any): Promise<void> {
    const { delay } = config;
    let milliseconds = 0;
    
    if (typeof delay === 'string') {
      // Parse delay string (e.g., '7d', '2h', '30m', '10s')
      const match = delay.match(/^(\d+)([smhd])$/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        
        switch (unit) {
          case 's': milliseconds = value * 1000; break;
          case 'm': milliseconds = value * 60 * 1000; break;
          case 'h': milliseconds = value * 60 * 60 * 1000; break;
          case 'd': milliseconds = value * 24 * 60 * 60 * 1000; break;
        }
      }
    }
    
    // For demo purposes, limit delay to 5 seconds max
    milliseconds = Math.min(milliseconds, 5000);
    
    if (milliseconds > 0) {
      await new Promise(resolve => setTimeout(resolve, milliseconds));
    }
  }

  private async executeNotification(config: any, context: Record<string, any>): Promise<any> {
    console.log(`[ESA Layer 20] Sending notification: template=${config.template}, channel=${config.channel}`);
    
    // This would integrate with the notification service (Layer 16)
    return {
      notification_sent: true,
      template: config.template,
      channel: config.channel,
      recipient: context.user_id || context.author_id
    };
  }

  private async executeApproval(config: any, context: Record<string, any>): Promise<any> {
    console.log(`[ESA Layer 20] Approval step: approvers=${config.approvers.join(', ')}`);
    
    // Simulate approval process
    const approved = Math.random() > 0.3; // 70% approval rate
    
    return {
      approved,
      approvers: config.approvers,
      timeout: config.timeout,
      decision_time: new Date()
    };
  }

  private async executeIntegration(config: any, context: Record<string, any>): Promise<any> {
    console.log(`[ESA Layer 20] Integration step: ${JSON.stringify(config)}`);
    
    // This would integrate with external services
    return { integration_completed: true };
  }

  private scheduleWorkflow(workflow: Workflow) {
    if (workflow.trigger.type === 'schedule' && workflow.trigger.config.cron) {
      // Simplified cron parsing for demo
      const cronPattern = workflow.trigger.config.cron;
      console.log(`[ESA Layer 20] Scheduled workflow ${workflow.id} with pattern: ${cronPattern}`);
      
      // For demo, schedule to run every hour (in production, use proper cron library)
      const interval = setInterval(() => {
        this.triggerWorkflow(workflow.id, {}, 'scheduler');
      }, 60 * 60 * 1000);
      
      this.scheduledWorkflows.set(workflow.id, interval);
    }
  }

  // Workflow management methods
  async createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newWorkflow: Workflow = {
      ...workflow,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.workflows.set(id, newWorkflow);
    
    if (newWorkflow.trigger.type === 'schedule' && newWorkflow.status === 'active') {
      this.scheduleWorkflow(newWorkflow);
    }

    this.emit('workflowCreated', newWorkflow);
    console.log(`[ESA Layer 20] Created workflow: ${id} - ${workflow.name}`);

    return id;
  }

  async updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    // Clear existing schedule if trigger changed
    if (updates.trigger && this.scheduledWorkflows.has(workflowId)) {
      clearInterval(this.scheduledWorkflows.get(workflowId)!);
      this.scheduledWorkflows.delete(workflowId);
    }

    const updatedWorkflow = { ...workflow, ...updates, updatedAt: new Date() };
    this.workflows.set(workflowId, updatedWorkflow);

    // Reschedule if needed
    if (updatedWorkflow.trigger.type === 'schedule' && updatedWorkflow.status === 'active') {
      this.scheduleWorkflow(updatedWorkflow);
    }

    this.emit('workflowUpdated', updatedWorkflow);
    console.log(`[ESA Layer 20] Updated workflow: ${workflowId}`);

    return true;
  }

  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  getWorkflows(category?: string): Workflow[] {
    const workflows = Array.from(this.workflows.values());
    return category ? workflows.filter(w => w.category === category) : workflows;
  }

  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  getExecutions(workflowId?: string): WorkflowExecution[] {
    const executions = Array.from(this.executions.values());
    return workflowId ? executions.filter(e => e.workflowId === workflowId) : executions;
  }

  async cancelExecution(executionId: string): Promise<boolean> {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'running') return false;

    execution.status = 'cancelled';
    execution.completedAt = new Date();
    this.activeExecutions.delete(executionId);

    this.emit('workflowCancelled', execution);
    console.log(`[ESA Layer 20] Cancelled workflow execution: ${executionId}`);

    return true;
  }

  getSystemMetrics() {
    const executions = Array.from(this.executions.values());
    const last24h = executions.filter(e => 
      e.startedAt.getTime() > Date.now() - 24 * 60 * 60 * 1000
    );

    return {
      totalWorkflows: this.workflows.size,
      activeWorkflows: Array.from(this.workflows.values()).filter(w => w.status === 'active').length,
      totalExecutions: executions.length,
      activeExecutions: this.activeExecutions.size,
      scheduledWorkflows: this.scheduledWorkflows.size,
      last24Hours: {
        executions: last24h.length,
        completed: last24h.filter(e => e.status === 'completed').length,
        failed: last24h.filter(e => e.status === 'failed').length
      },
      averageExecutionTime: this.calculateAverageExecutionTime(executions)
    };
  }

  private calculateAverageExecutionTime(executions: WorkflowExecution[]): number {
    const completedExecutions = executions.filter(e => e.completedAt && e.status === 'completed');
    if (completedExecutions.length === 0) return 0;

    const totalTime = completedExecutions.reduce((acc, e) => {
      return acc + (e.completedAt!.getTime() - e.startedAt.getTime());
    }, 0);

    return totalTime / completedExecutions.length;
  }
}

export const workflowEngineService = new WorkflowEngineService();

// Export for Layer 57 (Automation Management) integration
export const setupWorkflowAutomation = () => {
  // Monitor workflow performance every 10 minutes
  setInterval(() => {
    const metrics = workflowEngineService.getSystemMetrics();
    if (metrics.activeExecutions > 50) {
      console.log(`[ESA Layer 20] High workflow load: ${metrics.activeExecutions} active executions`);
    }
    
    if (metrics.last24Hours.failed > metrics.last24Hours.completed * 0.1) {
      console.log(`[ESA Layer 20] High failure rate: ${metrics.last24Hours.failed} failures in last 24h`);
    }
  }, 10 * 60 * 1000);

  // Clean up old executions every day
  setInterval(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let cleaned = 0;
    
    for (const [id, execution] of workflowEngineService['executions'].entries()) {
      if (execution.startedAt < sevenDaysAgo && execution.status !== 'running') {
        workflowEngineService['executions'].delete(id);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`[ESA Layer 20] Cleaned up ${cleaned} old workflow executions`);
    }
  }, 24 * 60 * 60 * 1000);
};