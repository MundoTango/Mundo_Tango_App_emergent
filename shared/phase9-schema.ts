// MB.MD PHASE 9: INTELLIGENCE LAYER & MR BLUE SCHEMAS
// Cross-Phase Learning, Predictive Planning, Dynamic Priority, Dependency Mapping, Mr Blue Chat

import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp, 
  varchar,
  jsonb,
  index,
  real,
  vector
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// TRACK 57: CROSS-PHASE LEARNING SYSTEM
// ============================================================================

export const crossPhaseLearning = pgTable('cross_phase_learning', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  sourceAgentId: varchar('source_agent_id', { length: 100 }).notNull(),
  targetAgentId: varchar('target_agent_id', { length: 100 }),
  phaseNumber: integer('phase_number').notNull(),
  insightType: varchar('insight_type', { length: 50 }).notNull(), // 'pattern', 'solution', 'optimization', 'warning'
  insight: text('insight').notNull(),
  confidence: real('confidence').notNull(), // 0-1
  impactScore: real('impact_score'), // 0-100
  validatedBy: text('validated_by').array(), // Array of agent IDs that validated
  applicablePhases: integer('applicable_phases').array(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index("idx_cross_phase_source").on(table.sourceAgentId),
  index("idx_cross_phase_phase").on(table.phaseNumber),
  index("idx_cross_phase_type").on(table.insightType),
  index("idx_cross_phase_confidence").on(table.confidence),
]);

export const agentInsights = pgTable('agent_insights', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar('agent_id', { length: 100 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(), // 'performance', 'quality', 'error', 'optimization'
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  applicablePhases: integer('applicable_phases').array(),
  prerequisites: text('prerequisites').array(),
  implementation: text('implementation').notNull(),
  successRate: real('success_rate'), // 0-1
  usageCount: integer('usage_count').default(0),
  embeddings: vector('embeddings', { dimensions: 1536 }), // OpenAI text-embedding-3-small
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index("idx_insights_agent").on(table.agentId),
  index("idx_insights_category").on(table.category),
  index("idx_insights_success").on(table.successRate),
]);

export const learningPatterns = pgTable('learning_patterns', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  patternName: varchar('pattern_name', { length: 255 }).notNull(),
  detectedBy: text('detected_by').array().notNull(), // Agent IDs
  frequency: integer('frequency').notNull(),
  phases: integer('phases').array(),
  triggerConditions: jsonb('trigger_conditions'),
  recommendedActions: jsonb('recommended_actions'),
  successMetrics: jsonb('success_metrics'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index("idx_patterns_name").on(table.patternName),
  index("idx_patterns_frequency").on(table.frequency),
]);

// ============================================================================
// TRACK 58: PREDICTIVE PLANNING ENGINE
// ============================================================================

export const executionHistory = pgTable('execution_history', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  phaseNumber: integer('phase_number').notNull(),
  trackNumber: integer('track_number').notNull(),
  trackName: varchar('track_name', { length: 255 }).notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  duration: integer('duration'), // seconds
  status: varchar('status', { length: 50 }).notNull(), // 'running', 'completed', 'failed', 'blocked'
  resourceUsage: jsonb('resource_usage'), // { cpu: number, memory: number, io: number }
  dependencies: text('dependencies').array(),
  blockedBy: text('blocked_by').array(),
  parallelTracks: text('parallel_tracks').array(),
  successMetrics: jsonb('success_metrics'),
  errorLog: text('error_log'),
  agentId: varchar('agent_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index("idx_exec_phase_track").on(table.phaseNumber, table.trackNumber),
  index("idx_exec_status").on(table.status),
  index("idx_exec_agent").on(table.agentId),
]);

export const trackSequences = pgTable('track_sequences', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  phaseNumber: integer('phase_number').notNull(),
  sequence: integer('sequence').array().notNull(), // Track execution order
  totalDuration: integer('total_duration').notNull(), // seconds
  successRate: real('success_rate').notNull(), // 0-1
  parallelizationFactor: real('parallelization_factor'), // How many tracks ran in parallel
  contextSimilarity: real('context_similarity'), // How similar to current context (0-1)
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index("idx_sequences_phase").on(table.phaseNumber),
  index("idx_sequences_success").on(table.successRate),
]);

export const mlModels = pgTable('ml_models', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  modelName: varchar('model_name', { length: 255 }).notNull(),
  modelType: varchar('model_type', { length: 100 }).notNull(), // 'lstm', 'transformer', 'xgboost', 'ensemble'
  version: varchar('version', { length: 50 }).notNull(),
  purpose: varchar('purpose', { length: 255 }).notNull(), // 'sequence_prediction', 'duration_forecast', etc.
  architecture: jsonb('architecture').notNull(),
  hyperparameters: jsonb('hyperparameters'),
  trainingMetrics: jsonb('training_metrics'), // { accuracy, loss, etc. }
  validationMetrics: jsonb('validation_metrics'),
  isActive: boolean('is_active').default(false),
  modelPath: text('model_path'), // Path to saved model
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index("idx_models_name").on(table.modelName),
  index("idx_models_type").on(table.modelType),
  index("idx_models_active").on(table.isActive),
]);

// ============================================================================
// TRACK 59: DYNAMIC PRIORITY MANAGER
// ============================================================================

export const dynamicPriority = pgTable('dynamic_priority', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  phaseNumber: integer('phase_number').notNull(),
  trackId: varchar('track_id', { length: 100 }).notNull(),
  trackName: varchar('track_name', { length: 255 }).notNull(),
  currentPriority: integer('current_priority').notNull(), // 0-100
  originalPriority: integer('original_priority').notNull(),
  adjustmentReason: text('adjustment_reason').notNull(),
  impactScore: real('impact_score').notNull(), // 0-1
  urgencyScore: real('urgency_score').notNull(), // 0-1
  dependencyScore: real('dependency_score').notNull(), // 0-1
  resourceAvailability: real('resource_availability'), // 0-1
  adjustedBy: varchar('adjusted_by', { length: 100 }).notNull(), // 'system' or agent ID
  adjustedAt: timestamp('adjusted_at').defaultNow().notNull(),
}, (table) => [
  index("idx_priority_phase_track").on(table.phaseNumber, table.trackId),
  index("idx_priority_current").on(table.currentPriority),
  index("idx_priority_adjusted").on(table.adjustedAt),
]);

export const priorityRules = pgTable('priority_rules', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  ruleName: varchar('rule_name', { length: 255 }).notNull(),
  condition: jsonb('condition').notNull(), // Rule trigger condition
  action: jsonb('action').notNull(), // Priority adjustment action
  weight: real('weight').default(1), // Rule importance (0-1)
  isActive: boolean('is_active').default(true),
  timesTriggered: integer('times_triggered').default(0),
  successRate: real('success_rate'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index("idx_rules_active").on(table.isActive),
  index("idx_rules_success").on(table.successRate),
]);

// ============================================================================
// TRACK 60: DEPENDENCY MAPPING VISUALIZER
// ============================================================================

export const dependencyGraph = pgTable('dependency_graph', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  phaseNumber: integer('phase_number').notNull(),
  graphVersion: varchar('graph_version', { length: 50 }).notNull(),
  nodes: jsonb('nodes').notNull(), // Array of track nodes with metadata
  edges: jsonb('edges').notNull(), // Array of dependency edges
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index("idx_graph_phase").on(table.phaseNumber),
  index("idx_graph_version").on(table.graphVersion),
]);

export const trackDependencies = pgTable('track_dependencies', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  phaseNumber: integer('phase_number').notNull(),
  fromTrackId: varchar('from_track_id', { length: 100 }).notNull(),
  toTrackId: varchar('to_track_id', { length: 100 }).notNull(),
  dependencyType: varchar('dependency_type', { length: 50 }).notNull(), // 'blocks', 'requires', 'optional', 'suggests'
  strength: real('strength').notNull(), // 0-1 (how critical)
  reason: text('reason'),
  detectedBy: varchar('detected_by', { length: 100 }), // 'manual' or agent ID
  validatedAt: timestamp('validated_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index("idx_deps_phase").on(table.phaseNumber),
  index("idx_deps_from").on(table.fromTrackId),
  index("idx_deps_to").on(table.toTrackId),
  index("idx_deps_type").on(table.dependencyType),
]);

export const criticalPaths = pgTable('critical_paths', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  phaseNumber: integer('phase_number').notNull(),
  pathTracks: text('path_tracks').array().notNull(), // Ordered track IDs
  totalDuration: integer('total_duration').notNull(), // Estimated duration in seconds
  riskLevel: varchar('risk_level', { length: 50 }), // 'low', 'medium', 'high', 'critical'
  bottlenecks: jsonb('bottlenecks'), // Identified bottleneck tracks
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index("idx_critical_phase").on(table.phaseNumber),
  index("idx_critical_risk").on(table.riskLevel),
]);

// ============================================================================
// TRACK 61-65: MR BLUE CHAT + CODE INTELLIGENCE
// ============================================================================

export const mrBlueConversations = pgTable('mrblue_conversations', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: integer('user_id').notNull(),
  sessionId: varchar('session_id', { length: 100 }).notNull(),
  pageUrl: varchar('page_url', { length: 500 }),
  pageContext: jsonb('page_context'),
  userJourney: jsonb('user_journey'), // User's navigation history
  messages: jsonb('messages').notNull(), // Array of chat messages
  mode: varchar('mode', { length: 50 }).default('chat'), // 'chat', 'code', 'visual'
  codeGenerated: text('code_generated').array(),
  filesModified: text('files_modified').array(),
  commandsExecuted: text('commands_executed').array(),
  approvalsPending: jsonb('approvals_pending'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
}, (table) => [
  index("idx_mrblue_user").on(table.userId),
  index("idx_mrblue_session").on(table.sessionId),
  index("idx_mrblue_started").on(table.startedAt),
]);

export const codebaseIndex = pgTable('codebase_index', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  filePath: varchar('file_path', { length: 500 }).notNull(),
  fileType: varchar('file_type', { length: 50 }).notNull(), // 'ts', 'tsx', 'js', 'jsx', etc.
  language: varchar('language', { length: 50 }).notNull(),
  symbols: jsonb('symbols').notNull(), // Functions, classes, variables extracted
  imports: text('imports').array(),
  exports: text('exports').array(),
  dependencies: text('dependencies').array(),
  astHash: varchar('ast_hash', { length: 64 }), // Hash of AST for change detection
  embeddings: vector('embeddings', { dimensions: 1536 }),
  lastIndexed: timestamp('last_indexed').defaultNow().notNull(),
  indexVersion: varchar('index_version', { length: 50 }),
}, (table) => [
  index("idx_codebase_path").on(table.filePath),
  index("idx_codebase_type").on(table.fileType),
  index("idx_codebase_indexed").on(table.lastIndexed),
]);

export const featureFlags = pgTable('feature_flags', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  flagName: varchar('flag_name', { length: 100 }).notNull().unique(),
  description: text('description'),
  enabled: boolean('enabled').default(false).notNull(),
  allowedRoles: text('allowed_roles').array(), // ['super_admin', 'admin', 'moderator']
  allowedUsers: text('allowed_users').array(), // Specific user IDs
  rolloutPercentage: integer('rollout_percentage').default(0), // 0-100
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index("idx_flags_name").on(table.flagName),
  index("idx_flags_enabled").on(table.enabled),
]);

export const mrBlueUsageMetrics = pgTable('mrblue_usage_metrics', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: integer('user_id').notNull(),
  feature: varchar('feature', { length: 100 }).notNull(), // 'chat', 'code_gen', 'visual_editor', etc.
  action: varchar('action', { length: 100 }).notNull(),
  metadata: jsonb('metadata'),
  duration: integer('duration'), // Time spent in seconds
  success: boolean('success'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index("idx_usage_user").on(table.userId),
  index("idx_usage_feature").on(table.feature),
  index("idx_usage_created").on(table.createdAt),
]);

// ============================================================================
// EXPERT RESEARCH DATABASE
// ============================================================================

export const expertResearch = pgTable('expert_research', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar('agent_id', { length: 100 }).notNull(),
  expertName: varchar('expert_name', { length: 255 }).notNull(),
  expertAffiliation: varchar('expert_affiliation', { length: 255 }),
  researchArea: varchar('research_area', { length: 255 }).notNull(),
  keyInsight: text('key_insight').notNull(),
  application: text('application').notNull(),
  citation: text('citation').notNull(),
  url: varchar('url', { length: 500 }),
  tags: text('tags').array(),
  embeddings: vector('embeddings', { dimensions: 1536 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index("idx_expert_agent").on(table.agentId),
  index("idx_expert_area").on(table.researchArea),
]);

// ============================================================================
// INSERT SCHEMAS & TYPES
// ============================================================================

// Cross-Phase Learning
export const insertCrossPhaseLearningSchema = createInsertSchema(crossPhaseLearning).omit({
  id: true,
  createdAt: true,
});

export const insertAgentInsightSchema = createInsertSchema(agentInsights).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLearningPatternSchema = createInsertSchema(learningPatterns).omit({
  id: true,
  createdAt: true,
});

// Predictive Planning
export const insertExecutionHistorySchema = createInsertSchema(executionHistory).omit({
  id: true,
  createdAt: true,
});

export const insertTrackSequenceSchema = createInsertSchema(trackSequences).omit({
  id: true,
  createdAt: true,
});

export const insertMLModelSchema = createInsertSchema(mlModels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Dynamic Priority
export const insertDynamicPrioritySchema = createInsertSchema(dynamicPriority).omit({
  id: true,
  adjustedAt: true,
});

export const insertPriorityRuleSchema = createInsertSchema(priorityRules).omit({
  id: true,
  createdAt: true,
});

// Dependency Mapping
export const insertDependencyGraphSchema = createInsertSchema(dependencyGraph).omit({
  id: true,
  createdAt: true,
});

export const insertTrackDependencySchema = createInsertSchema(trackDependencies).omit({
  id: true,
  createdAt: true,
});

export const insertCriticalPathSchema = createInsertSchema(criticalPaths).omit({
  id: true,
  createdAt: true,
});

// Mr Blue
export const insertMrBlueConversationSchema = createInsertSchema(mrBlueConversations).omit({
  id: true,
  startedAt: true,
});

export const insertCodebaseIndexSchema = createInsertSchema(codebaseIndex).omit({
  id: true,
  lastIndexed: true,
});

export const insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMrBlueUsageMetricSchema = createInsertSchema(mrBlueUsageMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertExpertResearchSchema = createInsertSchema(expertResearch).omit({
  id: true,
  createdAt: true,
});

// ============================================================================
// TYPES
// ============================================================================

// Cross-Phase Learning
export type CrossPhaseLearning = typeof crossPhaseLearning.$inferSelect;
export type InsertCrossPhaseLearning = z.infer<typeof insertCrossPhaseLearningSchema>;

export type AgentInsight = typeof agentInsights.$inferSelect;
export type InsertAgentInsight = z.infer<typeof insertAgentInsightSchema>;

export type LearningPattern = typeof learningPatterns.$inferSelect;
export type InsertLearningPattern = z.infer<typeof insertLearningPatternSchema>;

// Predictive Planning
export type ExecutionHistory = typeof executionHistory.$inferSelect;
export type InsertExecutionHistory = z.infer<typeof insertExecutionHistorySchema>;

export type TrackSequence = typeof trackSequences.$inferSelect;
export type InsertTrackSequence = z.infer<typeof insertTrackSequenceSchema>;

export type MLModel = typeof mlModels.$inferSelect;
export type InsertMLModel = z.infer<typeof insertMLModelSchema>;

// Dynamic Priority
export type DynamicPriority = typeof dynamicPriority.$inferSelect;
export type InsertDynamicPriority = z.infer<typeof insertDynamicPrioritySchema>;

export type PriorityRule = typeof priorityRules.$inferSelect;
export type InsertPriorityRule = z.infer<typeof insertPriorityRuleSchema>;

// Dependency Mapping
export type DependencyGraph = typeof dependencyGraph.$inferSelect;
export type InsertDependencyGraph = z.infer<typeof insertDependencyGraphSchema>;

export type TrackDependency = typeof trackDependencies.$inferSelect;
export type InsertTrackDependency = z.infer<typeof insertTrackDependencySchema>;

export type CriticalPath = typeof criticalPaths.$inferSelect;
export type InsertCriticalPath = z.infer<typeof insertCriticalPathSchema>;

// Mr Blue
export type MrBlueConversation = typeof mrBlueConversations.$inferSelect;
export type InsertMrBlueConversation = z.infer<typeof insertMrBlueConversationSchema>;

export type CodebaseIndex = typeof codebaseIndex.$inferSelect;
export type InsertCodebaseIndex = z.infer<typeof insertCodebaseIndexSchema>;

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;

export type MrBlueUsageMetric = typeof mrBlueUsageMetrics.$inferSelect;
export type InsertMrBlueUsageMetric = z.infer<typeof insertMrBlueUsageMetricSchema>;

export type ExpertResearch = typeof expertResearch.$inferSelect;
export type InsertExpertResearch = z.infer<typeof insertExpertResearchSchema>;
