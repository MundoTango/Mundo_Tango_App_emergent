/**
 * Phase 10 - Track C3: Frontend Performance Optimization
 * Code splitting with React.lazy for faster page loads
 */

import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading fallback component
 */
const RouteLoadingFallback = () => (
  <div className="flex flex-col gap-4 p-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-64 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
);

/**
 * Lazy load wrapper with error boundary
 */
export const lazyLoad = (importFn: () => Promise<{ default: React.ComponentType<any> }>) => {
  const LazyComponent = lazy(importFn);
  
  return (props: any) => (
    <Suspense fallback={<RouteLoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Lazy-loaded route components
 * These are loaded on-demand to reduce initial bundle size
 */

// Admin routes (heavy, rarely accessed)
export const LazyAdminDashboard = lazyLoad(() => import('@/pages/AdminDashboard'));
export const LazyAdminEsaMind = lazyLoad(() => import('@/pages/AdminEsaMind'));
export const LazyProjectTrackerPage = lazyLoad(() => import('@/pages/ProjectTrackerPage'));

// Community features (medium priority)
export const LazyEventsPage = lazyLoad(() => import('@/pages/EventsPage'));
export const LazyGroupsPage = lazyLoad(() => import('@/pages/GroupsPage'));
export const LazyMapPage = lazyLoad(() => import('@/pages/MapPage'));

// User features (medium priority)
export const LazyProfilePage = lazyLoad(() => import('@/pages/ProfilePage'));
export const LazySettingsPage = lazyLoad(() => import('@/pages/SettingsPage'));

// Heavy 3D features (lazy load for performance)
export const LazyMrBlueChat = lazyLoad(() => import('@/pages/MrBlueChat'));

/**
 * Preload critical routes
 * Call this to prefetch routes the user is likely to visit
 */
export const preloadCriticalRoutes = () => {
  // Preload dashboard after 2 seconds (likely next page)
  setTimeout(() => {
    import('@/pages/AdminDashboard');
  }, 2000);

  // Preload profile after 5 seconds
  setTimeout(() => {
    import('@/pages/ProfilePage');
  }, 5000);
};

/**
 * Preload route on hover
 * Use with onMouseEnter on navigation links
 */
export const preloadRoute = (route: string) => {
  switch (route) {
    case '/admin':
      import('@/pages/AdminDashboard');
      break;
    case '/admin/esa-mind':
      import('@/pages/AdminEsaMind');
      break;
    case '/events':
      import('@/pages/EventsPage');
      break;
    case '/groups':
      import('@/pages/GroupsPage');
      break;
    case '/map':
      import('@/pages/MapPage');
      break;
    case '/profile':
      import('@/pages/ProfilePage');
      break;
    case '/settings':
      import('@/pages/SettingsPage');
      break;
    case '/mr-blue':
      import('@/pages/MrBlueChat');
      break;
    case '/projects':
      import('@/pages/ProjectTrackerPage');
      break;
    default:
      break;
  }
};

/**
 * Bundle size optimization tips:
 * 1. Use lazy loading for all non-critical routes
 * 2. Preload routes on hover (improve perceived performance)
 * 3. Split large components into smaller chunks
 * 4. Use dynamic imports for heavy libraries (e.g., charts, 3D)
 * 5. Monitor bundle size with source-map-explorer
 */

export default {
  LazyAdminDashboard,
  LazyAdminEsaMind,
  LazyProjectTrackerPage,
  LazyEventsPage,
  LazyGroupsPage,
  LazyMapPage,
  LazyProfilePage,
  LazySettingsPage,
  LazyMrBlueChat,
  preloadCriticalRoutes,
  preloadRoute
};
