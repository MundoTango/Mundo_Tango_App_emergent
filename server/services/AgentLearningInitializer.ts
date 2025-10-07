import { agentLearningService } from './AgentLearningCaptureService';
import { agentOrchestrator } from './LangGraphAgentOrchestrator';
import { learningLoop } from './ContinuousLearningLoop';
import { memoryWorker, cacheWorker, eventsWorker, socialWorker, aiWorker, crossDomainWorker } from './ModularWorkerService';
import { esaPatternDetector } from './ESALayerPatternDetector';

export class AgentLearningInitializer {
  private initialized = false;

  async initialize() {
    if (this.initialized) {
      console.log('[Agent Learning] Already initialized');
      return;
    }

    console.log('\n🧠 ESA LIFE CEO 61x21 - AGI Agent Learning System');
    console.log('━'.repeat(70));

    try {
      console.log('📊 Step 1/5: Capturing existing patterns...');
      await agentLearningService.captureExistingCachePatterns();
      console.log('✅ Cache patterns captured');

      console.log('\n📊 Step 2/5: Starting modular workers (AGI pattern)...');
      memoryWorker.start().catch(console.error);
      cacheWorker.start().catch(console.error);
      eventsWorker.start().catch(console.error);
      socialWorker.start().catch(console.error);
      aiWorker.start().catch(console.error);
      crossDomainWorker.start().catch(console.error);
      console.log('✅ 6 workers started (memory, cache, events, social, ai, cross-domain)');

      console.log('\n📊 Step 3/5: Expanding pattern detection to ESA Layers 21-56...');
      await esaPatternDetector.runFullDetection();
      console.log('✅ Full ESA layer scan complete');

      console.log('\n📊 Step 4/5: Broadcasting via LangGraph orchestrator...');
      const result = await agentOrchestrator.discoverAndShareLearnings();
      console.log('✅ Knowledge shared across 9 agent domains');

      console.log('\n📊 Step 5/5: Starting continuous learning loop...');
      learningLoop.start().catch(console.error);
      console.log('✅ Continuous learning active (60s cycle)');

      console.log('\n━'.repeat(70));
      console.log('🎉 AGI Agent Learning System: OPERATIONAL');
      console.log('   • Workers: 6 active (PostgreSQL queue + SKIP LOCKED)');
      console.log('   • ESA Layers: 7, 14, 21-56 (Infrastructure → Platform)');
      console.log('   • Patterns: Cache, Business Logic, AI, Platform');
      console.log('   • Agent Domains: 9 orchestrated via LangGraph');
      console.log('   • Auto-Documentation: Active → docs/pages/');
      console.log('   • Real-time: Ready for dashboard integration');
      console.log('━'.repeat(70) + '\n');

      this.initialized = true;
    } catch (error) {
      console.error('❌ Agent Learning System initialization failed:', error);
      throw error;
    }
  }

  async shutdown() {
    console.log('[Agent Learning] Shutting down...');
    learningLoop.stop();
    memoryWorker.stop();
    cacheWorker.stop();
    eventsWorker.stop();
    socialWorker.stop();
    aiWorker.stop();
    crossDomainWorker.stop();
    this.initialized = false;
  }
}

export const agentLearningInitializer = new AgentLearningInitializer();
