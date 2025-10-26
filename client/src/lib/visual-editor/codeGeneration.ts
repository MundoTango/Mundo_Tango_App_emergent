/**
 * Code Generation Utilities
 * MB.MD BATCH 1: Convert DOM changes to React file diffs
 * Oct 26, 2025
 */

import type { ElementSelection } from './iframeMessaging';

export interface CodeChange {
  filePath: string;
  diff: string;
  type: 'unified_diff';
}

/**
 * Detect source file from element selection
 * Strategy: Use URL path to infer component file
 */
export function detectSourceFile(previewPath: string): string {
  const pathMap: Record<string, string> = {
    '/': 'client/src/pages/HomePage.tsx',
    '/events': 'client/src/pages/EventsPage.tsx',
    '/profile': 'client/src/pages/ProfilePage.tsx',
    '/groups': 'client/src/pages/GroupsPage.tsx',
    '/memories': 'client/src/pages/MemoriesPage.tsx',
  };

  return pathMap[previewPath] || 'client/src/pages/HomePage.tsx';
}

/**
 * Generate edit instruction for text content change
 * Frontend sends this to backend, which generates real diff from filesystem
 */
export function generateTextChangeDiff(
  element: ElementSelection,
  oldText: string,
  newText: string,
  previewPath: string
): CodeChange {
  const filePath = detectSourceFile(previewPath);
  
  // ✅ FIX: Send actual search/replace instruction, not placeholder diff
  // Backend will use jsxParser.findElementByText + generateUnifiedDiff
  const instruction = JSON.stringify({
    operation: 'replace_text',
    searchText: oldText,
    replaceWith: newText
  });
  
  // Temporary: Use simple find-replace format until backend generates real diffs
  const diff = `EDIT_INSTRUCTION: ${instruction}`;

  return {
    filePath,
    diff,
    type: 'unified_diff'
  };
}

/**
 * Generate edit instruction for element deletion
 * Frontend sends this to backend, which generates real diff from filesystem
 */
export function generateDeleteDiff(
  element: ElementSelection,
  previewPath: string
): CodeChange {
  const filePath = detectSourceFile(previewPath);
  
  // ✅ FIX #4: More flexible search - use MOST specific available identifier
  // Backend will search for ANY of these patterns (not requiring all)
  let searchText: string;
  
  if (element.id) {
    // Most specific: Search for id attribute
    searchText = `id="${element.id}"`;
  } else if (element.className) {
    // Second choice: First className
    const firstClass = element.className.split(' ')[0];
    searchText = `className="${firstClass}"`;
  } else {
    // Fallback: Just the tag name (least specific, but better than nothing)
    searchText = `<${element.tagName}`;
  }
  
  const instruction = JSON.stringify({
    operation: 'delete_element',
    searchText,
    elementTag: element.tagName,
    xpath: element.xpath,  // Include xpath for debugging/logging
    fallbackStrategy: 'exact_match_only'  // Don't delete unless confident
  });
  
  // Send instruction to backend for processing
  const diff = `EDIT_INSTRUCTION: ${instruction}`;

  return {
    filePath,
    diff,
    type: 'unified_diff'
  };
}

/**
 * Simple unified diff generator
 * For now, uses basic text replacement strategy
 * TODO: Integrate with jsxParser for precise AST-based diffs
 */
export function createUnifiedDiff(
  filePath: string,
  oldCode: string,
  newCode: string
): string {
  return `--- a/${filePath}
+++ b/${filePath}
@@ -1,1 +1,1 @@
-${oldCode}
+${newCode}
`;
}
