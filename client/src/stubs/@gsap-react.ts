/**
 * Stub for @gsap/react - Provides minimal GSAP React hooks
 * This stub allows the app to run without the actual @gsap/react package
 */

import { useEffect, useRef, MutableRefObject } from 'react';

export interface GSAPContextConfig {
  scope?: string | Element | MutableRefObject<any>;
  dependencies?: any[];
}

export const useGSAP = (
  callback: (context: any, contextSafe: (fn: Function) => Function) => void,
  config?: GSAPContextConfig
) => {
  const contextRef = useRef<any>(null);
  
  useEffect(() => {
    if (!contextRef.current) {
      contextRef.current = {
        revert: () => {},
        kill: () => {},
      };
    }
    
    const contextSafe = (fn: Function) => fn;
    callback(contextRef.current, contextSafe);
    
    return () => {
      if (contextRef.current) {
        contextRef.current.revert();
      }
    };
  }, config?.dependencies || []);
  
  return contextRef;
};

export default useGSAP;
