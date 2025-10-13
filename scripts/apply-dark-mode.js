#!/usr/bin/env node
/**
 * TRACK 6: Dark Mode Automation
 * Batch applies dark: variants to Tailwind classes
 */

const fs = require('fs');
const glob = require('glob');

console.log('🌙 Applying dark mode variants...');

const colorMappings = {
  'bg-white': 'bg-white dark:bg-gray-900',
  'bg-gray-50': 'bg-gray-50 dark:bg-gray-800',
  'text-gray-900': 'text-gray-900 dark:text-white',
  'text-black': 'text-black dark:text-white',
  'border-gray-200': 'border-gray-200 dark:border-gray-700'
};

const files = glob.sync('client/src/**/*.tsx');
let totalChanges = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  Object.entries(colorMappings).forEach(([light, full]) => {
    const regex = new RegExp(`className="([^"]*?)${light}([^"]*?)"`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `className="$1${full}$2"`);
      changed = true;
      totalChanges++;
    }
  });
  
  if (changed) {
    fs.writeFileSync(file, content);
  }
});

console.log(`✅ Applied ${totalChanges} dark mode fixes`);
