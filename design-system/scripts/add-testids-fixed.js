#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INTERACTIVE_ELEMENTS = [
  { tag: 'button', testIdPattern: 'button-' },
  { tag: 'input', testIdPattern: 'input-' },
  { tag: 'select', testIdPattern: 'select-' },
  { tag: 'textarea', testIdPattern: 'textarea-' },
  { tag: 'a', testIdPattern: 'link-' },
];

const INTERACTIVE_COMPONENTS = [
  { tag: 'Link', testIdPattern: 'link-' },
  { tag: 'Button', testIdPattern: 'button-' },
  { tag: 'Input', testIdPattern: 'input-' },
];

function generateTestId(tagName, context = '') {
  const cleanTag = tagName.toLowerCase();
  const baseId = `${cleanTag}-${context || 'element'}`.toLowerCase();
  return baseId.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
}

function addTestIds(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let changes = 0;
  
  // Check if file already has testids
  if (content.includes('data-testid')) {
    return { updated: false, changes: 0, reason: 'Already has test IDs' };
  }
  
  // Process HTML elements (lowercase)
  INTERACTIVE_ELEMENTS.forEach(({ tag, testIdPattern }) => {
    // Match opening tags without data-testid, handle both self-closing and regular
    // Pattern: <tag...> or <tag.../>
    const regex = new RegExp(
      `<${tag}(?![^>]*data-testid)([^/>]*)(\\s*\\/?>)`,
      'gi'
    );
    
    content = content.replace(regex, (match, attributes, closing) => {
      // Skip if this looks like it's inside a string or comment
      if (match.includes('//') || match.includes('/*')) {
        return match;
      }
      
      // Extract meaningful context from className
      const classMatch = attributes.match(/className=["']([^"']*)["']/);
      let context = 'element';
      
      if (classMatch) {
        const classes = classMatch[1].split(' ');
        context = classes[0] || 'element';
      }
      
      changes++;
      const testId = generateTestId(tag, context);
      
      // Properly insert before closing
      return `<${tag}${attributes} data-testid="${testId}"${closing}`;
    });
  });
  
  // Process React components (PascalCase)
  INTERACTIVE_COMPONENTS.forEach(({ tag, testIdPattern }) => {
    const regex = new RegExp(
      `<${tag}(?![^>]*data-testid)([^/>]*)(\\s*\\/?>)`,
      'g'
    );
    
    content = content.replace(regex, (match, attributes, closing) => {
      // Skip if this looks like it's in a type definition
      if (match.includes(':') && match.includes('React.')) {
        return match;
      }
      
      const classMatch = attributes.match(/className=["']([^"']*)["']/);
      let context = 'element';
      
      if (classMatch) {
        const classes = classMatch[1].split(' ');
        context = classes[0] || 'element';
      }
      
      changes++;
      const testId = generateTestId(tag, context);
      
      return `<${tag}${attributes} data-testid="${testId}"${closing}`;
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

console.log(`\n🏷️  TEST ID AUTOMATION TOOL (FIXED)\n`);
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
