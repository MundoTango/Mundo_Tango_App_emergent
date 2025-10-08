/**
 * AI Research Expert - Daily Intelligence Scheduler
 * Runs automated intelligence scans at 3pm daily
 */

import cron from 'node-cron';
import { AIResearchExpert } from '../esa-agents/ai-research-expert';

export function startAIResearchScheduler() {
  const agent = new AIResearchExpert();
  
  // Schedule: Run daily at 3:00 PM (15:00)
  // Cron format: minute hour day month weekday
  // '0 15 * * *' = At 15:00 (3pm) every day
  cron.schedule('0 15 * * *', async () => {
    console.log('\n🔬 [AI Research Expert] Starting scheduled intelligence scan at 3pm...');
    console.log('='.repeat(80));
    
    try {
      // Generate comprehensive daily brief
      const brief = await agent.execute('generateBrief', {});
      
      console.log('\n✅ Daily Intelligence Brief Generated');
      console.log('Summary:', {
        totalNews: brief.summary.totalNews,
        trendingRepos: brief.summary.trendingRepos,
        toolsDiscovered: brief.summary.toolsDiscovered,
        timestamp: new Date().toISOString(),
      });
      
      if (brief.recommendations && brief.recommendations.length > 0) {
        console.log('\nTop Recommendations:');
        brief.recommendations.slice(0, 3).forEach((rec: string, i: number) => {
          console.log(`  ${i + 1}. ${rec}`);
        });
      }
      
      // Log to agent system for admin dashboard
      console.log('\n💡 Intelligence brief available via: GET /api/ai-expert/brief');
      console.log('='.repeat(80) + '\n');
      
    } catch (error: any) {
      console.error('❌ [AI Research Expert] Scheduled scan failed:', error.message);
    }
  });
  
  console.log('✅ AI Research Expert Scheduler: Daily intelligence scan set for 3:00 PM');
  console.log('   Cron: 0 15 * * * (runs every day at 15:00)');
}

/**
 * Manual trigger for testing (can be called via API)
 */
export async function triggerManualScan() {
  const agent = new AIResearchExpert();
  console.log('🔬 [AI Research Expert] Manual intelligence scan triggered...');
  
  const brief = await agent.execute('generateBrief', {});
  return brief;
}
