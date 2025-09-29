import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Update @ mention suggestion state based on cursor position
  const updateMentionSuggestions = useCallback((displayValue: string, cursorPos: number) => {
    // Check if we're in a mention context
    const textBeforeCursor = displayValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      const hasSpaceAfterAt = textAfterAt.includes(' ');
      
      if (!hasSpaceAfterAt && textAfterAt.length <= 50) {
        // We're in a mention
        setCurrentMention(textAfterAt);
        setMentionStart(lastAtIndex);
        setShowSuggestions(true);
        
        // Calculate suggestion position
        const textarea = textareaRef.current;
        if (textarea) {
          const coords = getCaretCoordinates(textarea, cursorPos);
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
  }, []);

  // Convert internal format to display format
  const getDisplayValue = useCallback((text: string) => {
    // Replace @[Name](user:id) or @[Name](event:id) with just @Name
    return text.replace(/@\[([^\]]+)\]\((user|event):[^\)]+\)/g, '@$1');
  }, []);

  // Legacy handler for simple text change (no mentions)
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);
    updateMentionSuggestions(newValue, cursorPos);
  }, [onChange, updateMentionSuggestions]);

  // Insert mention into text (supports both user and event mentions)
  const insertMention = useCallback((suggestion: MentionData) => {
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(mentionStart + currentMention.length + 1);
    // Format: @[Name](user:id) or @[Event Name](event:id)
    const mentionText = `@[${suggestion.display}](${suggestion.type}:${suggestion.id})`;
    
    const newValue = beforeMention + mentionText + ' ' + afterMention;
    onChange(newValue);
    setShowSuggestions(false);
    
    // Calculate cursor position in display format
    // beforeMention might contain other mentions, so we need to convert to display length
    const beforeMentionDisplay = getDisplayValue(beforeMention);
    const mentionDisplayLength = `@${suggestion.display}`.length;
    const newCursorPosInDisplay = beforeMentionDisplay.length + mentionDisplayLength + 1; // +1 for space
    
    // Focus back to textarea and set cursor in display coordinates
    if (textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(newCursorPosInDisplay, newCursorPosInDisplay);
      }, 0);
    }
  }, [value, mentionStart, currentMention, onChange, getDisplayValue]);

  // Handle key navigation in suggestions
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        e.preventDefault();
      } else if (e.key === 'Enter' && suggestions.length > 0) {
        insertMention(suggestions[0]);
        e.preventDefault();
      }
    }
  }, [showSuggestions, suggestions, insertMention]);

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

  // Store intended cursor position
  const intendedCursorPosRef = useRef<number | null>(null);

  // Restore cursor position after React updates
  useEffect(() => {
    if (intendedCursorPosRef.current !== null && textareaRef.current) {
      const pos = intendedCursorPosRef.current;
      textareaRef.current.setSelectionRange(pos, pos);
      intendedCursorPosRef.current = null;
    }
  }, [value]);

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
      onMentionsChange(mentionIds);
    }
  }, [value, onMentionsChange]);

  // Handle text change with mention preservation
  const handleTextChangeWithFormat = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDisplayValue = e.target.value;
    const prevDisplayValue = prevDisplayRef.current;
    const cursorPos = e.target.selectionStart || 0;
    
    // Get mention spans in the current canonical value
    const mentionSpans = getMentionSpans(value);
    
    // If no mentions, just pass through to simple handler
    if (mentionSpans.length === 0) {
      handleTextChange(e);
      return;
    }
    
    // Compute the minimal diff between old and new display values
    let changeStart = 0;
    let changeEndOld = prevDisplayValue.length;
    let changeEndNew = newDisplayValue.length;
    
    // Find common prefix
    while (changeStart < Math.min(prevDisplayValue.length, newDisplayValue.length) && 
           prevDisplayValue[changeStart] === newDisplayValue[changeStart]) {
      changeStart++;
    }
    
    // Find common suffix
    while (changeEndOld > changeStart && 
           changeEndNew > changeStart && 
           prevDisplayValue[changeEndOld - 1] === newDisplayValue[changeEndNew - 1]) {
      changeEndOld--;
      changeEndNew--;
    }
    
    // Check if the change intersects any mention span
    for (const span of mentionSpans) {
      if ((changeStart >= span.displayStart && changeStart < span.displayEnd) ||
          (changeEndOld > span.displayStart && changeEndOld <= span.displayEnd) ||
          (changeStart < span.displayStart && changeEndOld > span.displayEnd)) {
        // Change intersects this mention - delete the entire mention
        const beforeMention = value.substring(0, span.canonicalStart);
        const afterMention = value.substring(span.canonicalEnd);
        const newCanonical = beforeMention + afterMention;
        onChange(newCanonical);
        updateMentionSuggestions(newDisplayValue, cursorPos);
        intendedCursorPosRef.current = cursorPos;
        return;
      }
    }
    
    // Change is outside all mentions - apply it to canonical format
    // Map display positions to canonical positions by counting format length differences
    let canonicalChangeStart = changeStart;
    let canonicalChangeEnd = changeEndOld;
    
    for (const span of mentionSpans) {
      const displayLen = span.displayEnd - span.displayStart;
      const canonicalLen = span.canonicalEnd - span.canonicalStart;
      const formatDiff = canonicalLen - displayLen;
      
      // If this mention is completely before the change start, adjust start position
      if (span.displayEnd <= changeStart) {
        canonicalChangeStart += formatDiff;
      }
      
      // If this mention is completely before the change end, adjust end position
      if (span.displayEnd <= changeEndOld) {
        canonicalChangeEnd += formatDiff;
      }
    }
    
    // Apply the change
    const beforeChange = value.substring(0, canonicalChangeStart);
    const insertedText = newDisplayValue.substring(changeStart, changeEndNew);
    const afterChange = value.substring(canonicalChangeEnd);
    
    const newCanonical = beforeChange + insertedText + afterChange;
    onChange(newCanonical);
    updateMentionSuggestions(newDisplayValue, cursorPos);
    intendedCursorPosRef.current = cursorPos;
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
      // Add text before this mention
      if (canonical.start > internalIndex) {
        const beforeText = value.substring(internalIndex, canonical.start);
        parts.push(beforeText);
        displayOffset += beforeText.length;
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
    
    // Add remaining text after last mention
    if (internalIndex < value.length) {
      parts.push(value.substring(internalIndex));
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
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
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
        Type @ to mention users or events. Press Enter to select the first suggestion.
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