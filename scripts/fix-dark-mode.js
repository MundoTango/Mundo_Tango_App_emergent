#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

/**
 * Dark Mode Fixer - Add dark: variants to all color classes
 * Uses Aurora Tide design tokens for consistent theming
 */

// Aurora Tide Dark Mode Token Mappings
const DARK_MODE_MAP = {
  // Background colors
  'bg-white': 'dark:bg-gray-900',
  'bg-gray-50': 'dark:bg-gray-800',
  'bg-gray-100': 'dark:bg-gray-800',
  'bg-gray-200': 'dark:bg-gray-700',
  'bg-gray-300': 'dark:bg-gray-600',
  'bg-gray-400': 'dark:bg-gray-600',
  'bg-gray-500': 'dark:bg-gray-500',
  'bg-gray-600': 'dark:bg-gray-400',
  'bg-gray-700': 'dark:bg-gray-300',
  'bg-gray-800': 'dark:bg-gray-200',
  'bg-gray-900': 'dark:bg-gray-100',
  'bg-black': 'dark:bg-white',
  
  // Brand colors - Aurora Tide palette
  'bg-blue-50': 'dark:bg-blue-900/20',
  'bg-blue-100': 'dark:bg-blue-900/30',
  'bg-blue-500': 'dark:bg-blue-600',
  'bg-blue-600': 'dark:bg-blue-500',
  'bg-blue-700': 'dark:bg-blue-400',
  
  'bg-purple-50': 'dark:bg-purple-900/20',
  'bg-purple-100': 'dark:bg-purple-900/30',
  'bg-purple-500': 'dark:bg-purple-600',
  'bg-purple-600': 'dark:bg-purple-500',
  
  'bg-green-50': 'dark:bg-green-900/20',
  'bg-green-100': 'dark:bg-green-900/30',
  'bg-green-500': 'dark:bg-green-600',
  'bg-green-600': 'dark:bg-green-500',
  
  'bg-red-50': 'dark:bg-red-900/20',
  'bg-red-100': 'dark:bg-red-900/30',
  'bg-red-500': 'dark:bg-red-600',
  'bg-red-600': 'dark:bg-red-500',
  
  'bg-yellow-50': 'dark:bg-yellow-900/20',
  'bg-yellow-100': 'dark:bg-yellow-900/30',
  'bg-yellow-500': 'dark:bg-yellow-600',
  
  'bg-orange-50': 'dark:bg-orange-900/20',
  'bg-orange-500': 'dark:bg-orange-600',
  
  // Text colors
  'text-white': 'dark:text-gray-900',
  'text-black': 'dark:text-white',
  'text-gray-50': 'dark:text-gray-900',
  'text-gray-100': 'dark:text-gray-800',
  'text-gray-200': 'dark:text-gray-700',
  'text-gray-300': 'dark:text-gray-600',
  'text-gray-400': 'dark:text-gray-500',
  'text-gray-500': 'dark:text-gray-400',
  'text-gray-600': 'dark:text-gray-300',
  'text-gray-700': 'dark:text-gray-200',
  'text-gray-800': 'dark:text-gray-100',
  'text-gray-900': 'dark:text-gray-50',
  
  'text-blue-500': 'dark:text-blue-400',
  'text-blue-600': 'dark:text-blue-300',
  'text-blue-700': 'dark:text-blue-200',
  
  'text-purple-500': 'dark:text-purple-400',
  'text-purple-600': 'dark:text-purple-300',
  
  'text-green-500': 'dark:text-green-400',
  'text-green-600': 'dark:text-green-300',
  
  'text-red-500': 'dark:text-red-400',
  'text-red-600': 'dark:text-red-300',
  
  'text-yellow-500': 'dark:text-yellow-400',
  'text-yellow-600': 'dark:text-yellow-300',
  
  // Border colors
  'border-white': 'dark:border-gray-700',
  'border-gray-100': 'dark:border-gray-800',
  'border-gray-200': 'dark:border-gray-700',
  'border-gray-300': 'dark:border-gray-600',
  'border-gray-400': 'dark:border-gray-500',
  'border-gray-500': 'dark:border-gray-400',
  'border-gray-600': 'dark:border-gray-300',
  'border-gray-700': 'dark:border-gray-200',
  'border-gray-800': 'dark:border-gray-100',
  'border-black': 'dark:border-white',
  
  'border-blue-500': 'dark:border-blue-400',
  'border-blue-600': 'dark:border-blue-300',
  
  // Ring colors (focus states)
  'ring-blue-500': 'dark:ring-blue-400',
  'ring-blue-600': 'dark:ring-blue-300',
  'ring-purple-500': 'dark:ring-purple-400',
  
  // Divide colors
  'divide-gray-200': 'dark:divide-gray-700',
  'divide-gray-300': 'dark:divide-gray-600',
};

/**
 * Extract all color classes from content
 */
function extractColorClasses(content) {
  const colorClasses = new Set();
  
  // Match className attributes
  const classNameMatches = content.matchAll(/className=["'`]([^"'`]+)["'`]/g);
  
  for (const match of classNameMatches) {
    const classes = match[1].split(/\s+/);
    
    for (const cls of classes) {
      // Check if it's a color class that needs dark mode
      if (isColorClass(cls) && !hasDarkVariant(cls, match[1])) {
        colorClasses.add({
          original: cls,
          fullClassName: match[1],
          classNameAttr: match[0]
        });
      }
    }
  }
  
  return Array.from(colorClasses);
}

/**
 * Check if a class is a color class
 */
function isColorClass(cls) {
  const colorPrefixes = [
    'bg-', 'text-', 'border-', 'ring-', 'divide-',
    'from-', 'to-', 'via-'  // Gradient colors
  ];
  
  return colorPrefixes.some(prefix => cls.startsWith(prefix));
}

/**
 * Check if dark variant already exists
 */
function hasDarkVariant(cls, fullClassName) {
  // Check if there's already a dark: variant for this class
  const darkClass = `dark:${cls}`;
  return fullClassName.includes(darkClass) || fullClassName.includes('dark:');
}

/**
 * Get dark mode variant for a class
 */
function getDarkVariant(cls) {
  // Direct mapping
  if (DARK_MODE_MAP[cls]) {
    return DARK_MODE_MAP[cls];
  }
  
  // Handle opacity variants (e.g., bg-white/50)
  const opacityMatch = cls.match(/^([\w-]+)\/([\d]+)$/);
  if (opacityMatch) {
    const [, baseClass, opacity] = opacityMatch;
    const darkBase = DARK_MODE_MAP[baseClass];
    if (darkBase) {
      return `${darkBase}/${opacity}`;
    }
  }
  
  // Handle gradient colors (from-, to-, via-)
  if (cls.startsWith('from-') || cls.startsWith('to-') || cls.startsWith('via-')) {
    const prefix = cls.match(/^(from|to|via)-/)[0];
    const baseColor = cls.substring(prefix.length);
    const darkColor = DARK_MODE_MAP[`bg-${baseColor}`];
    
    if (darkColor) {
      return `dark:${prefix}${darkColor.replace('dark:bg-', '')}`;
    }
  }
  
  // Fallback: invert the shade number for gray colors
  const grayMatch = cls.match(/^(bg|text|border)-gray-(\d+)$/);
  if (grayMatch) {
    const [, prefix, shade] = grayMatch;
    const invertedShade = 1000 - parseInt(shade);
    return `dark:${prefix}-gray-${invertedShade}`;
  }
  
  return null;
}

/**
 * Add dark mode variants to className
 */
function addDarkVariants(content, findings) {
  let updated = content;
  
  // Group findings by className attribute
  const byClassName = new Map();
  
  for (const finding of findings) {
    const key = finding.classNameAttr;
    if (!byClassName.has(key)) {
      byClassName.set(key, []);
    }
    byClassName.get(key).push(finding);
  }
  
  // Process each className attribute
  for (const [classNameAttr, items] of byClassName) {
    let newClassName = classNameAttr;
    
    for (const item of items) {
      const darkVariant = getDarkVariant(item.original);
      
      if (darkVariant) {
        // Add dark variant after the original class
        const classPattern = new RegExp(`(${item.original})(?!\\S)`);
        newClassName = newClassName.replace(
          classPattern,
          `$1 ${darkVariant}`
        );
      }
    }
    
    // Replace in content
    updated = updated.replace(classNameAttr, newClassName);
  }
  
  return updated;
}

/**
 * Fix a single file
 */
export function fixDarkMode(filePath) {
  try {
    console.log(`\n🌙 Processing: ${filePath}`);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract color classes without dark variants
    const findings = extractColorClasses(content);
    
    if (findings.length === 0) {
      console.log('  ✅ All color classes have dark mode variants');
      return { success: true, fixed: 0 };
    }
    
    console.log(`  🔍 Found ${findings.length} classes needing dark variants`);
    
    // Add dark variants
    const updated = addDarkVariants(content, findings);
    
    // Write back
    fs.writeFileSync(filePath, updated, 'utf-8');
    
    console.log(`  ✅ Added dark variants to ${findings.length} classes`);
    
    return {
      success: true,
      fixed: findings.length,
      classes: findings.map(f => f.original)
    };
    
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return {
      success: false,
      error: error.message,
      fixed: 0
    };
  }
}

/**
 * CLI entry point
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('Usage: node fix-dark-mode.js <file-path>');
    process.exit(1);
  }
  
  const result = fixDarkMode(filePath);
  
  if (result.classes && result.classes.length > 0) {
    console.log('\n📋 Fixed classes:');
    result.classes.forEach(cls => console.log(`  - ${cls}`));
  }
  
  process.exit(result.success ? 0 : 1);
}
