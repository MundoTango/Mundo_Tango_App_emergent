/**
 * TOOL REGISTRY - All Vibe Coding Tools
 * MB.MD SIMULTANEOUS - Agent #7: Tools Expansion Specialist
 * 
 * Central registry for all 30 tools
 * Used by ManagerAgent for function calling
 * 
 * Created: October 23, 2025
 */

import { eventToolSchemas, eventTools } from './eventTools';
import { profileToolSchemas, profileTools } from './profileTools';
import { groupToolSchemas, groupTools } from './groupTools';
import { memoryToolSchemas, memoryTools } from './memoryTools';
import { codeToolSchemas, codeTools } from './codeTools';

/**
 * ALL TOOL SCHEMAS (for Claude function calling)
 */
export const ALL_TOOL_SCHEMAS = [
  // Event tools (5)
  eventToolSchemas.create_event,
  eventToolSchemas.search_events,
  eventToolSchemas.rsvp_event,
  eventToolSchemas.get_event_details,
  eventToolSchemas.update_event,

  // Profile tools (5)
  profileToolSchemas.get_profile,
  profileToolSchemas.update_profile,
  profileToolSchemas.search_users,
  profileToolSchemas.follow_user,
  profileToolSchemas.get_followers,

  // Group tools (5)
  groupToolSchemas.create_group,
  groupToolSchemas.search_groups,
  groupToolSchemas.join_group,
  groupToolSchemas.get_group_members,
  groupToolSchemas.update_group,

  // Memory/Post tools (5)
  memoryToolSchemas.create_memory,
  memoryToolSchemas.search_memories,
  memoryToolSchemas.like_memory,
  memoryToolSchemas.comment_on_memory,
  memoryToolSchemas.get_memory_feed,

  // Code manipulation tools (10)
  codeToolSchemas.read_file,
  codeToolSchemas.write_file,
  codeToolSchemas.search_code,
  codeToolSchemas.replace_in_file,
  codeToolSchemas.get_file_tree,
  codeToolSchemas.run_command,
  codeToolSchemas.install_package,
  codeToolSchemas.get_imports,
  codeToolSchemas.find_usages,
  codeToolSchemas.refactor_rename
];

/**
 * ALL TOOL IMPLEMENTATIONS
 */
export const ALL_TOOLS: Record<string, (params: any) => Promise<any>> = {
  // Event tools
  create_event: eventTools.create_event,
  search_events: eventTools.search_events,
  rsvp_event: eventTools.rsvp_event,
  get_event_details: eventTools.get_event_details,
  update_event: eventTools.update_event,

  // Profile tools
  get_profile: profileTools.get_profile,
  update_profile: profileTools.update_profile,
  search_users: profileTools.search_users,
  follow_user: profileTools.follow_user,
  get_followers: profileTools.get_followers,

  // Group tools
  create_group: groupTools.create_group,
  search_groups: groupTools.search_groups,
  join_group: groupTools.join_group,
  get_group_members: groupTools.get_group_members,
  update_group: groupTools.update_group,

  // Memory tools
  create_memory: memoryTools.create_memory,
  search_memories: memoryTools.search_memories,
  like_memory: memoryTools.like_memory,
  comment_on_memory: memoryTools.comment_on_memory,
  get_memory_feed: memoryTools.get_memory_feed,

  // Code tools
  read_file: codeTools.read_file,
  write_file: codeTools.write_file,
  search_code: codeTools.search_code,
  replace_in_file: codeTools.replace_in_file,
  get_file_tree: codeTools.get_file_tree,
  run_command: codeTools.run_command,
  install_package: codeTools.install_package,
  get_imports: codeTools.get_imports,
  find_usages: codeTools.find_usages,
  refactor_rename: codeTools.refactor_rename
};

/**
 * Execute a tool by name
 */
export async function executeTool(toolName: string, params: any): Promise<any> {
  const tool = ALL_TOOLS[toolName];

  if (!tool) {
    return {
      success: false,
      error: `Unknown tool: ${toolName}`
    };
  }

  try {
    return await tool(params);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Tool execution failed'
    };
  }
}

/**
 * Get tool categories
 */
export function getToolCategories() {
  return {
    'Tango Events': [
      'create_event',
      'search_events',
      'rsvp_event',
      'get_event_details',
      'update_event'
    ],
    'Tango Profiles': [
      'get_profile',
      'update_profile',
      'search_users',
      'follow_user',
      'get_followers'
    ],
    'Tango Groups': [
      'create_group',
      'search_groups',
      'join_group',
      'get_group_members',
      'update_group'
    ],
    'Memories/Posts': [
      'create_memory',
      'search_memories',
      'like_memory',
      'comment_on_memory',
      'get_memory_feed'
    ],
    'Code Manipulation': [
      'read_file',
      'write_file',
      'search_code',
      'replace_in_file',
      'get_file_tree',
      'run_command',
      'install_package',
      'get_imports',
      'find_usages',
      'refactor_rename'
    ]
  };
}

/**
 * Get total tool count
 */
export function getToolStats() {
  return {
    total: Object.keys(ALL_TOOLS).length,
    categories: Object.keys(getToolCategories()).length,
    byCategory: Object.entries(getToolCategories()).map(([category, tools]) => ({
      category,
      count: tools.length
    }))
  };
}
