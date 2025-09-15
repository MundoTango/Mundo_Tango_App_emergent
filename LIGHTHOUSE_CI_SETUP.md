# 🔦 Lighthouse CI Performance Monitoring Setup
## ESA-48 Performance Monitoring Agent Configuration

## Overview
This document provides comprehensive documentation for the Lighthouse CI performance monitoring setup for Mundo Tango, configured according to ESA-48 specifications as part of the ESA LIFE CEO 61×21 framework.

## Table of Contents
1. [Configuration Overview](#configuration-overview)
2. [Performance Targets](#performance-targets)
3. [Local Development](#local-development)
4. [CI/CD Integration](#cicd-integration)
5. [MT Ocean Theme Monitoring](#mt-ocean-theme-monitoring)
6. [Performance Dashboard](#performance-dashboard)
7. [Troubleshooting](#troubleshooting)

## Configuration Overview

### Main Configuration File
- **File**: `lighthouserc.js`
- **Purpose**: Defines all Lighthouse CI settings, test URLs, and performance assertions

### Performance Budgets
- **File**: `lighthouse/budgets.json`
- **Purpose**: Sets resource and timing budgets for different page types

### Custom Audits
- **Directory**: `lighthouse/audits/`
- **Files**:
  - `glassmorphism-performance.js` - Monitors backdrop-filter performance
  - `gradient-performance.js` - Tracks gradient complexity
  - `animation-performance.js` - Ensures 60fps animations

## Performance Targets

### Core Web Vitals (ESA-48 Requirements)
| Metric | Target | Severity |
|--------|--------|----------|
| Largest Contentful Paint (LCP) | < 2500ms | Error |
| First Input Delay (FID) | < 100ms | Error |
| Cumulative Layout Shift (CLS) | < 0.1 | Error |
| Total Blocking Time (TBT) | < 300ms | Warning |

### Lighthouse Scores
| Category | Target Score | Requirement |
|----------|-------------|-------------|
| Performance | > 90% | Mandatory |
| Accessibility | 100% | Mandatory |
| Best Practices | > 95% | Mandatory |
| SEO | > 95% | Mandatory |
| PWA | > 80% | Recommended |

### Resource Budgets
| Resource Type | Budget | Pages Affected |
|--------------|--------|----------------|
| JavaScript | 200KB | All pages |
| CSS | 50KB | All pages |
| Images | 500KB | General pages |
| Images | 800KB | Events page |
| Fonts | 100KB | All pages |
| Third-party | 150KB | All pages |
| Total Page Weight | 1MB | All pages |

## Local Development

### Running Lighthouse Tests Locally

```bash
# Install Lighthouse CI globally (one-time setup)
npm install -g @lhci/cli

# Run Lighthouse tests with existing configuration
npm run test:lighthouse

# Run specific page test
lhci collect --url="http://localhost:5000/profile"

# View results in browser
npm run test:lighthouse:view
```

### Available NPM Scripts

```json
{
  "test:lighthouse": "lhci autorun --config=lighthouserc.js",
  "test:lighthouse:view": "lhci open",
  "test:lighthouse:mobile": "lhci autorun --config=lighthouserc.js --collect.settings.preset=mobile",
  "test:lighthouse:desktop": "lhci autorun --config=lighthouserc.js --collect.settings.preset=desktop"
}
```

### Analyzing Results

1. **Check Performance Regression**:
   ```bash
   node scripts/check-performance-regression.js
   ```

2. **Analyze MT Ocean Theme Performance**:
   ```bash
   node lighthouse/analyze-theme-performance.js
   ```

3. **Generate Performance Dashboard**:
   ```bash
   node lighthouse/generate-dashboard.js
   ```

## CI/CD Integration

### GitHub Actions Workflow
- **File**: `.github/workflows/lighthouse-ci.yml`
- **Triggers**:
  - Push to main/develop branches
  - Pull requests to main
  - Daily scheduled run at 2 AM UTC
  - Manual workflow dispatch

### Workflow Jobs

1. **lighthouse-desktop**: Tests desktop performance
2. **lighthouse-mobile**: Tests mobile performance
3. **mt-ocean-theme-performance**: Analyzes theme-specific metrics
4. **performance-alerts**: Sends alerts on regression

### Setting Up Secrets

Add these secrets to your GitHub repository:

```
LHCI_GITHUB_APP_TOKEN    # GitHub App token for status updates
LHCI_SERVER_URL          # Lighthouse CI Server URL
LHCI_TOKEN               # Authentication token for LHCI server
SLACK_WEBHOOK_URL        # Slack webhook for notifications
```

### Pull Request Comments

The workflow automatically comments on PRs with:
- Average performance scores
- Core Web Vitals metrics
- Pass/fail status for each target
- Link to full reports

## MT Ocean Theme Monitoring

### Glassmorphism Performance
Monitors backdrop-filter usage and performance impact:
- Maximum blur radius: 20px
- Checks for will-change optimization
- Detects multiple backdrop-filters on same element

### Gradient Performance
Tracks gradient complexity:
- Maximum gradients per page: 15
- Maximum color stops: 5
- Warns against animated gradients
- Checks for GPU acceleration hints

### Animation Performance
Ensures smooth 60fps animations:
- Prefers transform/opacity animations
- Warns against animating layout properties
- Maximum animation duration: 1s
- Checks for infinite animations

### Theme-Specific Metrics

```javascript
const THEME_METRICS = {
  glassmorphism: {
    maxBlurRadius: 20,
    maxElements: 10,
    willChangeRequired: true
  },
  gradients: {
    maxPerPage: 15,
    maxColorStops: 5,
    avoidAnimated: true
  },
  animations: {
    maxDuration: 1000,
    preferComposite: true,
    avoidLayoutTriggers: true
  }
};
```

## Performance Dashboard

### Accessing the Dashboard

1. **Local Development**:
   ```bash
   # Generate dashboard
   node lighthouse/generate-dashboard.js
   
   # Open in browser
   open lighthouse-results/dashboard/index.html
   ```

2. **Production (GitHub Pages)**:
   ```
   https://[your-username].github.io/[repo-name]/performance
   ```

### Dashboard Features

- **Real-time Metrics**: Auto-refreshes every 30 seconds
- **Core Web Vitals**: Visual progress bars for LCP, CLS, TBT
- **Page-by-Page Analysis**: Individual scores for each tested page
- **MT Ocean Theme Score**: Theme-specific performance rating
- **Trend Analysis**: Historical performance data

### Dashboard Sections

1. **Performance Overview**
   - Average scores across all categories
   - Target achievement status

2. **Core Web Vitals**
   - Current values vs targets
   - Visual progress indicators

3. **Page Performance Summary**
   - Individual page scores
   - Performance (P), Accessibility (A), SEO (S) badges

4. **MT Ocean Theme Performance**
   - Theme-specific score (0-100)
   - Recommendations for optimization

## Performance Regression Alerts

### Alert Channels

1. **GitHub Issues**: Automatically created on regression
2. **Slack Notifications**: Real-time alerts to team channel
3. **PR Comments**: Detailed reports on pull requests
4. **Email**: Via GitHub Actions notifications

### Alert Thresholds

| Metric | Warning | Error |
|--------|---------|-------|
| Performance Score | < 85% | < 80% |
| LCP | > 2800ms | > 3000ms |
| CLS | > 0.15 | > 0.25 |
| TBT | > 400ms | > 600ms |

### Handling Regressions

1. **Immediate Actions**:
   - Review the regression report
   - Check recent commits for performance impact
   - Run local Lighthouse tests

2. **Investigation**:
   ```bash
   # Check specific page performance
   lhci collect --url="[problematic-url]"
   
   # Analyze bundle sizes
   npm run build --report
   
   # Profile runtime performance
   node --inspect npm run dev
   ```

3. **Common Fixes**:
   - Optimize images (use WebP, lazy loading)
   - Code split large bundles
   - Remove unused CSS/JS
   - Optimize glassmorphic effects
   - Simplify gradients and animations

## Troubleshooting

### Common Issues

1. **Lighthouse CI fails with timeout**:
   ```bash
   # Increase timeout in lighthouserc.js
   collect: {
     settings: {
       maxWaitForLoad: 60000  // 60 seconds
     }
   }
   ```

2. **Custom audits not running**:
   ```bash
   # Verify audit files exist
   ls -la lighthouse/audits/
   
   # Check for syntax errors
   node lighthouse/audits/glassmorphism-performance.js
   ```

3. **Dashboard not generating**:
   ```bash
   # Ensure results directory exists
   mkdir -p lighthouse-results
   
   # Run tests first
   npm run test:lighthouse
   
   # Then generate dashboard
   node lighthouse/generate-dashboard.js
   ```

4. **GitHub Actions workflow fails**:
   - Check secrets are properly configured
   - Verify PostgreSQL setup for test database
   - Ensure build completes successfully
   - Check server starts on port 5000

### Debug Commands

```bash
# Verbose Lighthouse output
lhci collect --verbose

# Test specific viewport
lhci collect --settings.preset=mobile

# Skip certain audits
lhci collect --settings.skipAudits=offline

# Generate trace for debugging
lhci collect --settings.extraHeaders='{"x-debug": "true"}'
```

## Best Practices

### Optimization Tips

1. **Images**:
   - Use next-gen formats (WebP, AVIF)
   - Implement lazy loading
   - Serve responsive images
   - Optimize with `sharp` or `imagemin`

2. **JavaScript**:
   - Code split by route
   - Tree shake unused code
   - Minify and compress
   - Use dynamic imports

3. **CSS**:
   - Remove unused styles
   - Inline critical CSS
   - Optimize for MT Ocean theme
   - Use CSS containment

4. **MT Ocean Theme**:
   - Limit glassmorphism to key elements
   - Use simple gradients (< 5 color stops)
   - Animate with transform/opacity only
   - Add will-change for heavy effects

### Monitoring Checklist

- [ ] Run Lighthouse tests before major releases
- [ ] Review performance dashboard weekly
- [ ] Address regressions within 24 hours
- [ ] Update budgets as application grows
- [ ] Monitor MT Ocean theme performance monthly
- [ ] Review and optimize slowest pages quarterly

## Additional Resources

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Performance Budget Calculator](https://perf-budget-calculator.firebaseapp.com/)
- [Chrome DevTools Performance](https://developers.google.com/web/tools/chrome-devtools/evaluate-performance)

## Support

For issues or questions about the Lighthouse CI setup:
1. Check this documentation
2. Review the [troubleshooting section](#troubleshooting)
3. Check GitHub Issues for similar problems
4. Contact the performance team

---

*Last Updated: September 2025*
*ESA-48 Performance Monitoring Agent v1.0*
*Part of ESA LIFE CEO 61×21 Framework*