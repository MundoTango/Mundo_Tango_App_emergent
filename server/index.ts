/**
 * Mundo Tango ESA LIFE CEO - Server Bootstrap (ESM Compatible)
 * This TypeScript file launches the TypeScript server with ES module support
 */

import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('[Mundo Tango ESA] Server bootstrap starting...');
console.log('[Mundo Tango ESA] Memory allocation: 4GB');
console.log('[Mundo Tango ESA] Environment:', process.env.NODE_ENV || 'development');

// Launch the actual TypeScript server using tsx (Vite-free version)
const serverPath = join(__dirname, 'index-novite.ts');
const child = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    NODE_OPTIONS: '--max-old-space-size=4096 --expose-gc',
    PORT: process.env.PORT || '5000',
    DISABLE_REDIS: 'true'
  }
});

child.on('error', (err: Error) => {
  console.error('[Mundo Tango ESA] Failed to start server:', err.message);
  process.exit(1);
});

child.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
  if (signal) {
    console.log(`[Mundo Tango ESA] Server terminated by signal ${signal}`);
  } else if (code !== 0) {
    console.error(`[Mundo Tango ESA] Server exited with code ${code}`);
  }
  process.exit(code || 0);
});

// Forward termination signals
(['SIGTERM', 'SIGINT', 'SIGHUP'] as NodeJS.Signals[]).forEach(signal => {
  process.on(signal, () => {
    console.log(`[Mundo Tango ESA] Forwarding ${signal} to server...`);
    child.kill(signal);
  });
});