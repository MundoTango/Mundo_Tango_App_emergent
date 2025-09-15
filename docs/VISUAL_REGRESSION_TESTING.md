# Visual Regression Testing Documentation
## Mundo Tango Platform - Ocean Theme Visual Testing

### Overview
This document describes the comprehensive visual regression testing setup for the Mundo Tango platform, focusing on maintaining visual consistency of the Ocean theme across all pages and breakpoints.

### Technologies Used
- **Percy**: Cloud-based visual testing with AI-powered diff detection
- **BackstopJS**: Self-hosted visual regression testing with Puppeteer
- **Playwright**: Cross-browser testing framework
- **Lighthouse CI**: Performance and accessibility visual metrics
- **Axe-core**: Accessibility testing integration

---

## Quick Start Guide

### 1. Initial Setup
```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run test:install

# Set up Percy token (optional)
export PERCY_TOKEN=your_percy_token_here
```

### 2. Capture Baseline Images
```bash
# Capture baseline for both Percy and BackstopJS
npm run test:visual:baseline

# Clean old baselines and capture new ones
npm run test:visual:baseline:clean
```

### 3. Run Visual Tests
```bash
# Run all visual tests (BackstopJS + Percy)
npm run test:visual

# Run BackstopJS only
npm run test:visual:backstop

# Run Percy only
npm run test:visual:percy

# Run accessibility visual tests
npm run test:visual:a11y
```

### 4. Review and Approve Changes
```bash
# Approve BackstopJS changes
npm run test:visual:backstop:approve

# Percy changes are approved in the Percy dashboard
```

---

## Configuration Files

### Percy Configuration (.percy.yml)
- **Breakpoints**: 375px, 768px, 1280px, 1920px
- **Min Height**: 1024px
- **JavaScript**: Enabled for dynamic content
- **CSS Overrides**: Hides timestamps and animations
- **Ocean Theme**: Ensures proper color rendering

### BackstopJS Configuration (backstop.json)
- **Viewports**: Phone (375x812), Tablet (768x1024), Desktop (1280x800), Wide (1920x1080)
- **Scenarios**: 15+ test scenarios covering all critical pages
- **Threshold**: 0.1% mismatch tolerance
- **Engine**: Puppeteer with headless Chrome

### Lighthouse Configuration (lighthouserc.json)
- **Performance**: Minimum score 80%
- **Accessibility**: Minimum score 90%
- **Best Practices**: Minimum score 90%
- **SEO**: Minimum score 90%

---

## Test Coverage

### Pages Tested
1. **Homepage**
   - Light mode
   - Dark mode
   - Mobile menu interactions

2. **Authentication**
   - Registration form (empty, validation, filled)
   - Login page
   - Password reset flow

3. **Guest Onboarding**
   - Welcome step
   - Profile setup
   - Preferences selection

4. **Main Features**
   - Events (grid view, list view)
   - Profile page
   - Community page
   - Timeline

5. **Loading States**
   - Skeleton screens
   - Progressive loading
   - Error states

### Breakpoints Tested
- **Mobile**: 375px (iPhone 13 mini)
- **Tablet**: 768px (iPad portrait)
- **Desktop**: 1280px (Standard laptop)
- **Wide**: 1920px (Full HD desktop)

### Theme Variations
- Light mode (Ocean theme default)
- Dark mode (Ocean dark variant)
- High contrast mode (accessibility)

---

## CI/CD Integration

### GitHub Actions Workflow
The visual regression tests run automatically on:
- Push to main/develop branches
- Pull requests
- Manual workflow dispatch

### Workflow Features
1. **Matrix Testing**: Tests across Chrome, Firefox, and Safari
2. **Artifact Storage**: Stores visual diffs for 7 days
3. **PR Comments**: Automatically comments on PRs with visual changes
4. **Percy Integration**: Links to Percy dashboard for detailed review

### Running in CI
```yaml
# Triggered automatically on PR
name: Visual Regression Tests
on:
  pull_request:
    branches: [main, develop]
```

---

## Best Practices

### 1. Before Capturing Baselines
- Ensure all features are working correctly
- Clear browser cache and cookies
- Use production builds for consistency
- Disable browser extensions

### 2. Handling Dynamic Content
- Hide timestamps and relative dates
- Mock API responses for consistent data
- Disable animations and transitions
- Use fixed viewport sizes

### 3. Reviewing Changes
- Check each breakpoint separately
- Pay attention to:
  - Color consistency (Ocean theme)
  - Font rendering
  - Layout shifts
  - Interactive state changes
- Document intentional changes

### 4. Maintenance
- Update baselines after intentional design changes
- Clean up old baseline images monthly
- Review and update test scenarios quarterly
- Monitor test execution time

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Tests failing due to timing
**Solution**: Increase delay in scenario configuration
```javascript
{
  "delay": 2000, // Increase from 1000 to 2000
  "postInteractionWait": 1000
}
```

#### Issue: Font rendering differences
**Solution**: Wait for fonts to load
```javascript
await page.evaluateHandle('document.fonts.ready');
```

#### Issue: Ocean theme colors not rendering
**Solution**: Ensure CSS variables are injected
```css
:root {
  --ocean-primary: hsl(180, 71%, 39%);
  --ocean-secondary: hsl(214, 100%, 59%);
}
```

#### Issue: Percy snapshots not uploading
**Solution**: Check Percy token
```bash
export PERCY_TOKEN=your_token
echo $PERCY_TOKEN # Should show your token
```

---

## Ocean Theme Visual Standards

### Color Palette
```css
/* Light Mode */
--ocean-primary: hsl(180, 71%, 39%)     /* Teal */
--ocean-secondary: hsl(214, 100%, 59%)  /* Blue */
--ocean-accent: hsl(154, 69%, 48%)      /* Green */
--ocean-background: hsl(200, 100%, 97%) /* Light blue */

/* Dark Mode */
--ocean-dark: hsl(217, 32%, 17%)        /* Dark blue */
--ocean-dark-card: hsl(217, 28%, 22%)   /* Card background */
--ocean-dark-text: hsl(200, 100%, 97%)  /* Light text */
```

### Component Styling
- **Buttons**: Gradient backgrounds with ocean colors
- **Cards**: Subtle shadows with blue tints
- **Forms**: Ocean-themed focus states
- **Navigation**: Wave-inspired animations

### Accessibility Requirements
- WCAG AA compliance for color contrast
- Focus indicators visible in all themes
- Keyboard navigation support
- Screen reader compatibility

---

## Advanced Usage

### Custom Scenarios
Add new scenarios to `backstop.json`:
```json
{
  "label": "Custom Page",
  "url": "http://localhost:5000/custom",
  "selectors": [".custom-element"],
  "misMatchThreshold": 0.1
}
```

### Percy Custom Snapshots
Add to `percy-snapshots.spec.ts`:
```typescript
test('Custom snapshot', async ({ page }) => {
  await page.goto('/custom');
  await percySnapshot(page, 'Custom Page', {
    widths: [375, 768, 1280]
  });
});
```

### Excluding Elements
Hide dynamic elements during snapshots:
```javascript
hideSelectors: [
  ".timestamp",
  ".loading-spinner",
  ".live-data"
]
```

---

## Performance Optimization

### Test Execution Time
- Parallel execution: ~5 minutes
- Sequential execution: ~15 minutes
- Use `asyncCaptureLimit` to control parallelism

### Resource Usage
- Disk space: ~500MB for baselines
- Memory: 2GB recommended
- CPU: Multi-core for parallel execution

### Optimization Tips
1. Use smaller viewport heights for faster captures
2. Limit the number of breakpoints tested
3. Cache browser instances between tests
4. Use cloud services (Percy) for heavy lifting

---

## Reporting

### BackstopJS Reports
- HTML report: `backstop_data/html_report/index.html`
- CI report: `backstop_data/ci_report/xunit.xml`
- JSON report: `backstop_data/json_report/report.json`

### Percy Dashboard
- View at: https://percy.io/your-org/mundo-tango
- Features:
  - Side-by-side comparisons
  - Pixel-level diffs
  - Approval workflow
  - Slack/email notifications

### Lighthouse Reports
```bash
# Generate report
npm run test:lighthouse

# View report
npm run test:lighthouse:view
```

---

## Team Workflow

### For Developers
1. Run visual tests before committing
2. Review any visual changes
3. Update baselines if changes are intentional
4. Document visual changes in PR description

### For Designers
1. Review Percy dashboard for visual changes
2. Approve or request changes
3. Provide feedback on visual consistency
4. Update design system documentation

### For QA
1. Run comprehensive visual tests
2. Report visual bugs with screenshots
3. Verify fixes across all breakpoints
4. Maintain test scenarios

---

## Maintenance Schedule

### Daily
- Automated tests run on CI/CD

### Weekly
- Review and approve Percy changes
- Update baselines if needed

### Monthly
- Clean old baseline images
- Review test execution metrics
- Update test scenarios

### Quarterly
- Audit test coverage
- Update configuration
- Performance optimization

---

## Contact and Support

### Resources
- Percy Documentation: https://docs.percy.io
- BackstopJS: https://github.com/garris/BackstopJS
- Playwright: https://playwright.dev
- Internal Wiki: /docs/visual-testing

### Support Channels
- Slack: #visual-testing
- Email: qa-team@mundotango.life
- GitHub Issues: Label with `visual-regression`

---

## Appendix

### NPM Scripts Reference
```bash
# Visual Testing
npm run test:visual              # Run all visual tests
npm run test:visual:backstop     # Run BackstopJS tests
npm run test:visual:percy        # Run Percy tests
npm run test:visual:baseline     # Capture baselines
npm run test:visual:a11y         # Run accessibility tests

# Lighthouse
npm run test:lighthouse          # Run Lighthouse CI
npm run test:lighthouse:view     # View Lighthouse reports

# BackstopJS specific
npm run test:visual:backstop:reference  # Capture reference images
npm run test:visual:backstop:approve    # Approve changes
```

### Environment Variables
```bash
PERCY_TOKEN=abc123              # Percy project token
PERCY_BRANCH=main               # Branch name for Percy
BACKSTOP_TEST_URL=http://localhost:5000  # Test server URL
CI=true                         # Running in CI environment
```

---

*Last Updated: September 2025*
*Version: 1.0.0*
*Maintained by: Mundo Tango QA Team*