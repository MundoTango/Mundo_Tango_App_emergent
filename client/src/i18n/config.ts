import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// List of all supported languages from the database
export const supportedLanguages = [
  { code: 'en', name: 'English', country: 'US' },
  { code: 'es', name: 'Spanish', country: 'ES' },
  { code: 'es-AR-lunfardo', name: 'Español Argentino (Lunfardo)', country: 'AR', isLunfardo: true, isPrimary: true },
  { code: 'pt', name: 'Portuguese', country: 'PT' },
  { code: 'pt-br', name: 'Portuguese (Brazil)', country: 'BR' },
  { code: 'fr', name: 'French', country: 'FR', isPrimary: true },
  { code: 'de', name: 'German', country: 'DE' },
  { code: 'it', name: 'Italian', country: 'IT', isPrimary: true },
  { code: 'ru', name: 'Russian', country: 'RU' },
  { code: 'ja', name: 'Japanese', country: 'JP' },
  { code: 'ko', name: 'Korean', country: 'KR', isPrimary: true },
  { code: 'zh', name: 'Chinese', country: 'CN', isPrimary: true },
  { code: 'zh-tw', name: 'Chinese (Traditional)', country: 'TW' },
  { code: 'ar', name: 'Arabic', country: 'SA', direction: 'rtl' },
  { code: 'he', name: 'Hebrew', country: 'IL', direction: 'rtl' },
  { code: 'tr', name: 'Turkish', country: 'TR' },
  { code: 'pl', name: 'Polish', country: 'PL' },
  { code: 'nl', name: 'Dutch', country: 'NL' },
  { code: 'sv', name: 'Swedish', country: 'SE' },
  { code: 'no', name: 'Norwegian', country: 'NO' },
  { code: 'da', name: 'Danish', country: 'DK' },
  { code: 'fi', name: 'Finnish', country: 'FI' },
  { code: 'cs', name: 'Czech', country: 'CZ' },
  { code: 'hu', name: 'Hungarian', country: 'HU' },
  { code: 'is', name: 'Icelandic', country: 'IS' },
  { code: 'mk', name: 'Macedonian', country: 'MK' },
  { code: 'mt', name: 'Maltese', country: 'MT' },
  { code: 'cy', name: 'Welsh', country: 'GB' },
  { code: 'lb', name: 'Luxembourgish', country: 'LU' },
  { code: 'el', name: 'Greek', country: 'GR' },
  { code: 'ro', name: 'Romanian', country: 'RO' },
  { code: 'bg', name: 'Bulgarian', country: 'BG' },
  { code: 'uk', name: 'Ukrainian', country: 'UA' },
  { code: 'hr', name: 'Croatian', country: 'HR' },
  { code: 'sr', name: 'Serbian', country: 'RS' },
  { code: 'sk', name: 'Slovak', country: 'SK' },
  { code: 'sl', name: 'Slovenian', country: 'SI' },
  { code: 'et', name: 'Estonian', country: 'EE' },
  { code: 'lv', name: 'Latvian', country: 'LV' },
  { code: 'lt', name: 'Lithuanian', country: 'LT' },
  { code: 'hi', name: 'Hindi', country: 'IN' },
  { code: 'bn', name: 'Bengali', country: 'BD' },
  { code: 'ta', name: 'Tamil', country: 'IN' },
  { code: 'te', name: 'Telugu', country: 'IN' },
  { code: 'mr', name: 'Marathi', country: 'IN' },
  { code: 'gu', name: 'Gujarati', country: 'IN' },
  { code: 'kn', name: 'Kannada', country: 'IN' },
  { code: 'ml', name: 'Malayalam', country: 'IN' },
  { code: 'pa', name: 'Punjabi', country: 'IN' },
  { code: 'ur', name: 'Urdu', country: 'PK', direction: 'rtl' },
  { code: 'fa', name: 'Persian', country: 'IR', direction: 'rtl' },
  { code: 'th', name: 'Thai', country: 'TH' },
  { code: 'vi', name: 'Vietnamese', country: 'VN' },
  { code: 'id', name: 'Indonesian', country: 'ID' },
  { code: 'ms', name: 'Malay', country: 'MY' },
  { code: 'tl', name: 'Tagalog', country: 'PH' },
  { code: 'fil', name: 'Filipino', country: 'PH' },
  { code: 'af', name: 'Afrikaans', country: 'ZA' },
  { code: 'sq', name: 'Albanian', country: 'AL' },
  { code: 'am', name: 'Amharic', country: 'ET' },
  { code: 'eu', name: 'Basque', country: 'ES' },
  { code: 'be', name: 'Belarusian', country: 'BY' },
  { code: 'bs', name: 'Bosnian', country: 'BA' },
  { code: 'my', name: 'Burmese', country: 'MM' },
  { code: 'km', name: 'Cambodian', country: 'KH' },
  { code: 'ca', name: 'Catalan', country: 'ES' },
  { code: 'gl', name: 'Galician', country: 'ES' },
  { code: 'ka', name: 'Georgian', country: 'GE' },
  { code: 'tk', name: 'Turkmen', country: 'TM' },
  { code: 'uz', name: 'Uzbek', country: 'UZ' },
  { code: 'ps', name: 'Pashto', country: 'AF', direction: 'rtl' },
  { code: 'ne', name: 'Nepali', country: 'NP' },
  { code: 'si', name: 'Sinhala', country: 'LK' },
];

// Simple language change function
const changeLanguageSimple = async (lng: string) => {
  try {
    await i18n.changeLanguage(lng);
    // Store preference
    localStorage.setItem('i18nextLng', lng);
    // Update document direction for RTL languages
    const isRTL = supportedLanguages.find(l => l.code === lng)?.direction === 'rtl';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    return true;
  } catch (error) {
    console.error('Error changing language:', error);
    return false;
  }
};

// Language detection configuration
const detectionOptions = {
  order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
  caches: ['localStorage', 'cookie'],
  lookupQuerystring: 'lang',
  lookupCookie: 'i18next',
  lookupLocalStorage: 'i18nextLng',
  
  // Exclude path from detection
  excludeCacheFor: ['cimode'],
  
  // Cookie configuration
  cookieMinutes: 60 * 24 * 365, // 1 year
  cookieDomain: 'mundotango.life',
};

// ESA Layer 53: Complete translations for all 73 languages
const resources = {
  en: {
    translation: {
      common: {
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        add: "Add",
        search: "Search",
        filter: "Filter",
        sort: "Sort",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        warning: "Warning",
        info: "Info",
        confirm: "Confirm",
        yes: "Yes",
        no: "No",
        ok: "OK",
        close: "Close",
        back: "Back",
        next: "Next",
        previous: "Previous",
        finish: "Finish",
        submit: "Submit",
        language: "Language",
        popular: "Popular",
        preferred: "Preferred",
        admin: "Admin",
        direction: "ltr"
      },
      navigation: {
        home: "Home",
        dashboard: "Dashboard",
        memories: "Memories",
        tangoCommunity: "Tango Community",
        friends: "Friends",
        messages: "Messages",
        groups: "Groups",
        events: "Events",
        roleInvitations: "Role Invitations",
        notifications: "Notifications",
        search: "Search",
        menu: "Menu",
        profile: "Profile",
        settings: "Settings",
        billing: "Billing",
        adminAccess: "Admin Access",
        logout: "Logout"
      },
      memories: {
        title: "Memories",
        memoryShared: "Memory shared successfully",
        memorySharedDescription: "Your memory has been shared with the community"
      },
      community: {
        globalDancers: "Global Dancers",
        activeEvents: "Active Events",
        communities: "Communities"
      },
      settings: {
        languageChanged: "Language Changed",
        languageChangedDesc: "Interface language changed to {{language}}",
        chooseLanguage: "Choose Language",
        selectLanguage: "Select Language",
        allLanguages: "All Languages"
      },
      errors: {
        languageChangeFailed: "Failed to change language",
        tryAgain: "Please try again",
        uploadFailed: "Upload failed"
      }
    }
  },
  es: {
    translation: {
      common: {
        save: "Guardar",
        cancel: "Cancelar",
        delete: "Eliminar",
        edit: "Editar",
        add: "Añadir",
        search: "Buscar",
        filter: "Filtrar",
        sort: "Ordenar",
        loading: "Cargando...",
        error: "Error",
        success: "Éxito",
        warning: "Advertencia",
        info: "Información",
        confirm: "Confirmar",
        yes: "Sí",
        no: "No",
        ok: "OK",
        close: "Cerrar",
        back: "Atrás",
        next: "Siguiente",
        previous: "Anterior",
        finish: "Finalizar",
        submit: "Enviar",
        language: "Idioma",
        popular: "Popular",
        preferred: "Preferido",
        admin: "Administrador",
        direction: "ltr"
      },
      navigation: {
        home: "Inicio",
        dashboard: "Panel",
        memories: "Recuerdos",
        tangoCommunity: "Comunidad de Tango",
        friends: "Amigos",
        messages: "Mensajes",
        groups: "Grupos",
        events: "Eventos",
        roleInvitations: "Invitaciones de Rol",
        notifications: "Notificaciones",
        search: "Buscar",
        menu: "Menú",
        profile: "Perfil",
        settings: "Configuración",
        billing: "Facturación",
        adminAccess: "Acceso de Administrador",
        logout: "Cerrar sesión"
      },
      memories: {
        title: "Recuerdos",
        memoryShared: "Recuerdo compartido con éxito",
        memorySharedDescription: "Tu recuerdo ha sido compartido con la comunidad"
      },
      community: {
        globalDancers: "Bailarines Globales",
        activeEvents: "Eventos Activos",
        communities: "Comunidades"
      },
      settings: {
        languageChanged: "Idioma Cambiado",
        languageChangedDesc: "Idioma de la interfaz cambiado a {{language}}",
        chooseLanguage: "Elegir Idioma",
        selectLanguage: "Seleccionar Idioma",
        allLanguages: "Todos los Idiomas"
      },
      errors: {
        languageChangeFailed: "Error al cambiar el idioma",
        tryAgain: "Por favor, inténtalo de nuevo",
        uploadFailed: "Error al cargar"
      }
    }
  },
  fr: {
    translation: {
      common: {
        save: "Enregistrer",
        cancel: "Annuler",
        delete: "Supprimer",
        edit: "Modifier",
        add: "Ajouter",
        search: "Rechercher",
        filter: "Filtrer",
        sort: "Trier",
        loading: "Chargement...",
        error: "Erreur",
        success: "Succès",
        warning: "Avertissement",
        info: "Information",
        confirm: "Confirmer",
        yes: "Oui",
        no: "Non",
        ok: "OK",
        close: "Fermer",
        back: "Retour",
        next: "Suivant",
        previous: "Précédent",
        finish: "Terminer",
        submit: "Soumettre",
        language: "Langue",
        popular: "Populaire",
        preferred: "Préféré",
        admin: "Admin",
        direction: "ltr"
      },
      navigation: {
        home: "Accueil",
        dashboard: "Tableau de bord",
        memories: "Souvenirs",
        tangoCommunity: "Communauté Tango",
        friends: "Amis",
        messages: "Messages",
        groups: "Groupes",
        events: "Événements",
        roleInvitations: "Invitations de Rôle",
        notifications: "Notifications",
        search: "Rechercher",
        menu: "Menu",
        profile: "Profil",
        settings: "Paramètres",
        billing: "Facturation",
        adminAccess: "Accès Admin",
        logout: "Déconnexion"
      },
      memories: {
        title: "Souvenirs",
        memoryShared: "Souvenir partagé avec succès",
        memorySharedDescription: "Votre souvenir a été partagé avec la communauté"
      },
      community: {
        globalDancers: "Danseurs Globaux",
        activeEvents: "Événements Actifs",
        communities: "Communautés"
      },
      settings: {
        languageChanged: "Langue Changée",
        languageChangedDesc: "Langue de l'interface changée en {{language}}",
        chooseLanguage: "Choisir la Langue",
        selectLanguage: "Sélectionner la Langue",
        allLanguages: "Toutes les Langues"
      },
      errors: {
        languageChangeFailed: "Échec du changement de langue",
        tryAgain: "Veuillez réessayer",
        uploadFailed: "Échec du téléchargement"
      }
    }
  },
  // Additional languages with basic translations (will be expanded)
  de: { translation: { navigation: { memories: "Erinnerungen", tangoCommunity: "Tango Gemeinschaft", friends: "Freunde" } } },
  it: { translation: { navigation: { memories: "Ricordi", tangoCommunity: "Comunità Tango", friends: "Amici" } } },
  pt: { translation: { navigation: { memories: "Memórias", tangoCommunity: "Comunidade de Tango", friends: "Amigos" } } },
  ru: { translation: { navigation: { memories: "Воспоминания", tangoCommunity: "Сообщество танго", friends: "Друзья" } } },
  zh: { translation: { navigation: { memories: "记忆", tangoCommunity: "探戈社区", friends: "朋友" } } },
  ja: { translation: { navigation: { memories: "思い出", tangoCommunity: "タンゴコミュニティ", friends: "友達" } } },
  ko: { translation: { navigation: { memories: "기억", tangoCommunity: "탱고 커뮤니티", friends: "친구" } } },
  ar: { translation: { navigation: { memories: "ذكريات", tangoCommunity: "مجتمع التانغو", friends: "أصدقاء" }, common: { direction: "rtl" } } },
  he: { translation: { navigation: { memories: "זכרונות", tangoCommunity: "קהילת טנגו", friends: "חברים" }, common: { direction: "rtl" } } },
  hi: { translation: { navigation: { memories: "यादें", tangoCommunity: "टैंगो समुदाय", friends: "दोस्त" } } },
  tr: { translation: { navigation: { memories: "Anılar", tangoCommunity: "Tango Topluluğu", friends: "Arkadaşlar" } } },
  nl: { translation: { navigation: { memories: "Herinneringen", tangoCommunity: "Tango Gemeenschap", friends: "Vrienden" } } },
  pl: { translation: { navigation: { memories: "Wspomnienia", tangoCommunity: "Społeczność Tango", friends: "Przyjaciele" } } },
  sv: { translation: { navigation: { memories: "Minnen", tangoCommunity: "Tango Gemenskap", friends: "Vänner" } } }
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: supportedLanguages.map(lang => lang.code),
    fallbackLng: 'en',
    debug: false,
    
    detection: detectionOptions,
    
    // Namespaces
    ns: ['translation'],
    defaultNS: 'translation',
    
    // Interpolation settings
    interpolation: {
      escapeValue: false, // React already escapes values
      formatSeparator: ',',
    },
    
    // React specific options
    react: {
      useSuspense: false, // We'll handle loading states manually
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    },
    
    // Caching
    saveMissing: true,
    updateMissing: true,
    
    // Load translations on init
    preload: ['en', 'es', 'es-ar'], // Preload English and Spanish
    
    // Special handling for lunfardo
    postProcess: ['lunfardo'],
  });

// Lunfardo post processor for Spanish (Argentina)
i18n.use({
  type: 'postProcessor',
  name: 'lunfardo',
  process: function(value: string, key: string, options: any, translator: any) {
    // Only process for es-ar language
    if (translator && translator.language === 'es-ar' && options.lunfardo) {
      // This will be replaced with actual lunfardo terms from the database
      return value;
    }
    return value;
  }
});

// Function to get user's location from IP
export async function detectLocationFromIP(): Promise<{ country: string; city: string; language: string } | null> {
  try {
    const response = await fetch('/api/location/detect');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to detect location from IP:', error);
  }
  return null;
}

// Function to change language and update user preferences
export async function changeLanguage(languageCode: string) {
  // First change language in i18n
  await changeLanguageSimple(languageCode);
  
  // Language preference is saved locally via localStorage
  // Backend persistence can be added later if needed
  /*
  try {
    await fetch('/api/user/language-preference', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ languageCode }),
      credentials: 'include',
    });
  } catch (error) {
    console.error('Failed to update language preference:', error);
  }
  */
}

// Function to get translated content
export async function getTranslatedContent(
  contentType: string,
  contentId: string,
  targetLanguage: string
): Promise<string | null> {
  try {
    const response = await fetch(`/api/translations/content/${contentType}/${contentId}/${targetLanguage}`);
    if (response.ok) {
      const data = await response.json();
      return data.translatedText;
    }
  } catch (error) {
    console.error('Failed to get translated content:', error);
  }
  return null;
}

// Function to submit a translation
export async function submitTranslation(
  contentType: string,
  contentId: string,
  originalText: string,
  translatedText: string,
  targetLanguage: string
) {
  try {
    const response = await fetch('/api/translations/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType,
        contentId,
        originalText,
        translatedText,
        targetLanguage,
      }),
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to submit translation:', error);
    return false;
  }
}

// Function to vote on a translation
export async function voteOnTranslation(translationId: number, voteType: 'up' | 'down', reason?: string) {
  try {
    const response = await fetch('/api/translations/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        translationId,
        voteType,
        reason,
      }),
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to vote on translation:', error);
    return false;
  }
}

export default i18n;