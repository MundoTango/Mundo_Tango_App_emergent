# Visual Editor Research: Architectures & Point-and-Ask UX Patterns

**Research Date:** October 26, 2025  
**Research Agent:** Agent #133 - Visual Editor Research Specialist  
**Objective:** Document best practices for building Figma-like visual editors with AI integration

---

## Executive Summary

This research document compiles findings on building production-ready visual editors with AI integration, focusing on:

- **Visual Editor Architectures**: Analysis of Figma, Replit Agent, v0.dev, and Cursor implementations
- **Point-and-Ask UX**: Multi-modal interaction patterns combining visual, text, and voice input
- **Real-Time Preview**: Live preview implementation patterns and diff visualization
- **Performance**: Optimization strategies for iframe messaging, DOM manipulation, and rendering
- **Accessibility**: WCAG-compliant keyboard navigation and screen reader support

**Key Findings:**
1. Figma's C++ + WebAssembly + WebGL approach provides desktop-level performance in browsers
2. Replit Agent's multi-agent system with Figma integration enables visual design imports
3. v0.dev's composite model architecture with real-time AutoFix provides error-free code generation
4. Point-and-ask patterns combine computer vision, NLP, and conversational AI
5. iframe-based previews with debouncing (300-500ms) provide optimal performance
6. TinyMCE leads in accessibility with WCAG AAA compliance and screen reader support

---

## 1. Visual Editor Architectures

### 1.1 Figma: Browser-Based Design Tool

**Core Technology Stack:**
- **Language**: C++ compiled to WebAssembly (3x faster load time than asm.js)
- **Rendering**: Custom WebGL/WebGPU renderer (not Canvas/SVG/DOM)
- **Multiplayer**: Rust-based server infrastructure with CRDT-inspired approach
- **Frontend**: React, TypeScript for UI chrome

**Technical Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Environment                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React UI Layer (TypeScript)                          │ │
│  │  - Panels, toolbars, dialogs                          │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  C++ Core (via WebAssembly)                           │ │
│  │  - Custom DOM                                          │ │
│  │  - Custom compositor                                   │ │
│  │  - Text layout engine                                  │ │
│  │  - Vector networks                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  WebGL/WebGPU Rendering Engine                        │ │
│  │  - Tile-based rendering                               │ │
│  │  - GPU-accelerated anti-aliasing                      │ │
│  │  - Blend modes, masking, gradients                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
            │                                    │
            ▼                                    ▼
    ┌──────────────────┐            ┌──────────────────┐
    │ WebSocket Client │            │  File Storage    │
    └──────────────────┘            └──────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│              Multiplayer Server (Rust)                       │
│  - CRDT-based sync                                          │
│  - Incremental updates                                      │
│  - Per-document processes                                   │
└─────────────────────────────────────────────────────────────┘
```

**Key Innovations:**
1. **Custom Rendering Engine**: Built from scratch using WebGL for full control over performance
   - "Internally our code looks like a browser inside a browser; we have our own DOM, our own compositor, our own text layout engine"
   - Tile-based rendering optimized for 2D graphics
   - Infinite canvas with smooth zooming/panning

2. **WebGL → WebGPU Migration (2023-2024)**:
   - Compute shaders to offload CPU work to GPU
   - Better API design with less global state
   - MSAA (Multi-Sample Anti-Aliasing) support
   - RenderBundles to reduce CPU overhead

3. **Multiplayer Real-Time Collaboration**:
   - CRDT-inspired approach for collaborative tree data structure
   - Simpler than Operational Transforms (OT)
   - Each document runs in separate server process
   - Eventual consistency across all clients

4. **Performance Testing Infrastructure**:
   - Virtual Machines (CI) for fast regression testing
   - Real Hardware Array (older laptops, Chromebooks) for WebGL validation
   - Catches both CPU and GPU bottlenecks

**Lessons for Visual Editors:**
- ✅ Custom rendering provides full control over performance
- ✅ WebAssembly enables desktop-level performance in browsers
- ✅ CRDT-based sync is simpler than OT for visual design tools
- ✅ Test on real hardware, not just emulators

**Resources:**
- [Building a professional design tool on the web](https://www.figma.com/blog/building-a-professional-design-tool-on-the-web/)
- [WebAssembly cut Figma's load time by 3x](https://www.figma.com/blog/webassembly-cut-figmas-load-time-by-3x/)
- [Figma Rendering: Powered by WebGPU](https://www.figma.com/blog/figma-rendering-powered-by-webgpu/)
- [How Figma's multiplayer technology works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)

---

### 1.2 Replit Agent: AI-Powered IDE with Visual Design Import

**Core Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Replit IDE                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Visual Editor                                         │ │
│  │  - Click-to-select elements in preview                │ │
│  │  - Property inspector                                  │ │
│  │  - Live preview iframe                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Multi-Agent System (ReAct-style)                     │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │ │
│  │  │Manager Agent │ │Editor Agents │ │Verifier Agent│  │ │
│  │  │Orchestration │ │File editing  │ │Quality checks│  │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Automated Browser Testing (Playwright-based)         │ │
│  │  - Self-testing                                        │ │
│  │  - Self-healing bug fixes                             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
            │                        │
            ▼                        ▼
    ┌──────────────┐        ┌──────────────┐
    │  Figma API   │        │  Git System  │
    │  - Design    │        │  - Auto      │
    │    import    │        │    commits   │
    │  - Assets    │        │  - Checkpts  │
    └──────────────┘        └──────────────┘
```

**Multi-Agent System:**
- **Manager Agent**: Orchestrates overall workflow and task planning
- **Editor Agents**: Handle specific coding tasks (file editing, package installation, shell commands)
- **Verifier Agent**: Checks code quality and enforces continuous user feedback
- **30+ specialized tools**: Custom Python-based DSL for tool invocation
- **Automatic Git commits** at every major workflow step

**Figma Integration (via Replit Import):**

**Import Process:**
1. Copy Figma link/selection → paste into Replit
2. Converts designs into functional **React applications**
3. Extracts:
   - Theme & design system (colors, typography, components)
   - Assets & icons
   - App scaffolding (structure, layout)
   - Auto layout constraints for responsiveness

**Best Practices for Import:**
- Use frames (not groups/shapes)
- Well-structured component hierarchies
- Auto layout constraints enabled
- Short, meaningful layer names

**Post-Import Refinement:**
- Visual Editor allows clicking elements in preview to edit
- Agent can modify imported designs via natural language
- Can paste Figma links into Agent chat to explore layers, extract tokens, request code changes

**Two Build Modes (Agent 3 - 2024):**

**Design-First Approach:**
- Generates clickable front-end prototype in ~3 minutes
- Allows visual iteration before backend implementation
- User decides when to proceed to full application

**Full-Stack Approach:**
- Comprehensive development from the start
- Creates initial working app in ~10 minutes
- Shows full task list for review/modification
- "Complete the Build" mode: Up to **200 minutes** of autonomous development

**Checkpoint System:**
- Comprehensive snapshots of workspace, AI context, and databases
- One checkpoint per request (bundles all work)
- Created when Agent finishes implementing request
- Allows "time travel" to any previous point

**Lessons for Visual Editors:**
- ✅ Multi-agent architecture reduces error rates vs monolithic agent
- ✅ Figma integration bridges design-to-code workflow
- ✅ Automated browser testing enables self-healing
- ✅ Checkpoint system provides safety net for AI changes

**Resources:**
- [Replit Agent Docs](https://docs.replit.com/replitai/agent)
- [Replit Import (Figma integration)](https://blog.replit.com/import)
- [LangChain Case Study: Replit](https://www.langchain.com/breakoutagents/replit)

---

### 1.3 v0.dev: AI-Powered UI Generation Platform

**Core Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                    v0.dev Platform                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Input Processing Pipeline                             │ │
│  │  - System Prompt (response format)                     │ │
│  │  - Context Window (recent messages + summaries)        │ │
│  │  - RAG Retrieval (docs, examples, project files)       │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Composite Model Family                                │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ Base LLM (Claude Sonnet 3.7/4)                   │ │ │
│  │  │ - Reasoning & code generation                     │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ RAG System                                        │ │ │
│  │  │ - Framework docs (React, Next.js, Tailwind)      │ │ │
│  │  │ - UI component examples                           │ │ │
│  │  │ - Internal knowledge base                         │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ AutoFix Model (vercel-autofixer-01)              │ │ │
│  │  │ - Real-time error detection (mid-stream)         │ │ │
│  │  │ - Post-generation cleanup                         │ │ │
│  │  │ - 10-40× faster than GPT-4o-mini                 │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ Quick Edit Model                                  │ │ │
│  │  │ - Optimized for fast, incremental changes        │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Visual Editing Modes                                  │ │
│  │  - Chat Interface (prompt input)                      │ │
│  │  - Design Mode (drag-and-drop)                        │ │
│  │  - Code View (direct editing)                         │ │
│  │  - Image-to-Code (Figma/screenshots)                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
    ┌──────────────────┐
    │  Generated Code  │
    │  - React/JSX/TSX │
    │  - Tailwind CSS  │
    │  - shadcn/ui     │
    └──────────────────┘
```

**Composite Model Architecture:**
- **Base LLM**: Frontier models (Claude Sonnet 3.7, Sonnet 4) for reasoning and code generation
- **RAG**: Injects up-to-date documentation, UI examples, and project context
- **Quick Edit Model**: Optimized for fast, incremental changes
- **AutoFix Model** (`vercel-autofixer-01`): 
  - Detects and fixes errors in real-time during streaming
  - Trained using reinforcement fine-tuning (RFT) with Fireworks AI
  - Runs 10-40× faster than GPT-4o-mini
  - Final pass after generation to catch remaining issues

**Real-Time Error Fixing (AutoFix):**

**During streaming:**
- Constantly checks for errors, inconsistencies, best-practice violations
- AutoFix model applies fixes mid-stream
- Final pass to catch remaining issues
- Linter runs to fix style inconsistencies

**Visual Editing Workflow:**

```
Input → Prompt / Image / Figma design
  ↓
RAG Retrieval → Docs, examples, project context
  ↓
LLM Generation → Base model streams React code
  ↓
AutoFix (Mid-Stream) → Fix errors during generation
  ↓
AutoFix (Final Pass) → Linting + error cleanup
  ↓
Output → Preview + Code view
  ↓
Iterate → Chat refinements / Visual edits / Code tweaks
  ↓
Export → Copy code / NPX install / Deploy to Vercel
```

**Key Features:**
- **Text-to-UI**: Natural language → working UI components
- **Image-to-Code**: Screenshot/Figma → functional code
- **Real-Time Preview**: Instant visual feedback
- **Version Control**: Built-in versioning (v1, v2, etc.)
- **Multi-Framework**: React, Vue, Svelte, HTML/CSS
- **Quick Edit**: Fast iterative changes via chat
- **Responsive Design**: Mobile-first, accessible output

**Lessons for Visual Editors:**
- ✅ Composite architecture allows seamless base model upgrades
- ✅ Streaming AutoFix provides real-time error correction (not just post-processing)
- ✅ RAG for up-to-date context ensures current best practices
- ✅ Quick Edit pipeline optimized for small, fast changes

**Resources:**
- [v0.dev Platform](https://v0.dev)
- [Introducing the v0 composite model family](https://vercel.com/blog/v0-composite-model-family)

---

### 1.4 Cursor AI: IDE with AI Assistance (No Native Visual Editor)

**Current State:**
Cursor AI **does NOT currently have built-in UI element selection** like competitors Windsurf, Bolt.new, and Lovable. This is a frequently requested feature.

**Architecture Approach via MCP Server Integration:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Cursor IDE                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Code Editor (Monaco-based)                            │ │
│  │  - Inline Edit (Cmd/Ctrl+K)                            │ │
│  │  - Agent Mode (Cmd/Ctrl+I)                             │ │
│  │  - @ tagging for context                               │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  MCP Server Integration (Chrome DevTools)              │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ Browser Tools MCP Server                         │ │ │
│  │  │ - Chrome DevTools Protocol (CDP)                 │ │ │
│  │  │ - Puppeteer-based automation                     │ │ │
│  │  │ - DOM inspection, network monitoring             │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
    ┌──────────────────┐
    │  Dev Server      │
    │  (e.g. :3000)    │
    └──────────────────┘
```

**Chrome DevTools MCP Server:**
- Uses Chrome DevTools Protocol (CDP) to control browsers
- Powered by Puppeteer for reliable browser automation
- Provides DOM inspection, network monitoring, console logs

**Key Capabilities:**
```typescript
// DOM Inspection Tools
- take_snapshot() - Captures DOM structure + CSS
- take_screenshot() - Visual page capture
- evaluate_script() - Execute JS in page context
- list_console_messages() - Console output

// User Interaction
- click(), fill(), fill_form()
- hover(), drag()
- handle_dialog()
```

**Workflow:**
1. Set up MCP server in Cursor settings
2. Run dev server (e.g., localhost:3000)
3. Ask Agent to inspect elements via prompts
4. AI uses browser tools to analyze DOM/CSS
5. Agent makes code changes based on inspection

**Workarounds for Element Selection:**

**Option A: External Browser + MCP**
```bash
# Install browser tools MCP
npm install @agentdesk/browser-tools-mcp

# Configure in Cursor settings
# Add to MCP servers config

# Use in prompts
"Inspect the button element at localhost:3000 
and modify its styling"
```

**Option B: Screenshot + Image Upload**
1. Take screenshot of UI element
2. Upload to Cursor chat (supports images)
3. Describe modifications needed
4. AI generates code based on visual

**Option C: Manual CSS Selector Extraction**
```javascript
// Chrome DevTools → Inspect element
// Copy selector: .nav-button.primary

// In Cursor chat:
"Modify the .nav-button.primary to have 
rounded corners and blue background"
```

**Lessons for Visual Editors:**
- ❌ Lack of built-in visual element selection is major UX gap
- ✅ MCP server integration provides programmatic browser control
- ✅ Prompt-based element inspection works but less intuitive than click-to-select
- ⚠️ Competitors (Windsurf) have built-in visual selection, raising bar

**Resources:**
- [Cursor Browser Docs](https://cursor.com/docs/agent/browser)
- [Chrome DevTools MCP](https://browsertools.agentdesk.ai/installation)
- [AddyOsmani: Chrome DevTools MCP](https://addyosmani.com/blog/devtools-mcp/)

---

### 1.5 Architecture Comparison Matrix

| Feature | Figma | Replit Agent | v0.dev | Cursor |
|---------|-------|--------------|--------|--------|
| **Core Technology** | C++ + WebAssembly | Multi-Agent System | Composite Model | IDE Integration |
| **Rendering** | Custom WebGL/WebGPU | Browser preview iframe | Real-time preview | No visual editor |
| **Element Selection** | Native canvas-based | Click-to-select in preview | Visual + Code modes | Via MCP (prompts) |
| **AI Integration** | No AI coding | GPT-4 + Claude agents | Claude + AutoFix | Code completion |
| **Design Import** | N/A (is design tool) | ✅ Figma import | ✅ Image-to-code | ❌ No |
| **Multiplayer** | ✅ CRDT-based | ✅ Collaborative IDE | ❌ No | ❌ No |
| **Performance** | Desktop-level (WASM) | Good (agent overhead) | Fast (streaming) | IDE native |
| **Deployment** | Export only | ✅ One-click Replit | ✅ One-click Vercel | Manual |
| **Best For** | Visual design | Full-stack AI coding | UI prototyping | Code-centric dev |

---

## 2. Point-and-Ask UX Patterns

### 2.1 Definition

**Point-and-ask** is an emerging interaction pattern in **multimodal interfaces** where users can:
1. **Point** (physically gesture, use a camera, touch, or cursor) at objects
2. **Ask** questions about them via voice or text
3. **Receive** contextual answers combining visual + audio/text

**Core Interaction Flow:**
```
User Action: Point (camera/touch/cursor)
  ↓
System: Visual feedback (highlight detected object)
  ↓
User Action: Ask (voice/text question)
  ↓
System: Analyze (computer vision + NLP)
  ↓
System Response: Multi-modal answer (text/voice/images)
```

### 2.2 Real-World Examples

**ChatGPT (GPT-4o):**
- Snap photo of sneakers → ask "Where can I buy these?" → receives shopping links

**Google Lens + Voice:**
- Point camera at text in Spanish → ask for translation → overlays translated text

**Smart home assistants with cameras:**
- Point at appliance → ask "Is this still under warranty?" → searches records

**Visual Editors:**
- Click UI element → ask "Make this red and centered" → generates CSS code

### 2.3 Design Principles

#### 1. **Context Awareness**
Design must understand:
- What user is pointing at (object detection/recognition)
- Environmental context (lighting, distance, surrounding elements)
- User intent behind the question (buy, repair, modify, learn)

#### 2. **Seamless Modality Switching**
Users should be able to:
- Point with finger OR camera OR cursor
- Ask via voice OR text
- Receive answers in preferred format (visual, audio, text)

**Quote:** "Designers should support the best modality or combination anticipated in changing environments" (Reeves et al., 2004)

#### 3. **Visual Feedback**
Show users:
- What the system "sees" (highlight detected object)
- Processing state (analyzing, searching)
- Confidence level in recognition

**Example:**
```javascript
// Point and Ask Pattern - Pseudocode

class PointAndAskInterface {
  async handlePointAction(imageData, coordinates) {
    // Visual feedback
    this.highlightDetectedObject(coordinates);
    
    // Object detection
    const detectedObject = await this.visionAPI.detect(imageData);
    
    // Show confirmation
    this.showConfirmation(`I see: ${detectedObject.label}`);
    
    // Activate voice/text input
    this.activateQuestionInput();
  }
  
  async handleAskAction(question, objectContext) {
    // Combine object + question
    const enrichedQuery = {
      object: objectContext,
      question: question,
      userContext: this.getUserPreferences()
    };
    
    // Get multimodal response
    const response = await this.multimodalLLM.query(enrichedQuery);
    
    // Present answer with visuals
    this.displayResponse({
      text: response.text,
      images: response.images,
      voice: response.audioUrl
    });
  }
}
```

### 2.4 Multi-Modal AI Interfaces Best Practices

#### **When to Use Each Modality:**

| **Modality** | **Best For** | **Avoid When** |
|------------|------------|--------------|
| **Voice** | Hands-free tasks, quick commands, multitasking (driving, cooking) | Public spaces (privacy concerns), complex data entry |
| **Text** | Precision input, noisy environments, private info entry | User is multitasking or has mobility issues |
| **Visual** | Charts/graphs, complex information, browsing options | User is driving, has visual impairments, or screen is unavailable |
| **Touch/Gesture** | Direct manipulation, spatial tasks, gaming | Fine motor impairments, gloved hands, or distant screens |

#### **UX Guidelines:**

**DO:**
- Provide immediate visual confirmation of what was detected
- Allow users to correct misidentifications before processing
- Offer multiple ways to ask (voice + text fallback)
- Design for accessibility (voice-only, touch-only alternatives)

**DON'T:**
- Force voice in public/noisy environments
- Block other interface elements while processing
- Assume perfect object recognition
- Skip error handling for ambiguous inputs

#### **Accessibility Considerations:**
- **Visual impairments**: Provide voice-only "describe and ask" alternative
- **Hearing impairments**: Support text-based questions with visual answers
- **Motor impairments**: Allow gaze tracking or simplified pointing gestures
- **Public contexts**: Default to text input/output with voice as optional

### 2.5 Element Selection Strategies

#### **Mouse Actions:**

**Click Actions:**
- **Single Click**: Standard left-click on buttons, checkboxes, radio buttons
- **Double Click**: Select/highlight words for copy, delete, or drag operations
- **Right Click**: Open context menus and access additional options
- **Cmd/Ctrl+Click**: Inspect element without blocking normal interaction
- **Click and Hold**: Used for drag-and-drop operations

**Hover/Mouse Move Actions:**
```python
# Python Selenium - Mouse Hover
from selenium.webdriver.common.action_chains import ActionChains

actions = ActionChains(driver)
element = driver.find_element(By.XPATH, "xpath")
actions.move_to_element(element).perform()

# Hover + Click combo for sub-menus
mainMenu = driver.find_element(By.XPATH, "main_menu_xpath")
subMenu = driver.find_element(By.XPATH, "sub_menu_xpath")
actions.move_to_element(mainMenu).move_to_element(subMenu).click().perform()
```

#### **Keyboard Actions:**

```javascript
// Web-based keyboard navigation
document.addEventListener('keydown', (event) => {
  // Arrow keys: Navigate DOM tree
  if (event.key === 'ArrowDown') selectNextElement();
  if (event.key === 'ArrowUp') selectPreviousElement();
  if (event.key === 'ArrowRight') expandElement();
  if (event.key === 'ArrowLeft') collapseElement();
  
  // Enter: Confirm selection
  if (event.key === 'Enter') confirmElementSelection();
  
  // Escape: Exit inspector mode
  if (event.key === 'Escape') exitInspectorMode();
  
  // Tab: Move to next interactive element
  if (event.key === 'Tab') focusNextInteractive();
});
```

#### **CSS Selector Strategies (Priority Order):**

1. **ID**: `#elementId` - Most reliable, unique
2. **Data attributes**: `[data-testid="submit-btn"]` - Semantic, stable
3. **Aria labels**: `[aria-label="Submit"]` - Accessibility-focused
4. **Class**: `.className` - Reusable, semantic
5. **CSS Selector**: `div.class > p[attr='value']` - Flexible, powerful
6. **XPath**: `//div[@id='test']//span` - Complex traversal (last resort)

**Best Practices:**
- Use unique, stable attributes (ID > data-testid > aria-label > class)
- Avoid brittle selectors based on DOM position
- Prefer semantic/accessibility attributes
- Test selectors in browser console: `$('selector')` or `$x('//xpath')`

### 2.6 AI Context Gathering from Visual Elements

**Element Context Extraction:**

```javascript
// Extract comprehensive element data for AI
function extractElementData(elem) {
  return {
    // Identity
    tagName: elem.tagName,
    id: elem.id,
    className: elem.className,
    
    // Attributes
    attributes: Array.from(elem.attributes).reduce((acc, attr) => {
      acc[attr.name] = attr.value;
      return acc;
    }, {}),
    
    // Computed styles
    computedStyles: {
      display: window.getComputedStyle(elem).display,
      position: window.getComputedStyle(elem).position,
      width: window.getComputedStyle(elem).width,
      height: window.getComputedStyle(elem).height,
      backgroundColor: window.getComputedStyle(elem).backgroundColor,
      color: window.getComputedStyle(elem).color,
      fontSize: window.getComputedStyle(elem).fontSize,
      fontFamily: window.getComputedStyle(elem).fontFamily,
      // ... other relevant styles
    },
    
    // Layout
    boundingRect: elem.getBoundingClientRect(),
    
    // Content
    textContent: elem.textContent?.substring(0, 100),
    innerHTML: elem.innerHTML?.substring(0, 200),
    
    // Selectors
    cssSelector: getCSSSelector(elem),
    xpath: getXPath(elem),
    
    // Hierarchy
    parent: elem.parentElement?.tagName,
    children: Array.from(elem.children).map(child => child.tagName),
    siblings: getSiblings(elem).map(sib => sib.tagName),
    
    // Event listeners (if accessible)
    hasClickHandler: !!elem.onclick,
    
    // Accessibility
    ariaLabel: elem.getAttribute('aria-label'),
    ariaRole: elem.getAttribute('role'),
    tabIndex: elem.tabIndex
  };
}
```

**Format for AI Context:**

```typescript
// Send to AI with user request
const aiContext = `
Element Information:
- Tag: <${elementData.tagName}>
- ID: ${elementData.id || 'none'}
- Classes: ${elementData.className || 'none'}
- Text: "${elementData.textContent}"

Current Styles:
${Object.entries(elementData.computedStyles)
  .map(([prop, val]) => `  ${prop}: ${val}`)
  .join('\n')}

Position:
- X: ${elementData.boundingRect.x}px
- Y: ${elementData.boundingRect.y}px
- Width: ${elementData.boundingRect.width}px
- Height: ${elementData.boundingRect.height}px

CSS Selector: ${elementData.cssSelector}
XPath: ${elementData.xpath}

User Request: "${userPrompt}"

Please generate the necessary code changes.
`;
```

### 2.7 Implementation Checklist

✅ **Visual Feedback:**
- [ ] Highlight selected element with distinct outline
- [ ] Show loading state during processing
- [ ] Display confidence level for object recognition
- [ ] Provide visual confirmation of detected object

✅ **Multi-Modal Input:**
- [ ] Support voice input (Web Speech API / OpenAI Whisper)
- [ ] Support text input (always available fallback)
- [ ] Support image upload for visual queries
- [ ] Allow seamless switching between modalities

✅ **Context Gathering:**
- [ ] Extract comprehensive element data
- [ ] Include computed styles, not just inline
- [ ] Capture element hierarchy (parent, children, siblings)
- [ ] Include accessibility attributes
- [ ] Generate stable selectors (CSS + XPath)

✅ **Error Handling:**
- [ ] Graceful degradation when recognition fails
- [ ] Offer manual selection fallback
- [ ] Allow user to correct misidentified elements
- [ ] Provide clear error messages

---

## 3. Real-Time Preview & Feedback

### 3.1 Live Preview Implementation Patterns

#### **IFrame-Based Preview (Industry Standard)**

**Why iframe?**
- **Security**: Sandboxing untrusted code
- **Isolation**: Separate execution context
- **Flexibility**: Can inject arbitrary HTML/CSS/JS

**Basic Setup:**

```html
<iframe 
  id="preview" 
  sandbox="allow-scripts allow-forms allow-modals"
  style="width: 100%; height: 500px; border: none;">
</iframe>
```

**Inject Code Methods:**

```javascript
const iframe = document.getElementById('preview');

// Method 1: Using srcdoc (modern approach)
const code = `
  <!DOCTYPE html>
  <html>
    <head>
      <style>${cssCode}</style>
    </head>
    <body>
      ${htmlCode}
      <script>${jsCode}<\/script>
    </body>
  </html>
`;
iframe.srcdoc = code;

// Method 2: Using blob URL
const blob = new Blob([code], { type: 'text/html' });
iframe.src = URL.createObjectURL(blob);
```

**With Debouncing for Performance:**

```javascript
let debounceTimer;
function updatePreview(code) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    iframe.srcdoc = code;
  }, 300); // Update after 300ms of no typing
}

editor.addEventListener('input', (e) => {
  updatePreview(generateFullHTML(e.target.value));
});
```

#### **Sandbox Attribute Configuration**

**Security Levels by Use Case:**

| Use Case | Sandbox Configuration | Risk Level |
|----------|----------------------|------------|
| Static HTML/CSS preview | `sandbox=""` (empty) | Minimal |
| Basic JS execution | `sandbox="allow-scripts"` | Low |
| Form interactions | `sandbox="allow-scripts allow-forms"` | Medium |
| Full interactivity | `sandbox="allow-scripts allow-same-origin allow-forms"` | High ⚠️ |

**⚠️ Critical Warning:** Never use `allow-scripts allow-same-origin` together on same-origin iframes—the sandboxed code can remove the sandbox attribute itself.

### 3.2 Communication Pattern (Editor ↔ Preview)

**Using PostMessage API:**

```javascript
// In parent page (editor)
const iframe = document.getElementById('preview');

// Send code to iframe
iframe.contentWindow.postMessage({
  type: 'update',
  html: htmlCode,
  css: cssCode,
  js: jsCode
}, '*');

// Listen for errors from iframe
window.addEventListener('message', (event) => {
  if (event.data.type === 'error') {
    console.error('Preview error:', event.data.message);
  }
});
```

```javascript
// In iframe (preview page)
window.addEventListener('message', (event) => {
  if (event.data.type === 'update') {
    document.body.innerHTML = event.data.html;
    // Apply CSS and JS
  }
});

// Send errors back
window.onerror = (msg, url, line) => {
  parent.postMessage({
    type: 'error',
    message: msg,
    line: line
  }, '*');
};
```

### 3.3 Diff Visualization in Code Editors

#### **VS Code - Built-in Diff Viewer**

**How it works:**
- **Source Control panel** (`Ctrl+Shift+G` / `Cmd+Shift+G`)
- Click any changed file → opens **side-by-side diff** (old version left, new version right)
- Toggle **inline view** via the `...` menu (top-right)
- Navigate changes with `F7` (next diff) / `Shift+F7` (previous)

**Command-line integration:**
```bash
# Open VS Code as diff tool
code --diff file1.txt file2.txt

# Configure as git difftool
git config --global diff.tool vscode
git config --global difftool.vscode.cmd 'code --wait --diff $LOCAL $REMOTE'
git difftool HEAD~1 HEAD
```

#### **Web-Based: diff2html**

**Generate HTML reports from git diffs:**

```bash
# Install
npm install -g diff2html-cli

# Generate diff
git diff HEAD~1 HEAD | diff2html -i stdin -o file
# Opens side-by-side HTML view in browser
```

**Features:**
- Line-by-line + side-by-side views
- Syntax highlighting (highlight.js)
- Offline-first for local repos

#### **React Component for Diff Preview:**

```typescript
import { diffLines } from 'diff';

interface DiffPreviewProps {
  beforeCode: string;
  afterCode: string;
  language?: string;
}

export function DiffPreview({ beforeCode, afterCode, language }: DiffPreviewProps) {
  const differences = diffLines(beforeCode, afterCode);
  
  return (
    <pre className="diff-preview">
      {differences.map((part, index) => {
        const className = part.added ? 'diff-added' : 
                          part.removed ? 'diff-removed' : 
                          'diff-unchanged';
        return (
          <div key={index} className={className}>
            {part.value}
          </div>
        );
      })}
    </pre>
  );
}
```

```css
.diff-added {
  background-color: #d4ffd4;
  color: #0a5f0a;
}

.diff-removed {
  background-color: #ffd4d4;
  color: #a00;
}

.diff-unchanged {
  background-color: #f8f8f8;
}
```

### 3.4 Change Preview Strategies Before Applying

#### **Strategy 1: Side-by-Side Preview**

```
┌─────────────────┬─────────────────┐
│   Before        │   After         │
│                 │                 │
│  <div>          │  <div>          │
│    Hello        │    Hello World  │ (added)
│  </div>         │  </div>         │
└─────────────────┴─────────────────┘
      [Apply]  [Reject]
```

#### **Strategy 2: Inline Diff with Accept/Reject**

```
<div>
  Hello-World+World  [✓ Accept] [✗ Reject]
</div>
```

#### **Strategy 3: Checkbox Selection**

```
Proposed Changes (3):
☑ Make button blue
☑ Center align text
☐ Add drop shadow

[Apply Selected (2)] [Cancel]
```

#### **Strategy 4: Undo/Redo Stack**

```javascript
class ChangeHistory {
  private history: Change[] = [];
  private currentIndex = -1;
  
  apply(change: Change) {
    // Remove any "future" changes if we're not at the end
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new change
    this.history.push(change);
    this.currentIndex++;
    
    // Apply the change
    change.apply();
  }
  
  undo() {
    if (this.currentIndex >= 0) {
      this.history[this.currentIndex].revert();
      this.currentIndex--;
    }
  }
  
  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      this.history[this.currentIndex].apply();
    }
  }
}
```

### 3.5 Error Handling & Console Integration

```javascript
// Capture console logs from iframe
const originalLog = console.log;
iframe.contentWindow.console.log = function(...args) {
  parent.postMessage({ type: 'log', data: args }, '*');
  originalLog.apply(console, args);
};

// Capture errors
iframe.contentWindow.onerror = function(msg, url, line, col, error) {
  parent.postMessage({
    type: 'error',
    message: msg,
    line: line,
    column: col,
    stack: error?.stack
  }, '*');
};

// Display in custom console
window.addEventListener('message', (e) => {
  if (e.data.type === 'log') {
    customConsole.appendChild(
      createLogEntry(e.data.data)
    );
  }
  if (e.data.type === 'error') {
    customConsole.appendChild(
      createErrorEntry(e.data)
    );
  }
});
```

### 3.6 Production-Ready Template

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; display: flex; }
    #editor { width: 50%; padding: 20px; }
    #preview-container { width: 50%; }
    #preview {
      width: 100%;
      height: 100vh;
      border: none;
      background: white;
    }
    textarea {
      width: 100%;
      height: 200px;
      font-family: 'Courier New', monospace;
    }
  </style>
</head>
<body>
  <div id="editor">
    <h3>HTML</h3>
    <textarea id="html"></textarea>
    
    <h3>CSS</h3>
    <textarea id="css"></textarea>
    
    <h3>JavaScript</h3>
    <textarea id="js"></textarea>
  </div>
  
  <div id="preview-container">
    <iframe 
      id="preview" 
      sandbox="allow-scripts allow-modals">
    </iframe>
  </div>

  <script>
    function debounce(fn, delay) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
      };
    }

    const html = document.getElementById('html');
    const css = document.getElementById('css');
    const js = document.getElementById('js');
    const preview = document.getElementById('preview');

    const render = debounce(() => {
      const code = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>${css.value}</style>
          </head>
          <body>
            ${html.value}
            <script>${js.value}<\/script>
          </body>
        </html>
      `;
      preview.srcdoc = code;
    }, 300);

    html.addEventListener('input', render);
    css.addEventListener('input', render);
    js.addEventListener('input', render);

    // Initial render
    render();
  </script>
</body>
</html>
```

---

## 4. Performance Optimization

### 4.1 iframe Messaging Performance

#### **Message Size Limits**

- **User interactions (100ms budget):** Keep payloads **≤100KB** to meet RAIL response standards
- **JS animations (16ms budget):** Keep payloads **≤10KB** to avoid frame drops
- **Size predictor:** JSON.stringify() length correlates well with transfer time

#### **Debouncing / Throttling**

**Debounce (Wait for typing pause):**
```javascript
let debounceTimer = 0;

function updateWindow() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    window.parent.postMessage({ 
      height: document.body.scrollHeight 
    }, "https://trusted-origin.com");
  }, 100);
}

// Use updateWindow() instead of direct postMessage
window.addEventListener('scroll', updateWindow);
```

**Benefits:** Reduces message flooding 10x+, prevents UI jank from excessive reflows

#### **Use Transferable Objects for Large Data**

For large binary data (ArrayBuffers, ImageBitmap, MessagePort):

```javascript
const buffer = new ArrayBuffer(1024 * 1024); // 1MB
iframe.contentWindow.postMessage(
  { type: 'largeData', data: buffer }, 
  'https://trusted-origin.com',
  [buffer] // Transfer ownership (zero-copy)
);
```

**Performance:** Transferring is **instant** regardless of size (vs. cloning overhead)

#### **Security: Always Validate Origins**

```javascript
// Parent window
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://trusted-iframe.com') {
    return; // Reject untrusted sources
  }
  handleMessage(event.data);
});

// iframe
window.parent.postMessage(
  { action: 'update', data: {...} },
  'https://parent-origin.com' // Never use "*" in production
);
```

#### **Batching Messages**

Instead of sending 100 small messages, batch them:

```javascript
const messageQueue = [];

function queueMessage(msg) {
  messageQueue.push(msg);
  if (messageQueue.length >= 10) {
    flushMessages();
  }
}

function flushMessages() {
  if (messageQueue.length > 0) {
    window.parent.postMessage({ 
      type: 'batch', 
      messages: messageQueue 
    }, origin);
    messageQueue.length = 0;
  }
}

// Flush every 50ms
setInterval(flushMessages, 50);
```

#### **Avoid postMessage During Document Load**

**Issue:** postMessage can be **10x slower** during page load (layout/paint blocking)

**Solution:**
```javascript
// Wait for iframe to finish loading
const iframe = document.querySelector('iframe');
iframe.addEventListener('load', () => {
  // Now send messages
  iframe.contentWindow.postMessage({...}, origin);
});
```

#### **Performance Checklist**

| Optimization | Impact |
|-------------|--------|
| Debounce rapid events | 5-10x fewer messages |
| Keep payloads <100KB | Meets 100ms RAIL |
| Use transferables for >1MB | 500x faster |
| Validate origins | Security + prevents wasted cycles |
| Batch small messages | Reduces overhead |
| Avoid during page load | 10x faster when idle |
| Lazy load iframes | Improves initial load |

### 4.2 DOM Manipulation Optimization

#### **Reality Check: Virtual DOM vs Real DOM**

**Truth About Virtual DOM Performance:**
- Virtual DOM is **NOT inherently faster** than direct real DOM manipulation
- It's a **developer experience** optimization that trades some performance for easier state management
- Well-optimized vanilla JavaScript can outperform Virtual DOM frameworks
- Virtual DOM **adds overhead** (diffing, memory usage) but provides **"good enough"** performance for most apps

#### **When Virtual DOM Helps**

✅ **Complex UIs with frequent state changes** - automatic optimization of batch updates  
✅ **Developer productivity** - no manual DOM tracking needed  
✅ **Preventing naive mistakes** - avoids common performance pitfalls  
✅ **Declarative code** - easier to reason about state → UI relationship  

#### **When Direct DOM is Faster**

✅ **Simple, targeted updates** (`getElementById` + property change)  
✅ **Carefully optimized code** by experienced developers  
✅ **Minimal state changes** - diffing overhead not justified  
✅ **Performance-critical apps** - eliminating framework overhead  

#### **Optimization Techniques for Direct DOM**

```javascript
// 1. Use DocumentFragment for bulk inserts
const frag = document.createDocumentFragment();
// ... add elements to frag
container.appendChild(frag);

// 2. Batch reads and writes
// ❌ Bad: causes layout thrashing
elements.forEach(el => {
  const h = el.clientHeight; // read
  el.style.height = h * 2 + 'px'; // write
});

// ✅ Good: batch operations
const heights = elements.map(el => el.clientHeight);
elements.forEach((el, i) => {
  el.style.height = heights[i] * 2 + 'px';
});

// 3. Use CSS classes over inline styles
el.classList.add('active'); // Better than el.style.x = y

// 4. requestAnimationFrame for visual updates
requestAnimationFrame(() => {
  element.style.transform = `translateX(${x}px)`;
});
```

#### **Optimization Techniques for Virtual DOM Frameworks**

```javascript
// 1. Minimize re-renders
React.memo(Component);
shouldComponentUpdate();

// 2. Use key props for lists
{items.map(item => <Item key={item.id} {...item} />)}

// 3. Avoid inline functions/objects
// ❌ Bad
<Button onClick={() => handler(id)} />

// ✅ Good
const handleClick = useCallback(() => handler(id), [id]);
<Button onClick={handleClick} />

// 4. Code splitting
const Heavy = React.lazy(() => import('./Heavy'));
```

#### **Modern Alternatives: No Virtual DOM**

**Svelte (Compiler Approach):**
- **Compiles components** to vanilla JavaScript at build time
- Directly manipulates DOM without diffing overhead
- No runtime virtual DOM - generates surgical update code
- Benchmarks show **significant performance gains** over React

**Solid.js:**
- Fine-grained reactivity without Virtual DOM
- Only updates what actually changed (no diffing needed)
- Similar developer experience to React with better performance

### 4.3 Rendering Strategies for Large Component Trees

#### **Strategy 1: Virtualization**

Only render visible items:

```typescript
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {items[index].name}
        </div>
      )}
    </FixedSizeList>
  );
}
```

**Performance Impact:** 1000+ items → renders only ~20 visible items

#### **Strategy 2: Lazy Loading**

```javascript
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

#### **Strategy 3: Memoization**

```javascript
const MemoizedChild = React.memo(({ data }) => {
  // Expensive computation
  const processedData = expensiveOperation(data);
  return <div>{processedData}</div>;
});
```

#### **Strategy 4: Web Workers for Heavy Computation**

```javascript
// worker.js
self.addEventListener('message', (e) => {
  const result = heavyComputation(e.data);
  self.postMessage(result);
});

// main.js
const worker = new Worker('worker.js');
worker.postMessage(largeDataset);
worker.addEventListener('message', (e) => {
  updateUI(e.data);
});
```

---

## 5. Accessibility

### 5.1 WCAG Requirements for Visual Editors

**WCAG 2.1 Key Guidelines:**

✅ **2.1.1 Keyboard:** All functionality operable via keyboard  
✅ **2.1.2 No Keyboard Trap:** Can navigate away from all elements  
✅ **2.4.3 Focus Order:** Logical and predictable tab order  
✅ **2.4.7 Focus Visible:** Clear visual focus indicators (3:1 contrast ratio, 2px minimum thickness)  
✅ **4.1.2 Name, Role, Value:** Proper ARIA implementation

### 5.2 Keyboard Navigation Standards

**Standard Key Bindings:**
- **Tab/Shift+Tab:** Navigate between interactive elements
- **Enter/Space:** Activate buttons and links
- **Arrow Keys:** Navigate within complex widgets (tree views, lists)
- **Escape:** Exit modals/dialogs, cancel operations
- **Ctrl/Cmd+Z:** Undo
- **Ctrl/Cmd+Shift+Z:** Redo

**Visual Editor Specific:**
- **F2 / Enter:** Edit selected element
- **Delete:** Remove selected element
- **Ctrl/Cmd+D:** Duplicate element
- **Arrow Keys:** Move selection between elements
- **Ctrl/Cmd+Arrow:** Move element position

**Example Implementation:**

```javascript
document.addEventListener('keydown', (event) => {
  // Inspector navigation
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    selectNextElement();
  }
  
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    selectPreviousElement();
  }
  
  // Edit element
  if (event.key === 'F2' || event.key === 'Enter') {
    if (selectedElement) {
      event.preventDefault();
      enterEditMode(selectedElement);
    }
  }
  
  // Delete element
  if (event.key === 'Delete') {
    if (selectedElement) {
      event.preventDefault();
      deleteElement(selectedElement);
    }
  }
  
  // Exit inspector
  if (event.key === 'Escape') {
    event.preventDefault();
    exitInspectorMode();
  }
  
  // Undo/Redo
  if (event.ctrlKey || event.metaKey) {
    if (event.key === 'z') {
      event.preventDefault();
      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }
    }
  }
});
```

### 5.3 Screen Reader Support

**ARIA Roles and Labels:**

```html
<!-- Inspector Panel -->
<aside 
  role="complementary" 
  aria-label="Element Inspector">
  
  <div role="region" aria-labelledby="element-info-heading">
    <h3 id="element-info-heading">Selected Element</h3>
    
    <!-- Element details with semantic structure -->
    <dl>
      <dt>Tag:</dt>
      <dd aria-live="polite">button</dd>
      
      <dt>ID:</dt>
      <dd aria-live="polite">submit-btn</dd>
      
      <dt>Classes:</dt>
      <dd aria-live="polite">btn btn-primary</dd>
    </dl>
  </div>
  
  <!-- Property Editor -->
  <div role="form" aria-labelledby="properties-heading">
    <h3 id="properties-heading">Properties</h3>
    
    <label for="element-width">Width</label>
    <input 
      type="text" 
      id="element-width" 
      aria-describedby="width-units"
      value="200"
    />
    <span id="width-units" class="visually-hidden">pixels</span>
  </div>
</aside>

<!-- Visual Preview -->
<main 
  role="main" 
  aria-label="Visual Preview">
  
  <iframe 
    title="Live Preview" 
    aria-describedby="preview-description">
  </iframe>
  <p id="preview-description" class="visually-hidden">
    Live preview of your page. Selected elements are highlighted.
  </p>
</main>

<!-- Toolbar -->
<div 
  role="toolbar" 
  aria-label="Editor Actions">
  
  <button 
    aria-label="Select element (Keyboard shortcut: S)"
    aria-pressed="true">
    <span aria-hidden="true">🖱️</span>
    Select
  </button>
  
  <button 
    aria-label="Undo last action (Keyboard shortcut: Ctrl+Z)"
    aria-disabled="false">
    <span aria-hidden="true">↶</span>
    Undo
  </button>
</div>
```

**Live Region Announcements:**

```javascript
// Announce element selection
function announceSelection(element) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.classList.add('visually-hidden');
  announcement.textContent = `Selected ${element.tagName} element with ${element.className ? `classes ${element.className}` : 'no classes'}`;
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Announce changes
function announceChange(changeDescription) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'assertive');
  announcement.classList.add('visually-hidden');
  announcement.textContent = changeDescription;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
```

### 5.4 Best Accessible WYSIWYG Editors

**Comparison:**

| Editor | WCAG Support | Screen Readers | Keyboard Nav | Framework | License |
|--------|-------------|----------------|--------------|-----------|---------|
| **TinyMCE** | A-AAA | ✅ JAWS, VoiceOver | ✅ Full | Any | Open + Premium |
| **CKEditor 5** | 2.1 | ✅ Tested | ✅ Full | Any | Open + Commercial |
| **Remirror** | ✅ Explicit | ✅ Yes | ✅ Full | React | MIT |
| **Syncfusion** | WAI-ARIA | ✅ Tested | ✅ Full | React/Angular/Vue | Commercial |
| **Tiptap** | Via ProseMirror | ⚠️ Needs work | ✅ Yes | Any | MIT |
| **Quill** | Basic | ⚠️ Basic | ✅ Basic | Any | BSD |

**Recommendation:** Use **TinyMCE** - it has the most comprehensive built-in accessibility support, testing, and documentation.

**TinyMCE Example:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <script src="https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js"></script>
  <script>
    tinymce.init({
      selector: 'textarea',
      plugins: 'a11ychecker link image lists',
      toolbar: 'undo redo | bold italic | a11ycheck',
      a11y_advanced_options: true,
      setup: (editor) => {
        // Ensure keyboard shortcuts work
        editor.addShortcut('ctrl+s', 'Save', () => {
          // Save logic
        });
      }
    });
  </script>
</head>
<body>
  <textarea id="editor">Your content here</textarea>
</body>
</html>
```

### 5.5 Accessibility Testing

**Testing Tools:**
- **Keyboard Testing:** Firefox Accessibility Inspector (Shift+F12)
- **Screen Readers:** JAWS, NVDA (Windows), VoiceOver (Mac/iOS)
- **Automated Testing:** axe DevTools, Lighthouse, WAVE
- **Manual Testing:** Tab through all interactive elements

**Testing Checklist:**

✅ **Keyboard Navigation:**
- [ ] All features accessible via keyboard
- [ ] Visible focus indicators (3:1 contrast)
- [ ] Logical tab order
- [ ] No keyboard traps
- [ ] Shortcuts documented

✅ **Screen Reader:**
- [ ] Proper heading structure (h1, h2, h3)
- [ ] ARIA labels on all interactive elements
- [ ] Live regions for dynamic content
- [ ] Alt text for images/icons
- [ ] Form labels associated with inputs

✅ **Visual:**
- [ ] Color contrast 4.5:1 (text), 3:1 (UI components)
- [ ] Text resizable up to 200%
- [ ] No information by color alone
- [ ] Focus indicators clearly visible

---

## 6. Implementation Recommendations

### 6.1 Architecture Selection Guide

**Choose Figma-style approach if:**
- Building a visual design tool (not code editor)
- Need desktop-level rendering performance
- Real-time collaboration is core feature
- Willing to invest in custom WebGL renderer
- Team has C++/WebAssembly expertise

**Choose Replit Agent-style approach if:**
- Building AI-powered IDE
- Need Figma import for design-to-code workflow
- Want autonomous multi-agent coding
- Targeting full-stack application development
- Need automated browser testing

**Choose v0.dev-style approach if:**
- Building UI prototyping tool
- Need fast iteration on designs
- Want composite model architecture (swappable LLMs)
- Real-time error correction is priority
- Frontend-focused (no backend generation)

**Choose Cursor-style approach if:**
- Building code-centric IDE
- Don't need visual element selection (yet)
- MCP server integration acceptable
- Prompt-based workflow is sufficient
- Team comfortable with terminal-centric UX

### 6.2 Minimum Viable Visual Editor

**Core Components:**

1. **Element Selector** (Click-to-select):
   ```javascript
   - Hover overlay with outline
   - Click handler to capture element
   - XPath/CSS selector generation
   - Visual highlight feedback
   ```

2. **Inspector Panel**:
   ```javascript
   - Element identity (tag, id, classes)
   - Computed styles
   - Dimensions & position
   - Attributes
   ```

3. **Live Preview** (iframe-based):
   ```javascript
   - Sandboxed iframe
   - Debounced updates (300ms)
   - Error console integration
   - PostMessage communication
   ```

4. **AI Integration**:
   ```javascript
   - Element context extraction
   - Natural language prompt input
   - Code generation (via LLM API)
   - Diff preview before applying
   ```

5. **Change Management**:
   ```javascript
   - Undo/redo stack
   - Change queueing
   - Batch apply
   - Git commit integration
   ```

### 6.3 Progressive Enhancement Path

**Phase 1: Basic Visual Editor (Week 1-2)**
- ✅ Click-to-select elements
- ✅ Inspector panel with element details
- ✅ iframe-based live preview
- ✅ Basic keyboard navigation

**Phase 2: AI Integration (Week 3-4)**
- ✅ Natural language prompts
- ✅ LLM API integration
- ✅ Code generation
- ✅ Diff preview

**Phase 3: Advanced Features (Week 5-6)**
- ✅ Multi-select elements
- ✅ Drag-and-drop positioning
- ✅ Design import (Figma)
- ✅ Component library

**Phase 4: Collaboration (Week 7-8)**
- ✅ Real-time sync (WebSockets)
- ✅ Presence awareness
- ✅ Conflict resolution
- ✅ History/versioning

**Phase 5: Accessibility & Polish (Week 9-10)**
- ✅ WCAG 2.1 AA compliance
- ✅ Screen reader support
- ✅ Keyboard shortcuts
- ✅ Performance optimization

### 6.4 Technology Stack Recommendations

**Frontend:**
- **Framework**: React (ecosystem maturity) or Svelte (performance)
- **Code Editor**: Monaco Editor (VS Code engine)
- **Diff Visualization**: `react-diff-viewer` or `diff2html`
- **Drag & Drop**: `dnd-kit` (accessible)
- **UI Components**: shadcn/ui (accessible, customizable)

**Backend:**
- **AI API**: Anthropic Claude 3.5 Sonnet (best for code generation)
- **Image-to-Code**: GPT-4o with vision (multi-modal)
- **Voice**: OpenAI Realtime API (two-way voice)
- **Database**: PostgreSQL (structured data) + Object Storage (assets)

**Infrastructure:**
- **Hosting**: Vercel (edge functions) or Replit (built-in hosting)
- **Real-time**: Socket.io or Ably (managed WebSockets)
- **Version Control**: Git (with automated commits)
- **CDN**: Cloudflare (asset delivery)

---

## 7. Resources & Links

### 7.1 Visual Editor Architectures

**Figma:**
- [Building a professional design tool on the web](https://www.figma.com/blog/building-a-professional-design-tool-on-the-web/)
- [WebAssembly cut Figma's load time by 3x](https://www.figma.com/blog/webassembly-cut-figmas-load-time-by-3x/)
- [Figma Rendering: Powered by WebGPU](https://www.figma.com/blog/figma-rendering-powered-by-webgpu/)
- [How Figma's multiplayer technology works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- [Keeping Figma Fast](https://www.figma.com/blog/keeping-figma-fast/)
- [Inside Figma's Engineering Culture](https://newsletter.pragmaticengineer.com/p/inside-figmas-engineering-culture)

**Replit Agent:**
- [Replit Agent Docs](https://docs.replit.com/replitai/agent)
- [Replit Import (Figma integration)](https://blog.replit.com/import)
- [Import from Figma Quickstart](https://docs.replit.com/getting-started/quickstarts/import-from-figma)
- [LangChain Case Study: Replit](https://www.langchain.com/breakoutagents/replit)

**v0.dev:**
- [v0.dev Platform](https://v0.dev)
- [Introducing the v0 composite model family](https://vercel.com/blog/v0-composite-model-family)

**Cursor AI:**
- [Cursor Docs](https://cursor.com/features)
- [Cursor Browser Integration](https://cursor.com/docs/agent/browser)
- [Chrome DevTools MCP](https://browsertools.agentdesk.ai/installation)
- [AddyOsmani: Chrome DevTools MCP](https://addyosmani.com/blog/devtools-mcp/)

### 7.2 Point-and-Ask & Multi-Modal UX

**General:**
- [Multimodal Design: Elements, Examples and Best Practices](https://blog.uxtweak.com/multimodal-design/)
- [Why you should consider designing for multimodal interfaces](https://www.voiceflow.com/pathways/why-you-need-to-consider-designing-for-multimodal-interfaces)
- [Multimodal Interfaces: Importance, Effects & Examples](https://www.ramotion.com/blog/multimodal-interfaces/)

**APIs & Tools:**
- [OpenAI GPT-4o (Vision + Voice)](https://platform.openai.com/docs/guides/vision)
- [Google Gemini Multimodal](https://ai.google.dev/tutorials/multimodal)
- [W3C Multimodal Interaction Architecture](https://www.w3.org/TR/mmi-arch/)

### 7.3 Real-Time Preview & Diff Visualization

**Live Preview:**
- [Play safely in sandboxed IFrames](https://web.dev/articles/sandboxed-iframes)
- [iframe sandbox permissions tutorial](https://cloud.google.com/blog/products/data-analytics/iframe-sandbox-tutorial)
- [Froala: Implementing Live HTML Preview](https://froala.com/blog/general/the-developers-guide-to-implementing-live-html-preview/)

**Diff Visualization:**
- [VS Code: Using Git source control](https://code.visualstudio.com/docs/sourcecontrol/overview)
- [diff2html](https://diff2html.xyz/)
- [GitKraken: Git Diff](https://www.gitkraken.com/learn/git/git-diff)

### 7.4 Performance Optimization

**iframe Messaging:**
- [Is postMessage slow?](https://surma.dev/things/is-postmessage-slow/)
- [Securing Cross-Window Communication](https://www.bindbee.dev/blog/secure-cross-window-communication)
- [MDN: Structured Clone Algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)

**DOM Manipulation:**
- [Svelte: Virtual DOM is Pure Overhead](https://svelte.dev/blog/virtual-dom-is-pure-overhead)
- [Web.dev: Deep-copying in JavaScript using structuredClone](https://web.dev/articles/structured-clone)

### 7.5 Accessibility

**WCAG Guidelines:**
- [WCAG 2.1 Spec](https://www.w3.org/TR/WCAG21/)
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
- [A Guide To Keyboard Accessibility: HTML And CSS](https://www.smashingmagazine.com/2022/11/guide-keyboard-accessibility-html-css-part1/)

**Accessible Editors:**
- [TinyMCE: Accessible Rich Text Editor](https://www.tiny.cloud/blog/accessible-rich-text-editor/)
- [CKEditor 5](https://ckeditor.com/)
- [Syncfusion: Accessibility in React Rich Text Editor](https://ej2.syncfusion.com/react/documentation/rich-text-editor/accessibility)

### 7.6 Tools & Libraries

**Code Editors:**
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VS Code's editor
- [CodeMirror](https://codemirror.net/) - Lightweight code editor
- [Ace Editor](https://ace.c9.io/) - Embeddable code editor

**Diff Libraries:**
- [diff](https://www.npmjs.com/package/diff) - JavaScript diff implementation
- [react-diff-viewer](https://www.npmjs.com/package/react-diff-viewer) - React component
- [diff2html](https://diff2html.xyz/) - HTML diff generator

**Drag & Drop:**
- [dnd-kit](https://dndkit.com/) - Modern drag-and-drop for React (accessible)
- [react-beautiful-dnd](https://github.com/atlassian/react-beautiful-dnd) - Atlassian's library

**AI APIs:**
- [Anthropic Claude](https://www.anthropic.com/api) - Best for code generation
- [OpenAI GPT-4o](https://platform.openai.com/docs) - Multi-modal (vision + voice)
- [Vercel AI SDK](https://sdk.vercel.ai/) - Unified AI SDK

---

## 8. Conclusion

Building a production-ready visual editor with AI integration requires:

1. **Solid Architecture**: Learn from Figma (performance), Replit (AI agents), v0 (composite models)
2. **Intuitive UX**: Point-and-ask patterns with multi-modal support
3. **Real-Time Preview**: iframe-based with debouncing and error handling
4. **Performance**: Optimize iframe messaging, DOM manipulation, and rendering
5. **Accessibility**: WCAG 2.1 compliance with keyboard nav and screen reader support

**Key Takeaways:**
- Start simple (click-to-select, inspector, preview)
- Add AI incrementally (prompts → code generation → diff preview)
- Test with real users early and often
- Prioritize accessibility from day one
- Optimize only when you measure actual performance problems

**Next Steps:**
1. Review existing codebase (`VisualEditorWrapper.tsx`, `ElementInspector.tsx`)
2. Implement missing features (point-and-ask, diff preview, accessibility)
3. Test with screen readers and keyboard-only navigation
4. Benchmark performance (iframe messaging, DOM updates)
5. Iterate based on user feedback

---

**Document Version:** 1.0  
**Last Updated:** October 26, 2025  
**Maintainer:** Agent #133 - Visual Editor Research Specialist
