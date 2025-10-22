/**
 * MODEL SELECTOR DROPDOWN
 * MB.MD Stream 2: Replace model buttons with single dropdown
 * 
 * Supports: Claude, GPT-4o, Gemini, All Models (Consensus)
 * Applies to entire chat session
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ModelType = 'gpt-4o' | 'claude-3-sonnet' | 'gemini-pro' | 'all-models';

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
  className?: string;
}

const MODEL_OPTIONS = [
  { value: 'claude-3-sonnet' as ModelType, label: 'Claude 3.5 Sonnet', icon: '🧠', description: 'Best for complex reasoning' },
  { value: 'gpt-4o' as ModelType, label: 'GPT-4o', icon: '⚡', description: 'Fast and versatile' },
  { value: 'gemini-pro' as ModelType, label: 'Gemini Pro', icon: '✨', description: 'Google\'s latest model' },
  { value: 'all-models' as ModelType, label: 'All Models', icon: '🤝', description: 'Consensus from all 3 models' },
];

export function ModelSelector({ selectedModel, onModelChange, className }: ModelSelectorProps) {
  const currentModel = MODEL_OPTIONS.find(m => m.value === selectedModel);

  return (
    <div className={className}>
      <Select value={selectedModel} onValueChange={(value) => onModelChange(value as ModelType)}>
        <SelectTrigger 
          className="w-[240px] bg-white/80 border-cyan-300"
          data-testid="model-selector-trigger"
        >
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{currentModel?.icon}</span>
              <span className="text-sm font-medium">{currentModel?.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MODEL_OPTIONS.map((model) => (
            <SelectItem 
              key={model.value} 
              value={model.value}
              data-testid={`model-option-${model.value}`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span>{model.icon}</span>
                  <span className="font-medium">{model.label}</span>
                </div>
                <span className="text-xs text-gray-500">{model.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedModel === 'all-models' && (
        <p className="text-xs text-gray-500 mt-1">
          💡 All models debate and reach consensus for best answer
        </p>
      )}
    </div>
  );
}
