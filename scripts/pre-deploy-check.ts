#!/usr/bin/env tsx
/**
 * Pre-Deployment Check Script
 * Layer 50 (DevOps Automation Agent) + Layer 51 (Testing Framework Agent)
 * 
 * Runs before every deployment to verify build will succeed
 * Catches missing files, broken imports, and build issues BEFORE deploying
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface CheckResult {
  passed: boolean;
  message: string;
  details?: string[];
}

class PreDeployChecker {
  private errors: string[] = [];
  private warnings: string[] = [];
  private checks: CheckResult[] = [];

  /**
   * Main entry point
   */
  async run(): Promise<boolean> {
    console.log('🔍 Mundo Tango - Pre-Deployment Checks');
    console.log('=====================================\n');

    // Run all checks
    await this.checkImports();
    await this.checkRoutes();
    await this.checkCriticalFiles();
    await this.checkAgentFiles();

    // Print results
    this.printResults();

    // Return overall status
    return this.errors.length === 0;
  }

  /**
   * Check 1: Validate all TypeScript/TSX imports
   */
  private async checkImports(): Promise<void> {
    console.log('📦 Checking TypeScript imports...');

    const files = await glob('**/*.{ts,tsx}', {
      ignore: ['node_modules/**', 'dist/**', '.replit/**'],
    });

    const brokenImports: string[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;

      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];

        // Skip node_modules imports
        if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
          continue;
        }

        // Resolve the import path
        const resolvedPath = this.resolveImport(file, importPath);

        if (!resolvedPath || !fs.existsSync(resolvedPath)) {
          brokenImports.push(`${file}: Cannot find '${importPath}'`);
        }
      }
    }

    if (brokenImports.length > 0) {
      this.errors.push(...brokenImports);
      this.checks.push({
        passed: false,
        message: `❌ Found ${brokenImports.length} broken import(s)`,
        details: brokenImports,
      });
    } else {
      this.checks.push({
        passed: true,
        message: `✅ All imports valid (checked ${files.length} files)`,
      });
    }
  }

  /**
   * Check 2: Verify all routes have components
   */
  private async checkRoutes(): Promise<void> {
    console.log('🛣️  Checking routes...');

    const appFile = 'client/src/App.tsx';

    if (!fs.existsSync(appFile)) {
      this.errors.push('App.tsx not found');
      this.checks.push({
        passed: false,
        message: '❌ App.tsx not found',
      });
      return;
    }

    const content = fs.readFileSync(appFile, 'utf-8');

    // Extract component names used in routes
    const componentRegex = /<(\w+)\s*\/>/g;
    const components = new Set<string>();

    let match;
    while ((match = componentRegex.exec(content)) !== null) {
      components.add(match[1]);
    }

    const missingComponents: string[] = [];

    // Check if components are imported
    for (const component of components) {
      if (component === 'Route' || component === 'Switch') continue;

      const importRegex = new RegExp(`import\\s+${component}\\s+from`, 'i');
      if (!importRegex.test(content)) {
        missingComponents.push(component);
      }
    }

    if (missingComponents.length > 0) {
      this.errors.push(
        `Missing imports for components: ${missingComponents.join(', ')}`
      );
      this.checks.push({
        passed: false,
        message: `❌ ${missingComponents.length} route component(s) not imported`,
        details: missingComponents,
      });
    } else {
      this.checks.push({
        passed: true,
        message: `✅ All route components imported`,
      });
    }
  }

  /**
   * Check 3: Verify critical files exist
   */
  private async checkCriticalFiles(): Promise<void> {
    console.log('📁 Checking critical files...');

    const criticalFiles = [
      'vite.config.ts',
      'package.json',
      'tsconfig.json',
      'client/index.html',
      'client/src/main.tsx',
      'client/src/App.tsx',
      'server/index.ts',
      '.env',
    ];

    const missing: string[] = [];

    for (const file of criticalFiles) {
      if (!fs.existsSync(file)) {
        missing.push(file);
      }
    }

    if (missing.length > 0) {
      this.errors.push(...missing.map(f => `Missing critical file: ${f}`));
      this.checks.push({
        passed: false,
        message: `❌ ${missing.length} critical file(s) missing`,
        details: missing,
      });
    } else {
      this.checks.push({
        passed: true,
        message: `✅ All critical files present`,
      });
    }
  }

  /**
   * Check 4: Verify agent index files exist (from file deletion investigation)
   */
  private async checkAgentFiles(): Promise<void> {
    console.log('🤖 Checking agent files...');

    const agentIndexFiles = [
      'server/agents/algorithms/index.ts',
      'server/agents/leadership/index.ts',
      'server/agents/operational/index.ts',
      'server/agents/mr-blue/index.ts',
      'server/agents/journey-agents/index.ts',
      'server/agents/life-ceo/index.ts',
      'server/agents/page-agents/index.ts',
      'server/agents/ui-sub-agents/index.ts',
      'server/agents/services/index.ts',
      'server/agents/marketing/index.ts',
      'server/agents/app-leads/index.ts',
      'server/agents/hire-volunteer/index.ts',
      'server/agents/base/IAgent.ts',
    ];

    const missing: string[] = [];

    for (const file of agentIndexFiles) {
      if (!fs.existsSync(file)) {
        missing.push(file);
      }
    }

    if (missing.length > 0) {
      this.errors.push(...missing.map(f => `Missing agent file: ${f}`));
      this.checks.push({
        passed: false,
        message: `❌ ${missing.length} agent file(s) missing`,
        details: missing,
      });
    } else {
      this.checks.push({
        passed: true,
        message: `✅ All agent files present (${agentIndexFiles.length} files)`,
      });
    }
  }

  /**
   * Resolve import path to file system path
   */
  private resolveImport(fromFile: string, importPath: string): string | null {
    // Handle @/ alias (points to client/src)
    if (importPath.startsWith('@/')) {
      importPath = importPath.replace('@/', 'client/src/');
    }

    // Handle @shared alias (points to shared)
    if (importPath.startsWith('@shared')) {
      importPath = importPath.replace('@shared', 'shared');
    }

    // Handle relative imports
    if (importPath.startsWith('.')) {
      const dir = path.dirname(fromFile);
      importPath = path.join(dir, importPath);
    }

    // Try different extensions
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];

    for (const ext of extensions) {
      const fullPath = importPath + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }

    return null;
  }

  /**
   * Print results
   */
  private printResults(): void {
    console.log('\n📊 Check Results:');
    console.log('==================\n');

    for (const check of this.checks) {
      console.log(check.message);

      if (check.details && check.details.length > 0) {
        check.details.forEach(detail => {
          console.log(`   - ${detail}`);
        });
      }
    }

    console.log('\n');

    if (this.errors.length > 0) {
      console.log('❌ Pre-deployment checks FAILED');
      console.log(`   ${this.errors.length} error(s) found`);
      console.log('\n🚫 DEPLOYMENT BLOCKED - Fix errors before deploying\n');
      process.exit(1);
    } else {
      console.log('✅ All pre-deployment checks PASSED');
      console.log('🚀 Safe to deploy!\n');
    }
  }
}

// Run checks
const checker = new PreDeployChecker();
checker.run().catch(error => {
  console.error('❌ Pre-deployment check failed:', error);
  process.exit(1);
});
