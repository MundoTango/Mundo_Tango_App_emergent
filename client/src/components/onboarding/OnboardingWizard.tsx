import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassComponents';


/**
 * ESA Layer 21: User Management Agent
 * New user onboarding wizard with MT Ocean theme
 */

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action?: () => void;
  component?: React.ReactNode;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Mundo Tango! 💃',
    description: 'Your journey into the passionate world of tango begins here. Let us show you around!',
  },
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Add a photo and tell us about your tango experience. This helps you connect with the right dancers.',
  },
  {
    id: 'memories',
    title: 'Share Your First Memory',
    description: 'Post photos, videos, and stories from your tango experiences. Your memories inspire our community!',
  },
  {
    id: 'connect',
    title: 'Connect with Dancers',
    description: 'Find friends, join groups, and discover events in your city. The tango world awaits!',
  },
  {
    id: 'ready',
    title: 'You\'re All Set! 🎉',
    description: 'Start exploring Mundo Tango. Remember, every great dancer was once a beginner.',
  },
];

export function OnboardingWizard() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    if (!hasCompletedOnboarding) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem('onboarding_skipped', 'true');
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsCompleted(true);
    setTimeout(() => setIsVisible(false), 2000);
  };

  if (!isVisible) return null;

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;
  const step = ONBOARDING_STEPS[currentStep];

  return (
    <GlassCard depth={1} className="fixed inset-0 z-50 flex items-center justify-center">
      <Card className="relative w-full max-w-2xl mx-4 bg-gradient-to-br from-teal-400/95 via-cyan-500/95 to-blue-600/95 backdrop-blur-md border-white/20 shadow-2xl">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          aria-label="Skip onboarding"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          <Progress value={progress} className="mb-6 h-2 bg-white/20" />
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">
              {step.title}
            </h2>
            <p className="text-lg text-white/90">
              {step.description}
            </p>
          </div>

          {step.component && (
            <div className="mb-8">
              {step.component}
            </div>
          )}

          <div className="flex justify-between items-center">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="ghost"
              className="text-white hover:bg-white/20 disabled:opacity-50"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {ONBOARDING_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-white w-8'
                      : index < currentStep
                      ? 'bg-white/70'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="bg-white text-cyan-600 hover:bg-white/90"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {isCompleted && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 rounded-lg">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold">Welcome to the Family!</h3>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
