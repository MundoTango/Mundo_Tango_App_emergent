/**
 * ESA LIFE CEO 61×21 - Optimized Profile Components
 * Performance-optimized components with React.memo and lazy loading
 */

import React, { memo, Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components
export const LazyUserPhotosGallery = lazy(() => import('./UserPhotosGallery').then((module) => ({ default: module.UserPhotosGallery })));
export const LazyUserVideosGallery = lazy(() => import('./UserVideosGallery').then((module) => ({ default: module.UserVideosGallery })));
export const LazyUserFriendsList = lazy(() => import('./UserFriendsList').then((module) => ({ default: module.UserFriendsList })));
export const LazyUserEventsList = lazy(() => import('./UserEventsList').then((module) => ({ default: module.UserEventsList })));
export const LazyEnhancedPostFeed = lazy(() => import('@/components/moments/EnhancedPostFeed'));
export const LazyTravelDetailsComponent = lazy(() => import('./TravelDetailsComponent').then((module) => ({ default: module.TravelDetailsComponent })));
export const LazyGuestProfileDisplay = lazy(() => import('@/components/GuestProfile/GuestProfileDisplay').then((module) => ({ default: module.GuestProfileDisplay })));

// Loading fallback components
export const GalleryFallback = memo(() =>
<div className="grid grid-cols-3 gap-2">
    {[...Array(9)].map((_, i) =>
  <Skeleton key={i} className="aspect-square rounded-lg" />
  )}
  </div>
);

export const ListFallback = memo(() =>
<div className="space-y-3">
    {[...Array(5)].map((_, i) =>
  <div key={i} className="flex items-center space-x-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
  )}
  </div>
);

export const PostFeedFallback = memo(() =>
<div className="space-y-4">
    {[...Array(3)].map((_, i) =>
  <div key={i} className="bg-[var(--color-surface)] dark:bg-gray-900 rounded-lg p-4 space-y-3">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
  )}
  </div>
);

// Memoized stat card component
export const StatCard = memo(({ icon: Icon, label, value



}: {icon: any;label: string;value: number | string;}) =>
<div className="flex items-center space-x-3 p-3 bg-[var(--color-surface-elevated)] rounded-lg">
    <Icon className="h-5 w-5 text-[var(--color-primary)]" />
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  </div>
);

// Memoized tab trigger component
export const TabTriggerMemo = memo(({ value, icon: Icon, label, isActive, onClick





}: {value: string;icon: any;label: string;isActive: boolean;onClick: () => void;}) =>
<button
  onClick={onClick}
  className={`flex items-center px-6 py-4 ${
  isActive ? 'border-b-2 border-turquoise-500' : ''}`
  } data-testid="button-element" aria-label="Button">

    <Icon className="mr-2 h-4 w-4" />
    <span className="font-medium">{label}</span>
  </button>
);

// Lazy image component with loading state
export const LazyImage = memo(({ src, alt, className



}: {src: string;alt: string;className?: string;}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  return (
    <div className={`relative ${className}`}>
      {loading &&
      <Skeleton className="absolute inset-0" />
      }
      {error ?
      <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-neutral-100)] text-gray-400">
          <span>Failed to load</span>
        </div> :

      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        loading="lazy" />

      }
    </div>);

});

LazyImage.displayName = 'LazyImage';
StatCard.displayName = 'StatCard';
TabTriggerMemo.displayName = 'TabTriggerMemo';
GalleryFallback.displayName = 'GalleryFallback';
ListFallback.displayName = 'ListFallback';
PostFeedFallback.displayName = 'PostFeedFallback';

export default {
  LazyUserPhotosGallery,
  LazyUserVideosGallery,
  LazyUserFriendsList,
  LazyUserEventsList,
  LazyEnhancedPostFeed,
  LazyTravelDetailsComponent,
  LazyGuestProfileDisplay,
  GalleryFallback,
  ListFallback,
  PostFeedFallback,
  StatCard,
  TabTriggerMemo,
  LazyImage
};