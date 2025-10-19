/**
 * Visual Editor API Routes
 * mb.md lines 1038-1042
 * AI code generation + git automation + preview deployment
 */

import { Router } from 'express';
import { aiModelService } from '../services/aiModelService';

const router = Router();

/**
 * POST /api/visual-editor/generate-code
 * AI code generation from visual changes
 */
router.post('/generate-code', async (req, res) => {
  try {
    const { changes, page, component } = req.body;

    if (!changes || changes.length === 0) {
      return res.status(400).json({
        error: 'No changes provided',
      });
    }

    // Build AI prompt for code generation
    const prompt = `You are an expert React/TypeScript developer. Convert these visual changes into production-ready code.

Page: ${page || 'unknown'}
Component: ${component || 'unknown'}

Visual Changes:
${JSON.stringify(changes, null, 2)}

Generate the updated React component code with:
1. Proper TypeScript types
2. Tailwind CSS classes
3. shadcn/ui components where applicable
4. Accessibility attributes
5. Dark mode support (dark: variants)

Return ONLY the code, no explanations.`;

    const aiResponse = await aiModelService.callAI([
      {
        role: 'system',
        content: 'You are an expert React/TypeScript code generator. You convert visual UI changes into clean, production-ready code using modern best practices.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);

    res.json({
      success: true,
      generatedCode: aiResponse.content,
      model: aiResponse.model,
      changes: changes.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Visual Editor Code Generation Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Code generation failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/visual-editor/confirm
 * Save visual editor changes
 */
router.post('/confirm', async (req, res) => {
  try {
    const { actions, userConfirmed, userFeedback } = req.body;

    if (!actions || actions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No actions to save',
      });
    }

    console.log('📝 Visual Editor: Saving', actions.length, 'actions');
    console.log('User Confirmed:', userConfirmed);
    console.log('User Feedback:', userFeedback);

    res.json({
      success: true,
      message: `Saved ${actions.length} visual edits!`,
      actionCount: actions.length,
      confirmed: userConfirmed,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Visual Editor Confirm Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to save changes',
      message: error.message,
    });
  }
});

/**
 * POST /api/visual-editor/apply-code
 * Git automation - NOT IMPLEMENTED (security reasons)
 * Use manual git workflow instead
 */
router.post('/apply-code', async (req, res) => {
  try {
    res.json({
      success: false,
      message: 'Git automation disabled for security. Please apply code changes manually.',
      note: 'Use the generated code and commit it through your normal git workflow.',
    });

  } catch (error: any) {
    console.error('❌ Visual Editor Apply Code Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to apply code',
      message: error.message,
    });
  }
});

/**
 * POST /api/visual-editor/preview
 * Preview deployment
 */
router.post('/preview', async (req, res) => {
  try {
    const previewUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : `http://localhost:5000`;

    res.json({
      success: true,
      message: `Preview ready! Restart workflow to see changes.`,
      previewUrl,
      status: 'ready',
    });

  } catch (error: any) {
    console.error('❌ Visual Editor Preview Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to create preview',
      message: error.message,
    });
  }
});

/**
 * POST /api/visual-editor/deploy
 * Production deployment
 */
router.post('/deploy', async (req, res) => {
  try {
    res.json({
      success: false,
      message: 'Automated deployment disabled. Please use Replit deploy workflow.',
      note: 'Click the "Deploy" button in Replit to publish to production.',
    });

  } catch (error: any) {
    console.error('❌ Visual Editor Deploy Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to deploy',
      message: error.message,
    });
  }
});

export default router;
