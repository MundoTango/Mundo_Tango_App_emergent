#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';
import { promises as fs } from 'fs';
import OpenAI from 'openai';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

// All 68 languages supported by the platform
const ALL_LANGUAGES = [
  { code: 'en', name: 'English' },
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

async function generateLocaleTranslations() {
  console.log('🌐 ESA Layer 53: Generating translations for all 68 languages...\n');
  
  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY not found in environment variables');
    console.log('Please set your OpenAI API key in the .env file');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // Read the English common.json as source
  const enCommonPath = path.join(process.cwd(), 'client/src/i18n/locales/en/common.json');
  const enCommon = JSON.parse(await fs.readFile(enCommonPath, 'utf-8'));
  
  console.log(`📖 Loaded English translations with ${JSON.stringify(enCommon).length} characters\n`);
  
  // Filter out English and already translated languages if desired
  const languagesToTranslate = ALL_LANGUAGES.filter(lang => lang.code !== 'en');
  
  let successCount = 0;
  let errorCount = 0;
  const startTime = Date.now();
  
  for (const [index, language] of languagesToTranslate.entries()) {
    try {
      console.log(`[${index + 1}/${languagesToTranslate.length}] Translating to ${language.name} (${language.code})...`);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following JSON object containing UI strings from English to ${language.name}. 
            
CRITICAL RULES:
1. Maintain the EXACT same JSON structure - all keys must remain unchanged
2. Only translate the VALUES, never the keys
3. Preserve all placeholders like {{name}}, {{count}}, etc. exactly as they appear
4. Keep all HTML tags if present
5. Maintain the same tone and style appropriate for a social platform
6. Return ONLY the translated JSON object, no explanations or markdown
7. For tango-related terms, use culturally appropriate translations`
          },
          {
            role: 'user',
            content: JSON.stringify(enCommon, null, 2)
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      });
      
      const translatedContent = completion.choices[0].message.content?.trim() || '{}';
      
      // Try to parse the response (remove markdown code blocks if present)
      let translatedJson;
      try {
        // Remove markdown code blocks if present
        const cleaned = translatedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        translatedJson = JSON.parse(cleaned);
      } catch (parseError) {
        console.error(`❌ Failed to parse translation for ${language.code}`);
        errorCount++;
        continue;
      }
      
      // Create locale directory if it doesn't exist
      const localeDir = path.join(process.cwd(), `client/src/i18n/locales/${language.code}`);
      await fs.mkdir(localeDir, { recursive: true });
      
      // Write translated common.json
      const outputPath = path.join(localeDir, 'common.json');
      await fs.writeFile(outputPath, JSON.stringify(translatedJson, null, 2), 'utf-8');
      
      console.log(`✅ Saved: ${language.code}/common.json`);
      successCount++;
      
      // Rate limiting - wait 1 second between requests to avoid hitting OpenAI limits
      if (index < languagesToTranslate.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error: any) {
      console.error(`❌ Error translating ${language.code}:`, error.message);
      errorCount++;
    }
  }
  
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  
  console.log('\n📊 Translation Generation Complete:');
  console.log(`  ✅ Success: ${successCount} languages`);
  console.log(`  ❌ Errors: ${errorCount} languages`);
  console.log(`  ⏱️  Time: ${elapsed} seconds`);
  console.log(`\n🎉 ${successCount} locale files generated in client/src/i18n/locales/`);
}

// Run the script
generateLocaleTranslations().catch(console.error);
