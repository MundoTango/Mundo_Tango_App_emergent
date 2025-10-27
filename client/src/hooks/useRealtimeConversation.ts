/**
 * STREAM 2: Frontend WebSocket Client
 * React hook for GPT-4o Realtime API
 * Manages WebSocket connection, audio streaming, and conversation state
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export type RealtimeEvent = 
  | { type: 'session.created'; session: any }
  | { type: 'session.updated'; session: any }
  | { type: 'conversation.created'; conversation: any }
  | { type: 'input_audio_buffer.speech_started' }
  | { type: 'input_audio_buffer.speech_stopped' }
  | { type: 'input_audio_buffer.committed' }
  | { type: 'response.created'; response: any }
  | { type: 'response.output_item.added'; item: any }
  | { type: 'response.audio.delta'; delta: string } // Base64 PCM16 audio
  | { type: 'response.audio_transcript.delta'; delta: string }
  | { type: 'response.done'; response: any }
  | { type: 'error'; error: { message: string } };

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface RealtimeOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  temperature?: number;
  instructions?: string;
  onEvent?: (event: RealtimeEvent) => void;
}

export function useRealtimeConversation(options: RealtimeOptions = {}) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [audioQueue, setAudioQueue] = useState<ArrayBuffer[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Connect to Realtime API
  const connect = useCallback(async () => {
    try {
      setStatus('connecting');
      
      // Get WebSocket URL (use wss:// for production, ws:// for development)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/api/realtime/connect`;
      
      console.log('[Realtime] Connecting to:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ [Realtime] WebSocket CONNECTED to backend');
        console.log('🔗 [Realtime] WebSocket URL:', wsUrl);
        console.log('🔗 [Realtime] ReadyState:', ws.readyState);
        setStatus('connected');
      };

      ws.onerror = (error) => {
        console.error('❌ [Realtime] WebSocket ERROR:', error);
        console.error('🔗 [Realtime] WebSocket state:', ws.readyState);
        setStatus('error');
      };

      ws.onclose = (event) => {
        console.warn('⚠️ [Realtime] WebSocket CLOSED:', event.code, event.reason);
        console.log('🔗 [Realtime] Was clean close?', event.wasClean);
        setStatus('disconnected');
      };

      ws.onmessage = (event) => {
        try {
          // Handle binary audio data (not JSON)
          if (event.data instanceof Blob) {
            console.log('🎵 [Realtime] Received audio blob:', event.data.size, 'bytes');
            event.data.arrayBuffer().then((buffer) => {
              setAudioQueue(prev => [...prev, buffer]);
            });
            return;
          }
          
          // Parse JSON messages
          const message = JSON.parse(event.data) as RealtimeEvent;
          
          // Log for debugging
          console.log('📨 [Realtime] Message:', message.type, message);
          
          // Handle events
          switch (message.type) {
            case 'session.created':
            case 'session.updated':
              console.log('[Realtime] Session updated:', message);
              break;

            case 'input_audio_buffer.speech_started':
              console.log('[Realtime] User started speaking');
              break;

            case 'input_audio_buffer.speech_stopped':
              console.log('[Realtime] User stopped speaking');
              break;

            case 'response.created':
              setIsAssistantSpeaking(true);
              break;

            case 'response.audio.delta':
              // Queue audio chunk for playback
              const audioData = base64ToArrayBuffer(message.delta);
              setAudioQueue(prev => [...prev, audioData]);
              break;

            case 'response.audio_transcript.delta':
              setTranscript(prev => prev + message.delta);
              break;

            case 'response.done':
              setIsAssistantSpeaking(false);
              break;

            case 'error':
              console.error('[Realtime] Error:', message.error);
              setStatus('error');
              break;
          }

          // Call user's event handler
          if (options.onEvent) {
            options.onEvent(message);
          }
        } catch (error) {
          console.error('[Realtime] Error parsing message:', error);
          console.error('[Realtime] Raw data:', event.data);
          console.error('[Realtime] Error details:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[Realtime] WebSocket error:', error);
        setStatus('error');
      };

      ws.onclose = () => {
        console.log('[Realtime] Disconnected');
        setStatus('disconnected');
      };

    } catch (error) {
      console.error('[Realtime] Connection error:', error);
      setStatus('error');
    }
  }, [options]);

  // Disconnect from Realtime API
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  // Send audio chunk (PCM16)
  const sendAudio = useCallback((audioData: ArrayBuffer) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const base64 = arrayBufferToBase64(audioData);
      console.log('[Realtime] Sending audio chunk:', audioData.byteLength, 'bytes');
      wsRef.current.send(JSON.stringify({
        type: 'input_audio_buffer.append',
        audio: base64
      }));
    } else {
      console.warn('[Realtime] Cannot send audio - WebSocket not ready. State:', wsRef.current?.readyState);
    }
  }, []);

  // Commit audio (trigger response)
  const commitAudio = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'input_audio_buffer.commit'
      }));
    }
  }, []);

  // Send text message
  const sendText = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text }]
        }
      }));
      
      // Trigger response
      wsRef.current.send(JSON.stringify({
        type: 'response.create'
      }));
    }
  }, []);

  // Interrupt assistant
  const interrupt = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'response.cancel'
      }));
      setIsAssistantSpeaking(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    status,
    isAssistantSpeaking,
    transcript,
    audioQueue,
    connect,
    disconnect,
    sendAudio,
    commitAudio,
    sendText,
    interrupt
  };
}

// Helper: Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper: ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
