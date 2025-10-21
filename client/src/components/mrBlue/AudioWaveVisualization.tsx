/**
 * AUDIO WAVE VISUALIZATION
 * Real-time audio waveform during speech recognition/synthesis
 * MB.MD Track: mrblue-8
 */

import { useEffect, useState, useRef } from 'react';
import { Mic, Volume2 } from 'lucide-react';

interface AudioWaveVisualizationProps {
  isActive: boolean;
  type: 'input' | 'output'; // input = recording, output = speaking
}

export default function AudioWaveVisualization({ isActive, type }: AudioWaveVisualizationProps) {
  const [bars, setBars] = useState<number[]>(Array(20).fill(0));
  const animationRef = useRef<number>();

  useEffect(() => {
    if (isActive) {
      const animate = () => {
        setBars(prev =>
          prev.map(() => Math.random() * 100)
        );
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setBars(Array(20).fill(0));
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 border border-cyan-200 dark:border-cyan-800">
      {/* Icon */}
      <div className={`p-2 rounded-full ${isActive ? 'bg-gradient-to-br from-cyan-500 to-blue-600 animate-pulse' : 'bg-gray-300 dark:bg-gray-700'}`}>
        {type === 'input' ? (
          <Mic className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
        ) : (
          <Volume2 className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
        )}
      </div>

      {/* Wave Bars */}
      <div className="flex items-center gap-0.5 h-12">
        {bars.map((height, index) => (
          <div
            key={index}
            className={`w-1 rounded-full transition-all duration-100 ${
              isActive
                ? 'bg-gradient-to-t from-cyan-500 to-blue-600'
                : 'bg-gray-300 dark:bg-gray-700'
            }`}
            style={{
              height: isActive ? `${height}%` : '20%',
              minHeight: '4px'
            }}
          />
        ))}
      </div>

      {/* Status Text */}
      <div className="text-sm font-medium">
        {isActive ? (
          <span className="text-cyan-600 dark:text-cyan-400">
            {type === 'input' ? 'Listening...' : 'Speaking...'}
          </span>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">
            {type === 'input' ? 'Click to record' : 'Ready to speak'}
          </span>
        )}
      </div>
    </div>
  );
}
