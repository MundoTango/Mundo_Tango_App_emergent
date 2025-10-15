/**
 * Phase 8 - Track D1: Materialized Views
 * Pre-compute expensive aggregations
 */

-- ============================================================================
-- Agent Auto-Fix Success Rate Statistics
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_agent_fix_stats AS
SELECT 
  agent_id,
  fix_strategy,
  COUNT(*) as total_fixes,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_fixes,
  ROUND(
    (SUM(CASE WHEN success THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100,
    2
  ) as success_rate,
  AVG(confidence) as avg_confidence,
  AVG(CASE WHEN success THEN confidence ELSE NULL END) as avg_success_confidence,
  AVG(execution_time) as avg_execution_time,
  MIN(applied_at) as first_fix_date,
  MAX(applied_at) as last_fix_date
FROM agent_auto_fixes
GROUP BY agent_id, fix_strategy;

-- Unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS mv_agent_fix_stats_idx 
ON mv_agent_fix_stats (agent_id, fix_strategy);

-- ============================================================================
-- Collaboration Success Metrics
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_collaboration_metrics AS
SELECT 
  collaboration_type,
  leader_agent,
  COUNT(*) as total_collaborations,
  SUM(CASE WHEN outcome = 'success' THEN 1 ELSE 0 END) as successful_count,
  ROUND(
    (SUM(CASE WHEN outcome = 'success' THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100,
    2
  ) as success_rate,
  AVG(progress) as avg_progress,
  AVG(
    EXTRACT(EPOCH FROM (completed_at - started_at))
  ) as avg_duration_seconds,
  COUNT(DISTINCT leader_agent) as unique_leaders
FROM agent_collaborations
WHERE completed_at IS NOT NULL
GROUP BY collaboration_type, leader_agent;

-- Unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS mv_collaboration_metrics_idx 
ON mv_collaboration_metrics (collaboration_type, leader_agent);

-- ============================================================================
-- Learning Pattern Domain Distribution
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_learning_domain_stats AS
SELECT 
  unnest(agent_domains) as domain,
  COUNT(*) as pattern_count,
  AVG(confidence) as avg_confidence,
  COUNT(DISTINCT discovered_by) as unique_discoverers,
  MIN(documented_at) as first_documented,
  MAX(documented_at) as last_documented
FROM agent_learnings
WHERE agent_domains IS NOT NULL
GROUP BY domain;

-- Unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS mv_learning_domain_stats_idx 
ON mv_learning_domain_stats (domain);

-- ============================================================================
-- Vote Consensus Analysis
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_vote_consensus AS
SELECT 
  collaboration_id,
  COUNT(*) as total_votes,
  SUM(CASE WHEN vote = 'approve' THEN 1 ELSE 0 END) as approve_count,
  SUM(CASE WHEN vote = 'reject' THEN 1 ELSE 0 END) as reject_count,
  AVG(expertise) as avg_expertise,
  SUM(CASE WHEN vote = 'approve' THEN expertise ELSE 0 END) / SUM(expertise) as weighted_consensus,
  ROUND(
    (SUM(CASE WHEN vote = 'approve' THEN 1 ELSE 0 END)::numeric / COUNT(*)) * 100,
    2
  ) as approval_rate
FROM agent_votes
GROUP BY collaboration_id;

-- Unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS mv_vote_consensus_idx 
ON mv_vote_consensus (collaboration_id);

-- ============================================================================
-- Overall Intelligence Network Stats
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_intelligence_summary AS
SELECT 
  'learnings' as metric_type,
  COUNT(*)::bigint as total_count,
  AVG(confidence)::numeric as avg_confidence
FROM agent_learnings

UNION ALL

SELECT 
  'auto_fixes' as metric_type,
  COUNT(*)::bigint as total_count,
  AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END)::numeric as avg_confidence
FROM agent_auto_fixes

UNION ALL

SELECT 
  'collaborations' as metric_type,
  COUNT(*)::bigint as total_count,
  AVG(CASE WHEN outcome = 'success' THEN 1.0 ELSE 0.0 END)::numeric as avg_confidence
FROM agent_collaborations;

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS mv_intelligence_summary_type_idx 
ON mv_intelligence_summary (metric_type);

-- ============================================================================
-- Refresh all views
-- ============================================================================

REFRESH MATERIALIZED VIEW CONCURRENTLY mv_agent_fix_stats;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_collaboration_metrics;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_learning_domain_stats;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_vote_consensus;
REFRESH MATERIALIZED VIEW mv_intelligence_summary;
