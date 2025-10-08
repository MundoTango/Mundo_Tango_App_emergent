import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { SimpleEmojiPicker } from './SimpleEmojiPicker';

interface SimpleCommentEditorProps {
  postId: number;
  onSubmit: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function SimpleCommentEditor({
  postId,
  onSubmit,
  placeholder = 'Write a comment...',
  className = ''
}: SimpleCommentEditorProps) {
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim());
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const addEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className={`bg-[var(--color-surface)] dark:bg-gray-900 rounded-xl border border-[var(--color-border)] ${className}`}>
      {/* Simple emoji picker at the top */}
      <SimpleEmojiPicker onEmojiSelect={addEmoji} />
      
      {/* Text input area */}
      <div className="p-4 border-t border-gray-100">
        <textarea
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          data-testid="textarea-comment"
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full min-h-[60px] p-2 outline-none resize-none text-[var(--color-text)] placeholder-gray-400 dark:text-neutral-100"
          rows={2}
        />
        
        {/* Submit button */}
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${content.trim() 
                ? 'bg-pink-500 text-white hover:bg-pink-600' 
                : 'bg-[var(--color-neutral-100)] text-gray-400 cursor-not-allowed'
              }
            `}
            data-testid="button-submit-comment" aria-label="Button">
            <Send className="h-4 w-4" />
            Comment
          </button>
        </div>
      </div>
    </div>
  );
}