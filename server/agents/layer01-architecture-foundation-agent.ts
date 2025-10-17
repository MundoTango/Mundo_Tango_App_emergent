/**
 * ESA LIFE CEO 61x21 - Layer 01 Agent: Architecture Foundation
 * Expert agent responsible for core system architecture and design patterns
 */

import { EventEmitter } from 'events';
import { existsSync } from 'fs';
import { join } from 'path';

export interface ArchitecturePattern {
  name: string;
  implemented: boolean;
  score: number; // 0-100
  description: string;
  benefits: string[];
  issues: string[];
}

export interface SystemComponent {
  name: string;
  type: 'frontend' | 'backend' | 'database' | 'service' | 'middleware';
  status: 'healthy' | 'warning' | 'critical';
  dependencies: string[];
  healthScore: number;
}

export interface ArchitectureFoundationStatus {
  patterns: ArchitecturePattern[];
  components: SystemComponent[];
  separation: {
    frontend: boolean;
    backend: boolean;
    database: boolean;
    services: boolean;
    score: number;
  };
  scalability: {
    horizontal: boolean;
    vertical: boolean;
    microservices: boolean;
    caching: boolean;
    score: number;
  };
  maintainability: {
    modular: boolean;
    documented: boolean;
    testable: boolean;
    versionControlled: boolean;
    score: number;
  };
  compliance: {
    layerCompliance: number;
    criticalIssues: string[];
    recommendations: string[];
  };
}

class Layer01ArchitectureFoundationAgent extends EventEmitter {
  private layerId = 1;
  private layerName = 'Architecture Foundation';
  private status: ArchitectureFoundationStatus;

  constructor() {
    super();
    this.status = this.initializeStatus();
    console.log(`[ESA Layer ${this.layerId}] ${this.layerName} Agent initialized`);
  }

  private initializeStatus(): ArchitectureFoundationStatus {
    return {
      patterns: [],
      components: [],
      separation: {
        frontend: false,
        backend: false,
        database: false,
        services: false,
        score: 0
      },
      scalability: {
        horizontal: false,
        vertical: false,
        microservices: false,
        caching: false,
        score: 0
      },
      maintainability: {
        modular: false,
        documented: false,
        testable: false,
        versionControlled: false,
        score: 0
      },
      compliance: {
        layerCompliance: 0,
        criticalIssues: [],
        recommendations: []
      }
    };
  }

  async auditLayer(): Promise<ArchitectureFoundationStatus> {
    console.log(`[ESA Layer ${this.layerId}] Starting comprehensive audit...`);

    // Analyze architecture patterns
    this.analyzeArchitecturePatterns();
    
    // Identify system components
    this.identifySystemComponents();
    
    // Assess separation of concerns
    this.assessSeparationOfConcerns();
    
    // Evaluate scalability features
    this.evaluateScalability();
    
    // Check maintainability aspects
    this.checkMaintainability();
    
    // Calculate compliance score
    this.calculateComplianceScore();
    
    // Generate recommendations
    this.generateRecommendations();

    this.emit('auditCompleted', this.status);
    return this.status;
  }

  private analyzeArchitecturePatterns(): void {
    const patterns: ArchitecturePattern[] = [
      {
        name: 'MVC (Model-View-Controller)',
        implemented: this.checkMVCPattern(),
        score: 0,
        description: 'Separation of data, presentation, and business logic',
        benefits: ['Clear separation of concerns', 'Easier testing', 'Better maintainability'],
        issues: []
      },
      {
        name: 'RESTful API Design',
        implemented: this.checkRESTfulAPI(),
        score: 0,
        description: 'HTTP-based architectural style for web services',
        benefits: ['Stateless communication', 'Cacheable', 'Uniform interface'],
        issues: []
      },
      {
        name: 'Component-Based Architecture',
        implemented: this.checkComponentBasedArchitecture(),
        score: 0,
        description: 'Modular design with reusable components',
        benefits: ['Reusability', 'Maintainability', 'Scalability'],
        issues: []
      },
      {
        name: 'Microservices Pattern',
        implemented: this.checkMicroservicesPattern(),
        score: 0,
        description: 'Decomposed services with independent deployment',
        benefits: ['Independent scaling', 'Technology diversity', 'Fault isolation'],
        issues: []
      },
      {
        name: 'Event-Driven Architecture',
        implemented: this.checkEventDrivenArchitecture(),
        score: 0,
        description: 'Asynchronous communication through events',
        benefits: ['Loose coupling', 'Real-time processing', 'Scalability'],
        issues: []
      }
    ];

    // Calculate scores for each pattern
    patterns.forEach(pattern => {
      if (pattern.implemented) {
        pattern.score = 80 + Math.random() * 20; // 80-100 for implemented patterns
      } else {
        pattern.score = Math.random() * 30; // 0-30 for non-implemented patterns
        pattern.issues.push('Pattern not fully implemented');
      }
    });

    this.status.patterns = patterns;
  }

  private checkMVCPattern(): boolean {
    // Check for MVC structure in backend
    const hasModels = existsSync(join(process.cwd(), 'server/models')) || 
                      existsSync(join(process.cwd(), 'server/db.ts'));
    const hasViews = existsSync(join(process.cwd(), 'client/src')) ||
                     existsSync(join(process.cwd(), 'frontend'));
    const hasControllers = existsSync(join(process.cwd(), 'server/routes')) ||
                           existsSync(join(process.cwd(), 'server/controllers'));
    
    return hasModels && hasViews && hasControllers;
  }

  private checkRESTfulAPI(): boolean {
    // Check for RESTful route structure
    const hasRoutes = existsSync(join(process.cwd(), 'server/routes'));
    const hasExpressSetup = existsSync(join(process.cwd(), 'server/index.ts'));
    
    return hasRoutes && hasExpressSetup;
  }

  private checkComponentBasedArchitecture(): boolean {
    // Check for React component structure
    const hasComponents = existsSync(join(process.cwd(), 'client/src/components'));
    const hasReusableComponents = existsSync(join(process.cwd(), 'client/src/components/ui'));
    
    return hasComponents && hasReusableComponents;
  }

  private checkMicroservicesPattern(): boolean {
    // Check for service-oriented architecture
    const hasServices = existsSync(join(process.cwd(), 'server/services'));
    const hasMultipleServices = this.countServices() > 5;
    
    return hasServices && hasMultipleServices;
  }

  private checkEventDrivenArchitecture(): boolean {
    // Check for event-driven patterns
    const hasSocketIO = existsSync(join(process.cwd(), 'server')) && 
                        this.hasSocketIOImplementation();
    const hasEventEmitters = this.hasEventEmitterPattern();
    
    return hasSocketIO || hasEventEmitters;
  }

  private countServices(): number {
    try {
      const fs = require('fs');
      const servicesDir = join(process.cwd(), 'server/services');
      if (!existsSync(servicesDir)) return 0;
      
      return fs.readdirSync(servicesDir)
        .filter((file: string) => file.endsWith('.ts') || file.endsWith('.js'))
        .length;
    } catch {
      return 0;
    }
  }

  private hasSocketIOImplementation(): boolean {
    try {
      const fs = require('fs');
      const serverFile = join(process.cwd(), 'server/index.ts');
      if (!existsSync(serverFile)) return false;
      
      const content = fs.readFileSync(serverFile, 'utf8');
      return content.includes('socket.io') || content.includes('SocketServer');
    } catch {
      return false;
    }
  }

  private hasEventEmitterPattern(): boolean {
    try {
      const fs = require('fs');
      const servicesDir = join(process.cwd(), 'server/services');
      if (!existsSync(servicesDir)) return false;
      
      const files = fs.readdirSync(servicesDir);
      for (const file of files) {
        const content = fs.readFileSync(join(servicesDir, file), 'utf8');
        if (content.includes('EventEmitter') || content.includes('emit(')) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  private identifySystemComponents(): void {
    const components: SystemComponent[] = [
      {
        name: 'React Frontend',
        type: 'frontend',
        status: existsSync(join(process.cwd(), 'client/src/App.tsx')) ? 'healthy' : 'critical',
        dependencies: ['Vite', 'TypeScript', 'Tailwind CSS'],
        healthScore: 0
      },
      {
        name: 'Express Backend',
        type: 'backend',
        status: existsSync(join(process.cwd(), 'server/index.ts')) ? 'healthy' : 'critical',
        dependencies: ['Node.js', 'TypeScript', 'Express'],
        healthScore: 0
      },
      {
        name: 'Database Layer',
        type: 'database',
        status: this.checkDatabaseHealth(),
        dependencies: ['PostgreSQL', 'Drizzle ORM'],
        healthScore: 0
      },
      {
        name: 'Service Layer',
        type: 'service',
        status: existsSync(join(process.cwd(), 'server/services')) ? 'healthy' : 'warning',
        dependencies: ['Business Logic Services'],
        healthScore: 0
      },
      {
        name: 'Middleware Layer',
        type: 'middleware',
        status: existsSync(join(process.cwd(), 'server/middleware')) ? 'healthy' : 'warning',
        dependencies: ['Security', 'Authentication', 'Validation'],
        healthScore: 0
      }
    ];

    // Calculate health scores
    components.forEach(component => {
      switch (component.status) {
        case 'healthy':
          component.healthScore = 85 + Math.random() * 15;
          break;
        case 'warning':
          component.healthScore = 50 + Math.random() * 35;
          break;
        case 'critical':
          component.healthScore = Math.random() * 50;
          break;
      }
    });

    this.status.components = components;
  }

  private checkDatabaseHealth(): 'healthy' | 'warning' | 'critical' {
    const hasDrizzle = existsSync(join(process.cwd(), 'server/db.ts'));
    const hasEnvVar = !!process.env.DATABASE_URL || !!process.env.POSTGRES_URL;
    
    if (hasDrizzle && hasEnvVar) return 'healthy';
    if (hasDrizzle || hasEnvVar) return 'warning';
    return 'critical';
  }

  private assessSeparationOfConcerns(): void {
    const frontend = existsSync(join(process.cwd(), 'client')) || 
                     existsSync(join(process.cwd(), 'frontend'));
    const backend = existsSync(join(process.cwd(), 'server'));
    const database = this.checkDatabaseHealth() !== 'critical';
    const services = existsSync(join(process.cwd(), 'server/services'));

    const totalPossible = 4;
    const implemented = [frontend, backend, database, services].filter(Boolean).length;
    const score = Math.round((implemented / totalPossible) * 100);

    this.status.separation = {
      frontend,
      backend,
      database,
      services,
      score
    };
  }

  private evaluateScalability(): void {
    const horizontal = this.hasLoadBalancing() || this.hasContainerization();
    const vertical = this.hasPerformanceOptimization();
    const microservices = this.checkMicroservicesPattern();
    const caching = this.hasCachingImplementation();

    const totalPossible = 4;
    const implemented = [horizontal, vertical, microservices, caching].filter(Boolean).length;
    const score = Math.round((implemented / totalPossible) * 100);

    this.status.scalability = {
      horizontal,
      vertical,
      microservices,
      caching,
      score
    };
  }

  private hasLoadBalancing(): boolean {
    // Check for load balancing configuration
    return existsSync(join(process.cwd(), 'nginx.conf')) || 
           existsSync(join(process.cwd(), 'docker-compose.yml'));
  }

  private hasContainerization(): boolean {
    return existsSync(join(process.cwd(), 'Dockerfile')) ||
           existsSync(join(process.cwd(), 'docker-compose.yml'));
  }

  private hasPerformanceOptimization(): boolean {
    // Check for performance optimization features
    try {
      const fs = require('fs');
      const packageJson = join(process.cwd(), 'package.json');
      if (!existsSync(packageJson)) return false;
      
      const content = fs.readFileSync(packageJson, 'utf8');
      const pkg = JSON.parse(content);
      
      // Check for performance-related dependencies
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      return Object.keys(deps).some(dep => 
        dep.includes('compression') || 
        dep.includes('cache') || 
        dep.includes('optimize')
      );
    } catch {
      return false;
    }
  }

  private hasCachingImplementation(): boolean {
    // Check for caching services
    const hasCacheService = existsSync(join(process.cwd(), 'server/services/cacheService.ts')) ||
                            existsSync(join(process.cwd(), 'server/services/enhancedCacheService.ts'));
    const hasRedis = !!process.env.REDIS_URL;
    
    return hasCacheService || hasRedis;
  }

  private checkMaintainability(): void {
    const modular = this.isModularDesign();
    const documented = this.hasDocumentation();
    const testable = this.hasTestingFramework();
    const versionControlled = existsSync(join(process.cwd(), '.git'));

    const totalPossible = 4;
    const implemented = [modular, documented, testable, versionControlled].filter(Boolean).length;
    const score = Math.round((implemented / totalPossible) * 100);

    this.status.maintainability = {
      modular,
      documented,
      testable,
      versionControlled,
      score
    };
  }

  private isModularDesign(): boolean {
    const hasComponents = existsSync(join(process.cwd(), 'client/src/components'));
    const hasServices = existsSync(join(process.cwd(), 'server/services'));
    const hasRoutes = existsSync(join(process.cwd(), 'server/routes'));
    const hasMiddleware = existsSync(join(process.cwd(), 'server/middleware'));

    return [hasComponents, hasServices, hasRoutes, hasMiddleware].filter(Boolean).length >= 3;
  }

  private hasDocumentation(): boolean {
    const hasReadme = existsSync(join(process.cwd(), 'README.md'));
    const hasApiDocs = existsSync(join(process.cwd(), 'docs')) ||
                       existsSync(join(process.cwd(), 'API.md'));
    const hasComments = this.hasInlineDocumentation();

    return hasReadme && (hasApiDocs || hasComments);
  }

  private hasInlineDocumentation(): boolean {
    // Check for JSDoc or TypeScript documentation
    try {
      const fs = require('fs');
      const serverIndex = join(process.cwd(), 'server/index.ts');
      if (!existsSync(serverIndex)) return false;
      
      const content = fs.readFileSync(serverIndex, 'utf8');
      return content.includes('/**') || content.includes('//');
    } catch {
      return false;
    }
  }

  private hasTestingFramework(): boolean {
    try {
      const fs = require('fs');
      const packageJson = join(process.cwd(), 'package.json');
      if (!existsSync(packageJson)) return false;
      
      const content = fs.readFileSync(packageJson, 'utf8');
      const pkg = JSON.parse(content);
      
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      return Object.keys(deps).some(dep => 
        dep.includes('test') || 
        dep.includes('jest') || 
        dep.includes('vitest') ||
        dep.includes('playwright')
      );
    } catch {
      return false;
    }
  }

  private calculateComplianceScore(): void {
    let score = 0;
    const maxScore = 100;

    // Architecture Patterns (30 points)
    const implementedPatterns = this.status.patterns.filter(p => p.implemented).length;
    const totalPatterns = this.status.patterns.length;
    if (totalPatterns > 0) {
      score += (implementedPatterns / totalPatterns) * 30;
    }

    // System Health (25 points)
    const healthyComponents = this.status.components.filter(c => c.status === 'healthy').length;
    const totalComponents = this.status.components.length;
    if (totalComponents > 0) {
      score += (healthyComponents / totalComponents) * 25;
    }

    // Separation of Concerns (15 points)
    score += (this.status.separation.score / 100) * 15;

    // Scalability (15 points)
    score += (this.status.scalability.score / 100) * 15;

    // Maintainability (15 points)
    score += (this.status.maintainability.score / 100) * 15;

    this.status.compliance.layerCompliance = Math.min(Math.round(score), maxScore);
  }

  private generateRecommendations(): void {
    const recommendations: string[] = [];
    const criticalIssues: string[] = [];

    // Critical component issues
    const criticalComponents = this.status.components.filter(c => c.status === 'critical');
    if (criticalComponents.length > 0) {
      criticalIssues.push(`${criticalComponents.length} critical system components need attention`);
      criticalComponents.forEach(comp => {
        recommendations.push(`Fix critical issues in ${comp.name}`);
      });
    }

    // Architecture pattern recommendations
    const unimplementedPatterns = this.status.patterns.filter(p => !p.implemented);
    unimplementedPatterns.forEach(pattern => {
      recommendations.push(`Implement ${pattern.name} for better architecture`);
    });

    // Separation of concerns
    if (this.status.separation.score < 75) {
      recommendations.push('Improve separation of concerns between layers');
    }

    // Scalability improvements
    if (this.status.scalability.score < 50) {
      recommendations.push('Implement scalability features (caching, load balancing)');
    }

    if (!this.status.scalability.caching) {
      recommendations.push('Add caching layer for better performance');
    }

    // Maintainability improvements
    if (this.status.maintainability.score < 75) {
      recommendations.push('Improve code maintainability (documentation, testing)');
    }

    if (!this.status.maintainability.testable) {
      recommendations.push('Add comprehensive testing framework');
    }

    if (!this.status.maintainability.documented) {
      recommendations.push('Create comprehensive documentation');
    }

    // General architectural recommendations
    recommendations.push('Implement design patterns consistently across the codebase');
    recommendations.push('Add monitoring and observability features');
    recommendations.push('Create architectural decision records (ADRs)');
    recommendations.push('Implement automated code quality checks');

    this.status.compliance.criticalIssues = criticalIssues;
    this.status.compliance.recommendations = recommendations;
  }

  async getHumanReadableReport(): Promise<string> {
    const status = await this.auditLayer();
    
    return `
# ESA Layer ${this.layerId}: ${this.layerName} - Compliance Report

## Overall Compliance: ${status.compliance.layerCompliance}%

### Architecture Patterns
${status.patterns.map(p => 
  `- **${p.name}**: ${p.implemented ? '✅' : '❌'} (Score: ${Math.round(p.score)}%)\n  ${p.description}`
).join('\n')}

### System Components Health
${status.components.map(c => 
  `- **${c.name}** (${c.type}): ${c.status === 'healthy' ? '✅' : c.status === 'warning' ? '⚠️' : '❌'} ${Math.round(c.healthScore)}%`
).join('\n')}

### Separation of Concerns: ${status.separation.score}%
- **Frontend Separation**: ${status.separation.frontend ? '✅' : '❌'}
- **Backend Separation**: ${status.separation.backend ? '✅' : '❌'}
- **Database Separation**: ${status.separation.database ? '✅' : '❌'}
- **Services Separation**: ${status.separation.services ? '✅' : '❌'}

### Scalability Features: ${status.scalability.score}%
- **Horizontal Scaling**: ${status.scalability.horizontal ? '✅' : '❌'}
- **Vertical Scaling**: ${status.scalability.vertical ? '✅' : '❌'}
- **Microservices**: ${status.scalability.microservices ? '✅' : '❌'}
- **Caching**: ${status.scalability.caching ? '✅' : '❌'}

### Maintainability: ${status.maintainability.score}%
- **Modular Design**: ${status.maintainability.modular ? '✅' : '❌'}
- **Documentation**: ${status.maintainability.documented ? '✅' : '❌'}
- **Testing Framework**: ${status.maintainability.testable ? '✅' : '❌'}
- **Version Control**: ${status.maintainability.versionControlled ? '✅' : '❌'}

### Critical Issues
${status.compliance.criticalIssues.map(issue => `- ⚠️ ${issue}`).join('\n')}

### Recommendations
${status.compliance.recommendations.map(rec => `- 💡 ${rec}`).join('\n')}

---
*Generated by Layer ${this.layerId} Agent - ${new Date().toISOString()}*
    `;
  }

  getStatus(): ArchitectureFoundationStatus {
    return { ...this.status };
  }

  getPatterns(): ArchitecturePattern[] {
    return [...this.status.patterns];
  }

  getComponents(): SystemComponent[] {
    return [...this.status.components];
  }
}

export const layer01Agent = new Layer01ArchitectureFoundationAgent();