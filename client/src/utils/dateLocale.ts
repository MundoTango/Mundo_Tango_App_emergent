import { formatDistanceToNow, Locale } from 'date-fns';
import { es, fr, de, it, pt } from 'date-fns/locale';

const locales: Record<string, Locale> = {
  es,
  fr,
  de,
  it,
  pt,
};

export function formatTimeAgo(date: Date | string, currentLanguage: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'recently';
  }

  // Get the base language code (e.g., 'es' from 'es-AR' or 'es-AR-lunfardo')
  const baseLang = currentLanguage.split('-')[0];
  const locale = locales[baseLang];

  return formatDistanceToNow(dateObj, { 
    addSuffix: true,
    locale 
  });
}
