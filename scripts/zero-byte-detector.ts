#!/usr/bin/env tsx
/**
 * Zero-Byte File Detector - MB.MD Railguard #1
 * Purpose: Prevent write tool bug from causing documentation loss
 * Created: October 19, 2025
 */

import { existsSync, statSync, readdirSync } from 'fs';
import { join } from 'path';

interface ZeroByteFile {
  path: string;
  category: 'critical' | 'documentation' | 'code' | 'other';
}

const CRITICAL_EXTENSIONS = ['.md', '.ts', '.tsx', '.js', '.jsx', '.json'];
const CRITICAL_DIRS = ['docs/', 'server/', 'client/', 'shared/', 'scripts/'];

function findZeroByteFiles(dir: string, results: ZeroByteFile[] = []): ZeroByteFile[] {
  try {
    const files = readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = join(dir, file.name);
      
      if (file.name.startsWith('.') || file.name === 'node_modules' || file.name === 'dist') {
        continue;
      }
      
      if (file.isDirectory()) {
        findZeroByteFiles(fullPath, results);
      } else {
        const stats = statSync(fullPath);
        if (stats.size === 0) {
          let category: 'critical' | 'documentation' | 'code' | 'other' = 'other';
          
          if (fullPath.endsWith('.md')) {
            category = 'documentation';
          } else if (CRITICAL_EXTENSIONS.some(ext => fullPath.endsWith(ext))) {
            category = 'code';
          }
          
          if (CRITICAL_DIRS.some(critDir => fullPath.startsWith(critDir))) {
            category = 'critical';
          }
          
          results.push({ path: fullPath, category });
        }
      }
    }
  } catch (error) {
  }
  
  return results;
}

function main() {
  console.log('🔍 MB.MD Railguard #1: Zero-Byte File Detection\\n');
  
  const zeroByteFiles = findZeroByteFiles('.');
  
  if (zeroByteFiles.length === 0) {
    console.log('✅ No zero-byte files detected!\\n');
    process.exit(0);
  }
  
  const critical = zeroByteFiles.filter(f => f.category === 'critical');
  const docs = zeroByteFiles.filter(f => f.category === 'documentation');
  const code = zeroByteFiles.filter(f => f.category === 'code');
  const other = zeroByteFiles.filter(f => f.category === 'other');
  
  let hasCritical = false;
  
  if (critical.length > 0) {
    console.log('🚨 CRITICAL: Zero-byte files in critical directories:');
    critical.forEach(f => console.log(\`   ❌ \${f.path}\`));
    console.log('');
    hasCritical = true;
  }
  
  if (docs.length > 0) {
    console.log('⚠️  WARNING: Zero-byte documentation files:');
    docs.forEach(f => console.log(\`   ⚠️  \${f.path}\`));
    console.log('');
  }
  
  if (code.length > 0) {
    console.log('⚠️  WARNING: Zero-byte code files:');
    code.forEach(f => console.log(\`   ⚠️  \${f.path}\`));
    console.log('');
  }
  
  console.log(\`📊 Summary: \${zeroByteFiles.length} zero-byte files detected\`);
  console.log(\`   Critical: \${critical.length}\`);
  console.log(\`   Documentation: \${docs.length}\`);
  console.log(\`   Code: \${code.length}\`);
  console.log(\`   Other: \${other.length}\\n\`);
  
  if (hasCritical) {
    console.log('❌ DEPLOYMENT BLOCKED: Fix critical zero-byte files first!');
    console.log('   This usually means the write tool failed.');
    console.log('   Use bash commands to recreate these files.\\n');
    process.exit(1);
  } else if (docs.length > 0 || code.length > 0) {
    console.log('⚠️  WARNING: Zero-byte files detected but not blocking deployment.');
    console.log('   Please review and fix these files.\\n');
    process.exit(0);
  }
  
  process.exit(0);
}

main();
