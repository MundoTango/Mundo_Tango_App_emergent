/**
 * AGENT #142 (Multi-Model): Terminal Command Execution
 * 
 * Secure terminal execution with allow/deny lists and timeouts
 * Research: docs/research/AUTONOMOUS_CODING_RESEARCH.md
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../lib/logger';

const execAsync = promisify(exec);

export interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  duration: number;
  command: string;
}

/**
 * Terminal execution configuration
 */
interface TerminalConfig {
  allowedCommands: string[]; // Commands that are always allowed
  deniedCommands: string[]; // Commands that are always blocked
  maxTimeout: number; // Max execution timeout (milliseconds)
  workingDirectory: string; // Default working directory
}

const DEFAULT_TERMINAL_CONFIG: TerminalConfig = {
  // STREAM 3 FIX: Safe read-only commands only (removed generic npm run)
  allowedCommands: [
    'ls', 'cat', 'grep', 'find', 'head', 'tail', 'wc',
    'git status', 'git log', 'git diff', 'git branch',
    'npm list', 'npm outdated', 'npm audit',
    'node --version', 'npm --version', 'git --version',
    'echo', 'pwd', 'which', 'whoami',
    // SPECIFIC npm scripts only (no generic 'npm run')
    'npm run test:unit',
    'npm run test:e2e', 
    'npm run lint',
    'npm run typecheck',
  ],
  // Destructive or dangerous commands
  deniedCommands: [
    'rm', 'rmdir', 'del', 'deltree',
    'dd', 'mkfs', 'fdisk',
    'shutdown', 'reboot', 'halt', 'poweroff',
    'kill', 'killall', 'pkill',
    'curl', 'wget', 'nc', 'netcat', // Network commands (security risk)
    'chmod', 'chown', 'chgrp', // Permission changes
    'sudo', 'su', // Privilege escalation
    'eval', 'exec', // Code execution
    'npm run', // BLOCKED: Generic npm script execution
  ],
  maxTimeout: 60 * 60 * 1000, // 60 minutes max
  workingDirectory: process.cwd(),
};

/**
 * Terminal Command Executor with safety controls
 */
export class TerminalExecutor {
  private config: TerminalConfig;

  constructor(config: Partial<TerminalConfig> = {}) {
    this.config = { ...DEFAULT_TERMINAL_CONFIG, ...config };
  }

  /**
   * Check if command is safe to execute
   */
  private isCommandAllowed(command: string): { allowed: boolean; reason?: string } {
    const cmdLower = command.toLowerCase().trim();

    // Check denied list first
    for (const denied of this.config.deniedCommands) {
      if (cmdLower.startsWith(denied) || cmdLower.includes(` ${denied} `)) {
        return {
          allowed: false,
          reason: `Command contains denied operation: ${denied}`,
        };
      }
    }

    // Check if command starts with any allowed command
    const isAllowed = this.config.allowedCommands.some((allowed) =>
      cmdLower.startsWith(allowed.toLowerCase())
    );

    if (!isAllowed) {
      return {
        allowed: false,
        reason: 'Command not in allowed list',
      };
    }

    // Additional safety checks
    if (cmdLower.includes('&&') || cmdLower.includes('||') || cmdLower.includes(';') || cmdLower.includes('|')) {
      return {
        allowed: false,
        reason: 'Command chaining not allowed',
      };
    }

    if (cmdLower.includes('$(') || cmdLower.includes('`')) {
      return {
        allowed: false,
        reason: 'Command substitution not allowed',
      };
    }

    return { allowed: true };
  }

  /**
   * Execute terminal command with safety checks
   */
  async execute(command: string, timeout?: number): Promise<CommandResult> {
    const startTime = Date.now();

    logger.info(`[TerminalExecutor] Executing command: ${command}`);

    // Safety check
    const safetyCheck = this.isCommandAllowed(command);
    if (!safetyCheck.allowed) {
      logger.warn(`[TerminalExecutor] Command blocked: ${safetyCheck.reason}`);
      return {
        success: false,
        stdout: '',
        stderr: `Command blocked: ${safetyCheck.reason}`,
        exitCode: -1,
        duration: Date.now() - startTime,
        command,
      };
    }

    // Enforce timeout
    const execTimeout = Math.min(timeout || this.config.maxTimeout, this.config.maxTimeout);

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.config.workingDirectory,
        timeout: execTimeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        env: {
          ...process.env,
          NODE_ENV: process.env.NODE_ENV || 'development',
        },
      });

      const duration = Date.now() - startTime;

      logger.info(`[TerminalExecutor] Command completed in ${duration}ms`);

      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 0,
        duration,
        command,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      logger.error({ error, command }, '[TerminalExecutor] Command failed');

      return {
        success: false,
        stdout: error.stdout?.trim() || '',
        stderr: error.stderr?.trim() || error.message,
        exitCode: error.code || -1,
        duration,
        command,
      };
    }
  }

  /**
   * Execute multiple commands sequentially
   */
  async executeSequence(commands: string[]): Promise<CommandResult[]> {
    const results: CommandResult[] = [];

    for (const command of commands) {
      const result = await this.execute(command);
      results.push(result);

      // Stop on first failure
      if (!result.success) {
        logger.warn(`[TerminalExecutor] Sequence stopped on failure: ${command}`);
        break;
      }
    }

    return results;
  }

  /**
   * Get current configuration
   */
  getConfig(): TerminalConfig {
    return { ...this.config };
  }

  /**
   * Add allowed command
   */
  addAllowedCommand(command: string): void {
    if (!this.config.allowedCommands.includes(command)) {
      this.config.allowedCommands.push(command);
      logger.info(`[TerminalExecutor] Added allowed command: ${command}`);
    }
  }

  /**
   * Remove allowed command
   */
  removeAllowedCommand(command: string): void {
    const index = this.config.allowedCommands.indexOf(command);
    if (index > -1) {
      this.config.allowedCommands.splice(index, 1);
      logger.info(`[TerminalExecutor] Removed allowed command: ${command}`);
    }
  }
}

// Export singleton instance
export const terminalExecutor = new TerminalExecutor();
