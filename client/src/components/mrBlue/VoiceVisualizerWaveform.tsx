/**
 * TRACK D: Voice Visualizer Waveform
 * MB.MD SIMULTANEOUS BUILD - Oct 23, 2025
 * Agent #127 (Voice)
 * 
 * Canvas-based real-time audio waveform visualization
 */

import { useEffect, useRef } from 'react';
import { useVoiceVisualization } from '@/hooks/useVoiceVisualization';

interface VoiceVisualizerWaveformProps {
  audioStream: MediaStream | null;
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  type?: 'waveform' | 'frequency' | 'bars';
}

export function VoiceVisualizerWaveform({
  audioStream,
  width = 400,
  height = 100,
  color = '#a855f7', // purple-500
  backgroundColor = 'transparent',
  type = 'waveform',
}: VoiceVisualizerWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualizationData = useVoiceVisualization(audioStream);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    if (!visualizationData.isActive) {
      // Draw flat line when inactive
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    // Draw visualization based on type
    if (type === 'waveform') {
      drawWaveform(ctx, visualizationData.timeData, width, height, color);
    } else if (type === 'frequency') {
      drawFrequency(ctx, visualizationData.frequencyData, width, height, color);
    } else if (type === 'bars') {
      drawBars(ctx, visualizationData.frequencyData, width, height, color);
    }
  }, [visualizationData, width, height, color, backgroundColor, type]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg"
      data-testid="voice-visualizer-waveform"
    />
  );
}

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  timeData: Uint8Array,
  width: number,
  height: number,
  color: string
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  const sliceWidth = width / timeData.length;
  let x = 0;

  for (let i = 0; i < timeData.length; i++) {
    const v = timeData[i] / 128.0;
    const y = v * (height / 2);

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.stroke();
}

function drawFrequency(
  ctx: CanvasRenderingContext2D,
  frequencyData: Uint8Array,
  width: number,
  height: number,
  color: string
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  const sliceWidth = width / frequencyData.length;
  let x = 0;

  for (let i = 0; i < frequencyData.length; i++) {
    const v = frequencyData[i] / 255.0;
    const y = height - v * height;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.stroke();
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  frequencyData: Uint8Array,
  width: number,
  height: number,
  color: string
) {
  const barCount = 32; // Limit bars for better visualization
  const barWidth = width / barCount;
  const step = Math.floor(frequencyData.length / barCount);

  ctx.fillStyle = color;

  for (let i = 0; i < barCount; i++) {
    const index = i * step;
    const value = frequencyData[index] / 255.0;
    const barHeight = value * height;

    const x = i * barWidth;
    const y = height - barHeight;

    ctx.fillRect(x, y, barWidth - 2, barHeight);
  }
}
