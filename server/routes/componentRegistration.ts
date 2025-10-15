/**
 * COMPONENT REGISTRATION API
 * On-demand registration of components as they are edited
 * Part of Phase 12 Autonomous Learning System
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/secureAuth';
import { componentRegistrationService } from '../services/ComponentRegistrationService';
import { z } from 'zod';

export const componentRegistrationRouter = Router();

// Validation schema
const registerComponentSchema = z.object({
  componentName: z.string().min(1),
  componentPath: z.string().min(1),
  componentType: z.enum(['button', 'input', 'layout', 'page']),
  parentAgent: z.string().optional(),
  layerAgents: z.array(z.string()).optional(),
});

/**
 * POST /api/components/register
 * Register a component on-demand
 */
componentRegistrationRouter.post('/register', requireAuth, async (req, res) => {
  try {
    const data = registerComponentSchema.parse(req.body);
    
    const component = await componentRegistrationService.registerComponent(data);
    
    res.json({
      success: true,
      component,
    });
  } catch (error) {
    console.error('❌ [Component Registration API] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/components/register-batch
 * Register multiple components at once
 */
componentRegistrationRouter.post('/register-batch', requireAuth, async (req, res) => {
  try {
    const { components } = req.body;
    
    if (!Array.isArray(components)) {
      return res.status(400).json({
        success: false,
        error: 'Components must be an array',
      });
    }

    const registered = await componentRegistrationService.registerBatch(components);
    
    res.json({
      success: true,
      registered,
    });
  } catch (error) {
    console.error('❌ [Component Registration API] Batch error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/components/:name
 * Get component by name
 */
componentRegistrationRouter.get('/:name', requireAuth, async (req, res) => {
  try {
    const { name } = req.params;
    const component = await componentRegistrationService.getComponent(name);
    
    if (!component) {
      return res.status(404).json({
        success: false,
        error: 'Component not found',
      });
    }

    res.json({
      success: true,
      component,
    });
  } catch (error) {
    console.error('❌ [Component Registration API] Get error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/components
 * Get all registered components
 */
componentRegistrationRouter.get('/', requireAuth, async (req, res) => {
  try {
    const components = await componentRegistrationService.getAllComponents();
    
    res.json({
      success: true,
      components,
      total: components.length,
    });
  } catch (error) {
    console.error('❌ [Component Registration API] List error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/components/stats
 * Get component statistics
 */
componentRegistrationRouter.get('/stats', requireAuth, async (req, res) => {
  try {
    const stats = await componentRegistrationService.getStats();
    
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('❌ [Component Registration API] Stats error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default componentRegistrationRouter;
