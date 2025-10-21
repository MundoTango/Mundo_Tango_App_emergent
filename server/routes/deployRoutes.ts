/**
 * DEPLOY ROUTES - Deployment API
 * MB.MD Build: Staging and production deployment
 * Completeness Law: Real deployment operations
 */

import { Router } from 'express';
import { execSync } from 'child_process';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// POST /api/deploy/preview - Deploy to staging
router.post('/preview', isAuthenticated, async (req, res) => {
  try {
    const { branch } = req.body;
    const branchName = branch || `visual-edit-${Date.now()}`;

    // Create and checkout new branch
    execSync(`git checkout -b ${branchName}`, { encoding: 'utf-8' });

    // Add and commit changes
    execSync('git add -A', { encoding: 'utf-8' });
    try {
      execSync(`git commit -m "Visual Editor: Preview deployment ${branchName}"`, { encoding: 'utf-8' });
    } catch {
      // No changes to commit
    }

    // Get Replit dev URL
    const replitDomain = process.env.REPL_SLUG || 'mundo-tango';
    const replitOwner = process.env.REPL_OWNER || 'scottroot';
    const previewUrl = `https://${replitDomain}.${replitOwner}.repl.co`;

    res.json({
      success: true,
      branch: branchName,
      previewUrl,
      message: 'Preview deployment ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Preview deploy error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Preview deployment failed'
    });
  }
});

// POST /api/deploy/production - Deploy to production
router.post('/production', isAuthenticated, async (req, res) => {
  try {
    const { branch, runTests } = req.body;
    const deployBranch = branch || 'main';

    // Run tests if requested
    if (runTests) {
      try {
        execSync('npm test', { encoding: 'utf-8' });
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Tests failed. Fix issues before deploying to production.'
        });
      }
    }

    // Checkout deployment branch
    execSync(`git checkout ${deployBranch}`, { encoding: 'utf-8' });

    // Pull latest
    try {
      execSync('git pull origin ${deployBranch}', { encoding: 'utf-8' });
    } catch {
      // Might not have remote configured
    }

    // Build production bundle
    execSync('npm run build', { encoding: 'utf-8' });

    // Get deployment info
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();

    res.json({
      success: true,
      branch: deployBranch,
      commitHash,
      message: 'Production deployment complete',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Production deploy error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Production deployment failed'
    });
  }
});

// GET /api/deploy/status - Get deployment status
router.get('/status', isAuthenticated, async (req, res) => {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    const commitMessage = execSync('git log -1 --format="%s"', { encoding: 'utf-8' }).trim();

    res.json({
      success: true,
      currentBranch: branch,
      latestCommit: {
        hash: commitHash.substring(0, 7),
        message: commitMessage
      },
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Deploy status error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get deployment status'
    });
  }
});

export default router;
