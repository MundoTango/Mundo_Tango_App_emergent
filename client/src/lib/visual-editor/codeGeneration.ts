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
 * Generate unified diff for text content change
 * Creates a git-style diff that can be applied by patch tools
 */
export function generateTextChangeDiff(
  element: ElementSelection,
  oldText: string,
  newText: string,
  previewPath: string
): CodeChange {
  const filePath = detectSourceFile(previewPath);
  
  const escapedOld = oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedNew = newText.replace(/\$/g, '$$$$');
  
  const diff = `--- a/${filePath}
+++ b/${filePath}
@@ -1,1 +1,1 @@
-        ${oldText}
+        ${newText}
`;

  return {
    filePath,
    diff,
    type: 'unified_diff'
  };
}

/**
 * Generate unified diff for element deletion
 * Creates diff that removes the element from JSX
 */
export function generateDeleteDiff(
  element: ElementSelection,
  previewPath: string
): CodeChange {
  const filePath = detectSourceFile(previewPath);
  
  const elementTag = element.tagName;
  const elementId = element.id ? `id="${element.id}"` : '';
  const elementClass = element.className ? `className="${element.className}"` : '';
  
  const diff = `--- a/${filePath}
+++ b/${filePath}
@@ -1,3 +1,0 @@
-        <${elementTag} ${elementId} ${elementClass}>
-          {/* Content removed */}
-        </${elementTag}>
`;

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
