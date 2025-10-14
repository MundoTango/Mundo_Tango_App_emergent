import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function recreateAllTables() {
  console.log('🔧 Recreating ALL algorithm tables to match shared/schema.ts exactly...\n');

  try {
    // Drop all algorithm tables
    console.log('1. Dropping all existing algorithm tables...');
    await db.execute(sql`DROP TABLE IF EXISTS algorithm_metrics CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS algorithm_chat_history CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS algorithm_changelog CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS algorithm_parameters CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS algorithm_agents CASCADE`);
    console.log('   ✅ All tables dropped\n');

    // Create algorithm_agents (EXACT match to schema.ts line 4974)
    console.log('2. Creating algorithm_agents...');
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
    await db.execute(sql`CREATE INDEX idx_algorithm_agents_type ON algorithm_agents(algorithm_type)`);
    console.log('   ✅ algorithm_agents created\n');

    // Create algorithm_parameters (EXACT match to schema.ts line 4990)
    console.log('3. Creating algorithm_parameters...');
    await db.execute(sql`
      CREATE TABLE algorithm_parameters (
        id SERIAL PRIMARY KEY,
        algorithm_id VARCHAR(50) REFERENCES algorithm_agents(id) NOT NULL,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        current_value JSONB NOT NULL,
        default_value JSONB NOT NULL,
        constraints JSONB,
        description TEXT,
        impact TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql`CREATE INDEX idx_algorithm_parameters_algorithm ON algorithm_parameters(algorithm_id)`);
    console.log('   ✅ algorithm_parameters created\n');

    // Create algorithm_changelog (EXACT match to schema.ts line 5005)
    console.log('4. Creating algorithm_changelog...');
    await db.execute(sql`
      CREATE TABLE algorithm_changelog (
        id SERIAL PRIMARY KEY,
        algorithm_id VARCHAR(50) REFERENCES algorithm_agents(id) NOT NULL,
        user_id INTEGER,
        parameter_name VARCHAR(100),
        old_value JSONB,
        new_value JSONB,
        reason TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql`CREATE INDEX idx_algorithm_changelog_algorithm ON algorithm_changelog(algorithm_id)`);
    console.log('   ✅ algorithm_changelog created\n');

    // Create algorithm_chat_history (EXACT match to schema.ts line 5017)
    console.log('5. Creating algorithm_chat_history...');
    await db.execute(sql`
      CREATE TABLE algorithm_chat_history (
        id SERIAL PRIMARY KEY,
        algorithm_id VARCHAR(50) REFERENCES algorithm_agents(id) NOT NULL,
        user_id INTEGER,
        message TEXT NOT NULL,
        response TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql`CREATE INDEX idx_algorithm_chat_algorithm ON algorithm_chat_history(algorithm_id)`);
    console.log('   ✅ algorithm_chat_history created\n');

    // Create algorithm_metrics (EXACT match to schema.ts line 5027)
    console.log('6. Creating algorithm_metrics...');
    await db.execute(sql`
      CREATE TABLE algorithm_metrics (
        id SERIAL PRIMARY KEY,
        algorithm_id VARCHAR(50) REFERENCES algorithm_agents(id) NOT NULL,
        metric_name VARCHAR(100) NOT NULL,
        metric_value NUMERIC,
        recorded_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql`CREATE INDEX idx_algorithm_metrics_algorithm ON algorithm_metrics(algorithm_id)`);
    console.log('   ✅ algorithm_metrics created\n');

    console.log('🎉 ALL TABLES RECREATED! Schema.ts and SQL now perfectly aligned!\n');
    console.log('Test with: curl -X POST http://localhost:5000/api/algorithms/initialize-all\n');
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

recreateAllTables();
