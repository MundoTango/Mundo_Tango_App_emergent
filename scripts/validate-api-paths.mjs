#!/usr/bin/env node
/**
 * MB.MD TRACK 6.2: API Contract Validator
 * Validates frontend useQuery paths match backend routes
 * Prevents data disconnection bugs (Phase 19 audit tool)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ANSI colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Extract all frontend API calls
async function extractFrontendCalls() {
  console.log(`${colors.cyan}${colors.bold}Extracting Frontend API Calls...${colors.reset}\n`);
  
  const frontendFiles = await glob('client/src/**/*.{ts,tsx,js,jsx}', { cwd: rootDir });
  const apiCalls = new Set();
  
  for (const file of frontendFiles) {
    const content = fs.readFileSync(path.join(rootDir, file), 'utf-8');
    
    // Match useQuery patterns
    const useQueryPattern = /useQuery\s*\(\s*{\s*queryKey:\s*\[['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = useQueryPattern.exec(content)) !== null) {
      apiCalls.add(match[1]);
    }
    
    // Match fetch patterns
    const fetchPattern = /fetch\s*\(\s*['"`]([/\w-]+)['"`]/g;
    while ((match = fetchPattern.exec(content)) !== null) {
      if (match[1].startsWith('/api/')) {
        apiCalls.add(match[1]);
      }
    }
    
    // Match axios patterns
    const axiosPattern = /axios\.(get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    while ((match = axiosPattern.exec(content)) !== null) {
      if (match[2].startsWith('/api/')) {
        apiCalls.add(match[2]);
      }
    }
    
    // Match apiRequest patterns (custom helper)
    const apiRequestPattern = /apiRequest\s*\(\s*['"`]([^'"`]+)['"`]/g;
    while ((match = apiRequestPattern.exec(content)) !== null) {
      apiCalls.add(match[1]);
    }
  }
  
  return Array.from(apiCalls).sort();
}

// Extract all backend routes
async function extractBackendRoutes() {
  console.log(`${colors.cyan}${colors.bold}Extracting Backend Routes...${colors.reset}\n`);
  
  const backendFiles = await glob('server/routes/**/*.{ts,js}', { cwd: rootDir });
  const routes = new Set();
  
  for (const file of backendFiles) {
    const content = fs.readFileSync(path.join(rootDir, file), 'utf-8');
    
    // Match router.get/post/put/delete patterns
    const routePattern = /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = routePattern.exec(content)) !== null) {
      const routePath = match[2];
      
      // Normalize route (remove parameters like :id)
      const normalizedPath = routePath.replace(/:[a-zA-Z0-9_]+/g, ':param');
      routes.add(normalizedPath);
    }
  }
  
  return Array.from(routes).sort();
}

// Normalize paths for comparison (remove trailing slashes, params)
function normalizePath(path) {
  return path
    .replace(/\/$/, '') // Remove trailing slash
    .replace(/:[a-zA-Z0-9_]+/g, ':param') // Replace params with :param
    .replace(/\{[a-zA-Z0-9_]+\}/g, ':param'); // Replace {id} with :param
}

// Compare frontend calls with backend routes
function compareAPIPaths(frontendCalls, backendRoutes) {
  console.log(`${colors.cyan}${colors.bold}Comparing API Paths...${colors.reset}\n`);
  
  const normalizedBackend = backendRoutes.map(normalizePath);
  const mismatches = [];
  const matches = [];
  
  for (const call of frontendCalls) {
    const normalized = normalizePath(call);
    
    if (normalizedBackend.includes(normalized)) {
      matches.push(call);
    } else {
      // Check if backend route exists without /api prefix
      const withoutApiPrefix = normalized.replace(/^\/api/, '');
      const backendWithoutApi = normalizedBackend.some(r => r === withoutApiPrefix);
      
      mismatches.push({
        frontend: call,
        suggested: backendWithoutApi ? `Backend has ${withoutApiPrefix} but frontend calls ${call}` : 'No matching backend route found'
      });
    }
  }
  
  return { mismatches, matches };
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log(`${colors.magenta}${colors.bold}`);
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║   MB.MD TRACK 6.2: API Contract Validator        ║');
  console.log('║   Phase 19: End-to-End Data Flow Validation      ║');
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);
  
  if (command === '--extract-frontend') {
    const calls = await extractFrontendCalls();
    console.log(`${colors.green}Found ${calls.length} frontend API calls:${colors.reset}`);
    calls.forEach(call => console.log(`  ${colors.cyan}→${colors.reset} ${call}`));
    return;
  }
  
  if (command === '--extract-backend') {
    const routes = await extractBackendRoutes();
    console.log(`${colors.green}Found ${routes.length} backend routes:${colors.reset}`);
    routes.forEach(route => console.log(`  ${colors.cyan}→${colors.reset} ${route}`));
    return;
  }
  
  // Default: Full comparison
  const frontendCalls = await extractFrontendCalls();
  const backendRoutes = await extractBackendRoutes();
  
  console.log(`${colors.blue}Frontend API Calls: ${frontendCalls.length}${colors.reset}`);
  console.log(`${colors.blue}Backend Routes: ${backendRoutes.length}${colors.reset}\n`);
  
  const { mismatches, matches } = compareAPIPaths(frontendCalls, backendRoutes);
  
  // Print matches
  if (matches.length > 0) {
    console.log(`${colors.green}${colors.bold}✅ Matching Paths (${matches.length}):${colors.reset}`);
    matches.slice(0, 10).forEach(match => {
      console.log(`  ${colors.green}✓${colors.reset} ${match}`);
    });
    if (matches.length > 10) {
      console.log(`  ${colors.cyan}... and ${matches.length - 10} more${colors.reset}`);
    }
    console.log('');
  }
  
  // Print mismatches
  if (mismatches.length > 0) {
    console.log(`${colors.red}${colors.bold}❌ Mismatched Paths (${mismatches.length}):${colors.reset}`);
    mismatches.forEach(({ frontend, suggested }) => {
      console.log(`  ${colors.red}✗${colors.reset} ${colors.yellow}${frontend}${colors.reset}`);
      console.log(`    ${colors.cyan}→ ${suggested}${colors.reset}`);
    });
    console.log('');
    
    // Exit with error code if mismatches found
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}🎉 All API paths validated successfully!${colors.reset}\n`);
  }
  
  // Summary
  console.log(`${colors.magenta}${colors.bold}Summary:${colors.reset}`);
  console.log(`  Total Frontend Calls: ${frontendCalls.length}`);
  console.log(`  Total Backend Routes: ${backendRoutes.length}`);
  console.log(`  Matches: ${colors.green}${matches.length}${colors.reset}`);
  console.log(`  Mismatches: ${mismatches.length > 0 ? colors.red : colors.green}${mismatches.length}${colors.reset}`);
  console.log(`  Coverage: ${Math.floor((matches.length / frontendCalls.length) * 100)}%\n`);
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    frontendCalls: frontendCalls.length,
    backendRoutes: backendRoutes.length,
    matches: matches.length,
    mismatches: mismatches.length,
    coverage: Math.floor((matches.length / frontendCalls.length) * 100),
    details: {
      matches,
      mismatches
    }
  };
  
  const reportPath = path.join(rootDir, 'reports/api-validation-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`${colors.cyan}Report saved to: ${reportPath}${colors.reset}\n`);
}

main().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  process.exit(1);
});
