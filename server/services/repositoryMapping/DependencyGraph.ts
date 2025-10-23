/**
 * DEPENDENCY GRAPH - Track Import/Export Relationships
 * MB.MD SIMULTANEOUS - Agent #3: Repository Mapping Specialist
 * 
 * Builds a directed graph of file dependencies
 * Used for focused repository maps (include related files)
 * 
 * Created: October 23, 2025
 */

import type { FileSymbols } from './ASTParser';

interface DependencyNode {
  filePath: string;
  imports: string[]; // Files this file imports
  exports: string[]; // Symbols this file exports
  importedBy: string[]; // Files that import this file
}

interface DependencyEdge {
  from: string;
  to: string;
  importedSymbols: string[];
}

/**
 * DependencyGraph - Map file dependencies for intelligent context
 */
export class DependencyGraph {
  private nodes: Map<string, DependencyNode>;
  private edges: DependencyEdge[];

  constructor() {
    this.nodes = new Map();
    this.edges = [];
  }

  /**
   * Build dependency graph from parsed files
   */
  build(fileSymbolsArray: FileSymbols[]): void {
    // Clear existing graph
    this.nodes.clear();
    this.edges = [];

    // Create nodes
    for (const fileSymbols of fileSymbolsArray) {
      this.nodes.set(fileSymbols.filePath, {
        filePath: fileSymbols.filePath,
        imports: fileSymbols.imports,
        exports: fileSymbols.exports,
        importedBy: []
      });
    }

    // Create edges (resolve imports to file paths)
    for (const fileSymbols of fileSymbolsArray) {
      for (const importPath of fileSymbols.imports) {
        // Resolve relative import to absolute file path
        const resolvedPath = this.resolveImport(importPath, fileSymbols.filePath, fileSymbolsArray);
        
        if (resolvedPath) {
          this.edges.push({
            from: fileSymbols.filePath,
            to: resolvedPath,
            importedSymbols: [] // TODO: Extract specific symbols
          });

          // Update importedBy
          const targetNode = this.nodes.get(resolvedPath);
          if (targetNode) {
            targetNode.importedBy.push(fileSymbols.filePath);
          }
        }
      }
    }
  }

  /**
   * Resolve import path to actual file
   */
  private resolveImport(
    importPath: string,
    fromFile: string,
    allFiles: FileSymbols[]
  ): string | null {
    // Skip external packages (no ./ or ../)
    if (!importPath.startsWith('.')) {
      return null;
    }

    // Try to find matching file
    for (const file of allFiles) {
      if (file.filePath.includes(importPath.replace(/^\.\//, ''))) {
        return file.filePath;
      }
    }

    return null;
  }

  /**
   * Get all files that depend on a given file
   */
  getDependents(filePath: string): string[] {
    const node = this.nodes.get(filePath);
    return node?.importedBy || [];
  }

  /**
   * Get all files that a given file depends on
   */
  getDependencies(filePath: string): string[] {
    return this.edges
      .filter(edge => edge.from === filePath)
      .map(edge => edge.to);
  }

  /**
   * Get related files (dependencies + dependents)
   */
  getRelatedFiles(filePath: string, depth: number = 1): string[] {
    const related = new Set<string>();
    const visited = new Set<string>();
    
    const traverse = (file: string, currentDepth: number) => {
      if (currentDepth > depth || visited.has(file)) return;
      visited.add(file);

      // Add dependencies
      const dependencies = this.getDependencies(file);
      dependencies.forEach(dep => {
        related.add(dep);
        traverse(dep, currentDepth + 1);
      });

      // Add dependents
      const dependents = this.getDependents(file);
      dependents.forEach(dep => {
        related.add(dep);
        traverse(dep, currentDepth + 1);
      });
    };

    traverse(filePath, 0);
    return Array.from(related);
  }

  /**
   * Find circular dependencies
   */
  findCircularDependencies(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string, path: string[]): void => {
      if (recursionStack.has(node)) {
        // Found a cycle
        const cycleStart = path.indexOf(node);
        cycles.push(path.slice(cycleStart));
        return;
      }

      if (visited.has(node)) return;

      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const dependencies = this.getDependencies(node);
      for (const dep of dependencies) {
        dfs(dep, [...path]);
      }

      recursionStack.delete(node);
    };

    for (const node of this.nodes.keys()) {
      dfs(node, []);
    }

    return cycles;
  }

  /**
   * Get graph statistics
   */
  getStats(): {
    totalFiles: number;
    totalEdges: number;
    averageDependencies: number;
    mostDepended: { file: string; count: number };
    circularDependencies: number;
  } {
    const totalFiles = this.nodes.size;
    const totalEdges = this.edges.length;
    
    // Find most depended file
    let mostDepended = { file: '', count: 0 };
    for (const [filePath, node] of this.nodes.entries()) {
      if (node.importedBy.length > mostDepended.count) {
        mostDepended = { file: filePath, count: node.importedBy.length };
      }
    }

    const circularDeps = this.findCircularDependencies();

    return {
      totalFiles,
      totalEdges,
      averageDependencies: totalFiles > 0 ? totalEdges / totalFiles : 0,
      mostDepended,
      circularDependencies: circularDeps.length
    };
  }

  /**
   * Export graph as DOT format (for visualization)
   */
  toDot(): string {
    let dot = 'digraph DependencyGraph {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=box];\n\n';

    for (const edge of this.edges) {
      const fromLabel = edge.from.split('/').pop();
      const toLabel = edge.to.split('/').pop();
      dot += `  "${fromLabel}" -> "${toLabel}";\n`;
    }

    dot += '}\n';
    return dot;
  }
}

/**
 * Factory function
 */
export function createDependencyGraph(): DependencyGraph {
  return new DependencyGraph();
}
