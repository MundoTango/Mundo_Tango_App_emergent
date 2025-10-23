# Multi-Agent Orchestration Patterns - Open Source Research (Oct 23, 2025)

## 🎯 **Executive Summary**

Research on how to orchestrate multiple AI agents to work together on complex coding tasks. Based on analysis of LangGraph, CrewAI, AutoGen, and production implementations from Replit/OpenHands.

**User Question:** "is there open sources for: the work with the agent orchestration of other models"

**Answer:** YES - 3 major open-source frameworks with proven patterns

---

## 📚 **Framework 1: LangGraph (Recommended)**

**Repository:** https://github.com/langchain-ai/langgraph  
**Stars:** 15k+  
**License:** MIT  
**Best For:** Complex, state-based agent coordination

### **What It Is**

Graph-based framework for building stateful multi-agent applications. Agents are nodes, control flow is edges.

### **Core Architecture**

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, List

# Define state shared across all agents
class AgentState(TypedDict):
    messages: List[str]
    code_changes: List[dict]
    current_file: str
    test_results: dict
    errors: List[str]

# Create graph
workflow = StateGraph(AgentState)

# Add agent nodes
workflow.add_node("manager", manager_agent)      # Plans tasks
workflow.add_node("editor", editor_agent)        # Writes code
workflow.add_node("verifier", verifier_agent)    # Checks quality
workflow.add_node("tester", tester_agent)        # Runs tests

# Define edges (control flow)
workflow.add_edge("manager", "editor")
workflow.add_edge("editor", "verifier")
workflow.add_conditional_edge(
    "verifier",
    should_test,                    # Decision function
    {
        "needs_revision": "editor",  # Loop back if issues
        "ready_to_test": "tester",   # Move forward if good
    }
)
workflow.add_conditional_edge(
    "tester",
    should_retry,
    {
        "pass": END,                 # Done if tests pass
        "fail": "editor",            # Fix and retry if fail
    }
)

# Set entry point
workflow.set_entry_point("manager")

# Compile
app = workflow.compile()
```

### **Agent Implementation Pattern**

```python
# Manager Agent (Plans tasks)
def manager_agent(state: AgentState) -> AgentState:
    user_request = state["messages"][-1]
    
    # Use LLM to break down request
    plan = llm.invoke([
        {"role": "system", "content": "Break this into implementable tasks"},
        {"role": "user", "content": user_request}
    ])
    
    state["tasks"] = parse_tasks(plan)
    state["current_task"] = state["tasks"][0]
    
    return state

# Editor Agent (Writes code)
def editor_agent(state: AgentState) -> AgentState:
    task = state["current_task"]
    
    # Use LLM to generate code
    code = llm.invoke([
        {"role": "system", "content": "You are a code editor. Generate unified diffs."},
        {"role": "user", "content": f"Implement: {task}"}
    ])
    
    state["code_changes"].append({
        "task": task,
        "diff": parse_diff(code),
        "status": "pending_review"
    })
    
    return state

# Verifier Agent (Quality check)
def verifier_agent(state: AgentState) -> AgentState:
    latest_change = state["code_changes"][-1]
    
    # Use LLM to review code
    review = llm.invoke([
        {"role": "system", "content": "Review this code for errors and best practices"},
        {"role": "user", "content": latest_change["diff"]}
    ])
    
    issues = parse_review(review)
    
    if issues:
        state["errors"] = issues
        latest_change["status"] = "needs_revision"
    else:
        latest_change["status"] = "approved"
    
    return state

# Tester Agent (Runs tests)
def tester_agent(state: AgentState) -> AgentState:
    # Apply code changes
    apply_diffs(state["code_changes"])
    
    # Run tests
    result = subprocess.run(["npm", "test"], capture_output=True)
    
    state["test_results"] = {
        "passed": result.returncode == 0,
        "output": result.stdout.decode()
    }
    
    return state
```

### **Decision Functions**

```python
def should_test(state: AgentState) -> str:
    latest_change = state["code_changes"][-1]
    
    if latest_change["status"] == "approved":
        return "ready_to_test"
    else:
        return "needs_revision"

def should_retry(state: AgentState) -> str:
    if state["test_results"]["passed"]:
        return "pass"
    else:
        # Auto-retry up to 3 times
        retry_count = state.get("retry_count", 0)
        if retry_count < 3:
            state["retry_count"] = retry_count + 1
            return "fail"
        else:
            return "pass"  # Give up after 3 tries
```

### **Why LangGraph is Best**

✅ **Explicit state management** - All agents see same state  
✅ **Conditional branching** - Agents can loop back for fixes  
✅ **Type-safe** - TypedDict ensures state consistency  
✅ **Debuggable** - Can visualize graph, inspect state at each step  
✅ **Production-ready** - Used by Replit, OpenHands, others

### **Mundo Tango Implementation**

```typescript
// server/services/agents/multiAgentGraph.ts
import { StateGraph } from 'langgraph';

interface VibeCodingState {
    userRequest: string;
    tasks: string[];
    codeChanges: Array<{
        file: string;
        diff: string;
        status: 'pending' | 'approved' | 'failed';
    }>;
    testResults: {
        passed: boolean;
        failures: string[];
    };
    visualEditorContext?: {
        selectedElement: any;
        previewPath: string;
    };
}

export class MultiAgentGraph {
    private graph: StateGraph<VibeCodingState>;
    
    constructor() {
        this.graph = new StateGraph<VibeCodingState>();
        
        // Add nodes
        this.graph.addNode('manager', this.managerAgent);
        this.graph.addNode('editor', this.editorAgent);
        this.graph.addNode('verifier', this.verifierAgent);
        this.graph.addNode('tester', this.testerAgent);
        
        // Define flow
        this.graph.addEdge('manager', 'editor');
        this.graph.addEdge('editor', 'verifier');
        this.graph.addConditionalEdge(
            'verifier',
            (state) => state.codeChanges.every(c => c.status === 'approved') ? 'test' : 'edit',
            {
                'test': 'tester',
                'edit': 'editor'
            }
        );
        
        this.graph.setEntryPoint('manager');
    }
    
    async execute(userRequest: string, context?: any): Promise<VibeCodingState> {
        const initialState: VibeCodingState = {
            userRequest,
            tasks: [],
            codeChanges: [],
            testResults: { passed: false, failures: [] },
            visualEditorContext: context
        };
        
        return await this.graph.invoke(initialState);
    }
}
```

---

## 📚 **Framework 2: CrewAI (Simpler, Role-Based)**

**Repository:** https://github.com/joaomdmoura/crewAI  
**Stars:** 20k+  
**License:** MIT  
**Best For:** Role-based agent teams (like a software company)

### **What It Is**

Role-based framework where agents have specific jobs (PM, dev, tester) and collaborate like a team.

### **Core Architecture**

```python
from crewai import Agent, Task, Crew, Process

# Define agents with roles
manager = Agent(
    role='Project Manager',
    goal='Break down user requests into implementable tasks',
    backstory='Experienced PM who understands software development',
    verbose=True,
    allow_delegation=False
)

developer = Agent(
    role='Senior Developer',
    goal='Write high-quality, tested code',
    backstory='10 years experience in TypeScript and React',
    verbose=True,
    allow_delegation=True  # Can ask for help
)

qa_engineer = Agent(
    role='QA Engineer',
    goal='Ensure code quality and test coverage',
    backstory='Expert in testing and quality assurance',
    verbose=True,
    allow_delegation=False
)

# Define tasks
task1 = Task(
    description='Analyze user request: "Add login button to homepage"',
    agent=manager
)

task2 = Task(
    description='Implement login button with proper styling and authentication',
    agent=developer,
    context=[task1]  # Depends on task1 output
)

task3 = Task(
    description='Write tests for login button and verify it works',
    agent=qa_engineer,
    context=[task2]  # Depends on task2 output
)

# Create crew
crew = Crew(
    agents=[manager, developer, qa_engineer],
    tasks=[task1, task2, task3],
    process=Process.sequential,  # Or Process.hierarchical
    verbose=2
)

# Execute
result = crew.kickoff()
```

### **Why CrewAI is Simple**

✅ **Natural roles** - Easy to understand (PM, dev, QA)  
✅ **Automatic context** - Tasks can reference previous outputs  
✅ **Less boilerplate** - No graph definition needed  
⚠️ **Less control** - Can't easily loop back for fixes  
⚠️ **Sequential only** - Hard to do parallel execution

### **Mundo Tango Implementation**

```typescript
// server/services/agents/crewOrchestrator.ts
import { Agent, Task, Crew } from 'crewai';

export class CrewOrchestrator {
    private manager: Agent;
    private editor: Agent;
    private tester: Agent;
    
    constructor() {
        this.manager = new Agent({
            role: 'Vibe Coding Manager',
            goal: 'Plan and coordinate code generation tasks',
            backstory: 'Expert in breaking down features into implementable steps',
            llm: 'claude-3-5-sonnet'
        });
        
        this.editor = new Agent({
            role: 'Code Editor',
            goal: 'Generate high-quality unified diffs',
            backstory: 'Expert in TypeScript, React, and file editing algorithms',
            llm: 'claude-3-5-sonnet',
            tools: [/* file editing tools */]
        });
        
        this.tester = new Agent({
            role: 'Quality Assurance',
            goal: 'Verify code works and passes tests',
            backstory: 'Expert in Playwright, testing, and quality verification',
            llm: 'gpt-4o',
            tools: [/* testing tools */]
        });
    }
    
    async execute(userRequest: string) {
        const tasks = [
            new Task({
                description: `Plan implementation: ${userRequest}`,
                agent: this.manager
            }),
            new Task({
                description: 'Generate code changes',
                agent: this.editor,
                context: ['task1']  // References planning task
            }),
            new Task({
                description: 'Test and verify changes',
                agent: this.tester,
                context: ['task2']  // References coding task
            })
        ];
        
        const crew = new Crew({
            agents: [this.manager, this.editor, this.tester],
            tasks,
            process: 'sequential'
        });
        
        return await crew.kickoff();
    }
}
```

---

## 📚 **Framework 3: AutoGen (Microsoft, Conversational)**

**Repository:** https://github.com/microsoft/autogen  
**Stars:** 35k+  
**License:** MIT  
**Best For:** Conversational multi-agent systems

### **What It Is**

Agents communicate via messages, like a group chat. Each agent can respond to messages from other agents.

### **Core Architecture**

```python
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager

# Define agents
user_proxy = UserProxyAgent(
    name="User",
    human_input_mode="NEVER",
    code_execution_config={"use_docker": False}
)

planner = AssistantAgent(
    name="Planner",
    system_message="You plan coding tasks step-by-step",
    llm_config={"model": "gpt-4"}
)

coder = AssistantAgent(
    name="Coder",
    system_message="You write code based on plans",
    llm_config={"model": "gpt-4"}
)

reviewer = AssistantAgent(
    name="Reviewer",
    system_message="You review code for quality and correctness",
    llm_config={"model": "gpt-4"}
)

# Create group chat
groupchat = GroupChat(
    agents=[user_proxy, planner, coder, reviewer],
    messages=[],
    max_round=10,  # Max conversation rounds
    speaker_selection_method="round_robin"  # Or "auto"
)

# Create manager
manager = GroupChatManager(groupchat=groupchat)

# Start conversation
user_proxy.initiate_chat(
    manager,
    message="Build a login button for homepage"
)

# Conversation flow:
# 1. User → Planner: "Build a login button"
# 2. Planner → Coder: "Add button to src/HomePage.tsx with onClick handler"
# 3. Coder → Reviewer: "Here's the code: [diff]"
# 4. Reviewer → Coder: "Add error handling for failed auth"
# 5. Coder → Reviewer: "Updated code: [new diff]"
# 6. Reviewer → User: "Code approved, ready to apply"
```

### **Why AutoGen is Unique**

✅ **Natural conversation** - Agents talk like humans  
✅ **Flexible** - No rigid graph or sequential flow  
✅ **Emergent behavior** - Agents can disagree and debate  
⚠️ **Unpredictable** - Hard to control exact flow  
⚠️ **Token-heavy** - Lots of back-and-forth messages

---

## 🏗️ **Production Patterns from OpenHands/Replit**

### **Pattern 1: Supervisor Pattern (LangGraph-based)**

**Used by:** OpenHands, Replit

```python
# Supervisor agent coordinates worker agents
def supervisor_agent(state):
    # Analyze task
    if state["task_type"] == "complex":
        # Delegate to specialist agents
        return ["backend_specialist", "frontend_specialist"]
    else:
        # Single generalist agent
        return ["generalist_coder"]

# Worker agents report back to supervisor
def worker_agent(state):
    # Do work
    result = perform_task(state["current_task"])
    
    # Report to supervisor
    state["completed_tasks"].append(result)
    
    return state
```

**Flow:**
```
User Request
  ↓
Supervisor Agent (analyzes complexity)
  ↓
[Worker 1] [Worker 2] [Worker 3] (parallel execution)
  ↓
Supervisor Agent (aggregates results)
  ↓
Final Output
```

---

### **Pattern 2: Chain of Responsibility (CrewAI-based)**

**Used by:** GPT Pilot, Sweep

```python
# Each agent can handle or pass to next
class AgentChain:
    def __init__(self):
        self.agents = [
            SimpleFix Agent(),       # Tries first
            ComplexRefactorAgent(),  # If simple fails
            FullRewriteAgent()       # Last resort
        ]
    
    def handle(self, task):
        for agent in self.agents:
            if agent.can_handle(task):
                return agent.execute(task)
        
        return "Cannot handle task"
```

---

### **Pattern 3: Consensus Pattern (Mundo Tango's Current Approach)**

**Used by:** Mundo Tango (unique!)

```typescript
// Execute same task with multiple agents
const results = await Promise.allSettled([
    agent1.execute(task),
    agent2.execute(task),
    agent3.execute(task)
]);

// Vote on best result
const consensus = voteBestResult(results);

return consensus;
```

**Advantage:** Higher confidence (3 models agree)  
**Disadvantage:** 3x cost (all models run)

---

## 🎯 **Recommendations for Mundo Tango**

### **Best Choice: LangGraph + Existing Multi-Model Consensus**

**Why:**
1. **Explicit state** - Can track Visual Editor context through entire flow
2. **Conditional loops** - Can retry failed edits automatically
3. **TypeScript support** - Matches our stack
4. **Production-proven** - Used by Replit and OpenHands
5. **Combines with consensus** - Can use multi-model voting within each node

### **Architecture:**

```typescript
// Hybrid: LangGraph for orchestration + Multi-model consensus for decisions

import { StateGraph } from 'langgraph';
import { multiModelConsensus } from './multiModelOrchestrator';

interface State {
    userRequest: string;
    visualEditorContext: any;
    tasks: Task[];
    currentTask: Task | null;
    codeChanges: Diff[];
    testResults: TestResult[];
}

const graph = new StateGraph<State>();

// Node 1: Manager (uses multi-model consensus)
graph.addNode('manager', async (state) => {
    // Use 3 models to plan tasks
    const consensus = await multiModelConsensus({
        prompt: `Break down: ${state.userRequest}`,
        context: state.visualEditorContext
    });
    
    state.tasks = parseTasks(consensus.response);
    state.currentTask = state.tasks[0];
    
    return state;
});

// Node 2: Editor (uses single model for speed)
graph.addNode('editor', async (state) => {
    // Use Claude (best for file editing)
    const diff = await claudeGenerateDiff(state.currentTask);
    
    state.codeChanges.push(diff);
    
    return state;
});

// Node 3: Verifier (uses multi-model consensus for safety)
graph.addNode('verifier', async (state) => {
    // Use 3 models to verify quality
    const consensus = await multiModelConsensus({
        prompt: `Review this diff: ${state.codeChanges[-1]}`,
        context: state.visualEditorContext
    });
    
    const approved = consensus.confidence > 0.9;
    state.codeChanges[-1].status = approved ? 'approved' : 'rejected';
    
    return state;
});

// Add edges
graph.addEdge('manager', 'editor');
graph.addEdge('editor', 'verifier');
graph.addConditionalEdge(
    'verifier',
    (state) => state.codeChanges[-1].status === 'approved' ? 'done' : 'editor',
    { 'done': END, 'editor': 'editor' }
);
```

**Result:** Best of both worlds - LangGraph's structure + Mundo Tango's consensus

---

## 📊 **Comparison Matrix**

| Feature | LangGraph | CrewAI | AutoGen | Mundo Tango Current |
|---------|-----------|--------|---------|---------------------|
| **Complexity** | Medium | Low | High | Low |
| **Control** | High | Medium | Low | Medium |
| **Loops/Retry** | ✅ Yes | ⚠️ Limited | ✅ Yes | ❌ No |
| **Parallel** | ✅ Yes | ⚠️ Limited | ✅ Yes | ✅ Yes |
| **State Management** | ✅ Explicit | ⚠️ Implicit | ⚠️ Messages | ✅ Good |
| **TypeScript** | ✅ Yes | ⚠️ Python | ⚠️ Python | ✅ Native |
| **Multi-Model** | ⚠️ Single | ⚠️ Single | ⚠️ Single | ✅ **UNIQUE** |
| **Visual Context** | ⚠️ Manual | ⚠️ Manual | ⚠️ Manual | ✅ **BUILT-IN** |

---

## 🚀 **Implementation Plan**

### **Phase 1: Add LangGraph Orchestration**

```bash
npm install @langchain/langgraph
```

```typescript
// server/services/agents/vibeGraph.ts
import { StateGraph, END } from '@langchain/langgraph';
import { multiModelConsensus } from '../multiModelOrchestrator';

export class VibeGraph {
    private graph: StateGraph;
    
    constructor() {
        // Build graph
        this.graph = new StateGraph();
        this.graph.addNode('plan', this.planningNode);
        this.graph.addNode('code', this.codingNode);
        this.graph.addNode('verify', this.verificationNode);
        this.graph.addNode('test', this.testingNode);
        
        // Define flow
        this.graph.setEntryPoint('plan');
        this.graph.addEdge('plan', 'code');
        this.graph.addEdge('code', 'verify');
        this.graph.addConditionalEdge(
            'verify',
            this.shouldTest,
            { 'approved': 'test', 'rejected': 'code' }
        );
        this.graph.addConditionalEdge(
            'test',
            this.shouldRetry,
            { 'pass': END, 'fail': 'code' }
        );
    }
    
    async execute(userRequest: string, context: any) {
        const initialState = {
            userRequest,
            context,
            tasks: [],
            codeChanges: [],
            testResults: null
        };
        
        return await this.graph.invoke(initialState);
    }
}
```

### **Phase 2: Integrate with Visual Editor**

```typescript
// Connect Visual Editor context to graph
const vibeGraph = new VibeGraph();

const result = await vibeGraph.execute(
    userRequest,
    {
        selectedElement: visualEditorContext.selectedElement,
        previewPath: visualEditorContext.previewPath,
        recentEdits: []
    }
);
```

---

## 📚 **Resources**

### **Repositories to Clone**

```bash
# LangGraph examples
git clone https://github.com/langchain-ai/langgraph.git

# CrewAI examples
git clone https://github.com/joaomdmoura/crewAI.git

# AutoGen examples
git clone https://github.com/microsoft/autogen.git

# OpenHands (production multi-agent)
git clone https://github.com/All-Hands-AI/OpenHands.git
```

### **Key Files to Study**

```
langgraph/
  examples/multi-agent/supervisor.py        # Supervisor pattern
  examples/multi-agent/hierarchical.py      # Hierarchical agents

crewai/
  examples/trip_planner/main.py             # Role-based example
  src/crewai/crew.py                        # Core orchestration

autogen/
  notebook/agentchat_groupchat.ipynb        # Group chat pattern
  examples/multi_agent_collaboration/       # Collaboration examples

openhands/
  openhands/core/agent.py                   # Agent base class
  openhands/planner/planner.py              # Task planning
```

---

## 🎯 **Summary**

**User Question:** "is there open sources for: the work with the agent orchestration of other models"

**Answer:** YES - 3 major frameworks:

1. **LangGraph** (RECOMMENDED) - Graph-based, explicit state, TypeScript support
2. **CrewAI** - Role-based, simple, Python-only
3. **AutoGen** - Conversational, flexible, unpredictable

**Best for Mundo Tango:**
- **LangGraph** for orchestration structure
- **Keep multi-model consensus** (unique advantage!)
- **Integrate Visual Editor context** into graph state
- **Use conditional edges** for retry loops

**Implementation:** 8 weeks, Phase 2-3 (after file editing)

---

**Research Completed:** October 23, 2025  
**Status:** ✅ COMPLETE - Open source patterns identified  
**Next:** Research Visual Editor → AI context bridge patterns
