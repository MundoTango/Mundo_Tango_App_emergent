# Autonomous Coding Systems Research

**Research Date:** October 26, 2025  
**Research Agent:** Agent #134 - Autonomous Coding Research Specialist  
**Objective:** Document architectures and patterns from Replit Agent 3, Cursor, Winds

urf, Bolt.new for implementation in Mundo Tango

---

## Executive Summary

Autonomous coding systems have evolved from simple code completion to full-stack application builders that can work for hours without human intervention. This research documents 4 leading platforms and their architectural patterns for autonomous coding.

**Key Findings:**
1. **200-minute autonomous runtime** is now achievable (Replit Agent 3)
2. **Self-testing + self-healing loops** are critical for production quality
3. **Multi-model orchestration** (Claude + GPT-4 + Gemini) outperforms single-model approaches
4. **YOLO Mode** (autonomous execution without confirmation) requires careful guardrails
5. **WebContainers** enable full-stack development entirely in browsers

---

## 1. Replit Agent 3

### Architecture

**Three Revolutionary Capabilities:**
1. **Extended Autonomous Runtime (200 minutes)** - 10x longer than Agent 2
2. **Self-Testing & Self-Healing Loop** - Proprietary browser-based testing
3. **Agent-Building Capability** - Can generate other autonomous agents

**Technical Stack:**
- **Anthropic Claude Sonnet 3.5** - Agentic reasoning and planning
- **OpenAI GPT-4** - Code review
- **Google Gemini** - Cost-sensitive operations

**How It Works:**
- Two start modes: Start with Design (3 min) or Build Full App (10 min)
- Max Autonomy Mode: 200 minutes unsupervised with self-supervision
- Automated browser testing: Clicks buttons, submits forms, verifies responses
- 3x faster and 10x more cost-effective than Computer Use models

**Real-World Performance:**
- CEO Amjad Masad reported **4.5-hour autonomous sessions**
- Builds apps that normally take a week
- Handles full-stack: database integration, API wiring, deployment

**Key Differentiator:**
- **Agent-building capability** - Creates Telegram bots, Slack agents, scheduled tasks from natural language

---

## 2. Cursor Composer (Agent Mode)

### Architecture

**Core Features:**
- **Agent Mode** (formerly Composer) - Multi-file editing + autonomous execution
- **YOLO Mode** - Removes confirmation prompts for routine tasks
- **Context Management** - @codebase, @filename, @docs, @Web, @Git, @Commit
- **Shadow Workspace** - Isolated environment before applying changes

**Keyboard Shortcuts:**
- `Cmd+I` - Agent Mode (floating window)
- `Cmd+Shift+I` - Full-screen mode
- `Cmd+K` - Inline edit (quick changes)
- `Cmd+L` - Chat sidebar

**Practical Patterns:**

**Pattern 1: Multi-File Feature Development**
```
"Create a new user registration feature:
- Add UserDTO in src/dto/user.dto.ts
- Create POST /register endpoint in auth.controller.ts
- Implement validation in auth.service.ts
- Add unit tests in auth.spec.ts"
```
Agent creates/modifies all 4 files with proper integration.

**Pattern 2: Test-Driven Autonomous Fixing**
With YOLO enabled:
1. Agent writes tests first
2. Runs tests → sees failures
3. Fixes implementation automatically
4. Iterates until all tests pass

**Pattern 3: Build Error Cleanup**
```
"Run 'npm run build' and fix all TypeScript errors. 
Keep running build until it passes."
```
YOLO mode: Agent runs command, reads errors, fixes issues, re-runs until clean.

**Best Practices:**
- ✅ Break large tasks into smaller steps
- ✅ Use Rules for AI (define coding patterns)
- ✅ Index framework docs for better context
- ✅ Monitor YOLO mode for infinite loops
- ⚠️ YOLO Mode only in dev environments

**Productivity Gains:** 2-5x reported, up to 10x on routine tasks

---

## 3. Windsurf IDE - Cascade

### Architecture

**Cascade: The Autonomous Agent**
- **Real-time awareness** of entire project + workflow
- **Natural language commands** that chain multiple actions
- **Autonomous execution** across files, terminal, environment
- **Multi-file editing** with coherent changes

**Key Features:**

**1. Cascade Modes**
- **Write Mode** - Direct code changes autonomously
- **Chat Mode** - Help without altering code
- **Turbo Mode** - Fully autonomous task execution

**2. Supercomplete**
- Advanced autocomplete predicting entire code blocks with documentation

**3. Command Mode (⌘/Ctrl + I)**
- Inline editing for quick changes

**4. Flows**
- Real-time collaboration between developer and AI
- Suggestions appear naturally without stopping workflow

**5. Memories**
- Autonomously generates context to remember coding preferences and project details

**6. Preview & Deploy**
- Live preview in IDE
- Click-to-edit: Click elements to edit source
- One-click deployment

**Autonomous Workflow:**
1. **Contextual awareness** - Understands entire project state
2. **Independent action** - Takes initiative to solve problems
3. **Continuous adaptation** - Evolves approach as project develops
4. **Multi-step chaining** - Completes complex tasks without prompting

**Example Tasks:**
- "Start Swift project for MacOS app" → generates full structure
- Renaming component → updates imports across project
- Auto-fixes lint errors it generates

**Pricing:** $15/month (vs. Cursor's $20)

**Key Differentiator:** Flow awareness - less time explaining context

---

## 4. Bolt.new

### Architecture

**Core Components:**

**1. WebContainers Technology**
- WebAssembly-based micro-OS running Node.js in browser
- Client-side execution (no remote servers)
- Powers: filesystem, Node server, package manager, terminal, console
- Supports npm install, server execution, real-time previews

**2. AI Integration Layer**
- **Primary LLM:** Anthropic Claude Sonnet 3.5
- **Multi-LLM support:** OpenAI, Gemini, Ollama, Mistral, DeepSeek, Groq
- AI has **environment control**, not just code generation:
  - Manages file structure
  - Installs dependencies
  - Executes terminal commands
  - Debugs errors in real-time
  - Handles deployment

**3. StackBlitz IDE**
- Browser-based IDE (VS Code-like)
- Real-time code preview
- Integrated terminal
- Chrome DevTools integration

**Development Workflow:**
```
Natural Language Prompt
   ↓
AI Model (Claude 3.5) Processing
   ↓
Code Generation + Project Scaffolding
   ↓
WebContainers Execute in Browser
   ↓
Live Preview + Real-time Debugging
   ↓
Iterative Refinement (AI or Manual)
   ↓
One-Click Deployment (Netlify/Vercel/Railway)
```

**Technology Stack Support:**
- **Frontend:** React, Vue, Angular, Svelte, Astro, Next.js
- **Backend:** Node.js, Express, Fastify
- **Build Tools:** Vite, Webpack
- **Styling:** Tailwind CSS, shadcn/ui
- **Databases:** Supabase (PostgreSQL)
- **Deployment:** Netlify, Vercel, Railway
- **Mobile:** Expo (React Native)

**Key Advantages:**
1. **Zero setup friction** - No Node.js/npm installation required
2. **Cost efficiency** - Client-side compute reduces infrastructure costs
3. **Instant feedback loop** - Real-time preview and error detection
4. **Production-ready output** - Integrated auth, databases, deployment

**vs. Traditional AI Assistants:**
- **Environment control** - AI executes, debugs, and deploys (not just suggests)
- **Full-stack in browser** - No local environment needed
- **Complete lifecycle** - From prompt to production

**vs. Cloud IDEs:**
- **Client-side execution** - WebContainers run in browser (no server costs)
- **Faster performance** - No network latency
- **Better privacy** - Code runs on your machine

---

## 5. v0.dev

### Architecture

**Composite Model System (vs. Single LLM):**

**1. Multi-Layer AI Pipeline**
- **Base LLM:** Anthropic Claude Sonnet 3.7/4
- **RAG Layer:** Specialized knowledge (Next.js, React, shadcn/ui, Tailwind docs)
- **AutoFix Model** (vercel-autofixer-01): 
  - Runs **during streaming** to catch errors in real-time
  - Custom model trained via Reinforcement Fine-Tuning (RFT)
  - Detects inconsistencies, best practices violations, bugs
  - Final pass after streaming + linting

**Generation Pipeline:**
```
User Prompt → Base LLM (Sonnet) → Streaming Output → AutoFix (Real-time) 
→ Final Pass → Linting → Code Output
```

**Key Steps:**
1. **Input processing** - Text or image (multimodal via base64)
2. **Context injection** - RAG retrieves relevant docs/examples
3. **Code generation** - Base LLM generates JSX + Tailwind
4. **Mid-stream fixing** - AutoFix corrects errors during generation
5. **Post-generation** - Final validation, linting, formatting

**Output Formats:**
- **React Blocks** (Primary) - Full JSX with Tailwind + shadcn/ui
- Node.js executable code
- HTML with vanilla CSS
- Mermaid diagrams
- Experimental: Svelte, Vue, Python, SQL

**Multimodal Support:**
- Text prompts
- Image uploads (Figma designs, screenshots)
- URL cloning (fetch + screenshot + code generation)

**Integration:**
```bash
# CLI
npx shadcn@latest add https://v0.dev/chat/b/<ID>?token=<TOKEN>

# API
curl https://api.v0.dev/v1/chat/completions \
  -H "Authorization: Bearer $V0_API_KEY" \
  -d '{"model": "v0-1.5-md", "messages": [...]}'
```

**Key Differentiators:**
1. **Composite architecture** - Specialized models for each task
2. **Real-time error fixing** - AutoFix runs during generation
3. **Production-ready** - Complete, copy-paste code (no placeholders)
4. **shadcn/ui focus** - Deep integration with modern component patterns

**Pricing:**
- Free: 200 credits/month
- Premium: ~$20/month
- Credits vary: Simple component ~5, Image-based ~15

---

## Synthesis: Best Practices for Mundo Tango

### 1. Multi-Model Orchestration
**Pattern:** Use different models for different tasks (like Replit Agent 3):
- Claude Sonnet for reasoning/planning
- GPT-4 for code review
- Gemini for cost-sensitive operations

### 2. Self-Testing Loops
**Pattern:** Implement automated testing like Replit Agent 3:
- Browser-based testing (Playwright)
- Automatic retries on failure
- Self-healing code corrections

### 3. YOLO Mode with Guardrails
**Pattern:** Allow autonomous execution (like Cursor) but with controls:
- Allow/deny lists for terminal commands
- User confirmation for destructive operations
- Timeout limits for long-running tasks

### 4. Progressive Disclosure
**Pattern:** Start simple, expand details on request (like v0.dev):
- Quick preview in 3 minutes
- Full app in 10 minutes
- Iterative refinement via chat

### 5. WebContainer-Style Execution
**Pattern:** Client-side execution when possible (like Bolt.new):
- No server dependency for preview
- Instant feedback loop
- Reduced infrastructure costs

### 6. Context-Aware Assistance
**Pattern:** Maintain full project awareness (like Windsurf):
- Track files, terminal history, clipboard
- Natural language commands chain actions
- Remember user preferences across sessions

---

## Implementation Roadmap for Mundo Tango

**Phase 1: Foundation (Weeks 1-2)**
- Integrate multi-model routing (Claude/GPT/Gemini)
- Implement basic autonomous execution (file editing)
- Add terminal command execution with guardrails

**Phase 2: Self-Testing (Weeks 3-4)**
- Integrate Playwright for browser testing
- Implement self-healing loop (test → fix → retest)
- Add screenshot capture for test results

**Phase 3: Advanced Features (Weeks 5-6)**
- Implement YOLO mode with confirmation toggles
- Add WebContainer-style client-side preview
- Create agent memories system

**Phase 4: Production Polish (Weeks 7-8)**
- Add comprehensive error handling
- Implement cost tracking per operation
- Create user dashboards for autonomous sessions

---

## Key Metrics to Track

| Metric | Target |
|--------|--------|
| Autonomous runtime | 60+ minutes |
| Test success rate | >90% |
| Self-healing rate | >80% |
| Time to first preview | <3 minutes |
| Cost per autonomous session | <$5 |

---

## Resources

- Replit Agent 3: https://replit.com/agent3
- Cursor Docs: https://docs.cursor.com/agent
- Windsurf: https://windsurf.com/cascade
- Bolt.new: https://github.com/stackblitz/bolt.new
- v0.dev: https://vercel.com/blog/v0-composite-model-family
