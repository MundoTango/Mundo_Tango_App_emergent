/**
 * TRACK B: Conversation Export Service
 * MB.MD SIMULTANEOUS BUILD - Oct 23, 2025
 * Agent #129 (Services)
 * 
 * Multi-format conversation export (PDF, Markdown, JSON, TXT)
 */

import { db } from '../db';
import { aiChatMessages, voiceConversationTurns, chatProjects } from '@shared/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { format } from 'date-fns';

export interface ExportOptions {
  projectId: number;
  format: 'pdf' | 'markdown' | 'json' | 'txt';
  includeMessages: boolean;
  includeVoice: boolean;
  includeMetadata: boolean;
  includeTimestamps: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ExportData {
  project: {
    id: number;
    name: string;
    description?: string;
    createdAt: Date;
  };
  messages: Array<{
    id: number;
    role: string;
    content: string;
    model?: string;
    tokens?: number;
    timestamp: Date;
  }>;
  voiceTurns: Array<{
    id: number;
    role: string;
    transcript: string;
    model?: string;
    duration?: number;
    language?: string;
    timestamp: Date;
  }>;
  metadata: {
    totalMessages: number;
    totalVoiceTurns: number;
    dateRange: { from: Date; to: Date };
    exportedAt: Date;
  };
}

/**
 * Fetch conversation data for export
 */
export async function fetchExportData(options: ExportOptions, userId: number): Promise<ExportData> {
  const { projectId, includeMessages, includeVoice, dateFrom, dateTo } = options;

  // Fetch project details and verify ownership
  const [project] = await db
    .select()
    .from(chatProjects)
    .where(
      and(
        eq(chatProjects.id, projectId),
        eq(chatProjects.userId, userId) // SECURITY: Verify user owns this project
      )
    )
    .limit(1);

  if (!project) {
    throw new Error('Project not found or access denied');
  }

  let messages: any[] = [];
  let voiceTurns: any[] = [];

  // Fetch text messages
  if (includeMessages) {
    const conditions = [eq(aiChatMessages.projectId, projectId)];
    
    if (dateFrom) conditions.push(gte(aiChatMessages.createdAt, dateFrom));
    if (dateTo) conditions.push(lte(aiChatMessages.createdAt, dateTo));

    messages = await db
      .select()
      .from(aiChatMessages)
      .where(and(...conditions))
      .orderBy(aiChatMessages.createdAt);
  }

  // Fetch voice turns
  if (includeVoice) {
    const conditions = [eq(voiceConversationTurns.projectId, projectId)];
    
    if (dateFrom) conditions.push(gte(voiceConversationTurns.createdAt, dateFrom));
    if (dateTo) conditions.push(lte(voiceConversationTurns.createdAt, dateTo));

    voiceTurns = await db
      .select()
      .from(voiceConversationTurns)
      .where(and(...conditions))
      .orderBy(voiceConversationTurns.createdAt);
  }

  // Calculate date range
  const allDates = [
    ...messages.map(m => m.createdAt),
    ...voiceTurns.map(v => v.createdAt),
  ].filter(Boolean);

  const dateRange = {
    from: allDates.length > 0 ? new Date(Math.min(...allDates.map(d => d.getTime()))) : new Date(),
    to: allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))) : new Date(),
  };

  return {
    project: {
      id: project.id,
      name: project.name,
      description: project.description || undefined,
      createdAt: project.createdAt || new Date(),
    },
    messages: messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      model: m.model,
      tokens: m.tokens,
      timestamp: m.createdAt || new Date(),
    })),
    voiceTurns: voiceTurns.map(v => ({
      id: v.id,
      role: v.role,
      transcript: v.transcript || '',
      model: v.model,
      duration: v.audioDuration,
      language: v.language,
      timestamp: v.createdAt || new Date(),
    })),
    metadata: {
      totalMessages: messages.length,
      totalVoiceTurns: voiceTurns.length,
      dateRange,
      exportedAt: new Date(),
    },
  };
}

/**
 * Export to Markdown format
 */
export function exportToMarkdown(data: ExportData, options: ExportOptions): string {
  const { includeMetadata, includeTimestamps } = options;
  
  let md = `# ${data.project.name}\n\n`;
  
  if (data.project.description) {
    md += `${data.project.description}\n\n`;
  }

  if (includeMetadata) {
    md += `## Metadata\n\n`;
    md += `- **Total Messages:** ${data.metadata.totalMessages}\n`;
    md += `- **Total Voice Turns:** ${data.metadata.totalVoiceTurns}\n`;
    md += `- **Date Range:** ${format(data.metadata.dateRange.from, 'PPP')} - ${format(data.metadata.dateRange.to, 'PPP')}\n`;
    md += `- **Exported:** ${format(data.metadata.exportedAt, 'PPPpp')}\n\n`;
  }

  md += `## Conversation\n\n`;

  // Combine and sort all turns
  const allTurns = [
    ...data.messages.map(m => ({ ...m, type: 'text' as const })),
    ...data.voiceTurns.map(v => ({ ...v, type: 'voice' as const, content: v.transcript })),
  ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  for (const turn of allTurns) {
    const emoji = turn.role === 'user' ? '👤' : '🤖';
    const typeLabel = turn.type === 'voice' ? ' 🎤' : '';
    
    md += `### ${emoji} ${turn.role.charAt(0).toUpperCase() + turn.role.slice(1)}${typeLabel}\n\n`;
    
    if (includeTimestamps) {
      md += `*${format(turn.timestamp, 'PPpp')}*\n\n`;
    }
    
    md += `${turn.content}\n\n`;
    
    if (includeMetadata && turn.model) {
      md += `*Model: ${turn.model}*\n\n`;
    }
    
    md += `---\n\n`;
  }

  return md;
}

/**
 * Export to JSON format
 */
export function exportToJSON(data: ExportData, options: ExportOptions): string {
  const { includeMetadata } = options;
  
  const output: any = {
    project: data.project,
    messages: data.messages,
    voiceTurns: data.voiceTurns,
  };

  if (includeMetadata) {
    output.metadata = data.metadata;
  }

  return JSON.stringify(output, null, 2);
}

/**
 * Export to plain text format
 */
export function exportToText(data: ExportData, options: ExportOptions): string {
  const { includeTimestamps } = options;
  
  let txt = `${data.project.name}\n`;
  txt += `${'='.repeat(data.project.name.length)}\n\n`;

  // Combine and sort all turns
  const allTurns = [
    ...data.messages.map(m => ({ ...m, type: 'text' as const })),
    ...data.voiceTurns.map(v => ({ ...v, type: 'voice' as const, content: v.transcript })),
  ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  for (const turn of allTurns) {
    const label = turn.role === 'user' ? 'You' : 'Mr Blue';
    const typeLabel = turn.type === 'voice' ? ' (Voice)' : '';
    
    txt += `${label}${typeLabel}:\n`;
    
    if (includeTimestamps) {
      txt += `[${format(turn.timestamp, 'PPpp')}]\n`;
    }
    
    txt += `${turn.content}\n\n`;
    txt += `${'-'.repeat(50)}\n\n`;
  }

  return txt;
}

/**
 * Export to PDF format (placeholder - requires library)
 */
export async function exportToPDF(data: ExportData, options: ExportOptions): Promise<Buffer> {
  // TODO: Implement PDF export using library like puppeteer or pdfkit
  // For now, return markdown as buffer
  const markdown = exportToMarkdown(data, options);
  return Buffer.from(markdown, 'utf-8');
}

/**
 * Main export function
 */
export async function exportConversation(options: ExportOptions, userId: number): Promise<{ content: string | Buffer; filename: string }> {
  const data = await fetchExportData(options, userId);
  
  const timestamp = format(new Date(), 'yyyy-MM-dd');
  const safeName = data.project.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();

  let content: string | Buffer;
  let extension: string;

  switch (options.format) {
    case 'markdown':
      content = exportToMarkdown(data, options);
      extension = 'md';
      break;
    
    case 'json':
      content = exportToJSON(data, options);
      extension = 'json';
      break;
    
    case 'txt':
      content = exportToText(data, options);
      extension = 'txt';
      break;
    
    case 'pdf':
      content = await exportToPDF(data, options);
      extension = 'pdf';
      break;
    
    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }

  const filename = `${safeName}-${timestamp}.${extension}`;

  return { content, filename };
}
