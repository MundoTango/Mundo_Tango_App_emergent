import React from 'react';

interface SimpleEmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

export function SimpleEmojiPicker({ onEmojiSelect, className = '' }: SimpleEmojiPickerProps) {
  // Popular emojis for comments
  const emojis = ['❤️', '😊', '😍', '👏', '🔥', '💃', '🕺', '🎵', '😂', '🥰'];
  
  return (
    <div className={`flex items-center gap-1 p-2 bg-[var(--color-surface-elevated)] rounded-lg ${className}`}>
      <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Quick emojis:</span>
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() = aria-label="Button"> onEmojiSelect(emoji)}
          className="text-xl p-1 hover:bg-[var(--color-surface)] hover:scale-110 rounded transition-all duration-150 dark:bg-neutral-900"
          title={`Add ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}