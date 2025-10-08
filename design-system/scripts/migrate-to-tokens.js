#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COLOR_MAPPINGS = {
  // Hardcoded colors to token mappings
  '#00CED1': 'var(--color-ocean-400)',
  '#40E0D0': 'var(--color-ocean-300)',
  '#48D1CC': 'var(--color-ocean-400)',
  '#20B2AA': 'var(--color-ocean-500)',
  '#008B8B': 'var(--color-ocean-600)',
  '#5F9EA0': 'var(--color-ocean-500)',
  
  // Neutral colors
  '#FFFFFF': 'var(--color-neutral-0)',
  '#F8F9FA': 'var(--color-neutral-50)',
  '#F5F5F5': 'var(--color-neutral-100)',
  '#E5E5E5': 'var(--color-neutral-200)',
  '#D4D4D4': 'var(--color-neutral-300)',
  '#A3A3A3': 'var(--color-neutral-400)',
  '#737373': 'var(--color-neutral-500)',
  '#525252': 'var(--color-neutral-600)',
  '#404040': 'var(--color-neutral-700)',
  '#262626': 'var(--color-neutral-800)',
  '#171717': 'var(--color-neutral-900)',
  '#000000': 'hsl(0, 0%, 0%)',
  
  // Common tailwind to tokens
  'bg-cyan-500': 'bg-ocean-500',
  'text-cyan-500': 'text-ocean-500',
  'border-cyan-500': 'border-ocean-500',
  'bg-teal-500': 'bg-ocean-500',
  'text-teal-500': 'text-ocean-500',
};

const SPACING_MAPPINGS = {
  '0.25rem': 'var(--spacing-1)',
  '0.5rem': 'var(--spacing-2)',
  '0.75rem': 'var(--spacing-3)',
  '1rem': 'var(--spacing-4)',
  '1.5rem': 'var(--spacing-6)',
  '2rem': 'var(--spacing-8)',
  '3rem': 'var(--spacing-12)',
  '4rem': 'var(--spacing-16)',
  '6rem': 'var(--spacing-24)',
};

function migrateFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let changes = 0;
  
  // Replace hex colors
  Object.entries(COLOR_MAPPINGS).forEach(([hex, token]) => {
    const regex = new RegExp(hex, 'gi');
    if (regex.test(content)) {
      content = content.replace(regex, token);
      changes++;
    }
  });
  
  // Replace spacing values
  Object.entries(SPACING_MAPPINGS).forEach(([value, token]) => {
    const regex = new RegExp(value.replace(/\./g, '\\.'), 'g');
    if (regex.test(content)) {
      content = content.replace(regex, token);
      changes++;
    }
  });
  
  if (changes > 0) {
    writeFileSync(filePath, content);
    return { migrated: true, changes };
  }
  
  return { migrated: false, changes: 0 };
}

function scanDirectory(dir, extensions = ['.tsx', '.ts', '.jsx', '.js', '.css']) {
  const files = [];
  
  function scan(currentDir) {
    const entries = readdirSync(currentDir);
    
    entries.forEach(entry => {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        scan(fullPath);
      } else if (stat.isFile() && extensions.some(ext => entry.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }
  
  scan(dir);
  return files;
}

// Main execution
const targetDir = process.argv[2] || join(__dirname, '../../client/src');
const files = scanDirectory(targetDir);

console.log(`\n🔄 TOKEN MIGRATION TOOL\n`);
console.log('═'.repeat(80));
console.log(`\nScanning: ${targetDir}`);
console.log(`Files found: ${files.length}\n`);

let totalMigrated = 0;
let totalChanges = 0;

files.forEach((file, index) => {
  const result = migrateFile(file);
  
  if (result.migrated) {
    totalMigrated++;
    totalChanges += result.changes;
    console.log(`✅ [${index + 1}/${files.length}] ${file.replace(targetDir, '')} (${result.changes} changes)`);
  }
});

console.log(`\n${'═'.repeat(80)}`);
console.log(`\n📊 MIGRATION SUMMARY:`);
console.log(`   Files scanned: ${files.length}`);
console.log(`   Files migrated: ${totalMigrated}`);
console.log(`   Total changes: ${totalChanges}\n`);
