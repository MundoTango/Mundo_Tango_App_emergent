/**
 * Multi-Agent System Database Schemas
 * Real persistence for orchestration, ML predictions, and failure monitoring
 * MB.MD Phase 3 REAL - Oct 21, 2025
 */

import { pgTable, serial, varchar, text, integer, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// ============ MULTI-AGENT ORCHESTRATION ============

export const buildTasks = pgTable('build_tasks', {
  id: serial('id').primaryKey(),
  buildId: varchar('build_id', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'frontend' | 'backend' | 'database' | 'integration'
  description: text('description').notNull(),
  assignedAgent: varchar('assigned_agent', { length: 100 }),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending' | 'in_progress' | 'completed' | 'failed'
  dependencies: jsonb('dependencies').default([]), // Array of task IDs
  priority: integer('priority').default(5), // 1-10
  estimatedMinutes: integer('estimated_minutes'),
  actualMinutes: integer('actual_minutes'),
  output: jsonb('output'),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  userId: integer('user_id').notNull(),
});

export const agentCapabilities = pgTable('agent_capabilities', {
  id: serial('id').primaryKey(),
  agentId: varchar('agent_id', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  specialties: jsonb('specialties').notNull().default([]), // Array of strings
  maxLoad: integer('max_load').notNull().default(3),
  currentLoad: integer('current_load').notNull().default(0),
  successRate: integer('success_rate').default(100), // 0-100
  avgResponseTime: integer('avg_response_time').default(0), // milliseconds
  totalTasksCompleted: integer('total_tasks_completed').default(0),
  isActive: boolean('is_active').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============ ML PREDICTION SYSTEM ============

export const userBehaviorPatterns = pgTable('user_behavior_patterns', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  commonPaths: jsonb('common_paths').notNull().default([]), // Array of strings
  peakActivityTime: varchar('peak_activity_time', { length: 50 }),
  preferredFeatures: jsonb('preferred_features').notNull().default([]),
  frustrationPoints: jsonb('frustration_points').notNull().default([]),
  sessionCount: integer('session_count').default(0),
  avgSessionDuration: integer('avg_session_duration').default(0), // seconds
  lastActive: timestamp('last_active').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const mlPredictions = pgTable('ml_predictions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  predictionType: varchar('prediction_type', { length: 50 }).notNull(), // 'next_action' | 'agent_assignment' | 'feature_recommendation'
  input: jsonb('input').notNull(), // Context data used for prediction
  prediction: text('prediction').notNull(),
  confidence: integer('confidence').notNull(), // 0-100
  reasoning: text('reasoning'),
  wasCorrect: boolean('was_correct'), // Feedback loop
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============ FAILED ACTION MONITORING ============

export const failedActions = pgTable('failed_actions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  action: varchar('action', { length: 255 }).notNull(),
  errorType: varchar('error_type', { length: 100 }).notNull(),
  errorMessage: text('error_message'),
  context: jsonb('context'), // Full context at time of failure
  stackTrace: text('stack_trace'),
  severity: varchar('severity', { length: 20 }).notNull().default('medium'), // 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean('resolved').notNull().default(false),
  resolution: text('resolution'),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const failurePatterns = pgTable('failure_patterns', {
  id: serial('id').primaryKey(),
  action: varchar('action', { length: 255 }).notNull().unique(),
  frequency: integer('frequency').notNull().default(1),
  commonErrors: jsonb('common_errors').notNull().default([]),
  affectedUsers: integer('affected_users').default(1),
  avgResolutionTime: integer('avg_resolution_time'), // minutes
  recommendations: jsonb('recommendations').notNull().default([]),
  lastOccurrence: timestamp('last_occurrence').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============ ZOD SCHEMAS FOR VALIDATION ============

export const insertBuildTaskSchema = createInsertSchema(buildTasks).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
}).extend({
  type: z.enum(['frontend', 'backend', 'database', 'integration']),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
  priority: z.number().min(1).max(10).optional(),
});

export const insertUserBehaviorPatternSchema = createInsertSchema(userBehaviorPatterns).omit({
  id: true,
  lastActive: true,
  updatedAt: true,
});

export const insertFailedActionSchema = createInsertSchema(failedActions).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
}).extend({
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

export const insertMlPredictionSchema = createInsertSchema(mlPredictions).omit({
  id: true,
  createdAt: true,
}).extend({
  predictionType: z.enum(['next_action', 'agent_assignment', 'feature_recommendation']),
  confidence: z.number().min(0).max(100),
});

// ============ TYPES ============

export type BuildTask = typeof buildTasks.$inferSelect;
export type InsertBuildTask = z.infer<typeof insertBuildTaskSchema>;

export type AgentCapability = typeof agentCapabilities.$inferSelect;
export type InsertAgentCapability = typeof agentCapabilities.$inferInsert;

export type UserBehaviorPattern = typeof userBehaviorPatterns.$inferSelect;
export type InsertUserBehaviorPattern = z.infer<typeof insertUserBehaviorPatternSchema>;

export type MlPrediction = typeof mlPredictions.$inferSelect;
export type InsertMlPrediction = z.infer<typeof insertMlPredictionSchema>;

export type FailedAction = typeof failedActions.$inferSelect;
export type InsertFailedAction = z.infer<typeof insertFailedActionSchema>;

export type FailurePattern = typeof failurePatterns.$inferSelect;
export type InsertFailurePattern = typeof failurePatterns.$inferInsert;
