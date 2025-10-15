/**
 * Visual Editor Confirmation → Phase 12 Learning Integration
 * Handles user confirmation of visual edits and triggers autonomous learning
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/secureAuth';
import { visualEditorLoop } from '../services/VisualEditorLoop';

export const visualEditorConfirmationRouter = Router();

interface VisualEditData {
  actions: Array<{
    type: string;
    component: string;
    details?: any;
  }>;
  userConfirmed: boolean;
  userFeedback?: string;
}

/**
 * POST /api/visual-editor/confirm
 * User confirms their visual edits → trigger component learning
 */
visualEditorConfirmationRouter.post('/confirm', requireAuth, async (req, res) => {
  try {
    const { actions, userConfirmed, userFeedback }: VisualEditData = req.body;
    const userId = (req as any).user?.id;

    console.log('✅ [Visual Editor] Confirmation received:', {
      confirmed: userConfirmed,
      actionsCount: actions.length,
      userId,
    });

    if (!userConfirmed) {
      return res.json({
        success: true,
        message: 'Understood. Feel free to make more changes or clarify what you need.',
      });
    }

    // Trigger Phase 12 learning for each edited component
    const learningResults = [];

    for (const action of actions) {
      try {
        console.log(`🧠 [Visual Editor] Triggering learning for ${action.component}...`);
        
        const result = await visualEditorLoop.handleVisualEdit({
          componentId: action.component,
          editType: action.type,
          changes: action.details,
          userFeedback: userFeedback || 'User confirmed visual edit',
          userId,
        });

        learningResults.push({
          component: action.component,
          success: true,
          result,
        });

        console.log(`✅ [Visual Editor] Learning complete for ${action.component}`);
      } catch (error) {
        console.error(`❌ [Visual Editor] Learning failed for ${action.component}:`, error);
        learningResults.push({
          component: action.component,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = learningResults.filter(r => r.success).length;

    res.json({
      success: true,
      message: `Great! ${successCount}/${actions.length} components learned from your changes.`,
      results: learningResults,
      timestamp: new Date(),
    });

  } catch (error) {
    console.error('❌ [Visual Editor] Confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process confirmation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/visual-editor/learning-status/:componentId
 * Check learning status for a component
 */
visualEditorConfirmationRouter.get('/learning-status/:componentId', requireAuth, async (req, res) => {
  try {
    const { componentId } = req.params;
    
    // Get component status from Phase 12 system
    const status = await visualEditorLoop.getComponentStatus(componentId);

    res.json({
      success: true,
      componentId,
      status,
    });

  } catch (error) {
    console.error('❌ [Visual Editor] Status check error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default visualEditorConfirmationRouter;
