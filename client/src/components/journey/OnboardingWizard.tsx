/**
 * Onboarding Wizard Component
 * MB.MD Phase 4: Deployment - Oct 19, 2025
 * 
 * Multi-step wizard modal for guided user flows
 * Supports previous/next navigation, progress tracking, and skip option
 */

import { useState, Children } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OnboardingWizardProps {
  journeyId: string;
  currentStep: number;
  totalSteps: number;
  canSkip?: boolean;
  onComplete: () => void;
  onSkip?: () => void;
  children: React.ReactNode; // WizardStep components
}

interface WizardStepProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function OnboardingWizard({
  journeyId,
  currentStep,
  totalSteps,
  canSkip = true,
  onComplete,
  onSkip,
  children
}: OnboardingWizardProps) {
  const [step, setStep] = useState(currentStep);
  const steps = Children.toArray(children);
  const progress = (step / totalSteps) * 100;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onSkip?.()}>
      <DialogContent className="sm:max-w-2xl" data-testid="onboarding-wizard">
        <div className="space-y-2">
          <Progress value={progress} className="h-2" data-testid="wizard-progress" />
          <p className="text-sm text-muted-foreground text-right">
            Step {step} of {totalSteps}
          </p>
        </div>

        <div className="py-6">
          {steps[step - 1]}
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            data-testid="button-previous"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {canSkip && (
              <Button 
                variant="outline" 
                onClick={onSkip}
                data-testid="button-skip"
              >
                Skip for now
              </Button>
            )}
            
            {step < totalSteps ? (
              <Button 
                onClick={() => setStep(step + 1)}
                data-testid="button-next"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={onComplete}
                data-testid="button-complete"
              >
                Complete
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WizardStep({ title, subtitle, children }: WizardStepProps) {
  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-2xl">{title}</DialogTitle>
        {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
      </DialogHeader>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
