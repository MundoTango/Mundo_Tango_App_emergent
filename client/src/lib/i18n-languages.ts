// ESA LIFE CEO 61x21 - Layer 53: Internationalization
// All 68 supported languages with complete metadata
// Generated: October 8, 2025

export interface LanguageMetadata {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  region: 'tango' | 'primary' | 'europe' | 'americas' | 'asia' | 'mea';
  isActive: boolean;
}

// RTL (Right-to-Left) languages
export const rtlLanguages = ['ar', 'he', 'fa', 'ur'];

// All 68 supported languages with metadata
export const allSupportedLanguages: LanguageMetadata[] = [
  // Tango Languages (Top 7 for tango community)
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', direction: 'ltr', region: 'tango', isActive: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr', region: 'tango', isActive: true },
  { code: 'es-AR', name: 'Spanish (Argentina)', nativeName: 'Español (Argentina)', flag: '🇦🇷', direction: 'ltr', region: 'tango', isActive: true },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr', region: 'tango', isActive: true },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', direction: 'ltr', region: 'tango', isActive: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', direction: 'ltr', region: 'tango', isActive: true },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', direction: 'ltr', region: 'tango', isActive: true },
  
  // Europe (30 languages)

  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', flag: '🇮🇸', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', flag: '🇲🇰', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti', flag: '🇲🇹', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge', flag: '🇮🇪', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', flag: '🇦🇩', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'gl', name: 'Galician', nativeName: 'Galego', flag: '🇪🇸', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara', flag: '🇪🇸', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip', flag: '🇦🇱', direction: 'ltr', region: 'europe', isActive: true },
  
  // Americas (1 language)
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷', direction: 'ltr', region: 'americas', isActive: true },
  
  // Asia (21 languages)
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', flag: '🇰🇭', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ', flag: '🇱🇦', direction: 'ltr', region: 'asia', isActive: true },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ', flag: '🇲🇲', direction: 'ltr', region: 'asia', isActive: true },
  
  // Middle East & Africa (8 languages - includes RTL)
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl', region: 'mea', isActive: true },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', direction: 'rtl', region: 'mea', isActive: true },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', direction: 'rtl', region: 'mea', isActive: true },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', direction: 'rtl', region: 'mea', isActive: true },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', direction: 'ltr', region: 'mea', isActive: true },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦', direction: 'ltr', region: 'mea', isActive: true },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', direction: 'ltr', region: 'mea', isActive: true },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', direction: 'ltr', region: 'mea', isActive: true },
  
  // Additional European & Caucasus
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', flag: '🇬🇪', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', flag: '🇦🇲', direction: 'ltr', region: 'europe', isActive: true },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', flag: '🇦🇿', direction: 'ltr', region: 'europe', isActive: true },
];

// Helper to check if language is RTL
export const isRTL = (lang: string): boolean => {
  return rtlLanguages.includes(lang);
};

// Get languages by region
export const getLanguagesByRegion = (region: LanguageMetadata['region']): LanguageMetadata[] => {
  return allSupportedLanguages.filter(lang => lang.region === region);
};

// Get tango languages (top languages for tango community)
export const getTangoLanguages = (): LanguageMetadata[] => {
  return allSupportedLanguages.filter(lang => lang.region === 'tango');
};

// Get primary languages
export const getPrimaryLanguages = (): LanguageMetadata[] => {
  return allSupportedLanguages.filter(lang => lang.region === 'primary');
};

// Get all active languages
export const getActiveLanguages = (): LanguageMetadata[] => {
  return allSupportedLanguages.filter(lang => lang.isActive);
};

// Find language by code
export const getLanguageByCode = (code: string): LanguageMetadata | undefined => {
  return allSupportedLanguages.find(lang => lang.code === code);
};

// Total language count
export const TOTAL_LANGUAGES = allSupportedLanguages.length; // 68
