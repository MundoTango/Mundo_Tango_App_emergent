import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

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
  .use(HttpBackend) // Load translations from server (lazy loading)
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    // Use HttpBackend to load translations on-demand
    backend: {
      loadPath: '/i18n/locales/{{lng}}/{{ns}}.json',
      // Retry failed requests
      requestOptions: {
        cache: 'default'
      }
    },
    
    defaultNS: 'common',
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false // React already escapes values
    },

    // Detection order - check localStorage first, then browser settings
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },

    // Return empty string for missing keys (better UX)
    returnEmptyString: false,
    returnNull: false,
    
    // Available namespaces
    ns: ['common', 'events', 'social', 'agents', 'placeholders'],
    
    // React options - ENABLE SUSPENSE for proper loading
    react: {
      useSuspense: true, // Wait for translations to load before rendering
      bindI18n: 'languageChanged loaded', // Re-render on language change
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p']
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
