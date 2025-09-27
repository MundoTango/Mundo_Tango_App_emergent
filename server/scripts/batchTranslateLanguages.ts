#!/usr/bin/env node
// ESA Layer 53: Batch Translation Generator - Efficient processing for all 73 languages

import fs from 'fs';
import path from 'path';
import { translateText, batchTranslate } from '../services/translationService';
import dotenv from 'dotenv';

dotenv.config();

// First batch: European languages (10 languages for testing)
const europeanLanguagesBatch1 = [
  { code: 'es', name: 'Spanish (Spain)' },
  { code: 'pt', name: 'Portuguese (Portugal)' },
  { code: 'de', name: 'German' },
  { code: 'ru', name: 'Russian' },
  { code: 'pl', name: 'Polish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
];

// Core UI sections - simplified for batch processing
const coreTranslations = {
  navigation: [
    'Memories',
    'Tango Community',
    'Friends',
    'Messages',
    'Groups',
    'Events',
    'Role Invitations'
  ],
  common: [
    'Welcome',
    'Loading...',
    'Save',
    'Cancel',
    'Search',
    'Profile',
    'Settings',
    'Logout',
    'Online Now'
  ],
  actions: [
    'Create Memory',
    'Share your tango moment...',
    'Add Photos',
    'Like',
    'Comment',
    'Share',
    'Upcoming Events',
    'Join Group',
    'Send Message',
    'Add Friend'
  ]
};

async function translateLanguageBatch(languages: Array<{code: string, name: string}>) {
  console.log(`\n🌍 ESA Layer 53: Processing ${languages.length} languages...`);
  
  const translationsPath = path.join(__dirname, '../../client/src/i18n/translations.json');
  let allTranslations: any = {};
  
  // Load existing translations
  if (fs.existsSync(translationsPath)) {
    allTranslations = JSON.parse(fs.readFileSync(translationsPath, 'utf-8'));
    console.log('✅ Loaded existing translations');
  }
  
  for (const lang of languages) {
    console.log(`\n📝 Translating to ${lang.name} (${lang.code})...`);
    
    try {
      const langTranslations: any = {
        translation: {
          navigation: {},
          common: {},
          memories: {},
          events: {},
          friends: {},
          messages: {},
          groups: {},
          community: {},
          settings: {},
          errors: {}
        }
      };
      
      // Translate navigation items
      console.log('  → Navigation section...');
      const navKeys = ['memories', 'tangoCommunity', 'friends', 'messages', 'groups', 'events', 'roleInvitations'];
      const navTranslations = await batchTranslate(
        coreTranslations.navigation,
        lang.code,
        'Navigation menu items for tango community platform'
      );
      
      navKeys.forEach((key, index) => {
        langTranslations.translation.navigation[key] = navTranslations[index] || coreTranslations.navigation[index];
      });
      
      // Translate common items
      console.log('  → Common section...');
      const commonKeys = ['welcome', 'loading', 'save', 'cancel', 'search', 'profile', 'settings', 'logout', 'onlineNow'];
      const commonTranslations = await batchTranslate(
        coreTranslations.common,
        lang.code,
        'Common UI labels'
      );
      
      commonKeys.forEach((key, index) => {
        langTranslations.translation.common[key] = commonTranslations[index] || coreTranslations.common[index];
      });
      
      // Add some essential translations for other sections
      langTranslations.translation.memories.createMemory = await translateText('Create Memory', lang.code, 'Button label');
      langTranslations.translation.memories.shareMemory = await translateText('Share your tango moment...', lang.code, 'Placeholder text');
      langTranslations.translation.events.upcomingEvents = await translateText('Upcoming Events', lang.code, 'Section title');
      langTranslations.translation.friends.myFriends = await translateText('My Friends', lang.code, 'Section title');
      langTranslations.translation.messages.newMessage = await translateText('New Message', lang.code, 'Button label');
      langTranslations.translation.groups.myGroups = await translateText('My Groups', lang.code, 'Section title');
      langTranslations.translation.community.globalDancers = await translateText('Global Dancers', lang.code, 'Statistics label');
      langTranslations.translation.settings.chooseLanguage = await translateText('Choose Language', lang.code, 'Settings label');
      
      // Save this language
      allTranslations[lang.code] = langTranslations;
      
      // Write after each language to save progress
      fs.writeFileSync(translationsPath, JSON.stringify(allTranslations, null, 2));
      console.log(`✅ ${lang.name} translations saved`);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Failed to translate ${lang.name}:`, error instanceof Error ? error.message : error);
    }
  }
  
  console.log('\n🎉 Batch translation complete!');
  return allTranslations;
}

async function main() {
  console.log('🚀 ESA LIFE CEO 61×21 - Batch Translation System');
  console.log('📊 Target: 10 European languages');
  
  const translations = await translateLanguageBatch(europeanLanguagesBatch1);
  
  console.log('\n✨ Summary:');
  console.log(`   Languages processed: ${Object.keys(translations).length}`);
  console.log('   Next step: Run additional batches for remaining languages');
  console.log('\n💡 To continue with more languages, modify the batch and run again.');
}

main().catch(console.error);