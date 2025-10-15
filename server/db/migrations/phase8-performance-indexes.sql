/**
 * Phase 8 - Track D1: Performance Indexes
 * Optimize frequently queried columns
 */

-- ============================================================================
-- Agent Learning Patterns Indexes
-- ============================================================================

-- Index for domain filtering (array contains query)
CREATE INDEX IF NOT EXISTS idx_learnings_domain_gin 
ON agent_learnings USING gin (agent_domains);

-- Index for ESA layer filtering
CREATE INDEX IF NOT EXISTS idx_learnings_layers_gin 
ON agent_learnings USING gin (esa_layers);

-- Index for pattern search
CREATE INDEX IF NOT EXISTS idx_learnings_pattern 
ON agent_learnings (pattern);

-- Index for confidence sorting
CREATE INDEX IF NOT EXISTS idx_learnings_confidence 
ON agent_learnings (confidence DESC);

-- Index for discovery source
CREATE INDEX IF NOT EXISTS idx_learnings_discovered_by 
ON agent_learnings (discovered_by);

-- ============================================================================
-- Agent Auto-Fixes Indexes
-- ============================================================================

-- Index for agent filtering
CREATE INDEX IF NOT EXISTS idx_autofixes_agent 
ON agent_auto_fixes (agent_id);

-- Index for fix strategy filtering
CREATE INDEX IF NOT EXISTS idx_autofixes_strategy 
ON agent_auto_fixes (fix_strategy);

-- Index for success filtering + sorting by confidence
CREATE INDEX IF NOT EXISTS idx_autofixes_success_confidence 
ON agent_auto_fixes (success, confidence DESC);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_autofixes_applied_at 
ON agent_auto_fixes (applied_at DESC);

-- Composite index for common query pattern (agent + success)
CREATE INDEX IF NOT EXISTS idx_autofixes_agent_success 
ON agent_auto_fixes (agent_id, success);

-- ============================================================================
-- Agent Collaborations Indexes
-- ============================================================================

-- Index for collaboration type filtering
CREATE INDEX IF NOT EXISTS idx_collaborations_type 
ON agent_collaborations (collaboration_type);

-- Index for leader agent
CREATE INDEX IF NOT EXISTS idx_collaborations_leader 
ON agent_collaborations (leader_agent);

-- Index for status + sorting by start time
CREATE INDEX IF NOT EXISTS idx_collaborations_status_time 
ON agent_collaborations (current_status, started_at DESC);

-- Index for outcome analysis
CREATE INDEX IF NOT EXISTS idx_collaborations_outcome 
ON agent_collaborations (outcome);

-- Index for participant searches (array contains)
CREATE INDEX IF NOT EXISTS idx_collaborations_participants_gin 
ON agent_collaborations USING gin (participant_agents);

-- ============================================================================
-- Agent Votes Indexes
-- ============================================================================

-- Index for collaboration lookup
CREATE INDEX IF NOT EXISTS idx_votes_collaboration 
ON agent_votes (collaboration_id);

-- Index for voter lookup
CREATE INDEX IF NOT EXISTS idx_votes_voter 
ON agent_votes (voter_id);

-- Index for vote analysis
CREATE INDEX IF NOT EXISTS idx_votes_vote 
ON agent_votes (vote);

-- Composite index for collaboration votes with expertise
CREATE INDEX IF NOT EXISTS idx_votes_collab_vote_expertise 
ON agent_votes (collaboration_id, vote, expertise DESC);

-- ============================================================================
-- Analyze tables to update statistics
-- ============================================================================

ANALYZE agent_learnings;
ANALYZE agent_auto_fixes;
ANALYZE agent_collaborations;
ANALYZE agent_votes;
