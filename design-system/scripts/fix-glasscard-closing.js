#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔧 Fixing GlassCard closing tags...\n');

const filesWithErrors = [
  'client/src/components/Community/CommunityCard.tsx',
  'client/src/components/Community/CommunityMapWithLayers.tsx',
  'client/src/components/Community/EnhancedCityGroupCard.tsx',
  'client/src/components/Community/WorldMap.tsx',
  'client/src/components/admin/AdminLayout.tsx',
  'client/src/components/admin/LifeCEODashboard.tsx',
  'client/src/components/admin/ProjectTrackerDashboard.tsx',
  'client/src/components/memories/EnhancedMemoriesRealtime.tsx',
  'client/src/components/modern/ModernMemoriesHeader.tsx',
  'client/src/components/modern/ModernTagFilter.tsx',
  'client/src/components/modern/ShareModal.tsx',
  'client/src/components/moments/PostFeed.tsx',
  'client/src/components/profile/ProfileErrorBoundary.tsx',
  'client/src/components/profile/ProfileFallbacks.tsx',
  'client/src/components/resilient/ResilientBoundary.tsx',
  'client/src/components/universal/UnifiedLocationPicker.tsx'
];

let totalFixed = 0;
let filesModified = 0;

filesWithErrors.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  let modified = false;
  let openGlassCardStack = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track GlassCard opening tags
    if (line.includes('<GlassCard')) {
      const depth = line.search(/\S/); // Get indentation
      openGlassCardStack.push({ line: i, depth, indent: line.substring(0, depth) });
    }
    
    // Fix </div> that should be </GlassCard>
    if (line.includes('</div>') && openGlassCardStack.length > 0) {
      const lastGlassCard = openGlassCardStack[openGlassCardStack.length - 1];
      const currentDepth = line.search(/\S/);
      
      // If indentation matches the GlassCard opening tag, this is likely its closing tag
      if (currentDepth === lastGlassCard.depth) {
        lines[i] = line.replace('</div>', '</GlassCard>');
        openGlassCardStack.pop();
        modified = true;
        totalFixed++;
      }
    }
    
    // Also check for actual closing GlassCard tags (to pop stack)
    if (line.includes('</GlassCard>')) {
      if (openGlassCardStack.length > 0) {
        openGlassCardStack.pop();
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    filesModified++;
    console.log(`✅ Fixed ${path.basename(filePath)}`);
  } else {
    console.log(`⏭️  No issues in ${path.basename(filePath)}`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Files scanned: ${filesWithErrors.length}`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Closing tags fixed: ${totalFixed}`);
console.log(`\n✨ GlassCard closing tag fix complete!`);
