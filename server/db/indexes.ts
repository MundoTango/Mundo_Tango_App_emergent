/**
 * ESA LIFE CEO 61x21 - Database Index Optimization (Phase 12)
 * Performance indexes for PostgreSQL/Supabase
 */

import { sql } from 'drizzle-orm';
import { db } from '../db';

export async function createPerformanceIndexes() {
  console.log('[ESA Phase 12] Creating performance indexes...');

  const indexes = [
    // ============= User & Profile Indexes =============
    // Frequently queried user lookups
    sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
    sql`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`,
    sql`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC)`,
    sql`CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active DESC)`,
    
    // Profile queries
    sql`CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_profiles_visibility ON profiles(visibility)`,
    sql`CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(city, country)`,
    sql`CREATE INDEX IF NOT EXISTS idx_profiles_roles ON profiles USING gin(roles)`,
    
    // ============= Posts & Memories Indexes =============
    // Timeline and feed queries
    sql`CREATE INDEX IF NOT EXISTS idx_posts_user_id_created ON posts(user_id, created_at DESC)`,
    sql`CREATE INDEX IF NOT EXISTS idx_posts_visibility_created ON posts(visibility, created_at DESC)`,
    sql`CREATE INDEX IF NOT EXISTS idx_posts_type_created ON posts(type, created_at DESC)`,
    sql`CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON posts USING gin(hashtags)`,
    
    // Memory-specific queries
    sql`CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC)`,
    sql`CREATE INDEX IF NOT EXISTS idx_memories_tags ON memories USING gin(tags)`,
    sql`CREATE INDEX IF NOT EXISTS idx_memories_location ON memories(location)`,
    sql`CREATE INDEX IF NOT EXISTS idx_memories_visibility ON memories(visibility, created_at DESC)`,
    
    // ============= Events Indexes =============
    // Event discovery and filtering
    sql`CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date)`,
    sql`CREATE INDEX IF NOT EXISTS idx_events_location ON events(city, country)`,
    sql`CREATE INDEX IF NOT EXISTS idx_events_type_date ON events(event_type, start_date)`,
    sql`CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_events_status ON events(status, start_date)`,
    sql`CREATE INDEX IF NOT EXISTS idx_events_tags ON events USING gin(tags)`,
    
    // Event participants
    sql`CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants(user_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_event_participants_status ON event_participants(status)`,
    
    // ============= Groups & Communities Indexes =============
    // Group queries
    sql`CREATE INDEX IF NOT EXISTS idx_groups_type ON groups(type)`,
    sql`CREATE INDEX IF NOT EXISTS idx_groups_city ON groups(city)`,
    sql`CREATE INDEX IF NOT EXISTS idx_groups_created ON groups(created_at DESC)`,
    sql`CREATE INDEX IF NOT EXISTS idx_groups_member_count ON groups(member_count DESC)`,
    sql`CREATE INDEX IF NOT EXISTS idx_groups_slug ON groups(slug)`,
    
    // Group members
    sql`CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_group_members_role ON group_members(role)`,
    sql`CREATE INDEX IF NOT EXISTS idx_group_members_joined ON group_members(joined_at DESC)`,
    
    // Communities
    sql`CREATE INDEX IF NOT EXISTS idx_communities_location ON communities(city, country)`,
    sql`CREATE INDEX IF NOT EXISTS idx_communities_type ON communities(type)`,
    sql`CREATE INDEX IF NOT EXISTS idx_communities_active ON communities(is_active, member_count DESC)`,
    
    // ============= Friendships & Social Indexes =============
    // Friend lookups
    sql`CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON friendships(user_id_1, status)`,
    sql`CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON friendships(user_id_2, status)`,
    sql`CREATE INDEX IF NOT EXISTS idx_friendships_created ON friendships(created_at DESC)`,
    
    // Friend requests
    sql`CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON friend_requests(to_user_id, status)`,
    sql`CREATE INDEX IF NOT EXISTS idx_friend_requests_from ON friend_requests(from_user_id, status)`,
    sql`CREATE INDEX IF NOT EXISTS idx_friend_requests_created ON friend_requests(created_at DESC)`,
    
    // ============= Messages & Notifications Indexes =============
    // Message queries
    sql`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC)`,
    sql`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, is_read)`,
    
    // Conversation lookups
    sql`CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user_id_1)`,
    sql`CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user_id_2)`,
    sql`CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC)`,
    
    // Notifications
    sql`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC)`,
    sql`CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type, created_at DESC)`,
    
    // ============= AI & Agent Indexes =============
    // Agent queries
    sql`CREATE INDEX IF NOT EXISTS idx_agents_user ON agents(user_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(type)`,
    sql`CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(is_active, last_interaction DESC)`,
    
    // Semantic memories
    sql`CREATE INDEX IF NOT EXISTS idx_semantic_memories_user ON semantic_memories(user_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_semantic_memories_type ON semantic_memories(memory_type)`,
    sql`CREATE INDEX IF NOT EXISTS idx_semantic_memories_created ON semantic_memories(created_at DESC)`,
    sql`CREATE INDEX IF NOT EXISTS idx_semantic_memories_embedding ON semantic_memories USING ivfflat (embedding vector_l2_ops)`,
    
    // Decisions and intents
    sql`CREATE INDEX IF NOT EXISTS idx_decisions_user ON decisions(user_id, created_at DESC)`,
    sql`CREATE INDEX IF NOT EXISTS idx_intents_user ON intents(user_id, created_at DESC)`,
    
    // ============= Housing & Marketplace Indexes =============
    // Housing listings
    sql`CREATE INDEX IF NOT EXISTS idx_housing_location ON housing_listings(city, country)`,
    sql`CREATE INDEX IF NOT EXISTS idx_housing_price ON housing_listings(price_per_month)`,
    sql`CREATE INDEX IF NOT EXISTS idx_housing_available ON housing_listings(is_available, created_at DESC)`,
    sql`CREATE INDEX IF NOT EXISTS idx_housing_host ON housing_listings(host_id)`,
    
    // Bookings
    sql`CREATE INDEX IF NOT EXISTS idx_bookings_guest ON housing_bookings(guest_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_bookings_listing ON housing_bookings(listing_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_bookings_dates ON housing_bookings(check_in, check_out)`,
    sql`CREATE INDEX IF NOT EXISTS idx_bookings_status ON housing_bookings(status)`,
    
    // ============= Search & Full-Text Indexes =============
    // Full-text search indexes
    sql`CREATE INDEX IF NOT EXISTS idx_users_search ON users USING gin(to_tsvector('english', coalesce(username, '') || ' ' || coalesce(display_name, '')))`,
    sql`CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING gin(to_tsvector('english', coalesce(content, '') || ' ' || coalesce(array_to_string(hashtags, ' '), '')))`,
    sql`CREATE INDEX IF NOT EXISTS idx_events_search ON events USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')))`,
    sql`CREATE INDEX IF NOT EXISTS idx_groups_search ON groups USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')))`,
    
    // ============= Performance & Analytics Indexes =============
    // User activity tracking
    sql`CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id, timestamp DESC)`,
    sql`CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type, timestamp DESC)`,
    
    // Page views and interactions
    sql`CREATE INDEX IF NOT EXISTS idx_page_views_user ON page_views(user_id, viewed_at DESC)`,
    sql`CREATE INDEX IF NOT EXISTS idx_page_views_page ON page_views(page_path, viewed_at DESC)`,
    
    // ============= Composite Indexes for Complex Queries =============
    // Timeline query optimization
    sql`CREATE INDEX IF NOT EXISTS idx_timeline_query ON posts(user_id, visibility, created_at DESC) WHERE deleted_at IS NULL`,
    
    // Feed query optimization
    sql`CREATE INDEX IF NOT EXISTS idx_feed_query ON posts(visibility, created_at DESC) WHERE deleted_at IS NULL AND visibility = 'public'`,
    
    // Event discovery optimization
    sql`CREATE INDEX IF NOT EXISTS idx_event_discovery ON events(status, start_date, city) WHERE status = 'published' AND start_date >= CURRENT_DATE`,
    
    // Active conversations optimization
    sql`CREATE INDEX IF NOT EXISTS idx_active_conversations ON conversations(user_id_1, user_id_2, updated_at DESC) WHERE deleted_at IS NULL`,
    
    // ============= Partial Indexes for Specific Queries =============
    // Active users only
    sql`CREATE INDEX IF NOT EXISTS idx_active_users ON users(last_active DESC) WHERE is_active = true`,
    
    // Unread notifications
    sql`CREATE INDEX IF NOT EXISTS idx_unread_notifications ON notifications(user_id, created_at DESC) WHERE is_read = false`,
    
    // Upcoming events
    sql`CREATE INDEX IF NOT EXISTS idx_upcoming_events ON events(start_date) WHERE start_date >= CURRENT_DATE AND status = 'published'`,
    
    // Available housing
    sql`CREATE INDEX IF NOT EXISTS idx_available_housing ON housing_listings(city, price_per_month) WHERE is_available = true`
  ];

  // Execute index creation
  let successCount = 0;
  let errorCount = 0;

  for (const indexSql of indexes) {
    try {
      await db.execute(indexSql);
      successCount++;
    } catch (error: any) {
      // Ignore "already exists" errors
      if (!error.message?.includes('already exists')) {
        console.error('[ESA Phase 12] Index creation error:', error.message);
        errorCount++;
      } else {
        successCount++;
      }
    }
  }

  console.log(`[ESA Phase 12] Index creation complete: ${successCount} successful, ${errorCount} errors`);

  // Analyze tables for query planner optimization
  await optimizeQueryPlanner();
}

async function optimizeQueryPlanner() {
  console.log('[ESA Phase 12] Optimizing query planner...');

  const tables = [
    'users', 'profiles', 'posts', 'memories', 'events', 
    'groups', 'communities', 'friendships', 'messages',
    'notifications', 'agents', 'semantic_memories'
  ];

  for (const table of tables) {
    try {
      await db.execute(sql.raw(`ANALYZE ${table}`));
    } catch (error) {
      // Table might not exist, skip
    }
  }

  console.log('[ESA Phase 12] Query planner optimization complete');
}

// Function to check index usage
export async function checkIndexUsage() {
  const query = sql`
    SELECT 
      schemaname,
      tablename,
      indexname,
      idx_scan as index_scans,
      idx_tup_read as tuples_read,
      idx_tup_fetch as tuples_fetched,
      pg_size_pretty(pg_relation_size(indexrelid)) as index_size
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    ORDER BY idx_scan DESC
    LIMIT 50
  `;

  try {
    const result = await db.execute(query);
    return result.rows;
  } catch (error) {
    console.error('[ESA Phase 12] Error checking index usage:', error);
    return [];
  }
}

// Function to identify missing indexes
export async function identifyMissingIndexes() {
  const query = sql`
    SELECT 
      schemaname,
      tablename,
      attname as column_name,
      n_distinct,
      correlation
    FROM pg_stats
    WHERE schemaname = 'public'
      AND n_distinct > 100
      AND correlation < 0.1
    ORDER BY n_distinct DESC
    LIMIT 20
  `;

  try {
    const result = await db.execute(query);
    return result.rows;
  } catch (error) {
    console.error('[ESA Phase 12] Error identifying missing indexes:', error);
    return [];
  }
}

// Function to check slow queries
export async function checkSlowQueries() {
  const query = sql`
    SELECT 
      query,
      calls,
      total_time,
      mean_time,
      max_time,
      stddev_time
    FROM pg_stat_statements
    WHERE query NOT LIKE '%pg_%'
    ORDER BY mean_time DESC
    LIMIT 20
  `;

  try {
    const result = await db.execute(query);
    return result.rows;
  } catch (error) {
    // pg_stat_statements might not be enabled
    return [];
  }
}

// Export main initialization function
export async function initializePerformanceIndexes() {
  console.log('[ESA Phase 12] Initializing database performance optimizations...');
  
  await createPerformanceIndexes();
  
  // Check and report index usage
  const indexUsage = await checkIndexUsage();
  if (indexUsage.length > 0) {
    console.log('[ESA Phase 12] Top used indexes:', indexUsage.slice(0, 5));
  }
  
  console.log('[ESA Phase 12] Database performance initialization complete');
}