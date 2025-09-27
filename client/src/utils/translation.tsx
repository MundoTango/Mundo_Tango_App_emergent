import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';

/**
 * ESA LIFE CEO 61×21 AGENTS FRAMEWORK - Layer 53: Internationalization Agent
 * 
 * Comprehensive translation utilities for the entire platform
 * Ensures all content is translatable for 73+ languages
 */

// Hook for using translations in components
export const useAppTranslation = (namespace: string = 'translation') => {
  return useTranslation(namespace);
};

// Helper to translate with fallback
export const translateWithFallback = (
  key: string,
  fallback: string,
  t: any
): string => {
  const translated = t(key);
  return translated === key ? fallback : translated;
};

// Component wrapper for translatable text
interface TranslatableTextProps {
  tKey: string;
  fallback?: string;
  values?: Record<string, any>;
  namespace?: string;
}

export const T: React.FC<TranslatableTextProps> = ({
  tKey,
  fallback = '',
  values = {},
  namespace = 'translation'
}) => {
  const { t } = useTranslation(namespace);
  const text = translateWithFallback(tKey, fallback || tKey, t);
  
  // Handle interpolation
  let finalText = text;
  Object.keys(values).forEach(key => {
    finalText = finalText.replace(`{{${key}}}`, values[key]);
  });
  
  return <>{finalText}</>;
};

// Format date according to locale
export const formatDateLocale = (date: Date | string, locale: string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format number according to locale
export const formatNumberLocale = (number: number, locale: string): string => {
  return number.toLocaleString(locale);
};

// Format currency according to locale
export const formatCurrencyLocale = (
  amount: number,
  locale: string,
  currency: string = 'USD'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
};

// Get text direction for language (RTL support)
export const getTextDirection = (locale: string): 'ltr' | 'rtl' => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(locale.split('-')[0]) ? 'rtl' : 'ltr';
};

// Translation key generator for dynamic content
export const generateTranslationKey = (prefix: string, ...parts: string[]): string => {
  return [prefix, ...parts].filter(Boolean).join('.');
};

// Pluralization helper
export const pluralize = (
  count: number,
  singular: string,
  plural: string,
  t: any
): string => {
  const key = count === 1 ? singular : plural;
  return t(key, { count });
};

// Dynamic translation loader for lazy-loaded components
export const loadTranslationNamespace = async (namespace: string, language: string) => {
  try {
    const response = await fetch(`/api/translations/${language}/${namespace}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error(`Failed to load translations for ${namespace}:`, error);
  }
  return null;
};