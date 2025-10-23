/**
 * Tool Executor - Safely executes AI-requested tools
 * MB.MD: Security-first tool execution with permission checks
 */

import { db } from '../../db';
import { users, memories, events, groups } from '@shared/schema';
import { eq, desc, gte, ilike, sql, and } from 'drizzle-orm';
import { toolPermissions, ToolPermissionLevel } from './toolDefinitions';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { 
  scanComponentRegistry, 
  scanAPIRoutes, 
  getDatabaseSchema, 
  getFeatureStatus 
} from './platformKnowledge';

const execAsync = promisify(exec);

export class ToolExecutor {
  private context: any = null; // Store visual editor context

  /**
   * Set context for tool execution (Visual Editor state, etc.)
   */
  setContext(context: any) {
    this.context = context;
  }

  /**
   * Check if user has permission to execute a tool
   */
  private canExecuteTool(toolName: string, user: any): boolean {
    const requiredLevel = toolPermissions[toolName];
    
    if (!requiredLevel) {
      console.error(`[ToolExecutor] Unknown tool: ${toolName}`);
      return false;
    }

    // Public tools - anyone can use
    if (requiredLevel === ToolPermissionLevel.PUBLIC) {
      return true;
    }

    // Super admin tools - check user permissions
    if (requiredLevel === ToolPermissionLevel.SUPER_ADMIN) {
      return this.isSuperAdmin(user);
    }

    // System tools - never allow
    return false;
  }

  private isSuperAdmin(user: any): boolean {
    if (!user) return false;
    if (user.email === 'admin@mundotango.life') return true;
    if (user.username === 'admin') return true;
    if (user.role === 'super_admin') return true; // 🔧 FIX Oct 23: Check singular role field
    if (user.roles?.includes('super_admin')) return true;
    if (user.tangoRoles?.includes('super_admin')) return true;
    return false;
  }

  /**
   * Execute a tool safely with permission checks and error handling
   */
  async executeTool(toolName: string, params: any, user: any): Promise<any> {
    console.log(`[ToolExecutor] Executing: ${toolName}`, params);

    // Check permissions
    if (!this.canExecuteTool(toolName, user)) {
      throw new Error(`Insufficient permissions to execute ${toolName}`);
    }

    try {
      // Route to appropriate handler
      switch (toolName) {
        // Database tools
        case 'get_platform_health':
          return await this.getPlatformHealth();
        case 'get_recent_memories':
          return await this.getRecentMemories(params);
        case 'get_user_stats':
          return await this.getUserStats(params);
        case 'search_memories':
          return await this.searchMemories(params);
        case 'get_event_count':
          return await this.getEventCount(params);
        case 'get_groups_by_city':
          return await this.getGroupsByCity(params);
        
        // Codebase tools
        case 'search_codebase':
          return await this.searchCodebase(params);
        case 'list_react_components':
          return await this.listReactComponents(params);
        case 'find_api_endpoints':
          return await this.findApiEndpoints(params);
        
        // Documentation tools
        case 'search_documentation':
          return await this.searchDocumentation(params);
        case 'read_documentation':
          return await this.readDocumentation(params);
        
        // Developer tools (WRITE operations)
        case 'edit_file':
          return await this.editFile(params);
        case 'read_file':
          return await this.readFileContents(params);
        case 'create_component':
          return await this.createComponent(params);
        case 'run_command':
          return await this.runCommand(params);
        
        // Visual Editor tools
        case 'get_selected_element':
          return await this.getSelectedElement();
        
        // MB.MD Documentation tools
        case 'read_mb_md_protocol':
          return await this.readMBMDProtocol();
        case 'read_agent_learnings':
          return await this.readAgentLearnings(params);
        case 'search_mb_md_docs':
          return await this.searchMBMDDocs(params);
        case 'get_integration_protocol':
          return await this.getIntegrationProtocol();
        
        // Platform Knowledge tools
        case 'get_component_registry':
          return await this.getComponentRegistry();
        case 'get_api_routes':
          return await this.getAPIRoutes(params);
        case 'get_database_schema':
          return await this.getDatabaseSchemaInfo(params);
        case 'get_feature_status':
          return await this.getFeatureStatusInfo();
        
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error: any) {
      console.error(`[ToolExecutor] Error executing ${toolName}:`, error);
      return {
        error: true,
        message: error.message || 'Tool execution failed',
        tool: toolName
      };
    }
  }

  // ============ DATABASE TOOL IMPLEMENTATIONS ============

  private async getPlatformHealth() {
    const [userCount, memoryCount, eventCount, groupCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(memories),
      db.select({ count: sql<number>`count(*)` }).from(events),
      db.select({ count: sql<number>`count(*)` }).from(groups)
    ]);

    return {
      total_users: Number(userCount[0].count),
      total_memories: Number(memoryCount[0].count),
      total_events: Number(eventCount[0].count),
      total_groups: Number(groupCount[0].count),
      timestamp: new Date().toISOString()
    };
  }

  private async getRecentMemories(params: { limit?: number; city?: string }) {
    const limit = Math.min(params.limit || 10, 100); // Max 100
    
    let query = db.select().from(memories).orderBy(desc(memories.createdAt)).limit(limit);
    
    if (params.city) {
      query = query.where(eq(memories.location, params.city)) as any;
    }

    const results = await query;
    
    // Sanitize sensitive data
    return results.map(m => ({
      id: m.id,
      content: m.content?.substring(0, 200), // Truncate for privacy
      location: m.location,
      createdAt: m.createdAt
    }));
  }

  private async getUserStats(params: { metric: string }) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (params.metric) {
      case 'total_count':
        const total = await db.select({ count: sql<number>`count(*)` }).from(users);
        return { metric: 'total_count', value: Number(total[0].count) };
      
      case 'signups_today':
        const todayCount = await db.select({ count: sql<number>`count(*)` })
          .from(users)
          .where(gte(users.createdAt, today));
        return { metric: 'signups_today', value: Number(todayCount[0].count) };
      
      case 'signups_this_week':
        const weekCount = await db.select({ count: sql<number>`count(*)` })
          .from(users)
          .where(gte(users.createdAt, weekAgo));
        return { metric: 'signups_this_week', value: Number(weekCount[0].count) };
      
      case 'active_today':
        // This would need activity tracking - return placeholder for now
        return { metric: 'active_today', value: 0, note: 'Activity tracking not yet implemented' };
      
      default:
        throw new Error(`Unknown metric: ${params.metric}`);
    }
  }

  private async searchMemories(params: { query: string; city?: string; limit?: number }) {
    const limit = Math.min(params.limit || 20, 100);
    
    let query = db.select().from(memories).limit(limit);
    
    // Search in content (case-insensitive)
    const searchPattern = `%${params.query}%`;
    query = query.where(ilike(memories.content, searchPattern)) as any;
    
    if (params.city) {
      query = query.where(and(
        ilike(memories.content, searchPattern),
        eq(memories.location, params.city)
      )) as any;
    }

    const results = await query;
    return results.map(m => ({
      id: m.id,
      content: m.content?.substring(0, 200),
      location: m.location,
      createdAt: m.createdAt
    }));
  }

  private async getEventCount(params: { status: string; city?: string }) {
    const now = new Date();
    let query = db.select({ count: sql<number>`count(*)` }).from(events);

    if (params.status === 'upcoming') {
      query = query.where(gte(events.startDate, now)) as any;
    } else if (params.status === 'past') {
      query = query.where(sql`${events.startDate} < ${now}`) as any;
    }

    const result = await query;
    return {
      status: params.status,
      count: Number(result[0].count),
      city: params.city || 'all'
    };
  }

  private async getGroupsByCity(params: { city: string }) {
    const results = await db.select()
      .from(groups)
      .where(eq(groups.city, params.city))
      .limit(50);

    return results.map(g => ({
      id: g.id,
      name: g.name,
      city: g.city,
      memberCount: g.memberCount
    }));
  }

  // ============ CODEBASE TOOL IMPLEMENTATIONS ============

  private async searchCodebase(params: { query: string; file_type?: string; path?: string }) {
    const fileExt = params.file_type && params.file_type !== 'all' ? `.${params.file_type}` : '';
    const searchPath = params.path || '.';
    
    try {
      // Use grep to search codebase (safe, read-only)
      const grepCmd = `grep -r -i -n "${params.query}" ${searchPath} --include="*${fileExt}" | head -20`;
      const { stdout } = await execAsync(grepCmd, { timeout: 5000 });
      
      const lines = stdout.split('\n').filter(l => l.trim());
      return {
        query: params.query,
        matches: lines.length,
        results: lines.slice(0, 20).map(line => {
          const [file, ...rest] = line.split(':');
          return { file, preview: rest.join(':').substring(0, 100) };
        })
      };
    } catch (error) {
      return { query: params.query, matches: 0, results: [] };
    }
  }

  private async listReactComponents(params: { category?: string }) {
    try {
      const searchPath = params.category === 'ui' ? 'client/src/components/ui' :
                        params.category === 'pages' ? 'client/src/pages' :
                        params.category === 'hooks' ? 'client/src/hooks' :
                        'client/src/components';

      const { stdout } = await execAsync(`find ${searchPath} -name "*.tsx" -o -name "*.ts" | head -50`);
      const files = stdout.split('\n').filter(f => f.trim());
      
      return {
        category: params.category || 'all',
        count: files.length,
        components: files.slice(0, 50)
      };
    } catch (error) {
      return { category: params.category || 'all', count: 0, components: [] };
    }
  }

  private async findApiEndpoints(params: { method?: string }) {
    try {
      const searchPattern = params.method && params.method !== 'all' 
        ? `router.${params.method.toLowerCase()}\\(`
        : 'router\\.(get|post|put|delete|patch)\\(';

      const { stdout } = await execAsync(
        `grep -r -n "${searchPattern}" server/routes --include="*.ts" | head -30`,
        { timeout: 5000 }
      );
      
      const lines = stdout.split('\n').filter(l => l.trim());
      return {
        method: params.method || 'all',
        count: lines.length,
        endpoints: lines.slice(0, 30).map(line => {
          const [file, ...rest] = line.split(':');
          return { file, definition: rest.join(':').trim() };
        })
      };
    } catch (error) {
      return { method: params.method || 'all', count: 0, endpoints: [] };
    }
  }

  // ============ DOCUMENTATION TOOL IMPLEMENTATIONS ============

  private async searchDocumentation(params: { query: string; folder?: string }) {
    try {
      const searchPath = params.folder ? `docs/${params.folder}` : 'docs';
      const { stdout } = await execAsync(
        `grep -r -i -n "${params.query}" ${searchPath} --include="*.md" | head -20`,
        { timeout: 5000 }
      );
      
      const lines = stdout.split('\n').filter(l => l.trim());
      return {
        query: params.query,
        matches: lines.length,
        results: lines.slice(0, 20).map(line => {
          const [file, lineNum, ...rest] = line.split(':');
          return {
            file: file.replace('docs/', ''),
            line: lineNum,
            preview: rest.join(':').substring(0, 150)
          };
        })
      };
    } catch (error) {
      return { query: params.query, matches: 0, results: [] };
    }
  }

  private async readDocumentation(params: { file_path: string }) {
    try {
      const fullPath = join(process.cwd(), 'docs', params.file_path);
      const content = await readFile(fullPath, 'utf-8');
      
      // Return first 2000 chars to avoid token overflow
      return {
        file: params.file_path,
        content: content.substring(0, 2000),
        length: content.length,
        truncated: content.length > 2000
      };
    } catch (error: any) {
      return {
        file: params.file_path,
        error: 'File not found or cannot be read',
        message: error.message
      };
    }
  }

  // ============ DEVELOPER TOOL IMPLEMENTATIONS (WRITE OPERATIONS) ============

  private async readFileContents(params: { file_path: string; start_line?: number; end_line?: number }) {
    try {
      const fullPath = join(process.cwd(), params.file_path);
      const content = await readFile(fullPath, 'utf-8');
      const lines = content.split('\n');
      
      // If line range specified, return only that range
      if (params.start_line || params.end_line) {
        const start = (params.start_line || 1) - 1; // Convert to 0-indexed
        const end = params.end_line || lines.length;
        const selectedLines = lines.slice(start, end);
        
        return {
          file: params.file_path,
          content: selectedLines.join('\n'),
          total_lines: lines.length,
          showing_lines: `${start + 1}-${end}`
        };
      }
      
      // Return full file (up to 3000 chars to avoid token overflow)
      return {
        file: params.file_path,
        content: content.substring(0, 3000),
        total_lines: lines.length,
        truncated: content.length > 3000
      };
    } catch (error: any) {
      return {
        file: params.file_path,
        error: 'File not found or cannot be read',
        message: error.message
      };
    }
  }

  private async editFile(params: { file_path: string; old_string: string; new_string: string }) {
    try {
      // CRITICAL FILE PROTECTION: Block editing of critical files
      const criticalFiles = [
        'package.json',
        'drizzle.config.ts',
        'vite.config.ts',
        'server/vite.ts',
        '.env'
      ];
      
      if (criticalFiles.some(cf => params.file_path.includes(cf))) {
        return {
          success: false,
          error: 'Cannot edit critical file via AI tools',
          file: params.file_path,
          message: 'This file requires manual editing for safety'
        };
      }

      const fullPath = join(process.cwd(), params.file_path);
      const content = await readFile(fullPath, 'utf-8');
      
      // Check if old_string exists
      if (!content.includes(params.old_string)) {
        return {
          success: false,
          error: 'String not found',
          file: params.file_path,
          message: `Could not find: "${params.old_string.substring(0, 100)}"`
        };
      }

      // Make the replacement
      const newContent = content.replace(params.old_string, params.new_string);
      
      // Write back (using fs/promises writeFile)
      const { writeFile: fsWriteFile } = await import('fs/promises');
      await fsWriteFile(fullPath, newContent, 'utf-8');
      
      return {
        success: true,
        file: params.file_path,
        message: 'File edited successfully',
        changes: {
          old: params.old_string.substring(0, 100),
          new: params.new_string.substring(0, 100)
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to edit file',
        file: params.file_path,
        message: error.message
      };
    }
  }

  private async createComponent(params: { component_name: string; component_type: string; props?: string }) {
    try {
      const componentPath = params.component_type === 'ui' 
        ? `client/src/components/ui/${params.component_name}.tsx`
        : params.component_type === 'page'
        ? `client/src/pages/${params.component_name}.tsx`
        : `client/src/components/${params.component_name}.tsx`;

      // Parse props if provided
      let propsInterface = '';
      if (params.props) {
        try {
          const propsObj = JSON.parse(params.props);
          const propsLines = Object.entries(propsObj).map(([key, type]) => `  ${key}: ${type};`);
          propsInterface = `\ninterface ${params.component_name}Props {\n${propsLines.join('\n')}\n}\n`;
        } catch {
          // Invalid JSON, skip props
        }
      }

      const componentCode = `${propsInterface}
export function ${params.component_name}(${params.props ? `props: ${params.component_name}Props` : ''}) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">${params.component_name}</h2>
      {/* TODO: Add component content */}
    </div>
  );
}
`;

      const fullPath = join(process.cwd(), componentPath);
      const { writeFile: fsWriteFile } = await import('fs/promises');
      await fsWriteFile(fullPath, componentCode, 'utf-8');
      
      return {
        success: true,
        component: params.component_name,
        path: componentPath,
        message: `Component created at ${componentPath}`
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to create component',
        message: error.message
      };
    }
  }

  private async runCommand(params: { command: string; args?: string }) {
    try {
      // WHITELIST: Only allow safe commands
      const whitelisted = ['npm install', 'npm run build', 'npm test', 'npm run dev'];
      if (!whitelisted.includes(params.command)) {
        return {
          success: false,
          error: 'Command not whitelisted',
          command: params.command,
          message: 'Only whitelisted commands can be executed'
        };
      }

      const fullCommand = params.args ? `${params.command} ${params.args}` : params.command;
      const { stdout, stderr } = await execAsync(fullCommand, { 
        timeout: 30000, // 30s timeout
        cwd: process.cwd()
      });
      
      return {
        success: true,
        command: fullCommand,
        stdout: stdout.substring(0, 500),
        stderr: stderr.substring(0, 500),
        message: 'Command executed successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Command execution failed',
        command: params.command,
        message: error.message,
        stderr: error.stderr?.substring(0, 500)
      };
    }
  }

  // ============ VISUAL EDITOR TOOL IMPLEMENTATIONS ============

  private async getSelectedElement() {
    // Check if context and selected element exist
    if (!this.context?.visualEditorState?.selectedElement) {
      return {
        error: false,
        selected: false,
        message: 'No element currently selected in the Visual Editor',
        hint: 'User needs to click on an element in the preview first'
      };
    }

    const element = this.context.visualEditorState.selectedElement;
    const previewPath = this.context.visualEditorState.previewPath || '/';

    return {
      error: false,
      selected: true,
      element: {
        tag: element.tagName || element.tag || 'unknown',
        id: element.id || null,
        className: element.className || null,
        textContent: element.textContent || null,
        xpath: element.xpath || null,
        attributes: element.attributes || {},
        computedStyles: element.computedStyles || {},
        boundingBox: element.boundingBox || null
      },
      page: {
        path: previewPath,
        name: this.context.pageName || previewPath
      },
      message: `Selected: <${element.tagName || element.tag}> "${element.textContent?.substring(0, 40) || 'no text'}" on ${previewPath}`
    };
  }

  // ============ MB.MD DOCUMENTATION TOOL IMPLEMENTATIONS ============

  private async readMBMDProtocol() {
    try {
      const fullPath = join(process.cwd(), 'docs', 'MB_MD_QA_PROTOCOL.md');
      const content = await readFile(fullPath, 'utf-8');
      
      return {
        file: 'MB_MD_QA_PROTOCOL.md',
        content: content,
        length: content.length,
        lines: content.split('\n').length,
        summary: 'MB.MD Quality Assurance Protocol - The 5 Non-Negotiable Rules for preventing catastrophic failures'
      };
    } catch (error: any) {
      return {
        error: true,
        file: 'MB_MD_QA_PROTOCOL.md',
        message: 'Failed to read MB.MD QA Protocol',
        details: error.message
      };
    }
  }

  private async readAgentLearnings(params: { phase?: string }) {
    try {
      const fullPath = join(process.cwd(), 'docs', 'AGENT_LEARNINGS.md');
      const content = await readFile(fullPath, 'utf-8');
      
      // If phase filter specified, extract only that phase
      if (params.phase) {
        const phaseNames: Record<string, string> = {
          '1': 'PHASE 1: MAPPING',
          '2': 'PHASE 2: BREAKDOWN',
          '3': 'PHASE 3: MITIGATION',
          '4': 'PHASE 4: DEPLOYMENT'
        };
        
        const phaseName = phaseNames[params.phase];
        if (!phaseName) {
          return {
            error: true,
            message: 'Invalid phase number. Must be 1, 2, 3, or 4'
          };
        }

        // Extract the section for this phase
        const lines = content.split('\n');
        const startPattern = `## 🎯 **${phaseName}`;
        const nextPhasePattern = '## 🎯 **PHASE';
        
        let startIndex = -1;
        let endIndex = lines.length;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(startPattern)) {
            startIndex = i;
          } else if (startIndex !== -1 && i > startIndex && lines[i].includes(nextPhasePattern)) {
            endIndex = i;
            break;
          }
        }
        
        if (startIndex === -1) {
          return {
            error: true,
            message: `Phase ${params.phase} section not found in AGENT_LEARNINGS.md`,
            hint: 'The document structure may have changed'
          };
        }

        const phaseContent = lines.slice(startIndex, endIndex).join('\n');
        
        return {
          file: 'AGENT_LEARNINGS.md',
          phase: params.phase,
          phase_name: phaseName,
          content: phaseContent,
          length: phaseContent.length,
          lines: phaseContent.split('\n').length,
          summary: `Agent Learnings - ${phaseName}`
        };
      }
      
      // Return full document if no phase filter
      return {
        file: 'AGENT_LEARNINGS.md',
        content: content,
        length: content.length,
        lines: content.split('\n').length,
        summary: 'Agent Learnings: Phase-Based Integration Protocol (All Phases)'
      };
    } catch (error: any) {
      return {
        error: true,
        file: 'AGENT_LEARNINGS.md',
        message: 'Failed to read Agent Learnings',
        details: error.message
      };
    }
  }

  private async searchMBMDDocs(params: { query: string }) {
    try {
      // Search all MB_MD*.md files in docs folder
      const { stdout } = await execAsync(
        `grep -r -i -n "${params.query}" docs/ --include="MB_MD*.md" | head -50`,
        { timeout: 5000 }
      );
      
      const lines = stdout.split('\n').filter(l => l.trim());
      
      return {
        query: params.query,
        matches: lines.length,
        files_searched: 'docs/MB_MD*.md',
        results: lines.slice(0, 50).map(line => {
          const [filePath, lineNum, ...rest] = line.split(':');
          return {
            file: filePath.replace('docs/', ''),
            line: lineNum,
            preview: rest.join(':').substring(0, 200)
          };
        }),
        hint: 'Use read_mb_md_protocol, read_agent_learnings, or get_integration_protocol to read full documents'
      };
    } catch (error: any) {
      // If grep returns no matches, it exits with code 1
      if (error.code === 1 && !error.stderr) {
        return {
          query: params.query,
          matches: 0,
          results: [],
          message: 'No matches found in MB.MD documentation'
        };
      }
      
      return {
        error: true,
        query: params.query,
        message: 'Search failed',
        details: error.message
      };
    }
  }

  private async getIntegrationProtocol() {
    try {
      const fullPath = join(process.cwd(), 'docs', 'INTEGRATION_PROTOCOL.md');
      const content = await readFile(fullPath, 'utf-8');
      
      return {
        file: 'INTEGRATION_PROTOCOL.md',
        content: content,
        length: content.length,
        lines: content.split('\n').length,
        summary: 'Integration Protocol - Wire up everything immediately. Build + Import + Connect + Test = COMPLETE'
      };
    } catch (error: any) {
      return {
        error: true,
        file: 'INTEGRATION_PROTOCOL.md',
        message: 'Failed to read Integration Protocol',
        details: error.message
      };
    }
  }

  // ============ PLATFORM KNOWLEDGE TOOL IMPLEMENTATIONS ============

  private async getComponentRegistry() {
    try {
      const components = await scanComponentRegistry();
      
      return {
        total_components: components.length,
        components: components,
        scanned_directory: 'client/src/components/',
        timestamp: new Date().toISOString(),
        summary: `Found ${components.length} React components across the platform`
      };
    } catch (error: any) {
      return {
        error: true,
        message: 'Failed to scan component registry',
        details: error.message
      };
    }
  }

  private async getAPIRoutes(params: { method?: string }) {
    try {
      const allRoutes = await scanAPIRoutes();
      
      // Filter by method if specified
      const filteredRoutes = params.method && params.method !== 'all'
        ? allRoutes.filter(r => r.method === params.method.toUpperCase())
        : allRoutes;
      
      // Group by authentication type
      const withAuth = filteredRoutes.filter(r => r.hasAuth);
      const withoutAuth = filteredRoutes.filter(r => !r.hasAuth);
      
      return {
        total_routes: filteredRoutes.length,
        authenticated_routes: withAuth.length,
        public_routes: withoutAuth.length,
        routes: filteredRoutes,
        scanned_directory: 'server/routes/',
        filter: params.method || 'all',
        timestamp: new Date().toISOString(),
        summary: `Found ${filteredRoutes.length} API routes (${withAuth.length} protected, ${withoutAuth.length} public)`
      };
    } catch (error: any) {
      return {
        error: true,
        message: 'Failed to scan API routes',
        details: error.message
      };
    }
  }

  private async getDatabaseSchemaInfo(params: { table_name?: string }) {
    try {
      const allTables = await getDatabaseSchema();
      
      // Filter by table name if specified
      const filteredTables = params.table_name
        ? allTables.filter(t => t.name === params.table_name)
        : allTables;
      
      if (params.table_name && filteredTables.length === 0) {
        return {
          error: true,
          message: `Table "${params.table_name}" not found in schema`,
          available_tables: allTables.map(t => t.name)
        };
      }
      
      return {
        total_tables: filteredTables.length,
        tables: filteredTables,
        schema_file: 'shared/schema.ts',
        filter: params.table_name || 'all',
        timestamp: new Date().toISOString(),
        summary: params.table_name 
          ? `Schema for table "${params.table_name}"`
          : `Found ${filteredTables.length} database tables in schema`
      };
    } catch (error: any) {
      return {
        error: true,
        message: 'Failed to parse database schema',
        details: error.message
      };
    }
  }

  private async getFeatureStatusInfo() {
    try {
      const features = await getFeatureStatus();
      
      // Calculate summary stats
      const completed = features.filter(f => f.status === 'completed').length;
      const inProgress = features.filter(f => f.status === 'in_progress').length;
      const planned = features.filter(f => f.status === 'planned').length;
      const blocked = features.filter(f => f.status === 'blocked').length;
      
      // Calculate average completion
      const avgCompletion = features.length > 0
        ? Math.round(features.reduce((sum, f) => sum + f.completion, 0) / features.length)
        : 0;
      
      return {
        total_features: features.length,
        completed_count: completed,
        in_progress_count: inProgress,
        planned_count: planned,
        blocked_count: blocked,
        average_completion: avgCompletion,
        features: features,
        timestamp: new Date().toISOString(),
        summary: `Platform status: ${avgCompletion}% complete (${completed} done, ${inProgress} in progress, ${planned} planned)`
      };
    } catch (error: any) {
      return {
        error: true,
        message: 'Failed to get feature status',
        details: error.message
      };
    }
  }
}
