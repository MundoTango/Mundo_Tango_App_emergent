#!/usr/bin/env node
/**
 * MASS DARK MODE FIXER - MB.MD Parallel Execution
 * Adds dark: variants to all pages missing them
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pages needing dark mode (from audit)
const pagesNeedingDarkMode = [
  'client/src/pages/__tests__/profile.test.tsx',
  'client/src/pages/_debug/MemoriesDebug.tsx',
  'client/src/pages/_debug/PostingDemo.tsx',
  'client/src/pages/admin/PlatformHealth.tsx',
  'client/src/pages/timeline-debug.tsx',
  'client/src/pages/GuestOnboarding.tsx',
  'client/src/pages/LifeCeoPerformance.tsx',
  'client/src/pages/invitations.tsx',
  'client/src/pages/timeline-minimal.tsx',
  'client/src/pages/ErrorBoundaryPage.tsx',
  'client/src/pages/HierarchyDashboard.tsx',
  'client/src/pages/ProjectTracker.tsx',
  'client/src/pages/Subscription.tsx',
  'client/src/pages/TangoStories.tsx',
  'client/src/pages/EnhancedEvents.tsx'
];

// Aurora Tide Design Token Mappings
const darkModeTokens = {
  // Backgrounds
  'bg-white': 'bg-white dark:bg-gray-900',
  'bg-gray-50': 'bg-gray-50 dark:bg-gray-800',
  'bg-gray-100': 'bg-gray-100 dark:bg-gray-800',
  'bg-card': 'bg-card dark:bg-gray-800',
  'bg-turquoise-50': 'bg-turquoise-50 dark:bg-turquoise-900/30',
  'bg-turquoise-100': 'bg-turquoise-100 dark:bg-turquoise-900/30',
  
  // Text
  'text-gray-900': 'text-gray-900 dark:text-gray-100',
  'text-gray-800': 'text-gray-800 dark:text-gray-200',
  'text-gray-700': 'text-gray-700 dark:text-gray-300',
  'text-gray-600': 'text-gray-600 dark:text-gray-400',
  'text-muted-foreground': 'text-muted-foreground dark:text-gray-400',
  'text-turquoise-700': 'text-turquoise-700 dark:text-turquoise-400',
  'text-turquoise-600': 'text-turquoise-600 dark:text-turquoise-400',
  'text-green-600': 'text-green-600 dark:text-green-400',
  'text-red-600': 'text-red-600 dark:text-red-400',
  'text-blue-600': 'text-blue-600 dark:text-blue-400',
  
  // Borders
  'border-gray-200': 'border-gray-200 dark:border-gray-700',
  'border-gray-300': 'border-gray-300 dark:border-gray-600',
  'border-turquoise-100': 'border-turquoise-100 dark:border-turquoise-900/30',
  'border-turquoise-200': 'border-turquoise-200 dark:border-turquoise-800/40',
  
  // Gradients
  'from-turquoise-50': 'from-turquoise-50 dark:from-turquoise-900/30',
  'to-cyan-50': 'to-cyan-50 dark:to-cyan-900/30',
  'from-blue-50': 'from-blue-50 dark:from-blue-900/30',
  'to-purple-50': 'to-purple-50 dark:to-purple-900/30'
};

// Apply dark mode tokens to a file
const applyDarkMode = (filePath) => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⏭️  Skipping ${filePath} (not found)`);
      return { success: false, reason: 'not_found', changes: 0 };
    }

    let content = fs.readFileSync(fullPath, 'utf-8');
    let changeCount = 0;
    
    // Apply each token mapping
    Object.entries(darkModeTokens).forEach(([lightClass, darkClass]) => {
      // Match className with the light class but not already having dark:
      const regex = new RegExp(`className="([^"]*\\s)?${lightClass}(\\s[^"]*)?(?!.*dark:)"`, 'g');
      const newContent = content.replace(regex, (match) => {
        changeCount++;
        return match.replace(lightClass, darkClass);
      });
      
      if (newContent !== content) {
        content = newContent;
      }
    });

    if (changeCount > 0) {
      fs.writeFileSync(fullPath, content, 'utf-8');
      console.log(`🌙 ${filePath} (${changeCount} dark mode classes added)`);
      return { success: true, reason: 'added', changes: changeCount };
    } else {
      console.log(`✅ ${filePath} (no changes needed)`);
      return { success: true, reason: 'no_changes', changes: 0 };
    }
  } catch (error) {
    console.error(`❌ ${filePath} (error: ${error.message})`);
    return { success: false, reason: 'error', error: error.message, changes: 0 };
  }
};

// Main execution
console.log('🌙 MASS DARK MODE FIXER - Starting...\n');

const results = {
  added: 0,
  no_changes: 0,
  not_found: 0,
  error: 0,
  totalChanges: 0
};

pagesNeedingDarkMode.forEach((page) => {
  const result = applyDarkMode(page);
  
  if (result.success && result.reason === 'added') {
    results.added++;
    results.totalChanges += result.changes;
  }
  if (result.success && result.reason === 'no_changes') results.no_changes++;
  if (!result.success && result.reason === 'not_found') results.not_found++;
  if (!result.success && result.reason === 'error') results.error++;
});

console.log('\n📊 MASS DARK MODE FIXER - Summary:');
console.log(`🌙 Pages updated: ${results.added}`);
console.log(`🎨 Total dark: classes added: ${results.totalChanges}`);
console.log(`✓  No changes needed: ${results.no_changes}`);
console.log(`⏭️  Not found: ${results.not_found}`);
console.log(`❌ Errors: ${results.error}`);
console.log(`\n🎯 Next steps:`);
console.log('1. Review changes with: git diff');
console.log('2. Test in dark mode');
console.log('3. Run: npm run theme:validate');
console.log('4. Run: npx percy exec -- npm run test:visual');
