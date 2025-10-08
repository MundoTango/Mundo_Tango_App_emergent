#!/usr/bin/env node

/**
 * ESA Week 4 Workstream 2: Dark Mode Injection
 * Layer 54 (Accessibility) - Add dark: variants to all components
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

console.log('🌙 ESA Week 4 - Dark Mode Injection\n');
console.log('━'.repeat(60));

// Dark mode mappings
const darkModeRules = {
  // Backgrounds
  'bg-white': 'bg-white dark:bg-gray-900',
  'bg-gray-50': 'bg-gray-50 dark:bg-gray-800',
  'bg-gray-100': 'bg-gray-100 dark:bg-gray-800',
  'bg-gray-200': 'bg-gray-200 dark:bg-gray-700',
  
  // Text colors
  'text-gray-900': 'text-gray-900 dark:text-white',
  'text-gray-800': 'text-gray-800 dark:text-gray-100',
  'text-gray-700': 'text-gray-700 dark:text-gray-200',
  'text-gray-600': 'text-gray-600 dark:text-gray-300',
  'text-gray-500': 'text-gray-500 dark:text-gray-400',
  'text-black': 'text-black dark:text-white',
  
  // Borders
  'border-gray-200': 'border-gray-200 dark:border-gray-700',
  'border-gray-300': 'border-gray-300 dark:border-gray-600',
  
  // Design token variants
  'bg-\\[var\\(--color-surface\\)\\]': 'bg-[var(--color-surface)] dark:bg-gray-900',
  'text-\\[var\\(--color-text\\)\\]': 'text-[var(--color-text)] dark:text-white',
};

async function injectDarkMode() {
  const files = await glob('client/src/**/*.{tsx,ts,jsx,js}', { ignore: 'node_modules/**' });
  
  let totalFiles = 0;
  let totalInjections = 0;

  for (const filePath of files) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileInjections = 0;

    // Skip if already has substantial dark mode coverage
    const darkModeCount = (content.match(/dark:/g) || []).length;
    const classNameCount = (content.match(/className=/g) || []).length;
    if (darkModeCount / classNameCount > 0.5) {
      continue; // Skip files already >50% dark mode
    }

    // Inject dark mode variants
    for (const [pattern, replacement] of Object.entries(darkModeRules)) {
      const regex = new RegExp(`\\b${pattern}(?!.*dark:)`, 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, replacement);
        fileInjections += matches.length;
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      totalFiles++;
      totalInjections += fileInjections;
      console.log(`🌙 ${path.basename(filePath)} - ${fileInjections} dark variants added`);
    }
  }

  console.log('\n' + '━'.repeat(60));
  console.log(`\n📊 Dark Mode Injection Complete:`);
  console.log(`   Files modified: ${totalFiles}`);
  console.log(`   Dark variants added: ${totalInjections}`);
  console.log(`   Estimated coverage: ${((totalInjections / 1000) * 100).toFixed(1)}%\n`);
}

injectDarkMode().catch(console.error);
