/**
 * TRACK E: Conversation Search Hook
 * MB.MD SIMULTANEOUS BUILD - Oct 23, 2025
 * Agent #128 (Hooks)
 * 
 * Search state management for conversations
 */

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface SearchFilters {
  query: string;
  projectId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  models?: string[];
  hasTools?: boolean;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface SearchResult {
  id: number;
  projectId: number;
  projectName: string;
  messageId?: number;
  voiceTurnId?: number;
  type: 'text' | 'voice';
  content: string;
  snippet: string; // Highlighted search match
  role: 'user' | 'assistant';
  model?: string;
  timestamp: string;
  relevanceScore: number;
}

export function useConversationSearch(isOpen: boolean) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
  });

  // Fetch search results
  const { data: results, isLoading, error } = useQuery<SearchResult[]>({
    queryKey: ['/api/conversations/search', filters],
    enabled: filters.query.length >= 3 && isOpen, // Only search when modal is open and query is long enough
  });

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ query: '' });
  }, []);

  const setQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, query }));
  }, []);

  return {
    filters,
    results: results || [],
    isLoading,
    error,
    updateFilter,
    clearFilters,
    setQuery,
    hasResults: (results?.length || 0) > 0,
  };
}
