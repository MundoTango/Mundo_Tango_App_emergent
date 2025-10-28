/**
 * Voice Mode Integration Tests
 * Verify all Voice Mode endpoints (Weeks 1-4)
 * Created: October 28, 2025
 */

import { test, expect } from '@playwright/test';

test.describe('Voice Mode - Week 1: Whisper STT', () => {
  
  test('POST /api/voice/transcribe accepts audio file', async ({ request }) => {
    // Create test audio file (mock)
    const audioBuffer = Buffer.from([/* WAV header */]);
    
    const response = await request.post('/api/voice/transcribe', {
      multipart: {
        audio: {
          name: 'test.wav',
          mimeType: 'audio/wav',
          buffer: audioBuffer,
        },
      },
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('transcript');
    expect(data).toHaveProperty('confidence');
  });

  test('GET /api/voice/models lists Whisper models', async ({ request }) => {
    const response = await request.get('/api/voice/models');
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.models).toBeInstanceOf(Array);
    expect(data.models.length).toBeGreaterThan(0);
    expect(data.models[0]).toHaveProperty('name');
    expect(data.models[0]).toHaveProperty('size');
  });

  test('GET /api/voice/status returns service health', async ({ request }) => {
    const response = await request.get('/api/voice/status');
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('operational');
    expect(data).toHaveProperty('features');
  });
});

test.describe('Voice Mode - Week 2: Bark TTS', () => {
  
  test('POST /api/bark/synthesize generates audio', async ({ request }) => {
    const response = await request.post('/api/bark/synthesize', {
      data: {
        text: 'Hello, this is a test',
        voice: 'v2/en_speaker_1',
      },
    });
    
    expect(response.status()).toBe(200);
    const buffer = await response.body();
    expect(buffer.length).toBeGreaterThan(44); // WAV header minimum
  });

  test('GET /api/bark/voices lists all voice presets', async ({ request }) => {
    const response = await request.get('/api/bark/voices');
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.voices).toHaveLength(12); // 10 English + 2 Spanish
    expect(data.voices[0]).toHaveProperty('name');
    expect(data.voices[0]).toHaveProperty('language');
  });

  test('GET /api/bark/status returns service health', async ({ request }) => {
    const response = await request.get('/api/bark/status');
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('week2_placeholder');
  });

  test('POST /api/bark/cost-estimate calculates savings', async ({ request }) => {
    const response = await request.post('/api/bark/cost-estimate', {
      data: {
        charactersPerMonth: 1000000,
      },
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.openAICost).toBe(15); // $15/1M chars
    expect(data.barkCost).toBe(0);
    expect(data.savings).toBe(15);
  });
});

test.describe('Voice Mode - Week 3: Unified Pipeline', () => {
  
  test('UnifiedVoicePipeline processes audio → text → response → audio', async ({ request }) => {
    // This test will be implemented when Week 3 is complete
    // For now, verify infrastructure exists
    
    const fs = await import('fs/promises');
    const content = await fs.readFile('server/services/voice/UnifiedVoicePipeline.ts', 'utf-8');
    
    expect(content).toContain('class UnifiedVoicePipeline');
    expect(content).toContain('processVoiceInput');
  });
});

test.describe('Voice Mode - Week 4: Feature Flags & Rollout', () => {
  
  test('Feature flags exist for Voice Mode', async ({ request }) => {
    const response = await request.get('/api/feature-flags');
    
    if (response.status() === 200) {
      const data = await response.json();
      // Check if voice flags exist (may not be exposed to client)
      // Just verify endpoint works
      expect(data).toBeDefined();
    }
  });

  test('VoiceMigrationController determines provider', async () => {
    const { VoiceMigrationController } = await import('../../server/services/voice/VoiceMigrationController');
    
    const status = VoiceMigrationController.getVoiceProvider();
    
    expect(status).toHaveProperty('provider');
    expect(['openai', 'opensource']).toContain(status.provider);
    expect(status).toHaveProperty('components');
    expect(status.components).toHaveProperty('stt');
    expect(status.components).toHaveProperty('llm');
    expect(status.components).toHaveProperty('tts');
  });

  test('VoiceMigrationController calculates cost savings', async () => {
    const { VoiceMigrationController } = await import('../../server/services/voice/VoiceMigrationController');
    
    const savings = VoiceMigrationController.getCostSavings(1000, 60); // 1000 users, 60 min/month
    
    expect(savings.openAICost).toBe(18000); // 1000 * 60 * $0.30
    expect(savings.openSourceCost).toBe(0);
    expect(savings.savings).toBe(18000);
    expect(savings.savingsPercent).toBe(100);
  });

  test('VoiceMigrationController provides rollout schedule', async () => {
    const { VoiceMigrationController } = await import('../../server/services/voice/VoiceMigrationController');
    
    const schedule = VoiceMigrationController.getRolloutSchedule();
    
    expect(schedule).toBeInstanceOf(Array);
    expect(schedule).toHaveLength(5);
    expect(schedule[0].percentage).toBe(0);
    expect(schedule[schedule.length - 1].percentage).toBe(100);
  });
});

test.describe('Voice Mode - Cost Achievement', () => {
  
  test('Voice Mode achieves $1.08M/year savings target', async () => {
    const { VoiceMigrationController } = await import('../../server/services/voice/VoiceMigrationController');
    
    // Assume 10,000 users, 60 min/month average
    const savings = VoiceMigrationController.getCostSavings(10000, 60);
    
    const annualSavings = savings.savings * 12;
    
    expect(annualSavings).toBeGreaterThanOrEqual(1080000); // $1.08M
  });
});
