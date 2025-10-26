/**
 * MCP (Model Context Protocol) Client Integration
 * 
 * Connects Mr Blue to external MCP servers for Gmail, Slack, GitHub, etc.
 * Uses @modelcontextprotocol/sdk TypeScript SDK for JSON-RPC communication
 * 
 * Architecture:
 * - MCP servers expose tools, resources, and prompts via JSON-RPC 2.0
 * - This client connects to configured MCP servers and proxies tool calls
 * - Tools are registered dynamically in universalToolOrchestrator.ts
 * 
 * Created: Oct 26, 2025 (MB.MD Workstream B)
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export interface MCPServerConfig {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  serverName: string;
}

/**
 * MCP Client Manager
 * 
 * Manages connections to multiple MCP servers and exposes their tools
 */
export class MCPClientManager {
  private clients: Map<string, Client> = new Map();
  private tools: Map<string, MCPTool> = new Map();
  private healthChecks: Map<string, boolean> = new Map();

  constructor(private configs: MCPServerConfig[]) {}

  /**
   * Initialize all MCP server connections
   */
  async initialize(): Promise<void> {
    console.log(`🔌 [MCP] Initializing ${this.configs.length} server(s)...`);

    for (const config of this.configs) {
      try {
        await this.connectServer(config);
      } catch (error) {
        console.error(`❌ [MCP] Failed to connect to ${config.name}:`, error);
        this.healthChecks.set(config.name, false);
      }
    }

    console.log(`✅ [MCP] Initialized ${this.clients.size}/${this.configs.length} server(s)`);
  }

  /**
   * Connect to a single MCP server
   */
  private async connectServer(config: MCPServerConfig): Promise<void> {
    console.log(`🔌 [MCP] Connecting to ${config.name}...`);

    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args || [],
      env: config.env || {}
    });

    const client = new Client({
      name: `mundo-tango-${config.name}`,
      version: '1.0.0'
    }, {
      capabilities: {
        tools: {},
        resources: {}
      }
    });

    await client.connect(transport);
    this.clients.set(config.name, client);
    this.healthChecks.set(config.name, true);

    // List available tools from this server
    const response = await client.listTools();
    
    for (const tool of response.tools) {
      const mcpTool: MCPTool = {
        name: `${config.name}:${tool.name}`,
        description: tool.description || `Tool from ${config.name}`,
        inputSchema: tool.inputSchema,
        serverName: config.name
      };
      
      this.tools.set(mcpTool.name, mcpTool);
      console.log(`  ✅ Registered tool: ${mcpTool.name}`);
    }
  }

  /**
   * Execute a tool on an MCP server
   */
  async executeTool(toolName: string, params: any): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    const client = this.clients.get(tool.serverName);
    if (!client) {
      throw new Error(`MCP server not connected: ${tool.serverName}`);
    }

    // Check server health
    if (!this.healthChecks.get(tool.serverName)) {
      throw new Error(`MCP server unhealthy: ${tool.serverName}`);
    }

    try {
      // Extract the actual tool name (without server prefix)
      const actualToolName = toolName.split(':')[1];
      
      const result = await client.callTool({
        name: actualToolName,
        arguments: params
      });

      return result.content;
    } catch (error) {
      console.error(`❌ [MCP] Tool execution failed: ${toolName}`, error);
      this.healthChecks.set(tool.serverName, false);
      throw error;
    }
  }

  /**
   * Get all available MCP tools
   */
  getTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get server health status
   */
  getHealthStatus(): Record<string, boolean> {
    return Object.fromEntries(this.healthChecks);
  }

  /**
   * Disconnect all MCP servers
   */
  async shutdown(): Promise<void> {
    console.log('🔌 [MCP] Shutting down all connections...');
    
    for (const [name, client] of this.clients.entries()) {
      try {
        await client.close();
        console.log(`  ✅ Closed connection to ${name}`);
      } catch (error) {
        console.error(`  ❌ Error closing ${name}:`, error);
      }
    }

    this.clients.clear();
    this.tools.clear();
    this.healthChecks.clear();
  }
}

/**
 * Default MCP server configurations
 * 
 * Add more as needed (Gmail, Slack, GitHub, etc.)
 */
export const defaultMCPServers: MCPServerConfig[] = [
  // Example: GitHub MCP Server
  // {
  //   name: 'github',
  //   command: 'npx',
  //   args: ['-y', '@modelcontextprotocol/server-github'],
  //   env: {
  //     GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN || ''
  //   }
  // },
  
  // Example: Slack MCP Server (when available)
  // {
  //   name: 'slack',
  //   command: 'npx',
  //   args: ['-y', '@modelcontextprotocol/server-slack'],
  //   env: {
  //     SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN || '',
  //     SLACK_TEAM_ID: process.env.SLACK_TEAM_ID || ''
  //   }
  // }
];

// Singleton instance
let mcpManager: MCPClientManager | null = null;

/**
 * Get or create MCP client manager
 */
export async function getMCPManager(): Promise<MCPClientManager> {
  if (!mcpManager) {
    mcpManager = new MCPClientManager(defaultMCPServers);
    await mcpManager.initialize();
  }
  return mcpManager;
}

/**
 * Shutdown MCP connections (for graceful server shutdown)
 */
export async function shutdownMCP(): Promise<void> {
  if (mcpManager) {
    await mcpManager.shutdown();
    mcpManager = null;
  }
}
