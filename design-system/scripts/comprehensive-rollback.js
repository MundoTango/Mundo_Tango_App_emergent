#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function comprehensiveRollback(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let originalContent = content;
  
  // Fix arrow functions: onClick={()> should be onClick={() =>
  content = content.replace(/\{\(\)/g, '{() =>');
  content = content.replace(/\{\(e\)/g, '{(e) =>');
  content = content.replace(/onClick=\{(\(\))\>/g, 'onClick={$1 =>');
  content = content.replace(/onChange=\{(\(\))\>/g, 'onChange={$1 =>');
  content = content.replace(/onChange=\{(\(e\))\>/g, 'onChange={$1 =>');
  content = content.replace(/onClick=\{(\(e\))\>/g, 'onClick={$1 =>');
  content = content.replace(/onFocus=\{(\(\))\>/g, 'onFocus={$1 =>');
  content = content.replace(/onBlur=\{(\(\))\>/g, 'onBlur={$1 =>');
  
  // Remove all remaining data-testid patterns
  content = content.replace(/ data-testid="[^"]*"/g, '');
  
  // Fix type definitions with data-testid
  content = content.replace(/<([A-Za-z][A-Za-z0-9_]*) data-testid="[^"]*">/g, '<$1>');
  content = content.replace(/<([A-Za-z][A-Za-z0-9_]*)\[\] data-testid="[^"]*">/g, '<$1[]>');
  
  // Fix class selectors in CSS strings
  content = content.replace(/\[&\s+data-testid="[^"]*">/g, '[&>');
  
  if (content !== originalContent) {
    writeFileSync(filePath, content);
    return { cleaned: true };
  }
  
  return { cleaned: false };
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

console.log(`\n🧹 COMPREHENSIVE ROLLBACK TOOL\n`);
console.log('═'.repeat(80));
console.log(`\nCleaning: ${targetDir}`);
console.log(`Files found: ${files.length}\n`);

let totalCleaned = 0;

files.forEach((file, index) => {
  const result = comprehensiveRollback(file);
  
  if (result.cleaned) {
    totalCleaned++;
    console.log(`✅ [${index + 1}/${files.length}] ${file.replace(targetDir, '')} - cleaned`);
  }
});

console.log(`\n${'═'.repeat(80)}`);
console.log(`\n📊 COMPREHENSIVE ROLLBACK SUMMARY:`);
console.log(`   Files scanned: ${files.length}`);
console.log(`   Files cleaned: ${totalCleaned}\n`);
