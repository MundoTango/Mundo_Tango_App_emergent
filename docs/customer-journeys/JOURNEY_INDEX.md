# Complete Mundo Tango Customer Journey Index

**Total Journeys:** 15+ distinct customer paths  
**Total Routes:** 88+ (85 production + 3 special)  
**Last Updated:** October 12, 2025

---

## 📊 Journey Overview

| Tier | Journey Type | Routes | Agent Owner | Priority | Status |
|------|-------------|--------|-------------|----------|--------|
| **1** | Core User (4 journeys) | 43 | #51, #11, #48, #0 | CRITICAL | 12.5% validated |
| **2** | Marketplace (2 journeys) | 9 | TBD | HIGH | 0% |
| **3** | Professional (2 journeys) | 2 | TBD | MEDIUM | 0% |
| **4** | Monetization (1 journey) | 7 | #75 | HIGH | 0% |
| **5** | Mr Blue AI (1 journey) | 3 | #73 | HIGH | 0% |
| **6** | Career/CV (1 journey) | 2 | TBD | MEDIUM | 0% |
| **7** | Monitoring (1 journey) | 7 | #0 | LOW | 0% |
| **8** | Legal (1 journey) | 5 | TBD | MEDIUM | 0% |
| **9** | Utility (2 journeys) | 4 | TBD | MEDIUM | 0% |

---

## 🎯 TIER 1: CORE USER JOURNEYS (CRITICAL)

### Journey 1.1: New User (0% → 25%)
**Agent:** #51 (QA Testing)  
**Routes:** 9 routes  
**Status:** 50% validated

[View Details →](./01-new-user-journey.md)

**Key Routes:**
- `/login` - Authentication
- `/register` - New user signup
- `/onboarding` - First-time setup with Mr Blue tour
- `/profile/:username` - Profile management
- `/settings` - User preferences

**Validation Status:**
- ✅ Navigation working (87.5%)
- 🔲 Dark mode untested
- 🔲 i18n untested
- 🔲 Profile editing untested

---

### Journey 1.2: Active User (25% → 50%)
**Agent:** #11 (Journey Mapping)  
**Routes:** 8 routes  
**Status:** 0% validated

[View Details →](./02-active-user-journey.md)

**Key Features:**
- Posting & interactions
- Event RSVP
- Friends & messaging
- Content discovery

---

### Journey 1.3: Power User (50% → 75%)
**Agent:** #48 (UI/UX Design)  
**Routes:** 12 routes  
**Status:** 0% validated

[View Details →](./03-power-user-journey.md)

**Key Features:**
- Events & groups
- Recommendations
- Community engagement
- Travel planning

---

### Journey 1.4: Super Admin (75% → 100%)
**Agent:** #0 (CEO)  
**Routes:** 14 routes  
**Status:** 0% validated

[View Details →](./04-super-admin-journey.md)

**Key Features:**
- User management
- Content moderation
- Analytics & insights
- Platform administration

---

## 💰 TIER 2: MARKETPLACE JOURNEYS

### Journey 2.1: Housing Guest
**Routes:** 4 routes  
**Status:** 0% validated

**Flow:** Browse listings → View details → Book → Manage bookings

**Restrictions:**
- Free tier: City-locked
- Explorer+: Global access

---

### Journey 2.2: Housing Host
**Routes:** 5 routes  
**Status:** 0% validated

**Flow:** List property → Set calendar → Manage bookings

**Requirements:**
- Professional tier for hosting

---

## 🎓 TIER 3: PROFESSIONAL JOURNEYS

### Journey 3.1: Tango Teacher
**Routes:** 1 route (`/teacher`)  
**Status:** Needs implementation

**Features Needed:**
- Class management
- Student tracking
- Payments via 12% platform fee

---

### Journey 3.2: Event Organizer
**Routes:** 1 route (`/organizer`)  
**Status:** Needs implementation

**Features Needed:**
- Event creation
- Ticket management
- Attendee tracking

---

## 💳 TIER 4: MONETIZATION JOURNEY

### Journey 4.1: Subscription Management
**Agent:** #75 (Subscription Manager)  
**Routes:** 7 routes  
**Status:** 0% validated

**Subscription Tiers:**
- **FREE:** $0 - City-locked, 20 media/month
- **Global Explorer:** $9.99/mo - Unlimited cities
- **Mr Blue:** $29.99/mo - AI companion
- **Professional:** $79.99/mo - Business tools

[View Pricing Strategy →](../platform-handoff/ESA_AGENT_72_PRICING_STRATEGY.md)

---

## 🤖 TIER 5: MR BLUE AI JOURNEY

### Journey 5.1: Mr Blue Companion
**Agent:** #73 (Mr Blue Avatar)  
**Routes:** 3 routes  
**Status:** 0% validated

**Features:**
- 16 AI agents (project-based)
- Semantic platform search
- AI can act on behalf of user
- Voice interaction

**Admin Capabilities:**
- "Change this color" → Real-time modifications
- Site builder for Pros
- Platform intelligence

[View Mr Blue Architecture →](../platform-handoff/ESA_AGENT_73_MR_BLUE_AVATAR.md)

---

## 📝 TIER 6: CAREER/CV JOURNEY

### Journey 6.1: Resume/CV Management
**Routes:** 2 routes  
**Status:** Needs validation

**Features:**
- Professional profile builder
- Public resume view
- Share with organizers/schools

---

## 📊 TIER 7: MONITORING JOURNEYS

### Journey 7.1: System Monitoring (Admin Only)
**Routes:** 7 routes  
**Status:** 0% validated

**Access:** Admins only

**Features:**
- Platform analytics
- Agent metrics
- Database security
- Live statistics

---

## ⚖️ TIER 8: LEGAL/COMPLIANCE

### Journey 8.1: Legal & Privacy
**Routes:** 5 routes  
**Status:** 0% validated

**Pages:**
- Help center
- Terms of service
- Privacy policy
- Code of conduct

---

## 🔧 TIER 9: UTILITY JOURNEYS

### Journey 9.1: Account Management
**Routes:** 2 routes  
**Features:** Settings, account deletion

### Journey 9.2: Feature Discovery
**Agent:** #74 (Interactive Tour)  
**Routes:** 2 routes  
**Features:** Interactive tours with Mr Blue

---

## 🎯 Validation Strategy

### Phase 1: Core Journeys (Days 1-3)
- Agent #51: Complete New User validation
- Agent #11: Validate Active User flows
- Agent #48: Test Power User features
- Agent #0: Verify Admin capabilities

### Phase 2: Revenue Journeys (Days 4-5)
- Marketplace (Host/Guest)
- Subscription flows
- Payment processing

### Phase 3: Professional Features (Days 6-7)
- Teacher/Organizer dashboards
- AI site builder
- Resume/CV system

### Phase 4: Platform Features (Days 8-9)
- Monitoring & analytics
- Legal/compliance
- Utility features

### Phase 5: Mr Blue Integration (Days 10-11)
- 3D avatar
- Voice system
- Interactive tours
- Admin powers

### Phase 6: Final Validation (Days 12-14)
- Cross-journey testing
- Mobile validation
- Performance optimization
- Agent #0 certification

---

## 📈 Success Metrics

**Platform is 100% validated when:**
- ✅ All 15 journeys completable without help
- ✅ All 88+ routes load without errors
- ✅ UI/UX consistent across journeys
- ✅ Global features (dark mode, i18n) work everywhere
- ✅ Mobile experience perfect
- ✅ Cross-journey flows seamless
- ✅ Zero-knowledge users can complete ALL journeys
- ✅ Agent #0 certifies: "Every user can reach 100%"

---

## 🗺️ Visual Journey Map

**Coming Soon:** ESA Mind interactive journey visualization
- Click any journey → See routes & validation status
- Filter by priority/status
- Track completion %
- View agent assignments

[Access ESA Mind →](/admin/esa-mind)

---

**Next Steps:**
1. Complete journey documentation for each tier
2. Build interactive journey map in ESA Mind
3. Execute validation systematically
4. Achieve 100% platform readiness

**Documentation Location:** `/docs/customer-journeys/`  
**Integration:** ESA Mind dashboard "Customer Journeys" tab
