#!/usr/bin/env node
/**
 * Performance Regression Checker for Mundo Tango
 * Compares current performance metrics against baseline
 */

const fs = require('fs');
const path = require('path');

// ESA-48 Performance thresholds
const THRESHOLDS = {
  performance: 0.90,
  accessibility: 1.0,
  'best-practices': 0.95,
  seo: 0.95,
  pwa: 0.80,
  'largest-contentful-paint': 2500,
  'cumulative-layout-shift': 0.1,
  'total-blocking-time': 300,
  'first-contentful-paint': 1800,
  'interactive': 3800,
  'speed-index': 3400
};

function loadReports() {
  const resultsDir = path.join(process.cwd(), 'lighthouse-results');
  const reports = [];
  
  if (!fs.existsSync(resultsDir)) {
    console.error('No lighthouse results found');
    return [];
  }
  
  const files = fs.readdirSync(resultsDir);
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const report = JSON.parse(fs.readFileSync(path.join(resultsDir, file), 'utf8'));
      reports.push(report);
    }
  });
  
  return reports;
}

function checkRegressions(reports) {
  const regressions = [];
  
  reports.forEach(report => {
    const url = report.finalUrl || report.requestedUrl;
    
    // Check category scores
    Object.keys(report.categories).forEach(category => {
      const score = report.categories[category].score;
      const threshold = THRESHOLDS[category];
      
      if (threshold && score < threshold) {
        regressions.push({
          url,
          type: 'category',
          metric: category,
          value: score,
          threshold,
          severity: score < threshold * 0.9 ? 'high' : 'medium'
        });
      }
    });
    
    // Check Core Web Vitals
    const audits = report.audits;
    
    if (audits['largest-contentful-paint']) {
      const lcp = audits['largest-contentful-paint'].numericValue;
      if (lcp > THRESHOLDS['largest-contentful-paint']) {
        regressions.push({
          url,
          type: 'core-web-vital',
          metric: 'LCP',
          value: lcp,
          threshold: THRESHOLDS['largest-contentful-paint'],
          severity: 'high'
        });
      }
    }
    
    if (audits['cumulative-layout-shift']) {
      const cls = audits['cumulative-layout-shift'].numericValue;
      if (cls > THRESHOLDS['cumulative-layout-shift']) {
        regressions.push({
          url,
          type: 'core-web-vital',
          metric: 'CLS',
          value: cls,
          threshold: THRESHOLDS['cumulative-layout-shift'],
          severity: 'high'
        });
      }
    }
    
    if (audits['total-blocking-time']) {
      const tbt = audits['total-blocking-time'].numericValue;
      if (tbt > THRESHOLDS['total-blocking-time']) {
        regressions.push({
          url,
          type: 'core-web-vital',
          metric: 'TBT',
          value: tbt,
          threshold: THRESHOLDS['total-blocking-time'],
          severity: 'high'
        });
      }
    }
    
    // Check other performance metrics
    if (audits['interactive']) {
      const tti = audits['interactive'].numericValue;
      if (tti > THRESHOLDS['interactive']) {
        regressions.push({
          url,
          type: 'performance',
          metric: 'TTI',
          value: tti,
          threshold: THRESHOLDS['interactive'],
          severity: 'medium'
        });
      }
    }
    
    if (audits['speed-index']) {
      const si = audits['speed-index'].numericValue;
      if (si > THRESHOLDS['speed-index']) {
        regressions.push({
          url,
          type: 'performance',
          metric: 'Speed Index',
          value: si,
          threshold: THRESHOLDS['speed-index'],
          severity: 'medium'
        });
      }
    }
  });
  
  return regressions;
}

function generateReport(regressions) {
  if (regressions.length === 0) {
    console.log('✅ No performance regressions detected!');
    return true;
  }
  
  console.log('\n🚨 Performance Regressions Detected\n');
  console.log('=' .repeat(60));
  
  // Group by severity
  const highSeverity = regressions.filter(r => r.severity === 'high');
  const mediumSeverity = regressions.filter(r => r.severity === 'medium');
  
  if (highSeverity.length > 0) {
    console.log('\n❌ HIGH SEVERITY ISSUES:');
    highSeverity.forEach(r => {
      console.log(`  • ${r.url}`);
      console.log(`    ${r.metric}: ${formatValue(r.value, r.metric)} (threshold: ${formatValue(r.threshold, r.metric)})`);
    });
  }
  
  if (mediumSeverity.length > 0) {
    console.log('\n⚠️  MEDIUM SEVERITY ISSUES:');
    mediumSeverity.forEach(r => {
      console.log(`  • ${r.url}`);
      console.log(`    ${r.metric}: ${formatValue(r.value, r.metric)} (threshold: ${formatValue(r.threshold, r.metric)})`);
    });
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 Summary:');
  console.log(`  Total regressions: ${regressions.length}`);
  console.log(`  High severity: ${highSeverity.length}`);
  console.log(`  Medium severity: ${mediumSeverity.length}`);
  
  // Save regression report
  const reportPath = path.join(process.cwd(), 'lighthouse-results', 'regression-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    regressions,
    summary: {
      total: regressions.length,
      high: highSeverity.length,
      medium: mediumSeverity.length
    }
  }, null, 2));
  
  console.log(`\nDetailed report saved to: ${reportPath}`);
  
  return false;
}

function formatValue(value, metric) {
  if (metric.includes('score') || metric === 'performance' || 
      metric === 'accessibility' || metric === 'best-practices' || 
      metric === 'seo' || metric === 'pwa') {
    return `${(value * 100).toFixed(1)}%`;
  }
  if (metric === 'CLS') {
    return value.toFixed(3);
  }
  if (typeof value === 'number') {
    return `${value.toFixed(0)}ms`;
  }
  return value;
}

// Main execution
function main() {
  console.log('🔍 Checking for performance regressions...\n');
  
  const reports = loadReports();
  if (reports.length === 0) {
    console.error('No reports to analyze');
    process.exit(1);
  }
  
  console.log(`Found ${reports.length} Lighthouse reports to analyze`);
  
  const regressions = checkRegressions(reports);
  const success = generateReport(regressions);
  
  // Exit with error code if regressions found
  if (!success) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkRegressions, THRESHOLDS };