import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Calendar, UsersRound } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

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
  onMentionsChange?: (mentionIds: string[]) => void; // ESA Layer 24: Callback for extracted mention IDs
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [currentMention, setCurrentMention] = useState('');
  const [mentionStart, setMentionStart] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0); // Track selected suggestion for keyboard nav
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingDisplaySelection = useRef<number | null>(null);

  // Search for mentions when @ is typed (both users and events)
  const { data: searchData, isLoading } = useQuery({
    queryKey: ['/api/search/multi', currentMention],
    queryFn: async () => {
      const response = await apiRequest(`/api/search/multi?q=${encodeURIComponent(currentMention)}&limit=10`);
      return await response.json();
    },
    enabled: currentMention.length >= 1 && showSuggestions,
    staleTime: 30000,
  });

  // Get suggestions from search data (users and events)
  const suggestions: MentionData[] = React.useMemo(() => {
    if (!searchData) return [];
    
    const allSuggestions: MentionData[] = [];
    
    // Multi-search returns results with type field
    const results = searchData.results || [];
    
    if (Array.isArray(results)) {
      results.forEach((item: any) => {
        // Only show users and events in mention suggestions (not posts or communities)
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
        // Ignore posts and communities - they can't be mentioned
      });
    }
    
    return allSuggestions;
  }, [searchData, currentMention, showSuggestions]);

  // Convert internal format to display format
  const getDisplayValue = useCallback((text: string) => {
    // Replace @[Name](user:id) or @[Name](event:id) with just @Name
    return text.replace(/@\[([^\]]+)\]\((user|event):[^\)]+\)/g, '@$1');
  }, []);

  // Convert cursor position from canonical format to display format
  const getDisplayCursorPosition = useCallback((canonicalText: string, canonicalPos: number): number => {
    const beforeCursor = canonicalText.substring(0, canonicalPos);
    const beforeCursorDisplay = getDisplayValue(beforeCursor);
    return beforeCursorDisplay.length;
  }, [getDisplayValue]);

  // Convert cursor position from display format to canonical format
  const getCanonicalCursorPosition = useCallback((canonicalText: string, displayPos: number): number => {
    let canonicalIndex = 0;
    let displayIndex = 0;
    const canonicalRegex = /@\[([^\]]+)\]\((user|event):([^\)]+)\)/g;
    
    while (canonicalIndex < canonicalText.length && displayIndex < displayPos) {
      // Check if we're at the start of a mention
      const remaining = canonicalText.substring(canonicalIndex);
      const match = canonicalRegex.exec(remaining);
      canonicalRegex.lastIndex = 0; // Reset regex
      
      if (match && match.index === 0) {
        // We're at a mention - advance display by @Name length, canonical by full mention length
        const displayLength = `@${match[1]}`.length;
        canonicalIndex += match[0].length;
        displayIndex += displayLength;
      } else {
        // Regular character - both indices advance
        canonicalIndex++;
        displayIndex++;
      }
    }
    
    return canonicalIndex;
  }, []);

  // Update @ mention suggestion state based on cursor position (displayValue and displayCursorPos)
  // Note: This function receives display coordinates but needs to work with canonical text for insertion
  const updateMentionSuggestions = useCallback((displayValue: string, displayCursorPos: number, canonicalValue: string) => {
    // Check if we're in a mention context (in display format)
    const textBeforeCursor = displayValue.substring(0, displayCursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      const hasSpaceAfterAt = textAfterAt.includes(' ');
      
      if (!hasSpaceAfterAt && textAfterAt.length <= 50) {
        // We're in a mention - convert display position to canonical position
        const canonicalMentionStart = getCanonicalCursorPosition(canonicalValue, lastAtIndex);
        
        setCurrentMention(textAfterAt);
        setMentionStart(canonicalMentionStart); // Store canonical position!
        setShowSuggestions(true);
        
        // Calculate suggestion position using canonical cursor position
        const textarea = textareaRef.current;
        if (textarea) {
          const canonicalCursorPos = getCanonicalCursorPosition(canonicalValue, displayCursorPos);
          const coords = getCaretCoordinates(textarea, canonicalCursorPos);
          setSuggestionPosition({
            top: coords.top + 25,
            left: coords.left
          });
        }
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  }, [getCanonicalCursorPosition]);

  // Handler for text change - converts to display format for detection
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCanonicalValue = e.target.value;
    const canonicalCursorPos = e.target.selectionStart;
    
    // Store canonical format in state
    onChange(newCanonicalValue);
    
    // Convert to display format for @ mention detection
    const displayValue = getDisplayValue(newCanonicalValue);
    const displayCursorPos = getDisplayCursorPosition(newCanonicalValue, canonicalCursorPos);
    
    // Pass both display and canonical values for proper coordinate conversion
    updateMentionSuggestions(displayValue, displayCursorPos, newCanonicalValue);
  }, [onChange, updateMentionSuggestions, getDisplayValue, getDisplayCursorPosition]);

  // Insert mention into text (supports both user and event mentions)
  const insertMention = useCallback((suggestion: MentionData) => {
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(mentionStart + currentMention.length + 1);
    // Format: @[Name](user:id) or @[Event Name](event:id)
    const mentionText = `@[${suggestion.display}](${suggestion.type}:${suggestion.id})`;
    
    const newValue = beforeMention + mentionText + ' ' + afterMention;
    
    // Calculate cursor position in DISPLAY format (since textarea shows display text)
    // Cursor should be placed after the inserted mention + space in display text
    const beforeMentionDisplay = getDisplayValue(beforeMention);
    const mentionDisplayLength = `@${suggestion.display}`.length;
    const newCursorPosInDisplay = beforeMentionDisplay.length + mentionDisplayLength + 1; // +1 for space
    
    const finalDisplayValue = getDisplayValue(newValue);
    const actualMentionDisplay = `@${suggestion.display}`;
    console.log('🎯 Cursor Calculation:', {
      step1_mentionStart: mentionStart,
      step2_currentMention: currentMention,
      step3_beforeCanonical: beforeMention,
      step4_beforeDisplay: beforeMentionDisplay,
      step5_mentionDisplay: actualMentionDisplay,
      step6_calculation: `${beforeMentionDisplay.length} + ${mentionDisplayLength} + 1 = ${newCursorPosInDisplay}`,
      step7_finalDisplay: finalDisplayValue,
      step8_finalDisplayLength: finalDisplayValue.length,
      step9_charAtCursor: finalDisplayValue[newCursorPosInDisplay] || 'END',
      step10_textUpToCursor: finalDisplayValue.substring(0, newCursorPosInDisplay),
      VERIFY_mentionDisplayLength: actualMentionDisplay.length
    });
    
    // Blur textarea to prevent React from capturing/restoring cursor position
    if (textareaRef.current) {
      textareaRef.current.blur();
    }
    
    // Update state and mark cursor position to apply after React updates
    pendingDisplaySelection.current = newCursorPosInDisplay;
    onChange(newValue);
    setShowSuggestions(false);
    
    console.log('📍 Pending cursor position after mention insertion:', {
      targetPosition: newCursorPosInDisplay,
      finalDisplayValue,
      willBeAppliedInLayoutEffect: true
    });
  }, [value, mentionStart, currentMention, onChange, getDisplayValue]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  // Apply pending cursor position after React updates the textarea
  useLayoutEffect(() => {
    if (pendingDisplaySelection.current !== null && textareaRef.current) {
      // Use RAF to run AFTER React's selection restoration
      const targetPos = pendingDisplaySelection.current;
      
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          const actualDisplay = textareaRef.current.value;
          const safePos = Math.min(targetPos, actualDisplay.length);
          
          console.log('✅ Applying cursor position in RAF:', {
            targetPos,
            safePos,
            textLength: actualDisplay.length,
            valueLength: value.length,
            textPreview: actualDisplay.substring(Math.max(0, safePos - 15), safePos + 15),
            currentSelection: [textareaRef.current.selectionStart, textareaRef.current.selectionEnd]
          });
          
          textareaRef.current.setSelectionRange(safePos, safePos);
          textareaRef.current.focus();
        }
      });
      
      pendingDisplaySelection.current = null;
    }
  }, [value]);

  // Handle key navigation in suggestions
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

  // Track previous display value to compute diffs
  const prevDisplayRef = useRef(getDisplayValue(value));

  React.useEffect(() => {
    prevDisplayRef.current = getDisplayValue(value);
  }, [value, getDisplayValue]);

  // Build mention span map: positions in display text that correspond to mentions
  const getMentionSpans = useCallback((canonicalText: string): Array<{
    displayStart: number;
    displayEnd: number;
    canonicalStart: number;
    canonicalEnd: number;
    fullMatch: string;
    name: string;
    type: string;
  }> => {
    const spans: Array<any> = [];
    // Match both user and event mentions
    const canonicalRegex = /@\[([^\]]+)\]\((user|event):([^\)]+)\)/g;
    let match;
    let displayOffset = 0;
    let canonicalOffset = 0;
    
    while ((match = canonicalRegex.exec(canonicalText)) !== null) {
      const beforeMention = canonicalText.substring(canonicalOffset, match.index);
      displayOffset += beforeMention.length;
      
      const displayMention = `@${match[1]}`;
      spans.push({
        displayStart: displayOffset,
        displayEnd: displayOffset + displayMention.length,
        canonicalStart: match.index,
        canonicalEnd: match.index + match[0].length,
        fullMatch: match[0],
        name: match[1],
        type: match[2] // 'user' or 'event'
      });
      
      displayOffset += displayMention.length;
      canonicalOffset = match.index + match[0].length;
    }
    
    return spans;
  }, []);


  // Track previous mention IDs to prevent infinite loops
  const prevMentionIdsRef = useRef<string>('');

  // ESA Layer 24: Extract mention IDs and notify parent component (user mentions only for notifications)
  useEffect(() => {
    if (onMentionsChange) {
      const extractMentionIds = (content: string): string[] => {
        const mentionRegex = /@\[([^\]]+)\]\(user:(\d+)\)/g;
        const ids: string[] = [];
        let match;
        
        while ((match = mentionRegex.exec(content)) !== null) {
          ids.push(match[2]); // Extract user ID (only users get notified)
        }
        
        return [...new Set(ids)]; // Remove duplicates
      };
      
      const mentionIds = extractMentionIds(value);
      const mentionIdsKey = mentionIds.sort().join(',');
      
      // Only call onMentionsChange if the mention IDs actually changed
      if (mentionIdsKey !== prevMentionIdsRef.current) {
        prevMentionIdsRef.current = mentionIdsKey;
        onMentionsChange(mentionIds);
      }
    }
  }, [value, onMentionsChange]);

  // Handle text change with mention preservation
  const handleTextChangeWithFormat = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDisplayValue = e.target.value;
    const prevDisplayValue = prevDisplayRef.current;
    const cursorPos = e.target.selectionStart || 0;
    
    console.log('📝 Text Change:', {
      prevDisplay: prevDisplayValue,
      newDisplay: newDisplayValue,
      currentCanonical: value,
      cursorPos
    });
    
    // Get mention spans in the current canonical value
    const mentionSpans = getMentionSpans(value);
    
    console.log('🔍 Mention Spans:', mentionSpans);
    
    // If no mentions, just pass through to simple handler
    if (mentionSpans.length === 0) {
      console.log('✅ No mentions, passing through');
      handleTextChange(e);
      return;
    }
    
    // For simplicity: rebuild canonical from display by finding each mention
    let newCanonical = newDisplayValue;
    
    // Replace each @Name with its full canonical format
    // Sort by position to process from end to start (avoid position shifts)
    const sortedSpans = [...mentionSpans].sort((a, b) => b.displayStart - a.displayStart);
    
    for (const span of sortedSpans) {
      const displayMention = `@${span.name}`;
      
      // Find this mention in the new display value
      const foundIndex = newDisplayValue.indexOf(displayMention);
      
      console.log(`🔎 Looking for "${displayMention}" in new display:`, {
        found: foundIndex >= 0,
        foundIndex,
        canonical: span.fullMatch
      });
      
      if (foundIndex >= 0) {
        // Replace display mention with canonical
        newCanonical = 
          newCanonical.substring(0, foundIndex) +
          span.fullMatch +
          newCanonical.substring(foundIndex + displayMention.length);
      }
    }
    
    console.log('✅ New Canonical:', newCanonical);
    
    onChange(newCanonical);
    updateMentionSuggestions(newDisplayValue, cursorPos, newCanonical);
  }, [value, onChange, handleTextChange, getMentionSpans, updateMentionSuggestions]);

  // Render styled text with colored mentions (blue for users, green for events)
  const renderStyledContent = () => {
    // Extract canonical mentions from internal value: @[Name](user:id) or @[Name](event:id)
    const canonicalRegex = /@\[([^\]]+)\]\((user|event):([^\)]+)\)/g;
    const canonicalMatches: Array<{ start: number; end: number; name: string; type: string }> = [];
    let match;
    
    while ((match = canonicalRegex.exec(value)) !== null) {
      canonicalMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        name: match[1],
        type: match[2] // 'user' or 'event'
      });
    }
    
    // If no canonical matches, just return plain text (no highlighting)
    if (canonicalMatches.length === 0) {
      return (
        <div 
          className="absolute inset-0 p-3 pointer-events-none whitespace-pre-wrap break-words overflow-hidden" 
          style={{ 
            font: 'inherit',
            lineHeight: 'inherit',
            wordBreak: 'break-word'
          }}
        >
          {getDisplayValue(value)}
        </div>
      );
    }
    
    // Build display text and track position mapping
    // @[Name](user:id) becomes @Name in display
    const parts: (string | JSX.Element)[] = [];
    let internalIndex = 0;
    let displayOffset = 0;
    
    canonicalMatches.forEach((canonical, idx) => {
      // Add text before this mention (convert to display format)
      if (canonical.start > internalIndex) {
        const beforeText = value.substring(internalIndex, canonical.start);
        parts.push(getDisplayValue(beforeText));
        displayOffset += getDisplayValue(beforeText).length;
      }
      
      // Add the highlighted mention with color based on type
      const displayMention = `@${canonical.name}`;
      const mentionClass = canonical.type === 'event' 
        ? 'text-green-600 bg-green-50 px-1 py-0.5 rounded font-semibold'
        : 'text-blue-600 bg-blue-50 px-1 py-0.5 rounded font-semibold';
      parts.push(
        <span key={`mention-${idx}`} className={mentionClass}>
          {displayMention}
        </span>
      );
      displayOffset += displayMention.length;
      
      internalIndex = canonical.end;
    });
    
    // Add remaining text after last mention (convert to display format)
    if (internalIndex < value.length) {
      const remainingText = value.substring(internalIndex);
      parts.push(getDisplayValue(remainingText));
    }
    
    return (
      <div 
        className="absolute inset-0 p-3 pointer-events-none whitespace-pre-wrap break-words overflow-hidden" 
        style={{ 
          font: 'inherit',
          lineHeight: 'inherit',
          wordBreak: 'break-word'
        }}
      >
        {parts.map((part, index) => {
          if (typeof part === 'string') {
            return <span key={`text-${index}`}>{part}</span>;
          }
          return part;
        })}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Styled overlay */}
      {value && renderStyledContent()}
      
      <textarea
        ref={textareaRef}
        value={getDisplayValue(value)}
        onChange={handleTextChangeWithFormat}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent relative bg-transparent"
        style={{ color: value ? 'transparent' : 'inherit', caretColor: '#111827' }}
      />
      
      {/* Suggestions dropdown */}
      {showSuggestions && (
        <Card 
          className="absolute z-[9999] w-80 max-h-60 overflow-y-auto shadow-2xl border-2 border-blue-500 bg-white"
          style={{
            top: '100%',
            left: 0,
            marginTop: '4px'
          }}
        >
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-3 text-sm text-gray-500">Searching...</div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.type}-${suggestion.id}`}
                  className={`flex items-center gap-3 p-3 cursor-pointer border-b last:border-b-0 ${
                    index === selectedIndex ? 'bg-blue-100' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => insertMention(suggestion)}
                >
                  {/* Avatar or Icon */}
                  <div className="flex-shrink-0">
                    {suggestion.avatar ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={suggestion.avatar} alt={suggestion.display} />
                        <AvatarFallback>
                          {suggestion.display.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {getTypeIcon(suggestion.type)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {suggestion.display}
                    </div>
                    {suggestion.status && (
                      <div className="text-sm text-gray-500 truncate">
                        {suggestion.status}
                      </div>
                    )}
                  </div>

                  {/* Type Badge */}
                  <Badge 
                    variant="secondary" 
                    className={`${getTypeColor(suggestion.type)} capitalize text-xs`}
                  >
                    {suggestion.type}
                  </Badge>
                </div>
              ))
            ) : currentMention.length > 0 ? (
              <div className="p-3 text-sm text-gray-500">No matches found</div>
            ) : null}
          </CardContent>
        </Card>
      )}
      
      {/* Helper text */}
      <div className="mt-2 text-xs text-gray-500">
        Type @ to mention users or events. Use arrow keys to navigate, Enter to select.
      </div>
    </div>
  );
};

// Utility function to get caret coordinates
function getCaretCoordinates(element: HTMLTextAreaElement, position: number) {
  const div = document.createElement('div');
  const style = getComputedStyle(element);
  
  // Copy styles from textarea
  [
    'position', 'left', 'top', 'width', 'height', 'border', 'padding',
    'margin', 'font-family', 'font-size', 'font-weight', 'line-height',
    'letter-spacing', 'white-space', 'word-wrap', 'overflow-wrap'
  ].forEach(prop => {
    div.style[prop as any] = style[prop as any];
  });
  
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre-wrap';
  div.style.wordWrap = 'break-word';
  
  const text = element.value.substring(0, position);
  div.textContent = text;
  
  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);
  
  document.body.appendChild(div);
  
  const rect = element.getBoundingClientRect();
  const spanRect = span.getBoundingClientRect();
  const divRect = div.getBoundingClientRect();
  
  const coordinates = {
    top: spanRect.top - divRect.top + rect.top,
    left: spanRect.left - divRect.left + rect.left
  };
  
  document.body.removeChild(div);
  return coordinates;
}

export default SimpleMentionsInput;