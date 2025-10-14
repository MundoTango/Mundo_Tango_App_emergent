/**
 * Agent Communication Types
 * MB.MD Phase 4: Blackboard Pattern for real agent collaboration
 */

import { z } from 'zod';

// Agent roles (Agents #115-117)
export type AgentRole = 'router' | 'ensemble' | 'meta-orchestrator';

// Message types in the blackboard
export type MessageType = 
  | 'query'           // Initial user query
  | 'routing_decision' // Router's model selection
  | 'model_response'   // Response from AI model
  | 'synthesis_request' // Request for ensemble synthesis
  | 'final_response'   // Final synthesized answer
  | 'feedback'         // Agent feedback/learning
  | 'metric';          // Performance metrics

// Blackboard message
export interface BlackboardMessage {
  id: string;
  type: MessageType;
  agent: AgentRole;
  timestamp: string;
  content: {
    text?: string;
    metadata?: Record<string, any>;
  };
  parent_id?: string;  // For threaded conversations
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

// Agent state
export interface AgentState {
  role: AgentRole;
  status: 'idle' | 'active' | 'waiting' | 'error';
  current_task?: string;
  messages_processed: number;
  last_active: string;
  learning_data: {
    successful_decisions: number;
    failed_decisions: number;
    average_confidence: number;
  };
}

// Blackboard state
export interface BlackboardState {
  messages: BlackboardMessage[];
  agents: AgentState[];
  current_query_id?: string;
  status: 'idle' | 'processing' | 'completed';
}

// Agent decision
export interface AgentDecision {
  agent: AgentRole;
  decision: string;
  confidence: number;
  reasoning: string;
  alternatives: {
    option: string;
    score: number;
  }[];
}

// Learning feedback
export interface LearningFeedback {
  decision_id: string;
  outcome: 'success' | 'failure';
  actual_result: any;
  expected_result: any;
  lesson: string;
  timestamp: string;
}
