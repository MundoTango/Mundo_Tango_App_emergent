/**
 * TRACK 3: Component Self-Assessment Framework
 * Tests components against design system, dark mode, i18n, accessibility
 * Generates health scores for autonomous decision-making
 */

import * as fs from 'fs';
import * as path from 'path';

export interface AssessmentResult {
  category: 'design_system' | 'dark_mode' | 'translation' | 'accessibility';
  score: number; // 0-100
  passed: boolean;
  issues: AssessmentIssue[];
  recommendations: string[];
}

export interface AssessmentIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: string;
  autoFixable: boolean;
}

export class SelfAssessment {
  /**
   * Perform complete self-assessment
   */
  async assessComponent(componentPath: string): Promise<{
    overall Score: number;
    results: AssessmentResult[];
    healthStatus: 'healthy' | 'warning' | 'error';
  }> {
    const code = await this.readComponentCode(componentPath);

    const results: AssessmentResult[] = [
      await this.assessDesignSystem(code, componentPath),
      await this.assessDarkMode(code, componentPath),
      await this.assessTranslation(code, componentPath),
      await this.assessAccessibility(code, componentPath),
    ];

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (results[0].score * 0.25) + // Design System
      (results[1].score * 0.25) + // Dark Mode
      (results[2].score * 0.25) + // Translation
      (results[3].score * 0.25)   // Accessibility
    );

    // Determine health status
    let healthStatus: 'healthy' | 'warning' | 'error';
    if (overallScore >= 80) {
      healthStatus = 'healthy';
    } else if (overallScore >= 60) {
      healthStatus = 'warning';
    } else {
      healthStatus = 'error';
    }

    return {
      overallScore,
      results,
      healthStatus,
    };
  }

  /**
   * Read component code
   */
  private async readComponentCode(componentPath: string): Promise<string> {
    try {
      const fullPath = path.join(process.cwd(), componentPath);
      return fs.readFileSync(fullPath, 'utf-8');
    } catch (error) {
      console.error('Error reading component:', error);
      return '';
    }
  }

  /**
   * Assess MT Ocean Design System compliance
   */
  private async assessDesignSystem(code: string, componentPath: string): Promise<AssessmentResult> {
    const issues: AssessmentIssue[] = [];
    const recommendations: string[] = [];

    // Check for shadcn/ui components usage
    const usesShadcn = code.includes('@/components/ui/');
    if (!usesShadcn) {
      issues.push({
        severity: 'medium',
        description: 'Not using shadcn/ui components - should use design system',
        autoFixable: false,
      });
      recommendations.push('Replace custom components with shadcn/ui equivalents');
    }

    // Check for Tailwind classes
    const usesTailwind = code.includes('className=');
    if (!usesTailwind) {
      issues.push({
        severity: 'low',
        description: 'No Tailwind classes found - may not match design system',
        autoFixable: false,
      });
    }

    // Check for proper spacing (Tailwind spacing scale)
    const hasCustomSpacing = /style=.*margin|padding/.test(code);
    if (hasCustomSpacing) {
      issues.push({
        severity: 'low',
        description: 'Custom spacing detected - use Tailwind spacing utilities',
        autoFixable: true,
      });
      recommendations.push('Replace inline styles with Tailwind classes');
    }

    // Check for color consistency
    const hasHardcodedColors = /#[0-9A-Fa-f]{3,6}/.test(code);
    if (hasHardcodedColors) {
      issues.push({
        severity: 'medium',
        description: 'Hardcoded color values - use design system colors',
        autoFixable: true,
      });
      recommendations.push('Use Tailwind color classes from MT Ocean theme');
    }

    const score = Math.max(0, 100 - (issues.length * 15));

    return {
      category: 'design_system',
      score,
      passed: score >= 70,
      issues,
      recommendations,
    };
  }

  /**
   * Assess Dark Mode compliance
   */
  private async assessDarkMode(code: string, componentPath: string): Promise<AssessmentResult> {
    const issues: AssessmentIssue[] = [];
    const recommendations: string[] = [];

    // Find all className definitions
    const classNameRegex = /className="([^"]*)"/g;
    const classNames = [];
    let match;

    while ((match = classNameRegex.exec(code)) !== null) {
      classNames.push(match[1]);
    }

    // Check for dark: variants
    let totalClasses = 0;
    let darkClasses = 0;

    classNames.forEach((className) => {
      const classes = className.split(/\s+/);
      classes.forEach((cls) => {
        // Check if it's a color/background class
        if (cls.match(/^(bg|text|border)-/)) {
          totalClasses++;
          
          // Check if there's a corresponding dark: variant
          const darkVariant = `dark:${cls}`;
          if (className.includes(darkVariant)) {
            darkClasses++;
          }
        }
      });
    });

    if (totalClasses > 0) {
      const coverage = Math.round((darkClasses / totalClasses) * 100);
      
      if (coverage < 100) {
        issues.push({
          severity: 'high',
          description: `Missing dark mode variants (${coverage}% coverage)`,
          autoFixable: true,
        });
        recommendations.push('Add dark: variants for all color classes');
      }

      const score = coverage;

      return {
        category: 'dark_mode',
        score,
        passed: score >= 90,
        issues,
        recommendations,
      };
    }

    return {
      category: 'dark_mode',
      score: 100,
      passed: true,
      issues: [],
      recommendations: [],
    };
  }

  /**
   * Assess Translation/i18n compliance
   */
  private async assessTranslation(code: string, componentPath: string): Promise<AssessmentResult> {
    const issues: AssessmentIssue[] = [];
    const recommendations: string[] = [];

    // Check if component uses i18n
    const usesI18n = code.includes('useTranslation') || code.includes('t(');

    // Find hardcoded strings in JSX
    const jsxStringRegex = />([^<>{]*[a-zA-Z]{3,}[^<>{}]*)</g;
    let hardcodedStrings = 0;
    let translatedStrings = 0;

    let match;
    while ((match = jsxStringRegex.exec(code)) !== null) {
      const content = match[1].trim();
      
      // Skip if it's a variable or number
      if (content.startsWith('{') || /^\d+$/.test(content) || content.length < 3) {
        continue;
      }

      hardcodedStrings++;

      // Check if it's using translation
      if (match[0].includes('{t(')) {
        translatedStrings++;
      }
    }

    if (hardcodedStrings > 0) {
      const coverage = Math.round((translatedStrings / hardcodedStrings) * 100);

      if (coverage < 100) {
        issues.push({
          severity: 'medium',
          description: `Hardcoded strings detected (${coverage}% translated)`,
          autoFixable: true,
        });
        recommendations.push('Wrap all user-facing text in t() function');
      }

      const score = coverage;

      return {
        category: 'translation',
        score,
        passed: score >= 90,
        issues,
        recommendations,
      };
    }

    return {
      category: 'translation',
      score: 100,
      passed: true,
      issues: [],
      recommendations: [],
    };
  }

  /**
   * Assess Accessibility (WCAG 2.1 AA)
   */
  private async assessAccessibility(code: string, componentPath: string): Promise<AssessmentResult> {
    const issues: AssessmentIssue[] = [];
    const recommendations: string[] = [];

    // Check for alt text on images
    const imgWithoutAlt = /<img(?![^>]*alt=)[^>]*>/g.test(code);
    if (imgWithoutAlt) {
      issues.push({
        severity: 'critical',
        description: 'Images missing alt text',
        autoFixable: true,
      });
      recommendations.push('Add alt="" or descriptive alt text to all images');
    }

    // Check for ARIA labels on buttons
    const buttonWithoutLabel = /<button(?![^>]*aria-label=)(?![^>]*>.*<\/button>)[^>]*\/>/g.test(code);
    if (buttonWithoutLabel) {
      issues.push({
        severity: 'high',
        description: 'Icon buttons missing aria-label',
        autoFixable: true,
      });
      recommendations.push('Add aria-label to icon-only buttons');
    }

    // Check for semantic HTML
    const usesSemanticHTML = /<(header|nav|main|article|section|aside|footer)/.test(code);
    if (!usesSemanticHTML && componentPath.includes('page')) {
      issues.push({
        severity: 'medium',
        description: 'Page missing semantic HTML elements',
        autoFixable: false,
      });
      recommendations.push('Use semantic HTML5 elements for better accessibility');
    }

    // Check for data-testid (testing accessibility)
    const hasTestIds = /data-testid=/.test(code);
    if (!hasTestIds) {
      issues.push({
        severity: 'low',
        description: 'Missing data-testid attributes for testing',
        autoFixable: true,
      });
      recommendations.push('Add data-testid attributes to interactive elements');
    }

    const score = Math.max(0, 100 - (issues.length * 20));

    return {
      category: 'accessibility',
      score,
      passed: score >= 70,
      issues,
      recommendations,
    };
  }

  /**
   * Get auto-fixable issues
   */
  getAutoFixableIssues(results: AssessmentResult[]): AssessmentIssue[] {
    return results
      .flatMap((r) => r.issues)
      .filter((i) => i.autoFixable);
  }

  /**
   * Prioritize issues by severity
   */
  prioritizeIssues(results: AssessmentResult[]): AssessmentIssue[] {
    const allIssues = results.flatMap((r) => r.issues);
    
    const severityOrder = ['critical', 'high', 'medium', 'low'];
    
    return allIssues.sort((a, b) => {
      return severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
    });
  }
}

export const selfAssessment = new SelfAssessment();
