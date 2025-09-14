// ESA LIFE CEO 61x21 - Phase 7: Database Optimizations
import { db } from '../db';
import { sql } from 'drizzle-orm';

// Database optimization class for performance enhancements
export class DatabaseOptimizer {
  // Create optimized indexes for frequently queried columns
  static async createPerformanceIndexes() {
    try {
      console.log('🔧 Creating performance indexes...');
      
      // User-related indexes for fast lookups
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active 
        ON users(email, is_active) 
        WHERE is_active = true
      `);
      
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_city_country_active 
        ON users(city, country, is_active) 
        WHERE is_active = true
      `);
      
      // Posts performance indexes
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_user_created 
        ON posts(user_id, created_at DESC)
      `);
      
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_visibility_created 
        ON posts(visibility, created_at DESC) 
        WHERE visibility = 'public'
      `);
      
      // Events performance indexes
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_start_date_public 
        ON events(start_date, is_public) 
        WHERE is_public = true AND start_date >= CURRENT_DATE
      `);
      
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_city_upcoming 
        ON events(city, start_date) 
        WHERE start_date >= CURRENT_DATE
      `);
      
      // Groups and members indexes
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_members_user_group 
        ON group_members(user_id, group_id, status) 
        WHERE status = 'active'
      `);
      
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_groups_type_visibility 
        ON groups(type, visibility) 
        WHERE visibility IN ('public', 'private')
      `);
      
      // Chat and messaging indexes
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_room_created 
        ON chat_messages(room_id, created_at DESC)
      `);
      
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_rooms_participants 
        ON chat_rooms USING gin(participants)
      `);
      
      // AI and agent indexes
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_status_category 
        ON agents(status, category) 
        WHERE status = 'active'
      `);
      
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_semantic_memories_user_agent 
        ON semantic_memories(user_id, agent_id, last_accessed DESC)
      `);
      
      // Notifications index
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread 
        ON notifications(user_id, created_at DESC) 
        WHERE is_read = false
      `);
      
      // Project tracker indexes (ESA Framework)
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_status_priority 
        ON projects(status, priority) 
        WHERE status IN ('In Progress', 'Blocked')
      `);
      
      console.log('✅ Performance indexes created');
    } catch (error) {
      console.error('Failed to create indexes:', error);
    }
  }
  
  // Optimize database statistics for better query planning
  static async updateStatistics() {
    try {
      console.log('📊 Updating database statistics...');
      
      const tables = [
        'users', 'posts', 'events', 'groups', 'group_members',
        'chat_rooms', 'chat_messages', 'agents', 'semantic_memories',
        'notifications', 'projects', 'follows', 'post_likes'
      ];
      
      for (const table of tables) {
        await db.execute(sql`ANALYZE ${sql.raw(table)}`);
      }
      
      console.log('✅ Database statistics updated');
    } catch (error) {
      console.error('Failed to update statistics:', error);
    }
  }
  
  // Enable query performance monitoring
  static async enableQueryMonitoring() {
    try {
      console.log('📈 Enabling query performance monitoring...');
      
      // Enable pg_stat_statements extension for query monitoring
      await db.execute(sql`
        CREATE EXTENSION IF NOT EXISTS pg_stat_statements
      `);
      
      console.log('✅ Query monitoring enabled');
    } catch (error) {
      console.error('Query monitoring setup failed:', error);
    }
  }
  
  // Clean up old data to maintain performance
  static async cleanupOldData() {
    try {
      console.log('🧹 Cleaning up old data...');
      
      // Delete old notifications (older than 90 days)
      await db.execute(sql`
        DELETE FROM notifications 
        WHERE created_at < CURRENT_DATE - INTERVAL '90 days'
        AND is_read = true
      `);
      
      // Delete old chat messages (older than 180 days)
      await db.execute(sql`
        DELETE FROM chat_messages 
        WHERE created_at < CURRENT_DATE - INTERVAL '180 days'
        AND room_id IN (
          SELECT id FROM chat_rooms 
          WHERE type = 'direct'
        )
      `);
      
      // Clean up orphaned semantic memories
      await db.execute(sql`
        DELETE FROM semantic_memories 
        WHERE user_id NOT IN (SELECT id FROM users)
      `);
      
      // Vacuum to reclaim space
      await db.execute(sql`VACUUM ANALYZE`);
      
      console.log('✅ Old data cleanup completed');
    } catch (error) {
      console.error('Data cleanup failed:', error);
    }
  }
  
  // Optimize connection pool settings
  static getOptimizedPoolConfig() {
    return {
      max: 20, // Maximum number of connections
      min: 5,  // Minimum number of connections
      idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
      connectionTimeoutMillis: 2000, // Timeout for new connections
      statement_timeout: 30000, // Statement timeout of 30 seconds
      query_timeout: 30000, // Query timeout of 30 seconds
      application_name: 'ESA_LIFE_CEO_61x21'
    };
  }
  
  // Get slow queries for optimization
  static async getSlowQueries() {
    try {
      const result = await db.execute(sql`
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          max_time,
          min_time
        FROM pg_stat_statements
        WHERE mean_time > 100 -- Queries taking more than 100ms on average
        ORDER BY mean_time DESC
        LIMIT 20
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Failed to get slow queries:', error);
      return [];
    }
  }
  
  // Optimize specific slow queries with query hints
  static optimizeQuery(query: string): string {
    // Add query optimization hints based on patterns
    const optimizations: Record<string, string> = {
      // Force index usage for user lookups
      'SELECT .* FROM users WHERE email': 
        'SELECT /*+ INDEX(users idx_users_email_active) */ $1 FROM users WHERE email',
      
      // Optimize post feeds with proper join order
      'SELECT .* FROM posts .* JOIN users':
        'SELECT /*+ LEADING(posts users) USE_HASH(users) */ $1 FROM posts $2 JOIN users',
      
      // Optimize event queries with date filtering
      'SELECT .* FROM events WHERE start_date':
        'SELECT /*+ INDEX(events idx_events_start_date_public) */ $1 FROM events WHERE start_date'
    };
    
    for (const [pattern, optimization] of Object.entries(optimizations)) {
      if (query.includes(pattern.replace('.*', ''))) {
        return query.replace(new RegExp(pattern), optimization);
      }
    }
    
    return query;
  }
  
  // Run all optimizations
  static async runAllOptimizations() {
    console.log('🚀 Starting database optimizations...');
    
    await this.createPerformanceIndexes();
    await this.updateStatistics();
    await this.enableQueryMonitoring();
    await this.cleanupOldData();
    
    console.log('✅ All database optimizations completed');
  }
}

// Query builder helpers for optimized queries
export const optimizedQueries = {
  // Get user feed with optimized joins
  getUserFeed: (userId: number, limit = 20, offset = 0) => sql`
    WITH user_follows AS (
      SELECT following_id FROM follows WHERE follower_id = ${userId}
    )
    SELECT 
      p.*,
      u.name as author_name,
      u.username as author_username,
      u.profile_image as author_avatar,
      COUNT(DISTINCT pl.user_id) as like_count,
      COUNT(DISTINCT pc.id) as comment_count,
      EXISTS(
        SELECT 1 FROM post_likes 
        WHERE post_id = p.id AND user_id = ${userId}
      ) as is_liked
    FROM posts p
    INNER JOIN users u ON p.user_id = u.id
    LEFT JOIN post_likes pl ON p.id = pl.post_id
    LEFT JOIN post_comments pc ON p.id = pc.post_id
    WHERE p.user_id IN (SELECT following_id FROM user_follows)
      OR p.user_id = ${userId}
      AND p.visibility = 'public'
    GROUP BY p.id, u.name, u.username, u.profile_image
    ORDER BY p.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `,
  
  // Get trending events with optimization
  getTrendingEvents: (city?: string, limit = 10) => sql`
    SELECT 
      e.*,
      COUNT(DISTINCT er.user_id) as rsvp_count,
      u.name as organizer_name
    FROM events e
    INNER JOIN users u ON e.created_by = u.id
    LEFT JOIN event_rsvps er ON e.id = er.event_id
    WHERE e.start_date >= CURRENT_DATE
      AND e.is_public = true
      ${city ? sql`AND e.city = ${city}` : sql``}
    GROUP BY e.id, u.name
    ORDER BY rsvp_count DESC, e.start_date ASC
    LIMIT ${limit}
  `,
  
  // Get user recommendations with AI scoring
  getUserRecommendations: (userId: number, limit = 5) => sql`
    WITH user_interests AS (
      SELECT DISTINCT tag 
      FROM post_tags pt
      INNER JOIN posts p ON pt.post_id = p.id
      WHERE p.user_id = ${userId}
    ),
    recommended_users AS (
      SELECT 
        u.id,
        u.name,
        u.username,
        u.profile_image,
        u.city,
        COUNT(DISTINCT pt.tag) as common_interests
      FROM users u
      INNER JOIN posts p ON u.id = p.user_id
      INNER JOIN post_tags pt ON p.id = pt.post_id
      WHERE pt.tag IN (SELECT tag FROM user_interests)
        AND u.id != ${userId}
        AND u.is_active = true
        AND NOT EXISTS (
          SELECT 1 FROM follows 
          WHERE follower_id = ${userId} AND following_id = u.id
        )
      GROUP BY u.id, u.name, u.username, u.profile_image, u.city
      ORDER BY common_interests DESC
      LIMIT ${limit}
    )
    SELECT * FROM recommended_users
  `
};

// Export for use in server initialization
export default DatabaseOptimizer;