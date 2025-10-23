# Vibe Coding Technical Implementation Guide (Oct 23, 2025)

## 🎯 **Executive Summary**

This document answers: **"How do vibe coding platforms actually work, and how do we implement this in Mundo Tango?"**

Based on deep analysis of open-source implementations (Bolt.diy, Aider, Continue.dev) and proprietary systems (Replit, Cursor, Windsurf), this guide provides complete technical specifications for building autonomous coding capabilities.

---

## 📚 **Table of Contents**

1. [Open Source Implementations](#open-source-implementations)
2. [Technical Architecture Patterns](#technical-architecture-patterns)
3. [File Editing Algorithms](#file-editing-algorithms)
4. [Chat → Code Pipeline](#chat-code-pipeline)
5. [Building & Testing Systems](#building-testing-systems)
6. [Mundo Tango Implementation Plan](#mundo-tango-implementation-plan)

---

## 🔓 **Part 1: Open Source Implementations**

### **1.1 Bolt.diy - Complete Open Source Vibe Coding Platform**

**Repository:** https://github.com/stackblitz-labs/bolt.diy  
**Stars:** 18.3k | **License:** MIT | **Language:** TypeScript

#### **Architecture Overview**

```
┌──────────────────────────────────────────────────┐
│                  Remix Frontend                   │
│  (React UI, Monaco Editor, Terminal Interface)   │
└───────────────┬──────────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────────────────┐
│            Vercel AI SDK Layer                    │
│     (LLM Abstraction - 19+ Providers)            │
└───────────────┬──────────────────────────────────┘
                │
                ↓
┌──────────────────────────────────────────────────┐
│          WebContainer Runtime                     │
│   (WASM-based Node.js in Browser)               │
│   - Virtual Filesystem                           │
│   - NPM/PNPM/Yarn                                │
│   - Dev Servers (Vite, Next.js, etc.)           │
│   - Terminal Execution                           │
└──────────────────────────────────────────────────┘
```

#### **Tech Stack**

**Frontend:**
```json
{
  "framework": "Remix (React-based)",
  "editor": "Monaco (VS Code editor component)",
  "ui": "Tailwind CSS + Custom Components",
  "state": "React Context + Local Storage",
  "build": "Vite"
}
```

**LLM Integration:**
```typescript
// app/lib/modules/llm/registry.ts
import { BaseProvider } from './base-provider';

// 19+ Provider Support
const providers = {
  anthropic: AnthropicProvider,
  openai: OpenAIProvider,
  google: GoogleProvider,
  groq: GroqProvider,
  ollama: OllamaProvider,
  deepseek: DeepSeekProvider,
  // ... 13 more
};

// Each provider extends BaseProvider
class AnthropicProvider extends BaseProvider {
  static apiKey: string;
  static models = ['claude-3-5-sonnet', 'claude-3-opus'];
  
  async complete(messages: Message[]) {
    // Anthropic API call
  }
}
```

**Runtime:**
```typescript
// WebContainer boot
import { WebContainer } from '@webcontainer/api';

const instance = await WebContainer.boot();

// Mount file system
await instance.mount({
  'package.json': {
    file: { contents: JSON.stringify(packageJson) }
  },
  'src': {
    directory: {
      'App.tsx': { file: { contents: appCode } }
    }
  }
});

// Run commands
await instance.spawn('npm', ['install']);
await instance.spawn('npm', ['run', 'dev']);
```

#### **File Management System**

**Multi-Stage File Handling:**
```typescript
// app/lib/stores/files.ts
class FileManager {
  private inMemoryFiles: Map<string, string> = new Map();
  private webContainer: WebContainerInstance;
  
  // Stage 1: In-memory updates (immediate UI feedback)
  updateInMemory(path: string, content: string) {
    this.inMemoryFiles.set(path, content);
    this.notifyEditor(path, content);
  }
  
  // Stage 2: Sync to WebContainer (for execution)
  async syncToWebContainer() {
    for (const [path, content] of this.inMemoryFiles) {
      await this.webContainer.fs.writeFile(path, content);
    }
  }
  
  // Stage 3: Download as ZIP (optional)
  async downloadProject() {
    const files = await this.webContainer.fs.readdir('.', { recursive: true });
    return createZip(files);
  }
}
```

**File Locking (Prevent AI Conflicts):**
```typescript
class FileLockManager {
  private locks: Map<string, boolean> = new Map();
  
  async lockFile(path: string): Promise<void> {
    while (this.locks.get(path)) {
      await sleep(100); // Wait for unlock
    }
    this.locks.set(path, true);
  }
  
  unlockFile(path: string): void {
    this.locks.delete(path);
  }
  
  // Use in AI editing flow
  async applyAIEdit(path: string, newContent: string) {
    await this.lockFile(path);
    try {
      await this.writeFile(path, newContent);
    } finally {
      this.unlockFile(path);
    }
  }
}
```

#### **Installation & Setup**

```bash
# Clone repository
git clone https://github.com/stackblitz-labs/bolt.diy.git
cd bolt.diy

# Install dependencies (requires pnpm)
pnpm install

# Configure environment
cp .env.example .env.local

# Add API keys
# ANTHROPIC_API_KEY=sk-ant-...
# OPENAI_API_KEY=sk-...
# GROQ_API_KEY=gsk_...

# Start development server
pnpm run dev

# Open http://localhost:5173
# Choose model from dropdown
# Start chatting to build apps!
```

---

### **1.2 Aider - Terminal-Based AI Pair Programming**

**Repository:** https://github.com/Aider-AI/aider  
**Stars:** 20k+ | **License:** Apache 2.0 | **Language:** Python

#### **Architecture**

```
┌──────────────────────────────────────┐
│       Terminal UI (Rich TUI)         │
└───────────────┬──────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│         LLM Integration              │
│  (Claude, GPT-4, DeepSeek, etc.)    │
└───────────────┬──────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│      Unified Diff Generator          │
│   (Prompts LLM for diff format)     │
└───────────────┬──────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│       Diff Parser & Applier          │
│    (Fuzzy matching, Git aware)      │
└───────────────┬──────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│       Git Auto-Commit                │
│   (Descriptive commit messages)     │
└──────────────────────────────────────┘
```

#### **Key Innovation: Unified Diff Format**

**Why it works:**
- LLMs trained on GitHub repos (tons of diff data)
- Forces AI to think like a program, not a human
- **3x reduction in lazy coding** (compared to other formats)
- GPT-4 Turbo performance improved from 20% → 61% on refactoring

**System Prompt:**
```python
# aider/coders/base_coder.py
SYSTEM_PROMPT = """
You are an expert software developer.
Always reply with *SEARCH/REPLACE* blocks or unified diffs.

Example:
<<<<<<< SEARCH
def old_function():
    pass
=======
def new_function():
    # New implementation
    return True
>>>>>>> REPLACE
"""
```

**Diff Application:**
```python
# aider/diff_utils.py
def apply_unified_diff(original: str, diff: str) -> str:
    lines = original.split('\n')
    hunks = parse_diff(diff)
    
    for hunk in hunks:
        start_line = hunk.start - 1
        
        # Apply changes with fuzzy matching
        for change in hunk.changes:
            if change.type == 'context':
                if not fuzzy_match(lines[start_line], change.content):
                    # Try to find match within ±5 lines
                    start_line = find_closest_match(lines, start_line, change.content)
            elif change.type == 'delete':
                del lines[start_line]
            elif change.type == 'add':
                lines.insert(start_line, change.content)
                start_line += 1
    
    return '\n'.join(lines)
```

#### **Repository Mapping (2M+ Token Context)**

```python
# aider/repomap.py
class RepoMap:
    def create_map(self, files: list[str]) -> str:
        """Creates a compact map of entire repository"""
        
        # 1. Parse all files to AST
        symbols = {}
        for file in files:
            symbols[file] = extract_symbols(file)  # Classes, functions, imports
        
        # 2. Build dependency graph
        graph = build_dependency_graph(symbols)
        
        # 3. Create compact representation
        map_text = []
        for file, sym_list in symbols.items():
            map_text.append(f"## {file}")
            for symbol in sym_list:
                map_text.append(f"  - {symbol.type} {symbol.name}")
                if symbol.references:
                    map_text.append(f"    → {symbol.references}")
        
        return '\n'.join(map_text)
```

**Result:** Fits 100k+ LOC repository into 50k tokens!

#### **Installation & Usage**

```bash
# Install
pip install aider-chat

# Set API key
export ANTHROPIC_API_KEY=sk-ant-...

# Launch in git repo
cd /path/to/your/project
aider

# Add files to context
/add src/app.ts src/utils.ts

# Make edits
> Add error handling to the API endpoint and write unit tests

# Aider:
# - Generates unified diff
# - Shows preview
# - Applies changes
# - Runs tests (if you set up /run pytest)
# - Auto-commits with message: "Add error handling to API endpoint and unit tests"

# Voice mode
aider --voice-language en

# Run tests after each change
aider --auto-test
```

---

### **1.3 Continue.dev - Open Source Cursor Alternative**

**Repository:** https://github.com/continuedev/continue  
**Stars:** 20k+ | **License:** Apache 2.0 | **Type:** VS Code/JetBrains Extension

#### **Architecture**

```
┌──────────────────────────────────────┐
│    IDE Extension (VS Code/JetBrains)  │
│  - Inline Completions                │
│  - Chat Panel                         │
│  - Diff View                          │
└───────────────┬──────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│     Config-Driven Model Selection    │
│    (~/.continue/config.json)         │
└───────────────┬──────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│       LLM Provider Layer             │
│  (OpenAI, Anthropic, Ollama, etc.)  │
└───────────────┬──────────────────────┘
                │
                ↓
┌──────────────────────────────────────┐
│      Context Providers               │
│  (Codebase, Git, Docs, Terminal)    │
└──────────────────────────────────────┘
```

#### **Configuration**

```json
// ~/.continue/config.json
{
  "models": [
    {
      "title": "GPT-4",
      "provider": "openai",
      "model": "gpt-4",
      "apiKey": "YOUR_KEY"
    },
    {
      "title": "Claude 3.5 Sonnet",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "apiKey": "YOUR_KEY"
    },
    {
      "title": "Local Llama 3",
      "provider": "ollama",
      "model": "llama3:70b"
    }
  ],
  "tabAutocompleteModel": {
    "title": "DeepSeek Coder",
    "provider": "ollama",
    "model": "deepseek-coder:6.7b"
  },
  "contextProviders": [
    { "name": "code", "params": {} },
    { "name": "docs", "params": {} },
    { "name": "diff", "params": {} },
    { "name": "terminal", "params": {} },
    { "name": "problems", "params": {} },
    { "name": "folder", "params": {} },
    { "name": "codebase", "params": {} }
  ]
}
```

#### **Custom Tools/Slash Commands**

```typescript
// ~/.continue/config.ts
export function modifyConfig(config: Config): Config {
  config.slashCommands = [
    {
      name: "test",
      description: "Generate unit tests for selected code",
      run: async function* (sdk) {
        const code = await sdk.ide.getSelectedCode();
        
        for await (const chunk of sdk.llm.streamComplete(
          `Generate unit tests for:\n\n${code}`
        )) {
          yield chunk;
        }
      }
    },
    {
      name: "commit",
      description: "Generate commit message",
      run: async function* (sdk) {
        const diff = await sdk.ide.getDiff();
        
        for await (const chunk of sdk.llm.streamComplete(
          `Generate commit message for:\n\n${diff}`
        )) {
          yield chunk;
        }
      }
    }
  ];
  
  return config;
}
```

#### **Installation**

```bash
# VS Code
code --install-extension continue.continue

# Or search "Continue" in VS Code extensions marketplace

# Configure
# Open Command Palette (Ctrl+Shift+P)
# Type "Continue: Open config.json"
# Add your API keys and models

# Use
# Ctrl+Shift+M - Open Continue chat
# Highlight code + ask question in chat
# Use @codebase to search entire project
# Use /test to generate tests for selected code
```

---

## 🏗️ **Part 2: Technical Architecture Patterns**

### **2.1 Chat → Code Pipeline**

**Universal Pattern (All Platforms):**

```
User Message → LLM API → Structured Output → Parse Actions → Apply Changes → Feedback
```

#### **Detailed Flow**

```typescript
interface ChatTurn {
  // 1. User input
  userMessage: string;
  context: {
    currentFile?: string;
    selectedCode?: string;
    openFiles: string[];
    gitBranch: string;
    errors?: CompilerError[];
  };
  
  // 2. LLM request
  llmRequest: {
    model: 'claude-3-5-sonnet' | 'gpt-4o';
    systemPrompt: string;
    messages: Message[];
    tools?: Tool[];  // Function calling
    temperature: number;
  };
  
  // 3. LLM response
  llmResponse: {
    message: string;
    toolCalls?: ToolCall[];
    fileEdits?: FileEdit[];
  };
  
  // 4. Execution
  actions: {
    type: 'write_file' | 'edit_file' | 'run_command' | 'search_code';
    payload: any;
  }[];
  
  // 5. Feedback
  result: {
    success: boolean;
    output?: string;
    errors?: Error[];
  };
}
```

#### **System Prompt Engineering**

**Bolt.diy Example:**
```typescript
const SYSTEM_PROMPT = `
You are Bolt, an expert AI assistant and full-stack developer.

RULES:
1. NEVER use placeholders like "// rest of code" or "// unchanged"
2. ALWAYS write complete, working code
3. When editing files, use <boltAction> XML tags
4. Think step-by-step before coding

AVAILABLE ACTIONS:
<boltAction type="file" filePath="src/App.tsx">
  [complete file contents]
</boltAction>

<boltAction type="shell">
  npm install lodash
</boltAction>

USER ENVIRONMENT:
- Browser-based WebContainer
- Node.js, npm, Vite available
- No database unless user requests it
`;
```

**Aider Example:**
```python
SYSTEM_PROMPT = """
You are an expert software developer.

IMPORTANT:
- Reply using SEARCH/REPLACE blocks
- Include 3-5 lines of context before and after changes
- NEVER use placeholders or "..." in code
- ALWAYS show complete implementations

Example format:
<<<<<<< SEARCH
function oldImplementation() {
  return false;
}
=======
function newImplementation() {
  return true;
}
>>>>>>> REPLACE
"""
```

---

### **2.2 Structured Output Parsing**

#### **XML Tag Parsing (Bolt.diy Style)**

```typescript
interface BoltAction {
  type: 'file' | 'shell' | 'start';
  filePath?: string;
  content?: string;
  command?: string;
}

function parseBoltActions(llmOutput: string): BoltAction[] {
  const actions: BoltAction[] = [];
  
  // Regex to extract <boltAction> tags
  const actionRegex = /<boltAction type="(\w+)"([^>]*)>([\s\S]*?)<\/boltAction>/g;
  
  let match;
  while ((match = actionRegex.exec(llmOutput)) !== null) {
    const type = match[1] as 'file' | 'shell' | 'start';
    const attrs = parseAttributes(match[2]);
    const content = match[3].trim();
    
    actions.push({
      type,
      filePath: attrs.filePath,
      content: type === 'file' ? content : undefined,
      command: type === 'shell' ? content : undefined
    });
  }
  
  return actions;
}

// Execute actions
async function executeActions(actions: BoltAction[], webContainer: WebContainerInstance) {
  for (const action of actions) {
    switch (action.type) {
      case 'file':
        await webContainer.fs.writeFile(action.filePath!, action.content!);
        break;
      
      case 'shell':
        await webContainer.spawn('sh', ['-c', action.command!]);
        break;
      
      case 'start':
        await webContainer.spawn('npm', ['run', 'dev']);
        break;
    }
  }
}
```

#### **Function Calling (Cursor/Replit Style)**

```typescript
// Define tools
const tools = [
  {
    name: 'write_file',
    description: 'Write or overwrite a file',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        content: { type: 'string' }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'edit_file',
    description: 'Make surgical edits to a file',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        oldText: { type: 'string' },
        newText: { type: 'string' }
      },
      required: ['path', 'oldText', 'newText']
    }
  }
];

// LLM call with function calling
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet',
  tools,
  messages: [{ role: 'user', content: 'Add dark mode to App.tsx' }]
});

// Execute tool calls
for (const block of response.content) {
  if (block.type === 'tool_use') {
    await executeTool(block.name, block.input);
  }
}
```

---

## 📝 **Part 3: File Editing Algorithms**

### **3.1 Unified Diff Algorithm (Best for LLMs)**

**Why Unified Diff:**
- LLMs trained on GitHub (millions of diffs)
- Forces precise thinking (line numbers, context)
- 3x less lazy coding than free-form
- Industry standard (Git, patch command)

**Implementation:**

```typescript
import { applyPatch, createPatch } from 'diff';

async function applyUnifiedDiff(
  originalContent: string,
  diffContent: string
): Promise<string> {
  // Apply with fuzzy matching (LLMs are imprecise with line numbers)
  const result = applyPatch(originalContent, diffContent, {
    fuzzFactor: 2,  // Allow ±2 lines difference
    autoConvertLineEndings: true
  });
  
  if (!result) {
    throw new Error('Failed to apply diff - context mismatch');
  }
  
  return result;
}

// Generate diff for preview
function showDiff(oldCode: string, newCode: string): string {
  const patch = createPatch('file.ts', oldCode, newCode);
  return patch; // Standard unified diff format
}
```

**Example Diff:**
```diff
--- file.ts
+++ file.ts
@@ -10,5 +10,7 @@
 function calculateTotal(items: Item[]): number {
-  return items.reduce((sum, item) => sum + item.price, 0);
+  const total = items.reduce((sum, item) => sum + item.price, 0);
+  const tax = total * 0.08;
+  return total + tax;
 }
```

---

### **3.2 Search/Replace Blocks (Aider Style)**

**Format:**
```
<<<<<<< SEARCH
[exact code to find]
=======
[exact code to replace with]
>>>>>>> REPLACE
```

**Parser:**
```typescript
interface SearchReplaceBlock {
  search: string;
  replace: string;
}

function parseSearchReplace(llmOutput: string): SearchReplaceBlock[] {
  const blocks: SearchReplaceBlock[] = [];
  const regex = /<<<<<<< SEARCH\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> REPLACE/g;
  
  let match;
  while ((match = regex.exec(llmOutput)) !== null) {
    blocks.push({
      search: match[1],
      replace: match[2]
    });
  }
  
  return blocks;
}

// Apply search/replace
function applySearchReplace(
  content: string,
  blocks: SearchReplaceBlock[]
): string {
  let result = content;
  
  for (const block of blocks) {
    // Exact match required
    if (!result.includes(block.search)) {
      throw new Error(`Cannot find: ${block.search.substring(0, 50)}...`);
    }
    
    result = result.replace(block.search, block.replace);
  }
  
  return result;
}
```

---

### **3.3 Full-File Rewrite (Cursor Fast Apply)**

**When to use:**
- Small files (<200 lines)
- Complete rewrites
- New files

**Two-Stage Process (Cursor's Innovation):**

```typescript
// Stage 1: Sketch (High-level LLM)
async function generateSketch(instruction: string, currentCode: string): Promise<string> {
  const response = await claude.complete({
    model: 'claude-3-5-sonnet',
    prompt: `
      Current code:
      \`\`\`
      ${currentCode}
      \`\`\`
      
      Change: ${instruction}
      
      Generate the modified code. Focus on logic, not perfect formatting.
    `
  });
  
  return response.content;
}

// Stage 2: Apply Model (Specialized for integration)
async function applySketch(
  currentCode: string,
  sketch: string,
  context: FileContext
): Promise<string> {
  const response = await applyModel.complete({
    model: 'cursor-apply-model',  // Custom trained model
    prompt: `
      Original code:
      \`\`\`
      ${currentCode}
      \`\`\`
      
      Sketch (may have imperfections):
      \`\`\`
      ${sketch}
      \`\`\`
      
      Context (imports, dependencies):
      ${JSON.stringify(context)}
      
      Integrate the sketch into the original code. Fix:
      - Import statements
      - Indentation
      - Type errors
      - Structural issues
    `
  });
  
  return response.content;
}
```

**Why this works:**
- Main LLM focuses on logic (what it's good at)
- Apply model focuses on integration (what it's trained for)
- Separates concerns → better results

---

### **3.4 Order-Invariant Multi-Diff Apply (Cline's Innovation)**

**Problem:** LLMs return diffs out of order despite instructions

**Solution:**
```typescript
function applyMultipleDiffs(
  content: string,
  diffs: Diff[]
): string {
  // Sort diffs by line number (descending)
  // Apply from bottom to top so line numbers stay valid
  const sorted = diffs.sort((a, b) => b.startLine - a.startLine);
  
  let result = content;
  for (const diff of sorted) {
    result = applyDiff(result, diff);
  }
  
  return result;
}
```

**Impact:** 10%+ improvement in success rates across all models

---

## 🧪 **Part 4: Building & Testing Systems**

### **4.1 Browser-Based Testing (Playwright)**

**Implementation:**

```typescript
import { chromium, Page } from 'playwright';

class BrowserTester {
  private page: Page | null = null;
  
  async init() {
    const browser = await chromium.launch({
      headless: false,  // Show browser for debugging
      slowMo: 100       // Slow down actions for visibility
    });
    this.page = await browser.newPage({
      recordVideo: { dir: './test-videos/' },
      viewport: { width: 1280, height: 720 }
    });
  }
  
  async testUserJourney(steps: TestStep[]): Promise<TestResult> {
    const results: StepResult[] = [];
    
    for (const step of steps) {
      const screenshot = `step-${step.name}.png`;
      
      try {
        await this.executeStep(step);
        await this.page!.screenshot({ path: screenshot });
        
        results.push({
          step: step.name,
          passed: true,
          screenshot
        });
      } catch (error) {
        await this.page!.screenshot({ path: screenshot });
        
        // AI analyzes failure
        const fix = await this.analyzeFailure(step, screenshot, error);
        
        // Apply fix
        await this.applyFix(fix);
        
        // Retry
        await this.executeStep(step);
        
        results.push({
          step: step.name,
          passed: true,
          fixApplied: fix,
          screenshot
        });
      }
    }
    
    return { results };
  }
  
  private async executeStep(step: TestStep) {
    switch (step.action) {
      case 'navigate':
        await this.page!.goto(step.url!);
        break;
      
      case 'click':
        await this.page!.click(step.selector!);
        break;
      
      case 'type':
        await this.page!.fill(step.selector!, step.text!);
        break;
      
      case 'assert':
        await this.page!.waitForSelector(step.selector!);
        break;
    }
  }
  
  private async analyzeFailure(
    step: TestStep,
    screenshot: string,
    error: Error
  ): Promise<CodeFix> {
    // Read screenshot
    const imageBuffer = await fs.readFile(screenshot);
    const base64Image = imageBuffer.toString('base64');
    
    // AI vision analysis
    const response = await claude.complete({
      model: 'claude-3-5-sonnet',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: base64Image
            }
          },
          {
            type: 'text',
            text: `
              Test step failed: ${step.name}
              Action: ${step.action}
              Selector: ${step.selector}
              Error: ${error.message}
              
              Analyze the screenshot and suggest a code fix.
            `
          }
        ]
      }]
    });
    
    return parseFix(response.content);
  }
}
```

---

### **4.2 Self-Correction Loop**

```typescript
async function buildWithSelfCorrection(
  userRequest: string,
  maxIterations: number = 5
): Promise<BuildResult> {
  
  for (let i = 0; i < maxIterations; i++) {
    // 1. Generate code
    const code = await generateCode(userRequest);
    
    // 2. Apply to files
    await applyChanges(code);
    
    // 3. Run tests
    const testResults = await runTests();
    
    if (testResults.passed) {
      return { success: true, iterations: i + 1 };
    }
    
    // 4. AI analyzes errors
    const errorAnalysis = await analyzeErrors(testResults.errors);
    
    // 5. Generate fix
    userRequest = `
      Previous attempt failed with errors:
      ${testResults.errors.join('\n')}
      
      Analysis: ${errorAnalysis}
      
      Fix the code to resolve these errors.
    `;
  }
  
  return { success: false, error: 'Max iterations reached' };
}
```

---

## 🎯 **Part 5: Mundo Tango Implementation Plan**

### **5.1 Architecture for Mundo Tango**

```
┌────────────────────────────────────────────────────────┐
│              Mundo Tango Frontend                       │
│         (React + TypeScript + Vite)                    │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ↓
┌────────────────────────────────────────────────────────┐
│              Mr Blue Chat Interface                     │
│  (Existing Mr Blue UI + New Vibe Coding Panel)         │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ↓
┌────────────────────────────────────────────────────────┐
│           Multi-Model Consensus Layer                   │
│       (Claude 3.5 Sonnet + GPT-4o)                     │
│           ❌ Gemini removed (prompt issues)             │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ↓
┌────────────────────────────────────────────────────────┐
│           Vibe Coding Agent (#131)                      │
│  - Manager Agent (planning)                            │
│  - Editor Agents (file operations)                     │
│  - Testing Agent (Playwright)                          │
│  - Verifier Agent (quality gate)                       │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ↓
┌────────────────────────────────────────────────────────┐
│              Tool Execution Layer                       │
│  30+ Tools: Files, DB, Deploy, Test, Tango-specific   │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ↓
┌────────────────────────────────────────────────────────┐
│         Backend Services (Node.js + Express)            │
│  - File operations (fs module)                         │
│  - Database (PostgreSQL + Drizzle)                     │
│  - Git operations (Agent #126)                         │
│  - Deployment (Agent #127)                             │
│  - Browser automation (Playwright)                     │
└────────────────────────────────────────────────────────┘
```

---

### **5.2 Phase 1: Foundation (Week 1-2)**

#### **Step 1: Install Dependencies**

```bash
# Install diff library
npm install diff

# Install Playwright (already have)
npm install @playwright/test

# Install Model Context Protocol SDK
npm install @modelcontextprotocol/sdk

# TypeScript types
npm install --save-dev @types/diff
```

#### **Step 2: Create File Editor Service**

```typescript
// server/services/vibeFileEditor.ts
import { applyPatch, createPatch } from 'diff';
import { readFile, writeFile } from 'fs/promises';

export class VibeFileEditor {
  
  // Unified diff approach (like Aider)
  async applyUnifiedDiff(
    filePath: string,
    diff: string
  ): Promise<{ success: boolean; newContent: string }> {
    const original = await readFile(filePath, 'utf-8');
    
    const result = applyPatch(original, diff, {
      fuzzFactor: 2,  // Allow ±2 lines for LLM imprecision
      autoConvertLineEndings: true
    });
    
    if (!result) {
      throw new Error(`Failed to apply diff to ${filePath}`);
    }
    
    await writeFile(filePath, result, 'utf-8');
    
    return {
      success: true,
      newContent: result
    };
  }
  
  // Search/replace approach (backup method)
  async applySearchReplace(
    filePath: string,
    search: string,
    replace: string
  ): Promise<{ success: boolean }> {
    const content = await readFile(filePath, 'utf-8');
    
    if (!content.includes(search)) {
      throw new Error(`Cannot find search string in ${filePath}`);
    }
    
    const newContent = content.replace(search, replace);
    await writeFile(filePath, newContent, 'utf-8');
    
    return { success: true };
  }
  
  // Full rewrite (for small files)
  async rewriteFile(
    filePath: string,
    newContent: string
  ): Promise<{ success: boolean }> {
    await writeFile(filePath, newContent, 'utf-8');
    return { success: true };
  }
}
```

#### **Step 3: Create Tool Orchestrator**

```typescript
// server/services/tools/vibeToolOrchestrator.ts
import { VibeFileEditor } from './vibeFileEditor';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class VibeToolOrchestrator {
  private fileEditor: VibeFileEditor;
  
  constructor() {
    this.fileEditor = new VibeFileEditor();
  }
  
  async executeTool(toolName: string, params: any): Promise<any> {
    switch (toolName) {
      case 'write_file':
        return this.fileEditor.rewriteFile(params.path, params.content);
      
      case 'edit_file':
        return this.fileEditor.applyUnifiedDiff(params.path, params.diff);
      
      case 'run_command':
        return this.runTerminalCommand(params.command);
      
      case 'run_tests':
        return this.runTests(params.pattern);
      
      case 'create_tango_event':
        return this.createTangoEvent(params);
      
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
  
  private async runTerminalCommand(command: string): Promise<{ stdout: string; stderr: string }> {
    const { stdout, stderr } = await execAsync(command);
    return { stdout, stderr };
  }
  
  private async runTests(pattern: string): Promise<{ passed: boolean; output: string }> {
    const { stdout, stderr } = await execAsync(`npm test -- ${pattern}`);
    const passed = !stderr.includes('failed');
    return { passed, output: stdout };
  }
  
  private async createTangoEvent(params: {
    title: string;
    date: Date;
    location: string;
  }): Promise<{ eventId: number }> {
    // Call your existing event creation logic
    // This is a tango-specific tool!
    return { eventId: 123 };
  }
}
```

---

### **5.3 Phase 2: LLM Integration (Week 3-4)**

#### **System Prompt for Mundo Tango**

```typescript
// server/services/vibeLLMService.ts
const MUNDO_TANGO_SYSTEM_PROMPT = `
You are Mundo Tango AI, an expert full-stack developer specializing in the Mundo Tango platform.

PLATFORM CONTEXT:
- Tech Stack: React + TypeScript + Node.js + Express + PostgreSQL + Drizzle ORM
- Architecture: MT Ocean theme (teal/cyan gradients, glassmorphic design)
- Domain: Tango social networking (events, profiles, groups, memories)

CODING RULES:
1. ALWAYS write complete code (never use placeholders like "// rest of code")
2. Follow existing MT Ocean design patterns
3. Use Tailwind CSS for styling with teal/cyan gradients
4. All database operations use Drizzle ORM
5. Follow MB.MD methodology

AVAILABLE TOOLS (via function calling):
- write_file: Create or overwrite files
- edit_file: Apply unified diff to existing files
- run_command: Execute terminal commands
- run_tests: Run test suites
- create_tango_event: Create event (tango-specific)
- join_tango_group: Add user to group (tango-specific)
- post_tango_memory: Create memory post (tango-specific)

OUTPUT FORMAT:
Use function calling to apply changes. Example:
{
  "tool": "write_file",
  "path": "client/src/components/EventCard.tsx",
  "content": "[complete file contents]"
}

For existing files, use unified diff format:
{
  "tool": "edit_file",
  "path": "client/src/pages/Events.tsx",
  "diff": "--- a/client/src/pages/Events.tsx\n+++ b/client/src/pages/Events.tsx\n@@ -10,5 +10,7 @@\n..."
}
`;
```

#### **LLM Service Implementation**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export class VibeLLMService {
  private anthropic: Anthropic;
  private openai: OpenAI;
  
  constructor() {
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  
  async generateCode(
    userRequest: string,
    context: CodeContext
  ): Promise<ToolCall[]> {
    
    const tools = this.getToolDefinitions();
    
    // Use Claude (best for code generation)
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      system: MUNDO_TANGO_SYSTEM_PROMPT,
      tools,
      messages: [
        {
          role: 'user',
          content: this.buildPrompt(userRequest, context)
        }
      ]
    });
    
    // Extract tool calls
    const toolCalls: ToolCall[] = [];
    for (const block of response.content) {
      if (block.type === 'tool_use') {
        toolCalls.push({
          name: block.name,
          params: block.input
        });
      }
    }
    
    return toolCalls;
  }
  
  private buildPrompt(userRequest: string, context: CodeContext): string {
    return `
User Request: ${userRequest}

CONTEXT:
- Current File: ${context.currentFile || 'None'}
- Selected Code: ${context.selectedCode || 'None'}
- Visual Editor Element: ${JSON.stringify(context.visualEditorElement) || 'None'}
- Project Structure:
${context.projectStructure}

Please generate the necessary code changes using the available tools.
    `.trim();
  }
  
  private getToolDefinitions() {
    return [
      {
        name: 'write_file',
        description: 'Create or completely rewrite a file',
        input_schema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path relative to project root' },
            content: { type: 'string', description: 'Complete file contents' }
          },
          required: ['path', 'content']
        }
      },
      {
        name: 'edit_file',
        description: 'Make surgical edits to existing file using unified diff',
        input_schema: {
          type: 'object',
          properties: {
            path: { type: 'string' },
            diff: { type: 'string', description: 'Unified diff format' }
          },
          required: ['path', 'diff']
        }
      },
      {
        name: 'run_command',
        description: 'Execute terminal command',
        input_schema: {
          type: 'object',
          properties: {
            command: { type: 'string' }
          },
          required: ['command']
        }
      },
      {
        name: 'create_tango_event',
        description: 'Create tango event (domain-specific)',
        input_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            date: { type: 'string' },
            location: { type: 'string' }
          },
          required: ['title', 'date', 'location']
        }
      }
      // ... more tools
    ];
  }
}
```

---

### **5.4 Phase 3: API Routes (Week 5-6)**

```typescript
// server/routes/vibeRoutes.ts
import { Router } from 'express';
import { VibeLLMService } from '../services/vibeLLMService';
import { VibeToolOrchestrator } from '../services/tools/vibeToolOrchestrator';

const router = Router();
const llmService = new VibeLLMService();
const toolOrchestrator = new VibeToolOrchestrator();

// Main vibe coding endpoint
router.post('/api/vibe/code', async (req, res) => {
  const { userRequest, context } = req.body;
  
  try {
    // 1. LLM generates tool calls
    const toolCalls = await llmService.generateCode(userRequest, context);
    
    // 2. Execute tools
    const results = [];
    for (const toolCall of toolCalls) {
      const result = await toolOrchestrator.executeTool(toolCall.name, toolCall.params);
      results.push(result);
    }
    
    // 3. Return results
    res.json({
      success: true,
      toolCalls,
      results
    });
    
  } catch (error) {
    console.error('Vibe coding error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stream endpoint for real-time feedback
router.post('/api/vibe/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const { userRequest, context } = req.body;
  
  try {
    // Stream LLM response
    const stream = await llmService.generateCodeStream(userRequest, context);
    
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
    
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

export default router;
```

---

### **5.5 Phase 4: Frontend Integration (Week 7-8)**

```typescript
// client/src/components/mrBlue/VibeCodingPanel.tsx
import { useState } from 'react';
import { apiRequest } from '@lib/queryClient';

export function VibeCodingPanel() {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  async function handleVibeCoding() {
    setLoading(true);
    
    try {
      const context = {
        currentFile: getCurrentFile(),
        selectedCode: getSelectedCode(),
        visualEditorElement: getVisualEditorContext(),
        projectStructure: await getProjectStructure()
      };
      
      const response = await apiRequest('/api/vibe/code', {
        method: 'POST',
        body: {
          userRequest: prompt,
          context
        }
      });
      
      setResults(response.results);
      
      // Show success toast
      toast({
        title: 'Changes Applied',
        description: `${response.toolCalls.length} operations completed successfully`
      });
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="vibe-coding-panel">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe what you want to build..."
        className="w-full h-32 p-4 rounded-lg bg-white/10 dark:bg-black/10"
      />
      
      <button
        onClick={handleVibeCoding}
        disabled={loading}
        className="mt-4 px-6 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg"
      >
        {loading ? 'Building...' : 'Build with AI'}
      </button>
      
      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="font-semibold">Changes Applied:</h3>
          {results.map((result, i) => (
            <div key={i} className="p-4 bg-white/5 rounded-lg">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 **Summary: How to Implement in Mundo Tango**

### **What You Need:**

1. **Open Source Code to Study:**
   - Bolt.diy (full platform): https://github.com/stackblitz-labs/bolt.diy
   - Aider (CLI tool): https://github.com/Aider-AI/aider
   - Continue.dev (IDE extension): https://github.com/continuedev/continue

2. **Key Libraries:**
   ```json
   {
     "diff": "^5.0.0",
     "@playwright/test": "^1.40.0",
     "@anthropic-ai/sdk": "^0.20.0",
     "@modelcontextprotocol/sdk": "^1.0.0"
   }
   ```

3. **Architecture Components:**
   - File editor service (unified diff + search/replace + full rewrite)
   - Tool orchestrator (30+ tools including tango-specific)
   - LLM service (Claude + GPT-4o, remove Gemini)
   - Browser testing (Playwright with AI analysis)
   - API routes (REST + SSE streaming)
   - Frontend panel (integrated into Mr Blue)

4. **Implementation Timeline:**
   - Week 1-2: Foundation (file editor, tools)
   - Week 3-4: LLM integration (prompts, function calling)
   - Week 5-6: API routes (REST + streaming)
   - Week 7-8: Frontend integration (Mr Blue panel)

---

## 📚 **Resources**

**Open Source Repositories:**
- Bolt.diy: https://github.com/stackblitz-labs/bolt.diy
- Aider: https://github.com/Aider-AI/aider
- Continue.dev: https://github.com/continuedev/continue
- WebContainers: https://github.com/stackblitz/webcontainer-core

**Documentation:**
- Unified Diffs: https://aider.chat/docs/unified-diffs.html
- Model Context Protocol: https://modelcontextprotocol.io
- Playwright: https://playwright.dev
- Anthropic Function Calling: https://docs.anthropic.com/claude/docs/tool-use

**Libraries:**
- diff (jsdiff): https://www.npmjs.com/package/diff
- llm-diff-patcher: https://github.com/minovap/llm-diff-patcher
- @modelcontextprotocol/sdk: https://www.npmjs.com/package/@modelcontextprotocol/sdk

---

**Last Updated:** October 23, 2025  
**Status:** Ready for Implementation  
**Next Step:** Begin Phase 1 (Foundation)
