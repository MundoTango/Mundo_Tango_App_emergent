/**
 * ESA LIFE CEO 61×21 - Test Database Setup Script
 * Ensures complete test database isolation
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const { Pool } = pg;

// Load test environment variables
const testEnvPath = path.resolve('.env.test');
if (fs.existsSync(testEnvPath)) {
  dotenv.config({ path: testEnvPath });
}

// Use TEST_DATABASE_URL for test database isolation
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/lifeceo_test';
const DATABASE_NAME = 'lifeceo_test';

// Admin connection to create/drop test database
const ADMIN_URL = TEST_DATABASE_URL.replace(/\/[^/]+$/, '/postgres');

/**
 * Setup test database
 */
export async function setupTestDatabase() {
  console.log('🔧 Setting up isolated test database...');
  
  const adminPool = new Pool({ connectionString: ADMIN_URL });
  
  try {
    // Drop existing test database if it exists
    await adminPool.query(`DROP DATABASE IF EXISTS ${DATABASE_NAME}`);
    console.log(`✅ Dropped existing test database: ${DATABASE_NAME}`);
    
    // Create fresh test database
    await adminPool.query(`CREATE DATABASE ${DATABASE_NAME}`);
    console.log(`✅ Created fresh test database: ${DATABASE_NAME}`);
    
    // Connect to test database
    const testPool = new Pool({ connectionString: TEST_DATABASE_URL });
    const db = drizzle(testPool);
    
    // Apply schema
    console.log('📋 Applying database schema...');
    const schemaPath = path.resolve('drizzle/0000_init.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await db.execute(sql.raw(schema));
      console.log('✅ Schema applied successfully');
    } else {
      // Use drizzle-kit push to create schema
      const { execSync } = require('child_process');
      execSync('DATABASE_URL=' + TEST_DATABASE_URL + ' npm run db:push', { stdio: 'inherit' });
      console.log('✅ Schema created using drizzle-kit');
    }
    
    await testPool.end();
    console.log('✅ Test database setup complete');
    
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    throw error;
  } finally {
    await adminPool.end();
  }
}

/**
 * Teardown test database
 */
export async function teardownTestDatabase() {
  console.log('🧹 Cleaning up test database...');
  
  const adminPool = new Pool({ connectionString: ADMIN_URL });
  
  try {
    await adminPool.query(`DROP DATABASE IF EXISTS ${DATABASE_NAME}`);
    console.log(`✅ Test database dropped: ${DATABASE_NAME}`);
  } catch (error) {
    console.error('❌ Test database teardown failed:', error);
    throw error;
  } finally {
    await adminPool.end();
  }
}

/**
 * Reset test database (drop all data but keep schema)
 */
export async function resetTestDatabase() {
  console.log('🔄 Resetting test database...');
  
  const testPool = new Pool({ connectionString: TEST_DATABASE_URL });
  const db = drizzle(testPool);
  
  try {
    // Get all tables
    const result = await db.execute(sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename != 'drizzle_migrations'
    `);
    
    // Truncate all tables with CASCADE to handle foreign keys
    for (const row of result.rows) {
      await db.execute(sql.raw(`TRUNCATE TABLE "${row.tablename}" CASCADE`));
    }
    
    console.log('✅ Test database reset complete');
  } catch (error) {
    console.error('❌ Test database reset failed:', error);
    throw error;
  } finally {
    await testPool.end();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupTestDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}