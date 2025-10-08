#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Interactive elements that need data-testid
const INTERACTIVE_ELEMENTS = new Set([
  'button', 'input', 'select', 'textarea', 'a',
  'Button', 'Input', 'Select', 'Textarea', 'Link'
]);

function generateTestId(elementName, attributes) {
  const baseType = elementName.toLowerCase();
  
  // Extract context from className, id, or type attributes
  let context = 'element';
  
  if (attributes) {
    for (const attr of attributes) {
      if (t.isJSXAttribute(attr)) {
        const name = attr.name.name;
        
        if (name === 'className' && t.isStringLiteral(attr.value)) {
          const classes = attr.value.value.split(' ');
          context = classes[0] || 'element';
          break;
        } else if (name === 'type' && t.isStringLiteral(attr.value)) {
          context = attr.value.value;
          break;
        } else if (name === 'id' && t.isStringLiteral(attr.value)) {
          context = attr.value.value;
          break;
        }
      }
    }
  }
  
  // Clean and format test ID
  const testId = `${baseType}-${context}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return testId;
}

function hasDataTestId(attributes) {
  if (!attributes) return false;
  
  return attributes.some(attr => 
    t.isJSXAttribute(attr) && 
    attr.name.name === 'data-testid'
  );
}

function addTestIdsToAST(filePath) {
  const code = readFileSync(filePath, 'utf-8');
  
  // Skip files that already have data-testid
  if (code.includes('data-testid')) {
    return { updated: false, changes: 0, reason: 'Already has test IDs' };
  }
  
  let ast;
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
  } catch (error) {
    return { updated: false, changes: 0, reason: `Parse error: ${error.message}` };
  }
  
  let changes = 0;
  
  traverse(ast, {
    JSXOpeningElement(path) {
      const elementName = path.node.name.name;
      
      // Only process interactive elements
      if (!INTERACTIVE_ELEMENTS.has(elementName)) {
        return;
      }
      
      // Skip if already has data-testid
      if (hasDataTestId(path.node.attributes)) {
        return;
      }
      
      // Generate and add test ID
      const testId = generateTestId(elementName, path.node.attributes);
      const testIdAttr = t.jsxAttribute(
        t.jsxIdentifier('data-testid'),
        t.stringLiteral(testId)
      );
      
      path.node.attributes.push(testIdAttr);
      changes++;
    }
  });
  
  if (changes > 0) {
    const output = generate(ast, {
      retainLines: true,
      compact: false,
    }, code);
    
    writeFileSync(filePath, output.code);
    return { updated: true, changes };
  }
  
  return { updated: false, changes: 0 };
}

function scanFiles(dir, extensions = ['.tsx', '.jsx']) {
  const files = [];
  
  function scan(currentDir) {
    const entries = readdirSync(currentDir);
    
    entries.forEach(entry => {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        scan(fullPath);
      } else if (stat.isFile() && extensions.some(ext => entry.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }
  
  scan(dir);
  return files;
}

// Main execution
const targetDir = process.argv[2] || join(__dirname, '../../client/src');
const limitFiles = process.argv[3] ? parseInt(process.argv[3]) : null;

const allFiles = scanFiles(targetDir);
const files = limitFiles ? allFiles.slice(0, limitFiles) : allFiles;

console.log(`\n🏷️  AST-BASED TEST ID MIGRATION\n`);
console.log('═'.repeat(80));
console.log(`\nScanning: ${targetDir}`);
console.log(`Files found: ${allFiles.length}`);
if (limitFiles) {
  console.log(`Processing: ${files.length} (limited for testing)\n`);
} else {
  console.log(`Processing: ${files.length}\n`);
}

let totalUpdated = 0;
let totalTestIds = 0;
const errors = [];

files.forEach((file, index) => {
  const result = addTestIdsToAST(file);
  
  if (result.updated) {
    totalUpdated++;
    totalTestIds += result.changes;
    console.log(`✅ [${index + 1}/${files.length}] ${file.replace(targetDir, '')} (${result.changes} test IDs added)`);
  } else if (result.reason && result.reason.startsWith('Parse error')) {
    errors.push({ file, reason: result.reason });
    console.log(`❌ [${index + 1}/${files.length}] ${file.replace(targetDir, '')} - ${result.reason}`);
  }
});

console.log(`\n${'═'.repeat(80)}`);
console.log(`\n📊 MIGRATION SUMMARY:`);
console.log(`   Files scanned: ${files.length}`);
console.log(`   Files updated: ${totalUpdated}`);
console.log(`   Test IDs added: ${totalTestIds}`);
console.log(`   Parse errors: ${errors.length}`);

if (errors.length > 0 && errors.length <= 5) {
  console.log(`\n⚠️  Errors:`);
  errors.forEach(({ file, reason }) => {
    console.log(`   ${file.replace(targetDir, '')}: ${reason}`);
  });
}

console.log('');
