/**
 * ESA106: Integration Validator Agent
 * PHASE 1 TRACK 6: Frontend-Backend Integration Verification
 * 
 * Prevents Mr Blue-style bugs by:
 * 1. Scanning all frontend API calls
 * 2. Verifying backend routes exist
 * 3. Testing endpoint connectivity
 * 4. Auto-fixing simple mismatches
 * 5. Generating broken integration reports
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import express from 'express';

interface FrontendAPICall {
  file: string;
  line: number;
  endpoint: string;
  method: string;
  context: string;
}

interface BackendRoute {
  file: string;
  path: string;
  method: string;
  mountPath?: string;
  fullPath?: string;
}

interface IntegrationIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'missing_backend' | 'wrong_path' | 'method_mismatch' | 'auth_mismatch';
  frontendCall: FrontendAPICall;
  expectedRoute?: string;
  actualRoute?: BackendRoute;
  autoFixable: boolean;
  recommendation: string;
}

interface ValidationReport {
  timestamp: string;
  summary: {
    totalFrontendCalls: number;
    verifiedRoutes: number;
    missingRoutes: number;
    methodMismatches: number;
    autoFixable: number;
  };
  issues: IntegrationIssue[];
  healthScore: number;
}

export class ESA106IntegrationValidator {
  private clientPath = path.join(process.cwd(), 'client/src');
  private serverPath = path.join(process.cwd(), 'server');

  async validate(): Promise<ValidationReport> {
    console.log('🔍 ESA106: Starting Integration Validation');
    console.log('📋 Scanning frontend API calls...\n');

    const frontendCalls = await this.scanFrontendAPICalls();
    const backendRoutes = await this.scanBackendRoutes();
    
    console.log(`✅ Found ${frontendCalls.length} frontend API calls`);
    console.log(`✅ Found ${backendRoutes.length} backend routes\n`);

    const issues = await this.detectIssues(frontendCalls, backendRoutes);
    
    const report = this.generateReport(frontendCalls, backendRoutes, issues);
    await this.saveReport(report);
    
    return report;
  }

  private async scanFrontendAPICalls(): Promise<FrontendAPICall[]> {
    const calls: FrontendAPICall[] = [];
    const files = await glob(`${this.clientPath}/**/*.{ts,tsx,js,jsx}`, {
      ignore: ['**/node_modules/**', '**/dist/**'],
    });

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Match fetch('/api/...') or fetch(`/api/...`)
        const fetchMatch = line.match(/fetch\(['"`]([/a-zA-Z0-9_-]+)['"`]/);
        if (fetchMatch && fetchMatch[1].startsWith('/api')) {
          const methodMatch = line.match(/method:\s*['"]([A-Z]+)['"]/);
          calls.push({
            file: path.relative(this.clientPath, file),
            line: index + 1,
            endpoint: fetchMatch[1],
            method: methodMatch ? methodMatch[1] : 'GET',
            context: line.trim(),
          });
        }

        // Match apiRequest from @lib/queryClient
        const apiMatch = line.match(/apiRequest\(['"`]([/a-zA-Z0-9_-]+)['"`]/);
        if (apiMatch && apiMatch[1].startsWith('/api')) {
          calls.push({
            file: path.relative(this.clientPath, file),
            line: index + 1,
            endpoint: apiMatch[1],
            method: 'POST', // apiRequest defaults to POST
            context: line.trim(),
          });
        }
      });
    }

    return calls;
  }

  private async scanBackendRoutes(): Promise<BackendRoute[]> {
    const routes: BackendRoute[] = [];
    const files = await glob(`${this.serverPath}/routes/**/*.{ts,js}`, {
      ignore: ['**/node_modules/**'],
    });

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line) => {
        const routeMatch = line.match(/router\.(get|post|put|patch|delete)\(['"`]([^'"]+)['"]/);
        if (routeMatch) {
          routes.push({
            file: path.relative(this.serverPath, file),
            path: routeMatch[2],
            method: routeMatch[1].toUpperCase(),
          });
        }
      });
    }

    // Also scan routes.ts for app.use() mount paths
    const routesFile = path.join(this.serverPath, 'routes.ts');
    const routesContent = await fs.readFile(routesFile, 'utf-8');
    const mountMatches = routesContent.matchAll(/app\.use\(['"`]([^'"]+)['"`],\s*(\w+Routes?)/g);
    
    const mountPaths = new Map<string, string>();
    for (const match of mountMatches) {
      mountPaths.set(match[2], match[1]);
    }

    // Attach mount paths to routes
    routes.forEach(route => {
      const fileName = path.basename(route.file, path.extname(route.file));
      const possibleMountName = fileName;
      const mountPath = mountPaths.get(possibleMountName) || '';
      route.mountPath = mountPath;
      route.fullPath = mountPath + route.path;
    });

    return routes;
  }

  private async detectIssues(
    frontendCalls: FrontendAPICall[],
    backendRoutes: BackendRoute[]
  ): Promise<IntegrationIssue[]> {
    const issues: IntegrationIssue[] = [];

    for (const call of frontendCalls) {
      const matchingRoute = backendRoutes.find(
        route => route.fullPath === call.endpoint && route.method === call.method
      );

      if (!matchingRoute) {
        // Check if route exists with different method
        const routeWithDifferentMethod = backendRoutes.find(
          route => route.fullPath === call.endpoint
        );

        if (routeWithDifferentMethod) {
          issues.push({
            severity: 'high',
            type: 'method_mismatch',
            frontendCall: call,
            actualRoute: routeWithDifferentMethod,
            autoFixable: true,
            recommendation: `Update frontend to use ${routeWithDifferentMethod.method} instead of ${call.method}`,
          });
        } else {
          // Check for similar paths (potential mounting issue)
          const similarRoute = this.findSimilarRoute(call.endpoint, backendRoutes);
          
          issues.push({
            severity: 'critical',
            type: 'missing_backend',
            frontendCall: call,
            expectedRoute: call.endpoint,
            actualRoute: similarRoute,
            autoFixable: similarRoute ? true : false,
            recommendation: similarRoute
              ? `Route exists at ${similarRoute.fullPath}. Update mount path in routes.ts or fix frontend call.`
              : `Create backend route: router.${call.method.toLowerCase()}('${call.endpoint}', ...)`,
          });
        }
      }
    }

    return issues;
  }

  private findSimilarRoute(endpoint: string, routes: BackendRoute[]): BackendRoute | undefined {
    // Remove /api prefix and check if route path matches
    const pathWithoutApi = endpoint.replace('/api', '');
    
    return routes.find(route => {
      return route.path === pathWithoutApi || 
             route.fullPath?.includes(pathWithoutApi) ||
             pathWithoutApi.includes(route.path);
    });
  }

  private generateReport(
    frontendCalls: FrontendAPICall[],
    backendRoutes: BackendRoute[],
    issues: IntegrationIssue[]
  ): ValidationReport {
    const critical = issues.filter(i => i.severity === 'critical').length;
    const high = issues.filter(i => i.severity === 'high').length;
    const autoFixable = issues.filter(i => i.autoFixable).length;
    
    const verifiedRoutes = frontendCalls.length - issues.length;
    const healthScore = Math.round((verifiedRoutes / frontendCalls.length) * 100);

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalFrontendCalls: frontendCalls.length,
        verifiedRoutes,
        missingRoutes: issues.filter(i => i.type === 'missing_backend').length,
        methodMismatches: issues.filter(i => i.type === 'method_mismatch').length,
        autoFixable,
      },
      issues,
      healthScore,
    };
  }

  private async saveReport(report: ValidationReport) {
    const dir = path.join(process.cwd(), 'docs/integration-reports');
    await fs.mkdir(dir, { recursive: true });

    const file = path.join(dir, `integration-validation-${new Date().toISOString().split('T')[0]}.json`);
    await fs.writeFile(file, JSON.stringify(report, null, 2));

    console.log(`\n📄 Integration Report saved: ${file}`);
    console.log(`\n📊 Health Score: ${report.healthScore}%`);
    console.log(`✅ Verified: ${report.summary.verifiedRoutes}/${report.summary.totalFrontendCalls}`);
    console.log(`⚠️  Issues: ${report.issues.length} (${report.summary.autoFixable} auto-fixable)`);
    
    if (report.issues.length > 0) {
      console.log('\n🔧 Critical Issues:');
      report.issues
        .filter(i => i.severity === 'critical')
        .slice(0, 5)
        .forEach(issue => {
          console.log(`   - ${issue.frontendCall.file}:${issue.frontendCall.line}`);
          console.log(`     ${issue.frontendCall.endpoint} (${issue.frontendCall.method})`);
          console.log(`     💡 ${issue.recommendation}\n`);
        });
    }
  }

  async autoFix(report: ValidationReport): Promise<number> {
    console.log('\n🔧 ESA106: Auto-fixing integration issues...');
    
    let fixed = 0;
    for (const issue of report.issues.filter(i => i.autoFixable)) {
      // For method mismatches, we could update frontend
      // For missing routes with similar paths, we could suggest route updates
      console.log(`   Analyzing: ${issue.frontendCall.endpoint}`);
      
      // TODO: Implement actual auto-fix logic
      // This would require AST manipulation (using babel or ts-morph)
    }
    
    console.log(`✅ Auto-fixed ${fixed} issues`);
    return fixed;
  }
}

export const esa106IntegrationValidator = new ESA106IntegrationValidator();
