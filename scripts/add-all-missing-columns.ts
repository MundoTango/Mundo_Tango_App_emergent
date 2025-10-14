import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function addMissingColumns() {
  console.log('🔧 Adding all missing algorithm columns...\n');

  try {
    // Add all columns that might be missing
    const columns = [
      'current_config',
      'default_config', 
      'version',
      'last_modified_by',
      'last_modified_at'
    ];

    for (const col of columns) {
      try {
        await db.execute(sql.raw(`
          ALTER TABLE algorithm_agents 
          ADD COLUMN IF NOT EXISTS ${col} 
          ${col.includes('config') ? "JSONB DEFAULT '{}'::jsonb" : 
            col === 'version' ? 'VARCHAR(50) DEFAULT \'1.0.0\'' :
            col.includes('_at') ? 'TIMESTAMP DEFAULT NOW()' :
            'INTEGER'}
        `));
        console.log(`✅ Added/verified: ${col}`);
      } catch (e: any) {
        if (!e.message.includes('already exists')) {
          throw e;
        }
      }
    }

    console.log('\n🎉 All columns added!\n');
    console.log('Testing initialization...\n');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

addMissingColumns();
