/**
 * TRACK 4B: Visual Editor Context-Aware Chat
 * MB.MD Vibe Coding - 100% Plan
 * 
 * Features:
 * - Click element → auto-inject context into AI chat
 * - Smart context extraction (styles, content, position, hierarchy)
 * - Integration with Mr Blue chat interface
 * - Replit Agent 3-style "point and ask" workflow
 */

import type { ElementSelection } from './iframeMessaging';

export interface ElementContext {
  element: ElementSelection;
  styles: Record<string, string>;
  hierarchy: string[];
  siblings: { before: string[]; after: string[] };
  content: { text: string; html: string };
  accessibility: { role?: string; ariaLabel?: string; ariaDescribedBy?: string };
  position: { x: number; y: number; width: number; height: number };
}

export interface ContextPrompt {
  userMessage: string;
  elementContext: ElementContext;
  suggestedPrompts: string[];
  contextSummary: string;
}

/**
 * Extract comprehensive context from selected element
 */
export function extractElementContext(element: ElementSelection): ElementContext {
  // Parse computed styles
  const styles = element.computedStyles || {};
  
  // Build hierarchy path
  const hierarchy = buildHierarchyPath(element);
  
  // Extract siblings
  const siblings = extractSiblings(element);
  
  // Extract content
  const content = {
    text: element.textContent || '',
    html: '' // innerHTML not available in ElementSelection
  };
  
  // Extract accessibility attributes
  const accessibility = {
    role: element.attributes?.role,
    ariaLabel: element.attributes?.['aria-label'],
    ariaDescribedBy: element.attributes?.['aria-describedby']
  };
  
  // Extract position (if available)
  const position = element.boundingBox 
    ? { x: element.boundingBox.left, y: element.boundingBox.top, width: element.boundingBox.width, height: element.boundingBox.height }
    : { x: 0, y: 0, width: 0, height: 0 };

  return {
    element,
    styles,
    hierarchy,
    siblings,
    content,
    accessibility,
    position
  };
}

/**
 * Build hierarchy path (e.g., ["body", "main", "div.container", "button#submit"])
 */
function buildHierarchyPath(element: ElementSelection): string[] {
  const path: string[] = [];
  
  // Parse XPath to build hierarchy
  const xpath = element.xpath || '';
  const parts = xpath.split('/').filter(p => p && p !== '*');
  
  parts.forEach(part => {
    // Extract tag name and selectors
    const match = part.match(/^([a-z]+)(?:\[@id="([^"]+)"\])?(?:\[@class="([^"]+)"\])?/i);
    if (match) {
      const [, tag, id, className] = match;
      let selector = tag;
      if (id) selector += `#${id}`;
      if (className) selector += `.${className.split(' ')[0]}`;
      path.push(selector);
    }
  });
  
  return path;
}

/**
 * Extract sibling elements for context
 */
function extractSiblings(element: ElementSelection): { before: string[]; after: string[] } {
  // This would need DOM access in real implementation
  // For now, return placeholder
  return {
    before: [],
    after: []
  };
}

/**
 * Generate context-aware prompt for AI
 */
export function generateContextPrompt(
  userMessage: string,
  element: ElementSelection
): ContextPrompt {
  const context = extractElementContext(element);
  
  // Build context summary
  const summary = buildContextSummary(context);
  
  // Generate suggested prompts based on element type
  const suggestedPrompts = generateSuggestedPrompts(context);
  
  return {
    userMessage,
    elementContext: context,
    suggestedPrompts,
    contextSummary: summary
  };
}

/**
 * Build human-readable context summary
 */
function buildContextSummary(context: ElementContext): string {
  const { element, hierarchy, content, styles } = context;
  
  const parts: string[] = [];
  
  // Element identification
  parts.push(`Selected element: <${element.tagName}>${element.id ? ` with id="${element.id}"` : ''}${element.className ? ` and class="${element.className}"` : ''}`);
  
  // Hierarchy
  if (hierarchy.length > 0) {
    parts.push(`Location: ${hierarchy.join(' > ')}`);
  }
  
  // Content
  if (content.text) {
    const preview = content.text.substring(0, 100);
    parts.push(`Content: "${preview}${content.text.length > 100 ? '...' : ''}"`);
  }
  
  // Key styles
  const keyStyles = ['display', 'position', 'width', 'height', 'background-color', 'color', 'font-size'];
  const relevantStyles = keyStyles
    .filter(prop => styles[prop])
    .map(prop => `${prop}: ${styles[prop]}`)
    .join(', ');
  
  if (relevantStyles) {
    parts.push(`Styles: ${relevantStyles}`);
  }
  
  return parts.join('\n');
}

/**
 * Generate suggested prompts based on element type
 */
function generateSuggestedPrompts(context: ElementContext): string[] {
  const { element } = context;
  const tag = element.tagName.toLowerCase();
  
  const suggestions: string[] = [];
  
  // Button-specific suggestions
  if (tag === 'button' || element.attributes?.role === 'button') {
    suggestions.push(
      'Change the button color to match the brand',
      'Make this button larger and more prominent',
      'Add a loading spinner when clicked',
      'Change the button text'
    );
  }
  
  // Text element suggestions
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'].includes(tag)) {
    suggestions.push(
      'Change the font size',
      'Make the text color more visible',
      'Center align this text',
      'Add a gradient to the text'
    );
  }
  
  // Image suggestions
  if (tag === 'img') {
    suggestions.push(
      'Make this image responsive',
      'Add a border radius to round the corners',
      'Add a shadow effect',
      'Change the aspect ratio'
    );
  }
  
  // Container suggestions
  if (['div', 'section', 'article', 'main'].includes(tag)) {
    suggestions.push(
      'Add padding to this container',
      'Change the background color',
      'Make this section full-width',
      'Add a border'
    );
  }
  
  // Form element suggestions
  if (['input', 'textarea', 'select'].includes(tag)) {
    suggestions.push(
      'Change the input placeholder',
      'Add validation to this field',
      'Make this field required',
      'Style the input border'
    );
  }
  
  // Generic suggestions (always available)
  suggestions.push(
    'Delete this element',
    'Duplicate this element',
    'Move this element up/down'
  );
  
  return suggestions.slice(0, 6); // Limit to 6 suggestions
}

/**
 * Inject element context into chat message
 */
export function injectContextIntoMessage(
  userMessage: string,
  context: ElementContext
): string {
  const summary = buildContextSummary(context);
  
  return `[VISUAL EDITOR CONTEXT]
${summary}

[USER REQUEST]
${userMessage}`;
}

/**
 * Check if message references visual elements
 */
export function containsVisualReference(message: string): boolean {
  const visualKeywords = [
    'this', 'selected', 'element', 'button', 'text', 'image', 'div',
    'change', 'edit', 'style', 'color', 'size', 'position', 'layout'
  ];
  
  const lowerMessage = message.toLowerCase();
  return visualKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Auto-suggest visual context injection
 */
export function shouldInjectContext(
  message: string,
  hasSelectedElement: boolean
): { shouldInject: boolean; reason: string } {
  if (!hasSelectedElement) {
    return {
      shouldInject: false,
      reason: 'No element selected'
    };
  }
  
  if (containsVisualReference(message)) {
    return {
      shouldInject: true,
      reason: 'Message contains visual element references'
    };
  }
  
  return {
    shouldInject: false,
    reason: 'Message does not reference visual elements'
  };
}
