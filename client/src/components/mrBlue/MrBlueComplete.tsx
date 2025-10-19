/**
 * ESA Mr Blue Complete System
 * mb.md lines 988-1012
 * 
 * Features:
 * - Floating button (bottom-right corner)
 * - Tab-based interface:
 *   - Tab 1: AI Chat (all users)
 *   - Tab 2: Life CEO Agents (all users) 
 *   - Tab 3: Platform Search (all users)
 *   - Tab 4: Admin Tools (Super Admin only)
 */

import { useState } from 'react';
import { Sparkles, X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { MrBlueTabSystem } from '@/lib/mrBlue/tabs/MrBlueTabSystem';

export function MrBlueComplete() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Only show for logged-in users
  if (!user) return null;

  return (
    <>
      {/* ========== FLOATING BUTTON ========== */}
      <div 
        className="fixed bottom-6 right-6 z-[9999]"
        data-testid="mr-blue-complete-button"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700 text-white border-2 border-white dark:border-gray-800 transition-all duration-300 hover:scale-110"
          data-testid="button-toggle-mr-blue"
        >
          <Sparkles className="h-7 w-7 animate-pulse" />
        </Button>

        {/* Notification badge (optional - can add count later) */}
        <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center hidden">
          <span className="text-white text-xs font-bold">3</span>
        </div>
      </div>

      {/* ========== MR BLUE PANEL ========== */}
      {isOpen && (
        <Card 
          className={`
            fixed z-[9998] shadow-2xl bg-white dark:bg-gray-900
            ${isFullScreen 
              ? 'inset-4 max-w-none max-h-none' 
              : 'bottom-24 right-6 w-[900px] max-w-[90vw] h-[700px] max-h-[85vh]'
            }
            transition-all duration-300 ease-in-out
          `}
          data-testid="mr-blue-complete-panel"
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gradient-to-r from-turquoise-50 to-cyan-50 dark:from-turquoise-950 dark:to-cyan-950">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-turquoise-500 to-cyan-600 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    Mr Blue AI Companion
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Your intelligent assistant with 16 Life CEO agents
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  data-testid="button-toggle-fullscreen"
                  title={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  data-testid="button-close-mr-blue"
                  title="Close Mr Blue"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Tab System - Takes full remaining height */}
            <div className="flex-1 overflow-hidden">
              <MrBlueTabSystem />
            </div>
          </div>
        </Card>
      )}

      {/* Backdrop overlay when panel is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[9997] backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
          data-testid="mr-blue-backdrop"
        />
      )}
    </>
  );
}

export default MrBlueComplete;
