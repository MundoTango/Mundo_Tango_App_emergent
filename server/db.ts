import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from "@shared/schema";

const { Pool } = pg;

// For demo purposes, we'll provide a mock DATABASE_URL
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://demo:demo@localhost:5432/lifeceo_demo';

// 40x20s Framework - Layer 21: Production Resilience Engineering
// Use standard PostgreSQL connection to avoid Neon WebSocket issues
console.log('🔄 Initializing database connection...');
console.log('🎭 [DEMO] Using demo database configuration');

const pool = new Pool({ 
  connectionString: DATABASE_URL,
  // Mundo Tango ESA LIFE CEO Optimized Connection Pool Settings
  max: 100, // Production-ready: supports high concurrency under load
  min: 20,  // Maintains warm connection pool for fast response times
  idleTimeoutMillis: 30000, // 30 seconds for better connection reuse
  connectionTimeoutMillis: 30000, // 30 seconds timeout (deployment-safe)
  statement_timeout: 60000, // 60 second query timeout for complex operations
  query_timeout: 60000, // 60 second query timeout
  keepAlive: true, // Enable TCP keepalive
  keepAliveInitialDelayMillis: 10000, // 10 second keepalive delay
  // Connection string optimizations
  application_name: 'mundo-tango-40x20s',
  // SSL configuration for Replit database
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Layer 21: Error handling for pool
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
  // Don't crash the app - Layer 23: Business Continuity
});

// Layer 21: Connection health check with exponential backoff
let isConnected = false;
let connectionRetries = 0;
const MAX_RETRIES = 5;
const RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff: 1s, 2s, 4s, 8s, 16s

async function checkConnection() {
  try {
    await pool.query('SELECT 1');
    if (!isConnected) {
      console.log('✅ Database connection restored');
      isConnected = true;
      connectionRetries = 0;
    }
    return true;
  } catch (err) {
    isConnected = false;
    console.error('❌ Database connection check failed:', err instanceof Error ? err.message : String(err));
    
    if (connectionRetries < MAX_RETRIES) {
      const delay = RETRY_DELAYS[connectionRetries] || 16000;
      connectionRetries++;
      console.log(`🔄 Retrying database connection (${connectionRetries}/${MAX_RETRIES}) in ${delay}ms...`);
      setTimeout(checkConnection, delay);
    } else {
      console.error('❌ Max database connection retries reached - proceeding without database');
      // Don't crash - allow server to start for health checks
    }
    return false;
  }
}

// Export connection status for health check endpoint
export function getConnectionStatus() {
  return {
    isConnected,
    retriesAttempted: connectionRetries,
    poolStats: {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount
    }
  };
}

// Initial connection check
checkConnection();

// Periodic health check every 30 seconds
setInterval(checkConnection, 30000);

export const db = drizzle(pool, { schema });

// Layer 21: Graceful query wrapper with retry logic
export async function resilientQuery<T>(
  queryFn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T | null> {
  for (let i = 0; i < retries; i++) {
    try {
      return await queryFn();
    } catch (err) {
      console.error(`❌ Query attempt ${i + 1} failed:`, err instanceof Error ? err.message : String(err));
      if (i < retries - 1) {
        console.log(`🔄 Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        console.error('❌ All query retries exhausted');
        return null;
      }
    }
  }
  return null;
}

// Mundo Tango ESA LIFE CEO - Export pool for direct usage and global reference
export { pool };

// Extend global type for TypeScript
declare global {
  var dbPool: typeof pool | undefined;
}

// Set global pool reference for middleware usage
if (!global.dbPool) {
  global.dbPool = pool;
}