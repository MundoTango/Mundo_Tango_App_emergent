# Project Tracker - Epics List Page Architecture
## Table View with Filtering & Sorting

**Agent Lead:** Agent #65 (Sprint & Resource Management)  
**Supporting:** Agent #17 (Tables), Agent #52 (Search), Agent #2 (API)  
**File:** `client/src/pages/admin/projects.tsx` (Tab: Epics)

---

## 🎯 Page Purpose

Displays all epics in sortable, filterable table with:
- Columns: Key, Summary, Status, Priority, Stories Count, Agents, Progress
- Multi-filter: Status, Priority, Assigned Agent
- Bulk actions: Change status, Delete, Export
- Quick navigation to Epic Detail

---

## 👥 Customer Journey

### Primary Flow: Find & Filter Epics

1. **User clicks** "Epics" tab
   - System loads all epics in table
   - Default sort: Created date (desc)

2. **User sees** table with columns:
   | Key | Summary | Status | Priority | Stories | Agents | Progress |
   |-----|---------|--------|----------|---------|--------|----------|
   | MUN-109 | Re-Audit Execution | In Progress | Critical | 7 | 11 agents | 35% |
   | MUN-100 | Master Tracker | Done | High | 3 | 4 agents | 100% |

3. **User filters** by status:
   - Clicks status filter dropdown
   - Selects "In Progress"
   - Table updates to show only in-progress epics

4. **User sorts** by priority:
   - Clicks "Priority" column header
   - Table re-sorts: Critical → High → Medium → Low

5. **User clicks** epic row:
   - Navigates to Epic Detail page
   - Shows story breakdown

### Secondary Flow: Bulk Actions

1. User selects checkboxes for 3 epics
2. "Bulk Actions" button becomes active
3. User clicks → "Change Status to Done"
4. System updates all 3 epics
5. Toast: "3 epics updated successfully"

---

## 🎨 UI Components

### Layout Structure
```tsx
<EpicsListPage>
  <PageHeader>
    <h2>Epics</h2>
    <SearchBar />
    <FilterBar>
      <StatusFilter />
      <PriorityFilter />
      <AgentFilter />
    </FilterBar>
    <ActionBar>
      <Button>Create Epic</Button>
      <BulkActionsButton disabled={selectedCount === 0} />
    </ActionBar>
  </PageHeader>
  
  <GlassCard>
    <EpicsTable>
      <TableHeader sortable />
      <TableBody>
        {epics.map(epic => <EpicRow key={epic.id} />)}
      </TableBody>
    </EpicsTable>
    <Pagination />
  </GlassCard>
</EpicsListPage>
```

### Component Details

#### 1. `<EpicsTable>`
**Props:**
```typescript
{
  epics: Epic[];
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
  selectedIds: number[];
  onSelectIds: (ids: number[]) => void;
}
```

**Columns:**
- Checkbox (select)
- Key (sortable, clickable)
- Summary (sortable, truncated 50 chars)
- Status (badge with color)
- Priority (badge with icon)
- Stories (count badge, clickable)
- Agents (avatar group, max 5 shown)
- Progress (progress bar)
- Actions (dropdown menu)

#### 2. `<EpicRow>`
**Props:**
```typescript
{
  epic: Epic;
  selected: boolean;
  onSelect: (id: number) => void;
  onClick: (id: number) => void;
}
```

**Renders:**
- Hover effect (glassmorphic highlight)
- Status badge with MT Ocean colors
- Agent avatars with tooltips
- Progress bar with percentage

#### 3. `<FilterBar>`
**Props:**
```typescript
{
  filters: {
    status?: string[];
    priority?: string[];
    agentId?: string;
  };
  onFilterChange: (filters: Filters) => void;
}
```

**Filters:**
- **Status:** Multi-select (To Do, In Progress, Done, Cancelled)
- **Priority:** Multi-select (Low, Medium, High, Critical)
- **Agent:** Single select (100 agents hierarchical)

#### 4. `<BulkActionsButton>`
**Props:**
```typescript
{
  selectedCount: number;
  onAction: (action: 'status' | 'delete' | 'export') => void;
}
```

**Actions:**
- Change Status → Opens status picker
- Delete → Confirmation dialog
- Export CSV → Downloads selected epics

---

## 📊 Data Model

### Epic (Table Row)
```typescript
type Epic = {
  id: number;
  key: string; // MUN-109
  summary: string;
  status: 'to_do' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  storyCount: number;
  assignedAgents: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  progress: number; // 0-100
  createdAt: Date;
  dueDate?: Date;
};
```

### Filters
```typescript
type EpicFilters = {
  status?: ('to_do' | 'in_progress' | 'done' | 'cancelled')[];
  priority?: ('low' | 'medium' | 'high' | 'critical')[];
  agentId?: string;
  search?: string;
};
```

---

## 🔌 API Endpoints

### GET `/api/tracker/epics`
**Purpose:** List all epics with filtering, sorting, pagination

**Query Params:**
```typescript
{
  status?: string; // comma-separated
  priority?: string; // comma-separated
  agentId?: string;
  search?: string;
  sortBy?: string; // key, summary, status, priority, createdAt
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number; // default 50
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    epics: Epic[];
    total: number;
    page: number;
    totalPages: number;
  }
}
```

### PUT `/api/tracker/epics/bulk`
**Purpose:** Bulk update epics

**Body:**
```typescript
{
  ids: number[];
  action: 'update_status' | 'delete';
  value?: string; // new status if action = update_status
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    updated: number;
    errors: { id: number; error: string }[];
  }
}
```

---

## 🔄 State Management

### React Query
```tsx
const { data, isLoading } = useQuery<{ data: { epics: Epic[]; total: number } }>({
  queryKey: ['/api/tracker/epics', filters, sortBy, sortDirection, page],
  keepPreviousData: true // Smooth pagination
});

const bulkUpdateMutation = useMutation({
  mutationFn: (data: BulkUpdateInput) => 
    apiRequest('PUT', '/api/tracker/epics/bulk', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/tracker/epics'] });
    toast({ title: 'Epics updated successfully' });
  }
});
```

### Local State
```tsx
const [filters, setFilters] = useState<EpicFilters>({});
const [sortBy, setSortBy] = useState('createdAt');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
const [selectedIds, setSelectedIds] = useState<number[]>([]);
const [page, setPage] = useState(1);
```

---

## ✨ Aurora Tide Compliance

### Design System Checklist
- [x] **GlassCard:** Table container uses `<GlassCard depth={2}>`
- [x] **Table Styling:**
  - Header: Gradient background
  - Rows: Glassmorphic hover effect
  - Borders: 1px solid rgba(255,255,255,0.1)
- [x] **Status Badges:**
  - To Do: Gray
  - In Progress: Turquoise gradient
  - Done: Green gradient
  - Cancelled: Red gradient
- [x] **Dark Mode:**
  - Table: `bg-white dark:bg-gray-900`
  - Text: `text-gray-900 dark:text-gray-100`
  - Hover: `hover:bg-gray-50 dark:hover:bg-gray-800`
- [x] **Animations:**
  - Row FadeIn on load
  - ScaleIn on checkbox select
  - Smooth sort transitions
- [x] **i18n:**
  - `t('tracker.epics.title')`
  - `t('tracker.epics.filter_status')`
  - `t('tracker.epics.bulk_actions')`
- [x] **Accessibility:**
  - Table headers with scope
  - Row selection keyboard (Space)
  - Filter dropdowns keyboard accessible
  - Screen reader: "Epic MUN-109, In Progress, 7 stories"
- [x] **Data-testids:**
  - `data-testid="table-epics"`
  - `data-testid="row-epic-{id}"`
  - `data-testid="filter-status"`
  - `data-testid="button-bulk-actions"`
  - `data-testid="checkbox-epic-{id}"`

---

## 🧪 Testing Plan

### E2E Tests
**File:** `tests/e2e/tracker/epics-list.spec.ts`

```typescript
test('should filter epics by status', async ({ page }) => {
  await page.goto('/admin/projects?tab=epics');
  await page.getByTestId('filter-status').click();
  await page.getByText('In Progress').click();
  
  const rows = page.getByTestId(/row-epic-/);
  await expect(rows).toHaveCount(3);
  
  // Verify all rows have "In Progress" status
  for (const row of await rows.all()) {
    await expect(row.getByText('In Progress')).toBeVisible();
  }
});

test('should bulk update epic status', async ({ page }) => {
  await page.goto('/admin/projects?tab=epics');
  
  // Select 2 epics
  await page.getByTestId('checkbox-epic-1').click();
  await page.getByTestId('checkbox-epic-2').click();
  
  // Bulk update
  await page.getByTestId('button-bulk-actions').click();
  await page.getByText('Change Status').click();
  await page.getByText('Done').click();
  
  await expect(page.getByText('2 epics updated successfully')).toBeVisible();
});
```

---

## 📈 Performance Targets

| Metric | Target | Optimization |
|--------|--------|--------------|
| Table Render | < 100ms | Virtualization for 100+ rows |
| Filter Apply | < 50ms | Debounced search (300ms) |
| Sort Column | < 50ms | Client-side sort (cached) |
| Pagination | < 200ms | keepPreviousData for smooth UX |

---

## ✅ Completion Criteria

- [ ] Table renders all epics
- [ ] Sorting works on all columns
- [ ] Filters apply correctly (status, priority, agent)
- [ ] Search filters by key or summary
- [ ] Bulk actions work (status change, delete)
- [ ] Pagination works (50 per page)
- [ ] Click row → Navigate to detail
- [ ] All data-testids present
- [ ] E2E tests passing
- [ ] Performance targets met
- [ ] Aurora Tide compliant
- [ ] Accessibility verified

---

**Status:** Architecture complete  
**Next:** Build table component with sorting and filtering
