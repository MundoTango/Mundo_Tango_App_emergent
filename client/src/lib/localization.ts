import { format, formatDistance, formatRelative, isValid } from 'date-fns';
import { es, enUS, pt, fr, it } from 'date-fns/locale';

// ESA LIFE CEO 61x21 - Phase 15: Localization Utilities

// Date locale mapping
const dateLocales = {
  es: es,
  en: enUS,
  pt: pt,
  fr: fr,
  it: it
};

// Number format configurations
const numberFormats = {
  es: {
    decimal: ',',
    thousand: '.',
    currency: '€',
    currencyPosition: 'suffix'
  },
  en: {
    decimal: '.',
    thousand: ',',
    currency: '$',
    currencyPosition: 'prefix'
  },
  pt: {
    decimal: ',',
    thousand: '.',
    currency: 'R$',
    currencyPosition: 'prefix'
  },
  fr: {
    decimal: ',',
    thousand: ' ',
    currency: '€',
    currencyPosition: 'suffix'
  },
  it: {
    decimal: ',',
    thousand: '.',
    currency: '€',
    currencyPosition: 'suffix'
  }
};

// Get current language from localStorage or default
export const getCurrentLanguage = (): string => {
  return localStorage.getItem('mundotango_language') || 'es';
};

// Format date with locale
export const formatLocalizedDate = (
  date: Date | string | number,
  formatStr: string = 'PP',
  language?: string
): string => {
  const lng = language || getCurrentLanguage();
  const locale = dateLocales[lng as keyof typeof dateLocales] || dateLocales.en;
  
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (!isValid(dateObj)) {
    return '';
  }
  
  return format(dateObj, formatStr, { locale });
};

// Format relative time
export const formatRelativeTime = (
  date: Date | string | number,
  baseDate: Date = new Date(),
  language?: string
): string => {
  const lng = language || getCurrentLanguage();
  const locale = dateLocales[lng as keyof typeof dateLocales] || dateLocales.en;
  
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (!isValid(dateObj)) {
    return '';
  }
  
  return formatRelative(dateObj, baseDate, { locale });
};

// Format distance to now
export const formatTimeAgo = (
  date: Date | string | number,
  language?: string,
  addSuffix: boolean = true
): string => {
  const lng = language || getCurrentLanguage();
  const locale = dateLocales[lng as keyof typeof dateLocales] || dateLocales.en;
  
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (!isValid(dateObj)) {
    return '';
  }
  
  return formatDistance(dateObj, new Date(), { locale, addSuffix });
};

// Format number with locale
export const formatNumber = (
  value: number,
  language?: string,
  options?: Intl.NumberFormatOptions
): string => {
  const lng = language || getCurrentLanguage();
  
  const localeMap = {
    es: 'es-ES',
    en: 'en-US',
    pt: 'pt-BR',
    fr: 'fr-FR',
    it: 'it-IT'
  };
  
  const locale = localeMap[lng as keyof typeof localeMap] || 'en-US';
  
  return new Intl.NumberFormat(locale, options).format(value);
};

// Format currency
export const formatCurrency = (
  amount: number,
  language?: string,
  currency?: string
): string => {
  const lng = language || getCurrentLanguage();
  const config = numberFormats[lng as keyof typeof numberFormats] || numberFormats.en;
  
  const currencyCode = currency || config.currency;
  
  const localeMap = {
    es: 'es-ES',
    en: 'en-US',
    pt: 'pt-BR',
    fr: 'fr-FR',
    it: 'it-IT'
  };
  
  const locale = localeMap[lng as keyof typeof localeMap] || 'en-US';
  
  // Map currency symbols to ISO codes
  const currencyMap: Record<string, string> = {
    '€': 'EUR',
    '$': 'USD',
    'R$': 'BRL',
    '£': 'GBP',
    '¥': 'JPY'
  };
  
  const isoCurrency = currencyMap[currencyCode] || currencyCode;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: isoCurrency
  }).format(amount);
};

// Format percentage
export const formatPercentage = (
  value: number,
  language?: string,
  decimals: number = 0
): string => {
  const lng = language || getCurrentLanguage();
  
  const localeMap = {
    es: 'es-ES',
    en: 'en-US',
    pt: 'pt-BR',
    fr: 'fr-FR',
    it: 'it-IT'
  };
  
  const locale = localeMap[lng as keyof typeof localeMap] || 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
};

// Format phone number
export const formatPhoneNumber = (
  phone: string,
  language?: string
): string => {
  const lng = language || getCurrentLanguage();
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on language/country
  switch (lng) {
    case 'es':
      // Spanish format: +34 XXX XX XX XX
      if (cleaned.startsWith('34')) {
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
      }
      break;
    case 'en':
      // US format: +1 (XXX) XXX-XXXX
      if (cleaned.startsWith('1')) {
        return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
      }
      break;
    case 'pt':
      // Brazilian format: +55 (XX) XXXXX-XXXX
      if (cleaned.startsWith('55')) {
        return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9, 13)}`;
      }
      break;
    case 'fr':
      // French format: +33 X XX XX XX XX
      if (cleaned.startsWith('33')) {
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`;
      }
      break;
    case 'it':
      // Italian format: +39 XXX XXX XXXX
      if (cleaned.startsWith('39')) {
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 12)}`;
      }
      break;
  }
  
  // Default format
  return phone;
};

// Format file size
export const formatFileSize = (
  bytes: number,
  language?: string
): string => {
  const lng = language || getCurrentLanguage();
  
  const units = {
    es: ['B', 'KB', 'MB', 'GB', 'TB'],
    en: ['B', 'KB', 'MB', 'GB', 'TB'],
    pt: ['B', 'KB', 'MB', 'GB', 'TB'],
    fr: ['o', 'Ko', 'Mo', 'Go', 'To'],
    it: ['B', 'KB', 'MB', 'GB', 'TB']
  };
  
  const unitList = units[lng as keyof typeof units] || units.en;
  
  if (bytes === 0) return `0 ${unitList[0]}`;
  
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${unitList[i]}`;
};

// Format duration
export const formatDuration = (
  seconds: number,
  language?: string
): string => {
  const lng = language || getCurrentLanguage();
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const labels = {
    es: { h: 'h', m: 'min', s: 's' },
    en: { h: 'h', m: 'min', s: 's' },
    pt: { h: 'h', m: 'min', s: 's' },
    fr: { h: 'h', m: 'min', s: 's' },
    it: { h: 'h', m: 'min', s: 's' }
  };
  
  const label = labels[lng as keyof typeof labels] || labels.en;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}${label.h}`);
  if (minutes > 0) parts.push(`${minutes}${label.m}`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}${label.s}`);
  
  return parts.join(' ');
};

// Get text direction for language
export const getTextDirection = (language?: string): 'ltr' | 'rtl' => {
  const lng = language || getCurrentLanguage();
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(lng) ? 'rtl' : 'ltr';
};

// Get locale for HTML lang attribute
export const getHtmlLang = (language?: string): string => {
  const lng = language || getCurrentLanguage();
  const langMap = {
    es: 'es-ES',
    en: 'en-US',
    pt: 'pt-BR',
    fr: 'fr-FR',
    it: 'it-IT'
  };
  
  return langMap[lng as keyof typeof langMap] || 'en-US';
};

// Pluralization helper
export const pluralize = (
  count: number,
  singular: string,
  plural: string,
  language?: string
): string => {
  const lng = language || getCurrentLanguage();
  
  // Simple pluralization rules (can be expanded for more complex languages)
  switch (lng) {
    case 'es':
    case 'pt':
    case 'it':
    case 'en':
      return count === 1 ? singular : plural;
    case 'fr':
      return count <= 1 ? singular : plural;
    default:
      return count === 1 ? singular : plural;
  }
};

// Sort strings with locale
export const sortByLocale = <T>(
  items: T[],
  getKey: (item: T) => string,
  language?: string,
  ascending: boolean = true
): T[] => {
  const lng = language || getCurrentLanguage();
  
  const localeMap = {
    es: 'es-ES',
    en: 'en-US',
    pt: 'pt-BR',
    fr: 'fr-FR',
    it: 'it-IT'
  };
  
  const locale = localeMap[lng as keyof typeof localeMap] || 'en-US';
  
  return [...items].sort((a, b) => {
    const comparison = getKey(a).localeCompare(getKey(b), locale);
    return ascending ? comparison : -comparison;
  });
};

export default {
  getCurrentLanguage,
  formatLocalizedDate,
  formatRelativeTime,
  formatTimeAgo,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatPhoneNumber,
  formatFileSize,
  formatDuration,
  getTextDirection,
  getHtmlLang,
  pluralize,
  sortByLocale
};