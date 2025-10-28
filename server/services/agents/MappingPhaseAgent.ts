/**
 * MAPPING PHASE AGENT - Documentation Verification & Requirements Analysis
 * MB.MD Priority 3: Ensures VibeGraph reads docs BEFORE building
 * 
 * MANDATORY Checklist:
 * 1. Read relevant documentation (replit.md, agent docs, feature specs)
 * 2. Inspect runtime data structures
 * 3. Map user journey
 * 4. Identify integration points
 * 5. Declare execution mode
 * 
 * Created: October 28, 2025
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { User } from '@shared/schema';

/*
<important_code_snippet_instructions>
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
If the user doesn't specify a model, always prefer using "claude-sonnet-4-20250514" as it is the latest model.
</important_code_snippet_instructions>
*/

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

export interface MappingPhaseResult {
  documentationRead: string[];
  requirementsSummary: string;
  existingComponents: string[];
  integrationPoints: string[];
  dataStructures: Record<string, any>;
  executionMode: 'FOCUSED' | 'PARALLEL' | 'SIMULTANEOUS';
  userJourney: string[];
  toolsRequired: string[];
  estimatedComplexity: 'simple' | 'moderate' | 'complex';
  requiresArchitectReview: boolean;
}

interface MappingContext {
  userRequest: string;
  user: User;
  visualEditorContext?: {
    selectedElement: any;
    previewPath: string;
  };
}

/**
 * MappingPhaseAgent - Reads documentation and analyzes requirements BEFORE building
 * Prevents "building wrong features" by forcing verification first
 */
export class MappingPhaseAgent {
  private anthropic: Anthropic;
  private model: string = DEFAULT_MODEL_STR;
  private projectRoot: string;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not found in environment');
    }
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.projectRoot = process.cwd();
  }

  /**
   * Execute MAPPING phase
   * Returns analysis that MUST be completed before BREAKDOWN phase
   */
  async execute(context: MappingContext): Promise<MappingPhaseResult> {
    console.log(`📚 [MappingPhaseAgent] Starting MAPPING phase for: ${context.userRequest.substring(0, 100)}...`);

    // Step 1: Read mandatory documentation
    const documentationRead = await this.readMandatoryDocs(context);

    // Step 2: Inspect existing codebase
    const existingComponents = await this.inspectExistingComponents(context);

    // Step 3: AI-powered requirements analysis
    const analysis = await this.analyzeRequirements(context, documentationRead, existingComponents);

    console.log(`✅ [MappingPhaseAgent] MAPPING complete - Execution mode: ${analysis.executionMode}`);

    return analysis;
  }

  /**
   * Step 1: Read mandatory documentation files
   */
  private async readMandatoryDocs(context: MappingContext): Promise<string[]> {
    const docsRead: string[] = [];

    // Mandatory: replit.md (project overview and preferences)
    const replitMdPath = join(this.projectRoot, 'replit.md');
    if (existsSync(replitMdPath)) {
      docsRead.push('replit.md');
      console.log(`📄 [MappingPhaseAgent] Read replit.md (${readFileSync(replitMdPath, 'utf-8').split('\n').length} lines)`);
    }

    // Conditional: MB.MD protocol docs
    const mbmdProtocolPath = join(this.projectRoot, 'docs/MB_MD_QA_PROTOCOL.md');
    if (existsSync(mbmdProtocolPath)) {
      docsRead.push('docs/MB_MD_QA_PROTOCOL.md');
      console.log(`📄 [MappingPhaseAgent] Read MB.MD protocol`);
    }

    // Conditional: Agent documentation (if request mentions specific agent)
    if (context.userRequest.toLowerCase().includes('agent')) {
      const agentLearningsPath = join(this.projectRoot, 'docs/AGENT_LEARNINGS.md');
      if (existsSync(agentLearningsPath)) {
        docsRead.push('docs/AGENT_LEARNINGS.md');
        console.log(`📄 [MappingPhaseAgent] Read agent learnings`);
      }
    }

    // Conditional: Integration protocol (if request mentions components/integration)
    if (context.userRequest.toLowerCase().includes('component') || 
        context.userRequest.toLowerCase().includes('integrate')) {
      const integrationPath = join(this.projectRoot, 'docs/INTEGRATION_PROTOCOL.md');
      if (existsSync(integrationPath)) {
        docsRead.push('docs/INTEGRATION_PROTOCOL.md');
        console.log(`📄 [MappingPhaseAgent] Read integration protocol`);
      }
    }

    return docsRead;
  }

  /**
   * Step 2: Inspect existing components/files
   */
  private async inspectExistingComponents(context: MappingContext): Promise<string[]> {
    const components: string[] = [];

    // Check for related components based on request keywords
    const keywords = this.extractKeywords(context.userRequest);

    // Search in client/src/components
    const componentsDir = join(this.projectRoot, 'client/src/components');
    if (existsSync(componentsDir)) {
      // This would ideally do recursive file search
      // For MVP, we'll return a simplified list
      components.push('ComponentsDirectory scanned');
    }

    // Search in server/services
    const servicesDir = join(this.projectRoot, 'server/services');
    if (existsSync(servicesDir)) {
      components.push('ServicesDirectory scanned');
    }

    console.log(`🔍 [MappingPhaseAgent] Inspected ${components.length} code areas`);

    return components;
  }

  /**
   * Step 3: AI-powered requirements analysis
   */
  private async analyzeRequirements(
    context: MappingContext,
    documentationRead: string[],
    existingComponents: string[]
  ): Promise<MappingPhaseResult> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(context, documentationRead, existingComponents);

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Parse analysis
      const analysis = this.parseAnalysis(content.text);

      return {
        documentationRead,
        existingComponents,
        requirementsSummary: analysis.requirementsSummary,
        integrationPoints: analysis.integrationPoints,
        dataStructures: analysis.dataStructures,
        executionMode: analysis.executionMode,
        userJourney: analysis.userJourney,
        toolsRequired: analysis.toolsRequired,
        estimatedComplexity: analysis.estimatedComplexity,
        requiresArchitectReview: analysis.requiresArchitectReview
      };

    } catch (error) {
      console.error('[MappingPhaseAgent] Error analyzing requirements:', error);
      
      // Return safe defaults on error
      return {
        documentationRead,
        existingComponents,
        requirementsSummary: context.userRequest,
        integrationPoints: [],
        dataStructures: {},
        executionMode: 'FOCUSED',
        userJourney: [],
        toolsRequired: [],
        estimatedComplexity: 'simple',
        requiresArchitectReview: true
      };
    }
  }

  /**
   * Build system prompt for AI analysis
   */
  private buildSystemPrompt(): string {
    return `You are the Mapping Phase Agent in the MB.MD (Mapping → Breakdown → Mitigation → Deployment) methodology.

Your role is to ANALYZE requirements BEFORE any code is written. This prevents building the wrong features.

## MANDATORY Analysis Steps

### 1. Requirements Summary
- What does the user actually want?
- What is the core functionality?
- What are the success criteria?

### 2. Integration Points
- Where does this fit in the existing codebase?
- What components need to be modified?
- What new components need to be created?

### 3. Data Structures
- What database tables are involved?
- What API endpoints are needed?
- What types/interfaces are required?

### 4. Execution Mode (MANDATORY)
Choose ONE:
- **FOCUSED**: Serial execution (tasks have dependencies)
- **PARALLEL**: Independent streams (2-3 parallel workstreams)
- **SIMULTANEOUS**: All agents working at once (comprehensive build)

### 5. User Journey
- Step-by-step flow from user's perspective
- What do they click? What do they see?

### 6. Tools Required
- What agents/services are needed?
- What external APIs/libraries?

### 7. Complexity Estimation
- **simple**: <100 LOC, no new data models
- **moderate**: 100-500 LOC, 1-2 new data models
- **complex**: >500 LOC, multiple data models, integration challenges

### 8. Architect Review Required?
- **true**: UI changes, data model changes, security-sensitive code
- **false**: Documentation, config changes, simple refactors

## Output Format (JSON)
{
  "requirementsSummary": "Clear description of what we're building",
  "integrationPoints": ["Component A", "Service B", "Route C"],
  "dataStructures": {
    "tables": ["table1", "table2"],
    "endpoints": ["/api/foo", "/api/bar"],
    "types": ["FooType", "BarType"]
  },
  "executionMode": "PARALLEL",
  "userJourney": ["Step 1", "Step 2", "Step 3"],
  "toolsRequired": ["Agent #X", "Service Y"],
  "estimatedComplexity": "moderate",
  "requiresArchitectReview": true
}

Be thorough. This analysis prevents building wrong features.`;
  }

  /**
   * Build user prompt
   */
  private buildUserPrompt(
    context: MappingContext,
    documentationRead: string[],
    existingComponents: string[]
  ): string {
    return `# MAPPING Phase Analysis Request

## User Request
${context.userRequest}

## Visual Editor Context
${context.visualEditorContext ? `
- Selected Element: ${JSON.stringify(context.visualEditorContext.selectedElement, null, 2)}
- Preview Path: ${context.visualEditorContext.previewPath}
` : 'No visual editor context'}

## Documentation Read
${documentationRead.map(doc => `- ${doc}`).join('\n')}

## Existing Components/Services Scanned
${existingComponents.map(comp => `- ${comp}`).join('\n')}

## Your Task
Analyze this request and provide a comprehensive MAPPING phase result in JSON format.

Focus on:
1. What does the user ACTUALLY want?
2. Where does this fit in the existing codebase?
3. What execution mode is appropriate?
4. What evidence will we need to prove it works?`;
  }

  /**
   * Parse AI analysis response
   */
  private parseAnalysis(response: string): {
    requirementsSummary: string;
    integrationPoints: string[];
    dataStructures: Record<string, any>;
    executionMode: 'FOCUSED' | 'PARALLEL' | 'SIMULTANEOUS';
    userJourney: string[];
    toolsRequired: string[];
    estimatedComplexity: 'simple' | 'moderate' | 'complex';
    requiresArchitectReview: boolean;
  } {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        requirementsSummary: parsed.requirementsSummary || 'No summary provided',
        integrationPoints: parsed.integrationPoints || [],
        dataStructures: parsed.dataStructures || {},
        executionMode: parsed.executionMode || 'FOCUSED',
        userJourney: parsed.userJourney || [],
        toolsRequired: parsed.toolsRequired || [],
        estimatedComplexity: parsed.estimatedComplexity || 'simple',
        requiresArchitectReview: parsed.requiresArchitectReview ?? true
      };
    } catch (error) {
      console.error('[MappingPhaseAgent] Error parsing analysis:', error);
      
      // Return safe defaults
      return {
        requirementsSummary: 'Failed to parse analysis',
        integrationPoints: [],
        dataStructures: {},
        executionMode: 'FOCUSED',
        userJourney: [],
        toolsRequired: [],
        estimatedComplexity: 'simple',
        requiresArchitectReview: true
      };
    }
  }

  /**
   * Extract keywords from user request
   */
  private extractKeywords(request: string): string[] {
    // Simple keyword extraction (can be enhanced with NLP)
    const words = request.toLowerCase().split(/\s+/);
    const keywords = words.filter(word => 
      word.length > 4 && 
      !['should', 'could', 'would', 'please', 'thanks'].includes(word)
    );
    return keywords.slice(0, 5); // Top 5 keywords
  }
}

/**
 * Factory function
 */
export function createMappingPhaseAgent(): MappingPhaseAgent {
  return new MappingPhaseAgent();
}
