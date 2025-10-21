/**
 * BREADCRUMB TRAIL UI
 * Visual journey tracking through conversation steps
 * MB.MD Track: mrblue-14
 */

import { ChevronRight, Check, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface BreadcrumbStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  timestamp?: string;
}

interface BreadcrumbTrailProps {
  steps: BreadcrumbStep[];
  onStepClick?: (stepId: string) => void;
}

export default function BreadcrumbTrail({ steps, onStepClick }: BreadcrumbTrailProps) {
  return (
    <div className="w-full p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-cyan-200 dark:border-cyan-800">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
            {/* Step Button */}
            <button
              onClick={() => onStepClick?.(step.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                step.status === 'completed'
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                  : step.status === 'current'
                  ? 'bg-cyan-500 text-white shadow-lg hover:bg-cyan-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              data-testid={`breadcrumb-${step.id}`}
            >
              {/* Icon */}
              {step.status === 'completed' ? (
                <Check className="h-4 w-4" />
              ) : step.status === 'current' ? (
                <Circle className="h-4 w-4 fill-current animate-pulse" />
              ) : (
                <Circle className="h-4 w-4" />
              )}

              {/* Label */}
              <span className="text-sm font-medium whitespace-nowrap">
                {step.label}
              </span>

              {/* Timestamp (for completed steps) */}
              {step.timestamp && step.status === 'completed' && (
                <Badge variant="outline" className="text-xs ml-1">
                  {step.timestamp}
                </Badge>
              )}
            </button>

            {/* Chevron Separator */}
            {index < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-600 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
          style={{
            width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%`
          }}
        />
      </div>
    </div>
  );
}
