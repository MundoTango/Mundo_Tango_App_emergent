import { applyPatch, createPatch } from 'diff';
import { promises as fs } from 'fs';
import path from 'path';

export interface DiffResult {
  success: boolean;
  filePath: string;
  hunks: number;
  linesChanged: number;
  error?: string;
}

export class UnifiedDiffEditor {
  async applyUnifiedDiff(
    filePath: string,
    diffContent: string,
    basePath: string = process.cwd()
  ): Promise<DiffResult> {
    try {
      const fullPath = path.join(basePath, filePath);
      
      const originalContent = await fs.readFile(fullPath, 'utf-8');
      
      const patch = this.parseSimplifiedDiff(diffContent);
      
      const patchedContent = applyPatch(originalContent, patch);
      
      if (!patchedContent) {
        return {
          success: false,
          filePath,
          hunks: 0,
          linesChanged: 0,
          error: 'Failed to apply patch - diff may not match file content'
        };
      }
      
      await fs.writeFile(fullPath, patchedContent, 'utf-8');
      
      const stats = this.calculateStats(diffContent);
      
      return {
        success: true,
        filePath,
        hunks: stats.hunks,
        linesChanged: stats.linesChanged
      };
    } catch (error) {
      return {
        success: false,
        filePath,
        hunks: 0,
        linesChanged: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private parseSimplifiedDiff(diffContent: string): string {
    const lines = diffContent.split('\n');
    let result: string[] = [];
    
    for (const line of lines) {
      if (line.startsWith('---') || line.startsWith('+++')) {
        result.push(line);
      } else if (line.startsWith('@@')) {
        const parts = line.split('@@');
        if (parts.length >= 2) {
          result.push(`@@${parts[1]}@@`);
        }
      } else if (line.startsWith(' ') || line.startsWith('+') || line.startsWith('-')) {
        result.push(line);
      }
    }
    
    return result.join('\n');
  }

  private calculateStats(diffContent: string): { hunks: number; linesChanged: number } {
    const lines = diffContent.split('\n');
    const hunks = lines.filter(l => l.startsWith('@@')).length;
    const linesChanged = lines.filter(l => 
      l.startsWith('+') && !l.startsWith('+++') ||
      l.startsWith('-') && !l.startsWith('---')
    ).length;
    
    return { hunks, linesChanged };
  }

  async previewDiff(
    filePath: string,
    diffContent: string,
    basePath: string = process.cwd()
  ): Promise<{ before: string; after: string; diff: string }> {
    const fullPath = path.join(basePath, filePath);
    const before = await fs.readFile(fullPath, 'utf-8');
    
    const patch = this.parseSimplifiedDiff(diffContent);
    const after = applyPatch(before, patch) || before;
    
    return {
      before,
      after,
      diff: diffContent
    };
  }

  async rollback(filePath: string, originalContent: string, basePath: string = process.cwd()): Promise<void> {
    const fullPath = path.join(basePath, filePath);
    await fs.writeFile(fullPath, originalContent, 'utf-8');
  }
}
