#!/usr/bin/env node

/**
 * Emergency Fix: WCAG onClick Syntax Errors
 * Fixes broken onClick patterns: onClick={() = aria-label="Button">
 */

import fs from 'fs';
import { glob } from 'glob';

console.log('🔧 Emergency WCAG onClick Syntax Fix\n');

const files = await glob('client/src/**/*.{tsx,ts}', { ignore: 'node_modules/**' });

let totalFixed = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern: onClick={() = aria-label="Button">  or similar
  // Should be: onClick={() => ...} aria-label="..."
  
  // Fix: Replace malformed onClick with proper syntax
  const pattern = /onClick=\(\(\)\s*=\s*aria-label="Button"\s*>\s*([^}]+)\}/g;
  if (pattern.test(content)) {
    content = content.replace(
      /onClick=\(\(\)\s*=\s*aria-label="Button"\s*>\s*([^}]+)\}/g,
      (match, body) => `onClick={() => ${body.trim()}} aria-label="Button"`
    );
    modified = true;
    totalFixed++;
    console.log(`✅ Fixed: ${filePath}`);
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

console.log(`\n✨ Fixed ${totalFixed} files with onClick syntax errors\n`);
