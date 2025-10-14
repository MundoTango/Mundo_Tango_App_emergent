import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function fixTableSchema() {
  console.log('🔧 Fixing algorithm_agents table schema to match shared/schema.ts...\n');

  try {
    // Drop and recreate table with correct schema
    console.log('1. Dropping existing table...');
    await db.execute(sql`DROP TABLE IF EXISTS algorithm_agents CASCADE`);
    
    console.log('2. Creating table with correct schema...');
    await db.execute(sql`
      CREATE TABLE algorithm_agents (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        file_path VARCHAR(500) NOT NULL,
        algorithm_type VARCHAR(50) NOT NULL,
        current_config JSONB DEFAULT '{}'::jsonb NOT NULL,
        default_config JSONB DEFAULT '{}'::jsonb NOT NULL,
        version VARCHAR(50) DEFAULT '1.0.0',
        esa_layers INTEGER[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('3. Creating index...');
    await db.execute(sql`
      CREATE INDEX idx_algorithm_agents_type ON algorithm_agents(algorithm_type)
    `);
    
    console.log('\n✅ Table schema fixed! Schema.ts and SQL table now match.\n');
    console.log('Test with: curl -X POST http://localhost:5000/api/algorithms/initialize-all\n');
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

fixTableSchema();
