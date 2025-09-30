/**
 * ESA Layer 15: Search & Discovery Service
 * Elasticsearch with Fuse.js fallback for AI-powered fuzzy search
 */

import { Client } from '@elastic/elasticsearch';
import Fuse from 'fuse.js';
import { db } from '../db';
import { users, posts, events, groups, userProfiles as userProfilesTable } from '../../shared/schema';
import { eq, desc, sql } from 'drizzle-orm';

export type SearchType = 'users' | 'posts' | 'events' | 'communities' | 'cities';
export type SearchOptions = {
  limit?: number;
  offset?: number;
  filters?: Record<string, any>;
  fuzzy?: boolean;
  language?: 'en' | 'es';
};

interface SearchDocument {
  id: string;
  type: SearchType;
  title?: string;
  content?: string;
  name?: string;
  description?: string;
  tags?: string[];
  location?: string;
  date?: Date;
  userId?: number;
  score?: number;
  [key: string]: any;
}

// Synonyms mapping for tango-related terms
const TANGO_SYNONYMS = {
  'tango': ['dance', 'milonga', 'vals', 'cortina'],
  'dance': ['tango', 'baile', 'danza'],
  'milonga': ['tango', 'social', 'practica'],
  'lesson': ['class', 'workshop', 'clase', 'taller'],
  'teacher': ['instructor', 'maestro', 'professor'],
  'partner': ['pareja', 'companion', 'leader', 'follower'],
  'music': ['musica', 'orchestra', 'orquesta'],
};

class SearchService {
  private elasticClient: Client | null = null;
  private isElasticAvailable = false;
  private fuseInstances: Map<SearchType, Fuse<any>> = new Map();
  private indexPrefix = 'mundotango';
  
  constructor() {
    this.initializeElasticsearch();
    this.initializeFuse();
  }
  
  /**
   * Initialize Elasticsearch client if configured
   */
  private async initializeElasticsearch() {
    const elasticNode = process.env.ELASTICSEARCH_NODE;
    const elasticEnabled = process.env.ENABLE_ELASTICSEARCH === 'true';
    const elasticApiKey = process.env.ELASTICSEARCH_API_KEY;
    
    if (!elasticEnabled || !elasticNode) {
      console.log('🔍 ESA Layer 15: Elasticsearch disabled, using Fuse.js for search');
      return;
    }
    
    try {
      this.elasticClient = new Client({
        node: elasticNode,
        ...(elasticApiKey ? {
          auth: { apiKey: elasticApiKey }
        } : {}),
        requestTimeout: 5000,
        maxRetries: 3,
      });
      
      // Test connection
      const info = await this.elasticClient.info();
      this.isElasticAvailable = true;
      console.log('✅ ESA Layer 15: Elasticsearch connected:', info.body.cluster_name);
      
      // Initialize indexes
      await this.initializeIndexes();
      
      // Start batch indexing existing data
      this.batchIndexExistingData();
    } catch (error: any) {
      console.error('❌ ESA Layer 15: Elasticsearch connection failed:', error.message);
      console.log('🔄 ESA Layer 15: Falling back to Fuse.js for search');
      this.isElasticAvailable = false;
    }
  }
  
  /**
   * Initialize Elasticsearch indexes with proper mappings
   */
  private async initializeIndexes() {
    if (!this.elasticClient || !this.isElasticAvailable) return;
    
    const indexes: Record<SearchType, any> = {
      users: {
        properties: {
          id: { type: 'keyword' },
          name: { 
            type: 'text',
            analyzer: 'standard',
            fields: {
              keyword: { type: 'keyword' },
              phonetic: { type: 'phonetic', encoder: 'metaphone' }
            }
          },
          username: { type: 'keyword' },
          bio: { type: 'text', analyzer: 'standard' },
          location: { type: 'text' },
          tags: { type: 'keyword' },
          createdAt: { type: 'date' }
        }
      },
      posts: {
        properties: {
          id: { type: 'keyword' },
          title: { 
            type: 'text',
            analyzer: 'standard',
            fields: {
              spanish: { type: 'text', analyzer: 'spanish' },
              english: { type: 'text', analyzer: 'english' }
            }
          },
          content: { 
            type: 'text',
            analyzer: 'standard',
            fields: {
              spanish: { type: 'text', analyzer: 'spanish' },
              english: { type: 'text', analyzer: 'english' }
            }
          },
          tags: { type: 'keyword' },
          userId: { type: 'integer' },
          createdAt: { type: 'date' }
        }
      },
      events: {
        properties: {
          id: { type: 'keyword' },
          title: { 
            type: 'text',
            analyzer: 'standard',
            fields: {
              spanish: { type: 'text', analyzer: 'spanish' },
              english: { type: 'text', analyzer: 'english' }
            }
          },
          description: { 
            type: 'text',
            analyzer: 'standard' 
          },
          location: { type: 'text' },
          date: { type: 'date' },
          tags: { type: 'keyword' },
          organizerId: { type: 'integer' },
          createdAt: { type: 'date' }
        }
      },
      communities: {
        properties: {
          id: { type: 'keyword' },
          name: { 
            type: 'text',
            analyzer: 'standard' 
          },
          description: { type: 'text' },
          location: { type: 'text' },
          tags: { type: 'keyword' },
          memberCount: { type: 'integer' },
          createdAt: { type: 'date' }
        }
      },
      cities: {
        properties: {
          id: { type: 'keyword' },
          name: { 
            type: 'text',
            analyzer: 'standard' 
          },
          slug: { type: 'keyword' },
          city: { type: 'text' },
          country: { type: 'text' },
          description: { type: 'text' },
          memberCount: { type: 'integer' },
          createdAt: { type: 'date' }
        }
      }
    };
    
    for (const [type, mapping] of Object.entries(indexes)) {
      const indexName = `${this.indexPrefix}-${type}`;
      try {
        const exists = await this.elasticClient.indices.exists({ index: indexName });
        if (!exists.body) {
          await this.elasticClient.indices.create({
            index: indexName,
            body: {
              mappings: mapping,
              settings: {
                analysis: {
                  analyzer: {
                    standard: {
                      type: 'standard',
                      stopwords: '_spanish_'
                    }
                  }
                }
              }
            }
          });
          console.log(`✅ ESA Layer 15: Created index ${indexName}`);
        }
      } catch (error: any) {
        console.error(`❌ ESA Layer 15: Failed to create index ${indexName}:`, error.message);
      }
    }
  }
  
  /**
   * Initialize Fuse.js instances for fallback search
   */
  private async initializeFuse() {
    // Load initial data for Fuse.js
    await this.refreshFuseData();
  }
  
  /**
   * Refresh Fuse.js data from database
   */
  private async refreshFuseData() {
    try {
      // Load users
      const usersData = await db.select({
        id: users.id,
        username: users.username,
        name: users.name,
      }).from(users).limit(1000);
      
      const userProfilesData = await db.select().from(userProfilesTable).limit(1000);
      const mergedUsers = usersData.map(user => {
        const profile = userProfilesData.find(p => p.userId === user.id);
        return {
          ...user,
          bio: profile?.bio,
          location: profile?.location,
        };
      });
      
      this.fuseInstances.set('users', new Fuse(mergedUsers, {
        keys: ['username', 'name', 'bio', 'location'],
        threshold: 0.3,
        distance: 100,
        includeScore: true,
        shouldSort: true,
        minMatchCharLength: 2,
      }));
      
      // Load posts
      const postsData = await db.select().from(posts).limit(1000).orderBy(desc(posts.createdAt));
      this.fuseInstances.set('posts', new Fuse(postsData, {
        keys: ['content', 'mediaUrl'],
        threshold: 0.3,
        distance: 100,
        includeScore: true,
        shouldSort: true,
        minMatchCharLength: 2,
      }));
      
      // Load events
      const eventsData = await db.select().from(events).limit(1000).orderBy(desc(events.createdAt));
      this.fuseInstances.set('events', new Fuse(eventsData, {
        keys: ['name', 'description', 'location'],
        threshold: 0.3,
        distance: 100,
        includeScore: true,
        shouldSort: true,
        minMatchCharLength: 2,
      }));
      
      // Load communities/groups
      const groupsData = await db.select().from(groups).limit(1000);
      this.fuseInstances.set('communities', new Fuse(groupsData, {
        keys: ['name', 'description', 'cityName'],
        threshold: 0.3,
        distance: 100,
        includeScore: true,
        shouldSort: true,
        minMatchCharLength: 2,
      }));
      
      // Load city groups (type = 'city')
      const cityGroupsData = await db.select().from(groups).where(eq(groups.type, 'city')).limit(1000);
      this.fuseInstances.set('cities', new Fuse(cityGroupsData, {
        keys: ['name', 'city', 'country', 'description'],
        threshold: 0.3,
        distance: 100,
        includeScore: true,
        shouldSort: true,
        minMatchCharLength: 1, // Allow single char for cities like "NY"
      }));
      
      console.log('✅ ESA Layer 15: Fuse.js data refreshed');
    } catch (error: any) {
      console.error('❌ ESA Layer 15: Failed to refresh Fuse data:', error.message);
    }
  }
  
  /**
   * Apply synonyms to search query
   */
  private expandQueryWithSynonyms(query: string): string {
    const words = query.toLowerCase().split(' ');
    const expandedWords = words.map(word => {
      const synonyms = TANGO_SYNONYMS[word];
      if (synonyms) {
        return `(${word} OR ${synonyms.join(' OR ')})`;
      }
      return word;
    });
    return expandedWords.join(' ');
  }
  
  /**
   * Search in a specific index
   */
  async search(query: string, type: SearchType, options: SearchOptions = {}): Promise<SearchDocument[]> {
    const { limit = 20, offset = 0, filters = {}, fuzzy = true, language = 'en' } = options;
    
    // Expand query with synonyms
    const expandedQuery = this.expandQueryWithSynonyms(query);
    
    // Try Elasticsearch first
    if (this.elasticClient && this.isElasticAvailable) {
      try {
        const indexName = `${this.indexPrefix}-${type}`;
        const searchBody: any = {
          query: {
            bool: {
              must: [],
              filter: []
            }
          },
          from: offset,
          size: limit,
          highlight: {
            fields: {
              '*': {}
            }
          }
        };
        
        // Add main query
        if (fuzzy) {
          searchBody.query.bool.must.push({
            multi_match: {
              query: expandedQuery,
              fields: this.getSearchFields(type, language),
              fuzziness: 'AUTO',
              prefix_length: 1,
              max_expansions: 50,
            }
          });
        } else {
          searchBody.query.bool.must.push({
            multi_match: {
              query: expandedQuery,
              fields: this.getSearchFields(type, language),
            }
          });
        }
        
        // Add filters
        for (const [field, value] of Object.entries(filters)) {
          searchBody.query.bool.filter.push({
            term: { [field]: value }
          });
        }
        
        const result = await this.elasticClient.search({
          index: indexName,
          body: searchBody
        });
        
        return result.body.hits.hits.map((hit: any) => ({
          ...hit._source,
          score: hit._score,
          type,
          highlights: hit.highlight
        }));
      } catch (error: any) {
        console.error(`❌ ESA Layer 15: Elasticsearch search failed:`, error.message);
        // Fall through to Fuse.js
      }
    }
    
    // Fallback to Fuse.js
    const fuseInstance = this.fuseInstances.get(type);
    if (!fuseInstance) {
      console.warn(`⚠️ ESA Layer 15: No Fuse instance for type ${type}`);
      return [];
    }
    
    const results = fuseInstance.search(query).slice(offset, offset + limit);
    return results.map(result => ({
      ...result.item,
      score: result.score,
      type
    }));
  }
  
  /**
   * Search across multiple indexes
   */
  async multiSearch(query: string, types: SearchType[] = ['users', 'posts', 'events', 'communities', 'cities']): Promise<SearchDocument[]> {
    const results = await Promise.all(
      types.map(type => this.search(query, type))
    );
    
    // Combine and sort by score
    const combined = results.flat().sort((a, b) => (b.score || 0) - (a.score || 0));
    return combined;
  }
  
  /**
   * Get search suggestions for autocomplete
   */
  async suggest(query: string, type: SearchType): Promise<string[]> {
    if (this.elasticClient && this.isElasticAvailable) {
      try {
        const indexName = `${this.indexPrefix}-${type}`;
        const result = await this.elasticClient.search({
          index: indexName,
          body: {
            suggest: {
              suggestions: {
                prefix: query,
                completion: {
                  field: this.getSuggestField(type),
                  size: 10,
                  fuzzy: {
                    fuzziness: 'AUTO'
                  }
                }
              }
            }
          }
        });
        
        const suggestions = result.body.suggest?.suggestions?.[0]?.options || [];
        return suggestions.map((s: any) => s.text);
      } catch (error: any) {
        console.error(`❌ ESA Layer 15: Suggestion failed:`, error.message);
      }
    }
    
    // Fallback to Fuse.js with limit
    const results = await this.search(query, type, { limit: 10 });
    const field = this.getSuggestField(type);
    return [...new Set(results.map(r => r[field]).filter(Boolean))];
  }
  
  /**
   * Index a document
   */
  async indexDocument(type: SearchType, id: string, document: any): Promise<boolean> {
    // Index in Elasticsearch if available
    if (this.elasticClient && this.isElasticAvailable) {
      try {
        const indexName = `${this.indexPrefix}-${type}`;
        await this.elasticClient.index({
          index: indexName,
          id,
          body: document,
          refresh: true,
        });
        console.log(`✅ ESA Layer 15: Indexed ${type} document ${id}`);
      } catch (error: any) {
        console.error(`❌ ESA Layer 15: Failed to index document:`, error.message);
      }
    }
    
    // Also update Fuse.js data
    await this.refreshFuseData();
    return true;
  }
  
  /**
   * Update a document
   */
  async updateDocument(type: SearchType, id: string, updates: any): Promise<boolean> {
    if (this.elasticClient && this.isElasticAvailable) {
      try {
        const indexName = `${this.indexPrefix}-${type}`;
        await this.elasticClient.update({
          index: indexName,
          id,
          body: {
            doc: updates
          },
          refresh: true,
        });
        console.log(`✅ ESA Layer 15: Updated ${type} document ${id}`);
      } catch (error: any) {
        console.error(`❌ ESA Layer 15: Failed to update document:`, error.message);
      }
    }
    
    // Also update Fuse.js data
    await this.refreshFuseData();
    return true;
  }
  
  /**
   * Delete a document
   */
  async deleteDocument(type: SearchType, id: string): Promise<boolean> {
    if (this.elasticClient && this.isElasticAvailable) {
      try {
        const indexName = `${this.indexPrefix}-${type}`;
        await this.elasticClient.delete({
          index: indexName,
          id,
          refresh: true,
        });
        console.log(`✅ ESA Layer 15: Deleted ${type} document ${id}`);
      } catch (error: any) {
        console.error(`❌ ESA Layer 15: Failed to delete document:`, error.message);
      }
    }
    
    // Also update Fuse.js data
    await this.refreshFuseData();
    return true;
  }
  
  /**
   * Batch index existing data on startup
   */
  private async batchIndexExistingData() {
    if (!this.elasticClient || !this.isElasticAvailable) return;
    
    console.log('🔄 ESA Layer 15: Starting batch indexing of existing data...');
    
    try {
      // Index users
      const usersData = await db.select().from(users).limit(1000);
      for (const user of usersData) {
        await this.indexDocument('users', user.id.toString(), {
          id: user.id.toString(),
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
        });
      }
      
      // Index posts
      const postsData = await db.select().from(posts).limit(1000);
      for (const post of postsData) {
        await this.indexDocument('posts', post.id.toString(), {
          id: post.id.toString(),
          content: post.content,
          userId: post.userId,
          createdAt: post.createdAt,
        });
      }
      
      // Index events
      const eventsData = await db.select().from(events).limit(1000);
      for (const event of eventsData) {
        await this.indexDocument('events', event.id.toString(), {
          id: event.id.toString(),
          name: event.name,
          description: event.description,
          location: event.location,
          date: event.date,
          organizerId: event.organizerId,
          createdAt: event.createdAt,
        });
      }
      
      // Index groups/communities
      const groupsData = await db.select().from(groups).limit(1000);
      for (const group of groupsData) {
        await this.indexDocument('communities', group.id.toString(), {
          id: group.id.toString(),
          name: group.name,
          description: group.description,
          cityName: group.cityName,
          createdAt: group.createdAt,
        });
      }
      
      console.log('✅ ESA Layer 15: Batch indexing completed');
    } catch (error: any) {
      console.error('❌ ESA Layer 15: Batch indexing failed:', error.message);
    }
  }
  
  /**
   * Get search fields based on type and language
   */
  private getSearchFields(type: SearchType, language: 'en' | 'es'): string[] {
    const languageSuffix = language === 'es' ? '.spanish' : '.english';
    
    switch (type) {
      case 'users':
        return ['name^2', 'name.phonetic', 'username', 'bio', 'location'];
      case 'posts':
        return [`title${languageSuffix}^2`, 'title', `content${languageSuffix}`, 'content', 'tags'];
      case 'events':
        return [`title${languageSuffix}^2`, 'title', `description${languageSuffix}`, 'description', 'location', 'tags'];
      case 'communities':
        return ['name^2', 'description', 'location', 'tags'];
      default:
        return ['*'];
    }
  }
  
  /**
   * Get suggest field for autocomplete
   */
  private getSuggestField(type: SearchType): string {
    switch (type) {
      case 'users':
        return 'name';
      case 'posts':
        return 'title';
      case 'events':
        return 'title';
      case 'communities':
        return 'name';
      default:
        return 'name';
    }
  }
  
  /**
   * Get search service status
   */
  getStatus() {
    return {
      elasticsearch: {
        enabled: process.env.ENABLE_ELASTICSEARCH === 'true',
        available: this.isElasticAvailable,
        node: process.env.ELASTICSEARCH_NODE || 'not configured',
      },
      fusejs: {
        enabled: true,
        instances: Array.from(this.fuseInstances.keys()),
      }
    };
  }
}

// Export singleton instance
export const searchService = new SearchService();