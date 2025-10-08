#!/usr/bin/env node

/**
 * Emergency Fix: i18n Wrapping Errors
 * Fixes pattern: title: {t('key', 'default')},
 * To: title: t('key', 'default'),
 */

import fs from 'fs';
import { glob } from 'glob';

console.log('🔧 Fixing i18n Wrapping Errors\n');

const files = await glob('client/src/**/*.{tsx,ts}', { ignore: 'node_modules/**' });

let totalFixed = 0;
let totalReplacements = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Match patterns like: title: {t('...')}, or description: {t('...')},
  // But NOT in JSX attributes (must be after : not =)
  const regex = /:\s*\{(t\([^)]+\))\},/g;
  const matches = content.match(regex);
  
  if (matches) {
    content = content.replace(regex, (match, tCall) => {
      return `: ${tCall},`;
    });
    modified = true;
    totalReplacements += matches.length;
    totalFixed++;
    console.log(`✅ ${filePath}: Fixed ${matches.length} wrapping errors`);
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

console.log(`\n✨ Fixed ${totalFixed} files, ${totalReplacements} total errors\n`);
