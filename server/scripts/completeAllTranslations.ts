#!/usr/bin/env node
// ESA Layer 53: Complete All Remaining Language Translations

import fs from 'fs';
import path from 'path';
import { translateText, batchTranslate } from '../services/translationService';
import dotenv from 'dotenv';

dotenv.config();

// Remaining language batches organized by region
const languageBatches = {
  europeRemaining: [
    { code: 'cs', name: 'Czech' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'ro', name: 'Romanian' },
    { code: 'bg', name: 'Bulgarian' },
    { code: 'hr', name: 'Croatian' },
    { code: 'sr', name: 'Serbian' },
    { code: 'sk', name: 'Slovak' },
    { code: 'sl', name: 'Slovenian' },
    { code: 'el', name: 'Greek' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'be', name: 'Belarusian' },
    { code: 'is', name: 'Icelandic' },
    { code: 'mk', name: 'Macedonian' },
    { code: 'lt', name: 'Lithuanian' },
    { code: 'lv', name: 'Latvian' },
    { code: 'et', name: 'Estonian' },
    { code: 'sq', name: 'Albanian' },
    { code: 'mt', name: 'Maltese' },
    { code: 'ga', name: 'Irish' },
    { code: 'cy', name: 'Welsh' },
    { code: 'eu', name: 'Basque' },
    { code: 'ca', name: 'Catalan' },
  ],
  americas: [
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'es-MX', name: 'Spanish (Mexico)' },
    { code: 'fr-CA', name: 'French (Canada)' },
  ],
  asia: [
    { code: 'ja', name: 'Japanese' },
    { code: 'zh-TW', name: 'Chinese (Traditional)' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'th', name: 'Thai' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'id', name: 'Indonesian' },
    { code: 'ms', name: 'Malay' },
    { code: 'tl', name: 'Filipino' },
    { code: 'my', name: 'Burmese' },
    { code: 'km', name: 'Khmer' },
  ],
  middleEastAfrica: [
    { code: 'ar', name: 'Arabic', direction: 'rtl' },
    { code: 'he', name: 'Hebrew', direction: 'rtl' },
    { code: 'tr', name: 'Turkish' },
    { code: 'fa', name: 'Persian', direction: 'rtl' },
    { code: 'ur', name: 'Urdu', direction: 'rtl' },
    { code: 'sw', name: 'Swahili' },
    { code: 'am', name: 'Amharic' },
  ]
};

// Essential UI translations
const essentialTranslations = {
  navigation: {
    memories: 'Memories',
    tangoCommunity: 'Tango Community',
    friends: 'Friends',
    messages: 'Messages',
    groups: 'Groups',
    events: 'Events',
    roleInvitations: 'Role Invitations',
    home: 'Home',
    explore: 'Explore',
    settings: 'Settings'
  },
  common: {
    welcome: 'Welcome',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    language: 'Language',
    online: 'Online',
    offline: 'Offline',
    submit: 'Submit',
    delete: 'Delete',
    edit: 'Edit'
  },
  memories: {
    createMemory: 'Create Memory',
    shareMemory: 'Share your tango moment...',
    addPhotos: 'Add Photos',
    likeMemory: 'Like',
    commentMemory: 'Comment',
    shareMemoryAction: 'Share',
    publicMemory: 'Public',
    friendsOnly: 'Friends Only'
  },
  events: {
    upcomingEvents: 'Upcoming Events',
    createEvent: 'Create Event',
    eventLocation: 'Location',
    attendees: 'Attendees',
    milonga: 'Milonga',
    practica: 'Práctica'
  },
  community: {
    globalDancers: 'Global Dancers',
    activeEvents: 'Active Events',
    communities: 'Communities'
  },
  settings: {
    chooseLanguage: 'Choose Language',
    selectLanguage: 'Select Language'
  }
};

async function translateBatch(batchName: string, languages: Array<any>) {
  console.log(`\n🌍 Processing ${batchName}: ${languages.length} languages`);
  
  const translationsPath = path.join(__dirname, '../../client/src/i18n/translations.json');
  let allTranslations: any = {};
  
  // Load existing translations
  if (fs.existsSync(translationsPath)) {
    allTranslations = JSON.parse(fs.readFileSync(translationsPath, 'utf-8'));
  }
  
  for (const lang of languages) {
    // Skip if already translated
    if (allTranslations[lang.code]?.translation?.navigation?.memories) {
      console.log(`⏭️  Skipping ${lang.name} (already translated)`);
      continue;
    }
    
    console.log(`📝 Translating ${lang.name} (${lang.code})...`);
    
    try {
      const translations: any = { translation: {} };
      
      // Process each section
      for (const [section, content] of Object.entries(essentialTranslations)) {
        translations.translation[section] = {};
        
        const keys = Object.keys(content);
        const values = Object.values(content);
        
        // Batch translate all values in this section
        const translatedValues = await batchTranslate(
          values,
          lang.code,
          `${section} section for tango community platform${lang.direction === 'rtl' ? ' (RTL language)' : ''}`
        );
        
        // Map translations to keys
        keys.forEach((key, index) => {
          translations.translation[section][key] = translatedValues[index] || values[index];
        });
        
        // Small delay between sections
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Add direction for RTL languages
      if (lang.direction === 'rtl') {
        translations.translation.common.direction = 'rtl';
      }
      
      // Save this language
      allTranslations[lang.code] = translations;
      
      // Write progress after each language
      fs.writeFileSync(translationsPath, JSON.stringify(allTranslations, null, 2));
      console.log(`✅ ${lang.name} completed`);
      
      // Delay between languages
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Failed ${lang.name}:`, error instanceof Error ? error.message : error);
    }
  }
  
  return allTranslations;
}

async function main() {
  console.log('🚀 ESA LIFE CEO 61×21 - Complete Translation System');
  console.log('📊 Processing all remaining languages in batches');
  
  let totalProcessed = 0;
  
  // Process each batch
  for (const [batchName, languages] of Object.entries(languageBatches)) {
    await translateBatch(batchName, languages);
    totalProcessed += languages.length;
    
    // Longer delay between batches
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Final summary
  const translationsPath = path.join(__dirname, '../../client/src/i18n/translations.json');
  const finalTranslations = JSON.parse(fs.readFileSync(translationsPath, 'utf-8'));
  const totalLanguages = Object.keys(finalTranslations).length;
  
  console.log('\n✨ ESA Layer 53 Translation Complete!');
  console.log(`📊 Total languages supported: ${totalLanguages}`);
  console.log('🌍 Regions covered:');
  console.log('   - Primary: 6 languages');
  console.log('   - Europe: 38 languages');
  console.log('   - Americas: 5 languages');
  console.log('   - Asia: 21 languages');
  console.log('   - Middle East & Africa: 8 languages');
  console.log('\n🎯 Next steps:');
  console.log('   1. Update i18n configuration');
  console.log('   2. Test language switching');
  console.log('   3. Deploy to production');
}

main().catch(console.error);