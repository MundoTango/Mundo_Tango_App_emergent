/**
 * Phase 8 - Track A2: Cache Key Generation
 * Standardized cache key patterns
 */

export const CacheKeys = {
  // Agent Intelligence - Learning Patterns
  learnings: {
    all: () => 'intelligence:learnings:all',
    byDomain: (domain: string) => `intelligence:learnings:domain:${domain}`,
    byAgent: (agentId: string) => `intelligence:learnings:agent:${agentId}`,
    byPattern: (pattern: string) => `intelligence:learnings:pattern:${pattern}`
  },

  // Agent Intelligence - Auto-Fixes
  autoFixes: {
    all: () => 'intelligence:autofixes:all',
    byAgent: (agentId: string) => `intelligence:autofixes:agent:${agentId}`,
    byStrategy: (strategy: string) => `intelligence:autofixes:strategy:${strategy}`,
    stats: () => 'intelligence:autofixes:stats'
  },

  // Agent Intelligence - Collaborations
  collaborations: {
    all: () => 'intelligence:collaborations:all',
    byId: (id: number) => `intelligence:collaborations:${id}`,
    byType: (type: string) => `intelligence:collaborations:type:${type}`,
    byLeader: (leaderId: string) => `intelligence:collaborations:leader:${leaderId}`
  },

  // Agent Intelligence - Votes
  votes: {
    byCollaboration: (collabId: number) => `intelligence:votes:collab:${collabId}`,
    byVoter: (voterId: string) => `intelligence:votes:voter:${voterId}`
  },

  // ML Predictions
  ml: {
    confidence: (fixHash: string) => `ml:confidence:${fixHash}`,
    pattern: (code: string) => `ml:pattern:${code}`,
    model: (version: string) => `ml:model:${version}`
  },

  // ESA Agent Registry
  agents: {
    all: () => 'esa:agents:all',
    byId: (id: string) => `esa:agents:${id}`,
    byType: (type: string) => `esa:agents:type:${type}`,
    byLayer: (layer: number) => `esa:agents:layer:${layer}`
  },

  // Invalidation patterns
  invalidate: {
    allLearnings: () => 'intelligence:learnings:*',
    allAutoFixes: () => 'intelligence:autofixes:*',
    allCollaborations: () => 'intelligence:collaborations:*',
    allVotes: () => 'intelligence:votes:*',
    allIntelligence: () => 'intelligence:*',
    allAgents: () => 'esa:agents:*',
    allML: () => 'ml:*'
  }
};

// TTL configurations (in seconds)
export const CacheTTL = {
  learnings: 60 * 60,        // 1 hour
  autoFixes: 30 * 60,        // 30 minutes
  collaborations: 15 * 60,   // 15 minutes
  votes: 15 * 60,            // 15 minutes
  mlConfidence: 60 * 60,     // 1 hour
  mlPattern: 60 * 60,        // 1 hour
  agents: 60 * 60 * 24,      // 24 hours
  stats: 5 * 60              // 5 minutes
};

export default CacheKeys;
