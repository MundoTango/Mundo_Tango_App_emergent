/**
 * AI Model Selector - Simplified to "All Models" only
 * Uses intelligent orchestration with Claude, GPT-4, Gemini
 * MB.MD Track 2: Multi-Model UI - Oct 22, 2025
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Brain } from 'lucide-react';

const MODELS = [
  { id: 'auto', name: 'All Models (Intelligent)', icon: '🎯', description: 'Claude + GPT-4 + Gemini with tools' },
];

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-[220px]" data-testid="select-ai-model">
        <Brain className="h-4 w-4 mr-2" />
        <SelectValue placeholder="Select model" />
      </SelectTrigger>
      <SelectContent>
        {MODELS.map((model) => (
          <SelectItem key={model.id} value={model.id} data-testid={`model-${model.id}`}>
            <div className="flex flex-col">
              <span className="flex items-center gap-2">
                <span>{model.icon}</span>
                <span className="font-medium">{model.name}</span>
              </span>
              <span className="text-xs text-gray-500">{model.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
