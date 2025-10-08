#!/usr/bin/env node

/**
 * Emergency Fix: All Malformed Event Handlers
 * Fixes: onChange={(e) = aria-label="..."> func()}
 * To: onChange={(e) => func()} aria-label="..."
 */

import fs from 'fs';
import { glob } from 'glob';

console.log('🔧 Fixing All Malformed Event Handlers\n');

const files = await glob('client/src/**/*.{tsx,ts}', { ignore: 'node_modules/**' });

let totalFixed = 0;
let totalReplacements = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Match: (param) = aria-label="..." > BODY
  // Should be: (param) => BODY aria-label="..."
  const regex = /(\w+)=\{(\([^)]*\))\s*=\s*aria-label="([^"]+)"\s*>\s*([^}]+)\}/g;
  const matches = content.match(regex);
  
  if (matches) {
    content = content.replace(regex, (match, eventName, params, ariaLabel, body) => {
      return `${eventName}={${params} => ${body.trim()}} aria-label="${ariaLabel}"`;
    });
    modified = true;
    totalReplacements += matches.length;
    totalFixed++;
    console.log(`✅ ${filePath}: Fixed ${matches.length} event handler errors`);
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

console.log(`\n✨ Fixed ${totalFixed} files, ${totalReplacements} total errors\n`);
