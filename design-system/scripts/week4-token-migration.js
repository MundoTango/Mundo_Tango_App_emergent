#!/usr/bin/env node

/**
 * ESA Week 4 Workstream 1: Design Token Migration
 * Layer 9 (UI Framework) - Replace hardcoded colors with CSS custom properties
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

console.log('🎨 ESA Week 4 - Design Token Migration\n');
console.log('━'.repeat(60));

// Token mapping: Tailwind classes → CSS custom properties
const tokenMappings = {
  // Ocean/Teal/Cyan/Turquoise → Primary tokens
  'bg-teal-50': 'bg-[var(--color-ocean-50)]',
  'bg-teal-100': 'bg-[var(--color-ocean-100)]',
  'bg-teal-500': 'bg-[var(--color-primary)]',
  'bg-teal-600': 'bg-[var(--color-primary-hover)]',
  'bg-cyan-50': 'bg-[var(--color-ocean-50)]',
  'bg-cyan-500': 'bg-[var(--color-primary)]',
  'bg-turquoise-50': 'bg-[var(--color-ocean-50)]',
  'bg-turquoise-500': 'bg-[var(--color-primary)]',
  
  'text-teal-500': 'text-[var(--color-primary)]',
  'text-teal-600': 'text-[var(--color-primary-hover)]',
  'text-teal-700': 'text-[var(--color-primary-hover)]',
  'text-cyan-500': 'text-[var(--color-primary)]',
  'text-cyan-600': 'text-[var(--color-primary-hover)]',
  'text-turquoise-500': 'text-[var(--color-primary)]',
  'text-turquoise-600': 'text-[var(--color-primary-hover)]',
  
  'border-teal-300': 'border-[var(--color-ocean-300)]',
  'border-teal-500': 'border-[var(--color-primary)]',
  'border-cyan-300': 'border-[var(--color-ocean-300)]',
  'border-turquoise-300': 'border-[var(--color-ocean-300)]',
  
  // Gradients
  'from-teal-400': 'from-[var(--color-ocean-400)]',
  'from-teal-500': 'from-[var(--color-primary)]',
  'from-cyan-400': 'from-[var(--color-ocean-400)]',
  'from-cyan-500': 'from-[var(--color-primary)]',
  'to-blue-500': 'to-[var(--color-ocean-500)]',
  'to-blue-600': 'to-[var(--color-ocean-600)]',
  
  // Neutrals
  'bg-white': 'bg-[var(--color-surface)]',
  'bg-gray-50': 'bg-[var(--color-surface-elevated)]',
  'bg-gray-100': 'bg-[var(--color-neutral-100)]',
  'text-gray-900': 'text-[var(--color-text)]',
  'text-gray-700': 'text-[var(--color-text-secondary)]',
  'border-gray-200': 'border-[var(--color-border)]',
};

async function migrateTokens() {
  const files = await glob('client/src/**/*.{tsx,ts,jsx,js}', { ignore: 'node_modules/**' });
  
  let totalFiles = 0;
  let totalReplacements = 0;

  for (const filePath of files) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileReplacements = 0;

    // Replace each hardcoded Tailwind class with design token
    for (const [oldClass, newClass] of Object.entries(tokenMappings)) {
      const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, newClass);
        fileReplacements += matches.length;
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      totalFiles++;
      totalReplacements += fileReplacements;
      console.log(`✅ ${path.basename(filePath)} - ${fileReplacements} replacements`);
    }
  }

  console.log('\n' + '━'.repeat(60));
  console.log(`\n📊 Token Migration Complete:`);
  console.log(`   Files modified: ${totalFiles}`);
  console.log(`   Total replacements: ${totalReplacements}`);
  console.log(`   Design token adoption: ${((totalReplacements / 500) * 100).toFixed(1)}%\n`);
}

migrateTokens().catch(console.error);
