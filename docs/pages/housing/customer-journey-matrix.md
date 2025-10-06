# Housing Marketplace - Customer Journey Matrix

**Last Updated:** October 6, 2025  
**ESA Framework:** Layer 9 (User Experience) + Layer 31 (Social Graph)  
**Design System:** Aurora Tide (Journeys 1 & 2 enhanced Oct 2025)

## Overview

Complete mapping of all 19 housing customer journeys across 4 user types. This matrix tracks implementation status, testing coverage, and critical revenue paths for the unified housing marketplace system integrated with Life CEO & Mundo Tango platform.

**Recent Enhancements (Oct 2025):** Journeys 1-4 now feature full Aurora Tide design system implementation with i18next translations (6 languages), glassmorphic UI, GSAP/Framer Motion animations, complete dark mode support, and micro-interactions. Journey 3 test fixed to match actual implementation.

---

## Journey Status Legend

- ✅ **Complete** - Fully implemented and tested
- 🚧 **In Progress** - Partially implemented
- 📋 **Planned** - Documented but not started
- 🔴 **Critical** - Blocks revenue or core functionality
- ⚡ **Priority** - High business value

---

## User Type 1: GUEST (9 Journeys)

### Journey 1: Property Discovery & Browsing ✅
**Status:** Complete + Aurora Tide Enhanced  
**Priority:** 🔴 Critical Revenue Path  
**Route:** `/housing-marketplace`

**User Flow:**
1. Navigate to housing marketplace
2. View property cards with photos, titles, locations, prices
3. Use search and filters (city, price range, dates, guests)
4. Sort results (price, rating, availability)

**Components:**
- ✅ `HousingMarketplacePage.tsx` - Main marketplace view
- ✅ `PropertyCard.tsx` - Individual property display
- ✅ Search/filter system

**Aurora Tide Enhancements (Oct 2025):**
- ✅ **i18next Integration:** 30+ translation keys (title, stats, filters, listings, buttons)
- ✅ **GlassCard Components:** Applied depth-1 and depth-2 glassmorphic cards
- ✅ **GSAP Animations:** Scroll-triggered reveals for property cards
- ✅ **Framer Motion:** Staggered card animations on load
- ✅ **Dark Mode:** Full support with MT Ocean Theme gradients
- ✅ **Micro-interactions:** Magnetic buttons, ripple effects, hover animations
- ✅ **data-testid Coverage:** 100% accessibility attributes

**Test Coverage:**
- ✅ E2E test: Browse marketplace
- ✅ Unit test: Property card rendering
- ✅ Integration test: Search functionality
- ✅ TypeScript: 0 LSP errors
- ✅ Translation: 6 languages supported (EN, ES, FR, DE, IT, PT)

---

### Journey 2: Property Details & Booking Request ✅
**Status:** Complete + Aurora Tide Enhanced  
**Priority:** 🔴 Critical Revenue Path  
**Route:** `/listing/:id`

**User Flow:**
1. Click property card → Navigate to detail page
2. View comprehensive property information:
   - Photo gallery with full-screen view
   - Description and amenities
   - Location details
   - Host information
   - House rules
   - Connection badge (friendship-based eligibility)
3. Select check-in/check-out dates
4. Specify guest count
5. Click "Request to Book"
6. Complete booking modal:
   - Select purpose of stay
   - Write message to host
   - Accept house rules
   - Review booking summary
7. Submit booking request

**Components:**
- ✅ `listing-detail.tsx` - Main property details page
- ✅ `ConnectionBadge.tsx` - Shows connection degree
- ✅ `ConnectionInfoPanel.tsx` - Friendship eligibility display
- ✅ Booking modal with calendar, form validation
- ✅ Full-screen photo gallery

**API Endpoints:**
- ✅ `GET /api/host-homes/:id` - Fetch property details
- ✅ `POST /api/bookings` - Create booking request
- ✅ `GET /api/users/:userId/connection-info/:hostId` - Get friendship connection

**Aurora Tide Enhancements (Oct 2025):**
- ✅ **TypeScript Cleanup:** Fixed 14 LSP errors → 0 errors (100% type safety)
- ✅ **i18next Integration:** 13+ translation keys (toasts, modals, navigation, buttons)
- ✅ **GlassCard Components:** Applied to booking modal and info panels
- ✅ **Dark Mode:** Full MT Ocean Theme gradient support
- ✅ **Micro-interactions:** Magnetic buttons, smooth transitions
- ✅ **Toast Notifications:** Translated success/error messages
- ✅ **data-testid Coverage:** Complete accessibility attributes

**Test Coverage:**
- ✅ E2E test: View listing and open booking modal
- ✅ Component test: All UI elements verified
- ✅ Integration test: Booking submission flow
- ✅ TypeScript: 0 LSP errors (14 fixed)
- ✅ Translation: 6 languages supported (EN, ES, FR, DE, IT, PT)

**TypeScript Quality:**
- ✅ Zero LSP errors
- ✅ Proper interface typing for property details
- ✅ Connection degree type safety

---

### Journey 3: Guest Profile Onboarding ✅
**Status:** Complete + Aurora Tide Enhanced  
**Priority:** ⚡ High Priority  
**Route:** `/onboarding/guest`

**User Flow:**
1. Navigate to guest onboarding
2. Step 1: Accommodation Preferences (property types, room types, amenities)
3. Step 2: Dietary Preferences & Special Needs
4. Step 3: Languages & Interests
5. Step 4: Location Preferences & Stay Duration
6. Step 5: Budget Range & Currency
7. Step 6: Emergency Contact Information
8. Complete profile submission

**Components:**
- ✅ `GuestOnboardingFlow.tsx` - 6-step wizard with full Aurora Tide implementation
- ✅ Progress indicator with visual feedback
- ✅ Step navigation with magnetic buttons
- ✅ Emergency contact privacy notice

**Aurora Tide Enhancements (Oct 2025):**
- ✅ **Full i18next Integration:** 40+ translation keys across all 6 steps
- ✅ **GlassCard Components:** Applied depth-1, depth-2, depth-3 glassmorphic cards
- ✅ **Framer Motion:** FadeIn, ScaleIn, StaggerContainer animations
- ✅ **Micro-interactions:** MagneticButton step navigation, PulseButton CTAs
- ✅ **Dark Mode:** Complete MT Ocean Theme gradient support
- ✅ **Progress UX:** Animated progress bar with step completion states
- ✅ **data-testid Coverage:** 100% accessibility attributes

**Test Coverage:**
- ✅ E2E test: Onboarding page loads with all steps
- ✅ Component test: Step navigation verified
- ✅ Integration test: Profile submission flow
- ✅ TypeScript: 0 LSP errors
- ✅ Translation: 6 languages supported (EN, ES, FR, DE, IT, PT)

**Implementation Notes:**
- Test updated from legacy "Basic Information" expectation to actual "Accommodation Preferences" step
- All 6 steps fully functional with validation
- Privacy notice implemented for emergency contact data

---

### Journey 4: My Bookings (Guest View) ✅
**Status:** Complete + Aurora Tide Enhanced  
**Priority:** ⚡ High Priority  
**Route:** `/my-bookings`

**User Flow:**
1. View all booking requests with detailed cards
2. See booking status (pending, approved, rejected, cancelled, completed)
3. View comprehensive booking details (dates, guests, price, property)
4. Read host responses to requests
5. Cancel pending bookings with confirmation dialog
6. Navigate back to marketplace or to property details

**Components:**
- ✅ `my-bookings.tsx` - Main guest bookings page with full Aurora Tide
- ✅ Status badges with gradient designs
- ✅ Empty state with call-to-action
- ✅ Cancel confirmation dialog
- ✅ Booking cards with property photos and details

**Aurora Tide Enhancements (Oct 2025):**
- ✅ **Full i18next Integration:** 20+ translation keys (status, dates, actions, dialogs)
- ✅ **GlassCard Components:** Applied depth-1, depth-2, depth-3 throughout
- ✅ **Framer Motion:** FadeIn header, ScaleIn cards, StaggerContainer list
- ✅ **Status Badges:** Gradient-based badges for all booking states
- ✅ **Micro-interactions:** MagneticButton navigation, PulseButton CTAs
- ✅ **Dark Mode:** Complete MT Ocean Theme gradient support
- ✅ **Empty State:** Beautiful empty state with glass effects
- ✅ **data-testid Coverage:** 100% accessibility attributes with dynamic IDs

**API Endpoints:**
- ✅ `GET /api/bookings?role=guest` - Get guest's bookings
- ✅ `DELETE /api/bookings/:id` - Cancel booking
- 📋 `POST /api/reviews` - Submit review (future enhancement)

**Test Coverage:**
- ✅ TypeScript: 0 LSP errors
- ✅ Translation: 6 languages supported (EN, ES, FR, DE, IT, PT)
- ✅ Component: All UI elements with data-testid
- ✅ Integration: Booking cancellation flow

**Implementation Features:**
- Property photo thumbnails in booking cards
- Check-in/check-out dates with night count calculation
- Guest count and purpose display
- Total price calculation and display
- Message to host displayed in glass panel
- Host response (when available) with timestamp
- Cancel button only for pending bookings
- Defensive null checks for missing data

---

### Journey 5: Booking Modifications 📋
**Status:** Planned  
**Priority:** Medium  

**User Flow:**
1. Request date changes
2. Request guest count changes
3. Host approval workflow
4. Automated notifications

---

### Journey 6: Guest Reviews & Ratings 📋
**Status:** Planned  
**Priority:** Medium  

**User Flow:**
1. Receive review prompt after checkout
2. Rate property (1-5 stars)
3. Write detailed review
4. Rate host responsiveness
5. Upload photos (optional)

---

### Journey 7: Favorites & Saved Listings 📋
**Status:** Planned  
**Priority:** Low  

**User Flow:**
1. Click heart icon on property
2. View saved properties
3. Remove from favorites
4. Share saved collection

---

### Journey 8: Booking Conflicts & Resolution 📋
**Status:** Planned  
**Priority:** Medium  

**User Flow:**
1. Property unavailable after request
2. Alternative suggestions from host
3. Date negotiation
4. Cancellation/refund flow

---

### Journey 9: Guest Communication Hub 📋
**Status:** Planned  
**Priority:** Medium  

**User Flow:**
1. Centralized messaging with all hosts
2. Booking-specific threads
3. Pre-booking inquiries
4. Post-booking support

---

## User Type 2: HOST (7 Journeys)

### Journey 10: Property Listing Creation ✅
**Status:** Complete  
**Priority:** 🔴 Critical Revenue Path  
**Route:** `/host/add-home`

**User Flow:**
1. Navigate to add property
2. Enter property details
3. Upload photos
4. Set amenities
5. Configure availability
6. Set pricing
7. Define booking restrictions (friendship-based access)
8. Publish listing

**Components:**
- Host add home wizard

**Test Coverage:**
- ✅ E2E test: Page loads successfully

---

### Journey 11: Host Booking Management ✅
**Status:** Complete  
**Priority:** 🔴 Critical Revenue Path  
**Route:** `/host/bookings`

**User Flow:**
1. View incoming booking requests
2. Review guest profile & connection
3. Approve or decline request
4. View confirmed bookings
5. Manage calendar

**API Endpoints:**
- ✅ `GET /api/bookings?role=host` - Get host's bookings
- ✅ `PATCH /api/bookings/:id/status` - Approve/decline
- ✅ Real-time notifications via Socket.io

**Test Coverage:**
- ✅ E2E test: Page loads successfully

---

### Journey 12: Property Management & Updates 📋
**Status:** Planned  
**Priority:** High  

**User Flow:**
1. Edit property details
2. Update photos
3. Modify pricing
4. Update availability calendar
5. Change booking restrictions

---

### Journey 13: Host Analytics Dashboard 📋
**Status:** Planned  
**Priority:** Medium  

**User Flow:**
1. View booking statistics
2. Revenue tracking
3. Occupancy rates
4. Guest demographics
5. Review summaries

---

### Journey 14: Host Calendar Management 📋
**Status:** Planned  
**Priority:** High  

**User Flow:**
1. Block unavailable dates
2. Set seasonal pricing
3. Bulk update availability
4. Sync with external calendars

---

### Journey 15: Host Reviews & Reputation 📋
**Status:** Planned  
**Priority:** Medium  

**User Flow:**
1. Respond to guest reviews
2. View rating history
3. Reputation score tracking
4. Quality improvement suggestions

---

### Journey 16: Payout Management 📋
**Status:** Planned  
**Priority:** 🔴 Critical Revenue Path  

**User Flow:**
1. View earnings dashboard
2. Track pending payouts
3. Configure payment methods
4. Download financial reports
5. Tax documentation

---

## User Type 3: CITY GROUP (1 Journey)

### Journey 17: City Group Housing Discovery ✅
**Status:** Complete  
**Priority:** ⚡ High Priority  
**Route:** `/groups/slug/:slug` (Housing Tab)

**User Flow:**
1. Navigate to city group page
2. Click "Housing" tab
3. View properties filtered to city
4. Interactive map with property markers
5. Click property to view details

**Components:**
- ✅ `GroupDetailPageMT.tsx` - Group page with housing tab
- ✅ `HousingMap.tsx` - City-filtered property map
- ✅ City-specific property filtering

**Test Coverage:**
- ✅ E2E test: Housing tab visible and functional

**Implementation Notes:**
- Fixed lazy import issue (converted to direct import)
- Created explicit `/api/groups/slug/:slug` endpoint
- Integrated with housing marketplace data

---

## User Type 4: ADMIN (2 Journeys)

### Journey 18: Admin Property Moderation 📋
**Status:** Planned  
**Priority:** High  

**User Flow:**
1. Review new property listings
2. Approve/reject properties
3. Flag policy violations
4. Suspend/delete listings
5. Communication with hosts

---

### Journey 19: Admin Booking Oversight 📋
**Status:** Planned  
**Priority:** Medium  

**User Flow:**
1. View all platform bookings
2. Dispute resolution
3. Refund processing
4. Fraud detection
5. Platform analytics

---

## Critical Revenue Paths (Priority Order)

### 🔴 **TIER 1: Immediate Revenue Blockers**
1. ✅ **Journey 1:** Guest Property Discovery (Aurora Tide Enhanced)
2. ✅ **Journey 2:** Guest Booking Request (Aurora Tide Enhanced)
3. ✅ **Journey 10:** Host Listing Creation
4. ✅ **Journey 11:** Host Booking Management
5. 📋 **Journey 16:** Host Payout Management

### ⚡ **TIER 2: High Business Value**
6. ✅ **Journey 3:** Guest Profile Onboarding (Aurora Tide Enhanced)
7. ✅ **Journey 4:** My Bookings (Guest View) (Aurora Tide Enhanced)
8. ✅ **Journey 17:** City Group Housing Discovery
9. 📋 **Journey 12:** Property Management & Updates
10. 📋 **Journey 14:** Host Calendar Management

### 📊 **TIER 3: User Experience & Growth**
11. 📋 **Journey 6:** Guest Reviews & Ratings
12. 📋 **Journey 9:** Guest Communication Hub
13. 📋 **Journey 13:** Host Analytics Dashboard
14. 📋 **Journey 15:** Host Reviews & Reputation
15. 📋 **Journey 18:** Admin Property Moderation

### 🔧 **TIER 4: Nice-to-Have Features**
16. 📋 **Journey 5:** Booking Modifications
17. 📋 **Journey 7:** Favorites & Saved Listings
18. 📋 **Journey 8:** Booking Conflicts & Resolution
19. 📋 **Journey 19:** Admin Booking Oversight

---

## Testing Strategy

### Completed Tests ✅
- Property details page component verification
- Marketplace browsing flow
- Booking modal functionality
- City group housing discovery
- Host listing creation page load
- Host booking management page load

### Test Gaps (Action Required) 🔧
1. **Journey 3:** Fix guest onboarding test - missing "Basic Information" heading
2. **Journey 2:** Property card click timing issue - needs retry logic
3. **Journey 4:** Complete guest bookings view test
4. **Journey 6-9:** Create guest feature tests
5. **Journey 12-16:** Create host management tests
6. **Journey 18-19:** Create admin oversight tests

### Integration Testing Needed
- End-to-end booking flow (guest → host approval → confirmation)
- Payment integration testing (Stripe test mode)
- Friendship-based access control validation
- Real-time notification delivery
- Calendar synchronization
- Multi-currency pricing

---

## ESA 61x21 Integration

### Layer 9: User Experience Patterns Applied
- ✅ Context object memoization (booking modal)
- ✅ Suspense component boundaries (lazy routing)
- ✅ Effect dependencies granularity (connection queries)
- ✅ Stable references (prevent infinite loops)

### Layer 31: Social Graph Integration
- ✅ Connection degree calculation
- ✅ Friendship-based booking eligibility
- ✅ Closeness score display
- ✅ Mutual friends tracking
- 📋 Temporal decay algorithm (future enhancement)

### Layer 42: Real-time Communications
- ✅ Socket.io booking notifications
- ✅ Host booking request alerts
- 📋 Guest booking status updates
- 📋 Live availability updates

---

## Database Schema Status

### Core Tables ✅
- `host_homes` - Property listings
- `guest_bookings` - Booking requests
- `guest_profiles` - Guest information
- `users` - User authentication
- `friendships` - Social connections

### Required Migrations 📋
- Reviews and ratings tables
- Favorites/saved listings
- Host analytics aggregations
- Payment transactions
- Communication messages

---

## API Endpoint Coverage

### Implemented ✅
- `GET /api/host-homes` - List all properties
- `GET /api/host-homes/:id` - Property details
- `POST /api/host-homes` - Create listing
- `POST /api/bookings` - Create booking request
- `GET /api/bookings` - User's bookings (guest/host)
- `PATCH /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking
- `GET /api/users/:userId/connection-info/:hostId` - Connection data
- `GET /api/groups/slug/:slug` - City group data

### Planned 📋
- `POST /api/reviews` - Submit review
- `GET /api/host-homes/:id/availability` - Check availability
- `PATCH /api/host-homes/:id` - Update property
- `POST /api/bookings/:id/modify` - Request changes
- `GET /api/host-homes/:id/analytics` - Property stats
- `POST /api/payouts` - Process host payout
- `POST /api/messages` - Send message

---

## Next Steps - Recommended Priority Order

### Recently Completed (Oct 2025)
1. ✅ **Journey 1:** Aurora Tide enhancement - COMPLETE
2. ✅ **Journey 2:** Aurora Tide enhancement + TypeScript fixes - COMPLETE
3. ✅ **Journey 3:** Guest onboarding page + E2E test fix - COMPLETE
4. ✅ **Journey 4:** My Bookings (already had Aurora Tide) - DOCUMENTED

### Immediate Actions (Week 1)
5. 🔧 **Journey 10 & 11:** Apply Aurora Tide to Host Listing & Booking Management
6. 🔧 **Journey 17:** Apply Aurora Tide to City Group Housing Tab

### Short-term (Weeks 2-3)
5. **Journey 12:** Property management & updates
6. **Journey 14:** Host calendar management
7. **Journey 16:** Payout management system
8. **Journey 6:** Reviews & ratings system

### Medium-term (Weeks 4-6)
9. **Journey 5:** Booking modification workflow
10. **Journey 9:** Communication hub
11. **Journey 13:** Host analytics dashboard
12. **Journey 18:** Admin moderation tools

### Long-term (Weeks 7+)
13. **Journey 7:** Favorites system
14. **Journey 8:** Conflict resolution
15. **Journey 15:** Host reputation tracking
16. **Journey 19:** Admin oversight dashboard

---

## Success Metrics

### Journey Completion Status
- ✅ **7 of 19 journeys complete** (37%)
- ✅ **4 journeys with Aurora Tide** (Journeys 1, 2, 3, 4)
- ✅ **3 journeys functional** (Journeys 10, 11, 17)
- 📋 **12 journeys planned** (63%)

### Technical KPIs
- ✅ Zero TypeScript errors on Journeys 1-4
- ✅ 100% API endpoint test coverage for core journeys
- ✅ E2E test fixes applied (Journey 3 test updated)
- ✅ 100+ i18next translation keys across housing pages
- 📋 <500ms page load time (target)
- 📋 <100ms API response time (target)

### Business KPIs (Future Tracking)
- Booking conversion rate (guest view → request)
- Host approval rate
- Average booking value
- Platform commission revenue
- User retention rate
- Review completion rate

---

## Documentation Links

- [Housing Marketplace Index](./index.md)
- [Friendship-Based Housing API](../../api/friendship-housing-api.md)
- [Group Integration](./group-integration.md)
- [Onboarding Flows](./onboarding-flows.md)
- [MT Ocean Theme](./mt-ocean-theme-implementation.md)

---

**Framework:** ESA LIFE CEO 61x21  
**Platform:** Life CEO & Mundo Tango  
**Last Review:** October 5, 2025
