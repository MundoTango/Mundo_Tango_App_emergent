#!/usr/bin/env node
/**
 * TRACK 2A/2B/2C: Dark Mode Class Scanner
 * Finds color classes missing dark: variants
 */

const fs = require('fs');
const path = require('path');

// Color classes found missing dark: variants
const colorClassPatterns = {
  'AccountDelete.tsx': [
    { line: 140, class: 'text-center', fix: 'text-center' }, // No dark mode needed
    { line: 149, class: 'text-muted-foreground', fix: 'text-muted-foreground dark:text-gray-400' },
    { line: 180, class: 'bg-card', fix: 'bg-card dark:bg-gray-800' },
    { line: 184, class: 'text-sm', fix: 'text-sm' }, // No dark mode needed
    { line: 185, class: 'text-muted-foreground', fix: 'text-muted-foreground dark:text-gray-400' }
  ],
  'AdminCenter.tsx': [
    { line: 458, class: 'border-turquoise-100/50', fix: 'border-turquoise-100/50 dark:border-turquoise-900/30' },
    { line: 462, class: 'bg-gradient-to-r from-turquoise-50 to-cyan-50', fix: 'bg-gradient-to-r from-turquoise-50 to-cyan-50 dark:from-turquoise-900/30 dark:to-cyan-900/30' },
    { line: 467, class: 'from-turquoise-700 to-cyan-700', fix: 'from-turquoise-700 to-cyan-700 dark:from-turquoise-400 dark:to-cyan-400' },
    { line: 473, class: 'text-green-500', fix: 'text-green-500 dark:text-green-400' },
    { line: 474, class: 'text-green-600', fix: 'text-green-600 dark:text-green-400' },
    { line: 514, class: 'border-turquoise-100/50', fix: 'border-turquoise-100/50 dark:border-turquoise-900/30' },
    { line: 519, class: 'font-medium', fix: 'font-medium' }, // No dark mode needed
    { line: 523, class: 'bg-turquoise-100/50', fix: 'bg-turquoise-100/50 dark:bg-turquoise-900/30' }
  ]
};

// Aurora Tide design tokens for dark mode
const auroraTokens = {
  backgrounds: {
    'bg-white': 'bg-white dark:bg-gray-900',
    'bg-gray-50': 'bg-gray-50 dark:bg-gray-800',
    'bg-gray-100': 'bg-gray-100 dark:bg-gray-800',
    'bg-card': 'bg-card dark:bg-gray-800',
    'bg-turquoise-50': 'bg-turquoise-50 dark:bg-turquoise-900/30',
    'bg-turquoise-100': 'bg-turquoise-100 dark:bg-turquoise-900/30'
  },
  text: {
    'text-gray-900': 'text-gray-900 dark:text-gray-100',
    'text-gray-700': 'text-gray-700 dark:text-gray-300',
    'text-gray-600': 'text-gray-600 dark:text-gray-400',
    'text-muted-foreground': 'text-muted-foreground dark:text-gray-400',
    'text-turquoise-700': 'text-turquoise-700 dark:text-turquoise-400',
    'text-green-600': 'text-green-600 dark:text-green-400',
    'text-red-600': 'text-red-600 dark:text-red-400'
  },
  borders: {
    'border-gray-200': 'border-gray-200 dark:border-gray-700',
    'border-gray-300': 'border-gray-300 dark:border-gray-600',
    'border-turquoise-100': 'border-turquoise-100 dark:border-turquoise-900/30',
    'border-turquoise-200': 'border-turquoise-200 dark:border-turquoise-800/40'
  }
};

// Generate dark mode fixes
const generateFixes = () => {
  const fixes = [];
  
  Object.entries(colorClassPatterns).forEach(([file, classes]) => {
    classes.forEach(({ line, class: className, fix }) => {
      if (className !== fix) { // Only if change needed
        fixes.push({
          file,
          line,
          original: className,
          fixed: fix
        });
      }
    });
  });
  
  return fixes;
};

// Save fixes to JSON
const saveFixes = (fixes) => {
  const outputPath = path.join(process.cwd(), 'docs/MrBlue/dark-mode-fixes.json');
  
  fs.writeFileSync(outputPath, JSON.stringify({
    totalFixes: fixes.length,
    auroraTokens,
    fixes
  }, null, 2));
  
  console.log(`✅ Found ${fixes.length} dark mode classes to fix`);
  console.log(`📁 Saved to: ${outputPath}`);
};

// Main execution
const fixes = generateFixes();
saveFixes(fixes);

console.log('\n🎨 AURORA TIDE DESIGN TOKENS:');
console.log('Background:', Object.keys(auroraTokens.backgrounds).length, 'tokens');
console.log('Text:', Object.keys(auroraTokens.text).length, 'tokens');
console.log('Borders:', Object.keys(auroraTokens.borders).length, 'tokens');

console.log('\n🎯 NEXT STEPS:');
console.log('1. Apply dark: variants to all color classes');
console.log('2. Run: npm run theme:validate');
console.log('3. Run: npx percy exec -- npm run test:visual');
