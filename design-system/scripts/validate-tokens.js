#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const CSS_TOKENS = path.join(process.cwd(), 'build', 'css', 'tokens.css');
const CLIENT_SRC = path.join(process.cwd(), 'client', 'src');

let violations = [];

// Check if tokens file exists
if (!fs.existsSync(CSS_TOKENS)) {
  console.error('❌ Token file not found. Run "npm run tokens:build" first.');
  process.exit(1);
}

// Extract tokens from CSS
const tokenContent = fs.readFileSync(CSS_TOKENS, 'utf-8');
const tokenNames = [...tokenContent.matchAll(/--([a-z-]+):/g)].map(m => m[1]);

console.log(`✅ Found ${tokenNames.length} design tokens\n`);

// Scan files for hardcoded values
function scanForHardcoded(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanForHardcoded(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.css')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(CLIENT_SRC, filePath);
      
      // Check for hardcoded colors
      const colorMatches = content.match(/#[0-9a-fA-F]{3,6}|rgb\(|rgba\(/g);
      if (colorMatches && !filePath.includes('index.css')) {
        violations.push({
          file: relativePath,
          type: 'hardcoded-color',
          matches: colorMatches.slice(0, 3) // First 3 examples
        });
      }
      
      // Check for hardcoded spacing (px values not in calc)
      const spacingMatches = content.match(/:\s*\d+px(?!\))/g);
      if (spacingMatches && spacingMatches.length > 2 && !filePath.includes('index.css')) {
        violations.push({
          file: relativePath,
          type: 'hardcoded-spacing',
          count: spacingMatches.length
        });
      }
    }
  });
}

scanForHardcoded(CLIENT_SRC);

// Report violations
if (violations.length > 0) {
  console.log('⚠️ Design Token Violations Found:\n');
  
  violations.slice(0, 10).forEach(v => {
    if (v.type === 'hardcoded-color') {
      console.log(`  ${v.file}`);
      console.log(`    Hardcoded colors: ${v.matches.join(', ')}`);
      console.log(`    → Use design tokens instead: var(--color-primary)\n`);
    } else if (v.type === 'hardcoded-spacing') {
      console.log(`  ${v.file}`);
      console.log(`    ${v.count} hardcoded spacing values`);
      console.log(`    → Use design tokens instead: var(--spacing-4)\n`);
    }
  });
  
  console.log(`Total violations: ${violations.length}`);
  console.log('\n💡 Run component migration to fix these issues.\n');
} else {
  console.log('✅ No design token violations found!\n');
}

process.exit(violations.length > 0 ? 1 : 0);
