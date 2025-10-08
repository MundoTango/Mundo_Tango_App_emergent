#!/usr/bin/env node

/**
 * Emergency Fix: Broken Self-Closing Tags
 * Fixes: / aria-label="Input field">
 * To: aria-label="..." />
 */

import fs from 'fs';
import { glob } from 'glob';

console.log('🔧 Fixing Broken Self-Closing Tags\n');

const files = await glob('client/src/**/*.{tsx,ts}', { ignore: 'node_modules/**' });

let totalFixed = 0;
let totalReplacements = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Match: / aria-label="Input field">
  // Should be: aria-label="..." />
  const regex = /\s+\/\s+aria-label="([^"]+)">/g;
  const matches = content.match(regex);
  
  if (matches) {
    content = content.replace(regex, (match, ariaLabel) => {
      return `\n              aria-label="${ariaLabel}"\n            />`;
    });
    modified = true;
    totalReplacements += matches.length;
    totalFixed++;
    console.log(`✅ ${filePath}: Fixed ${matches.length} broken self-closing tags`);
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

console.log(`\n✨ Fixed ${totalFixed} files, ${totalReplacements} total errors\n`);
