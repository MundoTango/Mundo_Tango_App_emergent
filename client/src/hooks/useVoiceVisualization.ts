/**
 * TRACK D: Voice Visualization Hook
 * MB.MD SIMULTANEOUS BUILD - Oct 23, 2025
 * Agent #128 (Hooks)
 * 
 * Web Audio API for real-time waveform visualization
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export interface VoiceVisualizationData {
  frequencyData: Uint8Array;
  timeData: Uint8Array;
  volume: number;
  isActive: boolean;
}

export function useVoiceVisualization(audioStream: MediaStream | null) {
  const [visualizationData, setVisualizationData] = useState<VoiceVisualizationData>({
    frequencyData: new Uint8Array(128),
    timeData: new Uint8Array(128),
    volume: 0,
    isActive: false,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const startVisualization = useCallback(() => {
    if (!audioStream) return;

    // Create audio context and analyser
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;

    // Connect stream to analyser
    const source = audioContext.createMediaStreamSource(audioStream);
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;

    // Start animation loop
    const updateVisualization = () => {
      if (!analyserRef.current) return;

      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      const timeData = new Uint8Array(analyser.frequencyBinCount);

      analyserRef.current.getByteFrequencyData(frequencyData);
      analyserRef.current.getByteTimeDomainData(timeData);

      // Calculate volume (average of frequency data)
      const sum = frequencyData.reduce((acc, val) => acc + val, 0);
      const volume = sum / frequencyData.length / 255;

      setVisualizationData({
        frequencyData,
        timeData,
        volume,
        isActive: true,
      });

      animationFrameRef.current = requestAnimationFrame(updateVisualization);
    };

    updateVisualization();
  }, [audioStream]);

  const stopVisualization = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;

    setVisualizationData({
      frequencyData: new Uint8Array(128),
      timeData: new Uint8Array(128),
      volume: 0,
      isActive: false,
    });
  }, []);

  useEffect(() => {
    if (audioStream) {
      startVisualization();
    } else {
      stopVisualization();
    }

    return () => {
      stopVisualization();
    };
  }, [audioStream, startVisualization, stopVisualization]);

  return visualizationData;
}
