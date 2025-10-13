import fs from 'fs/promises';
import path from 'path';

/**
 * Platform Audit Service - Layer 4 & 4B of "The Audit"
 * Scans all pages for translation gaps and dark mode design issues
 * 
 * User-reported issues:
 * - Translation: Some pages not translated
 * - Dark Mode: Design/colors incorrect on some pages
 */

interface AuditResult {
  totalPages: number;
  translationIssues: TranslationIssue[];
  darkModeIssues: DarkModeIssue[];
  summary: {
    pagesWithoutTranslation: number;
    pagesWithDarkModeIssues: number;
    healthScore: number;
  };
}

interface TranslationIssue {
  file: string;
  line: number;
  issue: string;
  hardcodedText?: string;
}

interface DarkModeIssue {
  file: string;
  line: number;
  issue: string;
  context?: string;
}

export class PlatformAuditService {
  private pagesPath = path.join(process.cwd(), 'client', 'src', 'pages');

  /**
   * Scan all pages for translation and dark mode issues
   */
  async auditPlatform(): Promise<AuditResult> {
    const files = await this.getAllPageFiles();
    
    const translationIssues: TranslationIssue[] = [];
    const darkModeIssues: DarkModeIssue[] = [];

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const lines = content.split('\n');

      // Check for translation issues
      const hasTranslationHook = content.includes('useTranslation') || content.includes('useAppTranslation');
      const hardcodedStrings = this.findHardcodedStrings(lines);

      if (!hasTranslationHook && hardcodedStrings.length > 0) {
        translationIssues.push({
          file: file.replace(process.cwd(), ''),
          line: 0,
          issue: 'Missing useTranslation hook - page has hardcoded text',
          hardcodedText: hardcodedStrings.slice(0, 3).join(', '), // Show first 3 examples
        });
      }

      // Find hardcoded strings in JSX
      hardcodedStrings.forEach((text, index) => {
        const lineNumber = this.findLineNumber(lines, text);
        if (lineNumber > 0) {
          translationIssues.push({
            file: file.replace(process.cwd(), ''),
            line: lineNumber,
            issue: 'Hardcoded text in JSX',
            hardcodedText: text,
          });
        }
      });

      // Check for dark mode issues
      const darkModeProblems = this.findDarkModeIssues(lines, content);
      darkModeProblems.forEach((problem) => {
        darkModeIssues.push({
          file: file.replace(process.cwd(), ''),
          ...problem,
        });
      });
    }

    // Calculate health score
    const totalPages = files.length;
    const pagesWithoutTranslation = new Set(translationIssues.map(i => i.file)).size;
    const pagesWithDarkModeIssues = new Set(darkModeIssues.map(i => i.file)).size;

    const healthScore = Math.round(
      ((totalPages - pagesWithoutTranslation - pagesWithDarkModeIssues) / totalPages) * 100
    );

    return {
      totalPages,
      translationIssues,
      darkModeIssues,
      summary: {
        pagesWithoutTranslation,
        pagesWithDarkModeIssues,
        healthScore,
      },
    };
  }

  /**
   * Get all .tsx page files
   */
  private async getAllPageFiles(): Promise<string[]> {
    const files: string[] = [];

    async function walk(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip test files, debug folders, and archives
        if (entry.name.startsWith('_') || entry.name.includes('.test.') || entry.name.includes('.spec.')) {
          continue;
        }

        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    }

    await walk(this.pagesPath);
    return files;
  }

  /**
   * Find hardcoded strings in JSX (common patterns)
   */
  private findHardcodedStrings(lines: string[]): string[] {
    const hardcoded: string[] = [];
    const patterns = [
      // Button text: <button>Save</button>
      /<button[^>]*>([^<{]+)</g,
      // Heading text: <h1>Welcome</h1>
      /<h[1-6][^>]*>([^<{]+)</g,
      // Label text: <label>Email</label>
      /<label[^>]*>([^<{]+)</g,
      // Placeholder: placeholder="Enter text"
      /placeholder=["']([^"']+)["']/g,
      // Title: title="Click here"
      /title=["']([^"']+)["']/g,
      // Simple text nodes: <div>Some text</div>
      />([A-Z][a-zA-Z\s]{3,30})</g, // Text starting with capital, 3-30 chars
    ];

    lines.forEach((line) => {
      patterns.forEach((pattern) => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const text = match[1]?.trim();
          if (text && text.length > 2 && !text.includes('{') && !text.includes('<')) {
            // Exclude common non-translatable patterns
            if (!text.match(/^(true|false|null|undefined|\d+|[A-Z_]+)$/)) {
              hardcoded.push(text);
            }
          }
        }
      });
    });

    return [...new Set(hardcoded)]; // Remove duplicates
  }

  /**
   * Find line number for a given text
   */
  private findLineNumber(lines: string[], text: string): number {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(text)) {
        return i + 1;
      }
    }
    return 0;
  }

  /**
   * Find dark mode design issues
   */
  private findDarkModeIssues(lines: string[], fullContent: string): Array<{line: number; issue: string; context?: string}> {
    const issues: Array<{line: number; issue: string; context?: string}> = [];

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Check 1: Colors without dark mode variants
      const colorPatterns = [
        /bg-(white|black|gray-\d+|blue-\d+|red-\d+|green-\d+)/,
        /text-(white|black|gray-\d+|blue-\d+|red-\d+)/,
        /border-(white|black|gray-\d+)/,
      ];

      colorPatterns.forEach((pattern) => {
        const match = line.match(pattern);
        if (match && !line.includes('dark:')) {
          issues.push({
            line: lineNumber,
            issue: `Color class without dark mode variant: ${match[0]}`,
            context: line.trim().substring(0, 60),
          });
        }
      });

      // Check 2: Inline styles without dark mode support
      if (line.includes('style=') && (line.includes('background') || line.includes('color'))) {
        issues.push({
          line: lineNumber,
          issue: 'Inline style with color - should use Tailwind dark: variants',
          context: line.trim().substring(0, 60),
        });
      }

      // Check 3: Fixed colors in CSS variables
      if (line.includes('--') && (line.includes('#') || line.includes('rgb'))) {
        issues.push({
          line: lineNumber,
          issue: 'CSS variable with fixed color - needs dark mode value',
          context: line.trim().substring(0, 60),
        });
      }
    });

    // Check 4: Missing dark mode toggle handler
    if (!fullContent.includes('dark') && !fullContent.includes('theme')) {
      issues.push({
        line: 0,
        issue: 'Page does not reference theme/dark mode - may not respond to theme changes',
      });
    }

    return issues;
  }

  /**
   * Generate fix suggestions for translation issues
   */
  generateTranslationFixes(issues: TranslationIssue[]): string {
    const fixes: string[] = [];

    fixes.push('# Translation Fixes Required\n');
    fixes.push(`Total Issues: ${issues.length}\n`);
    fixes.push('\n## Steps to Fix:\n');
    fixes.push('1. Add `import { useTranslation } from "react-i18next";` to each file\n');
    fixes.push('2. Add `const { t } = useTranslation();` in component\n');
    fixes.push('3. Replace hardcoded text with `{t("key")}`\n');
    fixes.push('\n## Files Needing Fixes:\n\n');

    const fileGroups = issues.reduce((acc, issue) => {
      if (!acc[issue.file]) acc[issue.file] = [];
      acc[issue.file].push(issue);
      return acc;
    }, {} as Record<string, TranslationIssue[]>);

    Object.entries(fileGroups).forEach(([file, fileIssues]) => {
      fixes.push(`### ${file}\n`);
      fileIssues.forEach((issue) => {
        fixes.push(`- Line ${issue.line}: ${issue.issue}\n`);
        if (issue.hardcodedText) {
          fixes.push(`  Text: "${issue.hardcodedText}"\n`);
        }
      });
      fixes.push('\n');
    });

    return fixes.join('');
  }

  /**
   * Generate fix suggestions for dark mode issues
   */
  generateDarkModeFixes(issues: DarkModeIssue[]): string {
    const fixes: string[] = [];

    fixes.push('# Dark Mode Fixes Required\n');
    fixes.push(`Total Issues: ${issues.length}\n`);
    fixes.push('\n## Steps to Fix:\n');
    fixes.push('1. Add `dark:` variants to all color classes\n');
    fixes.push('2. Use design tokens from Aurora Tide system\n');
    fixes.push('3. Replace inline styles with Tailwind classes\n');
    fixes.push('\n## Files Needing Fixes:\n\n');

    const fileGroups = issues.reduce((acc, issue) => {
      if (!acc[issue.file]) acc[issue.file] = [];
      acc[issue.file].push(issue);
      return acc;
    }, {} as Record<string, DarkModeIssue[]>);

    Object.entries(fileGroups).forEach(([file, fileIssues]) => {
      fixes.push(`### ${file}\n`);
      fileIssues.forEach((issue) => {
        fixes.push(`- Line ${issue.line}: ${issue.issue}\n`);
        if (issue.context) {
          fixes.push(`  Context: ${issue.context}\n`);
        }
      });
      fixes.push('\n');
    });

    return fixes.join('');
  }
}

export const platformAuditService = new PlatformAuditService();
