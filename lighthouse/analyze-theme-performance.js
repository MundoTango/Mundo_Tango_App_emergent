#!/usr/bin/env node
/**
 * MT Ocean Theme Performance Analyzer
 * Analyzes theme-specific performance metrics
 */

const fs = require('fs');
const path = require('path');

// MT Ocean theme specific metrics
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
  },
  colors: {
    oceanPalette: [
      '#0066CC', // Deep ocean blue
      '#0099FF', // Bright ocean
      '#00CCCC', // Turquoise
      '#66E0E0', // Light turquoise
      '#99F0F0', // Foam
      '#FFFFFF'  // White foam
    ]
  }
};

function analyzeReports() {
  const resultsDir = path.join(process.cwd(), 'lighthouse-results');
  const reports = [];
  
  if (!fs.existsSync(resultsDir)) {
    console.error('No lighthouse results found');
    return [];
  }
  
  const files = fs.readdirSync(resultsDir);
  files.forEach(file => {
    if (file.endsWith('.json')) {
      try {
        const report = JSON.parse(fs.readFileSync(path.join(resultsDir, file), 'utf8'));
        reports.push(report);
      } catch (e) {
        console.warn(`Could not parse ${file}:`, e.message);
      }
    }
  });
  
  return reports;
}

function analyzeThemePerformance(reports) {
  const analysis = {
    timestamp: new Date().toISOString(),
    summary: {
      reportsAnalyzed: reports.length,
      themeIssues: [],
      recommendations: [],
      score: 100
    },
    details: {
      glassmorphism: [],
      gradients: [],
      animations: [],
      oceanEffects: []
    }
  };
  
  reports.forEach(report => {
    const url = report.finalUrl || report.requestedUrl;
    
    // Analyze render-blocking resources
    if (report.audits['render-blocking-resources']) {
      const blocking = report.audits['render-blocking-resources'];
      if (blocking.details && blocking.details.items) {
        blocking.details.items.forEach(item => {
          if (item.url && item.url.includes('ocean') || item.url.includes('theme')) {
            analysis.details.oceanEffects.push({
              url,
              issue: 'Render-blocking theme resource',
              resource: item.url,
              impact: item.wastedMs || 0
            });
            analysis.summary.score -= 5;
          }
        });
      }
    }
    
    // Analyze unused CSS
    if (report.audits['unused-css-rules']) {
      const unusedCSS = report.audits['unused-css-rules'];
      if (unusedCSS.details && unusedCSS.details.items) {
        unusedCSS.details.items.forEach(item => {
          const wastedPercentage = (item.wastedBytes / item.totalBytes) * 100;
          if (wastedPercentage > 50) {
            analysis.details.gradients.push({
              url,
              issue: 'High unused CSS',
              file: item.url,
              wastedPercentage: wastedPercentage.toFixed(1),
              recommendation: 'Consider code-splitting CSS or removing unused styles'
            });
            analysis.summary.score -= 3;
          }
        });
      }
    }
    
    // Analyze main thread work
    if (report.audits['mainthread-work-breakdown']) {
      const mainThread = report.audits['mainthread-work-breakdown'];
      if (mainThread.details && mainThread.details.items) {
        const styleLayout = mainThread.details.items.find(item => 
          item.group === 'styleLayout'
        );
        if (styleLayout && styleLayout.duration > 500) {
          analysis.details.glassmorphism.push({
            url,
            issue: 'High style/layout cost',
            duration: styleLayout.duration.toFixed(0),
            recommendation: 'Optimize glassmorphic effects and complex gradients'
          });
          analysis.summary.score -= 10;
        }
      }
    }
    
    // Analyze long tasks
    if (report.audits['long-tasks']) {
      const longTasks = report.audits['long-tasks'];
      if (longTasks.details && longTasks.details.items) {
        longTasks.details.items.forEach(task => {
          if (task.duration > 100) {
            analysis.details.animations.push({
              url,
              issue: 'Long task detected',
              duration: task.duration.toFixed(0),
              startTime: task.startTime.toFixed(0),
              recommendation: 'Break up long-running animations or use requestAnimationFrame'
            });
            analysis.summary.score -= 2;
          }
        });
      }
    }
    
    // Check for GPU acceleration
    if (report.audits['uses-passive-event-listeners']) {
      const passive = report.audits['uses-passive-event-listeners'];
      if (passive.score < 1) {
        analysis.details.animations.push({
          url,
          issue: 'Non-passive event listeners',
          recommendation: 'Use passive event listeners for better scrolling performance'
        });
        analysis.summary.score -= 5;
      }
    }
    
    // Analyze images
    if (report.audits['uses-optimized-images']) {
      const images = report.audits['uses-optimized-images'];
      if (images.score < 0.9) {
        analysis.details.oceanEffects.push({
          url,
          issue: 'Unoptimized images',
          score: images.score,
          recommendation: 'Optimize ocean theme images and backgrounds'
        });
        analysis.summary.score -= 5;
      }
    }
  });
  
  // Generate recommendations
  if (analysis.details.glassmorphism.length > 0) {
    analysis.summary.recommendations.push(
      '🔮 Optimize glassmorphic effects: Use will-change, limit blur radius to 20px'
    );
    analysis.summary.themeIssues.push('Glassmorphism performance issues detected');
  }
  
  if (analysis.details.gradients.length > 0) {
    analysis.summary.recommendations.push(
      '🎨 Simplify gradients: Reduce color stops, avoid animating gradients'
    );
    analysis.summary.themeIssues.push('Complex gradient performance impact');
  }
  
  if (analysis.details.animations.length > 0) {
    analysis.summary.recommendations.push(
      '🎬 Optimize animations: Use transform/opacity only, add will-change'
    );
    analysis.summary.themeIssues.push('Animation performance needs improvement');
  }
  
  if (analysis.details.oceanEffects.length > 0) {
    analysis.summary.recommendations.push(
      '🌊 Optimize ocean effects: Use CSS containment, optimize wave animations'
    );
    analysis.summary.themeIssues.push('Ocean theme specific optimizations needed');
  }
  
  // Ensure score doesn't go below 0
  analysis.summary.score = Math.max(0, analysis.summary.score);
  
  return analysis;
}

function generateThemeReport(analysis) {
  console.log('\n🌊 MT Ocean Theme Performance Analysis\n');
  console.log('=' .repeat(60));
  
  console.log(`\n📊 Theme Performance Score: ${analysis.summary.score}/100`);
  
  if (analysis.summary.themeIssues.length > 0) {
    console.log('\n🔍 Issues Found:');
    analysis.summary.themeIssues.forEach(issue => {
      console.log(`  • ${issue}`);
    });
  }
  
  if (analysis.summary.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    analysis.summary.recommendations.forEach(rec => {
      console.log(`  ${rec}`);
    });
  }
  
  // Detailed breakdown
  console.log('\n📈 Detailed Analysis:');
  
  if (analysis.details.glassmorphism.length > 0) {
    console.log('\n  Glassmorphism Issues:');
    analysis.details.glassmorphism.forEach(item => {
      console.log(`    - ${item.url}: ${item.issue} (${item.duration}ms)`);
    });
  }
  
  if (analysis.details.gradients.length > 0) {
    console.log('\n  Gradient Issues:');
    analysis.details.gradients.forEach(item => {
      console.log(`    - ${item.url}: ${item.issue} (${item.wastedPercentage}% unused)`);
    });
  }
  
  if (analysis.details.animations.length > 0) {
    console.log('\n  Animation Issues:');
    analysis.details.animations.forEach(item => {
      console.log(`    - ${item.url}: ${item.issue} (${item.duration}ms)`);
    });
  }
  
  // Save analysis report
  const reportPath = path.join(process.cwd(), 'lighthouse-results', 'theme-analysis.json');
  fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
  
  console.log(`\n✅ Theme analysis saved to: ${reportPath}`);
  console.log('=' .repeat(60));
  
  return analysis;
}

// Main execution
function main() {
  console.log('🎨 Analyzing MT Ocean Theme Performance...\n');
  
  const reports = analyzeReports();
  if (reports.length === 0) {
    console.error('No reports to analyze');
    process.exit(1);
  }
  
  console.log(`Found ${reports.length} Lighthouse reports to analyze`);
  
  const analysis = analyzeThemePerformance(reports);
  generateThemeReport(analysis);
  
  // Exit with error if score is too low
  if (analysis.summary.score < 70) {
    console.error('\n❌ Theme performance score below acceptable threshold');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeThemePerformance, THEME_METRICS };