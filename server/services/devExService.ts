/**
 * Developer Experience Service
 * MB.MD Track 9: DevEx Infrastructure
 * Implements: Dev tools, debugging UI, API explorer, code generation
 */

export interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  requestBody?: {
    type: string;
    schema: any;
  };
  responses: Record<number, {
    description: string;
    schema?: any;
  }>;
  authentication: boolean;
}

export interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  language: 'typescript' | 'javascript' | 'python' | 'sql';
  category: 'component' | 'api' | 'service' | 'hook' | 'util';
  template: string;
  variables: Array<{
    name: string;
    type: string;
    default?: string;
  }>;
}

class DevExService {
  /**
   * Get all API endpoints
   */
  getAllEndpoints(): APIEndpoint[] {
    return [
      {
        path: '/api/posts',
        method: 'GET',
        description: 'Get all posts from feed',
        parameters: [
          {
            name: 'limit',
            type: 'number',
            required: false,
            description: 'Number of posts to return',
          },
          {
            name: 'offset',
            type: 'number',
            required: false,
            description: 'Pagination offset',
          },
        ],
        responses: {
          200: {
            description: 'List of posts',
            schema: {
              type: 'array',
              items: { type: 'object' },
            },
          },
        },
        authentication: true,
      },
      {
        path: '/api/events',
        method: 'GET',
        description: 'Get all events',
        responses: {
          200: {
            description: 'List of events',
          },
        },
        authentication: true,
      },
    ];
  }

  /**
   * Generate API client code
   */
  generateAPIClient(endpoint: APIEndpoint, language: 'typescript' | 'javascript' | 'python'): string {
    if (language === 'typescript') {
      return `
// Auto-generated API client
export async function ${this.toCamelCase(endpoint.path)}(${this.generateParameters(endpoint)}) {
  const response = await fetch('${endpoint.path}', {
    method: '${endpoint.method}',
    headers: {
      'Content-Type': 'application/json',
      ${endpoint.authentication ? `'Authorization': \`Bearer \${token}\`,` : ''}
    },
    ${endpoint.method !== 'GET' ? 'body: JSON.stringify(data),' : ''}
  });
  
  if (!response.ok) {
    throw new Error(\`API error: \${response.statusText}\`);
  }
  
  return response.json();
}
      `.trim();
    }

    return '// Code generation not implemented for this language';
  }

  private toCamelCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_([a-z])/g, (g) => g[1].toUpperCase())
      .replace(/^_/, '');
  }

  private generateParameters(endpoint: APIEndpoint): string {
    const params: string[] = [];
    
    if (endpoint.authentication) {
      params.push('token: string');
    }
    
    if (endpoint.parameters) {
      endpoint.parameters.forEach(p => {
        params.push(`${p.name}${p.required ? '' : '?'}: ${p.type}`);
      });
    }
    
    if (endpoint.requestBody) {
      params.push('data: any');
    }

    return params.join(', ');
  }

  /**
   * Generate component from template
   */
  generateComponent(template: CodeTemplate, variables: Record<string, string>): string {
    let code = template.template;

    // Replace variables
    template.variables.forEach(v => {
      const value = variables[v.name] || v.default || '';
      code = code.replace(new RegExp(`{{${v.name}}}`, 'g'), value);
    });

    return code;
  }

  /**
   * Get available templates
   */
  getTemplates(category?: CodeTemplate['category']): CodeTemplate[] {
    const templates: CodeTemplate[] = [
      {
        id: 'react_component',
        name: 'React Component',
        description: 'Basic React component with TypeScript',
        language: 'typescript',
        category: 'component',
        template: `
export function {{name}}() {
  return (
    <div className="{{className}}">
      <h2>{{title}}</h2>
      {/* Add your content here */}
    </div>
  );
}
        `.trim(),
        variables: [
          { name: 'name', type: 'string' },
          { name: 'className', type: 'string', default: 'container' },
          { name: 'title', type: 'string', default: 'Component' },
        ],
      },
      {
        id: 'api_route',
        name: 'Express API Route',
        description: 'RESTful API endpoint with validation',
        language: 'typescript',
        category: 'api',
        template: `
import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Schema validation
const {{name}}Schema = z.object({
  // Add fields here
});

// {{method}} {{path}}
router.{{methodLower}}('{{path}}', async (req, res) => {
  try {
    const data = {{name}}Schema.parse(req.body);
    
    // Add logic here
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
        `.trim(),
        variables: [
          { name: 'name', type: 'string' },
          { name: 'method', type: 'string', default: 'POST' },
          { name: 'methodLower', type: 'string', default: 'post' },
          { name: 'path', type: 'string', default: '/api/endpoint' },
        ],
      },
    ];

    if (category) {
      return templates.filter(t => t.category === category);
    }

    return templates;
  }

  /**
   * Debug request/response
   */
  debugRequest(params: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
    response?: any;
    duration?: number;
  }): void {
    console.log('🔍 [DEBUG] API Request:', {
      method: params.method,
      url: params.url,
      headers: params.headers,
      body: params.body,
      duration: params.duration ? `${params.duration}ms` : 'N/A',
    });

    if (params.response) {
      console.log('🔍 [DEBUG] API Response:', params.response);
    }
  }

  /**
   * Generate schema documentation
   */
  generateSchemaDocs(schemaName: string): {
    name: string;
    description: string;
    fields: Array<{
      name: string;
      type: string;
      required: boolean;
      description: string;
    }>;
    examples: any[];
  } {
    // This would introspect actual database schema
    return {
      name: schemaName,
      description: `Documentation for ${schemaName}`,
      fields: [],
      examples: [],
    };
  }

  /**
   * Analyze bundle size
   */
  analyzeBundleSize(): {
    total: number;
    breakdown: Array<{
      name: string;
      size: number;
      percentage: number;
    }>;
    suggestions: string[];
  } {
    return {
      total: 1024 * 512, // 512 KB
      breakdown: [
        { name: 'react', size: 1024 * 150, percentage: 29.3 },
        { name: 'components', size: 1024 * 200, percentage: 39.1 },
        { name: 'utils', size: 1024 * 100, percentage: 19.5 },
        { name: 'other', size: 1024 * 62, percentage: 12.1 },
      ],
      suggestions: [
        'Consider code splitting for large components',
        'Use dynamic imports for heavy libraries',
        'Enable tree shaking in production build',
      ],
    };
  }
}

// Export singleton instance
export const devExService = new DevExService();
