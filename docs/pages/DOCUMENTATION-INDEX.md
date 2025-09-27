# ESA LIFE CEO 61x21 - Complete Page Documentation Index

**Total Pages Documented:** 88 pages  
**Framework:** ESA LIFE CEO 61x21 AGENTS Framework  
**Theme:** MT Ocean (#5EEAD4 → #155E75)  
**Deployment:** https://mundo-tango-appemergent-admin3304.replit.app  
**Google Maps API:** ✅ Integrated (worldwide business search)

## 🎯 Recent Updates (September 27, 2025)

### Navigation System Complete Refactoring
Following **ESA LIFE CEO 61×21 AGENTS FRAMEWORK** specifications:

**✅ Sidebar Component Updates**
- Renamed TrangoTechSidebar → Sidebar (Layer 60: Clean Codebase)
- Updated all 88+ page references
- Migrated documentation to new naming structure
- All 7 navigation sections fully operational

**✅ Events Page Fix** 
- Resolved blank page issue (Layer 48: Debugging Agent)
- Corrected API endpoint: `/api/events` → `/api/events/feed`
- Fixed calendar component conflicts

**✅ Role Invitations System**
- Added 4 new API endpoints (Layer 2: API Structure)
  - `GET /api/users/me/event-invitations` - Fetch user invitations
  - `GET /api/users/me/events` - Get user's events
  - `POST /api/events/invite-participant` - Send invitations
  - `PUT /api/event-participants/:id/status` - Update status
- Integrated with `eventParticipants` table (Layer 22: Group Management)
- Full role-based access control (Layer 24: Role Assignment)

  

## 📚 Documentation Organization

### 🧩 Core Components (4 pages)
- [UnifiedTopBar](/docs/pages/components/UnifiedTopBar.md) - Global navigation header - Unified top navigation bar across all 88+ pages with MT Ocean theme
- [Sidebar](/docs/pages/components/Sidebar.md) - **✅ REFACTORED (Sept 27, 2025)** - Main navigation sidebar with 7 functional sections:
  - 💭 Memories - Personal memory feed
  - 🎭 Tango Community - Social posts and interactions
  - 👥 Friends - Connection management
  - 💬 Messages - Real-time messaging
  - 👫 Groups - Community groups
  - 📅 Events - **FIXED**: API endpoint corrected from `/api/events` to `/api/events/feed`
  - 📬 Role Invitations - **FIXED**: Added 4 new API endpoints for role-based system
- [See Friendship Button](/docs/pages/components/SeeFriendshipButton.md) - Social connection feature - Quick navigation to friendship timeline
- [UnifiedPostFeed](/docs/pages/components/UnifiedPostFeed.md) - Consolidated feed component - Unified post feed replacing 3 duplicate implementations

### 🔐 Authentication (4 pages)
- [Login](/docs/pages/auth/login.md) - `/login` - Primary login route
- [Login (Auth)](/docs/pages/auth/login.md) - `/auth/login` - Authentication namespace route  
- [Register](/docs/pages/auth/register.md) - `/register` - Primary register route
- [Register (Auth)](/docs/pages/auth/register.md) - `/auth/register` - Authentication namespace route

### 👤 User Management (8 pages)
- [Profile](/docs/pages/user/profile.md) - `/profile`
- [User Settings](/docs/pages/user/UserSettings.md) - `/settings`
- [Onboarding](/docs/pages/user/onboarding.md) - `/onboarding`
- [Resume Page](/docs/pages/user/ResumePage.md) - `/resume`
- [Public Resume](/docs/pages/user/PublicResumePage.md) - `/public-resume`
- [Public Profile](/docs/pages/user/PublicProfilePage.md) - `/public-profile`
- [Profile Switcher](/docs/pages/user/ProfileSwitcher.md) - `/profile-switcher`
- [Home](/docs/pages/user/home.md) - `/home`

### 🎯 Events System (6 pages)
- [Events](/docs/pages/events/Events.md) - `/events`
- [Enhanced Events](/docs/pages/events/EnhancedEvents.md) - `/events` (enhanced)
- [Event Detail](/docs/pages/events/event-detail.md) - `/events/:id`
- [Event Discovery](/docs/pages/events/EventDiscoveryFeed.md) - `/events/discover`
- [Teacher Dashboard](/docs/pages/events/teacher.md) - `/teacher`
- [Organizer Dashboard](/docs/pages/events/organizer.md) - `/organizer`

### 🏠 Housing & Marketplace (3 pages)
- [Housing Marketplace](/docs/pages/housing/housing-marketplace.md) - `/housing-marketplace`
- [Host Onboarding](/docs/pages/housing/HostOnboarding.md) - `/host-onboarding`
- [Guest Onboarding](/docs/pages/housing/GuestOnboarding.md) - `/guest-onboarding`

### 💬 Social Features (7 pages)
- [Friends](/docs/pages/social/Friends.md) - `/friends`
- [Enhanced Friends](/docs/pages/social/EnhancedFriends.md) - `/friends` (enhanced)
- [Friendship Page](/docs/pages/social/FriendshipPage.md) - `/friendship/:friendId`
- [Messages](/docs/pages/social/Messages.md) - `/messages`
- [Groups](/docs/pages/social/groups.md) - `/groups`
- [Group Detail](/docs/pages/social/GroupDetailPageMT.md) - `/groups/:slug`
- [Invitations](/docs/pages/social/invitations.md) - `/invitations`

### 🌍 Community (8 pages)
- [Community Hub](/docs/pages/community/community.md) - `/community`
- [Community World Map](/docs/pages/community/community-world-map.md) - `/community-world-map`
- [Create Community](/docs/pages/community/CreateCommunity.md) - `/create-community`
- [Tango Communities](/docs/pages/community/tango-communities.md) - `/tango-communities`
- [Tango Stories](/docs/pages/community/TangoStories.md) - `/tango-stories`
- [Role Invitations](/docs/pages/community/RoleInvitations.md) - `/invitations`
- [Live Streaming](/docs/pages/community/LiveStreaming.md) - `/live-streaming` - Live video streaming for events and classes
- [Gamification](/docs/pages/community/Gamification.md) - `/gamification` - Points, badges, and rewards system

### 📝 Content & Timeline (5 pages)
- [Memory Feed (Unified)](/docs/pages/content/MemoryFeedUnified.md) - `/memories` - Unified memory feed implementation with consolidated UnifiedPostFeed component (Sept 26, 2025)
- [Landing Page](/docs/pages/content/landing.md) - `/landing`
- [Search](/docs/pages/content/search.md) - `/search`
- [Posting Demo](/docs/pages/content/PostingDemo.md) - `/posting-demo`
- [Archive Reference](/docs/pages/content/archive-reference/) - Historical documentation for reference only

### 💰 Billing & Subscriptions (6 pages)
- [Subscribe](/docs/pages/billing/Subscribe.md) - `/subscribe`
- [Billing Dashboard](/docs/pages/billing/BillingDashboard.md) - `/settings/billing`
- [Checkout](/docs/pages/billing/Checkout.md) - `/checkout/:tier`
- [Payment Methods](/docs/pages/billing/PaymentMethods.md) - `/payment-methods`
- [Invoices](/docs/pages/billing/Invoices.md) - `/invoices`
- [Subscription](/docs/pages/billing/Subscription.md) - `/subscription`

### 🔧 Admin & Analytics (17 pages)
- [Admin Dashboard](/docs/pages/admin/AdminDashboard.md) - `/admin` - New unified admin dashboard
- [Admin Center (Legacy)](/docs/pages/admin/AdminCenter.md) - `/admin-legacy` - Original admin center
- [Admin Users](/docs/pages/admin/AdminUsers.md) - `/admin/users` - User management interface
- [Admin Moderation](/docs/pages/admin/AdminModeration.md) - `/admin/moderation` - Content moderation tools
- [Admin Analytics](/docs/pages/admin/AdminAnalytics.md) - `/admin/analytics` - Detailed platform analytics
- [Promo Codes Admin](/docs/pages/admin/PromoCodesAdmin.md) - `/admin/promo-codes`
- [Analytics Dashboard](/docs/pages/admin/AnalyticsDashboard.md) - `/analytics`
- [Agent Framework Dashboard](/docs/pages/admin/AgentFrameworkDashboard.md) - `/agent-framework`
- [Project Tracker](/docs/pages/admin/ProjectTracker.md) - `/project-tracker`
- [Mobile App Dashboard](/docs/pages/admin/MobileAppDashboard.md) - `/mobile-dashboard`
- [Hierarchy Dashboard](/docs/pages/admin/HierarchyDashboard.md) - `/hierarchy` - Organization structure visualization
- [Live Global Statistics](/docs/pages/admin/LiveGlobalStatistics.md) - `/stats` and `/global-statistics`
- [Database Security](/docs/pages/admin/database-security.md) - `/database-security`
- [Feature Navigation](/docs/pages/admin/feature-navigation.md) - `/feature-navigation`
- [Monitoring Dashboard](/docs/pages/admin/MonitoringDashboard.md) - `/monitoring` - System health monitoring
- [Monitoring Test](/docs/pages/admin/MonitoringTest.md) - `/monitoring-test` - Monitoring system testing
- [Subscription Analytics](/docs/pages/admin/SubscriptionAnalytics.md) - `/admin/subscription-analytics`

### 🤖 Life CEO System (4 pages)
- [Life CEO](/docs/pages/lifeceo/LifeCEO.md) - `/life-ceo`
- [Life CEO Enhanced](/docs/pages/lifeceo/LifeCEOEnhanced.md) - `/life-ceo` (enhanced)
- [Life CEO (Alternative Route)](/docs/pages/lifeceo/LifeCEO.md) - `/lifeceo` - Alternate routing to Life CEO
- [Life CEO Performance](/docs/pages/lifeceo/LifeCeoPerformance.md) - `/life-ceo-performance`

### 🧪 Testing & Development (6 pages)
- [Media Upload Test](/docs/pages/testing/MediaUploadTest.md) - `/media-upload-test`
- [Test Grouped Role Selector](/docs/pages/testing/TestGroupedRoleSelector.md) - `/test-grouped-roles`
- [TTFiles Demo](/docs/pages/testing/TTfilesDemo.md) - `/ttfiles-demo`
- [TTFiles Help Center](/docs/pages/testing/ttfiles-help-center.md) - `/ttfiles-help-center`
- [Timeline Debug](/docs/pages/testing/timeline-debug.md) - `/timeline-debug`
- [Error Boundary Page](/docs/pages/testing/ErrorBoundaryPage.md) - `/error`

### 🔒 Privacy & Security (1 page)
- [Privacy & Analytics](/docs/pages/privacy/PrivacyAnalytics.md) - `/privacy-analytics` - GDPR-compliant privacy settings management

### 📄 Legal & Support (5 pages)
- [Code of Conduct](/docs/pages/legal/code-of-conduct.md) - `/code-of-conduct`
- [Terms of Service](/docs/pages/legal/terms.md) - `/terms` - Platform terms and conditions
- [Privacy Policy](/docs/pages/legal/privacy-policy.md) - `/privacy-policy` - Data protection policies
- [404 Not Found](/docs/pages/legal/not-found.md) - 404 page
- [Travel Planner](/docs/pages/support/TravelPlanner.md) - `/travel-planner`

### 🔌 Integrations (5 pages)
- [Notion Home Page](/docs/pages/integration/NotionHomePage.md) - `/notion-home` - Notion workspace integration
- [Notion Entry Page](/docs/pages/integration/NotionEntryPage.md) - `/notion-entry` - Notion data entry interface
- [Google Maps Integration](/docs/pages/integration/GoogleMapsIntegration.md) - Google Maps Places API for worldwide business search
- [Place ID Lookup](/docs/pages/integration/PlaceIdLookup.md) - `/api/places/:placeId` - Direct venue lookup using Google Maps Place IDs
- [Manual Venue Entry](/docs/pages/integration/ManualVenueEntry.md) - Manual entry form for venues not indexed by Google

### 🎬 Real-Time Features (3 pages)
- [Video Calls](/docs/pages/realtime/VideoCallPage.md) - Video calling functionality integrated across events and messaging
- [Voice Chat](/docs/pages/realtime/VoiceChat.md) - Real-time voice communication for groups and events
- [WebSocket Manager](/docs/pages/realtime/WebSocketManager.md) - Real-time updates and notifications system

## 📝 Documentation Update Instructions

### CRITICAL: What "update docs/pages/DOCUMENTATION-INDEX.md" REALLY Means:
When requested to "update documentation" or "update docs/pages/DOCUMENTATION-INDEX.md", this **DOES NOT mean just edit this index file**. 

Instead, you must **UPDATE THE ACTUAL DOCUMENTATION FILES** referenced in this index.

### Real Example - Navigation System Documentation Update:
When asked to document navigation improvements, here's what was actually done:

✅ **CORRECT APPROACH - Update Multiple Documentation Files:**
1. **`docs/pages/components/Sidebar.md`** - Updated with:
   - Refactoring details (TrangoTechSidebar → Sidebar)
   - All 7 functional navigation sections documented
   - Referenced ESA Layers 9, 48, and 60
   
2. **`docs/pages/events/EnhancedEvents.md`** - Updated with:
   - API endpoint fix (`/api/events` → `/api/events/feed`)
   - Calendar component conflict resolution
   - Known Issues section updated to show fixed items
   
3. **`docs/pages/community/RoleInvitations.md`** - Updated with:
   - 4 new API endpoints with detailed descriptions
   - eventParticipants table integration documentation
   - Referenced ESA Layers 2, 22, and 24

4. **`docs/pages/DOCUMENTATION-INDEX.md`** - Updated ONLY to:
   - Add these instruction clarifications
   - Update the summary section if needed

### Step-by-Step Process:

1. **Identify affected documentation files**
   - Find all pages/components mentioned in the update request
   - Check this index for their documentation paths

2. **Update each documentation file individually**
   - Navigate to each file (e.g., `/docs/pages/components/Sidebar.md`)
   - Update with real implementation details
   - Follow the 10-section structure below

3. **Create new documentation files if needed**
   - If a component/page has no documentation yet
   - Create it in the appropriate directory
   - Add it to this index

4. **This index file (DOCUMENTATION-INDEX.md) is updated LAST**
   - Only update to add new entries
   - Or to clarify instructions like this section

## 📊 Documentation Standards

Each page documentation must include these 10 sections:
1. **Overview** - Route, purpose, ESA Framework layer
2. **Technical Implementation** - Components, APIs, real-time features
3. **Database Schema** - Tables and relationships
4. **User Permissions** - Access control and roles
5. **MT Ocean Theme** - Design implementation details
6. **Test Coverage** - Current status and requirements
7. **Known Issues** - Bugs and improvement areas
8. **Agent Responsibilities** - AI agent assignments
9. **Integration Points** - External service connections
10. **Performance Metrics** - Load times and optimization

## 🎯 Test Coverage Summary

### ✅ Pages with Test Coverage (11/72 = 15%)
- Authentication flows
- Events system
- Profile management
- Messages & chat
- Groups & communities
- Admin moderation
- Memory/media upload

### ⚠️ Pages Needing Tests (61/72 = 85%)
- Housing/marketplace system
- Billing & subscription flows
- Life CEO dashboards
- Analytics pages
- Integration pages
- Legal/support pages

## 🚀 Next Steps

1. **Implement missing routes** in App.tsx for undiscovered pages
2. **Create Playwright tests** for the 61 pages without coverage
3. **Fix database schema** - Add missing "personality" column
4. **Remove duplicate files** to clean up codebase
5. **Optimize bundle sizes** for pages over 100KB

## 📈 Platform Health

- **Total Routes:** 76 unique pages (+ 3 new integration routes)
- **Documentation:** 100% complete
- **Test Coverage:** 15% (needs improvement)
- **Build Time:** 39.46s
- **Google Maps API:** ✅ Integrated (worldwide business search)
- **Location Services:** ✅ Place ID lookup & manual entry
- **Media Upload Fix:** 🔧 In progress (identified issue with mediaEmbeds field)
- **Deploy Status:** ✅ Live at deployment URL
- **Framework Compliance:** ESA LIFE CEO 61x21 fully integrated