/**
 * Dependency Mapper Service
 * ESA Layer 59: Open Source Management
 * 
 * Maps all platform dependencies to:
 * - Features/modules using them
 * - ESA layers they support
 * - Direct vs transitive relationships
 * - Bundle impact analysis
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export interface DependencyInfo {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency';
  category: string;
  esaLayers: number[];
  usedBy: string[];
  bundleImpact?: {
    size: string;
    gzipped: string;
  };
  security?: {
    vulnerabilities: number;
    lastAudit: string;
  };
  license?: string;
  description?: string;
}

export interface DependencyMap {
  totalPackages: number;
  dependencies: number;
  devDependencies: number;
  categories: Record<string, DependencyInfo[]>;
  byESALayer: Record<number, DependencyInfo[]>;
  unusedCandidates: string[];
  securityRisks: DependencyInfo[];
}

class DependencyMapperService {
  private packageJson: any;
  private dependencyCategories: Record<string, string[]> = {
    // Frontend Framework & UI
    'Frontend Core': [
      'react', 'react-dom', 'react-router-dom', 'wouter',
      '@vitejs/plugin-react', 'vite'
    ],
    'UI Components': [
      '@radix-ui/react-', '@mui/', 'lucide-react', 'react-icons',
      'framer-motion', 'gsap', '@gsap/react', 'motion'
    ],
    'Styling': [
      'tailwindcss', '@tailwindcss/', 'tailwind-', 'class-variance-authority',
      'clsx', 'tailwind-merge'
    ],
    
    // State & Data Management
    'State Management': [
      '@reduxjs/toolkit', 'react-redux', 'zustand', '@tanstack/react-query'
    ],
    'Forms': [
      'react-hook-form', '@hookform/resolvers', 'zod', 'zod-validation-error'
    ],
    
    // Backend & API
    'Backend Core': [
      'express', 'cors', 'helmet', 'compression', 'express-rate-limit',
      'express-slow-down', 'express-validator', 'express-session',
      'express-mongo-sanitize', 'hpp'
    ],
    'Authentication': [
      'passport', 'passport-local', 'passport-google-oauth20', 'passport-github2',
      'jsonwebtoken', 'bcrypt', 'bcryptjs', 'speakeasy', '@casl/ability', '@casl/react'
    ],
    
    // Database & ORM
    'Database': [
      'drizzle-orm', 'drizzle-kit', 'drizzle-zod', 'pg', '@neondatabase/serverless',
      'pg-mem', 'connect-pg-simple'
    ],
    
    // Real-time & WebSockets
    'Real-time': [
      'socket.io', 'socket.io-client', 'ws', 'ioredis', 'redis'
    ],
    
    // Background Jobs & Queues
    'Background Jobs': [
      'bull', 'bullmq', 'node-cron'
    ],
    
    // AI & Machine Learning
    'AI/ML': [
      'openai', '@langchain/', 'langfuse', 'langfuse-node', 'llamaindex',
      '@opentelemetry/', '@arizeai/'
    ],
    
    // Search & Analytics
    'Search': [
      '@elastic/elasticsearch', 'fuse.js'
    ],
    
    // File Upload & Media
    'Media Processing': [
      'multer', 'sharp', 'cloudinary', '@uppy/', 'fluent-ffmpeg',
      '@ffmpeg/', 'heic2any', 'browser-image-compression', 'exif-js'
    ],
    
    // Payment Processing
    'Payments': [
      'stripe', '@stripe/'
    ],
    
    // Email & Notifications
    'Communications': [
      'nodemailer', 'resend', '@sendgrid/mail', '@react-email/',
      '@novu/node', '@novu/react', 'mjml'
    ],
    
    // Internationalization
    'i18n': [
      'i18next', 'i18next-browser-languagedetector', 'i18next-http-backend',
      'react-i18next'
    ],
    
    // Testing & Quality
    'Testing': [
      'jest', '@testing-library/', 'vitest', 'supertest', '@playwright/test',
      'playwright', '@axe-core/playwright', 'axe-playwright', 'cypress',
      'backstopjs', '@percy/', 'pa11y', 'lighthouse', '@lhci/cli'
    ],
    'Code Quality': [
      'typescript', 'eslint', '@typescript-eslint/', 'snyk'
    ],
    
    // Monitoring & Observability
    'Monitoring': [
      '@sentry/', 'pino', 'pino-pretty', 'prom-client', '@openreplay/tracker',
      'posthog-js', 'web-vitals'
    ],
    
    // Maps & Location
    'Maps/Location': [
      'leaflet', 'react-leaflet', '@googlemaps/', '@react-google-maps/',
      'google-auth-library'
    ],
    
    // Data Visualization
    'Data Viz': [
      'recharts', 'react-big-calendar', 'react-image-gallery'
    ],
    
    // Utilities
    'Utilities': [
      'lodash', 'moment', 'date-fns', 'uuid', 'validator', 'nanoid',
      'axios', 'node-fetch', 'dompurify', 'isomorphic-dompurify',
      'xss', 'archiver', 'bytes', 'lru-cache', 'memoizee'
    ],
    
    // PDF & Documents
    'Documents': [
      'jspdf', 'html2canvas', 'qrcode', 'react-csv', 'export-to-csv'
    ],
    
    // Mobile & PWA
    'Mobile/PWA': [
      '@capacitor/', 'workbox-'
    ],
    
    // Build Tools
    'Build Tools': [
      'esbuild', 'terser', 'postcss', 'autoprefixer', 'tsx'
    ],
    
    // Development
    'Development': [
      '@types/', '@ladle/react', 'style-dictionary', 'db-migrate'
    ]
  };

  private esaLayerMapping: Record<number, string[]> = {
    // Layer 1: Performance Optimization
    1: ['vite', 'esbuild', 'terser', 'sharp', 'browser-image-compression'],
    
    // Layer 4: Real-time Communication
    4: ['socket.io', 'socket.io-client', 'ws'],
    
    // Layer 5: Business Logic
    5: ['zod', 'zod-validation-error', 'express-validator'],
    
    // Layer 6: Search & Discovery
    6: ['@elastic/elasticsearch', 'fuse.js'],
    
    // Layer 10: AI Research Agent
    10: ['openai', '@langchain/', 'langfuse', 'llamaindex'],
    
    // Layer 11: UI/UX Design (Aurora)
    11: ['@radix-ui/', '@mui/', 'framer-motion', 'gsap', 'lucide-react'],
    
    // Layer 13: Media Processing
    13: ['sharp', 'cloudinary', '@ffmpeg/', 'fluent-ffmpeg'],
    
    // Layer 16: Communication Layer
    16: ['nodemailer', 'resend', '@sendgrid/mail', '@novu/'],
    
    // Layer 18: Frontend Architecture
    18: ['react', 'react-dom', '@tanstack/react-query', 'wouter'],
    
    // Layer 22: Payment Processing
    22: ['stripe', '@stripe/'],
    
    // Layer 35: AI Agent Management
    35: ['openai', '@langchain/', '@opentelemetry/'],
    
    // Layer 48: Performance Monitoring
    48: ['lighthouse', '@lhci/cli', 'prom-client', 'web-vitals'],
    
    // Layer 49: Security
    49: ['helmet', 'express-rate-limit', 'hpp', 'xss', 'snyk'],
    
    // Layer 51: Testing
    51: ['jest', '@playwright/test', '@testing-library/', 'cypress'],
    
    // Layer 52: Documentation
    52: ['@ladle/react', 'swagger-jsdoc', 'swagger-ui-express'],
    
    // Layer 53: Internationalization
    53: ['i18next', 'i18next-browser-languagedetector', 'react-i18next'],
    
    // Layer 57: Automation
    57: ['node-cron', 'bull', 'bullmq'],
    
    // Layer 59: Open Source Management
    59: ['snyk', 'npm-check-updates']
  };

  constructor() {
    const pkgPath = join(process.cwd(), 'package.json');
    this.packageJson = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  }

  /**
   * Generate complete dependency map
   */
  async generateMap(): Promise<DependencyMap> {
    const deps = this.packageJson.dependencies || {};
    const devDeps = this.packageJson.devDependencies || {};
    
    const allDeps: DependencyInfo[] = [
      ...Object.entries(deps).map(([name, version]) => 
        this.analyzeDependency(name, version as string, 'dependency')
      ),
      ...Object.entries(devDeps).map(([name, version]) => 
        this.analyzeDependency(name, version as string, 'devDependency')
      )
    ];

    // Categorize dependencies
    const categories: Record<string, DependencyInfo[]> = {};
    allDeps.forEach(dep => {
      if (!categories[dep.category]) {
        categories[dep.category] = [];
      }
      categories[dep.category].push(dep);
    });

    // Map by ESA layer
    const byESALayer: Record<number, DependencyInfo[]> = {};
    allDeps.forEach(dep => {
      dep.esaLayers.forEach(layer => {
        if (!byESALayer[layer]) {
          byESALayer[layer] = [];
        }
        byESALayer[layer].push(dep);
      });
    });

    // Find unused candidates (packages with no clear category)
    const unusedCandidates = allDeps
      .filter(dep => dep.category === 'Uncategorized')
      .map(dep => dep.name);

    // Security risks (to be populated by Snyk)
    const securityRisks: DependencyInfo[] = [];

    return {
      totalPackages: allDeps.length,
      dependencies: Object.keys(deps).length,
      devDependencies: Object.keys(devDeps).length,
      categories,
      byESALayer,
      unusedCandidates,
      securityRisks
    };
  }

  /**
   * Analyze a single dependency
   */
  private analyzeDependency(name: string, version: string, type: 'dependency' | 'devDependency'): DependencyInfo {
    const category = this.categorizeDependency(name);
    const esaLayers = this.mapToESALayers(name);
    
    return {
      name,
      version,
      type,
      category,
      esaLayers,
      usedBy: [] // To be populated by usage analysis
    };
  }

  /**
   * Categorize dependency by name pattern matching
   */
  private categorizeDependency(name: string): string {
    for (const [category, patterns] of Object.entries(this.dependencyCategories)) {
      for (const pattern of patterns) {
        if (pattern.endsWith('-') ? name.startsWith(pattern.slice(0, -1)) : name === pattern) {
          return category;
        }
      }
    }
    return 'Uncategorized';
  }

  /**
   * Map dependency to ESA layers
   */
  private mapToESALayers(name: string): number[] {
    const layers: number[] = [];
    
    for (const [layer, patterns] of Object.entries(this.esaLayerMapping)) {
      for (const pattern of patterns) {
        if (pattern.endsWith('/') ? name.startsWith(pattern) : name === pattern) {
          layers.push(parseInt(layer));
          break;
        }
      }
    }
    
    return layers.length > 0 ? layers : [59]; // Default to Layer 59 (Open Source)
  }

  /**
   * Get dependencies for a specific ESA layer
   */
  async getDependenciesByLayer(layer: number): Promise<DependencyInfo[]> {
    const map = await this.generateMap();
    return map.byESALayer[layer] || [];
  }

  /**
   * Get dependencies by category
   */
  async getDependenciesByCategory(category: string): Promise<DependencyInfo[]> {
    const map = await this.generateMap();
    return map.categories[category] || [];
  }

  /**
   * Format dependency map as a readable report
   */
  formatReport(map: DependencyMap): string {
    let report = '\n' + '═'.repeat(80) + '\n';
    report += '📦 DEPENDENCY MAP REPORT\n';
    report += '═'.repeat(80) + '\n\n';
    
    report += `📊 Summary:\n`;
    report += `   Total Packages: ${map.totalPackages}\n`;
    report += `   Dependencies: ${map.dependencies}\n`;
    report += `   Dev Dependencies: ${map.devDependencies}\n\n`;
    
    report += `📁 By Category (${Object.keys(map.categories).length} categories):\n`;
    Object.entries(map.categories)
      .sort(([, a], [, b]) => b.length - a.length)
      .forEach(([category, deps]) => {
        report += `   ${category}: ${deps.length} packages\n`;
      });
    
    report += `\n🏗️  By ESA Layer:\n`;
    Object.entries(map.byESALayer)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([layer, deps]) => {
        report += `   Layer ${layer}: ${deps.length} packages\n`;
      });
    
    if (map.unusedCandidates.length > 0) {
      report += `\n⚠️  Uncategorized Packages (${map.unusedCandidates.length}):\n`;
      map.unusedCandidates.slice(0, 10).forEach(name => {
        report += `   - ${name}\n`;
      });
      if (map.unusedCandidates.length > 10) {
        report += `   ... and ${map.unusedCandidates.length - 10} more\n`;
      }
    }
    
    report += '\n' + '═'.repeat(80) + '\n';
    
    return report;
  }
}

export const dependencyMapper = new DependencyMapperService();
