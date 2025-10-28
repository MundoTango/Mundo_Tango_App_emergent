/**
 * Chat Mapping Agent - MB.MD Phase 1 for Chat System
 * Squad A: Chat & Voice - Oct 27, 2025
 */

import { createMBMDLogger } from '../mbmd/Logger';
import { mbmdSessionManager } from '../mbmd/SessionManager';

export interface ChatMappingResult {
  intent: 'simple_query' | 'tool_use' | 'complex_operation' | 'build_request';
  documentationRead: string[];
  dataStructures: Record<string, any>;
  executionMode: 'FOCUSED' | 'PARALLEL' | 'SIMULTANEOUS';
  integrationPoints: string[];
  toolsRequired: string[];
  requiresArchitectReview: boolean;
}

export class ChatMappingAgent {
  private logger = createMBMDLogger('chat', undefined);

  async mapUserIntent(userMessage: string, context: any, sessionId?: number): Promise<ChatMappingResult> {
    this.logger.mapping('Starting intent classification...', { messageLength: userMessage.length });

    // 1. Classify request type
    const intent = this.classifyIntent(userMessage);
    this.logger.mapping(`Intent classified: ${intent}`);

    // 2. Read relevant documentation
    const docs = await this.readRelevantDocs(intent);
    this.logger.mapping('Documentation verified', { docsCount: docs.length });

    // 3. Inspect runtime data structures
    const dataStructures = await this.inspectRuntimeData(context);
    this.logger.dataInspection('Context', dataStructures);

    // 4. Determine execution mode
    const executionMode = this.determineExecutionMode(intent, userMessage);
    this.logger.mapping(`Execution mode: ${executionMode}`);

    // 5. Identify tools required
    const toolsRequired = this.identifyToolsRequired(userMessage, intent);
    this.logger.mapping('Tools identified', { tools: toolsRequired });

    // 6. Determine if architect review needed
    const requiresArchitectReview = this.needsArchitectReview(intent, toolsRequired);

    const result: ChatMappingResult = {
      intent,
      documentationRead: docs,
      dataStructures,
      executionMode,
      integrationPoints: this.identifyIntegrationPoints(intent),
      toolsRequired,
      requiresArchitectReview
    };

    // FIX #4: Notify session manager of mapping completion
    if (sessionId) {
      await mbmdSessionManager.notifyChatMapping(sessionId, result);
    }

    this.logger.phaseComplete('MAPPING', JSON.stringify(result, null, 2));
    return result;
  }

  private classifyIntent(userMessage: string): ChatMappingResult['intent'] {
    const lower = userMessage.toLowerCase();

    // Build requests
    if (lower.includes('build') || lower.includes('create') || lower.includes('generate')) {
      return 'build_request';
    }

    // Tool use (database queries, API calls, etc)
    if (lower.includes('get') || lower.includes('fetch') || lower.includes('show') || lower.includes('list')) {
      return 'tool_use';
    }

    // Complex operations
    if (lower.includes('analyze') || lower.includes('compare') || lower.includes('summarize')) {
      return 'complex_operation';
    }

    // Default: simple query
    return 'simple_query';
  }

  private async readRelevantDocs(intent: ChatMappingResult['intent']): Promise<string[]> {
    const docs: string[] = [];

    // Always read MB.MD protocol
    docs.push('docs/MB_MD_QA_PROTOCOL.md');

    // Intent-specific docs
    switch (intent) {
      case 'tool_use':
        docs.push('server/services/tools/toolDefinitions.ts');
        break;
      case 'build_request':
        docs.push('docs/INTEGRATION_PROTOCOL.md');
        docs.push('docs/VIBE_CODING_MBMD_INTEGRATION_RESEARCH.md');
        break;
      case 'complex_operation':
        docs.push('docs/AGENT_LEARNINGS.md');
        break;
    }

    return docs;
  }

  private async inspectRuntimeData(context: any): Promise<Record<string, any>> {
    return {
      contextType: typeof context,
      hasVisualEditor: !!context?.visualEditorContext,
      hasSelectedElement: !!context?.selectedElement,
      conversationLength: context?.conversationHistory?.length || 0,
      model: context?.model || 'claude-3-5-sonnet'
    };
  }

  private determineExecutionMode(
    intent: ChatMappingResult['intent'],
    message: string
  ): 'FOCUSED' | 'PARALLEL' | 'SIMULTANEOUS' {
    // Build requests are usually FOCUSED (one thing at a time)
    if (intent === 'build_request') {
      return 'FOCUSED';
    }

    // Multiple questions or "and" suggests PARALLEL
    if (message.includes(' and ') || message.includes(', ')) {
      return 'PARALLEL';
    }

    // Default: FOCUSED
    return 'FOCUSED';
  }

  private identifyToolsRequired(message: string, intent: ChatMappingResult['intent']): string[] {
    const tools: string[] = [];
    const lower = message.toLowerCase();

    // Database tools
    if (lower.includes('user') || lower.includes('profile')) {
      tools.push('get_user_stats');
    }
    if (lower.includes('post') || lower.includes('memory') || lower.includes('memories')) {
      tools.push('get_recent_memories', 'search_memories');
    }
    if (lower.includes('event')) {
      tools.push('get_event_count', 'get_upcoming_events');
    }

    // File system tools
    if (lower.includes('file') || lower.includes('code')) {
      tools.push('read_file', 'write_file');
    }

    // Build tools
    if (intent === 'build_request') {
      tools.push('execute_vibe_coding');
    }

    return tools;
  }

  private identifyIntegrationPoints(intent: ChatMappingResult['intent']): string[] {
    const points: string[] = [];

    // Chat always integrates with message system
    points.push('server/routes/chatProjectsRoutes.ts');
    points.push('client/src/components/mrBlue/ChatInterface.tsx');

    if (intent === 'build_request') {
      points.push('server/routes/vibeRoutes.ts');
      points.push('server/services/agents/VibeGraph.ts');
    }

    return points;
  }

  private needsArchitectReview(
    intent: ChatMappingResult['intent'],
    tools: string[]
  ): boolean {
    // Build requests always need review
    if (intent === 'build_request') {
      return true;
    }

    // Multiple tools suggest complex operation
    if (tools.length > 3) {
      return true;
    }

    // Database writes need review
    if (tools.some(t => t.includes('write') || t.includes('create') || t.includes('delete'))) {
      return true;
    }

    return false;
  }
}
