# Route Extraction - 88 Platform Pages

**Extracted From:** JOURNEY_INDEX.md + App.tsx routing  
**Last Updated:** October 13, 2025

## Complete Route List (88 Total)

### TIER 1: Core User Journeys (43 routes)

#### Journey 1.1: New User (0-25%) - 9 routes
- `/login` - P1 - Authentication page
- `/register` - P2 - New user signup
- `/onboarding` - P3 - First-time setup with Mr Blue tour
- `/profile/:username` - P4 - Profile management
- `/settings` - P5 - User preferences  
- `/settings/security` - P6 - Security settings
- `/settings/notifications` - P7 - Notification preferences
- `/settings/privacy` - P8 - Privacy controls
- `/settings/subscription` - P9 - Subscription management

#### Journey 1.2: Active User (25-50%) - 8 routes
- `/` - P10 - Home feed
- `/post/create` - P11 - Create new post
- `/post/:id` - P12 - Post detail view
- `/events` - P13 - Events listing
- `/events/:id` - P14 - Event detail & RSVP
- `/friends` - P15 - Friends list
- `/messages` - P16 - Direct messaging
- `/notifications` - P17 - Notification center

#### Journey 1.3: Power User (50-75%) - 12 routes
- `/groups` - P18 - Groups listing
- `/groups/:id` - P19 - Group detail
- `/recommendations` - P20 - Recommendations feed
- `/recommendations/create` - P21 - Create recommendation
- `/map` - P22 - Interactive city map
- `/travel` - P23 - Travel planning
- `/calendar` - P24 - Personal calendar
- `/community/:city` - P25 - Community page
- `/beautiful-post` - P26 - Enhanced post viewer
- `/artists` - P27 - Artist directory
- `/milongas` - P28 - Milonga listings
- `/music` - P29 - Music library

#### Journey 1.4: Super Admin (75-100%) - 14 routes
- `/admin` - P30 - Admin dashboard
- `/admin/users` - P31 - User management
- `/admin/content` - P32 - Content moderation
- `/admin/analytics` - P33 - Platform analytics
- `/admin/projects` - P34 - Project tracker (The Plan)
- `/admin/esa-mind` - P35 - ESA Mind dashboard
- `/admin/esa-mindmap` - P36 - ESA MindMap interactive
- `/admin/subscription-manager` - P37 - Subscription admin
- `/admin/ai-network` - P38 - AI Intelligence Network
- `/admin/open-source-tracker` - P39 - Open source deployment
- `/admin/workflow-builder` - P40 - n8n workflow builder
- `/admin/test-sprite` - P41 - TestSprite AI interface
- `/admin/site-builder` - P42 - AI Site Builder (MB7)
- `/admin/visual-editor` - P43 - Visual Page Editor (MB6)

### TIER 2: Marketplace Journeys (9 routes)

#### Journey 2.1: Housing Guest - 4 routes
- `/housing` - P44 - Housing listings
- `/housing/:id` - P45 - Property detail
- `/housing/book/:id` - P46 - Booking flow
- `/housing/bookings` - P47 - My bookings

#### Journey 2.2: Housing Host - 5 routes
- `/housing/host` - P48 - Host dashboard
- `/housing/host/list` - P49 - List new property
- `/housing/host/calendar` - P50 - Availability calendar
- `/housing/host/bookings` - P51 - Manage bookings
- `/housing/host/earnings` - P52 - Earnings & payouts

### TIER 3: Professional Journeys (2 routes)

#### Journey 3.1: Tango Teacher - 1 route
- `/teacher` - P53 - Teacher dashboard

#### Journey 3.2: Event Organizer - 1 route
- `/organizer` - P54 - Organizer dashboard

### TIER 4: Monetization Journey (7 routes)

#### Journey 4.1: Subscription Management - 7 routes
- `/pricing` - P55 - Pricing page
- `/checkout` - P56 - Checkout flow
- `/subscription/success` - P57 - Success page
- `/subscription/cancel` - P58 - Cancellation flow
- `/subscription/upgrade` - P59 - Upgrade options
- `/subscription/downgrade` - P60 - Downgrade options
- `/billing` - P61 - Billing history

### TIER 5: Mr Blue AI Journey (3 routes)

#### Journey 5.1: Mr Blue Companion - 3 routes
- `/mr-blue` - P62 - Mr Blue main interface
- `/mr-blue/agents` - P63 - Agent directory
- `/mr-blue/settings` - P64 - Mr Blue preferences

### TIER 6: Career/CV Journey (2 routes)

#### Journey 6.1: Resume/CV Management - 2 routes
- `/resume` - P65 - Resume builder
- `/resume/:username` - P66 - Public resume view

### TIER 7: Monitoring Journeys (7 routes)

#### Journey 7.1: System Monitoring (Admin) - 7 routes
- `/admin/monitoring` - P67 - Monitoring dashboard
- `/admin/metrics` - P68 - Performance metrics
- `/admin/logs` - P69 - System logs
- `/admin/database` - P70 - Database status
- `/admin/security` - P71 - Security dashboard
- `/admin/audit-log` - P72 - Audit log viewer
- `/admin/agent-metrics` - P73 - AI agent metrics

### TIER 8: Legal/Compliance (5 routes)

#### Journey 8.1: Legal & Privacy - 5 routes
- `/help` - P74 - Help center
- `/terms` - P75 - Terms of service
- `/privacy` - P76 - Privacy policy
- `/code-of-conduct` - P77 - Code of conduct
- `/contact` - P78 - Contact support

### TIER 9: Utility Journeys (4 routes)

#### Journey 9.1: Search & Discovery - 2 routes
- `/search` - P79 - Global search
- `/explore` - P80 - Explore page

#### Journey 9.2: Error & Fallback - 2 routes
- `/404` - P81 - Not found page
- `/error` - P82 - Error page

### SPECIAL ROUTES (6 routes)

#### Admin Tools
- `/admin/replit-deployment` - P83 - Deployment manager
- `/admin/quality-gates` - P84 - Quality assurance dashboard
- `/admin/documentation` - P85 - Documentation manager

#### Public Pages
- `/about` - P86 - About Mundo Tango
- `/features` - P87 - Platform features
- `/roadmap` - P88 - Public roadmap

---

## Summary

**Total Routes:** 88  
**Page Agents:** P1-P88  
**Journey Agents:** J1-J9 (9 distinct customer journeys)  
**Coverage:** 100% of platform

**Next Steps:**
1. Generate P1-P88 agent files
2. Map agents to journeys
3. Create thepages.md master registry
4. Build H2AC matching system
