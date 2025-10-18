#!/usr/bin/env tsx
/**
 * Mundo Tango - Import Path Validator
 * 
 * Scans TypeScript/JavaScript files for import statements and validates
 * that the imported files actually exist on the filesystem.
 * 
 * This prevents the "import-before-file-exists" failure mode.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ImportError {
  file: string;
  lineNumber: number;
  importPath: string;
  resolvedPath: string;
}

/**
 * Extract import statements from a file
 */
function extractImports(content: string): { path: string; line: number }[] {
  const imports: { path: string; line: number }[] = [];
  const lines = content.split('\n');
  
  // Regex patterns for different import styles
  const patterns = [
    /import\s+.*\s+from\s+['"]([^'"]+)['"]/g,  // import ... from 'path'
    /import\s+['"]([^'"]+)['"]/g,               // import 'path'
    /require\(['"]([^'"]+)['"]\)/g,             // require('path')
  ];
  
  lines.forEach((line, index) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      return;
    }
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        imports.push({
          path: match[1],
          line: index + 1,
        });
      }
    }
  });
  
  return imports;
}

/**
 * Resolve import path to actual file path
 */
function resolveImportPath(
  importPath: string,
  sourceFile: string,
  projectRoot: string
): string | null {
  // Skip external modules (no ./ or ../)
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    return null; // External npm package, not a file
  }
  
  const sourceDir = path.dirname(path.resolve(projectRoot, sourceFile));
  let resolvedPath = path.resolve(sourceDir, importPath);
  
  // Try different extensions
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', ''];
  
  for (const ext of extensions) {
    const testPath = resolvedPath + ext;
    if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) {
      return testPath;
    }
  }
  
  // Try index files
  for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
    const indexPath = path.join(resolvedPath, `index${ext}`);
    if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
      return indexPath;
    }
  }
  
  return resolvedPath + '.ts'; // Default expected path
}

/**
 * Validate all imports in a file
 */
function validateFileImports(
  filePath: string,
  projectRoot: string
): ImportError[] {
  const errors: ImportError[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const imports = extractImports(content);
    
    for (const imp of imports) {
      const resolvedPath = resolveImportPath(imp.path, filePath, projectRoot);
      
      // Skip external modules
      if (resolvedPath === null) {
        continue;
      }
      
      // Check if file exists
      if (!fs.existsSync(resolvedPath)) {
        errors.push({
          file: path.relative(projectRoot, filePath),
          lineNumber: imp.line,
          importPath: imp.path,
          resolvedPath,
        });
      }
    }
  } catch (error) {
    // Ignore files that can't be read
  }
  
  return errors;
}

/**
 * Recursively find all TypeScript/JavaScript files in a directory
 */
function findSourceFiles(dir: string, projectRoot: string): string[] {
  const files: string[] = [];
  
  // Skip node_modules and other irrelevant directories
  const skipDirs = [
    'node_modules',
    'dist',
    '.git',
    '.cache',
    'build',
    'coverage',
    '.next',
    '.nuxt',
  ];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!skipDirs.includes(entry.name)) {
          files.push(...findSourceFiles(fullPath, projectRoot));
        }
      } else if (entry.isFile()) {
        if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Ignore directories that can't be read
  }
  
  return files;
}

/**
 * Validate all imports in specified directories
 */
export async function validateAllImports(
  directories: string[]
): Promise<ImportError[]> {
  const projectRoot = process.cwd();
  const allErrors: ImportError[] = [];
  
  for (const dir of directories) {
    const fullDir = path.join(projectRoot, dir);
    
    if (!fs.existsSync(fullDir)) {
      continue; // Skip non-existent directories
    }
    
    const files = findSourceFiles(fullDir, projectRoot);
    
    for (const file of files) {
      const errors = validateFileImports(file, projectRoot);
      allErrors.push(...errors);
    }
  }
  
  return allErrors;
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  const directories = args.length > 0 ? args : ['server', 'client', 'shared'];
  
  console.log('🔍 Validating import statements...\n');
  
  const errors = await validateAllImports(directories);
  
  if (errors.length === 0) {
    console.log('✅ All imports are valid!\n');
    process.exit(0);
  } else {
    console.log(`❌ Found ${errors.length} broken import(s):\n`);
    
    // Group by file
    const errorsByFile = new Map<string, typeof errors>();
    for (const error of errors) {
      if (!errorsByFile.has(error.file)) {
        errorsByFile.set(error.file, []);
      }
      errorsByFile.get(error.file)!.push(error);
    }
    
    // Display errors
    for (const [file, fileErrors] of errorsByFile) {
      console.log(`📄 ${file}:`);
      for (const error of fileErrors) {
        console.log(`  Line ${error.lineNumber}: Cannot find module '${error.importPath}'`);
        console.log(`    Expected at: ${error.resolvedPath}`);
      }
      console.log();
    }
    
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}
