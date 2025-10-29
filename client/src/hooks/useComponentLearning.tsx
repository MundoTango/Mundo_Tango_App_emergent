/**
 * MB.MD Component Learning Hook
 * Enables components to learn from history and colleagues
 * 
 * Usage:
 * const { learningHistory, learnFromColleagues, attemptAutoFix } = useComponentLearning('my-component');
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface LearningRecord {
  id: number;
  componentId: string;
  issueType: string;
  issue: string;
  solution: string;
  success: boolean;
  confidence: number;
  learnedFrom: string | null;
  createdAt: string;
}

interface ColleagueSolution {
  componentId: string;
  solution: string;
  successRate: number;
  timesUsed: number;
}

interface AutoFixResult {
  success: boolean;
  solution: string;
  strategy: string;
  confidence: number;
  requiresRollback: boolean;
}

export function useComponentLearning(componentId: string) {
  const queryClient = useQueryClient();

  // Fetch learning history for this component
  const { data: learningHistory, isLoading: isLoadingHistory } = useQuery<LearningRecord[]>({
    queryKey: [`/api/component-learning/${componentId}/history`],
    queryFn: async () => {
      const response = await fetch(
        `/api/component-learning/${componentId}/history`,
        { credentials: 'include' }
      );
      if (!response.ok) {
        // If endpoint doesn't exist yet, return empty array
        if (response.status === 404) return [];
        throw new Error('Failed to fetch learning history');
      }
      const result = await response.json();
      return result.data || [];
    },
    retry: false
  });

  // Learn from colleagues who solved similar issues
  const learnFromColleagues = useMutation<ColleagueSolution[], Error, string>({
    mutationFn: async (issueType: string) => {
      console.log(`🤝 [${componentId}] Learning from colleagues about: ${issueType}`);
      
      const response = await fetch('/api/component-learning/colleagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ componentId, issueType })
      });

      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error('Failed to learn from colleagues');
      }

      const result = await response.json();
      console.log(`✅ [${componentId}] Found ${result.data?.length || 0} colleague solutions`);
      return result.data || [];
    }
  });

  // Attempt auto-fix using learned patterns
  const attemptAutoFix = useMutation<AutoFixResult, Error, any>({
    mutationFn: async (issue: any) => {
      console.log(`🔧 [${componentId}] Attempting auto-fix for:`, issue);

      const response = await fetch('/api/component-learning/auto-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ componentId, issue })
      });

      if (!response.ok) {
        throw new Error('Auto-fix failed');
      }

      const result = await response.json();
      console.log(`✅ [${componentId}] Auto-fix result:`, result.data);
      return result.data;
    },
    onSuccess: () => {
      // Refresh learning history after successful fix
      queryClient.invalidateQueries({ 
        queryKey: [`/api/component-learning/${componentId}/history`] 
      });
    }
  });

  // Record a new learning
  const recordLearning = useMutation({
    mutationFn: async (learning: {
      issue: string;
      solution: string;
      success: boolean;
      issueType?: string;
      confidence?: number;
      learnedFrom?: string;
    }) => {
      console.log(`📝 [${componentId}] Recording learning:`, learning);

      const response = await fetch('/api/component-learning/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          componentId, 
          issueType: learning.issueType || 'general',
          confidence: learning.confidence || 80,
          ...learning 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to record learning');
      }

      const result = await response.json();
      console.log(`✅ [${componentId}] Learning recorded successfully`);
      return result.data;
    },
    onSuccess: () => {
      // Refresh learning history and component health
      queryClient.invalidateQueries({ 
        queryKey: [`/api/component-learning/${componentId}/history`] 
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/agent-registry/${componentId}`]
      });
    }
  });

  // Get component's learning statistics
  const learningStats = {
    totalLearnings: learningHistory?.length || 0,
    successRate: learningHistory
      ? (learningHistory.filter(l => l.success).length / learningHistory.length) * 100
      : 0,
    avgConfidence: learningHistory
      ? learningHistory.reduce((sum, l) => sum + l.confidence, 0) / learningHistory.length
      : 0
  };

  return {
    learningHistory,
    isLoadingHistory,
    learnFromColleagues,
    attemptAutoFix,
    recordLearning,
    learningStats
  };
}
