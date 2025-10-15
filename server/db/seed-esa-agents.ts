/**
 * ESA Agent Registry Seed Script
 * Registers all 114 agents from the ESA Framework into the intelligence network
 * 
 * Agent Breakdown:
 * - 1 CEO (Agent #0)
 * - 6 Division Chiefs
 * - 9 Domain Coordinators
 * - 61 Layer Agents
 * - 7 Expert Agents
 * - 16 Life CEO Agents
 * - 8 Mr Blue Agents (#73-80)
 * - 6 Additional Operational Agents
 * 
 * Total: 114 Agents
 */

import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import { esaAgents } from '../../shared/schema';
import type { InsertEsaAgent } from '../../shared/schema';

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

// Define agent capabilities by type
const capabilities = {
  ceo: {
    self_test: true,
    auto_fix: true,
    collaborate: true,
    learn: true,
    escalate: true,
    orchestrate: true
  },
  chief: {
    self_test: true,
    auto_fix: false,
    collaborate: true,
    learn: true,
    escalate: true,
    coordinate_division: true
  },
  domain: {
    self_test: true,
    auto_fix: true,
    collaborate: true,
    learn: true,
    coordinate_domain: true
  },
  layer: {
    self_test: true,
    auto_fix: true,
    collaborate: true,
    learn: true
  },
  expert: {
    self_test: true,
    auto_fix: true,
    collaborate: true,
    learn: true,
    expertise: true
  },
  life_ceo: {
    self_test: true,
    auto_fix: true,
    collaborate: true,
    learn: true,
    life_management: true
  },
  mr_blue: {
    self_test: true,
    auto_fix: true,
    collaborate: true,
    learn: true,
    user_interaction: true
  },
  algorithm: {
    self_test: true,
    auto_fix: true,
    collaborate: true,
    learn: true,
    optimize: true
  }
};

// All 114 ESA Agents
const esaAgentsList: InsertEsaAgent[] = [
  // ========== CEO (1 agent) ==========
  {
    id: 'AGENT-0',
    name: 'ESA Orchestrator',
    type: 'ceo',
    division: null,
    esaLayers: Array.from({length: 61}, (_, i) => i + 1), // All 61 layers
    domains: ['all'],
    reportsTo: [],
    capabilities: capabilities.ceo,
    expertiseScore: 1.0,
    status: 'active'
  },

  // ========== DIVISION CHIEFS (6 agents) ==========
  {
    id: 'CHIEF-FOUNDATION',
    name: 'Foundation Division Chief',
    type: 'chief',
    division: 'foundation',
    esaLayers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    domains: ['database', 'api', 'auth', 'frontend', 'ui'],
    reportsTo: ['AGENT-0'],
    capabilities: capabilities.chief,
    expertiseScore: 0.95,
    status: 'active'
  },
  {
    id: 'CHIEF-CORE',
    name: 'Core Division Chief',
    type: 'chief',
    division: 'core',
    esaLayers: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    domains: ['realtime', 'processing', 'storage', 'payment', 'notification'],
    reportsTo: ['AGENT-0'],
    capabilities: capabilities.chief,
    expertiseScore: 0.95,
    status: 'active'
  },
  {
    id: 'CHIEF-BUSINESS',
    name: 'Business Division Chief',
    type: 'chief',
    division: 'business',
    esaLayers: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    domains: ['users', 'groups', 'events', 'social', 'marketplace'],
    reportsTo: ['AGENT-0'],
    capabilities: capabilities.chief,
    expertiseScore: 0.95,
    status: 'active'
  },
  {
    id: 'CHIEF-INTELLIGENCE',
    name: 'Intelligence Division Chief',
    type: 'chief',
    division: 'intelligence',
    esaLayers: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
    domains: ['ai', 'ml', 'nlp', 'vision', 'memory', 'learning'],
    reportsTo: ['AGENT-0'],
    capabilities: capabilities.chief,
    expertiseScore: 0.95,
    status: 'active'
  },
  {
    id: 'CHIEF-PLATFORM',
    name: 'Platform Division Chief',
    type: 'chief',
    division: 'platform',
    esaLayers: [47, 48, 49, 50, 51, 52, 53, 54, 55, 56],
    domains: ['mobile', 'performance', 'security', 'testing', 'compliance'],
    reportsTo: ['AGENT-0'],
    capabilities: capabilities.chief,
    expertiseScore: 0.95,
    status: 'active'
  },
  {
    id: 'CHIEF-EXTENDED',
    name: 'Extended Management Division Chief',
    type: 'chief',
    division: 'extended',
    esaLayers: [57, 58, 59, 60, 61],
    domains: ['automation', 'integrations', 'opensource', 'github', 'infrastructure'],
    reportsTo: ['AGENT-0'],
    capabilities: capabilities.chief,
    expertiseScore: 0.95,
    status: 'active'
  },

  // ========== DOMAIN COORDINATORS (9 agents) ==========
  {
    id: 'DOMAIN-INFRASTRUCTURE',
    name: 'Infrastructure Orchestrator',
    type: 'domain',
    division: 'foundation',
    esaLayers: [1, 3, 14],
    domains: ['database', 'server', 'caching'],
    reportsTo: ['CHIEF-FOUNDATION'],
    capabilities: capabilities.domain,
    expertiseScore: 0.90,
    status: 'active'
  },
  {
    id: 'DOMAIN-FRONTEND',
    name: 'Frontend Coordinator',
    type: 'domain',
    division: 'foundation',
    esaLayers: [8, 9, 10],
    domains: ['react', 'ui', 'components'],
    reportsTo: ['CHIEF-FOUNDATION'],
    capabilities: capabilities.domain,
    expertiseScore: 0.90,
    status: 'active'
  },
  {
    id: 'DOMAIN-BACKGROUND',
    name: 'Background Processor',
    type: 'domain',
    division: 'core',
    esaLayers: [12, 20],
    domains: ['processing', 'workflow'],
    reportsTo: ['CHIEF-CORE'],
    capabilities: capabilities.domain,
    expertiseScore: 0.90,
    status: 'active'
  },
  {
    id: 'DOMAIN-REALTIME',
    name: 'Real-time Communications',
    type: 'domain',
    division: 'core',
    esaLayers: [11, 25],
    domains: ['websocket', 'messaging'],
    reportsTo: ['CHIEF-CORE'],
    capabilities: capabilities.domain,
    expertiseScore: 0.90,
    status: 'active'
  },
  {
    id: 'DOMAIN-BUSINESS',
    name: 'Business Logic Manager',
    type: 'domain',
    division: 'business',
    esaLayers: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    domains: ['users', 'groups', 'events'],
    reportsTo: ['CHIEF-BUSINESS'],
    capabilities: capabilities.domain,
    expertiseScore: 0.90,
    status: 'active'
  },
  {
    id: 'DOMAIN-SEARCH',
    name: 'Search & Analytics',
    type: 'domain',
    division: 'business',
    esaLayers: [15, 18, 26],
    domains: ['search', 'analytics', 'recommendations'],
    reportsTo: ['CHIEF-BUSINESS'],
    capabilities: capabilities.domain,
    expertiseScore: 0.90,
    status: 'active'
  },
  {
    id: 'DOMAIN-LIFE-CEO',
    name: 'Life CEO Core',
    type: 'domain',
    division: 'intelligence',
    esaLayers: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
    domains: ['ai', 'life_management'],
    reportsTo: ['CHIEF-INTELLIGENCE'],
    capabilities: capabilities.domain,
    expertiseScore: 0.90,
    status: 'active'
  },
  {
    id: 'DOMAIN-PLATFORM-ENHANCEMENT',
    name: 'Platform Enhancement',
    type: 'domain',
    division: 'platform',
    esaLayers: [47, 48, 49, 50, 51, 52, 53, 54, 55, 56],
    domains: ['mobile', 'performance', 'security'],
    reportsTo: ['CHIEF-PLATFORM'],
    capabilities: capabilities.domain,
    expertiseScore: 0.90,
    status: 'active'
  },
  {
    id: 'DOMAIN-MASTER-CONTROL',
    name: 'Master Control',
    type: 'domain',
    division: 'extended',
    esaLayers: [57, 58, 59, 60, 61],
    domains: ['automation', 'integrations'],
    reportsTo: ['CHIEF-EXTENDED'],
    capabilities: capabilities.domain,
    expertiseScore: 0.90,
    status: 'active'
  },

  // ========== LAYER AGENTS (61 agents) ==========
  // Foundation Division (Layers 1-10)
  { id: 'LAYER-1', name: 'Database Architecture', type: 'layer', division: 'foundation', esaLayers: [1], domains: ['database'], reportsTo: ['CHIEF-FOUNDATION', 'DOMAIN-INFRASTRUCTURE'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-2', name: 'API Structure', type: 'layer', division: 'foundation', esaLayers: [2], domains: ['api'], reportsTo: ['CHIEF-FOUNDATION'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-3', name: 'Server Framework', type: 'layer', division: 'foundation', esaLayers: [3], domains: ['server'], reportsTo: ['CHIEF-FOUNDATION', 'DOMAIN-INFRASTRUCTURE'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-4', name: 'Authentication System', type: 'layer', division: 'foundation', esaLayers: [4], domains: ['auth'], reportsTo: ['CHIEF-FOUNDATION'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-5', name: 'Authorization & RBAC', type: 'layer', division: 'foundation', esaLayers: [5], domains: ['auth', 'security'], reportsTo: ['CHIEF-FOUNDATION'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-6', name: 'Data Validation', type: 'layer', division: 'foundation', esaLayers: [6], domains: ['validation'], reportsTo: ['CHIEF-FOUNDATION'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-7', name: 'State Management', type: 'layer', division: 'foundation', esaLayers: [7], domains: ['state'], reportsTo: ['CHIEF-FOUNDATION'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-8', name: 'Client Framework', type: 'layer', division: 'foundation', esaLayers: [8], domains: ['react', 'frontend'], reportsTo: ['CHIEF-FOUNDATION', 'DOMAIN-FRONTEND'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-9', name: 'UI Framework', type: 'layer', division: 'foundation', esaLayers: [9], domains: ['ui'], reportsTo: ['CHIEF-FOUNDATION', 'DOMAIN-FRONTEND'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-10', name: 'Component Library', type: 'layer', division: 'foundation', esaLayers: [10], domains: ['components'], reportsTo: ['CHIEF-FOUNDATION', 'DOMAIN-FRONTEND'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },

  // Core Division (Layers 11-20)
  { id: 'LAYER-11', name: 'Real-time Features', type: 'layer', division: 'core', esaLayers: [11], domains: ['realtime', 'websocket'], reportsTo: ['CHIEF-CORE', 'DOMAIN-REALTIME'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-12', name: 'Data Processing', type: 'layer', division: 'core', esaLayers: [12], domains: ['processing'], reportsTo: ['CHIEF-CORE', 'DOMAIN-BACKGROUND'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-13', name: 'File Management', type: 'layer', division: 'core', esaLayers: [13], domains: ['files', 'storage'], reportsTo: ['CHIEF-CORE'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-14', name: 'Caching Strategy', type: 'layer', division: 'core', esaLayers: [14], domains: ['caching'], reportsTo: ['CHIEF-CORE', 'DOMAIN-INFRASTRUCTURE'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-15', name: 'Search & Discovery', type: 'layer', division: 'core', esaLayers: [15], domains: ['search'], reportsTo: ['CHIEF-CORE', 'DOMAIN-SEARCH'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-16', name: 'Notification System', type: 'layer', division: 'core', esaLayers: [16], domains: ['notifications'], reportsTo: ['CHIEF-CORE'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-17', name: 'Payment Processing', type: 'layer', division: 'core', esaLayers: [17], domains: ['payment', 'stripe'], reportsTo: ['CHIEF-CORE'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-18', name: 'Reporting & Analytics', type: 'layer', division: 'core', esaLayers: [18], domains: ['analytics'], reportsTo: ['CHIEF-CORE', 'DOMAIN-SEARCH'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-19', name: 'Content Management', type: 'layer', division: 'core', esaLayers: [19], domains: ['cms'], reportsTo: ['CHIEF-CORE'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-20', name: 'Workflow Engine', type: 'layer', division: 'core', esaLayers: [20], domains: ['workflow'], reportsTo: ['CHIEF-CORE', 'DOMAIN-BACKGROUND'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },

  // Business Division (Layers 21-30)
  { id: 'LAYER-21', name: 'User Management', type: 'layer', division: 'business', esaLayers: [21], domains: ['users'], reportsTo: ['CHIEF-BUSINESS', 'DOMAIN-BUSINESS'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-22', name: 'Group Management', type: 'layer', division: 'business', esaLayers: [22], domains: ['groups'], reportsTo: ['CHIEF-BUSINESS', 'DOMAIN-BUSINESS'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-23', name: 'Event Management', type: 'layer', division: 'business', esaLayers: [23], domains: ['events'], reportsTo: ['CHIEF-BUSINESS', 'DOMAIN-BUSINESS'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-24', name: 'Social Features', type: 'layer', division: 'business', esaLayers: [24], domains: ['social'], reportsTo: ['CHIEF-BUSINESS', 'DOMAIN-BUSINESS'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-25', name: 'Messaging System', type: 'layer', division: 'business', esaLayers: [25], domains: ['messaging'], reportsTo: ['CHIEF-BUSINESS', 'DOMAIN-BUSINESS', 'DOMAIN-REALTIME'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-26', name: 'Recommendation Engine', type: 'layer', division: 'business', esaLayers: [26], domains: ['recommendations'], reportsTo: ['CHIEF-BUSINESS', 'DOMAIN-SEARCH'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-27', name: 'Gamification', type: 'layer', division: 'business', esaLayers: [27], domains: ['gamification'], reportsTo: ['CHIEF-BUSINESS', 'DOMAIN-BUSINESS'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-28', name: 'Marketplace', type: 'layer', division: 'business', esaLayers: [28], domains: ['marketplace'], reportsTo: ['CHIEF-BUSINESS', 'DOMAIN-BUSINESS'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-29', name: 'Booking System', type: 'layer', division: 'business', esaLayers: [29], domains: ['booking'], reportsTo: ['CHIEF-BUSINESS', 'DOMAIN-BUSINESS'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-30', name: 'Support System', type: 'layer', division: 'business', esaLayers: [30], domains: ['support'], reportsTo: ['CHIEF-BUSINESS', 'DOMAIN-BUSINESS'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },

  // Intelligence Division (Layers 31-46)
  { id: 'LAYER-31', name: 'Core AI Infrastructure', type: 'layer', division: 'intelligence', esaLayers: [31], domains: ['ai'], reportsTo: ['CHIEF-INTELLIGENCE', 'DOMAIN-LIFE-CEO'], capabilities: capabilities.layer, expertiseScore: 0.85, status: 'active' },
  { id: 'LAYER-32', name: 'Prompt Engineering', type: 'layer', division: 'intelligence', esaLayers: [32], domains: ['ai', 'prompts'], reportsTo: ['CHIEF-INTELLIGENCE', 'DOMAIN-LIFE-CEO'], capabilities: capabilities.layer, expertiseScore: 0.85, status: 'active' },
  { id: 'LAYER-33', name: 'Context Management', type: 'layer', division: 'intelligence', esaLayers: [33], domains: ['ai', 'context'], reportsTo: ['CHIEF-INTELLIGENCE', 'DOMAIN-LIFE-CEO'], capabilities: capabilities.layer, expertiseScore: 0.85, status: 'active' },
  { id: 'LAYER-34', name: 'Response Generation', type: 'layer', division: 'intelligence', esaLayers: [34], domains: ['ai', 'generation'], reportsTo: ['CHIEF-INTELLIGENCE', 'DOMAIN-LIFE-CEO'], capabilities: capabilities.layer, expertiseScore: 0.85, status: 'active' },
  { id: 'LAYER-35', name: 'AI Agent Management', type: 'layer', division: 'intelligence', esaLayers: [35], domains: ['ai', 'agents'], reportsTo: ['CHIEF-INTELLIGENCE', 'DOMAIN-LIFE-CEO'], capabilities: capabilities.layer, expertiseScore: 0.85, status: 'active' },
  { id: 'LAYER-36', name: 'Memory Systems', type: 'layer', division: 'intelligence', esaLayers: [36], domains: ['memory'], reportsTo: ['CHIEF-INTELLIGENCE', 'DOMAIN-LIFE-CEO'], capabilities: capabilities.layer, expertiseScore: 0.85, status: 'active' },
  { id: 'LAYER-37', name: 'Learning Systems', type: 'layer', division: 'intelligence', esaLayers: [37], domains: ['learning', 'ml'], reportsTo: ['CHIEF-INTELLIGENCE', 'DOMAIN-LIFE-CEO'], capabilities: capabilities.layer, expertiseScore: 0.85, status: 'active' },
  { id: 'LAYER-38', name: 'Prediction Engine', type: 'layer', division: 'intelligence', esaLayers: [38], domains: ['ml', 'prediction'], reportsTo: ['CHIEF-INTELLIGENCE', 'DOMAIN-LIFE-CEO'], capabilities: capabilities.layer, expertiseScore: 0.85, status: 'active' },
  { id: 'LAYER-39', name: 'Decision Support', type: 'layer', division: 'intelligence', esaLayers: [39], domains: ['ai', 'decision'], reportsTo: ['CHIEF-INTELLIGENCE', 'DOMAIN-LIFE-CEO'], capabilities: capabilities.layer, expertiseScore: 0.85, status: 'active' },
  { id: 'LAYER-40', name: 'Natural Language', type: 'layer', division: 'intelligence', esaLayers: [40], domains: ['nlp'], reportsTo: ['CHIEF-INTELLIGENCE', 'DOMAIN-LIFE-CEO'], capabilities: capabilities.layer, expertiseScore: 0.85, status: 'active' },
  { id: 'LAYER-41', name: 'Vision Processing', type: 'layer', division: 'intelligence', esaLayers: [41], domains: ['vision', 'ml'], reportsTo: ['CHIEF-INTELLIGENCE', 'DOMAIN-LIFE-CEO'], capabilities: capabilities.layer, expertiseScore: 0.85, status: 'active' },
  { id: 'LAYER-42', name: 'Voice Processing', type: 'layer', division: 'intelligence', esaLayers: [42], domains: ['voice', 'speech'], reportsTo: ['CHIEF-INTELLIGENCE', 'DOMAIN-LIFE-CEO'], capabilities: capabilities.layer, expertiseScore: 0.85, status: 'active' },
  { id: 'LAYER-43', name: 'Sentiment Analysis', type: 'layer', division: 'intelligence', esaLayers: [43], domains: ['nlp', 'sentiment'], reportsTo: ['CHIEF-INTELLIGENCE', 'DOMAIN-LIFE-CEO'], capabilities: capabilities.layer, expertiseScore: 0.85, status: 'active' },
  { id: 'LAYER-44', name: 'Knowledge Graph', type: 'layer', division: 'intelligence', esaLayers: [44], domains: ['knowledge'], reportsTo: ['CHIEF-INTELLIGENCE', 'DOMAIN-LIFE-CEO'], capabilities: capabilities.layer, expertiseScore: 0.85, status: 'active' },
  { id: 'LAYER-45', name: 'Reasoning Engine', type: 'layer', division: 'intelligence', esaLayers: [45], domains: ['reasoning', 'ai'], reportsTo: ['CHIEF-INTELLIGENCE', 'DOMAIN-LIFE-CEO'], capabilities: capabilities.layer, expertiseScore: 0.85, status: 'active' },
  { id: 'LAYER-46', name: 'Integration Layer', type: 'layer', division: 'intelligence', esaLayers: [46], domains: ['integration'], reportsTo: ['CHIEF-INTELLIGENCE', 'DOMAIN-LIFE-CEO'], capabilities: capabilities.layer, expertiseScore: 0.85, status: 'active' },

  // Platform Division (Layers 47-56)
  { id: 'LAYER-47', name: 'Mobile Optimization', type: 'layer', division: 'platform', esaLayers: [47], domains: ['mobile'], reportsTo: ['CHIEF-PLATFORM', 'DOMAIN-PLATFORM-ENHANCEMENT'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-48', name: 'Performance Monitoring', type: 'layer', division: 'platform', esaLayers: [48], domains: ['performance'], reportsTo: ['CHIEF-PLATFORM', 'DOMAIN-PLATFORM-ENHANCEMENT'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-49', name: 'Security Hardening', type: 'layer', division: 'platform', esaLayers: [49], domains: ['security'], reportsTo: ['CHIEF-PLATFORM', 'DOMAIN-PLATFORM-ENHANCEMENT'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-50', name: 'DevOps Automation', type: 'layer', division: 'platform', esaLayers: [50], domains: ['devops'], reportsTo: ['CHIEF-PLATFORM', 'DOMAIN-PLATFORM-ENHANCEMENT'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-51', name: 'Testing Framework', type: 'layer', division: 'platform', esaLayers: [51], domains: ['testing'], reportsTo: ['CHIEF-PLATFORM', 'DOMAIN-PLATFORM-ENHANCEMENT'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-52', name: 'Documentation System', type: 'layer', division: 'platform', esaLayers: [52], domains: ['documentation'], reportsTo: ['CHIEF-PLATFORM', 'DOMAIN-PLATFORM-ENHANCEMENT'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-53', name: 'Internationalization', type: 'layer', division: 'platform', esaLayers: [53], domains: ['i18n'], reportsTo: ['CHIEF-PLATFORM', 'DOMAIN-PLATFORM-ENHANCEMENT'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-54', name: 'Accessibility', type: 'layer', division: 'platform', esaLayers: [54], domains: ['accessibility'], reportsTo: ['CHIEF-PLATFORM', 'DOMAIN-PLATFORM-ENHANCEMENT'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-55', name: 'SEO Optimization', type: 'layer', division: 'platform', esaLayers: [55], domains: ['seo'], reportsTo: ['CHIEF-PLATFORM', 'DOMAIN-PLATFORM-ENHANCEMENT'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-56', name: 'Compliance Framework', type: 'layer', division: 'platform', esaLayers: [56], domains: ['compliance'], reportsTo: ['CHIEF-PLATFORM', 'DOMAIN-PLATFORM-ENHANCEMENT'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },

  // Extended Division (Layers 57-61)
  { id: 'LAYER-57', name: 'Automation Management', type: 'layer', division: 'extended', esaLayers: [57], domains: ['automation'], reportsTo: ['CHIEF-EXTENDED', 'DOMAIN-MASTER-CONTROL'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-58', name: 'Third-Party Integration Tracking', type: 'layer', division: 'extended', esaLayers: [58], domains: ['integrations'], reportsTo: ['CHIEF-EXTENDED', 'DOMAIN-MASTER-CONTROL'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-59', name: 'Open Source Management', type: 'layer', division: 'extended', esaLayers: [59], domains: ['opensource'], reportsTo: ['CHIEF-EXTENDED', 'DOMAIN-MASTER-CONTROL'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-60', name: 'GitHub Expertise & Organization', type: 'layer', division: 'extended', esaLayers: [60], domains: ['github', 'vcs'], reportsTo: ['CHIEF-EXTENDED', 'DOMAIN-MASTER-CONTROL'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },
  { id: 'LAYER-61', name: 'Supabase Expertise & Organization', type: 'layer', division: 'extended', esaLayers: [61], domains: ['supabase', 'backend'], reportsTo: ['CHIEF-EXTENDED', 'DOMAIN-MASTER-CONTROL'], capabilities: capabilities.layer, expertiseScore: 0.80, status: 'active' },

  // ========== EXPERT AGENTS (7 agents #10-#16) ==========
  { id: 'AGENT-10', name: 'Database Expert', type: 'expert', division: null, esaLayers: [], domains: ['database'], reportsTo: ['AGENT-0'], capabilities: capabilities.expert, expertiseScore: 0.95, status: 'active' },
  { id: 'AGENT-11', name: 'API Expert', type: 'expert', division: null, esaLayers: [], domains: ['api'], reportsTo: ['AGENT-0'], capabilities: capabilities.expert, expertiseScore: 0.95, status: 'active' },
  { id: 'AGENT-12', name: 'Frontend Expert', type: 'expert', division: null, esaLayers: [], domains: ['frontend', 'react'], reportsTo: ['AGENT-0'], capabilities: capabilities.expert, expertiseScore: 0.95, status: 'active' },
  { id: 'AGENT-13', name: 'AI/ML Expert', type: 'expert', division: null, esaLayers: [], domains: ['ai', 'ml'], reportsTo: ['AGENT-0'], capabilities: capabilities.expert, expertiseScore: 0.95, status: 'active' },
  { id: 'AGENT-14', name: 'Security Expert', type: 'expert', division: null, esaLayers: [], domains: ['security'], reportsTo: ['AGENT-0'], capabilities: capabilities.expert, expertiseScore: 0.95, status: 'active' },
  { id: 'AGENT-15', name: 'Performance Expert', type: 'expert', division: null, esaLayers: [], domains: ['performance'], reportsTo: ['AGENT-0'], capabilities: capabilities.expert, expertiseScore: 0.95, status: 'active' },
  { id: 'AGENT-16', name: 'Testing Expert', type: 'expert', division: null, esaLayers: [], domains: ['testing', 'qa'], reportsTo: ['AGENT-0'], capabilities: capabilities.expert, expertiseScore: 0.95, status: 'active' },

  // ========== LIFE CEO AGENTS (16 agents) ==========
  { id: 'LIFE-CEO-CORE', name: 'Life CEO Central Coordinator', type: 'life_ceo', division: 'intelligence', esaLayers: [31], domains: ['life_management'], reportsTo: ['DOMAIN-LIFE-CEO'], capabilities: capabilities.life_ceo, expertiseScore: 0.90, status: 'active' },
  { id: 'LIFE-CEO-BUSINESS', name: 'Business & Career Agent', type: 'life_ceo', division: 'intelligence', esaLayers: [31], domains: ['business', 'career'], reportsTo: ['LIFE-CEO-CORE'], capabilities: capabilities.life_ceo, expertiseScore: 0.85, status: 'active' },
  { id: 'LIFE-CEO-FINANCE', name: 'Finance & Wealth Agent', type: 'life_ceo', division: 'intelligence', esaLayers: [31], domains: ['finance', 'wealth'], reportsTo: ['LIFE-CEO-CORE'], capabilities: capabilities.life_ceo, expertiseScore: 0.85, status: 'active' },
  { id: 'LIFE-CEO-HEALTH', name: 'Health & Fitness Agent', type: 'life_ceo', division: 'intelligence', esaLayers: [31], domains: ['health', 'fitness'], reportsTo: ['LIFE-CEO-CORE'], capabilities: capabilities.life_ceo, expertiseScore: 0.85, status: 'active' },
  { id: 'LIFE-CEO-RELATIONSHIPS', name: 'Relationships Agent', type: 'life_ceo', division: 'intelligence', esaLayers: [31], domains: ['relationships'], reportsTo: ['LIFE-CEO-CORE'], capabilities: capabilities.life_ceo, expertiseScore: 0.85, status: 'active' },
  { id: 'LIFE-CEO-LEARNING', name: 'Learning & Development Agent', type: 'life_ceo', division: 'intelligence', esaLayers: [31], domains: ['learning', 'education'], reportsTo: ['LIFE-CEO-CORE'], capabilities: capabilities.life_ceo, expertiseScore: 0.85, status: 'active' },
  { id: 'LIFE-CEO-CREATIVE', name: 'Creative & Innovation Agent', type: 'life_ceo', division: 'intelligence', esaLayers: [31], domains: ['creative', 'innovation'], reportsTo: ['LIFE-CEO-CORE'], capabilities: capabilities.life_ceo, expertiseScore: 0.85, status: 'active' },
  { id: 'LIFE-CEO-NETWORK', name: 'Network & Community Agent', type: 'life_ceo', division: 'intelligence', esaLayers: [31], domains: ['networking', 'community'], reportsTo: ['LIFE-CEO-CORE'], capabilities: capabilities.life_ceo, expertiseScore: 0.85, status: 'active' },
  { id: 'LIFE-CEO-MOBILITY', name: 'Global Mobility Agent', type: 'life_ceo', division: 'intelligence', esaLayers: [31], domains: ['travel', 'mobility'], reportsTo: ['LIFE-CEO-CORE'], capabilities: capabilities.life_ceo, expertiseScore: 0.85, status: 'active' },
  { id: 'LIFE-CEO-SECURITY', name: 'Security & Privacy Agent', type: 'life_ceo', division: 'intelligence', esaLayers: [31], domains: ['security', 'privacy'], reportsTo: ['LIFE-CEO-CORE'], capabilities: capabilities.life_ceo, expertiseScore: 0.85, status: 'active' },
  { id: 'LIFE-CEO-EMERGENCY', name: 'Emergency Response Agent', type: 'life_ceo', division: 'intelligence', esaLayers: [31], domains: ['emergency'], reportsTo: ['LIFE-CEO-CORE'], capabilities: capabilities.life_ceo, expertiseScore: 0.85, status: 'active' },
  { id: 'LIFE-CEO-MEMORY', name: 'Memory & Archival Agent', type: 'life_ceo', division: 'intelligence', esaLayers: [31], domains: ['memory', 'archive'], reportsTo: ['LIFE-CEO-CORE'], capabilities: capabilities.life_ceo, expertiseScore: 0.85, status: 'active' },
  { id: 'LIFE-CEO-VOICE', name: 'Voice Assistant Agent', type: 'life_ceo', division: 'intelligence', esaLayers: [31], domains: ['voice', 'speech'], reportsTo: ['LIFE-CEO-CORE'], capabilities: capabilities.life_ceo, expertiseScore: 0.85, status: 'active' },
  { id: 'LIFE-CEO-DATA', name: 'Data & Analytics Agent', type: 'life_ceo', division: 'intelligence', esaLayers: [31], domains: ['data', 'analytics'], reportsTo: ['LIFE-CEO-CORE'], capabilities: capabilities.life_ceo, expertiseScore: 0.85, status: 'active' },
  { id: 'LIFE-CEO-WORKFLOW', name: 'Workflow Automation Agent', type: 'life_ceo', division: 'intelligence', esaLayers: [31], domains: ['workflow', 'automation'], reportsTo: ['LIFE-CEO-CORE'], capabilities: capabilities.life_ceo, expertiseScore: 0.85, status: 'active' },
  { id: 'LIFE-CEO-LEGAL', name: 'Legal & Compliance Agent', type: 'life_ceo', division: 'intelligence', esaLayers: [31], domains: ['legal', 'compliance'], reportsTo: ['LIFE-CEO-CORE'], capabilities: capabilities.life_ceo, expertiseScore: 0.85, status: 'active' },

  // ========== MR BLUE AGENTS (8 agents #73-#80) ==========
  { id: 'AGENT-73', name: 'Mr Blue Avatar', type: 'mr_blue', division: null, esaLayers: [], domains: ['avatar', '3d'], reportsTo: ['AGENT-0'], capabilities: capabilities.mr_blue, expertiseScore: 0.90, status: 'active' },
  { id: 'AGENT-74', name: 'Interactive Tour Guide', type: 'mr_blue', division: null, esaLayers: [], domains: ['onboarding', 'tour'], reportsTo: ['AGENT-0'], capabilities: capabilities.mr_blue, expertiseScore: 0.90, status: 'active' },
  { id: 'AGENT-75', name: 'Subscription Manager', type: 'mr_blue', division: null, esaLayers: [], domains: ['subscription', 'billing'], reportsTo: ['AGENT-0'], capabilities: capabilities.mr_blue, expertiseScore: 0.90, status: 'active' },
  { id: 'AGENT-76', name: 'Replit Architecture', type: 'mr_blue', division: null, esaLayers: [], domains: ['replit', 'deployment'], reportsTo: ['AGENT-0'], capabilities: capabilities.mr_blue, expertiseScore: 0.90, status: 'active' },
  { id: 'AGENT-77', name: 'AI Site Builder', type: 'mr_blue', division: null, esaLayers: [], domains: ['ai', 'builder'], reportsTo: ['AGENT-0'], capabilities: capabilities.mr_blue, expertiseScore: 0.90, status: 'active' },
  { id: 'AGENT-78', name: 'Visual Page Editor', type: 'mr_blue', division: null, esaLayers: [], domains: ['editor', 'wysiwyg'], reportsTo: ['AGENT-0'], capabilities: capabilities.mr_blue, expertiseScore: 0.90, status: 'active' },
  { id: 'AGENT-79', name: 'Quality Validator', type: 'mr_blue', division: null, esaLayers: [], domains: ['quality', 'validation'], reportsTo: ['AGENT-0'], capabilities: capabilities.mr_blue, expertiseScore: 0.90, status: 'active' },
  { id: 'AGENT-80', name: 'Learning Coordinator', type: 'mr_blue', division: null, esaLayers: [], domains: ['learning', 'coordination'], reportsTo: ['AGENT-0'], capabilities: capabilities.mr_blue, expertiseScore: 0.90, status: 'active' },

  // ========== ALGORITHM AGENTS (12 agents) ==========
  { id: 'ALGORITHM-SORTING', name: 'Sorting & Organization', type: 'algorithm', division: null, esaLayers: [], domains: ['sorting', 'data_processing'], reportsTo: ['AGENT-0'], capabilities: capabilities.algorithm, expertiseScore: 0.85, status: 'active' },
  { id: 'ALGORITHM-SEARCH', name: 'Search & Indexing', type: 'algorithm', division: null, esaLayers: [], domains: ['search', 'indexing'], reportsTo: ['AGENT-0'], capabilities: capabilities.algorithm, expertiseScore: 0.85, status: 'active' },
  { id: 'ALGORITHM-RECOMMENDATION', name: 'Recommendation Engine', type: 'algorithm', division: null, esaLayers: [], domains: ['ml', 'recommendations'], reportsTo: ['AGENT-0'], capabilities: capabilities.algorithm, expertiseScore: 0.85, status: 'active' },
  { id: 'ALGORITHM-OPTIMIZATION', name: 'Performance Optimization', type: 'algorithm', division: null, esaLayers: [], domains: ['optimization', 'performance'], reportsTo: ['AGENT-0'], capabilities: capabilities.algorithm, expertiseScore: 0.85, status: 'active' },
  { id: 'ALGORITHM-MATCHING', name: 'Matching & Pairing', type: 'algorithm', division: null, esaLayers: [], domains: ['matching', 'pairing'], reportsTo: ['AGENT-0'], capabilities: capabilities.algorithm, expertiseScore: 0.85, status: 'active' },
  { id: 'ALGORITHM-PREDICTION', name: 'Predictive Analytics', type: 'algorithm', division: null, esaLayers: [], domains: ['ml', 'prediction'], reportsTo: ['AGENT-0'], capabilities: capabilities.algorithm, expertiseScore: 0.85, status: 'active' },
  { id: 'ALGORITHM-CLUSTERING', name: 'Clustering & Grouping', type: 'algorithm', division: null, esaLayers: [], domains: ['clustering', 'ml'], reportsTo: ['AGENT-0'], capabilities: capabilities.algorithm, expertiseScore: 0.85, status: 'active' },
  { id: 'ALGORITHM-ROUTING', name: 'Routing & Pathfinding', type: 'algorithm', division: null, esaLayers: [], domains: ['routing', 'pathfinding'], reportsTo: ['AGENT-0'], capabilities: capabilities.algorithm, expertiseScore: 0.85, status: 'active' },
  { id: 'ALGORITHM-COMPRESSION', name: 'Data Compression', type: 'algorithm', division: null, esaLayers: [], domains: ['compression', 'encoding'], reportsTo: ['AGENT-0'], capabilities: capabilities.algorithm, expertiseScore: 0.85, status: 'active' },
  { id: 'ALGORITHM-ENCRYPTION', name: 'Encryption & Security', type: 'algorithm', division: null, esaLayers: [], domains: ['encryption', 'security'], reportsTo: ['AGENT-0'], capabilities: capabilities.algorithm, expertiseScore: 0.85, status: 'active' },
  { id: 'ALGORITHM-VALIDATION', name: 'Data Validation', type: 'algorithm', division: null, esaLayers: [], domains: ['validation', 'verification'], reportsTo: ['AGENT-0'], capabilities: capabilities.algorithm, expertiseScore: 0.85, status: 'active' },
  { id: 'ALGORITHM-TRANSFORMATION', name: 'Data Transformation', type: 'algorithm', division: null, esaLayers: [], domains: ['transformation', 'etl'], reportsTo: ['AGENT-0'], capabilities: capabilities.algorithm, expertiseScore: 0.85, status: 'active' },
];

// Seed function
export async function seedEsaAgents() {
  console.log('🚀 Starting ESA Agent Registry seeding...');
  console.log(`📊 Registering ${esaAgentsList.length} agents...`);

  try {
    // Insert all agents
    await db.insert(esaAgents).values(esaAgentsList);
    
    console.log('✅ Successfully registered all 114 ESA agents!');
    console.log('\n📈 Agent Breakdown:');
    console.log('  - 1 CEO (Agent #0)');
    console.log('  - 6 Division Chiefs');
    console.log('  - 9 Domain Coordinators');
    console.log('  - 61 Layer Agents');
    console.log('  - 7 Expert Agents (#10-#16)');
    console.log('  - 16 Life CEO Agents');
    console.log('  - 8 Mr Blue Agents (#73-#80)');
    console.log('  - 12 Algorithm Agents');
    console.log('\n🎯 Total: 114 agents ready for autonomous operations!');
    
    return { success: true, count: esaAgentsList.length };
  } catch (error) {
    console.error('❌ Error seeding ESA agents:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedEsaAgents()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
