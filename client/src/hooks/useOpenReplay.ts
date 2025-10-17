import { useCallback } from 'react';
import { openReplayEnhanced, trackSessionEvent, handleSessionError } from '@/lib/openreplay-enhanced';

export function useOpenReplay() {
  const trackInteraction = useCallback((element: string, action: string, props?: any) => {
    trackSessionEvent('user_interaction', {
      element,
      action,
      ...props
    });
  }, []);
  
  const trackError = useCallback((error: Error | string, context?: any) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    handleSessionError(errorObj, context);
  }, []);
  
  const startTransaction = useCallback((name: string) => {
    return openReplayEnhanced.startTransaction(name);
  }, []);
  
  const setUserContext = useCallback((key: string, value: any) => {
    openReplayEnhanced.setMetadata(key, value);
  }, []);
  
  return {
    trackInteraction,
    trackError,
    startTransaction,
    setUserContext,
    isRecording: openReplayEnhanced.isActive()
  };
}