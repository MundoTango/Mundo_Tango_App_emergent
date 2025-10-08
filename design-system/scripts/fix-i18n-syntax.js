#!/usr/bin/env node

/**
 * Emergency Fix: i18n Syntax Errors
 * Fixes misplaced useTranslation() calls in function parameters
 */

import fs from 'fs';
import { glob } from 'glob';

console.log('🔧 Emergency i18n Syntax Fix\n');

const files = await glob('client/src/**/*.{tsx,ts}', { ignore: 'node_modules/**' });

let totalFixed = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern: = ({ \n  const { t } = useTranslation();
  // Should be: = ({ \n  [params]... \n}) => { \n  const { t } = useTranslation();
  
  // Fix pattern: move useTranslation from params to body
  const pattern = /= \(\{\s*\n\s*const \{ t \} = useTranslation\(\);/g;
  if (pattern.test(content)) {
    // Remove from params
    content = content.replace(/= \(\{\s*\n\s*const \{ t \} = useTranslation\(\);/g, '= ({');
    modified = true;
    totalFixed++;
    console.log(`✅ Fixed: ${filePath}`);
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

console.log(`\n✨ Fixed ${totalFixed} files with i18n syntax errors\n`);
