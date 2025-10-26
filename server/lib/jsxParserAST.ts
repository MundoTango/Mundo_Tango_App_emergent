/**
 * JSX Parser with AST (Babel)
 * MB.MD CRITICAL FIX #5: Proper JSX parsing with @babel/parser
 * Oct 26, 2025
 * 
 * Replaces regex-based parsing with proper AST manipulation
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

export interface ElementLocation {
  lineStart: number;
  lineEnd: number;
  content: string;
  filePath: string;
}

/**
 * Delete JSX element using AST parsing
 * ✅ Handles: nested elements, multi-line attributes, self-closing tags
 */
export async function deleteElementByTextAST(
  filePath: string,
  searchText: string
): Promise<boolean> {
  try {
    const absolutePath = path.join(process.cwd(), filePath);
    const content = await fs.readFile(absolutePath, 'utf-8');
    
    console.log(`[JSXParserAST] Deleting element with search: "${searchText}"`);
    
    // Parse file as JSX/TSX module
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    
    let elementRemoved = false;
    
    // Traverse AST to find matching JSX element
    traverse(ast, {
      JSXElement(nodePath) {
        const opening = nodePath.node.openingElement;
        
        // Check if this element matches our search criteria
        const matches = checkElementMatches(opening, searchText);
        
        if (matches) {
          console.log(`[JSXParserAST] Found matching element, removing...`);
          nodePath.remove();
          elementRemoved = true;
          nodePath.stop(); // Stop traversing after first match
        }
      }
    });
    
    if (!elementRemoved) {
      console.warn(`[JSXParserAST] Element not found: "${searchText}"`);
      return false;
    }
    
    // Generate code back from AST
    const output = generate(ast, {
      retainLines: true,
      compact: false
    }, content);
    
    // Write modified code
    await fs.writeFile(absolutePath, output.code, 'utf-8');
    
    console.log(`[JSXParserAST] Successfully deleted element from ${filePath}`);
    return true;
    
  } catch (error) {
    console.error('[JSXParserAST] Error deleting element:', error);
    return false;
  }
}

/**
 * Replace text in JSX using AST parsing
 * ✅ Handles: JSX text nodes, string literals, expressions
 */
export async function applyTextReplacementAST(
  filePath: string,
  oldText: string,
  newText: string
): Promise<boolean> {
  try {
    const absolutePath = path.join(process.cwd(), filePath);
    const content = await fs.readFile(absolutePath, 'utf-8');
    
    console.log(`[JSXParserAST] Replacing "${oldText}" with "${newText}"`);
    
    // Parse file as JSX/TSX module
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    
    let textReplaced = false;
    
    // Traverse AST to find and replace text
    traverse(ast, {
      // Replace in JSX text nodes
      JSXText(nodePath) {
        if (nodePath.node.value.includes(oldText)) {
          nodePath.node.value = nodePath.node.value.replace(oldText, newText);
          textReplaced = true;
        }
      },
      
      // Replace in string literals (e.g., className values, text in expressions)
      StringLiteral(nodePath) {
        if (nodePath.node.value.includes(oldText)) {
          nodePath.node.value = nodePath.node.value.replace(oldText, newText);
          textReplaced = true;
        }
      }
    });
    
    if (!textReplaced) {
      console.warn(`[JSXParserAST] Text not found: "${oldText}"`);
      return false;
    }
    
    // Generate code back from AST
    const output = generate(ast, {
      retainLines: true,
      compact: false
    }, content);
    
    // Write modified code
    await fs.writeFile(absolutePath, output.code, 'utf-8');
    
    console.log(`[JSXParserAST] Successfully replaced text in ${filePath}`);
    return true;
    
  } catch (error) {
    console.error('[JSXParserAST] Error replacing text:', error);
    return false;
  }
}

/**
 * Check if JSX opening element matches search criteria
 * Handles: id="...", className="...", tag name
 */
function checkElementMatches(
  opening: t.JSXOpeningElement,
  searchText: string
): boolean {
  // Extract element name
  const elementName = t.isJSXIdentifier(opening.name) 
    ? opening.name.name 
    : '';
  
  // Check if search is for id attribute
  if (searchText.includes('id="')) {
    const idMatch = searchText.match(/id="([^"]+)"/);
    if (idMatch) {
      const targetId = idMatch[1];
      const idAttr = opening.attributes.find(attr =>
        t.isJSXAttribute(attr) &&
        t.isJSXIdentifier(attr.name) &&
        attr.name.name === 'id' &&
        t.isStringLiteral(attr.value) &&
        attr.value.value === targetId
      );
      if (idAttr) return true;
    }
  }
  
  // Check if search is for className attribute
  if (searchText.includes('className="')) {
    const classMatch = searchText.match(/className="([^"]+)"/);
    if (classMatch) {
      const targetClass = classMatch[1];
      const classAttr = opening.attributes.find(attr =>
        t.isJSXAttribute(attr) &&
        t.isJSXIdentifier(attr.name) &&
        attr.name.name === 'className' &&
        t.isStringLiteral(attr.value) &&
        attr.value.value.split(' ').includes(targetClass)
      );
      if (classAttr) return true;
    }
  }
  
  // Fallback: Check if search is for tag name
  if (searchText.includes(`<${elementName}`)) {
    return true;
  }
  
  return false;
}

/**
 * Find element in JSX file by text content (for compatibility)
 */
export async function findElementByTextAST(
  filePath: string,
  searchText: string
): Promise<ElementLocation | null> {
  try {
    const absolutePath = path.join(process.cwd(), filePath);
    const content = await fs.readFile(absolutePath, 'utf-8');
    const lines = content.split('\n');
    
    // Simple fallback: Find line containing text
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
    console.error('[JSXParserAST] Error finding element:', error);
    return null;
  }
}
