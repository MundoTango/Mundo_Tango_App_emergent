import { StateGraph, Annotation } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { agentLearningService } from "./AgentLearningCaptureService";
import { crossDomainLearning } from "./CrossDomainLearningService";

const AgentStateAnnotation = Annotation.Root({
  agentDomain: Annotation<string>,
  task: Annotation<string>,
  pattern: Annotation<any>,
  files: Annotation<string[]>,
  learnings: Annotation<any[]>,
  result: Annotation<any>
});

type AgentState = typeof AgentStateAnnotation.State;

export class LangGraphAgentOrchestrator {
  private workflow: StateGraph<AgentState>;
  private memory: MemorySaver;
  private llm: ChatOpenAI;
  
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

    this.workflow.addEdge("__start__", "master-control");

    this.workflow.addConditionalEdges(
      "master-control",
      (state: AgentState) => {
        if (state.task === 'discover-cache-patterns') return 'infrastructure';
        if (state.task === 'apply-pattern' && state.agentDomain === 'frontend') return 'frontend';
        if (state.task === 'apply-pattern' && state.agentDomain === 'business-logic') return 'business-logic';
        return '__end__';
      }
    );

    this.workflow.addEdge("infrastructure", "__end__");
    this.workflow.addEdge("frontend", "__end__");
    this.workflow.addEdge("business-logic", "__end__");
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
