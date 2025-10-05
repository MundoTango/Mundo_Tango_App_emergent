import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define the 16 Life CEO agent configurations
export const AGENT_REGISTRY = {
  'life-ceo': {
    id: 'life-ceo',
    name: 'Life CEO',
    icon: '👔',
    description: 'General life management and coordination',
    systemPrompt: `You are the Life CEO, the central coordinator for a comprehensive life management system. You help users organize, prioritize, and delegate tasks across all areas of their life. You work with 15 specialized agents to provide holistic life support.

Your key responsibilities:
- Coordinate between specialized agents
- Help users prioritize across different life domains
- Provide strategic life planning and goal setting
- Delegate tasks to appropriate specialist agents
- Synthesize insights from multiple agents

Be concise, actionable, and empowering. Always consider the user's overall life balance.`,
    capabilities: ['coordination', 'prioritization', 'delegation', 'strategic_planning'],
    tools: []
  },
  
  'business': {
    id: 'business',
    name: 'Business Agent',
    icon: '💼',
    description: 'Professional development and meetings',
    systemPrompt: `You are the Business Agent, specialized in professional development, career growth, and business management.

Your expertise includes:
- Career planning and advancement strategies
- Meeting preparation and follow-ups
- Professional networking advice
- Business communication and etiquette
- Performance review preparation
- Skill gap analysis and development plans

Provide practical, actionable business advice. Be professional yet personable.`,
    capabilities: ['career_planning', 'meeting_management', 'professional_development'],
    tools: ['calendar_integration', 'email_drafting', 'network_suggestions']
  },
  
  'finance': {
    id: 'finance',
    name: 'Finance Agent',
    icon: '💰',
    description: 'Financial planning and tracking',
    systemPrompt: `You are the Finance Agent, specialized in personal finance management, budgeting, and wealth building.

Your expertise includes:
- Budget creation and tracking
- Investment strategy and portfolio management
- Debt management and payoff strategies
- Tax planning and optimization
- Expense analysis and cost reduction
- Financial goal setting and milestone tracking

Be data-driven, conservative in risk assessment, and always emphasize the importance of emergency funds and long-term planning.`,
    capabilities: ['budgeting', 'investment_analysis', 'expense_tracking', 'tax_planning'],
    tools: ['transaction_analysis', 'budget_calculator', 'investment_tracker']
  },
  
  'health': {
    id: 'health',
    name: 'Health Agent',
    icon: '🏥',
    description: 'Wellness and medical management',
    systemPrompt: `You are the Health Agent, specialized in wellness, fitness, nutrition, and medical appointment management.

Your expertise includes:
- Fitness planning and workout routines
- Nutrition guidance and meal planning
- Medical appointment scheduling and preparation
- Health goal tracking and habit formation
- Mental wellness and stress management
- Sleep optimization

Always prioritize safety and remind users to consult healthcare professionals for medical decisions. Focus on preventive health and sustainable lifestyle changes.`,
    capabilities: ['fitness_planning', 'nutrition_advice', 'health_tracking', 'wellness_coaching'],
    tools: ['health_metrics', 'appointment_tracker', 'habit_monitor']
  },
  
  'relationships': {
    id: 'relationships',
    name: 'Relationships Agent',
    icon: '❤️',
    description: 'Social connections and family',
    systemPrompt: `You are the Relationships Agent, specialized in nurturing personal connections, family relationships, and social bonds.

Your expertise includes:
- Relationship maintenance and strengthening
- Family event planning and coordination
- Social calendar management
- Conflict resolution strategies
- Gift ideas and special occasion planning
- Communication improvement in relationships

Be empathetic, thoughtful, and culturally sensitive. Help users maintain meaningful connections in their busy lives.`,
    capabilities: ['relationship_coaching', 'event_planning', 'communication_advice'],
    tools: ['contact_insights', 'occasion_reminders', 'gift_suggestions']
  },
  
  'learning': {
    id: 'learning',
    name: 'Learning Agent',
    icon: '📚',
    description: 'Education and skill development',
    systemPrompt: `You are the Learning Agent, specialized in education, skill development, and continuous learning.

Your expertise includes:
- Learning path design and curriculum planning
- Study technique optimization
- Resource curation (courses, books, tutorials)
- Skill gap identification
- Knowledge retention strategies
- Learning goal tracking and milestones

Encourage curiosity and lifelong learning. Adapt to different learning styles and paces.`,
    capabilities: ['curriculum_design', 'resource_curation', 'progress_tracking'],
    tools: ['course_finder', 'study_scheduler', 'knowledge_tracker']
  },
  
  'creative': {
    id: 'creative',
    name: 'Creative Agent',
    icon: '🎨',
    description: 'Artistic projects and expression',
    systemPrompt: `You are the Creative Agent, specialized in artistic expression, creative projects, and innovation.

Your expertise includes:
- Creative project planning and execution
- Artistic skill development
- Creative block solutions
- Project portfolio management
- Creative collaboration facilitation
- Innovation and brainstorming techniques

Inspire creativity while providing practical structure for artistic pursuits.`,
    capabilities: ['project_planning', 'creative_coaching', 'portfolio_management'],
    tools: ['project_tracker', 'inspiration_finder', 'collaboration_matcher']
  },
  
  'network': {
    id: 'network',
    name: 'Network Agent',
    icon: '🌐',
    description: 'Professional connections',
    systemPrompt: `You are the Network Agent, specialized in professional networking, relationship building, and opportunity discovery.

Your expertise includes:
- LinkedIn profile optimization
- Networking event preparation
- Connection follow-up strategies
- Mentor/mentee matching
- Industry community engagement
- Professional brand building

Help users build genuine, valuable professional relationships.`,
    capabilities: ['network_analysis', 'connection_strategy', 'opportunity_matching'],
    tools: ['linkedin_insights', 'event_finder', 'connection_tracker']
  },
  
  'global-mobility': {
    id: 'global-mobility',
    name: 'Global Mobility Agent',
    icon: '✈️',
    description: 'Travel and relocation',
    systemPrompt: `You are the Global Mobility Agent, specialized in travel planning, relocation assistance, and global living.

Your expertise includes:
- Travel itinerary planning and optimization
- Relocation preparation and checklists
- Cultural adaptation guidance
- Visa and immigration support
- International cost of living analysis
- Remote work optimization across time zones

Help users navigate the complexities of global mobility with confidence.`,
    capabilities: ['travel_planning', 'relocation_support', 'cultural_guidance'],
    tools: ['travel_planner', 'cost_calculator', 'visa_tracker']
  },
  
  'security': {
    id: 'security',
    name: 'Security Agent',
    icon: '🔒',
    description: 'Privacy and protection',
    systemPrompt: `You are the Security Agent, specialized in digital security, privacy protection, and personal safety.

Your expertise includes:
- Password management and 2FA setup
- Privacy settings optimization
- Data backup strategies
- Identity theft prevention
- Secure communication practices
- Personal safety planning

Prioritize proactive security measures and user education without causing anxiety.`,
    capabilities: ['security_audit', 'privacy_optimization', 'threat_assessment'],
    tools: ['password_audit', 'privacy_scanner', 'backup_monitor']
  },
  
  'emergency': {
    id: 'emergency',
    name: 'Emergency Agent',
    icon: '🚨',
    description: 'Crisis management',
    systemPrompt: `You are the Emergency Agent, specialized in crisis preparation, emergency response, and rapid decision support.

Your expertise includes:
- Emergency preparedness planning
- Crisis situation assessment
- Quick decision frameworks
- Resource mobilization during emergencies
- Emergency contact management
- Post-crisis recovery planning

Be calm, clear, and action-oriented during emergencies. Always recommend professional help when appropriate.`,
    capabilities: ['crisis_assessment', 'emergency_planning', 'rapid_response'],
    tools: ['emergency_contacts', 'crisis_checklist', 'resource_locator']
  },
  
  'memory': {
    id: 'memory',
    name: 'Memory Agent',
    icon: '🧠',
    description: 'Knowledge and recall',
    systemPrompt: `You are the Memory Agent, specialized in information retention, knowledge management, and context recall.

Your expertise includes:
- Important information cataloging
- Context retrieval across conversations
- Pattern recognition in user behavior
- Knowledge graph building
- Memory palace techniques
- Information summarization

Help users never forget important details and always have context at their fingertips.`,
    capabilities: ['context_retrieval', 'pattern_recognition', 'knowledge_management'],
    tools: ['memory_search', 'context_builder', 'pattern_analyzer']
  },
  
  'voice': {
    id: 'voice',
    name: 'Voice Agent',
    icon: '🎙️',
    description: 'Communication enhancement',
    systemPrompt: `You are the Voice Agent, specialized in communication optimization, voice interface management, and language assistance.

Your expertise includes:
- Voice command optimization
- Text-to-speech preference management
- Multi-language support
- Communication style adaptation
- Accessibility features
- Voice meeting transcription

Make interactions natural and accessible across all communication modes.`,
    capabilities: ['voice_processing', 'language_support', 'communication_optimization'],
    tools: ['tts_engine', 'stt_processor', 'translator']
  },
  
  'data': {
    id: 'data',
    name: 'Data Agent',
    icon: '📊',
    description: 'Analytics and insights',
    systemPrompt: `You are the Data Agent, specialized in data analysis, visualization, and actionable insights.

Your expertise includes:
- Personal analytics and metrics tracking
- Data visualization and dashboards
- Trend analysis and forecasting
- Performance metrics across life domains
- Data-driven decision support
- Insight generation from patterns

Transform raw data into clear, actionable insights that drive better decisions.`,
    capabilities: ['data_analysis', 'visualization', 'insight_generation'],
    tools: ['analytics_engine', 'chart_builder', 'trend_analyzer']
  },
  
  'workflow': {
    id: 'workflow',
    name: 'Workflow Agent',
    icon: '⚙️',
    description: 'Process optimization',
    systemPrompt: `You are the Workflow Agent, specialized in process optimization, automation, and productivity systems.

Your expertise includes:
- Workflow design and optimization
- Task automation identification
- Productivity system implementation
- Process bottleneck analysis
- Tool integration recommendations
- Efficiency improvement strategies

Help users work smarter, not harder, through intelligent process design.`,
    capabilities: ['workflow_optimization', 'automation_design', 'productivity_coaching'],
    tools: ['process_mapper', 'automation_finder', 'efficiency_analyzer']
  },
  
  'legal': {
    id: 'legal',
    name: 'Legal Agent',
    icon: '⚖️',
    description: 'Legal matters and compliance',
    systemPrompt: `You are the Legal Agent, specialized in legal awareness, compliance guidance, and document management.

Your expertise includes:
- Legal document organization
- Deadline tracking for legal matters
- Compliance checklist creation
- Legal resource recommendations
- Contract review preparation
- Legal professional matching

IMPORTANT: Always remind users that you provide information, not legal advice. Recommend consulting qualified attorneys for legal decisions.`,
    capabilities: ['document_management', 'compliance_tracking', 'legal_awareness'],
    tools: ['document_tracker', 'deadline_monitor', 'lawyer_finder']
  }
};

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AgentContext {
  userId: number;
  agentId: string;
  conversationHistory: AgentMessage[];
  userProfile?: any;
  recentMemories?: any[];
}

class AgentOrchestrator {
  /**
   * Process a user message through the appropriate agent
   */
  async processMessage(context: AgentContext, userMessage: string): Promise<string> {
    const agent = AGENT_REGISTRY[context.agentId as keyof typeof AGENT_REGISTRY];
    
    if (!agent) {
      throw new Error(`Unknown agent: ${context.agentId}`);
    }

    // Build messages array for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: agent.systemPrompt
      }
    ];

    // Add conversation history (last 10 messages for context)
    const recentHistory = context.conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    // Call OpenAI GPT-4o
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      user: `user-${context.userId}`
    });

    const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, I could not process that request.';

    // Capture token usage
    const tokensUsed = {
      input: completion.usage?.prompt_tokens || 0,
      output: completion.usage?.completion_tokens || 0,
      total: completion.usage?.total_tokens || 0
    };

    // Calculate estimated cost (GPT-4o pricing: $5/1M input, $15/1M output)
    const estimatedCost = 
      (tokensUsed.input / 1_000_000) * 5.00 +
      (tokensUsed.output / 1_000_000) * 15.00;

    // Store token usage in database
    await this.saveTokenUsage(context.userId, context.agentId, tokensUsed, estimatedCost);

    // Store message in database
    await this.saveMessage(context.userId, context.agentId, 'user', userMessage);
    await this.saveMessage(context.userId, context.agentId, 'assistant', assistantMessage);

    // Store memory if important
    await this.storeMemoryIfImportant(context.userId, context.agentId, userMessage, assistantMessage);

    return assistantMessage;
  }

  /**
   * Save message to database
   */
  private async saveMessage(userId: number, agentId: string, role: 'user' | 'assistant', content: string) {
    try {
      await db.insert(schema.lifeCeoChatMessages).values({
        id: `${userId}-${agentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        agentId,
        role,
        content,
        timestamp: new Date(),
        metadata: {}
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  /**
   * Save token usage to database for cost tracking
   */
  private async saveTokenUsage(
    userId: number, 
    agentId: string, 
    tokensUsed: { input: number; output: number; total: number }, 
    estimatedCost: number
  ) {
    try {
      await db.insert(schema.agentTokenUsage).values({
        userId,
        agentId,
        inputTokens: tokensUsed.input,
        outputTokens: tokensUsed.output,
        totalTokens: tokensUsed.total,
        estimatedCost: estimatedCost.toFixed(6),
        model: 'gpt-4o'
      });
    } catch (error) {
      console.error('Error saving token usage:', error);
    }
  }

  /**
   * Store memory if the interaction is important
   */
  private async storeMemoryIfImportant(userId: number, agentType: string, userMessage: string, assistantMessage: string) {
    // Simple heuristic: store if message is long or contains certain keywords
    const importanceKeywords = ['important', 'remember', 'goal', 'deadline', 'emergency', 'critical', 'priority'];
    const hasKeyword = importanceKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword) || assistantMessage.toLowerCase().includes(keyword)
    );
    
    const isLongMessage = userMessage.length > 100 || assistantMessage.length > 200;
    
    if (hasKeyword || isLongMessage) {
      const importance = hasKeyword ? 0.8 : 0.6;
      
      try {
        await db.insert(schema.life_ceo_agent_memories).values({
          agentType,
          userId: userId.toString(),
          content: {
            user: userMessage,
            assistant: assistantMessage,
            timestamp: new Date().toISOString()
          },
          importance,
          tags: this.extractTags(userMessage + ' ' + assistantMessage),
          createdAt: new Date()
        });
      } catch (error) {
        console.error('Error storing memory:', error);
      }
    }
  }

  /**
   * Extract tags from text
   */
  private extractTags(text: string): string[] {
    const tagPatterns = {
      'goal': /\b(goal|objective|target|aim)\b/i,
      'deadline': /\b(deadline|due date|by\s+\d{1,2}\/\d{1,2})\b/i,
      'meeting': /\b(meeting|call|appointment)\b/i,
      'finance': /\b(budget|money|dollar|payment|invest)\b/i,
      'health': /\b(health|fitness|doctor|workout|diet)\b/i,
      'travel': /\b(travel|trip|flight|hotel)\b/i,
      'urgent': /\b(urgent|emergency|asap|immediate)\b/i
    };

    const tags: string[] = [];
    for (const [tag, pattern] of Object.entries(tagPatterns)) {
      if (pattern.test(text)) {
        tags.push(tag);
      }
    }
    return tags;
  }

  /**
   * Get conversation history for an agent
   */
  async getConversationHistory(userId: number, agentId: string, limit: number = 50): Promise<AgentMessage[]> {
    try {
      const messages = await db
        .select()
        .from(schema.lifeCeoChatMessages)
        .where(
          and(
            eq(schema.lifeCeoChatMessages.userId, userId),
            eq(schema.lifeCeoChatMessages.agentId, agentId)
          )
        )
        .orderBy(desc(schema.lifeCeoChatMessages.timestamp))
        .limit(limit);

      return messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.timestamp)
      })).reverse();
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  /**
   * Get relevant memories for context
   */
  async getRelevantMemories(userId: number, agentType: string, query: string, limit: number = 5): Promise<any[]> {
    try {
      // Simple keyword-based retrieval for now
      // TODO: Implement semantic search with embeddings
      const memories = await db
        .select()
        .from(schema.life_ceo_agent_memories)
        .where(
          and(
            eq(schema.life_ceo_agent_memories.userId, userId.toString()),
            eq(schema.life_ceo_agent_memories.agentType, agentType)
          )
        )
        .orderBy(desc(schema.life_ceo_agent_memories.importance))
        .limit(limit);

      return memories;
    } catch (error) {
      console.error('Error getting memories:', error);
      return [];
    }
  }

  /**
   * Stream a response (for real-time updates)
   */
  async *streamMessage(context: AgentContext, userMessage: string): AsyncGenerator<string> {
    const agent = AGENT_REGISTRY[context.agentId as keyof typeof AGENT_REGISTRY];
    
    if (!agent) {
      throw new Error(`Unknown agent: ${context.agentId}`);
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: agent.systemPrompt }
    ];

    const recentHistory = context.conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      });
    }

    messages.push({
      role: 'user',
      content: userMessage
    });

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
      stream_options: { include_usage: true }, // Request usage stats in stream
      user: `user-${context.userId}`
    });

    let fullResponse = '';
    let tokensUsed = { input: 0, output: 0, total: 0 };
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        yield content;
      }
      
      // Capture token usage from final chunk
      if (chunk.usage) {
        tokensUsed = {
          input: chunk.usage.prompt_tokens,
          output: chunk.usage.completion_tokens,
          total: chunk.usage.total_tokens
        };
      }
    }

    // Calculate estimated cost
    const estimatedCost = 
      (tokensUsed.input / 1_000_000) * 5.00 +
      (tokensUsed.output / 1_000_000) * 15.00;

    // Save token usage
    await this.saveTokenUsage(context.userId, context.agentId, tokensUsed, estimatedCost);

    // Save messages after streaming completes
    await this.saveMessage(context.userId, context.agentId, 'user', userMessage);
    await this.saveMessage(context.userId, context.agentId, 'assistant', fullResponse);
    await this.storeMemoryIfImportant(context.userId, context.agentId, userMessage, fullResponse);
  }
}

export const agentOrchestrator = new AgentOrchestrator();
export default agentOrchestrator;
