/**
 * GIT ROUTES - Real Git Integration API + Agent #126
 * MB.MD Build: Git status, commit, push functionality
 * Agent #126: Validation, AI commit messages, GitHub integration
 * Completeness Law: No mock data, real git operations
 */

import { Router } from 'express';
import { execSync } from 'child_process';
import { isAuthenticated } from '../replitAuth';
import Anthropic from '@anthropic-ai/sdk';
import simpleGit from 'simple-git';

const router = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const git = simpleGit({
  baseDir: process.cwd(),
  binary: 'git',
  maxConcurrentProcesses: 6
});

// GET /api/git/status - Get current git status
router.get('/status', isAuthenticated, async (req, res) => {
  try {
    // Get current branch
    const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    
    // Get modified files
    const statusOutput = execSync('git status --porcelain', { encoding: 'utf-8' });
    const modifiedFiles = statusOutput
      .split('\n')
      .filter(line => line.trim())
      .map(line => ({
        status: line.substring(0, 2).trim(),
        path: line.substring(3).trim()
      }));

    // Get last commit info
    const lastCommit = execSync('git log -1 --format="%H|%an|%ae|%s|%ct"', { encoding: 'utf-8' }).trim();
    const [hash, author, email, message, timestamp] = lastCommit.split('|');

    res.json({
      success: true,
      branch,
      modifiedFiles,
      lastCommit: {
        hash,
        author,
        email,
        message,
        timestamp: new Date(parseInt(timestamp) * 1000).toISOString()
      }
    });
  } catch (error) {
    console.error('Git status error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get git status'
    });
  }
});

// POST /api/git/commit - Commit changes
router.post('/commit', isAuthenticated, async (req, res) => {
  try {
    const { message, files } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Commit message is required'
      });
    }

    // Add files (or all if not specified)
    if (files && Array.isArray(files) && files.length > 0) {
      files.forEach(file => {
        execSync(`git add "${file}"`, { encoding: 'utf-8' });
      });
    } else {
      execSync('git add -A', { encoding: 'utf-8' });
    }

    // Commit
    const commitMsg = message.replace(/"/g, '\\"');
    execSync(`git commit -m "${commitMsg}"`, { encoding: 'utf-8' });

    // Get commit hash
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();

    res.json({
      success: true,
      commitHash,
      message: 'Changes committed successfully'
    });
  } catch (error) {
    console.error('Git commit error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to commit changes'
    });
  }
});

// GET /api/git/log - Get commit history
router.get('/log', isAuthenticated, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    
    const logOutput = execSync(
      `git log -${limit} --format="%H|%an|%ae|%s|%ct"`,
      { encoding: 'utf-8' }
    );

    const commits = logOutput
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [hash, author, email, message, timestamp] = line.split('|');
        return {
          hash,
          author,
          email,
          message,
          timestamp: new Date(parseInt(timestamp) * 1000).toISOString()
        };
      });

    res.json({
      success: true,
      commits
    });
  } catch (error) {
    console.error('Git log error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get git log'
    });
  }
});

// GET /api/git/diff - Get file diff
router.get('/diff', isAuthenticated, async (req, res) => {
  try {
    const { file } = req.query;

    let diffOutput: string;
    if (file && typeof file === 'string') {
      diffOutput = execSync(`git diff HEAD -- "${file}"`, { encoding: 'utf-8' });
    } else {
      diffOutput = execSync('git diff HEAD', { encoding: 'utf-8' });
    }

    res.json({
      success: true,
      diff: diffOutput
    });
  } catch (error) {
    console.error('Git diff error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get diff'
    });
  }
});

// POST /api/git/generate-message - AI-powered commit message (Agent #126)
router.post('/generate-message', isAuthenticated, async (req, res) => {
  try {
    const diff = execSync('git diff --cached', { encoding: 'utf-8' });
    
    if (!diff) {
      return res.json({ message: 'chore: update files', fallback: true });
    }
    
    // Use Claude to generate conventional commit message
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Generate a conventional commit message for these changes. Format: <type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore
Max 72 chars, no period at end.

Diff:
${diff.slice(0, 2000)}`
      }]
    });
    
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }
    
    const message = content.text.trim();
    
    res.json({ message, generated: true });
  } catch (error: any) {
    console.error('[Git] Message generation error:', error);
    res.json({ 
      message: 'chore: update files',
      fallback: true,
      error: error.message
    });
  }
});

// POST /api/git/push - Push to GitHub (Agent #126) with conflict detection
router.post('/push', isAuthenticated, async (req, res) => {
  try {
    const { branch } = req.body;
    const pushBranch = branch || 'main';
    
    // PHASE 3 - STREAM 1: Conflict detection before push
    try {
      const remoteChanges = execSync(`git fetch origin ${pushBranch} && git log HEAD..origin/${pushBranch} --oneline`, { encoding: 'utf-8' });
      if (remoteChanges.trim()) {
        return res.status(409).json({
          success: false,
          error: 'Push rejected. Remote has changes. Pull latest changes first.',
          conflictDetected: true,
          remoteCommits: remoteChanges.trim().split('\n').length
        });
      }
    } catch (fetchError) {
      // Remote might not exist or other fetch error, proceed with push
      console.warn('[Git] Fetch warning:', fetchError);
    }
    
    // Push to origin
    execSync(`git push origin ${pushBranch}`, { encoding: 'utf-8' });
    
    res.json({
      success: true,
      branch: pushBranch,
      message: 'Pushed to GitHub successfully'
    });
  } catch (error: any) {
    console.error('[Git] Push error:', error);
    
    let userMessage = error.message;
    if (error.message.includes('Authentication failed')) {
      userMessage = 'GitHub authentication failed. Add GITHUB_TOKEN to Secrets.';
    } else if (error.message.includes('rejected')) {
      userMessage = 'Push rejected. Pull latest changes first.';
    }
    
    res.status(500).json({
      success: false,
      error: userMessage
    });
  }
});

// POST /api/git/rollback - Instant rollback (Auto-Commit Service)
router.post('/rollback', isAuthenticated, async (req, res) => {
  try {
    const { commitHash } = req.body;
    
    if (commitHash) {
      execSync(`git reset --hard ${commitHash}`, { encoding: 'utf-8' });
    } else {
      execSync('git reset --hard HEAD', { encoding: 'utf-8' });
      execSync('git clean -fd', { encoding: 'utf-8' });
    }
    
    res.json({
      success: true,
      message: commitHash ? `Rolled back to ${commitHash}` : 'Rolled back to HEAD'
    });
  } catch (error) {
    console.error('[Git] Rollback error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to rollback'
    });
  }
});

// POST /api/git/checkpoint - Create checkpoint (Agent #126 + Phase 3)
router.post('/checkpoint', isAuthenticated, async (req, res) => {
  try {
    const { message } = req.body;
    const checkpointMessage = message || `Checkpoint: ${new Date().toISOString()}`;
    
    // Add all changes
    execSync('git add -A', { encoding: 'utf-8' });
    
    // Create commit
    const commitMsg = checkpointMessage.replace(/"/g, '\\"');
    execSync(`git commit -m "${commitMsg}"`, { encoding: 'utf-8' });
    
    // Get commit hash
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    
    res.json({
      success: true,
      checkpointId: `checkpoint-${Date.now()}`,
      commit: commitHash,
      message: 'Checkpoint created successfully'
    });
  } catch (error) {
    console.error('[Git] Checkpoint error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create checkpoint'
    });
  }
});

export default router;
