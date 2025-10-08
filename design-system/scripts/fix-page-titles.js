#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generatePageTitle(filename) {
  const name = basename(filename, '.tsx').replace(/-/g, ' ');
  return name
    .split(/(?=[A-Z])/)
    .join(' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function addHelmet(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  
  // Check if already has Helmet
  if (content.includes('Helmet') || content.includes('document.title')) {
    return { updated: false, reason: 'Already has title' };
  }
  
  // Check if it's a page component
  if (!filePath.includes('/pages/')) {
    return { updated: false, reason: 'Not a page component' };
  }
  
  const pageTitle = generatePageTitle(basename(filePath));
  
  // Add Helmet import if not present
  if (!content.includes('react-helmet')) {
    const lastImport = content.lastIndexOf('import');
    const importEnd = content.indexOf(';', lastImport) + 1;
    content = content.slice(0, importEnd) + 
              "\nimport { Helmet } from 'react-helmet';" + 
              content.slice(importEnd);
  }
  
  // Find the return statement in the component
  const returnMatch = content.match(/return\s*\(/);
  if (returnMatch) {
    const returnPos = returnMatch.index + returnMatch[0].length;
    
    // Add Helmet after return (
    const helmetCode = `\n    <>\n      <Helmet>\n        <title>${pageTitle} | Life CEO</title>\n      </Helmet>\n      `;
    const closeFragment = `\n    </>\n  `;
    
    // Find the closing of return
    let depth = 1;
    let endPos = returnPos;
    for (let i = returnPos; i < content.length; i++) {
      if (content[i] === '(') depth++;
      if (content[i] === ')') depth--;
      if (depth === 0) {
        endPos = i;
        break;
      }
    }
    
    // Insert Helmet
    const beforeReturn = content.slice(0, returnPos);
    const insideReturn = content.slice(returnPos, endPos);
    const afterReturn = content.slice(endPos);
    
    content = beforeReturn + helmetCode + insideReturn + closeFragment + afterReturn;
    
    writeFileSync(filePath, content);
    return { updated: true, title: pageTitle };
  }
  
  return { updated: false, reason: 'No return statement found' };
}

function scanPages(dir) {
  const files = [];
  
  function scan(currentDir) {
    const entries = readdirSync(currentDir);
    
    entries.forEach(entry => {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        scan(fullPath);
      } else if (stat.isFile() && entry.endsWith('.tsx')) {
        files.push(fullPath);
      }
    });
  }
  
  scan(dir);
  return files;
}

// Main execution
const targetDir = process.argv[2] || join(__dirname, '../../client/src/pages');
const files = scanPages(targetDir);

console.log(`\n📄 PAGE TITLE FIX TOOL\n`);
console.log('═'.repeat(80));
console.log(`\nScanning: ${targetDir}`);
console.log(`Files found: ${files.length}\n`);

let totalFixed = 0;

files.forEach((file, index) => {
  const result = addHelmet(file);
  
  if (result.updated) {
    totalFixed++;
    console.log(`✅ [${index + 1}/${files.length}] ${file.replace(targetDir, '')} - "${result.title}"`);
  }
});

console.log(`\n${'═'.repeat(80)}`);
console.log(`\n📊 PAGE TITLE SUMMARY:`);
console.log(`   Files scanned: ${files.length}`);
console.log(`   Titles added: ${totalFixed}\n`);
