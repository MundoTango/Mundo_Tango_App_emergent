#!/usr/bin/env node

// Mundo Tango ESA LIFE CEO - Memory Optimized Server Startup
// This script starts the server with increased heap size to prevent crashes

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Mundo Tango ESA LIFE CEO - Starting server with 8GB heap size...');

// Start the server with increased memory
const serverProcess = spawn('node', [
  '--max-old-space-size=8192', // 8GB heap
  '--optimize-for-size', // Optimize memory over speed
  '--gc-interval=100', // More frequent garbage collection
  '-r', 'tsx/cjs',
  path.join(__dirname, 'index.ts')
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    NODE_OPTIONS: '--max-old-space-size=8192'
  }
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});