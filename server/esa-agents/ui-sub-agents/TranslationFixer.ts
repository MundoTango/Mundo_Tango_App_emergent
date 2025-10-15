/**
 * Agent #11.2: Translation Fixer
 * Autonomous sub-agent under Agent #11 (Aurora - UI/UX Expert)
 * 
 * Responsibilities:
 * - Auto-scan all .tsx files daily
 * - Detect hardcoded English strings
 * - Generate i18n keys automatically
 * - Batch translate using OpenAI (if key available)
 * - Report context-sensitive strings for manual review
 * 
 * Schedule: Daily at 3AM (cron: 0 3 * * *)
 */

import { Agent } from '../agent-system';
import { glob } from 'glob';
import { promises as fs } from 'fs';
import path from 'path';
import OpenAI from 'openai';

interface HardcodedString {
  file: string;
  line: number;
  content: string;
  suggestedKey: string;
  context: string;
  complexity: 'simple' | 'complex';
  confidence: number;
}

interface TranslationFixReport {
  totalFiles: number;
  filesScanned: number;
  stringsFound: number;
  stringsFixed: number;
  keysGenerated: number;
  translationsCreated: number;
  fixes: HardcodedString[];
  duration: number;
}

export class TranslationFixer extends Agent {
  private openai?: OpenAI;

  // Patterns to exclude from translation
  private readonly EXCLUDE_PATTERNS = [
    /import\s+/,
    /export\s+/,
    /className=/,
    /data-testid=/,
    /aria-[a-z]+=/,
    /href=/,
    /src=/,
    /alt=/i,
    /placeholder=/i,
    /title=/i,
    /console\./,
    /\${.*}/,
  ];

  constructor() {
    super({
      id: 'translation_fixer',
      name: 'Translation Fixer (Agent #11.2)',
      layers: [53, 54, 55], // Internationalization, Accessibility, SEO
      category: 'ui_sub_agent',
      resource_requirements: {
        cpu: '1 core',
        memory: '512MB',
        storage: '100MB',
      },
    } as any);

    // Initialize OpenAI if key available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  async processJob(job: any) {
    const { type, data } = job.data;

    switch (type) {
      case 'scan_and_fix':
        return await this.scanAndFix(data);
      case 'analyze_file':
        return await this.analyzeFile(data.filePath);
      case 'generate_translations':
        return await this.generateTranslations(data);
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
        return await this.getSharedState('latest_translation_report');
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
  private async scanAndFix(params: any): Promise<TranslationFixReport> {
    const startTime = Date.now();
    console.log(`[${this.name}] Starting autonomous translation scan...`);

    const { autoFix = true, reportOnly = false } = params;

    // Scan all component files
    const patterns = [
      'client/src/components/**/*.tsx',
      'client/src/pages/**/*.tsx',
    ];

    const allStrings: HardcodedString[] = [];
    let filesScanned = 0;
    let stringsFixed = 0;
    let keysGenerated = 0;

    for (const pattern of patterns) {
      const files = await glob(pattern, { cwd: process.cwd() });

      for (const file of files) {
        filesScanned++;
        const strings = await this.analyzeFile(file);

        if (strings.length > 0) {
          allStrings.push(...strings);

          // Auto-fix simple strings
          if (autoFix && !reportOnly) {
            const simpleStrings = strings.filter(s => s.complexity === 'simple');
            if (simpleStrings.length > 0) {
              const { fixed, generated } = await this.fixFile(file, simpleStrings);
              stringsFixed += fixed;
              keysGenerated += generated;
            }
          }
        }
      }
    }

    const report: TranslationFixReport = {
      totalFiles: filesScanned,
      filesScanned,
      stringsFound: allStrings.length,
      stringsFixed,
      keysGenerated,
      translationsCreated: 0, // Would be set by batch translation
      fixes: allStrings,
      duration: Date.now() - startTime,
    };

    // Store report for review
    await this.setSharedState('latest_translation_report', report);

    console.log(`[${this.name}] Scan complete:`);
    console.log(`  Files scanned: ${filesScanned}`);
    console.log(`  Strings found: ${allStrings.length}`);
    console.log(`  Strings fixed: ${stringsFixed}`);
    console.log(`  Keys generated: ${keysGenerated}`);
    console.log(`  Duration: ${report.duration}ms`);

    return report;
  }

  /**
   * Analyze a single file for hardcoded strings
   */
  private async analyzeFile(filePath: string): Promise<HardcodedString[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const strings: HardcodedString[] = [];
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip if line already uses translation
        if (line.includes('t(') || line.includes('useTranslation')) continue;

        // Skip excluded patterns
        if (this.EXCLUDE_PATTERNS.some(pattern => pattern.test(line))) continue;

        // Find hardcoded strings (simple regex)
        const stringMatches = line.matchAll(/>([A-Z][^<>{}"']{3,})</g);

        for (const match of stringMatches) {
          const content = match[1].trim();

          // Validate it's a user-facing string
          if (this.isUserFacingString(content)) {
            const string = this.createHardcodedString(filePath, i + 1, content, line);
            if (string) {
              strings.push(string);
            }
          }
        }
      }

      return strings;
    } catch (error) {
      console.error(`[${this.name}] Error analyzing ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Check if string is user-facing (not code)
   */
  private isUserFacingString(content: string): boolean {
    // Must start with capital letter
    if (!/^[A-Z]/.test(content)) return false;

    // Must have at least 3 characters
    if (content.length < 3) return false;

    // Exclude common code patterns
    const excludePatterns = [
      /^import /i,
      /^export /i,
      /^const /i,
      /^let /i,
      /^var /i,
      /^function /i,
      /^class /i,
      /^type /i,
      /^interface /i,
    ];

    return !excludePatterns.some(pattern => pattern.test(content));
  }

  /**
   * Create hardcoded string object
   */
  private createHardcodedString(
    file: string,
    line: number,
    content: string,
    context: string
  ): HardcodedString | null {
    const suggestedKey = this.generateI18nKey(content);

    // Simple strings can be auto-fixed
    const complexity = this.determineComplexity(content, context);
    const confidence = complexity === 'simple' ? 0.9 : 0.6;

    return {
      file,
      line,
      content,
      suggestedKey,
      context: context.trim(),
      complexity,
      confidence,
    };
  }

  /**
   * Generate i18n key from string
   */
  private generateI18nKey(content: string): string {
    // Convert to snake_case
    return content
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 50); // Limit key length
  }

  /**
   * Determine if string is simple or complex to translate
   */
  private determineComplexity(content: string, context: string): 'simple' | 'complex' {
    // Complex if contains variables
    if (content.includes('{') || content.includes('$')) return 'complex';

    // Complex if contains pluralization hints
    if (/\(s\)|s$/.test(content)) return 'complex';

    // Complex if very context-dependent
    if (context.includes('if (') || context.includes('? ')) return 'complex';

    return 'simple';
  }

  /**
   * Fix file with given strings
   */
  private async fixFile(
    filePath: string,
    strings: HardcodedString[]
  ): Promise<{ fixed: number; generated: number }> {
    try {
      let content = await fs.readFile(filePath, 'utf-8');
      let fixed = 0;
      let generated = 0;

      // Add useTranslation import if not present
      if (!content.includes('useTranslation')) {
        content = `import { useTranslation } from 'react-i18next';\n${content}`;
      }

      // Add const { t } = useTranslation(); if not present
      if (!content.includes('const { t } = useTranslation()')) {
        // Find first function component
        const componentMatch = content.match(/(export\s+(?:default\s+)?function\s+\w+[^{]*{)/);
        if (componentMatch) {
          const insertPos = componentMatch.index! + componentMatch[0].length;
          content =
            content.slice(0, insertPos) +
            "\n  const { t } = useTranslation();\n" +
            content.slice(insertPos);
        }
      }

      // Replace each hardcoded string
      for (const str of strings) {
        const before = `>${str.content}<`;
        const after = `>{t('${str.suggestedKey}')}<`;

        if (content.includes(before)) {
          content = content.replace(before, after);
          fixed++;
          generated++;
        }
      }

      if (fixed > 0) {
        await fs.writeFile(filePath, content, 'utf-8');
        console.log(`[${this.name}] Fixed ${fixed} strings in ${filePath}`);
      }

      return { fixed, generated };
    } catch (error) {
      console.error(`[${this.name}] Error fixing ${filePath}:`, error);
      return { fixed: 0, generated: 0 };
    }
  }

  /**
   * Generate translations using OpenAI
   */
  private async generateTranslations(data: any): Promise<any> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const { keys, targetLanguages = ['es', 'fr', 'de'] } = data;

    // Batch translate all keys
    const translations: Record<string, Record<string, string>> = {};

    for (const lang of targetLanguages) {
      translations[lang] = {};

      for (const key of keys) {
        // TODO: Implement batch translation with OpenAI
        // For now, return empty
        translations[lang][key] = '';
      }
    }

    return translations;
  }
}
