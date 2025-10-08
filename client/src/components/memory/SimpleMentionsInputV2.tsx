import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Calendar } from 'lucide-react';
import {
  parseCanonicalToTokens,
  tokensToDisplay,
  tokensToCanonical,
  insertMentionAtPos,
  applyEditToTokens,
  Token
} from '@/utils/mentionTokens';

interface MentionData {
  id: string;
  display: string;
  type: 'user' | 'event';
  avatar?: string;
  status?: string;
}

interface SimpleMentionsInputProps {
  value: string; // Canonical format
  onChange: (content: string) => void; // Canonical format
  onMentionsChange?: (mentionIds: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  rows?: number;
}

const SimpleMentionsInputV2: React.FC<SimpleMentionsInputProps> = ({
  value,
  onChange,
  onMentionsChange,
  placeholder = "Share your memory and @mention people or events...",
  className = "",
  disabled = false,
  rows = 4
}) => {
  // Token-based state
  const [tokens, setTokens] = useState<Token[]>(() => parseCanonicalToTokens(value));
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentMention, setCurrentMention] = useState('');
  const [mentionStart, setMentionStart] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previousDisplayRef = useRef<string>('');
  const lastCanonicalRef = useRef<string>(value);
  
  // Initialize previousDisplayRef
  useEffect(() => {
    previousDisplayRef.current = tokensToDisplay(tokens);
  }, []);
  
  // Update tokens when value prop changes (external update only)
  useEffect(() => {
    // Only update if value prop changed externally (not from our own onChange)
    if (value !== lastCanonicalRef.current) {
      console.log('📥 External value change detected:', { oldValue: lastCanonicalRef.current, newValue: value });
      const newTokens = parseCanonicalToTokens(value);
      setTokens(newTokens);
      previousDisplayRef.current = tokensToDisplay(newTokens);
      lastCanonicalRef.current = value;
    }
  }, [value]);
  
  // Search for mentions
  const { data: searchData } = useQuery({
    queryKey: ['/api/search/multi', currentMention],
    queryFn: async () => {
      const response = await fetch(`/api/search/multi?q=${encodeURIComponent(currentMention)}&limit=10`);
      return await response.json();
    },
    enabled: currentMention.length >= 1 && showSuggestions,
    staleTime: 30000,
  });
  
  // Get suggestions
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
  
  // Check for @ mention trigger
  const updateMentionSuggestions = useCallback((displayValue: string, cursorPos: number) => {
    const textBeforeCursor = displayValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex >= 0) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!/\s/.test(textAfterAt)) {
        setCurrentMention(textAfterAt);
        setMentionStart(lastAtIndex);
        setShowSuggestions(true);
        return;
      }
    }
    
    setShowSuggestions(false);
  }, []);
  
  // Handle text change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDisplayValue = e.target.value;
    const prevDisplayValue = previousDisplayRef.current;
    const cursorPos = e.target.selectionStart || 0;
    
    console.log('⌨️ handleChange called:', {
      newDisplayValue,
      prevDisplayValue,
      tokensCount: tokens.length
    });
    
    // Safety check: if display values are identical, skip
    if (newDisplayValue === prevDisplayValue) {
      console.log('⏭️ Skipping - no change');
      return;
    }
    
    // Compute the change
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
    
    // Apply the change to tokens
    const insertedText = newDisplayValue.substring(changeStart, changeEndNew);
    const newTokens = applyEditToTokens(tokens, changeStart, changeEndOld, insertedText);
    
    console.log('📝 Applied edit:', {
      changeStart,
      changeEndOld,
      insertedText,
      newTokens
    });
    
    setTokens(newTokens);
    previousDisplayRef.current = newDisplayValue;
    
    // Emit canonical format
    const newCanonical = tokensToCanonical(newTokens);
    lastCanonicalRef.current = newCanonical; // Track our own change
    onChange(newCanonical);
    
    // Check for @ mention trigger
    updateMentionSuggestions(newDisplayValue, cursorPos);
  }, [tokens, onChange, updateMentionSuggestions]);
  
  // Insert mention
  const insertMention = useCallback((suggestion: MentionData) => {
    console.log('🎯 Insert Mention Called:', {
      suggestion,
      currentTokens: tokens,
      mentionStart,
      currentMention,
      displayValue: tokensToDisplay(tokens)
    });
    
    // Delete the @mention trigger text (e.g., "@mila")
    const deletedTokens = applyEditToTokens(
      tokens,
      mentionStart,
      mentionStart + currentMention.length + 1, // +1 for the @
      ''
    );
    
    console.log('🗑️ After deletion:', {
      deletedTokens,
      displayValue: tokensToDisplay(deletedTokens)
    });
    
    // Insert the mention token at the position
    const { tokens: finalTokens, newCursorPos } = insertMentionAtPos(
      deletedTokens,
      mentionStart,
      {
        name: suggestion.display,
        type: suggestion.type,
        id: suggestion.id
      }
    );
    
    console.log('➕ After insertion:', {
      finalTokens,
      displayValue: tokensToDisplay(finalTokens),
      newCursorPos
    });
    
    // Add a space after the mention
    const withSpace = applyEditToTokens(
      finalTokens,
      newCursorPos,
      newCursorPos,
      ' '
    );
    
    console.log('✅ Final tokens:', {
      withSpace,
      displayValue: tokensToDisplay(withSpace),
      canonical: tokensToCanonical(withSpace)
    });
    
    const newCanonical = tokensToCanonical(withSpace);
    const finalDisplay = tokensToDisplay(withSpace);
    
    // Update ALL refs and state synchronously BEFORE calling onChange
    lastCanonicalRef.current = newCanonical;
    previousDisplayRef.current = finalDisplay;
    setTokens(withSpace);
    setShowSuggestions(false);
    
    // Now call onChange - parent will re-render but our refs are already set
    onChange(newCanonical);
    
    // Focus and set cursor
    if (textareaRef.current) {
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
        const cursorPos = newCursorPos + 1; // +1 for the space
        textareaRef.current?.setSelectionRange(cursorPos, cursorPos);
      });
    }
  }, [tokens, mentionStart, currentMention, onChange]);
  
  // Extract mention IDs for notifications
  useEffect(() => {
    if (onMentionsChange) {
      const userMentions = tokens
        .filter(t => t.kind === 'mention' && t.type === 'user')
        .map(t => t.kind === 'mention' ? t.id : '')
        .filter(Boolean);
      
      onMentionsChange([...new Set(userMentions)]);
    }
  }, [tokens, onMentionsChange]);
  
  // Handle key navigation
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
  
  // Render styled content
  const renderStyledContent = () => {
    const parts: React.ReactNode[] = [];
    let key = 0;
    
    tokens.forEach(token => {
      if (token.kind === 'text') {
        parts.push(<span key={key++}>{token.text}</span>);
      } else {
        const color = token.type === 'user' 
          ? 'rgb(59, 130, 246)' // blue
          : 'rgb(34, 197, 94)'; // green
        
        parts.push(
          <span
            key={key++}
            style={{
              color,
              fontWeight: 500,
              backgroundColor: token.type === 'user' 
                ? 'rgb(219, 234, 254)' 
                : 'rgb(220, 252, 231)'
            }}
          >
            @{token.name}
          </span>
        );
      }
    });
    
    return (
      <div 
        className="absolute inset-0 p-3 pointer-events-none whitespace-pre-wrap break-words overflow-hidden" 
        style={{ 
          font: 'inherit',
          lineHeight: 'inherit',
          wordBreak: 'break-word'
        }}
      >
        {parts}
      </div>
    );
  };
  
  const displayValue = tokensToDisplay(tokens);
  
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <textarea
          ref={textareaRef}
          className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent relative z-10"
          style={{ color: 'transparent', caretColor: 'black' }}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
        />
        {renderStyledContent()}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-50 mt-1 w-full max-w-md shadow-lg">
          <CardContent className="p-2 max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <div
                key={`${suggestion.type}-${suggestion.id}`}
                className="flex items-center gap-3 p-2 hover:bg-[var(--color-neutral-100)] dark:hover:bg-gray-800 rounded cursor-pointer"
                onClick={() => insertMention(suggestion)}
                data-testid={`mention-suggestion-${suggestion.type}-${suggestion.id}`}
              >
                <Avatar className="h-8 w-8">
                  {suggestion.avatar && <AvatarImage src={suggestion.avatar} alt={suggestion.display} />}
                  <AvatarFallback>
                    {suggestion.type === 'user' ? <Users className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{suggestion.display}</div>
                  {suggestion.status && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{suggestion.status}</div>
                  )}
                </div>
                
                <Badge variant="secondary" className={
                  suggestion.type === 'user' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'bg-green-50 text-green-700'
                }>
                  {suggestion.type === 'user' ? '👤 User' : '📅 Event'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimpleMentionsInputV2;
