import { useState, useEffect, useCallback } from 'react';
import i18n from '../i18n/config';

interface TranslationLoadingState {
  isLoading: boolean;
  loadedLanguages: Set<string>;
  progress: number;
  error: string | null;
}

// Priority languages to load first
const PRIORITY_LANGUAGES = ['en', 'es-AR-lunfardo', 'it', 'fr', 'ko', 'zh'];

// Hook for progressive loading of translations
export function useProgressiveTranslations() {
  const [state, setState] = useState<TranslationLoadingState>({
    isLoading: false,
    loadedLanguages: new Set(PRIORITY_LANGUAGES),
    progress: 0,
    error: null,
  });

  // Load a specific language's translations
  const loadLanguageTranslations = useCallback(async (languageCode: string) => {
    if (state.loadedLanguages.has(languageCode)) {
      return true; // Already loaded
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Check if translations for this language exist in resources
      if (i18n.hasResourceBundle(languageCode, 'translation')) {
        setState(prev => ({
          ...prev,
          loadedLanguages: new Set([...prev.loadedLanguages, languageCode]),
        }));
        return true;
      }

      // Dynamically load translation file if not in bundle
      const response = await fetch(`/api/translations/language/${languageCode}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${languageCode}`);
      }

      const translations = await response.json();
      
      // Add the translations to i18n
      i18n.addResourceBundle(languageCode, 'translation', translations, true, true);
      
      setState(prev => ({
        ...prev,
        loadedLanguages: new Set([...prev.loadedLanguages, languageCode]),
        isLoading: false,
      }));
      
      return true;
    } catch (error) {
      console.error(`Error loading translations for ${languageCode}:`, error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load translations',
      }));
      return false;
    }
  }, [state.loadedLanguages]);

  // Load all priority languages on mount
  useEffect(() => {
    const loadPriorityLanguages = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      
      let loaded = 0;
      const total = PRIORITY_LANGUAGES.length;
      
      for (const lang of PRIORITY_LANGUAGES) {
        // Check if already in i18n resources
        if (!i18n.hasResourceBundle(lang, 'translation')) {
          try {
            // For priority languages, they should be in the bundle
            // but we can try to load them if missing
            await loadLanguageTranslations(lang);
          } catch (error) {
            console.warn(`Could not load priority language ${lang}`);
          }
        }
        
        loaded++;
        setState(prev => ({
          ...prev,
          progress: (loaded / total) * 100,
        }));
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        progress: 100,
      }));
    };

    loadPriorityLanguages();
  }, []); // Run only once on mount

  // Load translations for a specific language on demand
  const loadLanguage = useCallback(async (languageCode: string) => {
    return loadLanguageTranslations(languageCode);
  }, [loadLanguageTranslations]);

  // Preload languages based on user's region
  const preloadRegionalLanguages = useCallback(async (region: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    const regionalLanguages: Record<string, string[]> = {
      'Europe': ['en', 'fr', 'de', 'it', 'es', 'pt'],
      'Americas': ['en', 'es-AR-lunfardo', 'es', 'pt', 'pt-br'],
      'Asia': ['zh', 'zh-tw', 'ja', 'ko', 'hi'],
      'Middle East & Africa': ['ar', 'he', 'tr', 'fa'],
    };
    
    const languages = regionalLanguages[region] || [];
    let loaded = 0;
    
    for (const lang of languages) {
      if (!state.loadedLanguages.has(lang)) {
        await loadLanguageTranslations(lang);
      }
      loaded++;
      setState(prev => ({
        ...prev,
        progress: (loaded / languages.length) * 100,
      }));
    }
    
    setState(prev => ({ ...prev, isLoading: false, progress: 100 }));
  }, [state.loadedLanguages, loadLanguageTranslations]);

  // Check if a language is loaded
  const isLanguageLoaded = useCallback((languageCode: string) => {
    return state.loadedLanguages.has(languageCode) || 
           i18n.hasResourceBundle(languageCode, 'translation');
  }, [state.loadedLanguages]);

  // Get loading statistics
  const getLoadingStats = useCallback(() => {
    return {
      totalLoaded: state.loadedLanguages.size,
      priorityLoaded: PRIORITY_LANGUAGES.filter(lang => 
        state.loadedLanguages.has(lang)
      ).length,
      progress: state.progress,
    };
  }, [state.loadedLanguages, state.progress]);

  return {
    isLoading: state.isLoading,
    loadedLanguages: Array.from(state.loadedLanguages),
    progress: state.progress,
    error: state.error,
    loadLanguage,
    preloadRegionalLanguages,
    isLanguageLoaded,
    getLoadingStats,
  };
}

// Hook to handle language switching with progressive loading
export function useLanguageSwitcher() {
  const { loadLanguage, isLanguageLoaded } = useProgressiveTranslations();
  const [isSwitching, setIsSwitching] = useState(false);

  const switchLanguage = useCallback(async (languageCode: string) => {
    setIsSwitching(true);
    
    try {
      // First ensure the language is loaded
      if (!isLanguageLoaded(languageCode)) {
        const loaded = await loadLanguage(languageCode);
        if (!loaded) {
          throw new Error(`Failed to load language: ${languageCode}`);
        }
      }
      
      // Then switch to it
      await i18n.changeLanguage(languageCode);
      
      // Save preference
      localStorage.setItem('i18nextLng', languageCode);
      
      // Update document direction for RTL languages
      const isRTL = ['ar', 'he', 'ur', 'fa', 'ps'].includes(languageCode);
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      
      return true;
    } catch (error) {
      console.error('Error switching language:', error);
      return false;
    } finally {
      setIsSwitching(false);
    }
  }, [loadLanguage, isLanguageLoaded]);

  return {
    switchLanguage,
    isSwitching,
    currentLanguage: i18n.language,
  };
}

// Hook to get translation status
export function useTranslationStatus() {
  const [status, setStatus] = useState<{
    totalLanguages: number;
    loadedLanguages: number;
    missingTranslations: string[];
  }>({
    totalLanguages: 0,
    loadedLanguages: 0,
    missingTranslations: [],
  });

  useEffect(() => {
    const checkStatus = () => {
      const languages = i18n.languages || [];
      const loaded = languages.filter(lang => 
        i18n.hasResourceBundle(lang, 'translation')
      );
      
      // Track missing translation keys
      const missing: string[] = [];
      if (i18n.store?.data) {
        Object.entries(i18n.store.data).forEach(([lang, namespaces]) => {
          const translation = (namespaces as any)?.translation || {};
          // Check for common keys
          const requiredKeys = ['common.save', 'navigation.home', 'auth.login'];
          requiredKeys.forEach(key => {
            const keys = key.split('.');
            let value = translation;
            for (const k of keys) {
              value = value?.[k];
              if (!value) {
                missing.push(`${lang}:${key}`);
                break;
              }
            }
          });
        });
      }
      
      setStatus({
        totalLanguages: languages.length,
        loadedLanguages: loaded.length,
        missingTranslations: missing,
      });
    };

    checkStatus();
    
    // Listen for language changes
    const handleLanguageChanged = () => checkStatus();
    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  return status;
}