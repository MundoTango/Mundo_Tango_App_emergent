#!/usr/bin/env node
/**
 * ESA LIFE CEO 61×21 - Deployment Fix Script
 * Resolves database schema conflicts for production deployment
 */

const { sql } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function fixDeploymentSchema() {
  console.log('🔧 ESA Layer 1: Database Architecture Agent - Fixing deployment schema...');
  
  const db = sql(process.env.DATABASE_URL);
  
  try {
    // Check if capabilities column exists and its type
    const result = await db`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'agents' 
      AND column_name = 'capabilities'
    `;
    
    if (result.length > 0) {
      const currentType = result[0].data_type;
      console.log(`✅ Capabilities column exists with type: ${currentType}`);
      
      // If it's text, convert to jsonb
      if (currentType === 'text') {
        console.log('Converting capabilities from text to jsonb...');
        await db`ALTER TABLE agents ALTER COLUMN capabilities TYPE jsonb USING capabilities::jsonb`;
        console.log('✅ Converted capabilities to jsonb');
      }
    } else {
      // Add the column if it doesn't exist
      console.log('Adding capabilities column...');
      await db`ALTER TABLE agents ADD COLUMN IF NOT EXISTS capabilities jsonb DEFAULT '[]'::jsonb`;
      console.log('✅ Added capabilities column');
    }
    
    // Ensure other required columns exist
    await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamp`;
    await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip varchar(45)`;
    
    console.log('✅ ESA Layer 1: Schema fixed for deployment');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  fixDeploymentSchema();
}

module.exports = { fixDeploymentSchema };