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
  request: string;
  tasks: Task[];
  codeChanges: CodeChange[];
  testResults: TestResult[];
  currentPhase: 'planning' | 'editing' | 'verifying' | 'testing' | 'complete';
  retryCount: number;
  errors: string[];
}

/**
 * Execute vibe coding workflow
 * Natural language request → working code
 */
export async function executeVibeCoding(
  request: string,
  visualEditorContext?: any
): Promise<VibeResponse> {
  const response = await apiRequest('/api/vibe/execute', {
    method: 'POST',
    body: {
      request,
      visualEditorContext
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
  const response = await apiRequest('/api/vibe/edit-file', {
    method: 'POST',
    body: {
      filePath,
      diff,
      type
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
