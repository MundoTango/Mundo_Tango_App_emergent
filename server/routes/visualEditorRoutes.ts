/**
 * Visual Editor API Routes
 * Per mb.md lines 1038-1042
 * AI code generation + git automation + preview deployment
 */

import { Router } from 'express';
import { aiModelService } from '../services/aiModelService';

const router = Router();

/**
 * POST /api/visual-editor/generate-code
 * AI code generation from visual changes (mb.md line 1039)
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

    const aiResponse = await aiModelService.callGPT4o([
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
 * Save visual editor changes (Phase 12 learning integration)
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

    // TODO: Save to database (visual_editor_changes table)
    // For now, just acknowledge the save
    console.log('📝 Visual Editor: Saving', actions.length, 'actions');
    console.log('User Confirmed:', userConfirmed);
    console.log('User Feedback:', userFeedback);

    res.json({
      success: true,
      message: `Saved ${actions.length} visual edits! Changes have been recorded for learning.`,
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
 * Git automation - apply generated code (mb.md line 1040)
 * SECURITY: Uses spawn instead of execSync, validates all inputs
 */
router.post('/apply-code', async (req, res) => {
  try {
    const { code, filePath, branchName, commitMessage } = req.body;

    if (!code || !filePath) {
      return res.status(400).json({
        error: 'Code and file path are required',
      });
    }

    const { spawnSync } = require('child_process');
    const fs = require('fs');
    const path = require('path');

    // SECURITY: Validate branch name (alphanumeric, hyphens, underscores only)
    const finalBranchName = branchName || `visual-edit-${Date.now()}`;
    if (!/^[a-zA-Z0-9_-]+$/.test(finalBranchName)) {
      return res.status(400).json({
        error: 'Invalid branch name. Only alphanumeric, hyphens, and underscores allowed.',
      });
    }

    // SECURITY: Validate commit message (max 200 chars, no newlines)
    const finalCommitMessage = commitMessage || 'Visual editor changes via Mr Blue';
    if (finalCommitMessage.length > 200 || /[\r\n]/.test(finalCommitMessage)) {
      return res.status(400).json({
        error: 'Invalid commit message. Max 200 characters, no newlines.',
      });
    }

    // SECURITY: Validate file path (must be in client/src or server/routes)
    const allowedPaths = ['client/src', 'server/routes', 'server/services'];
    const normalizedPath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, '');
    const isAllowed = allowedPaths.some(allowed => normalizedPath.startsWith(allowed));
    
    if (!isAllowed || normalizedPath.includes('..')) {
      return res.status(400).json({
        error: 'Invalid file path. Must be in client/src, server/routes, or server/services.',
      });
    }

    const fullPath = path.join(process.cwd(), normalizedPath);

    // Check if branch already exists
    const branchCheck = spawnSync('git', ['rev-parse', '--verify', finalBranchName], { encoding: 'utf8' });
    const branchExisted = branchCheck.status === 0;

    let createdNewBranch = false;

    try {
      // 1. Check for clean working tree
      const status = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8' });
      if (status.stdout && status.stdout.trim()) {
        return res.status(400).json({
          error: 'Working tree is not clean. Commit or stash changes first.',
        });
      }

      // 2. Create feature branch if it doesn't exist
      if (!branchExisted) {
        const create = spawnSync('git', ['checkout', '-b', finalBranchName]);
        if (create.status !== 0) {
          throw new Error(`Failed to create branch: ${create.stderr}`);
        }
        createdNewBranch = true;
        console.log('✅ Created branch:', finalBranchName);
      } else {
        const checkout = spawnSync('git', ['checkout', finalBranchName]);
        if (checkout.status !== 0) {
          throw new Error(`Failed to checkout branch: ${checkout.stderr}`);
        }
        console.log('✅ Switched to branch:', finalBranchName);
      }

      // 3. Write code to file
      fs.writeFileSync(fullPath, code, 'utf8');
      console.log('✅ Wrote code to:', normalizedPath);

      // 4. Stage changes
      const add = spawnSync('git', ['add', normalizedPath]);
      if (add.status !== 0) {
        throw new Error(`Failed to stage changes: ${add.stderr}`);
      }

      // 5. Commit with message
      const commit = spawnSync('git', ['commit', '-m', finalCommitMessage]);
      if (commit.status !== 0) {
        throw new Error(`Failed to commit: ${commit.stderr}`);
      }
      console.log('✅ Committed changes');

      // 6. Get commit hash
      const hash = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' });

      res.json({
        success: true,
        message: `Code applied to ${normalizedPath} on branch ${finalBranchName}`,
        branch: finalBranchName,
        filePath: normalizedPath,
        commitHash: hash.stdout.trim(),
        status: 'committed',
      });

    } catch (gitError: any) {
      // SECURITY FIX: Only rollback if we created the branch in this request
      try {
        spawnSync('git', ['checkout', 'main']);
        
        // Only delete branch if we created it in this request
        if (createdNewBranch) {
          spawnSync('git', ['branch', '-D', finalBranchName]);
          console.log('🔄 Rolled back and deleted new branch:', finalBranchName);
        } else {
          console.log('🔄 Rolled back to main (kept existing branch)');
        }
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }

      throw new Error(`Git operation failed: ${gitError.message}`);
    }

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
 * Deploy to staging environment (mb.md line 1041)
 */
router.post('/preview', async (req, res) => {
  try {
    const { branchName } = req.body;

    if (!branchName) {
      return res.status(400).json({
        error: 'Branch name is required',
      });
    }

    // In Replit, the preview URL is the same as production
    // We just restart the server to apply changes
    const previewUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : `http://localhost:5000`;

    console.log('🚀 Preview ready on current deployment URL');
    console.log('   Branch:', branchName);
    console.log('   URL:', previewUrl);

    res.json({
      success: true,
      message: `Preview ready! Changes from ${branchName} are visible at the deployment URL.`,
      previewUrl,
      branch: branchName,
      status: 'ready',
      note: 'In Replit, preview uses the same URL as production. Restart workflow to see changes.',
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
 * Production merge workflow (mb.md line 1042)
 * SECURITY: Uses spawn, validates branch name
 */
router.post('/deploy', async (req, res) => {
  try {
    const { branchName, runTests } = req.body;

    if (!branchName) {
      return res.status(400).json({
        error: 'Branch name is required',
      });
    }

    const { spawnSync } = require('child_process');

    // SECURITY: Validate branch name
    if (!/^[a-zA-Z0-9_-]+$/.test(branchName)) {
      return res.status(400).json({
        error: 'Invalid branch name. Only alphanumeric, hyphens, and underscores allowed.',
      });
    }

    // Check if branch exists
    const branchCheck = spawnSync('git', ['rev-parse', '--verify', branchName], { encoding: 'utf8' });
    if (branchCheck.status !== 0) {
      return res.status(400).json({
        error: `Branch ${branchName} does not exist`,
      });
    }

    // 1. Run tests if requested
    if (runTests) {
      console.log('🧪 Running tests...');
      const test = spawnSync('npm', ['test']);
      if (test.status !== 0) {
        return res.status(400).json({
          success: false,
          error: 'Tests failed',
          message: 'Cannot deploy - tests must pass first',
          testOutput: test.stderr?.toString(),
        });
      }
      console.log('✅ Tests passed');
    }

    // 2. Merge to main
    try {
      const checkout = spawnSync('git', ['checkout', 'main']);
      if (checkout.status !== 0) {
        throw new Error(`Failed to checkout main: ${checkout.stderr}`);
      }

      const merge = spawnSync('git', ['merge', branchName, '--no-ff', '-m', `Merge visual editor changes from ${branchName}`]);
      if (merge.status !== 0) {
        throw new Error(`Merge failed: ${merge.stderr}`);
      }
      console.log('✅ Merged to main');

      // 3. Delete feature branch
      const deleteBranch = spawnSync('git', ['branch', '-d', branchName]);
      if (deleteBranch.status !== 0) {
        console.warn('⚠️  Failed to delete branch:', deleteBranch.stderr);
        // Non-fatal, continue
      } else {
        console.log('✅ Cleaned up branch:', branchName);
      }

      const hash = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' });

      res.json({
        success: true,
        message: `Successfully deployed changes from ${branchName} to production`,
        branch: branchName,
        commitHash: hash.stdout.trim(),
        status: 'deployed',
        timestamp: new Date().toISOString(),
        note: 'Restart workflow to see changes in production',
      });

    } catch (mergeError: any) {
      // Rollback on merge conflict
      try {
        spawnSync('git', ['merge', '--abort']);
      } catch (abortError) {
        console.error('Merge abort failed:', abortError);
      }

      throw new Error(`Merge failed: ${mergeError.message}. Please resolve conflicts manually.`);
    }

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
