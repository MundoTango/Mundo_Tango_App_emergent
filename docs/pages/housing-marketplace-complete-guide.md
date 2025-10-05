# Housing Marketplace - Complete Implementation Guide
## Life CEO & Mundo Tango Platform - ESA LIFE CEO 61x21

**Last Updated:** October 5, 2025  
**Implementation Phases:** 1-4 (Complete)  
**Framework:** ESA LIFE CEO 61x21 with 86 Specialized Agents

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Media System Overhaul](#phase-1-media-system-overhaul)
3. [Phase 2: Rating System](#phase-2-rating-system)
4. [Phase 3: House Rules Library](#phase-3-house-rules-library)
5. [Phase 4: Friendship-Based Access Control](#phase-4-friendship-based-access-control)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Frontend Components](#frontend-components)
9. [Testing & Validation](#testing--validation)
10. [Deployment Considerations](#deployment-considerations)

---

## Overview

The Housing Marketplace is a **connection-based, payment-free** platform integrated with the Life CEO & Mundo Tango ecosystem. Unlike traditional booking platforms, access to properties is governed by **friendship connections** and **closeness scores** rather than payments.

### Core Principles

- **Connection-Based Only**: No payment processing - approval based on social connections
- **Friendship-Based Access Control**: Hosts control who can book via connection degrees and closeness scores
- **Community Trust**: Verified tango community members with mutual connections
- **Bidirectional Reviews**: Both hosts and guests review each other post-stay
- **Comprehensive House Rules**: 31 pre-defined templates + custom rules

### User Journey Types

The system supports **19 customer journeys** across 4 user types:

1. **Guest** - Browse, request bookings, leave reviews
2. **Host** - List properties, manage bookings, set access controls
3. **City Group** - Community-level housing oversight
4. **Admin** - Platform-wide moderation and analytics

---

## Phase 1: Media System Overhaul

### Overview

Advanced media upload system supporting images and videos with drag-to-reorder functionality and thumbnail selection.

### Features Implemented

#### MediaUploader Component
- **Video Support**: MP4, WebM, MOV, AVI formats
- **Drag-to-Reorder**: Intuitive drag-and-drop interface using `react-beautiful-dnd`
- **Thumbnail Selection**: Choose which media appears as property thumbnail
- **Client-Side Compression**: 
  - Images: Browser-native compression (JPEG quality 85%)
  - Videos: WebCodecs API with H.264 encoding (when available)
- **Progress Tracking**: Real-time upload progress for each file
- **File Validation**: Type and size constraints (max 50MB per file)

#### Technical Implementation

**Frontend:**
```typescript
// client/src/components/media/MediaUploader.tsx
- Uses react-dropzone for file selection
- Implements drag-and-drop reordering
- Client-side compression before upload
- Real-time progress indicators
```

**Backend:**
```typescript
// server/middleware/upload.ts
- Multer configuration for file handling
- Storage in /uploads directory
- File type validation
- Size limit enforcement (50MB)
```

**Database Schema:**
```sql
-- hostHomes table
photos: text[],              -- Array of media URLs
mediaOrder: text[],          -- Ordered array of URLs
thumbnailMedia: text         -- Selected thumbnail URL
```

### Integration Points

- **Host Onboarding**: Step 3 (Property Photos & Videos)
- **Edit Property**: Media management in host dashboard
- **Listing Display**: Gallery with video player support

### Usage Example

```tsx
<MediaUploader
  currentMedia={property.photos}
  currentOrder={property.mediaOrder}
  currentThumbnail={property.thumbnailMedia}
  onMediaChange={(media, order, thumbnail) => {
    // Handle media updates
  }}
  maxFiles={10}
  acceptVideo={true}
/>
```

---

## Phase 2: Rating System

### Overview

Post-stay bidirectional review system linking reviews to completed bookings.

### Features Implemented

#### Review Flow

1. **Booking Completion**: Status changes to "completed"
2. **Review Invitation**: Both parties receive review prompts
3. **Independent Reviews**: Host reviews guest, guest reviews host
4. **Public Display**: Reviews appear on respective profiles

#### Database Schema

**Host Reviews Table:**
```sql
CREATE TABLE host_reviews (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES guest_bookings(id),
  reviewer_id INTEGER REFERENCES users(id),
  host_id INTEGER REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  cleanliness_rating INTEGER,
  communication_rating INTEGER,
  accuracy_rating INTEGER,
  location_rating INTEGER,
  value_rating INTEGER,
  review_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Guest Reviews Table:**
```sql
CREATE TABLE guest_reviews (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES guest_bookings(id),
  reviewer_id INTEGER REFERENCES users(id),
  guest_id INTEGER REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  respect_rating INTEGER,
  cleanliness_rating INTEGER,
  communication_rating INTEGER,
  house_rules_rating INTEGER,
  review_text TEXT,
  would_host_again BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### API Endpoints

**Get Reviews:**
```
GET /api/host-homes/:id/reviews
GET /api/users/:userId/guest-reviews
```

**Create Reviews:**
```
POST /api/host-reviews
POST /api/guest-reviews
Body: {
  bookingId, rating, reviewText, 
  cleanlinessRating, communicationRating, ...
}
```

#### Components

**1. StarRating** - Interactive star selector
```tsx
<StarRating 
  rating={rating} 
  onChange={setRating}
  size="lg"
/>
```

**2. RatingSummary** - Aggregate statistics
```tsx
<RatingSummary reviews={reviews} />
// Displays average ratings and distribution
```

**3. ReviewList** - Paginated review display
```tsx
<ReviewList 
  reviews={reviews}
  type="host"  // or "guest"
  emptyMessage="No reviews yet"
/>
```

**4. ReviewForm** - Submit review dialog
```tsx
<ReviewForm
  bookingId={bookingId}
  revieweeType="host"  // or "guest"
  onSuccess={() => {...}}
/>
```

### Validation Rules

- **One Review Per Booking**: Each party can only review once per booking
- **Completed Bookings Only**: Reviews linked to `booking_id` with status "completed"
- **Required Fields**: Overall rating (1-5 stars) and review text
- **Optional Fields**: Category ratings (cleanliness, communication, etc.)

---

## Phase 3: House Rules Library

### Overview

Comprehensive rule management system with 31 pre-defined templates across 8 categories plus custom rule creation.

### Categories

1. **Check-in/Check-out** - Flexible times, early/late policies
2. **Pets** - Pet-friendly policies and restrictions
3. **Smoking** - Smoking policies and designated areas
4. **Parking** - Parking availability and restrictions
5. **Events & Parties** - Party policies and guest limits
6. **Noise & Quiet Hours** - Noise regulations and quiet times
7. **Guest Limits** - Maximum occupancy and visitor policies
8. **Cleaning & Maintenance** - Cleaning expectations and responsibilities

### Database Schema

**House Rule Templates:**
```sql
CREATE TABLE house_rule_templates (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,  -- Database slug
  icon VARCHAR(50),
  is_default BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Host Home Rules:**
```sql
CREATE TABLE host_home_rules (
  id SERIAL PRIMARY KEY,
  host_home_id INTEGER REFERENCES host_homes(id) ON DELETE CASCADE,
  rule_template_id INTEGER REFERENCES house_rule_templates(id),
  custom_title VARCHAR(255),      -- For custom rules
  custom_description TEXT,         -- For custom rules
  category VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Pre-Defined Templates (Sample)

**Check-in/Check-out:**
- Flexible Check-in After 2:00 PM
- Early Check-in Available (Fee May Apply)
- Late Check-out Until 12:00 PM
- Self Check-in with Lockbox

**Pets:**
- Pet-Friendly (All Sizes Welcome)
- Small Dogs Only (Under 25 lbs)
- Cats Only
- No Pets Allowed

**Smoking:**
- Strictly No Smoking Indoors
- Outdoor Smoking Area Available
- Designated Balcony Smoking Only
- Completely Smoke-Free Property

### Category Mapping System

Due to database using slugs (e.g., "check-in-out") and UI needing display labels (e.g., "Check-in/Check-out"), a mapping utility was created:

```typescript
// client/src/utils/houseRulesHelpers.ts

export const CATEGORY_SLUG_TO_DISPLAY: Record<string, string> = {
  'check-in-out': 'Check-in/Check-out',
  'pets': 'Pets',
  'smoking': 'Smoking',
  'parking': 'Parking',
  'events': 'Events & Parties',
  'noise': 'Noise & Quiet Hours',
  'guests': 'Guest Limits',
  'cleaning': 'Cleaning & Maintenance',
};

export function getCategoryDisplayLabel(slug: string): string;
export function getCategoryIcon(slug: string): LucideIcon;
export function getCategoryColor(slug: string): string;
```

### Components

**1. HouseRulesSelector** - Host management interface
```tsx
<HouseRulesSelector
  homeId={propertyId}
  initialRules={existingRules}
  onChange={(rules) => {...}}
  showActions={true}
/>
```

Features:
- Accordion by category
- Checkbox selection for templates
- Custom rule creation dialog
- Drag-to-reorder functionality
- Save/update to backend

**2. HouseRulesDisplay** - Guest-facing display
```tsx
<HouseRulesDisplay
  homeId={propertyId}
  variant="detailed"  // or "compact"
  showTitle={true}
/>
```

Features:
- Category-grouped rules
- Icon and color coding
- Template and custom rules merged
- Responsive layout

### API Endpoints

```
GET    /api/house-rules/templates          # All templates
GET    /api/host-homes/:id/rules           # Property rules
POST   /api/host-homes/:id/rules           # Create/update rules
PUT    /api/host-homes/rules/:id           # Update specific rule
DELETE /api/host-homes/rules/:id           # Delete rule
```

### Custom Rule Creation

Hosts can create custom rules:
1. Select category from dropdown
2. Enter custom title
3. Add description (optional)
4. Save to property

Custom rules are stored with `rule_template_id = NULL` and use `custom_title` and `custom_description` fields.

---

## Phase 4: Friendship-Based Access Control

### Overview

The core differentiator: properties are restricted based on **friendship connections** and **engagement metrics**, not payments.

### Connection Degree Calculation

Uses **BFS (Breadth-First Search)** graph traversal to find shortest path between users:

```typescript
// server/services/connectionCalculationService.ts

async calculateConnectionDegree(userId: number, targetUserId: number): Promise<number | null> {
  // Returns: 1 (direct friends), 2 (friend-of-friend), 
  //          3 (3rd degree), or null (not connected)
  
  const visited = new Set([userId]);
  const queue = [{ id: userId, degree: 0 }];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.degree >= 3) break;  // Stop at 3rd degree
    
    // Get all accepted friends
    const friendships = await getFriends(current.id);
    
    for (const friendship of friendships) {
      const friendId = getFriendId(friendship, current.id);
      if (friendId === targetUserId) {
        return current.degree + 1;  // Found!
      }
      if (!visited.has(friendId)) {
        visited.add(friendId);
        queue.push({ id: friendId, degree: current.degree + 1 });
      }
    }
  }
  
  return null;  // Not connected
}
```

### Closeness Score Algorithm

Multi-factor scoring system (0-100):

```typescript
async calculateClosenessScore(userId: number, friendId: number): Promise<number> {
  // Get friendship activities
  const activities = await getFriendshipActivities(friendshipId);
  
  // Factor 1: Activity Score (max 50 points)
  // Apply temporal decay (30-day half-life)
  const now = Date.now();
  const decayedPoints = activities.reduce((sum, activity) => {
    const ageInDays = (now - activity.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const decayFactor = Math.exp(-ageInDays / 30);
    return sum + (activity.points || 1) * decayFactor;
  }, 0);
  const activityScore = Math.min(50, decayedPoints * 2);
  
  // Factor 2: Shared Memories (max 25 points)
  const sharedMemoryCount = activities.filter(a => 
    ['post_tag', 'comment', 'like', 'event_together'].includes(a.activityType)
  ).length;
  const memoryScore = Math.min(25, sharedMemoryCount * 5);
  
  // Factor 3: Shared Events (max 25 points)
  const sharedEvents = await getSharedEvents(userId, friendId);
  const eventScore = Math.min(25, sharedEvents.length * 5);
  
  // Final score
  return Math.round(activityScore + memoryScore + eventScore);
}
```

### Booking Access Levels

**Database Field:**
```sql
-- hostHomes table
who_can_book VARCHAR(50) DEFAULT 'anyone',
minimum_closeness_score INTEGER DEFAULT 0,
allow_unconnected BOOLEAN DEFAULT true
```

**Access Levels:**

1. **anyone** - All platform users can book
2. **friends_only** - Requires exactly 1st degree connection
3. **1st_degree** - Direct friends only
4. **2nd_degree** - Friends and friends-of-friends
5. **3rd_degree** - Within 3 degrees of separation
6. **custom_closeness** - Minimum closeness score threshold (0-100)

### Booking Eligibility Check

```typescript
async canUserBook(
  userId: number, 
  hostId: number, 
  whoCanBook: string, 
  minimumClosenessScore: number
): Promise<{
  canBook: boolean;
  reason?: string;
  connectionInfo: ConnectionInfo;
}> {
  // Get connection info
  const connectionInfo = await getConnectionInfo(userId, hostId);
  
  // Prevent self-booking
  if (userId === hostId) {
    return {
      canBook: false,
      reason: 'You cannot book your own property.',
      connectionInfo
    };
  }
  
  // Check based on access level
  switch (whoCanBook) {
    case 'anyone':
      return { canBook: true, connectionInfo };
      
    case 'friends_only':
    case '1st_degree':
      if (connectionInfo.connectionDegree !== 1) {
        return {
          canBook: false,
          reason: 'This property is only available to direct friends (1st degree connections).',
          connectionInfo
        };
      }
      return { canBook: true, connectionInfo };
      
    case '2nd_degree':
      if (!connectionInfo.connectionDegree || connectionInfo.connectionDegree > 2) {
        return {
          canBook: false,
          reason: 'This property is only available to 1st and 2nd degree connections.',
          connectionInfo
        };
      }
      return { canBook: true, connectionInfo };
      
    case '3rd_degree':
      if (!connectionInfo.connectionDegree || connectionInfo.connectionDegree > 3) {
        return {
          canBook: false,
          reason: 'This property is only available to connected users within 3 degrees.',
          connectionInfo
        };
      }
      return { canBook: true, connectionInfo };
      
    case 'custom_closeness':
      if (connectionInfo.closenessScore < minimumClosenessScore) {
        return {
          canBook: false,
          reason: `This property requires a closeness score of at least ${minimumClosenessScore}. Your current score is ${connectionInfo.closenessScore}.`,
          connectionInfo
        };
      }
      return { canBook: true, connectionInfo };
      
    default:
      return { canBook: true, connectionInfo };
  }
}
```

### Connection Info Structure

```typescript
interface ConnectionInfo {
  connectionDegree: number | null;  // null if not connected
  closenessScore: number;           // 0-100
  mutualFriends: number;            // Count of mutual connections
  sharedMemories: number;           // Shared interactions
  sharedEvents: number;             // Events attended together
  lastInteraction: Date | null;     // Last engagement timestamp
  interactionCount: number;         // Total interaction count
}
```

### API Endpoints

```
GET  /api/users/:userId/connection-info/:hostId
     Response: ConnectionInfo

POST /api/host-homes/:id/check-booking-eligibility
     Response: { eligible: boolean, reason?: string, connectionInfo: ConnectionInfo }

PATCH /api/host-homes/:id/booking-restrictions
      Body: { whoCanBook, minimumClosenessScore, allowUnconnected }
```

### Components

**1. BookingRestrictionsCard** - Host access control settings
```tsx
<BookingRestrictionsCard
  propertyId={homeId}
  currentSettings={{
    whoCanBook: 'custom_closeness',
    minimumClosenessScore: 75
  }}
/>
```

Features:
- Radio group for access levels
- Slider for closeness score threshold
- Visual indicators for each level
- Real-time save to backend

**2. ConnectionInfoCard** - Guest-facing connection display
```tsx
<ConnectionInfoCard
  connectionInfo={connectionData}
  hostName={host.name}
/>
```

Features:
- Connection degree badge
- Closeness score with progress bar
- Stats grid (mutual friends, shared events, interactions)
- Visual color coding (green >= 80, blue >= 60, yellow >= 40)

### Frontend Integration

**Listing Detail Page:**
1. Fetch connection info on page load
2. Display ConnectionInfoCard (if not host's own property)
3. Check eligibility before showing booking modal
4. Show clear messaging if ineligible

**Booking Flow:**
```tsx
const handleRequestToBook = async () => {
  // Check eligibility first
  const result = await checkEligibilityMutation.mutateAsync();
  
  if (result.eligible) {
    setShowBookingModal(true);  // Allow booking
  } else {
    toast({
      title: 'Cannot book this property',
      description: result.reason,
      variant: 'destructive',
    });
  }
};
```

### Storage in Bookings

Connection info is snapshot at time of booking:

```sql
-- guest_bookings table
connection_info JSONB  -- Stores ConnectionInfo at booking time
```

This allows:
- Historical record of relationship at booking time
- Analysis of booking patterns by connection strength
- Verification that booking met requirements

---

## Database Schema

### Complete Housing Schema

```sql
-- Host Homes (Properties)
CREATE TABLE host_homes (
  id SERIAL PRIMARY KEY,
  host_id INTEGER REFERENCES users(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  country VARCHAR(100) NOT NULL,
  lat REAL,
  lng REAL,
  
  -- Media (Phase 1)
  photos TEXT[],
  media_order TEXT[],
  thumbnail_media TEXT,
  
  -- Property details
  amenities TEXT[],
  max_guests INTEGER DEFAULT 1,
  price_per_night INTEGER,  -- in cents (informational only, no payments)
  availability JSONB DEFAULT '{}',
  blocked_dates JSONB,
  
  -- Friendship-based access control (Phase 4)
  who_can_book VARCHAR(50) DEFAULT 'anyone',
  minimum_closeness_score INTEGER DEFAULT 0,
  allow_unconnected BOOLEAN DEFAULT true,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_host_homes_host ON host_homes(host_id);
CREATE INDEX idx_host_homes_city ON host_homes(city);
CREATE INDEX idx_host_homes_location ON host_homes(lat, lng);
CREATE INDEX idx_host_homes_who_can_book ON host_homes(who_can_book);

-- Guest Bookings
CREATE TABLE guest_bookings (
  id SERIAL PRIMARY KEY,
  guest_id INTEGER REFERENCES users(id) NOT NULL,
  host_home_id INTEGER REFERENCES host_homes(id) NOT NULL,
  check_in_date TIMESTAMP NOT NULL,
  check_out_date TIMESTAMP NOT NULL,
  guest_count INTEGER NOT NULL DEFAULT 1,
  purpose TEXT NOT NULL,
  message TEXT NOT NULL,
  has_read_rules BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, approved, rejected, cancelled, completed
  host_response TEXT,
  total_price INTEGER,  -- Informational only
  
  -- Connection info snapshot (Phase 4)
  connection_info JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP
);

CREATE INDEX idx_guest_bookings_guest ON guest_bookings(guest_id);
CREATE INDEX idx_guest_bookings_home ON guest_bookings(host_home_id);
CREATE INDEX idx_guest_bookings_status ON guest_bookings(status);
CREATE INDEX idx_guest_bookings_dates ON guest_bookings(check_in_date, check_out_date);

-- House Rule Templates (Phase 3)
CREATE TABLE house_rule_templates (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  icon VARCHAR(50),
  is_default BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_house_rule_templates_category ON house_rule_templates(category);

-- Host Home Rules (Phase 3)
CREATE TABLE host_home_rules (
  id SERIAL PRIMARY KEY,
  host_home_id INTEGER REFERENCES host_homes(id) ON DELETE CASCADE NOT NULL,
  rule_template_id INTEGER REFERENCES house_rule_templates(id),
  custom_title VARCHAR(255),
  custom_description TEXT,
  category VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_host_home_rules_home ON host_home_rules(host_home_id);
CREATE INDEX idx_host_home_rules_category ON host_home_rules(category);

-- Host Reviews (Phase 2)
CREATE TABLE host_reviews (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES guest_bookings(id) NOT NULL,
  reviewer_id INTEGER REFERENCES users(id) NOT NULL,
  host_id INTEGER REFERENCES users(id) NOT NULL,
  property_id INTEGER REFERENCES host_homes(id) NOT NULL,
  
  -- Ratings
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
  location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  
  review_text TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_host_reviews_booking_id ON host_reviews(booking_id);
CREATE INDEX idx_host_reviews_property ON host_reviews(property_id);
CREATE INDEX idx_host_reviews_host ON host_reviews(host_id);

-- Guest Reviews (Phase 2)
CREATE TABLE guest_reviews (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES guest_bookings(id) NOT NULL,
  reviewer_id INTEGER REFERENCES users(id) NOT NULL,
  guest_id INTEGER REFERENCES users(id) NOT NULL,
  
  -- Ratings
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  respect_rating INTEGER CHECK (respect_rating >= 1 AND respect_rating <= 5),
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  house_rules_rating INTEGER CHECK (house_rules_rating >= 1 AND house_rules_rating <= 5),
  
  review_text TEXT NOT NULL,
  would_host_again BOOLEAN,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_guest_reviews_booking_id ON guest_reviews(booking_id);
CREATE INDEX idx_guest_reviews_guest ON guest_reviews(guest_id);

-- Friendships (Existing - for Phase 4)
CREATE TABLE friends (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending, accepted, blocked
  connection_degree INTEGER DEFAULT 1,
  closeness_score REAL DEFAULT 0,
  last_interaction_at TIMESTAMP,
  interaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_friends_closeness_score ON friends(closeness_score);
CREATE INDEX idx_friends_connection_degree ON friends(connection_degree);
CREATE INDEX idx_friends_last_interaction ON friends(last_interaction_at);

-- Friendship Activities (Existing - for Phase 4)
CREATE TABLE friendship_activities (
  id SERIAL PRIMARY KEY,
  friendship_id INTEGER REFERENCES friends(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,  -- post_tag, comment, like, event_together, message
  activity_data JSONB DEFAULT '{}',
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_friendship_activities_friendship ON friendship_activities(friendship_id);
CREATE INDEX idx_friendship_activities_type ON friendship_activities(activity_type);
```

---

## API Endpoints

### Complete API Reference

#### Housing Listings

```
GET    /api/host-homes                    # Get all active listings
GET    /api/host-homes/user/:userId       # Get user's properties
GET    /api/host-homes/:id                # Get specific property
POST   /api/host-homes                    # Create new property
PATCH  /api/host-homes/:id                # Update property
DELETE /api/host-homes/:id                # Delete property

GET    /api/host-homes/:id/availability   # Get availability calendar
PATCH  /api/host-homes/:id/availability   # Update availability
```

#### Bookings

```
GET    /api/bookings                       # Get user's bookings (guest or host)
       Query: ?role=guest|host
GET    /api/bookings/:id                   # Get specific booking
POST   /api/bookings                       # Create booking request
PATCH  /api/bookings/:id/status            # Update booking status (host)
       Body: { status: 'approved'|'rejected'|'cancelled', hostResponse? }
```

#### Reviews (Phase 2)

```
GET    /api/host-homes/:id/reviews         # Get property reviews
GET    /api/users/:userId/guest-reviews    # Get user's guest reviews
POST   /api/host-reviews                   # Create host review
       Body: { bookingId, rating, reviewText, cleanlinessRating, ... }
POST   /api/guest-reviews                  # Create guest review
       Body: { bookingId, rating, reviewText, respectRating, ... }
```

#### House Rules (Phase 3)

```
GET    /api/house-rules/templates          # Get all rule templates
GET    /api/host-homes/:id/rules           # Get property's rules
POST   /api/host-homes/:id/rules           # Set property's rules
       Body: { rules: [{ templateId?, customTitle?, ... }] }
PUT    /api/host-homes/rules/:id           # Update specific rule
DELETE /api/host-homes/rules/:id           # Delete rule
```

#### Friendship & Access Control (Phase 4)

```
GET    /api/users/:userId/connection-info/:hostId
       Response: { connectionDegree, closenessScore, mutualFriends, sharedMemories, isConnected }

POST   /api/host-homes/:id/check-booking-eligibility
       Response: { eligible, reason?, connectionInfo }

PATCH  /api/host-homes/:id/booking-restrictions
       Body: { whoCanBook, minimumClosenessScore, allowUnconnected }
```

---

## Frontend Components

### Component Library

#### Media Components (Phase 1)

**MediaUploader**
- Location: `client/src/components/media/MediaUploader.tsx`
- Purpose: Upload and manage property photos/videos
- Features: Drag-to-reorder, thumbnail selection, compression
- Props: `currentMedia`, `currentOrder`, `currentThumbnail`, `onMediaChange`, `maxFiles`, `acceptVideo`

#### Review Components (Phase 2)

**StarRating**
- Location: `client/src/components/reviews/StarRating.tsx`
- Purpose: Interactive star rating input
- Props: `rating`, `onChange`, `size`, `readonly`

**RatingSummary**
- Location: `client/src/components/reviews/RatingSummary.tsx`
- Purpose: Display aggregate review statistics
- Props: `reviews`

**ReviewList**
- Location: `client/src/components/reviews/ReviewList.tsx`
- Purpose: Paginated review display
- Props: `reviews`, `type`, `emptyMessage`

**ReviewForm**
- Location: `client/src/components/reviews/ReviewForm.tsx`
- Purpose: Submit review dialog
- Props: `bookingId`, `revieweeType`, `onSuccess`

#### House Rules Components (Phase 3)

**HouseRulesSelector**
- Location: `client/src/components/housing/HouseRulesSelector.tsx`
- Purpose: Host interface for rule management
- Features: Template selection, custom rules, category organization
- Props: `homeId`, `initialRules`, `onChange`, `showActions`

**HouseRulesDisplay**
- Location: `client/src/components/housing/HouseRulesDisplay.tsx`
- Purpose: Guest-facing rule display
- Features: Category grouping, icon/color coding
- Props: `homeId`, `variant`, `showTitle`

#### Access Control Components (Phase 4)

**BookingRestrictionsCard**
- Location: `client/src/components/housing/BookingRestrictionsCard.tsx`
- Purpose: Host access control settings
- Features: Access level selection, closeness threshold
- Props: `propertyId`, `currentSettings`

**ConnectionInfoCard**
- Location: `client/src/components/housing/ConnectionInfoCard.tsx`
- Purpose: Display user's connection to host
- Features: Degree badge, closeness score, stats grid
- Props: `connectionInfo`, `hostName`

### Utility Functions

**houseRulesHelpers.ts**
```typescript
// Category mapping utilities
getCategoryDisplayLabel(slug: string): string
getCategoryIcon(slug: string): LucideIcon
getCategoryColor(slug: string): string
```

**friendshipHelpers.ts**
```typescript
// Connection display utilities
getConnectionLabel(degree: number): string
getConnectionColor(degree: number): string
```

---

## Testing & Validation

### Implemented Tests

#### Phase 1 Tests
- MediaUploader component unit tests
- File upload integration tests
- Drag-and-drop functionality tests
- Video playback tests

#### Phase 2 Tests
- Review creation workflow tests
- Rating calculation tests
- Review display tests
- One-review-per-booking validation

#### Phase 3 Tests
- House rules template seeding verification
- Category mapping tests
- Custom rule creation tests
- Rule display rendering tests

#### Phase 4 Tests
- Connection degree calculation (BFS algorithm)
- Closeness score calculation
- Booking eligibility checks for all access levels
- Self-booking prevention
- Connection info API response validation

### Test Commands

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- MediaUploader
npm test -- ReviewSystem
npm test -- HouseRules
npm test -- ConnectionCalculation

# E2E tests with Playwright
npm run test:e2e
```

### Manual Testing Checklist

**Phase 1: Media System**
- [ ] Upload images and videos
- [ ] Drag to reorder media
- [ ] Select thumbnail
- [ ] Verify compression works
- [ ] Test delete functionality

**Phase 2: Reviews**
- [ ] Complete a booking
- [ ] Submit host review
- [ ] Submit guest review
- [ ] Verify one review per booking
- [ ] Check review display on profiles

**Phase 3: House Rules**
- [ ] Select pre-defined templates
- [ ] Create custom rule
- [ ] View rules on listing page
- [ ] Update/delete rules
- [ ] Verify category icons and colors

**Phase 4: Access Control**
- [ ] Set "anyone" access - verify all can book
- [ ] Set "1st degree" - verify only direct friends
- [ ] Set "2nd degree" - verify friends-of-friends
- [ ] Set "custom closeness" - verify score threshold
- [ ] Check connection info display
- [ ] Verify eligibility messaging

---

## Deployment Considerations

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...
PGDATABASE=housing_db
PGUSER=postgres
PGPASSWORD=...
PGHOST=localhost
PGPORT=5432

# Application
NODE_ENV=production
PORT=5000

# Media Upload
MAX_FILE_SIZE=52428800  # 50MB in bytes
UPLOAD_DIR=/uploads

# Optional
ENABLE_VIDEO_COMPRESSION=true
```

### Database Migration

```bash
# Apply schema changes
npm run db:push

# Seed house rule templates
npm run seed:house-rules

# Verify database
npm run db:check
```

### Performance Optimizations

1. **Connection Degree Caching**: Cache BFS results with TTL
2. **Closeness Score Batching**: Recalculate scores in background jobs
3. **Media CDN**: Serve uploaded media via CDN
4. **Database Indexes**: All critical queries have indexes
5. **Query Optimization**: N+1 queries eliminated with joins

### Security Measures

1. **Authentication**: All booking/review endpoints require auth
2. **Authorization**: Users can only modify their own resources
3. **Validation**: Zod schemas validate all inputs
4. **File Upload**: Strict file type and size validation
5. **SQL Injection**: Parameterized queries via Drizzle ORM
6. **Rate Limiting**: API endpoints are rate-limited

### Monitoring

**Key Metrics to Track:**
- Booking request success rate
- Average connection degree for bookings
- Average closeness score for bookings
- Review submission rate
- Media upload success rate
- API response times
- Database query performance

**Recommended Tools:**
- Application: Sentry for error tracking
- Performance: New Relic or Datadog
- Database: PgHero for query analysis
- Logs: CloudWatch or Papertrail

---

## Future Enhancements

### Planned Features

1. **Smart Matching Algorithm**: Suggest properties based on connection strength
2. **Group Bookings**: Allow multiple guests to co-book
3. **Event Integration**: Link housing to tango events
4. **Calendar Sync**: Import/export availability to external calendars
5. **Mobile App**: Native iOS/Android apps
6. **Translation**: Multi-language support for rules and reviews
7. **AI Recommendations**: ML-powered property suggestions
8. **Blockchain Verification**: Immutable review records

### Community Features

1. **Neighborhood Guides**: Host-curated local recommendations
2. **Community Events**: Host meetups and gatherings
3. **Mentorship Program**: Experienced hosts guide new hosts
4. **Ambassador Network**: City-specific community leaders

---

## Support & Resources

### Documentation
- ESA LIFE CEO 61x21 Framework Guide
- API Reference (Swagger UI at `/api-docs`)
- Component Storybook
- Database Schema Diagram

### Community
- Mundo Tango Community Forum
- Developer Discord Channel
- Host Support Portal
- Guest Help Center

### Contact
- Technical Support: tech@mundotango.life
- Community Manager: community@mundotango.life
- Emergency: emergency@mundotango.life

---

**Document Version:** 1.0  
**Last Review:** October 5, 2025  
**Next Review:** November 5, 2025  
**Maintained By:** ESA Development Team
