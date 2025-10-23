# Mr Blue SIMULTANEOUS Build Plan
## MB.MD Execution Strategy - All Features at Once

**Created:** October 23, 2025  
**Execution Mode:** SIMULTANEOUS (Learning #19)  
**Design Theme:** MT Ocean (#14B8A6 teal)  
**Timeline:** 3 weeks (vs 5 weeks sequential)  
**Team Structure:** 3 parallel streams

---

## 🎯 **EXECUTIVE SUMMARY**

**Strategy:** Build all 3 focus areas (Conversation, Inspector, Save Button) simultaneously with independent parallel streams that converge at integration points.

**Why SIMULTANEOUS:**
- ✅ 40% faster delivery (3 weeks vs 5 weeks)
- ✅ Features tested together from Day 1
- ✅ No blocking dependencies (70% already built)
- ✅ Parallel verification reduces bugs

**Critical Success Factor:**
> Shared Day 0 prep (libraries + theme tokens) unblocks all 3 streams immediately.

---

## 📊 **STREAM ARCHITECTURE**

```
DAY 0 (SHARED PREP)
┌─────────────────────────────────────────────────┐
│  Install Libraries + MT Ocean Theme Tokens      │
│  - react-diff-viewer-continued                  │
│  - prismjs, diff, date-fns                      │
│  - Add teal colors to design system             │
└─────────────────────────────────────────────────┘
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓                       ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  STREAM 1    │    │  STREAM 2    │    │  STREAM 3    │
│              │    │              │    │              │
│ CONVERSATION │    │  INSPECTOR   │    │ SAVE BUTTON  │
│              │    │              │    │              │
│ 7 tasks      │    │ 5 tasks      │    │ 7 tasks      │
│ 2 engineers  │    │ 2 engineers  │    │ 2 engineers  │
│ Week 1-2     │    │ Week 1-1.5   │    │ Week 1-2     │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                   │
        └───────────┬───────┴───────────────────┘
                    ↓
        ┌───────────────────────────┐
        │  INTEGRATION (Week 2-3)   │
        │  - Shared ChatInterface   │
        │  - API contract alignment │
        │  - MT Ocean theme check   │
        │  - Cross-stream QA        │
        └───────────────────────────┘
                    ↓
        ┌───────────────────────────┐
        │  RELEASE (Week 3)         │
        │  - User testing           │
        │  - Screenshot everything  │
        │  - Documentation          │
        └───────────────────────────┘
```

---

## 🚀 **DAY 0: SHARED PREP SPRINT**

**Duration:** 4 hours  
**Blockers:** MUST complete before streams start  
**Team:** 1-2 engineers

### Task Checklist

**1. Install Core Libraries**
```bash
npm install react-diff-viewer-continued
npm install prismjs
npm install diff
npm install date-fns
npm install react-textarea-autosize
```

**2. Add MT Ocean Theme Tokens**

File: `client/src/index.css`

```css
:root {
  /* MT Ocean Base Colors */
  --mt-ocean-teal: #14B8A6;        /* Primary teal */
  --mt-ocean-cyan: #06B6D4;        /* Accent cyan */
  --mt-ocean-dark-bg: #0F172A;     /* Dark blue background */
  --mt-ocean-light-bg: #E0F2FE;    /* Light blue background */
  
  /* Diff Colors */
  --diff-added-bg: #044B53;        /* Dark teal for additions */
  --diff-removed-bg: #632F34;      /* Dark red for deletions */
  --diff-added-text: #A5F3FC;      /* Light cyan text */
  --diff-removed-text: #FCA5A5;    /* Light red text */
  
  /* Chat UI Colors */
  --chat-user-bg: #E0F2FE;         /* User message bubble */
  --chat-ai-bg: #F0FDFA;           /* AI message bubble */
  --chat-border: #99F6E4;          /* Teal border */
}

.dark {
  --mt-ocean-light-bg: #1E293B;
  --chat-user-bg: #155E75;
  --chat-ai-bg: #134E4A;
  --chat-border: #0D9488;
}
```

**3. Task Ownership Assignment**

Create shared tracking document:

```markdown
# Task Ownership
## Stream 1: Conversation
- Engineer A: conv-1, conv-2, conv-3 (layout + data)
- Engineer B: conv-4, conv-5, conv-6, conv-7 (actions + empty state)

## Stream 2: Inspector
- Engineer C: inspector-1, inspector-2, inspector-3 (verify + UI)
- Engineer D: inspector-4, inspector-5 (point-and-ask + screenshot)

## Stream 3: Save Button
- Engineer E: save-1, save-2, save-3, save-4 (diff modal)
- Engineer F: save-5, save-6, save-7 (git integration + commit)
```

**4. Learning Task Time-Boxes**

Schedule 1-hour research spikes:

- **learn-1** (react-diff-viewer): Engineer E reads docs before save-1
- **learn-2** (Cursor diff workflow): Engineer E reads before save-3
- **learn-3** (Windsurf context): Engineer C reads before inspector-3

---

## 🎨 **STREAM 1: CONVERSATION UI**

**Duration:** 2 weeks  
**Engineers:** 2 (A + B)  
**Dependencies:** Day 0 prep only  
**Integration:** End of Week 1 (ChatInterface merge)

### Work Cells (Can Overlap)

**Cell A: Layout + Theming**
- **Tasks:** conv-1, conv-7
- **Owner:** Engineer A
- **Timeline:** Days 1-3

**Cell B: Conversation Data Utilities**
- **Tasks:** conv-2, conv-3
- **Owner:** Engineer A
- **Timeline:** Days 4-7

**Cell C: Message Actions**
- **Tasks:** conv-4, conv-5, conv-6
- **Owner:** Engineer B
- **Timeline:** Days 1-7 (parallel with A)

---

### Detailed Task Breakdown

**Task: conv-1** - Restyle ChatInterface to ChatGPT UI  
**Duration:** 8 hours  
**Engineer:** A  
**Dependencies:** Day 0 theme tokens

**Deliverables:**
```tsx
// ChatInterface.tsx updates
<div className="flex h-screen bg-[var(--mt-ocean-dark-bg)]">
  {/* Sidebar: 260px */}
  <aside className="w-[260px] bg-gray-800 border-r border-[var(--chat-border)]">
    <ConversationSidebar />
  </aside>
  
  {/* Main chat: centered, max-width 768px */}
  <main className="flex-1 flex flex-col items-center">
    <div className="w-full max-w-3xl">
      <MessageList />
      <InputArea />
    </div>
  </main>
</div>
```

**Acceptance Criteria:**
- [ ] 260px collapsible sidebar
- [ ] Centered chat area (max 768px)
- [ ] MT Ocean teal accents (#14B8A6)
- [ ] Dark/light mode toggle
- [ ] Mobile responsive

---

**Task: conv-2** - Add date-grouped conversation sidebar  
**Duration:** 6 hours  
**Engineer:** A  
**Dependencies:** conv-1, date-fns installed

**Deliverables:**
```tsx
// ConversationSidebar.tsx
import { formatDistanceToNow, isToday, isYesterday, subDays } from 'date-fns';

const groupConversations = (conversations) => {
  const groups = {
    today: [],
    yesterday: [],
    previous7Days: [],
    previous30Days: [],
    older: []
  };
  
  conversations.forEach(conv => {
    const date = new Date(conv.updatedAt);
    if (isToday(date)) groups.today.push(conv);
    else if (isYesterday(date)) groups.yesterday.push(conv);
    else if (date > subDays(new Date(), 7)) groups.previous7Days.push(conv);
    else if (date > subDays(new Date(), 30)) groups.previous30Days.push(conv);
    else groups.older.push(conv);
  });
  
  return groups;
};
```

**Acceptance Criteria:**
- [ ] Conversations grouped by: Today, Yesterday, Previous 7 Days, Previous 30 Days
- [ ] Groups auto-update on date change
- [ ] Empty groups hidden
- [ ] Most recent at top

---

**Task: conv-3** - Add conversation search bar  
**Duration:** 4 hours  
**Engineer:** A  
**Dependencies:** conv-2

**Deliverables:**
```tsx
// ConversationSidebar.tsx
const [searchQuery, setSearchQuery] = useState('');

const filteredConversations = conversations.filter(conv =>
  conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  conv.messages?.some(msg => 
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  )
);

<Input
  type="search"
  placeholder="Search conversations..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="mb-4"
/>
```

**Acceptance Criteria:**
- [ ] Search by conversation name
- [ ] Search by message content
- [ ] Debounced search (300ms)
- [ ] Clear search button

---

**Task: conv-4** - Add inline rename conversation  
**Duration:** 6 hours  
**Engineer:** B  
**Dependencies:** conv-1

**Deliverables:**
```tsx
// ConversationItem.tsx
const [isEditing, setIsEditing] = useState(false);
const [name, setName] = useState(conversation.name);

const handleRename = async () => {
  await apiRequest(`/api/conversations/${conversation.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name })
  });
  setIsEditing(false);
  queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
};

{isEditing ? (
  <Input
    value={name}
    onChange={(e) => setName(e.target.value)}
    onBlur={handleRename}
    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
    autoFocus
  />
) : (
  <span onClick={() => setIsEditing(true)}>{conversation.name}</span>
)}
```

**Acceptance Criteria:**
- [ ] Click to edit
- [ ] Enter to save
- [ ] Blur to save
- [ ] Escape to cancel

---

**Task: conv-5** - Add copy button per message  
**Duration:** 3 hours  
**Engineer:** B  
**Dependencies:** None (parallel with conv-4)

**Deliverables:**
```tsx
// EnhancedMessageBubble.tsx
import { Copy, Check } from 'lucide-react';

const [copied, setCopied] = useState(false);

const handleCopy = () => {
  navigator.clipboard.writeText(message.content);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

<Button
  variant="ghost"
  size="sm"
  onClick={handleCopy}
  className="opacity-0 group-hover:opacity-100"
>
  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
</Button>
```

**Acceptance Criteria:**
- [ ] Copy button on hover
- [ ] Check icon confirmation
- [ ] Toast notification
- [ ] Works with code blocks

---

**Task: conv-6** - Add regenerate response button  
**Duration:** 5 hours  
**Engineer:** B  
**Dependencies:** None (parallel with conv-5)

**Deliverables:**
```tsx
// EnhancedMessageBubble.tsx
import { RefreshCw } from 'lucide-react';

const regenerateMutation = useMutation({
  mutationFn: async () => {
    return await apiRequest('/api/mrblue/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: messagesUpToThis,
        regenerate: true
      })
    });
  },
  onSuccess: (newMessage) => {
    // Replace last AI message with new one
    updateMessages(newMessage);
  }
});

<Button
  variant="ghost"
  size="sm"
  onClick={() => regenerateMutation.mutate()}
  disabled={regenerateMutation.isPending}
>
  <RefreshCw className="h-4 w-4" />
  Regenerate
</Button>
```

**Acceptance Criteria:**
- [ ] Only on AI messages
- [ ] Loading state
- [ ] Replaces previous response
- [ ] Maintains conversation context

---

**Task: conv-7** - Add ChatGPT-style empty state  
**Duration:** 4 hours  
**Engineer:** B  
**Dependencies:** conv-1

**Deliverables:**
```tsx
// ChatEmptyState.tsx
const suggestedPrompts = [
  { icon: '🎨', text: 'Help me style this button', category: 'Visual Editor' },
  { icon: '🐛', text: 'Debug this component', category: 'Code Review' },
  { icon: '🚀', text: 'Deploy my changes', category: 'Git & Deploy' },
  { icon: '🎵', text: 'Create a tango event', category: 'Mundo Tango' }
];

<div className="flex flex-col items-center justify-center h-full p-8">
  <h1 className="text-4xl font-bold mb-4 text-[var(--mt-ocean-teal)]">
    Mr Blue
  </h1>
  <p className="text-gray-500 mb-8">
    Your AI companion for Mundo Tango development
  </p>
  
  <div className="grid grid-cols-2 gap-4 max-w-2xl">
    {suggestedPrompts.map(prompt => (
      <Card
        key={prompt.text}
        className="cursor-pointer hover:border-[var(--mt-ocean-teal)]"
        onClick={() => sendMessage(prompt.text)}
      >
        <CardContent className="p-4">
          <div className="text-3xl mb-2">{prompt.icon}</div>
          <p className="text-sm">{prompt.text}</p>
          <span className="text-xs text-gray-400">{prompt.category}</span>
        </CardContent>
      </Card>
    ))}
  </div>
</div>
```

**Acceptance Criteria:**
- [ ] 4-6 suggested prompts
- [ ] Click to send
- [ ] Tango-specific prompts
- [ ] MT Ocean branding

---

## 🔍 **STREAM 2: INSPECTOR INTEGRATION**

**Duration:** 1.5 weeks  
**Engineers:** 2 (C + D)  
**Dependencies:** Day 0 prep  
**Integration:** Week 1 (ChatInterface shared)

### Sequential Dependencies

```
inspector-1 (verify bridge)
    ↓
┌───┴───┐
│       │
inspector-2  inspector-5 (can run parallel)
(UI)         (screenshot)
│
inspector-3 (AI context)
│
inspector-4 (point-and-ask)
```

---

### Detailed Task Breakdown

**Task: inspector-1** - Test Visual Editor context bridge  
**Duration:** 2 hours  
**Engineer:** C  
**Dependencies:** None

**Deliverables:**
```tsx
// Test file: client/src/tests/inspector-bridge.test.tsx
import { render, screen } from '@testing-library/react';
import { ChatInterface } from '@/components/mrBlue/ChatInterface';
import { VisualEditorContext } from '@/contexts/VisualEditorContext';

test('ChatInterface receives selectedElement from context', () => {
  const mockElement = {
    tagName: 'BUTTON',
    id: 'submit-btn',
    className: 'btn-primary',
    attributes: { type: 'submit' }
  };
  
  render(
    <VisualEditorContext.Provider value={{ selectedElement: mockElement }}>
      <ChatInterface />
    </VisualEditorContext.Provider>
  );
  
  // Verify element received
  expect(screen.getByTestId('selected-element-indicator')).toBeInTheDocument();
});
```

**Acceptance Criteria:**
- [ ] Verify selectedElement prop exists
- [ ] Verify lastKnownElement persistence
- [ ] Verify debug logging
- [ ] Document findings

---

**Task: inspector-2** - Add visual indicator for selected element  
**Duration:** 6 hours  
**Engineer:** C  
**Dependencies:** inspector-1

**Deliverables:**
```tsx
// ChatInterface.tsx
{activeElement && (
  <div className="flex items-center gap-2 px-4 py-2 bg-[var(--mt-ocean-teal)]/10 border-l-4 border-[var(--mt-ocean-teal)]">
    <Eye className="h-4 w-4 text-[var(--mt-ocean-teal)]" />
    <span className="text-sm">
      Inspecting: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
        {`<${activeElement.tagName.toLowerCase()}${activeElement.id ? ` id="${activeElement.id}"` : ''}${activeElement.className ? ` class="${activeElement.className}"` : ''}>`}
      </code>
    </span>
    <Button
      variant="ghost"
      size="sm"
      onClick={clearSelection}
      className="ml-auto"
    >
      <X className="h-4 w-4" />
    </Button>
  </div>
)}
```

**Acceptance Criteria:**
- [ ] Show when element selected
- [ ] Display tag, id, class
- [ ] Clear selection button
- [ ] MT Ocean styling
- [ ] Sticky at top of chat

---

**Task: inspector-3** - Enhance AI prompt with element details  
**Duration:** 4 hours  
**Engineer:** C  
**Dependencies:** inspector-2

**Deliverables:**
```tsx
// ChatInterface.tsx - sendMessage function
const enrichedPrompt = activeElement
  ? `[VISUAL CONTEXT] User is inspecting element: <${activeElement.tagName.toLowerCase()}${activeElement.id ? ` id="${activeElement.id}"` : ''}${activeElement.className ? ` class="${activeElement.className}"` : ''}>\n\nUser request: ${userMessage}`
  : userMessage;

await apiRequest('/api/mrblue/chat', {
  method: 'POST',
  body: JSON.stringify({
    messages: [...previousMessages, { role: 'user', content: enrichedPrompt }],
    model: selectedModel,
    visualContext: activeElement // Pass full object too
  })
});
```

**Acceptance Criteria:**
- [ ] Prefix user message with element context
- [ ] Include tagName, id, className, attributes
- [ ] Pass full element object to API
- [ ] Don't show context prefix to user

---

**Task: inspector-4** - Add point-and-ask examples  
**Duration:** 3 hours  
**Engineer:** D  
**Dependencies:** inspector-2, inspector-3

**Deliverables:**
```tsx
// InspectorPromptSuggestions.tsx
const elementPrompts = useMemo(() => {
  if (!activeElement) return [];
  
  const type = activeElement.tagName.toLowerCase();
  
  const prompts = {
    button: [
      'Make this button bigger',
      'Change button color to teal',
      'Add hover animation',
      'Center this button'
    ],
    input: [
      'Add placeholder text',
      'Make this input full width',
      'Add validation styling',
      'Change input border color'
    ],
    div: [
      'Add background gradient',
      'Make this responsive',
      'Add shadow effect',
      'Change layout to grid'
    ]
  };
  
  return prompts[type] || [
    'Tell me about this element',
    'How can I improve this?',
    'What CSS properties does this have?'
  ];
}, [activeElement]);

<div className="flex gap-2 overflow-x-auto px-4 py-2 bg-gray-50 dark:bg-gray-900">
  {elementPrompts.map(prompt => (
    <Button
      key={prompt}
      variant="outline"
      size="sm"
      onClick={() => sendMessage(prompt)}
      className="whitespace-nowrap"
    >
      {prompt}
    </Button>
  ))}
</div>
```

**Acceptance Criteria:**
- [ ] Context-aware prompts (button vs input vs div)
- [ ] Click to send
- [ ] Scrollable horizontally
- [ ] MT Ocean hover state

---

**Task: inspector-5** - Add element screenshot to AI context  
**Duration:** 8 hours  
**Engineer:** D  
**Dependencies:** inspector-1 (parallel with inspector-2/3)

**Deliverables:**
```tsx
// Use Computer Use API to capture element screenshot
import { captureElementScreenshot } from '@/lib/computerUse';

const handleElementSelection = async (element: HTMLElement) => {
  setSelectedElement(element);
  
  // Capture screenshot asynchronously
  try {
    const screenshot = await captureElementScreenshot(element);
    setElementScreenshot(screenshot); // base64 image
  } catch (error) {
    console.warn('Screenshot capture failed', error);
  }
};

// Include in AI context
const visualContext = {
  element: activeElement,
  screenshot: elementScreenshot, // GPT-4V can analyze this
  domContext: getParentHierarchy(activeElement)
};
```

**Acceptance Criteria:**
- [ ] Capture element screenshot via Computer Use API
- [ ] Store as base64
- [ ] Include in AI prompt (GPT-4V)
- [ ] Fallback gracefully if capture fails
- [ ] Privacy/legal review complete

---

## 💾 **STREAM 3: SAVE BUTTON**

**Duration:** 2 weeks  
**Engineers:** 2 (E + F)  
**Dependencies:** Day 0 prep  
**Integration:** Week 2 (GitPanePanel)

### Parallel Work Cells

**Cell A: Diff Component**
- **Tasks:** save-1, save-2, save-3, save-4
- **Owner:** Engineer E
- **Timeline:** Days 1-5

**Cell B: Git Integration**
- **Tasks:** save-5, save-6, save-7
- **Owner:** Engineer F
- **Timeline:** Days 1-7 (parallel with E)

---

### Detailed Task Breakdown

**Task: save-1** - Install react-diff-viewer library  
**Duration:** 1 hour  
**Engineer:** E  
**Dependencies:** Day 0 (already installed)

**Deliverables:**
```bash
# Verify installation
npm list react-diff-viewer-continued prismjs diff

# Create test component
// components/mrBlue/DiffPreview.test.tsx
import ReactDiffViewer from 'react-diff-viewer-continued';

const TestDiff = () => (
  <ReactDiffViewer
    oldValue="const a = 10;"
    newValue="const a = 20;"
    splitView={true}
  />
);
```

**Acceptance Criteria:**
- [ ] Library installed
- [ ] Test render works
- [ ] Syntax highlighting loads
- [ ] Dark theme renders

---

**Task: save-2** - Create DiffPreviewModal component  
**Duration:** 6 hours  
**Engineer:** E  
**Dependencies:** save-1, learn-1

**Deliverables:**
```tsx
// components/mrBlue/DiffPreviewModal.tsx
import ReactDiffViewer from 'react-diff-viewer-continued';
import Prism from 'prismjs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DiffPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string;
  oldCode: string;
  newCode: string;
  onAccept: () => void;
  onReject: () => void;
}

export function DiffPreviewModal({
  isOpen,
  onClose,
  filePath,
  oldCode,
  newCode,
  onAccept,
  onReject
}: DiffPreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Review Changes: {filePath}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <ReactDiffViewer
            oldValue={oldCode}
            newValue={newCode}
            splitView={true}
            useDarkTheme={true}
            leftTitle="Before"
            rightTitle="After"
            renderContent={(str) => {
              const html = Prism.highlight(
                str,
                Prism.languages.javascript,
                'javascript'
              );
              return <span dangerouslySetInnerHTML={{ __html: html }} />;
            }}
            styles={{
              variables: {
                dark: {
                  diffViewerBackground: 'var(--mt-ocean-dark-bg)',
                  addedBackground: 'var(--diff-added-bg)',
                  removedBackground: 'var(--diff-removed-bg)',
                  addedColor: 'var(--diff-added-text)',
                  removedColor: 'var(--diff-removed-text)',
                  diffViewerColor: '#E0F2FE'
                }
              }
            }}
          />
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onReject}
            data-testid="button-reject-diff"
          >
            Reject
          </Button>
          <Button
            onClick={onAccept}
            className="bg-[var(--mt-ocean-teal)] hover:bg-[var(--mt-ocean-cyan)]"
            data-testid="button-accept-diff"
          >
            Accept Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Acceptance Criteria:**
- [ ] Side-by-side diff view
- [ ] Syntax highlighting
- [ ] MT Ocean theme colors
- [ ] Accept/Reject buttons
- [ ] Full-screen modal (80vh)
- [ ] Responsive

---

**Task: save-3** - Integrate edit_file tool with diff preview  
**Duration:** 8 hours  
**Engineer:** E  
**Dependencies:** save-2, learn-2

**Deliverables:**
```tsx
// Modify Omniscient Mode edit_file tool handler
// server/services/tools/editFileTool.ts

export async function handleEditFilePreview(
  filePath: string,
  oldCode: string,
  newCode: string,
  userId: number
) {
  // Store pending diff in database
  const pendingDiff = await db.insert(pendingDiffs).values({
    userId,
    filePath,
    oldCode,
    newCode,
    status: 'pending',
    createdAt: new Date()
  }).returning();
  
  // Return diff ID to frontend
  return {
    diffId: pendingDiff[0].id,
    requiresApproval: true
  };
}

// Frontend: Show diff modal when AI wants to edit
const handleAIFileEdit = (response) => {
  if (response.tool === 'edit_file' && response.requiresApproval) {
    setDiffPreview({
      isOpen: true,
      diffId: response.diffId,
      filePath: response.filePath,
      oldCode: response.oldCode,
      newCode: response.newCode
    });
  }
};
```

**Acceptance Criteria:**
- [ ] AI edit triggers diff modal
- [ ] Diff stored in database (pending state)
- [ ] User must accept/reject
- [ ] No auto-apply without approval

---

**Task: save-4** - Add Accept/Reject buttons in diff modal  
**Duration:** 4 hours  
**Engineer:** E  
**Dependencies:** save-3

**Deliverables:**
```tsx
// ChatInterface.tsx
const handleAcceptDiff = async () => {
  // Apply the diff
  await apiRequest(`/api/diffs/${diffPreview.diffId}/accept`, {
    method: 'POST'
  });
  
  toast({
    title: 'Changes applied',
    description: `${diffPreview.filePath} has been updated`
  });
  
  // Close modal
  setDiffPreview({ isOpen: false });
  
  // Refresh git status
  queryClient.invalidateQueries({ queryKey: ['/api/git/status'] });
};

const handleRejectDiff = async () => {
  // Mark diff as rejected
  await apiRequest(`/api/diffs/${diffPreview.diffId}/reject`, {
    method: 'POST'
  });
  
  toast({
    title: 'Changes rejected',
    variant: 'destructive'
  });
  
  setDiffPreview({ isOpen: false });
};
```

**Acceptance Criteria:**
- [ ] Accept button applies changes
- [ ] Reject button cancels
- [ ] Toast notifications
- [ ] Modal closes
- [ ] Git status refreshes

---

**Task: save-5** - Connect diff Accept to GitPanePanel  
**Duration:** 6 hours  
**Engineer:** F  
**Dependencies:** save-4

**Deliverables:**
```tsx
// When diff is accepted, auto-stage file
// server/routes/diffs.ts

app.post('/api/diffs/:diffId/accept', requireAuth, async (req, res) => {
  const { diffId } = req.params;
  
  // Get diff from database
  const diff = await db.query.pendingDiffs.findFirst({
    where: eq(pendingDiffs.id, diffId)
  });
  
  if (!diff) {
    return res.status(404).json({ error: 'Diff not found' });
  }
  
  // Apply changes to file
  await fs.writeFile(diff.filePath, diff.newCode, 'utf-8');
  
  // Auto-stage file in git
  await exec(`git add ${diff.filePath}`);
  
  // Mark diff as accepted
  await db.update(pendingDiffs)
    .set({ status: 'accepted', appliedAt: new Date() })
    .where(eq(pendingDiffs.id, diffId));
  
  res.json({ success: true });
});
```

**Acceptance Criteria:**
- [ ] Accepted diffs auto-stage in git
- [ ] File written to disk
- [ ] Git status updates
- [ ] GitPanePanel shows staged file

---

**Task: save-6** - Add "Commit All Changes" button in ChatInterface  
**Duration:** 5 hours  
**Engineer:** F  
**Dependencies:** save-5

**Deliverables:**
```tsx
// ChatInterface.tsx - Add quick commit button
import { GitCommit } from 'lucide-react';

const { data: gitStatus } = useQuery({
  queryKey: ['/api/git/status'],
  refetchInterval: 5000
});

const quickCommitMutation = useMutation({
  mutationFn: async () => {
    // Generate AI commit message
    const { message } = await apiRequest('/api/git/generate-message', {
      method: 'POST'
    });
    
    // Commit
    return await apiRequest('/api/git/commit', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },
  onSuccess: () => {
    toast({
      title: 'Changes committed',
      description: 'Your changes have been saved to Git'
    });
  }
});

{gitStatus?.modifiedFiles.length > 0 && (
  <Button
    onClick={() => quickCommitMutation.mutate()}
    disabled={quickCommitMutation.isPending}
    className="bg-[var(--mt-ocean-teal)]"
    data-testid="button-quick-commit"
  >
    <GitCommit className="h-4 w-4 mr-2" />
    Commit {gitStatus.modifiedFiles.length} change{gitStatus.modifiedFiles.length > 1 ? 's' : ''}
  </Button>
)}
```

**Acceptance Criteria:**
- [ ] Button shows when files changed
- [ ] Displays file count
- [ ] Generates AI commit message
- [ ] Commits all staged files
- [ ] Loading state
- [ ] Toast confirmation

---

**Task: save-7** - Add keyboard shortcut (Cmd+Enter) to commit  
**Duration:** 3 hours  
**Engineer:** F  
**Dependencies:** save-6

**Deliverables:**
```tsx
// ChatInterface.tsx
useEffect(() => {
  const handleKeyboardShortcut = (e: KeyboardEvent) => {
    // Cmd+Enter (Mac) or Ctrl+Enter (Windows)
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      if (gitStatus?.modifiedFiles.length > 0) {
        e.preventDefault();
        quickCommitMutation.mutate();
      }
    }
  };
  
  window.addEventListener('keydown', handleKeyboardShortcut);
  return () => window.removeEventListener('keydown', handleKeyboardShortcut);
}, [gitStatus, quickCommitMutation]);

// Show hint in UI
<p className="text-xs text-gray-500 mt-2">
  Press <kbd>Cmd+Enter</kbd> to commit changes
</p>
```

**Acceptance Criteria:**
- [ ] Cmd+Enter triggers commit (Mac)
- [ ] Ctrl+Enter triggers commit (Windows)
- [ ] Only when files changed
- [ ] Visual hint shown
- [ ] Works from chat input

---

## 🔗 **INTEGRATION POINTS**

### Week 1 Integration Checkpoint

**What:** All 3 streams merge into shared ChatInterface  
**When:** End of Week 1 (Friday)  
**Duration:** 4 hours  
**Team:** All engineers

**Merge Checklist:**

**1. ChatInterface.tsx Merge**
```tsx
// Final ChatInterface structure
export function ChatInterface() {
  // Stream 1: Conversation state
  const { conversations, searchQuery } = useConversations();
  
  // Stream 2: Inspector state
  const { selectedElement, elementScreenshot } = useVisualEditor();
  
  // Stream 3: Diff preview state
  const { pendingDiff, showDiffModal } = useDiffPreview();
  
  return (
    <div className="flex h-screen">
      {/* Stream 1: Sidebar */}
      <ConversationSidebar />
      
      <main className="flex-1">
        {/* Stream 2: Inspector indicator */}
        <InspectorBadge element={selectedElement} />
        
        {/* Messages */}
        <MessageList />
        
        {/* Stream 2: Point-and-ask prompts */}
        {selectedElement && <InspectorPrompts />}
        
        {/* Input + Stream 3: Quick commit button */}
        <ChatInput />
        <QuickCommitButton />
      </main>
      
      {/* Stream 3: Diff modal */}
      <DiffPreviewModal
        isOpen={showDiffModal}
        {...pendingDiff}
      />
    </div>
  );
}
```

**2. API Contract Review**
- `/api/conversations` - CRUD operations
- `/api/diffs/:id/accept` - Apply changes
- `/api/diffs/:id/reject` - Reject changes
- `/api/git/generate-message` - AI commits
- `/api/git/commit` - Commit changes

**3. MT Ocean Theme Consistency**
- [ ] All components use CSS variables
- [ ] Dark/light mode works everywhere
- [ ] Teal accents (#14B8A6) consistent
- [ ] Hover states match

**4. Cross-Stream QA**
- [ ] Select element → Shows in chat → Ask AI → See diff → Commit (full flow)
- [ ] Search conversations while inspector active
- [ ] Commit from chat while viewing diff
- [ ] All features work together without conflicts

---

### Week 2-3 Integration (Final Polish)

**What:** Refinement, performance, edge cases  
**When:** Week 2-3 continuous  
**Team:** All engineers

**Tasks:**
- [ ] Performance optimization (React.memo, useMemo)
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Error boundaries
- [ ] Loading states
- [ ] Empty states
- [ ] Mobile responsive
- [ ] Screenshot all features (for docs)

---

## 📅 **TIMELINE**

### Week 0 (Day 0)
**Duration:** 1 day (4 hours)

- ✅ Install all libraries
- ✅ Add MT Ocean theme tokens
- ✅ Assign task ownership
- ✅ Schedule learning spikes

---

### Week 1
**Monday-Thursday:** Parallel stream execution

**Stream 1:**
- conv-1, conv-7 (layout + empty state)
- conv-2, conv-3 (data utilities)

**Stream 2:**
- inspector-1 (verify bridge)
- inspector-2, inspector-3 (UI + context)
- inspector-5 (screenshot - parallel)

**Stream 3:**
- save-1, save-2 (diff component)
- save-3, save-4 (integration)
- save-6 (quick commit button)

**Friday:** Integration checkpoint
- Merge all streams
- API contract review
- Theme consistency check
- Cross-stream QA

---

### Week 2
**Monday-Wednesday:** Stream completion

**Stream 1:**
- conv-4, conv-5, conv-6 (message actions)

**Stream 2:**
- inspector-4 (point-and-ask prompts)

**Stream 3:**
- save-5 (git integration)
- save-7 (keyboard shortcut)

**Thursday-Friday:** Polish + testing
- Performance optimization
- Accessibility
- Error handling
- Mobile responsive

---

### Week 3
**Monday-Wednesday:** Bonus features

- bonus-1 (@ mention files)
- bonus-2 (code preview panel)
- bonus-3 (multi-file batch edit)

**Thursday:** Final QA
- User journey testing
- Performance benchmarks
- Screenshot everything

**Friday:** Documentation + Release
- Update replit.md
- Create feature announcement
- Deploy to production

---

## 📊 **EXECUTION COMPARISON**

### SEQUENTIAL vs SIMULTANEOUS

**SEQUENTIAL (Old Way):**
```
Week 1: Conversation UI (conv-1 → conv-7)
Week 2: Inspector (inspector-1 → inspector-5)
Week 3-4: Save Button (save-1 → save-7)
Week 5: Integration + Polish

Total: 5 weeks
```

**SIMULTANEOUS (New Way):**
```
Day 0: Shared prep
Week 1: All 3 streams in parallel + integration
Week 2: Stream completion + polish
Week 3: Bonus features + release

Total: 3 weeks (40% faster!)
```

---

## ✅ **SUCCESS METRICS**

### End of Week 1
- [ ] All 3 streams have working prototypes
- [ ] ChatInterface merge successful
- [ ] No blocking conflicts
- [ ] User can test basic flow

### End of Week 2
- [ ] All core features complete
- [ ] Full user journey works (select → chat → diff → commit)
- [ ] MT Ocean theme consistent
- [ ] Performance acceptable (< 100ms interactions)

### End of Week 3
- [ ] Bonus features complete
- [ ] Screenshot documentation ready
- [ ] All acceptance criteria met
- [ ] Ready for production

---

## 🎯 **FINAL DELIVERABLE**

**Mr Blue 2.0 Features:**

✅ **Conversation UI**
- ChatGPT-style interface (MT Ocean theme)
- Date-grouped sidebar (Today, Yesterday, etc.)
- Search conversations
- Inline rename
- Copy/regenerate per message
- Suggested prompts empty state

✅ **Inspector Integration**
- Visual indicator when element selected
- Enhanced AI context with element details
- Point-and-ask prompt suggestions
- Element screenshot (Computer Use API)
- Clear selection button

✅ **Save Button Flow**
- Diff preview modal (side-by-side)
- Accept/reject changes
- Auto-stage in git
- Quick commit button
- AI-generated commit messages
- Keyboard shortcut (Cmd+Enter)

✅ **Bonus Features**
- @ mention file picker
- Code preview panel
- Multi-file batch edit UI

**Market Position:**
> "The only vibe coding platform with ChatGPT-quality voice AI, visual element inspection, and one-click commit flow - purpose-built for Mundo Tango."

---

**END OF SIMULTANEOUS BUILD PLAN**

**Ready to execute!** 🚀

Next step: Mark Day 0 tasks as in-progress and begin shared prep sprint.
