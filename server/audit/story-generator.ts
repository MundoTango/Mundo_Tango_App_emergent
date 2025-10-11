/**
 * ESA Human Review Story Generator
 * Converts audit findings → comprehensive project tracker stories
 * Based on: ESA 61x21 Framework + 40x20s Quality Gates
 */

import type { AuditFinding, HumanReviewStory } from "./types";
import { categorizeByESALayers, getCategoryDescription, getPrimaryAgents } from "./utils/category-mapper";
import { getEscalationPath, getCollaboratingAgents } from "./utils/escalation-path";

/**
 * Generate comprehensive human review story from audit finding
 */
export function generateHumanReviewStory(
  finding: AuditFinding,
  epicId: number,
  storyKey: string
): HumanReviewStory {
  const category: import("./types").ReviewCategory = categorizeByESALayers(finding.affected_layers);
  const collaborators = getCollaboratingAgents(category, finding.agent_id);
  
  return {
    // 1. Core Identification
    key: storyKey,
    epic_id: epicId,
    summary: `Human Review: ${finding.title}`,
    description: generateDescription(finding, category),
    
    // 2. Required Fields (User's 3 items)
    assigned_agent_id: finding.agent_id,
    review_notes: generateReviewNotes(finding),
    documentation_links: finding.references,
    
    // 3. ESA Framework Tracking
    esa_layers: finding.affected_layers,
    implementation_phase: finding.implementation_phase,
    quality_checkpoints: finding.checkpoints,
    checkpoint_status: finding.score < 70 ? "fail" : finding.score < 90 ? "partial" : "pass",
    related_layers: finding.dependencies,
    layer_integration: generateLayerIntegration(finding),
    
    // 4. Performance & Quality Metrics
    current_metrics: finding.current_state,
    target_metrics: finding.target_state,
    gap_percentage: finding.gap_percentage,
    success_criteria: finding.success_criteria,
    
    // 5. Risk & Impact Assessment
    risk_level: finding.severity,
    risk_description: generateRiskDescription(finding),
    impact_level: assessImpactLevel(finding),
    impact_scope: generateImpactScope(finding, category),
    affected_users: generateAffectedUsers(finding),
    business_impact: generateBusinessImpact(finding),
    severity: mapSeverityToStoryPriority(finding.severity),
    
    // 6. Complexity & Effort Estimation
    complexity: estimateComplexity(finding),
    complexity_factors: generateComplexityFactors(finding),
    story_points: estimateStoryPoints(finding),
    estimated_hours: estimateHours(finding),
    estimated_tasks: estimateTasks(finding),
    estimation_confidence: finding.score < 50 ? "low" : finding.score < 80 ? "medium" : "high",
    
    // 7. Technical Details
    technologies: finding.technologies,
    tools_required: finding.tools_required,
    affected_files: finding.file_locations,
    code_complexity: generateCodeComplexity(finding),
    api_endpoints: finding.api_endpoints,
    external_services: finding.external_services,
    
    // 8. Audit Trail & Compliance
    audit_type: "ESA 61x21 Framework Audit",
    audit_date: new Date(),
    audited_by_agent: finding.agent_id,
    compliance_requirements: extractComplianceRequirements(finding),
    compliance_status: finding.score >= 90 ? "compliant" : finding.score >= 70 ? "partial" : "non-compliant",
    legal_review_required: requiresLegalReview(finding),
    privacy_impact: hasPrivacyImpact(finding),
    security_review_required: requiresSecurityReview(finding),
    
    // 9. Human Review Workflow
    review_category: category,
    review_checklist: generateReviewChecklist(finding),
    acceptance_criteria: finding.acceptance_criteria,
    manual_testing_required: true,
    automated_testing_coverage: generateTestCoverage(finding),
    expert_review_needed: finding.expert_required,
    expert_agents: finding.consulting_agents,
    
    // 10. Status & Progress Tracking
    status: "to_do",
    blocked_by: finding.blockers,
    tasks_completed: 0,
    tasks_total: estimateTasks(finding),
    review_progress: 0,
    created_at: new Date(),
    started_at: null,
    reviewed_at: null,
    completed_at: null,
    sprint_id: null,
    target_release: "v2.2.0",
    
    // 11. Collaboration & Communication
    collaborating_agents: [finding.agent_id, ...collaborators, ...finding.consulting_agents],
    escalation_path: getEscalationPath(finding.agent_id),
    a2a_messages: [],
    lessons_learned: [],
    reusable_patterns: finding.reusable_solutions
  };
}

function generateDescription(finding: AuditFinding, category: string): string {
  return `${finding.description}

**Category:** ${category}
**ESA Layers Affected:** ${finding.affected_layers.join(', ')}
**Current State:** ${Object.entries(finding.current_state).map(([k, v]) => `${k}: ${v}`).join(', ')}
**Target State:** ${Object.entries(finding.target_state).map(([k, v]) => `${k}: ${v}`).join(', ')}

**Category Description:** ${getCategoryDescription(category)}`;
}

function generateReviewNotes(finding: AuditFinding): string {
  const notes: string[] = [
    `Validate ${finding.title.toLowerCase()} meets ESA standards.`,
    `Test edge cases based on audit findings.`
  ];
  
  if (finding.file_locations.length > 0) {
    notes.push(`Review affected files: ${finding.file_locations.slice(0, 3).join(', ')}${finding.file_locations.length > 3 ? '...' : ''}`);
  }
  
  if (finding.success_criteria.length > 0) {
    notes.push(`Success criteria: ${finding.success_criteria.join('; ')}`);
  }
  
  return notes.join(' ');
}

function generateLayerIntegration(finding: AuditFinding): string {
  const layerNames: Record<number, string> = {
    1: "Database", 2: "API", 8: "Client Framework", 9: "UI Framework", 10: "Components",
    11: "Real-time", 17: "Payments", 21: "User Management", 35: "AI Agents", 48: "Performance"
  };
  
  const layers = finding.affected_layers.map(l => layerNames[l] || `Layer ${l}`);
  return `This issue affects ${layers.join(' → ')} integration flow`;
}

function generateRiskDescription(finding: AuditFinding): string {
  const riskTemplates: Record<string, string> = {
    critical: `Critical risk: ${finding.title} could cause system instability or data loss`,
    high: `High risk: ${finding.title} may significantly impact user experience or business operations`,
    medium: `Medium risk: ${finding.title} could affect specific user workflows`,
    low: `Low risk: ${finding.title} has minimal impact on core functionality`
  };
  
  return riskTemplates[finding.severity] || finding.evidence;
}

function assessImpactLevel(finding: AuditFinding): "critical" | "high" | "medium" | "low" {
  if (finding.score < 50) return "critical";
  if (finding.score < 70) return "high";
  if (finding.score < 85) return "medium";
  return "low";
}

function generateImpactScope(finding: AuditFinding, category: string): string[] {
  const scopes: string[] = [];
  
  if (category === "UI/UX & Accessibility") scopes.push("User Experience", "Accessibility");
  if (category === "Business Logic & Security") scopes.push("Data Integrity", "Security");
  if (category === "API & Performance") scopes.push("Performance", "System Stability");
  if (category === "AI Intelligence") scopes.push("AI Accuracy", "User Trust");
  
  if (finding.severity === "critical" || finding.severity === "high") {
    scopes.push("Brand Reputation");
  }
  
  return scopes.length > 0 ? scopes : ["Technical Quality"];
}

function generateAffectedUsers(finding: AuditFinding): string {
  if (finding.severity === "critical") return "All users platform-wide";
  if (finding.severity === "high") return "Significant portion of users (~40-60%)";
  if (finding.severity === "medium") return "Specific user segment";
  return "Minimal user impact";
}

function generateBusinessImpact(finding: AuditFinding): string {
  if (finding.score < 50) return "Blocks feature launch or causes critical business disruption";
  if (finding.score < 70) return "Reduces user satisfaction and may impact revenue";
  if (finding.score < 85) return "Minor business impact, quality improvement opportunity";
  return "Minimal business impact, technical excellence improvement";
}

function mapSeverityToStoryPriority(severity: string): "blocker" | "critical" | "major" | "minor" {
  const map: Record<string, any> = {
    critical: "blocker",
    high: "critical",
    medium: "major",
    low: "minor"
  };
  return map[severity] || "major";
}

function estimateComplexity(finding: AuditFinding): "high" | "medium" | "low" {
  const factorCount = [
    finding.affected_layers.length > 3,
    finding.file_locations.length > 5,
    finding.dependencies.length > 2,
    finding.technologies.length > 3
  ].filter(Boolean).length;
  
  if (factorCount >= 3) return "high";
  if (factorCount >= 2) return "medium";
  return "low";
}

function generateComplexityFactors(finding: AuditFinding): string[] {
  const factors: string[] = [];
  
  if (finding.affected_layers.length > 3) {
    factors.push(`Multi-layer changes (${finding.affected_layers.length} layers affected)`);
  }
  
  if (finding.dependencies.length > 0) {
    factors.push(`Dependencies on layers: ${finding.dependencies.join(', ')}`);
  }
  
  if (finding.technologies.length > 0) {
    factors.push(`Technologies: ${finding.technologies.join(', ')}`);
  }
  
  return factors;
}

function estimateStoryPoints(finding: AuditFinding): 1 | 2 | 3 | 5 | 8 | 13 | 21 {
  const complexity = estimateComplexity(finding);
  const severity = finding.severity;
  
  if (complexity === "high" && (severity === "critical" || severity === "high")) return 8;
  if (complexity === "high") return 5;
  if (complexity === "medium" && severity === "critical") return 5;
  if (complexity === "medium") return 3;
  if (severity === "critical") return 3;
  return 2;
}

function estimateHours(finding: AuditFinding): number {
  const points = estimateStoryPoints(finding);
  return points * 2; // 2 hours per story point
}

function estimateTasks(finding: AuditFinding): number {
  const points = estimateStoryPoints(finding);
  return Math.max(Math.ceil(points / 2), 2); // At least 2 tasks
}

function generateCodeComplexity(finding: AuditFinding): string {
  const fileCount = finding.file_locations.length;
  if (fileCount === 0) return "No code changes required";
  if (fileCount === 1) return "Single file modification";
  if (fileCount <= 3) return `Refactor ${fileCount} files`;
  return `Refactor ${fileCount}+ files across multiple layers`;
}

function extractComplianceRequirements(finding: AuditFinding): string[] {
  const requirements: string[] = [];
  
  if (finding.affected_layers.includes(54)) requirements.push("WCAG 2.1 AA");
  if (finding.affected_layers.includes(49)) requirements.push("Security Standards");
  if (finding.affected_layers.includes(56)) requirements.push("GDPR", "SOC2");
  
  return requirements;
}

function requiresLegalReview(finding: AuditFinding): boolean {
  return finding.affected_layers.includes(56) || finding.severity === "critical";
}

function hasPrivacyImpact(finding: AuditFinding): boolean {
  return finding.affected_layers.includes(21) || finding.affected_layers.includes(56);
}

function requiresSecurityReview(finding: AuditFinding): boolean {
  return finding.affected_layers.includes(49) || finding.severity === "critical";
}

function generateReviewChecklist(finding: AuditFinding): string[] {
  const checklist: string[] = [];
  
  finding.success_criteria.forEach(criteria => {
    checklist.push(`☐ ${criteria}`);
  });
  
  if (finding.file_locations.length > 0) {
    checklist.push(`☐ Review code changes in ${finding.file_locations.length} file(s)`);
  }
  
  if (finding.expert_required) {
    checklist.push(`☐ Obtain expert review from Agent #${finding.consulting_agents.join(', #')}`);
  }
  
  checklist.push(`☐ Validate against ESA Layer ${finding.affected_layers.join(', ')} standards`);
  
  return checklist;
}

function generateTestCoverage(finding: AuditFinding): string {
  const hasTests = finding.affected_layers.includes(51);
  if (hasTests) return "80% - E2E tests exist";
  return `${Math.max(30, finding.score - 20)}% - Missing comprehensive test coverage`;
}
