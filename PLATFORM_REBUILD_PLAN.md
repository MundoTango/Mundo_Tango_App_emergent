# Mundo Tango - Complete Platform Rebuild Plan
## MB.MD Methodology: Memories Feed → Spiral Outward Following Customer Journeys

**Started**: October 17, 2025
**Strategy**: Start from core (Memories Feed), spiral outward following customer journey maps
**Goal**: Fully connected platform with seamless page transitions and backend integration

---

## Executive Strategy

### Core Philosophy: "Spiral Outward from the Heart"

```
                  MEMORIES FEED (P10)
                        ↓
           ┌────────────┼────────────┐
           │            │            │
    Marketing ← → Login/Register → Profile
           │            │            │
    Events ← → → → → Groups → → → Friends
           │            │            │
    Messages ← → Settings → → Notifications
```

**Why Start with Memories Feed (P10)?**
- Central hub of the application
- Users spend 60% of their time here
- Integrates with all major features (events, groups, posts, friends)
- Real-time capabilities showcase platform power
- Natural testing ground for authentication flow

---

## Phase 0: Customer Journey Mapping

### Journey J1: New User Journey (Marketing → Registration → Memories Feed)

```
Step 1: Marketing/Landing Page (unauthenticated)
  ├─ Agent P8 (Welcome/Marketing Page)
  ├─ Beautiful hero section with tango imagery
  ├─ Value propositions (find events, connect, share memories)
  ├─ Clear CTAs: "Sign Up" | "Log In"
  └─ SEO optimized (Agent #55)

Step 2: Registration Flow (NEW - moving away from Replit auth)
  ├─ Agent P2 (Register Page)
  ├─ Email/password registration
  ├─ OR OAuth options (Google, Facebook)
  ├─ Email verification flow
  ├─ Basic profile setup (name, city, tango role)
  └─ Direct to onboarding

Step 3: Onboarding Experience
  ├─ Agent P3 (Onboarding)  
  ├─ Welcome tour (Shepherd.js)
  ├─ Profile completion wizard
  ├─ Interest selection (events, groups, friends)
  ├─ Location setup
  └─ → REDIRECT TO MEMORIES FEED

Step 4: First Memories Feed Experience
  ├─ Agent P10 (Home Feed)
  ├─ Empty state with suggested actions
  ├─ "Create your first memory" prompt
  ├─ Discover nearby events
  ├─ Find tango friends in your city
  └─ SUCCESS - User activated!
```

### Journey J2: Returning User Journey (Login → Memories Feed)

```
Step 1: Login Page
  ├─ Agent P1 (Login Page)
  ├─ Email/password login
  ├─ OR OAuth options
  ├─ "Forgot password" flow
  ├─ Remember me checkbox
  └─ Session management (JWT)

Step 2: Authenticated Redirect
  ├─ Check last visited page
  ├─ Default: Memories Feed (P10)
  ├─ Load user context (Agent #77 Context Detection)
  └─ Initialize real-time connections

Step 3: Memories Feed (Active State)
  ├─ Agent P10 with full data
  ├─ Recent posts from friends
  ├─ Upcoming events sidebar
  ├─ Real-time notifications
  ├─ Quick action buttons (post, event, check-in)
  └─ Personalized recommendations
```

### Journey J3: Power User Journey (Cross-Feature Navigation)

```
Memories Feed → Events → Group → Friends → Messages → Back to Feed

Agent P10 (Feed) → Agent P11 (Events List) → Agent P16 (Group Detail)  
→ Agent P21 (Friends) → Agent P26 (Messages) → Agent P10 (Feed)

**Testing Requirements:**
- Navigation preserves state
- Back button works correctly
- Real-time updates persist across pages
- Authentication maintained
- Notifications follow user
```

### Journey J4: Super Admin Journey (Admin Operations)

```
Memories Feed → Admin Dashboard → User Management → Analytics → Back to Feed

Agent P10 → Agent P43 (Admin Dashboard) → Agent P36 (User Mgmt)  
→ Agent P41 (Analytics) → Agent P10

**Special Considerations:**
- Visual Editor (Agent #78) available ONLY for super admin
- Mr Blue (#73) joins forces with CEO (#0)
- Advanced monitoring dashboards
- System health metrics
```

---

## Phase 1: Core Foundation - Memories Feed (Week 1)

### Priority 1.1: Backend API (Agent #2 API Development)

**Endpoint Development:**
```typescript
// Memory/Post endpoints (Agent #2 + Layer 24)
GET    /api/posts                    // List posts with pagination
GET    /api/posts/:id                // Get single post
POST   /api/posts                    // Create post
PATCH  /api/posts/:id                // Update post
DELETE /api/posts/:id                // Delete post
POST   /api/posts/:id/like           // Like post
DELETE /api/posts/:id/like           // Unlike post
POST   /api/posts/:id/comments       // Add comment
GET    /api/posts/:id/comments       // Get comments

// Real-time endpoints (Agent #4 + Layer 11)
WS     /api/socket.io                // Socket.io connection
EVENT  post:created                  // New post broadcast
EVENT  post:liked                    // Like notification
EVENT  comment:added                 // Comment notification
```

**Agent Coordination:**
- **Agent #2 (API Development)**: Create RESTful endpoints
- **Layer 24 (Post Management)**: Business logic for posts
- **Agent #1 (Database)**: Optimize queries, add indexes
- **Agent #4 (Real-time)**: WebSocket event handlers
- **Agent #49 (Security)**: Validate auth, RBAC, ABAC

### Priority 1.2: Database Schema (Agent #1 Database)

**Schema Validation:**
```sql
-- Verify posts table structure (DO NOT change ID types!)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts';

-- Required indexes (Agent #1)
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_privacy ON posts(privacy);
```

**Agent Communication:**
```
Agent #1 (Database) → Check existing schema
Agent #1 → Notify Agent #2 of schema structure
Agent #2 (API) → Build endpoints matching schema
Agent #66 (Code Review) → Validate schema queries
```

### Priority 1.3: Frontend Component (Agent #8 Frontend + P10)

**Component Architecture:**
```typescript
// Page Agent P10 coordinates these components:
<MemoriesFeedPage>                    // Agent P10
  <Sidebar>                           // Agent #11 (UI/UX)
    <UserProfileCard />               // Agent P4 component
    <GlobalStatistics />              // Agent #12 (Data Viz)
  </Sidebar>
  
  <MainFeed>                          // Agent P10 + #8
    <CreatePostBox />                 // Agent #13 (Content/Media)
    <PostList>
      <PostCard />                    // Agent #11 (UI/UX)
      <LikeButton />                  // Agent #8 (Frontend)
      <CommentSection />              // Agent #8 (Frontend)
    </PostList>
  </MainFeed>
  
  <EventsSidebar>                     // Agent P11 component
    <UpcomingEvents />                // Agent #12 (Data Viz)
  </EventsSidebar>
</MemoriesFeedPage>
```

**Agent Responsibilities:**
- **Agent P10 (Page Agent)**: Overall page orchestration
- **Agent #8 (Frontend)**: React component implementation
- **Agent #11 (UI/UX)**: Design system compliance (MT Ocean theme)
- **Agent #12 (Data Viz)**: Statistics and charts
- **Agent #13 (Content/Media)**: Media upload and display

### Priority 1.4: Real-Time Integration (Agent #4 + Layer 11)

**WebSocket Events:**
```typescript
// Real-time updates coordinated by Agent #4
socket.on('post:created', (post) => {
  // Add to feed in real-time
  queryClient.invalidateQueries(['/api/posts']);
});

socket.on('post:liked', ({ postId, userId }) => {
  // Update like count immediately
  updatePostInCache(postId, { likes: likes + 1 });
});

socket.on('comment:added', ({ postId, comment }) => {
  // Append comment to post
  addCommentToPost(postId, comment);
});
```

**Agent Coordination:**
- **Agent #4 (Real-time)**: Socket.io server configuration
- **Layer 11**: Event handlers and broadcasting
- **Agent #8 (Frontend)**: Socket.io client integration
- **Agent #48 (Performance)**: Monitor WebSocket latency

---

## Phase 2: Authentication Flow (Week 1-2)

### Priority 2.1: Marketing/Landing Page (Agent P8)

**New Landing Page Design:**
```
Hero Section:
- Headline: "Connect with the Global Tango Community"
- Subheadline: "Share memories, discover events, find dance partners"
- CTA Buttons: [Sign Up Free] [Log In]
- Hero image: Beautiful tango couple dancing

Features Section:
- 🎭 Share tango memories and moments
- 📅 Discover milongas and festivals
- 👥 Connect with dancers worldwide
- 🗺️ Map of tango events near you

Social Proof:
- "Join 3,200+ tango dancers worldwide"
- Featured events and communities

Footer:
- Links: About, Privacy, Terms, Contact
- Social media links
```

**Agent Responsibilities:**
- **Agent P8 (Welcome Page)**: Page implementation
- **Agent #11 (UI/UX)**: Landing page design
- **Agent #55 (SEO)**: Meta tags, Open Graph, structured data
- **Agent #13 (Content/Media)**: Hero images and videos

### Priority 2.2: Registration Flow (Agent P2 + Layer 4)

**NEW: Moving Away from Replit Auth**

**Registration Options:**
```typescript
// Email/Password Registration (Agent P2 + Layer 4)
POST /api/auth/register
{
  email: string,
  password: string,
  name: string,
  city: string,
  tangoRole: 'leader' | 'follower' | 'both'
}

// OAuth Registration (Agent Layer 4)
GET /api/auth/google/callback
GET /api/auth/facebook/callback

// Email Verification (Agent Layer 4)
GET /api/auth/verify-email/:token
POST /api/auth/resend-verification
```

**Agent Coordination:**
- **Agent P2 (Register Page)**: Registration UI
- **Layer 4 (Authentication System)**: Auth logic, password hashing
- **Agent #49 (Security)**: Validate security requirements
- **Email Service Agent**: Send verification emails
- **Agent #1 (Database)**: Store user records

**Security Requirements (Agent #49):**
- Password: Min 8 chars, uppercase, lowercase, number
- Email validation: RFC 5322 compliant
- Rate limiting: 5 registration attempts per hour per IP
- CSRF protection
- Honeypot field for bot detection

### Priority 2.3: Login Flow (Agent P1 + Layer 4)

**Login Implementation:**
```typescript
// Email/Password Login
POST /api/auth/login
{
  email: string,
  password: string,
  rememberMe: boolean
}

// OAuth Login
GET /api/auth/google
GET /api/auth/facebook

// Password Reset
POST /api/auth/forgot-password    // Send reset email
POST /api/auth/reset-password     // Reset with token

// Session Management
POST /api/auth/refresh             // Refresh JWT token
POST /api/auth/logout              // Invalidate session
```

**Agent Coordination:**
- **Agent P1 (Login Page)**: Login UI
- **Layer 4 (Authentication)**: JWT generation, session management
- **Agent #49 (Security)**: Auth validation, rate limiting
- **Agent #77 (Context Detection)**: Redirect logic after login

### Priority 2.4: Onboarding (Agent P3)

**Onboarding Flow:**
```
Step 1: Welcome Screen
  - "Welcome to Mundo Tango, [Name]!"
  - Profile photo upload (Agent #13)
  
Step 2: Profile Completion
  - Tango role: Leader, Follower, Both
  - Experience level: Beginner, Intermediate, Advanced
  - Favorite styles: Tango, Vals, Milonga
  
Step 3: Location Setup
  - City (autocomplete with Google Maps)
  - Join your city's tango group automatically
  
Step 4: Interest Selection
  - Follow topics: Events, Milongas, Workshops, Festivals
  - Discover nearby dancers
  
Step 5: Interactive Tour (Shepherd.js)
  - "Create your first memory"
  - "Discover events near you"
  - "Find tango friends"
  
→ REDIRECT TO MEMORIES FEED
```

**Agent Coordination:**
- **Agent P3 (Onboarding)**: Onboarding wizard
- **Agent P4 (Profile)**: Profile completion logic
- **Interactive Tour Agent**: Shepherd.js tour
- **Agent #22 (Group Management)**: Auto-assign city group
- **Agent #77 (Context)**: Track onboarding completion

---

## Phase 3: Spiral Outward - Events & Groups (Week 2-3)

### Events Pages (Agents P11-P15)

**Page Agent Assignments:**
- **P11**: Events List/Discovery Page
- **P12**: Event Detail Page
- **P13**: Create Event Page
- **P14**: Edit Event Page
- **P15**: Event Calendar View

**Backend Coordination:**
- **Layer 23 (Event Management)**: Event CRUD logic
- **Agent #2 (API)**: Event endpoints
- **Agent #4 (Real-time)**: RSVP notifications

**Navigation Flow:**
```
Memories Feed (P10) → "Upcoming Events" sidebar click →
Events List (P11) → Event card click →
Event Detail (P12) → "RSVP" button →
Notification (real-time) → Back to Feed (P10)
```

### Groups Pages (Agents P16-P20)

**Page Agent Assignments:**
- **P16**: Groups List Page
- **P17**: Group Detail Page
- **P18**: Create Group Page
- **P19**: Group Management Page
- **P20**: Group Discovery Page

**Backend Coordination:**
- **Layer 22 (Group Management)**: Group CRUD
- **Agent #2 (API)**: Group endpoints
- **Agent #4 (Real-time)**: Group chat, member updates

---

## Phase 4: Social Features (Week 3-4)

### Friends & Messaging

**Page Agent Assignments:**
- **P21-P25**: Friends pages (list, requests, suggestions, mutual, search)
- **P26-P30**: Messages pages (inbox, conversation, compose, archive, search)

**Real-Time Requirements:**
- Typing indicators (Agent #4)
- Message delivery receipts
- Online/offline status
- Notification badges

---

## Agent Communication Protocol

### Pattern 1: Page Development

```
Step 1: Page Agent (e.g., P10) → Requests UI design
  ↓
Step 2: Agent #11 (UI/UX) → Provides design spec (MT Ocean theme)
  ↓
Step 3: Agent #8 (Frontend) → Implements React components
  ↓
Step 4: Page Agent → Requests API integration
  ↓
Step 5: Agent #2 (API) → Confirms endpoints available
  ↓
Step 6: Agent #1 (Database) → Validates schema supports queries
  ↓
Step 7: Agent #66 (Code Review) → Reviews implementation
  ↓
Step 8: Agent #0 (CEO) → Approves page for production
```

### Pattern 2: Feature Integration

```
Frontend Agent → Backend Agent → Database Agent → Security Agent → Review Agent → CEO

Example: Adding "Like" feature
  Agent P10 (Page) → "Need like button on posts"
  Agent #11 (UI/UX) → Design like button component
  Agent #8 (Frontend) → Implement like button + optimistic update
  Agent #2 (API) → Create POST /api/posts/:id/like endpoint
  Agent #1 (Database) → Add like count column, create likes table
  Agent #4 (Real-time) → Broadcast like events
  Agent #49 (Security) → Validate user can like
  Agent #66 (Code Review) → Review all changes
  Agent #0 (CEO) → Approve feature
```

### Pattern 3: Cross-Page Navigation

```
Page Agent (source) → Agent #77 (Context Detection) → Page Agent (destination)

Example: Navigate from Feed to Event Detail
  Agent P10 (Memories Feed) → User clicks event card
  Agent #77 (Context) → Detects navigation intent
  Agent #77 → Preserves context (scroll position, filters)
  Agent P12 (Event Detail) → Receives context
  Agent P12 → Loads event data
  Agent P12 → Renders with context
```

---

## Testing Strategy

### Test Flow: Complete Customer Journey

**J1: New User Journey Test (Automated with Playwright)**
```typescript
// Test orchestrated by Agent #51 (Testing Framework)
test('New user complete journey', async ({ page }) => {
  // Step 1: Marketing page
  await page.goto('/');
  expect(await page.textContent('h1')).toContain('Connect with');
  
  // Step 2: Registration
  await page.click('[data-testid="button-signup"]');
  await page.fill('[data-testid="input-email"]', 'newuser@test.com');
  await page.fill('[data-testid="input-password"]', 'SecurePass123');
  await page.click('[data-testid="button-register"]');
  
  // Step 3: Email verification (mock)
  // ... verify email flow
  
  // Step 4: Onboarding
  await expect(page).toHaveURL('/onboarding');
  await page.fill('[data-testid="input-name"]', 'Test User');
  await page.selectOption('[data-testid="select-role"]', 'both');
  await page.click('[data-testid="button-next"]');
  
  // Step 5: Memories Feed
  await expect(page).toHaveURL('/');
  expect(await page.isVisible('[data-testid="feed-container"]')).toBe(true);
  expect(await page.isVisible('[data-testid="create-post-box"]')).toBe(true);
  
  // Success!
});
```

**Agent Coordination for Testing:**
- **Agent #51 (Testing Framework)**: Write and execute tests
- **Agent #66 (Code Review)**: Validate test coverage
- **Agent #48 (Performance)**: Monitor test execution time
- **Agent #0 (CEO)**: Approve test strategy

---

## Agent Assignments Summary

### Leadership Agents
- **Agent #0 (CEO)**: Overall platform rebuild approval, milestone sign-offs
- **Agent #66 (Code Review)**: Review all code changes
- **Agent #64 (Documentation)**: Document all new features

### Page Agents (125+)
- **P1**: Login Page
- **P2**: Register Page
- **P3**: Onboarding Page
- **P4**: Profile Page
- **P5**: Settings Page
- **P8**: Marketing/Landing Page
- **P10**: Memories Feed (CORE - Start Here)
- **P11-P15**: Events pages
- **P16-P20**: Groups pages
- **P21-P25**: Friends pages
- **P26-P30**: Messages pages
- **P43**: Admin Dashboard
- *...and 95+ more page agents*

### Infrastructure Agents (61 ESA Layers)
- **Agent #1 (Database)**: Schema validation, query optimization
- **Agent #2 (API)**: RESTful endpoint development
- **Agent #4 (Real-time)**: WebSocket events
- **Layer 4 (Auth)**: NEW auth system (moving away from Replit)
- **Agent #8 (Frontend)**: React components
- **Agent #11 (UI/UX)**: MT Ocean theme, design system
- **Agent #13 (Content/Media)**: File uploads, media processing
- **Agent #48 (Performance)**: Monitoring, optimization
- **Agent #49 (Security)**: Security validation
- **Agent #51 (Testing)**: Test suite

### Supporting Agents
- **Agent #77 (Context Detection)**: Navigation and context management
- **Email Service Agent**: Verification and notification emails
- **Algorithm A1-A10+**: Feed ranking, recommendations, search

---

## Success Metrics

### Phase Completion Criteria

**Phase 1 Complete When:**
- ✅ Memories Feed loads with real data
- ✅ Create post works (text + images)
- ✅ Like/comment functionality works
- ✅ Real-time updates propagate
- ✅ Performance: <2s page load, <200ms API

**Phase 2 Complete When:**
- ✅ Marketing page live and SEO optimized
- ✅ Registration works (email + OAuth)
- ✅ Email verification functional
- ✅ Login works (email + OAuth)
- ✅ Onboarding wizard complete
- ✅ User redirected to Memories Feed after onboarding

**Phase 3 Complete When:**
- ✅ All event pages functional
- ✅ All group pages functional
- ✅ Navigation between pages seamless
- ✅ Real-time updates across pages

**Phase 4 Complete When:**
- ✅ Friends system operational
- ✅ Messaging system with real-time
- ✅ All 125+ pages connected
- ✅ Complete customer journey test passes

---

## Next Steps: Kickoff Meeting

**Agent Kickoff Coordination:**

1. **Agent #0 (CEO)** calls meeting with all agents
2. Each agent confirms:
   - ✅ Understands their role
   - ✅ Knows which agents to coordinate with
   - ✅ Has access to necessary resources
   - ✅ Ready to begin work

3. **Communication Channels Established:**
   - Page Agents → Frontend Agent (#8)
   - Frontend Agent → API Agent (#2)
   - API Agent → Database Agent (#1)
   - All → Security Agent (#49)
   - All → Code Review (#66)
   - All → CEO (#0) for escalations

4. **Start Signal:**
   - Agent #0 gives "GO" signal
   - Agent P10 (Memories Feed) begins implementation
   - All supporting agents stand ready

---

*Platform Rebuild Plan prepared by Agent #0 (CEO)*
*Coordinated by Agent #50 (DevOps), Agent #64 (Documentation)*
*Ready to execute: October 17, 2025*
*No Agent Left Behind™ - Every agent has a role, every page will shine*
