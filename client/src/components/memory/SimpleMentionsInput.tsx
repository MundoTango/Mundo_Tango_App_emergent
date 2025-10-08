import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Calendar, UsersRound, MapPin } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import {
  Token,
  MentionToken,
  parseCanonicalToTokens,
  tokensToDisplay,
  tokensToCanonical,
  applyEditToTokens,
  replaceTriggerWithMention,
  findMentionTriggerAtCursor
} from '@/utils/mentionTokens';

interface MentionData {
  id: string;
  display: string;
  type: 'user' | 'event' | 'group' | 'city';
  avatar?: string;
  status?: string;
}

interface SimpleMentionsInputProps {
  value: string;
  onChange: (content: string) => void;
  onMentionsChange?: (mentionIds: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  rows?: number;
}

const SimpleMentionsInput: React.FC<SimpleMentionsInputProps> = ({
  value,
  onChange,
  onMentionsChange,
  placeholder = "Share your memory and @mention people, events, or cities...",
  className = "",
  disabled = false,
  rows = 4
}) => {
  // Internal state: tokens are the single source of truth
  const [tokens, setTokens] = useState<Token[]>(() => parseCanonicalToTokens(value));
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [currentMention, setCurrentMention] = useState('');
  const [mentionStart, setMentionStart] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const lastEmittedCanonical = useRef<string>(value);
  const isComposing = useRef(false);
  
  // Initialize tokens from parent value changes
  useEffect(() => {
    if (value !== lastEmittedCanonical.current) {
      const newTokens = parseCanonicalToTokens(value);
      setTokens(newTokens);
      renderTokensToEditor(newTokens);
    }
  }, [value]);

  // Render tokens to contentEditable
  const renderTokensToEditor = useCallback((tokensToRender: Token[]) => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    
    // Clear and rebuild
    editor.innerHTML = '';
    
    tokensToRender.forEach((token, index) => {
      if (token.kind === 'text') {
        const textNode = document.createTextNode(token.text);
        editor.appendChild(textNode);
      } else {
        // Create styled mention span
        const mentionSpan = document.createElement('span');
        mentionSpan.contentEditable = 'false';
        mentionSpan.setAttribute('data-mention-type', token.type);
        mentionSpan.setAttribute('data-mention-id', token.id);
        mentionSpan.className = getMentionClassName(token.type);
        mentionSpan.textContent = `@${token.name}`;
        editor.appendChild(mentionSpan);
        
        // Only add space if next token is not text or doesn't start with space
        const nextToken = tokensToRender[index + 1];
        if (!nextToken || (nextToken.kind === 'text' && !nextToken.text.startsWith(' '))) {
          const space = document.createTextNode(' ');
          editor.appendChild(space);
        }
      }
    });
    
    // Show placeholder if empty
    if (editor.textContent?.trim() === '') {
      editor.setAttribute('data-placeholder', placeholder);
    } else {
      editor.removeAttribute('data-placeholder');
    }
  }, [placeholder]);

  // Get mention styling class
  const getMentionClassName = (type: string) => {
    const baseClass = 'inline-flex items-center px-2 py-0.5 rounded-md font-semibold mx-0.5';
    switch (type) {
      case 'user':
        return `${baseClass} bg-blue-100 text-blue-700`;
      case 'event':
        return `${baseClass} bg-green-100 text-green-700`;
      case 'group':
        return `${baseClass} bg-purple-100 text-purple-700`;
      case 'city':
        return `${baseClass} bg-orange-100 text-orange-700`;
      default:
        return `${baseClass} bg-gray-100 text-gray-700`;
    }
  };

  // Extract tokens from contentEditable DOM (recursively handles nested nodes)
  const extractTokensFromEditor = useCallback((): Token[] => {
    if (!editorRef.current) return [];
    
    const newTokens: Token[] = [];
    
    const traverseNodes = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) {
          // Merge consecutive text tokens
          const lastToken = newTokens[newTokens.length - 1];
          if (lastToken && lastToken.kind === 'text') {
            lastToken.text += text;
          } else {
            newTokens.push({ kind: 'text', text });
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        
        // Handle mention spans
        if (element.hasAttribute('data-mention-type')) {
          const type = element.getAttribute('data-mention-type') as 'user' | 'event' | 'group' | 'city';
          const id = element.getAttribute('data-mention-id') || '';
          const name = element.textContent?.replace('@', '') || '';
          newTokens.push({ kind: 'mention', type, id, name });
        }
        // Handle BR tags as newlines
        else if (element.tagName === 'BR') {
          const lastToken = newTokens[newTokens.length - 1];
          if (lastToken && lastToken.kind === 'text') {
            lastToken.text += '\n';
          } else {
            newTokens.push({ kind: 'text', text: '\n' });
          }
        }
        // Recursively traverse child nodes for DIV, P, etc.
        else {
          Array.from(element.childNodes).forEach(traverseNodes);
        }
      }
    };
    
    Array.from(editorRef.current.childNodes).forEach(traverseNodes);
    
    return newTokens;
  }, []);

  // Get cursor position in display text
  const getCursorPosition = useCallback((): number => {
    if (!editorRef.current) return 0;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 0;
    
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    
    return preCaretRange.toString().length;
  }, []);

  // Handle input changes
  const handleInput = useCallback(() => {
    if (isComposing.current) return;
    
    const newTokens = extractTokensFromEditor();
    const displayValue = tokensToDisplay(newTokens);
    const cursorPos = getCursorPosition();
    
    setTokens(newTokens);
    
    // Emit canonical value
    const canonical = tokensToCanonical(newTokens);
    lastEmittedCanonical.current = canonical;
    console.log('🔍 [SimpleMentionsInput] Emitting canonical format:', canonical);
    onChange(canonical);
    
    // Extract and emit mention IDs for user mentions only
    if (onMentionsChange) {
      const mentionIds = newTokens
        .filter((token): token is MentionToken => token.kind === 'mention' && token.type === 'user')
        .map(token => token.id);
      onMentionsChange(mentionIds);
    }
    
    // Check for mention trigger
    const trigger = findMentionTriggerAtCursor(newTokens, cursorPos);
    if (trigger) {
      setCurrentMention(trigger.query);
      setMentionStart(trigger.start);
      setShowSuggestions(true);
      
      // Calculate suggestion position with viewport bounds checking
      if (editorRef.current) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const cursorRect = range.getBoundingClientRect();
          const editorRect = editorRef.current.getBoundingClientRect();
          
          // Dropdown dimensions
          const dropdownWidth = 320; // 80rem = 320px
          const dropdownHeight = 256; // max-h-64 = 256px
          
          // Calculate initial position (below cursor)
          let top = cursorRect.bottom - editorRect.top + 5;
          let left = cursorRect.left - editorRect.left;
          
          // Check if dropdown goes off right edge
          if (cursorRect.left + dropdownWidth > window.innerWidth) {
            // Align to right edge of viewport
            left = window.innerWidth - dropdownWidth - editorRect.left - 10;
          }
          
          // Check if dropdown goes off bottom edge
          if (cursorRect.bottom + dropdownHeight > window.innerHeight) {
            // Show above cursor instead
            top = cursorRect.top - editorRect.top - dropdownHeight - 5;
          }
          
          // Ensure left is not negative
          left = Math.max(0, left);
          
          setSuggestionPosition({
            top,
            left
          });
        }
      }
    } else {
      setShowSuggestions(false);
    }
  }, [extractTokensFromEditor, getCursorPosition, onChange]);

  // Insert mention at cursor
  const insertMention = useCallback((suggestion: MentionData) => {
    if (!editorRef.current) return;
    
    const currentTokens = extractTokensFromEditor();
    const displayValue = tokensToDisplay(currentTokens);
    const cursorPos = getCursorPosition();
    
    // Use token replacement logic
    const result = replaceTriggerWithMention(
      currentTokens,
      mentionStart,
      currentMention.length,
      {
        name: suggestion.display,
        type: suggestion.type,
        id: suggestion.id
      }
    );
    
    const newTokens = result.tokens;
    setTokens(newTokens);
    renderTokensToEditor(newTokens);
    
    // Emit canonical
    const canonical = tokensToCanonical(newTokens);
    lastEmittedCanonical.current = canonical;
    console.log('🔍 [SimpleMentionsInput] Mention inserted, canonical format:', canonical);
    onChange(canonical);
    
    // Extract and emit mention IDs for user mentions only
    if (onMentionsChange) {
      const mentionIds = newTokens
        .filter((token): token is MentionToken => token.kind === 'mention' && token.type === 'user')
        .map(token => token.id);
      onMentionsChange(mentionIds);
    }
    
    setShowSuggestions(false);
    editorRef.current.focus();
    
    // Move cursor to end
    setTimeout(() => {
      if (editorRef.current) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 0);
  }, [extractTokensFromEditor, getCursorPosition, mentionStart, currentMention, onChange]);

  // Search for mentions
  const { data: searchData } = useQuery({
    queryKey: ['/api/search/multi', currentMention],
    queryFn: async () => {
      const response = await apiRequest(`/api/search/multi?q=${encodeURIComponent(currentMention)}&limit=10`);
      return await response.json();
    },
    enabled: currentMention.length >= 1 && showSuggestions,
    staleTime: 30000,
  });

  // Get suggestions from search data
  const suggestions: MentionData[] = React.useMemo(() => {
    if (!searchData) return [];
    
    const allSuggestions: MentionData[] = [];
    const results = searchData.results || [];
    
    if (Array.isArray(results)) {
      results.forEach((item: any) => {
        if (item.type === 'users') {
          allSuggestions.push({
            id: item.id?.toString(),
            display: item.name || item.username || 'Unknown User',
            type: 'user',
            avatar: item.profileImage || item.avatar
          });
        } else if (item.type === 'events') {
          allSuggestions.push({
            id: item.id?.toString(),
            display: item.title || item.name || 'Unknown Event',
            type: 'event',
            avatar: item.image || item.imageUrl,
            status: item.startDate ? `📅 ${new Date(item.startDate).toLocaleDateString()}` : undefined
          });
        } else if (item.type === 'cityGroup') {
          // City Groups - orange with MapPin
          allSuggestions.push({
            id: item.slug || item.name?.toLowerCase().replace(/\s+/g, '-'),
            display: item.name || 'Unknown City Group',
            type: 'city',
            avatar: item.coverImage,
            status: item.city && item.country ? `📍 ${item.city}, ${item.country}` : (item.country || undefined)
          });
        } else if (item.type === 'professionalGroup') {
          // Professional Groups - purple with globe
          allSuggestions.push({
            id: item.slug || item.id?.toString(),
            display: item.name || 'Unknown Group',
            type: 'group',
            avatar: item.coverImage,
            status: '🌐 International'
          });
        } else if (item.type === 'communities' || item.type === 'groups') {
          // Fallback for other community/group types
          allSuggestions.push({
            id: item.id?.toString(),
            display: item.name || 'Unknown Group',
            type: 'group',
            avatar: item.coverImage,
            status: item.memberCount ? `👥 ${item.memberCount} members` : undefined
          });
        }
      });
    }
    
    return allSuggestions;
  }, [searchData]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        insertMention(suggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
      }
    }
  }, [showSuggestions, suggestions, selectedIndex, insertMention]);

  // Helper functions for styling
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'group':
        return <UsersRound className="h-4 w-4 text-purple-500" />;
      case 'city':
        return <MapPin className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-50 text-blue-700';
      case 'event':
        return 'bg-green-50 text-green-700';
      case 'group':
        return 'bg-purple-50 text-purple-700';
      case 'city':
        return 'bg-orange-50 text-orange-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  // Initialize editor content
  useEffect(() => {
    renderTokensToEditor(tokens);
  }, []);

  return (
    <div className="relative w-full">
      {/* ContentEditable editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => { isComposing.current = true; }}
        onCompositionEnd={() => { isComposing.current = false; handleInput(); }}
        className={`w-full p-3 rounded-lg border-2 border-gray-200 focus:border-emerald-400 focus:outline-none resize-none min-h-[100px] ${className}`}
        style={{
          minHeight: `${rows * 1.5}rem`,
          maxHeight: '300px',
          overflowY: 'auto'
        }}
        data-testid="input-mention"
      />
      
      {/* Suggestion dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Card 
          className="absolute w-80 max-h-64 overflow-y-auto shadow-xl border-2 border-emerald-200"
          style={{
            top: suggestionPosition.top,
            left: suggestionPosition.left,
            zIndex: 9999
          }}
        >
          <CardContent className="p-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.type}-${suggestion.id}`}
                onClick={() => insertMention(suggestion)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                  index === selectedIndex
                    ? 'bg-emerald-100 ring-2 ring-emerald-400'
                    : 'hover:bg-gray-100'
                }`}
                data-testid={`suggestion-${suggestion.type}-${suggestion.id}`}
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={suggestion.avatar} alt={suggestion.display} />
                  <AvatarFallback className={getTypeColor(suggestion.type)}>
                    {getTypeIcon(suggestion.type)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 truncate dark:text-neutral-100">
                      {suggestion.display}
                    </span>
                    <Badge variant="outline" className={`text-xs ${getTypeColor(suggestion.type)}`}>
                      {suggestion.type}
                    </Badge>
                  </div>
                  {suggestion.status && (
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {suggestion.status}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }
        
        [contenteditable]:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default SimpleMentionsInput;
