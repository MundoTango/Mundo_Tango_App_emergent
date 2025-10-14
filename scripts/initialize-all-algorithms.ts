import { A1_MemoriesFeedAgent } from '../server/algorithms/A1_MemoriesFeedAgent';
import { A2_FriendSuggestionsAgent } from '../server/algorithms/A2_FriendSuggestionsAgent';
import { A3_EventRecommendationsAgent } from '../server/algorithms/A3_EventRecommendationsAgent';
import { A4_SearchRankingAgent } from '../server/algorithms/A4_SearchRankingAgent';
import { A5_NotificationPriorityAgent } from '../server/algorithms/A5_NotificationPriorityAgent';
import { A6_ContentModerationAgent } from '../server/algorithms/A6_ContentModerationAgent';
import { A7_HousingMatchAgent } from '../server/algorithms/A7_HousingMatchAgent';
import { A8_SentimentAnalysisAgent } from '../server/algorithms/A8_SentimentAnalysisAgent';
import { A9_TopicExtractionAgent } from '../server/algorithms/A9_TopicExtractionAgent';
import { A10_UserClusteringAgent } from '../server/algorithms/A10_UserClusteringAgent';
import { A11_ChurnPredictionAgent } from '../server/algorithms/A11_ChurnPredictionAgent';
import { A12_SpamDetectionAgent } from '../server/algorithms/A12_SpamDetectionAgent';
import { A13_ImageRecognitionAgent } from '../server/algorithms/A13_ImageRecognitionAgent';
import { A14_TranslationQualityAgent } from '../server/algorithms/A14_TranslationQualityAgent';
import { A15_VoiceCommandsAgent } from '../server/algorithms/A15_VoiceCommandsAgent';
import { A16_CacheStrategyAgent } from '../server/algorithms/A16_CacheStrategyAgent';
import { A17_QueryOptimizationAgent } from '../server/algorithms/A17_QueryOptimizationAgent';
import { A18_LoadBalancingAgent } from '../server/algorithms/A18_LoadBalancingAgent';
import { A19_ResourceAllocationAgent } from '../server/algorithms/A19_ResourceAllocationAgent';
import { A20_RateLimitingAgent } from '../server/algorithms/A20_RateLimitingAgent';
import { A21_CDNRoutingAgent } from '../server/algorithms/A21_CDNRoutingAgent';
import { A22_BackgroundJobsAgent } from '../server/algorithms/A22_BackgroundJobsAgent';
import { A23_FraudDetectionAgent } from '../server/algorithms/A23_FraudDetectionAgent';
import { A24_AccessControlAgent } from '../server/algorithms/A24_AccessControlAgent';
import { A25_DataEncryptionAgent } from '../server/algorithms/A25_DataEncryptionAgent';
import { A26_AuditScoringAgent } from '../server/algorithms/A26_AuditScoringAgent';
import { A27_MapRoutePlanningAgent } from '../server/algorithms/A27_MapRoutePlanningAgent';
import { A28_CalendarSchedulingAgent } from '../server/algorithms/A28_CalendarSchedulingAgent';
import { A29_PaymentProcessingAgent } from '../server/algorithms/A29_PaymentProcessingAgent';
import { A30_AnalyticsAggregationAgent } from '../server/algorithms/A30_AnalyticsAggregationAgent';

async function initializeAllAlgorithms() {
  console.log('🚀 Initializing all 30 algorithm agents...\n');

  const agents = [
    new A1_MemoriesFeedAgent(),
    new A2_FriendSuggestionsAgent(),
    new A3_EventRecommendationsAgent(),
    new A4_SearchRankingAgent(),
    new A5_NotificationPriorityAgent(),
    new A6_ContentModerationAgent(),
    new A7_HousingMatchAgent(),
    new A8_SentimentAnalysisAgent(),
    new A9_TopicExtractionAgent(),
    new A10_UserClusteringAgent(),
    new A11_ChurnPredictionAgent(),
    new A12_SpamDetectionAgent(),
    new A13_ImageRecognitionAgent(),
    new A14_TranslationQualityAgent(),
    new A15_VoiceCommandsAgent(),
    new A16_CacheStrategyAgent(),
    new A17_QueryOptimizationAgent(),
    new A18_LoadBalancingAgent(),
    new A19_ResourceAllocationAgent(),
    new A20_RateLimitingAgent(),
    new A21_CDNRoutingAgent(),
    new A22_BackgroundJobsAgent(),
    new A23_FraudDetectionAgent(),
    new A24_AccessControlAgent(),
    new A25_DataEncryptionAgent(),
    new A26_AuditScoringAgent(),
    new A27_MapRoutePlanningAgent(),
    new A28_CalendarSchedulingAgent(),
    new A29_PaymentProcessingAgent(),
    new A30_AnalyticsAggregationAgent()
  ];

  const results = [];
  let successCount = 0;
  let errorCount = 0;

  for (const agent of agents) {
    try {
      console.log(`Initializing ${agent.id}: ${agent.name}...`);
      await agent.initialize();
      console.log(`✅ ${agent.id} initialized successfully`);
      results.push({ id: agent.id, status: 'success' });
      successCount++;
    } catch (error: any) {
      console.error(`❌ ${agent.id} failed:`, error.message);
      results.push({ id: agent.id, status: 'error', error: error.message });
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Success: ${successCount}/30`);
  console.log(`   ❌ Errors: ${errorCount}/30`);
  
  if (errorCount > 0) {
    console.log(`\n⚠️  Errors found:`);
    results.filter(r => r.status === 'error').forEach(r => {
      console.log(`   - ${r.id}: ${r.error}`);
    });
  }

  console.log(`\n🎉 All algorithms initialized!`);
  process.exit(errorCount > 0 ? 1 : 0);
}

initializeAllAlgorithms();
