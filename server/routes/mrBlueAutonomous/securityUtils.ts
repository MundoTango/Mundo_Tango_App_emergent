/**
 * Security utilities for Autonomous Mr Blue
 * Prevents path traversal, command injection, and other vulnerabilities
 */

import path from 'path';

/**
 * Sanitize and validate file paths to prevent path traversal attacks
 * @throws Error if path is invalid or attempts to escape the repository
 */
export function sanitizeFilePath(filePath: string): string {
  // Reject absolute paths immediately
  if (path.isAbsolute(filePath)) {
    throw new Error('Absolute paths are not allowed');
  }

  // Normalize and resolve the path
  const normalized = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
  const fullPath = path.resolve(process.cwd(), normalized);
  const rootPath = path.resolve(process.cwd());

  // Ensure the resolved path is within the repository root
  if (!fullPath.startsWith(rootPath + path.sep) && fullPath !== rootPath) {
    throw new Error('Path escapes repository root');
  }

  return fullPath;
}

/**
 * Escape shell command arguments to prevent command injection
 */
export function escapeShellArg(arg: string): string {
  // Replace single quotes with '\'' and wrap in single quotes
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

/**
 * Validate git commit message to prevent injection
 */
export function sanitizeGitMessage(message: string): string {
  // Remove dangerous characters and limit length
  const sanitized = message
    .replace(/[`$();&|<>]/g, '')
    .replace(/\n/g, ' ')
    .trim()
    .slice(0, 500);
  
  if (sanitized.length === 0) {
    return 'Automated checkpoint';
  }
  
  return sanitized;
}

/**
 * Allowed terminal commands (whitelist)
 */
const ALLOWED_COMMANDS = new Set([
  'ls', 'cat', 'grep', 'find', 'echo',
  'npm', 'node', 'git', 'python3', 'python',
  'npx', 'pnpm', 'yarn', 'tsx', 'tsc'
]);

/**
 * Validate terminal command is allowed and safe
 * @throws Error if command is not in allowlist or contains shell metacharacters
 */
export function validateCommand(command: string): void {
  const firstWord = command.trim().split(/\s+/)[0];
  
  if (!ALLOWED_COMMANDS.has(firstWord)) {
    throw new Error(`Command not allowed: ${firstWord}. Allowed commands: ${Array.from(ALLOWED_COMMANDS).join(', ')}`);
  }

  // Reject commands with shell metacharacters that could enable injection
  const dangerousChars = /[;&|`$()<>]/;
  if (dangerousChars.test(command)) {
    throw new Error('Command contains dangerous shell metacharacters');
  }
}

/**
 * Sanitize search query for ripgrep
 */
export function sanitizeSearchQuery(query: string): string {
  // Escape special regex characters
  return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
