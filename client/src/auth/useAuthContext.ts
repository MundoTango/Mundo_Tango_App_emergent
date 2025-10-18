// MT ESA LIFE CEO - Auth Context Hook (Stub - redirects to main useAuth)
// This stub exists for backward compatibility with archived components

import { useAuth } from '@/hooks/useAuth';

// Re-export the main auth hook for components expecting useAuthContext
export function useAuthContext() {
  return useAuth();
}

export default useAuthContext;
