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
import { getRealtimeTools } from '../services/tools/realtimeToolAdapter';
import { ToolExecutor } from '../services/tools/ToolExecutor';

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

      // Track conversation metadata for history logging
      let currentTranscript = '';
      let currentToolsUsed: string[] = [];
      
      // Forward OpenAI responses to client
      openaiWs.on('message', async (data: any) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('[Realtime] OpenAI → Client:', message.type);
          
          // 🐛 DEBUG: Log full error details
          if (message.type === 'error') {
            console.error('🚨 [Realtime] FULL ERROR DETAILS:', JSON.stringify(message, null, 2));
          }
          
          // 🎯 STREAM 1: Handle function_call events
          if (message.type === 'response.function_call_arguments.done') {
            const functionName = message.name;
            const functionArgs = JSON.parse(message.arguments);
            
            console.log(`[Realtime] Executing tool: ${functionName}`, functionArgs);
            currentToolsUsed.push(functionName);
            
            try {
              // Execute the function using ToolExecutor
              const toolExecutor = new ToolExecutor();
              const result = await toolExecutor.executeTool(functionName, functionArgs, { isSuperAdmin: true });
              
              // Send result back to OpenAI
              openaiWs.send(JSON.stringify({
                type: 'conversation.item.create',
                item: {
                  type: 'function_call_output',
                  call_id: message.call_id,
                  output: JSON.stringify(result)
                }
              }));
              
              console.log(`[Realtime] Tool ${functionName} executed successfully`);
            } catch (error) {
              console.error(`[Realtime] Tool execution error:`, error);
              openaiWs.send(JSON.stringify({
                type: 'conversation.item.create',
                item: {
                  type: 'function_call_output',
                  call_id: message.call_id,
                  output: JSON.stringify({ error: 'Tool execution failed' })
                }
              }));
            }
          }
          
          // 🎯 STREAM 2: Track transcripts for conversation history
          if (message.type === 'conversation.item.input_audio_transcription.completed') {
            currentTranscript = message.transcript;
            console.log('[Realtime] User transcript:', currentTranscript);
          }
          
          if (message.type === 'response.audio_transcript.done') {
            console.log('[Realtime] Assistant transcript:', message.transcript);
            // TODO: Save to voice_conversation_turns table
            // - projectId, userId from session
            // - role: 'user' / 'assistant'
            // - transcript: message.transcript
            // - toolsUsed: currentToolsUsed
            // - model: 'gpt-4o-realtime'
            currentToolsUsed = []; // Reset for next turn
          }
          
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
        
        // Send session configuration with multi-language support
        openaiWs.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: 'You are Mr Blue, a friendly AI assistant for the Mundo Tango community. You can speak multiple languages (English, Spanish, French, Portuguese) based on user preference.',
            voice: 'nova',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1' // STREAM 4: Whisper supports 50+ languages natively
            },
            turn_detection: { // STREAM 3: VAD already configured ✅
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500
            },
            tools: getRealtimeTools(), // 🎯 STREAM 1: All 11 Omniscient Mode tools
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
