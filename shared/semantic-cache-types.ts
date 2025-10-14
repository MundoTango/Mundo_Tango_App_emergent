/**
 * Semantic Cache Type Definitions
 * MB.MD Phase 4: Industry-standard semantic caching with LanceDB
 */

import { z } from 'zod';

// Cache entry stored in LanceDB
export interface SemanticCacheEntry {
  query_text: string;
  vector: number[];  // Embedding from OpenAI
  response: string;
  model: string;
  cost: number;
  timestamp: string;
  metadata: {
    complexity: 'low' | 'medium' | 'high';
    user_id?: number;
    hit_count?: number;
  };
}

// Cache lookup result
export interface CacheLookupResult {
  hit: boolean;
  response?: string;
  similarity?: number;
  model?: string;
  original_query?: string;
  cost_saved?: number;
}

// Cache statistics
export interface CacheStats {
  total_queries: number;
  cache_hits: number;
  cache_misses: number;
  hit_rate: number;
  total_cost_saved: number;
  average_similarity: number;
}

// Configuration
export interface SemanticCacheConfig {
  similarity_threshold: number;  // 0.85 = 85% similarity required
  embedding_model: string;        // 'text-embedding-3-small'
  max_cache_size: number;         // Maximum entries
  ttl_hours: number;              // Time to live
}

export const defaultCacheConfig: SemanticCacheConfig = {
  similarity_threshold: 0.85,
  embedding_model: 'text-embedding-3-small',
  max_cache_size: 10000,
  ttl_hours: 24
};
