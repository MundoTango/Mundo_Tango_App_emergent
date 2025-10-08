// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Layer 9: UI Framework Agent - MentionTextarea Component
// @mentioning functionality for user tagging in posts

import { useState, useCallback } from 'react';
import { MentionsInput, Mention } from 'react-mentions';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  placeholder?: string;
  className?: string;
}

interface User {
  id: string;
  display: string;
  username: string;
  avatar?: string;
}

export default function MentionTextarea({
  value,
  onChange,
  onFocus,
  placeholder,
  className
}: MentionTextareaProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  // Search for users when typing @
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users/search', searchTerm],
    enabled: searchTerm.length > 0,
    staleTime: 30000,
  });

  // Format users for react-mentions
  const formattedUsers = (users as any[]).map((user: any) => ({
    id: user.id || user.username,
    display: user.name || user.username,
    username: user.username,
    avatar: user.profilePicture
  }));

  const searchUsers = useCallback((search: string, callback: (users: User[]) => void) => {
    setSearchTerm(search);
    
    // Filter users based on search
    const filtered = formattedUsers.filter((user: User) => 
      user.display.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase())
    );
    
    // Return demo users if no real users found (for demo purposes)
    if (filtered.length === 0 && search.length > 0) {
      const demoUsers = [
        { id: '1', display: 'Pierre Dubois', username: 'pierre_dancer' },
        { id: '2', display: 'Maria Rodriguez', username: 'maria_tango' },
        { id: '3', display: 'Carlos Mendez', username: 'carlos_milonga' },
        { id: '4', display: 'Sofia Gonzalez', username: 'sofia_vals' },
        { id: '5', display: 'Juan Carlos', username: 'juan_leader' }
      ].filter(user => 
        user.display.toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase())
      );
      callback(demoUsers);
    } else {
      callback(filtered);
    }
  }, [formattedUsers]);

  // Custom styles for mentions
  const mentionStyles = {
    control: {
      fontSize: 14,
      fontWeight: 'normal',
      minHeight: 100,
    },
    input: {
      margin: 0,
      padding: '16px',
      borderRadius: '8px',
      outline: 'none',
      border: 'none',
      backgroundColor: theme === 'light' ? '#f9fafb' : 'rgba(51, 65, 85, 0.5)',
      color: theme === 'light' ? '#111827' : 'var(--color-neutral-0)',
      resize: 'none' as const,
      fontFamily: 'inherit',
      transition: 'all 0.2s',
    },
    '&multiLine': {
      control: {
        minHeight: 100,
      },
      highlighter: {
        padding: '16px',
        border: 'none',
      },
      input: {
        padding: '16px',
        border: 'none',
        outline: 'none',
      },
    },
    suggestions: {
      list: {
        backgroundColor: theme === 'light' ? 'var(--color-neutral-0)' : '#1e293b',
        border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#334155'}`,
        borderRadius: '8px',
        fontSize: 14,
        overflow: 'hidden',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        maxHeight: '200px',
        overflowY: 'auto' as const,
      },
      item: {
        padding: '10px 15px',
        borderBottom: `1px solid ${theme === 'light' ? '#f3f4f6' : '#334155'}`,
        backgroundColor: theme === 'light' ? 'var(--color-neutral-0)' : '#1e293b',
        color: theme === 'light' ? '#111827' : '#f1f5f9',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        '&focused': {
          backgroundColor: theme === 'light' ? '#f3f4f6' : '#334155',
          color: theme === 'light' ? '#7c3aed' : '#5eead4',
        },
      },
    },
  };

  const mentionHighlightStyle = {
    backgroundColor: theme === 'light' ? '#ddd6fe' : '#155e75',
    color: theme === 'light' ? '#7c3aed' : '#5eead4',
    padding: '1px 2px',
    borderRadius: '3px',
    fontWeight: '500',
  };

  return (
    <div className={cn(
      "mentions-wrapper w-full",
      theme === 'light' ? 'mentions-light' : 'mentions-dark',
      className
    )}>
      <MentionsInput
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        style={mentionStyles}
        allowSuggestionsAboveCursor
        allowSpaceInQuery
      >
        <Mention
          trigger="@"
          data={searchUsers}
          displayTransform={(id: string, display: string) => `@${display}`}
          renderSuggestion={(suggestion: any) => {
            const user = suggestion as User;
            return (
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.display}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#5EEAD4] to-[#155E75] flex items-center justify-center text-white text-xs font-bold">
                    {user.display[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-medium">{user.display}</div>
                  <div className={cn(
                    "text-xs",
                    theme === 'light' ? "text-gray-500" : "text-slate-400"
                  )}>
                    @{user.username || ''}
                  </div>
                </div>
              </div>
            );
          }}
          style={mentionHighlightStyle}
        />
        <Mention
          trigger="#"
          data={(search: string, callback: (tags: any[]) => void) => {
            const tags = [
              { id: 'milonga', display: 'milonga' },
              { id: 'practica', display: 'practica' },
              { id: 'festival', display: 'festival' },
              { id: 'workshop', display: 'workshop' },
              { id: 'tango', display: 'tango' },
              { id: 'vals', display: 'vals' },
              { id: 'tangoargentino', display: 'tangoargentino' },
              { id: 'buenosaires', display: 'buenosaires' },
            ].filter(tag => 
              tag.display.toLowerCase().includes(search.toLowerCase())
            );
            callback(tags);
          }}
          displayTransform={(id: string, display: string) => `#${display}`}
          style={{
            backgroundColor: theme === 'light' ? '#fef3c7' : '#164e63',
            color: theme === 'light' ? '#d97706' : '#fbbf24',
            padding: '1px 2px',
            borderRadius: '3px',
            fontWeight: '500',
          }}
        />
      </MentionsInput>
    </div>
  );
}