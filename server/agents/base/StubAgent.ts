/**
 * ESA LIFE CEO 61x21 - Stub Agent Base Class
 * Lightweight placeholder for agents not yet implemented
 */

import { IAgent, AgentStatus, AgentCategory } from './IAgent';

export abstract class StubAgent implements IAgent {
  abstract id: string;
  abstract name: string;
  abstract category: AgentCategory;
  
  status: AgentStatus = 'stub';
  version: string = '1.0.0-stub';
  
  protected initialized: boolean = false;
  protected lastHealthCheck: Date = new Date();
  
  async initialize(): Promise<void> {
    this.initialized = true;
  }
  
  async shutdown(): Promise<void> {
    this.initialized = false;
  }
  
  health() {
    this.lastHealthCheck = new Date();
    return {
      healthy: true,
      message: `${this.name} stub operational`,
      lastCheck: this.lastHealthCheck,
    };
  }
  
  async execute(input: any): Promise<any> {
    console.warn(`[${this.id}] Stub called - not implemented`);
    return {
      success: false,
      message: `${this.name} is a stub - feature not yet implemented`,
      agentId: this.id,
      status: this.status,
    };
  }
  
  getInfo() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      category: this.category,
      features: [],
      dependencies: [],
    };
  }
}
