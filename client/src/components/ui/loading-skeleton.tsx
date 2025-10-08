import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/glass/GlassComponents';


/**
 * ESA Layer 9: UI Framework Agent
 * MT Ocean themed loading skeletons
 */

interface SkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'avatar' | 'button';
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700';
  
  const variantClasses = {
    card: 'rounded-lg h-48',
    text: 'h-4 rounded',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24 rounded-md',
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)} />
  );
}

export function PostSkeleton() {
  return (
    <GlassCard depth={2} className="dark:bg-gray-800/80 rounded-lg p-6 space-y-4">
      <div className="flex items-center space-x-3">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-32" />
          <Skeleton className="w-24 h-3" />
        </div>
      </div>
      <Skeleton className="h-20" />
      <Skeleton variant="card" />
      <div className="flex justify-between">
        <Skeleton variant="button" />
        <Skeleton variant="button" />
      </div>
    </div>
  );
}

export function EventSkeleton() {
  return (
    <GlassCard depth={2} className="bg-gradient-to-br from-teal-400/10 to-cyan-600/10 rounded-lg p-4 space-y-3">
      <Skeleton variant="card" className="h-32" />
      <Skeleton className="w-3/4" />
      <Skeleton className="w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="w-20 h-6" />
        <Skeleton variant="button" />
      </div>
    </div>
  );
}

export function UserListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3">
          <Skeleton variant="avatar" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-32" />
            <Skeleton className="w-48 h-3" />
          </div>
          <Skeleton variant="button" />
        </div>
      ))}
    </div>
  );
}
