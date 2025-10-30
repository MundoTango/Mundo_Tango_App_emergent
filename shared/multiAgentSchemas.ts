/**
 * Multi-Agent System Schemas
 * MB.MD Phase 3 - Agent Coordination
 * 
 * This file defines schemas for the 154-agent ESA LIFE CEO system
 * Currently stubbed - full implementation pending
 */

import { pgTable, serial, text, varchar, timestamp, json, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Agent Registry - Tracks all 154 agents in the system
 */
export const agentRegistry = pgTable('agent_registry', {
  id: serial('id').primaryKey(),
  agentId: varchar('agent_id', { length: 50 }).notNull().unique(), // e.g., "LAYER_01", "CEO", "DOMAIN_01"
  agentName: varchar('agent_name', { length: 255 }).notNull(),
  agentType: varchar('agent_type', { length: 50 }).notNull(), // 'ceo', 'chief', 'domain', 'layer', 'specialist'
  capabilities: json('capabilities').$type<string[]>(),
  status: varchar('status', { length: 50 }).default('active'),
  parentAgentId: varchar('parent_agent_id', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Agent Tasks - Tracks work assigned to agents
 */
export const agentTasks = pgTable('agent_tasks', {
  id: serial('id').primaryKey(),
  agentId: varchar('agent_id', { length: 50 }).notNull(),
  taskDescription: text('task_description').notNull(),
  taskStatus: varchar('task_status', { length: 50 }).default('pending'), // pending, in_progress, completed, failed
  assignedAt: timestamp('assigned_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  resultData: json('result_data'),
});

/**
 * Agent Communication - Logs inter-agent messages
 */
export const agentCommunication = pgTable('agent_communication', {
  id: serial('id').primaryKey(),
  fromAgentId: varchar('from_agent_id', { length: 50 }).notNull(),
  toAgentId: varchar('to_agent_id', { length: 50 }).notNull(),
  messageType: varchar('message_type', { length: 50 }).notNull(), // 'request', 'response', 'notification'
  messageContent: text('message_content').notNull(),
  metadata: json('metadata'),
  sentAt: timestamp('sent_at').defaultNow(),
});

// Zod Schemas
export const insertAgentRegistrySchema = createInsertSchema(agentRegistry);
export const insertAgentTaskSchema = createInsertSchema(agentTasks);
export const insertAgentCommunicationSchema = createInsertSchema(agentCommunication);

// Types
export type AgentRegistry = typeof agentRegistry.$inferSelect;
export type InsertAgentRegistry = z.infer<typeof insertAgentRegistrySchema>;
export type AgentTask = typeof agentTasks.$inferSelect;
export type InsertAgentTask = z.infer<typeof insertAgentTaskSchema>;
export type AgentCommunication = typeof agentCommunication.$inferSelect;
export type InsertAgentCommunication = z.infer<typeof insertAgentCommunicationSchema>;
