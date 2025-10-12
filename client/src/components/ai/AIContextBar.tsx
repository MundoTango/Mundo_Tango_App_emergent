/**
 * ESA AI Intelligence Network - AI Context Bar Component
 * Agent #8 (UI Components) + Agent #33 (Context Management)
 * 
 * Shows current AI context and journey tracking
 * 60% Code Reuse: Admin header gradient pattern
 */

import { useState } from 'react';
import { Brain, MapPin, Clock, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AIContextData {
  sessionId: string;
  conversationHistory: any[];
  journeyContext: {
    pages: string[];
    startTime: number;
    timeOnPage: Record<string, number>;
  };
  predictedNextPage?: string;
  suggestedActions?: string[];
}

interface AIContextBarProps {
  position?: 'top' | 'bottom';
  collapsible?: boolean;
}

export function AIContextBar({ position = 'top', collapsible = true }: AIContextBarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentRoute] = useLocation();
  const { user } = useAuth();

  // Get AI context - ESA Agent #33 (Context Management)
  const { data: context, isLoading } = useQuery<AIContextData>({
    queryKey: ['/api/ai-intelligence/context', { userId: user?.id }],
    enabled: !!user,
    refetchInterval: 10000, // Refresh every 10s
  });

  if (!user || !context || isLoading) return null;

  const journeyLength = context.journeyContext?.pages?.length || 0;
  const sessionDuration = context.journeyContext?.startTime 
    ? Math.floor((Date.now() - context.journeyContext.startTime) / 1000 / 60) 
    : 0;

  const positionClasses = position === 'top' ? 'top-0' : 'bottom-0';

  return (
    <motion.div
      initial={{ y: position === 'top' ? -100 : 100 }}
      animate={{ y: isCollapsed ? (position === 'top' ? -60 : 60) : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed left-0 right-0 z-30",
        positionClasses
      )}
      data-testid="ai-context-bar"
    >
      {/* Main Bar (60% reuse from admin header gradient) */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-md border-b border-white/10 dark:border-gray-700/50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Left: AI Status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    AI Context Active
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    Session: {context.sessionId.slice(0, 8)}...
                  </p>
                </div>
              </div>

              {/* Journey Stats */}
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/20 dark:border-gray-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {journeyLength} pages
                  </span>
                </div>
                <div className="hidden md:flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {sessionDuration}m session
                  </span>
                </div>
                <div className="hidden lg:flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {context.conversationHistory?.length || 0} interactions
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Info */}
            <div className="flex items-center gap-3">
              {/* Current Page */}
              <Badge 
                variant="outline" 
                className="hidden md:flex border-cyan-500/30 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10"
              >
                {formatPageName(currentRoute)}
              </Badge>

              {/* Prediction */}
              {context.predictedNextPage && (
                <Badge 
                  variant="outline" 
                  className="hidden lg:flex border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10"
                >
                  Next: {formatPageName(context.predictedNextPage)}
                </Badge>
              )}

              {/* Collapse Button */}
              {collapsible && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-gray-700/50 transition-colors"
                  data-testid="button-toggle-context-bar"
                >
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Journey Breadcrumb */}
          <AnimatePresence>
            {!isCollapsed && journeyLength > 1 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 pt-2 border-t border-white/10 dark:border-gray-700/50 overflow-hidden"
              >
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                  Your Journey:
                </p>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
                  {context.journeyContext.pages.slice(-5).map((page, idx, arr) => (
                    <div key={idx} className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded",
                        idx === arr.length - 1 
                          ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-semibold"
                          : "bg-white/10 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400"
                      )}>
                        {formatPageName(page)}
                      </span>
                      {idx < arr.length - 1 && (
                        <span className="text-gray-400 dark:text-gray-500">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse Indicator */}
      {isCollapsed && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
          <div className="w-12 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-b-full opacity-50" />
        </div>
      )}
    </motion.div>
  );
}

// Helper: Format page route to human-readable name
function formatPageName(route: string): string {
  const names: Record<string, string> = {
    '/': 'Home',
    '/profile': 'Profile',
    '/community': 'Community',
    '/events': 'Events',
    '/housing': 'Housing',
    '/messages': 'Messages',
    '/life-ceo': 'Life CEO',
    '/settings': 'Settings',
    '/admin': 'Admin',
  };

  return names[route] || route.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
}
