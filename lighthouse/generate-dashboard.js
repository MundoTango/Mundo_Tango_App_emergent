#!/usr/bin/env node
/**
 * Performance Dashboard Generator for Mundo Tango
 * Creates an interactive HTML dashboard from Lighthouse results
 */

const fs = require('fs');
const path = require('path');

function loadReports() {
  const resultsDir = path.join(process.cwd(), 'lighthouse-results');
  const reports = [];
  
  if (!fs.existsSync(resultsDir)) {
    console.error('No lighthouse results found');
    return [];
  }
  
  const files = fs.readdirSync(resultsDir);
  files.forEach(file => {
    if (file.endsWith('.json') && !file.includes('theme-analysis') && !file.includes('regression-report')) {
      try {
        const report = JSON.parse(fs.readFileSync(path.join(resultsDir, file), 'utf8'));
        reports.push({
          filename: file,
          timestamp: report.fetchTime || new Date().toISOString(),
          url: report.finalUrl || report.requestedUrl,
          categories: report.categories,
          audits: report.audits
        });
      } catch (e) {
        console.warn(`Could not parse ${file}:`, e.message);
      }
    }
  });
  
  return reports;
}

function generateDashboardHTML(reports, themeAnalysis, regressionReport) {
  const timestamp = new Date().toISOString();
  const avgScores = calculateAverageScores(reports);
  const coreWebVitals = extractCoreWebVitals(reports);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mundo Tango Performance Dashboard</title>
  <style>
    :root {
      --ocean-deep: #0066CC;
      --ocean-bright: #0099FF;
      --ocean-turquoise: #00CCCC;
      --ocean-light: #66E0E0;
      --ocean-foam: #99F0F0;
      --success: #10B981;
      --warning: #F59E0B;
      --error: #EF4444;
      --bg-dark: #0F172A;
      --bg-light: #F8FAFC;
      --text-dark: #1E293B;
      --text-light: #64748B;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-bright) 50%, var(--ocean-turquoise) 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 1rem;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    
    .header h1 {
      color: var(--ocean-deep);
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, var(--ocean-deep), var(--ocean-bright));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .header p {
      color: var(--text-light);
      font-size: 1.1rem;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .metric-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }
    
    .metric-card:hover {
      transform: translateY(-5px);
    }
    
    .metric-title {
      color: var(--text-light);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    
    .metric-value {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .metric-target {
      color: var(--text-light);
      font-size: 0.875rem;
    }
    
    .score-excellent { color: var(--success); }
    .score-good { color: var(--ocean-bright); }
    .score-warning { color: var(--warning); }
    .score-poor { color: var(--error); }
    
    .chart-container {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 1rem;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    
    .chart-title {
      color: var(--text-dark);
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
    }
    
    .progress-bar {
      width: 100%;
      height: 30px;
      background: var(--bg-light);
      border-radius: 15px;
      overflow: hidden;
      margin-bottom: 1rem;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--ocean-deep), var(--ocean-bright));
      border-radius: 15px;
      transition: width 1s ease;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 10px;
      color: white;
      font-weight: bold;
    }
    
    .pages-list {
      display: grid;
      gap: 1rem;
    }
    
    .page-item {
      background: var(--bg-light);
      padding: 1rem;
      border-radius: 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .page-url {
      color: var(--text-dark);
      font-weight: 500;
    }
    
    .page-scores {
      display: flex;
      gap: 1rem;
    }
    
    .score-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: bold;
    }
    
    .wave-animation {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100px;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23ffffff" fill-opacity="0.3" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,106.7C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') repeat-x;
      animation: wave 10s linear infinite;
      z-index: -1;
    }
    
    @keyframes wave {
      0% { background-position-x: 0; }
      100% { background-position-x: 1440px; }
    }
    
    .timestamp {
      text-align: center;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 2rem;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="wave-animation"></div>
  <div class="container">
    <div class="header">
      <h1>🌊 Mundo Tango Performance Dashboard</h1>
      <p>ESA-48 Performance Monitoring Agent | Real-time performance metrics</p>
    </div>
    
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-title">Performance Score</div>
        <div class="metric-value ${getScoreClass(avgScores.performance)}">${Math.round(avgScores.performance * 100)}%</div>
        <div class="metric-target">Target: >90%</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">Accessibility</div>
        <div class="metric-value ${getScoreClass(avgScores.accessibility)}">${Math.round(avgScores.accessibility * 100)}%</div>
        <div class="metric-target">Target: 100%</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">SEO Score</div>
        <div class="metric-value ${getScoreClass(avgScores.seo)}">${Math.round(avgScores.seo * 100)}%</div>
        <div class="metric-target">Target: >95%</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">PWA Score</div>
        <div class="metric-value ${getScoreClass(avgScores.pwa)}">${Math.round(avgScores.pwa * 100)}%</div>
        <div class="metric-target">Target: >80%</div>
      </div>
    </div>
    
    <div class="chart-container">
      <h2 class="chart-title">🎯 Core Web Vitals</h2>
      
      <div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span>Largest Contentful Paint (LCP)</span>
          <span>${coreWebVitals.lcp.toFixed(0)}ms / 2500ms</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.min((coreWebVitals.lcp / 2500) * 100, 100)}%">
            ${((coreWebVitals.lcp / 2500) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
      
      <div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span>Cumulative Layout Shift (CLS)</span>
          <span>${coreWebVitals.cls.toFixed(3)} / 0.1</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.min((coreWebVitals.cls / 0.1) * 100, 100)}%">
            ${((coreWebVitals.cls / 0.1) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
      
      <div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span>Total Blocking Time (TBT)</span>
          <span>${coreWebVitals.tbt.toFixed(0)}ms / 300ms</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.min((coreWebVitals.tbt / 300) * 100, 100)}%">
            ${((coreWebVitals.tbt / 300) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
    
    <div class="chart-container">
      <h2 class="chart-title">📊 Page Performance Summary</h2>
      <div class="pages-list">
        ${reports.slice(0, 10).map(report => `
          <div class="page-item">
            <div class="page-url">${report.url.replace('http://localhost:5000', '')}</div>
            <div class="page-scores">
              <span class="score-badge ${getScoreClass(report.categories.performance.score)}">
                P: ${Math.round(report.categories.performance.score * 100)}
              </span>
              <span class="score-badge ${getScoreClass(report.categories.accessibility.score)}">
                A: ${Math.round(report.categories.accessibility.score * 100)}
              </span>
              <span class="score-badge ${getScoreClass(report.categories.seo.score)}">
                S: ${Math.round(report.categories.seo.score * 100)}
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    
    ${themeAnalysis ? `
    <div class="chart-container">
      <h2 class="chart-title">🎨 MT Ocean Theme Performance</h2>
      <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
        <span>Theme Score: ${themeAnalysis.summary.score}/100</span>
      </div>
      ${themeAnalysis.summary.recommendations.map(rec => `
        <div class="page-item" style="margin-bottom: 0.5rem;">
          <div>${rec}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    <p class="timestamp">Generated: ${new Date(timestamp).toLocaleString()}</p>
  </div>
  
  <script>
    // Auto-refresh every 30 seconds
    setTimeout(() => location.reload(), 30000);
  </script>
</body>
</html>`;
}

function getScoreClass(score) {
  if (score >= 0.9) return 'score-excellent';
  if (score >= 0.75) return 'score-good';
  if (score >= 0.5) return 'score-warning';
  return 'score-poor';
}

function calculateAverageScores(reports) {
  const scores = {
    performance: 0,
    accessibility: 0,
    'best-practices': 0,
    seo: 0,
    pwa: 0
  };
  
  reports.forEach(report => {
    Object.keys(scores).forEach(key => {
      if (report.categories[key]) {
        scores[key] += report.categories[key].score;
      }
    });
  });
  
  Object.keys(scores).forEach(key => {
    scores[key] = scores[key] / reports.length;
  });
  
  return scores;
}

function extractCoreWebVitals(reports) {
  let lcp = 0, cls = 0, tbt = 0;
  let count = 0;
  
  reports.forEach(report => {
    if (report.audits['largest-contentful-paint']) {
      lcp += report.audits['largest-contentful-paint'].numericValue;
      count++;
    }
    if (report.audits['cumulative-layout-shift']) {
      cls += report.audits['cumulative-layout-shift'].numericValue;
    }
    if (report.audits['total-blocking-time']) {
      tbt += report.audits['total-blocking-time'].numericValue;
    }
  });
  
  return {
    lcp: count > 0 ? lcp / count : 0,
    cls: count > 0 ? cls / count : 0,
    tbt: count > 0 ? tbt / count : 0
  };
}

function main() {
  console.log('📊 Generating Performance Dashboard...\n');
  
  const reports = loadReports();
  if (reports.length === 0) {
    console.error('No reports to generate dashboard');
    process.exit(1);
  }
  
  // Load theme analysis if available
  let themeAnalysis = null;
  const themeAnalysisPath = path.join(process.cwd(), 'lighthouse-results', 'theme-analysis.json');
  if (fs.existsSync(themeAnalysisPath)) {
    themeAnalysis = JSON.parse(fs.readFileSync(themeAnalysisPath, 'utf8'));
  }
  
  // Load regression report if available
  let regressionReport = null;
  const regressionPath = path.join(process.cwd(), 'lighthouse-results', 'regression-report.json');
  if (fs.existsSync(regressionPath)) {
    regressionReport = JSON.parse(fs.readFileSync(regressionPath, 'utf8'));
  }
  
  // Generate HTML
  const html = generateDashboardHTML(reports, themeAnalysis, regressionReport);
  
  // Create dashboard directory
  const dashboardDir = path.join(process.cwd(), 'lighthouse-results', 'dashboard');
  if (!fs.existsSync(dashboardDir)) {
    fs.mkdirSync(dashboardDir, { recursive: true });
  }
  
  // Write dashboard HTML
  const dashboardPath = path.join(dashboardDir, 'index.html');
  fs.writeFileSync(dashboardPath, html);
  
  console.log(`✅ Dashboard generated: ${dashboardPath}`);
  console.log(`🌐 Open in browser: file://${dashboardPath}`);
}

if (require.main === module) {
  main();
}

module.exports = { generateDashboardHTML };