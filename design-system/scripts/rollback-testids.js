#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function removeTestIds(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let originalContent = content;
  
  // Remove malformed test IDs from various patterns
  const patterns = [
    // Self-closing tags: <Component / data-testid="...">
    / \/ data-testid="[^"]*">/g,
    // Arrow functions: onClick={() = data-testid="...">
    / = data-testid="[^"]*">/g,
    // Type definitions: <Type data-testid="...">
    /<([A-Z][a-zA-Z]*) data-testid="[^"]*">/g,
    // General cleanup of any remaining malformed patterns
    / data-testid="[^"]*" \/>/g,
  ];
  
  patterns.forEach(pattern => {
    if (pattern.source.includes('([A-Z]')) {
      // For type definitions, just remove the test ID
      content = content.replace(pattern, '<$1>');
    } else {
      // For others, restore original syntax
      content = content.replace(/ \/ data-testid="[^"]*">/g, ' />');
      content = content.replace(/ = data-testid="[^"]*">/g, '>');
      content = content.replace(/ data-testid="[^"]*" \/>/g, ' />');
    }
  });
  
  // Additional cleanup for specific edge cases
  content = content.replace(/\(\) = data-testid="[^"]*">/g, '() =>');
  content = content.replace(/\(e\) = data-testid="[^"]*">/g, '(e) =>');
  
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

console.log(`\n🧹 TEST ID ROLLBACK TOOL\n`);
console.log('═'.repeat(80));
console.log(`\nCleaning: ${targetDir}`);
console.log(`Files found: ${files.length}\n`);

let totalCleaned = 0;

files.forEach((file, index) => {
  const result = removeTestIds(file);
  
  if (result.cleaned) {
    totalCleaned++;
    console.log(`✅ [${index + 1}/${files.length}] ${file.replace(targetDir, '')} - cleaned`);
  }
});

console.log(`\n${'═'.repeat(80)}`);
console.log(`\n📊 ROLLBACK SUMMARY:`);
console.log(`   Files scanned: ${files.length}`);
console.log(`   Files cleaned: ${totalCleaned}\n`);
