# MB.MD MASTER CONTROL DOCUMENT
## Visual Editor + Mr Blue AI - Full Intelligence & Orchestration Platform
**Created:** October 19, 2025 4:50 AM  
**Methodology:** MB.MD (Mapping→Breakdown→Mitigation→Deployment)  
**Process:** Research → Research → Analyze → Plan → Build  
**Status:** MASTER CONTROL & ORCHESTRATION GUIDE

---

## 🎯 VISION STATEMENT

**This is THE REBUILD PLATFORM for Mundo Tango**

### **Super Admin Experience:**
Mr Blue AI + Visual Editor = **Live Platform Builder**
- Drag-drop UI changes in Visual Editor (Replit + Figma hybrid)
- Mr Blue records ALL movements
- Click "Save" → Mr Blue AI converts visual changes to backend code
- Mr Blue distributes work to sub-agents that own pages/components
- Sub-agents execute changes and report back
- Platform rebuilds itself through AI orchestration

### **Standard User Experience:**
Mr Blue AI = **Intelligent Life Assistant + Platform Guide**
- Full ChatGPT-like AI intelligence (GPT-4o, Claude, Gemini)
- Access to Life CEO agents (#84-99) for life management
- Auto-healing: AI detects and fixes small issues automatically  
- Journey tracking: Knows every user action for proactive support
- Platform knowledge: Can answer questions about cities, groups, events, people
- Smart recommendations based on user behavior and platform data

---

## 📚 PHASE 1: RESEARCH (Track 1-5) - 60 min

### **Track 1: Documentation Deep Dive (15 min)**
**Objective:** Review ALL existing documentation to prevent repeated mistakes

**CRITICAL FINDINGS:**

1. **TRACK_8_MR_BLUE_INTELLIGENCE_ARCHITECTURE.md**
   - Breadcrumb tracking system (30 clicks / 7 days)
   - Failed action monitoring (404s, API errors, user frustration)
   - ML learning framework for pattern recognition
   - Proactive assistance when failures detected
   - Context preservation across pages

2. **TRACK_9_VISUAL_TOOL_ARCHITECTURE.md**
   - React Flow for node-based editing (agent networks)
   - Konva for canvas manipulation (free-form visual editing)
   - Multi-select + batch operations
   - Drag-and-drop everything
   - Save → Confirm → Build workflow

3. **MB_MD_DUAL_TRACK_EXECUTION.md**
   - 5-Track Parallel Research methodology
   - Multi-agent orchestration patterns
   - Quality Validator (#79) + Learning Coordinator (#80)
   - Functional testing + autonomous test runners

4. **AGENT_LEARNING.md** (Just created)
   - 8 critical lessons from previous errors
   - Phantom import crisis prevention
   - API endpoint validation before client calls
   - File integrity system requirements
   - MB.MD methodology enforcement

---

### **Track 2: Current System Analysis (15 min)**
**Objective:** Map what exists and what's broken

**✅ WORKING COMPONENTS:**
- ScottAI.tsx (377 lines) - Complete frontend implementation
- Visual Editor components (SelectionLayer, ChangeTracker, AICodeGenerator)
- 3D Avatar system (React Three Fiber)
- Breadcrumb UI component
- Life CEO agents infrastructure (#84-99)
- Subscription tiers (Free, Premium, Community, Super Admin)
- RBAC/ABAC permission system

**❌ BROKEN/MISSING:**
- `/api/mrblue/simple-chat` endpoint DOES NOT EXIST
- Multi-model AI routing (GPT-4o, Claude, Gemini) not wired
- Visual Editor runtime errors (blank page)
- MT Aurora Tide design not applied (turquoise #40E0D0 → blue #0047AB)
- Breadcrumb tracking system not implemented
- ML learning framework not built
- Auto-healing intelligence not active
- Save → Confirm → Build workflow not integrated

---

### **Track 3: API Integration Research (15 min)**
**Objective:** Verify available integrations and prevent API key issues

**REPLIT INTEGRATIONS AVAILABLE:**

1. **OpenAI (Replit AI Integrations)** ✅ RECOMMENDED
   - Uses Replit-managed endpoint
   - No API key needed
   - Billed to credits
   - Supports: GPT-5, GPT-4.1, GPT-4o, O3, O4-mini
   - DOES NOT support: embeddings, audio, image generation

2. **OpenAI (Standard)** ✅ Available
   - Requires user's API key
   - Full OpenAI API access

3. **Anthropic (Claude)** ✅ Available
   - Requires ANTHROPIC_API_KEY
   - Already configured in secrets

4. **Google Gemini** ✅ Available
   - Requires GEMINI_API_KEY
   - Already configured in secrets

**RECOMMENDATION:**
- **Primary:** Use Replit AI Integrations (OpenAI) for GPT-4o
- **Fallback 1:** Use Anthropic API (ANTHROPIC_API_KEY exists)
- **Fallback 2:** Use Gemini API (GEMINI_API_KEY exists)

---

### **Track 4: Design System Research (10 min)**
**Objective:** Define MT Aurora Tide specifications

**MT AURORA TIDE DESIGN SYSTEM:**

**Primary Colors:**
```css
--aurora-turquoise: #40E0D0;    /* Primary brand color */
--aurora-cyan: #00CED1;          /* Accent */
--aurora-teal: #008B8B;          /* Supporting */
--aurora-blue: #0047AB;          /* Deep blue */
--aurora-deep-blue: #003366;     /* Darkest */
```

**Gradients:**
```css
--aurora-gradient: linear-gradient(135deg, #40E0D0 0%, #0047AB 100%);
--aurora-gradient-subtle: linear-gradient(135deg, rgba(64,224,208,0.1) 0%, rgba(0,71,171,0.1) 100%);
```

**Glassmorphic:**
```css
--aurora-glass-bg: rgba(64,224,208,0.1);
--aurora-glass-border: rgba(64,224,208,0.2);
--aurora-glass-blur: blur(12px);
```

**Dark Mode:**
```css
--aurora-dark-turquoise: #5EEAD4;
--aurora-dark-blue: #60A5FA;
--aurora-dark-glass-bg: rgba(94,234,212,0.05);
```

---

### **Track 5: Architecture Research (5 min)**
**Objective:** Verify agent orchestration patterns

**AGENT ECOSYSTEM:**
- **Total Agents:** 276 agents across 13 categories
- **Mr Blue Suite:** Agents #73-80 (8 agents)
- **Life CEO:** Agents #84-99 (16 agents)
- **Algorithm:** Agents #A1-A30 (30 agents)
- **Smart Agents:** #106-109 (4 agents)
- **Quality/Learning:** #79-80 (2 agents)

**COMMUNICATION PATTERNS:**
- **UP:** Important patterns → CEO Agent #0 for strategic decisions
- **ACROSS:** Tactical solutions → Peer agents for reuse
- **DOWN:** Best practices → All agents for consistency

---

## 📊 PHASE 2: RESEARCH (Track 6-10) - 60 min - SECOND RESEARCH LAYER

### **Track 6: Visual Editor Technology Stack (15 min)**

**TECHNOLOGY SELECTION:**

**1. React Flow** (Node-Based Editing) ⭐⭐⭐⭐⭐
```bash
npm install reactflow
```
**Use For:**
- Agent network visualization (276 agents + connections)
- Page dependency mapping
- User journey flows (J1-J9)
- Build orchestration visualization

**2. Konva** (Canvas Manipulation) ⭐⭐⭐⭐
```bash
npm install konva react-konva
```
**Use For:**
- Visual positioning of elements
- Free-form diagram editing
- Interactive annotations
- Custom shapes and transformations

**3. Simple-Git** (Git Automation)
```bash
npm install simple-git
```
**Use For:**
- Branch creation for changes
- Commit visual editor changes
- Merge workflows

---

### **Track 7: Mr Blue Intelligence Stack (15 min)**

**BACKEND SERVICES NEEDED:**

**1. AI Model Service** (Multi-Model Router)
```typescript
// server/services/aiModelService.ts
interface AIModelService {
  callGPT4o(messages): Promise<Response>;
  callClaude(messages): Promise<Response>;
  callGemini(messages): Promise<Response>;
  route(model: string, messages): Promise<Response>;
}
```

**2. Life CEO Router** (Agent Routing)
```typescript
// server/services/lifeCEORouter.ts
function routeToLifeCEOAgent(message: string): string {
  // Returns agent name based on keywords
  // 'Schedule Agent', 'Finance Agent', 'Health Agent', etc.
}
```

**3. Breadcrumb Tracker** (User Journey)
```typescript
// server/services/breadcrumbTracker.ts
interface BreadcrumbTracker {
  track(action: BreadcrumbAction): void;
  getLastN(userId: number, count: number): Breadcrumb[];
  detectPattern(userId: number): Pattern[];
  predictNextAction(userId: number): Prediction;
}
```

**4. Context Builder** (Page Awareness)
```typescript
// server/services/contextBuilder.ts
interface ContextBuilder {
  buildPageContext(page: string, user: User): Context;
  enrichWithSemanticData(context: Context): Context;
  addUserHistory(context: Context, breadcrumbs: Breadcrumb[]): Context;
}
```

---

### **Track 8: Database Schema Analysis (10 min)**

**TABLES NEEDED:**

**1. Breadcrumbs** (User Journey Tracking)
```sql
CREATE TABLE breadcrumbs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  page VARCHAR(500) NOT NULL,
  action VARCHAR(50) NOT NULL,  -- 'click', 'view', 'input', 'submit', 'error'
  target VARCHAR(500),
  target_id VARCHAR(255),
  value JSONB,
  user_journey VARCHAR(50),
  success BOOLEAN DEFAULT TRUE,
  error TEXT,
  duration INTEGER,
  prediction VARCHAR(255),
  confidence REAL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_breadcrumbs_user ON breadcrumbs(user_id);
CREATE INDEX idx_breadcrumbs_session ON breadcrumbs(session_id);
CREATE INDEX idx_breadcrumbs_timestamp ON breadcrumbs(timestamp);
```

**2. Failed Actions** (Auto-Healing)
```sql
CREATE TABLE failed_actions (
  id SERIAL PRIMARY KEY,
  breadcrumb_id INTEGER REFERENCES breadcrumbs(id),
  user_id INTEGER NOT NULL,
  failure_type VARCHAR(50) NOT NULL,  -- '404', 'api_error', 'permission', etc.
  status_code INTEGER,
  error_details JSONB NOT NULL,
  recovery JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**3. Visual Editor Changes** (Code Generation History)
```sql
CREATE TABLE visual_editor_changes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  page VARCHAR(500) NOT NULL,
  changes JSONB NOT NULL,  -- Visual changes made
  generated_code TEXT,     -- AI-generated code
  approved BOOLEAN DEFAULT FALSE,
  deployed BOOLEAN DEFAULT FALSE,
  git_branch VARCHAR(255),
  git_commit_sha VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### **Track 9: Security & Permissions (10 min)**

**RBAC/ABAC REQUIREMENTS:**

**Roles:**
- **Free:** Access to basic Mr Blue (chat, search, Life CEO)
- **Premium:** Enhanced features + priority support
- **Community:** Group features + event tools
- **Super Admin:** Visual Editor + Mr Blue orchestration + platform rebuild

**Permissions:**
```typescript
const permissions = {
  'visual-editor:access': ['super_admin'],
  'visual-editor:save': ['super_admin'],
  'visual-editor:deploy': ['super_admin'],
  'mr-blue:chat': ['free', 'premium', 'community', 'super_admin'],
  'mr-blue:life-ceo': ['free', 'premium', 'community', 'super_admin'],
  'mr-blue:search': ['free', 'premium', 'community', 'super_admin'],
  'mr-blue:admin-tools': ['super_admin'],
  'breadcrumbs:track': ['free', 'premium', 'community', 'super_admin'],
  'breadcrumbs:view-own': ['free', 'premium', 'community', 'super_admin'],
  'breadcrumbs:view-all': ['super_admin'],
};
```

---

### **Track 10: Testing Strategy (10 min)**

**TEST COVERAGE:**

**1. E2E Tests** (Playwright)
```typescript
// tests/mr-blue/mr-blue-ai-intelligence.spec.ts
test('Mr Blue responds with AI intelligence', async ({ page }) => {
  // Open Mr Blue
  // Send message
  // Verify AI response (NOT HTML error)
  // Verify model routing works
});

// tests/visual-editor/visual-editor-drag-drop.spec.ts
test('Visual Editor drag-drop generates code', async ({ page }) => {
  // Navigate to Visual Editor
  // Drag element
  // Verify AI code generated
  // Verify preview works
});
```

**2. Integration Tests** (Vitest)
```typescript
// tests/integration/ai-model-routing.test.ts
test('AI Model Service routes to correct model', async () => {
  const result = await aiModelService.route('gpt-4o', messages);
  expect(result.model).toBe('gpt-4o');
});
```

**3. Autonomous Tests** (Continuous)
```typescript
// tests/autonomous/mr-blue-health-check.ts
// Runs every hour
// Tests Mr Blue responsiveness
// Reports to Quality Validator (#79)
```

---

## 🔍 PHASE 3: ANALYZE (Critical Thinking Layer) - 45 min

### **Gap Analysis**

**WHAT WE HAVE:**
- ✅ Frontend components (Mr Blue, Visual Editor)
- ✅ Design system documented
- ✅ Agent architecture defined
- ✅ API keys available (Anthropic, Gemini)
- ✅ Testing infrastructure exists

**WHAT'S MISSING:**
- ❌ Backend API endpoints for Mr Blue AI
- ❌ Multi-model AI integration
- ❌ Visual Editor runtime error fixes
- ❌ Aurora Tide design applied
- ❌ Breadcrumb tracking implementation
- ❌ Auto-healing intelligence
- ❌ Save → Confirm → Build workflow

**CRITICAL DEPENDENCIES:**
1. **Mr Blue AI** depends on API endpoint creation
2. **Visual Editor** depends on runtime error fixes
3. **Auto-healing** depends on breadcrumb tracking
4. **Save → Confirm → Build** depends on Mr Blue + Visual Editor both working

**PARALLEL vs SEQUENTIAL:**
- **PARALLEL:** Mr Blue backend + Visual Editor fixes + Aurora Tide design
- **SEQUENTIAL:** Breadcrumb → ML learning → Auto-healing (data dependency)

---

### **Risk Assessment**

**HIGH RISK:**
1. **API Integration Failure:** If Replit AI Integrations don't work, fallback to Anthropic
2. **Visual Editor Runtime Errors:** Unknown root cause, needs debugging
3. **Design Token Conflicts:** Existing colors might conflict with Aurora Tide

**MEDIUM RISK:**
1. **Performance:** Breadcrumb tracking might slow down app (needs optimization)
2. **Git Automation:** Complex workflows might fail (needs error handling)

**LOW RISK:**
1. **Aurora Tide Design:** CSS changes, reversible
2. **Testing:** Can iterate quickly

**MITIGATION:**
- All high risks have fallback plans
- Use staged rollout (Super Admin first, then all users)
- Comprehensive testing before production

---

### **Architectural Decisions**

**DECISION 1: AI Model Selection**
- **Primary:** Replit AI Integrations (OpenAI) - No API key needed
- **Reason:** Simpler setup, no secret management, billed to credits
- **Fallback:** Anthropic (ANTHROPIC_API_KEY exists)

**DECISION 2: Visual Editor Technology**
- **Primary:** React Flow for structure
- **Secondary:** Konva for visual positioning (if needed)
- **Reason:** React-native, performant, well-documented

**DECISION 3: Breadcrumb Storage**
- **Primary:** PostgreSQL for persistence
- **Secondary:** Redis for real-time cache (last 30 clicks)
- **Reason:** ACID compliance + fast lookups

**DECISION 4: Deployment Strategy**
- **Phase 1:** Fix Mr Blue AI + Visual Editor (Super Admin only)
- **Phase 2:** Apply Aurora Tide design (all pages)
- **Phase 3:** Enable breadcrumb tracking (all users)
- **Phase 4:** Activate auto-healing (gradual rollout)

---

## 📋 PHASE 4: PLAN (6-Track Parallel Execution) - 30 min

### **PARALLEL EXECUTION OVERVIEW**

```
TRACK 1: Mr Blue AI Backend           (Agents #41-43, #73-80, #84-99)  ⏱️  120 min
TRACK 2: Visual Editor UI/UX          (Agents #78, #11, #54)           ⏱️   90 min
TRACK 3: Aurora Tide Design           (Agent #11, Layer 9-10)          ⏱️   75 min
TRACK 4: Breadcrumb Intelligence      (Agents #79-80, #106-109)        ⏱️  105 min
TRACK 5: Testing Infrastructure       (Agents #106-109)                ⏱️   60 min
TRACK 6: Documentation                (Layer 52)                       ⏱️   45 min

TOTAL TIME: 120 min (parallel) vs 495 min (sequential) = 75% faster
```

---

### **🤖 TRACK 1: MR BLUE AI BACKEND (120 min)**

**Sub-Track 1.1: Install Replit AI Integration (10 min)**
```bash
# Use Replit AI Integrations for OpenAI
# No API key needed, billed to credits
```

**Sub-Track 1.2: Create AI Model Service (30 min)**
```typescript
// server/services/aiModelService.ts
export class AIModelService {
  async callGPT4o(messages: any[]): Promise<any> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 1024
    });
    return response.choices[0].message;
  }

  async callClaude(messages: any[]): Promise<any> {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      messages: this.convertToClaudeFormat(messages),
      max_tokens: 1024,
      temperature: 0.7
    });
    return response.content[0].text;
  }

  async callGemini(messages: any[]): Promise<any> {
    const result = await gemini.generateContent({
      contents: this.convertToGeminiFormat(messages),
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
    });
    return result.response.text();
  }

  async route(model: string, messages: any[]): Promise<any> {
    switch (model) {
      case 'gpt-4o':
        return this.callGPT4o(messages);
      case 'claude':
        return this.callClaude(messages);
      case 'gemini':
        return this.callGemini(messages);
      default:
        return this.callGPT4o(messages); // Default to GPT-4o
    }
  }
}
```

**Sub-Track 1.3: Create Life CEO Router (20 min)**
```typescript
// server/services/lifeCEORouter.ts
export function routeToLifeCEOAgent(message: string): string {
  const keywords = message.toLowerCase();
  
  const routes: Record<string, string[]> = {
    'Schedule Agent': ['schedule', 'calendar', 'appointment', 'meeting', 'event', 'booking'],
    'Finance Agent': ['money', 'budget', 'expense', 'finance', 'payment', 'bill', 'cost'],
    'Health Agent': ['health', 'fitness', 'exercise', 'workout', 'nutrition', 'diet'],
    'Career Agent': ['job', 'career', 'resume', 'interview', 'work', 'professional'],
    'Learning Agent': ['learn', 'study', 'course', 'education', 'training', 'skill'],
    'Relationship Agent': ['relationship', 'friend', 'family', 'social', 'dating'],
    'Travel Agent': ['travel', 'trip', 'vacation', 'destination', 'flight', 'hotel'],
    'Home Agent': ['home', 'house', 'apartment', 'cleaning', 'maintenance', 'repair'],
    'Shopping Agent': ['shop', 'buy', 'purchase', 'product', 'order', 'delivery'],
    'Entertainment Agent': ['movie', 'music', 'game', 'entertainment', 'show', 'concert'],
    'Productivity Agent': ['task', 'todo', 'project', 'organize', 'productivity', 'goal'],
    'Mindfulness Agent': ['meditate', 'mindful', 'calm', 'relax', 'stress', 'mental'],
    'Community Agent': ['community', 'group', 'tango', 'event', 'social', 'meet'],
    'Legal Agent': ['legal', 'contract', 'law', 'attorney', 'rights', 'document'],
    'Tax Agent': ['tax', 'filing', 'deduction', 'irs', 'refund', 'accountant'],
    'Pet Agent': ['pet', 'dog', 'cat', 'animal', 'vet', 'care']
  };

  for (const [agent, keywords] of Object.entries(routes)) {
    if (keywords.some(kw => message.includes(kw))) {
      return agent;
    }
  }

  return 'Mr Blue Core';
}
```

**Sub-Track 1.4: Create Context Builder (20 min)**
```typescript
// server/services/contextBuilder.ts
export class ContextBuilder {
  async buildPageContext(page: string, user: any): Promise<string> {
    // Build rich context from page, user, and platform data
    let context = `Current page: ${page}\n`;
    context += `User: ${user.displayName} (${user.role})\n`;
    
    // Add page-specific context
    if (page.includes('/events')) {
      const upcomingEvents = await db.query.events.findMany({
        where: eq(events.startTime, gt(new Date())),
        limit: 5
      });
      context += `Upcoming events: ${upcomingEvents.map(e => e.title).join(', ')}\n`;
    }
    
    if (page.includes('/groups')) {
      const userGroups = await db.query.groupMembers.findMany({
        where: eq(groupMembers.userId, user.id)
      });
      context += `User's groups: ${userGroups.length} groups\n`;
    }
    
    return context;
  }

  async enrichWithSemanticData(context: string, message: string): Promise<any> {
    // Semantic search for platform knowledge
    // E.g., "Who's going to the tango event tonight?"
    // Search events, attendees, RSVPs
    
    if (message.toLowerCase().includes('event') || message.toLowerCase().includes('tango')) {
      const events = await this.searchEvents(message);
      return {
        matchCount: events.length,
        eventName: events[0]?.title,
        confidence: 0.85
      };
    }
    
    return null;
  }

  async searchEvents(query: string): Promise<any[]> {
    // Elasticsearch or simple database search
    return await db.query.events.findMany({
      where: or(
        like(events.title, `%${query}%`),
        like(events.description, `%${query}%`)
      ),
      limit: 10
    });
  }
}
```

**Sub-Track 1.5: Create Mr Blue API Route (40 min)**
```typescript
// server/routes/mrBlueRoutes.ts
import { Router } from 'express';
import { AIModelService } from '../services/aiModelService';
import { routeToLifeCEOAgent } from '../services/lifeCEORouter';
import { ContextBuilder } from '../services/contextBuilder';
import { requireAuth } from '../middleware/auth';

const router = Router();
const aiModelService = new AIModelService();
const contextBuilder = new ContextBuilder();

router.post('/api/mrblue/simple-chat', requireAuth, async (req, res) => {
  try {
    const { message, personality, agent, context, model = 'gpt-4o' } = req.body;

    // Step 1: Build enriched context
    const pageContext = await contextBuilder.buildPageContext(
      context.page || '/',
      req.user
    );

    const semanticContext = await contextBuilder.enrichWithSemanticData(
      pageContext,
      message
    );

    // Step 2: Route to Life CEO agent if needed
    const targetAgent = agent || routeToLifeCEOAgent(message);

    // Step 3: Build AI messages
    const messages = [
      {
        role: 'system',
        content: personality
      },
      {
        role: 'system',
        content: `Context: ${pageContext}\n\nYou are currently assisting as ${targetAgent}.`
      },
      {
        role: 'user',
        content: message
      }
    ];

    // Step 4: Call AI model
    const aiResponse = await aiModelService.route(model, messages);

    // Step 5: Return response with semantic context
    res.json({
      response: aiResponse.content || aiResponse,
      model,
      agent: targetAgent,
      semanticContext
    });

  } catch (error) {
    console.error('Mr Blue AI Error:', error);
    res.status(500).json({
      response: "No worries—hit a quick snag. Let's try that again.",
      error: error.message
    });
  }
});

export default router;
```

**Deliverables:**
- ✅ Replit AI Integration installed
- ✅ Multi-model AI service operational
- ✅ Life CEO routing functional
- ✅ Context builder enriching responses
- ✅ `/api/mrblue/simple-chat` endpoint working

---

### **🎨 TRACK 2: VISUAL EDITOR UI/UX (90 min)**

**Sub-Track 2.1: Debug Runtime Errors (30 min)**
```bash
# Step 1: Check browser console logs
# Step 2: Isolate failing hooks (useMultiplayer, useKeyboardShortcuts)
# Step 3: Stub out or fix broken dependencies
# Step 4: Test each component individually
# Step 5: Verify page renders
```

**Sub-Track 2.2: Install React Flow (15 min)**
```bash
npm install reactflow
```

**Sub-Track 2.3: Create Visual Editor Main UI (45 min)**
```typescript
// client/src/pages/admin/VisualEditorPage.tsx
import ReactFlow, { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

export default function VisualEditorPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedElement, setSelectedElement] = useState<any>(null);

  // Load current page structure
  useEffect(() => {
    loadPageStructure();
  }, []);

  const onSave = async () => {
    // Step 1: Show Mr Blue confirmation dialog
    const confirmed = await showMrBlueConfirmation({
      message: "I'll convert these visual changes to code. Ready to proceed?",
      changes: getChanges()
    });

    if (!confirmed) return;

    // Step 2: Send to AI for code generation
    const generatedCode = await fetch('/api/visual-editor/generate-code', {
      method: 'POST',
      body: JSON.stringify({
        changes: getChanges(),
        page: window.location.pathname
      })
    }).then(r => r.json());

    // Step 3: Show code diff preview
    showCodePreview(generatedCode);

    // Step 4: If approved, deploy
    if (await showDeployConfirmation()) {
      await deployChanges(generatedCode);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left: Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
        />
      </div>

      {/* Right: Properties Panel */}
      <div className="w-96 border-l p-4 bg-gradient-to-b from-[var(--aurora-turquoise)] to-[var(--aurora-blue)]">
        {selectedElement && (
          <PropertyPanel element={selectedElement} />
        )}
      </div>

      {/* Bottom: Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t">
        <button
          onClick={onSave}
          className="px-6 py-3 bg-gradient-to-r from-aurora-turquoise to-aurora-blue text-white rounded-lg"
          data-testid="button-save-changes"
        >
          Save Changes (Mr Blue will build this)
        </button>
      </div>
    </div>
  );
}
```

**Deliverables:**
- ✅ Visual Editor page loads without errors
- ✅ React Flow integrated
- ✅ Save → Mr Blue confirmation workflow
- ✅ Aurora Tide design applied to editor

---

### **🌊 TRACK 3: AURORA TIDE DESIGN (75 min)**

**Sub-Track 3.1: Define Design Tokens (15 min)**
```css
/* client/src/index.css */

:root {
  /* MT Aurora Tide - Primary Palette */
  --aurora-turquoise: #40E0D0;
  --aurora-cyan: #00CED1;
  --aurora-teal: #008B8B;
  --aurora-blue: #0047AB;
  --aurora-deep-blue: #003366;
  
  /* Gradients */
  --aurora-gradient: linear-gradient(135deg, #40E0D0 0%, #0047AB 100%);
  --aurora-gradient-subtle: linear-gradient(135deg, rgba(64,224,208,0.1) 0%, rgba(0,71,171,0.1) 100%);
  
  /* Glassmorphic */
  --aurora-glass-bg: rgba(64,224,208,0.1);
  --aurora-glass-border: rgba(64,224,208,0.2);
  --aurora-glass-blur: blur(12px);
}

.dark {
  --aurora-turquoise: #5EEAD4;
  --aurora-blue: #60A5FA;
  --aurora-glass-bg: rgba(94,234,212,0.05);
}
```

**Sub-Track 3.2: Update Tailwind Config (15 min)**
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'aurora-turquoise': '#40E0D0',
        'aurora-cyan': '#00CED1',
        'aurora-teal': '#008B8B',
        'aurora-blue': '#0047AB',
        'aurora-deep-blue': '#003366',
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, #40E0D0 0%, #0047AB 100%)',
      }
    }
  }
};
```

**Sub-Track 3.3: Apply to Key Pages (45 min)**
```typescript
// Apply to 10 high-priority pages:
// 1. Mr Blue dashboard
// 2. Visual Editor
// 3. Homepage
// 4. Events
// 5. Groups
// 6. Profile
// 7. Messages
// 8. Admin Center
// 9. Settings
// 10. Pricing

// Replace:
className="bg-blue-500"
// With:
className="bg-gradient-to-r from-aurora-turquoise to-aurora-blue"
```

**Deliverables:**
- ✅ Aurora Tide tokens defined
- ✅ Tailwind config extended
- ✅ 10+ key pages themed
- ✅ Dark mode using Aurora palette

---

### **🧠 TRACK 4: BREADCRUMB INTELLIGENCE (105 min)**

**Sub-Track 4.1: Add Database Schema (15 min)**
```typescript
// shared/schema.ts
export const breadcrumbs = pgTable("breadcrumbs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  page: varchar("page", { length: 500 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  target: varchar("target", { length: 500 }),
  success: boolean("success").default(true),
  error: text("error"),
});

export const failedActions = pgTable("failed_actions", {
  id: serial("id").primaryKey(),
  breadcrumbId: integer("breadcrumb_id").references(() => breadcrumbs.id),
  userId: integer("user_id").notNull(),
  failureType: varchar("failure_type", { length: 50 }).notNull(),
  errorDetails: jsonb("error_details").notNull(),
  resolved: boolean("resolved").default(false),
});
```

**Sub-Track 4.2: Create Breadcrumb Tracker (30 min)**
```typescript
// server/services/breadcrumbTracker.ts
export class BreadcrumbTracker {
  async track(breadcrumb: Breadcrumb): Promise<void> {
    await db.insert(breadcrumbs).values(breadcrumb);
    
    // If failure, also track in failed_actions
    if (!breadcrumb.success) {
      await db.insert(failedActions).values({
        userId: breadcrumb.userId,
        failureType: breadcrumb.error?.includes('404') ? '404' : 'api_error',
        errorDetails: { error: breadcrumb.error }
      });
    }
  }

  async getLastN(userId: number, count: number = 30): Promise<Breadcrumb[]> {
    return await db.query.breadcrumbs.findMany({
      where: eq(breadcrumbs.userId, userId),
      orderBy: desc(breadcrumbs.timestamp),
      limit: count
    });
  }

  async detectPattern(userId: number): Promise<Pattern[]> {
    const recent = await this.getLastN(userId, 100);
    // ML pattern detection (simplified)
    return this.analyzePatterns(recent);
  }
}
```

**Sub-Track 4.3: Add Frontend Tracking (30 min)**
```typescript
// client/src/hooks/useBreadcrumbTracking.ts
export function useBreadcrumbTracking() {
  const location = useLocation();

  useEffect(() => {
    // Track page navigation
    trackBreadcrumb({
      action: 'navigation',
      page: location.pathname,
      target: document.title
    });
  }, [location]);

  const trackClick = (element: string) => {
    trackBreadcrumb({
      action: 'click',
      page: location.pathname,
      target: element
    });
  };

  return { trackClick };
}

// Add to all interactive elements:
<button
  data-testid="button-submit"
  onClick={() => {
    trackClick('button-submit');
    handleSubmit();
  }}
>
```

**Sub-Track 4.4: Create Auto-Healing Service (30 min)**
```typescript
// server/services/autoHealingService.ts
export class AutoHealingService {
  async detectIssue(userId: number): Promise<Issue | null> {
    const recentFailed = await db.query.failedActions.findMany({
      where: and(
        eq(failedActions.userId, userId),
        eq(failedActions.resolved, false)
      ),
      limit: 10
    });

    if (recentFailed.length >= 3) {
      // User struggling, offer help
      return {
        type: 'repeated_failures',
        count: recentFailed.length,
        suggestion: 'Show Mr Blue proactive help'
      };
    }

    return null;
  }

  async autoFix(issue: Issue): Promise<boolean> {
    // Attempt automatic fixes for common issues
    if (issue.type === 'permission_error') {
      // Redirect to permission request page
      return true;
    }

    if (issue.type === '404') {
      // Suggest alternative page
      return true;
    }

    return false;
  }
}
```

**Deliverables:**
- ✅ Breadcrumb database schema created
- ✅ Tracking service operational
- ✅ Frontend tracking active
- ✅ Auto-healing detecting issues

---

### **📚 TRACK 5: TESTING INFRASTRUCTURE (60 min)**

**Sub-Track 5.1: Create E2E Tests (30 min)**
```typescript
// tests/mr-blue/mr-blue-full-intelligence.spec.ts
import { test, expect } from '@playwright/test';

test('Mr Blue AI responds intelligently', async ({ page }) => {
  await page.goto('/');
  
  // Open Mr Blue
  await page.click('[data-testid="button-mr-blue"]');
  
  // Send message
  await page.fill('[data-testid="input-chat"]', 'Hello Mr Blue!');
  await page.click('[data-testid="button-send"]');
  
  // Verify AI response
  const response = await page.locator('[data-testid="text-ai-response"]').textContent();
  expect(response).not.toContain('<!DOCTYPE'); // Not HTML error
  expect(response.length).toBeGreaterThan(10); // Actual response
});

test('Visual Editor drag-drop generates code', async ({ page }) => {
  await page.goto('/admin/visual-editor');
  
  // Drag element
  await page.dragAndDrop('[data-testid="element-text"]', { x: 100, y: 100 });
  
  // Save
  await page.click('[data-testid="button-save-changes"]');
  
  // Verify Mr Blue confirmation
  const confirmation = await page.locator('[data-testid="text-mr-blue-confirmation"]');
  await expect(confirmation).toBeVisible();
});
```

**Sub-Track 5.2: Create Integration Tests (20 min)**
```typescript
// tests/integration/mr-blue-api.test.ts
import { describe, it, expect } from 'vitest';
import { aiModelService } from '../server/services/aiModelService';

describe('Mr Blue API Integration', () => {
  it('should route to GPT-4o', async () => {
    const result = await aiModelService.route('gpt-4o', [
      { role: 'user', content: 'Hello!' }
    ]);
    
    expect(result).toBeDefined();
    expect(result.content || result).toContain('hello');
  });

  it('should fallback to Claude', async () => {
    const result = await aiModelService.route('claude', [
      { role: 'user', content: 'Hello!' }
    ]);
    
    expect(result).toBeDefined();
  });
});
```

**Sub-Track 5.3: Setup Autonomous Testing (10 min)**
```typescript
// tests/autonomous/mr-blue-health-monitor.ts
import cron from 'node-cron';

// Run every hour
cron.schedule('0 * * * *', async () => {
  const health = await checkMrBlueHealth();
  
  if (health.status !== 'healthy') {
    // Alert Quality Validator (#79)
    await notifyAgent79(health);
  }
  
  // Log to Learning Coordinator (#80)
  await logToAgent80(health);
});

async function checkMrBlueHealth() {
  // Test chat endpoint
  const chatTest = await testChatEndpoint();
  
  // Test AI response time
  const responseTime = await measureResponseTime();
  
  return {
    status: chatTest && responseTime < 15000 ? 'healthy' : 'unhealthy',
    chatWorking: chatTest,
    responseTime
  };
}
```

**Deliverables:**
- ✅ E2E tests for Mr Blue + Visual Editor
- ✅ Integration tests for AI services
- ✅ Autonomous health monitoring active

---

### **📚 TRACK 6: DOCUMENTATION (45 min)**

**Sub-Track 6.1: Update AGENT_LEARNING.md (15 min)**
- Add lessons from this build
- Document Visual Editor patterns
- Update prevention checklist

**Sub-Track 6.2: Update replit.md (15 min)**
- Document Mr Blue AI completion
- Document Visual Editor completion
- Update system status

**Sub-Track 6.3: Create Phase Report (15 min)**
- MB_MD_VISUAL_EDITOR_MR_BLUE_COMPLETE.md
- Execution summary
- Metrics and achievements

**Deliverables:**
- ✅ All documentation updated
- ✅ Lessons learned documented
- ✅ Phase report created

---

## 🚀 PHASE 5: BUILD (Parallel Execution) - 120 min

### **EXECUTION COMMAND:**
```bash
# All 6 tracks execute SIMULTANEOUSLY
# No blocking dependencies until integration phase
```

### **INTEGRATION PHASE (30 min)**
1. Merge all track outputs
2. Restart server with new routes
3. Test Mr Blue AI chat
4. Test Visual Editor
5. Verify Aurora Tide design
6. Validate breadcrumb tracking
7. Confirm auto-healing active

---

## ✅ SUCCESS CRITERIA

### **Mr Blue AI:**
- ✅ Chat responds in <5 seconds
- ✅ Multi-model routing functional (GPT-4o, Claude, Gemini)
- ✅ Life CEO agents accessible
- ✅ Context awareness working
- ✅ Platform knowledge (cities, groups, events, people)
- ✅ Auto-healing active
- ✅ Zero API errors

### **Visual Editor:**
- ✅ Page loads successfully
- ✅ Drag-drop working
- ✅ Save → Mr Blue confirmation
- ✅ AI code generation functional
- ✅ Git automation working
- ✅ Preview mode operational
- ✅ Zero runtime errors

### **Aurora Tide Design:**
- ✅ Design tokens defined
- ✅ Gradient system applied
- ✅ Glassmorphism active
- ✅ Dark mode using Aurora palette
- ✅ 100% consistency across 10+ pages

### **Intelligence:**
- ✅ Breadcrumb tracking active
- ✅ Failed actions monitored
- ✅ Auto-healing detecting issues
- ✅ ML pattern recognition working
- ✅ Support has full user journey

---

## 📊 FINAL DELIVERABLES

1. **Mr Blue AI** - Full ChatGPT-like intelligence for all users
2. **Visual Editor** - Replit + Figma hybrid for Super Admins
3. **Aurora Tide Design** - Beautiful turquoise-to-blue gradient everywhere
4. **Auto-Healing** - AI detects and fixes issues automatically
5. **Journey Tracking** - Complete user behavior monitoring
6. **Platform Knowledge** - Mr Blue knows cities, groups, events, people
7. **Sub-Agent Orchestration** - Visual changes delegate to page agents

---

**TIMELINE:** 120 min parallel execution + 30 min integration = **150 min (2.5 hours) total**  
**EFFICIENCY:** 75% faster than sequential approach  
**AGENT UTILIZATION:** 100% (all 276 agents orchestrated)

**🎊 THIS IS THE REBUILD PLATFORM - LET'S BUILD IT! 🎊**
