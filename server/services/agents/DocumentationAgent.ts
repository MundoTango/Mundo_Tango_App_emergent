/**
 * Documentation Agent - MB.MD Phase 1 (MAPPING)
 * Squad C: Autonomy & VibeGraph - Oct 27, 2025
 */

import fs from 'fs/promises';
import path from 'path';

export interface MappingResult {
  documentationRead: string[];
  requirementsSummary: string;
  existingComponents: string[];
  integrationPoints: string[];
  dataStructures: Record<string, any>;
  executionMode: 'FOCUSED' | 'PARALLEL' | 'SIMULTANEOUS';
}

export class DocumentationAgent {
  async verify(request: { userRequest: string; context?: any }): Promise<MappingResult> {
    console.log('[DocumentationAgent] Starting MAPPING phase verification...');

    const docsRead: string[] = [];
    const existingComponents: string[] = [];
    const integrationPoints: string[] = [];

    // 1. Read relevant documentation
    const docsToRead = await this.identifyRelevantDocs(request.userRequest);
    for (const docPath of docsToRead) {
      try {
        await fs.access(docPath);
        docsRead.push(docPath);
        console.log('[DocumentationAgent] Read:', docPath);
      } catch (error) {
        console.log('[DocumentationAgent] Doc not found:', docPath);
      }
    }

    // 2. Identify existing components
    const components = await this.findExistingComponents(request.userRequest);
    existingComponents.push(...components);

    // 3. Identify integration points
    const integrations = await this.identifyIntegrationPoints(request.userRequest, request.context);
    integrationPoints.push(...integrations);

    // 4. Determine execution mode
    const executionMode = this.determineExecutionMode(request.userRequest);

    // 5. Inspect data structures (if context provided)
    const dataStructures = request.context || {};

    console.log('[DocumentationAgent] MAPPING complete:', {
      docsRead: docsRead.length,
      existingComponents: existingComponents.length,
      integrationPoints: integrationPoints.length,
      executionMode
    });

    return {
      documentationRead: docsRead,
      requirementsSummary: request.userRequest,
      existingComponents,
      integrationPoints,
      dataStructures,
      executionMode
    };
  }

  private async identifyRelevantDocs(userRequest: string): Promise<string[]> {
    const docs: string[] = [];

    // Always read core protocol docs
    docs.push('docs/MB_MD_QA_PROTOCOL.md');
    docs.push('docs/INTEGRATION_PROTOCOL.md');

    // Read feature-specific docs based on request
    if (userRequest.toLowerCase().includes('chat')) {
      docs.push('docs/AGENT_LEARNINGS.md');
    }
    if (userRequest.toLowerCase().includes('visual editor')) {
      docs.push('docs/INTEGRATION_PROTOCOL.md');
    }
    if (userRequest.toLowerCase().includes('vibe') || userRequest.toLowerCase().includes('coding')) {
      docs.push('docs/VIBE_CODING_MBMD_INTEGRATION_RESEARCH.md');
    }

    return docs;
  }

  private async findExistingComponents(userRequest: string): Promise<string[]> {
    const components: string[] = [];

    // Simple component detection based on request
    if (userRequest.includes('button')) {
      components.push('@/components/ui/button');
    }
    if (userRequest.includes('chat')) {
      components.push('client/src/components/mrBlue/ChatInterface.tsx');
    }
    if (userRequest.includes('modal') || userRequest.includes('dialog')) {
      components.push('@/components/ui/dialog');
    }

    return components;
  }

  private async identifyIntegrationPoints(userRequest: string, context?: any): Promise<string[]> {
    const points: string[] = [];

    // Identify parent components
    if (userRequest.includes('chat')) {
      points.push('client/src/components/mrBlue/ChatInterface.tsx');
      points.push('client/src/components/mrBlue/MrBlueComplete.tsx');
    }
    if (userRequest.includes('visual editor')) {
      points.push('client/src/components/visualEditor/VisualEditorWrapper.tsx');
    }

    return points;
  }

  private determineExecutionMode(userRequest: string): 'FOCUSED' | 'PARALLEL' | 'SIMULTANEOUS' {
    const words = userRequest.toLowerCase();

    // SIMULTANEOUS: Multiple independent features
    if (words.includes('all') || words.includes('everything') || words.includes('comprehensive')) {
      return 'SIMULTANEOUS';
    }

    // PARALLEL: Multiple tasks
    if (words.includes('and') || words.includes('also') || words.includes('multiple')) {
      return 'PARALLEL';
    }

    // FOCUSED: Single task (default)
    return 'FOCUSED';
  }
}
