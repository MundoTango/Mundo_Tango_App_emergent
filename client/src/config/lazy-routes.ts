// TRACK 9: Lazy Loading Route Configuration
import { lazy } from 'react';

// Admin routes - lazy loaded for performance
export const AdminDashboard = lazy(() => import('@/pages/admin/dashboard'));
export const AdminUsers = lazy(() => import('@/pages/admin/users'));
export const AdminModeration = lazy(() => import('@/pages/admin/moderation'));
export const AdminAnalytics = lazy(() => import('@/pages/admin/analytics'));
export const AdminUISubAgents = lazy(() => import('@/pages/admin/UISubAgents')); // Phase 11: UI Sub-Agents Dashboard

// Heavy feature routes
export const Events = lazy(() => import('@/pages/EnhancedEvents'));
export const Messages = lazy(() => import('@/pages/Messages'));
export const GroupDetail = lazy(() => import('@/pages/GroupDetailPageMT'));
export const LifeCEO = lazy(() => import('@/pages/LifeCEOEnhanced'));

// Performance note: These routes will be code-split automatically
// Only loaded when user navigates to them
