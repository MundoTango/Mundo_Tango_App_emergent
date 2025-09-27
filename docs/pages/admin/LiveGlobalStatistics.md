# Live Global Statistics Documentation

## 1. Overview
- **Route**: `/stats` and `/global-statistics`
- **Purpose**: Real-time platform analytics displaying actual database metrics, system performance, and user activity
- **ESA Framework Layers**:
  - Layer 14 (Cache Optimization) - Performance monitoring
  - Layer 48 (Debugging Agent) - Real-time diagnostics
  - Layer 51 (Performance Analytics) - Metrics aggregation
  - **Layer 53 (Internationalization Agent)** - Complete multilingual implementation
  - Layer 60 (Clean Codebase) - Unified statistics dashboard

### Multilingual Support (ESA Layer 53)
- **Supported Languages**: EN, ES, FR, PT, IT, DE, JA, ZH, AR, HE
- **RTL Support**: Full support for Arabic and Hebrew
- **Locale Detection**: Automatic based on user preferences
- **Dynamic Switching**: Change language without page reload

## 2. Technical Implementation

### Components
- `client/src/pages/LiveGlobalStatistics.tsx` - Main statistics dashboard
- `StatisticsHeader` - Connection status and controls
- `RealtimeMetrics` - Live counters and gauges
- `GeographicView` - 3D globe and world map visualizations
- `MetricsDashboard` - System and application metrics
- `LiveCharts` - Animated data visualizations
- `AlertsPanel` - Anomaly detection and warnings
- `ActivityFeed` - Real-time event stream

### API Endpoints
- `GET /api/stats/realtime` - Live platform metrics
- `GET /api/stats/geographic` - User distribution data
- `GET /api/stats/system` - Server performance metrics
- `GET /api/stats/business` - Business KPIs
- `WS /ws/stats` - WebSocket for real-time updates

### Real-time Features
- WebSocket streaming for live updates
- Automatic anomaly detection (currently detecting low cache hit rate)
- Real-time memory monitoring (currently at 91.5%)
- Live validation every 30 seconds
- Cache warming attempts (currently failing due to no data)

## 3. Internationalization Implementation

### Translation Structure
```typescript
interface GlobalStatisticsI18n {
  metrics: {
    globalDancers: {
      en: "Global Dancers",
      es: "Bailarines Globales",
      fr: "Danseurs Mondiaux",
      pt: "Dançarinos Globais",
      it: "Ballerini Globali",
      de: "Globale Tänzer",
      ja: "グローバルダンサー",
      zh: "全球舞者",
      ar: "الراقصون العالميون",
      he: "רקדנים גלובליים"
    },
    activeEvents: {
      en: "Active Events",
      es: "Eventos Activos",
      fr: "Événements Actifs",
      pt: "Eventos Ativos",
      it: "Eventi Attivi",
      de: "Aktive Veranstaltungen",
      ja: "アクティブイベント",
      zh: "活跃活动",
      ar: "الأحداث النشطة",
      he: "אירועים פעילים"
    },
    communities: {
      en: "Communities",
      es: "Comunidades",
      fr: "Communautés",
      pt: "Comunidades",
      it: "Comunità",
      de: "Gemeinschaften",
      ja: "コミュニティ",
      zh: "社区",
      ar: "المجتمعات",
      he: "קהילות"
    },
    yourCity: {
      en: "Your City",
      es: "Tu Ciudad",
      fr: "Votre Ville",
      pt: "Sua Cidade",
      it: "La Tua Città",
      de: "Deine Stadt",
      ja: "あなたの街",
      zh: "你的城市",
      ar: "مدينتك",
      he: "העיר שלך"
    }
  },
  numberFormatting: {
    thousand: {
      en: ",",
      es: ".",
      fr: " ",
      pt: ".",
      it: ".",
      de: ".",
      ja: ",",
      zh: ",",
      ar: "،",
      he: ","
    },
    decimal: {
      en: ".",
      es: ",",
      fr: ",",
      pt: ",",
      it: ",",
      de: ",",
      ja: ".",
      zh: ".",
      ar: "٫",
      he: "."
    }
  }
}
```

### Locale-Specific Number Formatting
```typescript
const formatNumber = (value: number, locale: string): string => {
  const formatters = {
    'en-US': new Intl.NumberFormat('en-US', { notation: 'compact' }),
    'es-ES': new Intl.NumberFormat('es-ES', { notation: 'compact' }),
    'fr-FR': new Intl.NumberFormat('fr-FR', { notation: 'compact' }),
    'pt-BR': new Intl.NumberFormat('pt-BR', { notation: 'compact' }),
    'it-IT': new Intl.NumberFormat('it-IT', { notation: 'compact' }),
    'de-DE': new Intl.NumberFormat('de-DE', { notation: 'compact' }),
    'ja-JP': new Intl.NumberFormat('ja-JP', { notation: 'compact' }),
    'zh-CN': new Intl.NumberFormat('zh-CN', { notation: 'compact' }),
    'ar-SA': new Intl.NumberFormat('ar-SA', { notation: 'compact' }),
    'he-IL': new Intl.NumberFormat('he-IL', { notation: 'compact' })
  };
  
  return formatters[locale]?.format(value) || value.toString();
};

// Examples:
// 3200 → "3.2K" (en-US)
// 3200 → "3,2 k" (fr-FR)
// 3200 → "3,2 mil" (es-ES)
// 3200 → "3.2千" (zh-CN)
```

## 4. Database Schema

### Current Real Platform Data (as of Sept 27, 2025):
```sql
-- ACTUAL DATABASE METRICS:
Users: 13 total (12 test users, 1 potential real)
Posts: 68 total (61 real content, 7 test posts)
Events: 0 (empty table)
Groups: 6 (all tango-related)
Friends: 4 connections
Sessions: 0 active (3 total ever)
Event Participants: 0
Life CEO Conversations: 0
Notifications: 0
Payments: 0
Media Assets: 0 in database (but 10 files in uploads/)
```

### Metrics Tables
```sql
performance_metrics (
  id SERIAL PRIMARY KEY,
  metric_name VARCHAR(100),
  metric_value NUMERIC,
  timestamp TIMESTAMP,
  category VARCHAR(50) -- 'system', 'application', 'business'
)

daily_activities (
  id SERIAL PRIMARY KEY,
  date DATE,
  total_users INTEGER,
  active_users INTEGER,
  new_posts INTEGER,
  cache_hit_rate NUMERIC -- Currently 0.0%
  memory_usage NUMERIC -- Currently 91.5%
)
```

## 4. User Permissions

### Access Control
- **Admin Only**: Full access to all metrics
- **Developer**: System metrics and performance data
- **Analytics Team**: Business metrics and user behavior
- **Public**: No access (admin-only page)

### Data Visibility
- Real user data is anonymized
- PII masked in streams
- Geographic data aggregated by region

## 5. RTL (Right-to-Left) Support

### Implementation for Arabic & Hebrew
```css
/* RTL Layout Adjustments */
[dir="rtl"] .stats-dashboard {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .metric-card {
  flex-direction: row-reverse;
}

[dir="rtl"] .metric-icon {
  margin-left: 1rem;
  margin-right: 0;
}

[dir="rtl"] .stats-grid {
  grid-auto-flow: dense;
  direction: rtl;
}
```

### Language Detection & Switching
```typescript
const GlobalStatisticsWidget: React.FC = () => {
  const [language, setLanguage] = useState(() => {
    // Auto-detect from user preferences
    return navigator.language || 'en-US';
  });
  
  const isRTL = ['ar', 'he'].includes(language.split('-')[0]);
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="stats-widget">
      <LanguageSelector 
        currentLanguage={language}
        onLanguageChange={setLanguage}
        availableLanguages={[
          'en-US', 'es-ES', 'fr-FR', 'pt-BR', 
          'it-IT', 'de-DE', 'ja-JP', 'zh-CN', 
          'ar-SA', 'he-IL'
        ]}
      />
      {/* Statistics content */}
    </div>
  );
};
```

## 6. MT Ocean Theme

### Design Implementation
```css
/* Live statistics gradient background */
.stats-dashboard {
  background: linear-gradient(180deg, #5EEAD4 0%, #14B8A6 20%, #0D9488 50%, #0F766E 80%, #155E75 100%);
}

/* Real-time metric cards */
.metric-card {
  background: rgba(94, 234, 212, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(94, 234, 212, 0.3);
}

/* Alert indicators for anomalies */
.anomaly-alert {
  border-left: 4px solid #ef4444;
  background: rgba(239, 68, 68, 0.1);
  animation: pulse 2s infinite;
}

/* 3D Globe styling */
.globe-container {
  background: radial-gradient(circle, #155E75 0%, #0D9488 100%);
  box-shadow: 0 0 50px rgba(94, 234, 212, 0.5);
}
```

## 6. Test Coverage

### Current Status
- **Unit Tests**: 0% (not implemented)
- **Integration Tests**: Manual testing only
- **Real-time Tests**: WebSocket connections verified
- **Load Tests**: Not performed

### Requirements
- Test anomaly detection accuracy
- Validate real-time data streaming
- Performance tests for high-frequency updates
- Memory leak detection (critical - currently at 91.5%)

## 7. Known Issues

### Current Platform Reality
- **Cache Hit Rate: 0%** - Nothing being cached (anomaly detected every 30s)
- **Memory Usage: 91.5%** - Dangerously high, near limit
- **No Events Data** - Events table empty despite UI
- **No Active Sessions** - 0 active user sessions
- **Life CEO AI Unused** - 0 conversations, 0 messages
- **Payments Not Active** - 0 Stripe customers, 0 transactions

### System Logs Show
```
⚠️ Anomaly detected: low_cache_hit_rate (severity: medium)
📊 Daily patterns: Average cache hit rate: 0.0%
📊 Daily patterns: Average memory usage: 91.5%
🔧 Low cache hit rate detected - warming cache...
📝 ESA Layer 14: No popular posts to warm
📅 ESA Layer 14: No upcoming events to warm
```

## 8. Agent Responsibilities

### ESA Framework Assignments
- **Layer 14 (Cache Optimization)**: Attempting cache warming (failing due to no data)
- **Layer 48 (Debugging Agent)**: Detecting anomalies every 30 seconds
- **Layer 51 (Performance Analytics)**: Monitoring memory and cache metrics
- **Layer 44 (Life CEO Core)**: Validation passing but no AI usage
- **Layer 52 (Documentation)**: Maintaining accurate metrics documentation

## 9. Cultural Adaptations

### Date & Time Formatting
```typescript
interface LocaleFormats {
  dateFormat: string;
  timeFormat: string;
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  dateTimeFormat: string;
}

const localeFormats: Record<string, LocaleFormats> = {
  'en-US': {
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    weekStartsOn: 0,
    dateTimeFormat: 'MM/DD/YYYY hh:mm A'
  },
  'es-ES': {
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    weekStartsOn: 1,
    dateTimeFormat: 'DD/MM/YYYY HH:mm'
  },
  'fr-FR': {
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    weekStartsOn: 1,
    dateTimeFormat: 'DD/MM/YYYY HH:mm'
  },
  'ja-JP': {
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: '24h',
    weekStartsOn: 0,
    dateTimeFormat: 'YYYY年MM月DD日 HH:mm'
  },
  'ar-SA': {
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    weekStartsOn: 6, // Saturday
    dateTimeFormat: 'DD/MM/YYYY hh:mm A'
  }
};
```

### Metric Display Preferences
```typescript
const metricPreferences = {
  'en-US': { distanceUnit: 'miles', temperatureUnit: 'F' },
  'es-ES': { distanceUnit: 'km', temperatureUnit: 'C' },
  'fr-FR': { distanceUnit: 'km', temperatureUnit: 'C' },
  'ja-JP': { distanceUnit: 'km', temperatureUnit: 'C' },
  'ar-SA': { distanceUnit: 'km', temperatureUnit: 'C' }
};
```

## 10. Integration Points

### External Services
- **PostgreSQL (Neon)**: Connected with 93 tables
- **Redis**: Configured but 0% cache hit rate
- **WebSocket**: Active connections for real-time
- **Prometheus**: Metrics collection configured
- **Stripe**: Integrated but 0 customers

### Internal Integrations
- **Storage Layer**: Fetching real data (13 users, 68 posts)
- **Auth System**: Running in dev mode with bypass
- **File Upload**: 10 real files uploaded but 0 in media_assets table

## 10. Performance Metrics

### Real Current Metrics
- **Cache Hit Rate**: 0.0% (critical issue)
- **Memory Usage**: 91.5% (near limit)
- **API Calls**: `getFeedPosts` working correctly
- **Database Queries**: Successful but uncached
- **WebSocket**: Connections active
- **Validation**: All 6 ESA categories passing

### Optimization Needs
- Fix cache configuration (currently not caching anything)
- Reduce memory usage (91.5% is too high)
- Populate events table (currently empty)
- Activate Life CEO AI features (completely unused)
- Enable payment processing (0 transactions)

## 11. Translation Management

### Dynamic Translation Loading
```typescript
const useTranslations = (language: string) => {
  const [translations, setTranslations] = useState({});
  
  useEffect(() => {
    // Lazy load translation files
    import(`./locales/${language}.json`)
      .then(module => setTranslations(module.default))
      .catch(() => {
        // Fallback to English
        import('./locales/en-US.json')
          .then(module => setTranslations(module.default));
      });
  }, [language]);
  
  return translations;
};
```

### Translation Key Structure
```json
{
  "statistics": {
    "global": {
      "title": "Global Statistics",
      "metrics": {
        "dancers": "Global Dancers",
        "events": "Active Events",
        "communities": "Communities",
        "city": "Your City"
      },
      "tooltips": {
        "dancers": "Total number of registered dancers worldwide",
        "events": "Events happening in the next 30 days",
        "communities": "Active tango communities globally",
        "city": "Dancers in your current location"
      },
      "actions": {
        "viewDetails": "View Details",
        "export": "Export Data",
        "refresh": "Refresh"
      }
    }
  }
}
```

## 12. Actual vs Documented Metrics

### Documentation Claims vs Reality
| Metric | Documentation Says | Reality |
|--------|-------------------|---------|
| Test Coverage | 83% | Unknown (likely <15%) |
| Cache Hit Rate | >60% target | 0.0% |
| Memory Usage | <70% optimal | 91.5% |
| Active Users | Hundreds expected | 0 active sessions |
| AI Usage | 16 agents active | 0 conversations |
| Events | Multiple daily | 0 events created |
| Payments | Stripe integrated | 0 customers |

### Platform Truth
- **Infrastructure**: ✅ Real and working
- **Database**: ✅ Connected with schema
- **APIs**: ✅ Functional
- **Demo Data**: ⚠️ Test users and posts
- **Production Features**: ❌ Mostly unused
- **Performance**: ❌ Critical issues