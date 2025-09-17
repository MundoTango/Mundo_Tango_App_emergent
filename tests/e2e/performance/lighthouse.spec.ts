import { test, expect } from '@playwright/test';
import { lighthouseEnhanced } from '../../performance/lighthouse-enhanced';

const CRITICAL_PAGES = [
  '/',
  '/profile',
  '/events',
  '/messages',
  '/community'
];

test.describe('ESA Layer 48 - Lighthouse Performance Audits', () => {
  CRITICAL_PAGES.forEach(page => {
    test(`Performance audit: ${page}`, async () => {
      const report = await lighthouseEnhanced.runAudit(`http://localhost:5000${page}`);
      
      // Assert Core Web Vitals
      expect(report.metrics.largestContentfulPaint).toBeLessThan(2500);
      expect(report.metrics.firstInputDelay).toBeLessThan(100);
      expect(report.metrics.cumulativeLayoutShift).toBeLessThan(0.1);
      
      // Assert ESA Layer compliance
      expect(report.esaLayerCompliance.layer48).toBe(true);
    });
  });
  
  test.afterAll(async () => {
    await lighthouseEnhanced.generateDashboard();
    console.log('📊 Performance dashboard generated at tests/performance-reports/dashboard.html');
  });
});