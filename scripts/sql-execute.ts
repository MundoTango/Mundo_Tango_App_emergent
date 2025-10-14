import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import { readFileSync } from 'fs';

async function executeSql() {
  const sqlFile = process.argv[2];
  
  if (!sqlFile) {
    console.error('❌ Usage: npm run sql:execute <file.sql>');
    process.exit(1);
  }

  try {
    console.log(`📂 Reading SQL from: ${sqlFile}`);
    const sqlContent = readFileSync(sqlFile, 'utf-8');
    
    // Split by semicolon but keep multi-line statements together
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 60).replace(/\s+/g, ' ');
      
      try {
        await db.execute(sql.raw(statement));
        console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message?.includes('already exists')) {
          console.log(`⚠️  [${i + 1}/${statements.length}] Already exists: ${preview}...`);
        } else {
          console.error(`❌ [${i + 1}/${statements.length}] Error: ${error.message}`);
          throw error;
        }
      }
    }

    console.log(`\n🎉 Successfully executed all statements from ${sqlFile}`);
    process.exit(0);
  } catch (error: any) {
    console.error(`\n❌ Migration failed: ${error.message}`);
    process.exit(1);
  }
}

executeSql();
