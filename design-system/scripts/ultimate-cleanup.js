#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function ultimateCleanup(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let originalContent = content;
  
  // Fix keyboard support attributes placed after / in self-closing tags
  // Pattern: <tag ... / role="button" tabIndex={0} onKeyDown={...}>
  // Should be: <tag ... role="button" tabIndex={0} onKeyDown={...} />
  content = content.replace(
    /\s*\/\s*role="button"\s+tabIndex=\{0\}\s+onKeyDown=\{([^}]+\{[^}]+\}[^}]*)\}\s*>/g,
    ' role="button" tabIndex={0} onKeyDown={$1}} />'
  );
  
  // Fix malformed event handlers with double parentheses
  // Pattern: onItemClick(item, index);(e); } }}> 
  // Should be: onItemClick(item, index, e); } }}>
  content = content.replace(/onItemClick\(([^)]+)\);\(e\);\s*\}\s*\}\}/g, 'onItemClick($1, e); }}');
  
  // Fix malformed conditional handlers
  // Pattern: if (newValue) setSelectedFilter(newValue);
  // Context issue - need to check if it's missing braces
  content = content.replace(
    /if\s*\(\s*newValue\s*\)\s+setSelectedFilter\(newValue\);/g,
    'if (newValue) { setSelectedFilter(newValue); }'
  );
  
  // Fix incomplete overlay click handlers  
  // Pattern: closeOnOverlayClick ? onClose : undefined(e);
  // Should be: closeOnOverlayClick && onClose(e);
  content = content.replace(/closeOnOverlayClick\s*\?\s*onClose\s*:\s*undefined\(e\)/g, 'closeOnOverlayClick && onClose(e)');
  
  // Fix wrapped arrow function calls
  // Pattern: () => setShowContentModal(false)(e);
  // Should be: () => setShowContentModal(false);
  content = content.replace(/\(\)\s*=>\s*([a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*\))\(e\)/g, '() => $1');
  
  // Fix city.toLowerCase().replace(...)(e)
  // Pattern: (city.city || city.name).toLowerCase().replace(/\s+/g, '-')(e);
  // Should be: (city.city || city.name).toLowerCase().replace(/\s+/g, '-');
  content = content.replace(/\.replace\(([^)]+)\)\(e\);/g, '.replace($1);');
  
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

console.log(`\n🛠️  ULTIMATE CLEANUP TOOL\n`);
console.log('═'.repeat(80));
console.log(`\nCleaning: ${targetDir}`);
console.log(`Files found: ${files.length}\n`);

let totalFixed = 0;

files.forEach((file, index) => {
  const result = ultimateCleanup(file);
  
  if (result.fixed) {
    totalFixed++;
    console.log(`✅ [${index + 1}/${files.length}] ${file.replace(targetDir, '')} - fixed`);
  }
});

console.log(`\n${'═'.repeat(80)}`);
console.log(`\n📊 ULTIMATE CLEANUP SUMMARY:`);
console.log(`   Files scanned: ${files.length}`);
console.log(`   Files fixed: ${totalFixed}\n`);
