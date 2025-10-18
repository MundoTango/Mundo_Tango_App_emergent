#!/usr/bin/env node
// Mundo Tango ESA LIFE CEO - Server runner with proper memory configuration

// Set environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_OPTIONS = '--max-old-space-size=4096 --expose-gc';

console.log('🚀 Starting server with 4GB heap for video uploads...');

// Load tsx and run the TypeScript server
require('child_process').spawn(
  'npx',
  ['tsx', 'server/index.ts'],
  {
    stdio: 'inherit',
    env: process.env,
    cwd: process.cwd()
  }
);