/**
 * COST ESTIMATE DISPLAY
 * Shows real-time cost estimates for Visual Editor operations
 */

import { estimateVisualEditorCost, formatCostEstimate } from '@/lib/mrBlue/utils/costTracking';
import { DollarSign, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CostEstimateDisplayProps {
  changeType: 'position' | 'size' | 'style' | 'text' | 'structure';
  filesAffected?: number;
}

export default function CostEstimateDisplay({ 
  changeType, 
  filesAffected = 1 
}: CostEstimateDisplayProps) {
  const estimate = estimateVisualEditorCost(changeType, filesAffected);
  
  const confidenceColor = {
    low: 'text-yellow-600 dark:text-yellow-400',
    medium: 'text-blue-600 dark:text-blue-400',
    high: 'text-green-600 dark:text-green-400'
  }[estimate.confidence];
  
  const complexityBadge = {
    simple: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    medium: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    complex: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
  }[estimate.breakdown.complexity];

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${confidenceColor}`}>
            ${estimate.estimated.toFixed(2)}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${complexityBadge}`}>
            {estimate.breakdown.complexity}
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          ~{estimate.breakdown.tokens.toLocaleString()} tokens
        </div>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm space-y-1">
              <p><strong>Estimate Confidence:</strong> {estimate.confidence}</p>
              <p><strong>Files Affected:</strong> {filesAffected}</p>
              <p><strong>Mode:</strong> {estimate.breakdown.mode}</p>
              <p className="text-xs text-gray-400 mt-2">
                Replit Agent costs are effort-based. Complex changes cost more.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
