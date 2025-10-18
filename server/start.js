#!/usr/bin/env node
// Mundo Tango ESA LIFE CEO - JavaScript wrapper to start TypeScript server with proper memory settings

// Set memory limit to 4GB for video uploads
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

// Load and run the TypeScript server
require('tsx/cjs');
require('./index.ts');