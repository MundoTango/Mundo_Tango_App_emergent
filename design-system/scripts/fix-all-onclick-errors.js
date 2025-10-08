#!/usr/bin/env node

/**
 * Emergency Fix: All onClick Syntax Errors
 * Fixes pattern: onClick={() = aria-label="Button"> func()}
 * To: onClick={() => func()} aria-label="Button"
 */

import fs from 'fs';
import { glob } from 'glob';

console.log('🔧 Fixing All onClick Syntax Errors\n');

const files = await glob('client/src/**/*.{tsx,ts}', { ignore: 'node_modules/**' });

let totalFixed = 0;
let totalReplacements = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Match: onClick={() = aria-label="Button"> BODY}
  const regex = /onClick=\{\(\) = aria-label="Button"> ([^}]+)\}/g;
  const matches = content.match(regex);
  
  if (matches) {
    content = content.replace(regex, (match, body) => {
      return `onClick={() => ${body.trim()}} aria-label="Button"`;
    });
    modified = true;
    totalReplacements += matches.length;
    totalFixed++;
    console.log(`✅ ${filePath}: Fixed ${matches.length} onClick errors`);
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

console.log(`\n✨ Fixed ${totalFixed} files, ${totalReplacements} total errors\n`);
