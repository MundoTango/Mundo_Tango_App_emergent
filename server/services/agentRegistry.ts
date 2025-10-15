/**
 * Phase 11 - Track 1A: Agent Registry System
 * Central registry for all component-agents
 * Every UI component is a self-aware agent that can self-test and self-fix
 */

import { db } from '../db';
import { componentAgents } from '../../shared/schema';
import { eq, sql, inArray } from 'drizzle-orm';

export interface ComponentAgent {
  agentId: string;         // e.g., "BUTTON_LOGIN", "FORM_PROFILE", "PAGE_DASHBOARD"
  componentName: string;   // Human-readable name
  componentPath: string;   // File path
  componentType: string;   // "button", "form", "page", "widget"
  parentAgent?: string;    // Parent component agent ID
  layerAgents?: string[];  // Associated layer agents
  healthStatus: 'healthy' | 'warning' | 'error';
  testCoverage: number;    // 0-100
  learningCount: number;   // Number of times this component learned
  modificationHistory?: any; // History of modifications
}

export interface AgentRegistryStats {
  totalAgents: number;
  healthyAgents: number;
  warningAgents: number;
  errorAgents: number;
  avgTestCoverage: number;
  totalLearnings: number;
  byType: Record<string, number>;
}

export class AgentRegistryService {
  /**
   * Register a new component-agent
   * Always check if already exists first (MB.MD principle: "Have I already built this?")
   */
  async registerAgent(agent: ComponentAgent): Promise<void> {
    try {
      // Check if already registered
      const existing = await this.getAgent(agent.agentId);
      
      if (existing) {
        console.log(`[Agent Registry] Agent ${agent.agentId} already registered - updating instead`);
        await this.updateAgent(agent.agentId, agent);
        return;
      }

      await db.insert(componentAgents).values({
        componentName: agent.agentId,  // Use agentId as unique identifier
        componentPath: agent.componentPath,
        componentType: agent.componentType,
        parentAgent: agent.parentAgent || null,
        layerAgents: agent.layerAgents || [],
        currentHealth: agent.healthStatus || 'healthy',
        testCoverage: agent.testCoverage || 0,
        learningCount: agent.learningCount || 0,
        modificationHistory: agent.modificationHistory || {}
      });

      console.log(`✅ [Agent Registry] Registered ${agent.agentId} (${agent.componentType})`);
    } catch (error) {
      console.error(`[Agent Registry] Failed to register ${agent.agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get agent by ID (componentName)
   */
  async getAgent(agentId: string): Promise<ComponentAgent | null> {
    try {
      const result = await db
        .select()
        .from(componentAgents)
        .where(eq(componentAgents.componentName, agentId))
        .limit(1);

      if (result.length === 0) return null;

      const agent = result[0];
      return {
        agentId: agent.componentName,
        componentName: agent.componentName,
        componentPath: agent.componentPath,
        componentType: agent.componentType,
        parentAgent: agent.parentAgent || undefined,
        layerAgents: agent.layerAgents || [],
        healthStatus: agent.currentHealth as 'healthy' | 'warning' | 'error',
        testCoverage: agent.testCoverage || 0,
        learningCount: agent.learningCount || 0,
        modificationHistory: agent.modificationHistory
      };
    } catch (error) {
      console.error(`[Agent Registry] Failed to get agent ${agentId}:`, error);
      return null;
    }
  }

  /**
   * Get all agents by type (e.g., "button", "form", "page")
   */
  async getAgentsByType(type: string): Promise<ComponentAgent[]> {
    try {
      const results = await db
        .select()
        .from(componentAgents)
        .where(eq(componentAgents.componentType, type));

      return results.map(agent => ({
        agentId: agent.componentName,
        componentName: agent.componentName,
        componentPath: agent.componentPath,
        componentType: agent.componentType,
        parentAgent: agent.parentAgent || undefined,
        layerAgents: agent.layerAgents || [],
        healthStatus: agent.currentHealth as 'healthy' | 'warning' | 'error',
        testCoverage: agent.testCoverage || 0,
        learningCount: agent.learningCount || 0,
        modificationHistory: agent.modificationHistory
      }));
    } catch (error) {
      console.error(`[Agent Registry] Failed to get agents by type ${type}:`, error);
      return [];
    }
  }

  /**
   * Update agent (for modifications)
   */
  async updateAgent(agentId: string, updates: Partial<ComponentAgent>): Promise<void> {
    try {
      await db
        .update(componentAgents)
        .set({
          componentPath: updates.componentPath,
          componentType: updates.componentType,
          parentAgent: updates.parentAgent,
          layerAgents: updates.layerAgents,
          currentHealth: updates.healthStatus,
          testCoverage: updates.testCoverage,
          learningCount: updates.learningCount,
          modificationHistory: updates.modificationHistory,
          lastModified: new Date()
        })
        .where(eq(componentAgents.componentName, agentId));

      console.log(`✅ [Agent Registry] Updated ${agentId}`);
    } catch (error) {
      console.error(`[Agent Registry] Failed to update ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Update agent health status
   */
  async updateHealth(agentId: string, status: 'healthy' | 'warning' | 'error'): Promise<void> {
    try {
      await db
        .update(componentAgents)
        .set({
          currentHealth: status,
          lastModified: new Date()
        })
        .where(eq(componentAgents.componentName, agentId));

      console.log(`🏥 [Agent Registry] ${agentId} health → ${status}`);
    } catch (error) {
      console.error(`[Agent Registry] Failed to update health for ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Record test results
   */
  async recordTest(agentId: string, passed: boolean): Promise<void> {
    try {
      if (passed) {
        await db
          .update(componentAgents)
          .set({
            testCoverage: sql`LEAST(100, ${componentAgents.testCoverage} + 10)`,
            currentHealth: 'healthy',
            lastModified: new Date()
          })
          .where(eq(componentAgents.componentName, agentId));
      } else {
        await db
          .update(componentAgents)
          .set({
            currentHealth: 'error',
            lastModified: new Date()
          })
          .where(eq(componentAgents.componentName, agentId));
      }

      console.log(`📊 [Agent Registry] ${agentId} test ${passed ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      console.error(`[Agent Registry] Failed to record test for ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Record auto-fix attempt
   */
  async recordAutoFix(agentId: string, successful: boolean): Promise<void> {
    try {
      if (successful) {
        await db
          .update(componentAgents)
          .set({
            learningCount: sql`${componentAgents.learningCount} + 1`,
            currentHealth: 'healthy',
            lastModified: new Date()
          })
          .where(eq(componentAgents.componentName, agentId));
      } else {
        await db
          .update(componentAgents)
          .set({
            lastModified: new Date()
          })
          .where(eq(componentAgents.componentName, agentId));
      }

      console.log(`🔧 [Agent Registry] ${agentId} auto-fix ${successful ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      console.error(`[Agent Registry] Failed to record auto-fix for ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get unhealthy agents (need attention)
   */
  async getUnhealthyAgents(): Promise<ComponentAgent[]> {
    try {
      const results = await db
        .select()
        .from(componentAgents)
        .where(inArray(componentAgents.currentHealth, ['warning', 'error']));

      return results.map(agent => ({
        agentId: agent.componentName,
        componentName: agent.componentName,
        componentPath: agent.componentPath,
        componentType: agent.componentType,
        parentAgent: agent.parentAgent || undefined,
        layerAgents: agent.layerAgents || [],
        healthStatus: agent.currentHealth as 'healthy' | 'warning' | 'error',
        testCoverage: agent.testCoverage || 0,
        learningCount: agent.learningCount || 0,
        modificationHistory: agent.modificationHistory
      }));
    } catch (error) {
      console.error('[Agent Registry] Failed to get unhealthy agents:', error);
      return [];
    }
  }

  /**
   * Get agent statistics
   */
  async getStats(): Promise<AgentRegistryStats> {
    try {
      const allAgents = await db.select().from(componentAgents);

      const stats: AgentRegistryStats = {
        totalAgents: allAgents.length,
        healthyAgents: allAgents.filter(a => a.currentHealth === 'healthy').length,
        warningAgents: allAgents.filter(a => a.currentHealth === 'warning').length,
        errorAgents: allAgents.filter(a => a.currentHealth === 'error').length,
        avgTestCoverage: this.calculateAverage(allAgents.map(a => a.testCoverage || 0)),
        totalLearnings: allAgents.reduce((sum, a) => sum + (a.learningCount || 0), 0),
        byType: this.groupBy(allAgents, 'componentType')
      };

      return stats;
    } catch (error) {
      console.error('[Agent Registry] Failed to get stats:', error);
      throw error;
    }
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, n) => acc + n, 0);
    return Math.round(sum / numbers.length);
  }

  private groupBy(agents: any[], field: string): Record<string, number> {
    const grouped: Record<string, number> = {};
    
    for (const agent of agents) {
      const key = agent[field];
      grouped[key] = (grouped[key] || 0) + 1;
    }
    
    return grouped;
  }

  /**
   * Bulk register multiple agents (for initial setup)
   */
  async bulkRegister(agents: ComponentAgent[]): Promise<void> {
    console.log(`[Agent Registry] Bulk registering ${agents.length} agents...`);
    
    for (const agent of agents) {
      await this.registerAgent(agent);
    }
    
    console.log(`✅ [Agent Registry] Bulk registration complete`);
  }
}

// Singleton instance
export const agentRegistry = new AgentRegistryService();
