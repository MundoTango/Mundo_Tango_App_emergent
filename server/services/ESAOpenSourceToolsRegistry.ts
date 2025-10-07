/**
 * ESA Open Source Tools Registry
 * Central registry for all Phase 1 open source tool integrations
 * 
 * This file tracks which tools are installed, configured, and operational
 * across all 61 ESA layers.
 */

import { lanceDBService } from "./LanceDBService";
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
  }

  private registerPhase1Tools() {
    this.tools.set("lancedb", {
      layer: 26,
      toolName: "LanceDB",
      status: "configured",
      documentation: "server/services/LanceDBService.ts",
    });

    this.tools.set("langfuse", {
      layer: 32,
      toolName: "Langfuse",
      status: langfuseService.isEnabled() ? "active" : "requires_setup",
      reason: langfuseService.isEnabled() 
        ? undefined 
        : "LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY environment variables required",
      documentation: "server/services/LangfuseService.ts",
    });

    this.tools.set("arize-phoenix", {
      layer: 48,
      toolName: "Arize Phoenix",
      status: arizePhoenixService.isEnabled() ? "active" : "configured",
      reason: arizePhoenixService.isEnabled() 
        ? undefined 
        : "Phoenix server not running (optional)",
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
    console.log("\n🚀 Initializing ESA Open Source Tools (Phase 1)...\n");

    try {
      await lanceDBService.initialize();
      this.tools.set("lancedb", {
        ...this.tools.get("lancedb")!,
        status: "active",
      });
    } catch (error) {
      console.error("Failed to initialize LanceDB:", error);
    }

    const summary = {
      active: this.getActiveTools().length,
      configured: this.getConfiguredTools().length,
      total: this.getAllTools().length,
    };

    console.log(`\n✅ Phase 1 Tools Summary:`);
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
