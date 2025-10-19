# Journey Agent J2: Standard User Core Platform
## MB.MD Journey Agent Specification

**Agent ID:** J2  
**Journey Name:** Standard User Core Features  
**User Role:** Authenticated User (Standard/Free tier)  
**Pages:** 80  
**Feature Clusters:** 8  
**Success Metric:** >70% activation (first action within 24h)  
**Created:** October 19, 2025

---

## 🎯 Journey Overview

**Purpose:** Guide authenticated users through core platform features with progressive discovery, achievement milestones, and social engagement.

**Strategy:** Break 80 pages into 8 feature clusters with dedicated onboarding flows for each.

---

## 📦 8 Feature Clusters

### Cluster 1: Social Features (15 pages)
**Entry Point:** `/memories` (default landing after J1)

**Pages:**
- `/memories` - Timeline feed
- `/memories/create` - Create post
- `/memories/:id` - View post
- `/memories/:id/edit` - Edit post
- `/hashtags/:tag` - Hashtag feed
- `/likes` - Liked posts
- `/saved` - Saved posts
- `/shares` - Shared posts
- And 7 more...

**Onboarding Flow:** "Create Your First Memory"
```typescript
{
  steps: [
    { title: "Welcome!", tooltip: "This is your social feed - see posts from dancers worldwide" },
    { title: "Create Post", tooltip: "Share your tango journey - photos, videos, or thoughts" },
    { title: "Add Hashtags", tooltip: "Use #tango #milonga to connect with community" },
    { title: "First Post!", celebration: true }
  ]
}
```

**Milestones:**
- ✅ First post created → Badge "Storyteller"
- ✅ 10 likes received → Badge "Popular"
- ✅ 5 posts created → Unlock "Verified Dancer"

---

### Cluster 2: Events (12 pages)
**Entry Point:** `/events`

**Pages:**
- `/events` - Browse events
- `/events/create` - Create event
- `/events/:id` - Event details
- `/events/:id/edit` - Edit event
- `/events/:id/attendees` - Attendee list
- `/events/my-events` - Your events
- `/events/calendar` - Calendar view
- And 5 more...

**Onboarding Flow:** "Discover Your First Event"
```typescript
{
  steps: [
    { title: "Find Events", tooltip: "Discover milongas and workshops near you" },
    { title: "RSVP", tooltip: "Tap 'Going' to save your spot" },
    { title: "Get Directions", tooltip: "View location on map" },
    { title: "Event Saved!", celebration: true }
  ]
}
```

**Milestones:**
- ✅ First RSVP → Badge "Social Dancer"
- ✅ Created first event → Badge "Organizer"
- ✅ 10 events attended → Badge "Regular"

---

### Cluster 3: Community (10 pages)
**Entry Point:** `/community`

**Pages:**
- `/community` - Community hub
- `/groups` - Browse groups
- `/groups/:id` - Group page
- `/groups/:id/members` - Member list
- `/groups/:id/discussions` - Discussions
- `/cities/:city` - City page (auto-assigned)
- And 4 more...

**Onboarding Flow:** "Join Your Community"
```typescript
{
  steps: [
    { title: "Your City", tooltip: "You've been added to {cityName} Tango Community" },
    { title: "Explore Groups", tooltip: "Find dancers with shared interests" },
    { title: "Join Group", tooltip: "Tap 'Join' to connect" },
    { title: "Welcome!", celebration: true }
  ]
}
```

**Milestones:**
- ✅ Joined city group → Auto-granted
- ✅ Joined 3+ groups → Badge "Community Builder"
- ✅ Created first discussion → Badge "Conversationalist"

---

### Cluster 4: Housing (8 pages)
**Entry Point:** `/housing`

**Pages:**
- `/housing` - Housing marketplace
- `/housing/list` - List housing
- `/housing/:id` - Listing details
- `/housing/my-listings` - Your listings
- `/housing/bookings` - Booking requests
- And 3 more...

**Onboarding Flow:** "Find Housing for Events"
```typescript
{
  steps: [
    { title: "Housing Market", tooltip: "Dancers offer accommodation for festivals" },
    { title: "Search", tooltip: "Filter by city, dates, price" },
    { title: "Contact Host", tooltip: "Send booking request" },
    { title: "Request Sent!", celebration: true }
  ]
}
```

**Milestones:**
- ✅ First housing search → Badge "Traveler"
- ✅ Listed housing → Badge "Host"

---

### Cluster 5: Messaging (10 pages)
**Entry Point:** `/messages`

**Pages:**
- `/messages` - Inbox
- `/messages/:id` - Conversation
- `/messages/new` - New message
- `/messages/requests` - Message requests
- `/calls` - Video calls
- And 5 more...

**Onboarding Flow:** "Connect with Dancers"
```typescript
{
  steps: [
    { title: "Messages", tooltip: "Private conversations with other dancers" },
    { title: "Start Chat", tooltip: "Tap profile → 'Send Message'" },
    { title: "Video Call", tooltip: "Schedule practice sessions remotely" },
    { title: "Connected!", celebration: true }
  ]
}
```

**Milestones:**
- ✅ First message sent → Badge "Connector"
- ✅ First video call → Badge "Practice Partner"

---

### Cluster 6: Friends & Network (8 pages)
**Entry Point:** `/friends`

**Pages:**
- `/friends` - Friends list
- `/friends/requests` - Friend requests
- `/friends/suggestions` - Suggested friends
- `/friends/mutual` - Mutual friends
- `/followers` - Followers
- `/following` - Following
- And 2 more...

**Onboarding Flow:** "Build Your Network"
```typescript
{
  steps: [
    { title: "Find Friends", tooltip: "Connect with dancers you know" },
    { title: "Send Request", tooltip: "Tap 'Add Friend'" },
    { title: "Suggestions", tooltip: "Based on mutual friends and events" },
    { title: "Network Growing!", celebration: true }
  ]
}
```

**Milestones:**
- ✅ 10 friends → Badge "Well Connected"
- ✅ 50 followers → Badge "Influencer"

---

### Cluster 7: Search & Discovery (7 pages)
**Entry Point:** `/search`

**Pages:**
- `/search` - Universal search
- `/search/users` - User search
- `/search/events` - Event search
- `/search/groups` - Group search
- `/discover` - Discover feed
- And 2 more...

**Onboarding Flow:** "Discover the Platform"
```typescript
{
  steps: [
    { title: "Search Everything", tooltip: "Find users, events, groups, posts" },
    { title: "Filters", tooltip: "Narrow by location, date, type" },
    { title: "Save Searches", tooltip: "Get notified of new results" },
    { title: "Explorer!", celebration: true }
  ]
}
```

**Milestones:**
- ✅ 10 searches → Badge "Explorer"

---

### Cluster 8: Settings & Profile (10 pages)
**Entry Point:** `/settings`

**Pages:**
- `/settings` - Settings hub
- `/settings/account` - Account
- `/settings/privacy` - Privacy
- `/settings/notifications` - Notifications
- `/settings/language` - Language
- `/settings/theme` - Theme
- `/profile/edit` - Edit profile
- And 3 more...

**Onboarding Flow:** "Customize Your Experience"
```typescript
{
  steps: [
    { title: "Your Profile", tooltip: "Update bio, photos, dance info" },
    { title: "Privacy", tooltip: "Control who sees your posts" },
    { title: "Notifications", tooltip: "Stay updated on what matters" },
    { title: "All Set!", celebration: true }
  ]
}
```

---

## 🎨 Progressive Discovery System

**Concept:** Features unlock as user engages with platform.

**Unlocking Tiers:**
```typescript
const FEATURE_UNLOCKS = {
  tier1: { // Immediate access (after J1)
    features: ['memories', 'events', 'community', 'profile'],
    requirement: 'Registration complete'
  },
  tier2: { // After first interaction
    features: ['messaging', 'friends', 'search'],
    requirement: 'Create first post OR RSVP to event'
  },
  tier3: { // After engagement
    features: ['housing', 'video-calls', 'advanced-search'],
    requirement: '5+ posts OR 3+ events OR 10+ friends'
  },
  tier4: { // Premium teaser
    features: ['analytics-preview', 'life-ceo-preview'],
    requirement: '10+ actions (any type)',
    upgradePrompt: true // Show "Upgrade to Premium" CTA
  }
};
```

**Visual Indicators:**
```typescript
<FeatureCard
  title="Housing Marketplace"
  locked={!hasUnlockedTier2}
  tooltip="Create 1 post or RSVP to an event to unlock"
  progress={userActions} // Show progress bar
/>
```

---

## 🎯 Achievement System

**Badge Categories:**
- **Social:** Storyteller, Popular, Influencer
- **Events:** Social Dancer, Organizer, Regular
- **Community:** Community Builder, Conversationalist
- **Network:** Well Connected, Connector
- **Exploration:** Explorer, Traveler

**Display:**
```typescript
<ProfileBadges
  badges={user.badges}
  displayStyle="showcase" // Show top 3 on profile
  expandable={true} // View all in modal
/>
```

---

## 📊 Analytics & Metrics

**Activation Metrics:**
- First action within 24h: Target >70%
- Actions per user (7-day average): Target >5
- Feature discovery: Target >4 clusters explored
- Return rate (Day 7): Target >60%

**Engagement Funnel:**
- Cluster 1 (Social): >90% visit
- Cluster 2 (Events): >70% visit
- Cluster 3 (Community): >60% visit
- Clusters 4-8: >40% visit each

---

## 🔗 Integration with Journey J3 (Premium Upgrade)

**Trigger Premium Prompt After:**
- 10+ total actions
- Viewed "Life CEO" preview
- Used analytics preview
- 7+ days active

**Prompt Message:**
```
"You're an active member! 🎉 
Upgrade to Premium for:
- 16 AI Life CEO agents
- Advanced analytics
- Priority support
- Ad-free experience

Try free for 7 days →"
```

---

**Created by:** Agent #64  
**Status:** ✅ SPECIFICATION COMPLETE  
**Estimated Build Time:** 3 hours
