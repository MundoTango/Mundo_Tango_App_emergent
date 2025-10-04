#!/usr/bin/env node

/**
 * ESA LIFE CEO 61x21 Framework - Route Validation Script
 * Layer 51-61: CI/CD Automation & Route Protection
 * 
 * Purpose: Validate route configuration and prevent debug components in production
 * Documentation: docs/build-coordination/route-protection-sprint.md
 * 
 * Usage:
 *   node scripts/validate-routes.js
 *   npm run validate:routes
 * 
 * Exit Codes:
 *   0 - All validations passed
 *   1 - Validation failures detected
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  error: (msg) => console.error(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.warn(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}\n${colors.blue}${msg}${colors.reset}\n${colors.blue}${'='.repeat(60)}${colors.reset}\n`),
};

// Validation results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: [],
  coverage: {
    productionRoutes: 0,
    debugRoutes: 0,
    archiveRoutes: 0,
    totalRoutes: 0,
  },
};

/**
 * Read and parse the route configuration
 */
function loadRoutes() {
  try {
    const routesPath = join(__dirname, '../client/src/config/routes.ts');
    const routesContent = readFileSync(routesPath, 'utf-8');
    
    // Parse route arrays from the file
    const productionMatch = routesContent.match(/export const productionRoutes.*?=\s*\[([\s\S]*?)\];/);
    const debugMatch = routesContent.match(/export const debugRoutes.*?=\s*\[([\s\S]*?)\];/);
    
    if (!productionMatch) {
      throw new Error('Could not find productionRoutes in routes.ts');
    }
    
    // Count routes by analyzing the file content
    const productionRoutes = (productionMatch[1].match(/path:/g) || []).length;
    const debugRoutes = debugMatch ? (debugMatch[1].match(/path:/g) || []).length : 0;
    
    results.coverage.productionRoutes = productionRoutes;
    results.coverage.debugRoutes = debugRoutes;
    results.coverage.totalRoutes = productionRoutes + debugRoutes;
    
    return { routesContent, productionMatch, debugMatch };
  } catch (error) {
    log.error(`Failed to load routes: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Validate that all production routes use valid components
 */
function validateProductionComponents(routesContent) {
  log.section('Validating Production Route Components');
  
  const debugPatterns = [
    /_debug\//,
    /@\/pages\/_debug/,
    /pages\/_debug/,
  ];
  
  const archivePatterns = [
    /_archive\//,
    /@\/pages\/_archive/,
    /pages\/_archive/,
  ];
  
  let hasDebugInProduction = false;
  let hasArchiveInProduction = false;
  
  // Extract production routes section (from export to before debugRoutes comment block)
  const lines = routesContent.split('\n');
  const productionStart = lines.findIndex(l => l.includes('export const productionRoutes'));
  
  // Find the comment block before debugRoutes (starts with /**)
  let debugCommentStart = -1;
  for (let i = productionStart + 1; i < lines.length; i++) {
    if (lines[i].trim().startsWith('/**') && 
        i + 1 < lines.length && 
        (lines[i + 1].includes('DEBUG ROUTES') || lines[i + 2]?.includes('DEBUG ROUTES'))) {
      debugCommentStart = i;
      break;
    }
  }
  
  if (productionStart !== -1 && debugCommentStart !== -1) {
    // Only check production routes, exclude debug comment section
    const productionContent = lines.slice(productionStart, debugCommentStart).join('\n');
    
    debugPatterns.forEach(pattern => {
      if (pattern.test(productionContent)) {
        hasDebugInProduction = true;
        results.errors.push('Production routes contain _debug/ component imports');
        log.error('Found _debug/ import in production routes');
      }
    });
    
    archivePatterns.forEach(pattern => {
      if (pattern.test(productionContent)) {
        hasArchiveInProduction = true;
        results.errors.push('Production routes contain _archive/ component imports');
        log.error('Found _archive/ import in production routes');
      }
    });
  }
  
  if (!hasDebugInProduction && !hasArchiveInProduction) {
    log.success('All production routes use valid components');
    results.passed++;
  } else {
    results.failed++;
  }
}

/**
 * Validate App.tsx only uses routes from the registry
 */
function validateAppRoutes() {
  log.section('Validating App.tsx Route Usage');
  
  try {
    const appPath = join(__dirname, '../client/src/App.tsx');
    const appContent = readFileSync(appPath, 'utf-8');
    
    // Check that App.tsx imports from route registry
    if (!appContent.includes("from '@/config/routes'") && !appContent.includes('from "@/config/routes"')) {
      log.error('App.tsx does not import from route registry');
      results.errors.push('App.tsx missing route registry import');
      results.failed++;
      return;
    }
    
    // Check for direct lazy imports to debug pages (should be in registry instead)
    const debugImportPatterns = [
      /lazy\(\s*\(\)\s*=>\s*import\(['"].*\/_debug\//,
      /lazy\(\s*\(\)\s*=>\s*import\(['"]@\/pages\/_debug/,
    ];
    
    let hasDirectDebugImports = false;
    debugImportPatterns.forEach(pattern => {
      if (pattern.test(appContent)) {
        hasDirectDebugImports = true;
        log.error('App.tsx contains direct lazy imports to _debug/ components');
        results.errors.push('App.tsx has direct debug component imports (should use registry)');
      }
    });
    
    if (!hasDirectDebugImports) {
      log.success('App.tsx properly uses route registry');
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Check for production route filtering
    if (appContent.includes('productionRoutes') || appContent.includes('getProductionRoutes')) {
      log.success('App.tsx filters production routes correctly');
      results.passed++;
    } else {
      log.warning('App.tsx may not be filtering routes properly');
      results.warnings++;
    }
    
  } catch (error) {
    log.error(`Failed to validate App.tsx: ${error.message}`);
    results.failed++;
  }
}

/**
 * Validate route mode classification
 */
function validateRouteClassification(routesContent, debugMatch) {
  log.section('Validating Route Mode Classification');
  
  // Check that debug routes have mode: 'debug'
  if (debugMatch) {
    const debugSection = debugMatch[0];
    const debugRouteCount = (debugSection.match(/path:/g) || []).length;
    const debugModeCount = (debugSection.match(/mode:\s*['"]debug['"]/g) || []).length;
    
    if (debugRouteCount === debugModeCount) {
      log.success(`All ${debugRouteCount} debug routes properly classified with mode: 'debug'`);
      results.passed++;
    } else {
      log.error(`Debug route classification mismatch: ${debugRouteCount} routes, ${debugModeCount} with debug mode`);
      results.errors.push('Debug routes missing mode: "debug" classification');
      results.failed++;
    }
  }
  
  // Check that production routes have mode: 'production'
  const productionSection = routesContent.match(/export const productionRoutes[\s\S]*?(?=export const debugRoutes|$)/);
  if (productionSection) {
    const prodRouteCount = (productionSection[0].match(/path:/g) || []).length;
    const prodModeCount = (productionSection[0].match(/mode:\s*['"]production['"]/g) || []).length;
    
    if (prodRouteCount === prodModeCount) {
      log.success(`All ${prodRouteCount} production routes properly classified with mode: 'production'`);
      results.passed++;
    } else {
      log.error(`Production route classification mismatch: ${prodRouteCount} routes, ${prodModeCount} with production mode`);
      results.errors.push('Production routes missing mode: "production" classification');
      results.failed++;
    }
  }
}

/**
 * Generate route coverage report
 */
async function generateCoverageReport() {
  log.section('Route Coverage Report');
  
  console.log(`Total Routes: ${results.coverage.totalRoutes}`);
  console.log(`  - Production Routes: ${results.coverage.productionRoutes} (${((results.coverage.productionRoutes / results.coverage.totalRoutes) * 100).toFixed(1)}%)`);
  console.log(`  - Debug Routes: ${results.coverage.debugRoutes} (${((results.coverage.debugRoutes / results.coverage.totalRoutes) * 100).toFixed(1)}%)`);
  
  // Write JSON report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      passed: results.passed,
      failed: results.failed,
      warnings: results.warnings,
      total: results.passed + results.failed,
    },
    coverage: results.coverage,
    errors: results.errors,
  };
  
  try {
    const reportPath = join(__dirname, '../route-coverage-report.json');
    const { writeFileSync } = await import('fs');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log.info(`Coverage report written to: route-coverage-report.json`);
  } catch (error) {
    log.warning(`Could not write coverage report: ${error.message}`);
  }
}

/**
 * Main validation function
 */
async function main() {
  console.log('\n🔍 ESA LIFE CEO 61x21 - Route Validation Script\n');
  
  const { routesContent, productionMatch, debugMatch } = loadRoutes();
  
  validateProductionComponents(routesContent);
  validateAppRoutes();
  validateRouteClassification(routesContent, debugMatch);
  await generateCoverageReport();
  
  // Final summary
  log.section('Validation Summary');
  
  console.log(`Tests Passed: ${colors.green}${results.passed}${colors.reset}`);
  console.log(`Tests Failed: ${colors.red}${results.failed}${colors.reset}`);
  console.log(`Warnings: ${colors.yellow}${results.warnings}${colors.reset}`);
  
  if (results.failed > 0) {
    log.error('\nValidation FAILED! The following errors were found:');
    results.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
    console.log('\nSee: docs/build-coordination/route-protection-sprint.md\n');
    process.exit(1);
  } else {
    log.success('\nAll validations PASSED! Route configuration is correct.\n');
    process.exit(0);
  }
}

// Run validation
main();
