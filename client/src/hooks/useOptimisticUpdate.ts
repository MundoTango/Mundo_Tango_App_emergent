// TRACK 10: Real-time Optimistic Updates Hook
import { useQueryClient } from '@tanstack/react-query';

export function useOptimisticUpdate<T>(queryKey: string[]) {
  const queryClient = useQueryClient();

  const optimisticUpdate = (
    updater: (old: T | undefined) => T,
    rollback?: (old: T | undefined) => T
  ) => {
    const previousData = queryClient.getQueryData<T>(queryKey);
    
    // Optimistically update
    queryClient.setQueryData<T>(queryKey, updater);
    
    return {
      previousData,
      rollback: () => {
        if (rollback) {
          queryClient.setQueryData<T>(queryKey, rollback);
        } else if (previousData) {
          queryClient.setQueryData<T>(queryKey, previousData);
        }
      }
    };
  };

  return { optimisticUpdate };
}
