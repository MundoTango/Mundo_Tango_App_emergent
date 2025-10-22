/**
 * Universal Tool Orchestrator - Works with ALL AI models
 * Supports: Claude, GPT-4o, Gemini
 * MB.MD: Multi-model tool calling support
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAllTools } from './toolDefinitions';
import { ToolExecutor } from './ToolExecutor';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const toolExecutor = new ToolExecutor();

export interface StreamChunk {
  type: 'text' | 'tool_use' | 'tool_result';
  content: string;
  tool?: string;
}

/**
 * Convert our tool definitions to OpenAI format
 */
function convertToOpenAITools() {
  const tools = getAllTools();
  return tools.map(tool => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.input_schema
    }
  }));
}

/**
 * Convert our tool definitions to Gemini format
 */
function convertToGeminiTools() {
  const tools = getAllTools();
  return tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.input_schema
  }));
}

/**
 * Stream response with tools - CLAUDE
 */
async function* streamClaudeWithTools(
  messages: Array<{ role: string; content: string }>,
  user: any,
  onToolUse?: (tool: string, params: any, result: any) => void
): AsyncGenerator<StreamChunk> {
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');
  const tools = getAllTools();

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

  if (response.stop_reason === 'tool_use') {
    const toolBlocks = response.content.filter(block => block.type === 'tool_use') as any[];
    
    for (const toolBlock of toolBlocks) {
      yield { type: 'tool_use', content: `🔧 Using ${toolBlock.name}`, tool: toolBlock.name };
      
      const toolResult = await toolExecutor.executeTool(toolBlock.name, toolBlock.input, user);
      onToolUse?.(toolBlock.name, toolBlock.input, toolResult);
      
      yield { type: 'tool_result', content: `📊 ${JSON.stringify(toolResult).substring(0, 100)}...`, tool: toolBlock.name };

      const finalMessages: any[] = [
        ...userMessages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: [{ type: 'tool_result', tool_use_id: toolBlock.id, content: JSON.stringify(toolResult) }] }
      ];

      const finalStream = await anthropic.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemMessage?.content as string,
        messages: finalMessages,
      });

      for await (const chunk of finalStream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          yield { type: 'text', content: chunk.delta.text };
        }
      }
    }
  } else {
    for (const block of response.content) {
      if (block.type === 'text') {
        yield { type: 'text', content: block.text };
      }
    }
  }
}

/**
 * Stream response with tools - OPENAI (GPT-4o)
 */
async function* streamOpenAIWithTools(
  messages: Array<{ role: string; content: string }>,
  user: any,
  onToolUse?: (tool: string, params: any, result: any) => void
): AsyncGenerator<StreamChunk> {
  const tools = convertToOpenAITools();
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: messages as any,
    tools: tools,
    tool_choice: 'auto',
  });

  const message = response.choices[0].message;

  // Check if GPT wants to use tools
  if (message.tool_calls && message.tool_calls.length > 0) {
    for (const toolCall of message.tool_calls) {
      if (toolCall.type !== 'function') continue;
      
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);

      yield { type: 'tool_use', content: `🔧 Using ${toolName}`, tool: toolName };
      
      const toolResult = await toolExecutor.executeTool(toolName, toolArgs, user);
      onToolUse?.(toolName, toolArgs, toolResult);
      
      yield { type: 'tool_result', content: `📊 ${JSON.stringify(toolResult).substring(0, 100)}...`, tool: toolName };

      // Send tool result back to GPT
      const followUpMessages: any[] = [
        ...messages,
        message,
        {
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult)
        }
      ];

      const finalResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: followUpMessages,
        stream: true,
      });

      for await (const chunk of finalResponse) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          yield { type: 'text', content: delta };
        }
      }
    }
  } else {
    // No tool use - return text response
    if (message.content) {
      yield { type: 'text', content: message.content };
    }
  }
}

/**
 * Stream response with tools - GEMINI
 */
async function* streamGeminiWithTools(
  messages: Array<{ role: string; content: string }>,
  user: any,
  onToolUse?: (tool: string, params: any, result: any) => void
): AsyncGenerator<StreamChunk> {
  const tools = convertToGeminiTools();
  const model = gemini.getGenerativeModel({
    model: 'gemini-1.5-pro-latest',
    tools: [{ functionDeclarations: tools as any }]
  });

  const systemMessage = messages.find(m => m.role === 'system');
  const history = messages.filter(m => m.role !== 'system').slice(0, -1).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({
    history,
    systemInstruction: systemMessage?.content
  });

  const lastMessage = messages[messages.length - 1].content;
  const result = await chat.sendMessage(lastMessage);
  const response = result.response;

  // Check for function calls
  const functionCalls = response.functionCalls();
  if (functionCalls && functionCalls.length > 0) {
    for (const call of functionCalls) {
      yield { type: 'tool_use', content: `🔧 Using ${call.name}`, tool: call.name };
      
      const toolResult = await toolExecutor.executeTool(call.name, call.args, user);
      onToolUse?.(call.name, call.args, toolResult);
      
      yield { type: 'tool_result', content: `📊 ${JSON.stringify(toolResult).substring(0, 100)}...`, tool: call.name };

      // Send function result back
      const finalResult = await chat.sendMessage([{
        functionResponse: {
          name: call.name,
          response: toolResult
        }
      }]);

      const text = finalResult.response.text();
      if (text) {
        yield { type: 'text', content: text };
      }
    }
  } else {
    // No function calls - return text
    const text = response.text();
    if (text) {
      yield { type: 'text', content: text };
    }
  }
}

/**
 * Universal tool-enabled streaming - routes to correct model
 */
export async function* streamWithTools(
  messages: Array<{ role: string; content: string }>,
  model: string,
  user: any,
  onToolUse?: (tool: string, params: any, result: any) => void
): AsyncGenerator<StreamChunk> {
  console.log(`[Universal Tools] Model: ${model}, User: ${user.username}`);

  switch (model) {
    case 'claude-3-sonnet':
    case 'claude-3-opus':
      yield* streamClaudeWithTools(messages, user, onToolUse);
      break;
    
    case 'gpt-4o':
    case 'gpt-4-turbo':
      yield* streamOpenAIWithTools(messages, user, onToolUse);
      break;
    
    case 'gemini-pro':
      yield* streamGeminiWithTools(messages, user, onToolUse);
      break;
    
    default:
      console.warn(`[Universal Tools] Unknown model: ${model}, defaulting to Claude`);
      yield* streamClaudeWithTools(messages, user, onToolUse);
  }
}
