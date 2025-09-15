/**
 * ESA Life CEO 61x21 - Agent Interaction Tracking
 * Specialized tracking for Life CEO agent interactions
 */

import { monitoring } from './index';

export interface AgentMetrics {
  agentName: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  interactions: AgentInteraction[];
  performance: AgentPerformanceMetrics;
}

export interface AgentInteraction {
  timestamp: Date;
  action: string;
  inputTokens?: number;
  outputTokens?: number;
  responseTime?: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface AgentPerformanceMetrics {
  totalInteractions: number;
  successRate: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  userSatisfactionScore?: number;
}

class LifeCEOTracker {
  private activeAgents: Map<string, AgentMetrics> = new Map();
  private sessionStartTime = new Date();

  /**
   * Start tracking an agent session
   */
  startAgentSession(agentName: string, sessionId: string): void {
    const metrics: AgentMetrics = {
      agentName,
      sessionId,
      startTime: new Date(),
      interactions: [],
      performance: {
        totalInteractions: 0,
        successRate: 0,
        averageResponseTime: 0,
        totalTokensUsed: 0
      }
    };

    this.activeAgents.set(sessionId, metrics);

    monitoring.trackEvent('lifeceo_agent_session_start', {
      agent_name: agentName,
      session_id: sessionId,
      framework_version: '61x21'
    });
  }

  /**
   * Track an agent interaction
   */
  trackInteraction(
    sessionId: string,
    action: string,
    options: {
      inputTokens?: number;
      outputTokens?: number;
      responseTime?: number;
      success?: boolean;
      error?: string;
      metadata?: Record<string, any>;
    } = {}
  ): void {
    const agent = this.activeAgents.get(sessionId);
    if (!agent) {
      console.warn(`[LifeCEO] No active session found for ${sessionId}`);
      return;
    }

    const interaction: AgentInteraction = {
      timestamp: new Date(),
      action,
      inputTokens: options.inputTokens,
      outputTokens: options.outputTokens,
      responseTime: options.responseTime,
      success: options.success ?? true,
      error: options.error,
      metadata: options.metadata
    };

    agent.interactions.push(interaction);
    this.updatePerformanceMetrics(agent);

    // Track in monitoring services
    monitoring.trackAgentInteraction(agent.agentName, action, {
      session_id: sessionId,
      input_tokens: options.inputTokens,
      output_tokens: options.outputTokens,
      response_time_ms: options.responseTime,
      success: options.success,
      error: options.error,
      ...options.metadata
    });

    // Track specific events for important actions
    this.trackSpecializedEvents(agent.agentName, action, options);
  }

  /**
   * Track specialized events based on agent and action
   */
  private trackSpecializedEvents(
    agentName: string,
    action: string,
    options: any
  ): void {
    // Track specific agent patterns
    switch (agentName.toLowerCase()) {
      case 'profile':
        if (action === 'profile_completed') {
          monitoring.trackEvent('user_activation_milestone', {
            milestone: 'profile_completion',
            tokens_used: options.outputTokens
          });
        }
        break;

      case 'events':
        if (action === 'event_created') {
          monitoring.trackEvent('content_creation', {
            content_type: 'event',
            ai_assisted: true,
            tokens_used: options.outputTokens
          });
        }
        break;

      case 'housing':
        if (action === 'listing_optimized') {
          monitoring.trackEvent('ai_optimization', {
            optimization_type: 'housing_listing',
            improvement_score: options.metadata?.improvementScore
          });
        }
        break;

      case 'social':
        if (action === 'connection_suggested') {
          monitoring.trackEvent('ai_recommendation', {
            recommendation_type: 'social_connection',
            accepted: options.metadata?.accepted
          });
        }
        break;

      case 'analytics':
        if (action === 'insight_generated') {
          monitoring.trackEvent('ai_insight', {
            insight_type: options.metadata?.insightType,
            actionable: options.metadata?.actionable
          });
        }
        break;
    }

    // Track token usage for cost monitoring
    if (options.inputTokens || options.outputTokens) {
      monitoring.trackEvent('ai_token_usage', {
        agent_name: agentName,
        input_tokens: options.inputTokens || 0,
        output_tokens: options.outputTokens || 0,
        total_tokens: (options.inputTokens || 0) + (options.outputTokens || 0),
        estimated_cost: this.estimateTokenCost(
          (options.inputTokens || 0) + (options.outputTokens || 0)
        )
      });
    }

    // Track errors for debugging
    if (options.error) {
      monitoring.captureException(new Error(options.error), {
        agent_name: agentName,
        action: action,
        session_id: options.metadata?.sessionId
      });
    }
  }

  /**
   * Update performance metrics for an agent
   */
  private updatePerformanceMetrics(agent: AgentMetrics): void {
    const interactions = agent.interactions;
    const successful = interactions.filter(i => i.success).length;
    const totalResponseTime = interactions.reduce((sum, i) => sum + (i.responseTime || 0), 0);
    const totalTokens = interactions.reduce(
      (sum, i) => sum + (i.inputTokens || 0) + (i.outputTokens || 0),
      0
    );

    agent.performance = {
      totalInteractions: interactions.length,
      successRate: interactions.length > 0 ? (successful / interactions.length) * 100 : 0,
      averageResponseTime: interactions.length > 0 ? totalResponseTime / interactions.length : 0,
      totalTokensUsed: totalTokens,
      userSatisfactionScore: agent.performance.userSatisfactionScore
    };
  }

  /**
   * End an agent session
   */
  endAgentSession(sessionId: string, satisfactionScore?: number): void {
    const agent = this.activeAgents.get(sessionId);
    if (!agent) return;

    agent.endTime = new Date();
    
    if (satisfactionScore !== undefined) {
      agent.performance.userSatisfactionScore = satisfactionScore;
    }

    // Track session end with complete metrics
    monitoring.trackEvent('lifeceo_agent_session_end', {
      agent_name: agent.agentName,
      session_id: sessionId,
      duration_ms: agent.endTime.getTime() - agent.startTime.getTime(),
      total_interactions: agent.performance.totalInteractions,
      success_rate: agent.performance.successRate,
      average_response_time: agent.performance.averageResponseTime,
      total_tokens_used: agent.performance.totalTokensUsed,
      user_satisfaction: agent.performance.userSatisfactionScore,
      framework_version: '61x21'
    });

    // Clean up
    this.activeAgents.delete(sessionId);
  }

  /**
   * Track agent framework performance
   */
  trackFrameworkPerformance(): void {
    const activeAgentCount = this.activeAgents.size;
    const totalInteractions = Array.from(this.activeAgents.values()).reduce(
      (sum, agent) => sum + agent.performance.totalInteractions,
      0
    );

    monitoring.trackEvent('lifeceo_framework_metrics', {
      active_agents: activeAgentCount,
      total_interactions: totalInteractions,
      uptime_ms: Date.now() - this.sessionStartTime.getTime(),
      framework_version: '61x21',
      agent_distribution: this.getAgentDistribution()
    });
  }

  /**
   * Get distribution of active agents
   */
  private getAgentDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    this.activeAgents.forEach(agent => {
      distribution[agent.agentName] = (distribution[agent.agentName] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Estimate token cost (simplified calculation)
   */
  private estimateTokenCost(tokens: number): number {
    // Rough estimate: $0.002 per 1K tokens for GPT-3.5
    return (tokens / 1000) * 0.002;
  }

  /**
   * Track agent collaboration
   */
  trackAgentCollaboration(
    primaryAgent: string,
    secondaryAgent: string,
    action: string,
    metadata?: Record<string, any>
  ): void {
    monitoring.trackEvent('lifeceo_agent_collaboration', {
      primary_agent: primaryAgent,
      secondary_agent: secondaryAgent,
      collaboration_action: action,
      framework_version: '61x21',
      ...metadata
    });
  }

  /**
   * Track agent learning/improvement
   */
  trackAgentImprovement(
    agentName: string,
    metric: string,
    improvement: number,
    metadata?: Record<string, any>
  ): void {
    monitoring.trackEvent('lifeceo_agent_improvement', {
      agent_name: agentName,
      improvement_metric: metric,
      improvement_percentage: improvement,
      framework_version: '61x21',
      ...metadata
    });
  }

  /**
   * Get current agent metrics
   */
  getAgentMetrics(sessionId: string): AgentMetrics | undefined {
    return this.activeAgents.get(sessionId);
  }

  /**
   * Get all active agent metrics
   */
  getAllAgentMetrics(): AgentMetrics[] {
    return Array.from(this.activeAgents.values());
  }
}

// Export singleton instance
export const lifeCEOTracker = new LifeCEOTracker();

// Export convenience functions
export function trackAgentStart(agentName: string, sessionId: string): void {
  lifeCEOTracker.startAgentSession(agentName, sessionId);
}

export function trackAgentAction(
  sessionId: string,
  action: string,
  options?: any
): void {
  lifeCEOTracker.trackInteraction(sessionId, action, options);
}

export function trackAgentEnd(sessionId: string, satisfaction?: number): void {
  lifeCEOTracker.endAgentSession(sessionId, satisfaction);
}

export function trackFrameworkHealth(): void {
  lifeCEOTracker.trackFrameworkPerformance();
}

// Auto-track framework health every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    trackFrameworkHealth();
  }, 5 * 60 * 1000);
}