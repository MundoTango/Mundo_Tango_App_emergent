#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function completeRecovery(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let originalContent = content;
  
  // 1. Fix keyboard support on self-closing tags: <div ... / role="button" ...>
  // Should be: <div ... role="button" ... />
  content = content.replace(
    /(<[a-zA-Z][a-zA-Z0-9]*[^>]*)\s*\/\s*role="button"\s+tabIndex=\{0\}\s+onKeyDown=\{[^}]*\{[^}]*\}[^}]*\}\s*>/g,
    '$1 />'
  );
  
  // 2. Fix event handlers with extra semicolons: ; } }}>
  // Should be: }}> 
  content = content.replace(/;\s*\}\s*\}\s*>/g, ' }}>');
  
  // 3. Fix conditional statements without braces
  content = content.replace(
    /if\s*\(\s*newValue\s*\)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\(newValue\);/g,
    'if (newValue) { $1(newValue); }'
  );
  
  // 4. Fix duplicate Helmet imports - keep only first occurrence
  const helmetImportPattern = /import\s+\{\s*Helmet\s*\}\s+from\s+['"]react-helmet['"];?\s*/g;
  const helmetImports = content.match(helmetImportPattern);
  if (helmetImports && helmetImports.length > 1) {
    // Remove all Helmet imports
    content = content.replace(helmetImportPattern, '');
    // Add back one at the top after other imports
    const lastImportIndex = content.lastIndexOf('import');
    if (lastImportIndex !== -1) {
      const importEnd = content.indexOf(';', lastImportIndex) + 1;
      content = content.slice(0, importEnd) + 
                "\nimport { Helmet } from 'react-helmet';" + 
                content.slice(importEnd);
    }
  }
  
  // 5. Fix MonitoringProvider onClick issue: setShowPrivacySettings(false)} />
  // Should be: onClick={() => setShowPrivacySettings(false)} />
  content = content.replace(
    /className="fixed inset-0"\s+setShowPrivacySettings\(false\)\s*\}\s*\/>/g,
    'className="fixed inset-0" onClick={() => setShowPrivacySettings(false)} />'
  );
  
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

console.log(`\n🔄 COMPLETE RECOVERY TOOL\n`);
console.log('═'.repeat(80));
console.log(`\nRecovering: ${targetDir}`);
console.log(`Files found: ${files.length}\n`);

let totalFixed = 0;

files.forEach((file, index) => {
  const result = completeRecovery(file);
  
  if (result.fixed) {
    totalFixed++;
    console.log(`✅ [${index + 1}/${files.length}] ${file.replace(targetDir, '')} - recovered`);
  }
});

console.log(`\n${'═'.repeat(80)}`);
console.log(`\n📊 RECOVERY SUMMARY:`);
console.log(`   Files scanned: ${files.length}`);
console.log(`   Files recovered: ${totalFixed}\n`);
