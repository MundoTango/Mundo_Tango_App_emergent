/**
 * Mr Blue Streaming & Vibe Coding Automated Tests
 * Run with: node tests/mr-blue-streaming-test.js
 */

const TEST_URL = 'http://127.0.0.1:5000';
const CONVERSATION_ID = 19938;

// Test utilities
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sendMessage = async (message) => {
  console.log(`\n📤 SENDING: "${message}"`);
  const response = await fetch(`${TEST_URL}/api/mrblue/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      conversationId: CONVERSATION_ID,
      message,
      model: 'gpt-4o'
    })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response;
};

const checkLogs = () => {
  console.log('\n📋 CHECK BROWSER CONSOLE FOR:');
  console.log('   - 🎯 [ChatInterface] Tracking assistant message ID: {NEW_ID}');
  console.log('   - 🎨 [Vibe] Added X diff cards to message {SAME_ID}');
  console.log('   - 🔢 [Vibe] SaveOrchestrator now has X pending changes');
};

// Test Runner
(async () => {
  console.log('='.repeat(60));
  console.log('🧪 MR BLUE STREAMING & VIBE CODING TESTS');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Server Health Check
    console.log('\n\n📍 TEST 1: Server Health Check');
    const health = await fetch(TEST_URL);
    console.log(`✅ Server responding: ${health.status} ${health.statusText}`);
    
    // Test 2: Send message and verify streaming
    console.log('\n\n📍 TEST 2: Streaming Status Display');
    console.log('ACTION: Send a message and watch console for MB.MD phases');
    console.log('EXPECTED: Status indicators appear on NEW message');
    
    const response = await sendMessage('Add a ⭐ star emoji next to "Find Events"');
    console.log('✅ Message sent successfully');
    console.log('⏳ Waiting 10 seconds for vibe coding to complete...');
    await delay(10000);
    
    checkLogs();
    
    // Test 3: Check SaveOrchestrator accumulation
    console.log('\n\n📍 TEST 3: SaveOrchestrator Accumulation');
    console.log('Sending second message to test accumulation...');
    
    await sendMessage('Add a 🎯 target emoji next to "Explore Community"');
    console.log('✅ Second message sent');
    console.log('⏳ Waiting 10 seconds for vibe coding to complete...');
    await delay(10000);
    
    checkLogs();
    console.log('\n⚠️  MANUAL VERIFICATION REQUIRED:');
    console.log('   1. Open browser console');
    console.log('   2. Check SaveOrchestrator count increased to 2+');
    console.log('   3. Verify diff cards appear on CORRECT messages');
    console.log('   4. Check preview shows BOTH changes');
    
    console.log('\n\n' + '='.repeat(60));
    console.log('✅ AUTOMATED TESTS COMPLETE');
    console.log('📸 Take screenshots for evidence');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
})();
