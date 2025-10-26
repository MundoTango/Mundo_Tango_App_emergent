/**
 * AGENT #142: Multi-Model Router
 * Intelligent routing to Claude/GPT-4/Gemini based on task type and cost
 * MB.MD: 40% cost savings through strategic model selection
 */

export type ModelProvider = 'claude' | 'openai' | 'gemini';
export type TaskType = 'reasoning' | 'planning' | 'code_review' | 'code_generation' | 'cost_sensitive' | 'chat';

export interface RoutingDecision {
  provider: ModelProvider;
  model: string;
  reason: string;
  estimatedCost: 'low' | 'medium' | 'high';
}

/**
 * Route to optimal model based on task type
 */
export function routeToModel(taskType: TaskType, userPreference?: ModelProvider): RoutingDecision {
  // Respect user's explicit model preference
  if (userPreference) {
    const models = {
      claude: { model: 'claude-3-5-sonnet-20241022', reason: 'User preference', estimatedCost: 'medium' as const },
      openai: { model: 'gpt-4o-2024-11-20', reason: 'User preference', estimatedCost: 'high' as const },
      gemini: { model: 'gemini-pro', reason: 'User preference', estimatedCost: 'low' as const },
    };
    return { provider: userPreference, ...models[userPreference] };
  }
  
  // Intelligent routing based on task type
  switch (taskType) {
    case 'reasoning':
    case 'planning':
      return {
        provider: 'claude',
        model: 'claude-3-5-sonnet-20241022',
        reason: 'Best reasoning and long-context capabilities',
        estimatedCost: 'medium',
      };
      
    case 'code_review':
      return {
        provider: 'openai',
        model: 'gpt-4o-2024-11-20',
        reason: 'Superior code understanding and analysis',
        estimatedCost: 'high',
      };
      
    case 'code_generation':
      return {
        provider: 'claude',
        model: 'claude-3-5-sonnet-20241022',
        reason: 'Strong code generation with tool use',
        estimatedCost: 'medium',
      };
      
    case 'cost_sensitive':
      return {
        provider: 'gemini',
        model: 'gemini-pro',
        reason: 'Most cost-effective option',
        estimatedCost: 'low',
      };
      
    case 'chat':
    default:
      return {
        provider: 'claude',
        model: 'claude-3-5-sonnet-20241022',
        reason: 'Best all-around conversational AI',
        estimatedCost: 'medium',
      };
  }
}

/**
 * Determine task type from user message
 */
export function classifyTask(message: string, context?: { hasCode?: boolean; hasVisualElement?: boolean }): TaskType {
  const lowerMessage = message.toLowerCase();
  
  // Keywords for different task types
  if (lowerMessage.includes('plan') || lowerMessage.includes('strategy') || lowerMessage.includes('approach')) {
    return 'planning';
  }
  
  if (lowerMessage.includes('review') || lowerMessage.includes('check') || lowerMessage.includes('analyze')) {
    return 'code_review';
  }
  
  if (lowerMessage.includes('create') || lowerMessage.includes('build') || lowerMessage.includes('implement') || lowerMessage.includes('generate')) {
    return 'code_generation';
  }
  
  if (lowerMessage.includes('why') || lowerMessage.includes('explain') || lowerMessage.includes('how does')) {
    return 'reasoning';
  }
  
  // Simple conversational queries → use cost-sensitive model
  if (message.split(' ').length < 10 && !context?.hasCode && !context?.hasVisualElement) {
    return 'cost_sensitive';
  }
  
  return 'chat';
}

/**
 * Cost tracking per model (USD per 1M tokens)
 */
export const MODEL_PRICING = {
  'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  'gpt-4o-2024-11-20': { input: 10, output: 30 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gemini-pro': { input: 1.25, output: 5 },
} as const;

/**
 * Estimate cost for a request
 */
export function estimateRequestCost(
  model: string,
  estimatedInputTokens: number,
  estimatedOutputTokens: number
): number {
  const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING];
  if (!pricing) return 0;
  
  return (
    (estimatedInputTokens * pricing.input / 1_000_000) +
    (estimatedOutputTokens * pricing.output / 1_000_000)
  );
}

/**
 * YOLO Mode Configuration
 * When enabled, autonomous execution happens without confirmation
 */
export interface YOLOModeConfig {
  enabled: boolean;
  maxIterations: number; // Max self-healing loop iterations
  timeout: number; // Max runtime in milliseconds (default: 60 min)
  allowedCommands: string[]; // Whitelist of safe terminal commands
  deniedCommands: string[]; // Blacklist of dangerous commands
  requireConfirmationFor: string[]; // Actions that always need confirmation
}

export const DEFAULT_YOLO_CONFIG: YOLOModeConfig = {
  enabled: false,
  maxIterations: 20,
  timeout: 60 * 60 * 1000, // 60 minutes
  allowedCommands: ['npm', 'node', 'git status', 'git diff', 'ls', 'cat', 'echo', 'pwd'],
  deniedCommands: ['rm -rf', 'sudo', 'chmod', 'chown', 'dd', 'mkfs', 'fdisk'],
  requireConfirmationFor: ['database_delete', 'file_delete', 'deployment'],
};

/**
 * Check if command is safe to execute in YOLO mode
 */
export function isCommandSafe(command: string, config: YOLOModeConfig = DEFAULT_YOLO_CONFIG): boolean {
  // Check denied list first
  if (config.deniedCommands.some(denied => command.includes(denied))) {
    return false;
  }
  
  // Check allowed list
  return config.allowedCommands.some(allowed => command.startsWith(allowed));
}
