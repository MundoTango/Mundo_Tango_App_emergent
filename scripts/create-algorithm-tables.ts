import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function createTables() {
  console.log('🚀 Creating algorithm tables...\n');

  try {
    // Table 1: algorithm_agents
    console.log('1️⃣  Creating algorithm_agents table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS algorithm_agents (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        algorithm_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        file_path VARCHAR(500),
        algorithm_type VARCHAR(50),
        esa_layers INTEGER[],
        impact_score INTEGER DEFAULT 50,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('   ✅ algorithm_agents created\n');

    // Table 2: algorithm_parameters
    console.log('2️⃣  Creating algorithm_parameters table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS algorithm_parameters (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        algorithm_id VARCHAR(50) NOT NULL,
        parameter_name VARCHAR(100) NOT NULL,
        parameter_type VARCHAR(50) NOT NULL,
        current_value TEXT,
        default_value TEXT,
        min_value TEXT,
        max_value TEXT,
        description TEXT,
        impact_description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(algorithm_id, parameter_name)
      )
    `);
    console.log('   ✅ algorithm_parameters created\n');

    // Table 3: algorithm_changelog
    console.log('3️⃣  Creating algorithm_changelog table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS algorithm_changelog (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        algorithm_id VARCHAR(50) NOT NULL,
        user_id INTEGER,
        parameter_name VARCHAR(100),
        old_value TEXT,
        new_value TEXT,
        reason TEXT,
        modified_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('   ✅ algorithm_changelog created\n');

    // Table 4: algorithm_chat_history
    console.log('4️⃣  Creating algorithm_chat_history table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS algorithm_chat_history (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        algorithm_id VARCHAR(50) NOT NULL,
        user_id INTEGER,
        message TEXT NOT NULL,
        response TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('   ✅ algorithm_chat_history created\n');

    // Table 5: algorithm_metrics
    console.log('5️⃣  Creating algorithm_metrics table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS algorithm_metrics (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        algorithm_id VARCHAR(50) NOT NULL,
        metric_name VARCHAR(100) NOT NULL,
        metric_value NUMERIC,
        recorded_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('   ✅ algorithm_metrics created\n');

    // Create indexes
    console.log('📊 Creating indexes...');
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_algorithm_agents_type ON algorithm_agents(algorithm_type)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_algorithm_agents_active ON algorithm_agents(is_active)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_algorithm_parameters_algorithm ON algorithm_parameters(algorithm_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_algorithm_changelog_algorithm ON algorithm_changelog(algorithm_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_algorithm_changelog_modified ON algorithm_changelog(modified_at)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_algorithm_chat_algorithm ON algorithm_chat_history(algorithm_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_algorithm_chat_user ON algorithm_chat_history(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_algorithm_metrics_algorithm ON algorithm_metrics(algorithm_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_algorithm_metrics_recorded ON algorithm_metrics(recorded_at)`);
    console.log('   ✅ All 9 indexes created\n');

    console.log('🎉 SUCCESS! All algorithm tables created!\n');
    console.log('Next steps:');
    console.log('  1. Test: curl -X POST http://localhost:5000/api/algorithms/initialize-all');
    console.log('  2. Chat: curl -X POST http://localhost:5000/api/algorithms/A1/chat -d \'{"message": "Hi"}\'');
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error creating tables:', error.message);
    process.exit(1);
  }
}

createTables();
