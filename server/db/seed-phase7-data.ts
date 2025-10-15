/**
 * Phase 7 Master Data Seeder - MB.MD V2 Methodology
 * Seeds all Phase 7 tables matching exact schema structure
 */

import pkg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { agentLearnings, agentAutoFixes, agentCollaborations, agentVotes } from '../../shared/schema';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function seedPhase7Data() {
  console.log('\n🚀 Phase 7 Data Seeding - MB.MD V2 Parallel Methodology\n');
  
  const results = {
    learnings: 0,
    autoFixes: 0,
    collaborations: 0,
    votes: 0
  };

  try {
    // ========================================================================
    // TRACK 1: Agent Learnings (agentLearnings schema)
    // ========================================================================
    console.log('📚 Track 1: Seeding agent learning patterns...');
    
    const learningData = [
      {
        pattern: 'react-memo-optimization',
        problem: 'Component re-rendering on every state update causing performance degradation',
        solution: 'Wrap expensive child components with React.memo and use useCallback for event handlers',
        esaLayers: ['21', '48'],
        agentDomains: ['frontend', 'performance'],
        codeExample: 'const MemoizedComponent = React.memo(ExpensiveComponent);',
        confidence: '0.92',
        successMetrics: { performanceGain: '78%', renderReduction: '85%' },
        discoveredBy: 'agent-2-1',
        relatedPatterns: ['useMemo-hook', 'useCallback-optimization'],
        appliedTo: { files: ['client/src/components/PostFeed.tsx'] },
        validatedAt: new Date('2025-10-13'),
        documentedAt: new Date('2025-10-14')
      },
      {
        pattern: 'redis-caching-layer',
        problem: 'API endpoints responding slowly under load (2+ seconds)',
        solution: 'Implement Redis caching layer with 5-minute TTL for frequently accessed data',
        esaLayers: ['14', '48'],
        agentDomains: ['backend', 'performance'],
        codeExample: 'await redis.set(cacheKey, JSON.stringify(data), "EX", 300);',
        confidence: '0.94',
        successMetrics: { latencyReduction: '67%', cacheHitRate: '85%' },
        discoveredBy: 'agent-1-3',
        relatedPatterns: ['cache-invalidation', 'ttl-strategy'],
        appliedTo: { files: ['server/routes/posts.ts'] },
        validatedAt: new Date('2025-10-14'),
        documentedAt: new Date('2025-10-14')
      },
      {
        pattern: 'materialized-view-aggregation',
        problem: 'Complex aggregation queries taking 8+ seconds to execute',
        solution: 'Create materialized views with hourly refresh for pre-computed statistics',
        esaLayers: ['8', '48'],
        agentDomains: ['database', 'performance'],
        codeExample: 'CREATE MATERIALIZED VIEW stats_hourly AS SELECT ...',
        confidence: '0.93',
        successMetrics: { querySpeedUp: '94%', cpuReduction: '70%' },
        discoveredBy: 'agent-3-2',
        relatedPatterns: ['view-refresh-strategy', 'index-optimization'],
        appliedTo: { files: ['server/storage.ts'] },
        validatedAt: new Date('2025-10-12'),
        documentedAt: new Date('2025-10-13')
      },
      {
        pattern: 'semantic-caching-embeddings',
        problem: 'High AI API costs due to redundant embedding generations',
        solution: 'Implement LanceDB semantic caching with 0.95 cosine similarity threshold',
        esaLayers: ['48', '55'],
        agentDomains: ['ai', 'cost-optimization'],
        codeExample: 'const similarity = await lancedb.search(embedding, { limit: 1 });',
        confidence: '0.88',
        successMetrics: { costReduction: '48%', cacheHitRate: '62%' },
        discoveredBy: 'agent-5-1',
        relatedPatterns: ['vector-search', 'embedding-cache'],
        appliedTo: { files: ['server/services/agent-intelligence/MLConfidenceScorer.ts'] },
        validatedAt: new Date('2025-10-10'),
        documentedAt: new Date('2025-10-11')
      },
      {
        pattern: 'zod-validation-security',
        problem: 'SQL injection vulnerability in search endpoint',
        solution: 'Replace string concatenation with Zod schema validation at API boundary',
        esaLayers: ['13', '50'],
        agentDomains: ['security', 'backend'],
        codeExample: 'const validated = searchSchema.parse(req.body);',
        confidence: '0.98',
        successMetrics: { vulnerabilities: '0', testCoverage: '100%' },
        discoveredBy: 'agent-8-1',
        relatedPatterns: ['parameterized-queries', 'input-sanitization'],
        appliedTo: { files: ['server/routes/search.ts'] },
        validatedAt: new Date('2025-10-14'),
        documentedAt: new Date('2025-10-14')
      }
    ];

    const learnings = await db.insert(agentLearnings).values(learningData).returning();
    results.learnings = learnings.length;
    console.log(`   ✅ Seeded ${results.learnings} learning patterns\n`);

    // ========================================================================
    // TRACK 2: Auto-Fix History (agentAutoFixes schema)
    // ========================================================================
    console.log('🛠️  Track 2: Seeding auto-fix history...');
    
    const autoFixData = [
      {
        agentId: 'agent-2-1',
        fixStrategy: 'performance',
        appliedAt: new Date('2025-10-13'),
        success: true,
        changes: {
          files: ['client/src/components/PostFeed.tsx'],
          lines: 45,
          diff: '+const MemoizedPost = React.memo(PostCard);'
        },
        rollbackPlan: { backup: 'git-sha-abc123' },
        validated: true,
        executionTime: 1200,
        confidence: 0.92
      },
      {
        agentId: 'agent-1-3',
        fixStrategy: 'code_patch',
        appliedAt: new Date('2025-10-14'),
        success: true,
        changes: {
          files: ['server/routes/posts.ts'],
          lines: 28,
          diff: '+const cached = await redis.get(key);'
        },
        rollbackPlan: { backup: 'git-sha-def456' },
        validated: true,
        executionTime: 850,
        confidence: 0.94
      },
      {
        agentId: 'agent-3-2',
        fixStrategy: 'config_update',
        appliedAt: new Date('2025-10-12'),
        success: true,
        changes: {
          files: ['server/db/migrations/create_materialized_views.sql'],
          lines: 67,
          diff: 'CREATE MATERIALIZED VIEW ...'
        },
        rollbackPlan: { backup: 'DROP MATERIALIZED VIEW' },
        validated: true,
        executionTime: 2100,
        confidence: 0.93
      },
      {
        agentId: 'agent-8-1',
        fixStrategy: 'code_patch',
        appliedAt: new Date('2025-10-14'),
        success: true,
        changes: {
          files: ['server/routes/search.ts'],
          lines: 15,
          diff: '-const query = `SELECT * FROM posts WHERE ${userInput}`;\n+const query = db.select().from(posts).where(eq(posts.content, validated.search));'
        },
        rollbackPlan: { backup: 'git-sha-ghi789' },
        validated: true,
        executionTime: 450,
        confidence: 0.98
      },
      {
        agentId: 'agent-7-1',
        fixStrategy: 'code_patch',
        appliedAt: new Date('2025-10-12'),
        success: true,
        changes: {
          files: ['tests/e2e/auth.spec.ts'],
          lines: 22,
          diff: '+await page.waitForSelector("#login-button");'
        },
        rollbackPlan: { backup: 'git-sha-jkl012' },
        validated: true,
        executionTime: 320,
        confidence: 0.89
      },
      {
        agentId: 'agent-3-3',
        fixStrategy: 'type_annotation',
        appliedAt: new Date('2025-10-11'),
        success: false,
        changes: null,
        rollbackPlan: { backup: 'git-sha-mno345' },
        validated: false,
        executionTime: 180,
        confidence: 0.72,
        errorMessage: 'Migration complexity too high - manual review required'
      }
    ];

    const autoFixes = await db.insert(agentAutoFixes).values(autoFixData).returning();
    results.autoFixes = autoFixes.length;
    console.log(`   ✅ Seeded ${results.autoFixes} auto-fix records\n`);

    // ========================================================================
    // TRACK 3: Collaborations & Voting (agentCollaborations + agentVotes schema)
    // ========================================================================
    console.log('🤝 Track 3: Seeding collaborations and voting...');
    
    const collaborationData = [
      {
        collaborationType: 'fixing',
        leaderAgent: 'agent-1-3',
        participantAgents: ['agent-1-3', 'agent-2-1', 'agent-3-2'],
        goal: 'Resolve critical API performance degradation (5+ second response times)',
        currentStatus: 'complete',
        plan: {
          steps: [
            'Add Redis caching layer',
            'Optimize frontend rendering',
            'Create materialized views'
          ]
        },
        progress: 100,
        startedAt: new Date('2025-10-13T10:00:00'),
        completedAt: new Date('2025-10-13T10:45:00'),
        outcome: 'success'
      },
      {
        collaborationType: 'fixing',
        leaderAgent: 'agent-8-1',
        participantAgents: ['agent-8-1', 'agent-1-4', 'agent-7-1'],
        goal: 'Fix SQL injection vulnerability detected in search endpoint',
        currentStatus: 'complete',
        plan: {
          steps: [
            'Implement Zod validation',
            'Use parameterized queries',
            'Add E2E security tests'
          ]
        },
        progress: 100,
        startedAt: new Date('2025-10-14T14:30:00'),
        completedAt: new Date('2025-10-14T15:20:00'),
        outcome: 'success'
      },
      {
        collaborationType: 'planning',
        leaderAgent: 'agent-5-1',
        participantAgents: ['agent-5-1', 'agent-5-2', 'agent-11-1'],
        goal: 'Reduce AI API costs by 50% without quality degradation',
        currentStatus: 'complete',
        plan: {
          steps: [
            'Implement semantic caching',
            'Optimize prompts',
            'Add usage analytics'
          ]
        },
        progress: 100,
        startedAt: new Date('2025-10-10T11:00:00'),
        completedAt: new Date('2025-10-10T12:30:00'),
        outcome: 'success'
      }
    ];

    const collaborations = await db.insert(agentCollaborations).values(collaborationData).returning();
    results.collaborations = collaborations.length;

    // Insert votes for each collaboration
    const voteData = [
      // Collaboration 1: API Performance
      {
        collaborationId: collaborations[0].id,
        voterId: 'agent-1-3',
        solution: 'Redis caching layer',
        vote: 'approve',
        expertise: 0.95,
        reasoning: 'Will reduce database load by 70%'
      },
      {
        collaborationId: collaborations[0].id,
        voterId: 'agent-2-1',
        solution: 'React.memo optimization',
        vote: 'approve',
        expertise: 0.90,
        reasoning: 'Prevents unnecessary re-renders'
      },
      {
        collaborationId: collaborations[0].id,
        voterId: 'agent-3-2',
        solution: 'Materialized views',
        vote: 'approve',
        expertise: 0.93,
        reasoning: 'Optimizes complex aggregations'
      },
      // Collaboration 2: Security Fix
      {
        collaborationId: collaborations[1].id,
        voterId: 'agent-8-1',
        solution: 'Zod validation + parameterized queries',
        vote: 'approve',
        expertise: 0.98,
        reasoning: 'Eliminates SQL injection risk entirely'
      },
      {
        collaborationId: collaborations[1].id,
        voterId: 'agent-1-4',
        solution: 'Defense-in-depth approach',
        vote: 'approve',
        expertise: 0.92,
        reasoning: 'Multiple layers of validation'
      },
      {
        collaborationId: collaborations[1].id,
        voterId: 'agent-7-1',
        solution: 'E2E security tests',
        vote: 'approve',
        expertise: 0.89,
        reasoning: 'Prevents regression'
      },
      // Collaboration 3: Cost Optimization
      {
        collaborationId: collaborations[2].id,
        voterId: 'agent-5-1',
        solution: 'Semantic caching',
        vote: 'approve',
        expertise: 0.88,
        reasoning: 'Reduces redundant API calls'
      },
      {
        collaborationId: collaborations[2].id,
        voterId: 'agent-5-2',
        solution: 'Prompt optimization',
        vote: 'approve',
        expertise: 0.90,
        reasoning: 'Maintains quality with fewer tokens'
      },
      {
        collaborationId: collaborations[2].id,
        voterId: 'agent-11-1',
        solution: 'Usage analytics',
        vote: 'approve',
        expertise: 0.86,
        reasoning: 'Identifies optimization opportunities'
      }
    ];

    const votes = await db.insert(agentVotes).values(voteData).returning();
    results.votes = votes.length;
    
    console.log(`   ✅ Seeded ${results.collaborations} collaborations`);
    console.log(`   ✅ Seeded ${results.votes} votes\n`);

    // ========================================================================
    // Summary
    // ========================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Phase 7 Data Seeding Complete!\n');
    console.log(`📚 Learning Patterns: ${results.learnings}`);
    console.log(`🛠️  Auto-Fixes: ${results.autoFixes} (${autoFixData.filter(f => f.success).length} successful)`);
    console.log(`🤝 Collaborations: ${results.collaborations}`);
    console.log(`🗳️  Votes: ${results.votes}\n`);
    console.log(`🎯 Success Rate: ${((autoFixData.filter(f => f.success).length / results.autoFixes) * 100).toFixed(1)}%`);
    console.log(`📊 Consensus: ${results.votes / results.collaborations} votes/collaboration`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await pool.end();
    return results;
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await pool.end();
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedPhase7Data()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedPhase7Data };
