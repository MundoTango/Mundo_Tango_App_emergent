import { StateGraph, Annotation } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { agentLearningService } from "./AgentLearningCaptureService";
import { crossDomainLearning } from "./CrossDomainLearningService";

/**
 * ESA 61x21 LangGraph Agent Orchestrator
 * Maps 100-agent organizational hierarchy as executable graph
 * 
 * Hierarchy:
 * - Agent #0 (CEO) → 6 Division Chiefs → 9 Domain Coordinators → 61 Layer Agents
 * - 7 Expert Agents (advisory)
 * - 16 Life CEO Sub-Agents (AI life management)
 */

const AgentStateAnnotation = Annotation.Root({
  agentDomain: Annotation<string>,
  task: Annotation<string>,
  pattern: Annotation<any>,
  files: Annotation<string[]>,
  learnings: Annotation<any[]>,
  result: Annotation<any>,
  // ESA hierarchy fields
  agentId: Annotation<string>,
  agentType: Annotation<'ceo' | 'chief' | 'domain' | 'layer' | 'expert' | 'lifeCEO'>,
  divisionId: Annotation<number>,
  layerIds: Annotation<number[]>,
  escalationLevel: Annotation<number>,
  performanceMetrics: Annotation<any>
});

type AgentState = typeof AgentStateAnnotation.State;

export class LangGraphAgentOrchestrator {
  private workflow: StateGraph<AgentState>;
  private memory: MemorySaver;
  private llm: ChatOpenAI;
  
  // ESA Organizational Structure (100 agents)
  private readonly ESA_HIERARCHY = {
    ceo: { id: 'AGENT_0', name: 'ESA CEO/Orchestrator' },
    chiefs: [
      { id: 'CHIEF_1', name: 'Foundation', layers: [1, 10] },
      { id: 'CHIEF_2', name: 'Core', layers: [11, 20] },
      { id: 'CHIEF_3', name: 'Business', layers: [21, 30] },
      { id: 'CHIEF_4', name: 'Intelligence', layers: [31, 46] },
      { id: 'CHIEF_5', name: 'Platform', layers: [47, 56] },
      { id: 'CHIEF_6', name: 'Extended', layers: [57, 61] }
    ],
    domains: [
      { id: 'DOMAIN_1', name: 'Infrastructure Orchestrator', chief: 'CHIEF_1' },
      { id: 'DOMAIN_2', name: 'Frontend Coordinator', chief: 'CHIEF_1' },
      { id: 'DOMAIN_3', name: 'Background Processor', chief: 'CHIEF_2' },
      { id: 'DOMAIN_4', name: 'Real-time Communications', chief: 'CHIEF_2' },
      { id: 'DOMAIN_5', name: 'Business Logic Manager', chief: 'CHIEF_3' },
      { id: 'DOMAIN_6', name: 'Search & Analytics', chief: 'CHIEF_3' },
      { id: 'DOMAIN_7', name: 'Life CEO Core', chief: 'CHIEF_4' },
      { id: 'DOMAIN_8', name: 'Platform Enhancement', chief: 'CHIEF_5' },
      { id: 'DOMAIN_9', name: 'Master Control', chief: 'CHIEF_6' }
    ],
    experts: [
      { id: 'EXPERT_10', name: 'AI Research' },
      { id: 'EXPERT_11', name: 'UI/UX Design (Aurora)' },
      { id: 'EXPERT_12', name: 'Data Visualization' },
      { id: 'EXPERT_13', name: 'Content & Media' },
      { id: 'EXPERT_14', name: 'Code Quality' },
      { id: 'EXPERT_15', name: 'Developer Experience' },
      { id: 'EXPERT_16', name: 'Translation & i18n' }
    ],
    lifeCEO: [
      'life-ceo', 'business', 'finance', 'health', 'relationships', 'learning',
      'creative', 'network', 'global-mobility', 'security', 'emergency', 
      'memory', 'voice', 'data', 'workflow', 'legal'
    ]
  };

  // Legacy domain mapping (backward compatibility)
  private readonly AGENT_DOMAINS = [
    'infrastructure',
    'frontend',
    'business-logic',
    'real-time',
    'search',
    'life-CEO',
    'platform',
    'background',
    'master-control'
  ];

  constructor() {
    this.memory = new MemorySaver();
    this.llm = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.1,
    });

    this.workflow = new StateGraph(AgentStateAnnotation);
    this.setupWorkflow();
  }

  private setupWorkflow() {
    // Level 0: CEO Node (Strategic Orchestration)
    this.workflow.addNode("agent-ceo", async (state: AgentState) => {
      console.log('[LangGraph] Agent #0 (CEO) orchestrating...');
      
      return {
        agentId: 'AGENT_0',
        agentType: 'ceo' as const,
        result: {
          success: true,
          orchestrator: 'CEO',
          task: state.task,
          routingDecision: this.determineChiefRouting(state)
        }
      };
    });

    // Level 1: Division Chief Nodes (Strategic Alignment)
    for (let i = 1; i <= 6; i++) {
      const chief = this.ESA_HIERARCHY.chiefs[i - 1];
      this.workflow.addNode(`chief-${i}`, async (state: AgentState) => {
        console.log(`[LangGraph] ${chief.id} (${chief.name}) coordinating...`);
        
        return {
          agentId: chief.id,
          agentType: 'chief' as const,
          divisionId: i,
          layerIds: Array.from(
            { length: chief.layers[1] - chief.layers[0] + 1 },
            (_, idx) => chief.layers[0] + idx
          ),
          result: {
            success: true,
            division: chief.name,
            layers: chief.layers
          }
        };
      });
    }

    // Level 2: Domain Coordinator Nodes (Operational Execution)
    this.ESA_HIERARCHY.domains.forEach(domain => {
      this.workflow.addNode(domain.id.toLowerCase(), async (state: AgentState) => {
        console.log(`[LangGraph] ${domain.id} (${domain.name}) executing...`);
        
        // Execute domain-specific logic
        if (domain.id === 'DOMAIN_1' && state.task === 'discover-cache-patterns') {
          await agentLearningService.captureExistingCachePatterns();
          return {
            result: { success: true, domain: domain.name },
            learnings: await agentLearningService.getHighConfidenceLearnings(0.9)
          };
        }

        if (domain.id === 'DOMAIN_2' && state.pattern && state.task === 'apply-pattern') {
          const result = await crossDomainLearning.applyRemoteLearning(
            'frontend',
            state.pattern
          );
          return { result };
        }

        return {
          agentId: domain.id,
          agentType: 'domain' as const,
          result: { success: true, domain: domain.name }
        };
      });
    });

    // Level 3: Expert Agent Nodes (Advisory)
    this.ESA_HIERARCHY.experts.forEach(expert => {
      this.workflow.addNode(expert.id.toLowerCase(), async (state: AgentState) => {
        console.log(`[LangGraph] ${expert.id} (${expert.name}) advising...`);
        
        return {
          agentId: expert.id,
          agentType: 'expert' as const,
          result: {
            success: true,
            expertise: expert.name,
            advisory: `${expert.name} validation complete`
          }
        };
      });
    });

    // Level 4: Life CEO Sub-Agent Node (AI Life Management)
    this.workflow.addNode("life-ceo-agents", async (state: AgentState) => {
      console.log('[LangGraph] Life CEO agents coordinating...');
      
      return {
        agentType: 'lifeCEO' as const,
        result: {
          success: true,
          agents: this.ESA_HIERARCHY.lifeCEO.length,
          available: this.ESA_HIERARCHY.lifeCEO
        }
      };
    });

    // Legacy nodes (backward compatibility)
    this.workflow.addNode("infrastructure", async (state: AgentState) => {
      console.log('[LangGraph] Infrastructure agent processing...');
      
      if (state.task === 'discover-cache-patterns') {
        await agentLearningService.captureExistingCachePatterns();
        return {
          result: { success: true, domain: 'infrastructure' },
          learnings: await agentLearningService.getHighConfidenceLearnings(0.9)
        };
      }

      return { result: { success: true, domain: 'infrastructure' } };
    });

    this.workflow.addNode("frontend", async (state: AgentState) => {
      console.log('[LangGraph] Frontend agent processing...');
      
      if (state.pattern && state.task === 'apply-pattern') {
        const result = await crossDomainLearning.applyRemoteLearning(
          'frontend',
          state.pattern
        );
        return { result };
      }

      return { result: { success: true, domain: 'frontend' } };
    });

    this.workflow.addNode("business-logic", async (state: AgentState) => {
      console.log('[LangGraph] Business logic agent processing...');
      return { result: { success: true, domain: 'business-logic' } };
    });

    this.workflow.addNode("master-control", async (state: AgentState) => {
      console.log('[LangGraph] Master control orchestrating...');
      
      if (state.learnings && state.learnings.length > 0) {
        for (const learning of state.learnings) {
          await crossDomainLearning.broadcastLearning(learning);
        }
      }

      return {
        result: {
          success: true,
          orchestrated: true,
          domainsNotified: state.learnings?.length || 0
        }
      };
    });

    // Hierarchical Routing: CEO → Chiefs → Domains
    this.workflow.addEdge("__start__", "agent-ceo" as any);

    // CEO routes to appropriate Division Chief
    this.workflow.addConditionalEdges(
      "agent-ceo" as any,
      (state: AgentState) => {
        // Determine which chief based on task or layer
        if (state.layerIds && state.layerIds.length > 0) {
          const layer = state.layerIds[0];
          if (layer >= 1 && layer <= 10) return 'chief-1';
          if (layer >= 11 && layer <= 20) return 'chief-2';
          if (layer >= 21 && layer <= 30) return 'chief-3';
          if (layer >= 31 && layer <= 46) return 'chief-4';
          if (layer >= 47 && layer <= 56) return 'chief-5';
          if (layer >= 57 && layer <= 61) return 'chief-6';
        }
        
        // Task-based routing
        if (state.task === 'discover-cache-patterns') return 'chief-1'; // Foundation
        if (state.task === 'apply-pattern') return 'chief-1'; // Foundation
        if (state.task === 'ai-integration') return 'chief-4'; // Intelligence
        
        return 'chief-6'; // Extended (Master Control)
      }
    );

    // Chiefs route to appropriate Domains
    for (let i = 1; i <= 6; i++) {
      this.workflow.addConditionalEdges(
        `chief-${i}` as any,
        (state: AgentState) => {
          // Chief-specific domain routing
          if (i === 1) {
            // Foundation Chief → Infrastructure or Frontend
            return state.task?.includes('cache') ? 'domain_1' : 'domain_2';
          } else if (i === 2) {
            // Core Chief → Background or Real-time
            return 'domain_3';
          } else if (i === 3) {
            // Business Chief → Business Logic or Search
            return 'domain_5';
          } else if (i === 4) {
            // Intelligence Chief → Life CEO Core
            return 'domain_7';
          } else if (i === 5) {
            // Platform Chief → Platform Enhancement
            return 'domain_8';
          } else if (i === 6) {
            // Extended Chief → Master Control
            return 'domain_9';
          }
          return '__end__';
        }
      );
    }

    // Domains complete and end
    this.ESA_HIERARCHY.domains.forEach(domain => {
      this.workflow.addEdge(domain.id.toLowerCase() as any, "__end__");
    });

    // Experts provide advisory (can be consulted by any node)
    this.ESA_HIERARCHY.experts.forEach(expert => {
      this.workflow.addEdge(expert.id.toLowerCase() as any, "__end__");
    });

    this.workflow.addEdge("life-ceo-agents" as any, "__end__");

    // Legacy routing (backward compatibility)
    this.workflow.addEdge("infrastructure" as any, "__end__");
    this.workflow.addEdge("frontend" as any, "__end__");
    this.workflow.addEdge("business-logic" as any, "__end__");
    this.workflow.addEdge("master-control" as any, "__end__");
  }

  private determineChiefRouting(state: AgentState): string {
    if (state.layerIds && state.layerIds.length > 0) {
      const layer = state.layerIds[0];
      if (layer >= 1 && layer <= 10) return 'CHIEF_1 (Foundation)';
      if (layer >= 11 && layer <= 20) return 'CHIEF_2 (Core)';
      if (layer >= 21 && layer <= 30) return 'CHIEF_3 (Business)';
      if (layer >= 31 && layer <= 46) return 'CHIEF_4 (Intelligence)';
      if (layer >= 47 && layer <= 56) return 'CHIEF_5 (Platform)';
      if (layer >= 57 && layer <= 61) return 'CHIEF_6 (Extended)';
    }
    return 'CHIEF_6 (Extended - Master Control)';
  }

  async invoke(input: {
    task: string;
    pattern?: any;
    files?: string[];
    agentDomain?: string;
  }) {
    const app = this.workflow.compile({ checkpointer: this.memory });

    const result = await app.invoke({
      task: input.task,
      pattern: input.pattern,
      files: input.files || [],
      agentDomain: input.agentDomain || 'master-control',
      learnings: [],
      result: {}
    }, {
      configurable: { thread_id: `learning-${Date.now()}` }
    });

    console.log('[LangGraph] Workflow completed:', result.result);
    return result;
  }

  async discoverAndShareLearnings() {
    console.log('[LangGraph] Initiating learning discovery and sharing...');
    
    return this.invoke({
      task: 'discover-cache-patterns'
    });
  }

  async applyPatternToAgent(pattern: any, agentDomain: string, files: string[]) {
    console.log(`[LangGraph] Applying pattern ${pattern.pattern} to ${agentDomain}...`);
    
    return this.invoke({
      task: 'apply-pattern',
      pattern,
      agentDomain,
      files
    });
  }
}

export const agentOrchestrator = new LangGraphAgentOrchestrator();
