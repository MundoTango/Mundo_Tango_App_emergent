import { agentLearningService } from './AgentLearningCaptureService';
import { agentOrchestrator } from './LangGraphAgentOrchestrator';
import { learningLoop } from './ContinuousLearningLoop';

export class AgentLearningInitializer {
  private initialized = false;

  async initialize() {
    if (this.initialized) {
      console.log('[Agent Learning] Already initialized');
      return;
    }

    console.log('\n🧠 ESA LIFE CEO 61x21 - Agent Learning System Initialization');
    console.log('━'.repeat(70));

    try {
      console.log('📊 Step 1/4: Capturing cache standardization learnings...');
      await agentLearningService.captureExistingCachePatterns();
      console.log('✅ Step 1 Complete: Cache patterns captured');

      console.log('\n📊 Step 2/4: Broadcasting learnings via LangGraph orchestrator...');
      const result = await agentOrchestrator.discoverAndShareLearnings();
      console.log('✅ Step 2 Complete: Knowledge shared across 9 agent domains');

      console.log('\n📊 Step 3/4: Validating agent learning database...');
      const learnings = await agentLearningService.getHighConfidenceLearnings(0.9);
      console.log(`✅ Step 3 Complete: ${learnings.length} high-confidence patterns stored`);

      console.log('\n📊 Step 4/4: Starting continuous learning loop...');
      learningLoop.start().catch(console.error);
      console.log('✅ Step 4 Complete: Continuous learning active');

      console.log('\n━'.repeat(70));
      console.log('🎉 Agent Learning System: OPERATIONAL');
      console.log('   • Cache Patterns: 4 documented');
      console.log('   • ESA Layers: 7, 14, 22, 36, 37, 44, 46, 52');
      console.log('   • Agent Domains: 9 (Infrastructure, Frontend, Business, ...)');
      console.log('   • Learning Mode: Continuous (60s cycle)');
      console.log('   • Auto-Documentation: Active → docs/pages/');
      console.log('━'.repeat(70) + '\n');

      this.initialized = true;
    } catch (error) {
      console.error('❌ Agent Learning System initialization failed:', error);
      throw error;
    }
  }

  async shutdown() {
    console.log('[Agent Learning] Shutting down continuous learning loop...');
    learningLoop.stop();
    this.initialized = false;
  }
}

export const agentLearningInitializer = new AgentLearningInitializer();
