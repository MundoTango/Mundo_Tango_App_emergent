/**
 * GPT-4o REALTIME API ROUTES
 * WebSocket proxy for OpenAI Realtime API
 * Enables two-way voice conversation (320ms latency)
 * 
 * STREAM 1: Backend WebSocket Server
 */

import { Router } from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * WebSocket upgrade handler for Realtime API
 * Usage: ws://localhost:5000/api/realtime/connect
 */
export function setupRealtimeWebSocket(server: any) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request: any, socket: any, head: any) => {
    if (request.url === '/api/realtime/connect') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[Realtime] Client connected');

    try {
      // Connect to OpenAI Realtime API
      const openaiWs = new WebSocket(
        'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01',
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'realtime=v1'
          }
        }
      );

      // Forward client messages to OpenAI
      clientWs.on('message', (data: any) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('[Realtime] Client → OpenAI:', message.type);
          
          // Forward to OpenAI
          if (openaiWs.readyState === WebSocket.OPEN) {
            openaiWs.send(JSON.stringify(message));
          }
        } catch (error) {
          console.error('[Realtime] Error forwarding client message:', error);
        }
      });

      // Forward OpenAI responses to client
      openaiWs.on('message', (data: any) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('[Realtime] OpenAI → Client:', message.type);
          
          // Forward to client
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(data);
          }
        } catch (error) {
          console.error('[Realtime] Error forwarding OpenAI message:', error);
        }
      });

      // Handle OpenAI connection open
      openaiWs.on('open', () => {
        console.log('[Realtime] Connected to OpenAI Realtime API');
        
        // Send session configuration
        openaiWs.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: 'You are Mr Blue, a friendly AI assistant for the Mundo Tango community.',
            voice: 'nova',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500
            },
            tools: [], // Will add Mr Blue's 11 tools here
            tool_choice: 'auto',
            temperature: 0.8,
          }
        }));
      });

      // Handle errors
      openaiWs.on('error', (error) => {
        console.error('[Realtime] OpenAI WebSocket error:', error);
        clientWs.send(JSON.stringify({
          type: 'error',
          error: { message: 'OpenAI connection error' }
        }));
      });

      openaiWs.on('close', () => {
        console.log('[Realtime] OpenAI connection closed');
        clientWs.close();
      });

      // Handle client disconnect
      clientWs.on('close', () => {
        console.log('[Realtime] Client disconnected');
        openaiWs.close();
      });

      clientWs.on('error', (error) => {
        console.error('[Realtime] Client WebSocket error:', error);
        openaiWs.close();
      });

    } catch (error) {
      console.error('[Realtime] Connection setup error:', error);
      clientWs.send(JSON.stringify({
        type: 'error',
        error: { message: 'Failed to establish Realtime connection' }
      }));
      clientWs.close();
    }
  });

  console.log('[Realtime] WebSocket server initialized');
}

export default router;
