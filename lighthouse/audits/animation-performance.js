/**
 * Custom Lighthouse Audit for MT Ocean Theme Animation Performance
 * Checks performance impact of CSS animations and transitions
 */

const Audit = require('lighthouse').Audit;

class AnimationPerformanceAudit extends Audit {
  static get meta() {
    return {
      id: 'animation-performance',
      title: 'Animations are optimized for 60fps',
      failureTitle: 'Animations may cause jank or performance issues',
      description: 'Checks that CSS animations and transitions use GPU-accelerated properties',
      requiredArtifacts: ['CSSUsage', 'DevtoolsLog', 'traces'],
      scoreDisplayMode: Audit.SCORING_MODES.NUMERIC,
    };
  }

  static async audit(artifacts, context) {
    const cssUsage = artifacts.CSSUsage;
    const trace = artifacts.traces.defaultPass;
    const issues = [];
    let score = 1;
    let animationCount = 0;
    
    // Properties that trigger layout (expensive)
    const layoutProperties = [
      'width', 'height', 'padding', 'margin', 'border',
      'top', 'left', 'right', 'bottom', 'position',
      'display', 'float', 'clear', 'font-size', 'line-height'
    ];
    
    // Properties that trigger paint (moderate cost)
    const paintProperties = [
      'color', 'background', 'border-color', 'border-style',
      'outline', 'box-shadow', 'text-shadow', 'visibility'
    ];
    
    // GPU-accelerated properties (cheap)
    const compositeProperties = [
      'transform', 'opacity', 'filter', 'backdrop-filter'
    ];
    
    cssUsage.stylesheets.forEach(sheet => {
      sheet.rules.forEach(rule => {
        if (!rule.style) return;
        
        // Check for animations
        if (rule.style.includes('animation') || rule.style.includes('transition')) {
          animationCount++;
          
          // Check animated properties
          layoutProperties.forEach(prop => {
            if (rule.style.includes(`transition: ${prop}`) || 
                rule.style.includes(`transition-property: ${prop}`) ||
                rule.style.includes(`animation-name`) && rule.style.includes(prop)) {
              issues.push({
                selector: rule.selector,
                issue: `Animating layout property: ${prop}`,
                impact: 0.2,
                recommendation: 'Use transform instead of position properties',
                severity: 'high'
              });
              score -= 0.2;
            }
          });
          
          paintProperties.forEach(prop => {
            if (rule.style.includes(`transition: ${prop}`) || 
                rule.style.includes(`transition-property: ${prop}`)) {
              issues.push({
                selector: rule.selector,
                issue: `Animating paint property: ${prop}`,
                impact: 0.1,
                recommendation: 'Consider using opacity or transform for better performance',
                severity: 'medium'
              });
              score -= 0.1;
            }
          });
          
          // Check for long animations
          const durationMatch = rule.style.match(/(\d+\.?\d*)s/);
          if (durationMatch && parseFloat(durationMatch[1]) > 1) {
            issues.push({
              selector: rule.selector,
              issue: `Long animation duration: ${durationMatch[1]}s`,
              impact: 0.05,
              recommendation: 'Keep animations under 1 second for better UX',
              severity: 'low'
            });
            score -= 0.05;
          }
          
          // Check for missing will-change
          const hasWillChange = rule.style.includes('will-change');
          const hasTransform = rule.style.includes('transform');
          if (hasTransform && !hasWillChange) {
            issues.push({
              selector: rule.selector,
              issue: 'Transform animation without will-change',
              impact: 0.05,
              recommendation: 'Add will-change: transform for optimization',
              severity: 'low'
            });
            score -= 0.05;
          }
          
          // Check for infinite animations
          if (rule.style.includes('infinite')) {
            issues.push({
              selector: rule.selector,
              issue: 'Infinite animation detected',
              impact: 0.15,
              recommendation: 'Limit animation iterations or use CSS containment',
              severity: 'high'
            });
            score -= 0.15;
          }
        }
        
        // Check for hover effects on mobile
        if (rule.selector.includes(':hover')) {
          const hasTransition = rule.style.includes('transition');
          if (hasTransition) {
            issues.push({
              selector: rule.selector,
              issue: 'Hover transition may not work on mobile',
              impact: 0.02,
              recommendation: 'Provide alternative mobile interactions',
              severity: 'low'
            });
            score -= 0.02;
          }
        }
      });
    });
    
    // Check for requestAnimationFrame usage
    const hasRAF = trace && trace.traceEvents.some(event => 
      event.name === 'RequestAnimationFrame'
    );
    
    if (animationCount > 5 && !hasRAF) {
      issues.push({
        selector: 'JavaScript',
        issue: 'Many CSS animations without JS optimization',
        impact: 0.1,
        recommendation: 'Consider using requestAnimationFrame for complex animations',
        severity: 'medium'
      });
      score -= 0.1;
    }
    
    // MT Ocean specific checks
    const hasOceanAnimations = cssUsage.stylesheets.some(sheet =>
      sheet.rules.some(rule => 
        rule.selector && (
          rule.selector.includes('wave') ||
          rule.selector.includes('ripple') ||
          rule.selector.includes('bubble') ||
          rule.selector.includes('float')
        )
      )
    );
    
    if (hasOceanAnimations) {
      issues.push({
        selector: 'MT Ocean Theme',
        issue: 'Ocean theme animations detected',
        impact: 0,
        recommendation: 'Ensure ocean animations use transform and opacity only',
        severity: 'info'
      });
    }
    
    // Ensure score is between 0 and 1
    score = Math.max(0, Math.min(1, score));
    
    const details = Audit.makeTableDetails(
      [
        {key: 'selector', itemType: 'text', text: 'Selector'},
        {key: 'issue', itemType: 'text', text: 'Issue'},
        {key: 'severity', itemType: 'text', text: 'Severity'},
        {key: 'impact', itemType: 'numeric', text: 'Impact'},
        {key: 'recommendation', itemType: 'text', text: 'Recommendation'},
      ],
      issues
    );
    
    return {
      score,
      numericValue: animationCount,
      numericUnit: 'unitless',
      displayValue: `${animationCount} animations found`,
      details,
      metricSavings: {
        TBT: issues.reduce((sum, issue) => sum + (issue.impact * 200), 0),
        CLS: issues.filter(i => i.severity === 'high').length * 0.01,
      },
    };
  }
}

module.exports = AnimationPerformanceAudit;