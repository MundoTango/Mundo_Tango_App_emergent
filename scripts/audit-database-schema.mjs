#!/usr/bin/env node
// TRACK 11: Database Schema Audit (ES Module)
import pkg from 'pg';
const { Client } = pkg;

async function auditSchema() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  console.log('🔍 Auditing database schema...\n');
  
  const indexQuery = `
    SELECT schemaname, tablename, indexname 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    ORDER BY tablename;
  `;
  const indexes = await client.query(indexQuery);
  console.log(`📊 Found ${indexes.rows.length} indexes`);
  
  const sizeQuery = `
    SELECT 
      schemaname,
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
  `;
  const sizes = await client.query(sizeQuery);
  console.log('\n📦 Table sizes (top 10):');
  sizes.rows.slice(0, 10).forEach(row => {
    console.log(`  ${row.tablename}: ${row.size}`);
  });
  
  await client.end();
  console.log('\n✅ Schema audit complete');
}

auditSchema().catch(console.error);
