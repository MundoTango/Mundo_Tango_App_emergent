import { Router } from "express";
import { db } from "../db";
import { 
  learningSessions, 
  learnings, 
  agentCertifications, 
  agentTrainingProgress,
  insertLearningSessionSchema,
  insertLearningSchema,
  insertAgentCertificationSchema,
  insertAgentTrainingProgressSchema
} from "../../shared/schema";
import { eq, desc, and, or, sql } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// ========================================
// AGENT #80: LEARNING COORDINATOR API
// MB.MD Phase 1B - Oct 21, 2025
// ========================================

// POST /api/learning/sessions - Create new learning session
router.post("/sessions", async (req, res) => {
  try {
    const validated = insertLearningSessionSchema.parse(req.body);
    const [session] = await db.insert(learningSessions).values(validated).returning();
    res.json(session);
  } catch (error) {
    console.error("[Learning] Session creation error:", error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid session data" });
  }
});

// GET /api/learning/sessions/:agentId - Get all sessions for an agent
router.get("/sessions/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params;
    const sessions = await db
      .select()
      .from(learningSessions)
      .where(eq(learningSessions.agentId, agentId))
      .orderBy(desc(learningSessions.startedAt));
    
    res.json(sessions);
  } catch (error) {
    console.error("[Learning] Sessions fetch error:", error);
    res.status(500).json({ error: "Failed to fetch learning sessions" });
  }
});

// POST /api/learning/learnings - Create new learning
router.post("/learnings", async (req, res) => {
  try {
    const validated = insertLearningSchema.parse(req.body);
    const [learning] = await db.insert(learnings).values(validated).returning();
    res.json(learning);
  } catch (error) {
    console.error("[Learning] Learning creation error:", error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid learning data" });
  }
});

// GET /api/learning/learnings - Get all active learnings (distributed knowledge)
router.get("/learnings", async (req, res) => {
  try {
    const { category, severity } = req.query;
    
    let query = db.select().from(learnings).where(eq(learnings.isActive, true));
    
    if (category) {
      query = query.where(eq(learnings.category, category as string));
    }
    
    if (severity) {
      query = query.where(eq(learnings.severity, severity as string));
    }
    
    const result = await query.orderBy(desc(learnings.createdAt));
    res.json(result);
  } catch (error) {
    console.error("[Learning] Learnings fetch error:", error);
    res.status(500).json({ error: "Failed to fetch learnings" });
  }
});

// GET /api/learning/learnings/critical - Get critical learnings (MANDATORY reading)
router.get("/learnings/critical", async (req, res) => {
  try {
    const criticalLearnings = await db
      .select()
      .from(learnings)
      .where(
        and(
          eq(learnings.isActive, true),
          or(
            eq(learnings.severity, "critical"),
            eq(learnings.severity, "high")
          )
        )
      )
      .orderBy(desc(learnings.createdAt));
    
    res.json(criticalLearnings);
  } catch (error) {
    console.error("[Learning] Critical learnings fetch error:", error);
    res.status(500).json({ error: "Failed to fetch critical learnings" });
  }
});

// PATCH /api/learning/learnings/:id/apply - Mark learning as applied by agent
router.patch("/learnings/:id/apply", async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: "agentId required" });
    }
    
    const [learning] = await db
      .update(learnings)
      .set({
        applicationCount: sql`${learnings.applicationCount} + 1`,
        agentsNotified: sql`array_append(${learnings.agentsNotified}, ${agentId})`,
        updatedAt: new Date(),
      })
      .where(eq(learnings.id, parseInt(id)))
      .returning();
    
    res.json(learning);
  } catch (error) {
    console.error("[Learning] Apply learning error:", error);
    res.status(500).json({ error: "Failed to apply learning" });
  }
});

// ========================================
// AGENT TRAINING CERTIFICATION API
// ========================================

// POST /api/learning/certifications - Create or update agent certification
router.post("/certifications", async (req, res) => {
  try {
    const validated = insertAgentCertificationSchema.parse(req.body);
    
    const existing = await db
      .select()
      .from(agentCertifications)
      .where(eq(agentCertifications.agentId, validated.agentId));
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(agentCertifications)
        .set({ ...validated, updatedAt: new Date() })
        .where(eq(agentCertifications.agentId, validated.agentId))
        .returning();
      
      return res.json(updated);
    }
    
    const [certification] = await db.insert(agentCertifications).values(validated).returning();
    res.json(certification);
  } catch (error) {
    console.error("[Learning] Certification error:", error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid certification data" });
  }
});

// GET /api/learning/certifications/:agentId - Get agent certification status
router.get("/certifications/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params;
    const [certification] = await db
      .select()
      .from(agentCertifications)
      .where(eq(agentCertifications.agentId, agentId));
    
    if (!certification) {
      return res.status(404).json({ error: "Certification not found" });
    }
    
    res.json(certification);
  } catch (error) {
    console.error("[Learning] Certification fetch error:", error);
    res.status(500).json({ error: "Failed to fetch certification" });
  }
});

// GET /api/learning/certifications - Get all agent certifications (training dashboard)
router.get("/certifications", async (req, res) => {
  try {
    const { status, agentType } = req.query;
    
    let query = db.select().from(agentCertifications);
    
    if (status) {
      query = query.where(eq(agentCertifications.status, status as string));
    }
    
    if (agentType) {
      query = query.where(eq(agentCertifications.agentType, agentType as string));
    }
    
    const certifications = await query.orderBy(desc(agentCertifications.lastActivityAt));
    
    res.json(certifications);
  } catch (error) {
    console.error("[Learning] Certifications fetch error:", error);
    res.status(500).json({ error: "Failed to fetch certifications" });
  }
});

// POST /api/learning/certifications/:agentId/complete - Mark training as complete
router.post("/certifications/:agentId/complete", async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const [certification] = await db
      .update(agentCertifications)
      .set({
        trainingCompleted: true,
        certifiedAt: new Date(),
        status: "certified",
        updatedAt: new Date(),
      })
      .where(eq(agentCertifications.agentId, agentId))
      .returning();
    
    res.json(certification);
  } catch (error) {
    console.error("[Learning] Complete certification error:", error);
    res.status(500).json({ error: "Failed to complete certification" });
  }
});

// ========================================
// TRAINING PROGRESS CHECKLIST API
// ========================================

// POST /api/learning/progress - Update training checklist progress
router.post("/progress", async (req, res) => {
  try {
    const validated = insertAgentTrainingProgressSchema.parse(req.body);
    
    const existing = await db
      .select()
      .from(agentTrainingProgress)
      .where(
        and(
          eq(agentTrainingProgress.agentId, validated.agentId),
          eq(agentTrainingProgress.checklistItem, validated.checklistItem)
        )
      );
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(agentTrainingProgress)
        .set({ ...validated, completedAt: validated.completed ? new Date() : null })
        .where(
          and(
            eq(agentTrainingProgress.agentId, validated.agentId),
            eq(agentTrainingProgress.checklistItem, validated.checklistItem)
          )
        )
        .returning();
      
      return res.json(updated);
    }
    
    const [progress] = await db.insert(agentTrainingProgress).values({
      ...validated,
      completedAt: validated.completed ? new Date() : null,
    }).returning();
    
    res.json(progress);
  } catch (error) {
    console.error("[Learning] Progress update error:", error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid progress data" });
  }
});

// GET /api/learning/progress/:agentId - Get training checklist for agent
router.get("/progress/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params;
    const progress = await db
      .select()
      .from(agentTrainingProgress)
      .where(eq(agentTrainingProgress.agentId, agentId))
      .orderBy(agentTrainingProgress.createdAt);
    
    res.json(progress);
  } catch (error) {
    console.error("[Learning] Progress fetch error:", error);
    res.status(500).json({ error: "Failed to fetch training progress" });
  }
});

// GET /api/learning/stats - Get overall training statistics
router.get("/stats", async (req, res) => {
  try {
    const [stats] = await db
      .select({
        totalAgents: sql<number>`COUNT(*)`,
        certified: sql<number>`SUM(CASE WHEN training_completed THEN 1 ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
        recertificationNeeded: sql<number>`SUM(CASE WHEN status = 'recertification_needed' THEN 1 ELSE 0 END)`,
      })
      .from(agentCertifications);
    
    const [learningStats] = await db
      .select({
        totalLearnings: sql<number>`COUNT(*)`,
        criticalLearnings: sql<number>`SUM(CASE WHEN severity IN ('critical', 'high') THEN 1 ELSE 0 END)`,
        totalApplications: sql<number>`SUM(application_count)`,
      })
      .from(learnings)
      .where(eq(learnings.isActive, true));
    
    res.json({
      agents: stats,
      learnings: learningStats,
    });
  } catch (error) {
    console.error("[Learning] Stats fetch error:", error);
    res.status(500).json({ error: "Failed to fetch training statistics" });
  }
});

export default router;
