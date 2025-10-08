#!/usr/bin/env node

/**
 * ESA Week 4 Workstream 3: i18n Coverage Expansion
 * Layer 53 (Internationalization) - Add useTranslation to components
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

console.log('🌍 ESA Week 4 - i18n Coverage Expansion\n');
console.log('━'.repeat(60));

// Common text patterns to internationalize
const i18nPatterns = [
  { pattern: /['"]Welcome['"]/, key: 'common.welcome', fallback: 'Welcome' },
  { pattern: /['"]Home['"]/, key: 'navigation.home', fallback: 'Home' },
  { pattern: /['"]Profile['"]/, key: 'navigation.profile', fallback: 'Profile' },
  { pattern: /['"]Settings['"]/, key: 'navigation.settings', fallback: 'Settings' },
  { pattern: /['"]Dashboard['"]/, key: 'navigation.dashboard', fallback: 'Dashboard' },
  { pattern: /['"]Login['"]/, key: 'auth.login', fallback: 'Login' },
  { pattern: /['"]Sign Up['"]/, key: 'auth.signup', fallback: 'Sign Up' },
  { pattern: /['"]Logout['"]/, key: 'auth.logout', fallback: 'Logout' },
  { pattern: /['"]Save['"]/, key: 'actions.save', fallback: 'Save' },
  { pattern: /['"]Cancel['"]/, key: 'actions.cancel', fallback: 'Cancel' },
  { pattern: /['"]Delete['"]/, key: 'actions.delete', fallback: 'Delete' },
  { pattern: /['"]Edit['"]/, key: 'actions.edit', fallback: 'Edit' },
  { pattern: /['"]Search['"]/, key: 'actions.search', fallback: 'Search' },
  { pattern: /['"]Filter['"]/, key: 'actions.filter', fallback: 'Filter' },
  { pattern: /['"]Loading\.\.\.['"]/, key: 'states.loading', fallback: 'Loading...' },
  { pattern: /['"]Error['"]/, key: 'states.error', fallback: 'Error' },
  { pattern: /['"]Success['"]/, key: 'states.success', fallback: 'Success' },
];

async function injectI18n() {
  const files = await glob('client/src/**/*.{tsx,jsx}', { ignore: 'node_modules/**' });
  
  let totalFiles = 0;
  let totalTranslations = 0;

  for (const filePath of files) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileTranslations = 0;

    // Skip if already has useTranslation
    if (content.includes('useTranslation')) {
      continue;
    }

    // Check if file has text to translate
    let hasTranslatableText = false;
    for (const { pattern } of i18nPatterns) {
      if (pattern.test(content)) {
        hasTranslatableText = true;
        break;
      }
    }

    if (!hasTranslatableText) {
      continue;
    }

    // Add useTranslation import if not present
    if (!content.includes('useTranslation')) {
      const importReact = content.match(/import.*from ['"]react['"]/);
      if (importReact) {
        const insertPos = content.indexOf(importReact[0]) + importReact[0].length;
        content = content.slice(0, insertPos) + 
          "\nimport { useTranslation } from 'react-i18next';" + 
          content.slice(insertPos);
        modified = true;
      }
    }

    // Add const { t } = useTranslation() to component
    const componentMatch = content.match(/(?:export\s+(?:default\s+)?function|const)\s+(\w+)\s*[=:]/);
    if (componentMatch) {
      const componentBody = content.indexOf('{', content.indexOf(componentMatch[0]));
      if (componentBody !== -1) {
        // Check if t is not already defined
        const funcEnd = findMatchingBrace(content, componentBody);
        const funcContent = content.slice(componentBody, funcEnd);
        if (!funcContent.includes('const { t }') && !funcContent.includes('useTranslation')) {
          content = content.slice(0, componentBody + 1) + 
            "\n  const { t } = useTranslation();" + 
            content.slice(componentBody + 1);
          modified = true;
        }
      }
    }

    // Replace text with t() calls
    for (const { pattern, key, fallback } of i18nPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, `{t('${key}', '${fallback}')}`);
        fileTranslations += matches.length;
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      totalFiles++;
      totalTranslations += fileTranslations;
      console.log(`🌍 ${path.basename(filePath)} - ${fileTranslations} translations added`);
    }
  }

  console.log('\n' + '━'.repeat(60));
  console.log(`\n📊 i18n Injection Complete:`);
  console.log(`   Files modified: ${totalFiles}`);
  console.log(`   Translations added: ${totalTranslations}`);
  console.log(`   Estimated coverage: ${((totalTranslations / 200) * 100).toFixed(1)}%\n`);
}

// Helper to find matching closing brace
function findMatchingBrace(str, startPos) {
  let count = 1;
  for (let i = startPos + 1; i < str.length; i++) {
    if (str[i] === '{') count++;
    if (str[i] === '}') count--;
    if (count === 0) return i;
  }
  return str.length;
}

injectI18n().catch(console.error);
