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

// ============ MB.MD DOCUMENTATION TOOLS ============

export const getMBMDDocumentationTools = (): ToolDefinition[] => [
  {
    name: "read_mb_md_protocol",
    description: "Read the complete MB.MD QA Protocol document - the methodology for preventing catastrophic failures. Contains the 5 Non-Negotiable Rules that all agents must follow.",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "read_agent_learnings",
    description: "Read Agent Learnings document with phase-based integration protocol. Contains critical lessons learned from Mr Blue and Visual Editor projects. Optionally filter by phase (1=Mapping, 2=Breakdown, 3=Mitigation, 4=Deployment).",
    input_schema: {
      type: "object",
      properties: {
        phase: {
          type: "string",
          enum: ["1", "2", "3", "4"],
          description: "Optional: Filter by phase number (1=Mapping, 2=Breakdown, 3=Mitigation, 4=Deployment)"
        }
      },
      required: []
    }
  },
  {
    name: "search_mb_md_docs",
    description: "Search across all MB.MD documentation files (MB_MD*.md) for specific information using grep. Returns matching lines with file paths and line numbers.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query to find in MB.MD documentation"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "get_integration_protocol",
    description: "Read the Integration Protocol document - mandatory checklist for wiring up components immediately after building them. Critical for avoiding the 'component exists but feature doesn't work' fallacy.",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  }
];

// ============ PLATFORM KNOWLEDGE TOOLS ============

export const getPlatformKnowledgeTools = (): ToolDefinition[] => [
  {
    name: "get_component_registry",
    description: "Returns a structured list of all React components in the project. Scans client/src/components/ recursively and extracts component names, file paths, and exported functions/components.",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "get_api_routes",
    description: "Returns all backend API endpoints with their HTTP methods and authentication requirements. Scans server/routes/*.ts files to extract route definitions.",
    input_schema: {
      type: "object",
      properties: {
        method: {
          type: "string",
          enum: ["GET", "POST", "PUT", "DELETE", "PATCH", "all"],
          description: "Optional: Filter routes by HTTP method (default: all)"
        }
      },
      required: []
    }
  },
  {
    name: "get_database_schema",
    description: "Returns database tables with columns, types, relationships, and indexes. Parses shared/schema.ts to extract Drizzle table definitions.",
    input_schema: {
      type: "object",
      properties: {
        table_name: {
          type: "string",
          description: "Optional: Get schema for a specific table only"
        }
      },
      required: []
    }
  },
  {
    name: "get_feature_status",
    description: "Returns current platform feature completion status. Checks for status documentation or analyzes the codebase to determine which features are completed, in progress, or planned.",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  }
];

// ============ VISUAL EDITOR TOOLS ============

export const getVisualEditorTools = (): ToolDefinition[] => [
  {
    name: "get_selected_element",
    description: "Get information about the currently selected HTML element in the Visual Editor. Use this when user asks 'what element', 'what component', 'what am I on', or 'describe this'",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  ...getMBMDDocumentationTools()
];

// ============ COMBINED TOOL SET ============

export const getAllTools = (): ToolDefinition[] => [
  ...getDatabaseTools(),
  ...getCodebaseTools(),
  ...getDocumentationTools(),
  ...getDeveloperTools(),
  ...getPlatformKnowledgeTools(),
  ...getVisualEditorTools(),
  ...getMBMDDocumentationTools()
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
  
  // Visual Editor tools (Context awareness)
  'get_selected_element': ToolPermissionLevel.PUBLIC, // All users can query what they selected

  // MB.MD Documentation tools (Super Admin only - methodology access)
  'read_mb_md_protocol': ToolPermissionLevel.SUPER_ADMIN,
  'read_agent_learnings': ToolPermissionLevel.SUPER_ADMIN,
  'search_mb_md_docs': ToolPermissionLevel.SUPER_ADMIN,
  'get_integration_protocol': ToolPermissionLevel.SUPER_ADMIN,

  // Platform Knowledge tools (Super Admin only - architecture analysis)
  'get_component_registry': ToolPermissionLevel.SUPER_ADMIN,
  'get_api_routes': ToolPermissionLevel.SUPER_ADMIN,
  'get_database_schema': ToolPermissionLevel.SUPER_ADMIN,
  'get_feature_status': ToolPermissionLevel.SUPER_ADMIN,
};
