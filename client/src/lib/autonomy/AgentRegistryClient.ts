/**
 * Phase 11 - Client-side Agent Registry API
 * Frontend interface to communicate with Agent Registry backend
 */

export interface ComponentAgent {
  agentId: string;
  componentName: string;
  componentPath: string;
  componentType: string;
  parentAgent?: string;
  layerAgents?: string[];
  healthStatus: 'healthy' | 'warning' | 'error';
  testCoverage: number;
  learningCount: number;
}

class AgentRegistryClient {
  /**
   * Register a component-agent
   */
  async register(agent: ComponentAgent): Promise<void> {
    try {
      const response = await fetch('/api/agent-registry/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agent)
      });

      if (!response.ok) {
        console.error('[Agent Registry Client] Registration failed:', await response.text());
      }
    } catch (error) {
      console.error('[Agent Registry Client] Registration error:', error);
    }
  }

  /**
   * Get agent by ID
   */
  async getAgent(agentId: string): Promise<ComponentAgent | null> {
    try {
      const response = await fetch(`/api/agent-registry/${agentId}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.agent;
    } catch (error) {
      console.error('[Agent Registry Client] Get agent error:', error);
      return null;
    }
  }

  /**
   * Get all agents by type
   */
  async getAgentsByType(type: string): Promise<ComponentAgent[]> {
    try {
      const response = await fetch(`/api/agent-registry/type/${type}`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.agents;
    } catch (error) {
      console.error('[Agent Registry Client] Get agents by type error:', error);
      return [];
    }
  }

  /**
   * Update agent health
   */
  async updateHealth(agentId: string, status: 'healthy' | 'warning' | 'error'): Promise<void> {
    try {
      await fetch(`/api/agent-registry/${agentId}/health`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('[Agent Registry Client] Update health error:', error);
    }
  }

  /**
   * Record test result
   */
  async recordTest(agentId: string, passed: boolean): Promise<void> {
    try {
      await fetch('/api/agent-registry/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, passed })
      });
    } catch (error) {
      console.error('[Agent Registry Client] Record test error:', error);
    }
  }

  /**
   * Record auto-fix attempt
   */
  async recordAutoFix(agentId: string, successful: boolean): Promise<void> {
    try {
      await fetch('/api/agent-registry/auto-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, successful })
      });
    } catch (error) {
      console.error('[Agent Registry Client] Record auto-fix error:', error);
    }
  }

  /**
   * Get unhealthy agents
   */
  async getUnhealthyAgents(): Promise<ComponentAgent[]> {
    try {
      const response = await fetch('/api/agent-registry/unhealthy');
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.agents;
    } catch (error) {
      console.error('[Agent Registry Client] Get unhealthy agents error:', error);
      return [];
    }
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<any> {
    try {
      const response = await fetch('/api/agent-registry/stats');
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('[Agent Registry Client] Get stats error:', error);
      return null;
    }
  }
}

// Singleton instance
export const agentRegistry = new AgentRegistryClient();
