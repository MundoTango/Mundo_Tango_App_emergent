# 🚀 MB.MD FULL EXECUTION PLAN - TO 98% HEALTH

**Duration:** 8 hours (4 parallel tracks)  
**Goal:** Platform health from 65% → 98%  
**Methodology:** MB.MD Parallel Execution

---

## 📊 EXECUTION OVERVIEW

### 4 Parallel Tracks Running Simultaneously

```
TRACK 1: Algorithm Agents (A2-A30)     → 4 hours → +10% health
TRACK 2: Critical API Gaps             → 2 hours → +15% health
TRACK 3: Translation Audit             → 1 hour  → +3% health
TRACK 4: Dark Mode Audit               → 1 hour  → +2% health

TOTAL: 8 hours → 65% to 98% health (+33%)
```

---

## 🎯 TRACK 1: ALGORITHM AGENTS (A2-A30) - 4 HOURS

### Phase 1.1: Core Algorithms (1 hour)

**A2: Friend Suggestions Agent**
```typescript
// server/algorithms/A2_FriendSuggestionsAgent.ts
import { AlgorithmAgent } from './AlgorithmAgent';

export class A2_FriendSuggestionsAgent extends AlgorithmAgent {
  id = 'A2';
  name = 'Friend Suggestions Algorithm';
  description = 'City-based friend matching with mutual friends & profile similarity';
  filePath = 'server/services/friendSuggestionService.ts';
  algorithmType: 'ranking' = 'ranking';
  esaLayers = [21, 24, 26];
  
  constructor() {
    super();
    this.addParameter('cityMatchWeight', 1.0, 0.1, 3.0, 'Same city priority');
    this.addParameter('mutualFriendsWeight', 1.0, 0.1, 3.0, 'Mutual connections weight');
    this.addParameter('profileSimilarityWeight', 0.8, 0.1, 2.0, 'Tango role/level match');
    this.addParameter('activityLevelWeight', 0.5, 0.1, 2.0, 'Active user priority');
  }
  
  explain(): string {
    return `I rank friend suggestions using 4 factors:
    1. City Match (30 pts) - Same city priority
    2. Mutual Friends (30 pts) - Shared connections
    3. Profile Similarity (25 pts) - Tango roles/levels
    4. Activity Level (15 pts) - Recent engagement`;
  }
  
  calculateImpactScore(): number { return 85; }
}
```

**A3: Connection Calculator Agent** - Graph traversal BFS  
**A4: Recommendation Engine Agent** - Collaborative filtering  
**A5: Group Recommendations Agent** - Community matching

### Phase 1.2: AI/ML Algorithms (1 hour)

**A6-A10:** Context, Journey, Performance, Cache, Batching

### Phase 1.3: Performance Algorithms (1 hour)

**A11-A15:** Image, Search, Feed, Notifications, Moderation

### Phase 1.4: Security + Specialized (1 hour)

**A16-A20:** Security, Rate Limit, Load Balance, Auto-Heal, Graph  
**A21-A30:** Translation, Dark Mode, Location, Events, etc.

**Deliverables:**
- [ ] 29 algorithm agent files created
- [ ] All registered in algorithmRoutes.ts
- [ ] All initialized in database
- [ ] All tested via curl

---

## 🔧 TRACK 2: CRITICAL API GAPS - 2 HOURS

### Gap 1: Favorites API (30 minutes)

**Backend Routes:**
```typescript
// server/routes.ts - Add to existing routes

// GET /api/favorites - Get user's favorites
app.get('/api/favorites', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { type } = req.query; // 'event', 'post', 'user', 'group'
  
  const favorites = await db
    .select()
    .from(favoriteItems)
    .where(eq(favoriteItems.userId, userId))
    .where(type ? eq(favoriteItems.itemType, type as string) : undefined);
    
  res.json({ favorites });
});

// POST /api/favorites - Add favorite
app.post('/api/favorites', requireAuth, async (req, res) => {
  const { itemId, itemType } = req.body;
  
  await db.insert(favoriteItems).values({
    userId: req.user!.id,
    itemId,
    itemType
  });
  
  res.json({ message: 'Added to favorites' });
});

// DELETE /api/favorites/:itemId - Remove favorite
app.delete('/api/favorites/:itemId', requireAuth, async (req, res) => {
  const { itemId } = req.params;
  const { type } = req.query;
  
  await db
    .delete(favoriteItems)
    .where(
      and(
        eq(favoriteItems.userId, req.user!.id),
        eq(favoriteItems.itemId, parseInt(itemId)),
        eq(favoriteItems.itemType, type as string)
      )
    );
    
  res.json({ message: 'Removed from favorites' });
});
```

**Test:**
```bash
curl -X POST http://localhost:5000/api/favorites \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"itemId": 1, "itemType": "event"}'
```

### Gap 2: Reactions API (30 minutes)

**Backend Routes:**
```typescript
// POST /api/reactions - Add reaction
app.post('/api/reactions', requireAuth, async (req, res) => {
  const { postId, reactionType } = req.body;
  
  // Upsert reaction (insert or update)
  await db
    .insert(reactions)
    .values({
      userId: req.user!.id,
      postId,
      reactionType
    })
    .onConflictDoUpdate({
      target: [reactions.userId, reactions.postId],
      set: { reactionType, createdAt: new Date() }
    });
    
  res.json({ message: 'Reaction added' });
});

// DELETE /api/reactions/:postId - Remove reaction
app.delete('/api/reactions/:postId', requireAuth, async (req, res) => {
  const { postId } = req.params;
  
  await db
    .delete(reactions)
    .where(
      and(
        eq(reactions.userId, req.user!.id),
        eq(reactions.postId, parseInt(postId))
      )
    );
    
  res.json({ message: 'Reaction removed' });
});

// GET /api/reactions/:postId - Get post reactions
app.get('/api/reactions/:postId', async (req, res) => {
  const { postId } = req.params;
  
  const postReactions = await db
    .select()
    .from(reactions)
    .where(eq(reactions.postId, parseInt(postId)));
    
  res.json({ reactions: postReactions });
});
```

### Gap 3: Friend Requests (1 hour)

**Complete Implementation:**
```typescript
// POST /api/friend-requests/send
app.post('/api/friend-requests/send', requireAuth, async (req, res) => {
  const { recipientId, message } = req.body;
  
  await db.insert(friendRequests).values({
    senderId: req.user!.id,
    recipientId,
    message,
    status: 'pending'
  });
  
  res.json({ message: 'Friend request sent' });
});

// POST /api/friend-requests/:requestId/accept
app.post('/api/friend-requests/:requestId/accept', requireAuth, async (req, res) => {
  const { requestId } = req.params;
  
  await db.transaction(async (tx) => {
    // Update request status
    await tx
      .update(friendRequests)
      .set({ status: 'accepted' })
      .where(eq(friendRequests.id, parseInt(requestId)));
    
    // Create friendship
    const request = await tx.query.friendRequests.findFirst({
      where: eq(friendRequests.id, parseInt(requestId))
    });
    
    if (request) {
      await tx.insert(friends).values({
        userId: request.senderId,
        friendId: request.recipientId
      });
    }
  });
  
  res.json({ message: 'Friend request accepted' });
});

// POST /api/friend-requests/:requestId/reject
app.post('/api/friend-requests/:requestId/reject', requireAuth, async (req, res) => {
  await db
    .update(friendRequests)
    .set({ status: 'rejected' })
    .where(eq(friendRequests.id, parseInt(req.params.requestId)));
    
  res.json({ message: 'Friend request rejected' });
});

// POST /api/friend-requests/:requestId/snooze
app.post('/api/friend-requests/:requestId/snooze', requireAuth, async (req, res) => {
  await db
    .update(friendRequests)
    .set({ 
      status: 'snoozed',
      snoozeUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })
    .where(eq(friendRequests.id, parseInt(req.params.requestId)));
    
  res.json({ message: 'Friend request snoozed for 7 days' });
});
```

**Deliverables:**
- [ ] Favorites API complete (3 endpoints)
- [ ] Reactions API complete (3 endpoints)
- [ ] Friend Requests complete (4 endpoints)
- [ ] All tested and working

---

## 🌍 TRACK 3: TRANSLATION AUDIT - 1 HOUR

### Scan & Fix 1,552 Translation Usages

**Automated Script:**
```bash
# Find all useTranslation usages
grep -r "useTranslation\|t(" client/src --include="*.tsx" --include="*.ts" > /tmp/translations.txt

# Find missing keys
node scripts/audit-translations.js
```

**Fix Pattern:**
```typescript
// BEFORE (missing key)
<h1>{t('Welcome')}</h1>

// AFTER (with proper key)
<h1>{t('home.welcome')}</h1>
```

**Deliverables:**
- [ ] All 1,552 usages audited
- [ ] Missing keys identified
- [ ] Translation files updated
- [ ] All keys properly scoped

---

## 🌙 TRACK 4: DARK MODE AUDIT - 1 HOUR

### Scan & Fix 1,172 Dark Mode Variants

**Automated Script:**
```bash
# Find all dark: variants
grep -r "dark:" client/src --include="*.tsx" > /tmp/darkmode.txt

# Find missing variants
node scripts/audit-darkmode.js
```

**Fix Pattern:**
```typescript
// BEFORE (missing dark mode)
<div className="bg-white text-black">

// AFTER (with dark mode)
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
```

**Deliverables:**
- [ ] All 1,172 variants audited
- [ ] Missing dark: classes identified
- [ ] All components updated
- [ ] Dark mode 100% coverage

---

## 📈 PROGRESS TRACKING

### Health Milestones

```
Start:          65% ███████████████████░░░░░░░░░░

After Track 1:  75% ██████████████████████░░░░░░░
(A2-A30 complete)

After Track 2:  90% ███████████████████████████░░
(APIs complete)

After Track 3:  93% ████████████████████████████░
(Translation audit)

After Track 4:  95% ████████████████████████████░
(Dark mode audit)

Polish & Test:  98% █████████████████████████████
(Final verification)
```

### Time Tracking

| Hour | Track 1 | Track 2 | Track 3 | Track 4 |
|------|---------|---------|---------|---------|
| 1 | A2-A5 | Favorites API | Translation scan | Dark mode scan |
| 2 | A6-A10 | Reactions API | Fix missing keys | Fix missing variants |
| 3 | A11-A15 | - | - | - |
| 4 | A16-A30 | - | - | - |
| 5-8 | Testing | Friend Requests | Verify | Verify |

---

## ✅ FINAL DELIVERABLES

### Track 1: Algorithm Agents
- [x] A1 operational (done)
- [ ] A2-A30 built (29 agents)
- [ ] All registered & tested
- [ ] Frontend dashboards

### Track 2: API Gaps
- [ ] Favorites API (3 endpoints)
- [ ] Reactions API (3 endpoints)
- [ ] Friend Requests (4 endpoints)
- [ ] All integration tested

### Track 3: Translation
- [ ] 1,552 usages audited
- [ ] Missing keys added
- [ ] All properly scoped
- [ ] 100% coverage

### Track 4: Dark Mode
- [ ] 1,172 variants audited
- [ ] Missing classes added
- [ ] All components updated
- [ ] 100% coverage

---

## 🚀 EXECUTION COMMANDS

### Initialize Tracks (Parallel)

```bash
# Track 1: Build A2
cat > server/algorithms/A2_FriendSuggestionsAgent.ts << 'EOF'
[... A2 code ...]
EOF

# Track 2: Add Favorites API
# Edit server/routes.ts

# Track 3: Translation Audit
node scripts/audit-translations.js

# Track 4: Dark Mode Audit
node scripts/audit-darkmode.js
```

### Test Everything

```bash
# Test A2
curl -X POST http://localhost:5000/api/algorithms/A2/chat \
  -d '{"message": "How do you suggest friends?"}'

# Test Favorites
curl -X POST http://localhost:5000/api/favorites \
  -d '{"itemId": 1, "itemType": "event"}'

# Test Reactions
curl -X POST http://localhost:5000/api/reactions \
  -d '{"postId": 1, "reactionType": "love"}'

# Test Friend Requests
curl -X POST http://localhost:5000/api/friend-requests/send \
  -d '{"recipientId": 2, "message": "Let's connect!"}'
```

---

## 🎯 SUCCESS CRITERIA

**98% Health Achieved When:**
- ✅ All 30 algorithm agents operational
- ✅ All 3 critical APIs working
- ✅ 100% translation coverage
- ✅ 100% dark mode coverage
- ✅ All tests passing
- ✅ Documentation updated
- ✅ Platform stable

**Result:** Production-ready platform! 🚀

---

*MB.MD Parallel Execution - 4 Tracks, 8 Hours, 98% Health*  
**LET'S EXECUTE! 🚀**
