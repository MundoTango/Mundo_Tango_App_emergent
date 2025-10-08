/**
 * ESA 61x21 Translation & Internationalization Expert Agent
 * Agent 16: Manages i18n coverage, detects missing translations, automates batch translation
 * Layers: 53 (Internationalization), 54 (Accessibility), 55 (SEO)
 */

import { type PgJob } from './pg-queue-adapter';
import { Agent } from './agent-system';
import knowledgeGraph from '../esa-master-knowledge-graph.json';
import { glob } from 'glob';
import { promises as fs } from 'fs';
import path from 'path';
import OpenAI from 'openai';

interface TranslationKey {
  key: string;
  value: string;
  context: string;
  file: string;
  line: number;
}

interface MissingTranslation {
  key: string;
  languages: string[];
  suggestedValue?: string;
  context: string;
}

interface HardcodedString {
  file: string;
  line: number;
  content: string;
  suggestedKey: string;
  context: string;
}

interface TranslationCoverage {
  language: string;
  totalKeys: number;
  translatedKeys: number;
  missingKeys: string[];
  coverage: number; // 0-100
}

interface ComponentTranslationStatus {
  component: string;
  file: string;
  totalStrings: number;
  translatedStrings: number;
  hardcodedStrings: HardcodedString[];
  coverage: number;
}

/**
 * Agent 16: Translation & Internationalization Expert
 * Automates translation management for 68-language platform
 */
export class TranslationExpert extends Agent {
  private translationCache: Map<string, any> = new Map();
  private lastScan: number = 0;
  private openai?: OpenAI;
  
  // Supported languages (68 total)
  private readonly ACTIVE_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt'];
  private readonly ALL_LANGUAGES = [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi',
    'nl', 'pl', 'tr', 'sv', 'no', 'da', 'fi', 'cs', 'hu', 'ro', 'bg', 'hr',
    'sk', 'sl', 'et', 'lv', 'lt', 'mt', 'ga', 'cy', 'sq', 'mk', 'sr', 'bs',
    'uk', 'be', 'kk', 'az', 'hy', 'ka', 'el', 'he', 'th', 'vi', 'id', 'ms',
    'tl', 'bn', 'ta', 'te', 'ml', 'kn', 'ur', 'fa', 'ps', 'sw', 'am', 'ha',
    'yo', 'ig', 'zu', 'xh', 'af', 'is', 'fo'
  ];
  
  constructor() {
    super({
      id: 'translation_expert',
      name: 'Translation & Internationalization Expert',
      layers: [53, 54, 55],
      category: 'expert',
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
  
  async processJob(job: PgJob) {
    const { type, data } = job.data;
    
    switch (type) {
      case 'scan_components':
        return await this.scanComponents(data);
      case 'detect_missing':
        return await this.detectMissingTranslations(data);
      case 'batch_translate':
        return await this.batchTranslate(data);
      case 'coverage_report':
        return await this.generateCoverageReport(data);
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  }
  
  async execute(method: string, params: any): Promise<any> {
    switch (method) {
      case 'scanComponents':
        return await this.scanComponents(params);
      case 'detectMissingTranslations':
        return await this.detectMissingTranslations(params);
      case 'batchTranslate':
        return await this.batchTranslate(params);
      case 'getCoverageReport':
        return await this.generateCoverageReport(params);
      case 'getHardcodedStrings':
        return await this.findHardcodedStrings(params);
      case 'validateI18nUsage':
        return await this.validateI18nUsage(params);
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }
  
  async handleEvent(event: string, data: any): Promise<void> {
    if (event === 'component_updated') {
      // Invalidate cache for updated component
      this.translationCache.clear();
    }
  }
  
  /**
   * Scan components for translation usage
   */
  private async scanComponents(params: any): Promise<ComponentTranslationStatus[]> {
    const { componentPath = 'client/src/components/**/*.tsx' } = params;
    
    const files = await glob(componentPath, { cwd: process.cwd() });
    const results: ComponentTranslationStatus[] = [];
    
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const componentName = path.basename(file, '.tsx');
      
      // Count t() function calls (translated strings)
      const translatedCount = (content.match(/t\(['"`][^'"`]+['"`]\)/g) || []).length;
      
      // Find hardcoded strings
      const hardcoded = await this.findHardcodedStringsInFile(file, content);
      
      const totalStrings = translatedCount + hardcoded.length;
      const coverage = totalStrings > 0 ? (translatedCount / totalStrings) * 100 : 100;
      
      results.push({
        component: componentName,
        file: file.replace(process.cwd(), ''),
        totalStrings,
        translatedStrings: translatedCount,
        hardcodedStrings: hardcoded,
        coverage: Math.round(coverage),
      });
    }
    
    return results.sort((a, b) => a.coverage - b.coverage);
  }
  
  /**
   * Find hardcoded strings in a file
   */
  private async findHardcodedStringsInFile(
    file: string,
    content: string
  ): Promise<HardcodedString[]> {
    const hardcoded: HardcodedString[] = [];
    const lines = content.split('\n');
    
    // Pattern to find strings that should be translated
    // Excludes: imports, className, data-testid, aria-*, style properties
    const stringPattern = /(?<!import.*|className=|data-testid=|aria-[a-z]+=|style={{[^}]*)[>"']([A-Z][^<>"']{2,})[<"']/g;
    
    lines.forEach((line, index) => {
      // Skip if line contains t() or useTranslation
      if (line.includes('t(') || line.includes('useTranslation') || line.includes('import')) {
        return;
      }
      
      let match;
      while ((match = stringPattern.exec(line)) !== null) {
        const content = match[1];
        
        // Generate suggested key
        const suggestedKey = this.generateTranslationKey(content);
        
        hardcoded.push({
          file: file.replace(process.cwd(), ''),
          line: index + 1,
          content,
          suggestedKey,
          context: line.trim(),
        });
      }
    });
    
    return hardcoded;
  }
  
  /**
   * Generate translation key from string
   */
  private generateTranslationKey(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }
  
  /**
   * Detect missing translations across languages
   */
  private async detectMissingTranslations(params: any): Promise<MissingTranslation[]> {
    const { languages = this.ACTIVE_LANGUAGES } = params;
    
    // Load English as reference
    const enPath = 'client/src/i18n/locales/en/common.json';
    const enContent = await fs.readFile(enPath, 'utf-8');
    const enTranslations = JSON.parse(enContent);
    
    const allKeys = this.flattenObject(enTranslations);
    const missing: MissingTranslation[] = [];
    
    for (const [key, value] of Object.entries(allKeys)) {
      const missingLanguages: string[] = [];
      
      for (const lang of languages) {
        if (lang === 'en') continue;
        
        const langPath = `client/src/i18n/locales/${lang}/common.json`;
        try {
          const langContent = await fs.readFile(langPath, 'utf-8');
          const langTranslations = JSON.parse(langContent);
          const langKeys = this.flattenObject(langTranslations);
          
          if (!langKeys[key]) {
            missingLanguages.push(lang);
          }
        } catch (error) {
          missingLanguages.push(lang);
        }
      }
      
      if (missingLanguages.length > 0) {
        missing.push({
          key,
          languages: missingLanguages,
          suggestedValue: value as string,
          context: key.split('.')[0], // Section context
        });
      }
    }
    
    return missing;
  }
  
  /**
   * Batch translate missing keys
   */
  private async batchTranslate(params: any): Promise<any> {
    const { keys, targetLanguages = this.ACTIVE_LANGUAGES } = params;
    
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }
    
    const results: any = {};
    
    for (const lang of targetLanguages) {
      if (lang === 'en') continue;
      
      const translations: any = {};
      
      // Batch translate in chunks of 10
      const chunks = this.chunkArray(keys, 10);
      
      for (const chunk of chunks) {
        const prompt = `Translate the following UI text to ${this.getLanguageName(lang)}. 
Return only a JSON object with the exact same keys, translated values:
${JSON.stringify(chunk, null, 2)}`;
        
        try {
          const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are a professional translator for a tango community platform. Maintain cultural context and formality. Return ONLY valid JSON without markdown code blocks.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
          });
          
          let responseContent = completion.choices[0].message.content || '{}';
          
          // Strip markdown code blocks if present
          responseContent = responseContent.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '').trim();
          
          const translated = JSON.parse(responseContent);
          Object.assign(translations, translated);
        } catch (error) {
          console.error(`Translation error for ${lang}:`, error);
        }
      }
      
      results[lang] = translations;
    }
    
    return results;
  }
  
  /**
   * Generate coverage report
   */
  private async generateCoverageReport(params: any): Promise<TranslationCoverage[]> {
    const { languages = this.ACTIVE_LANGUAGES } = params;
    
    // Load English as reference
    const enPath = 'client/src/i18n/locales/en/common.json';
    const enContent = await fs.readFile(enPath, 'utf-8');
    const enTranslations = JSON.parse(enContent);
    const totalKeys = Object.keys(this.flattenObject(enTranslations)).length;
    
    const coverage: TranslationCoverage[] = [];
    
    for (const lang of languages) {
      const langPath = `client/src/i18n/locales/${lang}/common.json`;
      
      try {
        const langContent = await fs.readFile(langPath, 'utf-8');
        const langTranslations = JSON.parse(langContent);
        const langKeys = this.flattenObject(langTranslations);
        const translatedKeys = Object.keys(langKeys).length;
        
        const missingKeys = Object.keys(this.flattenObject(enTranslations))
          .filter(key => !langKeys[key]);
        
        coverage.push({
          language: lang,
          totalKeys,
          translatedKeys,
          missingKeys,
          coverage: Math.round((translatedKeys / totalKeys) * 100),
        });
      } catch (error) {
        coverage.push({
          language: lang,
          totalKeys,
          translatedKeys: 0,
          missingKeys: Object.keys(this.flattenObject(enTranslations)),
          coverage: 0,
        });
      }
    }
    
    return coverage.sort((a, b) => b.coverage - a.coverage);
  }
  
  /**
   * Find all hardcoded strings across components
   */
  private async findHardcodedStrings(params: any): Promise<HardcodedString[]> {
    const components = await this.scanComponents(params);
    const allHardcoded: HardcodedString[] = [];
    
    for (const component of components) {
      allHardcoded.push(...component.hardcodedStrings);
    }
    
    return allHardcoded;
  }
  
  /**
   * Validate i18n usage patterns
   */
  private async validateI18nUsage(params: any): Promise<any> {
    const { componentPath = 'client/src/components/**/*.tsx' } = params;
    const files = await glob(componentPath, { cwd: process.cwd() });
    
    const issues: any[] = [];
    
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      
      // Check for useTranslation hook
      const hasUseTranslation = content.includes('useTranslation');
      const hasTranslationCalls = content.includes('t(');
      
      if (hasTranslationCalls && !hasUseTranslation) {
        issues.push({
          file: file.replace(process.cwd(), ''),
          issue: 'Translation calls without useTranslation hook',
          severity: 'error',
        });
      }
      
      // Check for hardcoded namespace usage (should use default)
      if (content.match(/t\(['"`][^:]+:[^'"`]+['"`]\)/)) {
        issues.push({
          file: file.replace(process.cwd(), ''),
          issue: 'Explicit namespace usage (should use default common namespace)',
          severity: 'warning',
        });
      }
    }
    
    return issues;
  }
  
  /**
   * Helper: Flatten nested object to dot notation
   */
  private flattenObject(obj: any, prefix = ''): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(result, this.flattenObject(value, newKey));
      } else {
        result[newKey] = value;
      }
    }
    
    return result;
  }
  
  /**
   * Helper: Chunk array
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  /**
   * Helper: Get language name
   */
  private getLanguageName(code: string): string {
    const names: Record<string, string> = {
      en: 'English', es: 'Spanish', fr: 'French', de: 'German',
      it: 'Italian', pt: 'Portuguese', ru: 'Russian', zh: 'Chinese',
      ja: 'Japanese', ko: 'Korean', ar: 'Arabic', hi: 'Hindi',
    };
    return names[code] || code;
  }
}
