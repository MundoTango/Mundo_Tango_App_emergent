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
 * FIX #1 & #3: Detect file path from ANY context (element, component, page, etc.)
 * UNIVERSAL DETECTION - Works with clicks on anything
 */
export async function detectFilePath(contextData: any): Promise<string | null> {
  console.log('🔍 [FILE DETECT] Analyzing context:', contextData);

  // FIX #3: Multiple smart detection strategies

  // Strategy 1: Direct file path
  if (contextData?.filePath) {
    console.log('✅ [FILE DETECT] Found direct file path:', contextData.filePath);
    return contextData.filePath;
  }
  
  if (contextData?.element?.filePath) {
    console.log('✅ [FILE DETECT] Found element file path:', contextData.element.filePath);
    return contextData.element.filePath;
  }

  // Strategy 2: Search by className (for styled components)
  if (contextData?.className || contextData?.element?.className) {
    const className = contextData?.className || contextData?.element?.className;
    console.log('🔍 [FILE DETECT] Searching by className:', className);
    
    try {
      const files = await glob('client/src/**/*.{tsx,jsx,ts,js}', { cwd: process.cwd() });
      
      // Extract unique class names (split by spaces)
      const classNames = className.split(' ').filter((c: string) => c.length > 3);
      
      for (const cn of classNames) {
        for (const file of files) {
          const content = await fs.readFile(file, 'utf-8');
          if (content.includes(cn)) {
            console.log(`✅ [FILE DETECT] Found file via className "${cn}":`, file);
            return file;
          }
        }
      }
    } catch (error) {
      console.log('❌ [FILE DETECT] className search error:', error);
    }
  }

  // Strategy 3: Search by textContent (for unique text)
  if (contextData?.textContent || contextData?.element?.textContent) {
    const text = contextData?.textContent || contextData?.element?.textContent;
    if (text && text.length > 3 && text.length < 100) {
      console.log('🔍 [FILE DETECT] Searching by textContent:', text);
      
      try {
        const files = await glob('client/src/**/*.{tsx,jsx}', { cwd: process.cwd() });
        
        for (const file of files) {
          const content = await fs.readFile(file, 'utf-8');
          if (content.includes(text)) {
            console.log(`✅ [FILE DETECT] Found file via text "${text}":`, file);
            return file;
          }
        }
      } catch (error) {
        console.log('❌ [FILE DETECT] textContent search error:', error);
      }
    }
  }

  // Strategy 4: Search by test-id (legacy)
  const testId = contextData?.id || contextData?.element?.id;
  if (testId) {
    console.log('🔍 [FILE DETECT] Searching by test-id:', testId);
    
    try {
      const files = await glob('client/src/**/*.{tsx,jsx}', { cwd: process.cwd() });
      const searchPattern = `data-testid="${testId}"`;
      
      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        if (content.includes(searchPattern)) {
          console.log('✅ [FILE DETECT] Found file via test-id:', file);
          return file;
        }
      }
    } catch (error) {
      console.log('❌ [FILE DETECT] test-id search error:', error);
    }
  }

  // Strategy 5: Search by XPath to infer component location
  if (contextData?.xpath || contextData?.element?.xpath) {
    const xpath = contextData?.xpath || contextData?.element?.xpath;
    // Extract component hints from xpath (e.g., /html/body/div/Card/Button → Card, Button)
    const pathParts = xpath.split('/').filter((p: string) => p && /^[A-Z]/.test(p));
    
    if (pathParts.length > 0) {
      console.log('🔍 [FILE DETECT] Inferred components from XPath:', pathParts);
      
      for (const componentName of pathParts) {
        const possiblePaths = [
          `client/src/components/${componentName}.tsx`,
          `client/src/components/${componentName}/${componentName}.tsx`,
          `client/src/components/ui/${componentName.toLowerCase()}.tsx`,
        ];
        
        for (const possiblePath of possiblePaths) {
          try {
            await fs.access(possiblePath);
            console.log('✅ [FILE DETECT] Found file via XPath inference:', possiblePath);
            return possiblePath;
          } catch {
            // Continue trying
          }
        }
      }
    }
  }

  // Strategy 6: Fallback to current page
  const pagePath = contextData?.page || contextData?.element?.page;
  if (pagePath && pagePath !== '/') {
    const pageName = pagePath.replace(/^\//, '').replace(/\//g, '-');
    const possiblePaths = [
      `client/src/pages/${pageName}.tsx`,
      `client/src/pages/${pageName}/index.tsx`,
    ];
    
    for (const possiblePath of possiblePaths) {
      try {
        await fs.access(possiblePath);
        console.log('✅ [FILE DETECT] Found file via page path:', possiblePath);
        return possiblePath;
      } catch {
        // Continue trying
      }
    }
  }

  console.log('❌ [FILE DETECT] Could not detect file path from any strategy');
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
