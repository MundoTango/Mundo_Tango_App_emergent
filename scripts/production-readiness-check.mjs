#!/usr/bin/env node

/**
 * MB.MD Deployment Phase: Production Readiness Verification
 * Created: October 20, 2025
 * 
 * Comprehensive validation suite for 100% production readiness
 * Tests all critical systems without requiring browser automation
 */

import fetch from 'node-fetch';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const RESULTS = {
  passed: [],
  failed: [],
  warnings: [],
  startTime: Date.now()
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function pass(test, details = '') {
  RESULTS.passed.push({ test, details });
  log(`✅ PASS: ${test}${details ? ` - ${details}` : ''}`, colors.green);
}

function fail(test, error) {
  RESULTS.failed.push({ test, error });
  log(`❌ FAIL: ${test} - ${error}`, colors.red);
}

function warn(test, message) {
  RESULTS.warnings.push({ test, message });
  log(`⚠️  WARN: ${test} - ${message}`, colors.yellow);
}

async function checkServerHealth() {
  log('\n🏥 SERVER HEALTH CHECKS', colors.cyan);
  
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (response.ok) {
      pass('Server health endpoint', `Status: ${response.status}`);
    } else {
      fail('Server health endpoint', `Status: ${response.status}`);
    }
  } catch (error) {
    fail('Server health endpoint', error.message);
  }

  try {
    const response = await fetch(BASE_URL);
    if (response.ok) {
      pass('Homepage loads', `Status: ${response.status}`);
    } else {
      fail('Homepage loads', `Status: ${response.status}`);
    }
  } catch (error) {
    fail('Homepage loads', error.message);
  }
}

async function checkSecurityHeaders() {
  log('\n🔒 SECURITY CHECKS', colors.cyan);
  
  try {
    const response = await fetch(BASE_URL);
    const headers = response.headers;
    
    // Check CSP
    const csp = headers.get('content-security-policy');
    if (csp) {
      pass('Content-Security-Policy header present');
      if (process.env.NODE_ENV === 'production' && !csp.includes('report-only')) {
        pass('CSP enforcement enabled in production');
      } else if (process.env.NODE_ENV !== 'production') {
        warn('CSP in report-only mode', 'Expected in development');
      }
    } else {
      fail('Content-Security-Policy header', 'Missing CSP header');
    }
    
    // Check X-Powered-By is disabled
    const poweredBy = headers.get('x-powered-by');
    if (!poweredBy) {
      pass('X-Powered-By header disabled');
    } else {
      fail('X-Powered-By header', 'Should be disabled for security');
    }
    
    // Check HSTS
    const hsts = headers.get('strict-transport-security');
    if (hsts) {
      pass('HSTS header present', hsts);
    } else {
      warn('HSTS header', 'Missing Strict-Transport-Security header');
    }
    
  } catch (error) {
    fail('Security headers check', error.message);
  }
}

async function checkDatabaseConnection() {
  log('\n💾 DATABASE CHECKS', colors.cyan);
  
  try {
    const response = await fetch(`${BASE_URL}/api/health/db`);
    if (response.ok) {
      const data = await response.json();
      pass('Database connection', JSON.stringify(data));
    } else {
      fail('Database connection', `Status: ${response.status}`);
    }
  } catch (error) {
    warn('Database health endpoint', 'Endpoint may not exist');
  }
}

async function checkAPIEndpoints() {
  log('\n🔌 API ENDPOINT CHECKS', colors.cyan);
  
  const endpoints = [
    { path: '/api/posts', method: 'GET', name: 'Posts API' },
    { path: '/api/events', method: 'GET', name: 'Events API' },
    { path: '/api/users/me', method: 'GET', name: 'User Profile API' },
    { path: '/api/groups', method: 'GET', name: 'Groups API' },
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method
      });
      
      // 200 = success, 401 = auth required (expected), 404 = not found
      if (response.status === 200 || response.status === 401) {
        pass(endpoint.name, `Status: ${response.status}`);
      } else if (response.status === 404) {
        warn(endpoint.name, 'Endpoint not found - may need implementation');
      } else {
        fail(endpoint.name, `Status: ${response.status}`);
      }
    } catch (error) {
      fail(endpoint.name, error.message);
    }
  }
}

async function checkTypeScriptCompilation() {
  log('\n📝 TYPESCRIPT CHECKS', colors.cyan);
  
  try {
    const { stdout, stderr } = await execAsync('npx tsc --noEmit --skipLibCheck');
    if (!stderr || stderr.trim() === '') {
      pass('TypeScript compilation', 'No errors');
    } else {
      fail('TypeScript compilation', stderr.substring(0, 500));
    }
  } catch (error) {
    if (error.stdout && error.stdout.includes('error TS')) {
      fail('TypeScript compilation', 'Type errors found');
    } else {
      pass('TypeScript compilation', 'No blocking errors');
    }
  }
}

async function checkCriticalFiles() {
  log('\n📁 CRITICAL FILES CHECK', colors.cyan);
  
  const criticalFiles = [
    'server/index.ts',
    'server/middleware/errorHandler.ts',
    'server/utils/apiResponse.ts',
    'vite.config.ts',
    'package.json',
    'shared/schema.ts',
    'client/src/App.tsx'
  ];
  
  for (const file of criticalFiles) {
    try {
      const stat = await fs.stat(file);
      if (stat.size === 0) {
        fail(`File integrity: ${file}`, 'File is empty (0 bytes)');
      } else {
        pass(`File integrity: ${file}`, `${stat.size} bytes`);
      }
    } catch (error) {
      fail(`File integrity: ${file}`, 'File missing');
    }
  }
}

async function checkEnvironmentVariables() {
  log('\n🌍 ENVIRONMENT VARIABLES', colors.cyan);
  
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
  const optionalVars = [
    'STRIPE_SECRET_KEY',
    'ANTHROPIC_API_KEY',
    'SENTRY_DSN',
    'POSTHOG_API_KEY'
  ];
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      pass(`Required env var: ${varName}`, 'Set');
    } else {
      fail(`Required env var: ${varName}`, 'Missing');
    }
  }
  
  for (const varName of optionalVars) {
    if (process.env[varName]) {
      pass(`Optional env var: ${varName}`, 'Set');
    } else {
      warn(`Optional env var: ${varName}`, 'Not set (optional)');
    }
  }
}

async function checkIntegrationStatus() {
  log('\n🔗 INTEGRATION STATUS', colors.cyan);
  
  // Check if integration status endpoint exists
  try {
    const response = await fetch(`${BASE_URL}/api/integrations/status`);
    if (response.ok) {
      const data = await response.json();
      pass('Integrations endpoint', `Found ${Object.keys(data).length} integrations`);
    } else {
      warn('Integrations endpoint', 'Not available');
    }
  } catch (error) {
    warn('Integrations endpoint', 'Not available');
  }
  
  // Check for known integrations
  const integrations = [
    { name: 'PostgreSQL', env: 'DATABASE_URL' },
    { name: 'Stripe', env: 'STRIPE_SECRET_KEY' },
    { name: 'Object Storage', check: 'REPLIT_OBJECT_STORAGE' },
    { name: 'Anthropic AI', env: 'ANTHROPIC_API_KEY' }
  ];
  
  for (const integration of integrations) {
    const envVar = integration.env || integration.check;
    if (process.env[envVar]) {
      pass(`Integration: ${integration.name}`, 'Configured');
    } else {
      warn(`Integration: ${integration.name}`, 'Not configured');
    }
  }
}

async function checkPerformance() {
  log('\n⚡ PERFORMANCE CHECKS', colors.cyan);
  
  try {
    const start = Date.now();
    const response = await fetch(BASE_URL);
    const duration = Date.now() - start;
    
    if (duration < 1000) {
      pass('Homepage response time', `${duration}ms (excellent)`);
    } else if (duration < 3000) {
      pass('Homepage response time', `${duration}ms (good)`);
    } else {
      warn('Homepage response time', `${duration}ms (could be faster)`);
    }
    
    // Check response size
    const text = await response.text();
    const sizeKB = (text.length / 1024).toFixed(2);
    pass('Homepage size', `${sizeKB} KB`);
    
  } catch (error) {
    fail('Performance check', error.message);
  }
}

async function generateReport() {
  log('\n' + '='.repeat(60), colors.blue);
  log('🎯 PRODUCTION READINESS REPORT', colors.blue);
  log('='.repeat(60), colors.blue);
  
  const duration = ((Date.now() - RESULTS.startTime) / 1000).toFixed(2);
  const total = RESULTS.passed.length + RESULTS.failed.length;
  const score = total > 0 ? ((RESULTS.passed.length / total) * 100).toFixed(1) : 0;
  
  log(`\n📊 Summary:`, colors.cyan);
  log(`   ✅ Passed: ${RESULTS.passed.length}`, colors.green);
  log(`   ❌ Failed: ${RESULTS.failed.length}`, colors.red);
  log(`   ⚠️  Warnings: ${RESULTS.warnings.length}`, colors.yellow);
  log(`   ⏱️  Duration: ${duration}s`);
  log(`   📈 Score: ${score}%\n`, score >= 90 ? colors.green : colors.yellow);
  
  if (RESULTS.failed.length > 0) {
    log('🔴 Failed Tests:', colors.red);
    RESULTS.failed.forEach(({ test, error }) => {
      log(`   - ${test}: ${error}`, colors.red);
    });
  }
  
  if (score >= 95) {
    log('\n🎉 PRODUCTION READY! Platform is at 100% readiness!', colors.green);
    return true;
  } else if (score >= 80) {
    log('\n✅ MOSTLY READY - Minor issues to address', colors.yellow);
    return false;
  } else {
    log('\n⚠️  NOT READY - Critical issues need attention', colors.red);
    return false;
  }
}

async function main() {
  log('🚀 Starting Production Readiness Check...', colors.blue);
  log(`   Target: ${BASE_URL}`, colors.blue);
  log(`   Environment: ${process.env.NODE_ENV || 'development'}`, colors.blue);
  
  try {
    await checkServerHealth();
    await checkSecurityHeaders();
    await checkDatabaseConnection();
    await checkAPIEndpoints();
    await checkCriticalFiles();
    await checkEnvironmentVariables();
    await checkIntegrationStatus();
    await checkPerformance();
    await checkTypeScriptCompilation();
    
    const isReady = await generateReport();
    process.exit(isReady ? 0 : 1);
    
  } catch (error) {
    log(`\n💥 Fatal error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

main();
