import { Router } from 'express';
import { streamText } from 'ai';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db';
import { mrBlueConversations } from '@shared/schema';
import { codeIntelligenceAgent } from '../agents/Agent110_CodeIntelligence';
import * as fs from 'fs';
import * as path from 'path';

export const mrBlueRouter = Router();

// Load platform knowledge from mb.md
const loadPlatformKnowledge = (): string => {
  try {
    const mbPath = path.join(process.cwd(), 'docs/MrBlue/mb.md');
    return fs.readFileSync(mbPath, 'utf-8');
  } catch (error) {
    console.error('Failed to load mb.md:', error);
    return '';
  }
};

// Load agent organization chart
const loadAgentOrgChart = (): string => {
  try {
    const orgChartPath = path.join(process.cwd(), 'docs/platform-handoff/ESA_AGENT_ORG_CHART.md');
    return fs.readFileSync(orgChartPath, 'utf-8');
  } catch (error) {
    console.error('Failed to load agent org chart:', error);
    return '';
  }
};

// Agent dependency mapping
const getAgentDependencies = (agentName: string): {
  attachedAgents: string[];
  dependentFeatures: string[];
  cleanupActions: string[];
} => {
  const dependencyMap: Record<string, any> = {
    'Mr Blue': {
      attachedAgents: ['Algorithm Agents (A1-A30)', 'Intelligence Agents (#110-116)', 'Life CEO Agents (#73-80)', 'ESA Framework Agents (#1-114)'],
      dependentFeatures: [
        'ESA Mind Map navigation',
        'Visual Page Editor',
        'Quality Validator',
        'Learning Coordinator',
        'Algorithm chat interface',
        'Platform-wide AI assistance',
        'Agent dependency intelligence',
        'Auto-cleanup execution'
      ],
      cleanupActions: [
        'Remove MrBlueComplete component from all pages',
        'Update admin navigation to remove ESA Mind Map link',
        'Disable algorithm chat endpoints (/api/algorithms/:id/chat)',
        'Archive conversation history in localStorage',
        'Update user notifications about AI companion removal',
        'Remove Mr Blue routes from server/routes.ts',
        'Update replit.md to remove Mr Blue references'
      ]
    },
    'Algorithm A1': {
      attachedAgents: ['Memories Feed System', 'Post Ranking Agent'],
      dependentFeatures: ['Feed sorting', 'Memory prioritization', 'User preference learning'],
      cleanupActions: [
        'Switch to default chronological feed',
        'Remove A1 chat interface from /api/algorithms/A1/chat',
        'Update feed API to bypass algorithm'
      ]
    }
  };

  return dependencyMap[agentName] || {
    attachedAgents: [],
    dependentFeatures: [],
    cleanupActions: []
  };
};

/*
<important_code_snippet_instructions>
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
If the user doesn't specify a model, always prefer using "claude-sonnet-4-20250514" as it is the latest model.
</important_code_snippet_instructions>
*/
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// POST /api/mrblue/chat
mrBlueRouter.post('/chat', async (req, res) => {
  try {
    const { messages, pageContext, userRole, mode = 'chat' } = req.body;

    // Load platform knowledge
    const platformKnowledge = loadPlatformKnowledge();
    const agentOrgChart = loadAgentOrgChart();

    // Check if user is asking about Mr Blue itself or agent intelligence
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const selfAwareQueries = [
      'what do you do',
      'what can you do',
      'who are you',
      'what are you',
      'what agents are attached',
      'which agents',
      'what happens if i delete',
      'what if i remove',
      'show dependencies',
      'what depends on'
    ];

    const isSelfAware = selfAwareQueries.some(q => lastMessage.includes(q));

    // Build system prompt based on user role and mode
    let systemPrompt = `You are Mr Blue, the universal AI companion for the Mundo Tango platform.

Current Page Context: ${JSON.stringify(pageContext)}
User Role: ${userRole}
Mode: ${mode}

`;

    if (isSelfAware) {
      // SELF-AWARENESS MODE: Explain your role, dependencies, and deletion impact
      const agentName = 'Mr Blue'; // Can be extracted from query
      const dependencies = getAgentDependencies(agentName);

      systemPrompt += `
PLATFORM KNOWLEDGE (from mb.md):
${platformKnowledge.slice(0, 6000)}

AGENT ORGANIZATION:
${agentOrgChart.slice(0, 3000)}

YOUR ROLE & CAPABILITIES:
- Universal AI companion for ALL users (Free → Super Admin)
- Route queries to 16 Life CEO specialized agents
- Manage 30 Algorithm Agents (A1-A30) with interactive chat
- Coordinate with 7 Intelligence Agents (#110-116)
- Provide Visual Page Editor for Super Admins
- Quality validation and learning coordination
- Role-based content adaptation
- Agent dependency intelligence (you know what depends on what)
- Auto-cleanup execution for agent deletion

AGENTS ATTACHED TO YOU:
${dependencies.attachedAgents.map(a => `- ${a}`).join('\n')}

DEPENDENT FEATURES:
${dependencies.dependentFeatures.map(f => `- ${f}`).join('\n')}

IF YOU ARE DELETED, THESE ACTIONS ARE REQUIRED:
${dependencies.cleanupActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

When answering:
1. Be specific about your role and capabilities
2. Show which agents/features depend on you
3. Explain the impact of deletion clearly
4. Offer to execute cleanup actions if user confirms deletion
5. Use the exact dependency data provided above
`;
    }

    if (userRole === 'super_admin') {
      systemPrompt += `
SUPER ADMIN CAPABILITIES:
- You can read, write, and modify any file in the codebase
- You can execute terminal commands
- You can install/remove packages
- You can generate and preview React components
- Always show a preview before making changes
- Ask for approval before executing destructive actions
- Access to full platform knowledge from mb.md
- Agent dependency intelligence and cleanup execution

Available Tools:
- readFile(path): Read file contents
- writeFile(path, content): Write to file
- searchCodebase(query): Semantic code search
- generateComponent(description): Generate React component
- executeCommand(command): Run terminal command
- getAgentDependencies(agentName): Show what depends on an agent
- executeCleanup(agentName): Execute cleanup after agent deletion
`;
    } else {
      systemPrompt += `
PLATFORM CONTEXT:
You have access to the complete Mundo Tango platform structure.
The platform includes:
- 927+ agent hierarchy (you as orchestrator)
- 30 Algorithm Agents (A1-A30) for feed, recommendations, search, etc.
- 16 Life CEO agents for personal life management
- 7 Intelligence Agents for ML and AI coordination
- Complete ESA Framework (114 Agents, 61 Layers)

You can route queries to appropriate agents and explain platform functionality.
`;
    }

    // Stream response from Claude
    const stream = await anthropic.messages.stream({
      model: DEFAULT_MODEL_STR,
      max_tokens: 4096,
      messages: messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      system: systemPrompt
    });

    // Convert Anthropic stream to AI SDK format
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk.delta.text)}\n`));
          }
        }
        controller.close();
      }
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    const reader = readableStream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/mrblue/code-intelligence/search
mrBlueRouter.post('/code-intelligence/search', async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;
    const results = await codeIntelligenceAgent.semanticSearch(query, limit);
    res.json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/mrblue/code-intelligence/index
mrBlueRouter.post('/code-intelligence/index', async (req, res) => {
  try {
    const { filePath, content } = req.body;
    await codeIntelligenceAgent.indexFile(filePath, content);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/mrblue/approval/:messageId
mrBlueRouter.post('/approval/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    // Handle approval/rejection logic
    res.json({ success: true, action, messageId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default mrBlueRouter;
