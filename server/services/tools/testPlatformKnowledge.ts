/**
 * Test Platform Knowledge Tools
 * Verifies all 4 tools return valid structured data
 */

import { 
  scanComponentRegistry, 
  scanAPIRoutes, 
  getDatabaseSchema, 
  getFeatureStatus 
} from './platformKnowledge';

async function testPlatformKnowledgeTools() {
  console.log('🧪 Testing Platform Knowledge Tools...\n');

  try {
    // Test 1: Component Registry
    console.log('1️⃣ Testing scanComponentRegistry()...');
    const components = await scanComponentRegistry();
    console.log(`   ✅ Found ${components.length} components`);
    if (components.length > 0) {
      console.log(`   📦 Sample: ${components[0].name} (${components[0].path})`);
      console.log(`   📤 Exports: ${components[0].exports.join(', ')}`);
    }
    console.log('');

    // Test 2: API Routes
    console.log('2️⃣ Testing scanAPIRoutes()...');
    const routes = await scanAPIRoutes();
    console.log(`   ✅ Found ${routes.length} API routes`);
    const withAuth = routes.filter(r => r.hasAuth);
    console.log(`   🔐 ${withAuth.length} protected routes`);
    console.log(`   🌍 ${routes.length - withAuth.length} public routes`);
    if (routes.length > 0) {
      console.log(`   📍 Sample: ${routes[0].method} ${routes[0].path}`);
    }
    console.log('');

    // Test 3: Database Schema
    console.log('3️⃣ Testing getDatabaseSchema()...');
    const tables = await getDatabaseSchema();
    console.log(`   ✅ Found ${tables.length} database tables`);
    if (tables.length > 0) {
      console.log(`   🗄️ Sample: ${tables[0].name} (${tables[0].columns.length} columns)`);
      if (tables[0].relations.length > 0) {
        console.log(`   🔗 Relations: ${tables[0].relations.join(', ')}`);
      }
    }
    console.log('');

    // Test 4: Feature Status
    console.log('4️⃣ Testing getFeatureStatus()...');
    const features = await getFeatureStatus();
    console.log(`   ✅ Found ${features.length} features`);
    const completed = features.filter(f => f.status === 'completed').length;
    const inProgress = features.filter(f => f.status === 'in_progress').length;
    console.log(`   ✓ ${completed} completed`);
    console.log(`   ⏳ ${inProgress} in progress`);
    if (features.length > 0) {
      console.log(`   📊 Sample: ${features[0].feature} (${features[0].completion}%)`);
    }
    console.log('');

    console.log('✅ All tests passed! Platform Knowledge Tools are ready.');
    console.log('\n📊 Summary:');
    console.log(`   - ${components.length} React components`);
    console.log(`   - ${routes.length} API endpoints`);
    console.log(`   - ${tables.length} database tables`);
    console.log(`   - ${features.length} platform features`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testPlatformKnowledgeTools();
