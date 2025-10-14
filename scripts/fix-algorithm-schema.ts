import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function fixSchema() {
  console.log('🔧 Fixing algorithm_agents schema...\n');

  try {
    // Add current_config column
    await db.execute(sql`
      ALTER TABLE algorithm_agents 
      ADD COLUMN IF NOT EXISTS current_config JSONB DEFAULT '{}'::jsonb
    `);
    console.log('✅ Added current_config column');

    // Verify columns
    const columns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'algorithm_agents'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 algorithm_agents columns:');
    console.log(columns);
    
    console.log('\n🎉 Schema fixed! Now test with:');
    console.log('   curl -X POST http://localhost:5000/api/algorithms/initialize-all\n');
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

fixSchema();
