
#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🔧 ESA LIFE CEO 61×21 Recovery Mode Starting...');
console.log('📊 Testing schema compilation...');

// Start with minimal memory allocation
process.env.NODE_OPTIONS = '--max-old-space-size=2048';
process.env.NODE_ENV = 'development';

const server = spawn('npx', ['tsx', 'server/index-novite.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '5000'
  }
});

server.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Recovery successful - Foundation layers stable');
  } else {
    console.log(`❌ Recovery failed with code ${code}`);
    console.log('🔄 Check schema duplicates and try again');
  }
});

server.on('error', (error) => {
  console.error('💥 Recovery error:', error.message);
});
