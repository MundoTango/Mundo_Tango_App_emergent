// TRACK 4: Personality API Routes
import { Router } from 'express';
import { personalityService } from '../services/PersonalityService';

const router = Router();

// Get personality by agent ID
router.get('/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const personality = await personalityService.getPersonality(agentId);

    if (!personality) {
      return res.status(404).json({ error: 'Personality not found' });
    }

    res.json(personality);
  } catch (error) {
    console.error('[Personality] Get error:', error);
    res.status(500).json({ error: 'Failed to get personality' });
  }
});

// Get all personalities by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const personalities = await personalityService.getByCategory(category);
    res.json(personalities);
  } catch (error) {
    console.error('[Personality] Get by category error:', error);
    res.status(500).json({ error: 'Failed to get personalities' });
  }
});

// Get all personalities by journey tier
router.get('/journey/:tier', async (req, res) => {
  try {
    const { tier } = req.params;
    const personalities = await personalityService.getByJourneyTier(tier);
    res.json(personalities);
  } catch (error) {
    console.error('[Personality] Get by journey error:', error);
    res.status(500).json({ error: 'Failed to get personalities' });
  }
});

// Get all active personalities
router.get('/', async (req, res) => {
  try {
    const personalities = await personalityService.getAllActive();
    res.json(personalities);
  } catch (error) {
    console.error('[Personality] Get all error:', error);
    res.status(500).json({ error: 'Failed to get personalities' });
  }
});

// Update personality (admin only)
router.put('/:agentId', async (req, res) => {
  try {
    // TODO: Add admin role check
    const { agentId } = req.params;
    const updated = await personalityService.updatePersonality(agentId, req.body);

    if (!updated) {
      return res.status(404).json({ error: 'Personality not found' });
    }

    res.json(updated);
  } catch (error) {
    console.error('[Personality] Update error:', error);
    res.status(500).json({ error: 'Failed to update personality' });
  }
});

// Enhance personality with AI (admin only)
router.post('/:agentId/enhance', async (req, res) => {
  try {
    // TODO: Add admin role check
    const { agentId } = req.params;
    const { context } = req.body;

    const enhanced = await personalityService.enhancePersonality(agentId, context);

    if (!enhanced) {
      return res.status(404).json({ error: 'Personality not found' });
    }

    res.json(enhanced);
  } catch (error) {
    console.error('[Personality] Enhance error:', error);
    res.status(500).json({ error: 'Failed to enhance personality' });
  }
});

// Migrate personalities from code to database (admin only, run once)
router.post('/migrate', async (req, res) => {
  try {
    // TODO: Add admin role check
    // Import the migration service
    const { personalityMigrationService } = await import('../services/PersonalityMigration');
    
    const result = await personalityMigrationService.migrateAll();
    
    res.json({ 
      success: true, 
      message: `Migrated ${result.agents} agent personalities and ${result.templates} templates`,
      data: result,
    });
  } catch (error) {
    console.error('[Personality] Migration error:', error);
    res.status(500).json({ error: 'Failed to migrate personalities' });
  }
});

// Check migration status
router.get('/migration-status', async (req, res) => {
  try {
    const { personalityMigrationService } = await import('../services/PersonalityMigration');
    const status = await personalityMigrationService.checkMigrationStatus();
    res.json(status);
  } catch (error) {
    console.error('[Personality] Migration status error:', error);
    res.status(500).json({ error: 'Failed to check migration status' });
  }
});

export default router;
