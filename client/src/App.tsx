```typescript
import React, { useEffect, Suspense, lazy, useState } from "react";
import { Switch, Route, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { SocketProvider } from "@/contexts/socket-context";
import { AuthProvider } from "@/contexts/auth-context";
import { TenantProvider } from "@/contexts/TenantContext";
import { VisualEditorProvider } from "@/contexts/VisualEditorContext";
// import { CsrfProvider } from "@/contexts/CsrfContext"; // Disabled for Phase 1 - will add CSRF endpoint later
import { OpenReplayProvider } from "@/components/OpenReplayProvider";
import { SessionRecordingNotice } from "@/components/SessionRecordingNotice";
import { LocationBiasProvider } from "@/contexts/LocationBiasContext";
// import { PageAgentProvider } from "@/contexts/PageAgentContext"; // DISABLED - Vite HMR file deletion bug
import { useAuth } from "@/hooks/useAuth";
import { initAnalytics, analytics } from "@/lib/analytics";
import { initPostHog } from "@/lib/posthog";
import { usePageTracking } from "@/hooks/use-posthog";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import ThemeManager from "@/components/theme/ThemeManager";
import { performanceOptimizations } from "@/lib/performance-optimizations";
import { usePerformanceOptimization } from "@/hooks/usePerformanceOptimization";
import { lifeCeoPerformance } from "@/lib/life-ceo-performance";
import { setupGlobalErrorHandlers, setupQueryErrorHandling } from "@/lib/global-error-handler";
import { MicroInteractionProvider } from "@/components/MicroInteractionProvider";
import BuildOptimizer from "@/lib/build-optimizations";
import * as Sentry from "@sentry/react";
import "@/lib/i18n"; // Initialize i18n
import { performanceOptimizer } from "@/utils/performance"; // ESA Performance Optimizer
import { useBreadcrumbTracking } from "@/hooks/useBreadcrumbTracking"; // MB.MD Phase 3E - Breadcrumb Tracking
// MB.MD DISABLED - Breaks React error handling by overwriting Error constructor
// import "@/utils/console-cleanup"; // Security: Clean console output

// Mundo Tango ESA - Monitoring Services
import { MonitoringProvider } from "@/components/MonitoringProvider";
import { useMonitoring } from "@/hooks/useMonitoring";

// Mundo Tango ESA - Route Registry (Layers 21-30)
import { productionRoutes, debugRoutes, type RouteConfig } from "@/config/routes";

// Import shared queryClient with ESA Layer 14 cache configuration
import { queryClient } from "@/lib/queryClient";

// MB.MD FIX: Clear ALL stale queries on app initialization to prevent queryFn warnings
if (typeof window !== 'undefined') {
  // Clear ALL queries without queryFn (not just errored ones) to prevent cache corruption
  queryClient.clear();
  console.log('✅ Cleared ALL React Query cache on app init');
}

// MB.MD MINIMAL IMPORTS: Only components that exist to fix blank screen
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import TrialBanner from "@/components/TrialBanner";

// MB.MD TRACK 1: Global Navigation Components (Week 1 - Oct 20, 2025)
import BottomNav from "@/components/layout/BottomNav";

// Mundo Tango Internal CMS (Notion-style tango stories/memories)
import { NotionHomePage } from "@/pages/NotionHomePage";
import { NotionEntryPage } from "@/pages/NotionEntryPage";

// Mundo Tango Mobile Pages (mobile-optimized for 38% → 100% production readiness)
const MessagesMobile = lazy(() => import("@/pages/messages-mobile"));
const NotificationsMobile = lazy(() => import("@/pages/notifications-mobile"));
const CalendarPage = lazy(() => import("@/pages/calendar"));
const ProfileMobile = lazy(() => import("@/pages/profile-mobile"));
const GroupsMobile = lazy(() => import("@/pages/groups-mobile"));

// Mundo Tango Core Pages - Social Features (Phase 1A: Oct 20, 2025)
const MemoriesPage = lazy(() => import("@/pages/MemoriesPage"));

// MB.MD BATCH 1: High-Value Pages (Oct 20, 2025) - Social, Events, Admin
const EventsPage = lazy(() => import("@/pages/events"));
const EventDetail = lazy(() => import("@/pages/event-detail"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const GroupPage = lazy(() => import("@/pages/group"));
const HomePage = lazy(() => import("@/pages/home"));
const SearchPage = lazy(() => import("@/pages/search"));

// MB.MD BATCH 2: 40 Additional Routes (Housing, Admin, Social, Analytics, Agents)
// Housing & Marketplace
const HousingMarketplace = lazy(() => import("@/pages/housing-marketplace"));
const HostCalendar = lazy(() => import("@/pages/host-calendar"));
const HostBookings = lazy(() => import("@/pages/host-bookings"));
const MyBookings = lazy(() => import("@/pages/my-bookings"));
const ListingDetail = lazy(() => import("@/pages/listing-detail"));

// Admin Pages (Extended)
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminSprints = lazy(() => import("@/pages/admin/sprints"));
const AdminProjects = lazy(() => import("@/pages/admin/projects"));
const TenantManagement = lazy(() => import("@/pages/admin/TenantManagement"));
const StoriesList = lazy(() => import("@/pages/admin/StoriesList"));
const StoryDetail = lazy(() => import("@/pages/admin/StoryDetail"));
const UISubAgents = lazy(() => import("@/pages/admin/UISubAgents"));
const SmartAgentsDashboard = lazy(() => import("@/pages/admin/SmartAgentsDashboard"));
const MrBlueDashboard = lazy(() => import("@/pages/admin/MrBlueDashboard"));
const PerformanceDashboard = lazy(() => import("@/pages/admin/PerformanceDashboard"));
const PageStateMonitor = lazy(() => import("@/pages/admin/PageStateMonitor"));
const PageAgentsDashboard = lazy(() => import("@/pages/admin/PageAgentsDashboard"));
const MultiAIDashboard = lazy(() => import("@/pages/admin/MultiAIDashboard"));
const MultiAIAnalytics = lazy(() => import("@/pages/admin/MultiAIAnalytics"));
const HealthMonitor = lazy(() => import("@/pages/admin/HealthMonitor"));
const ComponentHealthDashboard = lazy(() => import("@/pages/admin/ComponentHealthDashboard"));
const AutoFixDashboard = lazy(() => import("@/pages/admin/AutoFixDashboard"));
const AgentCoordination = lazy(() => import("@/pages/admin/AgentCoordination"));
const AgentTrainingPage = lazy(() => import("@/pages/AgentTrainingPage"));

// Social Pages
const Groups = lazy(() => import("@/pages/groups"));
const GroupsDiscoveryPage = lazy(() => import("@/pages/groups/discover"));
const FriendsPage = lazy(() => import("@/pages/Friends"));
const TimelineMinimal = lazy(() => import("@/pages/timeline-minimal"));
const TimelineDebug = lazy(() => import("@/pages/timeline-debug"));
const EnhancedTimeline = lazy(() => import("@/pages/enhanced-timeline"));
const Onboarding = lazy(() => import("@/pages/onboarding"));
const NotificationsPage = lazy(() => import("@/pages/Notifications"));
const MessagesPage = lazy(() => import("@/pages/Messages"));
const Invitations = lazy(() => import("@/pages/invitations"));
const TangoCommunities = lazy(() => import("@/pages/tango-communities"));
const CreateCommunity = lazy(() => import("@/pages/create-community"));
const GroupDetailPage = lazy(() => import("@/pages/GroupDetailPage"));
const FeatureNavigation = lazy(() => import("@/pages/feature-navigation"));

// Analytics & Monitoring
const GlobalStatistics = lazy(() => import("@/pages/global-statistics"));
const LiveGlobalStatistics = lazy(() => import("@/pages/LiveGlobalStatistics"));
const FinOpsDashboard = lazy(() => import("@/pages/FinOpsDashboard"));
const MonitoringDashboard = lazy(() => import("@/pages/MonitoringDashboard"));
const PrivacyAnalytics = lazy(() => import("@/pages/PrivacyAnalytics"));
const SubscriptionAnalytics = lazy(() => import("@/pages/SubscriptionAnalytics"));

// Agent Intelligence
const AgentIntelligenceNetwork = lazy(() => import("@/pages/AgentIntelligenceNetwork"));

// Mr Blue AI Companion (Full Page)
const MrBluePage = lazy(() => import("@/pages/MrBluePage"));
const AgentDetail = lazy(() => import("@/pages/AgentDetail"));

// MB.MD TRACK 4B & 6: Journey Wizards + Agent Browser (Oct 21, 2025)
const JourneyPage = lazy(() => import("@/pages/JourneyPage"));
const AgentBrowserPage = lazy(() => import("@/components/agents/AgentBrowser"));

// MB.MD BATCH 3: 25 Additional Routes (Travel, Media, User Management, Testing, Stories)
// Travel & Planning
const TravelPlanner = lazy(() => import("@/pages/TravelPlanner"));
const Organizer = lazy(() => import("@/pages/organizer"));
const Teacher = lazy(() => import("@/pages/teacher"));
const CommunityWorldMap = lazy(() => import("@/pages/community-world-map"));

// Media & Streaming
const LiveStreaming = lazy(() => import("@/pages/LiveStreaming"));
const MediaUploadTest = lazy(() => import("@/pages/MediaUploadTest"));

// User Management
const UserSettings = lazy(() => import("@/pages/UserSettings"));
const ProfileSwitcher = lazy(() => import("@/pages/ProfileSwitcher"));
const PublicProfilePage = lazy(() => import("@/pages/PublicProfilePage"));
const PublicResumePage = lazy(() => import("@/pages/PublicResumePage"));
const ResumePage = lazy(() => import("@/pages/ResumePage"));
const RoleInvitations = lazy(() => import("@/pages/RoleInvitations"));
const RecommendationsBrowsePage = lazy(() => import("@/pages/RecommendationsBrowsePage"));

// Subscriptions & Promo
const SubscriptionPage = lazy(() => import("@/pages/Subscription"));
const PromoCodesAdmin = lazy(() => import("@/pages/PromoCodesAdmin"));

// Testing & Development
const MonitoringTest = lazy(() => import("@/pages/MonitoringTest"));
const MobileAppDashboard = lazy(() => import("@/pages/MobileAppDashboard"));
const LifeCeoPerformance = lazy(() => import("@/pages/LifeCeoPerformance"));
const ProjectTracker = lazy(() => import("@/pages/ProjectTracker"));
const DatabaseSecurity = lazy(() => import("@/pages/database-security"));
const CodeOfConduct = lazy(() => import("@/pages/code-of-conduct"));

// Stories
const TangoStories = lazy(() => import("@/pages/TangoStories"));

// MB.MD BATCH 1 (Already defined above - keeping for reference)
// AdminCenter, AdminDashboard, ESAMindPage, AgentMetrics, PlatformHealth
const AdminCenter = lazy(() => import("@/pages/AdminCenter"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const ESAMindPage = lazy(() => import("@/pages/admin/ESAMind"));
const AgentMetrics = lazy(() => import("@/pages/admin/AgentMetrics"));
const PlatformHealth = lazy(() => import("@/pages/admin/PlatformHealth"));

// Billing & Payments (Batch 1)
const BillingDashboard = lazy(() => import("@/pages/BillingDashboard"));
const Subscribe = lazy(() => import("@/pages/Subscribe"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const PaymentMethods = lazy(() => import("@/pages/PaymentMethods"));

// Enhanced Features (Batch 1)
const EnhancedEvents = lazy(() => import("@/pages/EnhancedEvents"));
const Community = lazy(() => import("@/pages/community"));

// Auth Pages (Batch 1)
const Login = lazy(() => import("@/pages/auth/login"));
const ForgotPassword = lazy(() => import("@/pages/auth/forgot-password"));
const Register = lazy(() => import("@/pages/auth/register"));
const ResetPassword = lazy(() => import("@/pages/auth/reset-password"));

// Phase 14 Batch 1: Lazy load heavy components to improve LCP (24.6s → 15-18s target)
// ESA MindMap - Global AI agent navigator for Super Admins (Section 10.11)
const ESAMindMap = lazy(() => import("@/components/esa/ESAMindMap").then(m => ({ default: m.ESAMindMap })));

// ESA AI Intelligence Network - User Support Components (Agent #31, #68-71)
const AIHelpButton = lazy(() => import("@/components/ai/AIHelpButton").then(m => ({ default: m.AIHelpButton })));
const SmartPageSuggestions = lazy(() => import("@/components/ai/SmartPageSuggestions").then(m => ({ default: m.SmartPageSuggestions })));
const AIContextBar = lazy(() => import("@/components/ai/AIContextBar").then(m => ({ default: m.AIContextBar })));

// ESA Mr Blue - AI Companion for Universal Access (Agents #73-80)
// MB.MD FIX: Direct import instead of lazy to avoid Vite HMR file deletion bug
import { MrBlueComplete } from "@/components/mrBlue/MrBlueComplete";

// ESA Dev Tools - Super Admin toggle for development testing
const SuperAdminToggle = lazy(() => import("@/components/dev/SuperAdminToggle").then(m => ({ default: m.SuperAdminToggle })));

// Phase 15 Batch 1: Cache monitor display for development
// DISABLED - Vite HMR file deletion bug keeps removing this file
// const CacheMonitorDisplay = lazy(() => import("@/components/dev/CacheMonitorDisplay").then(m => ({ default: m.CacheMonitorDisplay })));

// ESA Visual Editor - Replit-style page editor (Agent #78)
const VisualEditorWrapper = lazy(() => import("@/components/visual-editor/VisualEditorWrapper"));

// EventDiscoveryFeed - Used on multiple pages but deferred to reduce initial bundle
const EventDiscoveryFeed = lazy(() => import('@/components/events/EventDiscoveryFeed'));
// MB.MD FIX: Discover page doesn't exist - commented out to fix crash
// const Discover = lazy(() => import('@/pages/discover'));

// Mundo Tango ESA Layer 44 - Minimal loading component to prevent browser freeze
const LoadingFallback = ({ message = "Loading..." }: { message?: string }) => (
  <div style={{ 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: 'linear