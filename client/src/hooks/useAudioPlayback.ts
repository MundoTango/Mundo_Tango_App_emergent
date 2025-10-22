/**
 * STREAM 3B: Audio Playback System
 * Plays PCM16 audio from Realtime API
 * Handles audio queue and smooth playback
 */

import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudioPlayback() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const queueRef = useRef<ArrayBuffer[]>([]);
  const playingRef = useRef(false);
  const nextStartTimeRef = useRef(0);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
      });
      nextStartTimeRef.current = audioContextRef.current.currentTime;
    }
    return audioContextRef.current;
  }, []);

  // Add audio chunk to queue
  const queueAudio = useCallback((audioData: ArrayBuffer) => {
    queueRef.current.push(audioData);
    
    // Start playback if not already playing
    if (!playingRef.current) {
      playQueue();
    }
  }, []);

  // Play audio queue
  const playQueue = useCallback(async () => {
    if (playingRef.current || queueRef.current.length === 0) {
      return;
    }

    playingRef.current = true;
    setIsPlaying(true);

    const audioContext = initAudioContext();

    try {
      while (queueRef.current.length > 0) {
        const audioData = queueRef.current.shift();
        if (!audioData) continue;

        // Convert PCM16 to Float32
        const pcm16 = new Int16Array(audioData);
        const float32 = new Float32Array(pcm16.length);
        for (let i = 0; i < pcm16.length; i++) {
          float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7FFF);
        }

        // Create audio buffer
        const audioBuffer = audioContext.createBuffer(1, float32.length, 24000);
        audioBuffer.getChannelData(0).set(float32);

        // Create source
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        // Schedule playback
        const startTime = Math.max(nextStartTimeRef.current, audioContext.currentTime);
        source.start(startTime);
        nextStartTimeRef.current = startTime + audioBuffer.duration;

        // Wait for this chunk to finish
        await new Promise(resolve => {
          source.onended = resolve;
        });
      }
    } catch (error) {
      console.error('[AudioPlayback] Error:', error);
    } finally {
      playingRef.current = false;
      setIsPlaying(false);
      nextStartTimeRef.current = audioContext.currentTime;
    }
  }, [initAudioContext]);

  // Clear audio queue
  const clearQueue = useCallback(() => {
    queueRef.current = [];
    if (audioContextRef.current) {
      // Close and recreate context to stop all playback
      audioContextRef.current.close();
      audioContextRef.current = null;
      playingRef.current = false;
      setIsPlaying(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isPlaying,
    queueAudio,
    clearQueue
  };
}
