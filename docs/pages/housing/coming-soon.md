# Platform Coming Soon Features

**Last Updated:** October 6, 2025  
**Status:** Roadmap for Platform Enhancements  
**Target:** Q1/Q2 2026 Release

## Overview

This document outlines planned features for the Mundo Tango platform, including Housing Marketplace enhancements and Recommendations System Phase 2.

---

## Known Issues

### 🐛 Location Picker - Fixed October 2025
**Status**: ✅ Resolved  
**Issue**: Location dropdown visibility and data mapping  
**Fixed**: October 6, 2025  
**Details**: [LocationIQ Integration Fixes](../bug-fixes/locationiq-integration-fixes-oct-2025.md)

---

## Recommendations System - Phase 2: AI-Powered Engine

### AI-Powered Recommendation Engine
**Status**: Planned for Q2 2026  
**Current**: User-generated recommendations with manual categorization  
**Priority:** Medium

**Description**:
An intelligent recommendation engine that provides personalized suggestions for restaurants, cafes, hotels, and venues based on user preferences, past behavior, and community trends.

**Features**:
- **Personalized Suggestions**: ML-based recommendations tailored to individual user preferences
- **Collaborative Filtering**: "Users like you also enjoyed..." recommendations
- **Sentiment Analysis**: Analyze user reviews and comments to determine quality scores
- **Smart Ranking**: Combine user ratings, popularity, recency, and personal preferences
- **Context-Aware**: Consider user's current location, time of day, and upcoming events
- **Discovery Mode**: Help users find hidden gems based on their taste profile

**Technical Architecture**:
- **Machine Learning**: TensorFlow.js or Python-based recommendation models
- **Vector Embeddings**: Semantic similarity for content-based filtering
- **Real-time Processing**: Stream analytics for trending recommendations
- **A/B Testing**: Experiment with different recommendation algorithms
- **Feedback Loop**: Learn from user interactions (clicks, bookings, reviews)

**Integration with Current System**:
The AI engine will enhance (not replace) the current user-generated recommendations system. Users can still manually create recommendations, and the AI will learn from these contributions.

---

## Housing Marketplace - Coming Soon Features

**Status:** Roadmap for 8 Upcoming Journeys  
**Target:** Q1/Q2 2026 Release

**Current Status:**
- ✅ 10/19 Journeys Complete (53%)
- 📋 1/19 In Development (Journey 18 - Admin Moderation)
- 🔜 8/19 Coming Soon (This Roadmap)

---

## Q1 2026 Roadmap (4 Features)

### 🔄 Journey 5: Booking Modification Workflow
**Target:** January 2026  
**Priority:** Medium  
**User Type:** Guest

**Features:**
- Guest-initiated booking date changes
- Guest count adjustments with pricing recalculation
- Host approval/rejection workflow
- Automated notifications for modification requests
- Pricing difference calculations and payment processing
- Modification history tracking

**Technical Requirements:**
- New API endpoints for modification requests
- Payment adjustment logic (Stripe integration)
- Real-time notification system
- Booking history audit trail

**ESA Layers:** Layer 28 (Marketplace), Layer 17 (Payments), Layer 11 (Real-time)

---

### 💬 Journey 9: Guest Communication Hub
**Target:** February 2026  
**Priority:** Medium  
**User Type:** Guest

**Features:**
- Centralized messaging dashboard with all hosts
- Booking-specific conversation threads
- Pre-booking inquiry system (before booking approval)
- Post-booking support messaging
- Automated response templates for common questions
- Message read receipts and typing indicators
- File/photo sharing in conversations

**Technical Requirements:**
- Real-time messaging infrastructure (Socket.io enhancement)
- Message persistence (new database tables)
- Notification system integration
- Attachment upload/storage

**ESA Layers:** Layer 24 (Messaging), Layer 11 (Real-time), Layer 13 (File Management)

---

### 💰 Journey 16: Payout Management System
**Target:** February-March 2026  
**Priority:** 🔴 Critical Revenue Path  
**User Type:** Host

**Features:**
- Comprehensive earnings dashboard with analytics
- Automated payout scheduling (weekly/monthly)
- Multi-currency support with conversion rates
- Tax documentation generation (1099, receipts)
- Financial reporting tools (CSV/PDF export)
- Payout method configuration (bank transfer, PayPal)
- Revenue forecasting and trends

**Technical Requirements:**
- Stripe Connect integration for payouts
- Multi-currency calculation engine
- Tax document generation system
- Financial reporting service
- Secure bank account verification

**ESA Layers:** Layer 17 (Payments), Layer 27 (Analytics), Layer 19 (Compliance)

**Database Schema:**
```typescript
host_payouts {
  id, host_id, amount, currency, status,
  payout_method, scheduled_date, completed_date,
  tax_withheld, fee_amount, net_amount
}

payout_methods {
  id, host_id, type, details, verified, is_default
}
```

---

### 📊 Journey 13: Host Analytics Dashboard
**Target:** March 2026  
**Priority:** Medium  
**User Type:** Host

**Features:**
- Booking statistics and trends visualization
- Revenue tracking with charts (daily, weekly, monthly)
- Occupancy rate calculations and forecasting
- Guest demographics insights (age, location, interests)
- Review summary analytics with sentiment analysis
- Performance metrics (response time, acceptance rate)
- Competitive pricing insights

**Technical Requirements:**
- Analytics data aggregation service
- Chart visualization library (Recharts integration)
- AI-powered insights (Layer 35 - Analytics Agent)
- Data export functionality

**ESA Layers:** Layer 27 (Analytics), Layer 10 (Reporting), Layer 35 (AI Agents)

---

## Q2 2026 Roadmap (4 Features)

### ⭐ Journey 7: Favorites & Saved Listings
**Target:** April 2026  
**Priority:** Low  
**User Type:** Guest

**Features:**
- Wishlist management with custom collections
- Price drop alerts for saved properties
- Share favorites with friends/travel companions
- Comparison tool for saved listings (side-by-side)
- Notes/tags for saved properties
- Trip planning integration

**Technical Requirements:**
- Favorites database table with collections
- Price monitoring service with notifications
- Sharing functionality via email/social
- Comparison view component

**ESA Layers:** Layer 16 (Notifications), Layer 22 (Social Features)

**Database Schema:**
```typescript
favorites {
  id, user_id, home_id, collection_name,
  notes, created_at
}

price_alerts {
  id, user_id, home_id, target_price,
  notified, created_at
}
```

---

### ⚖️ Journey 8: Booking Conflicts & Resolution
**Target:** April-May 2026  
**Priority:** Medium  
**User Type:** Guest + Host

**Features:**
- Dispute mediation workflow (admin oversight)
- Automated conflict detection (double bookings, cancellations)
- Refund processing system with policies
- Alternative property recommendations
- Cancellation policy enforcement
- Compensation workflows

**Technical Requirements:**
- Dispute resolution database tables
- Refund processing logic (Stripe refunds)
- AI-powered alternative recommendations
- Admin mediation dashboard

**ESA Layers:** Layer 28 (Marketplace), Layer 17 (Payments), Layer 21 (User Management)

---

### 🏆 Journey 15: Host Reviews & Reputation Tracking
**Target:** May 2026  
**Priority:** Medium  
**User Type:** Host

**Features:**
- Superhost badge qualification system
- Performance metrics tracking (detailed)
- Quality improvement recommendations (AI-powered)
- Rating trend analysis with visualizations
- Response templates for reviews
- Reputation score algorithm
- Achievement milestones and rewards

**Technical Requirements:**
- Reputation scoring algorithm
- AI quality analysis (Layer 35)
- Badge qualification logic
- Achievement tracking system

**ESA Layers:** Layer 27 (Analytics), Layer 25 (Gamification), Layer 35 (AI Agents)

**Note:** Core bidirectional review system implemented in Journey 6

---

### 🔍 Journey 19: Admin Booking Oversight Dashboard
**Target:** June 2026  
**Priority:** Medium  
**User Type:** Admin

**Features:**
- Platform-wide booking dashboard (all bookings)
- Automated fraud detection with AI
- Dispute mediation tools and workflows
- Refund processing approval system
- Compliance monitoring (regulations, policies)
- Revenue analytics and reporting
- User behavior pattern analysis

**Technical Requirements:**
- Admin analytics dashboard
- Fraud detection algorithms (AI-powered)
- Dispute management system
- Compliance tracking tools

**ESA Layers:** Layer 21 (User Management), Layer 49 (Security), Layer 27 (Analytics)

**Note:** Core moderation tools implemented in Journey 18

---

## Implementation Dependencies

### Prerequisites (Already Complete)
- ✅ Database schema (PostgreSQL + Drizzle ORM)
- ✅ Authentication & Authorization (JWT, RBAC)
- ✅ Payment infrastructure (Stripe)
- ✅ Real-time communication (Socket.io)
- ✅ File upload system (Multer, Cloudinary)
- ✅ Aurora Tide Design System

### Required Infrastructure Enhancements
- 🔧 **Messaging System:** Real-time chat with persistence (Journey 9)
- 🔧 **Payout Engine:** Stripe Connect integration (Journey 16)
- 🔧 **Analytics Platform:** Advanced data aggregation (Journeys 13, 19)
- 🔧 **AI Services:** Fraud detection, sentiment analysis (Journeys 8, 15, 19)
- 🔧 **Notification System:** Enhanced alerts for all features

---

## Aurora Tide Design Compliance

All coming soon features will implement full Aurora Tide design system standards:

### Required Components
- ✅ **GlassCard** (depth 1-4) for all containers
- ✅ **GSAP Scroll Animations** (useScrollReveal)
- ✅ **Framer Motion** (FadeIn, ScaleIn, StaggerContainer)
- ✅ **Micro-interactions** (MagneticButton, PulseButton, RippleCard)
- ✅ **MT Ocean Theme** gradients (cyan→teal→blue)
- ✅ **Dark Mode** support with theme variants
- ✅ **i18next Translations** (73 languages)
- ✅ **data-testid** attributes (100% coverage)

### Estimated Translation Keys
- Journey 5: +15 keys
- Journey 7: +12 keys
- Journey 8: +25 keys
- Journey 9: +30 keys
- Journey 13: +40 keys
- Journey 15: +20 keys
- Journey 16: +50 keys
- Journey 19: +35 keys

**Total:** ~227 new translation keys across 8 journeys

---

## Success Metrics

### After Q1 2026 (4 Journeys Complete)
- ✅ 13/19 journeys complete (68%)
- ✅ Host payout system operational
- ✅ Guest-host messaging enabled
- ✅ Booking modifications functional
- ✅ Host analytics dashboard live

### After Q2 2026 (All 8 Journeys Complete)
- ✅ 17/19 journeys complete (89%)
- ✅ Favorites/wishlists operational
- ✅ Dispute resolution system active
- ✅ Superhost badge program launched
- ✅ Admin oversight dashboard complete

### Final Platform Status (19/19 Complete)
- ✅ 100% housing marketplace functionality
- ✅ Full guest/host experience
- ✅ Comprehensive admin tools
- ✅ Aurora Tide compliance across all journeys
- ✅ Ready for production launch

---

## Priority Considerations

### Critical Revenue Paths
1. **Journey 16 (Payout Management)** - Enables host earnings (Q1 2026)
2. **Journey 9 (Communication Hub)** - Improves booking conversion (Q1 2026)

### User Experience Enhancements
3. **Journey 13 (Host Analytics)** - Host retention tool (Q1 2026)
4. **Journey 5 (Modifications)** - Guest flexibility (Q1 2026)

### Platform Growth Features
5. **Journey 15 (Reputation)** - Quality improvement (Q2 2026)
6. **Journey 8 (Conflict Resolution)** - Trust & safety (Q2 2026)
7. **Journey 7 (Favorites)** - User engagement (Q2 2026)
8. **Journey 19 (Admin Oversight)** - Platform governance (Q2 2026)

---

## Related Documentation

- [Customer Journey Matrix](./customer-journey-matrix.md) - Complete journey overview
- [Housing Marketplace Index](./index.md) - Main housing documentation
- [Aurora Tide Design System](../design-systems/aurora-tide.md) - Design standards
- [ESA Master Orchestration](../../ESA_MASTER_ORCHESTRATION.md) - Framework guide

---

**Last Review:** October 6, 2025  
**Next Update:** Upon Journey 6 & 18 completion  
**Contact:** Housing Product Team
