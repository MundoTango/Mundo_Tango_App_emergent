/**
 * Tool Validator - MB.MD Phase 3 for Chat System
 * Squad A: Chat & Voice - Oct 27, 2025
 * Validates tool calls BEFORE execution
 */

import { createMBMDLogger } from '../mbmd/Logger';

export interface ValidationResult {
  passed: boolean;
  warnings: string[];
  evidence: string[];
}

export class ToolValidator {
  private logger = createMBMDLogger('tool-validator', undefined);

  async validateBeforeExecution(toolName: string, params: any): Promise<ValidationResult> {
    this.logger.mitigation(`Validating tool: ${toolName}`, params);

    const warnings: string[] = [];
    const evidence: string[] = [];
    let passed = true;

    // 1. Unit test tool with sample data
    const testResult = await this.runToolUnitTest(toolName, params);
    evidence.push(`Unit test: ${testResult.passed ? 'PASSED' : 'FAILED'}`);
    
    if (!testResult.passed) {
      passed = false;
      warnings.push(`Unit test failed: ${testResult.error}`);
    }

    // 2. Check for required permissions
    const hasPermission = await this.checkPermissions(toolName);
    evidence.push(`Permission check: ${hasPermission ? 'GRANTED' : 'DENIED'}`);
    
    if (!hasPermission) {
      passed = false;
      warnings.push(`Permission denied for tool: ${toolName}`);
    }

    // 3. Validate parameters
    const paramsValid = this.validateParams(toolName, params);
    evidence.push(`Parameter validation: ${paramsValid.valid ? 'VALID' : 'INVALID'}`);
    
    if (!paramsValid.valid) {
      passed = false;
      warnings.push(`Invalid parameters: ${paramsValid.error}`);
    }

    // 4. Predict side effects
    const sideEffects = this.analyzeSideEffects(toolName, params);
    if (sideEffects.length > 0) {
      warnings.push(...sideEffects);
      evidence.push(`Side effects detected: ${sideEffects.length}`);
    }

    this.logger.unitTest(`${toolName} validation`, passed, warnings.join('; '));

    return {
      passed,
      warnings,
      evidence
    };
  }

  private async runToolUnitTest(toolName: string, params: any): Promise<{ passed: boolean; error?: string }> {
    // Simplified unit test - in production, this would run actual tests
    try {
      // Test 1: Tool name is valid
      if (!toolName || typeof toolName !== 'string') {
        return { passed: false, error: 'Invalid tool name' };
      }

      // Test 2: Parameters are objects (if provided)
      if (params && typeof params !== 'object') {
        return { passed: false, error: 'Parameters must be an object' };
      }

      // Test 3: No dangerous patterns
      const dangerousPatterns = ['rm -rf', 'DROP TABLE', 'DELETE FROM', 'sudo'];
      const paramsStr = JSON.stringify(params);
      for (const pattern of dangerousPatterns) {
        if (paramsStr.includes(pattern)) {
          return { passed: false, error: `Dangerous pattern detected: ${pattern}` };
        }
      }

      return { passed: true };
    } catch (error: any) {
      return { passed: false, error: error.message };
    }
  }

  private async checkPermissions(toolName: string): Promise<boolean> {
    // In production, this would check user roles and permissions
    // For now, allow most tools
    const restrictedTools = ['delete_user', 'drop_table', 'execute_shell'];
    return !restrictedTools.includes(toolName);
  }

  private validateParams(toolName: string, params: any): { valid: boolean; error?: string } {
    // Tool-specific parameter validation
    switch (toolName) {
      case 'get_recent_memories':
        if (params.limit && (params.limit < 1 || params.limit > 100)) {
          return { valid: false, error: 'Limit must be between 1 and 100' };
        }
        break;

      case 'search_memories':
        if (!params.query || typeof params.query !== 'string') {
          return { valid: false, error: 'Query must be a non-empty string' };
        }
        break;

      case 'read_file':
        if (!params.filePath || typeof params.filePath !== 'string') {
          return { valid: false, error: 'File path is required' };
        }
        // Security: Prevent path traversal
        if (params.filePath.includes('..') || params.filePath.startsWith('/')) {
          return { valid: false, error: 'Path traversal not allowed' };
        }
        break;

      case 'write_file':
        if (!params.filePath || !params.content) {
          return { valid: false, error: 'File path and content are required' };
        }
        break;
    }

    return { valid: true };
  }

  private analyzeSideEffects(toolName: string, params: any): string[] {
    const sideEffects: string[] = [];

    // Write operations have side effects
    if (toolName.includes('write') || toolName.includes('create') || toolName.includes('update')) {
      sideEffects.push('This operation will modify data');
    }

    // Delete operations are destructive
    if (toolName.includes('delete') || toolName.includes('remove')) {
      sideEffects.push('⚠️ DESTRUCTIVE: This operation cannot be undone');
    }

    // File operations affect filesystem
    if (toolName.includes('file')) {
      sideEffects.push('This operation affects the filesystem');
    }

    // Database operations
    if (toolName.includes('sql') || toolName.includes('query')) {
      sideEffects.push('This operation accesses the database');
    }

    return sideEffects;
  }
}
