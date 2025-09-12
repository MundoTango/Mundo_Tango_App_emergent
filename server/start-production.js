#!/usr/bin/env node

// ESA LIFE CEO 61×21 Production Entry Point
// This file handles TypeScript execution in production using tsx

const { spawn } = require('child_process');
const path = require('path');

console.log('[ESA 61x21] Starting production server...');

// Spawn tsx process to run the TypeScript server
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
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