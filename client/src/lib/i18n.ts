import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '@/i18n/locales/en/common.json';
import enEvents from '@/i18n/locales/en/events.json';
import enSocial from '@/i18n/locales/en/social.json';
import enAgents from '@/i18n/locales/en/agents.json';
import enPlaceholders from '@/i18n/locales/en/placeholders.json';

import esCommon from '@/i18n/locales/es/common.json';
import esEvents from '@/i18n/locales/es/events.json';
import esSocial from '@/i18n/locales/es/social.json';
import esAgents from '@/i18n/locales/es/agents.json';

import frCommon from '@/i18n/locales/fr/common.json';
import itCommon from '@/i18n/locales/it/common.json';
import ptCommon from '@/i18n/locales/pt/common.json';

// Translation resources organized by namespace
const resources = {
  en: {
    common: enCommon,
    events: enEvents,
    social: enSocial,
    agents: enAgents,
    placeholders: enPlaceholders
  },
  es: {
    common: esCommon,
    events: esEvents,
    social: esSocial,
    agents: esAgents
  },
  fr: {
    common: frCommon
  },
  it: {
    common: itCommon
  },
  pt: {
    common: ptCommon
  }
};

// Supported languages with metadata
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', direction: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', direction: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', direction: 'ltr' }
];

// RTL languages (for future expansion)
export const rtlLanguages = ['ar', 'he', 'fa', 'ur'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'common',
    fallbackLng: 'en',
    lng: 'en', // Force English as default
    debug: false,
    
    interpolation: {
      escapeValue: false // React already escapes values
    },

    // Detection order
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },

    // Return empty string for missing keys (better UX)
    returnEmptyString: false,
    returnNull: false,
    
    // Namespace behavior
    ns: ['common', 'events', 'social', 'agents', 'placeholders'],
    
    // React options
    react: {
      useSuspense: false
    }
  });

// Helper to check if language is RTL
export const isRTL = (lang: string): boolean => {
  return rtlLanguages.includes(lang);
};

// Helper to change language
export const changeLanguage = async (lang: string) => {
  await i18n.changeLanguage(lang);
  
  // Update document direction for RTL support
  if (typeof document !== 'undefined') {
    document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }
  
  // Store preference
  localStorage.setItem('i18nextLng', lang);
  
  return lang;
};

// Make i18n available globally for the language selector
if (typeof window !== 'undefined') {
  (window as any).i18n = i18n;
  (window as any).changeLanguage = changeLanguage;
}

export default i18n;
