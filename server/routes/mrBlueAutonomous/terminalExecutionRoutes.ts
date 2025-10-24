import { Router } from 'express';
import { spawn } from 'child_process';
import { validateCommand } from './securityUtils.js';

const router = Router();

/**
 * POST /api/mrblue/execute-command
 * Execute terminal command with streaming output
 */
router.post('/execute-command', async (req, res) => {
  try {
    const { command, timeout = 30000, cwd } = req.body;

    if (!command || typeof command !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'command is required and must be a string'
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚡ [MR BLUE - TERMINAL EXECUTION]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 Command:', command);
    console.log('⏱️  Timeout:', timeout, 'ms');
    console.log('📁 CWD:', cwd || process.cwd());

    // Security: Validate command is in allowlist
    validateCommand(command);
    console.log('✅ Command validated');

    const workingDir = cwd || process.cwd();
    
    // Parse command into parts
    const [cmd, ...args] = command.split(' ');

    // Security: shell:false prevents command injection via metacharacters
    const child = spawn(cmd, args, {
      cwd: workingDir,
      shell: false,
      timeout
    });

    let stdout = '';
    let stderr = '';
    let exitCode: number | null = null;

    child.stdout?.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log('📤 stdout:', output.trim());
    });

    child.stderr?.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      console.log('⚠️  stderr:', output.trim());
    });

    const result = await new Promise<{
      stdout: string;
      stderr: string;
      exitCode: number | null;
      error?: string;
    }>((resolve) => {
      child.on('close', (code) => {
        exitCode = code;
        console.log('✅ Command completed with exit code:', code);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code
        });
      });

      child.on('error', (error) => {
        console.error('❌ Command error:', error.message);
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: null,
          error: error.message
        });
      });

      // Timeout handler
      setTimeout(() => {
        if (exitCode === null) {
          console.log('⏱️  Command timeout - killing process');
          child.kill('SIGTERM');
          resolve({
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode: null,
            error: 'Command timeout'
          });
        }
      }, timeout);
    });

    res.json({
      success: result.exitCode === 0,
      data: result
    });

  } catch (error: any) {
    console.error('❌ [TERMINAL EXECUTION ERROR]:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
