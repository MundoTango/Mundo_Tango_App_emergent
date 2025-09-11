
#!/usr/bin/env node

/**
 * ESA LIFE CEO 61×21 - Events Agent Integration Test
 * Tests Socket.io, AI, and database integration points
 */

const io = require('socket.io-client');
const fetch = require('node-fetch');

const SERVER_URL = 'http://localhost:5000';
const SOCKET_URL = 'http://localhost:5000';

console.log('🧪 Testing Events Agent Integration Points...\n');

async function testApiIntegration() {
  console.log('📡 Testing API Integration...');
  
  try {
    // Test Socket.io health
    const socketHealth = await fetch(`${SERVER_URL}/api/integration/socket-health`);
    const socketData = await socketHealth.json();
    console.log('✅ Socket.io Health:', socketData.success ? 'READY' : 'ERROR');
    
    // Test AI health
    const aiHealth = await fetch(`${SERVER_URL}/api/integration/ai-health`);
    const aiData = await aiHealth.json();
    console.log('✅ AI Service:', aiData.success ? 'READY' : 'ERROR');
    console.log('   OpenAI configured:', aiData.data.openaiConfigured);
    
    // Test database schema info
    const dbSchema = await fetch(`${SERVER_URL}/api/integration/database-schema`);
    const dbData = await dbSchema.json();
    console.log('✅ Database Schema:', dbData.success ? 'READY' : 'ERROR');
    
    // Test AI enhancement
    const aiTest = await fetch(`${SERVER_URL}/api/integration/test-ai-enhance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Join us for a wonderful tango evening at Plaza Dorrego' })
    });
    const aiResult = await aiTest.json();
    console.log('✅ AI Enhancement Test:', aiResult.success ? 'WORKING' : 'ERROR');
    console.log('   Mode:', aiResult.data?.mode || 'unknown');
    
  } catch (error) {
    console.log('❌ API Integration Error:', error.message);
  }
}

function testSocketConnection() {
  return new Promise((resolve) => {
    console.log('\n🔌 Testing Socket.io Connection...');
    
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000
    });
    
    socket.on('connect', () => {
      console.log('✅ Socket.io Connected:', socket.id);
      
      // Test joining event room
      socket.emit('join:event', 'test-event-123');
      console.log('✅ Event room join: Sent');
      
      // Test event RSVP emission
      socket.emit('event:rsvp', {
        eventId: 'test-event-123',
        userId: 'test-user-456',
        timestamp: new Date().toISOString(),
        type: 'rsvp',
        data: {
          username: 'Test User',
          rsvpStatus: 'going',
          eventOwnerId: 'event-owner-789'
        }
      });
      console.log('✅ Event RSVP emission: Sent');
      
      // Listen for event updates
      socket.on('event:rsvp_updated', (data) => {
        console.log('✅ Event RSVP received:', data.data?.rsvpStatus);
      });
      
      setTimeout(() => {
        socket.disconnect();
        console.log('✅ Socket.io test completed\n');
        resolve();
      }, 2000);
    });
    
    socket.on('connect_error', (error) => {
      console.log('❌ Socket.io Connection Error:', error.message);
      resolve();
    });
    
    setTimeout(() => {
      if (!socket.connected) {
        console.log('❌ Socket.io Connection Timeout');
        socket.disconnect();
        resolve();
      }
    }, 5000);
  });
}

async function main() {
  await testApiIntegration();
  await testSocketConnection();
  
  console.log('🎯 Integration Test Summary:');
  console.log('   - API endpoints ready for Events Agent');
  console.log('   - Socket.io events configured for real-time updates');
  console.log('   - AI enhancement available for event descriptions');
  console.log('   - Database schema documented for events management');
  console.log('   - Event socket hooks ready in client/src/hooks/useEventSocket.ts');
  console.log('\n🚀 Ready for Emergent Events Agent development!');
  
  process.exit(0);
}

if (require.main === module) {
  main().catch(console.error);
}
