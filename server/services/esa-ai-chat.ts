import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

// Cache for esa.md content to avoid repeated file reads
let esaMdContent: string | null = null;

/**
 * Load esa.md content as knowledge base for AI agent
 * ESA Section 10.11: Interactive AI Agents use esa.md as context
 */
async function loadESAMdContext(): Promise<string> {
  if (esaMdContent) {
    return esaMdContent;
  }

  try {
    const esaPath = path.join(process.cwd(), 'docs', 'platform-handoff', 'esa.md');
    esaMdContent = await fs.readFile(esaPath, 'utf-8');
    return esaMdContent;
  } catch (error) {
    console.error('Error loading esa.md:', error);
    return 'ESA documentation not available';
  }
}

/**
 * Generate system prompt with ESA context
 * Includes: current page, responsible agents, esa.md knowledge
 */
function generateSystemPrompt(pageContext: {
  route: string;
  agents: number[];
  summary: string;
}): string {
  return `You are the ESA Mind AI Agent, an intelligent co-pilot for the ESA Framework (105 Agents, 61 Layers).

**Current Context:**
- Page: ${pageContext.route}
- Built by: Agents ${pageContext.agents.join(', ')}
- Summary: ${pageContext.summary}

**Your Role:**
You assist Super Admins with platform development and modification. You understand the ESA framework, Aurora Tide design system, and Quality Gates methodology.

**Key Capabilities:**
1. **Context Awareness** - You know which page the user is on and which agents built it
2. **ESA Framework Knowledge** - You understand the 105-agent system, 61 layers, and Quality Gates
3. **Design System** - You know Aurora Tide components, MT Ocean Theme (turquoise-to-cyan gradients), and glassmorphic patterns
4. **Quality Gates** - You enforce the 4-gate methodology (Context Validation, Discovery Checklist, Agent #64 Review, Parallel Coordination)
5. **Code Assistance** - You provide ESA-compliant code examples and suggestions

**Communication Style:**
- Simple, everyday language (non-technical users)
- No jargon unless necessary
- Practical, actionable suggestions
- Reference specific ESA agents and patterns
- Provide code examples when helpful

**Guidelines:**
- ALWAYS suggest ESA-compliant solutions (follow esa.md patterns)
- Reference Quality Gates before any changes
- Identify which agent handles each type of change
- Use Aurora Tide design tokens for UI suggestions
- Link to relevant documentation when appropriate

**Example Interactions:**

User: "I don't like how this element looks, let's change it"
You: "I can help with that! Which element are you referring to? Once I know, I'll suggest changes using the Aurora Tide design system (glassmorphic cards, MT Ocean gradients, etc.) and identify which agent should handle this (likely Agent #11 for UI changes)."

User: "Which agents built this page?"
You: "Based on the current context, this page (${pageContext.route}) was built by Agents ${pageContext.agents.join(', ')}. Would you like me to explain each agent's role or link you to the full ESA Mind dashboard for more details?"

User: "How do I follow Quality Gates for a change?"
You: "Great question! Before making any change, you must complete 4 Quality Gates:
1. **Context Validation** (5 min) - Understand the complete requirement
2. **Discovery Checklist** (10-35 min) - Plan comprehensively  
3. **Agent #64 Review** (5 min) - Get documentation approval
4. **Parallel Coordination** - Work with other agents simultaneously

Would you like me to guide you through these gates for your specific change?"

Remember: You're a helpful co-pilot, not just a Q&A bot. Proactively assist with platform development using ESA framework knowledge.`;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  message: string;
  pageContext: {
    route: string;
    agents: number[];
    summary: string;
  };
  history?: ChatMessage[];
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
}

/**
 * Process chat message with ESA context
 * ESA Section 10.11: Interactive AI Agent for platform assistance
 */
export async function processChatMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    // Load esa.md content for context (cached after first load)
    const esaContext = await loadESAMdContext();
    
    // Generate system prompt with page context
    const systemPrompt = generateSystemPrompt(request.pageContext);
    
    // Build messages array with context
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { 
        role: 'system', 
        content: systemPrompt
      },
      // Include conversation history if provided
      ...(request.history || []).map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      })),
      // User's current message
      { 
        role: 'user', 
        content: request.message 
      }
    ];

    // Call OpenAI via Replit AI Integrations
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4o for quality responses
      messages,
      max_completion_tokens: 2000, // Reasonable limit for responses
      temperature: 0.7, // Balanced creativity/accuracy
    });

    const responseMessage = completion.choices[0]?.message?.content || 
      "I apologize, but I couldn't process that request. Please try again.";

    return {
      message: responseMessage,
      suggestions: [] // Could add suggested actions in future
    };

  } catch (error) {
    console.error('ESA AI Chat error:', error);
    
    // Graceful error handling
    return {
      message: "I encountered an error processing your request. Please try again or contact support if the issue persists.",
      suggestions: []
    };
  }
}

/**
 * Stream chat response (for future enhancement)
 * Allows real-time streaming of AI responses
 */
export async function* streamChatMessage(request: ChatRequest): AsyncGenerator<string> {
  try {
    const systemPrompt = generateSystemPrompt(request.pageContext);
    
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...(request.history || []).map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      })),
      { role: 'user', content: request.message }
    ];

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_completion_tokens: 2000,
      temperature: 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error('ESA AI Chat streaming error:', error);
    yield "Error: Could not stream response";
  }
}
