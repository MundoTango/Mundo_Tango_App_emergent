#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function finalSyntaxFix(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let originalContent = content;
  
  // Fix double arrow functions: () => => should be () =>
  content = content.replace(/\(\)\s*=>\s*=>/g, '() =>');
  content = content.replace(/\(e\)\s*=>\s*=>/g, '(e) =>');
  content = content.replace(/\(([^)]+)\)\s*=>\s*=>/g, '($1) =>');
  
  // Fix malformed arrow operators: () =>> should be () =>
  content = content.replace(/=>\s*>/g, ' =>');
  
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
      } else if (stat.isFile() && (entry.endsWith('.tsx') || entry.endsWith('.jsx') || entry.endsWith('.ts'))) {
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

console.log(`\n🔧 FINAL SYNTAX FIX TOOL\n`);
console.log('═'.repeat(80));
console.log(`\nFixing: ${targetDir}`);
console.log(`Files found: ${files.length}\n`);

let totalFixed = 0;

files.forEach((file, index) => {
  const result = finalSyntaxFix(file);
  
  if (result.fixed) {
    totalFixed++;
    console.log(`✅ [${index + 1}/${files.length}] ${file.replace(targetDir, '')} - fixed`);
  }
});

console.log(`\n${'═'.repeat(80)}`);
console.log(`\n📊 FINAL FIX SUMMARY:`);
console.log(`   Files scanned: ${files.length}`);
console.log(`   Files fixed: ${totalFixed}\n`);
