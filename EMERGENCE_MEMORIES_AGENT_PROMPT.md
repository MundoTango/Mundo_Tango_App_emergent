# Emergence.sh Prompt for ESA LIFE CEO 61×21 Memories Agent

## Copy and paste this entire prompt into Emergence.sh:

---

Build a complete Memories page for our ESA LIFE CEO tango community platform with the following specifications:

## DESIGN SYSTEM (MT Ocean Theme)
- **Primary gradient**: `linear-gradient(135deg, #5EEAD4 0%, #155E75 100%)` (Teal → Dark Teal)
- **Glassmorphic cards**: `backdrop-filter: blur(10px)`, semi-transparent backgrounds
- **7-item sidebar navigation**: /feed, /memories, /profile, /events, /messages, /friends, /groups
- **Mobile-first responsive**: Touch-optimized with swipe gestures
- **Micro-interactions**: Ripple effects, magnetic buttons, confetti on milestones

## CORE FEATURES REQUIRED

### 1. Memory Creation System
- Rich text editor using react-quill for formatted content
- Image upload with client-side compression (browser-image-compression library)
- Video embedding via YouTube/Vimeo URL input (443MB+ video support)
- Date/location/friends tagging with autocomplete
- Privacy controls (public/friends/private)
- Draft saving with local storage
- Character counter and hashtag suggestions
- Floating action button with magnetic hover effect

### 2. Social Interaction Features
- Like/love reactions with animated hearts
- Nested comment threads with real-time updates
- Share functionality with social media integration
- Bookmark/save for later feature
- User mentions with @ autocomplete
- Reaction animations (confetti, hearts floating up)

### 3. Feed & Discovery
- Infinite scroll with virtual scrolling for performance
- Masonry grid layout for mixed media content
- Tag-based filtering with trending tags sidebar
- Search by content, user, date range, location
- "Memories On This Day" feature
- Personalized recommendations based on interactions
- Upcoming events widget integration

### 4. Real-time Features (Socket.io)
- Live feed updates when new memories posted
- Real-time reaction counters
- Typing indicators in comments
- Online presence indicators
- Push notifications for interactions
- Live collaboration on shared memories

## TECHNICAL SPECIFICATIONS

### Frontend Architecture
```typescript
// React 18 with TypeScript
- Functional components with hooks
- React Query v5 for API state management
- Context API for global state
- React Router for navigation
- Tailwind CSS with custom MT Ocean theme
- Framer Motion for animations
- Socket.io-client for WebSocket
```

### Backend API Endpoints (Express/Node.js)
```typescript
// Required endpoints with authentication
POST   /api/memories          // Create memory with media
GET    /api/memories/feed     // Paginated feed with filters
GET    /api/memories/:id      // Single memory details
PUT    /api/memories/:id      // Update memory
DELETE /api/memories/:id      // Delete memory
POST   /api/memories/:id/like // Toggle reactions
POST   /api/memories/:id/comment // Add comment
GET    /api/memories/tags/trending // Trending hashtags
POST   /api/memories/:id/share // Share memory
GET    /api/memories/search   // Search memories
```

### Database Schema (PostgreSQL with Drizzle ORM)
```typescript
// memories table
{
  id: serial primary key,
  userId: integer references users(id),
  content: text not null,
  media: jsonb[], // Array of {type, url, thumbnail}
  tags: text[],
  location: jsonb, // {lat, lng, name, address}
  eventDate: timestamp,
  privacy: enum('public', 'friends', 'private'),
  likesCount: integer default 0,
  commentsCount: integer default 0,
  sharesCount: integer default 0,
  createdAt: timestamp,
  updatedAt: timestamp
}

// memory_reactions table
{
  id: serial primary key,
  memoryId: integer references memories(id),
  userId: integer references users(id),
  reaction: enum('like', 'love', 'wow', 'celebrate'),
  createdAt: timestamp
}

// memory_comments table
{
  id: serial primary key,
  memoryId: integer references memories(id),
  userId: integer references users(id),
  parentId: integer references memory_comments(id),
  content: text,
  createdAt: timestamp
}
```

### Media Handling System
- **Cloudinary integration** for image/video storage
- **Client-side compression** before upload
- **Progressive image loading** with blur-up effect
- **Video thumbnail generation**
- **Maximum file sizes**: Images 10MB, Videos 100MB
- **Supported formats**: JPEG, PNG, GIF, MP4, WebM
- **CDN delivery** with automatic optimization

### Performance Requirements
- API response time < 200ms
- Page load time < 2 seconds
- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Bundle size < 250KB (gzipped)

### Security & Authentication
- JWT-based authentication with refresh tokens
- Rate limiting on all endpoints
- Input sanitization with DOMPurify
- CSRF protection
- Content Security Policy headers
- Image/video virus scanning

### Testing Requirements
- Unit tests with Jest (80% coverage)
- Integration tests for all API endpoints
- E2E tests with Playwright
- Performance testing with Lighthouse
- Accessibility testing (WCAG 2.1 AA)

## DATA-TESTID ATTRIBUTES FOR PLAYWRIGHT
Add these specific data-testid attributes for automated testing:
```html
<!-- Creation -->
<button data-testid="button-create-memory">
<textarea data-testid="input-memory-content">
<input data-testid="button-upload-image">
<input data-testid="input-video-url">
<input data-testid="input-hashtags">
<button data-testid="button-submit-memory">

<!-- Feed -->
<div data-testid="list-memories-feed">
<div data-testid="card-memory-{id}">

<!-- Interactions -->
<button data-testid="button-like-memory-{id}">
<button data-testid="button-comment-memory-{id}">
<button data-testid="button-share-memory-{id}">
<button data-testid="button-edit-memory-{id}">
<button data-testid="button-delete-memory-{id}">

<!-- Filters -->
<button data-testid="filter-tag-{tagname}">
<div data-testid="list-trending-tags">

<!-- Real-time indicators -->
<div data-testid="indicator-realtime-status">
<div data-testid="indicator-typing-status">
<div data-testid="indicator-live-reactions">

<!-- AI features -->
<button data-testid="button-ai-suggest">
<div data-testid="list-ai-tags">
<button data-testid="button-ai-enhance">
```

## INTEGRATION REQUIREMENTS
1. Use existing JWT authentication system from the platform
2. Connect to existing PostgreSQL database (Neon serverless)
3. Integrate with existing user profiles and friend system
4. Follow ESA LIFE CEO 61×21 security patterns
5. Include comprehensive TypeScript types
6. Proper error handling with user-friendly messages
7. Loading skeletons for all async operations
8. Offline support with service workers

## DEPLOYMENT CONFIGURATION
- Production build optimization with code splitting
- Environment variables for API keys
- Docker containerization support
- GitHub Actions CI/CD pipeline
- Monitoring with Sentry integration
- Analytics with Plausible

Deploy this as a production-ready module that integrates seamlessly with the existing ESA LIFE CEO platform, ensuring all real-time features work, media uploads are optimized, and the MT Ocean theme is consistently applied throughout.

---

## Additional Context for Emergence.sh:
- This is Priority 1 in the ESA framework
- Current pass rate: 50% (needs Socket.io and AI integration)
- Must integrate with existing authentication and database
- Focus on real functionality over UI mockups
- Include actual API implementations, not stubs