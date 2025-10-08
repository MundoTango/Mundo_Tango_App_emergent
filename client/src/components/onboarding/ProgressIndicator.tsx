import { CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Step {
  id: number;
  label: string;
  isComplete: boolean;
  isCurrent: boolean;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export const ProgressIndicator = ({ steps, currentStep }: ProgressIndicatorProps) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center relative">
              <motion.div
                initial={false}
                animate={{
                  scale: step.isCurrent ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                {step.isComplete ? (
                  <CheckCircle2 
                    className="w-8 h-8 text-green-500"
                    data-testid={`step-complete-${step.id}`}
                  />
                ) : step.isCurrent ? (
                  <div className="relative">
                    <Circle className="w-8 h-8 text-ocean-500" />
                    <motion.div
                      className="absolute inset-0 bg-ocean-500/20 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                ) : (
                  <Circle 
                    className="w-8 h-8 text-neutral-600 dark:text-neutral-300 dark:text-neutral-600"
                    data-testid={`step-pending-${step.id}`}
                  />
                )}
              </motion.div>
              
              <motion.span
                initial={false}
                animate={{
                  color: step.isCurrent ? 'var(--color-ocean-500)' : undefined,
                  fontWeight: step.isCurrent ? 600 : 400
                }}
                className="text-xs mt-2 text-center max-w-[80px]"
              >
                {step.label}
              </motion.span>
            </div>
            
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 bg-neutral-200 dark:bg-neutral-700 relative">
                <motion.div
                  className="absolute inset-0 bg-ocean-500"
                  initial={{ scaleX: 0 }}
                  animate={{ 
                    scaleX: step.isComplete ? 1 : 0 
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ transformOrigin: 'left' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
