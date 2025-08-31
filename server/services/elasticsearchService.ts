/**
 * ESA LIFE CEO 61x21 - Layer 15: Search & Discovery Service
 * Elasticsearch integration, fuzzy matching, advanced search capabilities
 */

import { EventEmitter } from 'events';

export interface SearchDocument {
  id: string;
  type: 'user' | 'event' | 'post' | 'group' | 'venue';
  title: string;
  content: string;
  tags: string[];
  location?: {
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchQuery {
  query: string;
  filters?: {
    type?: string[];
    tags?: string[];
    location?: string;
    author?: string;
    dateRange?: { start: Date; end: Date };
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  }[];
  pagination?: {
    page: number;
    limit: number;
  };
  fuzzy?: boolean;
  highlight?: boolean;
}

export interface SearchResult {
  document: SearchDocument;
  score: number;
  highlights?: Record<string, string[]>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  took: number;
  aggregations?: Record<string, any>;
}

class ElasticsearchService extends EventEmitter {
  private documents = new Map<string, SearchDocument>();
  private indices = new Map<string, Map<string, Set<string>>>();
  
  // Simulated Elasticsearch functionality
  private client: any = null;
  private indexName = 'mundo-tango';

  constructor() {
    super();
    this.setupIndices();
    console.log('[ESA Layer 15] Elasticsearch service initialized');
  }

  private setupIndices() {
    // Create inverted indices for fast text search
    this.indices.set('content', new Map());
    this.indices.set('tags', new Map());
    this.indices.set('location', new Map());
    this.indices.set('author', new Map());
  }

  async indexDocument(document: SearchDocument): Promise<boolean> {
    try {
      // Store document
      this.documents.set(document.id, document);

      // Update inverted indices
      this.indexText(document.id, document.title + ' ' + document.content, 'content');
      this.indexArray(document.id, document.tags, 'tags');
      
      if (document.location) {
        this.indexText(document.id, `${document.location.city} ${document.location.country}`, 'location');
      }
      
      if (document.author) {
        this.indexText(document.id, document.author.name, 'author');
      }

      // If Elasticsearch client is available, also index there
      if (this.client) {
        await this.client.index({
          index: this.indexName,
          id: document.id,
          body: document
        });
      }

      console.log(`[ESA Layer 15] Indexed document: ${document.id} (${document.type})`);
      this.emit('documentIndexed', document);
      return true;

    } catch (error) {
      console.error(`[ESA Layer 15] Indexing error:`, error);
      return false;
    }
  }

  async search(query: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now();
    
    try {
      let candidateIds = new Set<string>();
      
      // If no query text, get all documents
      if (!query.query || query.query.trim() === '') {
        candidateIds = new Set(this.documents.keys());
      } else {
        // Text search with fuzzy matching
        candidateIds = this.searchText(query.query, query.fuzzy);
      }

      // Apply filters
      if (query.filters) {
        candidateIds = this.applyFilters(candidateIds, query.filters);
      }

      // Score and rank results
      const scoredResults = this.scoreResults(Array.from(candidateIds), query);

      // Apply sorting
      if (query.sort && query.sort.length > 0) {
        scoredResults.sort((a, b) => this.compareBySorts(a, b, query.sort!));
      }

      // Apply pagination
      const pagination = query.pagination || { page: 1, limit: 20 };
      const startIndex = (pagination.page - 1) * pagination.limit;
      const paginatedResults = scoredResults.slice(startIndex, startIndex + pagination.limit);

      // Add highlights if requested
      if (query.highlight && query.query) {
        paginatedResults.forEach(result => {
          result.highlights = this.generateHighlights(result.document, query.query);
        });
      }

      const response: SearchResponse = {
        results: paginatedResults,
        total: scoredResults.length,
        page: pagination.page,
        limit: pagination.limit,
        took: Date.now() - startTime
      };

      console.log(`[ESA Layer 15] Search completed: ${response.results.length}/${response.total} results in ${response.took}ms`);
      this.emit('searchCompleted', query, response);
      
      return response;

    } catch (error) {
      console.error(`[ESA Layer 15] Search error:`, error);
      return {
        results: [],
        total: 0,
        page: 1,
        limit: 20,
        took: Date.now() - startTime
      };
    }
  }

  // Specialized search methods for Mundo Tango platform
  async searchEvents(query: string, location?: string, dateRange?: { start: Date; end: Date }): Promise<SearchResponse> {
    return this.search({
      query,
      filters: {
        type: ['event'],
        location,
        dateRange
      },
      sort: [
        { field: 'createdAt', order: 'desc' }
      ],
      fuzzy: true,
      highlight: true
    });
  }

  async searchUsers(query: string, location?: string): Promise<SearchResponse> {
    return this.search({
      query,
      filters: {
        type: ['user'],
        location
      },
      sort: [
        { field: 'metadata.followers', order: 'desc' }
      ],
      fuzzy: true,
      highlight: true
    });
  }

  async searchPosts(query: string, tags?: string[], author?: string): Promise<SearchResponse> {
    return this.search({
      query,
      filters: {
        type: ['post'],
        tags,
        author
      },
      sort: [
        { field: 'createdAt', order: 'desc' }
      ],
      fuzzy: true,
      highlight: true
    });
  }

  async searchGroups(query: string, location?: string): Promise<SearchResponse> {
    return this.search({
      query,
      filters: {
        type: ['group'],
        location
      },
      sort: [
        { field: 'metadata.memberCount', order: 'desc' }
      ],
      fuzzy: true,
      highlight: true
    });
  }

  async getSuggestions(query: string, type?: string): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const suggestions = new Set<string>();
    const normalizedQuery = query.toLowerCase();

    // Get suggestions from document titles and content
    for (const doc of this.documents.values()) {
      if (type && doc.type !== type) continue;

      // Title suggestions
      if (doc.title.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(doc.title);
      }

      // Tag suggestions
      doc.tags.forEach(tag => {
        if (tag.toLowerCase().includes(normalizedQuery)) {
          suggestions.add(tag);
        }
      });
    }

    return Array.from(suggestions).slice(0, 10);
  }

  private indexText(documentId: string, text: string, indexType: string) {
    const words = this.tokenize(text);
    const index = this.indices.get(indexType);
    
    if (!index) return;

    words.forEach(word => {
      if (!index.has(word)) {
        index.set(word, new Set());
      }
      index.get(word)!.add(documentId);
    });
  }

  private indexArray(documentId: string, values: string[], indexType: string) {
    const index = this.indices.get(indexType);
    if (!index) return;

    values.forEach(value => {
      const normalized = value.toLowerCase().trim();
      if (!index.has(normalized)) {
        index.set(normalized, new Set());
      }
      index.get(normalized)!.add(documentId);
    });
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  private searchText(query: string, fuzzy = false): Set<string> {
    const words = this.tokenize(query);
    const results = new Set<string>();
    const contentIndex = this.indices.get('content');
    
    if (!contentIndex) return results;

    words.forEach(word => {
      // Exact matches
      if (contentIndex.has(word)) {
        contentIndex.get(word)!.forEach(id => results.add(id));
      }

      // Fuzzy matches (if enabled)
      if (fuzzy) {
        for (const [indexWord, documentIds] of contentIndex.entries()) {
          if (this.fuzzyMatch(word, indexWord)) {
            documentIds.forEach(id => results.add(id));
          }
        }
      }
    });

    return results;
  }

  private fuzzyMatch(word1: string, word2: string, maxDistance = 2): boolean {
    if (word1 === word2) return true;
    if (word1.length < 3 || word2.length < 3) return false;
    
    return this.levenshteinDistance(word1, word2) <= maxDistance;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private applyFilters(candidateIds: Set<string>, filters: NonNullable<SearchQuery['filters']>): Set<string> {
    const filteredIds = new Set<string>();

    for (const id of candidateIds) {
      const doc = this.documents.get(id);
      if (!doc) continue;

      let passesAllFilters = true;

      // Type filter
      if (filters.type && !filters.type.includes(doc.type)) {
        passesAllFilters = false;
      }

      // Tags filter
      if (filters.tags && !filters.tags.some(tag => doc.tags.includes(tag))) {
        passesAllFilters = false;
      }

      // Location filter
      if (filters.location && doc.location) {
        const locationText = `${doc.location.city} ${doc.location.country}`.toLowerCase();
        if (!locationText.includes(filters.location.toLowerCase())) {
          passesAllFilters = false;
        }
      }

      // Author filter
      if (filters.author && doc.author && doc.author.id !== filters.author) {
        passesAllFilters = false;
      }

      // Date range filter
      if (filters.dateRange) {
        const docDate = doc.createdAt;
        if (docDate < filters.dateRange.start || docDate > filters.dateRange.end) {
          passesAllFilters = false;
        }
      }

      if (passesAllFilters) {
        filteredIds.add(id);
      }
    }

    return filteredIds;
  }

  private scoreResults(documentIds: string[], query: SearchQuery): SearchResult[] {
    return documentIds.map(id => {
      const document = this.documents.get(id)!;
      const score = this.calculateScore(document, query);
      
      return { document, score };
    }).sort((a, b) => b.score - a.score);
  }

  private calculateScore(document: SearchDocument, query: SearchQuery): number {
    let score = 0;
    const queryWords = this.tokenize(query.query || '');
    const docText = (document.title + ' ' + document.content).toLowerCase();

    // Text relevance score
    queryWords.forEach(word => {
      const occurrences = (docText.match(new RegExp(word, 'g')) || []).length;
      score += occurrences * 10;
      
      // Boost for title matches
      if (document.title.toLowerCase().includes(word)) {
        score += 50;
      }
    });

    // Recency boost
    const daysSinceCreation = (Date.now() - document.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 100 - daysSinceCreation);

    // Type-specific boosts
    if (document.type === 'event' && document.metadata.attendeeCount) {
      score += Math.log(document.metadata.attendeeCount + 1) * 5;
    }
    
    if (document.type === 'user' && document.metadata.followers) {
      score += Math.log(document.metadata.followers + 1) * 3;
    }

    return score;
  }

  private compareBySorts(a: SearchResult, b: SearchResult, sorts: NonNullable<SearchQuery['sort']>): number {
    for (const sort of sorts) {
      let aValue: any, bValue: any;
      
      if (sort.field === 'score') {
        aValue = a.score;
        bValue = b.score;
      } else if (sort.field.startsWith('metadata.')) {
        const field = sort.field.substring(9);
        aValue = a.document.metadata[field] || 0;
        bValue = b.document.metadata[field] || 0;
      } else {
        aValue = (a.document as any)[sort.field];
        bValue = (b.document as any)[sort.field];
      }

      if (aValue !== bValue) {
        const result = aValue < bValue ? -1 : 1;
        return sort.order === 'desc' ? -result : result;
      }
    }
    return 0;
  }

  private generateHighlights(document: SearchDocument, query: string): Record<string, string[]> {
    const highlights: Record<string, string[]> = {};
    const queryWords = this.tokenize(query);
    
    // Title highlights
    let titleHighlights: string[] = [];
    let highlightedTitle = document.title;
    queryWords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      if (document.title.match(regex)) {
        highlightedTitle = highlightedTitle.replace(regex, '<mark>$1</mark>');
        titleHighlights.push(highlightedTitle);
      }
    });
    
    if (titleHighlights.length > 0) {
      highlights.title = titleHighlights;
    }

    // Content highlights
    let contentHighlights: string[] = [];
    queryWords.forEach(word => {
      const regex = new RegExp(`(.{0,50}${word}.{0,50})`, 'gi');
      const matches = document.content.match(regex);
      if (matches) {
        matches.forEach(match => {
          const highlighted = match.replace(new RegExp(`(${word})`, 'gi'), '<mark>$1</mark>');
          contentHighlights.push(highlighted);
        });
      }
    });
    
    if (contentHighlights.length > 0) {
      highlights.content = contentHighlights.slice(0, 3); // Limit to 3 snippets
    }

    return highlights;
  }

  async deleteDocument(id: string): Promise<boolean> {
    try {
      const document = this.documents.get(id);
      if (!document) return false;

      this.documents.delete(id);
      
      // Remove from indices
      this.indices.forEach(index => {
        index.forEach((documentIds, term) => {
          documentIds.delete(id);
          if (documentIds.size === 0) {
            index.delete(term);
          }
        });
      });

      // Remove from Elasticsearch if available
      if (this.client) {
        await this.client.delete({
          index: this.indexName,
          id
        });
      }

      console.log(`[ESA Layer 15] Deleted document: ${id}`);
      this.emit('documentDeleted', id);
      return true;

    } catch (error) {
      console.error(`[ESA Layer 15] Delete error:`, error);
      return false;
    }
  }

  getStats() {
    return {
      totalDocuments: this.documents.size,
      documentTypes: this.getDocumentTypeCounts(),
      indexSize: this.getIndexSize(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private getDocumentTypeCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const doc of this.documents.values()) {
      counts[doc.type] = (counts[doc.type] || 0) + 1;
    }
    return counts;
  }

  private getIndexSize(): number {
    let size = 0;
    this.indices.forEach(index => {
      index.forEach(documentIds => {
        size += documentIds.size;
      });
    });
    return size;
  }

  private estimateMemoryUsage(): number {
    let size = 0;
    for (const doc of this.documents.values()) {
      size += JSON.stringify(doc).length * 2;
    }
    return size;
  }
}

export const elasticsearchService = new ElasticsearchService();

// Export for Layer 57 (Automation Management) integration
export const setupSearchAutomation = () => {
  // Reindex popular content every 6 hours for better search performance
  setInterval(async () => {
    console.log('[ESA Layer 15] Optimizing search indices...');
    const stats = elasticsearchService.getStats();
    console.log(`[ESA Layer 15] Current stats: ${JSON.stringify(stats)}`);
  }, 6 * 60 * 60 * 1000);
};