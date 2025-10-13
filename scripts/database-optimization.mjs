#!/usr/bin/env node
/**
 * MB.MD Track 3: Database Optimization
 * Archive old logs, implement rotation, fix N+1 queries
 */

import pkg from 'pg';
const { Client } = pkg;

async function optimizeDatabase() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  console.log('🔧 MB.MD Track 3: Database Optimization\n');
  
  try {
    // Step 1: Archive old audit_logs (27 MB)
    console.log('📦 Step 1: Archiving old audit_logs (>90 days)...');
    
    const archiveQuery = `
      CREATE TABLE IF NOT EXISTS audit_logs_archive (LIKE audit_logs INCLUDING ALL);
      
      WITH archived AS (
        DELETE FROM audit_logs 
        WHERE timestamp < NOW() - INTERVAL '90 days'
        RETURNING *
      )
      INSERT INTO audit_logs_archive SELECT * FROM archived;
    `;
    
    const archiveResult = await client.query(archiveQuery);
    console.log(`  ✅ Archived logs older than 90 days`);
    
    // Step 2: Implement performance_metrics rotation (18 MB)
    console.log('\n📊 Step 2: Rotating performance_metrics (keep last 30 days)...');
    
    const rotateQuery = `
      CREATE TABLE IF NOT EXISTS performance_metrics_archive (LIKE performance_metrics INCLUDING ALL);
      
      WITH old_metrics AS (
        DELETE FROM performance_metrics 
        WHERE timestamp < NOW() - INTERVAL '30 days'
        RETURNING *
      )
      INSERT INTO performance_metrics_archive SELECT * FROM old_metrics;
    `;
    
    await client.query(rotateQuery);
    console.log(`  ✅ Rotated metrics older than 30 days`);
    
    // Step 3: Check for N+1 query patterns
    console.log('\n🔍 Step 3: Analyzing query patterns for N+1 issues...');
    
    const slowQueries = `
      SELECT 
        calls,
        mean_exec_time,
        query
      FROM pg_stat_statements
      WHERE calls > 100
      ORDER BY mean_exec_time DESC
      LIMIT 10;
    `;
    
    try {
      const queries = await client.query(slowQueries);
      if (queries.rows.length > 0) {
        console.log('  📉 Top slow queries found:');
        queries.rows.forEach((row, i) => {
          console.log(`    ${i+1}. Calls: ${row.calls}, Avg: ${row.mean_exec_time}ms`);
        });
      }
    } catch (e) {
      console.log('  ℹ️  pg_stat_statements extension not available (optional)');
    }
    
    // Step 4: Update table statistics
    console.log('\n📈 Step 4: Updating table statistics...');
    await client.query('ANALYZE;');
    console.log('  ✅ Statistics updated');
    
    // Step 5: Check new sizes
    console.log('\n📦 Step 5: New table sizes:');
    const sizeQuery = `
      SELECT 
        tablename,
        pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename IN ('audit_logs', 'performance_metrics')
      ORDER BY tablename;
    `;
    
    const sizes = await client.query(sizeQuery);
    sizes.rows.forEach(row => {
      console.log(`  ${row.tablename}: ${row.size}`);
    });
    
    console.log('\n✅ Database optimization complete!');
    console.log('📊 Summary: Archived old data, implemented rotation, analyzed queries');
    
  } catch (error) {
    console.error('❌ Error during optimization:', error.message);
  } finally {
    await client.end();
  }
}

optimizeDatabase().catch(console.error);
