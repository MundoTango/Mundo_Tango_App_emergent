/**
 * Mundo Tango Agent System - Base Interface
 * Standardized contract for all 276 agents across 13 categories
 * 
 * MB.MD Phase: Agent System Activation
 */

export type AgentStatus = 'operational' | 'inactive' | 'busy' | 'error' | 'maintenance';

export type AgentCategory = 
  | 'ESA Infrastructure' 
  | 'Algorithms' 
  | 'Services' 
  | 'Page Agents'
  | 'Leadership'
  | 'Operational'
  | 'Life CEO'
  | 'Mr Blue'
  | 'Journey Agents'
  | 'UI Sub-Agents'
  | 'Marketing'
  | 'App Leads'
  | 'Hire/Volunteer';

export interface AgentExecutionResult {
  success: boolean;
  message: string;
  data?: unknown;
  context?: unknown;
  error?: string;
  timestamp?: Date;
}

export interface AgentHealth {
  status: AgentStatus;
  health: 'healthy' | 'degraded' | 'unhealthy';
  uptime?: number;
  lastCheck?: Date;
  metrics?: {
    responseTime?: number;
    successRate?: number;
    taskCount?: number;
  };
}

export interface IAgent {
  id: string;
  name: string;
  category: AgentCategory;
  purpose: string;
  status: AgentStatus;
  
  metadata?: Record<string, unknown>;
  
  execute(input: unknown): Promise<AgentExecutionResult>;
  
  getStatus(): Promise<AgentHealth>;
}

export interface AgentRegistry {
  totalAgents: number;
  byCategory: Record<AgentCategory, number>;
  byStatus: Record<AgentStatus, number>;
  agents: IAgent[];
}
