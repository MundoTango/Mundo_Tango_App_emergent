import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { allSupportedLanguages, isRTL as checkRTL } from './i18n-languages';

// Import translation files for languages that have them
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
import deCommon from '@/i18n/locales/de/common.json';
import itCommon from '@/i18n/locales/it/common.json';
import ptCommon from '@/i18n/locales/pt/common.json';

// Translation resources organized by namespace
const resources: Record<string, any> = {
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
  de: {
    common: deCommon
  },
  it: {
    common: itCommon
  },
  pt: {
    common: ptCommon
  }
};

// Export all supported languages from the centralized metadata
export const supportedLanguages = allSupportedLanguages;

// RTL languages
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
    },
    
    // Load namespaces on demand
    partialBundledLanguages: true,
    
    // Missing key handler for development
    saveMissing: false,
    missingKeyHandler: (lngs, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key} in namespace: ${ns} for languages: ${lngs.join(', ')}`);
      }
    }
  });

// Dynamic translation loading for languages without static imports
export const loadLanguageTranslations = async (languageCode: string) => {
  // If already loaded, skip
  if (resources[languageCode]) {
    return;
  }

  try {
    // Try to load common.json for this language
    const commonModule = await import(`@/i18n/locales/${languageCode}/common.json`);
    
    // Add to resources
    if (!resources[languageCode]) {
      resources[languageCode] = {};
    }
    resources[languageCode].common = commonModule.default || commonModule;
    
    // Add the resource bundle to i18n
    i18n.addResourceBundle(languageCode, 'common', resources[languageCode].common, true, true);
    
    console.log(`✅ Loaded translations for ${languageCode}`);
  } catch (error) {
    console.warn(`⚠️  Translations not available for ${languageCode}, falling back to English`);
    // Fallback is already configured, no action needed
  }
};

// Helper to check if language is RTL
export const isRTL = (lang: string): boolean => {
  return checkRTL(lang);
};

// Helper to change language with dynamic loading
export const changeLanguage = async (lang: string) => {
  // Load translations if not already loaded
  await loadLanguageTranslations(lang);
  
  // Change language in i18n
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
