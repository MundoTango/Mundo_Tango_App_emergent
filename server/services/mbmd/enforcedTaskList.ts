/**
 * ENFORCED TASK LIST - Tool Pre-Conditions
 * Created: October 28, 2025
 * Purpose: Wrapper around task creation that requires MB.MD evidence BEFORE creating tasks
 * 
 * Enforces RULE 1: VERIFY BEFORE BUILD
 */

import { ProtocolEnforcer, type DocumentationEvidence } from './ProtocolEnforcer';

export interface EnforcedTaskCreationParams {
  taskDescription: string;
  documentationEvidence: DocumentationEvidence;
  userId: number;
}

export class EnforcedTaskList {
  private enforcer: ProtocolEnforcer;

  constructor() {
    this.enforcer = new ProtocolEnforcer();
  }

  /**
   * CREATE TASK (with pre-conditions enforced)
   * Requires documentation evidence before allowing task creation
   */
  async createTask(params: EnforcedTaskCreationParams): Promise<{ success: boolean; taskId?: string; errors?: string[] }> {
    // RULE 1: Validate documentation evidence
    const validation = this.enforcer.validateDocumentationEvidence(params.documentationEvidence);

    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    // RULE 2: Validate integration points
    const integrationValidation = this.enforcer.validateIntegration(params.documentationEvidence.integration_points_mapped);

    if (!integrationValidation.valid) {
      return {
        success: false,
        errors: integrationValidation.errors
      };
    }

    // All validations passed - create task
    const taskId = `task-${Date.now()}`;
    
    console.log(`✅ [EnforcedTaskList] Task created: ${taskId}`);
    console.log(`   Docs read: ${params.documentationEvidence.docs_read.join(', ')}`);
    console.log(`   Integration points: ${params.documentationEvidence.integration_points_mapped.length}`);
    console.log(`   Requirements: ${params.documentationEvidence.requirements_summary.substring(0, 100)}...`);

    return {
      success: true,
      taskId
    };
  }

  /**
   * COMPLETE TASK (with evidence required)
   * Wrapper that enforces all MB.MD rules before marking complete
   */
  async completeTask(taskId: string, evidence: any): Promise<{ success: boolean; errors?: string[] }> {
    const validation = await this.enforcer.validateTaskCompletion(evidence);

    if (!validation.passed) {
      return {
        success: false,
        errors: [validation.feedback]
      };
    }

    console.log(`✅ [EnforcedTaskList] Task ${taskId} completed successfully`);
    return { success: true };
  }
}

/**
 * EXAMPLE USAGE
 * 
 * const taskList = new EnforcedTaskList();
 * 
 * // This will FAIL (no docs read)
 * await taskList.createTask({
 *   taskDescription: 'Build a feature',
 *   documentationEvidence: {
 *     docs_read: [], // ❌ EMPTY
 *     verification_checklist_completed: false,
 *     integration_points_mapped: [],
 *     requirements_summary: ''
 *   },
 *   userId: 1
 * });
 * // Error: "RULE 1 VIOLATION: No documentation read..."
 * 
 * // This will SUCCEED
 * await taskList.createTask({
 *   taskDescription: 'Add voice chat button',
 *   documentationEvidence: {
 *     docs_read: ['docs/VOICE_INTEGRATION.md', 'client/src/components/ChatInterface.tsx'],
 *     verification_checklist_completed: true,
 *     integration_points_mapped: [
 *       {
 *         component: 'VoiceChatButton',
 *         parent: 'ChatInterface',
 *         imported: true,
 *         rendered: true,
 *         props_wired: true
 *       }
 *     ],
 *     requirements_summary: 'Add a voice chat button to ChatInterface that triggers the Unified Voice Modal...'
 *   },
 *   userId: 1
 * });
 */
