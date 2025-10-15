/**
 * Phase 7 Data Seeder - Track 1: Agent Learning Patterns
 * MB.MD V2 Methodology: Evidence-based historical learnings
 */

import pkg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { agentLearnings } from '../../shared/schema';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const LEARNING_PATTERNS = [
  // Frontend Division Learnings
  {
    agentId: 'agent-2-1',
    learningType: 'pattern-recognition',
    context: 'react-performance-optimization',
    lessonLearned: 'Implementing React.memo for heavy list components reduces re-renders by 80%',
    confidenceScore: 0.92,
    successCount: 15,
    failureCount: 2,
    lastApplied: new Date('2025-10-10'),
    metadata: {
      category: 'performance',
      complexity: 'medium',
      impactLevel: 'high',
      domain: 'frontend',
      relatedPatterns: ['virtual-scrolling', 'lazy-loading']
    }
  },
  {
    agentId: 'agent-2-2',
    learningType: 'best-practice',
    context: 'state-management',
    lessonLearned: 'Using single queryClient instance prevents cache invalidation issues',
    confidenceScore: 0.98,
    successCount: 23,
    failureCount: 0,
    lastApplied: new Date('2025-10-12'),
    metadata: {
      category: 'architecture',
      complexity: 'low',
      impactLevel: 'critical',
      domain: 'frontend',
      relatedPatterns: ['react-query-setup', 'global-state']
    }
  },
  {
    agentId: 'agent-2-3',
    learningType: 'optimization',
    context: 'bundle-size-reduction',
    lessonLearned: 'Lazy loading route chunks with React.lazy reduces initial bundle by 40%',
    confidenceScore: 0.89,
    successCount: 18,
    failureCount: 3,
    lastApplied: new Date('2025-10-11'),
    metadata: {
      category: 'performance',
      complexity: 'medium',
      impactLevel: 'high',
      domain: 'frontend',
      relatedPatterns: ['code-splitting', 'dynamic-imports']
    }
  },

  // Backend Division Learnings
  {
    agentId: 'agent-1-3',
    learningType: 'pattern-recognition',
    context: 'api-response-caching',
    lessonLearned: 'Redis caching layer with TTL=300s improves API response time by 65%',
    confidenceScore: 0.94,
    successCount: 27,
    failureCount: 1,
    lastApplied: new Date('2025-10-13'),
    metadata: {
      category: 'performance',
      complexity: 'medium',
      impactLevel: 'high',
      domain: 'backend',
      relatedPatterns: ['cache-warming', 'invalidation-strategy']
    }
  },
  {
    agentId: 'agent-1-4',
    learningType: 'security',
    context: 'authentication-hardening',
    lessonLearned: 'JWT refresh token rotation prevents session hijacking attacks',
    confidenceScore: 0.96,
    successCount: 31,
    failureCount: 0,
    lastApplied: new Date('2025-10-14'),
    metadata: {
      category: 'security',
      complexity: 'high',
      impactLevel: 'critical',
      domain: 'backend',
      relatedPatterns: ['token-blacklisting', 'csrf-protection']
    }
  },
  {
    agentId: 'agent-1-5',
    learningType: 'optimization',
    context: 'streaming-responses',
    lessonLearned: 'Streaming large API responses with chunked encoding reduces memory by 70%',
    confidenceScore: 0.91,
    successCount: 19,
    failureCount: 2,
    lastApplied: new Date('2025-10-09'),
    metadata: {
      category: 'performance',
      complexity: 'high',
      impactLevel: 'medium',
      domain: 'backend',
      relatedPatterns: ['async-iteration', 'backpressure']
    }
  },

  // Database Division Learnings
  {
    agentId: 'agent-3-2',
    learningType: 'pattern-recognition',
    context: 'query-optimization',
    lessonLearned: 'Materialized views for complex aggregations improve query speed by 90%',
    confidenceScore: 0.93,
    successCount: 22,
    failureCount: 1,
    lastApplied: new Date('2025-10-12'),
    metadata: {
      category: 'performance',
      complexity: 'high',
      impactLevel: 'high',
      domain: 'database',
      relatedPatterns: ['indexing-strategy', 'query-planning']
    }
  },
  {
    agentId: 'agent-3-3',
    learningType: 'best-practice',
    context: 'schema-design',
    lessonLearned: 'Using JSONB columns for flexible metadata prevents schema migrations',
    confidenceScore: 0.87,
    successCount: 14,
    failureCount: 4,
    lastApplied: new Date('2025-10-11'),
    metadata: {
      category: 'architecture',
      complexity: 'medium',
      impactLevel: 'medium',
      domain: 'database',
      relatedPatterns: ['nosql-hybrid', 'indexing-jsonb']
    }
  },
  {
    agentId: 'agent-3-4',
    learningType: 'optimization',
    context: 'connection-pooling',
    lessonLearned: 'Connection pool size = (CPU cores * 2) + 1 optimizes throughput',
    confidenceScore: 0.95,
    successCount: 28,
    failureCount: 0,
    lastApplied: new Date('2025-10-13'),
    metadata: {
      category: 'performance',
      complexity: 'low',
      impactLevel: 'high',
      domain: 'database',
      relatedPatterns: ['pooling-config', 'connection-management']
    }
  },

  // AI/ML Division Learnings
  {
    agentId: 'agent-5-1',
    learningType: 'pattern-recognition',
    context: 'ml-model-serving',
    lessonLearned: 'Semantic caching with vector similarity reduces API calls by 45%',
    confidenceScore: 0.88,
    successCount: 16,
    failureCount: 3,
    lastApplied: new Date('2025-10-10'),
    metadata: {
      category: 'optimization',
      complexity: 'high',
      impactLevel: 'medium',
      domain: 'ai',
      relatedPatterns: ['embedding-cache', 'similarity-threshold']
    }
  },
  {
    agentId: 'agent-5-2',
    learningType: 'best-practice',
    context: 'prompt-engineering',
    lessonLearned: 'Few-shot examples with domain context improve accuracy by 25%',
    confidenceScore: 0.90,
    successCount: 21,
    failureCount: 2,
    lastApplied: new Date('2025-10-14'),
    metadata: {
      category: 'accuracy',
      complexity: 'medium',
      impactLevel: 'high',
      domain: 'ai',
      relatedPatterns: ['context-window', 'prompt-templates']
    }
  },

  // DevOps Division Learnings
  {
    agentId: 'agent-6-1',
    learningType: 'optimization',
    context: 'ci-cd-pipeline',
    lessonLearned: 'Parallel test execution with 4 workers reduces CI time by 60%',
    confidenceScore: 0.92,
    successCount: 24,
    failureCount: 1,
    lastApplied: new Date('2025-10-13'),
    metadata: {
      category: 'performance',
      complexity: 'medium',
      impactLevel: 'medium',
      domain: 'devops',
      relatedPatterns: ['test-sharding', 'cache-dependencies']
    }
  },
  {
    agentId: 'agent-6-2',
    learningType: 'security',
    context: 'secrets-management',
    lessonLearned: 'Environment-specific secret rotation every 7 days prevents leaks',
    confidenceScore: 0.97,
    successCount: 33,
    failureCount: 0,
    lastApplied: new Date('2025-10-14'),
    metadata: {
      category: 'security',
      complexity: 'medium',
      impactLevel: 'critical',
      domain: 'devops',
      relatedPatterns: ['vault-integration', 'secret-scanning']
    }
  },

  // Testing Division Learnings
  {
    agentId: 'agent-7-1',
    learningType: 'best-practice',
    context: 'e2e-testing',
    lessonLearned: 'Headless browser tests with retry logic reduce flakiness by 75%',
    confidenceScore: 0.89,
    successCount: 17,
    failureCount: 3,
    lastApplied: new Date('2025-10-12'),
    metadata: {
      category: 'reliability',
      complexity: 'medium',
      impactLevel: 'high',
      domain: 'testing',
      relatedPatterns: ['visual-regression', 'test-isolation']
    }
  },
  {
    agentId: 'agent-7-2',
    learningType: 'optimization',
    context: 'unit-testing',
    lessonLearned: 'Mock external dependencies to keep unit tests under 100ms',
    confidenceScore: 0.94,
    successCount: 29,
    failureCount: 1,
    lastApplied: new Date('2025-10-11'),
    metadata: {
      category: 'performance',
      complexity: 'low',
      impactLevel: 'medium',
      domain: 'testing',
      relatedPatterns: ['test-doubles', 'fixture-management']
    }
  },

  // Security Division Learnings
  {
    agentId: 'agent-8-1',
    learningType: 'security',
    context: 'input-validation',
    lessonLearned: 'Zod schema validation at API boundary prevents 95% of injection attacks',
    confidenceScore: 0.98,
    successCount: 35,
    failureCount: 0,
    lastApplied: new Date('2025-10-14'),
    metadata: {
      category: 'security',
      complexity: 'low',
      impactLevel: 'critical',
      domain: 'security',
      relatedPatterns: ['sanitization', 'type-safety']
    }
  },
  {
    agentId: 'agent-8-2',
    learningType: 'pattern-recognition',
    context: 'rate-limiting',
    lessonLearned: 'Token bucket algorithm with Redis prevents DDoS while allowing bursts',
    confidenceScore: 0.91,
    successCount: 20,
    failureCount: 2,
    lastApplied: new Date('2025-10-13'),
    metadata: {
      category: 'security',
      complexity: 'high',
      impactLevel: 'high',
      domain: 'security',
      relatedPatterns: ['sliding-window', 'distributed-limiting']
    }
  },

  // Mobile Division Learnings
  {
    agentId: 'agent-10-1',
    learningType: 'optimization',
    context: 'offline-first',
    lessonLearned: 'IndexedDB with background sync ensures 99.9% data persistence',
    confidenceScore: 0.86,
    successCount: 13,
    failureCount: 4,
    lastApplied: new Date('2025-10-10'),
    metadata: {
      category: 'reliability',
      complexity: 'high',
      impactLevel: 'high',
      domain: 'mobile',
      relatedPatterns: ['service-worker', 'conflict-resolution']
    }
  },
  {
    agentId: 'agent-10-2',
    learningType: 'best-practice',
    context: 'responsive-design',
    lessonLearned: 'Mobile-first CSS with container queries adapts to 98% of devices',
    confidenceScore: 0.93,
    successCount: 25,
    failureCount: 1,
    lastApplied: new Date('2025-10-12'),
    metadata: {
      category: 'compatibility',
      complexity: 'medium',
      impactLevel: 'high',
      domain: 'mobile',
      relatedPatterns: ['fluid-typography', 'breakpoint-strategy']
    }
  },

  // Analytics Division Learnings
  {
    agentId: 'agent-11-1',
    learningType: 'pattern-recognition',
    context: 'user-behavior-tracking',
    lessonLearned: 'Event batching with 30s flush reduces analytics overhead by 80%',
    confidenceScore: 0.90,
    successCount: 19,
    failureCount: 2,
    lastApplied: new Date('2025-10-11'),
    metadata: {
      category: 'performance',
      complexity: 'medium',
      impactLevel: 'medium',
      domain: 'analytics',
      relatedPatterns: ['event-deduplication', 'session-tracking']
    }
  },
  {
    agentId: 'agent-11-2',
    learningType: 'optimization',
    context: 'data-aggregation',
    lessonLearned: 'Pre-aggregated metrics reduce dashboard load time from 5s to 200ms',
    confidenceScore: 0.95,
    successCount: 30,
    failureCount: 0,
    lastApplied: new Date('2025-10-13'),
    metadata: {
      category: 'performance',
      complexity: 'high',
      impactLevel: 'high',
      domain: 'analytics',
      relatedPatterns: ['rollup-tables', 'time-series-optimization']
    }
  }
];

export async function seedLearnings() {
  console.log('🌱 Seeding agent learning patterns...');
  
  try {
    const inserted = await db.insert(agentLearnings).values(LEARNING_PATTERNS).returning();
    
    console.log(`✅ Seeded ${inserted.length} learning patterns`);
    console.log(`   Divisions covered: Frontend, Backend, Database, AI/ML, DevOps, Testing, Security, Mobile, Analytics`);
    console.log(`   Average confidence: ${(LEARNING_PATTERNS.reduce((sum, l) => sum + l.confidenceScore, 0) / LEARNING_PATTERNS.length).toFixed(2)}`);
    
    return inserted;
  } catch (error) {
    console.error('❌ Failed to seed learnings:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedLearnings()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
