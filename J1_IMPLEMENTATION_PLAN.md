# J1 - FIRST-TIME VISITOR JOURNEY - IMPLEMENTATION PLAN

**Date**: October 18, 2025  
**Status**: Planning Complete, Ready to Build  
**Methodology**: MB.MD (Research → Plan → Build)

---

## 🎯 **GOAL**

Convert **anonymous visitors** to **registered users** through a compelling journey:

```
Visitor lands → Discovers content → Learns about platform → Joins community
```

**Success Metrics**:
- **Conversion rate**: >15% (visitor → signup)
- **Time to signup**: <5 minutes
- **Bounce rate**: <40%
- **Lighthouse score**: >90

---

## 📊 **MB.MD RESEARCH FINDINGS**

### **Current State**:
✅ `landing.tsx` exists BUT serves **authenticated users** only  
✅ MT Ocean theme ready (#5EEAD4 → #155E75 gradients)  
✅ Authentication working (Replit OAuth + manual signup)  
✅ Database + API ready  
❌ No visitor-facing pages exist  
❌ No `/discover`, `/about`, `/join` pages  

### **What We're Building** (4 NEW pages):
1. **Landing (Visitor)** - First impression, value prop
2. **Discover** - Public content browsing
3. **About** - Trust building, mission, team
4. **Join** - Conversion point (signup/volunteer)

---

## 🏗️ **BUILD STRATEGY**

### **Approach**: Component Reuse + Rapid Iteration

**Don't**: Build everything from scratch  
**Do**: Reuse existing components (Cards, Buttons, Forms from shadcn)

**Don't**: Perfect design on first try  
**Do**: Build working flow → test → refine

---

## 📄 **PAGE 1: LANDING (VISITOR)**

### **Route**: `/` (when NOT authenticated)
### **Agent**: P1 (Landing Page Agent)
### **File**: `client/src/pages/landing-visitor.tsx`

### **Layout**:
```
┌─────────────────────────────────────┐
│ Navbar: Logo | Discover | About | Join│
├─────────────────────────────────────┤
│                                     │
│  HERO SECTION                       │
│  - Tango couple image (background)  │
│  - "Connect with tangueros          │
│     worldwide" headline             │
│  - "Join Now" + "Discover" CTAs     │
│                                     │
├─────────────────────────────────────┤
│  VALUE PROPS (3 columns)            │
│  [Connect] [Discover] [Grow]        │
├─────────────────────────────────────┤
│  FEATURED EVENTS (carousel)         │
│  - Next 5 public events             │
├─────────────────────────────────────┤
│  SOCIAL PROOF                       │
│  - "2,500+ dancers" stats           │
│  - "150+ cities" stats              │
├─────────────────────────────────────┤
│  FOOTER                             │
│  - Links | GitHub | GoFundMe        │
└─────────────────────────────────────┘
```

### **Components to Build**:
- [ ] `VisitorNavbar` - Sticky navbar with Discover/About/Join links
- [ ] `HeroSection` - Large headline + background image + CTAs
- [ ] `ValuePropsGrid` - 3-column feature cards
- [ ] `FeaturedEventsCarousel` - Display 5 upcoming public events
- [ ] `SocialProofStats` - User/event/city counts
- [ ] `VisitorFooter` - Links + social + donate

### **API Calls**:
- `GET /api/events?public=true&limit=5` - Featured events
- `GET /api/stats/public` - User/event/city counts

### **Styling**:
- MT Ocean gradient background (`from-turquoise-50 to-cyan-50`)
- Glassmorphic cards (`backdrop-blur-sm`)
- Teal/cyan accent colors (#5EEAD4, #155E75)

---

## 📄 **PAGE 2: DISCOVER**

### **Route**: `/discover`
### **Agent**: P2 (Discover Page Agent)
### **File**: `client/src/pages/discover.tsx`

### **Layout**:
```
┌─────────────────────────────────────┐
│ Navbar: Logo | Discover | About | Join│
├─────────────────────────────────────┤
│ SEARCH BAR + FILTERS                │
│ [Search...] [City ▼] [Type ▼]      │
├─────────────────────────────────────┤
│ 2-COLUMN LAYOUT:                    │
│                                     │
│ LEFT: PUBLIC EVENTS FEED            │
│ - Event cards (upcoming)            │
│ - "Join to see more" prompt         │
│                                     │
│ RIGHT: PUBLIC MEMORIES FEED         │
│ - Memory cards (recent)             │
│ - "Join to see more" prompt         │
│                                     │
└─────────────────────────────────────┘
```

### **Components to Build**:
- [ ] `DiscoverSearchBar` - Search + city/type filters
- [ ] `PublicEventsFeed` - Event cards for non-auth users
- [ ] `PublicMemoriesFeed` - Memory cards for non-auth users
- [ ] `JoinPromptBanner` - "Join to see more" CTA

### **API Calls**:
- `GET /api/events?public=true&limit=20` - Public events
- `GET /api/memories?public=true&limit=20` - Public memories
- `GET /api/cities` - City list for filter

### **Styling**:
- 2-column grid (`grid-cols-1 lg:grid-cols-2`)
- Infinite scroll OR pagination
- Skeleton loaders while fetching

---

## 📄 **PAGE 3: ABOUT**

### **Route**: `/about`
### **Agent**: P3 (About Page Agent)
### **File**: `client/src/pages/about.tsx`

### **Layout**:
```
┌─────────────────────────────────────┐
│ Navbar: Logo | Discover | About | Join│
├─────────────────────────────────────┤
│ MISSION STATEMENT                   │
│ "Building the world's largest       │
│  tango community..."                │
├─────────────────────────────────────┤
│ HOW IT WORKS (3 steps)              │
│ [1. Sign up] → [2. Connect] →       │
│ [3. Dance]                          │
├─────────────────────────────────────┤
│ STATS SECTION                       │
│ - Users | Events | Cities |         │
│   Countries                         │
├─────────────────────────────────────┤
│ TEAM SECTION                        │
│ - Founder profile                   │
│ - Contributors                      │
├─────────────────────────────────────┤
│ OPEN SOURCE INFO                    │
│ - GitHub link                       │
│ - "Become a contributor" CTA        │
│ - GoFundMe donate link              │
└─────────────────────────────────────┘
```

### **Components to Build**:
- [ ] `MissionStatement` - Hero section with mission
- [ ] `HowItWorksSteps` - 3-step process
- [ ] `PlatformStats` - Animated stats counters
- [ ] `TeamSection` - Founder + contributors
- [ ] `OpenSourceSection` - GitHub + volunteer info

### **API Calls**:
- `GET /api/stats/public` - Platform statistics

### **Styling**:
- Single column, centered max-width (800px)
- Large typography for mission
- Card-based sections

---

## 📄 **PAGE 4: JOIN**

### **Route**: `/join`
### **Agent**: P4 (Join Page Agent)
### **File**: `client/src/pages/join.tsx`

### **Layout**:
```
┌─────────────────────────────────────┐
│ Navbar: Logo | Discover | About | Join│
├─────────────────────────────────────┤
│ 2-PATH DECISION                     │
│                                     │
│ ┌──────────────┐  ┌───────────────┐│
│ │ JOIN AS USER │  │ VOLUNTEER     ││
│ │              │  │               ││
│ │ [Signup Form]│  │ [Learn More]  ││
│ └──────────────┘  └───────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### **Components to Build**:
- [ ] `JoinPathSelector` - 2 cards: "Join" vs "Volunteer"
- [ ] `SignupForm` - Email, password, confirm password
- [ ] `ReplitOAuthButton` - "Sign in with Replit"
- [ ] `BenefitsList` - Why join Mundo Tango
- [ ] `VolunteerRedirect` - Link to Talent Match (J7)

### **API Calls**:
- `POST /api/auth/register` - Create new user
- `GET /api/auth/replit` - Replit OAuth flow

### **Form Validation**:
- Email format validation
- Password strength (8+ chars)
- Password confirmation match
- Already exists check

### **Redirect Logic**:
- After signup → `/onboarding` (J2 starts)
- "Volunteer" → `/volunteer` (J7 starts)

---

## 🔀 **ROUTING UPDATES**

### **App.tsx Changes**:

```typescript
// Add auth guard for visitor pages
const VisitorRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Redirect to="/memories" />;
  }
  return children;
};

// Routes:
<Route path="/">
  <VisitorRoute>
    <LandingVisitor />
  </VisitorRoute>
</Route>

<Route path="/discover">
  <VisitorRoute>
    <Discover />
  </VisitorRoute>
</Route>

<Route path="/about">
  <About />  {/* Can be viewed by anyone */}
</Route>

<Route path="/join">
  <VisitorRoute>
    <Join />
  </VisitorRoute>
</Route>

<Route path="/landing">
  {/* Keep existing authenticated landing */}
  <Landing />
</Route>
```

---

## 🎨 **DESIGN SYSTEM**

### **MT Ocean Theme**:
- **Primary**: Teal/Cyan gradients (#5EEAD4 → #155E75)
- **Backgrounds**: `from-turquoise-50 to-cyan-50`
- **Glassmorphic**: `backdrop-blur-sm` + `bg-white/80`
- **Shadows**: `shadow-lg` for cards

### **Typography**:
- **Headlines**: `text-4xl font-bold` with gradient text
- **Body**: `text-gray-700` dark mode: `dark:text-gray-300`
- **CTAs**: `text-lg font-semibold`

### **Buttons**:
- **Primary**: Teal gradient (`from-turquoise-500 to-cyan-600`)
- **Secondary**: Outline with teal border
- **Hover**: `-translate-y-1` animation

---

## 🧪 **TESTING CHECKLIST**

### **Flow Testing**:
- [ ] Visit `/` → See landing (not authenticated)
- [ ] Click "Discover" → Browse public content
- [ ] Click "About" → Read mission/team
- [ ] Click "Join" → See signup form
- [ ] Submit signup → Redirect to `/onboarding`
- [ ] Click "Volunteer" → Redirect to `/volunteer`

### **Responsive Testing**:
- [ ] Mobile (375px) - All pages responsive
- [ ] Tablet (768px) - Grid layouts work
- [ ] Desktop (1440px) - Max width enforced

### **Performance Testing**:
- [ ] Lighthouse score >90
- [ ] First Contentful Paint <1.5s
- [ ] Time to Interactive <3s

### **Accessibility**:
- [ ] All images have alt text
- [ ] Forms have labels
- [ ] Color contrast WCAG AA
- [ ] Keyboard navigation works

---

## 📦 **DELIVERABLES**

### **Files to Create** (8 total):
1. `client/src/pages/landing-visitor.tsx` - Landing (visitor)
2. `client/src/pages/discover.tsx` - Discover page
3. `client/src/pages/about.tsx` - About page
4. `client/src/pages/join.tsx` - Join page
5. `client/src/components/visitor/VisitorNavbar.tsx` - Shared navbar
6. `client/src/components/visitor/VisitorFooter.tsx` - Shared footer
7. `client/src/components/visitor/JoinPromptBanner.tsx` - CTA component
8. Updated `client/src/App.tsx` - Routing

### **API Endpoints to Create** (if missing):
- `GET /api/stats/public` - Platform statistics
- `GET /api/events?public=true` - Public events
- `GET /api/memories?public=true` - Public memories

---

## 🚀 **BUILD ORDER** (Recommended)

### **Day 1-2**: Core Structure
1. ✅ Create `VisitorNavbar` + `VisitorFooter`
2. ✅ Build `landing-visitor.tsx` (hero + value props)
3. ✅ Test routing + auth guard

### **Day 3-4**: Content Pages
4. ✅ Build `discover.tsx` (public feeds)
5. ✅ Build `about.tsx` (mission + team)

### **Day 5-6**: Conversion
6. ✅ Build `join.tsx` (signup form)
7. ✅ Test full flow visitor → signup

### **Day 7**: Polish + Ship
8. ✅ Mobile optimization
9. ✅ Performance testing (Lighthouse)
10. ✅ Git commit + tag `v1.1.0-j1-complete`

---

## ✅ **COMPLETION CRITERIA**

**J1 is complete when**:
- [ ] All 4 pages built and responsive
- [ ] Visitor can browse public content (Discover)
- [ ] Visitor can learn about platform (About)
- [ ] Visitor can signup (Join → creates account)
- [ ] Routing works with auth guards
- [ ] Mobile-optimized (all breakpoints)
- [ ] Lighthouse score >90
- [ ] No console errors
- [ ] Committed to GitHub with tag `v1.1.0-j1-complete`

---

## 🎯 **SUCCESS = CONVERSION**

**Target**: 15% of visitors create accounts  
**Measure**: Track "Visitor → Signup" funnel in PostHog  
**Optimize**: A/B test CTAs, hero copy, signup friction

---

**Ready to build!** 🚀

*Following MB.MD methodology: Research ✅ → Plan ✅ → Build [NEXT]*
