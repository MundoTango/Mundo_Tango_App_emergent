#!/usr/bin/env node

/**
 * ESA Layer 53: Verify complete translation coverage for Global Statistics
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the translations file
const translationsPath = path.join(__dirname, '../client/src/i18n/translations.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

// Keys that must exist for complete Global Statistics support
const requiredKeys = [
  'community.globalStatistics',
  'community.globalDancers',
  'community.activeEvents', 
  'community.communities',
  'community.yourCity'
];

// 65 languages that must have complete coverage (ESA Layer 53)
const requiredLanguages = [
  'en', 'it', 'fr', 'ko', 'zh', 'es', 'pt', 'de', 'ru', 'pl', 
  'nl', 'sv', 'no', 'da', 'fi', 'cs', 'hu', 'ro', 'bg', 'hr',
  'sr', 'sk', 'sl', 'el', 'uk', 'be', 'is', 'mk', 'lt', 'lv',
  'et', 'sq', 'mt', 'ga', 'cy', 'eu', 'ca', 'pt-BR', 'es-MX', 'fr-CA',
  'ja', 'zh-TW', 'hi', 'bn', 'ta', 'te', 'mr', 'kn', 'ml', 'pa',
  'th', 'vi', 'id', 'ms', 'tl', 'my', 'km', 'ar', 'he', 'tr',
  'fa', 'ur', 'sw', 'am', 'es-AR-lunfardo'
];

let isComplete = true;
let missingCount = 0;
const report = [];

// Check each language
requiredLanguages.forEach(lang => {
  const langData = translations[lang];
  
  if (!langData) {
    report.push(`❌ Language ${lang} not found in translations file`);
    isComplete = false;
    missingCount++;
    return;
  }
  
  const missingKeys = [];
  
  // Check each required key
  requiredKeys.forEach(keyPath => {
    const keys = keyPath.split('.');
    let current = langData.translation;
    
    for (let key of keys) {
      if (current && current[key]) {
        current = current[key];
      } else {
        missingKeys.push(keyPath);
        break;
      }
    }
  });
  
  if (missingKeys.length > 0) {
    report.push(`❌ ${lang}: Missing keys: ${missingKeys.join(', ')}`);
    isComplete = false;
    missingCount++;
  } else {
    report.push(`✅ ${lang}: All keys present`);
  }
});

// Print the report
console.log('ESA Layer 53: Global Statistics Translation Verification');
console.log('=' .repeat(60));
console.log(`Total languages checked: ${requiredLanguages.length}`);
console.log(`Required keys: ${requiredKeys.join(', ')}`);
console.log('=' .repeat(60));

report.forEach(line => console.log(line));

console.log('=' .repeat(60));
if (isComplete) {
  console.log('🎉 SUCCESS: All 65 languages have complete Global Statistics translations!');
} else {
  console.log(`⚠️  INCOMPLETE: ${missingCount} languages are missing translations`);
}
console.log('=' .repeat(60));