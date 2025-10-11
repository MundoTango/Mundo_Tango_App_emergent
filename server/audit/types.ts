/**
 * ESA Audit Runner Types
 * Based on: docs/pages/esa-tools/standardized-page-audit.md
 * Purpose: Type definitions for 43-agent audit system and human review story generation
 */

export type AuditSeverity = "critical" | "high" | "medium" | "low";
export type AuditStatus = "pass" | "fail" | "partial" | "n/a";
export type ReviewCategory = 
  | "Architecture & Data Integrity"
  | "UI/UX & Accessibility"
  | "Business Logic & Security"
  | "API & Performance"
  | "AI Intelligence"
  | "Content & i18n"
  | "Testing & QA"
  | "Documentation & Compliance";

export interface AuditFinding {
  id: string;
  agent_id: number;
  agent_name: string;
  title: string;
  description: string;
  severity: AuditSeverity;
  score: number;
  
  // ESA Framework
  affected_layers: number[];
  implementation_phase: number;
  checkpoints: string[];
  dependencies: number[];
  
  // Evidence
  file_locations: string[];
  code_snippets: string[];
  evidence: string;
  
  // Metrics
  current_state: Record<string, string>;
  target_state: Record<string, string>;
  gap_percentage: number;
  
  // Technical
  technologies: string[];
  tools_required: string[];
  api_endpoints: string[];
  external_services: string[];
  
  // Acceptance
  success_criteria: string[];
  acceptance_criteria: string[];
  
  // Collaboration
  expert_required: boolean;
  consulting_agents: number[];
  involved_agents: number[];
  blockers: string[];
  
  // References
  references: string[];
  reusable_solutions: string[];
}

export interface AgentAuditResult {
  agent_id: number;
  agent_name: string;
  esa_layers: number[];
  score: number;
  status: AuditStatus;
  findings: AuditFinding[];
  evidence: Record<string, any>;
  pass_threshold: number;
}

export interface AuditReport {
  id: string;
  page: string;
  audit_date: Date;
  overall_score: number;
  certification_status: "CERTIFIED" | "CONDITIONAL" | "NEEDS WORK";
  
  critical_issues: number;
  high_priority_issues: number;
  medium_priority_issues: number;
  low_priority_issues: number;
  
  agent_scores: AgentAuditResult[];
  agent_consensus_percentage: number;
  confidence_level: number;
  
  findings: AuditFinding[];
}

export interface HumanReviewStory {
  // 1. Core Identification
  key: string;
  epic_id: number;
  summary: string;
  description: string;
  
  // 2. Required Fields (User's 3 items)
  assigned_agent_id: number;
  review_notes: string;
  documentation_links: string[];
  
  // 3. ESA Framework Tracking
  esa_layers: number[];
  implementation_phase: number;
  quality_checkpoints: string[];
  checkpoint_status: "pass" | "fail" | "partial";
  related_layers: number[];
  layer_integration: string;
  
  // 4. Performance & Quality Metrics
  current_metrics: Record<string, string>;
  target_metrics: Record<string, string>;
  gap_percentage: number;
  success_criteria: string[];
  
  // 5. Risk & Impact Assessment
  risk_level: "critical" | "high" | "medium" | "low";
  risk_description: string;
  impact_level: "critical" | "high" | "medium" | "low";
  impact_scope: string[];
  affected_users: string;
  business_impact: string;
  severity: "blocker" | "critical" | "major" | "minor";
  
  // 6. Complexity & Effort Estimation
  complexity: "high" | "medium" | "low";
  complexity_factors: string[];
  story_points: 1 | 2 | 3 | 5 | 8 | 13 | 21;
  estimated_hours: number;
  estimated_tasks: number;
  estimation_confidence: "high" | "medium" | "low";
  
  // 7. Technical Details
  technologies: string[];
  tools_required: string[];
  affected_files: string[];
  code_complexity: string;
  api_endpoints: string[];
  external_services: string[];
  
  // 8. Audit Trail & Compliance
  audit_type: string;
  audit_date: Date;
  audited_by_agent: number;
  compliance_requirements: string[];
  compliance_status: "compliant" | "partial" | "non-compliant";
  legal_review_required: boolean;
  privacy_impact: boolean;
  security_review_required: boolean;
  
  // 9. Human Review Workflow
  review_category: ReviewCategory;
  review_checklist: string[];
  acceptance_criteria: string[];
  manual_testing_required: boolean;
  automated_testing_coverage: string;
  expert_review_needed: boolean;
  expert_agents: number[];
  
  // 10. Status & Progress Tracking
  status: "to_do" | "in_progress" | "in_review" | "blocked" | "done";
  blocked_by: string[];
  tasks_completed: number;
  tasks_total: number;
  review_progress: number;
  created_at: Date;
  started_at: Date | null;
  reviewed_at: Date | null;
  completed_at: Date | null;
  sprint_id: number | null;
  target_release: string;
  
  // 11. Collaboration & Communication
  collaborating_agents: number[];
  escalation_path: string;
  a2a_messages: Array<{
    from_agent: number;
    to_agent: number;
    message: string;
    timestamp: Date;
  }>;
  lessons_learned: string[];
  reusable_patterns: string[];
}

export interface AuditRunRequest {
  page: string;
  mode: "full" | "quick";
  generate_stories: boolean;
}

export interface AuditRunResponse {
  audit_id: string;
  overall_score: number;
  certification_status: string;
  stories_generated: number;
  story_ids: string[];
  report_url: string;
}
