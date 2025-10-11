/**
 * ESA Layer → Review Category Mapper
 * Based on: ESA 61x21 Framework
 * Maps ESA layers to 8 systematic review categories for human validation
 */

import type { ReviewCategory } from "../types";

const LAYER_CATEGORY_MAP: Record<string, ReviewCategory> = {
  // Layers 1-6: Architecture & Data Integrity
  "1,2,3,4,5,6": "Architecture & Data Integrity",
  
  // Layers 8-10, 54: UI/UX & Accessibility
  "8,9,10,54": "UI/UX & Accessibility",
  
  // Layers 21-30, 49: Business Logic & Security
  "21,22,23,24,25,26,27,28,29,30,49": "Business Logic & Security",
  
  // Layers 2, 12, 13, 48: API & Performance
  "2,12,13,48": "API & Performance",
  
  // Layers 31-46: AI Intelligence
  "31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46": "AI Intelligence",
  
  // Layers 19, 53: Content & i18n
  "19,53": "Content & i18n",
  
  // Layer 51: Testing & QA
  "51": "Testing & QA",
  
  // Layers 52, 56: Documentation & Compliance
  "52,56": "Documentation & Compliance"
};

/**
 * Categorizes an audit finding based on affected ESA layers
 */
export function categorizeByESALayers(layers: number[]): ReviewCategory {
  for (const [layerRange, category] of Object.entries(LAYER_CATEGORY_MAP)) {
    const allowedLayers = layerRange.split(',').map(Number);
    if (layers.some(layer => allowedLayers.includes(layer))) {
      return category;
    }
  }
  
  // Default fallback
  return "Architecture & Data Integrity";
}

/**
 * Get all ESA layers for a given category
 */
export function getLayersForCategory(category: ReviewCategory): number[] {
  for (const [layerRange, cat] of Object.entries(LAYER_CATEGORY_MAP)) {
    if (cat === category) {
      return layerRange.split(',').map(Number);
    }
  }
  return [];
}

/**
 * Get category description
 */
export function getCategoryDescription(category: ReviewCategory): string {
  const descriptions: Record<ReviewCategory, string> = {
    "Architecture & Data Integrity": "Foundation stability, data safety, database schema, API design, security",
    "UI/UX & Accessibility": "Visual design, Aurora Tide compliance, WCAG 2.1 AA, dark mode, responsive design",
    "Business Logic & Security": "Core functionality, workflows, edge cases, XSS/CSRF prevention, vulnerabilities",
    "API & Performance": "External APIs, data processing, file uploads, performance metrics, optimization",
    "AI Intelligence": "AI accuracy, prompt engineering, hallucination prevention, token usage, context management",
    "Content & i18n": "Translation quality (68 languages), cultural sensitivity, RTL support, content moderation",
    "Testing & QA": "Test coverage, E2E scenarios, regression risks, error handling, load testing",
    "Documentation & Compliance": "API docs, user guides, GDPR compliance, license compliance, legal requirements"
  };
  
  return descriptions[category] || "";
}

/**
 * Get primary agents for a category
 */
export function getPrimaryAgents(category: ReviewCategory): number[] {
  const agentMap: Record<ReviewCategory, number[]> = {
    "Architecture & Data Integrity": [1, 2, 3, 4, 5, 6],
    "UI/UX & Accessibility": [17, 54],  // Agent #17 (UI/UX), Agent #54 (Accessibility)
    "Business Logic & Security": [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 49],
    "API & Performance": [2, 48],  // Agent #2 (API), Agent #48 (Performance)
    "AI Intelligence": [10, 35],  // Agent #10 (AI Research), Agent #35 (AI Agents)
    "Content & i18n": [16, 19],  // Agent #16 (Translation), Agent #19 (Content)
    "Testing & QA": [51],  // Agent #51 (Testing)
    "Documentation & Compliance": [52, 56]  // Agent #52 (Docs), Agent #56 (Compliance)
  };
  
  return agentMap[category] || [];
}
