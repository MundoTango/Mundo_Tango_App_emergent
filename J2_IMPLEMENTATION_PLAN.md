# J2 - ACTIVE USER JOURNEY (DANCER) - IMPLEMENTATION PLAN

**Date**: October 18, 2025  
**Status**: Planning Phase  
**Methodology**: MB.MD (Research → Plan → Build)  
**Parallel Track**: Building alongside J1 completion

---

## 🎯 **GOAL**

Convert **new signups** into **active daily users** who engage with the platform:

```
Signup → Onboarding → Daily home feed → Post memories → RSVP events → Build network
```

**Success Metrics**:
- **DAU**: 30% (Daily Active Users)
- **Post creation rate**: 50% create content
- **Event RSVP rate**: 70% RSVP to discovered events
- **Avg friends**: 10+ per user
- **7-day retention**: 60% return after 7 days
- **Time to first post**: <10 minutes

---

## 📊 **MB.MD RESEARCH FINDINGS**

### **Current State** (from J2 agent analysis):
✅ **Existing pages**: `/profile`, `/events`, `/friends`, `/onboarding` already exist  
✅ **API working**: Posts, events, RSVPs, friendships all functional  
✅ **Real-time**: Socket.io working for live updates  
⚠️ **Partially built**: Pages need enhancement for J2 flow  
❌ **Missing**: Proper 3-column home feed layout  
❌ **Missing**: Streamlined onboarding wizard (6 steps)  
❌ **Missing**: Memory creation flow optimization

### **What Exists vs What Needs Building**:

| Component | Status | Action Needed |
|-----------|--------|---------------|
| `/onboarding` | ✅ EXISTS | Polish to 6-step wizard with progress |
| `/home` | ✅ EXISTS | Verify 3-column layout working |
| `/profile` | ✅ EXISTS | Verify multi-tab interface complete |
| `/events` | ✅ EXISTS | Add calendar toggle + better filters |
| `/memories` | ✅ EXISTS | Streamline creation flow |
| `/friends` | ✅ EXISTS | Add suggested friends algorithm |

---

## 🏗️ **BUILD STRATEGY**

### **Approach**: Journey-First Enhancement

**Phase 1** (Quick Win): Verify existing pages work for J2 flow  
**Phase 2** (Polish): Enhance each page based on J2 requirements  
**Phase 3** (Test): Run user flow end-to-end  
**Phase 4** (Optimize): Performance + mobile + analytics

**Don't**: Rebuild from scratch  
**Do**: Enhance what exists, fill gaps

---

## 📄 **J2 JOURNEY FLOW**

### **Step 1: User Completes Signup** (from J1 `/join`)
- **Entry**: User clicked "Get Started" on J1 `/join` page
- **Action**: Fill registration form (email, password, name)
- **Agent**: P2 (Register Page Agent)
- **File**: `client/src/pages/auth/register.tsx`
- **Exit**: → Redirect to `/onboarding`

### **Step 2: Onboarding Wizard** (6 steps to 100% profile)
- **Route**: `/onboarding`
- **Agent**: P6 (Onboarding Page Agent)
- **File**: `client/src/pages/onboarding.tsx`
- **Steps**:
  1. Welcome + profile photo upload
  2. Role selection (Dancer, Organizer, Teacher, DJ)
  3. Experience level (Beginner → Advanced)
  4. City autocomplete (auto-joins city group)
  5. Preferences (event types, notifications)
  6. Completion screen → "Start Exploring"
- **Success**: Profile 100% complete → redirect to `/home`

### **Step 3: Home Feed** (Daily engagement hub)
- **Route**: `/home`
- **Agent**: P7 (Home Feed Page Agent)
- **File**: `client/src/pages/home.tsx`
- **Layout**: 3-column design
  ```
  ┌─────────────────────────────────────────────┐
  │  LEFT          │   CENTER      │   RIGHT    │
  │  (Profile)     │   (Feed)      │  (Events)  │
  ├────────────────┼───────────────┼────────────┤
  │ • Mini profile │ • Create post │ • Upcoming │
  │ • Navigation   │ • Feed items  │   events   │
  │ • Quick stats  │ • Like/comment│ • Quick    │
  │                │ • Infinite    │   RSVP     │
  │                │   scroll      │            │
  └────────────────┴───────────────┴────────────┘
  ```
- **Features**:
  - Real-time updates (Socket.io)
  - Create post composer at top
  - Infinite scroll feed
  - Like/comment interactions
  - Quick RSVP to events
- **Success**: User sees relevant content, posts, engages

### **Step 4: Discover Events** (Find milongas)
- **Route**: `/events`
- **Agent**: P11 (Events Page Agent)
- **File**: `client/src/pages/EnhancedEvents.tsx`
- **Features**:
  - Calendar + List view toggle
  - City/date/type filters
  - Event cards with RSVP button
  - "Create Event" for organizers
  - Map view (Google Maps integration)
- **Success**: User finds events, RSVPs, marks calendar

### **Step 5: Create Memory** (Share experiences)
- **Route**: `/memories`
- **Agent**: P12 (Memories Page Agent)  
- **File**: `client/src/pages/ESAMemoryFeed.tsx`
- **Features**:
  - Text + media upload (photos/videos)
  - Location tagging
  - Privacy selector (public/friends/private)
  - AI enhance with GPT-4o
  - Hashtag extraction
- **Success**: User posts first memory within 10 minutes

### **Step 6: Build Network** (Connect with dancers)
- **Route**: `/friends`
- **Agent**: P20 (Friends Page Agent)
- **File**: `client/src/pages/EnhancedFriends.tsx`
- **Features**:
  - Friend list grid
  - Pending requests
  - Search + suggested friends
  - Activity feed
- **Success**: User reaches 10+ friends milestone

---

## ✅ **IMPLEMENTATION CHECKLIST**

### **Phase 1: Verify Core Flow** (1-2 hours)
- [ ] Test `/register` → `/onboarding` → `/home` redirect flow
- [ ] Verify `/onboarding` has 6 steps + progress bar
- [ ] Confirm `/home` uses 3-column layout
- [ ] Test post creation from home feed
- [ ] Verify events RSVP works
- [ ] Test memory creation flow
- [ ] Check friend request system

### **Phase 2: Polish Each Page** (4-6 hours)
- [ ] **Onboarding**: Add progress indicators, improve UX
- [ ] **Home**: Optimize feed loading, add skeleton states
- [ ] **Events**: Add calendar toggle, improve filters
- [ ] **Memories**: Streamline creation, test AI enhance
- [ ] **Profile**: Verify all 7 tabs work properly
- [ ] **Friends**: Add suggested friends algorithm

### **Phase 3: Test End-to-End** (1 hour)
- [ ] Run complete J2 flow as new user
- [ ] Test on mobile (responsive design)
- [ ] Verify real-time updates work (<500ms)
- [ ] Check performance (Lighthouse >90)
- [ ] Test with 10+ concurrent users

### **Phase 4: Analytics & Metrics** (1 hour)
- [ ] Track conversion funnel (signup → active user)
- [ ] Monitor DAU, post creation, RSVP rates
- [ ] Set up retention cohort analysis
- [ ] Add PostHog event tracking

---

## 🚀 **NEXT STEPS**

**Immediate** (while INFRA testing continues):
1. ✅ Research complete - J2 requirements documented
2. ⏳ Verify existing pages (onboarding, home, profile)
3. ⏳ Test complete user flow
4. ⏳ Identify gaps and enhancement needs

**Build Phase** (after INFRA fixes complete):
1. Polish onboarding wizard
2. Enhance home feed
3. Optimize memory creation
4. Test end-to-end
5. Deploy J2 v1.0

---

## 📈 **SUCCESS CRITERIA**

J2 is complete when:
- [x] Research done - requirements clear
- [ ] All 6 pages working smoothly
- [ ] User can complete full journey in <15 minutes
- [ ] Real-time updates work reliably
- [ ] Mobile responsive (all pages)
- [ ] Lighthouse score >90
- [ ] Metrics tracking active
- [ ] User testing validates flow

**Target**: J2 v1.0 launch by end of current session

---

*Updated: Oct 18, 2025 - Parallel track to INFRA provider testing*
