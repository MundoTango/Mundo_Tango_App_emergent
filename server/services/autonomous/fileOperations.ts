/**
 * STREAM 2.2: File Operations Service
 * Handles file read/write/search operations with Visual Editor context detection
 * 
 * SECURITY: All file operations use safe Node APIs, NO shell commands with user input
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

export interface ComponentContext {
  id: string;
  name: string;
  type: string;
  element?: any;
}

/**
 * Detect file path from selected component
 * Uses Visual Editor inspector data to find the component file
 */
export async function detectFilePath(component: ComponentContext): Promise<string | null> {
  console.log('🔍 [FILE DETECT] Analyzing component:', component.id);

  // Strategy 1: Check if component has direct file path
  if (component.element?.filePath) {
    console.log('✅ [FILE DETECT] Found direct file path:', component.element.filePath);
    return component.element.filePath;
  }

  // Strategy 2: Safe search for component by test-id (NO shell commands!)
  const testId = component.id;
  console.log('🔍 [FILE DETECT] Searching codebase for test-id:', testId);

  try {
    // Security: Use safe Node API instead of shell grep
    const files = await glob('client/src/**/*.{tsx,jsx}', { cwd: process.cwd() });
    
    // Search pattern (safely escaped)
    const searchPattern = `data-testid="${testId}"`;
    
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      if (content.includes(searchPattern)) {
        console.log('✅ [FILE DETECT] Found file via safe search:', file);
        return file;
      }
    }
    
    console.log('⚠️  [FILE DETECT] No direct file match found');
  } catch (error) {
    console.log('❌ [FILE DETECT] Search error:', error);
  }

  // Strategy 3: Infer from page and component type
  const pageName = component.element?.page || 'unknown';
  const componentType = component.type;
  
  const possiblePaths = [
    `client/src/pages/${pageName}.tsx`,
    `client/src/components/${componentType}.tsx`,
    `client/src/components/${componentType}/${componentType}.tsx`,
  ];

  for (const possiblePath of possiblePaths) {
    try {
      await fs.access(possiblePath);
      console.log('✅ [FILE DETECT] Found file via inference:', possiblePath);
      return possiblePath;
    } catch {
      // File doesn't exist, try next
    }
  }

  console.log('❌ [FILE DETECT] Could not detect file path');
  return null;
}

/**
 * Read file content (with security checks)
 */
export async function readFile(filePath: string): Promise<string> {
  console.log('📖 [FILE READ]', filePath);
  
  // Security: Validate path is within allowed directories
  const absolutePath = path.resolve(process.cwd(), filePath);
  const allowedDirs = [
    path.join(process.cwd(), 'client/src'),
    path.join(process.cwd(), 'shared'),
  ];
  
  if (!allowedDirs.some(dir => absolutePath.startsWith(dir))) {
    throw new Error(`Access denied: ${filePath} is outside allowed directories`);
  }
  
  const content = await fs.readFile(absolutePath, 'utf-8');
  console.log(`✅ [FILE READ] Read ${content.length} chars from ${filePath}`);
  return content;
}

/**
 * Write file content (with security checks)
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  console.log('✍️  [FILE WRITE]', filePath);
  
  // Security: Validate path is within allowed writable directories
  const absolutePath = path.resolve(process.cwd(), filePath);
  const allowedWriteDirs = [
    path.join(process.cwd(), 'client/src'),
    path.join(process.cwd(), 'shared'),
  ];
  
  if (!allowedWriteDirs.some(dir => absolutePath.startsWith(dir))) {
    throw new Error(`Write access denied: ${filePath} is outside allowed directories`);
  }
  
  // Ensure directory exists
  const dir = path.dirname(absolutePath);
  await fs.mkdir(dir, { recursive: true });
  
  await fs.writeFile(absolutePath, content, 'utf-8');
  console.log(`✅ [FILE WRITE] Wrote ${content.length} chars to ${filePath}`);
}

/**
 * Generate diff between old and new content
 */
export function generateDiff(filePath: string, oldContent: string, newContent: string): string {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  
  let diff = `--- ${filePath}\n+++ ${filePath}\n`;
  
  for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
    const oldLine = oldLines[i] || '';
    const newLine = newLines[i] || '';
    
    if (oldLine !== newLine) {
      if (oldLine) diff += `- ${oldLine}\n`;
      if (newLine) diff += `+ ${newLine}\n`;
    }
  }
  
  return diff;
}

/**
 * Search codebase for pattern (SAFE - no shell commands!)
 */
export async function searchCodebase(query: string, filePattern: string = '**/*.tsx'): Promise<Array<{file: string, line: number, content: string}>> {
  console.log('🔍 [SEARCH]', query, `(${filePattern})`);
  
  try {
    // Security: Use safe Node API instead of shell grep
    const files = await glob(`client/src/${filePattern}`, { cwd: process.cwd() });
    const results: Array<{file: string, line: number, content: string}> = [];
    
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.includes(query)) {
          results.push({
            file,
            line: index + 1,
            content: line.trim()
          });
        }
      });
    }

    console.log(`✅ [SEARCH] Found ${results.length} matches`);
    return results;
  } catch (error) {
    console.log('❌ [SEARCH] Error:', error);
    return [];
  }
}
