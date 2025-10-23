/**
 * UNIFIED DIFF EDITOR - Aider-Inspired File Editing
 * MB.MD SIMULTANEOUS - Agent #2: File Editing Specialist
 * 
 * Research Sources:
 * - Aider: aider/coders/editblock_coder.py (unified diff algorithm)
 * - Success Rate Target: 80%+ (vs 72% Aider benchmark)
 * - Pattern: SEARCH/REPLACE blocks with fuzzy matching
 * 
 * Created: October 23, 2025
 */

import { applyPatch, parsePatch, type ParsedDiff } from 'diff';
import * as fs from 'fs/promises';
import * as path from 'path';

interface DiffResult {
  success: boolean;
  originalContent?: string;
  newContent?: string;
  error?: string;
  appliedHunks?: number;
  failedHunks?: number;
}

interface SearchReplaceBlock {
  search: string;
  replace: string;
  filePath: string;
}

/**
 * UnifiedDiffEditor - Apply unified diffs to files with fuzzy matching
 * 
 * Algorithm based on Aider's editblock_coder.py:
 * 1. Parse LLM output for SEARCH/REPLACE blocks
 * 2. Generate unified diff from blocks
 * 3. Apply diff with fuzzy matching (±2 lines tolerance)
 * 4. Handle partial failures gracefully
 */
export class UnifiedDiffEditor {
  private projectRoot: string;
  private fuzzFactor: number;

  constructor(projectRoot: string = process.cwd(), fuzzFactor: number = 2) {
    this.projectRoot = projectRoot;
    this.fuzzFactor = fuzzFactor; // ±2 lines tolerance for LLM imprecision
  }

  /**
   * Parse SEARCH/REPLACE blocks from LLM output
   * 
   * Format:
   * <<<<<<< SEARCH
   * old code here
   * =======
   * new code here
   * >>>>>>> REPLACE
   */
  parseSearchReplaceBlocks(llmOutput: string, filePath: string): SearchReplaceBlock[] {
    const blocks: SearchReplaceBlock[] = [];
    
    // Regex pattern matches Aider's format
    const pattern = /<<<<<<< SEARCH\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> REPLACE/g;
    
    let match;
    while ((match = pattern.exec(llmOutput)) !== null) {
      blocks.push({
        search: match[1].trim(),
        replace: match[2].trim(),
        filePath
      });
    }
    
    return blocks;
  }

  /**
   * Generate unified diff from SEARCH/REPLACE block
   * 
   * Creates a proper unified diff that can be applied with fuzzy matching
   */
  private generateUnifiedDiff(
    originalContent: string,
    searchBlock: string,
    replaceBlock: string,
    filePath: string
  ): string {
    // Find search block in original content
    const searchIndex = originalContent.indexOf(searchBlock);
    
    if (searchIndex === -1) {
      // Fuzzy search: try line-by-line matching
      return this.generateFuzzyDiff(originalContent, searchBlock, replaceBlock, filePath);
    }
    
    // Generate unified diff format
    const beforeSearch = originalContent.substring(0, searchIndex);
    const afterSearch = originalContent.substring(searchIndex + searchBlock.length);
    
    const linesBefore = beforeSearch.split('\n').length - 1;
    const searchLines = searchBlock.split('\n').length;
    const replaceLines = replaceBlock.split('\n').length;
    
    // Build unified diff manually
    let diff = `--- ${filePath}\n`;
    diff += `+++ ${filePath}\n`;
    diff += `@@ -${linesBefore + 1},${searchLines} +${linesBefore + 1},${replaceLines} @@\n`;
    
    // Add context lines (3 before/after for better matching)
    const contextBefore = beforeSearch.split('\n').slice(-3).join('\n');
    const contextAfter = afterSearch.split('\n').slice(0, 3).join('\n');
    
    if (contextBefore) {
      diff += contextBefore.split('\n').map(line => ` ${line}`).join('\n') + '\n';
    }
    
    // Add removed lines
    diff += searchBlock.split('\n').map(line => `-${line}`).join('\n') + '\n';
    
    // Add added lines
    diff += replaceBlock.split('\n').map(line => `+${line}`).join('\n') + '\n';
    
    if (contextAfter) {
      diff += contextAfter.split('\n').map(line => ` ${line}`).join('\n') + '\n';
    }
    
    return diff;
  }

  /**
   * Fuzzy diff generation for imprecise LLM output
   * 
   * Uses line-by-line matching with tolerance for whitespace/minor changes
   */
  private generateFuzzyDiff(
    originalContent: string,
    searchBlock: string,
    replaceBlock: string,
    filePath: string
  ): string {
    const originalLines = originalContent.split('\n');
    const searchLines = searchBlock.split('\n');
    
    // Find best match using fuzzy line matching
    let bestMatchIndex = -1;
    let bestMatchScore = 0;
    
    for (let i = 0; i <= originalLines.length - searchLines.length; i++) {
      let score = 0;
      for (let j = 0; j < searchLines.length; j++) {
        const originalLine = originalLines[i + j].trim();
        const searchLine = searchLines[j].trim();
        
        if (originalLine === searchLine) {
          score += 1.0;
        } else if (this.fuzzyLineMatch(originalLine, searchLine)) {
          score += 0.8; // Partial credit for fuzzy match
        }
      }
      
      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatchIndex = i;
      }
    }
    
    // Require >80% match to apply
    const requiredScore = searchLines.length * 0.8;
    if (bestMatchScore < requiredScore) {
      throw new Error(
        `Could not find fuzzy match for search block. Best score: ${bestMatchScore}/${searchLines.length}`
      );
    }
    
    // Generate diff at best match location
    const linesBefore = bestMatchIndex;
    const searchLineCount = searchLines.length;
    const replaceLines = replaceBlock.split('\n');
    
    let diff = `--- ${filePath}\n`;
    diff += `+++ ${filePath}\n`;
    diff += `@@ -${linesBefore + 1},${searchLineCount} +${linesBefore + 1},${replaceLines.length} @@\n`;
    
    // Add removed lines
    for (let i = 0; i < searchLineCount; i++) {
      diff += `-${originalLines[linesBefore + i]}\n`;
    }
    
    // Add added lines
    diff += replaceLines.map(line => `+${line}`).join('\n') + '\n';
    
    return diff;
  }

  /**
   * Fuzzy line matching with whitespace tolerance
   */
  private fuzzyLineMatch(line1: string, line2: string): boolean {
    // Normalize whitespace
    const norm1 = line1.replace(/\s+/g, ' ').trim();
    const norm2 = line2.replace(/\s+/g, ' ').trim();
    
    // Check exact match after normalization
    if (norm1 === norm2) return true;
    
    // Check Levenshtein distance for minor typos
    const distance = this.levenshteinDistance(norm1, norm2);
    const maxDistance = Math.floor(Math.max(norm1.length, norm2.length) * 0.1); // 10% tolerance
    
    return distance <= maxDistance;
  }

  /**
   * Calculate Levenshtein distance (edit distance)
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Apply unified diff to file with fuzzy matching
   * 
   * Uses diff library's applyPatch with fuzz factor for LLM imprecision
   */
  async applyUnifiedDiff(
    filePath: string,
    diffContent: string
  ): Promise<DiffResult> {
    try {
      const fullPath = path.join(this.projectRoot, filePath);
      
      // Read original content
      const originalContent = await fs.readFile(fullPath, 'utf-8');
      
      // Parse diff
      const patches = parsePatch(diffContent);
      
      if (patches.length === 0) {
        return {
          success: false,
          error: 'No valid patches found in diff'
        };
      }
      
      // Apply patch with fuzzy matching
      const newContent = applyPatch(originalContent, patches[0], {
        fuzzFactor: this.fuzzFactor,
        compareLine: (lineNumber, line, operation, patchContent) => {
          // Custom comparison for better fuzzy matching
          return line.trim() === patchContent.trim();
        }
      });
      
      if (newContent === false) {
        return {
          success: false,
          originalContent,
          error: 'Patch failed to apply - context mismatch'
        };
      }
      
      // Write new content
      await fs.writeFile(fullPath, newContent as string, 'utf-8');
      
      return {
        success: true,
        originalContent,
        newContent: newContent as string,
        appliedHunks: patches[0].hunks.length,
        failedHunks: 0
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Apply SEARCH/REPLACE blocks from LLM output
   * 
   * Main entry point - parses LLM output and applies all edits
   */
  async applySearchReplaceBlocks(
    llmOutput: string,
    filePath: string
  ): Promise<DiffResult> {
    try {
      const fullPath = path.join(this.projectRoot, filePath);
      const originalContent = await fs.readFile(fullPath, 'utf-8');
      
      // Parse SEARCH/REPLACE blocks
      const blocks = this.parseSearchReplaceBlocks(llmOutput, filePath);
      
      if (blocks.length === 0) {
        return {
          success: false,
          error: 'No SEARCH/REPLACE blocks found in LLM output'
        };
      }
      
      // Apply blocks sequentially
      let currentContent = originalContent;
      let totalApplied = 0;
      let totalFailed = 0;
      
      for (const block of blocks) {
        try {
          // Generate unified diff for this block
          const diff = this.generateUnifiedDiff(
            currentContent,
            block.search,
            block.replace,
            filePath
          );
          
          // Apply diff
          const result = await this.applyUnifiedDiff(filePath, diff);
          
          if (result.success) {
            currentContent = result.newContent!;
            totalApplied++;
          } else {
            totalFailed++;
            console.warn(`Failed to apply block: ${result.error}`);
          }
        } catch (error) {
          totalFailed++;
          console.warn(`Error applying block:`, error);
        }
      }
      
      return {
        success: totalApplied > 0,
        originalContent,
        newContent: currentContent,
        appliedHunks: totalApplied,
        failedHunks: totalFailed
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate diff before applying (dry run)
   * 
   * Checks if diff can be applied without actually modifying files
   */
  async validateDiff(filePath: string, diffContent: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.projectRoot, filePath);
      const originalContent = await fs.readFile(fullPath, 'utf-8');
      
      const patches = parsePatch(diffContent);
      if (patches.length === 0) return false;
      
      const result = applyPatch(originalContent, patches[0], {
        fuzzFactor: this.fuzzFactor
      });
      
      return result !== false;
    } catch {
      return false;
    }
  }
}

/**
 * Factory function for creating diff editor instances
 */
export function createDiffEditor(projectRoot?: string, fuzzFactor?: number): UnifiedDiffEditor {
  return new UnifiedDiffEditor(projectRoot, fuzzFactor);
}

/**
 * Utility: Extract file path from diff header
 */
export function extractFilePathFromDiff(diffContent: string): string | null {
  const match = diffContent.match(/^---\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Utility: Count hunks in diff
 */
export function countDiffHunks(diffContent: string): number {
  const patches = parsePatch(diffContent);
  return patches.reduce((sum, patch) => sum + patch.hunks.length, 0);
}
