/**
 * Agent Intelligence Network API Routes
 * 
 * 20 endpoints across 4 tracks:
 * - Track A: Learning & Memory (5 endpoints)
 * - Track B: Collaboration (5 endpoints)
 * - Track C: Mr Blue Coordination (5 endpoints)
 * - Track D: Component Agents (5 endpoints)
 */

import { Router } from 'express';
import { agentMemoryService } from '../services/agent-intelligence/AgentMemoryService';
import { agentSelfTestFramework } from '../services/agent-intelligence/AgentSelfTestFramework';
import { agentCollaborationService } from '../services/agent-intelligence/AgentCollaborationService';
import { agentEscalationService } from '../services/agent-intelligence/AgentEscalationService';
import { mrBlueCoordinator } from '../services/agent-intelligence/MrBlueCoordinator';
import { changeBroadcastService } from '../services/agent-intelligence/ChangeBroadcastService';
import ComponentAgent from '../agents/ComponentAgent';

const router = Router();

// ============================================================================
// TRACK A: Learning & Memory APIs
// ============================================================================

/**
 * POST /api/agent-intelligence/learn
 * Record a learning event for an agent
 */
router.post('/learn', async (req, res) => {
  try {
    const { agentId, learningType, context, lessonLearned, confidenceScore, metadata } = req.body;

    const learning = await agentMemoryService.recordLearning({
      agentId,
      learningType,
      context,
      lessonLearned,
      confidenceScore,
      metadata
    });

    res.json({
      success: true,
      learning,
      message: 'Learning recorded successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/learnings/recent
 * Get recent learnings across all agents
 */
router.get('/learnings/recent', async (req, res) => {
  try {
    const { limit } = req.query;
    const { db } = await import('../db');
    const { agentLearnings } = await import('../../shared/schema');
    const { desc } = await import('drizzle-orm');
    
    const learnings = await db
      .select()
      .from(agentLearnings)
      .orderBy(desc(agentLearnings.id))
      .limit(limit ? parseInt(limit as string) : 10);

    res.json({ learnings, count: learnings.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/:agentId/learnings
 * Get agent's past learnings
 */
router.get('/:agentId/learnings', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { topic, limit } = req.query;

    const learnings = await agentMemoryService.getLearnings(
      agentId,
      topic as string,
      limit ? parseInt(limit as string) : 10
    );

    res.json({ learnings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/:agentId/expertise
 * Calculate agent's expertise score
 */
router.get('/:agentId/expertise', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { domain } = req.query;

    const expertise = await agentMemoryService.calculateExpertise(
      agentId,
      domain as string
    );

    res.json({ expertise });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/knowledge/search
 * Search knowledge base across all agents
 */
router.post('/knowledge/search', async (req, res) => {
  try {
    const { query, tags, limit } = req.body;

    const knowledge = await agentMemoryService.searchKnowledge(
      query,
      tags,
      limit || 20
    );

    res.json({ knowledge, count: knowledge.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/knowledge
 * Get all knowledge base entries
 */
router.get('/knowledge', async (req, res) => {
  try {
    const { limit } = req.query;
    const { db } = await import('../db');
    const { agentKnowledgeBase } = await import('../../shared/schema');
    
    const knowledge = await db
      .select()
      .from(agentKnowledgeBase)
      .limit(limit ? parseInt(limit as string) : 20);
    
    res.json({ knowledge, count: knowledge.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/knowledge/contribute
 * Share knowledge to collective knowledge base
 */
router.post('/knowledge/contribute', async (req, res) => {
  try {
    const { topic, sourceAgent, knowledgeType, content, tags } = req.body;

    const knowledge = await agentMemoryService.shareKnowledge({
      topic,
      sourceAgent,
      knowledgeType,
      content,
      tags
    });

    res.json({
      success: true,
      knowledge,
      message: 'Knowledge contributed successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// TRACK A: Self-Testing APIs
// ============================================================================

/**
 * GET /api/agent-intelligence/tests/recent
 * Get recent test results across all agents
 */
router.get('/tests/recent', async (req, res) => {
  try {
    const { limit } = req.query;
    const { db } = await import('../db');
    const { agentSelfTests } = await import('../../shared/schema');
    const { desc } = await import('drizzle-orm');
    
    const tests = await db
      .select()
      .from(agentSelfTests)
      .orderBy(desc(agentSelfTests.id))
      .limit(limit ? parseInt(limit as string) : 10);

    res.json({ tests, count: tests.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/:agentId/self-test
 * Run self-test for an agent
 */
router.post('/:agentId/self-test', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { testType } = req.body;

    const result = await agentSelfTestFramework.runSelfTest(agentId, testType);

    res.json({
      success: true,
      result,
      message: `${testType} test completed`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/:agentId/test-history
 * Get test history for an agent
 */
router.get('/:agentId/test-history', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const history = await agentSelfTestFramework.getTestHistory(agentId);

    res.json({ history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/:agentId/health
 * Get agent health score
 */
router.get('/:agentId/health', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const healthScore = await agentSelfTestFramework.getHealthScore(agentId);

    res.json({ 
      agentId,
      healthScore,
      status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// TRACK B: Collaboration APIs
// ============================================================================

/**
 * GET /api/agent-intelligence/messages/recent
 * Get recent messages across all agents
 */
router.get('/messages/recent', async (req, res) => {
  try {
    const { limit } = req.query;
    const { db } = await import('../db');
    const { agentCommunications } = await import('../../shared/schema');
    const { desc } = await import('drizzle-orm');
    
    const messages = await db
      .select()
      .from(agentCommunications)
      .orderBy(desc(agentCommunications.id))
      .limit(limit ? parseInt(limit as string) : 10);

    res.json({ messages, count: messages.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/:agentId/message
 * Send message from one agent to another
 */
router.post('/:agentId/message', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { toAgent, messageType, subject, content, priority, requiresResponse } = req.body;

    const message = await agentCollaborationService.sendMessage({
      fromAgent: agentId,
      toAgent,
      messageType,
      subject,
      content,
      priority,
      requiresResponse
    });

    res.json({
      success: true,
      message,
      messageId: message.id
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/:agentId/inbox
 * Get agent's inbox (messages)
 */
router.get('/:agentId/inbox', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { unreadOnly } = req.query;

    const inbox = await agentCollaborationService.getInbox(
      agentId,
      unreadOnly === 'true'
    );

    res.json({ inbox, count: inbox.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/collaborations/recent
 * Get recent collaborations across all agents
 */
router.get('/collaborations/recent', async (req, res) => {
  try {
    const { limit } = req.query;
    const { db } = await import('../db');
    const { agentCollaborations } = await import('../../shared/schema');
    const { desc } = await import('drizzle-orm');
    
    const collaborations = await db
      .select()
      .from(agentCollaborations)
      .orderBy(desc(agentCollaborations.id))
      .limit(limit ? parseInt(limit as string) : 10);

    res.json({ collaborations, count: collaborations.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/collaborate/start
 * Start a collaboration session
 */
router.post('/collaborate/start', async (req, res) => {
  try {
    const { collaborationType, leaderAgent, participantAgents, goal } = req.body;

    const collaboration = await agentCollaborationService.initiateCollaboration({
      collaborationType,
      leaderAgent,
      participantAgents,
      goal
    });

    res.json({
      success: true,
      collaboration,
      collaborationId: collaboration.id
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/agent-intelligence/collaborate/:id/update
 * Update collaboration progress
 */
router.put('/collaborate/:id/update', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progress } = req.body;

    const updated = await agentCollaborationService.updateProgress(
      parseInt(id),
      status,
      progress
    );

    res.json({
      success: true,
      collaboration: updated
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/escalate
 * Escalate issue through hierarchy
 */
router.post('/escalate', async (req, res) => {
  try {
    const { agentId, issue, severity, context, attemptedFixes } = req.body;
    const { level } = req.query;

    const escalation = await agentEscalationService.escalateIssue({
      agentId,
      issue,
      severity,
      context,
      attemptedFixes
    }, level as any || 'peer');

    res.json({
      success: true,
      escalation,
      message: `Issue escalated to ${escalation.escalationLevel} level`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// TRACK C: Mr Blue Coordination APIs
// ============================================================================

/**
 * POST /api/agent-intelligence/mr-blue/track/start
 * Start Visual Editor tracking session
 */
router.post('/mr-blue/track/start', async (req, res) => {
  try {
    const { userId, pagePath, componentPath } = req.body;

    const session = await mrBlueCoordinator.startTrackingSession(
      userId,
      pagePath,
      componentPath
    );

    res.json({
      success: true,
      session,
      sessionId: session.id
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/mr-blue/track/change
 * Capture a change in Visual Editor
 */
router.post('/mr-blue/track/change', async (req, res) => {
  try {
    const { sessionId, changeType, componentId, beforeState, afterState } = req.body;

    const change = await mrBlueCoordinator.captureChange(
      sessionId,
      changeType,
      componentId,
      beforeState,
      afterState
    );

    res.json({
      success: true,
      change,
      aiSummary: change.aiSummary
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/mr-blue/track/:id/summary
 * Get AI summary of session changes
 */
router.get('/mr-blue/track/:id/summary', async (req, res) => {
  try {
    const { id } = req.params;

    const summary = await mrBlueCoordinator.summarizeChanges(parseInt(id));
    const confirmation = await mrBlueCoordinator.requestConfirmation(parseInt(id));

    res.json({
      summary,
      confirmation
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/mr-blue/broadcast
 * Broadcast confirmed changes to agents
 */
router.post('/mr-blue/broadcast', async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Confirm changes
    const confirmed = await mrBlueCoordinator.confirmChanges(sessionId);

    // Get session changes
    const session = await mrBlueCoordinator.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Create broadcast package
    const broadcastPackage = changeBroadcastService.packageChange(
      session.changes,
      confirmed.affectedAgents
    );

    // Broadcast to agents
    const broadcast = await changeBroadcastService.broadcastToAgents(broadcastPackage);

    res.json({
      success: true,
      broadcast,
      affectedAgents: confirmed.affectedAgents
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/mr-blue/broadcast/:id/status
 * Check broadcast status
 */
router.get('/mr-blue/broadcast/:id/status', async (req, res) => {
  try {
    const { id } = req.params;

    const progress = await changeBroadcastService.monitorProgress(id);

    res.json({ progress });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// TRACK D: Component Agent APIs
// ============================================================================

/**
 * GET /api/agent-intelligence/components
 * List all component agents
 */
router.get('/components', async (req, res) => {
  try {
    const { db } = await import('../db');
    const { componentAgents } = await import('../../shared/schema');

    const components = await db.select().from(componentAgents);

    res.json({ components, count: components.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/components/register
 * Register a new component as an agent
 */
router.post('/components/register', async (req, res) => {
  try {
    const { componentName, componentPath, componentType } = req.body;

    const agent = new ComponentAgent(componentName, componentPath, componentType);
    const registered = await agent.initialize();

    res.json({
      success: true,
      component: registered,
      agentId: agent.agentId
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/components/:name/status
 * Get component agent status
 */
router.get('/components/:name/status', async (req, res) => {
  try {
    const { name } = req.params;

    const agent = new ComponentAgent(name, `/components/${name}`, 'layout');
    await agent.initialize();
    
    const status = await agent.getStatus();

    res.json({ status });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/components/:name/autonomous-cycle
 * Run autonomous learning cycle for component
 */
router.post('/components/:name/autonomous-cycle', async (req, res) => {
  try {
    const { name } = req.params;
    const { type } = req.body;

    const agent = new ComponentAgent(name, `/components/${name}`, type || 'layout');
    await agent.initialize();
    
    const cycleResult = await agent.autonomousCycle();

    res.json({
      success: true,
      cycleResult,
      message: 'Autonomous cycle completed'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/activities
 * Get recent agent activities across all agents
 */
router.get('/activities', async (req, res) => {
  try {
    const { limit } = req.query;
    const { db } = await import('../db');
    const { agentMemories, agentSelfTests, agentCommunications } = await import('../../shared/schema');
    const { desc } = await import('drizzle-orm');
    
    // Get recent learnings, tests, and communications
    const [recentLearnings, recentTests, recentMessages] = await Promise.all([
      db.select().from(agentMemories).orderBy(desc(agentMemories.createdAt)).limit(5),
      db.select().from(agentSelfTests).orderBy(desc(agentSelfTests.runAt)).limit(5),
      db.select().from(agentCommunications).orderBy(desc(agentCommunications.createdAt)).limit(5)
    ]);
    
    // Combine and sort by timestamp
    const activities = [
      ...recentLearnings.map(l => ({ type: 'learning', ...l, timestamp: l.createdAt })),
      ...recentTests.map(t => ({ type: 'test', ...t, timestamp: t.runAt })),
      ...recentMessages.map(m => ({ type: 'message', ...m, timestamp: m.createdAt }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, parseInt(limit as string) || 10);
    
    res.json({ activities, count: activities.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/stats
 * Get overall system statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const { db } = await import('../db');
    const { 
      agentMemories, 
      agentSelfTests, 
      agentKnowledgeBase,
      agentCommunications,
      agentCollaborations,
      componentAgents 
    } = await import('../../shared/schema');

    const [
      totalLearnings,
      totalTests,
      totalKnowledge,
      totalMessages,
      totalCollaborations,
      totalComponents
    ] = await Promise.all([
      db.select().from(agentMemories).then(r => r.length),
      db.select().from(agentSelfTests).then(r => r.length),
      db.select().from(agentKnowledgeBase).then(r => r.length),
      db.select().from(agentCommunications).then(r => r.length),
      db.select().from(agentCollaborations).then(r => r.length),
      db.select().from(componentAgents).then(r => r.length)
    ]);

    res.json({
      stats: {
        totalLearnings,
        totalTests,
        totalKnowledge,
        totalMessages,
        totalCollaborations,
        totalComponents,
        systemHealth: 'operational'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
