/**
 * TRACK 5: Integration Setup Routes
 * API endpoints for setting up Phase 11 integration
 */

import { Router } from 'express';
import { componentRegistrationService } from '../services/ComponentRegistrationService';
import { scheduleSetupService } from '../services/ScheduleSetupService';

const router = Router();

/**
 * POST /api/integration/setup
 * Run complete Phase 11 integration setup
 */
router.post('/api/integration/setup', async (req, res) => {
  try {
    console.log('🚀 Starting Phase 11 integration setup...');

    // Step 1: Setup agent schedules
    console.log('📅 Setting up agent schedules...');
    const scheduleResult = await scheduleSetupService.setupAllSchedules();
    console.log(`✅ Created ${scheduleResult.created} schedules`);

    // Step 2: Register all components
    console.log('📦 Registering all components...');
    const componentResult = await componentRegistrationService.registerAllComponents();
    console.log(`✅ Registered ${componentResult.registered} new components`);
    console.log(`✅ Updated ${componentResult.updated} existing components`);

    res.json({
      success: true,
      message: 'Phase 11 integration setup complete',
      results: {
        schedules: scheduleResult,
        components: componentResult,
      },
    });
  } catch (error) {
    console.error('❌ Integration setup error:', error);
    res.status(500).json({ 
      error: 'Failed to complete integration setup',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/integration/register-components
 * Register all components as agents
 */
router.post('/api/integration/register-components', async (req, res) => {
  try {
    const result = await componentRegistrationService.registerAllComponents();
    res.json(result);
  } catch (error) {
    console.error('Component registration error:', error);
    res.status(500).json({ error: 'Failed to register components' });
  }
});

/**
 * POST /api/integration/setup-schedules
 * Setup autonomous schedules
 */
router.post('/api/integration/setup-schedules', async (req, res) => {
  try {
    const result = await scheduleSetupService.setupAllSchedules();
    res.json(result);
  } catch (error) {
    console.error('Schedule setup error:', error);
    res.status(500).json({ error: 'Failed to setup schedules' });
  }
});

/**
 * GET /api/integration/status
 * Get integration status
 */
router.get('/api/integration/status', async (req, res) => {
  try {
    const components = await componentRegistrationService.getAllComponents();
    const schedules = await scheduleSetupService.getAllSchedules();

    res.json({
      components: {
        total: components.length,
        healthy: components.filter(c => c.currentHealth === 'healthy').length,
        warning: components.filter(c => c.currentHealth === 'warning').length,
        error: components.filter(c => c.currentHealth === 'error').length,
      },
      schedules: {
        total: schedules.length,
        active: schedules.filter(s => s.status === 'active').length,
        paused: schedules.filter(s => s.status === 'paused').length,
        failed: schedules.filter(s => s.status === 'failed').length,
      },
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

export default router;
