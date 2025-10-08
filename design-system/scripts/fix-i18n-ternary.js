#!/usr/bin/env node

/**
 * Emergency Fix: i18n Ternary Wrapping Errors  
 * Fixes pattern: condition ? {t('key', 'default')} : other
 * To: condition ? t('key', 'default') : other
 */

import fs from 'fs';
import { glob } from 'glob';

console.log('🔧 Fixing i18n Ternary Wrapping Errors\n');

const files = await glob('client/src/**/*.{tsx,ts}', { ignore: 'node_modules/**' });

let totalFixed = 0;
let totalReplacements = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Match: ? {t(...)} in ternary expressions
  const regex = /\?\s*\{(t\([^)]+\))\}/g;
  const matches = content.match(regex);
  
  if (matches) {
    content = content.replace(regex, (match, tCall) => {
      return `? ${tCall}`;
    });
    modified = true;
    totalReplacements += matches.length;
    totalFixed++;
    console.log(`✅ ${filePath}: Fixed ${matches.length} ternary wrapping errors`);
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

console.log(`\n✨ Fixed ${totalFixed} files, ${totalReplacements} total errors\n`);
