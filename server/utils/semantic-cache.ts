/**
 * Semantic Cache Implementation with LanceDB
 * MB.MD Phase 4: Industry-standard semantic caching (30-60% cost reduction)
 * 
 * Research Source: LanceDB documentation, contextual retrieval patterns
 */

import { connect, Table } from 'vectordb';
import { generateEmbedding, cosineSimilarity } from './embedding-service';
import type { 
  SemanticCacheEntry, 
  CacheLookupResult, 
  CacheStats,
  SemanticCacheConfig
} from '@shared/semantic-cache-types';
import { defaultCacheConfig } from '@shared/semantic-cache-types';

class SemanticCache {
  private db: any;
  private table: Table | null = null;
  private config: SemanticCacheConfig;
  private stats = {
    total_queries: 0,
    cache_hits: 0,
    cache_misses: 0,
    total_cost_saved: 0,
    similarity_scores: [] as number[]
  };

  constructor(config: Partial<SemanticCacheConfig> = {}) {
    this.config = { ...defaultCacheConfig, ...config } as SemanticCacheConfig;
  }

  /**
   * Initialize LanceDB connection and table
   */
  async initialize(): Promise<void> {
    try {
      // Connect to LanceDB (embedded mode)
      this.db = await connect('./lancedb_cache');

      // Check if table exists
      const tableNames = await this.db.tableNames();
      
      if (tableNames.includes('semantic_cache')) {
        this.table = await this.db.openTable('semantic_cache');
        console.log('✓ Semantic cache table loaded');
      } else {
        // Create new table with schema
        const sampleData = [{
          query_text: 'initialization',
          vector: Array(1536).fill(0),
          response: 'init',
          model: 'init',
          cost: 0,
          timestamp: new Date().toISOString(),
          metadata: JSON.stringify({ complexity: 'low' })
        }];

        this.table = await this.db.createTable('semantic_cache', sampleData);
        console.log('✓ Semantic cache table created');
      }

      // Create vector index for fast similarity search
      await this.createIndexIfNeeded();
    } catch (error: any) {
      console.error('Semantic cache initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Create vector index for performance
   */
  private async createIndexIfNeeded(): Promise<void> {
    try {
      if (this.table) {
        // Create IVF_PQ index for fast approximate search
        await this.table.createIndex('vector');
        console.log('✓ Vector index created');
      }
    } catch (error: any) {
      // Index may already exist
      if (!error.message.includes('already exists')) {
        console.warn('Index creation warning:', error.message);
      }
    }
  }

  /**
   * Look up semantically similar query in cache
   */
  async lookup(query: string): Promise<CacheLookupResult> {
    this.stats.total_queries++;

    if (!this.table) {
      await this.initialize();
    }

    try {
      // Generate embedding for query
      const queryEmbedding = await generateEmbedding(query);

      // Vector similarity search (cosine distance)
      const results = await this.table!
        .search(queryEmbedding)
        .limit(1)
        .execute();

      if (results.length === 0) {
        this.stats.cache_misses++;
        return { hit: false };
      }

      const match = results[0];
      const distance = match._distance || 0;
      const similarity = 1 - distance;  // Convert distance to similarity

      // Check if similarity meets threshold
      if (similarity >= this.config.similarity_threshold) {
        this.stats.cache_hits++;
        this.stats.total_cost_saved += match.cost || 0;
        this.stats.similarity_scores.push(similarity);

        console.log(`✓ Cache hit! Similarity: ${(similarity * 100).toFixed(1)}%`);

        // Update hit count
        await this.updateHitCount(match.query_text);

        return {
          hit: true,
          response: match.response,
          similarity,
          model: match.model,
          original_query: match.query_text,
          cost_saved: match.cost || 0
        };
      }

      this.stats.cache_misses++;
      return { hit: false };

    } catch (error: any) {
      console.error('Cache lookup failed:', error.message);
      this.stats.cache_misses++;
      return { hit: false };
    }
  }

  /**
   * Add entry to cache
   */
  async add(entry: Omit<SemanticCacheEntry, 'vector'>): Promise<void> {
    if (!this.table) {
      await this.initialize();
    }

    try {
      // Generate embedding
      const vector = await generateEmbedding(entry.query_text);

      const cacheEntry = {
        query_text: entry.query_text,
        vector,
        response: entry.response,
        model: entry.model,
        cost: entry.cost,
        timestamp: entry.timestamp,
        metadata: JSON.stringify(entry.metadata)
      };

      await this.table!.add([cacheEntry]);
      console.log('✓ Added to semantic cache');

      // Check cache size and evict old entries if needed
      await this.evictOldEntriesIfNeeded();

    } catch (error: any) {
      console.error('Failed to add to cache:', error.message);
    }
  }

  /**
   * Update hit count for analytics
   */
  private async updateHitCount(query_text: string): Promise<void> {
    try {
      // This is a simplified version - in production, use proper update
      // LanceDB doesn't support direct updates, so we track separately
      // For now, just log - can be enhanced with a separate hits table
    } catch (error: any) {
      // Non-critical, just log
      console.debug('Hit count update skipped:', error.message);
    }
  }

  /**
   * Evict old entries when cache is full
   */
  private async evictOldEntriesIfNeeded(): Promise<void> {
    try {
      const count = await this.table!.countRows();
      
      if (count > this.config.max_cache_size) {
        // LanceDB doesn't support DELETE yet in all versions
        // For production, implement TTL-based cleanup or rebuild table
        console.warn(`Cache size (${count}) exceeds limit (${this.config.max_cache_size})`);
      }
    } catch (error: any) {
      console.debug('Eviction check skipped:', error.message);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const avgSimilarity = this.stats.similarity_scores.length > 0
      ? this.stats.similarity_scores.reduce((a, b) => a + b, 0) / this.stats.similarity_scores.length
      : 0;

    return {
      total_queries: this.stats.total_queries,
      cache_hits: this.stats.cache_hits,
      cache_misses: this.stats.cache_misses,
      hit_rate: this.stats.total_queries > 0 
        ? this.stats.cache_hits / this.stats.total_queries 
        : 0,
      total_cost_saved: this.stats.total_cost_saved,
      average_similarity: avgSimilarity
    };
  }

  /**
   * Clear all cache stats (for testing)
   */
  resetStats(): void {
    this.stats = {
      total_queries: 0,
      cache_hits: 0,
      cache_misses: 0,
      total_cost_saved: 0,
      similarity_scores: []
    };
  }
}

// Singleton instance
let cacheInstance: SemanticCache | null = null;

export function getSemanticCache(config?: Partial<SemanticCacheConfig>): SemanticCache {
  if (!cacheInstance) {
    cacheInstance = new SemanticCache(config);
  }
  return cacheInstance;
}

export { SemanticCache };
