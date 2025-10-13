#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

// Files to process based on actual codebase
const FILES_TO_PROCESS = [
  // Pages - Critical
  'client/src/pages/AdminCenter.tsx',
  'client/src/pages/AdminMonitoring.tsx',
  'client/src/pages/AccountDelete.tsx',
  'client/src/pages/Notifications.tsx',
  'client/src/pages/community.tsx',
  'client/src/pages/community-world-map.tsx',
  'client/src/pages/create-community.tsx',
  'client/src/pages/code-of-conduct.tsx',
  'client/src/pages/database-security.tsx',
  'client/src/pages/enhanced-timeline-v2.tsx',
  
  // Admin pages
  'client/src/pages/admin/analytics.tsx',
  'client/src/pages/admin/moderation.tsx',
  'client/src/pages/admin/users.tsx',
  'client/src/pages/admin/dashboard.tsx',
  'client/src/pages/admin/AgentMetrics.tsx',
  'client/src/pages/admin/MrBlueDashboard.tsx',
  
  // Auth pages
  'client/src/pages/auth/login.tsx',
  'client/src/pages/auth/register.tsx',
  'client/src/pages/auth/forgot-password.tsx',
  'client/src/pages/auth/reset-password.tsx',
  
  // Components - High priority
  'client/src/components/admin/LifeCEODashboard.tsx',
  'client/src/components/admin/LifeCEOCommandCenter.tsx',
  'client/src/components/admin/PerformanceMonitor.tsx',
  'client/src/components/admin/ValidationDashboard.tsx',
  'client/src/components/admin/Framework50x21Dashboard.tsx',
  'client/src/components/admin/SubscriptionManagement.tsx',
  'client/src/components/admin/TestSpriteIntegration.tsx',
  'client/src/components/admin/EventTypesManager.tsx',
  'client/src/components/admin/DailyActivityView.tsx',
  
  // Community components
  'client/src/components/Community/CommunityMapFilters.tsx',
  'client/src/components/Community/RankingsPanel.tsx',
  'client/src/components/Community/CommunityMapWithLayers.tsx',
  'client/src/components/Community/WorldMap.tsx',
  'client/src/components/Community/CommunityCard.tsx',
  'client/src/components/Community/EnhancedCityGroupCard.tsx',
  
  // Other important components
  'client/src/components/GuestOnboarding/GuestOnboardingEntrance.tsx',
  'client/src/components/GuestOnboarding/GuestOnboardingFlow.tsx',
  'client/src/components/GuestProfile/GuestProfileDisplay.tsx',
  'client/src/components/Housing/HostHomesList.tsx',
  'client/src/components/Recommendations/RecommendationsList.tsx',
];

async function processFile(filePath) {
  const absolutePath = path.resolve(process.cwd(), '..', filePath);
  
  if (!fs.existsSync(absolutePath)) {
    return {
      file: filePath,
      exists: false,
      translations: 0,
      darkMode: 0,
      error: 'File not found'
    };
  }
  
  try {
    // Run translation fixer
    const { stdout: transOut } = await execAsync(
      `node --no-warnings fix-translations.js "${absolutePath}"`,
      { cwd: path.dirname(import.meta.url.replace('file://', '')) }
    );
    
    // Run dark mode fixer
    const { stdout: darkOut } = await execAsync(
      `node --no-warnings fix-dark-mode.js "${absolutePath}"`,
      { cwd: path.dirname(import.meta.url.replace('file://', '')) }
    );
    
    // Extract fix counts
    const transMatch = transOut.match(/Fixed (\d+) strings/);
    const darkMatch = darkOut.match(/Added dark variants to (\d+) classes/);
    
    return {
      file: filePath,
      exists: true,
      translations: transMatch ? parseInt(transMatch[1]) : 0,
      darkMode: darkMatch ? parseInt(darkMatch[1]) : 0,
      error: null
    };
  } catch (error) {
    return {
      file: filePath,
      exists: true,
      translations: 0,
      darkMode: 0,
      error: error.message
    };
  }
}

async function main() {
  console.log('🚀 Starting comprehensive file processing...\n');
  console.log(`📁 Processing ${FILES_TO_PROCESS.length} files\n`);
  
  const startTime = Date.now();
  const results = [];
  
  // Process files in chunks of 3 to avoid overwhelming the system
  const CHUNK_SIZE = 3;
  
  for (let i = 0; i < FILES_TO_PROCESS.length; i += CHUNK_SIZE) {
    const chunk = FILES_TO_PROCESS.slice(i, i + CHUNK_SIZE);
    console.log(`\n📍 Processing chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(FILES_TO_PROCESS.length / CHUNK_SIZE)}...`);
    
    const chunkResults = await Promise.all(
      chunk.map(file => processFile(file))
    );
    
    results.push(...chunkResults);
    
    // Show progress
    chunkResults.forEach(r => {
      if (r.exists) {
        console.log(`  ✅ ${path.basename(r.file)}: ${r.translations} trans + ${r.darkMode} dark`);
      } else {
        console.log(`  ⚠️  ${path.basename(r.file)}: Not found`);
      }
    });
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // Generate summary
  const totalFiles = results.filter(r => r.exists).length;
  const totalTranslations = results.reduce((sum, r) => sum + r.translations, 0);
  const totalDarkMode = results.reduce((sum, r) => sum + r.darkMode, 0);
  const totalFixes = totalTranslations + totalDarkMode;
  const errors = results.filter(r => r.error && r.error !== 'File not found');
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 PROCESSING COMPLETE');
  console.log(`${'='.repeat(60)}\n`);
  console.log(`✅ Files processed: ${totalFiles}`);
  console.log(`🌐 Translation fixes: ${totalTranslations}`);
  console.log(`🌙 Dark mode fixes: ${totalDarkMode}`);
  console.log(`📈 Total fixes applied: ${totalFixes}`);
  console.log(`⚠️  Errors: ${errors.length}`);
  console.log(`⏱️  Duration: ${duration}s\n`);
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    duration,
    summary: {
      totalFiles,
      totalTranslations,
      totalDarkMode,
      totalFixes,
      errors: errors.length
    },
    results
  };
  
  const reportPath = path.join(process.cwd(), `comprehensive-fix-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📋 Detailed report saved: ${reportPath}\n`);
  
  return report;
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
