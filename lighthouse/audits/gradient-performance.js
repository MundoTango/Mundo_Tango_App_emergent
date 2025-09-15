/**
 * Custom Lighthouse Audit for MT Ocean Theme Gradient Performance
 * Checks performance impact of gradient usage
 */

const Audit = require('lighthouse').Audit;

class GradientPerformanceAudit extends Audit {
  static get meta() {
    return {
      id: 'gradient-performance',
      title: 'Gradients are optimized for performance',
      failureTitle: 'Complex gradients may impact performance',
      description: 'Checks that CSS gradients are used efficiently without performance overhead',
      requiredArtifacts: ['CSSUsage', 'DevtoolsLog'],
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
    };
  }

  static async audit(artifacts, context) {
    const cssUsage = artifacts.CSSUsage;
    const issues = [];
    let score = 1;
    let gradientCount = 0;
    
    // Gradient patterns to check
    const gradientPatterns = [
      /linear-gradient/gi,
      /radial-gradient/gi,
      /conic-gradient/gi,
      /repeating-linear-gradient/gi,
      /repeating-radial-gradient/gi,
    ];
    
    cssUsage.stylesheets.forEach(sheet => {
      sheet.rules.forEach(rule => {
        if (!rule.style) return;
        
        gradientPatterns.forEach(pattern => {
          const matches = rule.style.match(pattern);
          if (matches) {
            gradientCount += matches.length;
            
            // Check for multiple gradients on same element
            if (matches.length > 2) {
              issues.push({
                selector: rule.selector,
                issue: `${matches.length} gradients on single element`,
                impact: 0.1,
                recommendation: 'Consider combining gradients or using an image'
              });
              score -= 0.1;
            }
            
            // Check for complex gradient stops
            const colorStops = rule.style.match(/rgba?\([^)]+\)|#[0-9a-f]{3,8}|[a-z]+/gi);
            if (colorStops && colorStops.length > 5) {
              issues.push({
                selector: rule.selector,
                issue: `Complex gradient with ${colorStops.length} color stops`,
                impact: 0.05,
                recommendation: 'Simplify gradient or use fewer color stops'
              });
              score -= 0.05;
            }
            
            // Check for gradients on large areas
            if (rule.selector.includes('body') || 
                rule.selector.includes('html') || 
                rule.selector.includes('.container')) {
              issues.push({
                selector: rule.selector,
                issue: 'Gradient on large viewport area',
                impact: 0.15,
                recommendation: 'Consider using solid colors for large areas'
              });
              score -= 0.15;
            }
            
            // Check for animated gradients
            if (rule.style.includes('animation') || 
                rule.style.includes('transition') && 
                rule.style.includes('background')) {
              issues.push({
                selector: rule.selector,
                issue: 'Animated gradient detected',
                impact: 0.2,
                recommendation: 'Avoid animating gradients, use transform instead'
              });
              score -= 0.2;
            }
          }
        });
      });
    });
    
    // Check for GPU acceleration hints
    const hasGPUHints = cssUsage.stylesheets.some(sheet =>
      sheet.rules.some(rule => 
        rule.style && 
        (rule.style.includes('transform: translateZ(0)') ||
         rule.style.includes('will-change: transform'))
      )
    );
    
    if (gradientCount > 10 && !hasGPUHints) {
      issues.push({
        selector: 'Global',
        issue: 'Many gradients without GPU acceleration hints',
        impact: 0.1,
        recommendation: 'Add transform: translateZ(0) for GPU acceleration'
      });
      score -= 0.1;
    }
    
    // Ensure score is between 0 and 1
    score = Math.max(0, Math.min(1, score));
    
    const details = Audit.makeTableDetails(
      [
        {key: 'selector', itemType: 'text', text: 'Selector'},
        {key: 'issue', itemType: 'text', text: 'Issue'},
        {key: 'impact', itemType: 'numeric', text: 'Impact'},
        {key: 'recommendation', itemType: 'text', text: 'Recommendation'},
      ],
      issues
    );
    
    return {
      score,
      numericValue: gradientCount,
      numericUnit: 'unitless',
      displayValue: `${gradientCount} gradients found`,
      details,
      metricSavings: {
        TBT: issues.reduce((sum, issue) => sum + (issue.impact * 50), 0),
      },
    };
  }
}

module.exports = GradientPerformanceAudit;