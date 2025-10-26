/**
 * JSX Parser Utilities
 * MB.MD BATCH 1: Parse React components and generate diffs
 * Oct 26, 2025
 * 
 * NOTE: This is a simplified implementation for MVP
 * Full AST parsing with @babel/parser can be added later
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface ElementLocation {
  lineStart: number;
  lineEnd: number;
  content: string;
  filePath: string;
}

/**
 * Find element in JSX file by text content
 * Simplified approach: Search for text in file
 * TODO: Implement full AST parsing with @babel/parser
 */
export async function findElementByText(
  filePath: string,
  searchText: string
): Promise<ElementLocation | null> {
  try {
    const absolutePath = path.join(process.cwd(), filePath);
    const content = await fs.readFile(absolutePath, 'utf-8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchText)) {
        return {
          lineStart: i + 1,
          lineEnd: i + 1,
          content: lines[i],
          filePath
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('[JSXParser] Error reading file:', error);
    return null;
  }
}

/**
 * Generate unified diff for text replacement
 * Creates a git-style diff that can be applied
 */
export function generateUnifiedDiff(
  filePath: string,
  oldText: string,
  newText: string,
  lineNumber?: number
): string {
  const line = lineNumber || 1;
  
  return `--- a/${filePath}
+++ b/${filePath}
@@ -${line},1 +${line},1 @@
-${oldText}
+${newText}
`;
}

/**
 * Apply text replacement to file
 * Simple find-and-replace for MVP
 */
export async function applyTextReplacement(
  filePath: string,
  oldText: string,
  newText: string
): Promise<boolean> {
  try {
    const absolutePath = path.join(process.cwd(), filePath);
    let content = await fs.readFile(absolutePath, 'utf-8');
    
    if (!content.includes(oldText)) {
      console.warn(`[JSXParser] Text not found in ${filePath}: "${oldText}"`);
      return false;
    }
    
    content = content.replace(oldText, newText);
    await fs.writeFile(absolutePath, content, 'utf-8');
    
    console.log(`[JSXParser] Successfully replaced text in ${filePath}`);
    return true;
  } catch (error) {
    console.error('[JSXParser] Error applying replacement:', error);
    return false;
  }
}

/**
 * Delete element by removing lines
 * Simplified: Remove line containing the text
 */
export async function deleteElementByText(
  filePath: string,
  searchText: string
): Promise<boolean> {
  try {
    const absolutePath = path.join(process.cwd(), filePath);
    const content = await fs.readFile(absolutePath, 'utf-8');
    const lines = content.split('\n');
    
    const filteredLines = lines.filter(line => !line.includes(searchText));
    
    if (filteredLines.length === lines.length) {
      console.warn(`[JSXParser] Element not found in ${filePath}: "${searchText}"`);
      return false;
    }
    
    await fs.writeFile(absolutePath, filteredLines.join('\n'), 'utf-8');
    
    console.log(`[JSXParser] Successfully deleted element from ${filePath}`);
    return true;
  } catch (error) {
    console.error('[JSXParser] Error deleting element:', error);
    return false;
  }
}
