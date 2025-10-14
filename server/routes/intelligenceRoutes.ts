import { Router } from 'express';
import { db } from '../db';
import { crossPhaseLearning, agentInsights, learningPatterns } from '@/shared/phase9-schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export const intelligenceRouter = Router();

// POST /api/intelligence/cross-phase/publish-insight
intelligenceRouter.post('/cross-phase/publish-insight', async (req, res) => {
  try {
    const { sourceAgentId, targetAgentId, phaseNumber, insightType, insight, confidence, impactScore } = req.body;

    const [result] = await db.insert(crossPhaseLearning).values({
      sourceAgentId,
      targetAgentId,
      phaseNumber,
      insightType,
      insight,
      confidence,
      impactScore,
      validatedBy: [],
      applicablePhases: [phaseNumber],
      metadata: { createdVia: 'api' }
    }).returning();

    // Broadcast to other agents
    const io = req.app.get('io');
    if (io) {
      io.of('/agents').emit('new_insight', result);
    }

    res.json({ success: true, insight: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/intelligence/cross-phase/validate-insight/:id
intelligenceRouter.post('/cross-phase/validate-insight/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { validatorAgentId } = req.body;

    const [insight] = await db.select().from(crossPhaseLearning).where(eq(crossPhaseLearning.id, id));
    
    if (!insight) {
      return res.status(404).json({ error: 'Insight not found' });
    }

    const updatedValidatedBy = [...(insight.validatedBy || []), validatorAgentId];

    await db.update(crossPhaseLearning)
      .set({ validatedBy: updatedValidatedBy })
      .where(eq(crossPhaseLearning.id, id));

    res.json({ success: true, validators: updatedValidatedBy });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/intelligence/cross-phase/insights/:agentId
intelligenceRouter.get('/cross-phase/insights/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { phaseNumber, insightType } = req.query;

    const insights = await db.select()
      .from(crossPhaseLearning)
      .where(
        and(
          eq(crossPhaseLearning.targetAgentId, agentId),
          phaseNumber ? eq(crossPhaseLearning.phaseNumber, Number(phaseNumber)) : undefined,
          insightType ? eq(crossPhaseLearning.insightType, insightType as string) : undefined
        )
      )
      .orderBy(desc(crossPhaseLearning.confidence));

    res.json({ insights });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/intelligence/cross-phase/patterns
intelligenceRouter.get('/cross-phase/patterns', async (req, res) => {
  try {
    const { minFrequency = 3 } = req.query;

    const patterns = await db.select()
      .from(learningPatterns)
      .where(sql`${learningPatterns.frequency} >= ${minFrequency}`)
      .orderBy(desc(learningPatterns.frequency));

    res.json({ patterns });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/intelligence/agent-insights
intelligenceRouter.post('/agent-insights', async (req, res) => {
  try {
    const { agentId, category, title, description, implementation, applicablePhases } = req.body;

    const [insight] = await db.insert(agentInsights).values({
      agentId,
      category,
      title,
      description,
      applicablePhases,
      implementation,
      embeddings: null, // Will be populated later with vector embeddings
      successRate: 0.0,
      usageCount: 0
    }).returning();

    res.json({ success: true, insight });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default intelligenceRouter;
