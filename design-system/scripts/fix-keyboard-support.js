#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function addKeyboardSupport(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let changes = 0;
  
  // Find divs with onClick but no keyboard support
  const divOnClickPattern = /<div([^>]*)onClick={([^}]+)}([^>]*)(\/?)>/g;
  
  content = content.replace(divOnClickPattern, (match, before, handler, after, selfClose) => {
    // Check if already has keyboard support
    if (match.includes('onKeyDown') || match.includes('onKeyPress') || match.includes('tabIndex')) {
      return match;
    }
    
    changes++;
    const keyHandler = handler.trim();
    
    // Add role, tabIndex, and onKeyDown
    return `<div${before}onClick={${handler}}${after} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ${keyHandler}(e); } }}${selfClose}>`;
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

console.log(`\n⌨️  KEYBOARD SUPPORT FIX TOOL\n`);
console.log('═'.repeat(80));
console.log(`\nScanning: ${targetDir}`);
console.log(`Files found: ${files.length}\n`);

let totalFixed = 0;
let totalChanges = 0;

files.forEach((file, index) => {
  const result = addKeyboardSupport(file);
  
  if (result.fixed) {
    totalFixed++;
    totalChanges += result.changes;
    console.log(`✅ [${index + 1}/${files.length}] ${file.replace(targetDir, '')} (${result.changes} divs fixed)`);
  }
});

console.log(`\n${'═'.repeat(80)}`);
console.log(`\n📊 KEYBOARD SUPPORT SUMMARY:`);
console.log(`   Files scanned: ${files.length}`);
console.log(`   Files fixed: ${totalFixed}`);
console.log(`   Interactive divs fixed: ${totalChanges}\n`);
