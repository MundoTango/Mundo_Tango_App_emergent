/**
 * Agent #11.1: Dark Mode Fixer
 * Autonomous sub-agent under Agent #11 (Aurora - UI/UX Expert)
 * 
 * Responsibilities:
 * - Auto-scan all .tsx/.ts files daily
 * - Detect missing dark: variants
 * - Auto-fix simple cases (bg-white → bg-white dark:bg-black)
 * - Report complex cases to Agent #11
 * - Learn patterns from Agent #79 (Quality Validator)
 * 
 * Schedule: Daily at 2AM (cron: 0 2 * * *)
 */

import { Agent } from '../agent-system';
import { glob } from 'glob';
import { promises as fs } from 'fs';
import path from 'path';

interface DarkModeIssue {
  file: string;
  line: number;
  className: string;
  suggestedFix: string;
  complexity: 'simple' | 'complex';
  confidence: number; // 0-1
}

interface DarkModeFixReport {
  totalFiles: number;
  filesScanned: number;
  issuesFound: number;
  issuesFixed: number;
  issuesReported: number;
  fixes: DarkModeIssue[];
  duration: number; // milliseconds
}

export class DarkModeFixer extends Agent {
  private readonly SIMPLE_COLOR_MAPPINGS: Record<string, string> = {
    'bg-white': 'bg-white dark:bg-gray-900',
    'text-black': 'text-black dark:text-white',
    'bg-gray-50': 'bg-gray-50 dark:bg-gray-800',
    'bg-gray-100': 'bg-gray-100 dark:bg-gray-700',
    'text-gray-900': 'text-gray-900 dark:text-gray-100',
    'text-gray-800': 'text-gray-800 dark:text-gray-200',
    'text-gray-700': 'text-gray-700 dark:text-gray-300',
    'border-gray-200': 'border-gray-200 dark:border-gray-700',
    'border-gray-300': 'border-gray-300 dark:border-gray-600',
    'bg-blue-500': 'bg-blue-500 dark:bg-blue-600',
    'bg-blue-600': 'bg-blue-600 dark:bg-blue-700',
  };

  constructor() {
    super({
      id: 'dark_mode_fixer',
      name: 'Dark Mode Fixer (Agent #11.1)',
      layers: [9, 47, 48], // UI Framework, Mobile, Dark Mode
      category: 'ui_sub_agent',
      resource_requirements: {
        cpu: '1 core',
        memory: '512MB',
        storage: '100MB',
      },
    } as any);
  }

  async processJob(job: any) {
    const { type, data } = job.data;

    switch (type) {
      case 'scan_and_fix':
        return await this.scanAndFix(data);
      case 'analyze_file':
        return await this.analyzeFile(data.filePath);
      case 'fix_file':
        return await this.fixFile(data.filePath, data.issues);
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  }

  async execute(method: string, params: any) {
    switch (method) {
      case 'scanAndFix':
        return await this.scanAndFix(params);
      case 'analyzeFile':
        return await this.analyzeFile(params.filePath);
      case 'getReport':
        return await this.getSharedState('latest_dark_mode_report');
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  async handleEvent(event: string, data: any) {
    if (event === 'file_changed' && data.path.endsWith('.tsx')) {
      await this.analyzeFile(data.path);
    }
  }

  /**
   * Main autonomous function - scan and fix all files
   */
  private async scanAndFix(params: any): Promise<DarkModeFixReport> {
    const startTime = Date.now();
    console.log(`[${this.name}] Starting autonomous dark mode scan...`);

    const { autoFix = true, reportOnly = false } = params;

    // Scan all component files
    const patterns = [
      'client/src/components/**/*.tsx',
      'client/src/pages/**/*.tsx',
      'client/src/lib/**/*.tsx',
    ];

    const allIssues: DarkModeIssue[] = [];
    let filesScanned = 0;
    let issuesFixed = 0;

    for (const pattern of patterns) {
      const files = await glob(pattern, { cwd: process.cwd() });

      for (const file of files) {
        filesScanned++;
        const issues = await this.analyzeFile(file);

        if (issues.length > 0) {
          allIssues.push(...issues);

          // Auto-fix simple issues
          if (autoFix && !reportOnly) {
            const simpleIssues = issues.filter(i => i.complexity === 'simple');
            if (simpleIssues.length > 0) {
              const fixed = await this.fixFile(file, simpleIssues);
              issuesFixed += fixed;
            }
          }
        }
      }
    }

    const report: DarkModeFixReport = {
      totalFiles: filesScanned,
      filesScanned,
      issuesFound: allIssues.length,
      issuesFixed,
      issuesReported: allIssues.filter(i => i.complexity === 'complex').length,
      fixes: allIssues,
      duration: Date.now() - startTime,
    };

    // Store report for review
    await this.setSharedState('latest_dark_mode_report', report);

    console.log(`[${this.name}] Scan complete:`);
    console.log(`  Files scanned: ${filesScanned}`);
    console.log(`  Issues found: ${allIssues.length}`);
    console.log(`  Issues fixed: ${issuesFixed}`);
    console.log(`  Duration: ${report.duration}ms`);

    return report;
  }

  /**
   * Analyze a single file for missing dark: variants
   */
  private async analyzeFile(filePath: string): Promise<DarkModeIssue[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const issues: DarkModeIssue[] = [];
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Find className attributes
        const classNameMatches = line.matchAll(/className=["']([^"']+)["']/g);

        for (const match of classNameMatches) {
          const classList = match[1];

          // Check each class for missing dark: variant
          const classes = classList.split(/\s+/);
          for (const cls of classes) {
            // Skip if already has dark: variant
            if (cls.startsWith('dark:')) continue;

            // Check if this class needs a dark: variant
            if (this.needsDarkVariant(cls)) {
              const issue = this.createIssue(filePath, i + 1, cls);
              if (issue) {
                issues.push(issue);
              }
            }
          }
        }
      }

      return issues;
    } catch (error) {
      console.error(`[${this.name}] Error analyzing ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Check if a class needs a dark: variant
   */
  private needsDarkVariant(className: string): boolean {
    // Color classes that need dark variants
    const colorPrefixes = [
      'bg-', 'text-', 'border-', 'ring-', 'divide-',
      'from-', 'via-', 'to-', // gradients
      'placeholder-', 'fill-', 'stroke-',
    ];

    return colorPrefixes.some(prefix => className.startsWith(prefix));
  }

  /**
   * Create issue with suggested fix
   */
  private createIssue(file: string, line: number, className: string): DarkModeIssue | null {
    const suggestedFix = this.SIMPLE_COLOR_MAPPINGS[className];

    if (suggestedFix) {
      // Simple fix available
      return {
        file,
        line,
        className,
        suggestedFix,
        complexity: 'simple',
        confidence: 0.95,
      };
    }

    // Complex case - needs manual review
    return {
      file,
      line,
      className,
      suggestedFix: `${className} dark:${this.inferDarkVariant(className)}`,
      complexity: 'complex',
      confidence: 0.6,
    };
  }

  /**
   * Infer dark variant for complex cases
   */
  private inferDarkVariant(className: string): string {
    // Simple inference logic
    if (className.includes('gray-')) {
      const number = className.match(/\d+/)?.[0];
      if (number) {
        const num = parseInt(number);
        const darkNum = num < 500 ? 900 - num : num - 100;
        return className.replace(number, String(darkNum));
      }
    }

    // Default: suggest same color (needs manual review)
    return className;
  }

  /**
   * Fix a file with given issues
   */
  private async fixFile(filePath: string, issues: DarkModeIssue[]): Promise<number> {
    try {
      let content = await fs.readFile(filePath, 'utf-8');
      let fixedCount = 0;

      for (const issue of issues) {
        // Replace className with suggested fix
        const regex = new RegExp(`\\b${this.escapeRegex(issue.className)}\\b`, 'g');
        const beforeCount = (content.match(regex) || []).length;
        content = content.replace(regex, issue.suggestedFix);
        const afterCount = (content.match(regex) || []).length;

        if (beforeCount > afterCount) {
          fixedCount += beforeCount - afterCount;
        }
      }

      if (fixedCount > 0) {
        await fs.writeFile(filePath, content, 'utf-8');
        console.log(`[${this.name}] Fixed ${fixedCount} issues in ${filePath}`);
      }

      return fixedCount;
    } catch (error) {
      console.error(`[${this.name}] Error fixing ${filePath}:`, error);
      return 0;
    }
  }

  /**
   * Escape regex special characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
