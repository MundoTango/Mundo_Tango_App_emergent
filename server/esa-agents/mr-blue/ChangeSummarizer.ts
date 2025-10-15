/**
 * TRACK 4: Mr. Blue Change Summarizer
 * Detects Visual Editor changes and generates natural language summaries
 * Uses OpenAI for intelligent change description
 */

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface VisualChange {
  id: string;
  timestamp: Date;
  elementSelector: string;
  elementPath: string;
  componentName: string;
  changeType: 'text' | 'style' | 'layout' | 'attribute';
  property?: string;
  before: any;
  after: any;
}

export interface ChangeSummary {
  naturalLanguage: string;
  technicalDetails: string;
  affectedComponents: string[];
  impactAssessment: {
    scope: 'minor' | 'moderate' | 'major';
    potentialIssues: string[];
    suggestedTests: string[];
  };
  changes: VisualChange[];
}

export class ChangeSummarizer {
  /**
   * Summarize visual changes in natural language
   */
  async summarizeChanges(changes: VisualChange[]): Promise<ChangeSummary> {
    if (changes.length === 0) {
      return {
        naturalLanguage: 'No changes detected',
        technicalDetails: '',
        affectedComponents: [],
        impactAssessment: {
          scope: 'minor',
          potentialIssues: [],
          suggestedTests: [],
        },
        changes: [],
      };
    }

    // Group changes by component
    const byComponent = this.groupByComponent(changes);
    const affectedComponents = Object.keys(byComponent);

    // Generate natural language summary
    const naturalLanguage = await this.generateNaturalLanguageSummary(changes, byComponent);

    // Generate technical details
    const technicalDetails = this.generateTechnicalDetails(changes, byComponent);

    // Assess impact
    const impactAssessment = this.assessImpact(changes, affectedComponents);

    return {
      naturalLanguage,
      technicalDetails,
      affectedComponents,
      impactAssessment,
      changes,
    };
  }

  /**
   * Group changes by component
   */
  private groupByComponent(changes: VisualChange[]): Record<string, VisualChange[]> {
    const grouped: Record<string, VisualChange[]> = {};

    changes.forEach((change) => {
      if (!grouped[change.componentName]) {
        grouped[change.componentName] = [];
      }
      grouped[change.componentName].push(change);
    });

    return grouped;
  }

  /**
   * Generate natural language summary using OpenAI
   */
  private async generateNaturalLanguageSummary(
    changes: VisualChange[],
    byComponent: Record<string, VisualChange[]>
  ): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are Mr. Blue, an AI assistant helping users understand their UI changes.
Generate a concise, friendly summary of visual changes made to a component.
Use simple language that a non-technical user can understand.
Focus on what changed and why it matters.`,
          },
          {
            role: 'user',
            content: `Summarize these changes:

${JSON.stringify(changes, null, 2)}

Components affected: ${Object.keys(byComponent).join(', ')}`,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      return completion.choices[0].message.content || this.fallbackSummary(changes);
    } catch (error) {
      console.error('OpenAI summary error:', error);
      return this.fallbackSummary(changes);
    }
  }

  /**
   * Fallback summary if OpenAI fails
   */
  private fallbackSummary(changes: VisualChange[]): string {
    const changeTypes = changes.map((c) => c.changeType);
    const uniqueTypes = [...new Set(changeTypes)];

    const descriptions = {
      text: 'updated text content',
      style: 'changed styling',
      layout: 'modified layout',
      attribute: 'updated attributes',
    };

    const parts = uniqueTypes.map((type) => descriptions[type as keyof typeof descriptions]);

    if (changes.length === 1) {
      return `You ${parts[0]} in ${changes[0].componentName}`;
    } else {
      return `You made ${changes.length} changes: ${parts.join(', ')} across ${new Set(changes.map((c) => c.componentName)).size} components`;
    }
  }

  /**
   * Generate technical details
   */
  private generateTechnicalDetails(
    changes: VisualChange[],
    byComponent: Record<string, VisualChange[]>
  ): string {
    let details = '';

    Object.entries(byComponent).forEach(([componentName, componentChanges]) => {
      details += `\n${componentName}:\n`;
      componentChanges.forEach((change) => {
        details += `  - ${change.changeType}`;
        if (change.property) {
          details += ` (${change.property})`;
        }
        details += `: ${JSON.stringify(change.before)} → ${JSON.stringify(change.after)}\n`;
      });
    });

    return details.trim();
  }

  /**
   * Assess impact of changes
   */
  private assessImpact(
    changes: VisualChange[],
    affectedComponents: string[]
  ): {
    scope: 'minor' | 'moderate' | 'major';
    potentialIssues: string[];
    suggestedTests: string[];
  } {
    const potentialIssues: string[] = [];
    const suggestedTests: string[] = [];
    let scope: 'minor' | 'moderate' | 'major' = 'minor';

    // Determine scope
    if (affectedComponents.length > 3) {
      scope = 'major';
      potentialIssues.push('Multiple components affected - ensure consistency');
    } else if (affectedComponents.length > 1) {
      scope = 'moderate';
    }

    // Check for layout changes
    const hasLayoutChanges = changes.some((c) => c.changeType === 'layout');
    if (hasLayoutChanges) {
      potentialIssues.push('Layout changes may affect responsive design');
      suggestedTests.push('Test on mobile, tablet, and desktop');
      if (scope === 'minor') scope = 'moderate';
    }

    // Check for style changes
    const hasStyleChanges = changes.some((c) => c.changeType === 'style');
    if (hasStyleChanges) {
      potentialIssues.push('Style changes may need dark mode variants');
      suggestedTests.push('Test in dark mode');
    }

    // Check for text changes
    const hasTextChanges = changes.some((c) => c.changeType === 'text');
    if (hasTextChanges) {
      potentialIssues.push('Text changes may need translation updates');
      suggestedTests.push('Verify all languages still work');
    }

    // Always suggest accessibility check
    suggestedTests.push('Run accessibility audit');

    return {
      scope,
      potentialIssues,
      suggestedTests,
    };
  }

  /**
   * Compare before/after snapshots
   */
  async compareSnapshots(before: string, after: string): Promise<{
    linesAdded: number;
    linesRemoved: number;
    linesModified: number;
    changes: string[];
  }> {
    const beforeLines = before.split('\n');
    const afterLines = after.split('\n');

    let linesAdded = 0;
    let linesRemoved = 0;
    let linesModified = 0;
    const changes: string[] = [];

    // Simple line-by-line comparison
    const maxLines = Math.max(beforeLines.length, afterLines.length);

    for (let i = 0; i < maxLines; i++) {
      const beforeLine = beforeLines[i] || '';
      const afterLine = afterLines[i] || '';

      if (!beforeLine && afterLine) {
        linesAdded++;
        changes.push(`+ ${afterLine}`);
      } else if (beforeLine && !afterLine) {
        linesRemoved++;
        changes.push(`- ${beforeLine}`);
      } else if (beforeLine !== afterLine) {
        linesModified++;
        changes.push(`~ ${afterLine}`);
      }
    }

    return {
      linesAdded,
      linesRemoved,
      linesModified,
      changes: changes.slice(0, 20), // Limit to 20 changes for display
    };
  }

  /**
   * Generate user-friendly confirmation message
   */
  async generateConfirmationMessage(summary: ChangeSummary): Promise<string> {
    const { naturalLanguage, impactAssessment, affectedComponents } = summary;

    let message = `${naturalLanguage}\n\n`;

    if (impactAssessment.scope === 'major') {
      message += '⚠️  Major changes detected\n';
    } else if (impactAssessment.scope === 'moderate') {
      message += 'ℹ️  Moderate changes detected\n';
    }

    if (impactAssessment.potentialIssues.length > 0) {
      message += '\n**Potential Issues:**\n';
      impactAssessment.potentialIssues.forEach((issue) => {
        message += `- ${issue}\n`;
      });
    }

    if (impactAssessment.suggestedTests.length > 0) {
      message += '\n**Suggested Tests:**\n';
      impactAssessment.suggestedTests.forEach((test) => {
        message += `- ${test}\n`;
      });
    }

    message += `\n**Affected Components:** ${affectedComponents.join(', ')}`;

    return message;
  }
}

export const changeSummarizer = new ChangeSummarizer();
