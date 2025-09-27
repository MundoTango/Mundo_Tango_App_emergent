#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';
import { promises as fs } from 'fs';
import { 
  generateUITranslations, 
  updateI18nConfig 
} from '../services/uiTranslationGenerator';
import {
  translateAllDocumentation,
  getTranslationStatus,
} from '../services/documentationTranslator';
import { getSupportedLanguages } from '../services/translationService';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

interface GenerateOptions {
  ui?: boolean;
  docs?: boolean;
  languages?: string[];
  priority?: boolean;
}

async function generateTranslations(options: GenerateOptions = {}) {
  const { 
    ui = true, 
    docs = true, 
    languages = [],
    priority = false 
  } = options;
  
  console.log('🌐 ESA Layer 53: Starting translation generation...\n');
  
  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY not found in environment variables');
    console.log('Please set your OpenAI API key in the .env file');
    process.exit(1);
  }
  
  // Determine target languages
  let targetLanguages = languages.length > 0 ? languages : getSupportedLanguages();
  
  if (priority) {
    // Focus on priority languages only
    targetLanguages = ['es-AR-lunfardo', 'it', 'fr', 'ko', 'zh'];
    console.log('📌 Focusing on priority languages:', targetLanguages.join(', '));
  }
  
  // Filter out English as it's the base language
  targetLanguages = targetLanguages.filter(lang => lang !== 'en');
  
  try {
    // Generate UI translations
    if (ui) {
      console.log('\n📱 Generating UI translations...');
      console.log(`Languages: ${targetLanguages.length}`);
      console.log('This may take several minutes...\n');
      
      const startTime = Date.now();
      let currentLang = 0;
      
      const uiTranslations = await generateUITranslations(targetLanguages, (current, total, language) => {
        currentLang++;
        const progress = Math.round((current / total) * 100);
        console.log(`[${progress}%] ${currentLang}/${total} - Translating UI to ${language}...`);
      });
      
      // Save translations to JSON file
      const translationsPath = path.join(process.cwd(), 'client/src/i18n/translations.json');
      await fs.writeFile(
        translationsPath,
        JSON.stringify(uiTranslations, null, 2),
        'utf-8'
      );
      
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`\n✅ UI translations generated successfully in ${elapsed} seconds`);
      console.log(`📁 Saved to: ${translationsPath}`);
      
      // Generate statistics
      const stats = {
        languages: Object.keys(uiTranslations).length,
        sections: Object.keys(uiTranslations['en']?.translation || {}).length,
        totalStrings: countStrings(uiTranslations['en']?.translation || {}),
      };
      
      console.log('\n📊 Translation Statistics:');
      console.log(`  - Languages: ${stats.languages}`);
      console.log(`  - Sections: ${stats.sections}`);
      console.log(`  - Total strings: ${stats.totalStrings}`);
      console.log(`  - Total translations: ${stats.totalStrings * (stats.languages - 1)}`);
    }
    
    // Generate documentation translations
    if (docs) {
      console.log('\n📚 Generating documentation translations...');
      console.log('Scanning documentation structure...');
      
      const docsPath = path.join(process.cwd(), 'docs/pages');
      const outputDir = path.join(process.cwd(), 'docs/translations');
      
      // Check if docs directory exists
      try {
        await fs.access(docsPath);
      } catch (error) {
        console.log('⚠️  Documentation directory not found, skipping...');
        return;
      }
      
      console.log('Starting documentation translation (this may take a while)...\n');
      
      const startTime = Date.now();
      let processedFiles = 0;
      
      const results = await translateAllDocumentation((current, total, details) => {
        processedFiles++;
        const progress = Math.round((current / total) * 100);
        
        // Show progress every 10 files
        if (processedFiles % 10 === 0 || processedFiles === total) {
          console.log(`[${progress}%] ${processedFiles}/${total} - ${details}`);
        }
      });
      
      // Count successful translations
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`\n✅ Documentation translation completed in ${elapsed} seconds`);
      console.log(`📁 Saved to: ${outputDir}`);
      console.log('\n📊 Results:');
      console.log(`  - Successful: ${successful}`);
      console.log(`  - Failed: ${failed}`);
      
      // Show translation status
      const status = await getTranslationStatus();
      if (status && status.languages) {
        console.log('\n📈 Translation Coverage by Language:');
        
        // Sort by completion percentage
        const sortedLangs = Object.entries(status.languages)
          .sort(([, a]: any, [, b]: any) => b.percentage - a.percentage)
          .slice(0, 10); // Show top 10
        
        for (const [lang, data] of sortedLangs) {
          const langData = data as any;
          const bar = generateProgressBar(langData.percentage);
          console.log(`  ${lang.padEnd(15)} ${bar} ${langData.percentage}% (${langData.filesTranslated}/${langData.totalFiles})`);
        }
      }
    }
    
    console.log('\n🎉 Translation generation complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Review generated translations for accuracy');
    console.log('2. Test language switching in the application');
    console.log('3. Make any necessary manual corrections');
    console.log('4. Consider implementing progressive loading for better performance');
    
  } catch (error) {
    console.error('\n❌ Error generating translations:', error);
    process.exit(1);
  }
}

// Helper function to count total strings in translation object
function countStrings(obj: any): number {
  let count = 0;
  
  for (const value of Object.values(obj)) {
    if (typeof value === 'string') {
      count++;
    } else if (typeof value === 'object' && value !== null) {
      count += countStrings(value);
    }
  }
  
  return count;
}

// Helper function to generate a progress bar
function generateProgressBar(percentage: number): string {
  const filled = Math.round(percentage / 5);
  const empty = 20 - filled;
  return `[${'\u2588'.repeat(filled)}${'\u2591'.repeat(empty)}]`;
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: GenerateOptions = {};

// Simple argument parsing
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  switch (arg) {
    case '--ui-only':
      options.ui = true;
      options.docs = false;
      break;
    case '--docs-only':
      options.ui = false;
      options.docs = true;
      break;
    case '--priority':
      options.priority = true;
      break;
    case '--languages':
      i++;
      if (i < args.length) {
        options.languages = args[i].split(',');
      }
      break;
    case '--help':
      console.log(`
ESA Layer 53: Translation Generator

Usage: npm run generate-translations [options]

Options:
  --ui-only       Generate only UI translations
  --docs-only     Generate only documentation translations
  --priority      Focus on priority languages (es-AR-lunfardo, it, fr, ko, zh)
  --languages     Comma-separated list of language codes
  --help          Show this help message

Examples:
  npm run generate-translations
  npm run generate-translations --priority
  npm run generate-translations --languages es-AR-lunfardo,it,fr
  npm run generate-translations --ui-only --priority
`);
      process.exit(0);
  }
}

// Run the generator
generateTranslations(options).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});