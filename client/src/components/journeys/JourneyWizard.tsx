import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface JourneyStep {
  id: number;
  title: string;
  description: string;
  action?: string;
  component?: React.ReactNode;
}

interface JourneyWizardProps {
  journeyId: 'J1' | 'J2' | 'J3' | 'J4' | 'J5';
  title: string;
  description: string;
  icon: React.ReactNode;
  steps: JourneyStep[];
  onComplete?: () => void;
}

export default function JourneyWizard({ 
  journeyId, 
  title, 
  description, 
  icon, 
  steps, 
  onComplete 
}: JourneyWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  
  // Start journey mutation
  const startMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/journeys/${journeyId}/start`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: 'Journey Started!',
        description: `Welcome to ${title}`,
      });
    }
  });
  
  // Complete step mutation
  const stepMutation = useMutation({
    mutationFn: async ({ stepNumber, skipped }: { stepNumber: number; skipped: boolean }) => {
      return await apiRequest(`/api/journeys/${journeyId}/step/${stepNumber}`, {
        method: 'POST',
        body: JSON.stringify({ skipped })
      });
    },
    onSuccess: () => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  });
  
  // Complete journey mutation
  const completeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/journeys/${journeyId}/complete`, {
        method: 'POST'
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: 'Journey Complete!',
        description: `You've completed ${title}! 🎉`,
      });
      if (data.achievementUnlocked) {
        toast({
          title: 'Achievement Unlocked!',
          description: `${data.achievementUnlocked}`,
        });
      }
      onComplete?.();
    }
  });
  
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];
  
  const handleNext = () => {
    stepMutation.mutate({ stepNumber: currentStep + 1, skipped: false });
  };
  
  const handleSkip = () => {
    stepMutation.mutate({ stepNumber: currentStep + 1, skipped: true });
  };
  
  const handleComplete = () => {
    completeMutation.mutate();
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8 bg-white dark:bg-gray-900 border-cyan-500/30">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full mb-4">
            {icon}
          </div>
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
          <Badge variant="outline" className="mt-2 border-cyan-500 text-cyan-600 dark:text-cyan-400">
            {journeyId}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  index <= currentStep ? 'opacity-100' : 'opacity-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    index < currentStep
                      ? 'bg-green-500 border-green-500 text-white'
                      : index === currentStep
                      ? 'bg-cyan-500 border-cyan-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs mt-2 text-gray-600 dark:text-gray-400 text-center max-w-[80px] truncate">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Current Step Content */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6 min-h-[200px]">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              {currentStep + 1}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {currentStepData.description}
              </p>
              {currentStepData.action && (
                <div className="mt-3 inline-flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-medium">
                  <Sparkles className="h-4 w-4" />
                  {currentStepData.action}
                </div>
              )}
            </div>
          </div>
          
          {/* Step Component */}
          {currentStepData.component && (
            <div className="mt-4">
              {currentStepData.component}
            </div>
          )}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="border-gray-300 dark:border-gray-600"
            data-testid="button-prev-step"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {!isLastStep && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={stepMutation.isPending}
                className="text-gray-600 dark:text-gray-400"
                data-testid="button-skip-step"
              >
                Skip
              </Button>
            )}
            
            {isLastStep ? (
              <Button
                onClick={handleComplete}
                disabled={completeMutation.isPending}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                data-testid="button-complete-journey"
              >
                {completeMutation.isPending ? 'Completing...' : 'Complete Journey'}
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={stepMutation.isPending}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                data-testid="button-next-step"
              >
                {stepMutation.isPending ? 'Saving...' : 'Next Step'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
