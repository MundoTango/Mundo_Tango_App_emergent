#!/usr/bin/env node
/**
 * 🔄 Documentation Restore System - Recover from Database
 * 
 * This script restores all .md files from PostgreSQL backup.
 * 
 * Usage:
 *   npm run restore-docs              # Restore all files
 *   npm run restore-docs -- --file=replit.md  # Restore specific file
 * 
 * When to use:
 *   - After Replit auto-commit deletes documentation
 *   - After git operations remove files
 *   - To recover previous versions
 */

import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { db } from '../server/db';
import { documentationArchive } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function restoreFile(filename: string, content: string): Promise<void> {
  try {
    // Create directory if it doesn't exist
    const dir = dirname(filename);
    if (dir !== '.') {
      await mkdir(dir, { recursive: true });
    }
    
    // Write file
    await writeFile(filename, content, 'utf-8');
    console.log(`✅ Restored: ${filename}`);
  } catch (error) {
    console.error(`❌ Failed to restore ${filename}:`, error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const specificFile = args.find(arg => arg.startsWith('--file='))?.split('=')[1];
  
  console.log('🔄 Documentation Restore System - Starting...\n');
  
  if (specificFile) {
    // Restore specific file
    console.log(`📄 Restoring specific file: ${specificFile}\n`);
    
    const doc = await db.query.documentationArchive.findFirst({
      where: eq(documentationArchive.filename, specificFile),
    });
    
    if (!doc) {
      console.error(`❌ File not found in archive: ${specificFile}`);
      return;
    }
    
    await restoreFile(doc.filename, doc.content);
    console.log(`\n✅ Successfully restored ${specificFile} (v${doc.version})`);
  } else {
    // Restore all files
    console.log('📁 Restoring ALL documentation from database...\n');
    
    const allDocs = await db.query.documentationArchive.findMany();
    
    if (allDocs.length === 0) {
      console.log('⚠️  No files found in archive');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const doc of allDocs) {
      try {
        await restoreFile(doc.filename, doc.content);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`❌ Error restoring ${doc.filename}:`, error);
      }
    }
    
    console.log(`\n📊 Restore Summary:`);
    console.log(`   ✅ Success: ${successCount} files`);
    console.log(`   ❌ Errors: ${errorCount} files`);
    console.log(`   📁 Total restored: ${successCount} files`);
  }
  
  console.log(`\n🎉 Documentation restored from database!`);
}

main().catch(console.error);
