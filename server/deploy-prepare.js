#!/usr/bin/env node
// ESA LIFE CEO 61x21 - Deployment Preparation Script
// This script prepares the database for deployment by fixing schema conflicts

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function prepareDeployment() {
  console.log('🚀 ESA LIFE CEO 61x21 - Preparing deployment...');
  
  // Check if we have a production database URL
  const prodDbUrl = process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!prodDbUrl) {
    console.log('⚠️  No production database URL found. Skipping preparation.');
    return;
  }
  
  try {
    // Connect to production database
    const sql = neon(prodDbUrl);
    
    console.log('📊 Checking capabilities column type...');
    
    // Check current column type
    const columnInfo = await sql`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'agents' 
      AND column_name = 'capabilities'
    `;
    
    if (columnInfo.length === 0) {
      console.log('⚠️  Agents table or capabilities column not found.');
      return;
    }
    
    const currentType = columnInfo[0].data_type;
    console.log(`Current capabilities column type: ${currentType}`);
    
    if (currentType === 'jsonb') {
      console.log('✅ Capabilities column is already jsonb. No migration needed.');
      return;
    }
    
    console.log('🔄 Converting capabilities column to jsonb...');
    
    // Perform safe migration
    await sql`ALTER TABLE agents ADD COLUMN IF NOT EXISTS capabilities_temp jsonb DEFAULT '[]'::jsonb`;
    console.log('✅ Created temporary column');
    
    // Copy data with safe conversion
    await sql`
      UPDATE agents 
      SET capabilities_temp = 
        CASE 
          WHEN capabilities IS NULL THEN '[]'::jsonb
          WHEN capabilities = '' THEN '[]'::jsonb
          ELSE 
            CASE 
              WHEN capabilities::text LIKE '[%' OR capabilities::text LIKE '{%' 
              THEN capabilities::jsonb
              ELSE '[]'::jsonb
            END
        END
    `;
    console.log('✅ Migrated data to temporary column');
    
    // Drop old column and rename
    await sql`ALTER TABLE agents DROP COLUMN capabilities`;
    await sql`ALTER TABLE agents RENAME COLUMN capabilities_temp TO capabilities`;
    console.log('✅ Replaced old column with new jsonb column');
    
    // Verify
    const verifyInfo = await sql`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'agents' 
      AND column_name = 'capabilities'
    `;
    
    if (verifyInfo[0].data_type === 'jsonb') {
      console.log('✅ Migration successful! Capabilities column is now jsonb.');
    } else {
      console.log('⚠️  Migration may have issues. Please check manually.');
    }
    
  } catch (error) {
    console.error('❌ Deployment preparation failed:', error.message);
    console.log('💡 You may need to manually fix the database schema.');
    console.log('   Run the SQL script at: server/migrations/fix-capabilities-column.sql');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  prepareDeployment()
    .then(() => {
      console.log('🎉 Deployment preparation complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { prepareDeployment };