#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';
import { translateText, getSupportedLanguages } from '../services/translationService';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function testTranslation() {
  console.log('🔍 Testing ESA Layer 53 Translation System...\n');
  
  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY not found in environment variables');
    console.log('Please set your OpenAI API key in the .env file');
    process.exit(1);
  }
  
  try {
    // Test translations for a sample phrase
    const testPhrase = "Welcome to the Tango Community platform";
    console.log('📝 Test phrase:', testPhrase);
    console.log('─'.repeat(50) + '\n');
    
    // Test primary languages
    const testLanguages = [
      { code: 'es-AR-lunfardo', name: 'Argentine Spanish (Lunfardo)' },
      { code: 'it', name: 'Italian' },
      { code: 'fr', name: 'French' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese (Simplified)' },
    ];
    
    console.log('🌐 Testing priority languages:\n');
    
    for (const lang of testLanguages) {
      console.log(`Translating to ${lang.name} (${lang.code})...`);
      
      try {
        const startTime = Date.now();
        const translation = await translateText(testPhrase, lang.code, 'en');
        const elapsed = Date.now() - startTime;
        
        console.log(`✅ ${lang.name}: "${translation}"`);
        console.log(`   Time: ${elapsed}ms\n`);
      } catch (error) {
        console.error(`❌ Failed to translate to ${lang.name}: ${error instanceof Error ? error.message : String(error)}\n`);
      }
    }
    
    // Test Lunfardo specifically with tango phrases
    console.log('─'.repeat(50));
    console.log('\n🎭 Testing Lunfardo with tango-specific phrases:\n');
    
    const tangoTestPhrases = [
      "Let's go dancing tonight",
      "The milonga was amazing",
      "I love tango music",
      "Buenos Aires is beautiful",
    ];
    
    for (const phrase of tangoTestPhrases) {
      try {
        const translation = await translateText(phrase, 'es-AR-lunfardo', 'en');
        console.log(`📌 "${phrase}"`);
        console.log(`   → "${translation}"\n`);
      } catch (error) {
        console.error(`❌ Failed: ${error instanceof Error ? error.message : String(error)}\n`);
      }
    }
    
    // Show all supported languages
    console.log('─'.repeat(50));
    console.log('\n📋 Supported Languages (73 total):');
    const languages = getSupportedLanguages();
    console.log(`Total: ${languages.length} languages`);
    
    // Group by region for display
    const regions = {
      'Europe': ['en', 'fr', 'de', 'it', 'es', 'pt', 'nl', 'pl', 'ru'],
      'Americas': ['es-AR-lunfardo', 'pt-br'],
      'Asia': ['zh', 'zh-tw', 'ja', 'ko', 'hi', 'th', 'vi', 'id', 'ms', 'fil'],
      'Middle East & Africa': ['ar', 'he', 'tr', 'fa', 'ur'],
    };
    
    Object.entries(regions).forEach(([region, codes]) => {
      const regionLangs = codes.filter(code => languages.includes(code));
      if (regionLangs.length > 0) {
        console.log(`\n${region}: ${regionLangs.join(', ')}`);
      }
    });
    
    console.log('\n✅ Translation system test complete!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testTranslation().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});