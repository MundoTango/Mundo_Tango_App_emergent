#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GLASS_PATTERNS = [
  {
    pattern: /className="([^"]*)(bg-white\/\d+|bg-black\/\d+)([^"]*)backdrop-blur([^"]*)"/g,
    shouldMigrate: (className) => !className.includes('GlassCard'),
    replacement: 'GlassCard'
  }
];

function analyzeGlassPotential(content) {
  const patterns = [
    /backdrop-blur/g,
    /bg-white\/\d+/g,
    /bg-black\/\d+/g,
    /border-white\/\d+/g,
    /border-black\/\d+/g
  ];
  
  let score = 0;
  patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) score += matches.length;
  });
  
  return score;
}

function migrateToGlassCard(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  const glassScore = analyzeGlassPotential(content);
  
  if (glassScore === 0) {
    return { migrated: false, score: 0, reason: 'No glass effects detected' };
  }
  
  // Check if already importing GlassCard
  const hasGlassImport = content.includes('from \'@/components/glass/GlassComponents\'');
  
  if (!hasGlassImport && glassScore > 0) {
    // Add import if file has glass potential
    const importStatement = "import { GlassCard } from '@/components/glass/GlassComponents';\n";
    
    // Find last import statement
    const importRegex = /import[^;]+from[^;]+;/g;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      content = content.replace(lastImport, `${lastImport}\n${importStatement}`);
    }
  }
  
  let changes = 0;
  
  // Look for div elements with glass-like properties
  const glassishDivs = content.match(/<div[^>]*className="[^"]*backdrop-blur[^"]*"[^>]*>/g);
  
  if (glassishDivs && glassishDivs.length > 0) {
    glassishDivs.forEach(div => {
      const classMatch = div.match(/className="([^"]*)"/);
      if (classMatch) {
        const classes = classMatch[1];
        
        // Determine depth based on blur/opacity
        let depth = 2;
        if (classes.includes('backdrop-blur-xl') || classes.includes('bg-white/30')) depth = 3;
        if (classes.includes('backdrop-blur-sm') || classes.includes('bg-white/5')) depth = 1;
        
        // Extract non-glass classes
        const keepClasses = classes
          .split(' ')
          .filter(c => !c.includes('backdrop') && !c.includes('bg-white/') && !c.includes('bg-black/'))
          .join(' ');
        
        const replacement = `<GlassCard depth={${depth}} className="${keepClasses}"`;
        content = content.replace(div, replacement);
        
        // Also need to replace closing </div> but this is complex, flag for manual review
        changes++;
      }
    });
  }
  
  if (changes > 0) {
    writeFileSync(filePath, content);
    return { migrated: true, score: glassScore, changes, needsReview: changes > 0 };
  }
  
  return { migrated: false, score: glassScore, reason: 'Automatic migration not safe' };
}

function scanFiles(dir) {
  const files = [];
  
  function scan(currentDir) {
    const entries = readdirSync(currentDir);
    
    entries.forEach(entry => {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        scan(fullPath);
      } else if (stat.isFile() && (entry.endsWith('.tsx') || entry.endsWith('.jsx'))) {
        files.push(fullPath);
      }
    });
  }
  
  scan(dir);
  return files;
}

// Main execution
const targetDir = process.argv[2] || join(__dirname, '../../client/src');
const files = scanFiles(targetDir);

console.log(`\n✨ GLASSCARD MIGRATION TOOL\n`);
console.log('═'.repeat(80));
console.log(`\nScanning: ${targetDir}`);
console.log(`Files found: ${files.length}\n`);

let totalMigrated = 0;
let totalCandidates = 0;
const candidates = [];

files.forEach((file, index) => {
  const result = migrateToGlassCard(file);
  
  if (result.migrated) {
    totalMigrated++;
    console.log(`✅ [${index + 1}/${files.length}] ${file.replace(targetDir, '')} (migrated, ${result.changes} changes)`);
    if (result.needsReview) {
      candidates.push(file);
    }
  } else if (result.score > 0) {
    totalCandidates++;
    candidates.push(file);
    console.log(`🔍 [${index + 1}/${files.length}] ${file.replace(targetDir, '')} (candidate, score: ${result.score})`);
  }
});

console.log(`\n${'═'.repeat(80)}`);
console.log(`\n📊 GLASSCARD SUMMARY:`);
console.log(`   Files scanned: ${files.length}`);
console.log(`   Files migrated: ${totalMigrated}`);
console.log(`   Candidates for manual review: ${totalCandidates}`);
console.log(`\n💡 Files needing manual review:`);
candidates.slice(0, 10).forEach(file => {
  console.log(`   - ${file.replace(targetDir, '')}`);
});
if (candidates.length > 10) {
  console.log(`   ... and ${candidates.length - 10} more`);
}
console.log('');
