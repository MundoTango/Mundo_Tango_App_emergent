#!/usr/bin/env node

// ESA LIFE CEO 61×21 Production Entry Point
// This file handles TypeScript execution in production

const { spawn } = require('child_process');
const path = require('path');

console.log('[ESA 61x21] Starting production server...');

// Check if tsx is available as a module
let tsxPath;
try {
  tsxPath = require.resolve('tsx/cli');
  console.log('[ESA 61x21] Found tsx at:', tsxPath);
} catch (e) {
  console.log('[ESA 61x21] tsx not found as module, trying direct node with tsx register');
  // Fall back to using node with tsx register
  const serverProcess = spawn('node', ['-r', 'tsx/cjs', 'server/index.ts'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'production',
      NODE_OPTIONS: '--max-old-space-size=1024'
    }
  });

  // Handle process termination
  process.on('SIGTERM', () => {
    console.log('[ESA 61x21] SIGTERM received, shutting down gracefully...');
    serverProcess.kill('SIGTERM');
  });

  process.on('SIGINT', () => {
    console.log('[ESA 61x21] SIGINT received, shutting down gracefully...');
    serverProcess.kill('SIGINT');
  });

  serverProcess.on('exit', (code) => {
    console.log(`[ESA 61x21] Server process exited with code ${code}`);
    process.exit(code);
  });

  return;
}

// If tsx is found, use it directly
const serverProcess = spawn('node', [tsxPath, 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production',
    NODE_OPTIONS: '--max-old-space-size=1024'
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('[ESA 61x21] SIGTERM received, shutting down gracefully...');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('[ESA 61x21] SIGINT received, shutting down gracefully...');
  serverProcess.kill('SIGINT');
});

serverProcess.on('exit', (code) => {
  console.log(`[ESA 61x21] Server process exited with code ${code}`);
  process.exit(code);
});