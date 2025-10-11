# Project Tracker - Sprint Board Page Architecture
## Active Sprint Kanban with Burndown

**Agent Lead:** Agent #63 (Sprint Management)  
**Supporting:** Agent #17 (Kanban UI), Agent #52 (Performance), Agent #2 (API)  
**File:** `client/src/pages/admin/sprint-board.tsx`

---

## 🎯 Page Purpose

Active sprint management with:
- Kanban board (To Do, In Progress, In Review, Done columns)
- Drag-drop story movement
- Sprint burndown chart
- Agent workload visualization
- Sprint actions (start, complete, close)

---

## 👥 Customer Journey

1. User clicks "Sprint Board" tab
2. User sees active sprint "Sprint 1 - Home Dashboard"
3. User drags story from "To Do" to "In Progress"
4. System updates story status
5. Burndown chart auto-updates
6. Agent workload recalculates

---

## 🎨 UI Components

```tsx
<SprintBoardPage>
  <SprintHeader sprint={activeSprint} />
  <SprintMetrics>
    <BurndownChart data={burndownData} />
    <WorkloadChart agents={agentWorkload} />
  </SprintMetrics>
  
  <KanbanBoard>
    <KanbanColumn id="to_do" title="To Do">
      {stories.filter(s => s.status === 'to_do').map(story => 
        <StoryCard 
          key={story.id} 
          story={story} 
          draggable 
          onDragEnd={handleStatusChange}
        />
      )}
    </KanbanColumn>
    
    <KanbanColumn id="in_progress" title="In Progress">
      {/* Stories in progress */}
    </KanbanColumn>
    
    <KanbanColumn id="in_review" title="In Review">
      {/* Stories in review */}
    </KanbanColumn>
    
    <KanbanColumn id="done" title="Done">
      {/* Completed stories */}
    </KanbanColumn>
  </KanbanBoard>
</SprintBoardPage>
```

**Key Features:**
- **Drag & Drop:** Uses `@dnd-kit/core` for smooth dragging
- **Real-time:** Websocket updates when other agents move cards
- **Burndown:** Shows ideal vs actual progress line
- **Workload:** Bar chart showing each agent's capacity

---

## 📊 Data Model

```typescript
type SprintBoard = {
  sprint: {
    id: number;
    name: string;
    startDate: Date;
    endDate: Date;
    status: 'planning' | 'active' | 'completed';
    goal: string;
  };
  
  stories: Story[];
  
  burndown: {
    date: Date;
    idealPoints: number;
    actualPoints: number;
  }[];
  
  agentWorkload: {
    agentId: string;
    agentName: string;
    assigned: number;
    capacity: number;
  }[];
};
```

---

## 🔌 API Endpoints

- GET `/api/tracker/sprints/:id/board` - Fetch sprint board data
- PUT `/api/tracker/stories/:id/move` - Move story to column
- GET `/api/tracker/sprints/:id/burndown` - Get burndown data
- GET `/api/tracker/sprints/:id/workload` - Get agent workload

---

## 🎨 Drag & Drop Implementation

```typescript
import { DndContext, DragEndEvent } from '@dnd-kit/core';

function SprintBoard() {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const storyId = active.id;
      const newStatus = over.id as StoryStatus;
      
      updateStoryMutation.mutate({
        id: storyId,
        status: newStatus
      });
    }
  };
  
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <KanbanBoard stories={stories} />
    </DndContext>
  );
}
```

---

## ✨ Aurora Tide Compliance

- [x] Kanban columns use GlassCard
- [x] Story cards glassmorphic with dragging shadow
- [x] Burndown chart with MT Ocean gradient
- [x] Workload chart with agent avatars
- [x] Smooth drag animations (GSAP)
- [x] Dark mode: All charts adapt
- [x] Data-testids on all draggable elements

---

## 🧪 Testing Plan

```typescript
test('should drag story between columns', async ({ page }) => {
  await page.goto('/admin/projects/sprint/1');
  
  const storyCard = page.getByTestId('story-card-1');
  const targetColumn = page.getByTestId('column-in-progress');
  
  await storyCard.dragTo(targetColumn);
  
  await expect(page.getByText('Story updated')).toBeVisible();
  await expect(targetColumn.locator('[data-testid="story-card-1"]')).toBeVisible();
});
```

---

**Status:** Architecture complete  
**Next:** Implement drag-drop kanban board
