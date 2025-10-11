// ESA 61x21 Framework - Layer Mappings
// Source: docs/platform-handoff/esa.md

export const ESA_LAYER_NAMES: Record<number, string> = {
  // Infrastructure & Core (Layers 1-10)
  1: "Infrastructure & Deployment",
  2: "API & Backend Services",
  3: "Database & Data Layer",
  4: "Authentication & Security",
  5: "Error Handling & Logging",
  6: "Performance & Optimization",
  7: "Testing & QA",
  8: "UI/UX Foundation",
  9: "Agent Coordination",
  10: "Component Library",
  
  // Real-time & Communication (Layers 11-15)
  11: "Real-time & WebSocket",
  12: "Notifications & Alerts",
  13: "Email & Messaging",
  14: "Code Quality & Standards",
  15: "Documentation",
  
  // Content & Internationalization (Layer 16-20)
  16: "i18n & Translation",
  17: "Content Management",
  18: "SEO & Analytics",
  19: "Media & Assets",
  20: "Background Tasks",
  
  // Business Logic Layers (21-30)
  21: "User Management",
  22: "Community Platform",
  23: "Social Features",
  24: "Events & Calendar",
  25: "Housing & Listings",
  26: "Recommendations",
  27: "Search & Discovery",
  28: "Marketplace",
  29: "Booking & Reservations",
  30: "Payments & Billing",
  
  // Life CEO Agents (31-46)
  31: "AI Integration Core",
  32: "Health & Wellness AI",
  33: "Career & Professional AI",
  34: "Finance & Budget AI",
  35: "Relationships AI",
  36: "Learning & Education AI",
  37: "Travel & Adventure AI",
  38: "Home & Living AI",
  39: "Entertainment AI",
  40: "Productivity AI",
  41: "Spiritual & Mindfulness AI",
  42: "Social Connections AI",
  43: "Personal Goals AI",
  44: "Time Management AI",
  45: "Communication AI",
  46: "Self-Improvement AI",
  
  // Advanced Features (47-56)
  47: "AI Memory & Context",
  48: "Voice & Speech",
  49: "Computer Vision",
  50: "Natural Language",
  51: "Recommendations Engine",
  52: "Predictive Analytics",
  53: "Workflow Automation",
  54: "Content Generation",
  55: "Data Privacy & Compliance",
  56: "Mobile & PWA",
  
  // Expert Agents (57-61)
  57: "Automation Management",
  58: "Third-Party Integration",
  59: "Open Source Management",
  60: "GitHub Expertise",
  61: "Supabase Expertise",
};

export function getLayerName(layerNum: number): string {
  return ESA_LAYER_NAMES[layerNum] || `Layer ${layerNum}`;
}

export function getLayerTooltip(layerNum: number): string {
  const name = ESA_LAYER_NAMES[layerNum];
  if (!name) return `ESA Layer ${layerNum}`;
  return `Layer ${layerNum}: ${name}`;
}
