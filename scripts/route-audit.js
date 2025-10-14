#!/usr/bin/env node
/**
 * TRACK 3A: Route Audit & Mismatch Detection
 * Compares frontend API calls with backend routes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Backend routes from server/routes.ts (from our grep)
const backendRoutes = [
  '/api/users',
  '/api/auth',
  '/api/admin',
  '/api/groups',
  '/api/memories',
  '/api/friends',
  '/api/project-tracker',
  '/api/team',
  '/api/agent-chat',
  '/api/voice',
  '/api/personalities',
  '/api/audit',
  '/api/audit-scheduler',
  '/api/avatar',
  '/api/platform-audit',
  '/api/ai',
  '/api/agents',
  '/api/recommendations',
  '/api/life-ceo',
  '/api/ai-intelligence',
  '/api/mr-blue',
  '/api/mrblue',
  '/api/ai-expert',
  '/api/ui-ux',
  '/api/data-viz',
  '/api/content-media',
  '/api/code-quality'
];

// Frontend API patterns to check
const findFrontendAPICalls = () => {
  try {
    // Search for fetch, axios, or API calls in frontend
    const grepCommand = 'grep -r "fetch.*(/api/" client/src/ 2>/dev/null | head -50 || true';
    const result = execSync(grepCommand, { encoding: 'utf-8' });
    
    // Extract unique API paths
    const apiCalls = new Set();
    const lines = result.split('\n').filter(Boolean);
    
    lines.forEach(line => {
      const match = line.match(/\/api\/[a-z-]+/);
      if (match) {
        apiCalls.add(match[0]);
      }
    });
    
    return Array.from(apiCalls);
  } catch (error) {
    console.error('Error scanning frontend:', error.message);
    return [];
  }
};

// Compare routes
const auditRoutes = () => {
  const frontendCalls = findFrontendAPICalls();
  const mismatches = [];
  const matched = [];
  
  frontendCalls.forEach(call => {
    const isMatched = backendRoutes.some(route => call.startsWith(route));
    
    if (isMatched) {
      matched.push(call);
    } else {
      mismatches.push({
        frontend: call,
        status: 'NOT_FOUND',
        suggestion: `Add route handler for ${call}`
      });
    }
  });
  
  return { frontendCalls, backendRoutes, matched, mismatches };
};

// Save audit results
const saveAudit = (results) => {
  const outputPath = path.join(process.cwd(), 'docs/MrBlue/route-audit.json');
  
  fs.writeFileSync(outputPath, JSON.stringify({
    summary: {
      totalBackendRoutes: results.backendRoutes.length,
      totalFrontendCalls: results.frontendCalls.length,
      matched: results.matched.length,
      mismatches: results.mismatches.length
    },
    ...results
  }, null, 2));
  
  console.log(`✅ Route audit complete`);
  console.log(`📁 Saved to: ${outputPath}`);
};

// Main execution
console.log('🔍 Scanning routes...\n');

const results = auditRoutes();

console.log(`📊 ROUTE AUDIT RESULTS:`);
console.log(`Backend Routes: ${results.backendRoutes.length}`);
console.log(`Frontend Calls: ${results.frontendCalls.length}`);
console.log(`✅ Matched: ${results.matched.length}`);
console.log(`❌ Mismatches: ${results.mismatches.length}`);

if (results.mismatches.length > 0) {
  console.log('\n⚠️  MISMATCHES FOUND:');
  results.mismatches.forEach(m => {
    console.log(`  - ${m.frontend} → ${m.suggestion}`);
  });
}

saveAudit(results);

console.log('\n🎯 NEXT STEPS:');
console.log('1. Review mismatches in route-audit.json');
console.log('2. Add missing backend routes');
console.log('3. Run: npm run test:routes');
