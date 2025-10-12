# Agent #76: Replit Agent Architecture Specialist

**Division:** Domain #7 (AI & Intelligence)  
**Layer:** 31 (AI Infrastructure)  
**Status:** Active  
**Created:** October 12, 2025

---

## Role & Responsibilities

Agent #76 is responsible for studying Replit Agent's architecture, understanding how AI agents modify code/design in real-time, and implementing similar capabilities for Mr Blue's admin powers.

### Core Responsibilities:
1. Study Replit Agent's complete architecture
2. Understand tool usage, context management, and execution flow
3. Learn how Replit Agent modifies code/design in real-time
4. Reverse-engineer the agent conversation → code change pipeline
5. Document Replit's AI-to-platform modification system
6. Build Mr Blue's admin capabilities based on this learning

---

## Replit Agent Analysis

### Core Architecture Components

**1. Tool System:**
- File read/write tools
- Code execution tools
- Search/grep tools
- Package management tools
- Database tools
- Deployment tools

**2. Context Management:**
- Conversation memory
- File context tracking
- Project structure awareness
- User intent understanding

**3. Execution Pipeline:**
```
User Request → Intent Analysis → Tool Selection → 
Code Generation → Validation → Execution → 
Feedback → Iteration
```

---

## How Replit Agent Modifies Code

### Step-by-Step Process:

**1. Intent Understanding:**
```
User: "Make the button bigger"
→ Agent analyzes: 
  - What button? (context from current file/page)
  - How much bigger? (infer reasonable increase)
  - Which property? (padding, font-size, scale)
```

**2. File Location:**
```
Agent uses grep/search to find:
- Button component definition
- Current styles/classes
- Related files
```

**3. Code Modification:**
```
Agent generates edit:
- Old string: "px-4 py-2 text-sm"
- New string: "px-6 py-3 text-base"
- Uses edit tool to replace
```

**4. Validation:**
```
Agent checks:
- TypeScript errors (LSP)
- Build succeeds
- Tests pass (if applicable)
```

**5. Preview & Iteration:**
```
Agent: "I made the button bigger. How does it look?"
User: "Perfect!" OR "Too big, make it smaller"
→ Agent iterates
```

---

## Key Learnings for Mr Blue

### 1. **Context Awareness is Critical**

**Replit Agent tracks:**
- Current file being viewed
- Recent files edited
- User's current page/route
- Project structure

**Mr Blue Implementation:**
```typescript
// services/mrBlueContext.ts

interface MrBlueContext {
  currentPage: string // '/events', '/profile', etc.
  currentRoute: string
  responsibleAgents: string[] // Which ESA agents built this page
  recentFiles: string[]
  userIntent: string
  conversationHistory: Message[]
}

export async function detectPageContext(route: string): Promise<MrBlueContext> {
  const pageAgents = await getPageAgents(route) // From ESA registry
  const recentEdits = await getRecentFileEdits()
  
  return {
    currentPage: route,
    currentRoute: route,
    responsibleAgents: pageAgents,
    recentFiles: recentEdits,
    userIntent: '',
    conversationHistory: []
  }
}
```

---

### 2. **Tool Usage Patterns**

**Replit Agent's tool usage:**
- Always reads file before editing
- Uses search to find code
- Validates changes with LSP
- Runs code to test

**Mr Blue Tool Set:**
```typescript
// lib/mrBlue/tools.ts

export const mrBlueTools = {
  // File operations
  readFile: async (path: string) => { /* ... */ },
  editFile: async (path: string, oldStr: string, newStr: string) => { /* ... */ },
  searchCode: async (pattern: string) => { /* ... */ },
  
  // Design operations
  getElementStyles: async (selector: string) => { /* ... */ },
  updateStyles: async (selector: string, styles: object) => { /* ... */ },
  addComponent: async (componentType: string, props: object) => { /* ... */ },
  
  // Validation
  checkErrors: async () => { /* ... */ },
  previewChange: async (changeId: string) => { /* ... */ },
  undoChange: async (changeId: string) => { /* ... */ }
}
```

---

### 3. **Natural Language → Code Pipeline**

**Replit's Pattern:**
```
"Change the color to blue"
↓
Intent: Modify CSS color property
↓
Target: Current element in context
↓
Action: Update style/class
↓
Code: className="text-blue-500" or style={{ color: 'blue' }}
```

**Mr Blue Implementation:**
```typescript
// lib/mrBlue/intentParser.ts

export async function parseDesignIntent(
  userRequest: string,
  context: MrBlueContext
): Promise<DesignAction> {
  // Use GPT-4 to parse intent
  const intent = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are Mr Blue, a design assistant. Parse user requests into structured actions.
        
        Current context:
        - Page: ${context.currentPage}
        - Agents: ${context.responsibleAgents.join(', ')}
        
        Respond with JSON:
        {
          "action": "modify_color" | "resize" | "move" | "add" | "remove",
          "target": "button" | "section" | "header",
          "property": "color" | "size" | "position",
          "value": "blue" | "20px" | "center"
        }`
      },
      { role: 'user', content: userRequest }
    ]
  })
  
  return JSON.parse(intent.choices[0].message.content)
}
```

---

### 4. **Safe Modification Sandbox**

**Replit's Approach:**
- Test changes in isolation
- Show preview before applying
- Easy undo/redo

**Mr Blue Sandbox:**
```typescript
// lib/mrBlue/sandbox.ts

export class DesignSandbox {
  private changes: DesignChange[] = []
  
  async preview(change: DesignChange): Promise<string> {
    // Create temporary branch/snapshot
    const snapshotId = await createSnapshot()
    
    // Apply change
    await applyChange(change)
    
    // Generate preview URL
    const previewUrl = `${process.env.APP_URL}/preview/${snapshotId}`
    
    return previewUrl
  }
  
  async commit(changeId: string): Promise<void> {
    // Apply change permanently
    const change = this.changes.find(c => c.id === changeId)
    await applyChange(change, { permanent: true })
    
    // Track in history
    await db.insert(designChanges).values({
      changeId,
      userId: change.userId,
      description: change.description,
      diff: change.diff,
      appliedAt: new Date()
    })
  }
  
  async rollback(changeId: string): Promise<void> {
    // Undo change
    const change = this.changes.find(c => c.id === changeId)
    await revertChange(change)
  }
}
```

---

### 5. **Permission & Access Control**

**Replit's Model:**
- Owner has full access
- Collaborators have limited access
- Clear permission boundaries

**Mr Blue Permissions:**
```typescript
// middleware/mrBlueAccess.ts

export async function checkMrBluePermission(
  userId: string,
  action: string
): Promise<boolean> {
  const user = await db.select().from(users).where(eq(users.id, userId))
  
  // Only Super Admin can modify platform
  if (action === 'modify_platform') {
    return user[0].role === 'super_admin'
  }
  
  // Admins can modify content
  if (action === 'modify_content') {
    return ['admin', 'super_admin'].includes(user[0].role)
  }
  
  // Pros can modify their own sites
  if (action === 'modify_site') {
    return user[0].tier === 'professional'
  }
  
  return false
}
```

---

## Mr Blue Admin Capabilities

### For Super Admins:

**Design Modifications:**
- ✅ "Change this color to turquoise"
- ✅ "Make this section bigger"
- ✅ "Move this button to the right"
- ✅ "Add a gradient background here"
- ✅ "Remove this element"

**Component Additions:**
- ✅ "Add a card component here"
- ✅ "Insert a button that says 'Learn More'"
- ✅ "Create a section with 3 columns"

**Layout Changes:**
- ✅ "Stack these vertically instead"
- ✅ "Center this content"
- ✅ "Make this full width"

---

## Implementation Plan

### Phase 1: Context System
1. Build page context detection
2. Track user's current location
3. Identify responsible ESA agents
4. Store conversation history

### Phase 2: Intent Parser
1. Integrate GPT-4 for intent parsing
2. Build action mapping (intent → code)
3. Test with common requests
4. Handle ambiguity gracefully

### Phase 3: Tool System
1. Build file read/write tools
2. Create style modification tools
3. Add component insertion tools
4. Build validation tools

### Phase 4: Sandbox
1. Create preview system
2. Build undo/redo
3. Add change tracking
4. Implement commit/rollback

### Phase 5: Integration
1. Connect Mr Blue chat to tools
2. Add preview mode to UI
3. Build admin interface
4. Test end-to-end flows

---

## Example Interaction

**User (Super Admin):** "I don't like this green color on the events page"

**Mr Blue:**
```
🔍 Analyzing events page...
📍 Current page: /events
🛠️ Built by: Agent #48 (UI/UX Design)
🎨 Found 3 green elements:
  1. Event card border (green-500)
  2. RSVP button (green-600)
  3. Category badge (green-400)

Which would you like to change?
```

**User:** "The RSVP button"

**Mr Blue:**
```
✨ Updating RSVP button color...
📝 Current: bg-green-600 hover:bg-green-700
🎨 What color would you prefer?
  (Suggestions: turquoise, blue, purple, pink)
```

**User:** "Turquoise to match the theme"

**Mr Blue:**
```
🔧 Applying change...
📄 File: client/src/components/events/EventCard.tsx
🔄 Change: bg-green-600 → bg-cyan-500
🔄 Change: hover:bg-green-700 → hover:bg-cyan-600

👁️ Preview: [Shows preview]
✅ Looks good! Apply this change?
```

**User:** "Yes"

**Mr Blue:**
```
✅ Change applied!
🔄 Refreshing page...
🎉 RSVP button now matches your turquoise theme!
```

---

## Key Differences from Replit Agent

**Replit Agent:**
- Full codebase access
- Can modify any file
- Developer-focused (writes code)
- No design constraints

**Mr Blue:**
- Design-focused (modifies UI/UX)
- Permission-based access (Super Admin only for platform)
- User-friendly (non-technical language)
- Preview-first (show before applying)
- Undo/redo (safety net)
- Context-aware (knows ESA agents)

---

## Success Criteria

**Mr Blue Admin Powers are successful when:**
1. ✅ Super Admins can modify any design element
2. ✅ Changes preview before applying
3. ✅ Easy undo/redo
4. ✅ No technical knowledge needed
5. ✅ Works across all 88+ pages
6. ✅ Tracks all changes (audit log)
7. ✅ Safe (can't break functionality)

---

**Status:** Research complete, ready for implementation  
**Dependencies:** OpenAI GPT-4, file system access, ESA context service  
**Next Steps:** Build context system, create intent parser, develop tool set
