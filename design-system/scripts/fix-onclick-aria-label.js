#!/usr/bin/env node

/**
 * Emergency Fix: onClick Aria-Label Misplacement
 * Fixes: onClick={() => { code;} aria-label="..."}
 * To: onClick={() => { code;}} aria-label="..."
 */

import fs from 'fs';
import { glob } from 'glob';

console.log('🔧 Fixing onClick Aria-Label Misplacement\n');

const files = await glob('client/src/**/*.{tsx,ts}', { ignore: 'node_modules/**' });

let totalFixed = 0;
let totalReplacements = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Pattern 1: ;} aria-label="..."} (closing brace inside)
  const regex1 = /;}\s+aria-label="([^"]+)"}/g;
  const matches1 = content.match(regex1);
  
  if (matches1) {
    content = content.replace(regex1, (match, ariaLabel) => {
      return `;}} aria-label="${ariaLabel}"`;
    });
    modified = true;
    totalReplacements += matches1.length;
    console.log(`✅ ${filePath}: Fixed ${matches1.length} onClick aria-label errors`);
  }
  
  if (modified) {
    totalFixed++;
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

console.log(`\n✨ Fixed ${totalFixed} files, ${totalReplacements} total errors\n`);
