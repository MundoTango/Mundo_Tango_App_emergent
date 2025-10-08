#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DARK_MODE_RULES = [
  // Background colors
  { pattern: /className="([^"]*bg-white[^"]*)"/g, add: 'dark:bg-neutral-900' },
  { pattern: /className="([^"]*bg-gray-50[^"]*)"/g, add: 'dark:bg-neutral-800' },
  { pattern: /className="([^"]*bg-gray-100[^"]*)"/g, add: 'dark:bg-neutral-800' },
  { pattern: /className="([^"]*bg-neutral-50[^"]*)"/g, add: 'dark:bg-neutral-800' },
  { pattern: /className="([^"]*bg-neutral-100[^"]*)"/g, add: 'dark:bg-neutral-800' },
  
  // Text colors
  { pattern: /className="([^"]*text-black[^"]*)"/g, add: 'dark:text-white' },
  { pattern: /className="([^"]*text-gray-900[^"]*)"/g, add: 'dark:text-neutral-100' },
  { pattern: /className="([^"]*text-gray-800[^"]*)"/g, add: 'dark:text-neutral-200' },
  { pattern: /className="([^"]*text-gray-700[^"]*)"/g, add: 'dark:text-neutral-300' },
  { pattern: /className="([^"]*text-gray-600[^"]*)"/g, add: 'dark:text-neutral-400' },
  { pattern: /className="([^"]*text-neutral-900[^"]*)"/g, add: 'dark:text-neutral-100' },
  { pattern: /className="([^"]*text-neutral-800[^"]*)"/g, add: 'dark:text-neutral-200' },
  { pattern: /className="([^"]*text-neutral-700[^"]*)"/g, add: 'dark:text-neutral-300' },
  
  // Border colors
  { pattern: /className="([^"]*border-gray-200[^"]*)"/g, add: 'dark:border-neutral-700' },
  { pattern: /className="([^"]*border-gray-300[^"]*)"/g, add: 'dark:border-neutral-600' },
  { pattern: /className="([^"]*border-neutral-200[^"]*)"/g, add: 'dark:border-neutral-700' },
  { pattern: /className="([^"]*border-neutral-300[^"]*)"/g, add: 'dark:border-neutral-600' },
];

function addDarkMode(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let changes = 0;
  
  // Check if already has dark mode
  if (content.includes('dark:')) {
    return { hasChanges: false, changes: 0, reason: 'Already has dark mode' };
  }
  
  DARK_MODE_RULES.forEach(rule => {
    content = content.replace(rule.pattern, (match, classes) => {
      if (!classes.includes('dark:')) {
        changes++;
        return `className="${classes} ${rule.add}"`;
      }
      return match;
    });
  });
  
  if (changes > 0) {
    writeFileSync(filePath, content);
    return { hasChanges: true, changes };
  }
  
  return { hasChanges: false, changes: 0 };
}

function scanTsxFiles(dir) {
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
const targetDir = process.argv[2] || join(__dirname, '../../client/src/components');
const files = scanTsxFiles(targetDir);

console.log(`\n🌙 DARK MODE INJECTION TOOL\n`);
console.log('═'.repeat(80));
console.log(`\nScanning: ${targetDir}`);
console.log(`Files found: ${files.length}\n`);

let totalUpdated = 0;
let totalChanges = 0;

files.forEach((file, index) => {
  const result = addDarkMode(file);
  
  if (result.hasChanges) {
    totalUpdated++;
    totalChanges += result.changes;
    console.log(`✅ [${index + 1}/${files.length}] ${file.replace(targetDir, '')} (${result.changes} dark mode classes added)`);
  }
});

console.log(`\n${'═'.repeat(80)}`);
console.log(`\n📊 DARK MODE SUMMARY:`);
console.log(`   Files scanned: ${files.length}`);
console.log(`   Files updated: ${totalUpdated}`);
console.log(`   Total dark mode classes: ${totalChanges}\n`);
