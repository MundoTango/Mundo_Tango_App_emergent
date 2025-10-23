/**
 * MANAGER AGENT - Task Planning from User Requests
 * MB.MD SIMULTANEOUS - Agent #4: Multi-Agent Orchestration Specialist
 * 
 * Responsibilities:
 * - Parse user request into actionable tasks
 * - Determine which files need to be modified
 * - Prioritize tasks (high/medium/low)
 * - Generate execution plan
 * 
 * Created: October 23, 2025
 */

import Anthropic from '@anthropic-ai/sdk';
import type { User } from '@shared/schema';
import { ALL_TOOL_SCHEMAS, executeTool } from '../tools/index';

interface Task {
  id: string;
  description: string;
  filesPaths: string[];
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

interface PlanningContext {
  userRequest: string;
  repositoryMap?: string; // Compact repository map for context
  visualEditorContext?: {
    selectedElement: any;
    previewPath: string;
  };
}

/**
 * ManagerAgent - Plans tasks from natural language requests
 */
export class ManagerAgent {
  private anthropic: Anthropic;
  private model: string = 'claude-3-5-sonnet-20241022';

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not found in environment');
    }
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  /**
   * Plan tasks from user request
   */
  async planTasks(context: PlanningContext, user: User): Promise<Task[]> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(context);

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: systemPrompt,
        tools: ALL_TOOL_SCHEMAS, // Enable function calling with all 30 tools
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      // Handle tool use if Claude wants to call tools
      if (response.stop_reason === 'tool_use') {
        const toolUse = response.content.find(c => c.type === 'tool_use');
        if (toolUse && toolUse.type === 'tool_use') {
          const toolResult = await executeTool(toolUse.name, toolUse.input);
          console.log(`[ManagerAgent] Tool executed: ${toolUse.name}`, toolResult);
        }
      }

      const content = response.content.find(c => c.type === 'text');
      if (!content || content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Parse Claude's response into tasks
      const tasks = this.parseTasksFromResponse(content.text);
      return tasks;
    } catch (error) {
      console.error('[ManagerAgent] Error planning tasks:', error);
      
      // Fallback: Create a single generic task
      return [{
        id: '1',
        description: context.userRequest,
        filesPaths: [],
        priority: 'high',
        status: 'pending'
      }];
    }
  }

  /**
   * Build system prompt for task planning
   */
  private buildSystemPrompt(): string {
    return `You are the Manager Agent in a multi-agent vibe coding system.

Your role is to:
1. Analyze user requests for code changes
2. Break down requests into specific, actionable tasks
3. Identify which files need to be modified
4. Prioritize tasks (high/medium/low)

Output format (JSON):
{
  "tasks": [
    {
      "id": "1",
      "description": "Add login button to header",
      "filesPaths": ["client/src/components/Header.tsx"],
      "priority": "high"
    },
    {
      "id": "2", 
      "description": "Create login API endpoint",
      "filesPaths": ["server/routes/authRoutes.ts"],
      "priority": "high"
    }
  ]
}

Guidelines:
- Be specific about file paths (use exact paths from repository map if provided)
- Each task should be atomic (one clear change)
- Prioritize based on dependencies (backend before frontend if needed)
- If Visual Editor context provided, focus on the selected element's file
- Maximum 5 tasks per request (break large requests into phases)`;
  }

  /**
   * Build user prompt with context
   */
  private buildUserPrompt(context: PlanningContext): string {
    let prompt = `User Request: "${context.userRequest}"\n\n`;

    if (context.repositoryMap) {
      prompt += `Repository Context:\n${context.repositoryMap}\n\n`;
    }

    if (context.visualEditorContext) {
      prompt += `Visual Editor Context:\n`;
      prompt += `- Selected Element: ${JSON.stringify(context.visualEditorContext.selectedElement, null, 2)}\n`;
      prompt += `- Current Page: ${context.visualEditorContext.previewPath}\n\n`;
    }

    prompt += `Please analyze this request and create a task plan in JSON format.`;

    return prompt;
  }

  /**
   * Parse tasks from Claude's response
   */
  private parseTasksFromResponse(response: string): Task[] {
    try {
      // Extract JSON from response (Claude might include explanation text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
        throw new Error('Invalid tasks format');
      }

      return parsed.tasks.map((task: any, index: number) => ({
        id: task.id || String(index + 1),
        description: task.description || 'Unknown task',
        filesPaths: task.filesPaths || [],
        priority: task.priority || 'medium',
        status: 'pending'
      }));
    } catch (error) {
      console.error('[ManagerAgent] Error parsing tasks:', error);
      return [];
    }
  }
}

/**
 * Factory function
 */
export function createManagerAgent(): ManagerAgent {
  return new ManagerAgent();
}
