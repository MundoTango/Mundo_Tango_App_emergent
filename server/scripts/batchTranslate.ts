#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';
import { promises as fs } from 'fs';
import OpenAI from 'openai';

dotenv.config({ path: path.join(process.cwd(), '.env') });

// All 68 languages supported by the platform
const ALL_LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'ur', name: 'Urdu' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ms', name: 'Malay' },
  { code: 'fa', name: 'Persian' },
  { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ro', name: 'Romanian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'el', name: 'Greek' },
  { code: 'cs', name: 'Czech' },
  { code: 'sv', name: 'Swedish' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' },
  { code: 'he', name: 'Hebrew' },
  { code: 'sk', name: 'Slovak' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'hr', name: 'Croatian' },
  { code: 'sr', name: 'Serbian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'lv', name: 'Latvian' },
  { code: 'et', name: 'Estonian' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'sq', name: 'Albanian' },
  { code: 'is', name: 'Icelandic' },
  { code: 'ga', name: 'Irish' },
  { code: 'cy', name: 'Welsh' },
  { code: 'eu', name: 'Basque' },
  { code: 'ca', name: 'Catalan' },
  { code: 'gl', name: 'Galician' },
  { code: 'mt', name: 'Maltese' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'sw', name: 'Swahili' },
  { code: 'am', name: 'Amharic' },
  { code: 'ne', name: 'Nepali' },
  { code: 'si', name: 'Sinhala' },
  { code: 'km', name: 'Khmer' },
  { code: 'lo', name: 'Lao' },
  { code: 'my', name: 'Burmese' },
  { code: 'ka', name: 'Georgian' },
  { code: 'hy', name: 'Armenian' },
  { code: 'az', name: 'Azerbaijani' }
];

async function checkExistingTranslations() {
  const existing: string[] = [];
  const missing: typeof ALL_LANGUAGES = [];

  for (const lang of ALL_LANGUAGES) {
    const filePath = path.join(process.cwd(), `client/src/i18n/locales/${lang.code}/common.json`);
    try {
      await fs.access(filePath);
      existing.push(lang.code);
      console.log(`✅ ${lang.code}: Already exists`);
    } catch {
      missing.push(lang);
    }
  }

  return { existing, missing };
}

async function translateBatch(languages: typeof ALL_LANGUAGES, startIndex: number, batchSize: number) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY not found');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // Read English source
  const enCommonPath = path.join(process.cwd(), 'client/src/i18n/locales/en/common.json');
  const enCommon = JSON.parse(await fs.readFile(enCommonPath, 'utf-8'));
  
  const batch = languages.slice(startIndex, startIndex + batchSize);
  console.log(`\n📦 Processing batch ${Math.floor(startIndex / batchSize) + 1} (${batch.length} languages)`);
  
  for (const [index, language] of batch.entries()) {
    try {
      console.log(`[${startIndex + index + 1}/${languages.length}] Translating ${language.name} (${language.code})...`);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following JSON from English to ${language.name}. 
            
CRITICAL RULES:
1. Maintain EXACT JSON structure - never change keys
2. Only translate VALUES
3. Preserve {{placeholders}} exactly
4. Keep HTML tags unchanged
5. Return ONLY valid JSON, no markdown or explanations`
          },
          {
            role: 'user',
            content: JSON.stringify(enCommon, null, 2)
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      });
      
      const content = completion.choices[0].message.content?.trim() || '{}';
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const translated = JSON.parse(cleaned);
      
      // Create directory and write file
      const localeDir = path.join(process.cwd(), `client/src/i18n/locales/${language.code}`);
      await fs.mkdir(localeDir, { recursive: true });
      const outputPath = path.join(localeDir, 'common.json');
      await fs.writeFile(outputPath, JSON.stringify(translated, null, 2), 'utf-8');
      
      console.log(`✅ Saved: ${language.code}/common.json`);
      
      // Rate limit: 1 second between requests
      if (index < batch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error: any) {
      console.error(`❌ Error translating ${language.code}:`, error.message);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const batchSize = parseInt(args[0]) || 10;
  const startBatch = parseInt(args[1]) || 0;
  
  console.log('🌐 ESA Batch Translation System');
  console.log(`📦 Batch size: ${batchSize} languages`);
  console.log(`🚀 Starting from batch: ${startBatch}\n`);
  
  // Check existing translations
  const { existing, missing } = await checkExistingTranslations();
  console.log(`\n📊 Status: ${existing.length} exist, ${missing.length} missing\n`);
  
  if (missing.length === 0) {
    console.log('✅ All translations complete!');
    return;
  }
  
  // Process missing translations in batches
  const totalBatches = Math.ceil(missing.length / batchSize);
  for (let i = startBatch; i < totalBatches; i++) {
    const start = i * batchSize;
    await translateBatch(missing, start, batchSize);
    
    if (i < totalBatches - 1) {
      console.log(`\n⏸️  Batch ${i + 1}/${totalBatches} complete. Starting next batch...\n`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n🎉 All batches complete!');
}

main().catch(console.error);
