#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';

const traverse = traverseModule.default || traverseModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INTERACTIVE_ELEMENTS = new Set([
  'button', 'Button',
  'input', 'Input',
  'select', 'Select',
  'textarea', 'Textarea',
  'a', 'Link',
  'form', 'Form'
]);

function generateTestId(elementName, props, children) {
  const baseElement = elementName.toLowerCase().replace(/^(.*?)([a-z]+)$/i, '$2');
  
  // Try to extract context from various sources
  let context = 'element';
  
  // 1. Check aria-label
  const ariaLabel = props.find(p => p.name?.name === 'aria-label');
  if (ariaLabel && ariaLabel.value?.value) {
    context = ariaLabel.value.value.toLowerCase().replace(/\s+/g, '-');
  }
  
  // 2. Check className for semantic info
  if (context === 'element') {
    const className = props.find(p => p.name?.name === 'className');
    if (className && className.value?.value) {
      const classes = className.value.value.split(' ');
      const semanticClass = classes.find(c => !c.startsWith('bg-') && !c.startsWith('text-') && !c.startsWith('border-'));
      if (semanticClass) {
        context = semanticClass.split('-')[0];
      }
    }
  }
  
  // 3. Check for text content (for buttons/links)
  if (context === 'element' && children && children.length > 0) {
    const firstChild = children[0];
    if (firstChild.type === 'JSXText') {
      const text = firstChild.value.trim().toLowerCase().replace(/\s+/g, '-').substring(0, 20);
      if (text) context = text;
    } else if (firstChild.type === 'JSXExpressionContainer' && firstChild.expression?.value) {
      context = String(firstChild.expression.value).toLowerCase().replace(/\s+/g, '-').substring(0, 20);
    }
  }
  
  // Generate clean test ID
  const testId = `${baseElement}-${context}`.toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return testId;
}

function hasTestId(props) {
  return props.some(p => p.name?.name === 'data-testid');
}

function addTestIds(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  let modifications = [];
  
  // Skip if already has test IDs
  if (content.includes('data-testid')) {
    return { updated: false, changes: 0, reason: 'Already has test IDs' };
  }
  
  let ast;
  try {
    ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
  } catch (error) {
    return { updated: false, changes: 0, reason: `Parse error: ${error.message}` };
  }
  
  traverse(ast, {
    JSXElement(path) {
      const openingElement = path.node.openingElement;
      const elementName = openingElement.name.name;
      
      // Check if this is an interactive element
      if (INTERACTIVE_ELEMENTS.has(elementName)) {
        const props = openingElement.attributes;
        
        // Skip if already has data-testid
        if (hasTestId(props)) {
          return;
        }
        
        // Generate test ID
        const testId = generateTestId(
          elementName,
          props,
          path.node.children
        );
        
        // Calculate position to insert attribute
        const start = openingElement.start;
        const nameEnd = openingElement.name.end || (start + elementName.length);
        
        // Store modification
        modifications.push({
          position: nameEnd,
          insertion: ` data-testid="${testId}"`
        });
      }
    }
  });
  
  // Apply modifications in reverse order to preserve positions
  if (modifications.length > 0) {
    modifications.sort((a, b) => b.position - a.position);
    
    let modifiedContent = content;
    modifications.forEach(mod => {
      modifiedContent = 
        modifiedContent.slice(0, mod.position) +
        mod.insertion +
        modifiedContent.slice(mod.position);
    });
    
    writeFileSync(filePath, modifiedContent);
    return { updated: true, changes: modifications.length };
  }
  
  return { updated: false, changes: 0 };
}

function scanComponentFiles(path) {
  const files = [];
  const stat = statSync(path);
  
  // If it's a file, just return it
  if (stat.isFile() && (path.endsWith('.tsx') || path.endsWith('.jsx'))) {
    return [path];
  }
  
  // If it's a directory, scan it
  if (!stat.isDirectory()) {
    return [];
  }
  
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
  
  scan(path);
  return files;
}

// Main execution
const targetDir = process.argv[2] || 'client/src/components';

console.log('\n🏷️  AST-BASED TEST ID AUTOMATION TOOL\n');
console.log('═'.repeat(80));
console.log('');
console.log(`Scanning: ${targetDir}`);

const files = scanComponentFiles(targetDir);
console.log(`Files found: ${files.length}\n`);

let filesUpdated = 0;
let totalTestIds = 0;

files.forEach((file, index) => {
  const result = addTestIds(file);
  
  if (result.updated) {
    filesUpdated++;
    totalTestIds += result.changes;
    const relativePath = file.replace(process.cwd(), '').replace(/^\//, '/');
    console.log(`✅ [${index + 1}/${files.length}] ${relativePath} (${result.changes} test IDs added)`);
  }
});

console.log('');
console.log('═'.repeat(80));
console.log('');
console.log(`📊 TEST ID SUMMARY:`);
console.log(`   Files scanned: ${files.length}`);
console.log(`   Files updated: ${filesUpdated}`);
console.log(`   Test IDs added: ${totalTestIds}\n`);
