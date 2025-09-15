/**
 * Custom Lighthouse Audit for MT Ocean Theme Glassmorphism Performance
 * Checks performance impact of glassmorphic effects (backdrop-filter)
 */

const Audit = require('lighthouse').Audit;

class GlassmorphismPerformanceAudit extends Audit {
  static get meta() {
    return {
      id: 'glassmorphism-performance',
      title: 'Glassmorphic effects are optimized',
      failureTitle: 'Glassmorphic effects may impact performance',
      description: 'Checks that backdrop-filter and glassmorphic effects are used efficiently',
      requiredArtifacts: ['CSSUsage', 'DevtoolsLog'],
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
    };
  }

  static async audit(artifacts, context) {
    const cssUsage = artifacts.CSSUsage;
    const devtoolsLog = artifacts.DevtoolsLog;
    
    // Check for backdrop-filter usage
    const backdropFilterRules = cssUsage.stylesheets.flatMap(sheet => 
      sheet.rules.filter(rule => 
        rule.style && rule.style.includes('backdrop-filter')
      )
    );
    
    // Check for performance-heavy combinations
    const issues = [];
    let score = 1;
    
    backdropFilterRules.forEach(rule => {
      // Check for blur radius > 20px (performance impact)
      const blurMatch = rule.style.match(/blur\((\d+)px\)/);
      if (blurMatch && parseInt(blurMatch[1]) > 20) {
        issues.push({
          selector: rule.selector,
          issue: `High blur radius (${blurMatch[1]}px) may impact performance`,
          impact: 0.1
        });
        score -= 0.1;
      }
      
      // Check for multiple backdrop filters on same element
      const filterCount = (rule.style.match(/backdrop-filter/g) || []).length;
      if (filterCount > 1) {
        issues.push({
          selector: rule.selector,
          issue: 'Multiple backdrop-filters on same element',
          impact: 0.15
        });
        score -= 0.15;
      }
      
      // Check for backdrop-filter on frequently repainted elements
      if (rule.selector.includes(':hover') || rule.selector.includes(':active')) {
        issues.push({
          selector: rule.selector,
          issue: 'Backdrop-filter on interactive pseudo-classes',
          impact: 0.05
        });
        score -= 0.05;
      }
    });
    
    // Check for will-change optimization
    const willChangeOptimized = cssUsage.stylesheets.some(sheet =>
      sheet.rules.some(rule => 
        rule.style && 
        rule.style.includes('backdrop-filter') && 
        rule.style.includes('will-change')
      )
    );
    
    if (backdropFilterRules.length > 0 && !willChangeOptimized) {
      issues.push({
        selector: 'General',
        issue: 'Consider adding will-change: backdrop-filter for optimization',
        impact: 0.1
      });
      score -= 0.1;
    }
    
    // Ensure score is between 0 and 1
    score = Math.max(0, Math.min(1, score));
    
    const details = Audit.makeTableDetails(
      [
        {key: 'selector', itemType: 'text', text: 'Selector'},
        {key: 'issue', itemType: 'text', text: 'Issue'},
        {key: 'impact', itemType: 'numeric', text: 'Performance Impact'},
      ],
      issues
    );
    
    return {
      score,
      numericValue: backdropFilterRules.length,
      numericUnit: 'unitless',
      displayValue: `${backdropFilterRules.length} glassmorphic elements found`,
      details,
      metricSavings: {
        TBT: issues.reduce((sum, issue) => sum + (issue.impact * 100), 0),
      },
    };
  }
}

module.exports = GlassmorphismPerformanceAudit;