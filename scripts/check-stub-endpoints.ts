#!/usr/bin/env tsx
/**
 * Stub Endpoint Detection Script
 * Pre-commit hook to prevent stub endpoints from being committed
 * 
 * Detects patterns like:
 * - res.json({ success: true }) without actual file I/O or database operations
 * - res.status(200).send() with TODO comments
 * 
 * Usage: npm run check:stubs
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Patterns that indicate stub endpoints
const STUB_PATTERNS = [
  {
    regex: /res\.json\(\s*\{\s*success:\s*true\s*\}\s*\)[^;]*;?\s*\/\/\s*TODO/gi,
    description: 'res.json({ success: true }) with TODO comment'
  },
  {
    regex: /res\.json\(\s*\{\s*success:\s*true\s*\}\s*\)[^;]*;?\s*}\s*\);?\s*$/gm,
    description: 'res.json({ success: true }) as only line in route handler'
  },
  {
    regex: /\/\/\s*TODO:?\s*Implement.*\n.*res\.json\([^)]*success:\s*true/gi,
    description: 'TODO: Implement followed by success response'
  }
];

// Real work indicators (if found, likely not a stub)
const REAL_WORK_PATTERNS = [
  /await.*write.*File/i,
  /await.*db\./i,
  /await.*storage\./i,
  /await.*execute/i,
  /await.*apply/i,
  /execFileSync|execSync/,
  /fs\.writeFile|fs\.readFile/,
  /INSERT INTO|UPDATE|DELETE FROM/i,
];

interface StubDetection {
  file: string;
  line: number;
  pattern: string;
  code: string;
  severity: 'error' | 'warning';
}

function findFiles(dir: string, pattern: RegExp): string[] {
  const files: string[] = [];
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!item.startsWith('.') && item !== 'node_modules') {
          files.push(...findFiles(fullPath, pattern));
        }
      } else if (pattern.test(item)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore permission errors
  }
  
  return files;
}

function checkFile(filePath: string): StubDetection[] {
  const detections: StubDetection[] = [];
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Check each stub pattern
  for (const stubPattern of STUB_PATTERNS) {
    const matches = content.matchAll(stubPattern.regex);
    
    for (const match of matches) {
      const matchIndex = match.index!;
      const lineNumber = content.substring(0, matchIndex).split('\n').length;
      
      // Get context (50 lines before match)
      const contextStart = Math.max(0, lineNumber - 50);
      const contextLines = lines.slice(contextStart, lineNumber + 5).join('\n');
      
      // Check if real work is done in context
      const hasRealWork = REAL_WORK_PATTERNS.some(pattern => pattern.test(contextLines));
      
      if (!hasRealWork) {
        // Likely a stub - no real work detected
        detections.push({
          file: filePath,
          line: lineNumber,
          pattern: stubPattern.description,
          code: lines.slice(lineNumber - 1, lineNumber + 2).join('\n'),
          severity: 'error'
        });
      }
    }
  }
  
  return detections;
}

function main() {
  console.log('🔍 Scanning for stub endpoints...\n');
  
  // Find all route files
  const routeFiles = findFiles('server/routes', /\.ts$/);
  console.log(`Found ${routeFiles.length} route files to scan\n`);
  
  const allDetections: StubDetection[] = [];
  
  for (const file of routeFiles) {
    const detections = checkFile(file);
    allDetections.push(...detections);
  }
  
  if (allDetections.length === 0) {
    console.log('✅ No stub endpoints detected!\n');
    process.exit(0);
  }
  
  console.log(`❌ Found ${allDetections.length} potential stub endpoint(s):\n`);
  
  for (const detection of allDetections) {
    console.log(`File: ${detection.file}:${detection.line}`);
    console.log(`Pattern: ${detection.pattern}`);
    console.log(`Code:\n${detection.code}\n`);
    console.log(`📚 See: docs/agents/AGENT_126_GIT_OPERATIONS.md`);
    console.log(`📚 See: docs/agents/AGENT_127_DEPLOYMENT_SAFETY.md\n`);
    console.log('─'.repeat(80));
  }
  
  console.log('\n🚨 Stub endpoints detected - commit BLOCKED');
  console.log('Fix stub endpoints before committing:\n');
  console.log('1. Implement actual file I/O or database operations');
  console.log('2. Remove TODO comments from working code');
  console.log('3. Return 501 Not Implemented for incomplete endpoints\n');
  
  process.exit(1);
}

main();
