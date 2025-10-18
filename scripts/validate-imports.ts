#!/usr/bin/env tsx
/**
 * Mundo Tango - Import Path Validator
 * Scans for broken relative imports across the codebase
 */

import { readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join, dirname, extname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

interface BrokenImport {
  file: string;
  line: number;
  importPath: string;
  expectedPath: string;
}

const brokenImports: BrokenImport[] = [];
const excludeDirs = ['node_modules', 'dist', '.cache', 'build', '.git', 'attached_assets'];
const validExtensions = ['.ts', '.tsx', '.js', '.jsx'];

/**
 * Recursively find all source files
 */
function findSourceFiles(dir: string): string[] {
  const files: string[] = [];
  
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(entry)) {
          files.push(...findSourceFiles(fullPath));
        }
      } else if (stat.isFile()) {
        const ext = extname(entry);
        if (validExtensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return files;
}

/**
 * Extract import statements from file
 */
function extractImports(content: string): { line: number; path: string }[] {
  const imports: { line: number; path: string }[] = [];
  const lines = content.split('\n');
  
  // Match: import ... from 'path' or import 'path' or require('path')
  const importRegex = /(?:import\s+(?:[\w{},\s*]+\s+from\s+)?['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
  
  lines.forEach((line, index) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      return;
    }
    
    let match;
    while ((match = importRegex.exec(line)) !== null) {
      const importPath = match[1] || match[2];
      
      // Only validate relative imports (starting with ./ or ../)
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        imports.push({
          line: index + 1,
          path: importPath
        });
      }
    }
  });
  
  return imports;
}

/**
 * Resolve import path and check if file exists
 */
function validateImport(sourceFile: string, importPath: string): string | null {
  const sourceDir = dirname(sourceFile);
  const resolvedBase = resolve(sourceDir, importPath);
  
  // Try common extensions
  const extensionsToTry = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
  
  for (const ext of extensionsToTry) {
    const fullPath = resolvedBase + ext;
    if (existsSync(fullPath)) {
      return null; // File exists, import is valid
    }
  }
  
  // File not found
  return resolvedBase + '.ts'; // Return expected path
}

/**
 * Main validation function
 */
function validateImports(directories: string[]): void {
  const dirsToScan = directories.length > 0 
    ? directories.map(d => join(projectRoot, d))
    : [join(projectRoot, 'server'), join(projectRoot, 'client'), join(projectRoot, 'shared')];
  
  for (const dir of dirsToScan) {
    if (!existsSync(dir)) {
      continue;
    }
    
    const files = findSourceFiles(dir);
    
    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        const imports = extractImports(content);
        
        for (const { line, path } of imports) {
          const expectedPath = validateImport(file, path);
          
          if (expectedPath) {
            brokenImports.push({
              file: file.replace(projectRoot + '/', ''),
              line,
              importPath: path,
              expectedPath: expectedPath.replace(projectRoot + '/', '')
            });
          }
        }
      } catch (error) {
        // Skip files we can't read
      }
    }
  }
}

// ==============================================
// EXECUTION
// ==============================================

const args = process.argv.slice(2);
validateImports(args);

if (brokenImports.length === 0) {
  console.log('✅ All imports are valid');
  process.exit(0);
} else {
  console.log(`❌ Found ${brokenImports.length} broken import(s):\n`);
  
  // Group by file
  const byFile = brokenImports.reduce((acc, imp) => {
    if (!acc[imp.file]) {
      acc[imp.file] = [];
    }
    acc[imp.file].push(imp);
    return acc;
  }, {} as Record<string, BrokenImport[]>);
  
  for (const [file, imports] of Object.entries(byFile)) {
    console.log(`📄 ${file}`);
    imports.forEach(imp => {
      console.log(`   Line ${imp.line}: import from '${imp.importPath}'`);
      console.log(`   Expected file: ${imp.expectedPath}`);
      console.log('');
    });
  }
  
  process.exit(1);
}
