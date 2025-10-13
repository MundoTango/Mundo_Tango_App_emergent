/**
 * ESA Smart Agents Orchestrator
 * MB.MD PHASE 4 - Agent Integration & Scheduling
 * 
 * Manages all 4 smart agents (#106-109) with cron scheduling
 */

import cron from 'node-cron';
import { agent106 } from './Agent106_APIPathValidator';
import { agent107 } from './Agent107_BatchQueryOptimizer';
import { agent108 } from './Agent108_WebSocketManager';
import { agent109 } from './Agent109_CacheIntelligence';
import { Server as SocketServer } from 'socket.io';

export class SmartAgentsOrchestrator {
  private static instance: SmartAgentsOrchestrator;
  private initialized = false;
  
  private constructor() {}
  
  static getInstance(): SmartAgentsOrchestrator {
    if (!SmartAgentsOrchestrator.instance) {
      SmartAgentsOrchestrator.instance = new SmartAgentsOrchestrator();
    }
    return SmartAgentsOrchestrator.instance;
  }
  
  /**
   * Initialize all smart agents with scheduling
   */
  async initialize(io?: SocketServer): Promise<void> {
    if (this.initialized) {
      console.log('[Smart Agents] Already initialized');
      return;
    }
    
    console.log('🤖 [Smart Agents] Initializing ESA Agents #106-109...');
    
    try {
      // Initialize Agent #108: WebSocket Connection Manager
      if (io) {
        agent108.initialize(io);
        console.log('✅ [Agent #108] WebSocket Connection Manager initialized');
      } else {
        console.warn('⚠️ [Agent #108] No Socket.IO instance provided, skipping WebSocket manager');
      }
      
      // Schedule Agent #106: API Path Validator (hourly)
      cron.schedule('0 * * * *', async () => {
        console.log('🔍 [Agent #106] Running hourly API path validation...');
        try {
          await agent106.validate();
        } catch (error) {
          console.error('[Agent #106] Validation failed:', error);
        }
      });
      console.log('✅ [Agent #106] API Path Validator scheduled (hourly)');
      
      // Schedule Agent #107: Batch Query Optimizer (daily at 2 AM)
      cron.schedule('0 2 * * *', async () => {
        console.log('🐌 [Agent #107] Running daily query optimization...');
        try {
          await agent107.analyze();
        } catch (error) {
          console.error('[Agent #107] Analysis failed:', error);
        }
      });
      console.log('✅ [Agent #107] Batch Query Optimizer scheduled (daily 2 AM)');
      
      // Schedule Agent #109: Cache Intelligence (daily at 3 AM)
      cron.schedule('0 3 * * *', async () => {
        console.log('💾 [Agent #109] Running daily cache analysis...');
        try {
          await agent109.analyze();
        } catch (error) {
          console.error('[Agent #109] Analysis failed:', error);
        }
      });
      console.log('✅ [Agent #109] Cache Intelligence scheduled (daily 3 AM)');
      
      // Run initial validation on startup
      console.log('🚀 [Smart Agents] Running initial validation...');
      
      // Run Agent #106 immediately on startup
      try {
        const result = await agent106.validate();
        console.log('✅ [Agent #106] Initial validation complete:', {
          coverage: result.coverage,
          mismatches: result.mismatches,
          criticalIssues: result.criticalIssues.length
        });
      } catch (error) {
        console.error('[Agent #106] Initial validation failed:', error);
      }
      
      this.initialized = true;
      console.log('🎉 [Smart Agents] All agents initialized and scheduled successfully!');
      
    } catch (error) {
      console.error('❌ [Smart Agents] Initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Get agent status
   */
  async getStatus() {
    return {
      initialized: this.initialized,
      agents: {
        106: { name: 'API Path Validator', schedule: 'hourly' },
        107: { name: 'Batch Query Optimizer', schedule: 'daily 2 AM' },
        108: { name: 'WebSocket Connection Manager', schedule: 'always active' },
        109: { name: 'Cache Intelligence', schedule: 'daily 3 AM' }
      }
    };
  }
  
  /**
   * Manually trigger agent execution (for testing/debugging)
   */
  async triggerAgent(agentId: number): Promise<any> {
    console.log(`🔧 [Smart Agents] Manually triggering Agent #${agentId}...`);
    
    switch (agentId) {
      case 106:
        return await agent106.validate();
      case 107:
        return await agent107.analyze();
      case 109:
        return await agent109.analyze();
      case 108:
        return await agent108.getStats();
      default:
        throw new Error(`Unknown agent ID: ${agentId}`);
    }
  }
}

// Export singleton instance
export const smartAgents = SmartAgentsOrchestrator.getInstance();

// Export individual agents for direct access
export { agent106, agent107, agent108, agent109 };
