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
      'framer-motion', 'gsap', '@gsap/react', 'motion', 'cmdk',
      'react-confetti', 'react-sticky', 'react-tooltip', 'react-spring',
      'embla-carousel-react', 'emoji-picker-react', 'mui-chips-input',
      'react-countdown', 'react-avatar-group', 'input-otp', 'vaul',
      'next-themes', 'react-resizable-panels', 'react-loading-skeleton',
      'react-day-picker'
    ],
    'Styling': [
      'tailwindcss', '@tailwindcss/typography', '@tailwindcss/vite',
      'tailwind-merge', 'tw-animate-css', 'tailwindcss-animate', 'css',
      '@emotion/react', '@emotion/styled', 'class-variance-authority', 'clsx'
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
      'jsonwebtoken', 'bcrypt', 'bcryptjs', 'speakeasy', '@casl/ability', '@casl/react',
      'openid-client'
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
      'openai', '@langchain/core', '@langchain/langgraph', '@langchain/openai',
      'langfuse', 'langfuse-node', 'llamaindex',
      '@opentelemetry/api', '@opentelemetry/auto-instrumentations-node', '@opentelemetry/sdk-node',
      '@arizeai/openinference-instrumentation-openai', '@arizeai/openinference-semantic-conventions'
    ],
    
    // Search & Analytics
    'Search': [
      '@elastic/elasticsearch', '@elastic/elasticsearch-mock', 'fuse.js'
    ],
    
    // File Upload & Media
    'Media Processing': [
      'multer', 'sharp', 'cloudinary', '@uppy/', 'fluent-ffmpeg',
      '@ffmpeg/', 'heic2any', 'browser-image-compression', 'exif-js'
    ],
    
    // Payment Processing
    'Payments': [
      'stripe', '@stripe/react-stripe-js', '@stripe/stripe-js'
    ],
    
    // Email & Notifications
    'Communications': [
      'nodemailer', 'resend', '@sendgrid/mail', '@react-email/components',
      '@novu/node', '@novu/react', 'mjml', 'react-email'
    ],
    
    // Internationalization
    'i18n': [
      'i18next', 'i18next-browser-languagedetector', 'i18next-http-backend',
      'react-i18next'
    ],
    
    // Testing & Quality
    'Testing': [
      'jest', '@testing-library/jest-dom', '@testing-library/react', '@testing-library/user-event',
      'vitest', 'supertest', '@playwright/test', 'playwright', '@axe-core/playwright',
      'axe-playwright', 'cypress', 'backstopjs', '@percy/playwright', '@percy/sdk-utils',
      'pa11y', 'lighthouse', '@lhci/cli', 'ts-jest'
    ],
    'Code Quality': [
      'typescript', 'eslint', 'eslint-plugin-react', 'eslint-plugin-react-hooks',
      '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser', 'snyk'
    ],
    
    // Monitoring & Observability
    'Monitoring': [
      '@sentry/node', '@sentry/profiling-node', '@sentry/react', '@sentry/tracing',
      'pino', 'pino-pretty', 'prom-client', '@openreplay/tracker',
      'posthog-js', 'web-vitals'
    ],
    
    // Maps & Location
    'Maps/Location': [
      'leaflet', 'react-leaflet', '@googlemaps/google-maps-services-js',
      '@googlemaps/js-api-loader', '@react-google-maps/api', 'google-auth-library'
    ],
    
    // Data Visualization
    'Data Viz': [
      'recharts', 'react-big-calendar', 'react-image-gallery'
    ],
    
    // Utilities
    'Utilities': [
      'lodash', 'date-fns', 'uuid', 'validator', 'nanoid',
      'axios', 'node-fetch', 'dompurify', 'isomorphic-dompurify',
      'xss', 'archiver', 'bytes', 'lru-cache', 'memoizee', 'util',
      'chokidar', 'busboy', 'node-cache', 'memorystore', 'country-state-city',
      'rrule', 'rss-parser', 'prop-types'
    ],
    
    // PDF & Documents
    'Documents': [
      'jspdf', 'html2canvas', 'qrcode', 'react-csv', 'export-to-csv'
    ],
    
    // Mobile & PWA
    'Mobile/PWA': [
      '@capacitor/android', '@capacitor/app', '@capacitor/browser', '@capacitor/camera',
      '@capacitor/cli', '@capacitor/core', '@capacitor/device', '@capacitor/filesystem',
      '@capacitor/geolocation', '@capacitor/ios', '@capacitor/network', '@capacitor/preferences',
      '@capacitor/push-notifications', '@capacitor/share', '@capacitor/splash-screen',
      '@capacitor/status-bar', 'workbox-'
    ],
    
    // Build Tools
    'Build Tools': [
      'esbuild', 'terser', 'postcss', 'autoprefixer', 'tsx'
    ],
    
    // Development
    'Development': [
      '@types/bcrypt', '@types/busboy', '@types/bytes', '@types/chokidar', '@types/compression',
      '@types/connect-pg-simple', '@types/cors', '@types/css', '@types/dompurify', '@types/express',
      '@types/express-session', '@types/google.maps', '@types/hpp', '@types/jest',
      '@types/jsonwebtoken', '@types/leaflet', '@types/lodash', '@types/memoizee',
      '@types/multer', '@types/node', '@types/node-cron', '@types/node-fetch',
      '@types/passport', '@types/passport-github', '@types/passport-google-oauth20',
      '@types/passport-local', '@types/pino', '@types/qrcode', '@types/react',
      '@types/react-beautiful-dnd', '@types/react-csv', '@types/react-dom',
      '@types/react-helmet', '@types/react-image-crop', '@types/react-lazyload',
      '@types/react-mentions', '@types/react-window', '@types/speakeasy', '@types/supertest',
      '@types/swagger-jsdoc', '@types/swagger-ui-express', '@types/uuid', '@types/validator',
      '@types/ws', '@ladle/react', 'style-dictionary', 'db-migrate',
      '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser'
    ],
    
    // Additional React Libraries
    'React Extensions': [
      'react-beautiful-dnd', 'react-copy-to-clipboard', 'react-select',
      'react-markdown', 'react-helmet', 'react-share', 'react-mentions',
      'react-social-media-embed', 'react-hotkeys-hook', 'react-window',
      'react-intersection-observer', 'react-infinite-scroll-component'
    ],
    
    // Database & Graph
    'Database Extensions': [
      'neo4j-driver', 'vectordb', '@lancedb/lancedb', '@google-cloud/storage',
      '@supabase/supabase-js'
    ],
    
    // Workflow & Orchestration
    'Workflows': [
      '@temporalio/activity', '@temporalio/client', '@temporalio/worker',
      '@temporalio/workflow'
    ],
    
    // API & Integration
    'API Tools': [
      '@octokit/rest', '@notionhq/client', '@actions/github', 'graphql',
      'openid-client', 'http-proxy-middleware', 'newman', 'puppeteer'
    ],
    
    // Performance & Load Testing
    'Performance Testing': [
      'artillery', 'jest-performance-testing', 'codecov'
    ],
    
    // Build Utilities  
    'Build Utilities': [
      '@replit/vite-plugin-cartographer', '@replit/vite-plugin-runtime-error-modal',
      '@jridgewell/trace-mapping', 'next'
    ],
    
    // Rate Limiting & Throttling
    'Rate Limiting': [
      'rate-limit-redis', 'rate-limiter-flexible', 'express-rate-limit', 
      'express-slow-down'
    ],
    
    // Media Extensions
    'Media Extensions': [
      'react-dropzone', 'react-image-crop', 'react-lazy-load-image-component',
      'react-lazyload', 'react-quill', 'quill', 'react-image-gallery'
    ],
    
    // Test Utilities
    'Test Utilities': [
      'test-data-bot', 'axe-core', '@faker-js/faker', 'pm2', 'jest-environment-jsdom'
    ],
    
    // UI Notifications
    'UI Notifications': [
      'react-hot-toast'
    ],
    
    // API Documentation
    'API Documentation': [
      'swagger-jsdoc', 'swagger-ui-express'
    ],
    
    // Dependency Management
    'Dependency Management': [
      'npm-check-updates'
    ],
    
    // Performance Utilities
    'Performance Utilities': [
      'bufferutil'
    ]
  };

  private esaLayerMapping: Record<number, string[]> = {
    // Layer 1: Performance Optimization
    1: ['vite', 'esbuild', 'terser', 'sharp', 'browser-image-compression', 'bufferutil'],
    
    // Layer 2: API Structure
    2: ['swagger-jsdoc', 'swagger-ui-express'],
    
    // Layer 4: Real-time Communication
    4: ['socket.io', 'socket.io-client', 'ws'],
    
    // Layer 5: Business Logic
    5: ['zod', 'zod-validation-error', 'express-validator'],
    
    // Layer 6: Search & Discovery
    6: ['@elastic/elasticsearch', 'fuse.js'],
    
    // Layer 10: AI Research Agent / Component Library
    10: ['openai', '@langchain/', 'langfuse', 'llamaindex', '@radix-ui/', '@mui/', 'react-hot-toast'],
    
    // Layer 11: UI/UX Design (Aurora) / Real-time Features
    11: ['@radix-ui/', '@mui/', 'framer-motion', 'gsap', 'lucide-react', 'socket.io', 'socket.io-client', 'ws', 'bufferutil'],
    
    // Layer 13: Media Processing
    13: ['sharp', 'cloudinary', '@ffmpeg/', 'fluent-ffmpeg'],
    
    // Layer 16: Communication Layer / Notification System
    16: ['nodemailer', 'resend', '@sendgrid/mail', '@novu/', 'react-hot-toast'],
    
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
    
    // Layer 51: Testing Framework
    51: ['jest', '@playwright/test', '@testing-library/', 'cypress', 'jest-environment-jsdom'],
    
    // Layer 52: Documentation System
    52: ['@ladle/react', 'swagger-jsdoc', 'swagger-ui-express'],
    
    // Layer 53: Internationalization
    53: ['i18next', 'i18next-browser-languagedetector', 'react-i18next'],
    
    // Layer 57: Automation Management
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
