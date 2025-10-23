# Vibe Coding File Editing Algorithms - Deep Technical Analysis (Oct 23, 2025)

## 🎯 **The Core Problem**

**Challenge:** How do you get an LLM to reliably edit files without:
1. Hallucinating code
2. Breaking existing functionality
3. Creating syntax errors
4. Losing context
5. Making lazy edits ("// rest of code unchanged")

**Answer:** The editing algorithm matters MORE than the LLM model.

---

## 📊 **Performance Comparison**

### **Aider's Benchmark Results (Across All Models)**

| Format | GPT-4 Turbo | Claude 3.5 Sonnet | GPT-4o | DeepSeek |
|--------|-------------|-------------------|---------|----------|
| **Unified Diff** | 61% | 72% | 66% | 54% |
| **SEARCH/REPLACE** | 58% | 68% | 62% | 51% |
| **Whole File** | 20% | 25% | 22% | 18% |
| **Prompt Only** | 12% | 15% | 13% | 10% |

**Key Finding:** Unified diff format improves success rates by **3-5x** across all models!

**Why:** LLMs trained on GitHub (millions of diffs), forces precise thinking

---

## 🏗️ **Algorithm 1: Unified Diff Format**

### **What It Is**

Standard Git diff format that shows:
- Context lines (unchanged)
- Deletions (-)
- Additions (+)
- Line numbers

**Example:**
```diff
--- src/auth.ts
+++ src/auth.ts
@@ -12,7 +12,10 @@
 export function validateToken(token: string): boolean {
-  return token.length > 0;
+  if (!token || token.length === 0) {
+    return false;
+  }
+  return verifyJWT(token);
 }
```

### **Implementation**

```typescript
// server/services/editors/unifiedDiffEditor.ts
import { applyPatch, createPatch } from 'diff';
import { readFile, writeFile } from 'fs/promises';

export class UnifiedDiffEditor {
  
  /**
   * Apply unified diff to file
   * @param filePath - Path to file
   * @param diffString - Unified diff format
   * @param options - Fuzzy matching options
   */
  static async apply(
    filePath: string,
    diffString: string,
    options = { fuzzFactor: 2, createIfMissing: false }
  ): Promise<{ success: boolean; newContent?: string; error?: string }> {
    
    try {
      // Read original file
      const originalContent = await readFile(filePath, 'utf-8');
      
      // Apply patch with fuzzy matching
      // fuzzFactor: 2 means allow ±2 lines difference (LLMs are imprecise)
      const result = applyPatch(originalContent, diffString, {
        fuzzFactor: options.fuzzFactor,
        autoConvertLineEndings: true
      });
      
      if (result === false) {
        // Patch failed - context doesn't match
        return {
          success: false,
          error: 'Context mismatch - cannot find search lines in file'
        };
      }
      
      // Write result
      await writeFile(filePath, result, 'utf-8');
      
      return {
        success: true,
        newContent: result
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Generate diff for preview
   * Useful for showing user what will change before applying
   */
  static async preview(
    filePath: string,
    newContent: string
  ): Promise<string> {
    const oldContent = await readFile(filePath, 'utf-8');
    const fileName = filePath.split('/').pop() || 'file';
    
    return createPatch(fileName, oldContent, newContent, '', '');
  }
  
  /**
   * Validate diff before applying
   * Returns true if diff can be cleanly applied
   */
  static async validate(
    filePath: string,
    diffString: string
  ): Promise<boolean> {
    try {
      const originalContent = await readFile(filePath, 'utf-8');
      const result = applyPatch(originalContent, diffString, {
        fuzzFactor: 0  // Strict matching for validation
      });
      return result !== false;
    } catch {
      return false;
    }
  }
}
```

### **LLM Prompt for Unified Diff**

```typescript
const UNIFIED_DIFF_PROMPT = `
When editing files, reply with unified diff format.

FORMAT:
--- path/to/file.ts
+++ path/to/file.ts
@@ -LINE,COUNT +LINE,COUNT @@
 context line
-removed line
+added line
 context line

RULES:
1. Include 3-5 context lines before and after changes
2. Use exact whitespace (tabs/spaces matter!)
3. Never use placeholders like "// rest unchanged"
4. Show complete implementation
5. Multiple hunks allowed for changes far apart

EXAMPLE:
User: "Add error handling to login function"