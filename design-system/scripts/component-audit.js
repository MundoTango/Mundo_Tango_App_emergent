#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIENT_SRC = path.join(process.cwd(), 'client', 'src');
const AUDIT_OUTPUT = path.join(process.cwd(), 'design-system', 'audit-report.json');

// Atomic Design hierarchy
const ATOMIC_LEVELS = {
  atoms: [],
  molecules: [],
  organisms: [],
  templates: [],
  pages: []
};

// Track Aurora Tide compliance
const compliance = {
  usingGlassCard: 0,
  usingDarkMode: 0,
  usingTranslations: 0,
  usingFramerMotion: 0,
  usingGSAP: 0,
  usingMicroInteractions: 0,
  hardcodedColors: [],
  hardcodedSpacing: [],
  missingTestIds: [],
  total: 0
};

// Recursive file scanner
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      auditComponent(filePath);
    }
  });
}

// Audit individual component
function auditComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(CLIENT_SRC, filePath);
  
  compliance.total++;
  
  const issues = [];
  
  // Check for Aurora Tide patterns
  if (content.includes('GlassCard') || content.includes('@/components/glass')) {
    compliance.usingGlassCard++;
  } else {
    issues.push('Missing GlassCard usage');
  }
  
  if (content.includes('dark:')) {
    compliance.usingDarkMode++;
  } else {
    issues.push('Missing dark mode variants');
  }
  
  if (content.includes('useTranslation') || content.includes("t('")) {
    compliance.usingTranslations++;
  } else {
    issues.push('Missing i18next translations');
  }
  
  if (content.includes('framer-motion') || content.includes('FadeIn') || content.includes('ScaleIn')) {
    compliance.usingFramerMotion++;
  }
  
  if (content.includes('gsap') || content.includes('useScrollReveal')) {
    compliance.usingGSAP++;
  }
  
  if (content.includes('MagneticButton') || content.includes('RippleCard')) {
    compliance.usingMicroInteractions++;
  }
  
  // Check for hardcoded values
  const colorRegex = /#[0-9a-fA-F]{3,6}|rgb\(|rgba\(/g;
  const colorMatches = content.match(colorRegex);
  if (colorMatches && colorMatches.length > 0) {
    compliance.hardcodedColors.push({
      file: relativePath,
      matches: colorMatches
    });
  }
  
  // Check for data-testid
  if (!content.includes('data-testid')) {
    compliance.missingTestIds.push(relativePath);
  }
  
  // Classify by Atomic Design
  if (relativePath.includes('components/ui/')) {
    ATOMIC_LEVELS.atoms.push({ file: relativePath, issues });
  } else if (relativePath.includes('components/') && !relativePath.includes('pages')) {
    ATOMIC_LEVELS.molecules.push({ file: relativePath, issues });
  } else if (relativePath.includes('pages/')) {
    ATOMIC_LEVELS.pages.push({ file: relativePath, issues });
  }
}

// Main execution
console.log('🔍 Starting Component Audit...\n');

scanDirectory(CLIENT_SRC);

// Calculate compliance percentages
const percentages = {
  glassCard: ((compliance.usingGlassCard / compliance.total) * 100).toFixed(1),
  darkMode: ((compliance.usingDarkMode / compliance.total) * 100).toFixed(1),
  translations: ((compliance.usingTranslations / compliance.total) * 100).toFixed(1),
  framerMotion: ((compliance.usingFramerMotion / compliance.total) * 100).toFixed(1),
  gsap: ((compliance.usingGSAP / compliance.total) * 100).toFixed(1),
  microInteractions: ((compliance.usingMicroInteractions / compliance.total) * 100).toFixed(1)
};

// Generate report
const report = {
  timestamp: new Date().toISOString(),
  totalComponents: compliance.total,
  atomicDesign: {
    atoms: ATOMIC_LEVELS.atoms.length,
    molecules: ATOMIC_LEVELS.molecules.length,
    organisms: ATOMIC_LEVELS.organisms.length,
    templates: ATOMIC_LEVELS.templates.length,
    pages: ATOMIC_LEVELS.pages.length
  },
  auroraCompliance: percentages,
  issues: {
    hardcodedColors: compliance.hardcodedColors.length,
    hardcodedSpacing: compliance.hardcodedSpacing.length,
    missingTestIds: compliance.missingTestIds.length
  },
  details: {
    atomicLevels: ATOMIC_LEVELS,
    compliance,
    percentages
  }
};

// Save report
fs.writeFileSync(AUDIT_OUTPUT, JSON.stringify(report, null, 2));

// Console output
console.log('📊 Component Audit Complete!\n');
console.log(`Total Components Scanned: ${compliance.total}`);
console.log(`\nAtomic Design Distribution:`);
console.log(`  Atoms: ${ATOMIC_LEVELS.atoms.length}`);
console.log(`  Molecules: ${ATOMIC_LEVELS.molecules.length}`);
console.log(`  Organisms: ${ATOMIC_LEVELS.organisms.length}`);
console.log(`  Templates: ${ATOMIC_LEVELS.templates.length}`);
console.log(`  Pages: ${ATOMIC_LEVELS.pages.length}`);
console.log(`\nAurora Tide Compliance:`);
console.log(`  GlassCard Usage: ${percentages.glassCard}%`);
console.log(`  Dark Mode Support: ${percentages.darkMode}%`);
console.log(`  i18n Translations: ${percentages.translations}%`);
console.log(`  Framer Motion: ${percentages.framerMotion}%`);
console.log(`  GSAP Animations: ${percentages.gsap}%`);
console.log(`  Micro-interactions: ${percentages.microInteractions}%`);
console.log(`\nIssues Found:`);
console.log(`  Hardcoded Colors: ${compliance.hardcodedColors.length} files`);
console.log(`  Missing Test IDs: ${compliance.missingTestIds.length} files`);
console.log(`\n📄 Full report saved to: ${AUDIT_OUTPUT}\n`);

process.exit(0);
