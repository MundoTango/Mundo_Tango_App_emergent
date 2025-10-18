/**
 * Phase 0 Task 0.5: User Journey Hook
 * 
 * React hook to access user's current journey state (J1-J4)
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export type JourneyState = 'J1' | 'J2' | 'J3' | 'J4';

export interface JourneyAgent {
  id: string;
  name: string;
  description: string;
  features: string[];
}

export interface JourneyMilestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  progress: number;
}

export interface UserMetrics {
  memoriesCount: number;
  connectionsCount: number;
  eventsOrganized: number;
  eventsAttended: number;
  daysSinceRegistration: number;
  loginCount: number;
  hasUsedAIFeatures: boolean;
}

export interface UserJourney {
  journey: JourneyState;
  agent: JourneyAgent;
  milestones: JourneyMilestone[];
  metrics: UserMetrics;
}

/**
 * Hook to get current user's journey state
 */
export function useUserJourney() {
  const { user } = useAuth();
  
  return useQuery<UserJourney>({
    queryKey: ['/api/journey'],
    enabled: !!user, // Only run if user is logged in
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get journey agent info for a specific state
 */
export function useJourneyInfo(journeyState: JourneyState) {
  return useQuery<JourneyAgent>({
    queryKey: ['/api/journey', journeyState, 'info'],
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (static data)
  });
}

/**
 * Helper to check if user is on a specific journey
 */
export function useIsJourney(targetJourney: JourneyState) {
  const { data } = useUserJourney();
  return data?.journey === targetJourney;
}

/**
 * Helper to get completed milestone percentage
 */
export function useJourneyProgress() {
  const { data } = useUserJourney();
  
  if (!data?.milestones) {
    return 0;
  }
  
  const completedCount = data.milestones.filter(m => m.completed).length;
  return Math.round((completedCount / data.milestones.length) * 100);
}
