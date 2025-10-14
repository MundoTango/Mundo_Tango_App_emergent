import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function fixParametersTable() {
  console.log('🔧 Fixing algorithm_parameters table...\n');

  try {
    // Drop and recreate with correct schema
    console.log('1. Dropping existing table...');
    await db.execute(sql`DROP TABLE IF EXISTS algorithm_parameters CASCADE`);
    
    console.log('2. Creating table with correct schema matching shared/schema.ts...');
    await db.execute(sql`
      CREATE TABLE algorithm_parameters (
        id SERIAL PRIMARY KEY,
        algorithm_id VARCHAR(50) REFERENCES algorithm_agents(id) NOT NULL,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        current_value TEXT,
        default_value TEXT,
        constraints JSONB,
        description TEXT,
        impact TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('3. Creating indexes...');
    await db.execute(sql`
      CREATE INDEX idx_algorithm_parameters_algorithm_id ON algorithm_parameters(algorithm_id)
    `);
    
    console.log('\n✅ Table fixed!\n');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

fixParametersTable();
