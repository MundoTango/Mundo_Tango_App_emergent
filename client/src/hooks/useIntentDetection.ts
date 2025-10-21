/**
 * Intent Detection Hook
 * MB.MD Option A - Recursive Testing System
 * 
 * Analyzes user behavior to predict next actions
 */

import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

interface IntentPrediction {
  action: string;
  target: string;
  confidence: number;
  pattern: string;
}

export function useIntentDetection() {
  const { user } = useAuth();
  const [prediction, setPrediction] = useState<IntentPrediction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Detect intent every 3 seconds
    const interval = setInterval(async () => {
      await detectIntent();
    }, 3000);

    return () => clearInterval(interval);
  }, [user]);

  const detectIntent = async () => {
    try {
      setIsAnalyzing(true);

      const sessionId = sessionStorage.getItem('mt-session-id') || 'anonymous';
      
      const response = await fetch('/api/intent/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) return;

      const data = await response.json();
      
      if (data.prediction) {
        setPrediction(data.prediction);
        
        // Show proactive notification if feature was tested
        if (data.tested) {
          console.log(`[Intent] Detected: ${data.prediction.action} (${data.prediction.confidence}% confidence) - Feature tested proactively!`);
        }
      } else {
        setPrediction(null);
      }

    } catch (error) {
      console.debug('[Intent] Detection failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateActualAction = async (action: string, target: string) => {
    try {
      const sessionId = sessionStorage.getItem('mt-session-id') || 'anonymous';
      
      await fetch('/api/intent/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId,
          actualAction: action,
          actualTarget: target,
        }),
      });
    } catch (error) {
      console.debug('[Intent] Update failed:', error);
    }
  };

  return {
    prediction,
    isAnalyzing,
    detectIntent,
    updateActualAction,
  };
}
