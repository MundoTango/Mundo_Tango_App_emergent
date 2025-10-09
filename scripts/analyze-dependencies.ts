#!/usr/bin/env tsx

import { dependencyMapper } from '../server/services/dependencyMapper';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log('📦 Dependency Analysis CLI\n');
    console.log('Usage:');
    console.log('  npm run analyze-deps map              # Generate full dependency map');
    console.log('  npm run analyze-deps layer <number>    # Show deps for specific ESA layer');
    console.log('  npm run analyze-deps category <name>   # Show deps by category');
    console.log('  npm run analyze-deps unused            # Find unused candidates');
    console.log('\nExamples:');
    console.log('  npm run analyze-deps map');
    console.log('  npm run analyze-deps layer 11          # Aurora UI/UX packages');
    console.log('  npm run analyze-deps category "AI/ML"');
    process.exit(0);
  }

  try {
    if (command === 'map') {
      await generateFullMap();
    } else if (command === 'layer') {
      const layer = parseInt(args[1]);
      if (isNaN(layer)) {
        console.error('❌ Error: Layer must be a number');
        process.exit(1);
      }
      await showLayerDependencies(layer);
    } else if (command === 'category') {
      const category = args.slice(1).join(' ');
      if (!category) {
        console.error('❌ Error: Category name required');
        process.exit(1);
      }
      await showCategoryDependencies(category);
    } else if (command === 'unused') {
      await showUnusedCandidates();
    } else {
      console.error(`❌ Unknown command: ${command}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function generateFullMap() {
  console.log('\n🔍 Analyzing 200+ dependencies...\n');
  
  const map = await dependencyMapper.generateMap();
  const report = dependencyMapper.formatReport(map);
  
  console.log(report);
  
  // Save to file
  const reportsDir = join(process.cwd(), 'docs/dependency-reports');
  mkdirSync(reportsDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filepath = join(reportsDir, `dependency-map-${timestamp}.json`);
  
  writeFileSync(filepath, JSON.stringify(map, null, 2));
  console.log(`\n💾 Full map saved to: docs/dependency-reports/dependency-map-${timestamp}.json\n`);
  
  // Generate recommendations
  if (map.unusedCandidates.length > 0) {
    console.log('💡 Recommendations:');
    console.log(`   - Review ${map.unusedCandidates.length} uncategorized packages`);
    console.log('   - Run "npm run analyze-deps unused" for details');
  }
}

async function showLayerDependencies(layer: number) {
  console.log(`\n🏗️  ESA Layer ${layer} Dependencies:\n`);
  
  const deps = await dependencyMapper.getDependenciesByLayer(layer);
  
  if (deps.length === 0) {
    console.log(`   No dependencies mapped to Layer ${layer}\n`);
    return;
  }
  
  console.log(`   Found ${deps.length} packages:\n`);
  
  deps.forEach(dep => {
    console.log(`   📦 ${dep.name}@${dep.version}`);
    console.log(`      Category: ${dep.category}`);
    console.log(`      Type: ${dep.type}`);
    if (dep.esaLayers.length > 1) {
      console.log(`      Also in layers: ${dep.esaLayers.filter(l => l !== layer).join(', ')}`);
    }
    console.log('');
  });
}

async function showCategoryDependencies(category: string) {
  console.log(`\n📁 "${category}" Category Dependencies:\n`);
  
  const deps = await dependencyMapper.getDependenciesByCategory(category);
  
  if (deps.length === 0) {
    console.log(`   No dependencies found in category: ${category}\n`);
    const map = await dependencyMapper.generateMap();
    console.log('   Available categories:');
    Object.keys(map.categories).forEach(cat => {
      console.log(`   - ${cat}`);
    });
    console.log('');
    return;
  }
  
  console.log(`   Found ${deps.length} packages:\n`);
  
  deps.forEach(dep => {
    const layerInfo = dep.esaLayers.length > 0 
      ? `ESA Layers: ${dep.esaLayers.join(', ')}` 
      : 'No ESA layer mapping';
    console.log(`   📦 ${dep.name}@${dep.version} (${dep.type}) - ${layerInfo}`);
  });
  console.log('');
}

async function showUnusedCandidates() {
  console.log('\n⚠️  Uncategorized Dependencies:\n');
  
  const map = await dependencyMapper.generateMap();
  
  if (map.unusedCandidates.length === 0) {
    console.log('   ✅ All dependencies are properly categorized!\n');
    return;
  }
  
  console.log(`   Found ${map.unusedCandidates.length} packages that may be unused or miscategorized:\n`);
  
  map.unusedCandidates.forEach(name => {
    const dep = Object.values(map.categories)
      .flat()
      .find(d => d.name === name);
    
    if (dep) {
      console.log(`   📦 ${dep.name}@${dep.version}`);
      console.log(`      Type: ${dep.type}`);
      console.log(`      ESA Layers: ${dep.esaLayers.join(', ') || 'Layer 59 (default)'}`);
      console.log('');
    }
  });
  
  console.log('💡 Next Steps:');
  console.log('   1. Review each package to determine if it\'s still needed');
  console.log('   2. Add to appropriate category in dependencyMapper.ts');
  console.log('   3. Consider removing if truly unused (after thorough testing)');
  console.log('');
}

main();
