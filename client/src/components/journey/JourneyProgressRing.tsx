/**
 * Journey Progress Ring Component
 * MB.MD Phase 4: Deployment - Oct 19, 2025
 * 
 * Visual circular progress indicator showing journey completion status
 * Displays in top-right corner of all pages during active journey
 */

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface JourneyProgressRingProps {
  currentStep: number;
  totalSteps: number;
  journeyName: string;
  percentage: number;
  onClick?: () => void;
}

export function JourneyProgressRing({
  currentStep,
  totalSteps,
  journeyName,
  percentage,
  onClick
}: JourneyProgressRingProps) {
  return (
    <div 
      className="fixed top-4 right-4 w-16 h-16 cursor-pointer hover:scale-110 transition-transform z-50"
      onClick={onClick}
      data-testid="journey-progress-ring"
    >
      <CircularProgressbar
        value={percentage}
        text={`${currentStep}/${totalSteps}`}
        styles={buildStyles({
          textColor: 'hsl(var(--foreground))',
          pathColor: 'hsl(var(--primary))',
          trailColor: 'hsl(var(--muted))',
          textSize: '24px'
        })}
      />
      <p className="text-xs text-center mt-1 text-muted-foreground truncate">
        {journeyName}
      </p>
    </div>
  );
}
