#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function finalCleanup(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let originalContent = content;
  
  // Remove all keyboard support artifacts with / role= pattern
  // Pattern: ... / role="button" tabIndex={0} onKeyDown={...}> 
  // Fix: Remove completely
  content = content.replace(/\s*\/\s*role="button"\s+tabIndex=\{0\}\s+onKeyDown=\{[^}]*\{[^}]*\}[^}]*\}\s*>/g, ' />');
  
  // Remove standalone / role= lines
  content = content.replace(/^\s*\/\s*role="button".*$/gm, '');
  
  if (content !== originalContent) {
    writeFileSync(filePath, content);
    return { fixed: true };
  }
  
  return { fixed: false };
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

console.log(`\n🔧 FINAL CLEANUP TOOL\n`);
console.log('═'.repeat(80));
console.log(`\nCleaning: ${targetDir}`);
console.log(`Files found: ${files.length}\n`);

let totalFixed = 0;

files.forEach((file, index) => {
  const result = finalCleanup(file);
  
  if (result.fixed) {
    totalFixed++;
    console.log(`✅ [${index + 1}/${files.length}] ${file.replace(targetDir, '')} - cleaned`);
  }
});

console.log(`\n${'═'.repeat(80)}`);
console.log(`\n📊 FINAL CLEANUP SUMMARY:`);
console.log(`   Files scanned: ${files.length}`);
console.log(`   Files cleaned: ${totalFixed}\n`);
