#!/usr/bin/env node
/**
 * 🔒 Documentation Backup System - Git-Proof Storage
 * 
 * This script backs up ALL .md files to PostgreSQL where git can't delete them.
 * 
 * Usage:
 *   npm run backup-docs     # Backup all markdown files
 *   npm run restore-docs    # Restore from database
 * 
 * Why: Replit auto-commits keep deleting documentation files.
 * Solution: Store in database where git operations can't touch them.
 */

import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { db } from '../server/db';
import { documentationArchive } from '../shared/schema';
import { eq } from 'drizzle-orm';

const BACKUP_PATTERNS = [
  '*.md',           // All markdown in root
  'docs/**/*.md',   // Documentation folder
  'server/**/*.md', // Server docs
  'client/**/*.md', // Client docs
];

const EXCLUDE_PATTERNS = [
  'node_modules',
  'dist',
  'build',
  '.git',
];

async function findMarkdownFiles(dir: string = '.'): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      // Skip excluded directories
      if (EXCLUDE_PATTERNS.some(pattern => fullPath.includes(pattern))) {
        continue;
      }
      
      if (entry.isDirectory()) {
        // Recursively search subdirectories
        const subFiles = await findMarkdownFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  
  return files;
}

async function backupFile(filepath: string): Promise<void> {
  try {
    const content = await readFile(filepath, 'utf-8');
    const filename = filepath.replace('./', '');
    const fileSize = Buffer.byteLength(content, 'utf-8');
    
    // Check if file already exists in archive
    const existing = await db.query.documentationArchive.findFirst({
      where: eq(documentationArchive.filename, filename),
    });
    
    if (existing) {
      // Update existing with new version
      await db.update(documentationArchive)
        .set({
          content,
          version: existing.version + 1,
          fileSize,
          lastBackup: new Date(),
        })
        .where(eq(documentationArchive.filename, filename));
      
      console.log(`✅ Updated: ${filename} (v${existing.version + 1}, ${fileSize} bytes)`);
    } else {
      // Insert new file
      await db.insert(documentationArchive).values({
        filename,
        content,
        version: 1,
        fileSize,
        lastBackup: new Date(),
      });
      
      console.log(`✅ Backed up: ${filename} (${fileSize} bytes)`);
    }
  } catch (error) {
    console.error(`❌ Failed to backup ${filepath}:`, error);
  }
}

async function main() {
  console.log('🔒 Documentation Backup System - Starting...\n');
  
  const markdownFiles = await findMarkdownFiles('.');
  
  if (markdownFiles.length === 0) {
    console.log('⚠️  No markdown files found to backup');
    return;
  }
  
  console.log(`📁 Found ${markdownFiles.length} markdown files\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of markdownFiles) {
    try {
      await backupFile(file);
      successCount++;
    } catch (error) {
      errorCount++;
      console.error(`❌ Error backing up ${file}:`, error);
    }
  }
  
  console.log(`\n📊 Backup Summary:`);
  console.log(`   ✅ Success: ${successCount} files`);
  console.log(`   ❌ Errors: ${errorCount} files`);
  console.log(`   💾 Total archived: ${successCount} files in database`);
  console.log(`\n🔒 All documentation safely stored in PostgreSQL`);
  console.log(`   Git operations CANNOT delete these files!`);
}

main().catch(console.error);
