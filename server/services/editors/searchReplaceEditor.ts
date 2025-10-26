import { promises as fs } from 'fs';
import path from 'path';

export interface SearchReplaceBlock {
  search: string;
  replace: string;
}

export interface SearchReplaceResult {
  success: boolean;
  filePath: string;
  replacements: number;
  error?: string;
}

export class SearchReplaceEditor {
  async applySearchReplace(
    filePath: string,
    blocks: SearchReplaceBlock[],
    basePath: string = process.cwd()
  ): Promise<SearchReplaceResult> {
    try {
      const fullPath = path.join(basePath, filePath);
      let content = await fs.readFile(fullPath, 'utf-8');
      
      let totalReplacements = 0;
      
      for (const block of blocks) {
        const searchRegex = this.escapeRegExp(block.search);
        const occurrences = (content.match(new RegExp(searchRegex, 'g')) || []).length;
        
        if (occurrences === 0) {
          return {
            success: false,
            filePath,
            replacements: 0,
            error: `Search string not found: "${block.search.substring(0, 50)}..."`
          };
        }
        
        if (occurrences > 1) {
          return {
            success: false,
            filePath,
            replacements: 0,
            error: `Search string is not unique (found ${occurrences} times): "${block.search.substring(0, 50)}..."`
          };
        }
        
        content = content.replace(block.search, block.replace);
        totalReplacements++;
      }
      
      await fs.writeFile(fullPath, content, 'utf-8');
      
      return {
        success: true,
        filePath,
        replacements: totalReplacements
      };
    } catch (error) {
      return {
        success: false,
        filePath,
        replacements: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  parseSearchReplaceBlocks(content: string): SearchReplaceBlock[] {
    const blocks: SearchReplaceBlock[] = [];
    const regex = /<<<<<<< SEARCH\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> REPLACE/g;
    
    let match;
    while ((match = regex.exec(content)) !== null) {
      blocks.push({
        search: match[1],
        replace: match[2]
      });
    }
    
    return blocks;
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async previewSearchReplace(
    filePath: string,
    blocks: SearchReplaceBlock[],
    basePath: string = process.cwd()
  ): Promise<{ before: string; after: string; changes: Array<{ search: string; replace: string }> }> {
    const fullPath = path.join(basePath, filePath);
    const before = await fs.readFile(fullPath, 'utf-8');
    let after = before;
    
    for (const block of blocks) {
      after = after.replace(block.search, block.replace);
    }
    
    return {
      before,
      after,
      changes: blocks
    };
  }
}
