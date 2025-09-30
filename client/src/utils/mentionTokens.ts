// Token-based mention system for reliable display/canonical format synchronization

export type TextToken = {
  kind: 'text';
  text: string;
};

export type MentionToken = {
  kind: 'mention';
  name: string;
  type: 'user' | 'event' | 'group' | 'city';
  id: string;
};

export type Token = TextToken | MentionToken;

// Parse canonical format "@[Name](type:id)" into token array
export function parseCanonicalToTokens(canonical: string): Token[] {
  const tokens: Token[] = [];
  const mentionRegex = /@\[([^\]]+)\]\((user|event|group|city):([^\)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(canonical)) !== null) {
    // Add plain text before this mention
    if (match.index > lastIndex) {
      const plainText = canonical.substring(lastIndex, match.index);
      if (plainText) {
        tokens.push({ kind: 'text', text: plainText });
      }
    }

    // Add mention token
    tokens.push({
      kind: 'mention',
      name: match[1],
      type: match[2] as 'user' | 'event' | 'group' | 'city',
      id: match[3]
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining plain text
  if (lastIndex < canonical.length) {
    tokens.push({ kind: 'text', text: canonical.substring(lastIndex) });
  }

  // If no tokens, add empty text token
  if (tokens.length === 0) {
    tokens.push({ kind: 'text', text: '' });
  }

  return tokens;
}

// Convert tokens to display format: "@Name" instead of "@[Name](type:id)"
export function tokensToDisplay(tokens: Token[]): string {
  return tokens.map(token => {
    if (token.kind === 'text') {
      return token.text;
    } else {
      return `@${token.name}`;
    }
  }).join('');
}

// Convert tokens to canonical format for storage
export function tokensToCanonical(tokens: Token[]): string {
  return tokens.map(token => {
    if (token.kind === 'text') {
      return token.text;
    } else {
      return `@[${token.name}](${token.type}:${token.id})`;
    }
  }).join('');
}

// Get token and character offset at display position
export function getTokenAtDisplayPos(tokens: Token[], displayPos: number): {
  tokenIndex: number;
  offsetInToken: number;
  token: Token;
} | null {
  let currentPos = 0;
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const tokenDisplayLength = token.kind === 'text' 
      ? token.text.length 
      : `@${token.name}`.length;
    
    if (displayPos >= currentPos && displayPos <= currentPos + tokenDisplayLength) {
      return {
        tokenIndex: i,
        offsetInToken: displayPos - currentPos,
        token
      };
    }
    
    currentPos += tokenDisplayLength;
  }
  
  return null;
}

// Apply text edit to tokens at display position
// Returns: { tokens: updated tokens, newCursorPos: where cursor should be after edit }
export function applyEditToTokens(
  tokens: Token[],
  displayStart: number,
  displayEnd: number,
  insertText: string
): { tokens: Token[]; newCursorPos: number } {
  const newTokens: Token[] = [];
  let currentPos = 0;
  let editApplied = false;
  let newCursorPos = displayStart + insertText.length;
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const tokenDisplayLength = getTokenDisplayLength(token);
    const tokenStart = currentPos;
    const tokenEnd = currentPos + tokenDisplayLength;
    
    // Check if this token is affected by the edit
    const overlapsStart = displayStart >= tokenStart && displayStart < tokenEnd;
    const overlapsEnd = displayEnd > tokenStart && displayEnd <= tokenEnd;
    const spansToken = displayStart <= tokenStart && displayEnd >= tokenEnd;
    
    if (spansToken) {
      // Edit completely removes this token
      if (!editApplied) {
        // Insert the new text as a text token
        if (insertText) {
          newTokens.push({ kind: 'text', text: insertText });
        }
        editApplied = true;
      }
      // Skip this token (it's deleted)
    } else if (overlapsStart || overlapsEnd) {
      // Edit intersects this token
      if (token.kind === 'mention') {
        // Mentions are atomic - if edited, convert to plain text or delete
        if (!editApplied) {
          // Delete the mention and insert new text
          if (insertText) {
            newTokens.push({ kind: 'text', text: insertText });
          }
          editApplied = true;
        }
      } else {
        // Text token - apply the edit
        const deleteStart = Math.max(0, displayStart - tokenStart);
        const deleteEnd = Math.min(token.text.length, displayEnd - tokenStart);
        
        const before = token.text.substring(0, deleteStart);
        const after = token.text.substring(deleteEnd);
        const newText = before + (editApplied ? '' : insertText) + after;
        
        if (newText) {
          newTokens.push({ kind: 'text', text: newText });
        }
        
        if (!editApplied) {
          editApplied = true;
        }
      }
    } else {
      // Token not affected by edit
      if (!editApplied && displayEnd <= tokenStart) {
        // Insert point is before this token
        if (insertText) {
          newTokens.push({ kind: 'text', text: insertText });
        }
        editApplied = true;
      }
      newTokens.push(token);
    }
    
    currentPos = tokenEnd;
  }
  
  // If edit is at the end, append
  if (!editApplied && insertText) {
    newTokens.push({ kind: 'text', text: insertText });
  }
  
  // Merge consecutive text tokens
  const merged = mergeTextTokens(newTokens);
  
  return { tokens: merged, newCursorPos };
}

// Merge consecutive text tokens
function mergeTextTokens(tokens: Token[]): Token[] {
  const merged: Token[] = [];
  
  for (const token of tokens) {
    if (token.kind === 'text' && merged.length > 0) {
      const last = merged[merged.length - 1];
      if (last.kind === 'text') {
        last.text += token.text;
        continue;
      }
    }
    merged.push(token);
  }
  
  return merged.length > 0 ? merged : [{ kind: 'text', text: '' }];
}

// Get display length of a single token
export function getTokenDisplayLength(token: Token): number {
  return token.kind === 'text' ? token.text.length : `@${token.name}`.length;
}

// Get total display length of token array
export function getDisplayLength(tokens: Token[]): number {
  return tokens.reduce((sum, token) => sum + getTokenDisplayLength(token), 0);
}

// Insert a mention token at display position
export function insertMentionAtPos(
  tokens: Token[],
  displayPos: number,
  mention: { name: string; type: 'user' | 'event' | 'group' | 'city'; id: string }
): { tokens: Token[]; newCursorPos: number } {
  const newTokens: Token[] = [];
  let currentPos = 0;
  let inserted = false;
  let newCursorPos = displayPos;
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const tokenDisplayLength = token.kind === 'text' 
      ? token.text.length 
      : `@${token.name}`.length;
    const tokenStart = currentPos;
    const tokenEnd = currentPos + tokenDisplayLength;
    
    if (!inserted && displayPos >= tokenStart && displayPos <= tokenEnd) {
      // Insert mention at this position
      if (token.kind === 'text') {
        const offsetInToken = displayPos - tokenStart;
        const before = token.text.substring(0, offsetInToken);
        const after = token.text.substring(offsetInToken);
        
        if (before) newTokens.push({ kind: 'text', text: before });
        newTokens.push({ kind: 'mention', ...mention });
        if (after) newTokens.push({ kind: 'text', text: after });
        
        // Cursor goes after the mention
        newCursorPos = currentPos + before.length + `@${mention.name}`.length;
        inserted = true;
      } else {
        // Can't insert inside a mention, add after it
        newTokens.push(token);
        if (displayPos === tokenEnd) {
          newTokens.push({ kind: 'mention', ...mention });
          newCursorPos = tokenEnd + `@${mention.name}`.length;
          inserted = true;
        }
      }
    } else {
      newTokens.push(token);
    }
    
    currentPos = tokenEnd;
  }
  
  // If not inserted yet, append at end
  if (!inserted) {
    newTokens.push({ kind: 'mention', ...mention });
    newCursorPos = currentPos + `@${mention.name}`.length;
  }
  
  return { tokens: mergeTextTokens(newTokens), newCursorPos };
}

// Find mention trigger (@query) at cursor position
// Returns start position and query string if found
export function findMentionTriggerAtCursor(
  tokens: Token[],
  cursorPos: number
): { start: number; query: string } | null {
  let currentPos = 0;
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const tokenDisplayLength = getTokenDisplayLength(token);
    const tokenStart = currentPos;
    const tokenEnd = currentPos + tokenDisplayLength;
    
    // Check if cursor is in this token
    if (cursorPos >= tokenStart && cursorPos <= tokenEnd) {
      if (token.kind === 'text') {
        const offsetInToken = cursorPos - tokenStart;
        const textBeforeCursor = token.text.substring(0, offsetInToken);
        
        // Find last @ before cursor
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        if (lastAtIndex !== -1) {
          const query = textBeforeCursor.substring(lastAtIndex + 1);
          // Only trigger if query doesn't contain whitespace (still typing mention)
          if (!/\s/.test(query)) {
            return {
              start: tokenStart + lastAtIndex,
              query
            };
          }
        }
      }
      return null;
    }
    
    currentPos = tokenEnd;
  }
  
  return null;
}

// Replace @ trigger with mention token
// Removes "@query" and inserts mention, returns new tokens and cursor position
export function replaceTriggerWithMention(
  tokens: Token[],
  triggerStart: number,
  queryLength: number,
  mention: { name: string; type: 'user' | 'event' | 'group' | 'city'; id: string }
): { tokens: Token[]; newCursorPos: number } {
  // Remove the @query part (triggerStart to triggerStart + queryLength + 1 for @)
  const deleteEnd = triggerStart + queryLength + 1; // +1 for the @ symbol
  
  // Apply deletion
  const afterDelete = applyEditToTokens(tokens, triggerStart, deleteEnd, '');
  
  // Insert mention at the position
  return insertMentionAtPos(afterDelete.tokens, triggerStart, mention);
}
