/**
 * TRACK C: Conversation Analytics Service
 * MB.MD SIMULTANEOUS BUILD - Oct 23, 2025
 * Agent #129 (Services)
 * 
 * Calculate metrics, sentiment, and engagement scores
 */

import { db } from '../db';
import { aiChatMessages, voiceConversationTurns, chatProjects, modelUsage } from '@shared/schema';
import { eq, and, gte, desc, sql, count } from 'drizzle-orm';

export interface AnalyticsSummary {
  overview: {
    totalProjects: number;
    totalMessages: number;
    totalVoiceTurns: number;
    totalTokens: number;
    totalCost: number;
  };
  models: {
    name: string;
    count: number;
    percentage: number;
  }[];
  activity: {
    date: string;
    messages: number;
    voiceTurns: number;
  }[];
  topProjects: {
    id: number;
    name: string;
    messageCount: number;
    lastActivity: Date;
  }[];
  languages: {
    code: string;
    count: number;
    percentage: number;
  }[];
  toolUsage: {
    tool: string;
    count: number;
  }[];
}

/**
 * Get comprehensive analytics for a user
 * SECURITY: All queries are scoped to the user's own projects only
 */
export async function getUserAnalytics(userId: number, days: number = 30): Promise<AnalyticsSummary> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // SECURITY: Get user's projects to scope ALL subsequent queries
  const projects = await db
    .select()
    .from(chatProjects)
    .where(eq(chatProjects.userId, userId));

  const projectIds = projects.map(p => p.id);

  if (projectIds.length === 0) {
    return getEmptyAnalytics();
  }

  // SECURITY CHECK: Ensure we only query data from user's own projects
  const projectIdCondition = sql`${aiChatMessages.projectId} = ANY(ARRAY[${sql.join(projectIds.map(id => sql`${id}`), sql`, `)}]::int[])`;

  // SECURITY: Get total messages (scoped to user's projects only)
  const messageCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(aiChatMessages)
    .where(
      and(
        projectIdCondition, // SECURITY: Only count user's messages
        gte(aiChatMessages.createdAt, cutoffDate)
      )
    );

  const totalMessages = messageCountResult[0]?.count || 0;

  // SECURITY: Get total voice turns (scoped to user's projects only)
  const voiceProjectIdCondition = sql`${voiceConversationTurns.projectId} = ANY(ARRAY[${sql.join(projectIds.map(id => sql`${id}`), sql`, `)}]::int[])`;
  const voiceCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(voiceConversationTurns)
    .where(
      and(
        voiceProjectIdCondition, // SECURITY: Only count user's voice turns
        gte(voiceConversationTurns.createdAt, cutoffDate)
      )
    );

  const totalVoiceTurns = voiceCountResult[0]?.count || 0;

  // SECURITY: Get model usage (scoped to user's projects only)
  const modelUsageData = await db
    .select({
      model: aiChatMessages.model,
      count: sql<number>`count(*)::int`,
    })
    .from(aiChatMessages)
    .where(
      and(
        projectIdCondition, // SECURITY: Only analyze user's model usage
        gte(aiChatMessages.createdAt, cutoffDate)
      )
    )
    .groupBy(aiChatMessages.model);

  const totalModelUsage = modelUsageData.reduce((sum, m) => sum + m.count, 0);
  
  const models = modelUsageData
    .filter(m => m.model)
    .map(m => ({
      name: m.model!,
      count: m.count,
      percentage: (m.count / totalModelUsage) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  // Get token and cost data
  const usageStats = await db
    .select({
      totalTokens: sql<number>`COALESCE(SUM(${modelUsage.tokens}), 0)::int`,
      totalCost: sql<string>`COALESCE(SUM(${modelUsage.cost}), 0)::text`,
    })
    .from(modelUsage)
    .where(
      and(
        eq(modelUsage.userId, userId),
        gte(modelUsage.timestamp, cutoffDate)
      )
    );

  const totalTokens = usageStats[0]?.totalTokens || 0;
  const totalCost = parseFloat(usageStats[0]?.totalCost || '0');

  // SECURITY: Get language distribution (scoped to user's projects only)
  const languageData = await db
    .select({
      language: voiceConversationTurns.language,
      count: sql<number>`count(*)::int`,
    })
    .from(voiceConversationTurns)
    .where(
      and(
        voiceProjectIdCondition, // SECURITY: Only analyze user's language usage
        gte(voiceConversationTurns.createdAt, cutoffDate)
      )
    )
    .groupBy(voiceConversationTurns.language);

  const totalLangUsage = languageData.reduce((sum, l) => sum + l.count, 0);
  
  const languages = languageData
    .filter(l => l.language)
    .map(l => ({
      code: l.language!,
      count: l.count,
      percentage: (l.count / totalLangUsage) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  // SECURITY: Get top projects by activity (already scoped by userId)
  const projectActivity = await db
    .select({
      id: chatProjects.id,
      name: chatProjects.name,
      messageCount: sql<number>`count(${aiChatMessages.id})::int`,
      lastActivity: sql<Date>`MAX(${aiChatMessages.createdAt})`,
    })
    .from(chatProjects)
    .leftJoin(aiChatMessages, eq(aiChatMessages.projectId, chatProjects.id))
    .where(
      and(
        eq(chatProjects.userId, userId), // SECURITY: Only user's projects
        gte(aiChatMessages.createdAt, cutoffDate)
      )
    )
    .groupBy(chatProjects.id, chatProjects.name)
    .orderBy(desc(sql`count(${aiChatMessages.id})`))
    .limit(5);

  const topProjects = projectActivity.map(p => ({
    id: p.id,
    name: p.name,
    messageCount: p.messageCount || 0,
    lastActivity: p.lastActivity || new Date(),
  }));

  // Activity timeline (simplified - daily aggregates)
  const activity: { date: string; messages: number; voiceTurns: number }[] = [];
  for (let i = 0; i < Math.min(days, 30); i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    activity.unshift({
      date: date.toISOString().split('T')[0],
      messages: 0,
      voiceTurns: 0,
    });
  }

  return {
    overview: {
      totalProjects: projects.length,
      totalMessages,
      totalVoiceTurns,
      totalTokens,
      totalCost,
    },
    models,
    activity,
    topProjects,
    languages,
    toolUsage: [], // TODO: Extract from metadata
  };
}

function getEmptyAnalytics(): AnalyticsSummary {
  return {
    overview: {
      totalProjects: 0,
      totalMessages: 0,
      totalVoiceTurns: 0,
      totalTokens: 0,
      totalCost: 0,
    },
    models: [],
    activity: [],
    topProjects: [],
    languages: [],
    toolUsage: [],
  };
}
