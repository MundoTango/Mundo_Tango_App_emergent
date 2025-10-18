#!/usr/bin/env tsx
/**
 * 📊 Pre-Deployment Backup Age Check
 * 
 * Ensures backups are recent before allowing deployment.
 * Part of the deployment safety system.
 * 
 * Checks:
 * 1. Last backup is less than 24 hours old
 * 2. Backup database is accessible
 * 3. Critical files are backed up
 * 
 * Usage:
 *   npm run predeploy     # Runs all pre-deployment checks including this
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';

const MAX_BACKUP_AGE_HOURS = 24;
const CRITICAL_FILES = [
  'mb.md',
  'replit.md',
  'shared/schema.ts',
  'AGENT_LEARNING.md',
];

async function checkBackupAge(): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT MAX(last_backup) as last_backup_time
      FROM documentation_archive
    `);
    
    if (!result.rows || result.rows.length === 0) {
      console.error('❌ No backups found in database!');
      return false;
    }
    
    const row = result.rows[0] as { last_backup_time: Date | string };
    const lastBackupTime = new Date(row.last_backup_time);
    const now = new Date();
    const hoursSinceBackup = (now.getTime() - lastBackupTime.getTime()) / (1000 * 60 * 60);
    
    console.log(`📊 Last backup: ${lastBackupTime.toISOString()}`);
    console.log(`⏱️  Age: ${hoursSinceBackup.toFixed(1)} hours`);
    
    if (hoursSinceBackup > MAX_BACKUP_AGE_HOURS) {
      console.error(`❌ Backup is ${hoursSinceBackup.toFixed(1)} hours old (max: ${MAX_BACKUP_AGE_HOURS}h)`);
      console.error(`💡 Run: npm run backup-docs`);
      return false;
    }
    
    console.log(`✅ Backup age OK (${hoursSinceBackup.toFixed(1)}h < ${MAX_BACKUP_AGE_HOURS}h)`);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to check backup age:', error);
    return false;
  }
}

async function checkCriticalFiles(): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT filename 
      FROM documentation_archive 
      WHERE filename = ANY(${CRITICAL_FILES})
    `);
    
    const backedUpFiles = result.rows?.map((row: any) => row.filename) || [];
    const missingFiles = CRITICAL_FILES.filter(f => !backedUpFiles.includes(f));
    
    if (missingFiles.length > 0) {
      console.error('❌ Critical files not backed up:');
      missingFiles.forEach(f => console.error(`   - ${f}`));
      console.error(`💡 Run: npm run backup-docs`);
      return false;
    }
    
    console.log(`✅ All ${CRITICAL_FILES.length} critical files backed up`);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to check critical files:', error);
    return false;
  }
}

async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM documentation_archive`);
    const count = (result.rows?.[0] as any)?.count || 0;
    console.log(`✅ Database accessible (${count} files archived)`);
    return true;
  } catch (error) {
    console.error('❌ Cannot connect to backup database:', error);
    return false;
  }
}

async function main() {
  console.log('📊 Pre-Deployment Backup Check\n');
  
  const checks = await Promise.all([
    checkDatabaseConnection(),
    checkBackupAge(),
    checkCriticalFiles(),
  ]);
  
  const allPassed = checks.every(Boolean);
  
  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('✅ ALL BACKUP CHECKS PASSED');
    console.log('   Safe to deploy!');
    process.exit(0);
  } else {
    console.log('❌ BACKUP CHECKS FAILED');
    console.log('   DO NOT DEPLOY until backups are current');
    console.log('   Run: npm run backup-docs');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('💥 Fatal error during backup check:', error);
  process.exit(1);
});
