import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

/**
 * Hook for Autonomous Mr Blue API integration
 * Provides client functions for all 12 autonomous endpoints
 */

// Phase 2: Code Reading APIs
export function useReadFile() {
  return useMutation({
    mutationFn: async (filePath: string) => {
      return apiRequest('/api/mrblue/autonomous/read-file', {
        method: 'POST',
        body: JSON.stringify({ filePath })
      });
    }
  });
}

export function useSearchCodebase() {
  return useMutation({
    mutationFn: async ({ query, filePattern }: { query: string; filePattern?: string }) => {
      return apiRequest('/api/mrblue/autonomous/search-codebase', {
        method: 'POST',
        body: JSON.stringify({ query, filePattern })
      });
    }
  });
}

export function useAnalyzeComponent() {
  return useMutation({
    mutationFn: async ({ filePath, componentName }: { filePath: string; componentName?: string }) => {
      return apiRequest('/api/mrblue/autonomous/analyze-component', {
        method: 'POST',
        body: JSON.stringify({ filePath, componentName })
      });
    }
  });
}

// Phase 3: Code Writing APIs
export function useWriteFile() {
  return useMutation({
    mutationFn: async ({ filePath, content }: { filePath: string; content: string }) => {
      return apiRequest('/api/mrblue/autonomous/write-file', {
        method: 'POST',
        body: JSON.stringify({ filePath, content })
      });
    }
  });
}

export function usePreviewDiff() {
  return useMutation({
    mutationFn: async ({ filePath, newContent }: { filePath: string; newContent: string }) => {
      return apiRequest('/api/mrblue/autonomous/preview-diff', {
        method: 'POST',
        body: JSON.stringify({ filePath, newContent })
      });
    }
  });
}

export function useBatchWrite() {
  return useMutation({
    mutationFn: async (changes: Array<{ filePath: string; content: string }>) => {
      return apiRequest('/api/mrblue/autonomous/batch-write', {
        method: 'POST',
        body: JSON.stringify({ changes })
      });
    }
  });
}

// Phase 4: Testing APIs
export function useExecuteCommand() {
  return useMutation({
    mutationFn: async ({ command, timeout }: { command: string; timeout?: number }) => {
      return apiRequest('/api/mrblue/autonomous/execute-command', {
        method: 'POST',
        body: JSON.stringify({ command, timeout })
      });
    }
  });
}

export function useTestChange() {
  return useMutation({
    mutationFn: async ({ url, actionScript }: { url?: string; actionScript?: string }) => {
      return apiRequest('/api/mrblue/autonomous/test-change', {
        method: 'POST',
        body: JSON.stringify({ url, actionScript })
      });
    }
  });
}

export function useAnalyzeError() {
  return useMutation({
    mutationFn: async ({ errorMessage, context }: { errorMessage: string; context?: string }) => {
      return apiRequest('/api/mrblue/autonomous/analyze-error', {
        method: 'POST',
        body: JSON.stringify({ errorMessage, context })
      });
    }
  });
}

// Phase 5: Safety APIs
export function useCreateCheckpoint() {
  return useMutation({
    mutationFn: async ({ description, includeDatabase }: { description: string; includeDatabase?: boolean }) => {
      return apiRequest('/api/mrblue/autonomous/create-checkpoint', {
        method: 'POST',
        body: JSON.stringify({ description, includeDatabase })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/autonomous/checkpoints'] });
    }
  });
}

export function useRollback() {
  return useMutation({
    mutationFn: async ({ checkpointId, includeDatabase }: { checkpointId: string; includeDatabase?: boolean }) => {
      return apiRequest('/api/mrblue/autonomous/rollback', {
        method: 'POST',
        body: JSON.stringify({ checkpointId, includeDatabase })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/autonomous/checkpoints'] });
    }
  });
}

export function useRequestApproval() {
  return useMutation({
    mutationFn: async ({ 
      action, 
      description, 
      risk, 
      affectedFiles 
    }: { 
      action: string; 
      description: string; 
      risk: 'low' | 'medium' | 'high'; 
      affectedFiles: string[] 
    }) => {
      return apiRequest('/api/mrblue/autonomous/request-approval', {
        method: 'POST',
        body: JSON.stringify({ action, description, risk, affectedFiles })
      });
    }
  });
}

// Phase 6: Orchestration Engine
export function useAutonomousExecute() {
  return useMutation({
    mutationFn: async ({ 
      task, 
      maxIterations, 
      requireApproval 
    }: { 
      task: string; 
      maxIterations?: number; 
      requireApproval?: boolean 
    }) => {
      return apiRequest('/api/mrblue/autonomous/execute', {
        method: 'POST',
        body: JSON.stringify({ task, maxIterations, requireApproval })
      });
    }
  });
}

// List checkpoints
export function useCheckpoints() {
  return useQuery({
    queryKey: ['/api/mrblue/autonomous/checkpoints'],
    enabled: false // Only fetch when explicitly requested
  });
}

/**
 * Main autonomous mode hook
 * Provides all autonomous capabilities in one place
 */
export function useAutonomousMode() {
  return {
    // Code Reading
    readFile: useReadFile(),
    searchCodebase: useSearchCodebase(),
    analyzeComponent: useAnalyzeComponent(),
    
    // Code Writing
    writeFile: useWriteFile(),
    previewDiff: usePreviewDiff(),
    batchWrite: useBatchWrite(),
    
    // Testing
    executeCommand: useExecuteCommand(),
    testChange: useTestChange(),
    analyzeError: useAnalyzeError(),
    
    // Safety
    createCheckpoint: useCreateCheckpoint(),
    rollback: useRollback(),
    requestApproval: useRequestApproval(),
    
    // Orchestration
    autonomousExecute: useAutonomousExecute(),
    
    // Queries
    checkpoints: useCheckpoints()
  };
}
