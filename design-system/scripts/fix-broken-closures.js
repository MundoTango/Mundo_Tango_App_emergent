#!/usr/bin/env node

/**
 * Emergency Fix: Broken Closure Braces
 * Fixes: value} aria-label="...")}
 * To: value})} aria-label="..."
 */

import fs from 'fs';
import { glob } from 'glob';

console.log('🔧 Fixing Broken Closure Braces\n');

const files = await glob('client/src/**/*.{tsx,ts}', { ignore: 'node_modules/**' });

let totalFixed = 0;
let totalReplacements = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Match: value} aria-label="...")
  // Should be: value})} aria-label="..."
  const regex = /(\w+\.value)\}\s+aria-label="([^"]+)"\)/g;
  const matches = content.match(regex);
  
  if (matches) {
    content = content.replace(regex, (match, value, ariaLabel) => {
      return `${value})} aria-label="${ariaLabel}"`;
    });
    modified = true;
    totalReplacements += matches.length;
    totalFixed++;
    console.log(`✅ ${filePath}: Fixed ${matches.length} broken closures`);
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

console.log(`\n✨ Fixed ${totalFixed} files, ${totalReplacements} total errors\n`);
