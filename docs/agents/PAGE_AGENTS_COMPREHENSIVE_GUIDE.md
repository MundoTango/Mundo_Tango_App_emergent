# Page Agents Comprehensive Guide (125 Agents)
**Division:** Frontend / UI Layer | **Methodology:** H2AC (Hook-Hierarchy-Action-Component)  
**Complexity:** Medium-High | **Version:** 1.0 | **Last Updated:** October 19, 2025

## Overview
Page Agents are frontend-specific agents that manage individual pages/routes in Mundo Tango. Each page agent implements the **H2AC methodology** (Hook-Hierarchy-Action-Component) for consistent, maintainable React code.

**Total Page Agents:** 125 (covering 97 pages, some pages have multiple sub-agents)

---

## H2AC Methodology

### **H - Hooks** (Data Fetching & State Management)
```typescript
// React Query hooks for server data
const { data: posts, isLoading } = useQuery({ queryKey: ['/api/posts'] });

// Local state hooks
const [selectedPost, setSelectedPost] = useState<Post | null>(null);

// Custom hooks
const { user } = useUser();
const socket = useSocket();
```

### **H - Hierarchy** (Component Structure)
```
HomePage
├── Header
│   ├── Logo
│   ├── Navigation
│   └── UserMenu
├── FeedContainer
│   ├── PostList
│   │   └── PostCard
│   │       ├── PostHeader
│   │       ├── PostContent
│   │       └── PostActions
│   └── InfiniteScroll
└── Sidebar
    ├── TrendingHashtags
    └── SuggestedUsers
```

### **A - Actions** (Event Handlers & Mutations)
```typescript
// Mutations
const createPostMutation = useMutation({
  mutationFn: (data) => apiRequest('/api/posts', { method: 'POST', body: data }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    toast.success('Post created!');
  },
});

// Event handlers
const handleSubmit = (data: InsertPost) => {
  createPostMutation.mutate(data);
};
```

### **C - Components** (Reusable UI Elements)
```typescript
// Use Shadcn UI components
import { Button, Card, Input, Form } from '@/components/ui';

// Custom components
import { PostCard } from '@/components/PostCard';
import { EventCard } from '@/components/EventCard';
```

---

## Category 1: Core Pages (20 agents)

### PA-001: Home Page Agent
**Route:** `/`  
**Responsibility:** Landing page, personalized feed, trending content  
**Key Features:** 
- Personalized feed (followed users + recommended posts)
- Trending hashtags sidebar
- Suggested users to follow
- Real-time updates (WebSocket)

**Implementation:**
```typescript
function HomePage() {
  const { user } = useUser();
  const { data: feed, isLoading } = useQuery({ queryKey: ['/api/feed'] });
  const { data: trending } = useQuery({ queryKey: ['/api/trending/hashtags'] });

  return (
    <PageLayout>
      <FeedContainer posts={feed} isLoading={isLoading} />
      <Sidebar trending={trending} />
    </PageLayout>
  );
}
```

### PA-002: Login Page Agent
**Route:** `/login`  
**Responsibility:** User authentication, OAuth integration  
**Key Features:**
- Email/password login
- Replit OAuth
- "Remember me" checkbox
- Redirect to previous page after login

### PA-003: Register Page Agent
**Route:** `/register`  
**Responsibility:** New user registration, validation  
**Key Features:**
- Multi-step form (email → profile → preferences)
- Zod validation
- Duplicate email checking
- Auto-login after registration

### PA-004: Profile Page Agent
**Route:** `/profile/:username`  
**Responsibility:** User profile display, edit mode  
**Key Features:**
- Profile information (bio, avatar, location)
- User's posts/events
- Follower/following counts
- Edit mode (own profile only)

### PA-005: Post List Page Agent
**Route:** `/posts`  
**Responsibility:** Browse all posts, filters, search  
**Key Features:**
- Infinite scroll pagination
- Filter by hashtag, privacy
- Search posts
- Sort by recency/popularity

### PA-006: Post Detail Page Agent
**Route:** `/posts/:id`  
**Responsibility:** Single post view, comments  
**Key Features:**
- Full post content
- Comment thread
- Like/share actions
- Related posts sidebar

### PA-007: Create Post Page Agent
**Route:** `/posts/new`  
**Responsibility:** Create new post/memory  
**Key Features:**
- Rich text editor
- Media upload (images/videos)
- Privacy controls
- Hashtag suggestions
- Location tagging

### PA-008: Event List Page Agent
**Route:** `/events`  
**Responsibility:** Browse tango events, filters  
**Key Features:**
- Calendar view / list view toggle
- Filter by city, date range, event type
- Map view (Google Maps integration)
- RSVP counts

### PA-009: Event Detail Page Agent
**Route:** `/events/:id`  
**Responsibility:** Single event view, RSVP management  
**Key Features:**
- Event details (time, location, description)
- RSVP button (going/maybe/not going)
- Attendee list
- Event organizer info
- Map with directions

### PA-010: Create Event Page Agent
**Route:** `/events/new`  
**Responsibility:** Create new tango event  
**Key Features:**
- Event form (title, description, date/time)
- Location picker (Google Maps autocomplete)
- Recurring event options
- Capacity limits
- Privacy settings

### PA-011-020: Additional Core Pages
- PA-011: Groups List Page
- PA-012: Group Detail Page
- PA-013: Create Group Page
- PA-014: Messages/Chat Page
- PA-015: Notifications Page
- PA-016: Settings Page
- PA-017: Search Results Page
- PA-018: User Followers Page
- PA-019: User Following Page
- PA-020: Edit Profile Page

---

## Category 2: Admin Pages (15 agents)

### PA-021: Admin Dashboard Agent
**Route:** `/admin`  
**Responsibility:** Admin overview, key metrics  
**Key Features:**
- User growth chart
- Content moderation queue
- System health metrics
- Quick actions

### PA-022: User Management Agent
**Route:** `/admin/users`  
**Responsibility:** Manage users, roles, permissions  
**Key Features:**
- User list with search
- Role assignment (admin/moderator/user)
- Ban/unban users
- View user activity

### PA-023: Content Moderation Agent
**Route:** `/admin/moderation`  
**Responsibility:** Review reported content  
**Key Features:**
- Report queue (prioritized)
- Approve/remove actions
- Moderator notes
- Report history

### PA-024-035: Additional Admin Pages
- PA-024: Analytics Dashboard
- PA-025: Featured Content Manager
- PA-026: System Settings
- PA-027: API Keys Management
- PA-028: Email Templates
- PA-029: Subscription Management
- PA-030: Payment History
- PA-031: Integration Status
- PA-032: Logs Viewer
- PA-033: Database Tools
- PA-034: Feature Flags
- PA-035: A/B Test Manager

---

## Category 3: Life CEO Pages (16 agents)

### PA-036: Life CEO Dashboard Agent
**Route:** `/lifeceo`  
**Responsibility:** Life CEO overview, 16 domain access  
**Key Features:**
- 16 domain cards (Finance, Health, Career, etc.)
- Goal tracking overview
- AI agent status
- Recent insights

### PA-037-051: Life CEO Domain Pages
- PA-037: Finance Agent Page
- PA-038: Health & Fitness Page
- PA-039: Career Development Page
- PA-040: Relationships Page
- PA-041: Learning & Education Page
- PA-042: Travel Planning Page (Tango-specific)
- PA-043: Time Management Page
- PA-044: Spiritual Growth Page
- PA-045: Creative Expression Page
- PA-046: Social Life Page
- PA-047: Family Page
- PA-048: Home & Environment Page
- PA-049: Hobbies & Interests Page
- PA-050: Personal Growth Page
- PA-051: Community Involvement Page

Each Life CEO page has:
- GPT-4o powered AI chat
- Goal setting interface
- Progress tracking
- Personalized recommendations
- Integration with tango activities

---

## Category 4: Mr Blue AI Pages (8 agents)

### PA-052: Mr Blue Chat Page Agent
**Route:** `/mrblue`  
**Responsibility:** Main AI chat interface  
**Key Features:**
- Streaming chat (GPT-4o)
- Conversation history
- 3D avatar (Three.js)
- Voice input (optional)

### PA-053-059: Mr Blue Feature Pages
- PA-053: Mr Blue Visual Editor Page (Replit-style IDE)
- PA-054: Mr Blue Agent Manager (927+ agents)
- PA-055: Mr Blue Analytics Dashboard
- PA-056: Mr Blue Settings Page
- PA-057: Mr Blue Training Page
- PA-058: Mr Blue Playground Page
- PA-059: Mr Blue API Documentation

---

## Category 5: Customer Journey Pages (5 agents)

### PA-060: J1 Landing Page Agent (Anonymous)
**Route:** `/welcome`  
**Journey State:** J1 (Anonymous)  
**Features:**
- Public feed preview
- Registration CTA
- Feature showcase
- Testimonials

### PA-061-064: Journey Progression Pages
- PA-061: J2 Onboarding Page (New User)
- PA-062: J3 Activation Page (Active User)
- PA-063: J4 Engagement Page (Power User)
- PA-064: J5 Super Admin Page (Platform Admin)

Each journey page shows:
- Current journey state badge
- Unlocked features
- Next milestone requirements
- Progress indicators

---

## Category 6: Social & Community Pages (20 agents)

### PA-065-084: Social Features
- PA-065: Following Feed Page
- PA-066: Explore Page (Discover content)
- PA-067: Trending Page
- PA-068: Bookmarks Page
- PA-069: Mentions Page
- PA-070: Activity Page (All notifications)
- PA-071: Followers Suggestions Page
- PA-072: Groups Directory Page
- PA-073: Events Calendar Page
- PA-074: Event Map Page
- PA-075: City Groups Page
- PA-076: Interest Groups Page
- PA-077: Group Chat Page
- PA-078: Direct Messages Page
- PA-079: Message Thread Page
- PA-080: User Search Page
- PA-081: Event Search Page
- PA-082: Hashtag Page
- PA-083: Location Page (City-specific feed)
- PA-084: Tango Community Page

---

## Category 7: Utility & Settings Pages (20 agents)

### PA-085-104: App Configuration
- PA-085: Account Settings Page
- PA-086: Privacy Settings Page
- PA-087: Notification Preferences Page
- PA-088: Blocked Users Page
- PA-089: Connected Apps Page
- PA-090: Data Export Page
- PA-091: Delete Account Page
- PA-092: Language Settings Page
- PA-093: Theme Settings Page (Dark mode)
- PA-094: Accessibility Settings Page
- PA-095: Help Center Page
- PA-096: FAQ Page
- PA-097: Terms of Service Page
- PA-098: Privacy Policy Page
- PA-099: Community Guidelines Page
- PA-100: About Page
- PA-101: Contact Page
- PA-102: Report Problem Page
- PA-103: Feedback Page
- PA-104: Developer API Page

---

## Category 8: Subscription & Payment Pages (10 agents)

### PA-105-114: Billing Features
- PA-105: Subscription Plans Page
- PA-106: Upgrade Page
- PA-107: Payment Methods Page
- PA-108: Billing History Page
- PA-109: Invoices Page
- PA-110: Cancel Subscription Page
- PA-111: Subscription Success Page
- PA-112: Payment Failed Page
- PA-113: Pricing Page (Public)
- PA-114: Features Comparison Page

---

## Category 9: Error & System Pages (11 agents)

### PA-115-125: Error Handling
- PA-115: 404 Not Found Page
- PA-116: 403 Forbidden Page
- PA-117: 500 Server Error Page
- PA-118: Maintenance Page
- PA-119: Offline Page
- PA-120: Loading Page
- PA-121: Empty State Page (No content)
- PA-122: Email Verification Page
- PA-123: Password Reset Page
- PA-124: Invitation Accept Page
- PA-125: Welcome Tour Page (Onboarding)

---

## Common Patterns Across All Page Agents

### **1. Data Fetching**
```typescript
// All pages use React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['/api/resource'],
  enabled: !!user, // Only fetch if authenticated
});
```

### **2. Error Handling**
```typescript
if (error) return <ErrorPage message={error.message} />;
if (isLoading) return <LoadingSpinner />;
if (!data) return <EmptyState />;
```

### **3. Accessibility**
```typescript
// All interactive elements have data-testid
<Button data-testid="button-submit">Submit</Button>
<Input data-testid="input-email" aria-label="Email address" />
```

### **4. Real-Time Updates**
```typescript
const socket = useSocket();

useEffect(() => {
  socket?.on('new_notification', (notification) => {
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
  });

  return () => {
    socket?.off('new_notification');
  };
}, [socket]);
```

### **5. Mobile Responsiveness**
```typescript
// All pages use responsive Tailwind classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

---

## Best Practices for Page Agents

✅ **DO:**
- Use React Query for all server data
- Implement loading/error states
- Add data-testid to all interactive elements
- Use Shadcn UI components
- Follow H2AC methodology
- Implement real-time updates where appropriate
- Make pages mobile-responsive
- Add proper SEO metadata (title, description)

❌ **DON'T:**
- Fetch data in useEffect (use React Query)
- Ignore loading/error states
- Hardcode API endpoints (use environment variables)
- Skip accessibility attributes
- Over-complicate component hierarchy
- Forget to invalidate cache after mutations
- Use inline styles (use Tailwind classes)

---

## Testing Page Agents

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from './HomePage';

test('renders home page with feed', async () => {
  const queryClient = new QueryClient();

  render(
    <QueryClientProvider client={queryClient}>
      <HomePage />
    </QueryClientProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('feed-container')).toBeInTheDocument();
  });
});
```

---

## Related Documentation

- **H2AC Methodology:** See `docs/ESA_H2AC_FRONTEND_PATTERN.md`
- **React Query Patterns:** See `docs/MT_REACT_QUERY_V5_GUIDE.md`
- **Component Library:** See `docs/MT_SHADCN_UI_COMPONENT_GUIDE.md`
- **Routing:** See `docs/MT_FULLSTACK_ROUTING_GUIDE.md`
- **Accessibility:** See `docs/MT_ACCESSIBILITY_WCAG_GUIDE.md`

**Next:** Review Algorithm Agents, Life CEO Agents, Mr Blue Agents, and Leadership Agents
