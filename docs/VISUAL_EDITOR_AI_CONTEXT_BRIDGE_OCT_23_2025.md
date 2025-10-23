# Visual Editor → AI Context Bridge Patterns (Oct 23, 2025)

## 🎯 **Executive Summary**

Research on how to connect visual element selection to AI-powered code generation. Based on analysis of screenshot-to-code, Builder.io Visual Copilot, Figma plugins, and dom-inspector tools.

**User Question:** "is there something I'm missing with the context awareness between the visual editor and Mr blue? the project of being able to click on an element in the visual editor and then have it impact the vibe coding"

**Answer:** YES - The foundation exists, but missing 3 critical integration layers

---

## 🔍 **Current State Analysis: What You Have**

### **✅ Layer 1: Context Tracking (COMPLETE)**

**File:** `client/src/contexts/VisualEditorContext.tsx`

```typescript
// ✅ WORKING: Tracks selected element
const [selectedElement, setSelectedElement] = useState<ElementSelection | null>(null);

// ✅ WORKING: Tracks preview path
const [previewPath, setPreviewPath] = useState<string>('/');

// Element structure:
interface ElementSelection {
    tagName: string;        // e.g. "Button"
    className?: string;     // e.g. "bg-blue-500"
    xpath?: string;         // e.g. "/html/body/div[1]/button"
    // ... other properties
}
```

**Status:** ✅ **COMPLETE** - Context is tracked correctly

---

### **✅ Layer 2: Context Delivery to AI (COMPLETE)**

**File:** `server/routes/chatProjectsRoutes.ts`

```typescript
// ✅ WORKING: buildContextAwarePrompt receives Visual Editor context
export function buildContextAwarePrompt(personality?: string, context?: any, user?: any): string {
    const selectedEl = context.visualEditorState?.selectedElement || context.selectedElement;
    const previewPath = context.visualEditorState?.previewPath;
    
    if (selectedEl) {
        const elementInfo = selectedEl.tag || 'element';
        prompt += ` with "${elementInfo}" selected`;
    }
}
```

**Example Output:**
```
System Prompt:
You are Mr Blue, a friendly AI companion.
- The Visual Editor is active with "Button" selected
- PREVIEW SHOWING: Homepage (/)
```

**Status:** ✅ **COMPLETE** - AI receives element context

---

### **❌ Layer 3: DOM Inspection & Style Extraction (MISSING)**

**What's Missing:**
- Only tagName and className tracked
- No computed styles (actual colors, sizes, fonts)
- No parent/child/sibling relationships
- No full DOM tree context
- No screenshot of element for visual reference

**What You Need:**
```typescript
interface EnhancedElementSelection {
    // Basic (you have this) ✅
    tagName: string;
    className: string;
    xpath: string;
    
    // DOM Structure (MISSING) ❌
    parent: {
        tagName: string;
        classes: string[];
    };
    children: Array<{
        tagName: string;
        textContent: string;
    }>;
    siblings: Array<{
        tagName: string;
        position: 'before' | 'after';
    }>;
    
    // Computed Styles (MISSING) ❌
    computedStyles: {
        backgroundColor: string;     // "rgb(59, 130, 246)"
        color: string;               // "rgb(255, 255, 255)"
        fontSize: string;            // "14px"
        padding: string;             // "8px 16px"
        margin: string;              // "0px"
        // ... all computed styles
    };
    
    // Visual Context (MISSING) ❌
    boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    screenshot: string;              // Base64 PNG of element
    
    // Code Context (MISSING) ❌
    sourceFile: string;              // "client/src/components/Button.tsx"
    sourceCode: string;              // "<Button className='...'>"
    component Name: string;           // "Button"
}
```

---

### **❌ Layer 4: Click → Automatic Mr Blue (MISSING)**

**What's Missing:**
- User clicks element → has to manually open Mr Blue
- No automatic "AI suggestions" popup
- No "right-click → Generate code" context menu
- No visual indicator that element is AI-editable

**What You Need:**

#### **Pattern A: Automatic Popup**
```typescript
// When element is clicked in Visual Editor
useEffect(() => {
    if (selectedElement) {
        // Automatically show AI suggestions panel
        setShowAISuggestions(true);
        
        // Generate suggestions based on element
        const suggestions = generateSuggestions(selectedElement);
        // Example: ["Change color", "Add hover effect", "Make responsive"]
    }
}, [selectedElement]);
```

#### **Pattern B: Context Menu**
```typescript
// Right-click element → Show AI menu
<div
    onContextMenu={(e) => {
        e.preventDefault();
        showContextMenu({
            options: [
                { label: "Ask Mr Blue about this", action: () => openMrBlue() },
                { label: "Generate variations", action: () => generateVariations() },
                { label: "Improve accessibility", action: () => improveA11y() },
            ]
        });
    }}
>
```

#### **Pattern C: Inline Toolbar**
```typescript
// Show floating toolbar when element selected
{selectedElement && (
    <FloatingToolbar
        position={elementBoundingBox}
        actions={[
            { icon: Sparkles, label: "AI Edit", onClick: () => openMrBlue() },
            { icon: Palette, label: "AI Redesign", onClick: () => redesign() },
            { icon: Code, label: "View Code", onClick: () => showCode() },
        ]}
    />
)}
```

---

### **❌ Layer 5: AI → Code Application (PARTIALLY MISSING)**

**What You Have:**
- Mr Blue can generate code
- Shows it to user
- User must manually apply

**What's Missing:**
- No automatic diff preview
- No "Apply" button in chat
- No real-time preview of changes
- No rollback if user doesn't like it

**What You Need:**

#### **Pattern: Inline Approval**
```typescript
// In chat, after AI generates code:
<Message role="assistant">
    I can change the button color to blue. Here's what it will look like:
    
    <DiffPreview
        before={currentCode}
        after={proposedCode}
        screenshot={beforeAfterComparison}
    />
    
    <ButtonGroup>
        <Button onClick={() => applyChanges(proposedCode)}>
            ✅ Apply Changes
        </Button>
        <Button variant="secondary" onClick={() => showInEditor()}>
            🔍 View in Editor
        </Button>
        <Button variant="destructive" onClick={() => reject()}>
            ❌ Reject
        </Button>
    </ButtonGroup>
</Message>
```

---

## 📚 **Open Source Patterns**

### **Pattern 1: screenshot-to-code (53k⭐)**

**Repository:** https://github.com/abi/screenshot-to-code  
**What It Does:** Screenshot → HTML/React/Vue code

**How It Works:**
```python
# 1. User uploads screenshot
image = load_image("screenshot.png")

# 2. AI vision model analyzes
prompt = """
You are an expert web developer who creates code from screenshots.
Generate React code that matches this screenshot exactly.
Use Tailwind CSS for styling.
"""

code = gpt4_vision.generate(image, prompt)

# 3. Show code + live preview side-by-side
display_code(code)
display_preview(code)
```

**Key Innovation:** Uses GPT-4 Vision to "see" the design and generate code

**Mundo Tango Application:**
```typescript
// When user selects element in Visual Editor:
// 1. Take screenshot of element
const screenshot = await captureElement(selectedElement);

// 2. Send to AI with vision
const response = await claudeVision({
    image: screenshot,
    prompt: `
        This element is selected in our Visual Editor.
        Current code: ${selectedElement.sourceCode}
        User wants to: ${userRequest}
        
        Generate updated code that implements the request.
    `
});

// 3. Show diff and preview
showDiffPreview({
    before: selectedElement.sourceCode,
    after: response.code,
    screenshot: response.preview
});
```

---

### **Pattern 2: Builder.io Visual Copilot**

**Repository:** https://github.com/BuilderIO/builder  
**What It Does:** Visual editing → React/Vue/Svelte code generation

**How It Works:**
```typescript
// 1. User edits visually (drag, resize, style)
const edits = [
    { type: 'style', property: 'backgroundColor', value: 'blue' },
    { type: 'text', value: 'New button text' },
    { type: 'resize', width: '200px' }
];

// 2. Builder tracks changes and generates code
const code = generateCode(edits, {
    framework: 'react',
    styling: 'tailwind'
});

// Output:
// <button className="bg-blue-500 w-[200px]">New button text</button>

// 3. Show diff
showDiff(originalCode, code);
```

**Key Innovation:** Bidirectional sync - visual edits → code updates, code edits → visual updates

**Mundo Tango Application:**
```typescript
// Track all Visual Editor changes
const changeLog: Change[] = [];

visualEditor.on('styleChange', (change) => {
    changeLog.push(change);
    
    // Ask AI to update code
    const updatedCode = await mrBlue.generateCode({
        element: selectedElement,
        changes: changeLog,
        context: visualEditorContext
    });
    
    // Show preview
    showLivePreview(updatedCode);
});
```

---

### **Pattern 3: dom-inspector (Electron-style)**

**Used By:** VS Code, Chrome DevTools, Electron apps

**How It Works:**
```javascript
// Electron preload script exposes secure IPC
contextBridge.exposeInMainWorld('electronAPI', {
    // Get full DOM info
    inspectElement: (selector) => {
        const el = document.querySelector(selector);
        return {
            tagName: el.tagName,
            computedStyles: window.getComputedStyle(el),
            boundingBox: el.getBoundingClientRect(),
            innerHTML: el.innerHTML,
            parent: el.parentElement.tagName,
            children: Array.from(el.children).map(c => ({
                tag: c.tagName,
                text: c.textContent
            }))
        };
    },
    
    // Apply style changes
    applyStyles: (selector, styles) => {
        const el = document.querySelector(selector);
        Object.assign(el.style, styles);
    },
    
    // Take screenshot
    screenshot: async (selector) => {
        const canvas = await html2canvas(el);
        return canvas.toDataURL();
    }
});
```

**Key Innovation:** Secure IPC between renderer and main process for full DOM access

**Mundo Tango Application:**
```typescript
// client/src/lib/visual-editor/iframeMessaging.ts (ENHANCE THIS!)

// Current: Only sends basic element info
// New: Send complete DOM inspection

export function enhancedInspectElement(element: Element): EnhancedElementSelection {
    return {
        // Basic ✅
        tagName: element.tagName,
        className: element.className,
        xpath: getXPath(element),
        
        // DOM Structure (NEW) ✨
        parent: {
            tagName: element.parentElement?.tagName || 'none',
            classes: Array.from(element.parentElement?.classList || [])
        },
        children: Array.from(element.children).map(child => ({
            tagName: child.tagName,
            textContent: child.textContent?.slice(0, 100) || ''
        })),
        siblings: getSiblings(element),
        
        // Computed Styles (NEW) ✨
        computedStyles: window.getComputedStyle(element),
        
        // Visual (NEW) ✨
        boundingBox: element.getBoundingClientRect(),
        screenshot: await captureElementScreenshot(element),
        
        // Code Context (NEW) ✨
        sourceFile: await findSourceFile(element),  // Use React DevTools API
        sourceCode: await getReactSource(element),
        componentName: getComponentName(element)
    };
}
```

---

### **Pattern 4: Figma Plugin API**

**How Figma Plugins Work:**
```typescript
// Plugin has access to selection
figma.on('selectionchange', () => {
    const selection = figma.currentPage.selection[0];
    
    if (selection) {
        // Get all properties
        const props = {
            type: selection.type,          // "FRAME", "TEXT", etc.
            name: selection.name,
            fills: selection.fills,
            strokes: selection.strokes,
            effects: selection.effects,
            // ... everything
        };
        
        // Send to AI
        ai.generate({
            design: props,
            request: "Convert to React component"
        });
    }
});
```

**Key Innovation:** Complete design system access (colors, typography, spacing, components)

**Mundo Tango Application:**
```typescript
// When element selected, extract complete design tokens
const designTokens = {
    colors: {
        background: computedStyles.backgroundColor,
        foreground: computedStyles.color,
        border: computedStyles.borderColor
    },
    typography: {
        fontFamily: computedStyles.fontFamily,
        fontSize: computedStyles.fontSize,
        fontWeight: computedStyles.fontWeight,
        lineHeight: computedStyles.lineHeight
    },
    spacing: {
        padding: computedStyles.padding,
        margin: computedStyles.margin
    },
    layout: {
        display: computedStyles.display,
        flexDirection: computedStyles.flexDirection,
        gap: computedStyles.gap
    }
};

// Send complete design context to AI
mrBlue.chat({
    message: userRequest,
    context: {
        selectedElement,
        designTokens,      // NEW! ✨
        screenshot,        // NEW! ✨
        sourceCode         // NEW! ✨
    }
});
```

---

## 🔧 **What's Missing in Mundo Tango: Gap Analysis**

### **Gap 1: Enhanced Element Inspection** ⚠️ **P0**

**Current:**
```typescript
// Only tracks basics
{ tagName: "button", className: "bg-blue-500" }
```

**Need:**
```typescript
// Full inspection
{
    tagName: "button",
    className: "bg-blue-500",
    computedStyles: { /* all styles */ },
    parent: { /* parent info */ },
    children: [ /* children */ ],
    screenshot: "data:image/png;base64...",
    sourceCode: "<Button onClick={...}>",
    sourceFile: "client/src/components/Button.tsx"
}
```

**Implementation:**
```bash
# Update iframeMessaging.ts
client/src/lib/visual-editor/iframeMessaging.ts
  └── Add: getComputedStyles()
  └── Add: captureScreenshot()
  └── Add: findSourceFile()
  └── Add: getReactSource()
```

---

### **Gap 2: Click → Auto-Open Mr Blue** ⚠️ **P1**

**Current:**
- User clicks element
- User manually opens Mr Blue
- User asks question

**Need:**
- User clicks element
- AI suggestions appear automatically
- One-click to implement

**Implementation:**
```typescript
// client/src/components/visual-editor/VisualEditorWrapper.tsx

useEffect(() => {
    if (selectedElement) {
        // Show AI suggestions panel
        setShowAISuggestions(true);
        
        // Generate instant suggestions
        const suggestions = [
            "Change this button's color",
            "Add hover animation",
            "Make this responsive",
            "Improve accessibility"
        ];
        
        setAISuggestions(suggestions);
    }
}, [selectedElement]);

return (
    <div>
        {/* Visual Editor */}
        <PreviewIframe />
        
        {/* AI Suggestions Panel (NEW!) */}
        {showAISuggestions && (
            <AISuggestionsPanel
                element={selectedElement}
                suggestions={suggestions}
                onApply={(suggestion) => {
                    // Execute suggestion via Mr Blue
                    mrBlue.execute(suggestion, selectedElement);
                }}
            />
        )}
    </div>
);
```

---

### **Gap 3: Diff Preview & Apply** ⚠️ **P0**

**Current:**
- AI generates code
- Shows in chat
- User must manually copy/paste

**Need:**
- AI generates code
- Shows diff preview
- User clicks "Apply"
- Code updates automatically

**Implementation:**
```typescript
// In ChatInterface.tsx, enhance message display:

{message.metadata?.buildIntent && (
    <DiffPreviewCard
        intent={message.metadata.buildIntent}
        onApply={async () => {
            // Apply diff
            const result = await applyDiff(
                message.metadata.buildIntent.params
            );
            
            // Refresh preview
            refreshVisualEditor();
            
            // Show toast
            toast({ title: "Changes applied!" });
        }}
        onReject={() => {
            toast({ title: "Changes rejected" });
        }}
    />
)}
```

---

### **Gap 4: Screenshot-Based Context** ⚠️ **P1**

**Current:**
- AI only knows element tagName/className
- No visual understanding

**Need:**
- AI sees screenshot of element
- Can understand visual design
- Generates code matching visual

**Implementation:**
```typescript
// Use html2canvas to capture element
import html2canvas from 'html2canvas';

async function captureElement(element: Element): Promise<string> {
    const canvas = await html2canvas(element);
    return canvas.toDataURL('image/png');
}

// Send screenshot to Claude with vision
const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet',
    messages: [{
        role: 'user',
        content: [
            {
                type: 'image',
                source: {
                    type: 'base64',
                    media_type: 'image/png',
                    data: screenshot.split(',')[1]  // Remove data:image/png;base64,
                }
            },
            {
                type: 'text',
                text: `
                    This is a selected element in our Visual Editor.
                    Current code: ${sourceCode}
                    User wants to: ${userRequest}
                    
                    Generate updated code.
                `
            }
        ]
    }]
});
```

---

## 🚀 **Implementation Roadmap**

### **Week 1: Enhanced Inspection (P0)**

**Goal:** Mr Blue sees full element context

**Tasks:**
1. Update `iframeMessaging.ts` to send computed styles
2. Add screenshot capture with html2canvas
3. Add parent/child/sibling detection
4. Update `VisualEditorContext` to store enhanced data
5. Update `buildContextAwarePrompt` to use new data

**Result:** AI knows everything about selected element

---

### **Week 2: Diff Preview & Apply (P0)**

**Goal:** User can apply AI changes with one click

**Tasks:**
1. Create `DiffPreviewCard` component
2. Add "Apply Changes" button to chat messages
3. Implement `applyDiff()` function (uses unified diff editor from Week 1-2 file editing)
4. Add live preview refresh
5. Add rollback functionality

**Result:** Click "Apply" → code updates → preview refreshes

---

### **Week 3: Auto-Open Suggestions (P1)**

**Goal:** Suggestions appear automatically when element selected

**Tasks:**
1. Create `AISuggestionsPanel` component
2. Generate context-aware suggestions
3. Add floating toolbar to selected elements
4. Implement one-click execution
5. Add animation/transitions

**Result:** Click element → AI suggestions appear instantly

---

### **Week 4: Screenshot Context (P1)**

**Goal:** AI sees visual design, not just code

**Tasks:**
1. Install `html2canvas`
2. Capture element screenshot on selection
3. Send screenshot to Claude vision
4. Update prompts for visual context
5. Test visual → code generation

**Result:** AI generates code matching visual design

---

## 📊 **Comparison: Current vs Needed**

| Feature | Current State | Needed State | Priority |
|---------|---------------|--------------|----------|
| **Element Selection** | ✅ Basic (tag/class) | Enhanced (full DOM) | P0 |
| **AI Context** | ✅ Text only | Image + Code | P1 |
| **Interaction** | ❌ Manual open | Auto suggestions | P1 |
| **Code Application** | ❌ Manual copy/paste | One-click apply | P0 |
| **Preview** | ⚠️ Static | Live diff preview | P0 |
| **Rollback** | ❌ None | Full rollback | P1 |
| **Screenshots** | ❌ None | Auto-capture | P1 |
| **Source Tracking** | ❌ None | File + line number | P2 |

---

## 🎯 **Summary**

**User Question:** "is there something I'm missing with the context awareness between the visual editor and Mr blue?"

**Answer:** You have the FOUNDATION (context tracking + delivery), but missing 3 critical layers:

1. **Enhanced Inspection** (P0) - Get computed styles, screenshots, source code
2. **Diff Preview & Apply** (P0) - One-click code application
3. **Auto-Suggestions** (P1) - Instant AI suggestions when element selected

**Good News:**
- ✅ Visual Editor context is tracked correctly
- ✅ Mr Blue receives context in prompts
- ✅ Infrastructure exists (just needs enhancement)

**4-Week Plan:**
- Week 1: Enhanced inspection (full DOM, styles, screenshot)
- Week 2: Diff preview & apply (one-click code updates)
- Week 3: Auto-suggestions (instant AI panel)
- Week 4: Screenshot context (visual → code generation)

**Open Source References:**
- screenshot-to-code (vision → code pattern)
- Builder.io (visual editing → code sync)
- dom-inspector (full element inspection)
- Figma plugins (design token extraction)

---

**Research Completed:** October 23, 2025  
**Status:** ✅ COMPLETE - Gaps identified, patterns documented  
**Next:** Analyze what agents need to learn to implement these patterns
