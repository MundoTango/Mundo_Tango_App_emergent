/**
 * TRACK C: Mr Blue Coordinator Service
 * 
 * Tracks user edits in Visual Editor, summarizes changes with AI,
 * requests confirmation, and broadcasts changes to affected agents.
 */

import { db } from '@db';
import { 
  userEditSessions, 
  trackedChanges,
  type InsertUserEditSession,
  type InsertTrackedChange 
} from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class MrBlueCoordinator {
  /**
   * Start tracking a Visual Editor session
   */
  async startTrackingSession(userId: number, pagePath: string, componentPath?: string) {
    const sessionData: InsertUserEditSession = {
      userId,
      pagePath,
      componentPath: componentPath || null,
      status: 'active'
    };

    const [session] = await db
      .insert(userEditSessions)
      .values(sessionData)
      .returning();

    return session;
  }

  /**
   * Capture a change made in Visual Editor
   */
  async captureChange(
    sessionId: number,
    changeType: 'move' | 'resize' | 'style' | 'text' | 'delete' | 'add',
    componentId: string,
    beforeState: any,
    afterState: any
  ) {
    // Calculate delta (what changed)
    const delta = this.calculateDelta(beforeState, afterState, changeType);

    // Identify affected agents
    const affectedAgents = await this.identifyAffectedAgents(componentId, changeType, delta);

    // Generate AI summary
    const aiSummary = await this.generateAISummary(changeType, componentId, delta);

    const changeData: InsertTrackedChange = {
      sessionId,
      changeType,
      componentId,
      beforeState,
      afterState,
      changeDelta: delta,
      aiSummary,
      affectedAgents
    };

    const [change] = await db
      .insert(trackedChanges)
      .values(changeData)
      .returning();

    // Update session change count
    await db
      .update(userEditSessions)
      .set({ 
        totalChanges: db
          .select()
          .from(trackedChanges)
          .where(eq(trackedChanges.sessionId, sessionId))
          .then(changes => changes.length)
      })
      .where(eq(userEditSessions.id, sessionId));

    return change;
  }

  /**
   * Calculate what changed between before and after states
   */
  private calculateDelta(before: any, after: any, changeType: string) {
    const delta: any = { type: changeType };

    switch (changeType) {
      case 'move':
        delta.position = {
          from: { x: before.x, y: before.y },
          to: { x: after.x, y: after.y },
          deltaX: after.x - before.x,
          deltaY: after.y - before.y
        };
        break;

      case 'resize':
        delta.size = {
          from: { width: before.width, height: before.height },
          to: { width: after.width, height: after.height }
        };
        break;

      case 'style':
        delta.styles = this.diffObjects(before.styles, after.styles);
        break;

      case 'text':
        delta.text = {
          from: before.text,
          to: after.text
        };
        break;

      case 'delete':
        delta.deletedComponent = before;
        break;

      case 'add':
        delta.addedComponent = after;
        break;
    }

    return delta;
  }

  /**
   * Simple object diff utility
   */
  private diffObjects(before: any, after: any) {
    const diff: any = {};
    const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);

    allKeys.forEach(key => {
      if (before[key] !== after[key]) {
        diff[key] = { from: before[key], to: after[key] };
      }
    });

    return diff;
  }

  /**
   * Generate AI summary of the change
   */
  private async generateAISummary(
    changeType: string,
    componentId: string,
    delta: any
  ): Promise<string> {
    const prompt = `Summarize this UI change in one clear sentence:

Component: ${componentId}
Change Type: ${changeType}
Delta: ${JSON.stringify(delta, null, 2)}

Example output: "Moved LoginButton 50px to the right and changed background color from blue to green"`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 100
      });

      return completion.choices[0].message.content || `${changeType} ${componentId}`;
    } catch (error) {
      // Fallback to simple summary
      return this.generateFallbackSummary(changeType, componentId, delta);
    }
  }

  /**
   * Fallback summary if AI fails
   */
  private generateFallbackSummary(changeType: string, componentId: string, delta: any): string {
    switch (changeType) {
      case 'move':
        return `Moved ${componentId} ${delta.position.deltaX}px horizontally, ${delta.position.deltaY}px vertically`;
      case 'resize':
        return `Resized ${componentId} to ${delta.size.to.width}×${delta.size.to.height}`;
      case 'style':
        return `Changed styles on ${componentId}`;
      case 'text':
        return `Updated text in ${componentId}`;
      case 'delete':
        return `Deleted ${componentId}`;
      case 'add':
        return `Added ${componentId}`;
      default:
        return `Modified ${componentId}`;
    }
  }

  /**
   * Identify which agents are affected by this change
   */
  private async identifyAffectedAgents(
    componentId: string,
    changeType: string,
    delta: any
  ): Promise<string[]> {
    const affected: string[] = [];

    // Always notify the component agent itself
    affected.push(`COMPONENT-${componentId.toUpperCase()}`);

    // Notify parent page agent
    affected.push('PAGE-AGENT'); // Would extract from context

    // Notify design system if style change
    if (changeType === 'style') {
      affected.push('LAYER-9-UI-FRAMEWORK');
      affected.push('LAYER-10-COMPONENT-LIBRARY');
    }

    // Notify accessibility if layout change
    if (changeType === 'move' || changeType === 'resize') {
      affected.push('LAYER-54-ACCESSIBILITY');
    }

    // Notify performance if adding components
    if (changeType === 'add') {
      affected.push('LAYER-48-PERFORMANCE');
    }

    return affected;
  }

  /**
   * Summarize all changes in a session
   */
  async summarizeChanges(sessionId: number) {
    const changes = await db
      .select()
      .from(trackedChanges)
      .where(eq(trackedChanges.sessionId, sessionId))
      .orderBy(trackedChanges.timestamp);

    if (changes.length === 0) {
      return 'No changes made';
    }

    // Group by component
    const byComponent: Record<string, any[]> = {};
    changes.forEach(change => {
      if (!byComponent[change.componentId]) {
        byComponent[change.componentId] = [];
      }
      byComponent[change.componentId].push(change);
    });

    // Build summary
    const summary = Object.entries(byComponent).map(([componentId, changes]) => {
      const changeSummaries = changes.map(c => c.aiSummary || 'Change made').join('; ');
      return `• ${componentId}: ${changeSummaries}`;
    }).join('\n');

    return summary;
  }

  /**
   * Request user confirmation
   */
  async requestConfirmation(sessionId: number) {
    const summary = await this.summarizeChanges(sessionId);

    await db
      .update(userEditSessions)
      .set({ status: 'awaiting_confirmation' })
      .where(eq(userEditSessions.id, sessionId));

    return {
      sessionId,
      summary,
      question: 'Are these the changes you want to make?',
      actions: ['confirm', 'cancel', 'modify']
    };
  }

  /**
   * User confirms changes - broadcast to agents
   */
  async confirmChanges(sessionId: number) {
    // Mark all changes as confirmed
    await db
      .update(trackedChanges)
      .set({ userConfirmed: true })
      .where(eq(trackedChanges.sessionId, sessionId));

    // Update session status
    await db
      .update(userEditSessions)
      .set({ 
        status: 'confirmed',
        sessionEnd: new Date()
      })
      .where(eq(userEditSessions.id, sessionId));

    // Get all affected agents
    const changes = await db
      .select()
      .from(trackedChanges)
      .where(eq(trackedChanges.sessionId, sessionId));

    const allAffectedAgents = Array.from(
      new Set(changes.flatMap(c => c.affectedAgents || []))
    );

    return {
      confirmed: true,
      affectedAgents: allAffectedAgents,
      totalChanges: changes.length
    };
  }

  /**
   * Cancel session
   */
  async cancelSession(sessionId: number) {
    await db
      .update(userEditSessions)
      .set({ 
        status: 'cancelled',
        sessionEnd: new Date()
      })
      .where(eq(userEditSessions.id, sessionId));
  }

  /**
   * Get session details
   */
  async getSession(sessionId: number) {
    const [session] = await db
      .select()
      .from(userEditSessions)
      .where(eq(userEditSessions.id, sessionId));

    if (!session) return null;

    const changes = await db
      .select()
      .from(trackedChanges)
      .where(eq(trackedChanges.sessionId, sessionId))
      .orderBy(trackedChanges.timestamp);

    return {
      ...session,
      changes
    };
  }
}

export const mrBlueCoordinator = new MrBlueCoordinator();
