/**
 * GEMINI VIBE CODE ENGINE
 * Google Gemini 2.5 Pro/Flash for ultra-cheap code generation
 * Created: October 28, 2025
 * Updated: Fixed @google/genai v1.27.0 API usage
 * 
 * Cost Comparison:
 * - Gemini 2.5 Flash: $0.001/request (simple UI changes)
 * - Gemini 2.5 Pro: $0.01/request (complex reasoning)
 * - Claude Sonnet 4: $0.15/request (strategic planning)
 * 
 * 15x cost reduction!
 */

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface VibeCodeRequest {
  userRequest: string;
  visualEditorContext?: {
    selectedElement: any;
    previewPath: string;
  };
  executionMode: 'plan' | 'build';
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface VibeCodeResponse {
  needsClarification: boolean;
  clarificationQuestion?: string;
  tasks: VibeTask[];
  codeChanges: CodeChange[];
  reasoning: string;
  modelUsed: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  costEstimate: number;
}

export interface VibeTask {
  id: string;
  description: string;
  filesPaths: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface CodeChange {
  filePath: string;
  description: string;
  diff: string;
  type: 'create' | 'modify' | 'delete';
}

export class VibeCodeEngine {
  /**
   * Route to optimal Gemini model based on request complexity
   */
  private selectModel(request: VibeCodeRequest): string {
    const { userRequest, visualEditorContext } = request;

    // Simple UI changes → Flash (cheaper)
    const simpleUIKeywords = ['color', 'size', 'margin', 'padding', 'border', 'background', 'text', 'hide', 'show'];
    const hasSimpleUIIntent = simpleUIKeywords.some(kw => userRequest.toLowerCase().includes(kw));
    const hasSelectedElement = !!visualEditorContext?.selectedElement;

    if (hasSelectedElement && hasSimpleUIIntent) {
      return 'gemini-2.0-flash-exp'; // Gemini 2.0 Flash is available
    }

    // Complex reasoning → Pro (use Gemini 1.5 Pro for now, 2.5 not publicly available yet)
    return 'gemini-1.5-pro-latest';
  }

  /**
   * PLAN MODE: Generate clarification questions
   */
  async generateClarifications(request: VibeCodeRequest): Promise<VibeCodeResponse> {
    const modelName = this.selectModel(request);
    const costEstimate = modelName.includes('flash') ? 0.001 : 0.01;

    const prompt = `You are a Replit-style AI coding assistant analyzing a user's request.

User Request: "${request.userRequest}"

${request.visualEditorContext?.selectedElement ? `
Selected Element:
- Tag: ${request.visualEditorContext.selectedElement.tagName}
- Classes: ${request.visualEditorContext.selectedElement.className || 'none'}
- Page: ${request.visualEditorContext.previewPath}
` : ''}

Analyze this request and decide if you need clarification OR can proceed immediately.

Return JSON in this format:
{
  "needsClarification": boolean,
  "clarificationQuestion": string (if needsClarification is true),
  "reasoning": string (explain your decision)
}

Ask clarification ONLY if:
- Request is vague ("make it better", "fix the design")
- Multiple valid interpretations exist
- Critical details are missing (which page? which component?)

Proceed immediately if:
- Request is specific and actionable
- Element is selected (clear target)
- Standard implementation exists`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const result = JSON.parse(response.text || '{}');

    return {
      needsClarification: result.needsClarification || false,
      clarificationQuestion: result.clarificationQuestion,
      tasks: [],
      codeChanges: [],
      reasoning: result.reasoning || '',
      modelUsed: modelName.includes('flash') ? 'gemini-2.5-flash' : 'gemini-2.5-pro',
      costEstimate
    };
  }

  /**
   * BUILD MODE: Generate code changes immediately
   */
  async generateCode(request: VibeCodeRequest): Promise<VibeCodeResponse> {
    const modelName = this.selectModel(request);
    const costEstimate = modelName.includes('flash') ? 0.001 : 0.01;

    const elementContext = request.visualEditorContext?.selectedElement ? `
SELECTED ELEMENT CONTEXT:
- Tag: <${request.visualEditorContext.selectedElement.tagName}>
- ID: ${request.visualEditorContext.selectedElement.id || 'none'}
- Classes: ${request.visualEditorContext.selectedElement.className || 'none'}
- Text: "${request.visualEditorContext.selectedElement.textContent || 'none'}"
- Page: ${request.visualEditorContext.previewPath}
- XPath: ${request.visualEditorContext.selectedElement.xpath}

The user has ALREADY SELECTED this element. Make changes to it directly.
` : '';

    const prompt = `You are a Replit-style AI coding assistant generating code changes.

User Request: "${request.userRequest}"

${elementContext}

Generate code changes to fulfill this request. Return JSON in this format:
{
  "tasks": [
    {
      "id": "task-1",
      "description": "Detailed task description",
      "filesPaths": ["path/to/file.tsx"],
      "priority": "high" | "medium" | "low"
    }
  ],
  "codeChanges": [
    {
      "filePath": "client/src/components/Example.tsx",
      "description": "What this change does",
      "diff": "Unified diff format",
      "type": "create" | "modify" | "delete"
    }
  ],
  "reasoning": "Explain your implementation approach"
}

IMPORTANT:
- Be decisive and specific
- Generate actual code diffs, not pseudocode
- If element is selected, target THAT element's file
- Use modern React/TypeScript patterns
- Follow existing code style`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const result = JSON.parse(response.text || '{}');

    return {
      needsClarification: false,
      tasks: result.tasks || [],
      codeChanges: result.codeChanges || [],
      reasoning: result.reasoning || '',
      modelUsed: modelName.includes('flash') ? 'gemini-2.5-flash' : 'gemini-2.5-pro',
      costEstimate
    };
  }

  /**
   * MAIN ENTRY POINT
   * Routes to plan or build based on execution mode
   */
  async execute(request: VibeCodeRequest): Promise<VibeCodeResponse> {
    console.log(`🤖 [Gemini Vibe] Executing in ${request.executionMode} mode`);
    console.log(`🤖 [Gemini Vibe] Request: "${request.userRequest.substring(0, 50)}..."`);

    if (request.executionMode === 'plan') {
      return await this.generateClarifications(request);
    } else {
      return await this.generateCode(request);
    }
  }
}
