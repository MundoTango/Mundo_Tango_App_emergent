/**
 * Mr Blue AI Tool Definitions
 * MB.MD: Omniscient Mode - Full platform access via AI function calling
 * Claude 3.5 Sonnet native tool support
 */

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

// ============ DATABASE TOOLS ============

export const getDatabaseTools = (): ToolDefinition[] => [
  {
    name: "get_platform_health",
    description: "Get overall platform health metrics including total users, memories, events, groups, and activity stats",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "get_recent_memories",
    description: "Get the most recent memories (posts) from the platform with optional filters",
    input_schema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of memories to return (max 100)",
          default: 10
        },
        city: {
          type: "string",
          description: "Filter by city (optional)"
        }
      },
      required: []
    }
  },
  {
    name: "get_user_stats",
    description: "Get statistics about users on the platform",
    input_schema: {
      type: "object",
      properties: {
        metric: {
          type: "string",
          enum: ["total_count", "signups_today", "signups_this_week", "active_today"],
          description: "Which metric to retrieve"
        }
      },
      required: ["metric"]
    }
  },
  {
    name: "search_memories",
    description: "Search through memories by content, hashtags, or location",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (searches content and hashtags)"
        },
        city: {
          type: "string",
          description: "Filter by city (optional)"
        },
        limit: {
          type: "number",
          description: "Max results to return (default 20, max 100)",
          default: 20
        }
      },
      required: ["query"]
    }
  },
  {
    name: "get_event_count",
    description: "Count events on the platform with optional filters",
    input_schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["upcoming", "past", "all"],
          description: "Event status filter"
        },
        city: {
          type: "string",
          description: "Filter by city (optional)"
        }
      },
      required: ["status"]
    }
  },
  {
    name: "get_groups_by_city",
    description: "List tango groups in a specific city",
    input_schema: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "City name to search for groups"
        }
      },
      required: ["city"]
    }
  }
];

// ============ CODEBASE TOOLS ============

export const getCodebaseTools = (): ToolDefinition[] => [
  {
    name: "search_codebase",
    description: "Search through the codebase for files, components, functions, or code patterns. Returns file paths and matching lines.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "What to search for (component name, function, pattern, etc.)"
        },
        file_type: {
          type: "string",
          enum: ["tsx", "ts", "md", "json", "all"],
          description: "File type to search in (default: all)"
        },
        path: {
          type: "string",
          description: "Specific path to search in (optional, e.g. 'client/src/components')"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "list_react_components",
    description: "List all React components in the project, organized by category (UI, pages, etc.)",
    input_schema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["ui", "pages", "hooks", "all"],
          description: "Which category of components to list"
        }
      },
      required: []
    }
  },
  {
    name: "find_api_endpoints",
    description: "Find all API endpoints in the backend with their HTTP methods",
    input_schema: {
      type: "object",
      properties: {
        method: {
          type: "string",
          enum: ["GET", "POST", "PUT", "DELETE", "PATCH", "all"],
          description: "Filter by HTTP method (optional)"
        }
      },
      required: []
    }
  }
];

// ============ DOCUMENTATION TOOLS ============

export const getDocumentationTools = (): ToolDefinition[] => [
  {
    name: "search_documentation",
    description: "Search through all documentation in the docs/ folder for specific information",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "What to search for in documentation"
        },
        folder: {
          type: "string",
          description: "Specific docs subfolder to search (optional, e.g. 'MrBlue', 'ESA_Agents')"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "read_documentation",
    description: "Read a specific documentation file from the docs/ folder",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the documentation file (e.g. 'MrBlue/mb.md', 'MB_MD_QA_PROTOCOL.md')"
        }
      },
      required: ["file_path"]
    }
  }
];

// ============ DEVELOPER TOOLS (WRITE OPERATIONS) ============

export const getDeveloperTools = (): ToolDefinition[] => [
  {
    name: "edit_file",
    description: "Edit an existing file by replacing old content with new content. Use this to add emojis, modify text, or update code. SUPER ADMIN ONLY.",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file to edit (e.g. 'client/src/pages/landing.tsx')"
        },
        old_string: {
          type: "string",
          description: "The exact string to find and replace (must match exactly including whitespace)"
        },
        new_string: {
          type: "string",
          description: "The new string to replace with"
        }
      },
      required: ["file_path", "old_string", "new_string"]
    }
  },
  {
    name: "read_file",
    description: "Read the contents of a file to see what's in it before editing. Always read before editing.",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file to read (e.g. 'client/src/pages/landing.tsx')"
        },
        start_line: {
          type: "number",
          description: "Optional: Line number to start reading from (1-indexed)"
        },
        end_line: {
          type: "number",
          description: "Optional: Line number to stop reading at (1-indexed)"
        }
      },
      required: ["file_path"]
    }
  },
  {
    name: "create_component",
    description: "Create a new React component file with boilerplate code. SUPER ADMIN ONLY.",
    input_schema: {
      type: "object",
      properties: {
        component_name: {
          type: "string",
          description: "Name of the component (e.g. 'SmileIcon', 'WelcomeCard')"
        },
        component_type: {
          type: "string",
          enum: ["ui", "page", "feature"],
          description: "Type of component: ui (reusable UI), page (full page), or feature (business logic)"
        },
        props: {
          type: "string",
          description: "Optional: Props interface as JSON string (e.g. '{\"text\": \"string\", \"onClick\": \"() => void\"}')"
        }
      },
      required: ["component_name", "component_type"]
    }
  },
  {
    name: "run_command",
    description: "Execute a terminal command (npm install, build, test, etc.). SUPER ADMIN ONLY. Whitelisted commands only for safety.",
    input_schema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          enum: ["npm install", "npm run build", "npm test", "npm run dev"],
          description: "Command to run (whitelisted for safety)"
        },
        args: {
          type: "string",
          description: "Optional: Additional arguments (e.g. package name for npm install)"
        }
      },
      required: ["command"]
    }
  }
];

// ============ COMBINED TOOL SET ============

export const getAllTools = (): ToolDefinition[] => [
  ...getDatabaseTools(),
  ...getCodebaseTools(),
  ...getDocumentationTools(),
  ...getDeveloperTools()
];

// ============ PERMISSION LEVELS ============

export enum ToolPermissionLevel {
  PUBLIC = 1,      // All authenticated users
  SUPER_ADMIN = 2, // Super admins only
  SYSTEM = 3       // System/dev mode only (not exposed)
}

export const toolPermissions: Record<string, ToolPermissionLevel> = {
  // Public tools (safe, read-only)
  'get_platform_health': ToolPermissionLevel.PUBLIC,
  'search_documentation': ToolPermissionLevel.PUBLIC,
  'read_documentation': ToolPermissionLevel.PUBLIC,
  
  // Super Admin tools (database/codebase access)
  'get_recent_memories': ToolPermissionLevel.SUPER_ADMIN,
  'get_user_stats': ToolPermissionLevel.SUPER_ADMIN,
  'search_memories': ToolPermissionLevel.SUPER_ADMIN,
  'get_event_count': ToolPermissionLevel.SUPER_ADMIN,
  'get_groups_by_city': ToolPermissionLevel.SUPER_ADMIN,
  'search_codebase': ToolPermissionLevel.SUPER_ADMIN,
  'list_react_components': ToolPermissionLevel.SUPER_ADMIN,
  'find_api_endpoints': ToolPermissionLevel.SUPER_ADMIN,
  
  // Developer tools (WRITE OPERATIONS - Super Admin only)
  'edit_file': ToolPermissionLevel.SUPER_ADMIN,
  'read_file': ToolPermissionLevel.SUPER_ADMIN,
  'create_component': ToolPermissionLevel.SUPER_ADMIN,
  'run_command': ToolPermissionLevel.SUPER_ADMIN,
};
