/**
 * Graceful Degradation Service
 * MB.MD SIMULTANEOUS Stream 2: Error Recovery Infrastructure
 * Provides fallback responses when all AI models are unavailable
 * Created: October 28, 2025
 */

export interface CachedResponse {
  query: string;
  response: string;
  timestamp: number;
  modelUsed: string;
}

export class GracefulDegradationService {
  private responseCache: Map<string, CachedResponse> = new Map();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 1000;

  /**
   * Get a degraded response when all models fail
   */
  getDegradedResponse(userMessage: string): string {
    // Check cache first
    const cachedResponse = this.getCachedResponse(userMessage);
    if (cachedResponse) {
      return `${cachedResponse.response}\n\n_Note: This is a cached response from ${new Date(cachedResponse.timestamp).toLocaleString()}. Our AI services are temporarily unavailable._`;
    }

    // Provide helpful static response
    return this.getStaticFallback(userMessage);
  }

  /**
   * Cache a successful response for future fallback
   */
  cacheResponse(query: string, response: string, modelUsed: string) {
    // Evict old entries if cache is full
    if (this.responseCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = Array.from(this.responseCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.responseCache.delete(oldestKey);
    }

    const cacheKey = this.normalizeQuery(query);
    this.responseCache.set(cacheKey, {
      query,
      response,
      timestamp: Date.now(),
      modelUsed
    });
  }

  /**
   * Get cached response if available and not expired
   */
  private getCachedResponse(query: string): CachedResponse | null {
    const cacheKey = this.normalizeQuery(query);
    const cached = this.responseCache.get(cacheKey);

    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.responseCache.delete(cacheKey);
      return null;
    }

    return cached;
  }

  /**
   * Normalize query for cache lookup (lowercase, trim, remove special chars)
   */
  private normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
  }

  /**
   * Provide static fallback response based on query intent
   */
  private getStaticFallback(userMessage: string): string {
    const message = userMessage.toLowerCase();

    // Tango-related queries
    if (message.includes('tango') || message.includes('dance') || message.includes('milonga')) {
      return `I apologize, but our AI services are temporarily unavailable. However, I can help you with basic tango information:\n\n` +
        `🎵 Tango is a passionate partner dance originating from Buenos Aires, Argentina.\n` +
        `💃 Key styles include Argentine Tango, Ballroom Tango, and Tango Nuevo.\n` +
        `🏛️ Milongas are social dance events where tango is practiced.\n\n` +
        `For more detailed information, please try again in a few minutes when our AI services are restored.`;
    }

    // Event-related queries
    if (message.includes('event') || message.includes('workshop') || message.includes('class')) {
      return `Our AI services are temporarily offline. To find tango events:\n\n` +
        `📅 Check the Events page in the main navigation\n` +
        `🔍 Use the search function to find events by location\n` +
        `🗓️ Filter by date, style, or instructor\n\n` +
        `Please try again soon for AI-powered event recommendations.`;
    }

    // Profile/social queries
    if (message.includes('profile') || message.includes('friend') || message.includes('connect')) {
      return `AI assistant is temporarily unavailable. For social features:\n\n` +
        `👥 Visit the Community tab to find dancers\n` +
        `🔗 Use the search to find specific users\n` +
        `📧 Check your messages for connection requests\n\n` +
        `Normal AI functionality will resume shortly.`;
    }

    // Generic fallback
    return `I apologize, but our AI services are experiencing temporary issues. Your message has been recorded, and our systems will be back online shortly.\n\n` +
      `In the meantime, you can:\n` +
      `• Browse the Events page for upcoming milongas\n` +
      `• Explore the Community to connect with dancers\n` +
      `• Visit your Profile to update your information\n\n` +
      `We appreciate your patience and expect service to resume within a few minutes.`;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.responseCache.size,
      maxSize: this.MAX_CACHE_SIZE,
      ttl: this.CACHE_TTL,
      entries: Array.from(this.responseCache.values()).map(entry => ({
        query: entry.query.substring(0, 50) + '...',
        timestamp: new Date(entry.timestamp).toISOString(),
        modelUsed: entry.modelUsed
      }))
    };
  }

  /**
   * Clear the response cache
   */
  clearCache() {
    this.responseCache.clear();
    console.log('[Graceful Degradation] Response cache cleared');
  }
}

export const gracefulDegradation = new GracefulDegradationService();
