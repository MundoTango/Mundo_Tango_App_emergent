/**
 * Friendship Connection Utilities
 * ESA LIFE CEO 61x21 - Unified numeric connection degree system
 * 
 * Single source of truth for friendship connection mappings
 */

export type ConnectionDegree = -1 | 1 | 2 | 3;

export interface ConnectionInfo {
  connectionDegree: ConnectionDegree;
  closenessScore: number;
  mutualFriends: number;
  sharedMemories: number;
  isConnected: boolean;
}

/**
 * Get human-readable label for connection degree
 */
export function getConnectionLabel(degree: ConnectionDegree, format: 'short' | 'long' = 'long'): string {
  if (degree === -1) {
    return format === 'short' ? 'Not connected' : 'Not connected';
  }
  if (degree === 1) {
    return format === 'short' ? '1st' : '1st degree friend';
  }
  if (degree === 2) {
    return format === 'short' ? '2nd' : '2nd degree connection';
  }
  if (degree === 3) {
    return format === 'short' ? '3rd' : '3rd degree connection';
  }
  return 'Unknown';
}

/**
 * Get filter option label
 */
export function getFilterLabel(filter: string): string {
  switch (filter) {
    case 'all':
      return 'All hosts';
    case '1st_degree':
      return 'Direct friends only';
    case '2nd_degree':
      return 'Friends & friends of friends';
    case '3rd_degree':
      return 'Extended network (1-3 degrees)';
    default:
      return filter;
  }
}

/**
 * Map legacy string values to numeric degrees (backward compatibility)
 */
export function legacyFilterToNumeric(legacyFilter: string): string {
  switch (legacyFilter) {
    case 'friends':
    case 'direct':
      return '1st_degree';
    case 'friends-of-friends':
    case 'friend-of-friend':
      return '2nd_degree';
    case 'community':
      return '3rd_degree';
    case 'all':
      return 'all';
    default:
      return legacyFilter;
  }
}

/**
 * Get badge color classes for connection degree
 */
export function getConnectionBadgeColor(degree: ConnectionDegree): {
  bgClass: string;
  textClass: string;
  iconColor: string;
} {
  if (degree === -1) {
    return {
      bgClass: 'bg-[var(--color-neutral-100)] dark:bg-gray-800',
      textClass: 'text-gray-600 dark:text-gray-400',
      iconColor: 'text-gray-500'
    };
  }
  if (degree === 1) {
    return {
      bgClass: 'bg-gradient-to-r from-pink-500 to-rose-500',
      textClass: 'text-white',
      iconColor: 'text-white'
    };
  }
  if (degree === 2) {
    return {
      bgClass: 'bg-gradient-to-r from-blue-400 to-cyan-400',
      textClass: 'text-white',
      iconColor: 'text-white'
    };
  }
  if (degree === 3) {
    return {
      bgClass: 'bg-gradient-to-r from-purple-400 to-indigo-400',
      textClass: 'text-white',
      iconColor: 'text-white'
    };
  }
  return {
    bgClass: 'bg-gray-200',
    textClass: 'text-[var(--color-text-secondary)]',
    iconColor: 'text-gray-500'
  };
}

/**
 * Validate connection degree value
 */
export function isValidConnectionDegree(degree: any): degree is ConnectionDegree {
  return degree === -1 || degree === 1 || degree === 2 || degree === 3;
}
