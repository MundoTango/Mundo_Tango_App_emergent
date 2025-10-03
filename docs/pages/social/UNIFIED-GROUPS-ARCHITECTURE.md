# Unified Groups Architecture Documentation

**Last Updated:** October 1, 2025  
**ESA Framework Layer:** Layer 22 - Group Management  
**Status:** ✅ UNIFIED SYSTEM OPERATIONAL

## Overview

The Mundo Tango platform uses a **unified group architecture** where City Groups and Professional Groups share the same infrastructure, codebase, and UI components. This document describes the complete architecture, endpoints, and conditional features.

---

## 1. Database Structure

### Groups Table
All groups (city and professional) are stored in a single `groups` table:

```sql
groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  type VARCHAR(50),          -- 'city', 'professional', 'practice', 'festival'
  role_type VARCHAR(50),     -- 'member', 'dj', 'instructor', 'organizer', 'musician', 'performer'
  city VARCHAR(100),
  country VARCHAR(100),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  emoji VARCHAR(10),
  member_count INTEGER DEFAULT 0,
  image_url TEXT,
  is_private BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Current Groups in Database
- **Buenos Aires Tango Community** - type: `city`, role_type: `member`, 3,456 members
- **Madrid Tango Lovers** - type: `city`, role_type: `member`, 1,823 members
- **New York Tango Society** - type: `city`, role_type: `member`, 892 members
- **Professional Tango Instructors** - type: `professional`, role_type: `instructor`, 245 members
- **Tango Milonga Organizers** - type: `professional`, role_type: `organizer`, 156 members
- **Tango DJs Network** - type: `professional`, role_type: `dj`, 87 members

---

## 2. Frontend Architecture

### Unified Components

**ALL groups use the same components:**

1. **GroupDetailPageMT.tsx** (~400 lines - refactored October 3, 2025)
   - Route: `/groups/:slug`
   - Handles city groups, professional groups, practice groups, and festivals
   - **Conditionally renders tabs** based on group type
   - **Uses UnifiedPostFeed** with context-based architecture (see below)

2. **Groups List Page** (`groups.tsx`)
   - Route: `/groups`
   - Shows all group types with filters
   - Uses `EnhancedCityGroupCard` for city groups
   - Uses `CommunityCard` for professional groups

### UnifiedPostFeed Integration (October 3, 2025)

**MAJOR ARCHITECTURAL CHANGE:** GroupDetailPageMT now uses context-based UnifiedPostFeed, eliminating ~200 lines of duplicate post management code.

#### Old Pattern (Deprecated)
```tsx
// GroupDetailPageMT used to manage all post state:
const [posts, setPosts] = useState([]);
const [loadingPosts, setLoadingPosts] = useState(false);
const [postsPage, setPostsPage] = useState(1);
const [hasMorePosts, setHasMorePosts] = useState(true);

const fetchGroupPosts = async () => {
  // 50+ lines of fetch logic
  // Socket handlers
  // Mutation handlers
};
```

#### New Pattern (Current)
```tsx
// GroupDetailPageMT is now a thin wrapper:
{activeTab === 'posts' && (
  <UnifiedPostFeed
    context={{
      type: 'group',
      groupId: groupData.id,
      filter: mentionFilter  // 'all' or 'mentions-only'
    }}
    showFilters={false}
    showSearch={false}
  />
)}
```

**Benefits:**
- ✅ Zero duplicate code with Memories feed
- ✅ Automatic pagination & infinite scroll
- ✅ Context-aware cache invalidation
- ✅ Consistent UX across all feeds
- ✅ ~200 lines of code eliminated

**Documentation:** See [UnifiedPostFeed.md](../components/UnifiedPostFeed.md) for complete details.

### Conditional Tabs

**GroupDetailPageMT** shows different tabs based on `group.type`:

#### City Groups (`type === 'city'`)
- About
- Posts
- Events
- Members
- Community Hub
- **Housing** ⭐ (city-specific)
- **Recommendations** ⭐ (city-specific)

#### Professional Groups (`type === 'professional'`)
- About
- Posts
- Events
- Members
- Community Hub
- ❌ No Housing tab (not city-tied)
- ❌ No Recommendations tab (not city-tied)

### Implementation
```typescript
// In GroupDetailPageMT.tsx tabs array
{[
  { id: 'about', label: 'About', icon: Info },
  { id: 'posts', label: 'Posts', icon: MessageCircle },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'community-hub', label: 'Community Hub', icon: MapPin },
  // City-specific tabs (Housing & Recommendations only for city groups)
  ...(group.type === 'city' ? [
    { id: 'housing', label: 'Housing', icon: Home },
    { id: 'recommendations', label: 'Recommendations', icon: Star },
  ] : [])
].map((tab) => (...))}
```

---

## 3. API Endpoints

### Group Management Endpoints

#### List Groups
```
GET /api/groups
Returns all groups with membership status for authenticated user
```

#### Get Group Details
```
GET /api/groups/:slug
Returns group details by slug (works for both city and professional groups)
```

#### Join Group (Slug-based)
```
POST /api/user/join-group/:slug
Body: {}
Returns: { success: true, message: "Joined group successfully" }
```

#### Leave Group (Slug-based)
```
POST /api/user/leave-group/:slug
Body: {}
Returns: { success: true, message: "Left group successfully" }
```

#### Follow City (City-specific)
```
POST /api/user/follow-city/:slug
Body: {}
Returns: { success: true, message: "Following city successfully" }
Note: Only works for groups with type === 'city'
```

#### Get Group Members
```
GET /api/groups/:groupId/members
Returns list of members with user details and roles
```

#### Get Group Posts
```
GET /api/groups/:groupId/posts?filter=all|residents|visitors|members|non-members
Returns paginated group posts with filtering options
```

### City-Specific Endpoints

#### Get Host Homes
```
GET /api/host-homes?city={city}&country={country}
Returns host homes listings filtered by location
Response: {
  success: true,
  data: [{
    id: number,
    title: string,
    description: string,
    city: string,
    state: string,
    country: string,
    pricePerNight: number,
    maxGuests: number,
    amenities: string[],
    photos: string[],
    host: { id, firstName, lastName, profileImage }
  }]
}
```

#### Get Host Home Details
```
GET /api/host-homes/:id
Returns single host home with full details
```

#### Get Recommendations
```
GET /api/recommendations
Returns AI-generated recommendations for user
Response: {
  success: true,
  recommendations: []
}
```

---

## 4. Filter System

### Groups Page Filters

The groups listing page (`/groups`) provides filtering:

```typescript
const filterButtons = [
  { key: 'all', label: 'All Communities', icon: Globe },
  { key: 'city', label: 'City Groups', icon: MapPin },
  { key: 'professional', label: 'Professional', icon: Users },
  { key: 'music', label: 'Music', icon: Music },
  { key: 'practice', label: 'Practice', icon: Code },
  { key: 'festivals', label: 'Festivals', icon: Calendar }
];
```

### Filter Logic
```typescript
switch (activeFilter) {
  case 'city':
    return group.type === 'city';
  case 'professional':
    return group.role_type && ['teacher', 'performer', 'organizer'].includes(group.role_type);
  case 'music':
    return group.role_type && ['musician', 'dj'].includes(group.role_type);
  case 'practice':
    return group.type === 'practice';
  case 'festivals':
    return group.type === 'festival';
  default:
    return true;
}
```

---

## 5. Key Design Decisions

### Why Unified?

1. **Single Source of Truth:** One detail page maintains consistency
2. **Reduced Duplication:** No need for separate city/professional pages
3. **Easier Maintenance:** Updates apply to all group types
4. **Consistent UX:** Users navigate all groups the same way
5. **Conditional Features:** Type-specific features show/hide automatically

### Type vs Role Type

- **`type`**: Broad category (city, professional, practice, festival)
- **`role_type`**: Specific role within professional groups (dj, instructor, organizer, musician, performer)

### Placeholder Pages

**DO NOT USE THESE:**
- `/teacher` - "Coming Soon" placeholder (not functional)
- `/organizer` - "Coming Soon" placeholder (not functional)

**These are marketing pages, NOT group pages. Professional groups use `/groups/:slug` like everything else.**

---

## 6. Component Hierarchy

```
GroupDetailPageMT (Unified Detail Page)
├── DashboardLayout
├── Group Header (gradient banner with stats)
├── Group Actions (Join/Leave buttons)
├── Tab Navigation
│   ├── About Tab
│   ├── Posts Tab (filtered feed)
│   ├── Events Tab (EventMap component)
│   ├── Members Tab (member list with roles)
│   ├── Community Hub Tab (CommunityToolbar)
│   ├── Housing Tab (city groups only)
│   └── Recommendations Tab (city groups only)
└── Conditional Content Rendering
```

---

## 7. MT Ocean Theme Integration

All group pages use the MT Ocean design system:
- Turquoise to Dodger Blue to Cobalt Blue gradient (#40E0D0 → #1E90FF → #0047AB)
- Glassmorphic cards with turquoise borders
- Zero inline styles, CSS-only hover states
- Design tokens from `client/src/styles/design-tokens.css`

---

## 8. Testing Scenarios

### Test Case 1: City Group
1. Navigate to `/groups/buenos-aires-tango`
2. Verify tabs: About, Posts, Events, Members, Community Hub, **Housing**, **Recommendations**
3. Click Housing tab → should show host homes list
4. Click Recommendations tab → should show recommendations
5. Test Join/Leave functionality

### Test Case 2: Professional Group
1. Navigate to `/groups/tango-djs-network`
2. Verify tabs: About, Posts, Events, Members, Community Hub
3. Confirm Housing and Recommendations tabs are **NOT visible**
4. Test Join/Leave functionality

---

## 9. Files Modified

### Backend
- `server/routes/groupRoutes.ts` - Added user-namespaced endpoints
- `server/routes/hostHomesRoutes.ts` - NEW: Host homes API
- `server/index-novite.ts` - Registered hostHomesRoutes

### Frontend
- `client/src/pages/GroupDetailPageMT.tsx` - Added conditional tabs
- `client/src/pages/groups.tsx` - Group filtering (already existed)
- `client/src/components/Housing/HostHomesList.tsx` - Queries /api/host-homes

### Schema
- `shared/schema.ts` - Contains unified groups table definition

---

## 10. Future Enhancements

- [ ] Add role-specific features for professional groups
- [ ] Implement group recommendations algorithm
- [ ] Add group analytics dashboard
- [ ] Create group migration tools
- [ ] Build group moderation tools
- [ ] Add group themes customization

---

## Summary

The unified group architecture successfully combines city and professional groups into a single, maintainable system. Type-based conditional rendering ensures city-specific features (Housing, Recommendations) only appear for city groups, while professional groups focus on role-specific content and networking.

**Status: ✅ Production Ready**
