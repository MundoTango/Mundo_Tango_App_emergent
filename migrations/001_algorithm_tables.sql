-- Algorithm Agents System Tables
-- Created: October 14, 2025
-- Purpose: Support conversational algorithm interface (A1-A30)

-- Table 1: algorithm_agents
-- Stores algorithm agent metadata
CREATE TABLE IF NOT EXISTS algorithm_agents (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  algorithm_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  file_path VARCHAR(500),
  algorithm_type VARCHAR(50),
  esa_layers INTEGER[],
  impact_score INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table 2: algorithm_parameters  
-- Stores adjustable parameters for each algorithm
CREATE TABLE IF NOT EXISTS algorithm_parameters (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  algorithm_id VARCHAR(50) NOT NULL,
  parameter_name VARCHAR(100) NOT NULL,
  parameter_type VARCHAR(50) NOT NULL,
  current_value TEXT,
  default_value TEXT,
  min_value TEXT,
  max_value TEXT,
  description TEXT,
  impact_description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(algorithm_id, parameter_name)
);

-- Table 3: algorithm_changelog
-- Tracks all parameter changes with audit trail
CREATE TABLE IF NOT EXISTS algorithm_changelog (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  algorithm_id VARCHAR(50) NOT NULL,
  user_id INTEGER,
  parameter_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  reason TEXT,
  modified_at TIMESTAMP DEFAULT NOW()
);

-- Table 4: algorithm_chat_history
-- Stores user conversations with algorithms
CREATE TABLE IF NOT EXISTS algorithm_chat_history (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  algorithm_id VARCHAR(50) NOT NULL,
  user_id INTEGER,
  message TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table 5: algorithm_metrics
-- Tracks algorithm performance metrics
CREATE TABLE IF NOT EXISTS algorithm_metrics (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  algorithm_id VARCHAR(50) NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC,
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_algorithm_agents_type 
  ON algorithm_agents(algorithm_type);

CREATE INDEX IF NOT EXISTS idx_algorithm_agents_active 
  ON algorithm_agents(is_active);

CREATE INDEX IF NOT EXISTS idx_algorithm_parameters_algorithm 
  ON algorithm_parameters(algorithm_id);

CREATE INDEX IF NOT EXISTS idx_algorithm_changelog_algorithm 
  ON algorithm_changelog(algorithm_id);

CREATE INDEX IF NOT EXISTS idx_algorithm_changelog_modified 
  ON algorithm_changelog(modified_at);

CREATE INDEX IF NOT EXISTS idx_algorithm_chat_algorithm 
  ON algorithm_chat_history(algorithm_id);

CREATE INDEX IF NOT EXISTS idx_algorithm_chat_user 
  ON algorithm_chat_history(user_id);

CREATE INDEX IF NOT EXISTS idx_algorithm_metrics_algorithm 
  ON algorithm_metrics(algorithm_id);

CREATE INDEX IF NOT EXISTS idx_algorithm_metrics_recorded 
  ON algorithm_metrics(recorded_at);

-- Comments for documentation
COMMENT ON TABLE algorithm_agents IS 'Algorithm agent metadata for conversational interface';
COMMENT ON TABLE algorithm_parameters IS 'Adjustable parameters for each algorithm';
COMMENT ON TABLE algorithm_changelog IS 'Audit trail of all parameter changes';
COMMENT ON TABLE algorithm_chat_history IS 'User conversation history with algorithms';
COMMENT ON TABLE algorithm_metrics IS 'Performance metrics for algorithms';
