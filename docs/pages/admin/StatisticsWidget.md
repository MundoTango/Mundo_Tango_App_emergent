# Statistics Widget Documentation

## 1. Overview

The Statistics Widget is a compact, reusable component that displays key platform metrics in a visually appealing card-based layout. This widget serves as the primary interface for showing Global Statistics across various pages of the ESA LIFE CEO platform, providing at-a-glance insights into platform activity.

### Visual Design
Based on the provided interface mockup, the widget displays four primary metrics:
- **Global Dancers**: Total registered tango dancers (displays as "3.2K")
- **Active Events**: Currently active or upcoming events (displays as "945")
- **Communities**: Number of active tango communities (displays as "6.8K")
- **Your City**: Local dancers in user's location (displays as "184")

## 2. Component Architecture

### Technical Specifications
- **Component Type**: React Functional Component with TypeScript
- **State Management**: React Query for data fetching
- **Styling**: Tailwind CSS with MT Ocean theme
- **Internationalization**: ESA Layer 53 compliant
- **Responsiveness**: Mobile-first, adaptive layout
- **Update Frequency**: Real-time via WebSocket

### Component Structure
```typescript
interface StatisticsWidgetProps {
  variant?: 'compact' | 'expanded' | 'minimal';
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  refreshInterval?: number;
  showLabels?: boolean;
  animateNumbers?: boolean;
  onMetricClick?: (metric: string) => void;
}

interface MetricData {
  id: string;
  label: string;
  value: number;
  icon: React.ComponentType;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
}
```

## 3. Visual Implementation

### MT Ocean Theme Styling
```css
/* Widget Container */
.statistics-widget {
  background: linear-gradient(135deg, #5EEAD4 0%, #155E75 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Individual Metric Cards */
.metric-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(94, 234, 212, 0.3);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(94, 234, 212, 0.3);
  border-color: rgba(94, 234, 212, 0.6);
}

/* Metric Icons */
.metric-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #A855F7 0%, #9333EA 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

/* Metric Values */
.metric-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
  margin-top: 8px;
}

/* Metric Labels */
.metric-label {
  font-size: 0.875rem;
  color: #6B7280;
  margin-top: 4px;
  font-weight: 500;
}
```

## 4. Component Implementation

### Basic Widget Component
```tsx
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Users, Calendar, Globe, MapPin } from 'lucide-react';

const StatisticsWidget: React.FC<StatisticsWidgetProps> = ({
  variant = 'compact',
  theme = 'auto',
  language,
  refreshInterval = 30000,
  showLabels = true,
  animateNumbers = true,
  onMetricClick
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = language || i18n.language;

  // Fetch statistics data
  const { data, isLoading } = useQuery({
    queryKey: ['/api/statistics/widget'],
    refetchInterval: refreshInterval
  });

  // Format numbers based on locale
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat(currentLang, {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  };

  // Define metrics configuration
  const metrics: MetricData[] = useMemo(() => [
    {
      id: 'dancers',
      label: t('statistics.global.metrics.dancers'),
      value: data?.globalDancers || 0,
      icon: Users,
      color: 'purple'
    },
    {
      id: 'events',
      label: t('statistics.global.metrics.events'),
      value: data?.activeEvents || 0,
      icon: Calendar,
      color: 'purple'
    },
    {
      id: 'communities',
      label: t('statistics.global.metrics.communities'),
      value: data?.communities || 0,
      icon: Globe,
      color: 'purple'
    },
    {
      id: 'city',
      label: t('statistics.global.metrics.city'),
      value: data?.yourCity || 0,
      icon: MapPin,
      color: 'purple'
    }
  ], [data, t]);

  if (isLoading) {
    return <StatisticsWidgetSkeleton />;
  }

  return (
    <div className="statistics-widget">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            metric={metric}
            formatNumber={formatNumber}
            showLabel={showLabels}
            animate={animateNumbers}
            onClick={() => onMetricClick?.(metric.id)}
          />
        ))}
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  metric: MetricData;
  formatNumber: (n: number) => string;
  showLabel: boolean;
  animate: boolean;
  onClick: () => void;
}> = ({ metric, formatNumber, showLabel, animate, onClick }) => {
  const Icon = metric.icon;
  
  return (
    <div className="metric-card" onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className="metric-icon">
          <Icon size={24} />
        </div>
      </div>
      <div className={`metric-value ${animate ? 'animate-count-up' : ''}`}>
        {formatNumber(metric.value)}
      </div>
      {showLabel && (
        <div className="metric-label">{metric.label}</div>
      )}
    </div>
  );
};
```

## 5. Responsive Design

### Mobile Layout (< 768px)
```css
@media (max-width: 767px) {
  .statistics-widget {
    padding: 16px;
  }
  
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .metric-value {
    font-size: 1.5rem;
  }
  
  .metric-label {
    font-size: 0.75rem;
  }
}
```

### Tablet Layout (768px - 1024px)
```css
@media (min-width: 768px) and (max-width: 1023px) {
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}
```

### Desktop Layout (> 1024px)
```css
@media (min-width: 1024px) {
  .metric-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}
```

## 6. Variants

### Compact Variant (Default)
- Shows icon, value, and label
- Suitable for dashboards and sidebars
- Height: ~120px

### Expanded Variant
```tsx
const ExpandedVariant = () => (
  <div className="expanded-metric-card">
    <div className="metric-header">
      <Icon size={32} />
      <span className="metric-trend">+12.5%</span>
    </div>
    <div className="metric-value">{value}</div>
    <div className="metric-label">{label}</div>
    <div className="metric-chart">
      <MiniSparkline data={trendData} />
    </div>
    <div className="metric-footer">
      <span className="last-updated">Updated 2 min ago</span>
    </div>
  </div>
);
```

### Minimal Variant
```tsx
const MinimalVariant = () => (
  <div className="minimal-metric">
    <span className="value">{value}</span>
    <span className="label">{label}</span>
  </div>
);
```

## 7. Animation & Interactions

### Number Animation
```typescript
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{displayValue.toLocaleString()}</span>;
};
```

### Hover Effects
```css
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.metric-card:hover .metric-icon {
  animation: pulse 0.5s ease;
}
```

## 8. Data Integration

### API Endpoint
```typescript
// GET /api/statistics/widget
interface WidgetResponse {
  globalDancers: number;
  activeEvents: number;
  communities: number;
  yourCity: number;
  lastUpdated: string;
  trends: {
    dancers: TrendData;
    events: TrendData;
    communities: TrendData;
    city: TrendData;
  };
}
```

### WebSocket Updates
```typescript
const useRealtimeStatistics = () => {
  const [stats, setStats] = useState<WidgetResponse>();
  
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000/ws/statistics');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'statistics_update') {
        setStats(data.payload);
      }
    };
    
    return () => ws.close();
  }, []);
  
  return stats;
};
```

## 9. Accessibility Features

### ARIA Labels
```tsx
<div 
  role="region"
  aria-label="Platform Statistics"
  className="statistics-widget"
>
  <div 
    role="group"
    aria-label={`${metric.label}: ${metric.value}`}
    tabIndex={0}
    onKeyPress={(e) => e.key === 'Enter' && onClick()}
  >
    {/* Metric content */}
  </div>
</div>
```

### Keyboard Navigation
```typescript
const handleKeyboardNavigation = (e: KeyboardEvent) => {
  switch(e.key) {
    case 'ArrowRight':
      focusNextMetric();
      break;
    case 'ArrowLeft':
      focusPreviousMetric();
      break;
    case 'Enter':
    case ' ':
      selectCurrentMetric();
      break;
  }
};
```

## 10. Performance Optimization

### Memoization
```typescript
const MemoizedMetricCard = React.memo(MetricCard, (prev, next) => {
  return prev.metric.value === next.metric.value &&
         prev.metric.label === next.metric.label;
});
```

### Lazy Loading
```typescript
const StatisticsWidget = React.lazy(() => 
  import('./components/StatisticsWidget')
);

// Usage
<Suspense fallback={<StatisticsWidgetSkeleton />}>
  <StatisticsWidget />
</Suspense>
```

## 11. Testing

### Unit Tests
```typescript
describe('StatisticsWidget', () => {
  test('renders all four metrics', () => {
    render(<StatisticsWidget />);
    expect(screen.getByText('Global Dancers')).toBeInTheDocument();
    expect(screen.getByText('Active Events')).toBeInTheDocument();
    expect(screen.getByText('Communities')).toBeInTheDocument();
    expect(screen.getByText('Your City')).toBeInTheDocument();
  });

  test('formats numbers correctly', () => {
    const { container } = render(
      <StatisticsWidget language="en-US" />
    );
    expect(container.textContent).toContain('3.2K');
    expect(container.textContent).toContain('945');
  });

  test('supports RTL languages', () => {
    const { container } = render(
      <StatisticsWidget language="ar-SA" />
    );
    expect(container.firstChild).toHaveAttribute('dir', 'rtl');
  });
});
```

## 12. Usage Examples

### Basic Implementation
```tsx
// In dashboard page
<StatisticsWidget />

// With configuration
<StatisticsWidget
  variant="expanded"
  theme="dark"
  refreshInterval={10000}
  onMetricClick={(metric) => navigateToDetails(metric)}
/>

// In sidebar
<StatisticsWidget
  variant="minimal"
  showLabels={false}
/>
```

### Custom Styling
```tsx
<div className="custom-widget-wrapper">
  <h2 className="widget-title">Platform Overview</h2>
  <StatisticsWidget variant="compact" />
  <Link to="/stats" className="view-all-link">
    View Detailed Statistics →
  </Link>
</div>
```

## 13. Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Numbers not updating | WebSocket disconnected | Check WS connection |
| Wrong formatting | Incorrect locale | Verify language code |
| Layout broken | CSS conflicts | Check style isolation |
| Slow loading | Large data fetch | Implement pagination |
| Memory leak | Unmounted updates | Clean up subscriptions |

### Debug Mode
```typescript
const DEBUG_WIDGET = process.env.NODE_ENV === 'development';

if (DEBUG_WIDGET) {
  console.log('Statistics Widget Data:', {
    metrics,
    locale: currentLang,
    updateInterval: refreshInterval
  });
}
```

## 14. Related Documentation

- [Live Global Statistics](./LiveGlobalStatistics.md) - Full statistics dashboard
- [Global Statistics](./global-statistics.md) - Historical analytics
- [GlobalStatisticsI18n](./GlobalStatisticsI18n.md) - Internationalization guide
- [ESA Framework](../../ESA_LIFE_CEO_61x21_AGENTS_FRAMEWORK.md) - Platform architecture

## 15. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Sept 2025 | Initial implementation |
| 1.1.0 | Sept 2025 | Added ESA Layer 53 i18n support |
| 1.2.0 | Sept 2025 | Added real-time updates |
| Current | Sept 27, 2025 | Complete multilingual implementation |