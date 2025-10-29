# 🚀 EMERGENCE.SH INSTRUCTIONS FOR ESA LIFE CEO 61×21 PLATFORM

## 📋 **COPY AND PASTE TO EMERGENCE.SH**

### **Platform Context**
You are building agent implementations for the **ESA LIFE CEO 61×21 AGENTS FRAMEWORK** - a comprehensive AI-powered life management and community platform focusing on Mundo Tango (MT) community management. This platform uses a 61-layer technical architecture managed by specialized AI agents.

### **CRITICAL DESIGN REQUIREMENTS**

#### **MT Ocean Theme (NON-NEGOTIABLE)**
```css
/* Core gradient: */
background: linear-gradient(135deg, #5EEAD4 0%, #155E75 100%);

/* Color palette: */
--primary: #5EEAD4 (turquoise)
--secondary: #155E75 (deep teal)
--accent: #0891B2 (cyan)
--glass: rgba(94, 234, 212, 0.1)
```

#### **Design System Requirements**
- **Glassmorphic cards** with `backdrop-filter: blur(10px)` and semi-transparency
- **7-item sidebar navigation**: /memories, /events, /profile, /messages, /friends, /groups, /community
- **Mobile-first responsive design** with touch optimization
- **Magnetic hover effects** for buttons and interactive elements
- **Gradient text** for headings using the MT Ocean palette

### **TECHNICAL ARCHITECTURE REQUIREMENTS**

#### **Frontend Stack**
```json
{
  "framework": "React 18 with TypeScript",
  "styling": "Tailwind CSS + shadcn/ui",
  "state": "React Query + Context API",
  "routing": "wouter (NOT React Router)",
  "forms": "react-hook-form + zod validation",
  "realtime": "Socket.io client"
}
```

#### **Backend Stack**
```json
{
  "runtime": "Node.js + Express",
  "database": "PostgreSQL with Drizzle ORM",
  "auth": "JWT tokens (existing system integration)",
  "realtime": "Socket.io server",
  "storage": "Cloudinary for media",
  "validation": "Zod schemas"
}
```

#### **Integration Requirements**
- **MUST integrate with existing authentication system** (JWT tokens)
- **MUST use existing PostgreSQL database** with Drizzle ORM
- **MUST follow ESA security patterns** and error handling
- **MUST include comprehensive TypeScript types**
- **MUST ensure WCAG accessibility compliance**

---

## 🎯 **AGENT IMPLEMENTATION PRIORITIES**

### **PHASE 1: MEMORIES AGENT (START HERE)**

**Build a complete Memories page for the tango community platform:**

#### **Core Features Required**
1. **Memory Creation**
   - Rich text editor with react-quill
   - Image/video upload with client-side compression
   - Date/location/friends tagging with autocomplete
   - Category selection (Performance, Social, Learning, Travel)

2. **Memory Display**
   - Grid layout with infinite scroll and lazy loading
   - Like/love/comment reactions with real-time updates
   - Memory sharing to social media platforms
   - Tag-based filtering with trending tags display

3. **Interaction Features**
   - Floating "Create Memory" button with magnetic hover
   - Real-time updates via Socket.io WebSocket
   - Comment threading with live typing indicators
   - Social sharing with preview generation

#### **Technical Implementation**
```typescript
// Required API endpoints:
POST /api/memories          // Create new memory
GET /api/memories/feed      // Get paginated feed
POST /api/memories/:id/like // Toggle reactions
POST /api/memories/:id/comment // Add comments
GET /api/memories/tags      // Get trending tags
DELETE /api/memories/:id    // Delete (owner only)

// Required WebSocket events:
live_reaction, new_comment, typing_indicator
```

#### **Database Schema Requirements**
```typescript
// Extend existing schema in shared/schema.ts
const memories = pgTable('memories', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull(),
  content: text('content').notNull(),
  mediaUrls: text('media_urls').array(),
  tags: text('tags').array(),
  location: varchar('location'),
  createdAt: timestamp('created_at').defaultNow(),
  likesCount: integer('likes_count').default(0),
  commentsCount: integer('comments_count').default(0)
});
```

### **PHASE 2: PROFESSIONAL GROUPS AGENT**

**Build professional tango groups management system:**

#### **Role-Based Access Control**
```typescript
enum ProfessionalRole {
  DJ = 'dj',
  Teacher = 'teacher', 
  Performer = 'performer',
  Choreographer = 'choreographer',
  ContentCreator = 'content_creator',
  Vendor = 'vendor'
}

enum GroupPermission {
  Owner = 'owner',
  Admin = 'admin',
  Moderator = 'moderator', 
  Member = 'member',
  Guest = 'guest'
}
```

#### **Core Features**
- Create/join professional groups with approval workflows
- Resource sharing (sheet music, choreographies, techniques)
- Job opportunity board with applications
- Professional networking with connection requests
- Skills verification with peer endorsements
- Group analytics for owners

### **PHASE 3: EVENTS MANAGEMENT AGENT**

**Build comprehensive event management:**

#### **Dual Interface System**
1. **Organizer Dashboard**
   - Event creation with rich details
   - Stripe integration for ticket sales
   - Guest list management with QR check-in
   - Real-time analytics and insights

2. **Attendee Experience**
   - Event discovery with advanced filters
   - RSVP and secure ticketing
   - Calendar integration with reminders
   - Social sharing and reviews

#### **Integration Requirements**
```typescript
// Required integrations:
- Google Maps API for venue locations
- Stripe API for payment processing
- Resend/SendGrid for email automation
- Calendar exports (iCal, Google Calendar)
- WebSocket for real-time availability updates
```

---

## 🛠 **DEVELOPMENT GUIDELINES**

### **Code Quality Standards**
- **TypeScript**: Strict mode enabled, comprehensive type definitions
- **Testing**: 90%+ test coverage with unit and integration tests
- **Performance**: <100ms API response times, optimized queries
- **Accessibility**: WCAG 2.1 AA compliance with screen reader support
- **Security**: Input validation, SQL injection prevention, XSS protection

### **File Structure**
```
project/
├── client/src/
│   ├── pages/           # Main page components
│   ├── components/      # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utilities and configurations
├── server/
│   ├── routes/         # API route handlers
│   ├── middleware/     # Express middleware
│   └── services/       # Business logic
└── shared/
    └── schema.ts       # Database schema and types
```

### **Integration Commands**
After completing each agent in Emergence.sh:

1. **Export with GitHub Integration**
   - Enable GitHub integration in Emergence.sh
   - Create detailed commit history
   - Include integration documentation

2. **Test Integration Locally**
   - Verify MT Ocean theme compliance
   - Test with existing authentication
   - Run performance benchmarks

3. **Deploy to Production**
   - Use existing deployment pipeline
   - Monitor performance metrics
   - Validate user experience

---

## 📊 **SUCCESS METRICS**

### **Performance Targets**
- **Page Load Time**: <2 seconds initial load
- **API Response Time**: <100ms average
- **Real-time Latency**: <50ms WebSocket events
- **Mobile Performance**: 90+ Lighthouse score

### **User Experience Metrics**
- **Theme Consistency**: 100% MT Ocean compliance
- **Accessibility Score**: WCAG 2.1 AA (minimum)
- **Mobile Responsiveness**: Perfect on all devices
- **Error Rate**: <0.1% API errors

### **Integration Success**
- **Authentication**: Seamless JWT integration
- **Database**: Zero migration issues
- **Real-time**: Live updates working across all features
- **Deployment**: <24 hours from completion to production

---

## 🚀 **START WITH MEMORIES AGENT**

**Immediate Action**: Build the complete Memories Agent implementation using the specifications above. Focus on:

1. **Perfect MT Ocean theme implementation**
2. **Full real-time functionality with Socket.io**  
3. **Complete CRUD operations for memories**
4. **Integration-ready code structure**
5. **Comprehensive testing coverage**

**Deploy with GitHub integration enabled for seamless ESA platform integration.**

---

**This is your comprehensive guide for building production-ready agents for the ESA LIFE CEO 61×21 platform. Each agent must maintain the MT Ocean design consistency, integrate seamlessly with existing systems, and deliver enterprise-grade performance.**