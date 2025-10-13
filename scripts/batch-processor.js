#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fixTranslations } from './fix-translations.js';
import { fixDarkMode } from './fix-dark-mode.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Batch Processor - Process multiple files in parallel
 * Runs translation and dark mode fixes, verifies results, generates report
 */

// File batches based on priority
const BATCHES = {
  critical: [
    'client/src/pages/AdminCenter.tsx',
    'client/src/pages/Settings.tsx',
    'client/src/pages/Profile.tsx',
    'client/src/pages/EventDetails.tsx',
    'client/src/pages/Map.tsx',
    'client/src/pages/Messaging.tsx',
    'client/src/pages/Search.tsx',
    'client/src/pages/Housing.tsx',
    'client/src/pages/Events.tsx',
    'client/src/pages/Groups.tsx',
    'client/src/pages/Dashboard.tsx',
    'client/src/pages/Feed.tsx',
    'client/src/pages/CommunityHub.tsx',
    'client/src/pages/Notifications.tsx',
    'client/src/pages/UserProfile.tsx'
  ],
  
  medium: [
    'client/src/pages/admin/UserManagement.tsx',
    'client/src/pages/admin/ContentModeration.tsx',
    'client/src/pages/admin/Analytics.tsx',
    'client/src/pages/admin/SystemSettings.tsx',
    'client/src/components/Community/CommunityCard.tsx',
    'client/src/components/Community/CommunityList.tsx',
    'client/src/components/Community/JoinCommunityButton.tsx',
    'client/src/components/events/EventCard.tsx',
    'client/src/components/events/EventList.tsx',
    'client/src/components/events/CreateEventForm.tsx',
    'client/src/components/groups/GroupCard.tsx',
    'client/src/components/groups/GroupList.tsx',
    'client/src/components/profile/ProfileHeader.tsx',
    'client/src/components/profile/ProfileSettings.tsx',
    'client/src/components/feed/FeedPost.tsx',
    'client/src/components/feed/CreatePost.tsx',
    'client/src/components/notifications/NotificationList.tsx',
    'client/src/components/messaging/MessageThread.tsx',
    'client/src/components/messaging/ConversationList.tsx'
  ],
  
  low: [
    'client/src/components/ui/Dialog.tsx',
    'client/src/components/ui/Modal.tsx',
    'client/src/components/ui/Alert.tsx',
    'client/src/components/ui/Toast.tsx',
    'client/src/components/ui/Tooltip.tsx',
    'client/src/components/layout/Header.tsx',
    'client/src/components/layout/Footer.tsx',
    'client/src/components/layout/Sidebar.tsx',
    'client/src/components/auth/LoginForm.tsx',
    'client/src/components/auth/RegisterForm.tsx',
    'client/src/components/auth/ForgotPassword.tsx'
  ]
};

/**
 * Process a single file
 */
async function processFile(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  
  // Check if file exists
  if (!fs.existsSync(absolutePath)) {
    return {
      file: filePath,
      exists: false,
      translationResult: null,
      darkModeResult: null
    };
  }
  
  // Run both fixes
  const translationResult = fixTranslations(absolutePath);
  const darkModeResult = fixDarkMode(absolutePath);
  
  return {
    file: filePath,
    exists: true,
    translationResult,
    darkModeResult
  };
}

/**
 * Process a batch of files in parallel
 */
async function processBatch(batchName, files) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📦 Processing Batch: ${batchName.toUpperCase()}`);
  console.log(`📄 Files: ${files.length}`);
  console.log(`${'='.repeat(60)}\n`);
  
  const startTime = Date.now();
  
  // Process files in chunks to avoid overwhelming the system
  const CHUNK_SIZE = 5;
  const results = [];
  
  for (let i = 0; i < files.length; i += CHUNK_SIZE) {
    const chunk = files.slice(i, i + CHUNK_SIZE);
    console.log(`\n📍 Processing chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(files.length / CHUNK_SIZE)}...`);
    
    const chunkResults = await Promise.all(
      chunk.map(file => processFile(file))
    );
    
    results.push(...chunkResults);
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  return {
    batch: batchName,
    files: files.length,
    duration,
    results
  };
}

/**
 * Generate summary report
 */
function generateReport(batchResults) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 BATCH PROCESSING SUMMARY');
  console.log(`${'='.repeat(60)}\n`);
  
  let totalFiles = 0;
  let totalTranslationFixes = 0;
  let totalDarkModeFixes = 0;
  let totalErrors = 0;
  let missingFiles = [];
  
  for (const batch of batchResults) {
    console.log(`\n📦 Batch: ${batch.batch.toUpperCase()}`);
    console.log(`   Files processed: ${batch.files}`);
    console.log(`   Duration: ${batch.duration}s`);
    
    let batchTranslationFixes = 0;
    let batchDarkModeFixes = 0;
    let batchErrors = 0;
    
    for (const result of batch.results) {
      totalFiles++;
      
      if (!result.exists) {
        missingFiles.push(result.file);
        continue;
      }
      
      if (result.translationResult?.success) {
        batchTranslationFixes += result.translationResult.fixed || 0;
      } else if (result.translationResult) {
        batchErrors++;
      }
      
      if (result.darkModeResult?.success) {
        batchDarkModeFixes += result.darkModeResult.fixed || 0;
      } else if (result.darkModeResult) {
        batchErrors++;
      }
    }
    
    totalTranslationFixes += batchTranslationFixes;
    totalDarkModeFixes += batchDarkModeFixes;
    totalErrors += batchErrors;
    
    console.log(`   Translation fixes: ${batchTranslationFixes}`);
    console.log(`   Dark mode fixes: ${batchDarkModeFixes}`);
    console.log(`   Errors: ${batchErrors}`);
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('🎯 OVERALL STATISTICS');
  console.log(`${'='.repeat(60)}\n`);
  console.log(`Total files processed: ${totalFiles}`);
  console.log(`Total translation fixes: ${totalTranslationFixes}`);
  console.log(`Total dark mode fixes: ${totalDarkModeFixes}`);
  console.log(`Total fixes applied: ${totalTranslationFixes + totalDarkModeFixes}`);
  console.log(`Total errors: ${totalErrors}`);
  
  if (missingFiles.length > 0) {
    console.log(`\n⚠️  Missing files (${missingFiles.length}):`);
    missingFiles.forEach(file => console.log(`   - ${file}`));
  }
  
  // Generate JSON report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles,
      totalTranslationFixes,
      totalDarkModeFixes,
      totalFixes: totalTranslationFixes + totalDarkModeFixes,
      totalErrors,
      missingFiles: missingFiles.length
    },
    batches: batchResults.map(batch => ({
      name: batch.batch,
      files: batch.files,
      duration: batch.duration,
      results: batch.results
    }))
  };
  
  // Save report
  const reportPath = path.join(__dirname, `batch-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📋 Detailed report saved to: ${reportPath}`);
  
  return report;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const batchName = args[0] || 'all';
  
  console.log('🚀 Starting Batch Processor...\n');
  
  let batchesToProcess = [];
  
  if (batchName === 'all') {
    batchesToProcess = [
      { name: 'critical', files: BATCHES.critical },
      { name: 'medium', files: BATCHES.medium },
      { name: 'low', files: BATCHES.low }
    ];
  } else if (BATCHES[batchName]) {
    batchesToProcess = [{ name: batchName, files: BATCHES[batchName] }];
  } else {
    console.error(`❌ Unknown batch: ${batchName}`);
    console.log('Available batches: critical, medium, low, all');
    process.exit(1);
  }
  
  const results = [];
  
  for (const batch of batchesToProcess) {
    const result = await processBatch(batch.name, batch.files);
    results.push(result);
  }
  
  const report = generateReport(results);
  
  console.log('\n✅ Batch processing complete!\n');
  
  return report;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

export { processBatch, processFile, generateReport };
