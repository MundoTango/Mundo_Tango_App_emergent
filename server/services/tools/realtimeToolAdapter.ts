/**
 * STREAM 1: OpenAI Realtime API Tool Adapter
 * Converts Mr Blue's 11 Omniscient Mode tools to OpenAI function format
 * MB.MD: Function Calling Bridge
 */

import { ToolDefinition, getAllTools } from './toolDefinitions';

/**
 * OpenAI Realtime API function format
 * https://platform.openai.com/docs/api-reference/realtime
 */
export interface OpenAIFunction {
  type: 'function';
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * Convert Claude tool format to OpenAI Realtime function format
 */
function convertToOpenAIFunction(tool: ToolDefinition): OpenAIFunction {
  return {
    type: 'function',
    name: tool.name,
    description: tool.description,
    parameters: {
      type: 'object' as const,
      properties: tool.input_schema.properties,
      required: tool.input_schema.required || []
    }
  };
}

/**
 * Get all 11 Omniscient Mode tools in OpenAI Realtime format
 */
export function getRealtimeTools(): OpenAIFunction[] {
  const allTools = getAllTools(); // 11 tools total
  return allTools.map(convertToOpenAIFunction);
}

/**
 * Check if user has permission to use a tool
 */
export function hasToolPermission(toolName: string, isSuperAdmin: boolean): boolean {
  const { toolPermissions, ToolPermissionLevel } = require('./toolDefinitions');
  const permission = toolPermissions[toolName];
  
  if (permission === ToolPermissionLevel.PUBLIC) return true;
  if (permission === ToolPermissionLevel.SUPER_ADMIN) return isSuperAdmin;
  
  return false;
}
