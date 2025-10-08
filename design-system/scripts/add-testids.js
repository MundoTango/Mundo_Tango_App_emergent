#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INTERACTIVE_ELEMENTS = [
  { tag: '<button', testIdPattern: 'button-' },
  { tag: '<input', testIdPattern: 'input-' },
  { tag: '<select', testIdPattern: 'select-' },
  { tag: '<textarea', testIdPattern: 'textarea-' },
  { tag: '<a', testIdPattern: 'link-' },
  { tag: '<Link', testIdPattern: 'link-' },
  { tag: '<Button', testIdPattern: 'button-' },
  { tag: '<Input', testIdPattern: 'input-' },
];

function generateTestId(tagName, context = '') {
  const cleanTag = tagName.toLowerCase().replace('<', '').replace('>', '');
  const baseId = `${cleanTag}-${context || 'interactive'}`.toLowerCase();
  return baseId.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
}

function addTestIds(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let changes = 0;
  
  // Check if file already has testids
  if (content.includes('data-testid')) {
    return { updated: false, changes: 0, reason: 'Already has test IDs' };
  }
  
  INTERACTIVE_ELEMENTS.forEach(({ tag, testIdPattern }) => {
    // Find elements without data-testid
    const regex = new RegExp(`(${tag}(?![^>]*data-testid)[^>]*)(>)`, 'gi');
    
    content = content.replace(regex, (match, opening, closing) => {
      // Extract meaningful context from className or children
      const classMatch = opening.match(/className="([^"]*)"/);
      const context = classMatch ? classMatch[1].split(' ')[0] : 'element';
      
      changes++;
      return `${opening} data-testid="${testIdPattern}${context}"${closing}`;
    });
  });
  
  if (changes > 0) {
    writeFileSync(filePath, content);
    return { updated: true, changes };
  }
  
  return { updated: false, changes: 0 };
}

function scanComponentFiles(dir) {
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
const files = scanComponentFiles(targetDir);

console.log(`\n🏷️  TEST ID AUTOMATION TOOL\n`);
console.log('═'.repeat(80));
console.log(`\nScanning: ${targetDir}`);
console.log(`Files found: ${files.length}\n`);

let totalUpdated = 0;
let totalTestIds = 0;

files.forEach((file, index) => {
  const result = addTestIds(file);
  
  if (result.updated) {
    totalUpdated++;
    totalTestIds += result.changes;
    console.log(`✅ [${index + 1}/${files.length}] ${file.replace(targetDir, '')} (${result.changes} test IDs added)`);
  }
});

console.log(`\n${'═'.repeat(80)}`);
console.log(`\n📊 TEST ID SUMMARY:`);
console.log(`   Files scanned: ${files.length}`);
console.log(`   Files updated: ${totalUpdated}`);
console.log(`   Test IDs added: ${totalTestIds}\n`);
