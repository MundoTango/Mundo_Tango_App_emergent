/**
 * ESA AI Intelligence Network - Smart Page Suggestions Widget
 * Agent #8 (UI Components) + Agent #71 (Journey Prediction)
 * 
 * Shows ML-powered next-page predictions based on user journey patterns
 * Aurora Tide Design System
 */

import { useState } from 'react';
import { ArrowRight, TrendingUp, Users, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PagePrediction {
  nextPage: string;
  probability: number;
  confidence: number;
  pattern: string;
  userCount?: number;
}

interface SmartPageSuggestionsProps {
  position?: 'top-right' | 'top-center' | 'bottom-center';
  autoHide?: boolean;
  hideDelay?: number;
}

export function SmartPageSuggestions({ 
  position = 'top-center',
  autoHide = true,
  hideDelay = 10000 
}: SmartPageSuggestionsProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentRoute, setLocation] = useLocation();
  const { user } = useAuth();

  // Get journey prediction - ESA Agent #71 (Journey Prediction)
  const { data: prediction, isLoading } = useQuery<PagePrediction>({
    queryKey: ['/api/ai-intelligence/journey/predict', currentRoute, user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/ai-intelligence/journey/predict?route=${encodeURIComponent(currentRoute)}&userId=${user?.id || ''}`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user && !isDismissed,
    refetchInterval: 30000, // Refresh every 30s
  });

  // Auto-hide after delay
  useState(() => {
    if (autoHide && prediction && !isDismissed) {
      const timer = setTimeout(() => setIsDismissed(true), hideDelay);
      return () => clearTimeout(timer);
    }
  });

  if (!user || !prediction || isDismissed || isLoading) return null;

  // Only show if confidence > 70%
  if (prediction.confidence < 0.7) return null;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  }[position];

  const confidenceColor = prediction.confidence > 0.85 
    ? 'from-emerald-500 to-teal-500' 
    : 'from-blue-500 to-cyan-500';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={cn(
          "fixed z-40",
          positionClasses
        )}
        data-testid="smart-page-suggestions"
      >
        <div className="relative group">
          {/* Glow Effect */}
          <div className={cn(
            "absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity",
            `bg-gradient-to-r ${confidenceColor}`
          )} />

          {/* Main Card */}
          <div className="relative bg-white/10 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700 rounded-2xl p-4 shadow-2xl max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  `bg-gradient-to-br ${confidenceColor}`
                )}>
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Smart Suggestion
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    AI-powered prediction
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDismissed(true)}
                className="h-6 w-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                data-testid="button-dismiss-suggestions"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Prediction Content */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge 
                  className={cn(
                    "px-2 py-0.5 text-xs font-medium",
                    `bg-gradient-to-r ${confidenceColor} text-white border-0`
                  )}
                >
                  {Math.round(prediction.probability * 100)}% likely
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Most users go here next
                </span>
              </div>

              <motion.button
                onClick={() => setLocation(prediction.nextPage)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full p-4 rounded-xl transition-all",
                  "bg-gradient-to-r from-white/50 to-white/30",
                  "dark:from-gray-800/50 dark:to-gray-800/30",
                  "hover:from-white/70 hover:to-white/50",
                  "dark:hover:from-gray-800/70 dark:hover:to-gray-800/50",
                  "border border-gray-200/50 dark:border-gray-700/50",
                  "flex items-center justify-between group/btn"
                )}
                data-testid="button-navigate-suggested"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatPageName(prediction.nextPage)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {prediction.nextPage}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover/btn:translate-x-1 group-hover/btn:text-gray-600 dark:group-hover/btn:text-gray-300 transition-all" />
              </motion.button>

              {/* Stats */}
              <div className="flex items-center gap-4 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {prediction.userCount || 'Many'} users
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Based on your journey
                  </span>
                </div>
              </div>
            </div>

            {/* Confidence Indicator */}
            <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-500 dark:text-gray-400">AI Confidence</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {Math.round(prediction.confidence * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${prediction.confidence * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    `bg-gradient-to-r ${confidenceColor}`
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper: Format page route to human-readable name
function formatPageName(route: string): string {
  const names: Record<string, string> = {
    '/': 'Home',
    '/profile': 'Your Profile',
    '/community': 'Community Hub',
    '/events': 'Events',
    '/housing': 'Housing Marketplace',
    '/messages': 'Messages',
    '/life-ceo': 'Life CEO Dashboard',
    '/settings': 'Settings',
    '/admin': 'Admin Center',
    '/admin/users': 'User Management',
    '/admin/events': 'Event Management',
    '/admin/groups': 'Group Management'
  };

  return names[route] || route.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
}
