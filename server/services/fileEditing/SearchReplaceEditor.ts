/**
 * SEARCH/REPLACE EDITOR - Alternative to Unified Diff
 * MB.MD SIMULTANEOUS - Agent #2: File Editing Specialist
 * 
 * Simpler algorithm for small, precise edits
 * Use this when unified diff is overkill
 * 
 * Created: October 23, 2025
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface ReplaceResult {
  success: boolean;
  originalContent?: string;
  newContent?: string;
  replacements: number;
  error?: string;
}

/**
 * SearchReplaceEditor - Simple string search and replace
 * 
 * For when you need precise, small edits without diff complexity
 */
export class SearchReplaceEditor {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Replace all occurrences of search string with replace string
   */
  async replaceAll(
    filePath: string,
    searchString: string,
    replaceString: string,
    options: {
      caseSensitive?: boolean;
      wholeWord?: boolean;
      regexMode?: boolean;
    } = {}
  ): Promise<ReplaceResult> {
    try {
      const fullPath = path.join(this.projectRoot, filePath);
      const originalContent = await fs.readFile(fullPath, 'utf-8');

      let newContent: string;
      let replacements = 0;

      if (options.regexMode) {
        // Regex replace
        const flags = options.caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(searchString, flags);
        const matches = originalContent.match(regex);
        replacements = matches?.length || 0;
        newContent = originalContent.replace(regex, replaceString);
      } else {
        // Simple string replace
        let search = searchString;
        if (!options.caseSensitive) {
          // Case-insensitive search
          const regex = new RegExp(this.escapeRegex(searchString), 'gi');
          const matches = originalContent.match(regex);
          replacements = matches?.length || 0;
          newContent = originalContent.replace(regex, replaceString);
        } else {
          // Count replacements
          replacements = originalContent.split(search).length - 1;
          newContent = originalContent.split(search).join(replaceString);
        }
      }

      if (replacements === 0) {
        return {
          success: false,
          originalContent,
          replacements: 0,
          error: 'Search string not found in file'
        };
      }

      // Write new content
      await fs.writeFile(fullPath, newContent, 'utf-8');

      return {
        success: true,
        originalContent,
        newContent,
        replacements
      };
    } catch (error) {
      return {
        success: false,
        replacements: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Replace only first occurrence
   */
  async replaceFirst(
    filePath: string,
    searchString: string,
    replaceString: string
  ): Promise<ReplaceResult> {
    try {
      const fullPath = path.join(this.projectRoot, filePath);
      const originalContent = await fs.readFile(fullPath, 'utf-8');

      const index = originalContent.indexOf(searchString);
      
      if (index === -1) {
        return {
          success: false,
          originalContent,
          replacements: 0,
          error: 'Search string not found in file'
        };
      }

      const newContent = 
        originalContent.substring(0, index) +
        replaceString +
        originalContent.substring(index + searchString.length);

      await fs.writeFile(fullPath, newContent, 'utf-8');

      return {
        success: true,
        originalContent,
        newContent,
        replacements: 1
      };
    } catch (error) {
      return {
        success: false,
        replacements: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

/**
 * Factory function
 */
export function createSearchReplaceEditor(projectRoot?: string): SearchReplaceEditor {
  return new SearchReplaceEditor(projectRoot);
}
