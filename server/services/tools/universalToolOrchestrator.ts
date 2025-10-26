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

// OPTIMIZATION: Enable HTTP keep-alive for connection pooling
const anthropic = new Anthropic({ 
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 2,
  timeout: 30000, // 30s timeout
});
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 2,
  timeout: 30000,
});
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const toolExecutor = new ToolExecutor();

export interface StreamChunk {
  type: 'text' | 'tool_use' | 'tool_result';
  content: string;
  tool?: string;
}

/**
 * OPTIMIZATION: Compress verbose system messages
 * Removes redundant instructions while keeping core functionality
 * 🔧 FIX (Oct 23, 2025): PRESERVE Visual Editor element disambiguation
 */
function compressSystemMessage(system: string): string {
  if (!system || system.length < 500) return system;
  
  // 🚨 EXTRACT CRITICAL SECTIONS FIRST (before compression destroys them)
  // Fixed regex: Match actual prompt structure from chatProjectsRoutes.ts (Oct 23, 2025)
  const visualEditorSection = system.match(/🚨🚨🚨[\s\S]*?(?=\n\n\*\*🎯 WHERE YOU ARE RIGHT NOW|$)/)?.[0] || '';
  const elementDisambiguationSection = system.match(/📌 \*\*MANDATORY TOOL:[\s\S]*?(?=\n\n\*\*🎯 WHERE YOU ARE RIGHT NOW|$)/)?.[0] || '';
  
  console.log('🔍 [Compress] Visual Editor section preserved:', !!visualEditorSection);
  console.log('🔍 [Compress] Element disambiguation preserved:', !!elementDisambiguationSection);
  if (visualEditorSection) {
    console.log('🔍 [Compress] VE section length:', visualEditorSection.length, 'chars');
  }
  
  // Remove excessive example blocks and verbose instructions
  let compressed = system
    // Remove repeated "IMPORTANT" and "NOTE" blocks (BUT NOT Visual Editor warnings)
    .replace(/\*\*IMPORTANT\*\*(?!.*Visual Editor):?\s*/gi, '')
    .replace(/\*\*NOTE\*\*(?!.*Visual Editor):?\s*/gi, '')
    // Compress tool listings (keep names, remove verbose descriptions)
    .replace(/- \w+_\w+ - [^\n]+/g, (match) => {
      const toolName = match.match(/- (\w+_\w+)/)?.[1];
      return toolName ? `- ${toolName}` : match;
    })
    // Remove "Examples:" sections (AI knows how to use tools)
    .replace(/Examples?:[\s\S]*?(?=\n\n|\n\*\*|$)/gi, '')
    // Compress whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  // 🚨 CRITICAL: Never compress away Visual Editor element context!
  // This section is MANDATORY for element awareness to work
  if (compressed.length > 1500) {
    const coreMatch = compressed.match(/You are [^\n]+/);
    const toolsMatch = compressed.match(/You have \d+ AI tools[^\n]+/);
    const rolesMatch = compressed.match(/super[_\s]?admin/i) ? 
      '\n\nOmniscient Mode: You have access to database, codebase, and documentation tools. Use them actively.' : '';
    
    // 🔧 ALWAYS include Visual Editor context if present
    compressed = [
      coreMatch?.[0], 
      toolsMatch?.[0], 
      rolesMatch,
      visualEditorSection, // 🚨 PRESERVE element context
      elementDisambiguationSection // 🚨 PRESERVE tool instructions
    ].filter(Boolean).join('\n\n');
    
    console.log('🔍 [Compress] Final compressed length:', compressed.length);
  }
  
  return compressed;
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

  // OPTIMIZATION: Reduce max_tokens from 4096 to 1500 (most responses are <1000 tokens)
  // OPTIMIZATION: Compress system message to reduce tokens sent
  const compressedSystem = compressSystemMessage(systemMessage?.content || '');
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1500, // Reduced from 4096 for faster responses
    system: compressedSystem,
    tools: tools as any,
    messages: userMessages.map(m => ({
      role: m.role === 'user' ? 'user' as const : 'assistant' as const,
      content: m.content,
    })),
  });

  if (response.stop_reason === 'tool_use') {
    const toolBlocks = response.content.filter(block => block.type === 'tool_use') as any[];
    
    // 🔧 FIX (Oct 26): Collect ALL tool results before sending (fixes multi-tool call bug)
    const toolResults: any[] = [];
    
    for (const toolBlock of toolBlocks) {
      yield { type: 'tool_use', content: `🔧 Using ${toolBlock.name}`, tool: toolBlock.name };
      
      const toolResult = await toolExecutor.executeTool(toolBlock.name, toolBlock.input, user);
      onToolUse?.(toolBlock.name, toolBlock.input, toolResult);
      
      yield { type: 'tool_result', content: `📊 ${JSON.stringify(toolResult).substring(0, 100)}...`, tool: toolBlock.name };
      
      // Collect result instead of sending immediately
      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolBlock.id,
        content: JSON.stringify(toolResult)
      });
    }

    // Send ONE message with ALL tool results
    const finalMessages: any[] = [
      ...userMessages,
      { role: 'assistant', content: response.content },
      { role: 'user', content: toolResults }
    ];

    const finalStream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1500,
      system: compressedSystem,
      messages: finalMessages,
    });

    for await (const chunk of finalStream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield { type: 'text', content: chunk.delta.text };
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
    // 🔧 FIX (Oct 26): Collect ALL tool results before sending (fixes multi-tool call bug)
    const toolMessages: any[] = [];
    
    for (const toolCall of message.tool_calls) {
      if (toolCall.type !== 'function') continue;
      
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);

      yield { type: 'tool_use', content: `🔧 Using ${toolName}`, tool: toolName };
      
      const toolResult = await toolExecutor.executeTool(toolName, toolArgs, user);
      onToolUse?.(toolName, toolArgs, toolResult);
      
      yield { type: 'tool_result', content: `📊 ${JSON.stringify(toolResult).substring(0, 100)}...`, tool: toolName };

      // Collect result instead of sending immediately
      toolMessages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult)
      });
    }

    // Send ONE message with ALL tool results
    const followUpMessages: any[] = [
      ...messages,
      message,
      ...toolMessages
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
    model: 'gemini-2.0-flash-exp',
    tools: [{ functionDeclarations: tools as any }]
  });

  const systemMessage = messages.find(m => m.role === 'system');
  const history = messages.filter(m => m.role !== 'system').slice(0, -1).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));

  // Gemini requires system instruction as a string or undefined
  // 🔧 FIX (Oct 26, 2025): Truncate system instruction to avoid 400 Bad Request
  let systemInstruction = systemMessage?.content;
  if (systemInstruction && systemInstruction.length > 30000) {
    console.log(`⚠️  [Gemini] System instruction too long (${systemInstruction.length} chars), truncating to 30k`);
    systemInstruction = systemInstruction.substring(0, 30000) + '\n\n[System message truncated for API limits]';
  }

  const chat = model.startChat({
    history,
    systemInstruction
  });

  const lastMessage = messages[messages.length - 1].content;
  const result = await chat.sendMessage(lastMessage);
  const response = result.response;

  // Check for function calls
  const functionCalls = response.functionCalls();
  if (functionCalls && functionCalls.length > 0) {
    // 🔧 FIX (Oct 26): Collect ALL tool results before sending (fixes multi-tool call bug)
    const functionResponses: any[] = [];
    
    for (const call of functionCalls) {
      yield { type: 'tool_use', content: `🔧 Using ${call.name}`, tool: call.name };
      
      const toolResult = await toolExecutor.executeTool(call.name, call.args, user);
      onToolUse?.(call.name, call.args, toolResult);
      
      yield { type: 'tool_result', content: `📊 ${JSON.stringify(toolResult).substring(0, 100)}...`, tool: call.name };

      // Collect result instead of sending immediately
      functionResponses.push({
        functionResponse: {
          name: call.name,
          response: toolResult
        }
      });
    }

    // Send ONE message with ALL function results
    const finalResult = await chat.sendMessage(functionResponses);

    const text = finalResult.response.text();
    if (text) {
      yield { type: 'text', content: text };
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
  onToolUse?: (tool: string, params: any, result: any) => void,
  context?: any // 🎯 Visual Editor context (Oct 23, 2025)
): AsyncGenerator<StreamChunk> {
  console.log(`[Universal Tools] Model: ${model}, User: ${user.username}`);

  // 🎯 SET CONTEXT: Pass Visual Editor state to tool executor
  // 🔒 SECURITY FIX (Oct 23): ALWAYS set context (even if null) to prevent stale state leakage
  toolExecutor.setContext(context || null);

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
