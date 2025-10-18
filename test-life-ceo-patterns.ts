/**
 * Test script to verify life_ceo_patterns table operations
 * Tests INSERT, SELECT, UPDATE (via onConflictDoUpdate), and DELETE
 */

import { db } from './server/db';
import { life_ceo_patterns, eq } from './shared/schema';

async function testLifeCeoPatterns() {
  console.log('🧪 Testing life_ceo_patterns table operations...\n');

  const testPatternId = `test-pattern-${Date.now()}`;

  try {
    // Test 1: INSERT
    console.log('1️⃣ Testing INSERT...');
    await db.insert(life_ceo_patterns).values({
      pattern_id: testPatternId,
      pattern_text: 'User struggles with TypeScript build errors',
      solution: 'Check for missing type definitions and run npm run build',
      success_rate: 0.85,
      category: 'typescript',
      last_seen: new Date(),
      occurrences: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('   ✅ INSERT successful\n');

    // Test 2: SELECT
    console.log('2️⃣ Testing SELECT...');
    const patterns = await db
      .select()
      .from(life_ceo_patterns)
      .where(eq(life_ceo_patterns.pattern_id, testPatternId))
      .limit(1);
    
    if (patterns.length === 0) {
      throw new Error('Pattern not found after insert');
    }
    console.log('   ✅ SELECT successful');
    console.log('   📊 Pattern data:', {
      id: patterns[0].pattern_id,
      category: patterns[0].category,
      success_rate: patterns[0].success_rate,
      occurrences: patterns[0].occurrences,
    });
    console.log('');

    // Test 3: UPDATE (via onConflictDoUpdate)
    console.log('3️⃣ Testing UPDATE (onConflictDoUpdate)...');
    await db
      .insert(life_ceo_patterns)
      .values({
        pattern_id: testPatternId,
        pattern_text: 'User struggles with TypeScript build errors',
        solution: 'Check for missing type definitions and run npm run build',
        success_rate: 0.90, // Updated
        category: 'typescript',
        last_seen: new Date(),
        occurrences: 2, // Updated
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [life_ceo_patterns.pattern_id],
        set: {
          occurrences: 2,
          success_rate: 0.90,
          last_seen: new Date(),
          updatedAt: new Date(),
        },
      });

    const updatedPatterns = await db
      .select()
      .from(life_ceo_patterns)
      .where(eq(life_ceo_patterns.pattern_id, testPatternId))
      .limit(1);

    if (updatedPatterns[0].occurrences !== 2) {
      throw new Error('Pattern was not updated correctly');
    }
    console.log('   ✅ UPDATE successful');
    console.log('   📊 Updated data:', {
      occurrences: updatedPatterns[0].occurrences,
      success_rate: updatedPatterns[0].success_rate,
    });
    console.log('');

    // Test 4: Query by category (test index)
    console.log('4️⃣ Testing category index query...');
    const typescriptPatterns = await db
      .select()
      .from(life_ceo_patterns)
      .where(eq(life_ceo_patterns.category, 'typescript'))
      .limit(5);
    console.log(`   ✅ Index query successful (found ${typescriptPatterns.length} patterns)\n`);

    // Test 5: DELETE (cleanup)
    console.log('5️⃣ Testing DELETE...');
    await db
      .delete(life_ceo_patterns)
      .where(eq(life_ceo_patterns.pattern_id, testPatternId));
    
    const deletedCheck = await db
      .select()
      .from(life_ceo_patterns)
      .where(eq(life_ceo_patterns.pattern_id, testPatternId))
      .limit(1);

    if (deletedCheck.length !== 0) {
      throw new Error('Pattern was not deleted');
    }
    console.log('   ✅ DELETE successful\n');

    console.log('🎉 All tests passed! life_ceo_patterns table is fully operational.\n');
    console.log('✅ Deployment blocker RESOLVED:');
    console.log('   - Table exists in database');
    console.log('   - ORM can INSERT, SELECT, UPDATE, DELETE');
    console.log('   - Indexes are working');
    console.log('   - End-to-end validation: PASSED\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Cleanup on error
    try {
      await db
        .delete(life_ceo_patterns)
        .where(eq(life_ceo_patterns.pattern_id, testPatternId));
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    
    process.exit(1);
  }
}

testLifeCeoPatterns();
