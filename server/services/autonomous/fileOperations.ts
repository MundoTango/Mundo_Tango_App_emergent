/**
 * STREAM 2.2: File Operations Service
 * Handles file read/write/search operations with Visual Editor context detection
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

  // Strategy 2: Search for component by test-id
  const testId = component.id;
  console.log('🔍 [FILE DETECT] Searching codebase for test-id:', testId);

  try {
    const { stdout } = await execAsync(`grep -r "data-testid=\\"${testId}\\"" client/src --include="*.tsx" --include="*.jsx"`, {
      cwd: process.cwd()
    });

    if (stdout.trim()) {
      const firstMatch = stdout.split('\n')[0];
      const filePath = firstMatch.split(':')[0];
      console.log('✅ [FILE DETECT] Found file via grep:', filePath);
      return filePath;
    }
  } catch (error) {
    // No matches found
    console.log('⚠️  [FILE DETECT] No direct file match found');
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
 * Read file content
 */
export async function readFile(filePath: string): Promise<string> {
  console.log('📖 [FILE READ]', filePath);
  const absolutePath = path.resolve(process.cwd(), filePath);
  const content = await fs.readFile(absolutePath, 'utf-8');
  console.log(`✅ [FILE READ] Read ${content.length} chars from ${filePath}`);
  return content;
}

/**
 * Write file content
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  console.log('✍️  [FILE WRITE]', filePath);
  const absolutePath = path.resolve(process.cwd(), filePath);
  
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
 * Search codebase for pattern
 */
export async function searchCodebase(query: string, filePattern: string = '*.tsx'): Promise<Array<{file: string, line: number, content: string}>> {
  console.log('🔍 [SEARCH]', query, `(${filePattern})`);
  
  try {
    const { stdout } = await execAsync(`grep -rn "${query}" client/src --include="${filePattern}"`, {
      cwd: process.cwd()
    });

    const results = stdout.trim().split('\n').map(line => {
      const [file, lineNum, ...contentParts] = line.split(':');
      return {
        file,
        line: parseInt(lineNum, 10),
        content: contentParts.join(':').trim()
      };
    });

    console.log(`✅ [SEARCH] Found ${results.length} matches`);
    return results;
  } catch (error) {
    console.log('⚠️  [SEARCH] No matches found');
    return [];
  }
}
