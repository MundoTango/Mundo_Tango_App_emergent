#!/usr/bin/env node
/**
 * MASS TRANSLATION FIXER - MB.MD Parallel Execution
 * Adds useTranslation hook to all pages missing it
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pages needing translation (from audit)
const pagesNeedingTranslation = [
  'client/src/pages/__tests__/profile.test.tsx',
  'client/src/pages/_archive/ModernMemoriesPage.tsx',
  'client/src/pages/_debug/MemoriesDebug.tsx',
  'client/src/pages/_debug/MemoriesTest.tsx',
  'client/src/pages/_debug/PostingDemo.tsx',
  'client/src/pages/_debug/ModernMemoriesPage.tsx',
  'client/src/pages/admin/sprints.tsx',
  'client/src/pages/admin/StoriesList.tsx',
  'client/src/pages/admin/EpicDetail.tsx',
  'client/src/pages/admin/EpicsList.tsx',
  'client/src/pages/admin/StoryDetail.tsx',
  'client/src/pages/admin/open-sources.tsx',
  'client/src/pages/admin/ESAMind.tsx',
  'client/src/pages/admin/projects.tsx',
  'client/src/pages/admin/TenantManagement.tsx',
  'client/src/pages/admin/AgentLearnings.tsx',
  'client/src/pages/admin/DeploymentConfig.tsx',
  'client/src/pages/admin/AgentCollaborationVisualizer.tsx',
  'client/src/pages/admin/PlatformHealth.tsx',
  'client/src/pages/admin/SmartAgentsDashboard.tsx'
];

// Add useTranslation hook to a file
const addTranslationHook = (filePath) => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⏭️  Skipping ${filePath} (not found)`);
      return { success: false, reason: 'not_found' };
    }

    let content = fs.readFileSync(fullPath, 'utf-8');
    
    // Check if already has useTranslation
    if (content.includes('useTranslation')) {
      console.log(`✅ ${filePath} (already has translation)`);
      return { success: true, reason: 'already_done' };
    }

    // Add import at the top (after other imports)
    const importStatement = "import { useTranslation } from 'react-i18next';";
    
    if (!content.includes(importStatement)) {
      // Find the last import statement
      const importRegex = /^import .+ from .+;$/gm;
      const imports = content.match(importRegex);
      
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        content = content.replace(lastImport, `${lastImport}\n${importStatement}`);
      } else {
        // No imports found, add at the beginning
        content = `${importStatement}\n\n${content}`;
      }
    }

    // Add hook in the component (find first function component)
    const componentRegex = /(export\s+(?:default\s+)?function\s+\w+.*?\{)/;
    const match = content.match(componentRegex);
    
    if (match) {
      const hookStatement = "\n  const { t } = useTranslation();";
      content = content.replace(match[0], `${match[0]}${hookStatement}`);
    }

    // Write back to file
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`🔧 ${filePath} (translation hook added)`);
    return { success: true, reason: 'added' };
  } catch (error) {
    console.error(`❌ ${filePath} (error: ${error.message})`);
    return { success: false, reason: 'error', error: error.message };
  }
};

// Main execution
console.log('🚀 MASS TRANSLATION FIXER - Starting...\n');

const results = {
  added: 0,
  already_done: 0,
  not_found: 0,
  error: 0
};

pagesNeedingTranslation.forEach((page, index) => {
  const result = addTranslationHook(page);
  
  if (result.success && result.reason === 'added') results.added++;
  if (result.success && result.reason === 'already_done') results.already_done++;
  if (!result.success && result.reason === 'not_found') results.not_found++;
  if (!result.success && result.reason === 'error') results.error++;
});

console.log('\n📊 MASS TRANSLATION FIXER - Summary:');
console.log(`✅ Added: ${results.added}`);
console.log(`✓  Already done: ${results.already_done}`);
console.log(`⏭️  Not found: ${results.not_found}`);
console.log(`❌ Errors: ${results.error}`);
console.log(`\n🎯 Next steps:`);
console.log('1. Review changes with: git diff');
console.log('2. Extract hardcoded strings');
console.log('3. Generate translation keys');
console.log('4. Run: npm run i18n:generate');
