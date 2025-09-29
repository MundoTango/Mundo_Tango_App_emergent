import React, { useState, useRef, useCallback } from 'react';
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
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  rows?: number;
}

const SimpleMentionsInput: React.FC<SimpleMentionsInputProps> = ({
  value,
  onChange,
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

  // Search for mentions when @ is typed
  const { data: searchData, isLoading } = useQuery({
    queryKey: ['/api/search', 'users', currentMention],
    queryFn: async () => {
      const response = await apiRequest(`/api/search?type=users&q=${encodeURIComponent(currentMention)}&limit=10`);
      return await response.json();
    },
    enabled: currentMention.length >= 1 && showSuggestions,
    staleTime: 30000,
  });

  // Get suggestions from search data
  const suggestions: MentionData[] = React.useMemo(() => {
    if (!searchData) return [];
    
    const allSuggestions: MentionData[] = [];
    
    // The search API returns results directly at the root level
    const results = searchData.results || [];
    
    if (Array.isArray(results)) {
      results.forEach((user: any) => {
        // Extract the correct fields based on the search API response structure
        allSuggestions.push({
          id: user.id?.toString() || user._id,
          display: user.name || user.username || 'Unknown User',
          type: 'user',
          avatar: user.profileImage || user.avatar
        });
      });
    }
    
    console.log(`📝 ESA Mentions: Found ${allSuggestions.length} suggestions for "${currentMention}"`, {
      showSuggestions,
      searchData,
      results: allSuggestions
    });
    
    return allSuggestions;
  }, [searchData, currentMention, showSuggestions]);

  // Handle text change and detect @ mentions
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);
    
    // Check if we're in a mention context
    const textBeforeCursor = newValue.substring(0, cursorPos);
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
  }, [onChange]);

  // Insert mention into text
  const insertMention = useCallback((suggestion: MentionData) => {
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(mentionStart + currentMention.length + 1);
    // Fix: Use correct format @[Name](user:id) instead of (type:user,id:id)
    const mentionText = `@[${suggestion.display}](user:${suggestion.id})`;
    
    const newValue = beforeMention + mentionText + ' ' + afterMention;
    onChange(newValue);
    setShowSuggestions(false);
    
    // Focus back to textarea
    if (textareaRef.current) {
      const newCursorPos = beforeMention.length + mentionText.length + 1;
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  }, [value, mentionStart, currentMention, onChange]);

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

  // Convert internal format to display format
  const getDisplayValue = useCallback((text: string) => {
    // Replace @[Name](user:id) with just @Name (supports any ID format)
    return text.replace(/@\[([^\]]+)\]\(user:[^\)]+\)/g, '@$1');
  }, []);

  // Convert display format back to internal format when needed
  const [internalValue, setInternalValue] = useState(value);

  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Handle text change with format conversion
  const handleTextChangeWithFormat = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const displayValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    // For now, just pass through - mentions are inserted in proper format by insertMention
    onChange(displayValue);
    handleTextChange(e);
  }, [onChange, handleTextChange]);

  // Render styled text with blue mentions
  const renderStyledContent = () => {
    // Extract canonical mentions from internal value: @[Name](user:id)
    const canonicalRegex = /@\[([^\]]+)\]\(user:[^\)]+\)/g;
    const canonicalMatches: Array<{ start: number; end: number; name: string }> = [];
    let match;
    
    while ((match = canonicalRegex.exec(value)) !== null) {
      canonicalMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        name: match[1]
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
      
      // Add the highlighted mention
      const displayMention = `@${canonical.name}`;
      parts.push(
        <span key={`mention-${idx}`} className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded font-semibold">
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