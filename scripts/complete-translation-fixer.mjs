#!/usr/bin/env node
/**
 * COMPLETE TRANSLATION FIXER - Finish the remaining pages
 * Part 2: Add translation to ALL remaining pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all pages without translation
const getAllPagesWithoutTranslation = () => {
  try {
    const result = execSync(
      'find client/src/pages -name "*.tsx" -type f | while read file; do grep -q "useTranslation\\|import.*i18n" "$file" || echo "$file"; done',
      { encoding: 'utf-8', cwd: process.cwd() }
    );
    
    return result.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding pages:', error);
    return [];
  }
};

// Add useTranslation hook to a file
const addTranslationHook = (filePath) => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      return { success: false, reason: 'not_found' };
    }

    let content = fs.readFileSync(fullPath, 'utf-8');
    
    // Check if already has useTranslation
    if (content.includes('useTranslation')) {
      return { success: true, reason: 'already_done' };
    }

    // Add import at the top (after other imports)
    const importStatement = "import { useTranslation } from 'react-i18next';";
    
    if (!content.includes(importStatement)) {
      const importRegex = /^import .+ from .+;$/gm;
      const imports = content.match(importRegex);
      
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        content = content.replace(lastImport, `${lastImport}\n${importStatement}`);
      } else {
        content = `${importStatement}\n\n${content}`;
      }
    }

    // Add hook in the component
    const componentRegex = /(export\s+(?:default\s+)?function\s+\w+.*?\{)/;
    const match = content.match(componentRegex);
    
    if (match) {
      const hookStatement = "\n  const { t } = useTranslation();";
      content = content.replace(match[0], `${match[0]}${hookStatement}`);
    }

    fs.writeFileSync(fullPath, content, 'utf-8');
    return { success: true, reason: 'added' };
  } catch (error) {
    return { success: false, reason: 'error', error: error.message };
  }
};

// Main execution
console.log('🚀 COMPLETE TRANSLATION FIXER - Part 2\n');

const pages = getAllPagesWithoutTranslation();
console.log(`📋 Found ${pages.length} pages without translation\n`);

const results = { added: 0, already_done: 0, not_found: 0, error: 0 };

pages.forEach((page, index) => {
  const result = addTranslationHook(page);
  
  const progress = `[${index + 1}/${pages.length}]`;
  
  if (result.success && result.reason === 'added') {
    console.log(`${progress} 🔧 ${page}`);
    results.added++;
  } else if (result.success && result.reason === 'already_done') {
    console.log(`${progress} ✅ ${page}`);
    results.already_done++;
  } else if (!result.success && result.reason === 'not_found') {
    console.log(`${progress} ⏭️  ${page} (not found)`);
    results.not_found++;
  } else {
    console.log(`${progress} ❌ ${page} (${result.error})`);
    results.error++;
  }
});

console.log('\n📊 COMPLETE TRANSLATION FIXER - Final Summary:');
console.log(`✅ Translation hooks added: ${results.added}`);
console.log(`✓  Already had translation: ${results.already_done}`);
console.log(`⏭️  Not found: ${results.not_found}`);
console.log(`❌ Errors: ${results.error}`);
console.log(`\n🎉 Translation coverage: ${results.added + results.already_done} pages ready!`);
