import { db } from '../db';
import { recommendations, users } from '@shared/schema';
import { eq, and, or, sql, inArray } from 'drizzle-orm';
import { ConnectionCalculationService, ConnectionInfo } from './connectionCalculationService';

/**
 * ESA LIFE CEO 61x21 - Layer 28: Recommendations System
 * Recommendation Access Service
 * 
 * Adapts Housing connection-based access control for recommendation filtering
 * - Connection degree filtering (1st, 2nd, 3rd degree friends)
 * - Closeness score filtering (close friends only)
 * - Local vs visitor status filtering
 * - Origin country filtering (cultural expertise)
 */

export interface RecommendationFilter {
  city?: string;
  type?: string;
  priceLevel?: string;
  minRating?: number;
  tags?: string[];
  connectionDegree?: 'anyone' | '1st_degree' | '2nd_degree' | '3rd_degree' | 'custom_closeness';
  minClosenessScore?: number;
  localStatus?: 'all' | 'local' | 'visitor';
  originCountry?: string;
  limit?: number;
  offset?: number;
}

export class RecommendationAccessService {
  private connectionService: ConnectionCalculationService;

  constructor() {
    this.connectionService = new ConnectionCalculationService();
  }

  /**
   * Check if a user can view a recommendation based on whoCanView setting
   * Mirrors the canUserBook() logic from Housing system
   */
  async canUserViewRecommendation(
    viewerId: number,
    recommendation: any
  ): Promise<{ canView: boolean; reason?: string; connectionInfo?: ConnectionInfo }> {
    const recommenderId = recommendation.userId;
    const whoCanView = recommendation.whoCanView || 'anyone';
    const minimumClosenessScore = recommendation.minimumClosenessScore || 0;

    // User can always view their own recommendations
    if (viewerId === recommenderId) {
      return { canView: true };
    }

    // Get connection info between viewer and recommender
    const connectionInfo = await this.connectionService.getConnectionInfo(viewerId, recommenderId);

    // Check based on whoCanView setting
    switch (whoCanView) {
      case 'anyone':
        return { canView: true, connectionInfo };

      case '1st_degree':
        if (connectionInfo.connectionDegree !== 1) {
          return {
            canView: false,
            reason: 'This recommendation is only visible to 1st degree connections (direct friends).',
            connectionInfo
          };
        }
        return { canView: true, connectionInfo };

      case '2nd_degree':
        if (!connectionInfo.connectionDegree || connectionInfo.connectionDegree > 2) {
          return {
            canView: false,
            reason: 'This recommendation is only visible to 1st and 2nd degree connections.',
            connectionInfo
          };
        }
        return { canView: true, connectionInfo };

      case '3rd_degree':
        if (!connectionInfo.connectionDegree || connectionInfo.connectionDegree > 3) {
          return {
            canView: false,
            reason: 'This recommendation is only visible to connected users within 3 degrees.',
            connectionInfo
          };
        }
        return { canView: true, connectionInfo };

      case 'custom_closeness':
        if (connectionInfo.closenessScore < minimumClosenessScore) {
          return {
            canView: false,
            reason: `This recommendation requires a closeness score of at least ${minimumClosenessScore}. Your current score is ${connectionInfo.closenessScore}.`,
            connectionInfo
          };
        }
        return { canView: true, connectionInfo };

      default:
        return { canView: true, connectionInfo };
    }
  }

  /**
   * Filter recommendations by connection degree for a given viewer
   * Used by GET /api/recommendations endpoint
   */
  async filterByConnectionDegree(
    viewerId: number,
    recommendationIds: number[],
    connectionDegree: string,
    minClosenessScore: number = 0
  ): Promise<number[]> {
    if (connectionDegree === 'anyone' || recommendationIds.length === 0) {
      return recommendationIds;
    }

    // Get all recommendations with their user IDs
    const recs = await db
      .select({ id: recommendations.id, userId: recommendations.userId })
      .from(recommendations)
      .where(inArray(recommendations.id, recommendationIds));

    const filtered: number[] = [];

    for (const rec of recs) {
      // User always sees their own recommendations
      if (rec.userId === viewerId) {
        filtered.push(rec.id);
        continue;
      }

      const connectionInfo = await this.connectionService.getConnectionInfo(viewerId, rec.userId);

      // Apply filter based on connection degree
      switch (connectionDegree) {
        case '1st_degree':
          if (connectionInfo.connectionDegree === 1) {
            filtered.push(rec.id);
          }
          break;

        case '2nd_degree':
          if (connectionInfo.connectionDegree && connectionInfo.connectionDegree <= 2) {
            filtered.push(rec.id);
          }
          break;

        case '3rd_degree':
          if (connectionInfo.connectionDegree && connectionInfo.connectionDegree <= 3) {
            filtered.push(rec.id);
          }
          break;

        case 'custom_closeness':
          if (connectionInfo.closenessScore >= minClosenessScore) {
            filtered.push(rec.id);
          }
          break;
      }
    }

    return filtered;
  }

  /**
   * Filter recommendations by local vs visitor status
   * - local: recommender's city matches recommendation city
   * - visitor: recommender's city differs from recommendation city
   */
  async filterByLocalStatus(
    recommendationIds: number[],
    localStatus: 'all' | 'local' | 'visitor'
  ): Promise<number[]> {
    if (localStatus === 'all' || recommendationIds.length === 0) {
      return recommendationIds;
    }

    // Get recommendations with user city info
    const recs = await db
      .select({
        recId: recommendations.id,
        recCity: recommendations.city,
        userId: recommendations.userId,
      })
      .from(recommendations)
      .where(inArray(recommendations.id, recommendationIds));

    const userIds = [...new Set(recs.map(r => r.userId))];
    
    const usersData = await db
      .select({ id: users.id, city: users.city })
      .from(users)
      .where(inArray(users.id, userIds));

    const userCityMap = new Map(usersData.map(u => [u.id, u.city]));

    const filtered: number[] = [];

    for (const rec of recs) {
      const userCity = userCityMap.get(rec.userId);
      const isLocal = userCity?.toLowerCase() === rec.recCity.toLowerCase();

      if (localStatus === 'local' && isLocal) {
        filtered.push(rec.recId);
      } else if (localStatus === 'visitor' && !isLocal) {
        filtered.push(rec.recId);
      }
    }

    return filtered;
  }

  /**
   * Filter recommendations by recommender's origin country
   * Used for cultural expertise matching (e.g., Korean friends for Korean restaurants)
   */
  async filterByOriginCountry(
    recommendationIds: number[],
    originCountry: string
  ): Promise<number[]> {
    if (!originCountry || recommendationIds.length === 0) {
      return recommendationIds;
    }

    // Get recommendations with user country info
    const recs = await db
      .select({
        recId: recommendations.id,
        userId: recommendations.userId,
      })
      .from(recommendations)
      .where(inArray(recommendations.id, recommendationIds));

    const userIds = [...new Set(recs.map(r => r.userId))];
    
    const usersData = await db
      .select({ id: users.id, country: users.country })
      .from(users)
      .where(inArray(users.id, userIds));

    const userCountryMap = new Map(usersData.map(u => [u.id, u.country]));

    const filtered: number[] = [];

    for (const rec of recs) {
      const userCountry = userCountryMap.get(rec.userId);
      if (userCountry?.toLowerCase() === originCountry.toLowerCase()) {
        filtered.push(rec.recId);
      }
    }

    return filtered;
  }

  /**
   * Apply all filters to a set of recommendation IDs
   * Returns filtered list of IDs that pass all filter criteria
   */
  async applyAllFilters(
    viewerId: number,
    recommendationIds: number[],
    filters: RecommendationFilter
  ): Promise<number[]> {
    let filteredIds = recommendationIds;

    // Apply connection degree filter
    if (filters.connectionDegree && filters.connectionDegree !== 'anyone') {
      filteredIds = await this.filterByConnectionDegree(
        viewerId,
        filteredIds,
        filters.connectionDegree,
        filters.minClosenessScore || 0
      );
    }

    // Apply local/visitor filter
    if (filters.localStatus && filters.localStatus !== 'all') {
      filteredIds = await this.filterByLocalStatus(filteredIds, filters.localStatus);
    }

    // Apply origin country filter
    if (filters.originCountry) {
      filteredIds = await this.filterByOriginCountry(filteredIds, filters.originCountry);
    }

    return filteredIds;
  }
}

// Singleton instance
export const recommendationAccessService = new RecommendationAccessService();
