#!/usr/bin/env tsx
/**
 * Mundo Tango ESA LIFE CEO - Import Dependency Validator
 * 
 * Purpose: Scan all TypeScript files and verify every import points to existing files
 * Usage: npm run validate:imports
 * 
 * This catches the classic bug: "Import added before file created"
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface ImportError {
  file: string;
  importPath: string;
  resolvedPath: string;
  lineNumber: number;
}

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof COLORS = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function resolveImportPath(currentFile: string, importPath: string): string | null {
  // Skip non-relative imports (node_modules, @, etc.)
  if (!importPath.startsWith('.')) {
    return null;
  }

  const currentDir = path.dirname(currentFile);
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  
  // Try with each extension
  for (const ext of extensions) {
    const resolved = path.resolve(currentDir, importPath + ext);
    if (fs.existsSync(resolved)) {
      return resolved;
    }
  }

  // Try as directory with index file
  for (const ext of extensions) {
    const resolved = path.resolve(currentDir, importPath, 'index' + ext);
    if (fs.existsSync(resolved)) {
      return resolved;
    }
  }

  return path.resolve(currentDir, importPath + '.ts'); // Return expected path for error reporting
}

function extractImports(filePath: string): ImportError[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const errors: ImportError[] = [];

  // Regex patterns for different import styles
  const importPatterns = [
    /from\s+['"]([^'"]+)['"]/g,           // from "path"
    /import\s+['"]([^'"]+)['"]/g,         // import "path"
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g  // require("path")
  ];

  lines.forEach((line, index) => {
    for (const pattern of importPatterns) {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        const importPath = match[1];
        
        // Skip non-relative imports
        if (!importPath.startsWith('.')) {
          continue;
        }

        const resolvedPath = resolveImportPath(filePath, importPath);
        
        if (resolvedPath && !fs.existsSync(resolvedPath)) {
          errors.push({
            file: filePath,
            importPath,
            resolvedPath,
            lineNumber: index + 1
          });
        }
      }
    }
  });

  return errors;
}

async function validateAllImports(directories: string[]): Promise<ImportError[]> {
  log('\n🔍 Scanning TypeScript files for broken imports...', 'cyan');
  
  const allErrors: ImportError[] = [];
  let totalFiles = 0;

  for (const dir of directories) {
    const pattern = `${dir}/**/*.{ts,tsx}`;
    const files = await glob(pattern, { 
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });

    log(`\n  📂 Scanning ${dir}: ${files.length} files`, 'cyan');
    totalFiles += files.length;

    for (const file of files) {
      const errors = extractImports(file);
      if (errors.length > 0) {
        allErrors.push(...errors);
      }
    }
  }

  log(`\n  Scanned: ${totalFiles} files`, 'cyan');
  return allErrors;
}

async function main() {
  log('╔════════════════════════════════════════════╗', 'cyan');
  log('║    Mundo Tango - Import Validator         ║', 'cyan');
  log('╚════════════════════════════════════════════╝', 'cyan');

  const directories = ['server', 'client', 'shared'];
  const errors = await validateAllImports(directories);

  if (errors.length === 0) {
    log('\n✅ All imports are valid!', 'green');
    log('   No broken import statements found.', 'green');
    process.exit(0);
  } else {
    log(`\n❌ Found ${errors.length} broken import(s):`, 'red');
    
    // Group by file
    const errorsByFile = new Map<string, ImportError[]>();
    for (const error of errors) {
      if (!errorsByFile.has(error.file)) {
        errorsByFile.set(error.file, []);
      }
      errorsByFile.get(error.file)!.push(error);
    }

    // Display grouped errors
    for (const [file, fileErrors] of errorsByFile) {
      log(`\n  📄 ${file}:`, 'yellow');
      for (const error of fileErrors) {
        log(`    Line ${error.lineNumber}: Cannot find module '${error.importPath}'`, 'red');
        log(`      Expected at: ${error.resolvedPath}`, 'red');
      }
    }

    log('\n💡 Fix these imports before deployment:', 'yellow');
    log('   1. Create the missing files, OR', 'yellow');
    log('   2. Remove/update the import statements', 'yellow');
    log('   3. Run this check again: npm run validate:imports\n', 'yellow');
    
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    log(`\n❌ CRITICAL ERROR: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

export { validateAllImports, extractImports };
