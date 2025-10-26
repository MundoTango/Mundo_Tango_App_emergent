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
 * Delete element by removing entire JSX block
 * ✅ FIX: Handle multi-line JSX elements properly
 */
export async function deleteElementByText(
  filePath: string,
  searchText: string
): Promise<boolean> {
  try {
    const absolutePath = path.join(process.cwd(), filePath);
    const content = await fs.readFile(absolutePath, 'utf-8');
    const lines = content.split('\n');
    
    // Find the starting line
    let startLine = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchText)) {
        startLine = i;
        break;
      }
    }
    
    if (startLine === -1) {
      console.warn(`[JSXParser] Element not found in ${filePath}: "${searchText}"`);
      return false;
    }
    
    // ✅ FIX #4: Proper depth tracking for nested elements of same tag type
    let endLine = startLine;
    const startLineContent = lines[startLine];
    
    // Check if this is a complete element on a single line
    const isSelfClosing = startLineContent.includes('/>');
    const isSingleLineElement = /<[^>]+>.*<\/[^>]+>/.test(startLineContent);
    
    if (isSelfClosing || isSingleLineElement) {
      // Safe to delete single line
      endLine = startLine;
      console.log(`[JSXParser] Deleting single line ${startLine + 1} (complete element)`);
    } else {
      // Multi-line element detected
      // Extract tag name to track nesting depth
      const tagMatch = startLineContent.match(/<(\w+)/);
      if (tagMatch) {
        const tagName = tagMatch[1];
        const openingPattern = new RegExp(`<${tagName}(?:\\s|>)`, 'g');
        const closingPattern = new RegExp(`</${tagName}>`, 'g');
        
        let depth = 0;
        let foundStart = false;
        
        // Scan from start line, tracking depth of THIS specific tag
        const maxSearch = Math.min(startLine + 100, lines.length);
        for (let i = startLine; i < maxSearch; i++) {
          const line = lines[i];
          
          // Count opening tags for this specific tag name
          const openMatches = line.match(openingPattern);
          const openCount = openMatches ? openMatches.length : 0;
          
          // Count closing tags for this specific tag name
          const closeMatches = line.match(closingPattern);
          const closeCount = closeMatches ? closeMatches.length : 0;
          
          // Self-closing tags don't affect depth
          const selfCloseCount = (line.match(new RegExp(`<${tagName}[^>]*/>`,'g')) || []).length;
          
          depth += (openCount - selfCloseCount) - closeCount;
          
          if (!foundStart && (openCount - selfCloseCount) > 0) {
            foundStart = true;
          }
          
          // When we return to depth 0 after finding the opening, we found the matching closing tag
          if (foundStart && depth === 0) {
            endLine = i;
            console.log(`[JSXParser] Found matching closing </${tagName}> at line ${i + 1} (depth tracking), deleting lines ${startLine + 1} to ${endLine + 1}`);
            break;
          }
        }
        
        // If we couldn't find matching closing tag, only delete start line (safe fallback)
        if (endLine === startLine && depth !== 0) {
          console.warn(`[JSXParser] Could not find matching closing tag (depth=${depth}), only deleting line ${startLine + 1} for safety`);
        }
      }
    }
    
    // Remove the lines from startLine to endLine (inclusive)
    const filteredLines = [
      ...lines.slice(0, startLine),
      ...lines.slice(endLine + 1)
    ];
    
    await fs.writeFile(absolutePath, filteredLines.join('\n'), 'utf-8');
    
    console.log(`[JSXParser] Successfully deleted element from ${filePath} (${endLine - startLine + 1} lines)`);
    return true;
  } catch (error) {
    console.error('[JSXParser] Error deleting element:', error);
    return false;
  }
}
