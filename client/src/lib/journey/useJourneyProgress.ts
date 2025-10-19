/**
 * Journey Progress React Query Hooks
 * MB.MD Phase 4: Deployment - Oct 19, 2025
 * 
 * Custom hooks for Journey Agent API integration
 * Provides journey progress tracking, step completion, and feature unlocks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// ============ TYPES ============

export interface JourneyProgress {
  id: number;
  userId: number;
  journeyId: 'J1' | 'J2' | 'J3' | 'J4' | 'J5';
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  skippedSteps: number[];
  metadata: Record<string, unknown>;
  startedAt: Date;
  completedAt: Date | null;
  percentage: number;
}

export interface NextAction {
  page: string;
  action: string;
  tooltip: string;
}

export interface Achievement {
  id: number;
  userId: number;
  achievementId: string;
  journeyId: string | null;
  earnedAt: Date;
}

export interface FeatureUnlock {
  id: number;
  userId: number;
  featureId: string;
  unlockedAt: Date;
}

// ============ HOOKS ============

/**
 * Get user's current journey progress
 * SECURITY: Uses authenticated user from session, no userId parameter needed
 */
export function useJourneyProgress(journeyId?: string) {
  return useQuery<JourneyProgress | null>({
    queryKey: journeyId ? ['/api/journeys/progress', journeyId] : ['/api/journeys/progress']
  });
}

/**
 * Get next suggested action for user
 * SECURITY: Uses authenticated user from session, no userId parameter needed
 */
export function useNextAction() {
  return useQuery<NextAction | null>({
    queryKey: ['/api/journeys/next']
  });
}

/**
 * Start a new journey
 */
export function useStartJourney() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { journeyId: string }) => {
      return apiRequest(`/api/journeys/start`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate journey progress queries
      queryClient.invalidateQueries({ queryKey: ['/api/journeys'] });
    }
  });
}

/**
 * Complete a journey step
 * SECURITY: Uses authenticated user from session
 */
export function useCompleteStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { step: number; metadata?: Record<string, unknown> }) => {
      return apiRequest(`/api/journeys/complete/${data.step}`, {
        method: 'PUT',
        body: JSON.stringify({ metadata: data.metadata || {} })
      });
    },
    onSuccess: () => {
      // Invalidate journey progress and next action queries
      queryClient.invalidateQueries({ queryKey: ['/api/journeys'] });
    }
  });
}

/**
 * Skip a journey step
 * SECURITY: Uses authenticated user from session
 */
export function useSkipStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (step: number) => {
      return apiRequest(`/api/journeys/skip/${step}`, {
        method: 'PUT'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journeys'] });
    }
  });
}

/**
 * Get user achievements
 * SECURITY: Uses authenticated user from session
 */
export function useAchievements() {
  return useQuery<Achievement[]>({
    queryKey: ['/api/journeys/achievements']
  });
}

/**
 * Award achievement to user
 * SECURITY: Uses authenticated user from session
 */
export function useAwardAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { achievementId: string; journeyId?: string }) => {
      return apiRequest(`/api/journeys/achievements`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journeys/achievements'] });
    }
  });
}

/**
 * Check if user has access to a feature
 * SECURITY: Uses authenticated user from session
 */
export function useFeatureAccess(featureId: string) {
  return useQuery<{ hasAccess: boolean }>({
    queryKey: ['/api/journeys/features', featureId],
    enabled: !!featureId
  });
}

/**
 * Unlock a feature for user
 * SECURITY: Uses authenticated user from session
 */
export function useUnlockFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (featureId: string) => {
      return apiRequest(`/api/journeys/features/${featureId}/unlock`, {
        method: 'POST'
      });
    },
    onSuccess: (_, featureId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/journeys/features', featureId] });
    }
  });
}

/**
 * Get journey analytics (admin only)
 */
export function useJourneyAnalytics(journeyId?: string, period: string = '7d') {
  return useQuery({
    queryKey: ['/api/journeys/analytics', journeyId, period],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (journeyId) params.set('journeyId', journeyId);
      params.set('period', period);
      
      const response = await fetch(`/api/journeys/analytics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });
}
