/**
 * Translation Coverage Scanner
 * ESA Layer 53: Internationalization
 * 
 * Scans for missing translations across 68 languages
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface TranslationCoverage {
  language: string;
  code: string;
  totalKeys: number;
  translatedKeys: number;
  missingKeys: string[];
  coverage: number;
  status: 'complete' | 'partial' | 'missing';
}

export interface TranslationReport {
  baseLanguage: string;
  totalLanguages: number;
  languages: TranslationCoverage[];
  summary: {
    complete: number;
    partial: number;
    missing: number;
    avgCoverage: number;
  };
  timestamp: string;
}

class TranslationCoverageScannerService {
  private localesDir = join(process.cwd(), 'client/src/i18n/locales');
  private reportsDir = join(process.cwd(), 'docs/translation-reports');

  constructor() {
    if (!existsSync(this.reportsDir)) {
      mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async scanCoverage(): Promise<TranslationReport> {
    // Get base language keys (English)
    const baseKeys = this.getTranslationKeys('en');
    const totalBaseKeys = baseKeys.length;

    // Scan all languages
    const languages: TranslationCoverage[] = [];

    if (existsSync(this.localesDir)) {
      const langDirs = readdirSync(this.localesDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

      for (const langCode of langDirs) {
        const langKeys = this.getTranslationKeys(langCode);
        const missingKeys = baseKeys.filter(k => !langKeys.includes(k));
        const translatedKeys = totalBaseKeys - missingKeys.length;
        const coverage = totalBaseKeys > 0 ? (translatedKeys / totalBaseKeys) * 100 : 0;

        languages.push({
          language: this.getLanguageName(langCode),
          code: langCode,
          totalKeys: totalBaseKeys,
          translatedKeys,
          missingKeys,
          coverage,
          status: coverage === 100 ? 'complete' : coverage > 0 ? 'partial' : 'missing'
        });
      }
    }

    // Sort by coverage
    languages.sort((a, b) => b.coverage - a.coverage);

    const summary = {
      complete: languages.filter(l => l.status === 'complete').length,
      partial: languages.filter(l => l.status === 'partial').length,
      missing: languages.filter(l => l.status === 'missing').length,
      avgCoverage: languages.length > 0 
        ? languages.reduce((sum, l) => sum + l.coverage, 0) / languages.length 
        : 0
    };

    const report: TranslationReport = {
      baseLanguage: 'en',
      totalLanguages: languages.length,
      languages,
      summary,
      timestamp: new Date().toISOString()
    };

    this.saveReport(report);
    return report;
  }

  private getTranslationKeys(langCode: string): string[] {
    const commonPath = join(this.localesDir, langCode, 'common.json');
    
    if (!existsSync(commonPath)) {
      return [];
    }

    try {
      const content = JSON.parse(readFileSync(commonPath, 'utf-8'));
      return this.flattenKeys(content);
    } catch {
      return [];
    }
  }

  private flattenKeys(obj: any, prefix = ''): string[] {
    let keys: string[] = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys = keys.concat(this.flattenKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    
    return keys;
  }

  private getLanguageName(code: string): string {
    const names: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'es-AR': 'Argentine Spanish',
      'fr': 'French',
      'it': 'Italian',
      'pt': 'Portuguese',
      'de': 'German'
    };
    return names[code] || code.toUpperCase();
  }

  private saveReport(report: TranslationReport) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const reportPath = join(this.reportsDir, `translation-coverage-${timestamp}.json`);
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
  }

  formatReport(report: TranslationReport): string {
    let output = '\n' + '═'.repeat(80) + '\n';
    output += '🌍 TRANSLATION COVERAGE REPORT\n';
    output += '═'.repeat(80) + '\n\n';

    output += `📊 Summary:\n`;
    output += `   Total Languages: ${report.totalLanguages}\n`;
    output += `   ✅ Complete: ${report.summary.complete}\n`;
    output += `   🟡 Partial: ${report.summary.partial}\n`;
    output += `   ❌ Missing: ${report.summary.missing}\n`;
    output += `   📈 Average Coverage: ${report.summary.avgCoverage.toFixed(1)}%\n\n`;

    // Top 7 Tango languages
    output += `🔝 Top 7 Tango Languages:\n`;
    const top7 = report.languages.filter(l => 
      ['en', 'es', 'es-AR', 'fr', 'it', 'pt', 'de'].includes(l.code)
    );
    top7.forEach((lang, i) => {
      const icon = lang.status === 'complete' ? '✅' : lang.status === 'partial' ? '🟡' : '❌';
      output += `   ${i + 1}. ${icon} ${lang.language} (${lang.code}): ${lang.coverage.toFixed(1)}%\n`;
    });
    output += '\n';

    // All languages by coverage
    output += `📋 All Languages (by coverage):\n`;
    report.languages.forEach((lang, i) => {
      const icon = lang.status === 'complete' ? '✅' : lang.status === 'partial' ? '🟡' : '❌';
      output += `   ${i + 1}. ${icon} ${lang.language.padEnd(20)} ${lang.coverage.toFixed(1).padStart(5)}% (${lang.translatedKeys}/${lang.totalKeys} keys)\n`;
      
      if (lang.missingKeys.length > 0 && lang.missingKeys.length <= 5) {
        output += `      Missing: ${lang.missingKeys.join(', ')}\n`;
      } else if (lang.missingKeys.length > 5) {
        output += `      Missing: ${lang.missingKeys.slice(0, 3).join(', ')} ... +${lang.missingKeys.length - 3} more\n`;
      }
    });
    output += '\n';

    output += '═'.repeat(80) + '\n';
    return output;
  }
}

export const translationCoverageScanner = new TranslationCoverageScannerService();
