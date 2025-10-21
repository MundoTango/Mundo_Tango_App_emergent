/**
 * COMMAND ROUTES - Safe Command Runner API
 * MB.MD Build: Whitelisted command execution for Shell Tab
 * Security: Only approved commands, no destructive operations
 */

import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { isAuthenticated } from '../replitAuth';

const execAsync = promisify(exec);
const router = Router();

// Whitelisted commands (Security: Safe Command Runner Pattern)
const WHITELISTED_COMMANDS = [
  'npm install',
  'npm run dev',
  'npm run build',
  'npm run test',
  'npm run db:push',
  'npm run db:studio',
  'git status',
  'git log',
  'git diff',
  'git branch',
  'ls -la',
  'ls -lh',
  'pwd',
  'whoami',
  'node --version',
  'npm --version',
  'cat package.json',
  'cat tsconfig.json',
  'env | grep VITE',
  'env | grep DATABASE',
  'df -h',
  'free -h',
  'uptime'
];

// Additional regex patterns for safe variants
const SAFE_PATTERNS = [
  /^ls( -[lah]+)?( [a-zA-Z0-9/_.-]+)?$/,
  /^cat [a-zA-Z0-9/_.-]+\.json$/,
  /^cat [a-zA-Z0-9/_.-]+\.md$/,
  /^env \| grep [A-Z_]+$/,
  /^git log( -\d+)?$/,
  /^git diff( [a-zA-Z0-9/_.-]+)?$/
];

function isCommandSafe(command: string): boolean {
  // Check exact matches
  if (WHITELISTED_COMMANDS.includes(command.trim())) {
    return true;
  }

  // Check pattern matches
  return SAFE_PATTERNS.some(pattern => pattern.test(command.trim()));
}

// POST /api/commands/run - Execute whitelisted command
router.post('/run', isAuthenticated, async (req, res) => {
  try {
    const { command } = req.body;

    if (!command || typeof command !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Command is required'
      });
    }

    // Security check
    if (!isCommandSafe(command)) {
      return res.status(403).json({
        success: false,
        error: 'Command not allowed. Only whitelisted commands can be executed.',
        allowed: WHITELISTED_COMMANDS.slice(0, 10).concat(['...and more'])
      });
    }

    // Execute with timeout
    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000, // 30 second timeout
      maxBuffer: 1024 * 1024 // 1MB max output
    });

    res.json({
      success: true,
      command,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      executedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Command execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Command execution failed',
      stdout: error.stdout || '',
      stderr: error.stderr || ''
    });
  }
});

// GET /api/commands/history - Get command execution history
router.get('/history', isAuthenticated, async (req, res) => {
  try {
    // In production, this would fetch from database
    // For now, return shell history
    const { stdout } = await execAsync('history | tail -20');

    const commands = stdout
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const match = line.match(/^\s*\d+\s+(.+)$/);
        return match ? match[1] : line;
      });

    res.json({
      success: true,
      commands
    });
  } catch (error) {
    res.json({
      success: true,
      commands: [] // Return empty if history unavailable
    });
  }
});

// GET /api/commands/whitelist - Get list of allowed commands
router.get('/whitelist', isAuthenticated, async (req, res) => {
  res.json({
    success: true,
    commands: WHITELISTED_COMMANDS,
    patterns: SAFE_PATTERNS.map(p => p.source)
  });
});

export default router;
