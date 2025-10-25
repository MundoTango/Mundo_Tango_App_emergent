/**
 * COMPONENT ATTRIBUTION ROUTES
 * MB.MD SIMULTANEOUS Stream G - Agent #79 Quality Validator
 * Tracks which agents built which UI components
 */

import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { db } from '../db';
import { componentAttributions, componentHistory } from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// 🚀 STREAM C1: Zod validation schema for attribution
const attributionSchema = z.object({
  xpath: z.string().min(1, 'xpath is required'),
  agentName: z.string().min(1, 'agentName is required'),
  agentRole: z.string().min(1, 'agentRole is required'),
  contribution: z.string().optional()
});

// GET /api/components/attribution?xpath=...
router.get('/attribution', isAuthenticated, async (req, res) => {
  try {
    const { xpath } = req.query;
    
    if (!xpath) {
      return res.status(400).json({ error: 'xpath parameter required' });
    }
    
    // 🚀 MB.MD SIMULTANEOUS: Query real database for component attribution
    const attributions = await db
      .select()
      .from(componentAttributions)
      .where(eq(componentAttributions.xpath, xpath as string))
      .orderBy(desc(componentAttributions.createdAt));
    
    const agents = attributions.map(attr => ({
      name: attr.agentName,
      role: attr.agentRole,
      contribution: attr.contribution || 'Built this component',
      timestamp: attr.createdAt?.toISOString(),
      agentId: attr.agentId
    }));
    
    // If no data in database yet, show friendly message
    res.json({
      success: true,
      xpath,
      agents,
      count: agents.length,
      message: agents.length === 0 ? 'No attribution data recorded yet. Agents will log their work as they modify components.' : undefined
    });
  } catch (error) {
    console.error('[Attribution] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch attribution data'
    });
  }
});

// GET /api/components/history?xpath=...
router.get('/history', isAuthenticated, async (req, res) => {
  try {
    const { xpath } = req.query;
    
    if (!xpath) {
      return res.status(400).json({ error: 'xpath parameter required' });
    }
    
    // 🚀 MB.MD SIMULTANEOUS: Query existing componentHistory table
    // Note: This table tracks all component changes across the codebase
    const historyRecords = await db
      .select()
      .from(componentHistory)
      .where(eq(componentHistory.componentPath, xpath as string))
      .orderBy(desc(componentHistory.timestamp))
      .limit(50); // Limit to last 50 changes
    
    const history = historyRecords.map(record => ({
      timestamp: record.timestamp?.toISOString(),
      agent: record.agentId || 'Unknown Agent',
      action: record.changeType,
      diff: record.changeDescription || 'No description',
      componentId: record.componentId
    }));
    
    res.json({
      success: true,
      xpath,
      history,
      count: history.length,
      message: history.length === 0 ? 'No change history recorded yet. Changes will appear here as agents modify components.' : undefined
    });
  } catch (error) {
    console.error('[Attribution] History error:', error);
    res.status(500).json({
      error: 'Failed to fetch attribution history'
    });
  }
});

// 🚀 STREAM C1: POST /api/components/attribution - Create attribution record
router.post('/attribution', isAuthenticated, async (req, res) => {
  try {
    // Validate request body
    const validation = attributionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const { xpath, agentName, agentRole, contribution } = validation.data;

    // Insert attribution record
    const [record] = await db.insert(componentAttributions).values({
      xpath,
      agentName,
      agentRole,
      contribution: contribution || `Modified component at ${xpath}`,
      agentId: `${agentName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
    }).returning();

    console.log('[Attribution] Created:', record);

    res.json({
      success: true,
      record: {
        id: record.id,
        xpath: record.xpath,
        agentName: record.agentName,
        agentRole: record.agentRole,
        contribution: record.contribution,
        timestamp: record.createdAt?.toISOString()
      }
    });
  } catch (error) {
    console.error('[Attribution] Creation error:', error);
    res.status(500).json({
      error: 'Failed to create attribution record'
    });
  }
});

export default router;
