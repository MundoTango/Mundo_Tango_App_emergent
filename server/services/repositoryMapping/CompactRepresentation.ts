/**
 * COMPACT REPRESENTATION - 20x Code Compression
 * MB.MD SIMULTANEOUS - Agent #3: Repository Mapping Specialist
 * 
 * Research Sources:
 * - Aider: aider/repomap.py (compact map generation)
 * - Target: 100k LOC → 5k tokens (20x compression)
 * 
 * Created: October 23, 2025
 */

import { type FileSymbols } from './ASTParser';

interface RepositoryMap {
  files: CompactFile[];
  totalLOC: number;
  totalFiles: number;
  compressionRatio: number;
  generatedAt: Date;
}

interface CompactFile {
  path: string;
  loc: number;
  symbols: string[];
  imports: string[];
  exports: string[];
}

/**
 * CompactRepresentation - Generate Aider-style compact repository maps
 * 
 * Compression Strategy:
 * 1. Function signature only (no body): "function login(email, password)" vs 50 lines
 * 2. Class outline only (methods list): "class AuthService → 10 methods" vs 500 lines
 * 3. Import/export summary: "[React, lodash]" vs full import statements
 * 4. Remove comments, implementation details
 * 
 * Result: 100k LOC → 5k tokens (20x compression)
 */
export class CompactRepresentation {
  /**
   * Generate compact repository map from parsed files
   */
  generateRepositoryMap(fileSymbolsArray: FileSymbols[]): RepositoryMap {
    const compactFiles: CompactFile[] = [];
    let totalLOC = 0;

    for (const fileSymbols of fileSymbolsArray) {
      const compactFile = this.compressFile(fileSymbols);
      compactFiles.push(compactFile);
      totalLOC += fileSymbols.loc;
    }

    // Calculate compression ratio
    const originalTokens = totalLOC * 20; // Rough: 1 LOC ≈ 20 tokens
    const compactTokens = this.estimateTokens(compactFiles);
    const compressionRatio = originalTokens / compactTokens;

    return {
      files: compactFiles,
      totalLOC,
      totalFiles: compactFiles.length,
      compressionRatio,
      generatedAt: new Date()
    };
  }

  /**
   * Compress single file into compact representation
   */
  private compressFile(fileSymbols: FileSymbols): CompactFile {
    const symbols: string[] = [];

    // Group by type
    const exports = fileSymbols.symbols.filter(s => s.exported);
    const internals = fileSymbols.symbols.filter(s => !s.exported);

    // Prioritize exported symbols (more important for API understanding)
    for (const symbol of exports) {
      symbols.push(this.formatSymbol(symbol, true));
    }

    // Add important internal symbols (classes, main functions)
    for (const symbol of internals) {
      if (symbol.type === 'class' || symbol.type === 'function') {
        symbols.push(this.formatSymbol(symbol, false));
      }
    }

    return {
      path: fileSymbols.filePath,
      loc: fileSymbols.loc,
      symbols,
      imports: fileSymbols.imports,
      exports: fileSymbols.exports
    };
  }

  /**
   * Format symbol compactly
   */
  private formatSymbol(symbol: any, exported: boolean): string {
    const exportPrefix = exported ? '✓ ' : '  ';
    
    switch (symbol.type) {
      case 'function':
        const params = symbol.params?.join(', ') || '';
        if (symbol.scope) {
          return `${exportPrefix}  → ${symbol.name}(${params})`;
        }
        return `${exportPrefix}function ${symbol.name}(${params})`;
      
      case 'class':
        return `${exportPrefix}class ${symbol.name}`;
      
      case 'interface':
        return `${exportPrefix}interface ${symbol.name}`;
      
      case 'type':
        return `${exportPrefix}type ${symbol.name}`;
      
      case 'const':
      case 'let':
      case 'var':
        return `${exportPrefix}${symbol.type} ${symbol.name}`;
      
      default:
        return `${exportPrefix}${symbol.name}`;
    }
  }

  /**
   * Estimate token count for compact map
   */
  private estimateTokens(files: CompactFile[]): number {
    let tokens = 0;

    for (const file of files) {
      // File header: "## path/to/file.ts (150 LOC)"
      tokens += 10;

      // Imports: "imports: [React, lodash, ...]"
      tokens += file.imports.length * 2;

      // Exports: "exports: [default, AuthService, ...]"
      tokens += file.exports.length * 2;

      // Symbols: Each compact symbol ≈ 5 tokens
      tokens += file.symbols.length * 5;
    }

    return tokens;
  }

  /**
   * Format repository map as string (for LLM context)
   */
  formatAsString(repoMap: RepositoryMap): string {
    let output = `# Repository Map (${repoMap.totalFiles} files, ${repoMap.totalLOC} LOC)\n`;
    output += `# Compression: ${repoMap.compressionRatio.toFixed(1)}x\n`;
    output += `# Generated: ${repoMap.generatedAt.toISOString()}\n\n`;

    for (const file of repoMap.files) {
      output += this.formatFile(file);
    }

    return output;
  }

  /**
   * Format single file
   */
  private formatFile(file: CompactFile): string {
    let output = `## ${file.path} (${file.loc} LOC)\n`;

    if (file.imports.length > 0) {
      output += `imports: [${file.imports.join(', ')}]\n`;
    }

    if (file.exports.length > 0) {
      output += `exports: [${file.exports.join(', ')}]\n`;
    }

    output += file.symbols.join('\n');
    output += '\n\n';

    return output;
  }

  /**
   * Generate focused map for specific files (for targeted edits)
   */
  generateFocusedMap(
    allFiles: FileSymbols[],
    focusFiles: string[],
    includeRelated: boolean = true
  ): RepositoryMap {
    let selectedFiles = allFiles.filter(f => focusFiles.includes(f.filePath));

    // Include related files (imported by or importing focus files)
    if (includeRelated) {
      const relatedPaths = new Set<string>();
      
      for (const file of selectedFiles) {
        // Add files that import this file
        const importers = allFiles.filter(f => 
          f.imports.some(imp => file.filePath.includes(imp))
        );
        importers.forEach(f => relatedPaths.add(f.filePath));

        // Add files imported by this file
        for (const imp of file.imports) {
          const imported = allFiles.find(f => f.filePath.includes(imp));
          if (imported) relatedPaths.add(imported.filePath);
        }
      }

      const relatedFiles = allFiles.filter(f => relatedPaths.has(f.filePath));
      selectedFiles = [...selectedFiles, ...relatedFiles];
    }

    return this.generateRepositoryMap(selectedFiles);
  }
}

/**
 * Factory function
 */
export function createCompactRepresentation(): CompactRepresentation {
  return new CompactRepresentation();
}
