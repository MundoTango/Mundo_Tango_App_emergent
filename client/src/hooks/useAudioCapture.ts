/**
 * STREAM 3: Audio Capture System
 * Browser audio capture with PCM16 encoding for Realtime API
 * Handles microphone permissions and audio streaming
 */

import { useState, useRef, useCallback, useEffect } from 'react';

export type AudioCaptureStatus = 'idle' | 'requesting' | 'recording' | 'error';

export interface AudioCaptureOptions {
  sampleRate?: number; // Default: 24000 (required by Realtime API)
  onAudioData?: (data: ArrayBuffer) => void;
  onSpeechStart?: () => void;
  onSpeechStop?: () => void;
}

export function useAudioCapture(options: AudioCaptureOptions = {}) {
  const [status, setStatus] = useState<AudioCaptureStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const sampleRate = options.sampleRate || 24000;

  // Start audio capture
  const startCapture = useCallback(async () => {
    try {
      setStatus('requesting');
      setError(null);

      console.log('[AudioCapture] Requesting microphone access...');

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: sampleRate
        }
      });

      streamRef.current = stream;
      setPermissionGranted(true);

      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: sampleRate
      });
      audioContextRef.current = audioContext;

      // Create audio source from stream
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Create script processor for PCM16 encoding
      const bufferSize = 4096;
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        
        // Convert Float32 to PCM16
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          // Clamp to [-1, 1] and convert to 16-bit integer
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Send PCM16 data
        if (options.onAudioData) {
          options.onAudioData(pcm16.buffer);
        }
      };

      // Connect audio graph
      source.connect(processor);
      processor.connect(audioContext.destination);

      setStatus('recording');
      console.log('[AudioCapture] Recording started');

    } catch (err: any) {
      console.error('[AudioCapture] Error:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Please allow microphone access.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone.');
      } else {
        setError('Failed to start audio capture: ' + err.message);
      }
      
      setStatus('error');
    }
  }, [options, sampleRate]);

  // Stop audio capture
  const stopCapture = useCallback(() => {
    console.log('[AudioCapture] Stopping capture...');

    // Disconnect audio graph
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setStatus('idle');
    console.log('[AudioCapture] Stopped');
  }, []);

  // Check microphone permission
  const checkPermission = useCallback(async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setPermissionGranted(result.state === 'granted');
      return result.state === 'granted';
    } catch (err) {
      // Permissions API not supported in all browsers
      return false;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);

  return {
    status,
    error,
    permissionGranted,
    startCapture,
    stopCapture,
    checkPermission,
    isRecording: status === 'recording'
  };
}
