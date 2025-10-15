/**
 * TRACK 6: Agent #11.1 - Dark Mode Fixer
 * Automatically adds dark mode variants to all components
 * Target: Fix 11,433 missing dark mode variants (24% → 100%)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

export class DarkModeFixer {
  private fixedCount = 0;
  private scannedCount = 0;
  private errors: string[] = [];

  /**
   * Execute dark mode fix across all components
   */
  async execute(): Promise<{
    scanned: number;
    fixed: number;
    errors: string[];
  }> {
    console.log('🌙 Dark Mode Fixer #11.1 Starting...');

    const files = await this.scanTsxFiles();
    console.log(`📁 Found ${files.length} .tsx files to scan`);

    for (const file of files) {
      try {
        await this.fixFile(file);
        this.scannedCount++;
      } catch (error) {
        this.errors.push(`${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`✅ Dark Mode Fixer Complete: ${this.fixedCount} fixes applied`);

    return {
      scanned: this.scannedCount,
      fixed: this.fixedCount,
      errors: this.errors,
    };
  }

  /**
   * Scan all TSX files
   */
  private async scanTsxFiles(): Promise<string[]> {
    const patterns = [
      'client/src/components/**/*.tsx',
      'client/src/pages/**/*.tsx',
    ];

    const allFiles: string[] = [];
    for (const pattern of patterns) {
      const files = await glob(pattern, { cwd: process.cwd() });
      allFiles.push(...files);
    }

    return allFiles;
  }

  /**
   * Fix a single file
   */
  private async fixFile(filePath: string): Promise<void> {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Skip if already has good dark mode coverage
    if (this.hasDarkModeCoverage(content)) {
      return;
    }

    let modified = content;
    let changesMade = false;

    // Fix pattern 1: bg-white without dark:bg-*
    const bgWhiteRegex = /className="([^"]*?)bg-white(?!\s+dark:bg-)([^"]*?)"/g;
    if (bgWhiteRegex.test(content)) {
      modified = modified.replace(bgWhiteRegex, 'className="$1bg-white dark:bg-gray-800$2"');
      changesMade = true;
    }

    // Fix pattern 2: text-black/gray-900 without dark:text-*
    const textBlackRegex = /className="([^"]*?)text-(black|gray-900)(?!\s+dark:text-)([^"]*?)"/g;
    if (textBlackRegex.test(modified)) {
      modified = modified.replace(textBlackRegex, 'className="$1text-$2 dark:text-white$3"');
      changesMade = true;
    }

    // Fix pattern 3: border-gray-200 without dark:border-*
    const borderRegex = /className="([^"]*?)border-gray-200(?!\s+dark:border-)([^"]*?)"/g;
    if (borderRegex.test(modified)) {
      modified = modified.replace(borderRegex, 'className="$1border-gray-200 dark:border-gray-700$3"');
      changesMade = true;
    }

    if (changesMade) {
      await fs.writeFile(filePath, modified, 'utf-8');
      this.fixedCount++;
    }
  }

  /**
   * Check if file has adequate dark mode coverage
   */
  private hasDarkModeCoverage(content: string): boolean {
    const darkClasses = (content.match(/dark:[a-z-]+/g) || []).length;
    const lightClasses = (content.match(/bg-white|bg-gray-[1-3]00|text-black|text-gray-900/g) || []).length;
    
    // If no light classes, doesn't need dark mode
    if (lightClasses === 0) return true;
    
    // If dark class coverage is > 50%, consider it good
    return darkClasses / lightClasses > 0.5;
  }
}

export const darkModeFixer = new DarkModeFixer();
