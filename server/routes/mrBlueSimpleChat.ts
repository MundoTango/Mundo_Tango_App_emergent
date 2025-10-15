/**
 * MR BLUE SIMPLE CHAT ENDPOINT
 * Lightweight JSON endpoint for ScottAI and other simple chat interfaces
 * Uses Claude Sonnet 4.5 but returns clean JSON instead of streaming
 */

import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { optionalAuth } from '../middleware/secureAuth';
import { userContextService } from '../services/UserContextService';
import { eventMemoryGraph } from '../services/EventMemoryGraph';
import { detectSemanticQuery, buildQueryDescription, extractEventId } from '../utils/semanticQueryDetector';
import { db } from '../db';
import { events, eventRsvps } from '../../shared/schema';
import { eq, desc, and } from 'drizzle-orm';

export const mrBlueSimpleChatRouter = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

interface SimpleChatRequest {
  message: string;
  context?: {
    page?: string;
    url?: string;
    title?: string;
    elements?: number;
    visualEdits?: string;
  };
  personality?: string;
  agent?: string;
  model?: string;
}

/**
 * POST /api/mrblue/simple-chat
 * Simple JSON endpoint for basic Mr Blue conversations
 */
mrBlueSimpleChatRouter.post('/simple-chat', optionalAuth, async (req, res) => {
  try {
    const { message, context, personality, agent, model }: SimpleChatRequest = req.body;
    const userId = req.user?.id;

    console.log('💬 [Mr Blue Simple Chat] Request:', {
      message: message.substring(0, 50),
      hasContext: !!context,
      agent: agent || 'Mr Blue',
      userId
    });

    // TRACK 1: Detect semantic query intent
    const semanticQuery = detectSemanticQuery(message);
    console.log('🔍 [Semantic Detection]', buildQueryDescription(semanticQuery), {
      confidence: semanticQuery.confidence,
      type: semanticQuery.type,
      isContextual: semanticQuery.isContextual
    });

    // Aggregate user context if logged in
    let userContext = null;
    if (userId) {
      try {
        userContext = await userContextService.getUserContext(userId);
        console.log('🧠 [Mr Blue] User context loaded:', {
          friends: userContext.friends.length,
          eventsAttended: userContext.events.attended.length,
          eventsUpcoming: userContext.events.upcoming.length
        });
      } catch (error) {
        console.warn('⚠️ [Mr Blue] Could not load user context:', error);
      }
    }

    // TRACK 1: Semantic Search - Retrieve platform knowledge
    let platformKnowledge = '';
    let semanticContext = null;
    
    if (semanticQuery.isContextual && userId && semanticQuery.confidence >= 0.3) {
      try {
        console.log('🔎 [Semantic Search] Executing context query...');
        
        // Determine event ID
        let eventId = extractEventId(message) || semanticQuery.entities.eventId;
        
        // If "last event" or "recent event", find most recent attended event
        if (!eventId && (semanticQuery.entities.eventName === 'most_recent' || semanticQuery.type === 'event_attendee')) {
          const recentEvents = await db
            .select({
              eventId: eventRsvps.eventId,
              eventTitle: events.title,
              eventDate: events.date
            })
            .from(eventRsvps)
            .innerJoin(events, eq(events.id, eventRsvps.eventId))
            .where(
              and(
                eq(eventRsvps.userId, userId),
                eq(eventRsvps.status, 'going')
              )
            )
            .orderBy(desc(events.date))
            .limit(1);

          if (recentEvents.length > 0) {
            eventId = recentEvents[0].eventId;
            console.log(`📅 [Semantic] Found most recent event: ${recentEvents[0].eventTitle} (ID: ${eventId})`);
          }
        }

        // Execute semantic search if we have an event
        if (eventId) {
          const attendees = await eventMemoryGraph.findAttendeesAtEvent(eventId, {
            isTeacher: semanticQuery.entities.isTeacher,
            occupation: semanticQuery.entities.occupation,
            city: semanticQuery.entities.city
          });

          // Get event details
          const eventDetails = await db
            .select()
            .from(events)
            .where(eq(events.id, eventId))
            .limit(1);

          semanticContext = {
            event: eventDetails[0],
            matches: attendees,
            query: semanticQuery
          };

          // Build platform knowledge string
          platformKnowledge = `
PLATFORM KNOWLEDGE (Retrieved from semantic search - Confidence: ${Math.round(semanticQuery.confidence * 100)}%):

Event Context:
- Event: "${eventDetails[0]?.title || 'Unknown'}" (ID: ${eventId})
- Date: ${eventDetails[0]?.date || 'Unknown'}
- Location: ${eventDetails[0]?.city || 'Unknown'}

Matching Attendees Found: ${attendees.length}
${attendees.map((a, i) => `
${i + 1}. ${a.userName}
   - City: ${a.userCity || 'Not specified'}
   - Occupation: ${a.userOccupation || 'Not specified'}
   - Teacher: ${a.userIsTeacher ? 'Yes' : 'No'}
`).join('')}

Search Criteria:
${semanticQuery.entities.occupation ? `- Occupation: ${semanticQuery.entities.occupation}` : ''}
${semanticQuery.entities.city ? `- City: ${semanticQuery.entities.city}` : ''}
${semanticQuery.entities.isTeacher ? `- Is Teacher: Yes` : ''}
`;

          console.log(`✅ [Semantic Search] Found ${attendees.length} matches at event ${eventId}`);
        } else {
          console.log('⚠️ [Semantic Search] Could not determine event ID for context query');
          platformKnowledge = '\nPLATFORM KNOWLEDGE: Could not find specific event context. Using general user context.\n';
        }

      } catch (error) {
        console.error('❌ [Semantic Search] Error:', error);
        platformKnowledge = '\nPLATFORM KNOWLEDGE: Semantic search unavailable, using general context.\n';
      }
    }

    // Build context-aware system prompt
    const systemPrompt = `You are Mr Blue, the universal AI companion for the Mundo Tango platform.

${personality || 'You are helpful, direct, and focused. You speak like a knowledgeable colleague who gets things done.'}

PAGE CONTEXT:
${context ? `
- Page: ${context.page || 'Unknown'}
- URL: ${context.url || '/'}
- Title: ${context.title || 'Mundo Tango'}
- Interactive Elements: ${context.elements || 0}
- Recent Visual Edits: ${context.visualEdits || 'None'}
` : '- No page context available'}

${platformKnowledge ? platformKnowledge : ''}

${userContext ? `
USER CONTEXT (Private data for ${userContext.profile.name}):
Profile:
- Name: ${userContext.profile.name}
- City: ${userContext.profile.city || 'Not specified'}
- Occupation: ${userContext.profile.occupation || 'Not specified'}
- Tango Roles: ${userContext.profile.tangoRoles?.join(', ') || 'Not specified'}

Friends: ${userContext.friends.length} connections
${userContext.friends.slice(0, 5).map(f => `- ${f.name} (${f.city || 'unknown city'}${f.isteacher ? ', teacher' : ''})`).join('\n')}
${userContext.friends.length > 5 ? `... and ${userContext.friends.length - 5} more` : ''}

Events Attended: ${userContext.events.attended.length} events
${userContext.events.attended.slice(0, 3).map(e => `- ${e.title} (${e.date})`).join('\n')}
${userContext.events.attended.length > 3 ? `... and ${userContext.events.attended.length - 3} more` : ''}

Upcoming Events: ${userContext.events.upcoming.length} events
${userContext.events.upcoming.slice(0, 3).map(e => `- ${e.title} (${e.date})`).join('\n')}
${userContext.events.upcoming.length > 3 ? `... and ${userContext.events.upcoming.length - 3} more` : ''}

Teachers in Network: ${userContext.connections.teachers.length}
${userContext.connections.teachers.slice(0, 3).map(t => `- ${t.name} from ${t.city || 'unknown city'}`).join('\n')}

Memories: ${userContext.memories.count} posts/memories

You CAN now answer questions like:
- "Who are my friends?"
- "What events am I attending?"
- "Do I know any teachers in Buenos Aires?"
- "Show me my upcoming events"
- "Who did I meet at the last event who's a teacher?"
- "I met an engineer from Buenos Aires at event X, what's their name?"
` : '- User not logged in (cannot access personal data)'}

${agent && agent !== 'Mr Blue' ? `
AGENT MODE: ${agent}
You are acting as ${agent}. Respond in the style and expertise of this specialized agent.
` : ''}

INSTRUCTIONS:
- Answer questions about friends, events, and connections using the USER CONTEXT above
- ${platformKnowledge ? 'PRIORITIZE information from PLATFORM KNOWLEDGE above - it contains specific search results for the user query' : ''}
- Be specific and reference actual names, events, and details
- If user asks "what page am i on", tell them the exact page name and URL
- Keep responses concise but helpful
- Use a warm, professional tone`;

    // Call Claude
    const response = await anthropic.messages.create({
      model: model || DEFAULT_MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const aiMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'Sorry, I could not generate a response.';

    console.log('✅ [Mr Blue Simple Chat] Response generated:', {
      length: aiMessage.length,
      model: model || DEFAULT_MODEL,
    });

    // Return clean JSON with semantic context
    res.json({
      response: aiMessage,
      model: model || DEFAULT_MODEL,
      agent: agent || 'Mr Blue',
      tokens: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
      semanticSearch: semanticContext ? {
        isContextual: semanticQuery.isContextual,
        confidence: semanticQuery.confidence,
        type: semanticQuery.type,
        matchCount: semanticContext.matches.length,
        eventName: semanticContext.event?.title,
        eventId: semanticContext.event?.id,
      } : undefined,
    });

  } catch (error) {
    console.error('❌ [Mr Blue Simple Chat] Error:', error);
    res.status(500).json({
      response: "I encountered an error. Please try again.",
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default mrBlueSimpleChatRouter;
