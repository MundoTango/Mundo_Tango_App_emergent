import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function checkSchema() {
  const result = await db.execute(sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'algorithm_agents'
    ORDER BY ordinal_position
  `);

  console.log('\n📊 algorithm_agents table columns:\n');
  result.rows.forEach((row: any) => {
    console.log(`  ${row.column_name.padEnd(20)} ${row.data_type.padEnd(25)} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}`);
  });
  
  process.exit(0);
}

checkSchema();
