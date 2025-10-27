/**
 * Visual Editor Context Mapper - MB.MD Phase 1 for Visual Editor
 * Squad B: Visual Editor & Tabs - Oct 27, 2025
 */

import { createMBMDLogger } from '../mbmd/Logger';
import fs from 'fs/promises';
import path from 'path';

export interface VisualEditorMappingResult {
  componentDocs: string[];
  elementStructure: any;
  integrationPoints: string[];
  scope: 'inline' | 'component' | 'file';
  executionMode: 'FOCUSED' | 'PARALLEL' | 'SIMULTANEOUS';
  existingStyles: Record<string, any>;
  parentComponent: string | null;
}

export class VisualEditorContextMapper {
  private logger = createMBMDLogger('visual-editor', undefined);

  async mapSelectedElement(element: any): Promise<VisualEditorMappingResult> {
    this.logger.mapping('Starting element context mapping...', { elementId: element?.id });

    // 1. Read component documentation
    const componentDocs = await this.findComponentDocs(element.componentPath);
    this.logger.mapping('Component docs found', { docsCount: componentDocs.length });

    // 2. Inspect element data structure
    this.logger.dataInspection('Selected element', element);

    // 3. Find parent component integration points
    const integrationPoints = await this.findParentComponents(element);
    this.logger.mapping('Integration points identified', { points: integrationPoints });

    // 4. Determine modification scope
    const scope = this.determineScope(element);
    this.logger.mapping(`Scope determined: ${scope}`);

    // 5. Extract existing styles
    const existingStyles = this.extractStyles(element);

    // 6. Determine execution mode based on scope
    const executionMode = scope === 'file' ? 'FOCUSED' : 'PARALLEL';

    const result: VisualEditorMappingResult = {
      componentDocs,
      elementStructure: element,
      integrationPoints,
      scope,
      executionMode,
      existingStyles,
      parentComponent: this.findParentComponentPath(element)
    };

    this.logger.phaseComplete('MAPPING', JSON.stringify(result, null, 2));
    return result;
  }

  private async findComponentDocs(componentPath?: string): Promise<string[]> {
    const docs: string[] = [];

    // Always read integration protocol
    docs.push('docs/INTEGRATION_PROTOCOL.md');

    if (componentPath) {
      // Try to find README or component documentation
      const dir = path.dirname(componentPath);
      try {
        const readmePath = path.join(dir, 'README.md');
        await fs.access(readmePath);
        docs.push(readmePath);
      } catch {
        // No README found
      }
    }

    // Visual editor specific docs
    docs.push('docs/MB_MD_QA_PROTOCOL.md');

    return docs;
  }

  private async findParentComponents(element: any): Promise<string[]> {
    const points: string[] = [];

    // Visual editor wrapper is always an integration point
    points.push('client/src/components/visual-editor/VisualEditorWrapper.tsx');

    // If element has component path, that's the primary integration point
    if (element.componentPath) {
      points.push(element.componentPath);
    }

    // If modifying a page, note the page file
    if (element.page) {
      points.push(`client/src/pages/${element.page}.tsx`);
    }

    return points;
  }

  private determineScope(element: any): 'inline' | 'component' | 'file' {
    // If element is part of a reusable component, scope is 'component'
    if (element.componentPath && element.componentPath.includes('/components/')) {
      return 'component';
    }

    // If element is a page-level element, scope is 'file'
    if (element.page) {
      return 'file';
    }

    // Default: inline modification (style changes only)
    return 'inline';
  }

  private extractStyles(element: any): Record<string, any> {
    const styles: Record<string, any> = {};

    if (element.styles) {
      // Parse computed styles
      for (const [key, value] of Object.entries(element.styles)) {
        styles[key] = value;
      }
    }

    if (element.className) {
      styles.className = element.className;
    }

    return styles;
  }

  private findParentComponentPath(element: any): string | null {
    if (element.componentPath) {
      return element.componentPath;
    }

    if (element.page) {
      return `client/src/pages/${element.page}.tsx`;
    }

    return null;
  }
}
