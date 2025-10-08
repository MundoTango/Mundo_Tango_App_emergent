#!/usr/bin/env node

/**
 * Design Token Validation Script
 * ESA 61x21 - Aurora Tide Design System
 * 
 * Detects hardcoded colors and enforces token usage
 * Usage: npm run tokens:validate
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Legacy color patterns to detect (not ocean palette)
const LEGACY_PATTERNS = {
  // Old turquoise/cyan colors (pre-ocean)
  turquoise: /#38[bB]2[aA][cC]/g,
  cyan: /#06[bB]6[dD]4/g,
  
  // Old brand colors (replaced)
  burgundy: /#8[eE]142[eE]/g,
  
  // Old event colors
  blue: /#3182[cC][eE]/g,
  emerald: /#10[bB]981/g,
  violet: /#8[bB]5[cC][fF]6/g,
  pink: /#[eE][cC]4899/g,
  amber: /#[fF]59[eE]0[bB]/g,
  
  // Generic RGB patterns (should use tokens)
  rgb: /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g,
  rgba: /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g,
  
  // HSL patterns (should use tokens or CSS variables)
  hsl: /hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)/g,
  hsla: /hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)/g,
};

// Approved ocean palette tokens (these are OK to use as inline values)
const OCEAN_PALETTE = [
  '#F0FDFA', // ocean-50
  '#CCFBF1', // ocean-100
  '#99F6E4', // ocean-200
  '#5EEAD4', // ocean-300
  '#2DD4BF', // ocean-400
  '#14B8A6', // ocean-500
  '#0D9488', // ocean-600
  '#0F766E', // ocean-700
  '#115E59', // ocean-800
  '#134E4A', // ocean-900
  '#042F2E', // ocean-950
];

// External brand colors (preserved for branding)
const BRAND_EXCEPTIONS = [
  '#4285F4', // Google Blue
  '#34A853', // Google Green
  '#FBBC05', // Google Yellow
  '#EA4335', // Google Red
];

// Files/directories to ignore
const IGNORE_PATHS = [
  'node_modules/**',
  'dist/**',
  'build/**',
  '.next/**',
  'coverage/**',
  '**/*.test.*',
  '**/*.spec.*',
  '**/design-tokens.ts',
  '**/tokens.css',
  '**/mt-ocean-theme.ts',
  '**/*.backup*',
  '**/_archive/**',
  '**/mundo-tango-protected.css', // Intentional brand protection - DO NOT MIGRATE
];

class TokenValidator {
  constructor() {
    this.violations = [];
    this.approvedColors = 0;
    this.filesScanned = 0;
  }

  async validate() {
    console.log('🔍 Scanning for hardcoded colors...\n');

    // Get all TypeScript/JavaScript/CSS files
    const files = await glob('client/src/**/*.{ts,tsx,js,jsx,css}', {
      ignore: IGNORE_PATHS,
    });

    for (const file of files) {
      this.scanFile(file);
    }

    this.printReport();
    return this.violations.length === 0;
  }

  scanFile(filePath) {
    this.filesScanned++;
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Check for legacy color patterns
    for (const [name, pattern] of Object.entries(LEGACY_PATTERNS)) {
      let match;
      const regex = new RegExp(pattern.source, 'g');
      
      while ((match = regex.exec(content)) !== null) {
        const color = match[0];
        
        // Skip if it's a comment
        const lineNum = content.substring(0, match.index).split('\n').length;
        const line = lines[lineNum - 1];
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
          continue;
        }

        this.violations.push({
          file: filePath,
          line: lineNum,
          color: color,
          type: name,
          suggestion: this.getSuggestion(color),
        });
      }
    }

    // Check for hex colors
    const hexPattern = /#[0-9A-Fa-f]{6}(?![0-9A-Fa-f])|#[0-9A-Fa-f]{3}(?![0-9A-Fa-f])/g;
    let match;
    
    while ((match = hexPattern.exec(content)) !== null) {
      const color = match[0].toUpperCase();
      const lineNum = content.substring(0, match.index).split('\n').length;
      const line = lines[lineNum - 1];
      
      // Skip comments
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        continue;
      }

      // Check if it's an approved ocean palette color
      if (OCEAN_PALETTE.includes(color)) {
        this.approvedColors++;
        continue;
      }

      // Check if it's an external brand color
      if (BRAND_EXCEPTIONS.includes(color)) {
        continue;
      }

      // Check if it's a known legacy pattern (already reported)
      const isLegacy = Object.values(LEGACY_PATTERNS).some(pattern => 
        new RegExp(pattern.source, 'i').test(color)
      );
      if (isLegacy) {
        continue;
      }

      // Check for gray colors (should use semantic tokens)
      if (/^#[0-9A-F]{6}$/.test(color)) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        // If RGB values are close (within 10), it's likely a gray
        if (Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && Math.abs(r - b) < 10) {
          this.violations.push({
            file: filePath,
            line: lineNum,
            color: color,
            type: 'gray',
            suggestion: 'Use semantic gray token (gray-50 to gray-950)',
          });
        }
      }
    }
  }

  getSuggestion(color) {
    const suggestions = {
      '#38b2ac': 'ocean-500 or ocean-600',
      '#06b6d4': 'ocean-400 or ocean-500',
      '#8E142E': 'ocean-700 or ocean-800',
      '#3182ce': 'ocean-600 or ocean-700',
      '#10b981': 'ocean-500 or ocean-600',
      '#8b5cf6': 'ocean-300 or ocean-400 (or keep for special features)',
      '#ec4899': 'ocean-400 or ocean-500',
      '#f59e0b': 'ocean-300 or ocean-400',
    };

    return suggestions[color.toLowerCase()] || 'Replace with ocean palette token';
  }

  printReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 TOKEN VALIDATION REPORT');
    console.log('='.repeat(80) + '\n');

    console.log(`Files Scanned: ${this.filesScanned}`);
    console.log(`Approved Ocean Colors: ${this.approvedColors}`);
    console.log(`Violations Found: ${this.violations.length}\n`);

    if (this.violations.length === 0) {
      console.log('✅ All colors are using design tokens!');
      console.log('🎉 100% token adoption achieved!\n');
      return;
    }

    // Group violations by type
    const byType = {};
    for (const violation of this.violations) {
      if (!byType[violation.type]) {
        byType[violation.type] = [];
      }
      byType[violation.type].push(violation);
    }

    // Print violations by type
    for (const [type, violations] of Object.entries(byType)) {
      console.log(`\n🔴 ${type.toUpperCase()} (${violations.length} occurrences):`);
      console.log('-'.repeat(80));
      
      violations.slice(0, 10).forEach(v => {
        console.log(`  ${v.file}:${v.line}`);
        console.log(`    Color: ${v.color}`);
        console.log(`    → ${v.suggestion}\n`);
      });

      if (violations.length > 10) {
        console.log(`  ... and ${violations.length - 10} more\n`);
      }
    }

    // Print summary by file
    const byFile = {};
    for (const violation of this.violations) {
      if (!byFile[violation.file]) {
        byFile[violation.file] = 0;
      }
      byFile[violation.file]++;
    }

    console.log('\n📁 FILES WITH VIOLATIONS:');
    console.log('-'.repeat(80));
    const sortedFiles = Object.entries(byFile).sort((a, b) => b[1] - a[1]);
    sortedFiles.slice(0, 20).forEach(([file, count]) => {
      console.log(`  ${file}: ${count} violation(s)`);
    });

    if (sortedFiles.length > 20) {
      console.log(`  ... and ${sortedFiles.length - 20} more files\n`);
    }

    console.log('\n💡 NEXT STEPS:');
    console.log('-'.repeat(80));
    console.log('1. Replace legacy colors with ocean palette tokens');
    console.log('2. Use semantic tokens for grays (gray-50 to gray-950)');
    console.log('3. Convert inline styles to Tailwind classes where possible');
    console.log('4. Run: npm run tokens:validate again to verify\n');

    console.log('📖 Ocean Palette Reference:');
    console.log('  ocean-50:  #F0FDFA   ocean-500: #14B8A6   ocean-900: #134E4A');
    console.log('  ocean-100: #CCFBF1   ocean-600: #0D9488   ocean-950: #042F2E');
    console.log('  ocean-200: #99F6E4   ocean-700: #0F766E');
    console.log('  ocean-300: #5EEAD4   ocean-800: #115E59');
    console.log('  ocean-400: #2DD4BF\n');
  }
}

// Run validation
const validator = new TokenValidator();
validator.validate().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});
