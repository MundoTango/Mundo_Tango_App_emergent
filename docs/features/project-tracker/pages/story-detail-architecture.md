# Project Tracker - Story Detail Page Architecture
## Task Management with Agent Assignment & Code Links

**Agent Lead:** Agent #65 (Sprint & Resource Management)  
**Supporting:** Agent #17 (Forms), Agent #54 (Accessibility), Agent #2 (API)  
**File:** `client/src/pages/admin/story-detail.tsx`

---

## 🎯 Page Purpose

Detailed view of a single story showing:
- Story metadata (key, summary, description, status, points)
- Agent assignments (primary + team)
- Task breakdown with code links
- Comments thread
- Activity history
- Quick actions (edit, delete, close)

This is the **MOST IMPORTANT** page - where agents actually track their work!

---

## 👥 Customer Journey

### Primary Flow: Agent Views Assigned Tasks

1. **User clicks** story from Epic Detail or Stories List
   - System loads story with all tasks
   - URL: `/admin/projects/story/{id}`

2. **User sees** story header:
   ```
   [MUN-109-2] Home Dashboard - 15 Tasks, 83 Story Points
   
   Status: In Progress | Priority: High | Sprint: Sprint 1
   Assigned to: Agent #52 (Performance Lead)
   Team: Agent #51, #53, #11, #14 (4 agents)
   
   Progress: ████████░░░░ 35% (3 of 15 tasks complete)
   ```

3. **User scrolls** to task list:
   - **TASK-010:** Add dark mode to background
     - Agent: #11 (Aurora Tide) 
     - Code: `client/src/pages/home.tsx:49-54`
     - Status: To Do | Effort: 2h
   - **TASK-011:** Lazy load widgets
     - Agent: #52 (Performance)
     - Code: `client/src/components/dashboard/Widgets.tsx:120-135`
     - Status: In Progress | Effort: 3h

4. **User clicks** "Add Task" button:
   - Modal opens with task form
   - Fields: Title, Description, Agent, Code Path, Effort

5. **User fills** task form:
   - Title: "Add testids to buttons"
   - Assign Agent: Select Agent #51 (Testing) from dropdown
   - Code Path: `client/src/pages/home.tsx`
   - Line Range: `89-95`
   - Effort: 1.5 hours
   - Acceptance Criteria: "All buttons have data-testid"

6. **User clicks** code link:
   - Opens VSCode at exact file and line
   - Agent can immediately start work

### Secondary Flow: Team Collaboration

1. Agent #51 completes TASK-010
2. Clicks "Mark Complete" → Status changes to Done
3. Adds comment: "@Agent52 Done! Added 17 testids, please review performance impact"
4. Agent #52 gets notified
5. Agent #52 views task, reviews code
6. Adds comment: "Looks good, no perf issues ✅"
7. Story progress auto-updates: 4 of 15 tasks (27%)

---

## 🎨 UI Components

### Layout Structure
```tsx
<StoryDetailPage>
  <Breadcrumbs>
    <Link to="/admin/projects">Tracker</Link> / 
    <Link to="/admin/projects/epic/{epicId}">{epicKey}</Link> / 
    {storyKey}
  </Breadcrumbs>
  
  <StoryHeader>
    <StoryTitle>{key} - {summary}</StoryTitle>
    <StoryMeta>
      <StatusBadge status={status} />
      <PriorityBadge priority={priority} />
      <SprintBadge sprint={sprint} />
    </StoryMeta>
    <AgentAssignments>
      <PrimaryAgent agent={assignedAgent} />
      <TeamAgents agents={teamAgents} />
    </AgentAssignments>
    <ProgressBar progress={progress} />
    <ActionButtons>
      <Button>Edit Story</Button>
      <Button>Add Task</Button>
      <Button>Close Story</Button>
    </ActionButtons>
  </StoryHeader>
  
  <GlassCard depth={2}>
    <Tabs defaultValue="tasks">
      <TabsList>
        <Tab value="tasks">Tasks ({taskCount})</Tab>
        <Tab value="comments">Comments ({commentCount})</Tab>
        <Tab value="activity">Activity</Tab>
      </TabsList>
      
      <TabContent value="tasks">
        <TaskList tasks={tasks} />
      </TabContent>
      
      <TabContent value="comments">
        <CommentsThread comments={comments} />
      </TabContent>
      
      <TabContent value="activity">
        <ActivityTimeline activities={activities} />
      </TabContent>
    </Tabs>
  </GlassCard>
</StoryDetailPage>
```

### Component Details

#### 1. `<StoryHeader>`
**Props:**
```typescript
{
  story: Story;
  onEdit: () => void;
  onAddTask: () => void;
  onClose: () => void;
}
```

**Renders:**
- Story key and summary (h1)
- Status/priority/sprint badges
- Agent assignments with avatars
- Progress bar with percentage
- Action buttons

#### 2. `<AgentAssignments>`
**Props:**
```typescript
{
  primaryAgent: Agent;
  teamAgents: Agent[];
  onEditAssignments: () => void;
}
```

**Renders:**
- Primary agent (large avatar + name)
- Team agents (avatar group, max 5)
- "+ X more" if > 5 team agents
- Edit button (pencil icon)

**NEW FEATURE:** Click edit → Opens agent assignment modal

#### 3. `<TaskList>`
**Props:**
```typescript
{
  tasks: Task[];
  onTaskClick: (taskId: number) => void;
  onStatusChange: (taskId: number, status: string) => void;
}
```

**Renders each task as:**
```tsx
<TaskCard>
  <TaskHeader>
    <TaskTitle>{title}</TaskTitle>
    <TaskMeta>
      <AgentBadge agent={assignedAgent} />
      <StatusBadge status={status} />
    </TaskMeta>
  </TaskHeader>
  
  <TaskBody>
    <Description>{description}</Description>
    <CodeLink filePath={codeFilePath} lineRange={lineRange} />
    <AcceptanceCriteria items={criteria} />
  </TaskBody>
  
  <TaskFooter>
    <EffortBadge estimated={estimatedHours} actual={actualHours} />
    <TaskActions>
      <Button size="sm">Edit</Button>
      <Button size="sm">Mark Complete</Button>
    </TaskActions>
  </TaskFooter>
</TaskCard>
```

#### 4. `<CodeLink>` (NEW!)
**Props:**
```typescript
{
  filePath: string; // "client/src/pages/home.tsx"
  lineRange?: string; // "49-54"
  onClick: () => void;
}
```

**Renders:**
```tsx
<div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
  <FileIcon className="w-4 h-4" />
  <code className="text-sm">
    {filePath}
    {lineRange && <span className="text-cyan-500">:{lineRange}</span>}
  </code>
  <Button 
    size="sm" 
    variant="ghost"
    onClick={handleOpenInEditor}
    data-testid="button-open-code"
  >
    <ExternalLink className="w-4 h-4" />
    Open
  </Button>
</div>
```

**Functionality:**
- Clicking "Open" triggers VSCode protocol:
  - `vscode://file/{absolutePath}:{startLine}:{startColumn}`
  - Opens editor at exact location
  - Highlights line range

#### 5. `<TaskFormModal>` (NEW!)
**Props:**
```typescript
{
  storyId: number;
  open: boolean;
  onClose: () => void;
  onSave: (task: InsertTask) => void;
}
```

**Form Fields:**
```tsx
<Form {...form}>
  <FormField name="title" label="Task Title" required />
  <FormField name="description" label="Description" type="textarea" />
  
  {/* NEW: Agent Selector */}
  <FormField name="assignedAgentId" label="Assign to Agent">
    <AgentSelector 
      value={form.watch('assignedAgentId')}
      onChange={(id) => form.setValue('assignedAgentId', id)}
      showHierarchy={true}
    />
  </FormField>
  
  {/* NEW: Code Link Input */}
  <FormField name="codeFilePath" label="Code File">
    <CodeLinkInput
      filePath={form.watch('codeFilePath')}
      lineRange={form.watch('codeLineRange')}
      onFileChange={(path) => form.setValue('codeFilePath', path)}
      onLineChange={(range) => form.setValue('codeLineRange', range)}
      autoValidate={true}
    />
  </FormField>
  
  <FormField name="estimatedHours" label="Effort (hours)" type="number" step={0.5} />
  
  <FormField name="acceptanceCriteria" label="Acceptance Criteria" type="array">
    <StringListInput 
      value={form.watch('acceptanceCriteria')}
      onChange={(list) => form.setValue('acceptanceCriteria', list)}
      placeholder="Enter criterion and press Enter"
    />
  </FormField>
  
  <FormField name="referenceImplementation" label="Reference" type="textarea"
    placeholder="Link to similar implementation or pattern to follow"
  />
</Form>
```

#### 6. `<CommentsThread>`
**Props:**
```typescript
{
  storyId: number;
  comments: Comment[];
  onAddComment: (text: string) => void;
}
```

**Renders:**
- Comment list (newest first)
- Comment input box (markdown support)
- @mention support (Agent #XX)
- Realtime updates (Socket.io)

---

## 📊 Data Model

### Story (Detail View)
```typescript
type StoryDetail = {
  id: number;
  key: string; // MUN-109-2
  epicId: number;
  epicKey: string; // MUN-109
  summary: string;
  description: string;
  status: 'to_do' | 'in_progress' | 'in_review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  storyPoints: number;
  
  // NEW: Agent assignments
  assignedAgentId: string; // "agent-52"
  assignedAgent: Agent;
  teamAgentIds: string[]; // ["agent-51", "agent-53", ...]
  teamAgents: Agent[];
  
  sprintId?: number;
  sprint?: { id: number; name: string };
  
  estimatedHours: number;
  actualHours: number;
  
  // NEW: Code files
  codeFiles: {
    path: string;
    lineRange?: string;
    description?: string;
  }[];
  
  tasks: Task[];
  comments: Comment[];
  
  progress: number; // 0-100
  completedTaskCount: number;
  totalTaskCount: number;
  
  createdAt: Date;
  updatedAt: Date;
};
```

### Task (Full Detail)
```typescript
type Task = {
  id: number;
  storyId: number;
  title: string;
  description?: string;
  status: 'to_do' | 'in_progress' | 'in_review' | 'done' | 'blocked';
  
  // NEW: Agent assignment
  assignedAgentId?: string;
  assignedAgent?: Agent;
  
  // NEW: Code linking
  codeFilePath?: string; // "client/src/pages/home.tsx"
  codeLineRange?: string; // "49-54"
  
  estimatedHours?: number;
  actualHours?: number;
  
  // NEW: Acceptance criteria
  acceptanceCriteria: string[];
  referenceImplementation?: string;
  
  createdAt: Date;
  updatedAt: Date;
};
```

### Agent
```typescript
type Agent = {
  id: string; // "agent-52"
  name: string; // "Agent #52 (Performance Lead)"
  division: string; // "Chief #2"
  capabilities: string[]; // ["performance", "optimization"]
  avatar?: string;
  currentWorkload: number; // hours
  capacity: number; // hours per sprint
};
```

---

## 🔌 API Endpoints

### GET `/api/tracker/stories/:id`
**Purpose:** Fetch story with all tasks and comments

**Response:**
```typescript
{
  success: true;
  data: {
    ...story,
    tasks: Task[],
    comments: Comment[]
  }
}
```

### POST `/api/tracker/stories/:id/assign-agents` (NEW!)
**Purpose:** Assign agents to story

**Body:**
```typescript
{
  primaryAgentId: string;
  teamAgentIds: string[];
}
```

**Response:**
```typescript
{
  success: true;
  data: StoryDetail
}
```

### POST `/api/tracker/tasks`
**Purpose:** Create task with agent and code link

**Body:**
```typescript
{
  storyId: number;
  title: string;
  description?: string;
  assignedAgentId?: string; // NEW
  codeFilePath?: string; // NEW
  codeLineRange?: string; // NEW
  estimatedHours?: number;
  acceptanceCriteria?: string[]; // NEW
  referenceImplementation?: string; // NEW
}
```

### POST `/api/tracker/tasks/:id/link-code` (NEW!)
**Purpose:** Add/update code link to existing task

**Body:**
```typescript
{
  filePath: string;
  lineRange?: string;
  commitSha?: string;
}
```

### PUT `/api/tracker/tasks/:id/status`
**Purpose:** Update task status

**Body:**
```typescript
{
  status: 'to_do' | 'in_progress' | 'in_review' | 'done' | 'blocked';
  actualHours?: number; // When marking done
}
```

**Side Effect:** Auto-updates story progress

---

## 🔄 State Management

### React Query
```tsx
const { data: story, isLoading } = useQuery<{ data: StoryDetail }>({
  queryKey: ['/api/tracker/stories', storyId],
  refetchInterval: 10000 // Real-time updates every 10s
});

const assignAgentsMutation = useMutation({
  mutationFn: (data: { primaryAgentId: string; teamAgentIds: string[] }) =>
    apiRequest('POST', `/api/tracker/stories/${storyId}/assign-agents`, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/tracker/stories', storyId] });
    toast({ title: 'Agents assigned successfully' });
  }
});

const createTaskMutation = useMutation({
  mutationFn: (task: InsertTask) =>
    apiRequest('POST', '/api/tracker/tasks', task),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/tracker/stories', storyId] });
    setTaskModalOpen(false);
    toast({ title: 'Task created successfully' });
  }
});
```

### Local State
```tsx
const [taskModalOpen, setTaskModalOpen] = useState(false);
const [editTaskId, setEditTaskId] = useState<number | null>(null);
const [activeTab, setActiveTab] = useState<'tasks' | 'comments' | 'activity'>('tasks');
```

---

## ✨ Aurora Tide Compliance

### Design System Checklist
- [x] **GlassCard:** Page container uses `<GlassCard depth={2}>`
- [x] **Task Cards:** Use `<GlassCard depth={1}` with hover effect
- [x] **Status Badges:** MT Ocean gradient colors
- [x] **Agent Avatars:** Circular with glassmorphic border
- [x] **Code Links:** Monospace font with cyan accent
- [x] **Dark Mode:**
  - All elements support dark mode
  - Code blocks: `bg-gray-900 dark:bg-gray-950`
  - Badges adapt colors
- [x] **Animations:**
  - Task cards FadeIn on load
  - Status change: ScaleIn animation
  - Progress bar: Smooth fill transition
- [x] **i18n:**
  - `t('tracker.story.assign_agent')`
  - `t('tracker.story.add_task')`
  - `t('tracker.story.code_link')`
- [x] **Accessibility:**
  - Breadcrumbs navigation
  - Task cards keyboard accessible (Enter to expand)
  - Code links have descriptive ARIA labels
  - Status changes keyboard triggered
- [x] **Data-testids:**
  - `data-testid="story-header"`
  - `data-testid="agent-primary-{agentId}"`
  - `data-testid="task-card-{taskId}"`
  - `data-testid="button-add-task"`
  - `data-testid="code-link-{taskId}"`
  - `data-testid="input-code-file-path"`
  - `data-testid="select-agent-assignment"`

---

## 🧪 Testing Plan

### E2E Tests
**File:** `tests/e2e/tracker/story-detail.spec.ts`

```typescript
test('should assign agents to story', async ({ page }) => {
  await page.goto('/admin/projects/story/1');
  
  await page.getByTestId('button-edit-agents').click();
  await page.getByTestId('select-primary-agent').click();
  await page.getByText('Agent #52 (Performance)').click();
  
  await page.getByTestId('button-save-agents').click();
  await expect(page.getByTestId('agent-primary-agent-52')).toBeVisible();
});

test('should create task with code link', async ({ page }) => {
  await page.goto('/admin/projects/story/1');
  
  await page.getByTestId('button-add-task').click();
  await page.getByTestId('input-task-title').fill('Add dark mode');
  await page.getByTestId('select-agent-assignment').click();
  await page.getByText('Agent #11 (Aurora Tide)').click();
  
  await page.getByTestId('input-code-file-path').fill('client/src/pages/home.tsx');
  await page.getByTestId('input-code-line-range').fill('49-54');
  await page.getByTestId('input-estimated-hours').fill('2');
  
  await page.getByTestId('button-submit-task').click();
  
  await expect(page.getByText('Task created successfully')).toBeVisible();
  await expect(page.getByTestId('task-card-1')).toBeVisible();
  await expect(page.getByText('client/src/pages/home.tsx:49-54')).toBeVisible();
});

test('should open code link in VSCode', async ({ page, context }) => {
  await page.goto('/admin/projects/story/1');
  
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.getByTestId('button-open-code').first().click()
  ]);
  
  expect(newPage.url()).toContain('vscode://file/');
});
```

---

## 📈 Performance Targets

| Metric | Target | Optimization |
|--------|--------|--------------|
| Page Load | < 500ms | Prefetch story on list hover |
| Task Create | < 1s | Optimistic UI update |
| Status Update | < 200ms | Websocket real-time |
| Comments | Real-time | Socket.io subscription |

---

## ✅ Completion Criteria

- [ ] Story detail displays all metadata
- [ ] Agent assignment UI working
- [ ] Task creation with agent + code link
- [ ] Code links open in VSCode
- [ ] Task status changes update story progress
- [ ] Comments thread working
- [ ] Real-time updates via websocket
- [ ] All data-testids present
- [ ] E2E tests passing
- [ ] Aurora Tide compliant
- [ ] Accessibility verified

---

**Status:** Architecture complete  
**Next:** Build AgentSelector and CodeLinkInput components
