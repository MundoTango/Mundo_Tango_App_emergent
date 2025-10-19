/**
 * Success Celebration Component
 * MB.MD Phase 4: Deployment - Oct 19, 2025
 * 
 * Full-screen celebration modal with confetti animation
 * Shown when user completes journey steps or milestones
 */

import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface SuccessCelebrationProps {
  confetti?: boolean;
  message: string;
  submessage?: string;
  cta: string;
  onContinue: () => void;
  autoDismiss?: number; // Auto-continue after X seconds
}

export function SuccessCelebration({
  confetti = true,
  message,
  submessage,
  cta,
  onContinue,
  autoDismiss
}: SuccessCelebrationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setShow(false);
        onContinue();
      }, autoDismiss * 1000);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onContinue]);

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
      data-testid="success-celebration"
    >
      {confetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 1000}
          height={typeof window !== 'undefined' ? window.innerHeight : 1000}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <Card className="max-w-md w-full p-8 text-center space-y-6 animate-in fade-in zoom-in">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">{message}</h2>
          {submessage && (
            <p className="text-muted-foreground">{submessage}</p>
          )}
        </div>

        <Button 
          onClick={onContinue} 
          size="lg" 
          className="w-full"
          data-testid="button-continue"
        >
          {cta}
        </Button>

        {autoDismiss && (
          <p className="text-xs text-muted-foreground">
            Continuing automatically in {autoDismiss} seconds...
          </p>
        )}
      </Card>
    </div>
  );
}
