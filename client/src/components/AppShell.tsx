/**
 * ESA LIFE CEO 61x21 - App Shell Component (Phase 16)
 * Progressive Web App shell with offline support
 */

import { useEffect, useState } from 'react';
import { useNetworkStatus, usePWA } from '@/hooks/usePWA';
import { InstallPrompt, MiniInstallButton } from '@/components/InstallPrompt';
import { UpdatePrompt, AutoUpdateChecker } from '@/components/UpdatePrompt';
import { Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const isOnline = useNetworkStatus();
  const { status, clearBadge } = usePWA();
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    // Show offline toast when going offline
    if (!isOnline) {
      setShowOfflineToast(true);
      setTimeout(() => setShowOfflineToast(false), 5000);
    }
  }, [isOnline]);

  useEffect(() => {
    // Clear badge when app is focused
    const handleFocus = () => {
      if (status.isPWA) {
        clearBadge();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [status.isPWA, clearBadge]);

  return (
    <div className="app-shell relative min-h-screen">
      {/* Network Status Indicator */}
      <AnimatePresence>
        {showOfflineToast && !isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-lg shadow-lg">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">You're offline</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="app-content">
        {children}
      </div>

      {/* PWA Components */}
      <InstallPrompt />
      <UpdatePrompt />
      <AutoUpdateChecker />

      {/* Offline Indicator (persistent) */}
      {!isOnline && (
        <div className="fixed bottom-0 left-0 right-0 bg-amber-500 text-white text-center py-1 text-sm z-40">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-3 w-3" />
            <span>Offline Mode - Some features may be limited</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Skeleton Screen Components
export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse flex gap-4">
          <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="animate-pulse">
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
      <div className="flex items-center gap-4 mb-6">
        <div className="h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
      </div>
    </div>
  );
}

export function SkeletonEvent() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
      <div className="flex gap-4 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
      </div>
    </div>
  );
}

export function SkeletonMessage() {
  return (
    <div className="animate-pulse">
      <div className="flex gap-3 mb-4">
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2" />
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Pull to Refresh Component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const THRESHOLD = 80;

  useEffect(() => {
    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      
      currentY = e.touches[0].clientY;
      const distance = currentY - startY;
      
      if (distance > 0 && distance < 150) {
        setPullDistance(distance);
        
        if (distance > THRESHOLD) {
          // Haptic feedback when threshold reached
          if ('vibrate' in navigator) {
            navigator.vibrate(10);
          }
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
      }
      
      setIsPulling(false);
      setPullDistance(0);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, isRefreshing, onRefresh]);

  return (
    <div className="relative">
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex justify-center transition-all",
          pullDistance > 0 ? "opacity-100" : "opacity-0"
        )}
        style={{
          transform: `translateY(${Math.min(pullDistance - 40, 40)}px)`,
          height: '40px'
        }}
      >
        <div className={cn(
          "rounded-full bg-[var(--color-primary)] flex items-center justify-center",
          isRefreshing ? "animate-spin" : "",
          pullDistance > THRESHOLD ? "bg-[var(--color-primary-hover)]" : ""
        )}
        style={{
          width: `${Math.min(pullDistance / 2, 30)}px`,
          height: `${Math.min(pullDistance / 2, 30)}px`
        }}>
          {isRefreshing && (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: isPulling ? `translateY(${pullDistance}px)` : 'translateY(0)',
          transition: isPulling ? 'none' : 'transform 0.3s'
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Network-aware Image Component
interface NetworkImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export function NetworkImage({ src, alt, className, fallback = '/placeholder.svg' }: NetworkImageProps) {
  const isOnline = useNetworkStatus();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setError(false);
    setLoading(true);
  }, [src]);

  if (!isOnline || error) {
    return (
      <div className={cn("bg-gray-200 dark:bg-gray-700 flex items-center justify-center", className)}>
        <img src={fallback} alt={alt} className="opacity-50" />
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={cn("animate-pulse bg-gray-200 dark:bg-gray-700", className)} />
      )}
      <img
        src={src}
        alt={alt}
        className={cn(className, loading ? "hidden" : "")}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />
    </>
  );
}