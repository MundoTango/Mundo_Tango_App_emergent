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

const execAsync = promisify(exec);

export class ToolExecutor {
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
}
