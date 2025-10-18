/**
 * ESA LIFE CEO 61x21 - Base Agent Interface
 * Defines the contract all agents must implement
 */

export type AgentStatus = 'stub' | 'partial' | 'complete';
export type AgentCategory = 
  | 'ESA Infrastructure'
  | 'Journey Agent'
  | 'App Leads'
  | 'Marketing'
  | 'Life CEO'
  | 'Page Agent'
  | 'Mr Blue Suite'
  | 'Algorithm'
  | 'Service';

export interface IAgent {
  id: string;
  name: string;
  category: AgentCategory;
  status: AgentStatus;
  version: string;
  
  initialize(): Promise<void>;
  shutdown?(): Promise<void>;
  
  health(): {
    healthy: boolean;
    message: string;
    lastCheck: Date;
  };
  
  execute?(input: any): Promise<any>;
  
  getInfo(): {
    id: string;
    name: string;
    status: AgentStatus;
    category: AgentCategory;
    features: string[];
    dependencies: string[];
  };
}
