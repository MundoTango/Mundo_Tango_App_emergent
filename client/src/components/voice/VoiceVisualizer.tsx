// TRACK 3: Voice Visualizer Component - Audio wave animation
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface VoiceVisualizerProps {
  isActive: boolean;
  className?: string;
}

export function VoiceVisualizer({ isActive, className }: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const barsRef = useRef<number[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const barCount = 20;
    barsRef.current = Array(barCount).fill(0);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / barCount;
      const centerY = canvas.height / 2;

      barsRef.current = barsRef.current.map((height, i) => {
        if (isActive) {
          // Random wave pattern when active
          const targetHeight = Math.random() * canvas.height * 0.8;
          return height + (targetHeight - height) * 0.3;
        } else {
          // Fade to idle when inactive
          return height * 0.9;
        }
      });

      barsRef.current.forEach((height, i) => {
        const x = i * barWidth;
        const h = height / 2;

        // Gradient
        const gradient = ctx.createLinearGradient(0, centerY - h, 0, centerY + h);
        gradient.addColorStop(0, isActive ? '#3b82f6' : '#94a3b8');
        gradient.addColorStop(1, isActive ? '#60a5fa' : '#cbd5e1');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, centerY - h, barWidth - 2, h * 2);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={60}
      className={cn('rounded-lg', className)}
      data-testid="voice-visualizer"
    />
  );
}
