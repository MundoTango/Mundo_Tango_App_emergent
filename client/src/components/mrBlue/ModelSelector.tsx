/**
 * AI Model Selector
 * Choose which AI model to use (GPT-4, Claude, Gemini, etc.)
 * MB.MD Track 2: Multi-Model UI - Oct 21, 2025
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
  { id: 'auto', name: 'Auto (Best for task)', icon: '🎯' },
  { id: 'gpt-4o', name: 'GPT-4o (Creative)', icon: '🎨' },
  { id: 'claude-3-sonnet', name: 'Claude Sonnet (Balanced)', icon: '⚡' },
  { id: 'claude-3-opus', name: 'Claude Opus (Analysis)', icon: '🧠' },
  { id: 'gemini-pro', name: 'Gemini Pro (Vision)', icon: '👁️' },
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
            <span className="flex items-center gap-2">
              <span>{model.icon}</span>
              <span>{model.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
