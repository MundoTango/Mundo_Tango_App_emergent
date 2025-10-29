# Project Tracker - Epic Detail Page Architecture
## Story Breakdown & Progress Tracking

**Agent Lead:** Agent #65 (Sprint & Resource Management)  
**Supporting:** Agent #17 (Layout), Agent #14 (Code Quality), Agent #2 (API)  
**File:** `client/src/pages/admin/epic-detail.tsx`

---

## 🎯 Page Purpose

Detailed view of a single epic showing:
- Epic metadata (key, summary, description, status, priority)
- Story list with progress
- Overall epic progress chart
- Agent distribution
- Activity timeline
- Quick actions (edit, create story, close)

---

## 👥 Customer Journey

1. User clicks epic from list → Page loads
2. User sees epic header with 7 stories, 35% complete
3. User views story cards → Clicks story → Goes to detail
4. User clicks "Create Story" → Modal opens
5. User creates story → Story appears in list

---

## 🎨 UI Components

```tsx
<EpicDetailPage>
  <Breadcrumbs />
  <EpicHeader epic={epic} onEdit={} onCreate Story={} />
  <ProgressChart progress={35} totalStories={7} completedStories={3} />
  <StoryList stories={stories} onClick={navigateToStory} />
  <ActivityTimeline activities={activities} />
</EpicDetailPage>
```

**Key Features:**
- Progress pie chart (completed vs remaining stories)
- Story cards with status badges
- Agent avatars on each story
- Click story → Navigate to Story Detail

---

## 📊 Data Model

```typescript
type EpicDetail = {
  id: number;
  key: string; // MUN-109
  summary: string;
  description: string;
  status: string;
  priority: string;
  stories: Story[];
  progress: number; // 0-100
  completedStories: number;
  totalStories: number;
  assignedAgents: Agent[];
};
```

---

## 🔌 API Endpoints

- GET `/api/tracker/epics/:id` - Fetch epic with stories
- POST `/api/tracker/stories` - Create story within epic
- PUT `/api/tracker/epics/:id` - Update epic

---

## ✨ Aurora Tide Compliance

- [x] GlassCard containers
- [x] Story cards with hover effects
- [x] Progress chart with MT Ocean colors
- [x] Dark mode support
- [x] All data-testids present

---

**Status:** Architecture complete
