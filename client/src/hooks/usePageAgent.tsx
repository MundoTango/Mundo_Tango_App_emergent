import { useContext } from 'react';
import { PageAgentContext } from '@/contexts/PageAgentContext';

export function usePageAgent() {
  const context = useContext(PageAgentContext);
  
  if (!context) {
    throw new Error('usePageAgent must be used within a PageAgentProvider');
  }
  
  return context;
}
