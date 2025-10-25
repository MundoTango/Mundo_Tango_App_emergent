/**
 * DEPLOY ROUTES - Deployment API
 * MB.MD Build: Staging and production deployment
 * Completeness Law: Real deployment operations
 */

import { Router } from 'express';
import { spawnSync } from 'child_process';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// 🔒 Security: Sanitize branch names to prevent command injection
function sanitizeBranchName(branch: string): string {
  // Only allow alphanumeric, hyphens, underscores, forward slashes
  const sanitized = branch.replace(/[^a-zA-Z0-9\-_/]/g, '-');
  // Limit length to 100 characters
  return sanitized.substring(0, 100);
}

// POST /api/deploy/preview - Deploy to staging
router.post('/preview', isAuthenticated, async (req, res) => {
  try {
    const { branch } = req.body;
    const unsafeBranch = branch || `visual-edit-${Date.now()}`;
    const branchName = sanitizeBranchName(unsafeBranch);

    // 🔒 Security: Use spawnSync with args array to prevent command injection
    let checkoutResult = spawnSync('git', ['checkout', '-b', branchName], { encoding: 'utf-8' });
    
    // If branch already exists, checkout existing branch instead
    if (checkoutResult.status !== 0 && checkoutResult.stderr.includes('already exists')) {
      checkoutResult = spawnSync('git', ['checkout', branchName], { encoding: 'utf-8' });
    }
    
    // Now verify checkout succeeded
    if (checkoutResult.status !== 0) {
      throw new Error(`Git checkout failed: ${checkoutResult.stderr}`);
    }

    // Add and commit changes
    const addResult = spawnSync('git', ['add', '-A'], { encoding: 'utf-8' });
    if (addResult.status !== 0) {
      throw new Error(`Git add failed: ${addResult.stderr}`);
    }
    
    const commitMsg = `Visual Editor: Preview deployment ${branchName}`;
    const commitResult = spawnSync('git', ['commit', '-m', commitMsg], { encoding: 'utf-8' });
    // Allow "nothing to commit" (status 1), but fail on other errors
    // Check both stdout and stderr since Git may output to either
    const commitOutput = (commitResult.stdout || '') + (commitResult.stderr || '');
    if (commitResult.status !== 0 && !commitOutput.includes('nothing to commit')) {
      throw new Error(`Git commit failed: ${commitResult.stderr}`);
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
    const unsafeBranch = branch || 'main';
    const deployBranch = sanitizeBranchName(unsafeBranch);

    // Run tests if requested
    if (runTests) {
      const testResult = spawnSync('npm', ['test'], { encoding: 'utf-8' });
      if (testResult.status !== 0) {
        return res.status(400).json({
          success: false,
          error: 'Tests failed. Fix issues before deploying to production.'
        });
      }
    }

    // 🔒 Security: Use spawnSync with args array
    const checkoutResult = spawnSync('git', ['checkout', deployBranch], { encoding: 'utf-8' });
    if (checkoutResult.status !== 0) {
      throw new Error(`Git checkout failed: ${checkoutResult.stderr}`);
    }

    // Pull latest
    const pullResult = spawnSync('git', ['pull', 'origin', deployBranch], { encoding: 'utf-8' });
    // Ignore error if remote not configured

    // Build production bundle
    const buildResult = spawnSync('npm', ['run', 'build'], { encoding: 'utf-8' });
    if (buildResult.status !== 0) {
      throw new Error(`Build failed: ${buildResult.stderr}`);
    }

    // Get deployment info
    const hashResult = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' });
    const commitHash = hashResult.stdout.trim();

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
    // 🔒 Security: Use spawnSync with args array (no user input here, but consistent pattern)
    const branchResult = spawnSync('git', ['branch', '--show-current'], { encoding: 'utf-8' });
    const branch = branchResult.stdout.trim();
    
    const hashResult = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' });
    const commitHash = hashResult.stdout.trim();
    
    const msgResult = spawnSync('git', ['log', '-1', '--format=%s'], { encoding: 'utf-8' });
    const commitMessage = msgResult.stdout.trim();

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
