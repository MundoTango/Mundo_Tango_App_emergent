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
import { mlConfidenceScorer } from '../services/agent-intelligence/MLConfidenceScorer';
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

// ============================================================================
// PHASE 7: AUTO-FIX & ML INTELLIGENCE APIS
// ============================================================================

/**
 * POST /api/agent-intelligence/:agentId/auto-fix
 * Trigger automated issue resolution
 */
router.post('/:agentId/auto-fix', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { issueId, dryRun = false } = req.body;
    const { autoFixEngine } = await import('../services/agent-intelligence/AutoFixEngine');
    const { db } = await import('../db');
    const { agentSelfTests } = await import('../../shared/schema');
    const { eq } = await import('drizzle-orm');

    // Get the test/issue
    const [test] = await db.select()
      .from(agentSelfTests)
      .where(eq(agentSelfTests.id, issueId))
      .limit(1);

    if (!test) {
      return res.status(404).json({ error: 'Test/issue not found' });
    }

    // Analyze failure to determine fix strategy
    const { strategy, confidence } = await autoFixEngine.analyzeFailure(test);

    // Apply fix
    const result = await autoFixEngine.applyFix(test, strategy, confidence, dryRun);

    res.json({
      success: result.success,
      result,
      message: dryRun ? 'Dry run completed' : result.success ? 'Fix applied successfully' : 'Fix failed'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/:agentId/fix-history
 * Get auto-fix history for an agent
 */
router.get('/:agentId/fix-history', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { limit = 50 } = req.query;
    const { autoFixEngine } = await import('../services/agent-intelligence/AutoFixEngine');

    const history = await autoFixEngine.getFixHistory(
      agentId,
      parseInt(limit as string)
    );

    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/:agentId/rollback
 * Rollback a failed auto-fix
 */
router.post('/:agentId/rollback', async (req, res) => {
  try {
    const { fixId } = req.body;
    const { autoFixEngine } = await import('../services/agent-intelligence/AutoFixEngine');

    const result = await autoFixEngine.rollback(fixId);

    res.json({
      success: result.success,
      message: result.success ? 'Fix rolled back successfully' : result.errorMessage
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/auto-fixes/recent
 * Get recent auto-fixes across all agents
 */
router.get('/auto-fixes/recent', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const { db } = await import('../db');
    const { agentAutoFixes } = await import('../../shared/schema');
    const { desc } = await import('drizzle-orm');

    const fixes = await db.select()
      .from(agentAutoFixes)
      .orderBy(desc(agentAutoFixes.appliedAt))
      .limit(parseInt(limit as string));

    const successCount = fixes.filter(f => f.success).length;
    const successRate = fixes.length > 0 ? successCount / fixes.length : 0;

    res.json({
      fixes,
      successRate,
      totalFixed: fixes.length,
      successfulFixes: successCount
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// PHASE 7: ESA AGENT REGISTRY APIS
// ============================================================================

/**
 * GET /api/agent-intelligence/esa/agents
 * Get all ESA agents
 */
router.get('/esa/agents', async (req, res) => {
  try {
    const { division, type } = req.query;
    const { db } = await import('../db');
    const { esaAgents } = await import('../../shared/schema');
    const { eq } = await import('drizzle-orm');

    let query = db.select().from(esaAgents);

    if (division) {
      query = query.where(eq(esaAgents.division, division as string)) as any;
    } else if (type) {
      query = query.where(eq(esaAgents.type, type as string)) as any;
    }

    const agents = await query;

    res.json({ agents, count: agents.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/esa/agent/:agentId
 * Get single ESA agent by ID
 */
router.get('/esa/agent/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { db } = await import('../db');
    const { esaAgents } = await import('../../shared/schema');
    const { eq } = await import('drizzle-orm');

    const [agent] = await db.select()
      .from(esaAgents)
      .where(eq(esaAgents.id, agentId))
      .limit(1);

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({ agent });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/esa/divisions
 * Get all divisions with agent counts
 */
router.get('/esa/divisions', async (req, res) => {
  try {
    const { db } = await import('../db');
    const { esaAgents } = await import('../../shared/schema');
    const { sql } = await import('drizzle-orm');

    const divisions = await db.execute(sql`
      SELECT 
        division,
        COUNT(*) as agent_count,
        JSON_AGG(type) as agent_types
      FROM esa_agents
      WHERE division IS NOT NULL
      GROUP BY division
      ORDER BY division
    `);

    res.json({ divisions: divisions.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// PHASE 7: COLLABORATION VOTING APIS
// ============================================================================

/**
 * POST /api/agent-intelligence/collaborate/:id/vote
 * Submit a vote on a collaboration
 */
router.post('/collaborate/:id/vote', async (req, res) => {
  try {
    const collaborationId = parseInt(req.params.id);
    const { voterId, solution, vote, reasoning } = req.body;
    const { db } = await import('../db');
    const { agentVotes, esaAgents } = await import('../../shared/schema');
    const { eq } = await import('drizzle-orm');

    // Get voter expertise
    const [voter] = await db.select()
      .from(esaAgents)
      .where(eq(esaAgents.id, voterId))
      .limit(1);

    const expertise = voter?.expertiseScore || 0.5;

    // Record vote
    const [voteRecord] = await db.insert(agentVotes).values({
      collaborationId,
      voterId,
      solution,
      vote,
      expertise,
      reasoning
    }).returning();

    // Check for consensus
    const votes = await db.select()
      .from(agentVotes)
      .where(eq(agentVotes.collaborationId, collaborationId));

    let approveWeight = 0;
    let totalWeight = 0;

    for (const v of votes) {
      totalWeight += v.expertise;
      if (v.vote === 'approve') {
        approveWeight += v.expertise;
      }
    }

    const consensus = totalWeight > 0 ? approveWeight / totalWeight : 0;
    let decision = 'pending';

    if (consensus >= 0.7) {
      decision = 'approved';
    } else if (consensus <= 0.3) {
      decision = 'rejected';
    }

    res.json({
      success: true,
      vote: voteRecord,
      consensus: {
        decision,
        consensusScore: consensus,
        totalVotes: votes.length,
        needMoreVotes: decision === 'pending'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/collaborate/:id/consensus
 * Check consensus status
 */
router.get('/collaborate/:id/consensus', async (req, res) => {
  try {
    const collaborationId = parseInt(req.params.id);
    const { db } = await import('../db');
    const { agentVotes } = await import('../../shared/schema');
    const { eq } = await import('drizzle-orm');

    const votes = await db.select()
      .from(agentVotes)
      .where(eq(agentVotes.collaborationId, collaborationId));

    let approveWeight = 0;
    let rejectWeight = 0;
    let totalWeight = 0;

    for (const v of votes) {
      totalWeight += v.expertise;
      if (v.vote === 'approve') {
        approveWeight += v.expertise;
      } else {
        rejectWeight += v.expertise;
      }
    }

    const consensus = totalWeight > 0 ? approveWeight / totalWeight : 0;
    let decision = 'pending';

    if (consensus >= 0.7) decision = 'approved';
    else if (consensus <= 0.3) decision = 'rejected';

    res.json({
      votes,
      consensus: {
        decision,
        consensusScore: consensus,
        approveWeight,
        rejectWeight,
        totalWeight,
        threshold: 0.7
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// PHASE 7: PERFORMANCE METRICS APIS
// ============================================================================

/**
 * GET /api/agent-intelligence/:agentId/metrics
 * Get performance metrics for an agent
 */
router.get('/:agentId/metrics', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { db } = await import('../db');
    const { agentPerformanceMetrics } = await import('../../shared/schema');
    const { eq, desc, sql } = await import('drizzle-orm');

    // Get recent metrics
    const metrics = await db.select()
      .from(agentPerformanceMetrics)
      .where(eq(agentPerformanceMetrics.agentId, agentId))
      .orderBy(desc(agentPerformanceMetrics.timestamp))
      .limit(100);

    // Calculate stats
    const totalTests = metrics.filter(m => m.metricType === 'test_execution').length;
    const passedTests = metrics.filter(m => m.metricType === 'test_execution' && m.result === 'pass').length;
    const passRate = totalTests > 0 ? passedTests / totalTests : 0;

    const avgExecutionTime = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + (m.executionTime || 0), 0) / metrics.length
      : 0;

    const autoFixCount = metrics.filter(m => m.autoFixed).length;
    const autoFixRate = metrics.length > 0 ? autoFixCount / metrics.length : 0;

    res.json({
      metrics,
      summary: {
        testsRun: totalTests,
        passRate,
        avgExecutionTime,
        autoFixRate,
        totalMetrics: metrics.length
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/system-metrics
 * Get platform-wide metrics
 */
router.get('/system-metrics', async (req, res) => {
  try {
    const { db } = await import('../db');
    const { 
      agentSelfTests, 
      agentAutoFixes, 
      agentCollaborations,
      agentPerformanceMetrics 
    } = await import('../../shared/schema');

    const [
      totalTests,
      totalFixes,
      totalCollaborations,
      totalMetrics
    ] = await Promise.all([
      db.select().from(agentSelfTests).then(r => r.length),
      db.select().from(agentAutoFixes).then(r => r.length),
      db.select().from(agentCollaborations).then(r => r.length),
      db.select().from(agentPerformanceMetrics).then(r => r.length)
    ]);

    // Calculate pass rate
    const allTests = await db.select().from(agentSelfTests);
    const passedTests = allTests.filter(t => t.testResult === 'pass').length;
    const avgPassRate = allTests.length > 0 ? passedTests / allTests.length : 0;

    // Calculate auto-fix rate
    const allFixes = await db.select().from(agentAutoFixes);
    const successfulFixes = allFixes.filter(f => f.success).length;
    const autoFixRate = allFixes.length > 0 ? successfulFixes / allFixes.length : 0;

    // Calculate collaboration success
    const allCollaborations = await db.select().from(agentCollaborations);
    const successfulCollaborations = allCollaborations.filter(c => c.outcome === 'success').length;
    const collaborationSuccess = allCollaborations.length > 0 ? successfulCollaborations / allCollaborations.length : 0;

    res.json({
      totalTests,
      totalFixes,
      totalCollaborations,
      totalMetrics,
      avgPassRate,
      autoFixRate,
      collaborationSuccess
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// PHASE 7: ML CONFIDENCE SCORING APIS
// ============================================================================

/**
 * POST /api/agent-intelligence/:agentId/validate-learning
 * Calculate ML-based confidence score for a learning pattern
 */
router.post('/:agentId/validate-learning', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { pattern, context } = req.body;

    if (!pattern || !context) {
      return res.status(400).json({ error: 'pattern and context are required' });
    }

    const result = await mlConfidenceScorer.calculateConfidence(
      agentId,
      pattern,
      context
    );

    res.json({
      success: true,
      confidence: result.confidence,
      factors: result.factors,
      accuracy: result.accuracy,
      recommendation: result.recommendation
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agent-intelligence/learning-accuracy
 * Track learning pattern accuracy over time
 */
router.get('/learning-accuracy', async (req, res) => {
  try {
    const { agentId } = req.query;

    const accuracy = await mlConfidenceScorer.getLearningAccuracy(
      agentId as string | undefined
    );

    res.json({
      patterns: accuracy.patterns,
      overallAccuracy: accuracy.overallAccuracy,
      totalPatterns: accuracy.patterns.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/learning/:id/validate
 * Validate a specific learning's accuracy
 */
router.post('/learning/:id/validate', async (req, res) => {
  try {
    const learningId = parseInt(req.params.id);

    const validation = await mlConfidenceScorer.validateLearning(learningId);

    res.json({
      success: true,
      validated: validation.validated,
      confidence: validation.confidence,
      usageCount: validation.usageCount,
      successRate: validation.successRate,
      message: validation.validated 
        ? 'Learning validated - high accuracy confirmed'
        : 'Learning needs more usage data for validation'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent-intelligence/learning/:id/add-embedding
 * Add learning to vector database for semantic search
 */
router.post('/learning/:id/add-embedding', async (req, res) => {
  try {
    const learningId = parseInt(req.params.id);
    const { db } = await import('../db');
    const { agentLearnings } = await import('../../shared/schema');
    const { eq } = await import('drizzle-orm');

    const [learning] = await db.select()
      .from(agentLearnings)
      .where(eq(agentLearnings.id, learningId))
      .limit(1);

    if (!learning) {
      return res.status(404).json({ error: 'Learning not found' });
    }

    await mlConfidenceScorer.addLearningEmbedding(
      learning.id,
      learning.agentId,
      learning.pattern,
      learning.problem,
      learning.solution
    );

    res.json({
      success: true,
      message: 'Learning added to vector database for semantic search'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
