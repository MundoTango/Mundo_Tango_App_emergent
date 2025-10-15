/**
 * MR BLUE MEMORIES BUTTON
 * Floating button on Memories page to launch Mr Blue chat
 */

import { useState } from 'react';
import { Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnhancedMrBlueChat } from './EnhancedMrBlueChat';

export function MrBlueMemoriesButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl 
                   bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500
                   hover:scale-110 transition-all duration-300 z-40
                   flex items-center justify-center group"
        data-testid="mrblue-memories-button"
      >
        <div className="relative">
          <Sparkles className="w-7 h-7 text-white animate-pulse" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full 
                          animate-ping opacity-75" />
        </div>
        
        {/* Tooltip */}
        <div className="absolute right-full mr-4 px-4 py-2 bg-gray-900 text-white text-sm 
                        rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 
                        transition-opacity duration-200 pointer-events-none">
          Chat with Mr Blue AI
          <div className="absolute top-1/2 -right-2 -mt-1 border-4 border-transparent 
                          border-l-gray-900" />
        </div>
      </Button>

      {/* Enhanced Chat Interface */}
      {isOpen && (
        <EnhancedMrBlueChat 
          onClose={() => setIsOpen(false)}
          initialContext={{
            page: 'Memories',
            url: window.location.pathname,
            title: 'Memories Feed'
          }}
        />
      )}
    </>
  );
}
