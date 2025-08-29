/**
 * ESA LIFE CEO 61x21 - Server Bootstrap (ESM Compatible)
 * This TypeScript file launches the TypeScript server with ES module support
 */

import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('[ESA 61x21] Server bootstrap starting...');
console.log('[ESA 61x21] Memory allocation: 4GB');
console.log('[ESA 61x21] Environment:', process.env.NODE_ENV || 'development');

// Launch the actual TypeScript server using tsx (Vite-free version)
const serverPath = path.join(__dirname, 'index-novite.ts');
const child = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    NODE_OPTIONS: '--max-old-space-size=4096 --expose-gc',
    PORT: process.env.PORT || 5000,
    DISABLE_REDIS: 'true'
  }
});

child.on('error', (err) => {
  console.error('[ESA 56x21] Failed to start server:', err.message);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.log(`[ESA 56x21] Server terminated by signal ${signal}`);
  } else if (code !== 0) {
    console.error(`[ESA 56x21] Server exited with code ${code}`);
  }
  process.exit(code || 0);
});

// Forward termination signals
['SIGTERM', 'SIGINT', 'SIGHUP'].forEach(signal => {
  process.on(signal, () => {
    console.log(`[ESA 56x21] Forwarding ${signal} to server...`);
    child.kill(signal);
  });
});