#!/usr/bin/env node
/**
 * GENERATE 68-LANGUAGE TRANSLATION FILES
 * Uses extracted English strings to generate all languages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 68 supported languages
const languages = [
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
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'cs', name: 'Czech' }
  // ... more languages (simplified for demo)
];

// Generate language files
const generateLanguageFiles = () => {
  const enDir = path.join(process.cwd(), 'client/public/locales/en');
  
  if (!fs.existsSync(enDir)) {
    console.log('❌ English translation files not found. Run extract-translation-strings.mjs first.');
    return;
  }
  
  const enFiles = fs.readdirSync(enDir).filter(f => f.endsWith('.json'));
  console.log(`📋 Found ${enFiles.length} English translation files\n`);
  
  let totalKeys = 0;
  let totalLanguages = 0;
  
  languages.forEach(({ code, name }) => {
    if (code === 'en') return; // Skip English (already exists)
    
    const langDir = path.join(process.cwd(), `client/public/locales/${code}`);
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }
    
    enFiles.forEach(file => {
      const enPath = path.join(enDir, file);
      const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
      
      // In production, this would call OpenAI for translation
      // For now, we'll mark strings as needing translation
      const translatedContent = {};
      Object.entries(enContent).forEach(([key, value]) => {
        translatedContent[key] = `[${code.toUpperCase()}] ${value}`;
        totalKeys++;
      });
      
      const langPath = path.join(langDir, file);
      fs.writeFileSync(langPath, JSON.stringify(translatedContent, null, 2));
    });
    
    totalLanguages++;
    console.log(`✅ ${name} (${code}) - ${enFiles.length} files generated`);
  });
  
  console.log(`\n📊 Generation Summary:`);
  console.log(`   Languages generated: ${totalLanguages}`);
  console.log(`   Total translation keys: ${totalKeys}`);
  console.log(`   Files per language: ${enFiles.length}`);
};

// Main execution
console.log('🚀 68-LANGUAGE GENERATOR\n');
generateLanguageFiles();
console.log(`\n✅ Language generation complete!`);
console.log(`   Note: In production, use OpenAI for actual translations`);
