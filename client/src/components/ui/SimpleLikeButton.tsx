import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SimpleLikeButtonProps {
  postId: number | string;
  currentReaction?: string;
  reactions?: { [key: string]: number };
  onReact: (reactionId: string) => void;
  className?: string;
}

const SIMPLE_REACTIONS = [
  { id: 'like', text: '👍', labelKey: 'reactions.like' },
  { id: 'love', text: '❤️', labelKey: 'reactions.love' },
  { id: 'haha', text: '😆', labelKey: 'reactions.haha' },
  { id: 'wow', text: '😮', labelKey: 'reactions.wow' },
  { id: 'sad', text: '😢', labelKey: 'reactions.sad' },
  { id: 'angry', text: '😠', labelKey: 'reactions.angry' },
  { id: 'fire', text: '🔥', labelKey: 'reactions.fire' },
  { id: 'heart_eyes', text: '😍', labelKey: 'reactions.heartEyes' },
  { id: 'thinking', text: '🤔', labelKey: 'reactions.thinking' },
  { id: 'party', text: '🎉', labelKey: 'reactions.party' },
  { id: 'clap', text: '👏', labelKey: 'reactions.clap' },
  { id: 'mind_blown', text: '🤯', labelKey: 'reactions.mindBlown' }
];

export const SimpleLikeButton: React.FC<SimpleLikeButtonProps> = ({
  postId,
  currentReaction,
  reactions = {},
  onReact,
  className = ''
}) => {
  const { t } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  const currentReactionData = SIMPLE_REACTIONS.find(r => r.id === currentReaction);

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowDropdown(false);
    }, 300);
    setHoverTimeout(timeout);
  };

  const handleDropdownMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleDropdownMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowDropdown(false);
    }, 150);
    setHoverTimeout(timeout);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Like Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200 hover:scale-105"
      >
        <span style={{ display: 'inline-block', width: '20px', textAlign: 'center' }}>
          {currentReactionData ? currentReactionData.text : '👍'}
        </span>
        <span className="text-sm font-medium">
          {currentReactionData ? t(currentReactionData.labelKey) : t('reactions.like')}
        </span>
      </button>

      {/* Simple Dropdown */}
      {showDropdown && (
        <div 
          className="absolute bg-white border border-gray-200 rounded-lg shadow-2xl p-1 transition-all duration-300 ease-out"
          style={{ 
            zIndex: 99999,
            width: '180px',
            bottom: '100%',
            left: '0px',
            marginBottom: '4px',
            animation: 'slideInUp 0.3s ease-out, pulse 0.6s ease-out'
          }}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        >
          <div className="grid grid-cols-4 gap-0">
            {SIMPLE_REACTIONS.map((reaction, index) => (
              <button
                key={reaction.id}
                onClick={() => {
                  onReact(reaction.id);
                  setShowDropdown(false);
                }}
                className="flex items-center justify-center p-1 rounded hover:bg-blue-50 transition-all duration-200 hover:scale-125 hover:rotate-12 group"
                style={{ 
                  width: '40px', 
                  height: '40px',
                  fontSize: '24px',
                  animation: `fadeInBounce 0.4s ease-out ${index * 0.05}s both`
                }}
                title={t(reaction.labelKey)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.4) rotate(15deg)';
                  e.currentTarget.style.backgroundColor = '#dbeafe';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {reaction.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reaction Count */}
      {totalReactions > 0 && (
        <div className="mt-1">
          <span className="text-sm text-gray-600">{totalReactions} {t('reactions.reactions')}</span>
        </div>
      )}
    </div>
  );
};