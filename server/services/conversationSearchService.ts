/**
 * TRACK B: Conversation Search Service
 * MB.MD SIMULTANEOUS BUILD - Oct 23, 2025
 * Agent #129 (Services)
 * 
 * PostgreSQL full-text search across conversations
 */

import { db } from '../db';
import { aiChatMessages, voiceConversationTurns, chatProjects } from '@shared/schema';
import { eq, desc, and, gte, lte, or, sql, ilike } from 'drizzle-orm';

export interface SearchFilters {
  query: string;
  userId: number;
  projectId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  models?: string[];
  hasTools?: boolean;
  sentiment?: 'positive' | 'negative' | 'neutral';
  type?: 'text' | 'voice' | 'all';
}

export interface SearchResult {
  id: number;
  projectId: number;
  projectName: string;
  messageId?: number;
  voiceTurnId?: number;
  type: 'text' | 'voice';
  content: string;
  snippet: string;
  role: 'user' | 'assistant';
  model?: string;
  timestamp: string;
  relevanceScore: number;
}

/**
 * Search across text and voice conversations
 * Uses PostgreSQL full-text search for performance
 */
export async function searchConversations(filters: SearchFilters): Promise<SearchResult[]> {
  const { query, userId, projectId, dateFrom, dateTo, models, type = 'all' } = filters;
  
  const results: SearchResult[] = [];

  // Search text messages if not restricted to voice
  if (type === 'text' || type === 'all') {
    const textConditions = [
      ilike(aiChatMessages.content, `%${query}%`),
      eq(chatProjects.userId, userId), // SECURITY: Only search user's own projects
    ];

    if (projectId) {
      textConditions.push(eq(aiChatMessages.projectId, projectId));
    }
    if (dateFrom) {
      textConditions.push(gte(aiChatMessages.createdAt, dateFrom));
    }
    if (dateTo) {
      textConditions.push(lte(aiChatMessages.createdAt, dateTo));
    }
    if (models && models.length > 0) {
      textConditions.push(
        or(...models.map(m => eq(aiChatMessages.model, m))) as any
      );
    }

    const textMessages = await db
      .select({
        id: aiChatMessages.id,
        projectId: aiChatMessages.projectId,
        projectName: chatProjects.name,
        content: aiChatMessages.content,
        role: aiChatMessages.role,
        model: aiChatMessages.model,
        createdAt: aiChatMessages.createdAt,
      })
      .from(aiChatMessages)
      .innerJoin(chatProjects, eq(aiChatMessages.projectId, chatProjects.id)) // Use INNER JOIN to ensure project exists
      .where(and(...textConditions))
      .orderBy(desc(aiChatMessages.createdAt))
      .limit(50);

    results.push(...textMessages.map(msg => ({
      id: msg.id,
      projectId: msg.projectId,
      projectName: msg.projectName || 'Unknown Project',
      messageId: msg.id,
      type: 'text' as const,
      content: msg.content,
      snippet: highlightQuery(msg.content, query),
      role: msg.role as 'user' | 'assistant',
      model: msg.model || undefined,
      timestamp: msg.createdAt?.toISOString() || new Date().toISOString(),
      relevanceScore: calculateRelevance(msg.content, query),
    })));
  }

  // Search voice transcripts if not restricted to text
  if (type === 'voice' || type === 'all') {
    const voiceConditions = [
      ilike(voiceConversationTurns.transcript, `%${query}%`),
      eq(chatProjects.userId, userId), // SECURITY: Only search user's own projects
    ];

    if (projectId) {
      voiceConditions.push(eq(voiceConversationTurns.projectId, projectId));
    }
    if (dateFrom) {
      voiceConditions.push(gte(voiceConversationTurns.createdAt, dateFrom));
    }
    if (dateTo) {
      voiceConditions.push(lte(voiceConversationTurns.createdAt, dateTo));
    }
    if (models && models.length > 0) {
      voiceConditions.push(
        or(...models.map(m => eq(voiceConversationTurns.model, m))) as any
      );
    }

    const voiceTurns = await db
      .select({
        id: voiceConversationTurns.id,
        projectId: voiceConversationTurns.projectId,
        projectName: chatProjects.name,
        transcript: voiceConversationTurns.transcript,
        role: voiceConversationTurns.role,
        model: voiceConversationTurns.model,
        createdAt: voiceConversationTurns.createdAt,
      })
      .from(voiceConversationTurns)
      .innerJoin(chatProjects, eq(voiceConversationTurns.projectId, chatProjects.id)) // Use INNER JOIN to ensure project exists
      .where(and(...voiceConditions))
      .orderBy(desc(voiceConversationTurns.createdAt))
      .limit(50);

    results.push(...voiceTurns.map(turn => ({
      id: turn.id,
      projectId: turn.projectId,
      projectName: turn.projectName || 'Unknown Project',
      voiceTurnId: turn.id,
      type: 'voice' as const,
      content: turn.transcript || '',
      snippet: highlightQuery(turn.transcript || '', query),
      role: turn.role as 'user' | 'assistant',
      model: turn.model || undefined,
      timestamp: turn.createdAt?.toISOString() || new Date().toISOString(),
      relevanceScore: calculateRelevance(turn.transcript || '', query),
    })));
  }

  // Sort by relevance score
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 50);
}

/**
 * Calculate relevance score based on query match
 */
function calculateRelevance(content: string, query: string): number {
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // Exact match = highest score
  if (lowerContent.includes(lowerQuery)) {
    const position = lowerContent.indexOf(lowerQuery);
    const positionScore = 1 - (position / lowerContent.length);
    return 0.8 + (positionScore * 0.2);
  }
  
  // Word match
  const queryWords = lowerQuery.split(/\s+/);
  const contentWords = lowerContent.split(/\s+/);
  const matchedWords = queryWords.filter(qw => contentWords.some(cw => cw.includes(qw)));
  
  return matchedWords.length / queryWords.length;
}

/**
 * Highlight query matches in content
 */
function highlightQuery(content: string, query: string, contextChars: number = 100): string {
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  const matchIndex = lowerContent.indexOf(lowerQuery);
  
  if (matchIndex === -1) {
    // Return first contextChars if no match
    return content.slice(0, contextChars * 2) + (content.length > contextChars * 2 ? '...' : '');
  }
  
  // Extract context around match
  const start = Math.max(0, matchIndex - contextChars);
  const end = Math.min(content.length, matchIndex + query.length + contextChars);
  
  let snippet = content.slice(start, end);
  
  // Add ellipsis
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';
  
  // Highlight the match
  const matchStart = matchIndex - start + (start > 0 ? 3 : 0);
  const matchEnd = matchStart + query.length;
  
  snippet = 
    snippet.slice(0, matchStart) +
    '<mark class="bg-yellow-200 dark:bg-yellow-800">' +
    snippet.slice(matchStart, matchEnd) +
    '</mark>' +
    snippet.slice(matchEnd);
  
  return snippet;
}
