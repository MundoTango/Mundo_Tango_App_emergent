/**
 * Test Server Bootstrap
 * 
 * Starts the Express server for integration and smoke tests
 * Ensures server is running before tests execute
 */

import { spawn, ChildProcess } from 'child_process';

let serverProcess: ChildProcess | null = null;
const SERVER_PORT = process.env.PORT || 5000;
const SERVER_STARTUP_TIMEOUT = 30000; // 30 seconds

export async function startTestServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting test server...');

    serverProcess = spawn('npm', ['run', 'dev'], {
      env: { ...process.env, NODE_ENV: 'test' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let serverReady = false;
    const timeout = setTimeout(() => {
      if (!serverReady) {
        stopTestServer();
        reject(new Error('Server startup timeout'));
      }
    }, SERVER_STARTUP_TIMEOUT);

    serverProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      // Look for server ready indicators
      if (output.includes('Server running') || 
          output.includes(`localhost:${SERVER_PORT}`) ||
          output.includes('VITE')) {
        serverReady = true;
        clearTimeout(timeout);
        console.log(`✅ Test server running on port ${SERVER_PORT}`);
        
        // Wait additional 2 seconds for full initialization
        setTimeout(resolve, 2000);
      }
    });

    serverProcess.stderr?.on('data', (data) => {
      console.error('Server error:', data.toString());
    });

    serverProcess.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    serverProcess.on('exit', (code) => {
      if (!serverReady) {
        clearTimeout(timeout);
        reject(new Error(`Server exited with code ${code}`));
      }
    });
  });
}

export function stopTestServer(): void {
  if (serverProcess) {
    console.log('🛑 Stopping test server...');
    serverProcess.kill();
    serverProcess = null;
  }
}

export async function waitForServer(
  url: string = `http://localhost:${SERVER_PORT}/api/health`,
  maxAttempts: number = 10
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log('✅ Server health check passed');
        return true;
      }
    } catch (error) {
      // Server not ready yet
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.error('❌ Server health check failed');
  return false;
}
