import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Calendar, UsersRound } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import {
  Token,
  parseCanonicalToTokens,
  tokensToDisplay,
  tokensToCanonical,
  applyEditToTokens,
  replaceTriggerWithMention,
  findMentionTriggerAtCursor,
  getDisplayLength
} from '@/utils/mentionTokens';

interface MentionData {
  id: string;
  display: string;
  type: 'user' | 'event' | 'group';
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
  placeholder = "Share your memory and @mention people or events...",
  className = "",
  disabled = false,
  rows = 4
}) => {
  // Internal state: tokens are the single source of truth
  const [tokens, setTokens] = useState<Token[]>(() => parseCanonicalToTokens(value));
  const [displayValue, setDisplayValue] = useState<string>(() => tokensToDisplay(tokens));
  const [cursorPos, setCursorPos] = useState<number>(0);
  
  // Mention suggestion state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [currentMention, setCurrentMention] = useState('');
  const [mentionStart, setMentionStart] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastEmittedCanonical = useRef<string>(value);
  const prevDisplayValue = useRef<string>(displayValue);
  
  // Initialize tokens from parent value changes
  useEffect(() => {
    if (value !== lastEmittedCanonical.current) {
      const newTokens = parseCanonicalToTokens(value);
      setTokens(newTokens);
      setDisplayValue(tokensToDisplay(newTokens));
      prevDisplayValue.current = tokensToDisplay(newTokens);
    }
  }, [value]);
  
  // Restore cursor position after state updates
  useLayoutEffect(() => {
    if (textareaRef.current && document.activeElement === textareaRef.current) {
      textareaRef.current.setSelectionRange(cursorPos, cursorPos);
    }
  }, [displayValue, cursorPos]);
  
  // Search for mentions when @ is typed
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
        }
      });
    }
    
    return allSuggestions;
  }, [searchData]);
  
  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);
  
  // Extract mention IDs and notify parent (user mentions only for notifications)
  useEffect(() => {
    if (onMentionsChange) {
      const userMentionIds: string[] = [];
      tokens.forEach(token => {
        if (token.kind === 'mention' && token.type === 'user') {
          userMentionIds.push(token.id);
        }
      });
      onMentionsChange(userMentionIds);
    }
  }, [tokens, onMentionsChange]);
  
  // Handle text input changes
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDisplayValue = e.target.value;
    const newCursorPos = e.target.selectionStart;
    
    // Compute diff between previous and new display value
    const oldDisplay = prevDisplayValue.current;
    let displayStart = 0;
    let displayEnd = 0;
    let insertText = '';
    
    // Find where the change occurred
    // Find common prefix
    while (displayStart < Math.min(oldDisplay.length, newDisplayValue.length) &&
           oldDisplay[displayStart] === newDisplayValue[displayStart]) {
      displayStart++;
    }
    
    // Find common suffix
    let oldEnd = oldDisplay.length;
    let newEnd = newDisplayValue.length;
    while (oldEnd > displayStart && newEnd > displayStart &&
           oldDisplay[oldEnd - 1] === newDisplayValue[newEnd - 1]) {
      oldEnd--;
      newEnd--;
    }
    
    displayEnd = oldEnd;
    insertText = newDisplayValue.substring(displayStart, newEnd);
    
    // Apply edit to tokens
    const result = applyEditToTokens(tokens, displayStart, displayEnd, insertText);
    const newTokens = result.tokens;
    const newCanonical = tokensToCanonical(newTokens);
    
    // Update state
    setTokens(newTokens);
    setDisplayValue(newDisplayValue);
    setCursorPos(newCursorPos);
    prevDisplayValue.current = newDisplayValue;
    
    // Emit canonical value to parent
    lastEmittedCanonical.current = newCanonical;
    onChange(newCanonical);
    
    // Check for mention trigger
    const trigger = findMentionTriggerAtCursor(newTokens, newCursorPos);
    if (trigger) {
      setCurrentMention(trigger.query);
      setMentionStart(trigger.start);
      setShowSuggestions(true);
      
      // Calculate suggestion position
      if (textareaRef.current) {
        const coords = getCaretCoordinates(textareaRef.current, newCursorPos);
        setSuggestionPosition({
          top: coords.top + 25,
          left: coords.left
        });
      }
    } else {
      setShowSuggestions(false);
    }
  }, [tokens, onChange]);
  
  // Insert mention
  const insertMention = useCallback((suggestion: MentionData) => {
    const result = replaceTriggerWithMention(
      tokens,
      mentionStart,
      currentMention.length,
      {
        name: suggestion.display,
        type: suggestion.type,
        id: suggestion.id
      }
    );
    
    const newTokens = result.tokens;
    const newCursorPos = result.newCursorPos + 1; // +1 for space after mention
    const newDisplay = tokensToDisplay(newTokens);
    const newCanonical = tokensToCanonical(newTokens);
    
    // Update state
    setTokens(newTokens);
    setDisplayValue(newDisplay);
    setCursorPos(newCursorPos);
    prevDisplayValue.current = newDisplay;
    setShowSuggestions(false);
    
    // Emit canonical to parent
    lastEmittedCanonical.current = newCanonical;
    onChange(newCanonical);
    
    // Focus textarea
    textareaRef.current?.focus();
  }, [tokens, mentionStart, currentMention, onChange]);
  
  // Handle keyboard navigation in suggestions
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
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };
  
  // Render styled content with colored mentions
  const renderStyledContent = () => {
    const parts: JSX.Element[] = [];
    let displayIndex = 0;
    
    tokens.forEach((token, i) => {
      if (token.kind === 'text') {
        if (token.text) {
          parts.push(
            <span key={`text-${i}`} className="text-gray-700">
              {token.text}
            </span>
          );
        }
        displayIndex += token.text.length;
      } else {
        const mentionDisplay = `@${token.name}`;
        const colorClass = token.type === 'user' 
          ? 'text-blue-600 font-semibold' 
          : 'text-green-600 font-semibold';
        
        parts.push(
          <span key={`mention-${i}`} className={colorClass}>
            {mentionDisplay}
          </span>
        );
        displayIndex += mentionDisplay.length;
      }
    });
    
    return parts.length > 0 ? parts : <span className="text-gray-400">{placeholder}</span>;
  };
  
  return (
    <div className="relative w-full">
      {/* Styled overlay showing colored mentions */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden whitespace-pre-wrap break-words"
        style={{
          padding: '0.75rem',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          color: 'transparent',
          zIndex: 1
        }}
        aria-hidden="true"
      >
        {renderStyledContent()}
      </div>
      
      {/* Actual textarea (invisible text) */}
      <textarea
        ref={textareaRef}
        value={displayValue}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`w-full p-3 rounded-lg border-2 border-gray-200 focus:border-emerald-400 focus:outline-none resize-none relative z-10 bg-transparent caret-gray-900 ${className}`}
        style={{
          color: 'transparent',
          caretColor: '#111827'
        }}
        data-testid="input-mention"
      />
      
      {/* Suggestion dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Card 
          className="absolute z-50 w-80 max-h-64 overflow-y-auto shadow-xl border-2 border-emerald-200"
          style={{
            top: suggestionPosition.top,
            left: suggestionPosition.left
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
                    <span className="font-semibold text-gray-900 truncate">
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
    </div>
  );
};

// Get caret coordinates in textarea for positioning dropdown
function getCaretCoordinates(element: HTMLTextAreaElement, position: number) {
  const div = document.createElement('div');
  const style = getComputedStyle(element);
  const properties = [
    'padding', 'margin', 'border', 'font', 'lineHeight',
    'letterSpacing', 'wordSpacing', 'whiteSpace', 'wordWrap'
  ];
  
  properties.forEach(prop => {
    div.style[prop as any] = style[prop as any];
  });
  
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre-wrap';
  div.style.wordWrap = 'break-word';
  div.textContent = element.value.substring(0, position);
  
  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);
  
  document.body.appendChild(div);
  
  const coordinates = {
    top: span.offsetTop,
    left: span.offsetLeft
  };
  
  document.body.removeChild(div);
  
  return coordinates;
}

export default SimpleMentionsInput;
