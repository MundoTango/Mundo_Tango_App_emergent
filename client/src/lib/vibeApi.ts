/**
 * VIBE CODING API CLIENT
 * MB.MD SIMULTANEOUS - Agent #8: Integration Specialist
 * 
 * Frontend API client for vibe coding system
 * Provides executeVibeCoding() for natural language → code
 * 
 * Created: October 23, 2025
 */

import { apiRequest } from './queryClient';

export interface VibeRequest {
  request: string;
  visualEditorContext?: {
    selectedElement?: any;
    previewPath?: string;
  };
  // 🎯 MB.MD PHASE 1 (Oct 28): Execution mode at TOP LEVEL (matches backend)
  executionMode?: 'plan' | 'build';
}

export interface Task {
  id: string;
  description: string;
  filesPaths: string[];
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface CodeChange {
  taskId: string;
  filePath: string;
  diff: string;
  type: 'unified_diff' | 'search_replace' | 'new_file';
  status: 'pending' | 'applied' | 'failed';
  error?: string;
}

export interface TestResult {
  passed: boolean;
  failures: string[];
  screenshots: string[];
  retryCount: number;
}

export interface VibeResponse {
  status: 'planning' | 'editing' | 'verifying' | 'testing' | 'complete' | 'failed' | 'needs_clarification';
  request?: string;
  tasks: Task[];
  codeChanges: CodeChange[];
  testResults?: TestResult;
  errors: string[];
  needsClarification?: boolean;
  clarificationQuestion?: string;
}

/**
 * Execute vibe coding workflow
 * Natural language request → working code
 * 
 * 🎯 MB.MD PHASE 1 (Oct 28): Fixed payload to match unified endpoint
 */
export async function executeVibeCoding(
  conversationId: number,
  message: string,
  options?: {
    selectedElement?: any;
    previewPath?: string;
    executionMode?: 'plan' | 'build';
    model?: string;
  }
): Promise<VibeResponse> {
  const response = await apiRequest('/api/mrblue/unified', {
    method: 'POST',
    body: {
      conversationId,
      message,
      selectedElement: options?.selectedElement,
      previewPath: options?.previewPath || '/',
      executionMode: options?.executionMode || 'build',
      model: options?.model || 'claude-sonnet-4'
    }
  });

  if (!response.ok) {
    throw new Error(`Vibe coding failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Apply a code change to a file
 */
export async function applyCodeChange(
  filePath: string,
  diff: string,
  type: 'unified_diff' | 'search_replace' = 'unified_diff'
): Promise<{ success: boolean; message?: string; error?: string }> {
  // 🚨 MB.MD CRITICAL FIX (Oct 28): Correct endpoint is /api/mrblue/autonomous/write-file
  // Previous endpoint /api/vibe/edit-file didn't exist → 404 errors → NO files were ever modified!
  // This was causing ALL "change button color" requests to fail silently
  const response = await apiRequest('/api/mrblue/autonomous/write-file', {
    method: 'POST',
    body: {
      filePath,
      content: diff,  // Backend expects "content" not "diffContent"
      validate: true,
      backup: true
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to apply change: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Generate repository map
 */
export async function generateRepositoryMap(
  focusFiles?: string[]
): Promise<{ success: boolean; map?: string; error?: string }> {
  const response = await apiRequest('/api/vibe/map-repository', {
    method: 'POST',
    body: {
      focusFiles
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to generate map: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check vibe coding health
 */
export async function checkVibeHealth(): Promise<{
  status: string;
  services: Record<string, string>;
}> {
  const response = await apiRequest('/api/vibe/health');

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }

  return response.json();
}
