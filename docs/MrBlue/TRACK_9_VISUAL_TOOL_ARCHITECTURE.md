# TRACK 9: Visual Tool Architecture & Technology Research
## Figma-LIKE Visual Editing for Everything (Agents/Pages/Components/Features)

**Date**: October 14, 2025  
**Agent**: #112 (Design-to-Code)  
**Status**: ❌ NOT BUILT - Full Architecture Ready

---

## 🎨 VISUAL TOOL VISION

**"Everything Editable"** - A Figma-LIKE visual editing experience built entirely in Mundo Tango:
- **Agents**: Edit connections, properties, personalities, workflows
- **Pages**: Edit routes, layouts, component structure
- **Components**: Edit props, styles, logic visually
- **Features**: Edit workflows, dependencies, integrations
- **Connections**: Visualize and edit all relationships

**Workflow**: Save → Mr Blue Records → Confirms with User → Chat Clarification → Orchestrates Build

---

## 📊 CURRENT STATUS

### **What Exists** ✅
- ❌ No visual editing tool
- ❌ No React Flow
- ❌ No Rete.js
- ❌ No Konva/Fabric.js
- ✅ ESA Mind exists (but not visually editable)
- ✅ GrapesJS installed (but not used for agent editing)

### **What's Needed** ❌
- [ ] Visual canvas for editing
- [ ] Multi-select + batch operations
- [ ] Drag-and-drop positioning
- [ ] Node-based connections
- [ ] Property panels
- [ ] Save → Confirm → Build workflow

---

## 🔬 TECHNOLOGY RESEARCH

### **Option 1: React Flow** ⭐⭐⭐⭐⭐

**Best For**: Node-based editing (agent networks, dependencies, flows)

**Pros**:
- ✅ Built specifically for React
- ✅ Excellent performance (thousands of nodes)
- ✅ Built-in zoom, pan, mini-map
- ✅ Custom node types (agents, pages, components)
- ✅ Connection validation
- ✅ Layout algorithms (dagre, elk)
- ✅ TypeScript support
- ✅ Active community

**Cons**:
- ❌ Limited canvas manipulation (fixed to nodes/edges)
- ❌ Not ideal for free-form design

**Use Cases in MT**:
- Agent network visualization (114 agents + connections)
- Dependency mapping (agent dependencies, feature dependencies)
- User journey flows (J1-J9 with page sequences)
- Build orchestration visualization

**Example**:
```tsx
import ReactFlow, { 
  Node, Edge, Controls, MiniMap, Background 
} from 'reactflow';

const AgentNetworkEditor = () => {
  const [nodes, setNodes] = useState<Node[]>([
    { 
      id: 'agent-0', 
      type: 'agentNode',
      data: { 
        name: 'Meta Agent', 
        layer: 0, 
        status: 'active' 
      },
      position: { x: 100, y: 100 }
    },
    // ... 114 agents
  ]);
  
  const [edges, setEdges] = useState<Edge[]>([
    { 
      id: 'e1', 
      source: 'agent-0', 
      target: 'agent-1',
      type: 'smoothstep',
      animated: true
    },
    // ... connections
  ]);
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
    >
      <Controls />
      <MiniMap />
      <Background />
    </ReactFlow>
  );
};
```

**Recommendation**: ✅ **PRIMARY CHOICE for agent network editing**

---

### **Option 2: Konva.js** ⭐⭐⭐⭐

**Best For**: Canvas manipulation, free-form visual editing

**Pros**:
- ✅ HTML5 Canvas API
- ✅ High performance rendering
- ✅ Shapes, transformers, drag-and-drop
- ✅ React integration (react-konva)
- ✅ Event handling (click, drag, transform)
- ✅ Export to image/JSON

**Cons**:
- ❌ More low-level (need to build node/edge logic)
- ❌ No built-in layout algorithms

**Use Cases in MT**:
- Visual positioning of agents on canvas
- Free-form diagram editing
- Custom shapes and annotations
- Interactive tutorials (draw on screen)

**Example**:
```tsx
import { Stage, Layer, Rect, Circle, Text, Transformer } from 'react-konva';

const VisualCanvas = () => {
  const [agents, setAgents] = useState([
    { id: 1, x: 50, y: 50, name: 'Meta Agent' },
    // ...
  ]);
  
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        {agents.map(agent => (
          <Group
            key={agent.id}
            x={agent.x}
            y={agent.y}
            draggable
            onDragEnd={(e) => updateAgentPosition(agent.id, e.target.position())}
          >
            <Rect width={100} height={60} fill="blue" />
            <Text text={agent.name} fill="white" />
          </Group>
        ))}
      </Layer>
    </Stage>
  );
};
```

**Recommendation**: ✅ **SECONDARY CHOICE for visual positioning layer**

---

### **Option 3: Rete.js** ⭐⭐⭐⭐

**Best For**: Visual programming, node-based editors

**Pros**:
- ✅ Built for visual programming
- ✅ Input/output sockets
- ✅ Data flow validation
- ✅ Custom node components
- ✅ Plugin ecosystem

**Cons**:
- ❌ Steeper learning curve
- ❌ Less React-friendly (need wrapper)

**Use Cases in MT**:
- Agent workflow editing (inputs → processing → outputs)
- Build pipeline visualization
- Feature dependency graphs

**Recommendation**: ⚠️ **OPTIONAL for advanced workflows**

---

### **Option 4: Fabric.js** ⭐⭐⭐

**Best For**: Interactive object editing, canvas manipulation

**Pros**:
- ✅ Rich object model
- ✅ Interactive selection
- ✅ Object transformations
- ✅ Event system

**Cons**:
- ❌ Not React-native (need wrapper)
- ❌ Canvas-based (accessibility concerns)

**Recommendation**: ❌ **NOT RECOMMENDED (React Flow + Konva better)**

---

### **Option 5: Custom Hybrid Approach** ⭐⭐⭐⭐⭐

**Best For**: MT-specific needs (everything editable)

**Approach**: Combine React Flow (structure) + Konva (visuals) + Custom logic

**Architecture**:
```
┌─────────────────────────────────────────┐
│         Visual Editing Tool             │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │ React Flow  │  │  Property Panel │  │
│  │ (Structure) │  │  (Edit Details) │  │
│  └─────────────┘  └─────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Konva Layer (Optional)      │   │
│  │   (Custom visuals, annotations)  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Mr Blue Build Orchestrator    │   │
│  │  (Save → Confirm → Build)       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Recommendation**: ✅ **FINAL ARCHITECTURE**

---

## 🏗️ VISUAL TOOL ARCHITECTURE

### **Component Hierarchy**

```
VisualEditorApp
├── Canvas (React Flow + Konva)
│   ├── NetworkView (agents, connections)
│   ├── PageView (page structure)
│   ├── ComponentView (component hierarchy)
│   └── FeatureView (feature dependencies)
├── Toolbar
│   ├── SelectionTools (select, multi-select, lasso)
│   ├── EditingTools (add, delete, connect)
│   ├── ViewControls (zoom, pan, fit)
│   └── LayoutTools (auto-layout, align)
├── PropertyPanel
│   ├── AgentProperties (when agent selected)
│   ├── PageProperties (when page selected)
│   ├── ComponentProperties (when component selected)
│   └── FeatureProperties (when feature selected)
├── LayersPanel
│   ├── Agents (114 agents)
│   ├── Pages (119 pages)
│   ├── Components (428 components)
│   └── Features (200+ features)
└── SaveConfirmBuild
    ├── SaveDialog (what changed?)
    ├── MrBlueConfirmation (build plan)
    ├── ChatClarification (if needed)
    └── BuildProgress (real-time updates)
```

---

## 🎯 FEATURE SPECIFICATIONS

### **1. Multi-Select + Batch Operations**

**Selection Modes**:
- **Single Select**: Click on node
- **Multi-Select**: Cmd/Ctrl + Click
- **Box Select**: Drag to select area
- **Lasso Select**: Free-form selection
- **Select All**: Cmd/Ctrl + A
- **Select by Type**: Filter (all agents, all pages, etc.)

**Batch Operations**:
```tsx
const BatchOperations = ({ selectedNodes }) => {
  return (
    <div className="batch-toolbar">
      <button onClick={() => deleteSelected()}>Delete ({selectedNodes.length})</button>
      <button onClick={() => duplicateSelected()}>Duplicate</button>
      <button onClick={() => groupSelected()}>Group</button>
      <button onClick={() => alignSelected('left')}>Align Left</button>
      <button onClick={() => distributeSelected('horizontal')}>Distribute H</button>
      <button onClick={() => changeColorSelected('#FF0000')}>Change Color</button>
      <button onClick={() => exportSelected()}>Export</button>
    </div>
  );
};
```

---

### **2. Drag-and-Drop Everything**

**Draggable Elements**:
- Agents from sidebar → canvas
- Pages from sidebar → canvas
- Components from sidebar → page
- Features from sidebar → canvas
- Files from desktop → canvas (import)

**Drop Targets**:
- Canvas: Create new node
- Existing node: Create connection
- Property panel: Update property
- Trash: Delete node

**Implementation**:
```tsx
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const DraggableAgent = ({ agent }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'agent',
    item: { type: 'agent', id: agent.id, data: agent },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });
  
  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {agent.name}
    </div>
  );
};

const DroppableCanvas = () => {
  const [{ isOver }, drop] = useDrop({
    accept: ['agent', 'page', 'component', 'feature'],
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      createNode(item.type, item.data, offset);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });
  
  return <div ref={drop}>{/* React Flow */}</div>;
};
```

---

### **3. Node-Based Connections**

**Connection Types**:
- Agent → Agent (dependencies, collaboration)
- Agent → Page (agent manages page)
- Page → Component (page uses component)
- Feature → Feature (feature dependencies)
- Agent → Feature (agent implements feature)

**Connection Validation**:
```tsx
const isValidConnection = (source, target) => {
  // Can't connect agent to itself
  if (source.id === target.id) return false;
  
  // Can't create circular dependencies
  if (hasCircularDependency(source, target)) return false;
  
  // Type-specific rules
  if (source.type === 'agent' && target.type === 'component') {
    // Agents can't directly connect to components
    return false;
  }
  
  return true;
};

<ReactFlow
  nodes={nodes}
  edges={edges}
  onConnect={(params) => {
    if (isValidConnection(params.source, params.target)) {
      setEdges((eds) => addEdge(params, eds));
    } else {
      showError('Invalid connection');
    }
  }}
  isValidConnection={isValidConnection}
/>
```

---

### **4. Custom Node Types**

**Agent Node**:
```tsx
const AgentNode = ({ data }) => {
  return (
    <div className="agent-node">
      <Handle type="target" position="top" />
      
      <div className="agent-header">
        <span className="agent-icon">🤖</span>
        <span className="agent-id">#{data.id}</span>
        <span className="agent-status" data-status={data.status} />
      </div>
      
      <div className="agent-body">
        <h4>{data.name}</h4>
        <p className="agent-layer">Layer {data.layer}</p>
      </div>
      
      <div className="agent-footer">
        <button onClick={() => editAgent(data.id)}>⚙️</button>
        <button onClick={() => chatWithAgent(data.id)}>💬</button>
      </div>
      
      <Handle type="source" position="bottom" />
    </div>
  );
};

// Register custom node
const nodeTypes = {
  agentNode: AgentNode,
  pageNode: PageNode,
  componentNode: ComponentNode,
  featureNode: FeatureNode
};
```

**Page Node**:
```tsx
const PageNode = ({ data }) => {
  return (
    <div className="page-node">
      <Handle type="target" position="left" />
      
      <div className="page-preview">
        {/* Mini screenshot or wireframe */}
        <img src={data.screenshot} alt={data.title} />
      </div>
      
      <div className="page-info">
        <h4>{data.title}</h4>
        <p className="page-route">{data.route}</p>
        <div className="page-stats">
          <span>🧩 {data.componentCount} components</span>
          <span>🤖 {data.agentCount} agents</span>
        </div>
      </div>
      
      <Handle type="source" position="right" />
    </div>
  );
};
```

---

### **5. Property Panel (Context-Aware)**

**Agent Properties**:
```tsx
const AgentPropertyPanel = ({ agent }) => {
  return (
    <Panel title={`Agent #${agent.id}: ${agent.name}`}>
      <Section title="Basic Info">
        <Input label="Name" value={agent.name} onChange={...} />
        <Select label="Layer" value={agent.layer} options={layers} />
        <Select label="Domain" value={agent.domain} options={domains} />
        <Toggle label="Active" checked={agent.active} onChange={...} />
      </Section>
      
      <Section title="Personality">
        <Input label="Tone" value={agent.tone} />
        <Textarea label="Greeting" value={agent.greeting} />
        <MultiSelect label="Traits" value={agent.traits} options={traits} />
      </Section>
      
      <Section title="Expert Sources (10)">
        {agent.expertSources.map(expert => (
          <ExpertCard key={expert.id} expert={expert} />
        ))}
        <button onClick={() => addExpert()}>+ Add Expert</button>
      </Section>
      
      <Section title="Connections">
        <ConnectionsList 
          dependencies={agent.dependencies}
          collaborators={agent.collaborators}
          pages={agent.pages}
          features={agent.features}
        />
      </Section>
      
      <Section title="Actions">
        <button onClick={() => testAgent()}>🧪 Test Agent</button>
        <button onClick={() => chatWithAgent()}>💬 Chat</button>
        <button onClick={() => viewLogs()}>📋 View Logs</button>
        <button onClick={() => deleteAgent()}>🗑️ Delete</button>
      </Section>
    </Panel>
  );
};
```

---

### **6. Save → Confirm → Build Workflow**

**Step 1: User Clicks Save**
```tsx
const saveChanges = async () => {
  // 1. Detect what changed
  const changes = detectChanges(originalState, currentState);
  
  // 2. Analyze impact
  const impact = await analyzeImpact(changes);
  
  // 3. Create build plan
  const buildPlan = await createBuildPlan(changes, impact);
  
  // 4. Show confirmation dialog
  showConfirmDialog(buildPlan);
};
```

**Step 2: Mr Blue Records & Confirms**
```tsx
const ConfirmDialog = ({ buildPlan }) => {
  return (
    <Dialog open={true}>
      <DialogTitle>
        Review Changes
        <MrBlueAvatar speaking={true} />
      </DialogTitle>
      
      <DialogContent>
        <MrBlueSpeech>
          I've analyzed your changes. Here's what will happen:
        </MrBlueSpeech>
        
        <ChangesSummary>
          <h3>You modified:</h3>
          <ul>
            {buildPlan.changes.map(change => (
              <li key={change.id}>
                {change.type}: {change.target} ({change.oldValue} → {change.newValue})
              </li>
            ))}
          </ul>
        </ChangesSummary>
        
        <ImpactAnalysis>
          <h3>This will affect:</h3>
          <ul>
            {buildPlan.affectedAgents.map(agent => (
              <li key={agent}>Agent #{agent}</li>
            ))}
          </ul>
        </ImpactAnalysis>
        
        <BuildSteps>
          <h3>Build steps ({buildPlan.steps.length}):</h3>
          <Timeline>
            {buildPlan.steps.map((step, i) => (
              <TimelineItem key={i}>
                <strong>Agent #{step.agentId}</strong>: {step.action}
                <span className="duration">~{step.estimatedTime}s</span>
              </TimelineItem>
            ))}
          </Timeline>
          <p>Total estimated time: {buildPlan.totalDuration}s</p>
        </BuildSteps>
        
        {buildPlan.requiresClarification && (
          <ClarificationNeeded>
            <MrBlueSpeech tone="questioning">
              I need to clarify: {buildPlan.clarificationQuestion}
            </MrBlueSpeech>
            <button onClick={() => openChat()}>Answer in Chat</button>
          </ClarificationNeeded>
        )}
      </DialogContent>
      
      <DialogActions>
        <button onClick={cancel}>Cancel</button>
        <button onClick={openChat}>Ask Mr Blue</button>
        <button onClick={confirmBuild} className="primary">
          Confirm & Build
        </button>
      </DialogActions>
    </Dialog>
  );
};
```

**Step 3: Chat Clarification (if needed)**
```tsx
const ClarificationChat = ({ buildPlan }) => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: buildPlan.clarificationQuestion 
    }
  ]);
  
  const handleResponse = (userResponse) => {
    // Update build plan with clarification
    buildPlan.clarification = userResponse;
    
    // Re-analyze with new info
    const updatedPlan = reanalyzePlan(buildPlan);
    
    // Close chat, show updated confirmation
    closeChat();
    showConfirmDialog(updatedPlan);
  };
  
  return (
    <ChatInterface
      messages={messages}
      onSend={handleResponse}
      avatar={<MrBlueAvatar />}
    />
  );
};
```

**Step 4: Build Orchestration**
```tsx
const executeBuild = async (buildPlan) => {
  // 1. Initialize progress tracking
  const progressTracker = new BuildProgressTracker(buildPlan);
  
  // 2. Execute build steps (parallel where possible)
  for (const step of buildPlan.steps) {
    progressTracker.update(step.id, 'in_progress');
    
    try {
      await executeStep(step);
      progressTracker.update(step.id, 'completed');
    } catch (error) {
      progressTracker.update(step.id, 'failed', error);
      
      // Ask Mr Blue for recovery
      const recovery = await mrBlueRecover(step, error);
      if (recovery.retry) {
        await executeStep(step);
      }
    }
  }
  
  // 3. Completion
  progressTracker.complete();
  showSuccess('Build complete! Your changes are live.');
};

const BuildProgress = ({ buildPlan, tracker }) => {
  return (
    <Dialog open={true}>
      <DialogTitle>
        Building... <MrBlueAvatar working={true} />
      </DialogTitle>
      
      <DialogContent>
        <ProgressBar 
          value={tracker.percentComplete} 
          max={100} 
        />
        
        <StepsList>
          {buildPlan.steps.map(step => (
            <StepItem key={step.id} status={tracker.getStatus(step.id)}>
              <StatusIcon status={tracker.getStatus(step.id)} />
              <span>Agent #{step.agentId}: {step.action}</span>
              {tracker.getStatus(step.id) === 'failed' && (
                <ErrorMessage>{tracker.getError(step.id)}</ErrorMessage>
              )}
            </StepItem>
          ))}
        </StepsList>
        
        <LiveLog>
          {tracker.logs.map((log, i) => (
            <LogEntry key={i} level={log.level}>
              [{log.timestamp}] {log.message}
            </LogEntry>
          ))}
        </LiveLog>
      </DialogContent>
    </Dialog>
  );
};
```

---

## 📋 IMPLEMENTATION ROADMAP

### **Phase 1: Foundation** (Week 1)
- [ ] Install React Flow (`npm install reactflow`)
- [ ] Install react-konva (`npm install react-konva konva`)
- [ ] Create VisualEditor page component
- [ ] Set up basic canvas (React Flow)
- [ ] Create custom node types (Agent, Page, Component, Feature)
- [ ] Implement drag-and-drop from sidebar

### **Phase 2: Editing Features** (Week 1-2)
- [ ] Multi-select functionality
- [ ] Batch operations toolbar
- [ ] Connection creation/validation
- [ ] Property panel (context-aware)
- [ ] Undo/redo system
- [ ] Auto-layout algorithms

### **Phase 3: Data Integration** (Week 2)
- [ ] Load agents from esa.md
- [ ] Load pages from registry
- [ ] Load components from codebase scan
- [ ] Load features from mapping
- [ ] Real-time sync with backend

### **Phase 4: Save-Confirm-Build Workflow** (Week 3)
- [ ] Change detection system
- [ ] Impact analysis
- [ ] Build plan generation
- [ ] Mr Blue confirmation dialog
- [ ] Chat clarification integration
- [ ] Build orchestration (Agent #79)
- [ ] Real-time progress monitoring

### **Phase 5: ESA Mind Integration** (Week 3)
- [ ] Make ESA Mind visually editable
- [ ] Agent editing (inline property editing)
- [ ] Connection editing (add/remove dependencies)
- [ ] Agent creation (drag from template)
- [ ] Export to esa.md

---

## ✅ SUCCESS CRITERIA

**Visual Tool Complete**:
- [ ] Everything editable (agents, pages, components, features)
- [ ] Multi-select + batch operations working
- [ ] Drag-and-drop from sidebar to canvas
- [ ] Node-based connections with validation
- [ ] Context-aware property panel
- [ ] Save → Confirm → Build workflow functional
- [ ] Mr Blue chat clarification integrated
- [ ] Real-time build progress monitoring
- [ ] ESA Mind visually editable
- [ ] Export to esa.md working

**User Experience**:
- [ ] Intuitive (Figma-like feel)
- [ ] Fast (60fps animations)
- [ ] Responsive (works on all screen sizes)
- [ ] Accessible (keyboard navigation, screen readers)

**Technical**:
- [ ] TypeScript (100% typed)
- [ ] Performance (handles 1000+ nodes)
- [ ] State management (React Query + Zustand)
- [ ] Persistence (auto-save every 30s)

---

**Status**: 🎯 **ARCHITECTURE COMPLETE**  
**Technology**: React Flow + Konva (hybrid approach)  
**Build Time**: 3 weeks  
**Confidence**: VERY HIGH - Clear path to Figma-LIKE experience! 🎨🚀
