#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOW_CONTRAST_FIXES = [
  { pattern: /text-gray-400/g, replacement: 'text-gray-600 dark:text-gray-400' },
  { pattern: /text-neutral-400/g, replacement: 'text-neutral-600 dark:text-neutral-400' },
  { pattern: /text-gray-300/g, replacement: 'text-gray-600 dark:text-gray-300' },
  { pattern: /text-neutral-300/g, replacement: 'text-neutral-600 dark:text-neutral-300' },
];

function fixContrast(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let changes = 0;
  
  LOW_CONTRAST_FIXES.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      changes += matches.length;
    }
  });
  
  if (changes > 0) {
    writeFileSync(filePath, content);
    return { fixed: true, changes };
  }
  
  return { fixed: false, changes: 0 };
}

function scanFiles(dir) {
  const files = [];
  
  function scan(currentDir) {
    const entries = readdirSync(currentDir);
    
    entries.forEach(entry => {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        scan(fullPath);
      } else if (stat.isFile() && (entry.endsWith('.tsx') || entry.endsWith('.jsx'))) {
        files.push(fullPath);
      }
    });
  }
  
  scan(dir);
  return files;
}

// Main execution
const targetDir = process.argv[2] || join(__dirname, '../../client/src');
const files = scanFiles(targetDir);

console.log(`\n🎨 CONTRAST FIX TOOL\n`);
console.log('═'.repeat(80));
console.log(`\nScanning: ${targetDir}`);
console.log(`Files found: ${files.length}\n`);

let totalFixed = 0;
let totalChanges = 0;

files.forEach((file, index) => {
  const result = fixContrast(file);
  
  if (result.fixed) {
    totalFixed++;
    totalChanges += result.changes;
    console.log(`✅ [${index + 1}/${files.length}] ${file.replace(targetDir, '')} (${result.changes} fixes)`);
  }
});

console.log(`\n${'═'.repeat(80)}`);
console.log(`\n📊 CONTRAST FIX SUMMARY:`);
console.log(`   Files scanned: ${files.length}`);
console.log(`   Files fixed: ${totalFixed}`);
console.log(`   Total contrast fixes: ${totalChanges}\n`);
