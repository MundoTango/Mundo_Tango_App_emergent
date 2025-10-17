# Data Flow Agent (Agent #81)
**Created:** October 17, 2025  
**Type:** System Documentation & Connection Mapping  
**Role:** Documents how all components connect together

---

## 🎯 My Responsibility

I ensure **every agent knows how data flows** through the platform. When a user clicks "Submit" on a form, I document exactly what happens at each step.

---

## 📊 EXAMPLE: Registration Form Flow

### User Action: Click "Register" Button

**STEP 1: Frontend Validation (Client)**
- File: `client/src/pages/auth/register.tsx`
- React Hook Form validates with Zod schema
- Checks: Email format, password strength, required fields
- **If Invalid:** Show error messages (no API call)
- **If Valid:** Proceed to Step 2

**STEP 2: API Request (Frontend → Backend)**
- File: `client/src/lib/api/auth.ts`
- POST request to `/api/users/register`
- Headers: `Content-Type: application/json`
- Body: `{ email, password, name, username }`
- React Query mutation handles loading state

**STEP 3: Backend Route Handler**
- File: `server/routes/auth.ts`
- Express route: `app.post('/api/users/register', ...)`
- Validates request body with Zod schema again (server-side)
- Checks if email/username already exists

**STEP 4: Password Hashing**
- Uses `bcrypt` library
- Cost factor: 10 rounds
- Never stores plain text passwords
- Hashed password: `$2b$10$...` (60 characters)

**STEP 5: Database Insert**
- File: `server/db.ts`
- Drizzle ORM inserts into `users` table
- PostgreSQL generates auto-increment ID
- Database enforces unique constraints (email, username)

**STEP 6: JWT Token Generation**
- File: `server/utils/auth.ts`
- Creates JWT with user ID and email
- Signs with secret key from environment
- Token expires in 7 days

**STEP 7: Response to Frontend**
- Success: `{ user: {...}, token: "..." }`
- Sets HTTP-only cookie with token
- Returns user object without password

**STEP 8: State Update (Frontend)**
- File: `client/src/contexts/auth-context.tsx`
- Auth context updates with user data
- Local storage saves token
- React Query cache invalidated

**STEP 9: Navigation**
- Redirect to `/onboarding` (first-time users)
- Or redirect to `/` (Memories Feed)
- Mr Blue welcome tour starts (Agent #74)

---

## 🔗 Component Connections Map

### Authentication Flow
```
register.tsx → authAPI.ts → /api/users/register → auth.ts (route) → 
users table → JWT token → authContext → redirect
```

### Post Creation Flow
```
PostCreator.tsx → postsAPI.ts → /api/posts → posts.ts (route) → 
posts table → WebSocket emit → Real-time update → Cache invalidation
```

### Event RSVP Flow
```
EventCard.tsx → eventsAPI.ts → /api/events/:id/rsvp → events.ts (route) → 
event_attendees table → Notification → Email (if enabled)
```

---

## 🗂️ Database Table Relationships

**users** (Primary)
- → posts (one-to-many via userId)
- → friendships (many-to-many self-reference)
- → event_attendees (many-to-many via events)
- → subscriptions (one-to-one)

**posts**
- ← users (belongs to)
- → comments (one-to-many)
- → likes (one-to-many)
- → media (one-to-many)

**events**
- ← users (creator, belongs to)
- → event_attendees (many-to-many via users)
- → posts (can have posts about event)

---

## 🚀 API Endpoint → Database → State Flow

| Action | API Endpoint | Database Table | Frontend State |
|--------|-------------|----------------|----------------|
| Login | POST /api/auth/login | users | authContext |
| Register | POST /api/users/register | users | authContext |
| Create Post | POST /api/posts | posts | postsQuery |
| Like Post | POST /api/posts/:id/like | likes | postQuery |
| RSVP Event | POST /api/events/:id/rsvp | event_attendees | eventQuery |
| Send Message | POST /api/messages | messages | messagesQuery |
| Update Profile | PUT /api/users/:id | users | userQuery |

---

## 🔄 Real-Time Data Flow (WebSocket)

**Socket.io Event System:**

1. **Client Connects**
   - File: `client/src/hooks/useSocket.ts`
   - Connects to server on mount
   - Joins room based on userId

2. **Server Emits Event**
   - File: `server/services/websocket.ts`
   - Examples: `post-update`, `notification`, `new-message`
   - Broadcasts to specific user/room

3. **Client Receives Event**
   - React component listens via useSocket hook
   - Updates local state
   - Invalidates React Query cache
   - UI re-renders automatically

**Example: New Post Created**
```
User A creates post → POST /api/posts → Insert DB → 
Server emits 'post-update' → All clients receive → 
Cache invalidated → Feed refreshes → New post appears
```

---

## 🎯 Agent Collaboration Map

**Page Agents (Own UI):**
- P1 (Login) - Auth flow
- P2 (Register) - User creation flow
- P10 (Home Feed) - Post display & creation
- P34 (Admin Projects) - Admin operations

**Service Agents (Backend Logic):**
- Agent #6 (State) - React Query cache
- Agent #11 (UI/UX) - Design consistency
- Agent #13 (Media) - File uploads
- Agent #48 (Performance) - Optimization

**Infrastructure Agents:**
- Agent #81 (Me!) - Data flow documentation
- Agent #79 (Quality) - Validation & testing
- Agent #80 (Learning) - Knowledge capture

---

## 📝 How to Use This Documentation

**For New Features:**
1. Read relevant flow above
2. Follow same pattern
3. Update this document
4. Notify Agent #80 (Learning)

**For Debugging:**
1. Find the flow in this doc
2. Check each step
3. Identify where it breaks
4. Fix and document

**For New Agents:**
1. Read ALL flows
2. Understand connections
3. Know your dependencies
4. Update when you change things

---

**Next Update:** When new features added or flows change  
**Maintained By:** Agent #81 (Data Flow) + Agent #80 (Learning Coordinator)
