import { test as base, Page, BrowserContext, Locator } from '@playwright/test';

/**
 * Custom test options for Mundo Tango E2E tests
 */
export interface TestOptions {
  enableAccessibilityTesting: boolean;
  enableVisualRegression: boolean;
  testDataPath: string;
  testOptions?: {
    enableAccessibilityTesting?: boolean;
    enableVisualRegression?: boolean;
    testDataPath?: string;
  };
}

/**
 * Test user types
 */
export interface TestUser {
  id?: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'host' | 'admin' | 'moderator';
  location?: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
}

/**
 * Test event data
 */
export interface TestEvent {
  id?: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  price?: number;
  category: 'milonga' | 'practica' | 'class' | 'workshop' | 'festival';
}

/**
 * Test group data
 */
export interface TestGroup {
  id?: string;
  name: string;
  description: string;
  city: string;
  type: 'city' | 'interest' | 'skill';
  isPrivate: boolean;
}

/**
 * Test post data
 */
export interface TestPost {
  id?: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'memory';
  visibility: 'public' | 'friends' | 'private';
  tags?: string[];
  media?: {
    url: string;
    type: string;
  }[];
}

/**
 * API response type
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Test context with additional helpers
 */
export interface TestContext {
  page: Page;
  context: BrowserContext;
  testUser?: TestUser;
  apiToken?: string;
}

/**
 * Accessibility test result
 */
export interface A11yResult {
  violations: Array<{
    id: string;
    impact: 'minor' | 'moderate' | 'serious' | 'critical';
    description: string;
    help: string;
    helpUrl: string;
    nodes: Array<{
      html: string;
      target: string[];
    }>;
  }>;
  passes: Array<{
    id: string;
    description: string;
  }>;
  incomplete: Array<{
    id: string;
    description: string;
  }>;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  navigationStart: number;
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  totalBlockingTime: number;
}

/**
 * Visual regression options
 */
export interface VisualRegressionOptions {
  name: string;
  fullPage?: boolean;
  clip?: { x: number; y: number; width: number; height: number };
  mask?: Locator[];
  maxDiffPixels?: number;
  threshold?: number;
  animations?: 'disabled' | 'allow';
}

/**
 * Network mock options
 */
export interface NetworkMockOptions {
  url: string | RegExp;
  method?: string;
  status?: number;
  headers?: Record<string, string>;
  body?: any;
  delay?: number;
}

/**
 * Database seed options
 */
export interface SeedOptions {
  users?: number;
  events?: number;
  groups?: number;
  posts?: number;
  messages?: number;
  clean?: boolean;
}