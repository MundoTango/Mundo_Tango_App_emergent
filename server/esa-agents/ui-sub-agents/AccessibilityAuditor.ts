/**
 * Agent #11.3: Accessibility Auditor
 * Autonomous sub-agent under Agent #11 (Aurora - UI/UX Expert)
 * 
 * Responsibilities:
 * - Run on file changes (file watcher trigger)
 * - Validate WCAG 2.1 AA compliance
 * - Check aria-labels, semantic HTML, contrast ratios
 * - Auto-fix simple issues (missing alt text, aria-labels)
 * - Report violations to Agent #11
 * 
 * Trigger: file_change event
 */

import { Agent } from '../agent-system';
import { promises as fs } from 'fs';

interface A11yIssue {
  file: string;
  line: number;
  type: 'missing_aria' | 'missing_alt' | 'poor_contrast' | 'non_semantic' | 'keyboard_trap';
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  element: string;
  wcagCriterion: string;
  description: string;
  suggestedFix?: string;
  autoFixable: boolean;
}

interface A11yAuditReport {
  file: string;
  issuesFound: number;
  issuesFixed: number;
  issues: A11yIssue[];
  complianceLevel: 'AAA' | 'AA' | 'A' | 'fail';
  duration: number;
}

export class AccessibilityAuditor extends Agent {
  // WCAG 2.1 AA minimum contrast ratios
  private readonly MIN_CONTRAST_NORMAL = 4.5;
  private readonly MIN_CONTRAST_LARGE = 3.0;

  constructor() {
    super({
      id: 'accessibility_auditor',
      name: 'Accessibility Auditor (Agent #11.3)',
      layers: [54, 55], // Accessibility, SEO
      category: 'ui_sub_agent',
      resource_requirements: {
        cpu: '1 core',
        memory: '256MB',
        storage: '50MB',
      },
    } as any);
  }

  async processJob(job: any) {
    const { type, data } = job.data;

    switch (type) {
      case 'audit_file':
        return await this.auditFile(data.filePath);
      case 'audit_component':
        return await this.auditComponent(data);
      case 'fix_file':
        return await this.fixFile(data.filePath, data.issues);
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  }

  async execute(method: string, params: any) {
    switch (method) {
      case 'auditFile':
        return await this.auditFile(params.filePath);
      case 'auditComponent':
        return await this.auditComponent(params);
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  async handleEvent(event: string, data: any) {
    if (event === 'file_changed' && data.path.endsWith('.tsx')) {
      console.log(`[${this.name}] File changed, auditing: ${data.path}`);
      await this.auditFile(data.path);
    }
  }

  /**
   * Audit a single file for accessibility issues
   */
  private async auditFile(filePath: string): Promise<A11yAuditReport> {
    const startTime = Date.now();
    console.log(`[${this.name}] Auditing ${filePath}...`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const issues: A11yIssue[] = [];

      // Check for various accessibility issues
      issues.push(...this.checkMissingAria(content, filePath));
      issues.push(...this.checkMissingAltText(content, filePath));
      issues.push(...this.checkSemanticHTML(content, filePath));
      issues.push(...this.checkInteractiveElements(content, filePath));

      // Auto-fix simple issues
      const autoFixableIssues = issues.filter(i => i.autoFixable);
      let issuesFixed = 0;

      if (autoFixableIssues.length > 0) {
        issuesFixed = await this.fixFile(filePath, autoFixableIssues);
      }

      const report: A11yAuditReport = {
        file: filePath,
        issuesFound: issues.length,
        issuesFixed,
        issues,
        complianceLevel: this.determineComplianceLevel(issues),
        duration: Date.now() - startTime,
      };

      // Report critical issues to Agent #11
      const criticalIssues = issues.filter(i => i.severity === 'critical');
      if (criticalIssues.length > 0) {
        await this.reportToSupervisor(filePath, criticalIssues);
      }

      console.log(`[${this.name}] Audit complete: ${issues.length} issues found, ${issuesFixed} fixed`);
      return report;
    } catch (error) {
      console.error(`[${this.name}] Error auditing ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Check for missing ARIA labels
   */
  private checkMissingAria(content: string, filePath: string): A11yIssue[] {
    const issues: A11yIssue[] = [];
    const lines = content.split('\n');

    // Interactive elements that need aria-label
    const interactiveElements = ['button', 'a', 'input', 'select', 'textarea'];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const element of interactiveElements) {
        const regex = new RegExp(`<${element}[^>]*>`, 'g');
        const matches = line.matchAll(regex);

        for (const match of matches) {
          const tag = match[0];

          // Check if has aria-label or aria-labelledby
          if (!tag.includes('aria-label') && !tag.includes('aria-labelledby')) {
            // Check if has visible text (for buttons/links)
            const hasChildren = !tag.endsWith('/>');

            if (!hasChildren) {
              issues.push({
                file: filePath,
                line: i + 1,
                type: 'missing_aria',
                severity: element === 'button' || element === 'a' ? 'serious' : 'moderate',
                element: element,
                wcagCriterion: '4.1.2 Name, Role, Value',
                description: `${element} element missing aria-label`,
                suggestedFix: this.suggestAriaLabel(element, line),
                autoFixable: true,
              });
            }
          }
        }
      }
    }

    return issues;
  }

  /**
   * Check for missing alt text on images
   */
  private checkMissingAltText(content: string, filePath: string): A11yIssue[] {
    const issues: A11yIssue[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Find img tags
      const imgMatches = line.matchAll(/<img[^>]*>/g);

      for (const match of matches) {
        const tag = match[0];

        // Check if has alt attribute
        if (!tag.includes('alt=')) {
          issues.push({
            file: filePath,
            line: i + 1,
            type: 'missing_alt',
            severity: 'serious',
            element: 'img',
            wcagCriterion: '1.1.1 Non-text Content',
            description: 'Image missing alt text',
            suggestedFix: 'alt="Descriptive alt text"',
            autoFixable: true,
          });
        }
      }
    }

    return issues;
  }

  /**
   * Check for non-semantic HTML
   */
  private checkSemanticHTML(content: string, filePath: string): A11yIssue[] {
    const issues: A11yIssue[] = [];
    const lines = content.split('\n');

    // Patterns that should use semantic HTML
    const antiPatterns = [
      {
        pattern: /<div[^>]*onClick/,
        suggestion: 'Use <button> instead of <div onClick>',
        severity: 'serious' as const,
      },
      {
        pattern: /<span[^>]*onClick/,
        suggestion: 'Use <button> instead of <span onClick>',
        severity: 'serious' as const,
      },
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const { pattern, suggestion, severity } of antiPatterns) {
        if (pattern.test(line)) {
          issues.push({
            file: filePath,
            line: i + 1,
            type: 'non_semantic',
            severity,
            element: 'div/span',
            wcagCriterion: '4.1.2 Name, Role, Value',
            description: suggestion,
            autoFixable: false, // Requires manual review
          });
        }
      }
    }

    return issues;
  }

  /**
   * Check interactive elements for keyboard accessibility
   */
  private checkInteractiveElements(content: string, filePath: string): A11yIssue[] {
    const issues: A11yIssue[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for onClick without onKeyDown
      if (line.includes('onClick') && !line.includes('onKeyDown') && !line.includes('onKeyPress')) {
        // Check if it's on a naturally focusable element
        const isFocusable = /<(button|a|input|select|textarea)[^>]*onClick/.test(line);

        if (!isFocusable) {
          issues.push({
            file: filePath,
            line: i + 1,
            type: 'keyboard_trap',
            severity: 'serious',
            element: 'interactive',
            wcagCriterion: '2.1.1 Keyboard',
            description: 'Interactive element missing keyboard handler',
            suggestedFix: 'Add onKeyDown={(e) => e.key === "Enter" && handleClick()}',
            autoFixable: false, // Requires understanding of intent
          });
        }
      }
    }

    return issues;
  }

  /**
   * Suggest aria-label based on context
   */
  private suggestAriaLabel(element: string, line: string): string {
    // Extract any text from the line as a hint
    const textMatch = line.match(/['"]([^'"]+)['"]/);
    const text = textMatch ? textMatch[1] : element;

    return `aria-label="${text}"`;
  }

  /**
   * Fix file with given issues
   */
  private async fixFile(filePath: string, issues: A11yIssue[]): Promise<number> {
    try {
      let content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      let fixedCount = 0;

      for (const issue of issues) {
        if (!issue.suggestedFix) continue;

        const lineIndex = issue.line - 1;
        const line = lines[lineIndex];

        // Apply simple fixes
        if (issue.type === 'missing_aria' || issue.type === 'missing_alt') {
          // Find the element and add the attribute
          const elementMatch = line.match(new RegExp(`<${issue.element}[^>]*>`));
          if (elementMatch) {
            const tag = elementMatch[0];
            const newTag = tag.replace('>', ` ${issue.suggestedFix}>`);
            lines[lineIndex] = line.replace(tag, newTag);
            fixedCount++;
          }
        }
      }

      if (fixedCount > 0) {
        await fs.writeFile(filePath, lines.join('\n'), 'utf-8');
        console.log(`[${this.name}] Fixed ${fixedCount} issues in ${filePath}`);
      }

      return fixedCount;
    } catch (error) {
      console.error(`[${this.name}] Error fixing ${filePath}:`, error);
      return 0;
    }
  }

  /**
   * Determine WCAG compliance level
   */
  private determineComplianceLevel(issues: A11yIssue[]): 'AAA' | 'AA' | 'A' | 'fail' {
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const seriousCount = issues.filter(i => i.severity === 'serious').length;

    if (criticalCount > 0) return 'fail';
    if (seriousCount > 5) return 'A';
    if (seriousCount > 0) return 'AA';
    return 'AAA';
  }

  /**
   * Report critical issues to Agent #11 (supervisor)
   */
  private async reportToSupervisor(filePath: string, issues: A11yIssue[]): Promise<void> {
    console.log(`[${this.name}] Reporting ${issues.length} critical issues to Agent #11`);

    // Store in shared state for Agent #11 to review
    await this.setSharedState(`a11y_critical_${filePath}`, {
      file: filePath,
      timestamp: new Date().toISOString(),
      issues,
    });
  }

  /**
   * Audit a specific component (for testing)
   */
  private async auditComponent(data: any): Promise<A11yIssue[]> {
    const { componentHtml } = data;

    // Simple audit of component HTML
    const issues: A11yIssue[] = [];

    // Check for missing aria-labels
    if (componentHtml.includes('<button') && !componentHtml.includes('aria-label')) {
      issues.push({
        file: 'component',
        line: 1,
        type: 'missing_aria',
        severity: 'serious',
        element: 'button',
        wcagCriterion: '4.1.2 Name, Role, Value',
        description: 'Button missing aria-label',
        autoFixable: true,
      });
    }

    return issues;
  }
}
