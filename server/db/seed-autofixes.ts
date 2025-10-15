/**
 * Phase 7 Data Seeder - Track 2: Auto-Fix History
 * MB.MD V2 Methodology: Historical fix patterns for ML training
 */

import pkg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { agentAutoFixes } from '../../shared/schema';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const AUTO_FIX_HISTORY = [
  // Frontend Auto-Fixes
  {
    agentId: 'agent-2-1',
    issue: 'Component re-rendering on every state update',
    severity: 'high',
    proposedFix: 'Wrap expensive child components with React.memo and use useCallback for handlers',
    appliedAt: new Date('2025-10-13'),
    success: true,
    validatedAt: new Date('2025-10-13'),
    validationResult: { testsRun: 24, testsPassed: 24, performanceGain: '78%' },
    context: {
      file: 'client/src/components/PostFeed.tsx',
      errorType: 'performance-degradation',
      affectedUsers: 1200,
      detectedBy: 'performance-monitoring'
    }
  },
  {
    agentId: 'agent-2-2',
    issue: 'React Query cache not invalidating after mutations',
    severity: 'critical',
    proposedFix: 'Add queryClient.invalidateQueries after successful mutations with proper queryKey matching',
    appliedAt: new Date('2025-10-12'),
    success: true,
    validatedAt: new Date('2025-10-12'),
    validationResult: { testsRun: 18, testsPassed: 18, bugReports: 0 },
    context: {
      file: 'client/src/lib/queryClient.ts',
      errorType: 'stale-data',
      affectedUsers: 3400,
      detectedBy: 'user-reports'
    }
  },
  {
    agentId: 'agent-2-3',
    issue: 'Large bundle size causing slow initial page load',
    severity: 'medium',
    proposedFix: 'Implement code splitting with React.lazy for non-critical routes',
    appliedAt: new Date('2025-10-11'),
    success: true,
    validatedAt: new Date('2025-10-11'),
    validationResult: { testsRun: 15, testsPassed: 15, bundleSizeReduction: '42%' },
    context: {
      file: 'client/src/App.tsx',
      errorType: 'performance-budget-exceeded',
      affectedUsers: 5000,
      detectedBy: 'lighthouse-ci'
    }
  },

  // Backend Auto-Fixes
  {
    agentId: 'agent-1-3',
    issue: 'API endpoint responding slowly under load (>2s)',
    severity: 'critical',
    proposedFix: 'Add Redis caching layer with 5-minute TTL for frequently accessed data',
    appliedAt: new Date('2025-10-14'),
    success: true,
    validatedAt: new Date('2025-10-14'),
    validationResult: { testsRun: 32, testsPassed: 32, p95Latency: '180ms' },
    context: {
      file: 'server/routes/posts.ts',
      errorType: 'slow-query',
      affectedUsers: 2800,
      detectedBy: 'apm-monitoring'
    }
  },
  {
    agentId: 'agent-1-4',
    issue: 'JWT token vulnerability - no refresh token rotation',
    severity: 'critical',
    proposedFix: 'Implement refresh token rotation with blacklist on logout',
    appliedAt: new Date('2025-10-13'),
    success: true,
    validatedAt: new Date('2025-10-13'),
    validationResult: { testsRun: 28, testsPassed: 28, securityScore: 'A+' },
    context: {
      file: 'server/middleware/auth.ts',
      errorType: 'security-vulnerability',
      affectedUsers: 'all',
      detectedBy: 'security-audit'
    }
  },
  {
    agentId: 'agent-1-5',
    issue: 'Memory leak when streaming large responses',
    severity: 'high',
    proposedFix: 'Implement proper stream cleanup with pipeline and error handling',
    appliedAt: new Date('2025-10-10'),
    success: true,
    validatedAt: new Date('2025-10-10'),
    validationResult: { testsRun: 20, testsPassed: 20, memoryUsage: '85% reduction' },
    context: {
      file: 'server/services/export.ts',
      errorType: 'memory-leak',
      affectedUsers: 150,
      detectedBy: 'heap-snapshot'
    }
  },

  // Database Auto-Fixes
  {
    agentId: 'agent-3-2',
    issue: 'Complex aggregation query taking 8+ seconds',
    severity: 'high',
    proposedFix: 'Create materialized view with hourly refresh for pre-computed stats',
    appliedAt: new Date('2025-10-12'),
    success: true,
    validatedAt: new Date('2025-10-12'),
    validationResult: { testsRun: 16, testsPassed: 16, queryTime: '120ms' },
    context: {
      file: 'server/storage.ts',
      errorType: 'slow-query',
      affectedUsers: 890,
      detectedBy: 'pg-query-log'
    }
  },
  {
    agentId: 'agent-3-3',
    issue: 'Schema migration failure due to type mismatch',
    severity: 'critical',
    proposedFix: 'Use JSONB column for flexible metadata instead of rigid schema',
    appliedAt: new Date('2025-10-11'),
    success: false,
    validatedAt: new Date('2025-10-11'),
    validationResult: { testsRun: 12, testsPassed: 10, rollbackReason: 'data-migration-complexity' },
    context: {
      file: 'shared/schema.ts',
      errorType: 'migration-failure',
      affectedUsers: 0,
      detectedBy: 'ci-pipeline'
    }
  },
  {
    agentId: 'agent-3-4',
    issue: 'Connection pool exhaustion under high traffic',
    severity: 'critical',
    proposedFix: 'Increase pool size to (CPU cores * 2) + 1 and add connection timeout',
    appliedAt: new Date('2025-10-13'),
    success: true,
    validatedAt: new Date('2025-10-13'),
    validationResult: { testsRun: 25, testsPassed: 25, connectionErrors: '0' },
    context: {
      file: 'server/db/index.ts',
      errorType: 'connection-timeout',
      affectedUsers: 4200,
      detectedBy: 'error-tracking'
    }
  },

  // AI/ML Auto-Fixes
  {
    agentId: 'agent-5-1',
    issue: 'High API costs due to redundant embeddings generation',
    severity: 'medium',
    proposedFix: 'Implement semantic caching with 0.95 cosine similarity threshold',
    appliedAt: new Date('2025-10-10'),
    success: true,
    validatedAt: new Date('2025-10-10'),
    validationResult: { testsRun: 14, testsPassed: 14, costReduction: '48%' },
    context: {
      file: 'server/services/agent-intelligence/MLConfidenceScorer.ts',
      errorType: 'cost-optimization',
      affectedUsers: 'n/a',
      detectedBy: 'finops-dashboard'
    }
  },
  {
    agentId: 'agent-5-2',
    issue: 'Low accuracy in user intent classification (65%)',
    severity: 'medium',
    proposedFix: 'Add few-shot examples with domain-specific context to prompts',
    appliedAt: new Date('2025-10-14'),
    success: true,
    validatedAt: new Date('2025-10-14'),
    validationResult: { testsRun: 50, testsPassed: 46, accuracyGain: '22%' },
    context: {
      file: 'server/services/aiSupport.ts',
      errorType: 'low-accuracy',
      affectedUsers: 1500,
      detectedBy: 'quality-metrics'
    }
  },

  // DevOps Auto-Fixes
  {
    agentId: 'agent-6-1',
    issue: 'CI pipeline taking 25+ minutes',
    severity: 'medium',
    proposedFix: 'Enable parallel test execution with 4 workers and cache dependencies',
    appliedAt: new Date('2025-10-13'),
    success: true,
    validatedAt: new Date('2025-10-13'),
    validationResult: { testsRun: 180, testsPassed: 180, timeReduction: '58%' },
    context: {
      file: '.github/workflows/ci.yml',
      errorType: 'slow-ci',
      affectedUsers: 'dev-team',
      detectedBy: 'ci-analytics'
    }
  },
  {
    agentId: 'agent-6-2',
    issue: 'Hardcoded API keys found in codebase',
    severity: 'critical',
    proposedFix: 'Move all secrets to environment variables and add pre-commit hook for detection',
    appliedAt: new Date('2025-10-14'),
    success: true,
    validatedAt: new Date('2025-10-14'),
    validationResult: { testsRun: 8, testsPassed: 8, secretsRemoved: 12 },
    context: {
      file: 'multiple files',
      errorType: 'secret-leak',
      affectedUsers: 'all',
      detectedBy: 'secret-scanner'
    }
  },

  // Testing Auto-Fixes
  {
    agentId: 'agent-7-1',
    issue: 'Flaky E2E tests failing 30% of the time',
    severity: 'high',
    proposedFix: 'Add explicit waits, retry logic, and proper test isolation',
    appliedAt: new Date('2025-10-12'),
    success: true,
    validatedAt: new Date('2025-10-12'),
    validationResult: { testsRun: 45, testsPassed: 44, flakinessReduction: '82%' },
    context: {
      file: 'tests/e2e/auth.spec.ts',
      errorType: 'test-flakiness',
      affectedUsers: 'dev-team',
      detectedBy: 'test-analytics'
    }
  },
  {
    agentId: 'agent-7-2',
    issue: 'Unit tests taking 5+ seconds each',
    severity: 'medium',
    proposedFix: 'Mock external HTTP calls and database queries',
    appliedAt: new Date('2025-10-11'),
    success: true,
    validatedAt: new Date('2025-10-11'),
    validationResult: { testsRun: 120, testsPassed: 120, avgTestTime: '85ms' },
    context: {
      file: 'tests/unit/**/*.test.ts',
      errorType: 'slow-tests',
      affectedUsers: 'dev-team',
      detectedBy: 'jest-reporter'
    }
  },

  // Security Auto-Fixes
  {
    agentId: 'agent-8-1',
    issue: 'SQL injection vulnerability in search endpoint',
    severity: 'critical',
    proposedFix: 'Replace string concatenation with parameterized queries and Zod validation',
    appliedAt: new Date('2025-10-14'),
    success: true,
    validatedAt: new Date('2025-10-14'),
    validationResult: { testsRun: 22, testsPassed: 22, vulnerabilities: '0' },
    context: {
      file: 'server/routes/search.ts',
      errorType: 'sql-injection',
      affectedUsers: 'all',
      detectedBy: 'sast-scanner'
    }
  },
  {
    agentId: 'agent-8-2',
    issue: 'DDoS attack - 10,000 requests/second from single IP',
    severity: 'critical',
    proposedFix: 'Implement token bucket rate limiting with Redis (100 req/min per IP)',
    appliedAt: new Date('2025-10-13'),
    success: true,
    validatedAt: new Date('2025-10-13'),
    validationResult: { testsRun: 30, testsPassed: 30, blockedRequests: 9500 },
    context: {
      file: 'server/middleware/rateLimiter.ts',
      errorType: 'ddos-attack',
      affectedUsers: 'all',
      detectedBy: 'firewall-logs'
    }
  },

  // Mobile Auto-Fixes
  {
    agentId: 'agent-10-1',
    issue: 'Data loss when app goes offline mid-sync',
    severity: 'high',
    proposedFix: 'Implement IndexedDB with background sync and conflict resolution',
    appliedAt: new Date('2025-10-10'),
    success: true,
    validatedAt: new Date('2025-10-10'),
    validationResult: { testsRun: 18, testsPassed: 17, dataLoss: '0.1%' },
    context: {
      file: 'client/src/services/offlineSync.ts',
      errorType: 'data-loss',
      affectedUsers: 650,
      detectedBy: 'crash-reports'
    }
  },

  // Analytics Auto-Fixes
  {
    agentId: 'agent-11-2',
    issue: 'Dashboard loading 5+ seconds with large datasets',
    severity: 'high',
    proposedFix: 'Create hourly rollup tables for pre-aggregated metrics',
    appliedAt: new Date('2025-10-13'),
    success: true,
    validatedAt: new Date('2025-10-13'),
    validationResult: { testsRun: 12, testsPassed: 12, loadTime: '220ms' },
    context: {
      file: 'server/services/analytics.ts',
      errorType: 'slow-query',
      affectedUsers: 120,
      detectedBy: 'performance-monitoring'
    }
  }
];

export async function seedAutoFixes() {
  console.log('🛠️  Seeding auto-fix history...');
  
  try {
    const inserted = await db.insert(agentAutoFixes).values(AUTO_FIX_HISTORY).returning();
    
    const successCount = inserted.filter(f => f.success).length;
    const criticalFixes = inserted.filter(f => f.severity === 'critical').length;
    
    console.log(`✅ Seeded ${inserted.length} auto-fix records`);
    console.log(`   Success rate: ${((successCount / inserted.length) * 100).toFixed(1)}%`);
    console.log(`   Critical fixes: ${criticalFixes}`);
    console.log(`   Divisions: Frontend, Backend, Database, AI/ML, DevOps, Testing, Security, Mobile, Analytics`);
    
    return inserted;
  } catch (error) {
    console.error('❌ Failed to seed auto-fixes:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedAutoFixes()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
