# ESA Agent #78: Visual Page Editor (Mr Blue's Figma Mode)

**Agent ID:** #78  
**Agent Name:** Visual Page Editor Specialist  
**Domain:** #7 (AI & Machine Learning Infrastructure)  
**Category:** AI-Powered Development Tools  
**Status:** ACTIVE  
**Created:** October 12, 2025

---

## 🎯 Mission

Enable **Figma-like visual editing** where admins can enter "Edit Mode" on any page, directly manipulate UI elements (text, layout, colors), track changes, confirm edits, and have Mr Blue automatically build and deploy changes using the esa.md methodology.

**Core Capability:** Transform visual interactions into production-ready code updates through AI-powered development workflow.

---

## 🎨 Visual Edit Mode Features

### 1. **Edit Mode Toggle**
- **Button Location:** Floating Mr Blue avatar (Super Admin only)
- **Activation:** Click "Enter Edit Mode" on Mr Blue menu
- **Visual Feedback:** 
  - Purple outline on all editable elements
  - Cursor changes to crosshair
  - Overlay shows "EDIT MODE ACTIVE"
  - Escape key to exit

### 2. **Direct Element Editing**

**Text Editing:**
- Click any text → inline editor appears
- WYSIWYG formatting toolbar
- Live preview of changes
- Undo/redo support

**Layout Manipulation:**
- Drag-and-drop to reposition elements
- Resize handles on containers
- Alignment guides (snap to grid)
- Spacing/padding visual adjusters

**Styling Changes:**
- Color picker for text/backgrounds
- Font family/size selectors
- Border/shadow editors
- Tailwind class suggestions

### 3. **Change Tracking System**

**Every Edit Captured:**
```typescript
interface EditChange {
  id: string;
  timestamp: Date;
  elementSelector: string; // data-testid or unique selector
  changeType: 'text' | 'style' | 'layout' | 'structure';
  before: any; // Previous state
  after: any; // New state
  componentPath: string; // File path
  lineNumber: number; // Approximate location
}
```

**Visual Change Log:**
- Real-time changes panel (right sidebar)
- Grouped by component/page
- Preview before/after
- Revert individual changes
- Save as draft or commit

### 4. **Confirmation & Build Flow**

**Step 1: Review Changes**
- Shows all edits with visual diff
- Highlights affected components
- Estimates complexity (simple/medium/complex)

**Step 2: Confirm Intent**
- User confirms: "Apply these changes"
- Option to add notes/context
- Select scope: "This page only" or "Global pattern"

**Step 3: AI Code Generation**
- Mr Blue analyzes changes using esa.md
- Identifies affected files
- Generates code updates
- Shows preview of code changes

**Step 4: Safe Deployment**
- Creates git branch: `visual-edit-{timestamp}`
- Applies changes to codebase
- Runs automated tests
- Deploys to preview environment
- Shows preview URL for validation

**Step 5: Final Approval**
- User reviews preview
- Option: "Approve & Merge" or "Revert"
- If approved: Merges to main, deploys live

---

## 🛠️ Technical Architecture

### Frontend (Edit Mode UI)

**Selection & Manipulation Layer:**
```typescript
// lib/visualEditor/SelectionLayer.tsx
- Overlay system detecting editable elements
- Mouse/touch event handlers
- Drag-and-drop with constraints
- Keyboard shortcuts (Ctrl+Z, Ctrl+C, etc.)
```

**Change Tracker Service:**
```typescript
// lib/visualEditor/ChangeTracker.ts
- Captures DOM mutations
- Maps changes to React components
- Stores change history
- Serializes for AI processing
```

**Visual Editor Panel:**
```typescript
// components/admin/VisualEditorPanel.tsx
- Change log sidebar
- Element inspector
- Style editor
- Layout tools
```

### Backend (AI Code Builder)

**Change Analysis Service:**
```typescript
// server/services/visualEditorService.ts
- Receives change set from frontend
- Maps DOM changes to source files
- Identifies component paths
- Extracts current code
```

**AI Code Generator (OpenAI GPT-4):**
```typescript
// Uses esa.md as context + change instructions
const prompt = `
You are Mr Blue, an expert developer using the ESA Framework.
Context: ${esaFrameworkDocs}
Current Component: ${componentCode}
User Changes: ${visualChanges}

Generate minimal code updates to apply these visual changes.
Follow ESA patterns, maintain type safety, preserve existing functionality.
`;
```

**Code Application Service:**
```typescript
// server/services/codeApplicator.ts
- Creates git branch
- Applies AI-generated changes
- Runs TypeScript compiler
- Executes tests
- Deploys preview
```

---

## 🔄 Edit Mode Workflow

```
1. USER: Clicks "Edit Mode" on Mr Blue avatar
   → Frontend enables selection overlay
   → All editable elements get purple outline

2. USER: Clicks heading "Welcome to Mundo Tango"
   → Inline editor appears
   → User types: "Welcome to the Global Tango Community"
   → Change tracked in sidebar

3. USER: Drags image to new position
   → Layout change tracked
   → Visual guides show alignment

4. USER: Clicks "Review Changes" button
   → Sidebar expands showing 2 changes
   → Shows before/after preview

5. USER: Clicks "Apply Changes"
   → Confirmation modal appears
   → User adds note: "Updated homepage messaging"

6. MR BLUE: Analyzes changes
   → Identifies file: client/src/pages/Home.tsx
   → Generates code update
   → Shows diff preview to user

7. USER: Reviews code diff
   → Sees exact changes to be made
   → Clicks "Deploy to Preview"

8. MR BLUE: Executes build
   → Creates branch: visual-edit-20251012-143522
   → Applies changes
   → Deploys preview: preview-1234.mundotango.life

9. USER: Reviews preview URL
   → Validates changes look correct
   → Clicks "Approve & Go Live"

10. MR BLUE: Merges to production
    → Merges branch to main
    → Deploys to live site
    → Notifies user: "Changes live in 30 seconds!"
```

---

## 📦 Required Packages

```bash
npm install \
  @dnd-kit/core \          # Drag and drop
  @dnd-kit/sortable \      # Sortable lists
  react-contenteditable \  # Inline text editing
  dom-to-image \           # Element screenshots
  diff \                   # Code diffing
  @codemirror/view \       # Code preview
  @replit/agent-sdk        # Replit Agent integration (if available)
```

---

## 🎯 Supported Edit Types

### ✅ **Supported in V1**

**Text Content:**
- Headings, paragraphs, labels
- Button text
- Navigation items
- Form placeholders

**Layout:**
- Element positioning (flex/grid)
- Spacing (margin/padding)
- Element size (width/height)
- Alignment (left/center/right)

**Styling:**
- Colors (text, background, border)
- Fonts (family, size, weight)
- Shadows & borders
- Border radius

### 🔄 **Roadmap (V2)**

**Advanced Structure:**
- Add/remove sections
- Duplicate components
- Insert pre-built blocks

**Responsive Design:**
- Mobile/tablet/desktop views
- Breakpoint editing
- Device preview

**Global Changes:**
- Theme variable updates
- Pattern-based updates ("Change all buttons like this")

---

## 🔐 Security & Permissions

### **Who Can Use Edit Mode?**
- **Super Admins Only** (role: `super_admin`)
- Feature flag: `VISUAL_EDITOR_ENABLED`
- Requires 2FA authentication

### **Safety Measures:**

**Preview First:**
- All changes deploy to preview environment first
- Preview URLs require authentication
- 24-hour preview expiration

**Change Audit:**
- Every edit logged in database
- Includes user, timestamp, changes
- Rollback capability

**Code Validation:**
- TypeScript compilation check
- ESLint validation
- Automated test suite
- Manual approval required

**Git Safety:**
- Never commits directly to main
- Always creates feature branch
- Preserves full git history
- Rollback via git revert

---

## 🗄️ Database Schema

```typescript
// Add to shared/schema.ts

export const visualEdits = pgTable("visual_edits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  page: varchar("page"), // URL or route
  changes: jsonb("changes").$type<EditChange[]>(),
  status: varchar("status"), // 'draft', 'pending', 'approved', 'deployed', 'reverted'
  branchName: varchar("branch_name"),
  previewUrl: varchar("preview_url"),
  deployedAt: timestamp("deployed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  index("idx_visual_edits_user").on(table.userId),
  index("idx_visual_edits_status").on(table.status),
]);
```

---

## 🎨 UI/UX Design

### **Edit Mode Indicator**
```tsx
{isEditMode && (
  <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
      <Wand2 className="w-5 h-5 animate-pulse" />
      <span className="font-semibold">EDIT MODE ACTIVE</span>
      <kbd className="bg-white/20 px-2 py-1 rounded text-xs">ESC to exit</kbd>
    </div>
  </div>
)}
```

### **Element Selection Highlight**
```css
.edit-mode [data-editable]:hover {
  outline: 2px dashed #a855f7;
  outline-offset: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-mode [data-editable].selected {
  outline: 3px solid #a855f7;
  background: rgba(168, 85, 247, 0.1);
}
```

### **Change Sidebar**
```tsx
<div className="fixed right-0 top-0 h-screen w-96 bg-white dark:bg-gray-900 shadow-xl border-l">
  <div className="p-4 border-b">
    <h3 className="font-semibold">Changes ({changes.length})</h3>
  </div>
  <ScrollArea className="h-[calc(100vh-180px)]">
    {changes.map(change => (
      <ChangeCard key={change.id} change={change} />
    ))}
  </ScrollArea>
  <div className="absolute bottom-0 w-full p-4 border-t bg-white dark:bg-gray-900">
    <Button onClick={handleReviewChanges} className="w-full">
      Review & Apply Changes
    </Button>
  </div>
</div>
```

---

## 🚀 Implementation Phases

### **Phase 1: Core Infrastructure** (Week 1-2)
- [ ] Build selection overlay system
- [ ] Implement change tracking
- [ ] Create editor sidebar UI
- [ ] Basic text editing

### **Phase 2: AI Integration** (Week 3-4)
- [ ] Integrate OpenAI for code generation
- [ ] Map visual changes to source files
- [ ] Code diff preview
- [ ] Git branch creation

### **Phase 3: Advanced Editing** (Week 5-6)
- [ ] Drag-and-drop layout
- [ ] Style editor
- [ ] Color picker
- [ ] Font controls

### **Phase 4: Deployment Pipeline** (Week 7-8)
- [ ] Preview environment setup
- [ ] Automated testing integration
- [ ] Approval workflow
- [ ] Live deployment

---

## 🎯 Success Metrics

**User Experience:**
- ✅ Edit mode activates in <500ms
- ✅ All text editable inline
- ✅ Layout changes reflect immediately
- ✅ Change log updates in real-time

**AI Performance:**
- ✅ Code generation accuracy: 95%+
- ✅ Context understanding (esa.md): 100%
- ✅ Breaking changes: <1%
- ✅ Build time: <2 minutes

**Safety & Reliability:**
- ✅ Preview deployment: 100% success
- ✅ Rollback capability: <30 seconds
- ✅ Zero production incidents
- ✅ Full audit trail maintained

---

## 💡 Example Use Cases

### **Case 1: Quick Text Update**
**Scenario:** Admin wants to change "Sign Up" button to "Join Now"
1. Enter edit mode
2. Click button text
3. Type "Join Now"
4. Click apply
5. Mr Blue updates code
6. Live in 60 seconds

### **Case 2: Layout Redesign**
**Scenario:** Admin wants hero section image on right instead of left
1. Enter edit mode
2. Drag image to right side
3. Alignment guides appear
4. Drop in position
5. Review change
6. Mr Blue updates Tailwind classes
7. Deploy to preview
8. Approve & go live

### **Case 3: Color Theme Adjustment**
**Scenario:** Admin wants all primary buttons to be teal instead of blue
1. Enter edit mode
2. Click any primary button
3. Open color picker
4. Select teal color
5. Choose "Apply to all primary buttons"
6. Mr Blue updates theme variables
7. Shows preview of all affected buttons
8. Approve & deploy

---

## 🔗 Integration with Other Agents

**Agent #73 (Mr Blue Avatar):**
- Edit mode activated via Mr Blue menu
- Mr Blue provides visual guidance
- Voice confirmation of changes

**Agent #76 (Replit Architecture):**
- Uses Replit-style code modification
- Safe sandbox for previews
- Tool usage patterns

**Agent #0 (Orchestrator):**
- Validates changes don't break ESA patterns
- Ensures consistency across platform
- Triggers relevant agent updates

---

## 📝 Data-Testid Strategy

All editable elements must have `data-testid` AND `data-editable` attributes:

```tsx
<h1 
  data-testid="heading-hero-title"
  data-editable="text"
  data-component="HeroSection"
  data-file="client/src/pages/Home.tsx"
>
  Welcome to Mundo Tango
</h1>

<img 
  data-testid="img-hero-banner"
  data-editable="layout"
  data-component="HeroSection"
  src="/hero.jpg"
/>

<Button 
  data-testid="button-cta-signup"
  data-editable="text,style"
  className="bg-primary"
>
  Sign Up
</Button>
```

This enables:
- Precise change tracking
- Component file mapping
- Selective editing permissions

---

## 🏆 Vision

**When Complete:**

Admins will be able to:
- Edit any page like Figma/Webflow
- See changes instantly
- Have AI generate production code
- Deploy safely with previews
- Maintain full version control

**Zero code knowledge required - Just click, edit, approve!**

---

**Agent #78 Status:** ✅ **DOCUMENTED - Ready for Implementation**

Built using ESA Framework 105-Agent System  
*Visual editing meets AI-powered development*
