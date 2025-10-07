/**
 * ESA Open Source Tools Registry
 * Central registry for all Phase 1 open source tool integrations
 * 
 * This file tracks which tools are installed, configured, and operational
 * across all 61 ESA layers.
 */

// Phase 3 tool imports
import { lanceDBService } from "./LanceDBService";
import { llamaIndexService } from "./LlamaIndexService";
import { knowledgeGraphService } from "./KnowledgeGraphService";

// Phase 4 tool imports
import { langfuseService } from "./LangfuseService";
import { arizePhoenixService } from "./ArizePhoenixService";

export interface ESAToolStatus {
  layer: number;
  toolName: string;
  status: "active" | "configured" | "unavailable" | "requires_setup";
  reason?: string;
  documentation?: string;
}

export class ESAOpenSourceToolsRegistry {
  private tools: Map<string, ESAToolStatus> = new Map();

  constructor() {
    this.registerPhase1Tools();
    this.registerPhase2Tools();
    this.registerPhase3Tools();
    this.registerPhase4Tools();
  }

  private registerPhase1Tools() {
    this.tools.set("lancedb", {
      layer: 26,
      toolName: "LanceDB",
      status: "configured",
      reason: "@lancedb/lancedb package installed, ready to initialize",
      documentation: "server/services/LanceDBService.ts",
    });

    this.tools.set("langfuse", {
      layer: 32,
      toolName: "Langfuse",
      status: "configured",
      reason: "Packages installed, ready for API key configuration",
      documentation: "server/services/LangfuseService.ts",
    });

    this.tools.set("arize-phoenix", {
      layer: 48,
      toolName: "Arize Phoenix",
      status: "configured",
      reason: "OpenTelemetry instrumentation active, Phoenix server optional",
      documentation: "server/services/ArizePhoenixService.ts",
    });

    this.tools.set("milvus", {
      layer: 15,
      toolName: "Milvus SDK",
      status: "configured",
      reason: "Client SDK installed, requires external Milvus server for production",
      documentation: "npm package: @zilliz/milvus2-sdk-node",
    });

    this.tools.set("dragonfly", {
      layer: 14,
      toolName: "Dragonfly",
      status: "unavailable",
      reason: "Requires Docker deployment (not supported in Replit environment)",
      documentation: "Alternative: Optimize existing Redis/IORedis configuration",
    });

    this.tools.set("apache-age", {
      layer: 44,
      toolName: "Apache AGE",
      status: "unavailable",
      reason: "Neon PostgreSQL does not support AGE extension",
      documentation: "Alternative: Implement graph logic using standard PostgreSQL with recursive CTEs",
    });

    this.tools.set("signoz", {
      layer: 48,
      toolName: "SigNoz",
      status: "unavailable",
      reason: "Requires separate service deployment",
      documentation: "Alternative: Use Arize Phoenix for LLM-specific observability",
    });

    this.tools.set("mem0", {
      layer: 36,
      toolName: "Mem0",
      status: "requires_setup",
      reason: "Python package installed, needs Python-TypeScript bridge implementation",
      documentation: "Consider using persistent storage with LanceDB as alternative",
    });

    this.tools.set("dspy", {
      layer: 45,
      toolName: "DSPy",
      status: "requires_setup",
      reason: "Python package, needs Python-TypeScript bridge implementation",
      documentation: "Systematic prompt optimization framework",
    });
  }

  private registerPhase2Tools() {
    // Track D: Workflow & Agent Enhancement
    this.tools.set("temporal", {
      layer: 57,
      toolName: "Temporal",
      status: "configured",
      reason: "@temporalio/* packages installed, ready for workflow execution",
      documentation: "server/services/TemporalService.ts",
    });

    this.tools.set("crewai", {
      layer: 35,
      toolName: "CrewAI",
      status: "requires_setup",
      reason: "Python-only framework, requires node-calls-python bridge or unofficial crewai-js SDK",
      documentation: "Multi-agent orchestration - Alternative to LangGraph",
    });

    this.tools.set("activepieces", {
      layer: 20,
      toolName: "Activepieces",
      status: "requires_setup",
      reason: "TypeScript/Node.js automation platform, self-hostable via Docker",
      documentation: "Open-source Zapier alternative - https://activepieces.com",
    });

    // Track E: Testing Enhancement
    this.tools.set("bun-test", {
      layer: 51,
      toolName: "Bun Test",
      status: "configured",
      reason: "10-30x faster than Jest for sync tests, single-threaded (poor async performance)",
      documentation: "Vitest recommended for best speed/stability balance",
    });

    // Track F: Real-time Optimization
    this.tools.set("supabase-realtime", {
      layer: 11,
      toolName: "Supabase Realtime",
      status: "active",
      reason: "Already integrated, can optimize with broadcast patterns and reconnection logic",
      documentation: "WebSocket broadcasts - https://supabase.com/docs/guides/realtime/broadcast",
    });
  }

  private registerPhase3Tools() {
    // Track G: Knowledge Graph
    this.tools.set("knowledge-graph", {
      layer: 44,
      toolName: "Knowledge Graph (PostgreSQL)",
      status: "active",
      reason: "Implemented using recursive CTEs, no external dependencies",
      documentation: "server/services/KnowledgeGraphService.ts",
    });

    // Track H: Memory & RAG
    this.tools.set("llamaindex", {
      layer: 36,
      toolName: "LlamaIndex",
      status: "configured",
      reason: "RAG service created, ready for document ingestion",
      documentation: "server/services/LlamaIndexService.ts",
    });

    // Track I: Vector Storage (updated from Phase 1)
    // LanceDB status updated above to "configured"
  }

  private registerPhase4Tools() {
    // Track J: Observability Stack
    this.tools.set("opentelemetry", {
      layer: 48,
      toolName: "OpenTelemetry",
      status: "configured",
      reason: "SDK installed with auto-instrumentation for HTTP, Express, PostgreSQL",
      documentation: "server/services/OpenTelemetryService.ts",
    });

    // Track K: Workflow Orchestration
    // Temporal already registered in Phase 2

    // Track L: Testing & Performance
    // Bun Test already registered in Phase 2

    // Track M: Real-time Optimization
    this.tools.set("realtime-optimization", {
      layer: 11,
      toolName: "Realtime Optimization",
      status: "configured",
      reason: "Exponential backoff reconnection and broadcast patterns implemented",
      documentation: "server/services/RealtimeOptimizationService.ts",
    });
  }

  getToolStatus(toolId: string): ESAToolStatus | undefined {
    return this.tools.get(toolId);
  }

  getAllTools(): ESAToolStatus[] {
    return Array.from(this.tools.values());
  }

  getActiveTools(): ESAToolStatus[] {
    return this.getAllTools().filter(tool => tool.status === "active");
  }

  getConfiguredTools(): ESAToolStatus[] {
    return this.getAllTools().filter(
      tool => tool.status === "active" || tool.status === "configured"
    );
  }

  getToolsByLayer(layer: number): ESAToolStatus[] {
    return this.getAllTools().filter(tool => tool.layer === layer);
  }

  async initializeAllTools(): Promise<void> {
    console.log("\n🚀 Initializing ESA Open Source Tools (Phases 1-4)...\n");

    // Phase 3: Initialize LanceDB
    try {
      await lanceDBService.initialize();
      this.tools.set("lancedb", {
        ...this.tools.get("lancedb")!,
        status: "active",
        reason: "Vector database operational",
      });
    } catch (error) {
      console.error("⚠️  LanceDB initialization failed (non-critical):", error);
    }

    // Phase 3: Initialize LlamaIndex
    try {
      await llamaIndexService.initialize();
      this.tools.set("llamaindex", {
        ...this.tools.get("llamaindex")!,
        status: "active",
        reason: "RAG service operational",
      });
    } catch (error) {
      console.error("⚠️  LlamaIndex initialization failed (non-critical):", error);
    }

    // Phase 4: Check Langfuse status
    if (langfuseService.isEnabled()) {
      this.tools.set("langfuse", {
        ...this.tools.get("langfuse")!,
        status: "active",
        reason: "LLM observability active",
      });
    }

    // Phase 4: Check Arize Phoenix status
    if (arizePhoenixService.isEnabled()) {
      this.tools.set("arize-phoenix", {
        ...this.tools.get("arize-phoenix")!,
        status: "active",
        reason: "OpenTelemetry tracing active",
      });
    }

    const summary = {
      active: this.getActiveTools().length,
      configured: this.getConfiguredTools().length,
      total: this.getAllTools().length,
    };

    console.log(`\n✅ ESA Open Source Tools Summary (Phases 1-4):`);
    console.log(`   Active: ${summary.active}`);
    console.log(`   Configured: ${summary.configured}`);
    console.log(`   Total Registered: ${summary.total}\n`);

    this.getAllTools().forEach(tool => {
      const icon = tool.status === "active" ? "✅" : 
                   tool.status === "configured" ? "🔧" :
                   tool.status === "requires_setup" ? "⚙️" : "❌";
      console.log(`   ${icon} Layer ${tool.layer}: ${tool.toolName} (${tool.status})`);
      if (tool.reason) {
        console.log(`      └─ ${tool.reason}`);
      }
    });
  }
}

export const esaToolsRegistry = new ESAOpenSourceToolsRegistry();
