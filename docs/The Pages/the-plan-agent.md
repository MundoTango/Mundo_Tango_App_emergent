# The Plan Agent (ESA65)
## Dynamic Story Card System with H2AC Integration

**Agent ID:** ESA65  
**Name:** The Plan (formerly Project Tracker Manager)  
**Created:** October 13, 2025  
**Purpose:** Manage dynamic story cards with 4-level hierarchy for human-AI collaboration

---

## 🎯 Core Mission

The Plan transforms audit findings and work items into dynamic, hierarchical story cards that update in real-time. Each card is designed for human review with clear "What Was Built" and "What Needs Review" sections.

---

## 📊 Story Card Hierarchy

```
Feature (Level 1)
├── Sub-Feature (Level 2)
│   ├── Component (Level 3)
│   │   ├── Task (Level 4)
│   │   ├── Task (Level 4)
│   │   └── Task (Level 4)
│   ├── Component (Level 3)
│   │   └── Tasks...
│   └── Component (Level 3)
│       └── Tasks...
├── Sub-Feature (Level 2)
│   └── Components + Tasks...
└── Sub-Feature (Level 2)
    └── Components + Tasks...
```

---

## 🔄 Real-Time Updates (No Duplication)

**Key Principle:** Cards evolve as work progresses

### Update Flow:
1. **Audit runs** → Creates Feature + Sub-Features + Components + Tasks
2. **Work starts** → Task status changes to "in-progress"
3. **Work completes** → Task marked "done", Component auto-updates
4. **Re-audit runs** → Compares existing vs new findings:
   - **If fixed:** Mark component "done", don't recreate
   - **If still broken:** Update existing component (no duplicate)
   - **If new issue:** Add new component to existing Sub-Feature

**No Duplication Rule:**
- Same file + same issue = UPDATE existing component
- Different issue = NEW component
- Fixed issue = MARK DONE, don't recreate

---

## 👥 H2AC Integration

### Role-Based Assignment

**Frontend Engineer receives:**
- Features tagged "frontend"
- Components in: `client/src/**/*.tsx`
- Tasks assigned to: ESA2, ESA48, P* (frontend pages)

**Backend Engineer receives:**
- Features tagged "backend"
- Components in: `server/**/*.ts`
- Tasks assigned to: ESA1, ESA3, ESA5, P* (API pages)

**Designer receives:**
- Features tagged "design"
- Components in: UI/UX files
- Tasks assigned to: ESA11, ESA48, P* (all pages for design review)

### Story Card Structure for Humans

```markdown
## Feature: Fix Login Page Issues

**Assigned To:** Frontend Engineer (Sarah)  
**Page Agent:** P1 (Login Page)  
**Journey Agent:** J1 (New User)  
**Status:** In Review

### What Was Built:
- Audit Phase 3 found dark mode CSS issues
- Audit Phase 7 identified missing glassmorphic effects
- Agent P1 analyzed current implementation

### What Needs Review:
1. Line 45 of Login.tsx uses plain Card instead of GlassCard
2. Dark mode variant incomplete (missing color variables)
3. No backdrop-blur-xl class applied

### Sub-Feature: Dark Mode Compliance

#### Component: Login Card Styling
**File:** `client/src/pages/auth/login.tsx:45`

**Instructions for Human:**
1. Open Login.tsx line 45
2. Replace `<Card>` with `<GlassCard>` from @/components/glass/GlassComponents
3. Add className: `glassmorphic-card backdrop-blur-xl`
4. Add dark mode: `dark:from-turquoise-900/20 dark:to-ocean-900/20`

**Code Example:**
\`\`\`typescript
// ❌ Current (Line 45)
<Card className="p-6">

// ✅ Fix
<GlassCard className="glassmorphic-card backdrop-blur-xl p-6 
  bg-gradient-to-br from-turquoise-500/10 to-ocean-600/10
  dark:from-turquoise-900/20 dark:to-ocean-900/20">
\`\`\`

**Tasks:**
- [ ] Import GlassCard (ESA2, P1)
- [ ] Update className (Frontend Engineer)
- [ ] Test dark mode toggle (ESA51)
- [ ] Verify glassmorphic effect (ESA48)
```

---

## 🔄 Audit → Story Pipeline

### When Audit Runs on a Page (e.g., Login - P1):

**Step 1: Parse Findings**
```typescript
{
  pageName: "Login",
  pageAgent: "P1",
  journeyAgent: "J1",
  phases: [
    {
      number: 3,
      name: "Dark Mode Compliance",
      issues: [
        {
          title: "Login card missing glassmorphic effect",
          file: "client/src/pages/auth/login.tsx",
          line: 45,
          category: "frontend",
          suggestedFix: "Use GlassCard with backdrop-blur-xl"
        }
      ]
    }
  ]
}
```

**Step 2: Create/Update Story Cards**
```typescript
// Check if Feature exists for this page
const existingFeature = await findFeature({ pageAgent: "P1" });

if (existingFeature) {
  // UPDATE existing (no duplication)
  for (const issue of findings.issues) {
    const existingComponent = await findComponent({
      fileLocation: issue.file + ":" + issue.line
    });
    
    if (existingComponent.status === "done") {
      // Don't recreate fixed issues
      continue;
    } else {
      // Update existing component with new instructions
      await updateComponent(existingComponent.id, {
        instructions: generateInstructions(issue),
        codeExample: issue.suggestedFix
      });
    }
  }
} else {
  // CREATE new Feature + hierarchy
  const feature = await createFeature({...});
  // ... build full hierarchy
}
```

**Step 3: Assign to Human**
```typescript
// Determine role from file path and issue category
const assignTo = determineRole({
  file: "client/src/pages/auth/login.tsx",
  category: "frontend"
}); // → "Frontend Engineer"

await updateFeature(feature.id, { assignedTo });
```

**Step 4: Notify Matched Agents**
```typescript
// H2AC: Notify relevant agents
const matchedAgents = matchAgentsToRole("frontend"); 
// → ["MB6", "ESA2", "ESA48", "P1"]

await notifyAgents(matchedAgents, {
  type: "new_work",
  storyId: feature.id,
  message: "New frontend work available for review"
});
```

---

## 💬 Mr Blue Integration

### In Mr Blue "My Work" Tab:

**User (Sarah - Frontend Engineer) sees:**
```
📋 Your Work (3 items)

┌─────────────────────────────────────┐
│ Fix Login Page Issues               │
│ P1 (Login) • J1 (New User)          │
│ 2 components need review            │
│ [View Details] [Ask Mr Blue]        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Profile Page Mobile Responsiveness  │
│ P4 (Profile) • J1 (New User)        │
│ 1 component need review             │
│ [View Details]                      │
└─────────────────────────────────────┘
```

**Clicks "View Details" → Full-Screen Workspace opens:**
- LEFT: Complete story hierarchy (Feature → Sub → Component → Task)
- RIGHT: Chat with matched agents (P1, ESA2, ESA48, MB6)
- Can ask: "How do I fix this?" → Agents provide step-by-step help

---

## 🧠 Smart Features

### 1. Context-Aware Help
When human clicks "Ask Mr Blue" on a component:
```typescript
{
  context: {
    component: "Login card styling",
    file: "client/src/pages/auth/login.tsx:45",
    issue: "Missing glassmorphic effect",
    agents: ["P1", "ESA2", "ESA48"]
  },
  prompt: "User needs help with: " + context.issue
}
```

### 2. Auto-Detection of Completion
```typescript
// When human marks task as done
onTaskComplete(taskId) {
  // Check if all tasks in component are done
  const component = await getComponentWithTasks(taskId);
  const allTasksDone = component.tasks.every(t => t.status === "done");
  
  if (allTasksDone) {
    // Auto-mark component as complete
    await updateComponent(component.id, { status: "done" });
    
    // Check if all components in sub-feature are done
    const subFeature = await getSubFeatureWithComponents(component.subFeatureId);
    const allComponentsDone = subFeature.components.every(c => c.status === "done");
    
    if (allComponentsDone) {
      // Auto-mark sub-feature as complete
      await updateSubFeature(subFeature.id, { status: "done" });
      
      // ... cascade up to Feature level
    }
  }
}
```

### 3. Human Onboarding Flow
```
User: "I have new human to work with you"

Mr Blue: "Great! Let me set them up.

Name: Sarah
Role: (frontend/backend/designer/admin)
Skills: React, TypeScript, CSS

[Submit]"

→ Creates user account
→ Assigns role-based permissions
→ Matches agents: MB6, ESA2, ESA48, P* (frontend pages)
→ Queries The Plan for "frontend" stories
→ Shows personalized dashboard with matched work
```

---

## 📊 Database Schema

Already added to `shared/schema.ts`:
- `features` table (Level 1)
- `subFeatures` table (Level 2) 
- `components` table (Level 3)
- `tasks` table (Level 4)

With relations for hierarchy traversal.

---

## 🎯 Success Metrics

**For The Plan Agent:**
- ✅ Zero duplicate story cards when re-auditing
- ✅ 100% real-time updates as work progresses
- ✅ Clear "What Was Built" / "What Needs Review" sections
- ✅ Auto-assignment to correct human roles
- ✅ Matched agents available in full-screen workspace

**For Humans:**
- ✅ Instant visibility into their assigned work
- ✅ Clear instructions with code examples
- ✅ One-click access to relevant AI agents
- ✅ Real-time progress tracking
- ✅ No confusion from duplicate cards

---

**The Plan transforms chaos into clarity, giving humans exactly what they need to review and nothing more.** 🎯
