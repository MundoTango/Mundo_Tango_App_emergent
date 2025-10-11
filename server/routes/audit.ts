/**
 * ESA Audit API Routes
 * Endpoints for triggering audits and retrieving results
 */

import express from "express";
import { z } from "zod";
import { runAudit } from "../audit/audit-runner";
import type { AuditRunRequest, AuditRunResponse } from "../audit/types";

const router = express.Router();

// Request validation schema
const auditRequestSchema = z.object({
  page: z.string().min(1),
  mode: z.enum(["full", "quick"]).default("full"),
  generate_stories: z.boolean().default(true)
});

/**
 * POST /api/audit/run
 * Trigger a new audit for a page
 */
router.post("/run", async (req, res) => {
  try {
    const validated = auditRequestSchema.parse(req.body);
    
    console.log(`[Audit API] Triggering audit for page: ${validated.page}`);
    
    // Run audit (43 agents in parallel)
    const { report, stories } = await runAudit(validated as AuditRunRequest);
    
    const response: AuditRunResponse = {
      audit_id: report.id,
      overall_score: report.overall_score,
      certification_status: report.certification_status,
      stories_generated: stories.length,
      story_ids: stories.map(s => s.key),
      report_url: `/api/audit/${report.id}`
    };
    
    res.json(response);
  } catch (error) {
    console.error("[Audit API] Error:", error);
    res.status(500).json({ 
      error: "Audit execution failed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/audit/:id
 * Get audit results by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, retrieve from database
    // For now, return mock data
    res.json({
      id,
      message: "Audit report retrieval - to be implemented with database storage"
    });
  } catch (error) {
    console.error("[Audit API] Error:", error);
    res.status(500).json({ 
      error: "Failed to retrieve audit report" 
    });
  }
});

/**
 * GET /api/audit
 * List all audit reports
 */
router.get("/", async (req, res) => {
  try {
    // In a real implementation, retrieve list from database
    res.json({
      audits: [],
      message: "Audit listing - to be implemented with database storage"
    });
  } catch (error) {
    console.error("[Audit API] Error:", error);
    res.status(500).json({ 
      error: "Failed to list audits" 
    });
  }
});

export default router;
