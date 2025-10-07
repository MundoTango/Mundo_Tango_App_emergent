import { Router } from 'express';
import { agentLearningService } from '../services/AgentLearningCaptureService';
import { agentOrchestrator } from '../services/LangGraphAgentOrchestrator';
import { learningLoop } from '../services/ContinuousLearningLoop';
import { crossDomainLearning } from '../services/CrossDomainLearningService';
import { agentJobRouter } from '../services/AgentJobRouter';
import { esaPatternDetector } from '../services/ESALayerPatternDetector';
import { db } from '../db';
import { agentLearnings, agentCollaborationLog } from '../../shared/schema';
import { desc, gt } from 'drizzle-orm';

export const agentLearningRouter = Router();

agentLearningRouter.post('/capture-initial-learnings', async (req, res) => {
  try {
    await agentLearningService.captureExistingCachePatterns();
    res.json({ success: true, message: 'Cache patterns captured successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

agentLearningRouter.post('/discover-and-share', async (req, res) => {
  try {
    const result = await agentOrchestrator.discoverAndShareLearnings();
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

agentLearningRouter.get('/learnings', async (req, res) => {
  try {
    const minConfidence = req.query.minConfidence 
      ? parseFloat(req.query.minConfidence as string) 
      : 0.8;
    
    const learnings = await db
      .select()
      .from(agentLearnings)
      .where(gt(agentLearnings.confidence, minConfidence.toString()))
      .orderBy(desc(agentLearnings.confidence), desc(agentLearnings.createdAt))
      .limit(50);

    res.json(learnings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

agentLearningRouter.get('/learnings/:pattern', async (req, res) => {
  try {
    const learnings = await agentLearningService.getLearningsByPattern(
      req.params.pattern
    );
    res.json(learnings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

agentLearningRouter.get('/collaborations', async (req, res) => {
  try {
    const collaborations = await db
      .select()
      .from(agentCollaborationLog)
      .orderBy(desc(agentCollaborationLog.startTime))
      .limit(50);

    res.json(collaborations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

agentLearningRouter.post('/apply-pattern', async (req, res) => {
  try {
    const { patternId, agentDomain, files } = req.body;
    
    const learnings = await agentLearningService.getLearningsByPattern(patternId);
    if (learnings.length === 0) {
      return res.status(404).json({ error: 'Pattern not found' });
    }

    const pattern = learnings[0];
    const result = await agentOrchestrator.applyPatternToAgent(
      pattern,
      agentDomain,
      files || []
    );

    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

agentLearningRouter.post('/start-learning-loop', async (req, res) => {
  try {
    learningLoop.start().catch(console.error);
    res.json({ success: true, message: 'Continuous learning loop started' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

agentLearningRouter.post('/stop-learning-loop', async (req, res) => {
  try {
    learningLoop.stop();
    res.json({ success: true, message: 'Continuous learning loop stopped' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

agentLearningRouter.post('/broadcast-learning', async (req, res) => {
  try {
    const { learningId } = req.body;
    
    const learnings = await db
      .select()
      .from(agentLearnings)
      .where(gt(agentLearnings.id, learningId - 1))
      .limit(1);

    if (learnings.length === 0) {
      return res.status(404).json({ error: 'Learning not found' });
    }

    const collaborationId = await crossDomainLearning.broadcastLearning(learnings[0]);
    
    res.json({ 
      success: true, 
      collaborationId,
      message: `Learning broadcast to ${learnings[0].agentDomains?.length || 0} agents`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

agentLearningRouter.get('/stats', async (req, res) => {
  try {
    const learnings = await db.select().from(agentLearnings);
    const jobStats = await agentJobRouter.getJobStats();
    
    res.json({
      totalPatterns: learnings.length,
      highConfidence: learnings.filter(l => parseFloat(l.confidence || '0') >= 0.9).length,
      jobQueue: jobStats,
      workerStatus: 'active'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

agentLearningRouter.post('/detect-patterns', async (req, res) => {
  try {
    const layer = req.body.layer as string;
    
    let patterns;
    if (layer === 'business') {
      patterns = await esaPatternDetector.detectBusinessLogicPatterns();
    } else if (layer === 'ai') {
      patterns = await esaPatternDetector.detectAIInfrastructurePatterns();
    } else if (layer === 'platform') {
      patterns = await esaPatternDetector.detectPlatformEnhancementPatterns();
    } else {
      patterns = await esaPatternDetector.runFullDetection();
    }
    
    res.json({ success: true, patterns, count: patterns.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

agentLearningRouter.post('/enqueue-job', async (req, res) => {
  try {
    const { module, operation, payload, priority } = req.body;
    const jobId = await agentJobRouter.enqueueJob(module, operation, payload, priority);
    res.json({ success: true, jobId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
