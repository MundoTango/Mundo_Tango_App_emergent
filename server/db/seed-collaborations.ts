/**
 * Phase 7 Data Seeder - Track 3: Agent Collaborations
 * MB.MD V2 Methodology: Cross-division collaboration scenarios
 */

import pkg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { agentCollaborations, agentVotes } from '../../shared/schema';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

interface CollaborationWithVotes {
  collaboration: typeof agentCollaborations.$inferInsert;
  votes: Array<typeof agentVotes.$inferInsert>;
}

const COLLABORATION_SCENARIOS: CollaborationWithVotes[] = [
  // Scenario 1: API Performance Crisis
  {
    collaboration: {
      topic: 'Critical API Performance Degradation',
      description: 'Users reporting 5+ second response times on dashboard endpoint. Need immediate cross-team solution.',
      requiredAgents: 3,
      participatingAgents: ['agent-1-3', 'agent-2-1', 'agent-3-2'],
      initiatedBy: 'agent-1-3',
      status: 'completed',
      outcome: 'Implemented Redis caching + React.memo + materialized views',
      startedAt: new Date('2025-10-13T10:00:00'),
      completedAt: new Date('2025-10-13T10:45:00')
    },
    votes: [
      {
        collaborationId: 1, // Will be set after insertion
        agentId: 'agent-1-3',
        decision: 'approve',
        confidence: 0.92,
        rationale: 'Redis caching will reduce database load by 70%',
        expertise: 0.95
      },
      {
        collaborationId: 1,
        agentId: 'agent-2-1',
        decision: 'approve',
        confidence: 0.88,
        rationale: 'Frontend memoization prevents unnecessary re-renders',
        expertise: 0.90
      },
      {
        collaborationId: 1,
        agentId: 'agent-3-2',
        decision: 'approve',
        confidence: 0.95,
        rationale: 'Materialized views will optimize complex aggregations',
        expertise: 0.93
      }
    ]
  },

  // Scenario 2: Security Vulnerability
  {
    collaboration: {
      topic: 'SQL Injection Vulnerability Detection',
      description: 'Security scan found SQL injection risk in search endpoint. Need coordinated fix across layers.',
      requiredAgents: 3,
      participatingAgents: ['agent-8-1', 'agent-1-4', 'agent-7-1'],
      initiatedBy: 'agent-8-1',
      status: 'completed',
      outcome: 'Implemented parameterized queries + Zod validation + E2E security tests',
      startedAt: new Date('2025-10-14T14:30:00'),
      completedAt: new Date('2025-10-14T15:20:00')
    },
    votes: [
      {
        collaborationId: 2,
        agentId: 'agent-8-1',
        decision: 'approve',
        confidence: 0.98,
        rationale: 'Parameterized queries eliminate SQL injection risk entirely',
        expertise: 0.98
      },
      {
        collaborationId: 2,
        agentId: 'agent-1-4',
        decision: 'approve',
        confidence: 0.96,
        rationale: 'Zod validation adds defense-in-depth at API boundary',
        expertise: 0.92
      },
      {
        collaborationId: 2,
        agentId: 'agent-7-1',
        decision: 'approve',
        confidence: 0.91,
        rationale: 'E2E tests will prevent regression',
        expertise: 0.89
      }
    ]
  },

  // Scenario 3: Mobile Offline Sync
  {
    collaboration: {
      topic: 'Mobile App Data Loss During Offline Sync',
      description: 'Users losing data when app goes offline. Need robust offline-first architecture.',
      requiredAgents: 3,
      participatingAgents: ['agent-10-1', 'agent-1-5', 'agent-3-3'],
      initiatedBy: 'agent-10-1',
      status: 'completed',
      outcome: 'IndexedDB + background sync + JSONB conflict resolution',
      startedAt: new Date('2025-10-10T09:00:00'),
      completedAt: new Date('2025-10-10T10:15:00')
    },
    votes: [
      {
        collaborationId: 3,
        agentId: 'agent-10-1',
        decision: 'approve',
        confidence: 0.86,
        rationale: 'IndexedDB with service worker ensures data persistence',
        expertise: 0.87
      },
      {
        collaborationId: 3,
        agentId: 'agent-1-5',
        decision: 'approve',
        confidence: 0.89,
        rationale: 'Background sync API handles reconnection gracefully',
        expertise: 0.91
      },
      {
        collaborationId: 3,
        agentId: 'agent-3-3',
        decision: 'approve',
        confidence: 0.92,
        rationale: 'JSONB metadata enables flexible conflict resolution',
        expertise: 0.88
      }
    ]
  },

  // Scenario 4: CI/CD Pipeline Optimization
  {
    collaboration: {
      topic: 'Reduce CI Pipeline Time from 25 to <10 Minutes',
      description: 'Developers frustrated with slow CI. Need parallel testing + caching strategy.',
      requiredAgents: 3,
      participatingAgents: ['agent-6-1', 'agent-7-2', 'agent-2-3'],
      initiatedBy: 'agent-6-1',
      status: 'completed',
      outcome: 'Parallel test workers + dependency caching + code splitting',
      startedAt: new Date('2025-10-13T16:00:00'),
      completedAt: new Date('2025-10-13T16:50:00')
    },
    votes: [
      {
        collaborationId: 4,
        agentId: 'agent-6-1',
        decision: 'approve',
        confidence: 0.94,
        rationale: '4 parallel workers will cut test time by 60%',
        expertise: 0.92
      },
      {
        collaborationId: 4,
        agentId: 'agent-7-2',
        decision: 'approve',
        confidence: 0.90,
        rationale: 'Test suite optimizations enable safe parallelization',
        expertise: 0.94
      },
      {
        collaborationId: 4,
        agentId: 'agent-2-3',
        decision: 'approve',
        confidence: 0.87,
        rationale: 'Code splitting reduces build artifacts',
        expertise: 0.89
      }
    ]
  },

  // Scenario 5: AI Cost Optimization
  {
    collaboration: {
      topic: 'Reduce AI API Costs by 50% Without Quality Loss',
      description: 'Monthly AI costs exceeding budget. Need semantic caching + prompt optimization.',
      requiredAgents: 3,
      participatingAgents: ['agent-5-1', 'agent-5-2', 'agent-11-1'],
      initiatedBy: 'agent-5-1',
      status: 'completed',
      outcome: 'LanceDB semantic cache + optimized prompts + usage analytics',
      startedAt: new Date('2025-10-10T11:00:00'),
      completedAt: new Date('2025-10-10T12:30:00')
    },
    votes: [
      {
        collaborationId: 5,
        agentId: 'agent-5-1',
        decision: 'approve',
        confidence: 0.91,
        rationale: 'Semantic caching with 0.95 similarity reduces redundant calls',
        expertise: 0.88
      },
      {
        collaborationId: 5,
        agentId: 'agent-5-2',
        decision: 'approve',
        confidence: 0.89,
        rationale: 'Prompt compression maintains quality with fewer tokens',
        expertise: 0.90
      },
      {
        collaborationId: 5,
        agentId: 'agent-11-1',
        decision: 'approve',
        confidence: 0.85,
        rationale: 'Usage analytics will identify optimization opportunities',
        expertise: 0.86
      }
    ]
  },

  // Scenario 6: Database Migration Failure
  {
    collaboration: {
      topic: 'Production Database Migration Failed - Rollback Strategy',
      description: 'Migration stuck mid-way. Need safe rollback without data loss.',
      requiredAgents: 3,
      participatingAgents: ['agent-3-3', 'agent-6-2', 'agent-1-3'],
      initiatedBy: 'agent-3-3',
      status: 'completed',
      outcome: 'Blue-green deployment + JSONB migration + gradual rollout',
      startedAt: new Date('2025-10-11T20:00:00'),
      completedAt: new Date('2025-10-11T22:45:00')
    },
    votes: [
      {
        collaborationId: 6,
        agentId: 'agent-3-3',
        decision: 'reject',
        confidence: 0.93,
        rationale: 'Original migration too risky - use JSONB instead',
        expertise: 0.87
      },
      {
        collaborationId: 6,
        agentId: 'agent-6-2',
        decision: 'approve',
        confidence: 0.95,
        rationale: 'Blue-green deployment enables instant rollback',
        expertise: 0.92
      },
      {
        collaborationId: 6,
        agentId: 'agent-1-3',
        decision: 'approve',
        confidence: 0.88,
        rationale: 'Gradual rollout limits blast radius',
        expertise: 0.91
      }
    ]
  },

  // Scenario 7: React Query Cache Invalidation Bug
  {
    collaboration: {
      topic: 'Users Seeing Stale Data After Post Creation',
      description: 'Cache not invalidating properly. Need comprehensive cache strategy.',
      requiredAgents: 2,
      participatingAgents: ['agent-2-2', 'agent-1-3'],
      initiatedBy: 'agent-2-2',
      status: 'completed',
      outcome: 'Hierarchical query keys + optimistic updates + cache warming',
      startedAt: new Date('2025-10-12T13:00:00'),
      completedAt: new Date('2025-10-12T13:35:00')
    },
    votes: [
      {
        collaborationId: 7,
        agentId: 'agent-2-2',
        decision: 'approve',
        confidence: 0.97,
        rationale: 'Array-based query keys enable precise invalidation',
        expertise: 0.98
      },
      {
        collaborationId: 7,
        agentId: 'agent-1-3',
        decision: 'approve',
        confidence: 0.92,
        rationale: 'Backend cache warming prevents cold-start issues',
        expertise: 0.95
      }
    ]
  },

  // Scenario 8: E2E Test Flakiness
  {
    collaboration: {
      topic: 'E2E Tests Failing 40% of CI Runs',
      description: 'Test flakiness blocking deployments. Need robust test infrastructure.',
      requiredAgents: 3,
      participatingAgents: ['agent-7-1', 'agent-6-1', 'agent-2-1'],
      initiatedBy: 'agent-7-1',
      status: 'completed',
      outcome: 'Retry logic + explicit waits + test isolation + headless optimization',
      startedAt: new Date('2025-10-12T08:00:00'),
      completedAt: new Date('2025-10-12T09:20:00')
    },
    votes: [
      {
        collaborationId: 8,
        agentId: 'agent-7-1',
        decision: 'approve',
        confidence: 0.90,
        rationale: 'Retry + waits reduce race conditions by 85%',
        expertise: 0.89
      },
      {
        collaborationId: 8,
        agentId: 'agent-6-1',
        decision: 'approve',
        confidence: 0.88,
        rationale: 'Test isolation prevents state leakage',
        expertise: 0.92
      },
      {
        collaborationId: 8,
        agentId: 'agent-2-1',
        decision: 'approve',
        confidence: 0.85,
        rationale: 'Frontend optimizations make tests more deterministic',
        expertise: 0.90
      }
    ]
  },

  // Scenario 9: DDoS Attack Mitigation
  {
    collaboration: {
      topic: 'Active DDoS Attack - 15K Requests/Second',
      description: 'Production under attack. Need immediate rate limiting + WAF rules.',
      requiredAgents: 3,
      participatingAgents: ['agent-8-2', 'agent-6-2', 'agent-1-4'],
      initiatedBy: 'agent-8-2',
      status: 'completed',
      outcome: 'Token bucket limiter + IP blocklist + Redis distributed limiting',
      startedAt: new Date('2025-10-13T03:15:00'),
      completedAt: new Date('2025-10-13T03:50:00')
    },
    votes: [
      {
        collaborationId: 9,
        agentId: 'agent-8-2',
        decision: 'approve',
        confidence: 0.96,
        rationale: 'Token bucket handles burst traffic while blocking attacks',
        expertise: 0.91
      },
      {
        collaborationId: 9,
        agentId: 'agent-6-2',
        decision: 'approve',
        confidence: 0.94,
        rationale: 'Automated blocklist deployment via infrastructure as code',
        expertise: 0.92
      },
      {
        collaborationId: 9,
        agentId: 'agent-1-4',
        decision: 'approve',
        confidence: 0.93,
        rationale: 'Redis ensures distributed rate limiting across instances',
        expertise: 0.96
      }
    ]
  },

  // Scenario 10: Analytics Dashboard Performance
  {
    collaboration: {
      topic: 'Admin Dashboard Taking 8+ Seconds to Load',
      description: 'Complex aggregations killing performance. Need pre-computation strategy.',
      requiredAgents: 3,
      participatingAgents: ['agent-11-2', 'agent-3-2', 'agent-2-1'],
      initiatedBy: 'agent-11-2',
      status: 'completed',
      outcome: 'Hourly rollup tables + React virtualization + progressive loading',
      startedAt: new Date('2025-10-13T15:00:00'),
      completedAt: new Date('2025-10-13T16:10:00')
    },
    votes: [
      {
        collaborationId: 10,
        agentId: 'agent-11-2',
        decision: 'approve',
        confidence: 0.95,
        rationale: 'Pre-aggregated hourly rollups reduce load from 8s to 200ms',
        expertise: 0.95
      },
      {
        collaborationId: 10,
        agentId: 'agent-3-2',
        decision: 'approve',
        confidence: 0.93,
        rationale: 'Materialized views with indexes optimize complex queries',
        expertise: 0.93
      },
      {
        collaborationId: 10,
        agentId: 'agent-2-1',
        decision: 'approve',
        confidence: 0.87,
        rationale: 'Virtual scrolling prevents rendering 1000+ rows',
        expertise: 0.90
      }
    ]
  }
];

export async function seedCollaborations() {
  console.log('🤝 Seeding agent collaborations...');
  
  try {
    const insertedCollaborations = [];
    const insertedVotes = [];

    for (const scenario of COLLABORATION_SCENARIOS) {
      // Insert collaboration
      const [collab] = await db
        .insert(agentCollaborations)
        .values(scenario.collaboration)
        .returning();
      
      insertedCollaborations.push(collab);

      // Insert votes with correct collaboration ID
      const votesWithId = scenario.votes.map(vote => ({
        ...vote,
        collaborationId: collab.id
      }));

      const votes = await db
        .insert(agentVotes)
        .values(votesWithId)
        .returning();
      
      insertedVotes.push(...votes);
    }

    const completedCount = insertedCollaborations.filter(c => c.status === 'completed').length;
    const avgVotesPerCollab = insertedVotes.length / insertedCollaborations.length;
    const consensusReached = insertedCollaborations.filter(c => 
      insertedVotes
        .filter(v => v.collaborationId === c.id && v.decision === 'approve')
        .length >= 2
    ).length;

    console.log(`✅ Seeded ${insertedCollaborations.length} collaborations`);
    console.log(`   Completed: ${completedCount}`);
    console.log(`   Total votes: ${insertedVotes.length}`);
    console.log(`   Avg votes per collaboration: ${avgVotesPerCollab.toFixed(1)}`);
    console.log(`   Consensus reached: ${consensusReached}/${insertedCollaborations.length}`);
    
    return { collaborations: insertedCollaborations, votes: insertedVotes };
  } catch (error) {
    console.error('❌ Failed to seed collaborations:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedCollaborations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
