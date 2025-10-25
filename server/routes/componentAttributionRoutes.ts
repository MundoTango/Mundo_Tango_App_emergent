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

const router = Router();

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

export default router;
