/**
 * ESA LIFE CEO 61×21 - Database Test Setup
 * Real database connection and helper functions for Playwright tests
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, sql } from 'drizzle-orm';
import pg from 'pg';
import bcrypt from 'bcrypt';
import { users, sessions, events, memories, eventAttendees, posts } from '../../shared/schema';
import { v4 as uuidv4 } from 'uuid';

const { Pool } = pg;

// Database connection for tests
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://demo:demo@localhost:5432/lifeceo_demo';
const pool = new Pool({ 
  connectionString: DATABASE_URL,
  max: 5,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const testDb = drizzle(pool, { 
  schema: { users, sessions, events, memories, eventAttendees, posts } 
});

// Test user interface
export interface TestUser {
  id: number;
  email: string;
  password: string;
  name: string;
  username: string;
  city?: string;
  country?: string;
  isActive: boolean;
}

// Generate unique test email
export function generateTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}-${timestamp}-${random}@mundotango-test.com`;
}

// Create test user with real database record
export async function createTestUser(options: {
  email?: string;
  password?: string;
  name?: string;
  username?: string;
  city?: string;
  country?: string;
  isOnboardingComplete?: boolean;
  tangoRoles?: string[];
}): Promise<TestUser> {
  const email = options.email || generateTestEmail();
  const password = options.password || 'TestPass123!';
  const username = options.username || email.split('@')[0];
  const name = options.name || `Test User ${username}`;
  
  // Hash password with bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    // Insert user into database
    const [user] = await testDb.insert(users).values({
      email,
      password: hashedPassword,
      name,
      username,
      firstName: name.split(' ')[0],
      lastName: name.split(' ')[1] || 'User',
      city: options.city || 'Buenos Aires',
      country: options.country || 'Argentina',
      isActive: true,
      isVerified: true,
      isOnboardingComplete: options.isOnboardingComplete ?? true,
      codeOfConductAccepted: true,
      termsAccepted: true,
      tangoRoles: options.tangoRoles || ['follower', 'leader'],
      languages: ['English', 'Spanish'],
      yearsOfDancing: 3,
      leaderLevel: 3,
      followerLevel: 3,
      profileImage: '/images/default-avatar.png',
      bio: `Test user for automated testing - ${username}`,
      formStatus: 4, // All forms completed
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    console.log(`✅ Created test user: ${email} (ID: ${user.id})`);
    
    return {
      id: user.id,
      email: user.email,
      password: password, // Return unhashed password for login
      name: user.name,
      username: user.username,
      city: user.city || undefined,
      country: user.country || undefined,
      isActive: user.isActive ?? true
    };
  } catch (error) {
    console.error(`❌ Failed to create test user ${email}:`, error);
    throw error;
  }
}

// Create multiple test users
export async function createTestUsers(count: number, prefix: string = 'test'): Promise<TestUser[]> {
  const testUsers: TestUser[] = [];
  
  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      email: generateTestEmail(`${prefix}${i + 1}`),
      name: `Test ${prefix.charAt(0).toUpperCase() + prefix.slice(1)} ${i + 1}`,
      city: i % 2 === 0 ? 'Buenos Aires' : 'Montevideo',
      country: i % 2 === 0 ? 'Argentina' : 'Uruguay'
    });
    testUsers.push(user);
  }
  
  return testUsers;
}

// Create test event with real database record
export async function createTestEvent(organizerId: number, options: {
  title?: string;
  date?: Date;
  venue?: string;
  capacity?: number;
  visibility?: 'public' | 'private';
} = {}) {
  const eventId = uuidv4();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [event] = await testDb.insert(events).values({
    title: options.title || `Test Event ${Date.now()}`,
    description: 'Test event for automated testing',
    date: options.date || tomorrow,
    time: '20:00',
    venue: options.venue || 'Test Venue',
    address: '123 Test Street',
    city: 'Buenos Aires',
    country: 'Argentina',
    latitude: -34.6037,
    longitude: -58.3816,
    capacity: options.capacity || 50,
    visibility: options.visibility || 'public',
    organizerId,
    attendeeCount: 1, // Organizer is attending
    imageUrl: '/images/default-event.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();
  
  // Add organizer as attendee
  await testDb.insert(eventAttendees).values({
    eventId: event.id,
    userId: organizerId,
    status: 'attending',
    createdAt: new Date()
  });
  
  console.log(`✅ Created test event: ${event.title} (ID: ${event.id})`);
  return event;
}

// Create test memory/post with real database record
export async function createTestMemory(userId: number, options: {
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaEmbeds?: string[];
  visibility?: 'public' | 'friends' | 'private';
} = {}) {
  const [memory] = await testDb.insert(posts).values({
    userId,
    content: options.content || `Test memory ${Date.now()}`,
    imageUrl: options.imageUrl,
    videoUrl: options.videoUrl,
    mediaEmbeds: options.mediaEmbeds || [],
    visibility: options.visibility || 'public',
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();
  
  console.log(`✅ Created test memory: ${memory.id}`);
  return memory;
}

// Clean up test users by email pattern
export async function cleanupTestUsers(emailPattern: string = '@mundotango-test.com') {
  try {
    const deletedUsers = await testDb
      .delete(users)
      .where(sql`email LIKE '%${emailPattern}%'`)
      .returning({ id: users.id, email: users.email });
    
    console.log(`🧹 Cleaned up ${deletedUsers.length} test users`);
    return deletedUsers;
  } catch (error) {
    console.error('❌ Failed to cleanup test users:', error);
    throw error;
  }
}

// Clean up test events by organizer
export async function cleanupTestEvents(organizerIds: number[]) {
  try {
    const deletedEvents = await testDb
      .delete(events)
      .where(sql`organizer_id = ANY(${organizerIds})`)
      .returning({ id: events.id, title: events.title });
    
    console.log(`🧹 Cleaned up ${deletedEvents.length} test events`);
    return deletedEvents;
  } catch (error) {
    console.error('❌ Failed to cleanup test events:', error);
    throw error;
  }
}

// Clean up test memories by author
export async function cleanupTestMemories(authorIds: number[]) {
  try {
    const deletedMemories = await testDb
      .delete(posts)
      .where(sql`author_id = ANY(${authorIds})`)
      .returning({ id: posts.id });
    
    console.log(`🧹 Cleaned up ${deletedMemories.length} test memories`);
    return deletedMemories;
  } catch (error) {
    console.error('❌ Failed to cleanup test memories:', error);
    throw error;
  }
}

// Full cleanup function
export async function cleanupAllTestData() {
  console.log('🧹 Starting full test data cleanup...');
  
  try {
    // Get all test users
    const testUsers = await testDb
      .select({ id: users.id })
      .from(users)
      .where(sql`email LIKE '%@mundotango-test.com%'`);
    
    const userIds = testUsers.map(u => u.id);
    
    if (userIds.length > 0) {
      // Clean up related data first
      await cleanupTestEvents(userIds);
      await cleanupTestMemories(userIds);
      
      // Clean up event attendees
      await testDb
        .delete(eventAttendees)
        .where(sql`user_id = ANY(${userIds})`);
    }
    
    // Finally clean up users
    await cleanupTestUsers();
    
    console.log('✅ Full test data cleanup completed');
  } catch (error) {
    console.error('❌ Full cleanup failed:', error);
    throw error;
  }
}

// Verify database connection
export async function verifyDatabaseConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connection verified');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Close database connection
export async function closeDatabaseConnection() {
  await pool.end();
  console.log('🔌 Database connection closed');
}

// SQL helper is already imported at top with other drizzle-orm imports
export { sql };