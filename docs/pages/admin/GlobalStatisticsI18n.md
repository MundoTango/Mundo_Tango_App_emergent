# Global Statistics Internationalization Guide (ESA Layer 53)

## 1. Overview

This document provides comprehensive guidance for implementing and maintaining multilingual support for the Global Statistics feature using ESA Layer 53 (Internationalization Agent). The implementation enables the global tango community to access platform analytics in their native languages with culturally appropriate formatting.

## 2. ESA Framework Integration

### Layer 53 Responsibilities
- **Primary Agent**: Internationalization Agent
- **Functions**: 
  - Translation management and coordination
  - Locale detection and switching
  - Number, date, and currency formatting
  - RTL layout management
  - Cultural adaptation rules

### Related Layers
- **Layer 14**: Cache Optimization (caches translations)
- **Layer 48**: Debugging Agent (monitors translation errors)
- **Layer 51**: Performance Analytics (tracks language usage)
- **Layer 60**: Clean Codebase (maintains translation consistency)

## 3. Supported Languages

### Primary Languages (Tier 1)
| Language | Code | Native Name | RTL | Status |
|----------|------|-------------|-----|--------|
| English | en-US | English | No | ✅ Complete |
| Spanish | es-ES | Español | No | ✅ Complete |
| French | fr-FR | Français | No | ✅ Complete |
| Portuguese | pt-BR | Português | No | ✅ Complete |
| Italian | it-IT | Italiano | No | ✅ Complete |

### Secondary Languages (Tier 2)
| Language | Code | Native Name | RTL | Status |
|----------|------|-------------|-----|--------|
| German | de-DE | Deutsch | No | ✅ Complete |
| Japanese | ja-JP | 日本語 | No | ✅ Complete |
| Chinese | zh-CN | 中文 | No | ✅ Complete |
| Arabic | ar-SA | العربية | Yes | ✅ Complete |
| Hebrew | he-IL | עברית | Yes | ✅ Complete |

## 4. Translation Key Structure

### Hierarchical Organization
```json
{
  "statistics": {
    "global": {
      "title": "Global Statistics",
      "metrics": {
        "dancers": {
          "label": "Global Dancers",
          "tooltip": "Total registered dancers worldwide",
          "description": "Active tango dancers across all communities"
        },
        "events": {
          "label": "Active Events",
          "tooltip": "Events happening in the next 30 days",
          "description": "Milongas, workshops, and festivals"
        },
        "communities": {
          "label": "Communities",
          "tooltip": "Active tango communities globally",
          "description": "Local and regional tango groups"
        },
        "city": {
          "label": "Your City",
          "tooltip": "Dancers in your current location",
          "description": "Local tango community members"
        }
      },
      "actions": {
        "viewDetails": "View Details",
        "exportData": "Export Data",
        "refresh": "Refresh",
        "share": "Share",
        "filter": "Filter",
        "compare": "Compare"
      },
      "timeframes": {
        "realtime": "Real-time",
        "today": "Today",
        "week": "This Week",
        "month": "This Month",
        "year": "This Year",
        "allTime": "All Time"
      }
    }
  }
}
```

## 5. Complete Translation Tables

### Core Metrics Translations
| Key | EN | ES | FR | PT | IT | DE | JA | ZH | AR | HE |
|-----|----|----|----|----|----|----|----|----|----|----|
| Global Dancers | Global Dancers | Bailarines Globales | Danseurs Mondiaux | Dançarinos Globais | Ballerini Globali | Globale Tänzer | グローバルダンサー | 全球舞者 | الراقصون العالميون | רקדנים גלובליים |
| Active Events | Active Events | Eventos Activos | Événements Actifs | Eventos Ativos | Eventi Attivi | Aktive Veranstaltungen | アクティブイベント | 活跃活动 | الأحداث النشطة | אירועים פעילים |
| Communities | Communities | Comunidades | Communautés | Comunidades | Comunità | Gemeinschaften | コミュニティ | 社区 | المجتمعات | קהילות |
| Your City | Your City | Tu Ciudad | Votre Ville | Sua Cidade | La Tua Città | Deine Stadt | あなたの街 | 你的城市 | مدينتك | העיר שלך |

## 6. Number Formatting Rules

### Locale-Specific Formats
```typescript
const numberFormats = {
  'en-US': { thousand: ',', decimal: '.', currency: '$' },
  'es-ES': { thousand: '.', decimal: ',', currency: '€' },
  'fr-FR': { thousand: ' ', decimal: ',', currency: '€' },
  'pt-BR': { thousand: '.', decimal: ',', currency: 'R$' },
  'it-IT': { thousand: '.', decimal: ',', currency: '€' },
  'de-DE': { thousand: '.', decimal: ',', currency: '€' },
  'ja-JP': { thousand: ',', decimal: '.', currency: '¥' },
  'zh-CN': { thousand: ',', decimal: '.', currency: '¥' },
  'ar-SA': { thousand: '٬', decimal: '٫', currency: 'ر.س' },
  'he-IL': { thousand: ',', decimal: '.', currency: '₪' }
};
```

### Compact Number Display
```typescript
// Formatting large numbers for display
const compactFormats = {
  'en-US': (n) => n >= 1000 ? `${(n/1000).toFixed(1)}K` : n,
  'es-ES': (n) => n >= 1000 ? `${(n/1000).toFixed(1)} mil` : n,
  'fr-FR': (n) => n >= 1000 ? `${(n/1000).toFixed(1)} k` : n,
  'pt-BR': (n) => n >= 1000 ? `${(n/1000).toFixed(1)} mil` : n,
  'ja-JP': (n) => n >= 1000 ? `${(n/1000).toFixed(1)}千` : n,
  'zh-CN': (n) => n >= 1000 ? `${(n/1000).toFixed(1)}千` : n,
  'ar-SA': (n) => n >= 1000 ? `${(n/1000).toFixed(1)} ألف` : n
};
```

## 7. Date & Time Formatting

### Cultural Date Formats
```typescript
const dateFormats = {
  'en-US': 'MM/DD/YYYY',
  'es-ES': 'DD/MM/YYYY',
  'fr-FR': 'DD/MM/YYYY',
  'pt-BR': 'DD/MM/YYYY',
  'it-IT': 'DD/MM/YYYY',
  'de-DE': 'DD.MM.YYYY',
  'ja-JP': 'YYYY年MM月DD日',
  'zh-CN': 'YYYY年MM月DD日',
  'ar-SA': 'DD/MM/YYYY',
  'he-IL': 'DD/MM/YYYY'
};
```

### Week Start Days
```typescript
const weekStartDay = {
  'en-US': 0, // Sunday
  'es-ES': 1, // Monday
  'fr-FR': 1, // Monday
  'pt-BR': 0, // Sunday
  'ar-SA': 6, // Saturday
  'he-IL': 0  // Sunday
};
```

## 8. RTL (Right-to-Left) Implementation

### CSS Rules for RTL Languages
```css
/* Base RTL styles */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

/* Statistics card adjustments */
[dir="rtl"] .stats-card {
  flex-direction: row-reverse;
}

[dir="rtl"] .stats-icon {
  margin-right: 0;
  margin-left: 1rem;
}

/* Chart adjustments */
[dir="rtl"] .chart-legend {
  flex-direction: row-reverse;
}

[dir="rtl"] .axis-label {
  text-anchor: end;
}

/* Grid layout for RTL */
[dir="rtl"] .stats-grid {
  grid-template-columns: 1fr 1fr;
  direction: rtl;
}
```

### JavaScript RTL Detection
```typescript
const isRTLLanguage = (lang: string): boolean => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(lang.split('-')[0]);
};

const applyRTLLayout = (language: string) => {
  const isRTL = isRTLLanguage(language);
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
};
```

## 9. Implementation Components

### Language Selector Component
```typescript
const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const languages = [
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
    { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
    { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
    { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' },
    { code: 'he-IL', name: 'עברית', flag: '🇮🇱' }
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setCurrentLang(langCode);
    applyRTLLayout(langCode);
    // Save preference
    localStorage.setItem('preferredLanguage', langCode);
  };

  return (
    <Select value={currentLang} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Language" />
      </SelectTrigger>
      <SelectContent>
        {languages.map(lang => (
          <SelectItem key={lang.code} value={lang.code}>
            <span>{lang.flag} {lang.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
```

### Localized Statistics Widget
```typescript
const LocalizedStatisticsWidget: React.FC<{ metric: string, value: number }> = ({ metric, value }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  
  const formattedValue = useMemo(() => {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  }, [value, locale]);

  return (
    <div className="stats-widget">
      <div className="metric-label">
        {t(`statistics.global.metrics.${metric}.label`)}
      </div>
      <div className="metric-value">
        {formattedValue}
      </div>
      <div className="metric-tooltip">
        {t(`statistics.global.metrics.${metric}.tooltip`)}
      </div>
    </div>
  );
};
```

## 10. Testing & Validation

### Translation Coverage Testing
```typescript
describe('Global Statistics i18n', () => {
  const languages = ['en-US', 'es-ES', 'fr-FR', 'pt-BR', 'ar-SA'];
  
  languages.forEach(lang => {
    test(`All keys present for ${lang}`, () => {
      const translations = require(`./locales/${lang}.json`);
      expect(translations.statistics.global.metrics.dancers).toBeDefined();
      expect(translations.statistics.global.metrics.events).toBeDefined();
      expect(translations.statistics.global.metrics.communities).toBeDefined();
      expect(translations.statistics.global.metrics.city).toBeDefined();
    });
  });

  test('RTL languages apply correct direction', () => {
    applyRTLLayout('ar-SA');
    expect(document.documentElement.dir).toBe('rtl');
    
    applyRTLLayout('en-US');
    expect(document.documentElement.dir).toBe('ltr');
  });

  test('Number formatting respects locale', () => {
    expect(formatNumber(3200, 'en-US')).toBe('3.2K');
    expect(formatNumber(3200, 'es-ES')).toContain('mil');
    expect(formatNumber(3200, 'ja-JP')).toContain('千');
  });
});
```

## 11. Maintenance Guidelines

### Adding New Languages
1. Create translation file: `/locales/{lang-code}.json`
2. Add language to selector component
3. Configure number/date formats
4. Test RTL layout if applicable
5. Update this documentation

### Translation Workflow
1. **Key Creation**: Add new keys in English first
2. **Translation Request**: Use translation management system
3. **Review**: Native speakers review translations
4. **Testing**: Validate formatting and layout
5. **Deployment**: Release with feature flags if needed

### Quality Assurance
- **Consistency**: Use translation memory for repeated terms
- **Context**: Provide context for translators
- **Testing**: Test all languages before release
- **Feedback**: Collect user feedback on translations
- **Updates**: Regular review and refinement

## 12. Performance Considerations

### Translation Loading Strategy
```typescript
// Lazy load translations
const loadTranslations = async (language: string) => {
  const module = await import(`./locales/${language}.json`);
  return module.default;
};

// Cache loaded translations
const translationCache = new Map();

const getTranslations = async (language: string) => {
  if (!translationCache.has(language)) {
    const translations = await loadTranslations(language);
    translationCache.set(language, translations);
  }
  return translationCache.get(language);
};
```

### Bundle Size Optimization
- Separate translation files by language
- Load only active language
- Use dynamic imports
- Compress translation files

## 13. Related Documentation

- [Live Global Statistics](./LiveGlobalStatistics.md) - Real-time statistics implementation
- [Global Statistics](./global-statistics.md) - Historical analytics documentation
- [Statistics Widget](./StatisticsWidget.md) - Compact widget implementation
- [ESA Layer 53](../../ESA_LIFE_CEO_61x21_AGENTS_FRAMEWORK.md#layer-53) - Internationalization Agent details

## 14. Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Missing translations | Key not in locale file | Add missing keys with fallback |
| Wrong number format | Incorrect locale code | Verify locale code format |
| RTL layout broken | CSS specificity issues | Check RTL CSS rules |
| Language doesn't persist | LocalStorage disabled | Use cookie fallback |
| Slow language switching | Loading translations | Pre-load common languages |

### Debug Mode
```typescript
// Enable i18n debug mode
if (process.env.NODE_ENV === 'development') {
  i18n.init({
    debug: true,
    missingKeyHandler: (lng, ns, key) => {
      console.warn(`Missing translation: ${lng}/${ns}/${key}`);
    }
  });
}
```