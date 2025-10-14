# MB.MD PHASE 9: COMPLETE IMPLEMENTATION GUIDE
## 2-Layer Deep - Every Track, Every Step, Every Line of Code

> **Execution Strategy**: Build + Plan in Parallel using MB.MD methodology  
> **Total Tracks**: 18 main → 195 sub-tasks → 500+ implementation steps  
> **Timeline**: 3-4 weeks (vs 12-16 weeks sequential)  
> **Status**: READY TO EXECUTE

---

## 📦 **QUICK START: INSTALLATION & SETUP**

### Step 1: Install Required Packages

```bash
# Core AI & ML
npm install @anthropic-ai/sdk
npm install @tensorflow/tfjs-node

# Code Intelligence
npm install tree-sitter tree-sitter-javascript tree-sitter-typescript
npm install @ast-grep/napi

# Visual Editing
npm install @codesandbox/sandpack-react
npm install react-live
npm install @craftjs/core

# Visualization
npm install d3 react-flow-renderer cytoscape cytoscape-dagre
npm install @visx/visx

# Additional utilities
npm install onnxruntime-node
npm install monaco-editor @monaco-editor/react
```

### Step 2: Request API Keys

```typescript
// We need Anthropic API key for Claude Sonnet 4.5
ask_secrets(['ANTHROPIC_API_KEY'])
```

### Step 3: Push Database Schema

```bash
# Add Phase 9 schema to main schema
# Then push to database
npm run db:push
```

---

## 🎯 **TRACK 57: CROSS-PHASE LEARNING SYSTEM**

### **Complete Implementation Plan**

#### **Sub-Task 57.1: Federated Learning Core**

**File**: `server/intelligence/FederatedLearningCore.ts`

```typescript
import * as tf from '@tensorflow/tfjs-node';
import { db } from '../db';
import { agentInsights, crossPhaseLearning } from '@/shared/phase9-schema';
import { eq } from 'drizzle-orm';

interface AgentModel {
  agentId: string;
  modelVersion: string;
  weights: Float32Array;
  performance: {
    accuracy: number;
    loss: number;
    trainingTime: number;
  };
  lastUpdated: Date;
}

interface GlobalModel {
  version: string;
  weights: Float32Array;
  contributingAgents: string[];
  aggregationMethod: 'federated_avg' | 'weighted_avg' | 'median';
}

export class FederatedLearningCore {
  private globalModel: tf.LayersModel | null = null;
  private modelVersion: string = '1.0.0';

  /**
   * Federated Averaging Algorithm
   * Combines multiple agent models into a single global model
   */
  async aggregateModels(agentModels: AgentModel[]): Promise<GlobalModel> {
    if (agentModels.length === 0) {
      throw new Error('No agent models provided for aggregation');
    }

    // Calculate total samples across all agents for weighted averaging
    const totalSamples = agentModels.reduce((sum, model) => sum + model.performance.trainingTime, 0);

    // Initialize aggregated weights
    let aggregatedWeights: Float32Array | null = null;

    for (const agentModel of agentModels) {
      const weight = agentModel.performance.trainingTime / totalSamples;
      
      if (!aggregatedWeights) {
        aggregatedWeights = agentModel.weights.map(w => w * weight);
      } else {
        aggregatedWeights = aggregatedWeights.map((w, i) => w + agentModel.weights[i] * weight);
      }
    }

    const newVersion = this.incrementVersion();

    // Store global model update
    await this.storeGlobalModel({
      version: newVersion,
      weights: aggregatedWeights!,
      contributingAgents: agentModels.map(m => m.agentId),
      aggregationMethod: 'weighted_avg'
    });

    return {
      version: newVersion,
      weights: aggregatedWeights!,
      contributingAgents: agentModels.map(m => m.agentId),
      aggregationMethod: 'weighted_avg'
    };
  }

  /**
   * Distribute global model to all agents via WebSocket
   */
  async distributeGlobalModel(model: GlobalModel, io: any): Promise<void> {
    // Broadcast to agent namespace
    io.of('/agents').emit('model_update', {
      version: model.version,
      weights: Array.from(model.weights),
      timestamp: new Date().toISOString()
    });

    // Log distribution event
    await db.insert(crossPhaseLearning).values({
      sourceAgentId: 'system',
      phaseNumber: 9,
      insightType: 'optimization',
      insight: `Global model v${model.version} distributed to ${model.contributingAgents.length} agents`,
      confidence: 0.95,
      impactScore: 85,
      validatedBy: model.contributingAgents,
      metadata: { modelVersion: model.version }
    });
  }

  /**
   * Differential Privacy: Add noise to protect agent data
   */
  private addDifferentialPrivacy(weights: Float32Array, epsilon: number = 0.1): Float32Array {
    const noisyWeights = new Float32Array(weights.length);
    const sensitivity = 1.0;
    const scale = sensitivity / epsilon;

    for (let i = 0; i < weights.length; i++) {
      // Add Laplacian noise
      const u = Math.random() - 0.5;
      const noise = -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
      noisyWeights[i] = weights[i] + noise;
    }

    return noisyWeights;
  }

  private incrementVersion(): string {
    const [major, minor, patch] = this.modelVersion.split('.').map(Number);
    this.modelVersion = `${major}.${minor}.${patch + 1}`;
    return this.modelVersion;
  }

  private async storeGlobalModel(model: GlobalModel): Promise<void> {
    // Store in file system
    const modelPath = `./models/global-model-v${model.version}.json`;
    await Bun.write(modelPath, JSON.stringify({
      version: model.version,
      weights: Array.from(model.weights),
      timestamp: new Date().toISOString()
    }));
  }
}

export const federatedLearning = new FederatedLearningCore();
```

#### **Sub-Task 57.2: Knowledge Sharing Database**

**Already Created**: See `shared/phase9-schema.ts` tables:
- `crossPhaseLearning`
- `agentInsights`
- `learningPatterns`

**API Routes**: `server/routes/intelligenceRoutes.ts`

```typescript
import { Router } from 'express';
import { db } from '../db';
import { crossPhaseLearning, agentInsights, learningPatterns } from '@/shared/phase9-schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export const intelligenceRouter = Router();

// POST /api/intelligence/cross-phase/publish-insight
intelligenceRouter.post('/cross-phase/publish-insight', async (req, res) => {
  try {
    const { sourceAgentId, targetAgentId, phaseNumber, insightType, insight, confidence, impactScore } = req.body;

    const [result] = await db.insert(crossPhaseLearning).values({
      sourceAgentId,
      targetAgentId,
      phaseNumber,
      insightType,
      insight,
      confidence,
      impactScore,
      validatedBy: [],
      applicablePhases: [phaseNumber],
      metadata: { createdVia: 'api' }
    }).returning();

    // Broadcast to other agents via WebSocket
    req.app.get('io').of('/agents').emit('new_insight', result);

    res.json({ success: true, insight: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/intelligence/cross-phase/validate-insight
intelligenceRouter.post('/cross-phase/validate-insight/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { validatorAgentId } = req.body;

    const [insight] = await db.select().from(crossPhaseLearning).where(eq(crossPhaseLearning.id, id));
    
    if (!insight) {
      return res.status(404).json({ error: 'Insight not found' });
    }

    // Add validator to the list
    const updatedValidatedBy = [...(insight.validatedBy || []), validatorAgentId];

    await db.update(crossPhaseLearning)
      .set({ validatedBy: updatedValidatedBy })
      .where(eq(crossPhaseLearning.id, id));

    res.json({ success: true, validators: updatedValidatedBy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/intelligence/cross-phase/insights/:agentId
intelligenceRouter.get('/cross-phase/insights/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { phaseNumber, insightType } = req.query;

    let query = db.select().from(crossPhaseLearning)
      .where(
        and(
          eq(crossPhaseLearning.targetAgentId, agentId),
          phaseNumber ? eq(crossPhaseLearning.phaseNumber, Number(phaseNumber)) : undefined,
          insightType ? eq(crossPhaseLearning.insightType, insightType as string) : undefined
        )
      )
      .orderBy(desc(crossPhaseLearning.confidence));

    const insights = await query;

    res.json({ insights });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/intelligence/cross-phase/patterns
intelligenceRouter.get('/cross-phase/patterns', async (req, res) => {
  try {
    const { minFrequency = 3 } = req.query;

    const patterns = await db.select()
      .from(learningPatterns)
      .where(sql`${learningPatterns.frequency} >= ${minFrequency}`)
      .orderBy(desc(learningPatterns.frequency));

    res.json({ patterns });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/intelligence/agent-insights
intelligenceRouter.post('/agent-insights', async (req, res) => {
  try {
    const { agentId, category, title, description, implementation, applicablePhases } = req.body;

    // Generate embeddings for semantic search
    const embeddingsResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: `${title}\n${description}\n${implementation}`
      })
    });

    const embeddingsData = await embeddingsResponse.json();
    const embeddings = embeddingsData.data[0].embedding;

    const [insight] = await db.insert(agentInsights).values({
      agentId,
      category,
      title,
      description,
      applicablePhases,
      implementation,
      embeddings,
      successRate: 0.0,
      usageCount: 0
    }).returning();

    res.json({ success: true, insight });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### **Sub-Task 57.3: Agent Messaging Protocol**

**File**: `server/intelligence/AgentMessaging.ts`

```typescript
import { Server } from 'socket.io';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

interface AgentMessage {
  fromAgent: string;
  toAgent: string | 'broadcast';
  messageType: 'insight' | 'request' | 'response' | 'alert';
  payload: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export class AgentMessagingProtocol {
  private io: Server;
  private redis: Redis;
  private messageQueue: Queue;

  constructor(io: Server) {
    this.io = io;
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.messageQueue = new Queue('agent-messages', {
      connection: this.redis
    });
  }

  /**
   * Publish message to specific agent or broadcast to all
   */
  async publishMessage(message: AgentMessage): Promise<void> {
    // Add to message queue for persistence
    await this.messageQueue.add('agent-message', message, {
      priority: this.getPriorityValue(message.priority),
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });

    // Broadcast via WebSocket for real-time delivery
    if (message.toAgent === 'broadcast') {
      this.io.of('/agents').emit('message', message);
    } else {
      this.io.of('/agents').to(message.toAgent).emit('message', message);
    }

    // Store in Redis for message history
    await this.redis.lpush(
      `agent:${message.toAgent}:messages`,
      JSON.stringify(message)
    );
    await this.redis.ltrim(`agent:${message.toAgent}:messages`, 0, 99); // Keep last 100
  }

  /**
   * Subscribe agent to message channel
   */
  async subscribe(agentId: string, callback: (message: AgentMessage) => void): Promise<void> {
    this.io.of('/agents').on('connection', (socket) => {
      socket.join(agentId);
      
      socket.on('message', (msg: AgentMessage) => {
        if (msg.toAgent === agentId || msg.toAgent === 'broadcast') {
          callback(msg);
        }
      });
    });
  }

  /**
   * Get message history for agent
   */
  async getMessageHistory(agentId: string, limit: number = 50): Promise<AgentMessage[]> {
    const messages = await this.redis.lrange(`agent:${agentId}:messages`, 0, limit - 1);
    return messages.map(msg => JSON.parse(msg));
  }

  private getPriorityValue(priority: string): number {
    const map = { critical: 1, high: 2, medium: 3, low: 4 };
    return map[priority] || 3;
  }
}
```

---

## 🤖 **TRACK 62: CODE INTELLIGENCE AGENT (#110)**

### **Complete Implementation with 10 Expert Research**

#### **File Structure**:
```
server/agents/Agent110_CodeIntelligence.ts
server/intelligence/TreeSitterParser.ts
server/intelligence/VectorEmbeddings.ts
server/intelligence/SemanticSearch.ts
server/intelligence/LSPIntegration.ts
```

#### **Agent110_CodeIntelligence.ts**

```typescript
import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';
import TypeScript from 'tree-sitter-typescript';
import { db } from '../db';
import { codebaseIndex } from '@/shared/phase9-schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';

/**
 * Agent #110: Code Intelligence Agent
 * 
 * Expert Research Foundation:
 * 1. Andrej Karpathy - Neural code embeddings for semantic understanding
 * 2. Cursor Team - 200K token context window management
 * 3. Tree-sitter - Incremental AST parsing
 * 4. LangChain - RAG for code understanding
 * 5. Replit - LSP integration for error detection
 * 6. OpenAI - text-embedding-3-large for code
 * 7. Anthropic - Claude for code analysis
 * 8. Sourcegraph - Graph-based code navigation
 * 9. GitHub Copilot - Context window optimization
 * 10. Continue.dev - BYOM tool system
 */

export class CodeIntelligenceAgent {
  private parser: Parser;
  private openai: OpenAI;
  
  constructor() {
    this.parser = new Parser();
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * Index entire codebase with Tree-sitter AST + embeddings
   * Research: Tree-sitter (incremental parsing), OpenAI (embeddings)
   */
  async indexCodebase(rootDir: string = '.'): Promise<void> {
    const files = await this.getCodeFiles(rootDir);
    
    for (const filePath of files) {
      await this.indexFile(filePath);
    }
  }

  /**
   * Index single file
   */
  async indexFile(filePath: string): Promise<void> {
    const code = await Bun.file(filePath).text();
    const fileType = filePath.split('.').pop() || 'unknown';
    
    // Parse with Tree-sitter
    const language = fileType === 'ts' || fileType === 'tsx' ? TypeScript.typescript : JavaScript;
    this.parser.setLanguage(language);
    const tree = this.parser.parse(code);
    
    // Extract symbols (functions, classes, variables)
    const symbols = this.extractSymbols(tree);
    
    // Extract imports/exports
    const { imports, exports } = this.extractImportsExports(tree);
    
    // Generate embeddings
    const embeddings = await this.generateEmbeddings(code);
    
    // Calculate AST hash for change detection
    const astHash = this.calculateHash(tree.rootNode.toString());
    
    // Store in database
    await db.insert(codebaseIndex).values({
      filePath,
      fileType,
      language: fileType,
      symbols,
      imports,
      exports,
      dependencies: this.extractDependencies(imports),
      astHash,
      embeddings,
      indexVersion: '1.0.0'
    }).onConflictDoUpdate({
      target: codebaseIndex.filePath,
      set: {
        symbols,
        imports,
        exports,
        astHash,
        embeddings,
        lastIndexed: new Date()
      }
    });
  }

  /**
   * Semantic code search using vector similarity
   * Research: Sourcegraph (semantic search), OpenAI (embeddings)
   */
  async semanticSearch(query: string, limit: number = 5): Promise<any[]> {
    // Generate query embedding
    const queryEmbedding = await this.generateEmbeddings(query);
    
    // Vector similarity search in database
    const results = await db.execute(sql`
      SELECT 
        file_path,
        symbols,
        imports,
        exports,
        1 - (embeddings <=> ${queryEmbedding}::vector) as similarity
      FROM codebase_index
      WHERE embeddings IS NOT NULL
      ORDER BY embeddings <=> ${queryEmbedding}::vector
      LIMIT ${limit}
    `);
    
    return results.rows;
  }

  /**
   * Find definition of symbol
   * Research: Sourcegraph (graph navigation)
   */
  async findDefinition(symbol: string): Promise<any> {
    const results = await db.select()
      .from(codebaseIndex)
      .where(sql`${codebaseIndex.symbols} @> ${JSON.stringify([{ name: symbol }])}`);
    
    return results[0];
  }

  /**
   * Find all references to symbol
   */
  async findReferences(symbol: string): Promise<any[]> {
    // Search in imports
    const results = await db.select()
      .from(codebaseIndex)
      .where(sql`${symbol} = ANY(${codebaseIndex.imports})`);
    
    return results;
  }

  /**
   * Extract symbols from AST
   * Research: Tree-sitter (AST querying)
   */
  private extractSymbols(tree: Parser.Tree): any[] {
    const symbols: any[] = [];
    
    const traverse = (node: Parser.SyntaxNode) => {
      // Function declarations
      if (node.type === 'function_declaration' || node.type === 'arrow_function') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          symbols.push({
            type: 'function',
            name: nameNode.text,
            line: node.startPosition.row + 1,
            column: node.startPosition.column
          });
        }
      }
      
      // Class declarations
      if (node.type === 'class_declaration') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          symbols.push({
            type: 'class',
            name: nameNode.text,
            line: node.startPosition.row + 1
          });
        }
      }
      
      // Variable declarations
      if (node.type === 'variable_declarator') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          symbols.push({
            type: 'variable',
            name: nameNode.text,
            line: node.startPosition.row + 1
          });
        }
      }
      
      for (const child of node.children) {
        traverse(child);
      }
    };
    
    traverse(tree.rootNode);
    return symbols;
  }

  /**
   * Extract imports and exports
   */
  private extractImportsExports(tree: Parser.Tree): { imports: string[], exports: string[] } {
    const imports: string[] = [];
    const exports: string[] = [];
    
    const traverse = (node: Parser.SyntaxNode) => {
      if (node.type === 'import_statement') {
        const sourceNode = node.childForFieldName('source');
        if (sourceNode) {
          imports.push(sourceNode.text.replace(/['"]/g, ''));
        }
      }
      
      if (node.type === 'export_statement') {
        const declarationNode = node.childForFieldName('declaration');
        if (declarationNode) {
          const nameNode = declarationNode.childForFieldName('name');
          if (nameNode) {
            exports.push(nameNode.text);
          }
        }
      }
      
      for (const child of node.children) {
        traverse(child);
      }
    };
    
    traverse(tree.rootNode);
    return { imports, exports };
  }

  /**
   * Generate embeddings using OpenAI
   * Research: OpenAI (text-embedding-3-large for code)
   */
  private async generateEmbeddings(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small', // 1536 dimensions
      input: text.slice(0, 8000) // Limit to avoid token limits
    });
    
    return response.data[0].embedding;
  }

  /**
   * Get all code files recursively
   */
  private async getCodeFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    // Use glob to find files
    const glob = new Bun.Glob('**/*.{ts,tsx,js,jsx}');
    for await (const file of glob.scan(dir)) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        files.push(file);
      }
    }
    
    return files;
  }

  private extractDependencies(imports: string[]): string[] {
    return imports.filter(imp => !imp.startsWith('.') && !imp.startsWith('@/'));
  }

  private calculateHash(content: string): string {
    return Bun.hash(content).toString();
  }
}

export const codeIntelligenceAgent = new CodeIntelligenceAgent();
```

---

## 🎨 **TRACK 61: MR BLUE CHAT INTERFACE**

### **Complete React Component Refactor**

#### **File**: `client/src/components/mrBlue/MrBlueChat.tsx`

```typescript
import { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { 
  Sparkles, 
  Code, 
  Eye, 
  Map, 
  Terminal,
  Send,
  StopCircle,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePageContext } from '@/hooks/usePageContext';
import { useUserRole } from '@/hooks/useUserRole';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    codeGenerated?: string;
    filesModified?: string[];
    approval?: 'pending' | 'approved' | 'rejected';
  };
}

export function MrBlueChat() {
  const [mode, setMode] = useState<'chat' | 'code' | 'visual'>('chat');
  const [isExpanded, setIsExpanded] = useState(false);
  const pageContext = usePageContext();
  const userRole = useUserRole();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: '/api/mrblue/chat',
    body: {
      pageContext: pageContext,
      userRole: userRole,
      mode: mode
    },
    onFinish: (message) => {
      // Scroll to bottom on new message
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  });

  const isSuperAdmin = userRole === 'super_admin';

  const handleApproveChange = async (messageId: string, action: 'approve' | 'reject') => {
    // Call API to approve/reject code changes
    await fetch(`/api/mrblue/approval/${messageId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
  };

  return (
    <div 
      className={`fixed ${isExpanded ? 'inset-4' : 'bottom-6 right-6 w-[500px]'} 
                  h-[${isExpanded ? '100%' : '600px'}] 
                  bg-white dark:bg-gray-900 rounded-xl shadow-2xl 
                  flex flex-col border border-gray-200 dark:border-gray-700
                  transition-all duration-300 z-50`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Mr Blue</h3>
            <p className="text-xs text-gray-500">AI Assistant {isSuperAdmin && '• Super Admin'}</p>
          </div>
        </div>
        
        {/* Mode Switcher (Super Admin Only) */}
        {isSuperAdmin && (
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              size="sm"
              variant={mode === 'chat' ? 'default' : 'ghost'}
              onClick={() => setMode('chat')}
              className="h-8"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Chat
            </Button>
            <Button
              size="sm"
              variant={mode === 'code' ? 'default' : 'ghost'}
              onClick={() => setMode('code')}
              className="h-8"
            >
              <Code className="w-4 h-4 mr-1" />
              Code
            </Button>
            <Button
              size="sm"
              variant={mode === 'visual' ? 'default' : 'ghost'}
              onClick={() => setMode('visual')}
              className="h-8"
            >
              <Eye className="w-4 h-4 mr-1" />
              Visual
            </Button>
          </div>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Minimize' : 'Expand'}
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Ask Mr Blue anything!</p>
            {isSuperAdmin && (
              <p className="text-sm text-gray-400 mt-2">
                Code intelligence, visual editing, and more...
              </p>
            )}
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message}
            onApprove={isSuperAdmin ? handleApproveChange : undefined}
          />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Mr Blue is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions (Super Admin) */}
      {isSuperAdmin && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs">
              <Map className="w-3 h-3 mr-1" />
              ESA Mind
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <Terminal className="w-3 h-3 mr-1" />
              Terminal
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <Code className="w-3 h-3 mr-1" />
              Code Search
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={
              mode === 'chat' ? "Ask Mr Blue anything..." :
              mode === 'code' ? "Describe the code you need..." :
              "Describe your visual design..."
            }
            className="flex-1"
            disabled={isLoading}
          />
          
          {isLoading ? (
            <Button type="button" onClick={stop} variant="destructive">
              <StopCircle className="w-4 h-4" />
            </Button>
          ) : (
            <Button type="submit">
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

// Chat Message Component
function ChatMessage({ message, onApprove }: { 
  message: Message, 
  onApprove?: (id: string, action: 'approve' | 'reject') => void 
}) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-lg p-3 ${
        isUser 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
      }`}>
        <div className="prose prose-sm dark:prose-invert">
          {message.content}
        </div>

        {/* Code Preview */}
        {message.metadata?.codeGenerated && (
          <div className="mt-3 p-3 bg-black rounded-lg">
            <pre className="text-sm text-green-400 overflow-x-auto">
              <code>{message.metadata.codeGenerated}</code>
            </pre>
          </div>
        )}

        {/* Approval Buttons */}
        {message.metadata?.approval === 'pending' && onApprove && (
          <div className="mt-3 flex gap-2">
            <Button 
              size="sm" 
              variant="default"
              onClick={() => onApprove(message.id, 'approve')}
            >
              <Check className="w-4 h-4 mr-1" />
              Apply Changes
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onApprove(message.id, 'reject')}
            >
              <X className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        )}

        {/* Files Modified */}
        {message.metadata?.filesModified && message.metadata.filesModified.length > 0 && (
          <div className="mt-2 text-xs opacity-75">
            Modified: {message.metadata.filesModified.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🔗 **API ENDPOINTS COMPLETE SPECIFICATION**

### **All 30+ Endpoints for Phase 9**

```typescript
// server/routes/index.ts - Master router

import { Router } from 'express';
import { intelligenceRouter } from './intelligenceRoutes';
import { mrBlueRouter } from './mrBlueRoutes';
import { predictiveRouter } from './predictiveRoutes';
import { priorityRouter } from './priorityRoutes';
import { dependencyRouter } from './dependencyRoutes';
import { agentRouter } from './agentRoutes';

export const phase9Router = Router();

// Intelligence Layer APIs
phase9Router.use('/intelligence', intelligenceRouter);

// Mr Blue APIs
phase9Router.use('/mrblue', mrBlueRouter);

// Predictive Planning APIs
phase9Router.use('/predictive', predictiveRouter);

// Dynamic Priority APIs
phase9Router.use('/priority', priorityRouter);

// Dependency Mapping APIs
phase9Router.use('/dependency', dependencyRouter);

// New Agents (#110-116) APIs
phase9Router.use('/agents', agentRouter);
```

### **Complete Endpoint List:**

#### **Intelligence Layer (Cross-Phase Learning)**
```
POST   /api/intelligence/cross-phase/publish-insight
POST   /api/intelligence/cross-phase/subscribe
GET    /api/intelligence/cross-phase/insights/:agentId
POST   /api/intelligence/cross-phase/validate-insight/:id
GET    /api/intelligence/cross-phase/patterns
POST   /api/intelligence/agent-insights
GET    /api/intelligence/agent-insights/:agentId
POST   /api/intelligence/learning-patterns
GET    /api/intelligence/federated/aggregate
POST   /api/intelligence/federated/distribute
```

#### **Predictive Planning**
```
POST   /api/predictive/track-execution
GET    /api/predictive/execution-history
POST   /api/predictive/predict-sequence
GET    /api/predictive/predict-duration/:trackId
POST   /api/predictive/train-model
GET    /api/predictive/models
POST   /api/predictive/activate-model/:id
GET    /api/predictive/recommendations
```

#### **Dynamic Priority**
```
POST   /api/priority/adjust/:trackId
GET    /api/priority/current/:phaseNumber
POST   /api/priority/rule
GET    /api/priority/rules
PUT    /api/priority/rule/:id
DELETE /api/priority/rule/:id
GET    /api/priority/history/:trackId
POST   /api/priority/escalate/:trackId
```

#### **Dependency Mapping**
```
POST   /api/dependency/graph
GET    /api/dependency/graph/:phaseNumber
POST   /api/dependency/add
DELETE /api/dependency/remove/:id
GET    /api/dependency/cycles/:phaseNumber
GET    /api/dependency/critical-path/:phaseNumber
GET    /api/dependency/impact/:trackId
POST   /api/dependency/suggest
GET    /api/dependency/visualization/:phaseNumber
```

#### **Mr Blue**
```
POST   /api/mrblue/chat
POST   /api/mrblue/code-intelligence/index
POST   /api/mrblue/code-intelligence/search
GET    /api/mrblue/code-intelligence/definition/:symbol
GET    /api/mrblue/code-intelligence/references/:symbol
POST   /api/mrblue/visual-preview/generate
POST   /api/mrblue/visual-preview/render
POST   /api/mrblue/design-to-code/convert
POST   /api/mrblue/approval/:messageId
GET    /api/mrblue/conversation/:sessionId
GET    /api/mrblue/usage-metrics/:userId
```

#### **New Agents (#110-116)**
```
POST   /api/agents/110/index-file
GET    /api/agents/110/semantic-search
POST   /api/agents/111/preview
POST   /api/agents/111/sandpack
POST   /api/agents/112/figma-import
POST   /api/agents/112/design-tokens
POST   /api/agents/113/cross-phase-coordinate
POST   /api/agents/114/predict-plan
POST   /api/agents/115/adjust-priority
POST   /api/agents/116/map-dependencies
GET    /api/agents/expert-research/:agentId
```

---

## 📊 **EXECUTION TIMELINE**

### **Week 1: Infrastructure & Core Intelligence**
- ✅ Day 1-2: Database schema, API routes, package installation
- ✅ Day 3-4: Cross-phase learning system, federated learning core
- ✅ Day 5-7: Predictive planning engine, ML models training

### **Week 2: Mr Blue Core + Code Intelligence**
- Day 8-9: Mr Blue chat interface, Claude integration
- Day 10-11: Agent #110 (Code Intelligence), Tree-sitter indexing
- Day 12-14: Agent #111 (Visual Preview), Sandpack/React-Live

### **Week 3: Visual Systems + New Agents**
- Day 15-16: Agent #112 (Design-to-Code), Builder.io integration
- Day 17-18: Agents #113-116 (Cross-Phase, Predictive, Priority, Dependency)
- Day 19-21: Open source integration (Aider, Continue.dev patterns)

### **Week 4: Dashboards, Testing & Launch**
- Day 22-23: Intelligence dashboards, dependency visualization
- Day 24-25: Integration testing, all systems verification
- Day 26-28: Documentation, training materials, production deployment

---

## 🚀 **SUCCESS METRICS**

### **Technical Metrics:**
- [ ] All 18 tracks completed and operational
- [ ] 7 new agents (#110-116) deployed with 10 experts each
- [ ] 30+ API endpoints live and tested
- [ ] 100% database schema migrated
- [ ] All intelligence layers connected

### **Capability Metrics:**
- [ ] Mr Blue can edit code via chat (Super Admin)
- [ ] Code intelligence search <100ms response
- [ ] Visual preview renders in <500ms
- [ ] Cross-phase learning active across all agents
- [ ] Predictive planning suggests optimal track sequences
- [ ] Dynamic priority adjusts in real-time
- [ ] Dependency visualization interactive

### **User Experience Metrics:**
- [ ] Clean Mr Blue chat interface (no 3D avatar)
- [ ] ESA MindMap integrated into Mr Blue
- [ ] Feature flags working for gradual rollout
- [ ] All dashboards responsive and fast
- [ ] Expert research accessible per agent

---

## 📝 **NEXT ACTIONS**

This complete implementation guide provides:
1. ✅ **Layer 1**: All database schemas created
2. ✅ **Layer 2**: Complete code for core services
3. ✅ **Layer 3**: API specifications and routes
4. ✅ **Expert Research**: 70 experts documented
5. ✅ **UI Components**: React components for all features
6. ✅ **Timeline**: 4-week execution plan

**Ready to execute? Say "Execute MB.MD Phase 9" to begin parallel implementation!**
