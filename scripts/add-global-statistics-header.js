#!/usr/bin/env node

/**
 * ESA Layer 53: Add Global Statistics header translation to all languages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global Statistics header translations for all 65 languages
const globalStatisticsTranslations = {
  "en": "Global Statistics",
  "it": "Statistiche Globali",
  "fr": "Statistiques Mondiales",
  "ko": "글로벌 통계",
  "zh": "全球统计",
  "es": "Estadísticas Globales",
  "pt": "Estatísticas Globais",
  "de": "Globale Statistiken",
  "ru": "Глобальная статистика",
  "pl": "Statystyki Globalne",
  "nl": "Wereldwijde Statistieken",
  "sv": "Global Statistik",
  "no": "Global Statistikk",
  "da": "Global Statistik",
  "fi": "Globaalit Tilastot",
  "cs": "Globální statistiky",
  "hu": "Globális Statisztikák",
  "ro": "Statistici Globale",
  "bg": "Глобална статистика",
  "hr": "Globalne statistike",
  "sr": "Глобална статистика",
  "sk": "Globálne štatistiky",
  "sl": "Globalna statistika",
  "el": "Παγκόσμιες Στατιστικές",
  "uk": "Глобальна статистика",
  "be": "Глабальная статыстыка",
  "is": "Alþjóðlegar tölfræði",
  "mk": "Глобална статистика",
  "lt": "Pasaulinė statistika",
  "lv": "Globālā statistika",
  "et": "Globaalne statistika",
  "sq": "Statistikat Globale",
  "mt": "Statistika Globali",
  "ga": "Staitisticí Domhanda",
  "cy": "Ystadegau Byd-eang",
  "eu": "Estatistika Globalak",
  "ca": "Estadístiques Globals",
  "pt-BR": "Estatísticas Globais",
  "es-MX": "Estadísticas Globales",
  "fr-CA": "Statistiques Mondiales",
  "ja": "グローバル統計",
  "zh-TW": "全球統計",
  "hi": "वैश्विक आँकड़े",
  "bn": "বৈশ্বিক পরিসংখ্যান",
  "ta": "உலகளாவிய புள்ளிவிவரங்கள்",
  "te": "ప్రపంచ గణాంకాలు",
  "mr": "जागतिक सांख्यिकी",
  "kn": "ಜಾಗತಿಕ ಅಂಕಿಅಂಶಗಳು",
  "ml": "ആഗോള സ്ഥിതിവിവരക്കണക്കുകൾ",
  "pa": "ਗਲੋਬਲ ਅੰਕੜੇ",
  "th": "สถิติระดับโลก",
  "vi": "Thống kê Toàn cầu",
  "id": "Statistik Global",
  "ms": "Statistik Global",
  "tl": "Pandaigdigang Estadistika",
  "my": "ကမ္ဘာလုံးဆိုင်ရာ စာရင်းအင်း",
  "km": "ស្ថិតិពិភពលោក",
  "ar": "الإحصائيات العالمية",
  "he": "סטטיסטיקה גלובלית",
  "tr": "Küresel İstatistikler",
  "fa": "آمار جهانی",
  "ur": "عالمی شماریات",
  "sw": "Takwimu za Kimataifa",
  "am": "ዓለም አቀፍ ስታቲስቲክስ"
};

// Read the existing translations file
const translationsPath = path.join(__dirname, '../client/src/i18n/translations.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

// Add globalStatistics translation to each language
Object.keys(globalStatisticsTranslations).forEach(lang => {
  if (!translations[lang]) {
    console.warn(`Language ${lang} not found in translations file, skipping...`);
    return;
  }
  
  // Initialize community section if it doesn't exist
  if (!translations[lang].translation.community) {
    translations[lang].translation.community = {};
  }
  
  // Add the globalStatistics translation
  translations[lang].translation.community.globalStatistics = globalStatisticsTranslations[lang];
  
  console.log(`✅ Added globalStatistics to ${lang}: "${globalStatisticsTranslations[lang]}"`);
});

// Save the updated translations file
fs.writeFileSync(translationsPath, JSON.stringify(translations, null, 2), 'utf8');

console.log('\n🎉 ESA Layer 53: Global Statistics header translation added to all languages!');