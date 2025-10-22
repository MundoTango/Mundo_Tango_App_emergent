/**
 * STREAM B: AUTOMATED MODEL MONITORING CRON SERVICE (Oct 22, 2025)
 * Checks for deprecated models 4x daily and auto-updates codebase
 * Schedule: Every 6 hours (6am, 12pm, 6pm, 12am)
 */

import * as cron from 'node-cron';
import { autoUpdateDeprecatedModels, checkDeprecatedModels } from './modelAutoUpdater';

let cronJob: ReturnType<typeof cron.schedule> | null = null;

/**
 * Start automated model monitoring (4x daily checks)
 */
export function startModelMonitoringCron() {
  if (cronJob) {
    console.log('[Model Monitor Cron] ⚠️  Already running');
    return;
  }

  // Schedule: 0 */6 * * * (every 6 hours at minute 0)
  // Times: 00:00, 06:00, 12:00, 18:00
  cronJob = cron.schedule('0 */6 * * *', async () => {
    console.log('[Model Monitor Cron] 🔍 Starting scheduled model check...');
    
    try {
      // Step 1: Check for deprecated models
      const statuses = await checkDeprecatedModels();
      const deprecated = statuses.filter(s => s.status === 'deprecated');
      
      console.log(`[Model Monitor Cron] 📊 Found ${deprecated.length} deprecated models`);
      
      if (deprecated.length > 0) {
        console.log('[Model Monitor Cron] 🔧 Auto-updating codebase...');
        
        // Step 2: Automatically update if deprecated models found
        const result = await autoUpdateDeprecatedModels();
        
        console.log(`[Model Monitor Cron] ✅ Updated ${result.filesUpdated} files`);
        console.log('[Model Monitor Cron] Models replaced:', result.modelsReplaced);
        
        // TODO: Send alert notifications (Slack/Email) - see modelAlerts.ts
      } else {
        console.log('[Model Monitor Cron] ✅ All models up-to-date');
      }
    } catch (error: any) {
      console.error('[Model Monitor Cron] ❌ Error during scheduled check:', error.message);
    }
  });

  cronJob.start();
  
  console.log('[Model Monitor Cron] ✅ Scheduled - Running every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)');
  console.log('[Model Monitor Cron] Next run:', cronJob.nextDate().toString());
}

/**
 * Stop model monitoring cron
 */
export function stopModelMonitoringCron() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log('[Model Monitor Cron] ⏹️  Stopped');
  }
}

/**
 * Get cron job status
 */
export function getModelMonitorCronStatus() {
  if (!cronJob) {
    return {
      running: false,
      nextRun: null
    };
  }

  return {
    running: true,
    nextRun: cronJob.nextDate().toString()
  };
}

export default {
  start: startModelMonitoringCron,
  stop: stopModelMonitoringCron,
  status: getModelMonitorCronStatus
};
