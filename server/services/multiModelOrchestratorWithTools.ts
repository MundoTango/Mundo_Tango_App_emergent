/**
 * Multi-Model AI Orchestration with Tool Calling Support
 * MB.MD: Extends multiModelOrchestrator with AI function calling
 */

import Anthropic from '@anthropic-ai/sdk';
import { getAllTools, ToolDefinition } from './tools/toolDefinitions';
import { ToolExecutor } from './tools/ToolExecutor';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const toolExecutor = new ToolExecutor();

export interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: any;
}

export interface TextBlock {
  type: 'text';
  text: string;
}

export type ContentBlock = ToolUseBlock | TextBlock;

/**
 * Stream AI response with tool calling support
 * Currently supports Claude 3.5 Sonnet (best tool-calling capabilities)
 */
export async function* streamResponseWithTools(
  messages: Array<{ role: string; content: string | ContentBlock[] }>,
  user: any,
  onToolUse?: (tool: string, params: any, result: any) => void
): AsyncGenerator<{ type: 'text' | 'tool_use' | 'tool_result'; content: string; tool?: string }> {
  
  // Extract system message
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  // Get available tools
  const tools = getAllTools();

  // Call Claude with tools
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    system: systemMessage?.content as string,
    tools: tools as any,
    messages: userMessages.map(m => ({
      role: m.role === 'user' ? 'user' as const : 'assistant' as const,
      content: m.content,
    })),
  });

  // Check if Claude wants to use tools
  if (response.stop_reason === 'tool_use') {
    const toolBlocks = response.content.filter(block => block.type === 'tool_use') as ToolUseBlock[];
    
    for (const toolBlock of toolBlocks) {
      console.log(`[AI Tool Use] ${toolBlock.name}`, toolBlock.input);
      
      // Yield tool use notification
      yield {
        type: 'tool_use',
        content: `🔧 Using tool: ${toolBlock.name}`,
        tool: toolBlock.name
      };

      // Execute tool
      const toolResult = await toolExecutor.executeTool(toolBlock.name, toolBlock.input, user);
      
      // Callback for logging/monitoring
      if (onToolUse) {
        onToolUse(toolBlock.name, toolBlock.input, toolResult);
      }

      // Yield tool result
      yield {
        type: 'tool_result',
        content: `📊 Result: ${JSON.stringify(toolResult).substring(0, 200)}...`,
        tool: toolBlock.name
      };

      // Send tool result back to Claude for final answer
      const finalMessages: any[] = [
        ...userMessages,
        { role: 'assistant', content: response.content },
        {
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: toolBlock.id,
              content: JSON.stringify(toolResult)
            }
          ]
        }
      ];

      // Get Claude's final response with tool results
      const finalStream = await anthropic.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemMessage?.content as string,
        messages: finalMessages,
      });

      for await (const chunk of finalStream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          yield {
            type: 'text',
            content: chunk.delta.text
          };
        }
      }
    }
  } else {
    // No tool use - stream normal response
    for (const block of response.content) {
      if (block.type === 'text') {
        yield {
          type: 'text',
          content: block.text
        };
      }
    }
  }
}

/**
 * Non-streaming version for simple queries
 */
export async function queryWithTools(
  messages: Array<{ role: string; content: string }>,
  user: any
): Promise<string> {
  let fullResponse = '';
  
  for await (const chunk of streamResponseWithTools(messages, user)) {
    if (chunk.type === 'text') {
      fullResponse += chunk.content;
    }
  }
  
  return fullResponse;
}
