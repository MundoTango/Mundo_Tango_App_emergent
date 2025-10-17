import { useState } from 'react'
import { useTranslation } from 'react-i18next';;
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Brain, DollarSign, Sparkles } from 'lucide-react';
import type { AIModel, CostPriority, ModelPreference } from '@shared/multi-ai-types';

interface ModelSelectorProps {
  preference: ModelPreference;
  onChange: (preference: ModelPreference) => void;
}

export function ModelSelector({ preference, onChange }: ModelSelectorProps) {
  const costPriorityLabels: Record<CostPriority, string> = {
    cheap: 'Cost-Optimized',
    balanced: 'Balanced',
    quality: 'Maximum Quality',
  };

  const costPriorityIcons: Record<CostPriority, React.ReactNode> = {
    cheap: <DollarSign className="w-4 h-4 text-green-500" />,
    balanced: <Sparkles className="w-4 h-4 text-blue-500" />,
    quality: <Brain className="w-4 h-4 text-purple-500" />,
  };

  const handleCostPriorityChange = (value: number[]) => {
    const priorities: CostPriority[] = ['cheap', 'balanced', 'quality'];
    onChange({ ...preference, costPriority: priorities[value[0]] });
  };

  const getCostPriorityIndex = (priority: CostPriority): number => {
    const priorities: CostPriority[] = ['cheap', 'balanced', 'quality'];
    return priorities.indexOf(priority);
  };

  return (
    <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-500" />
          AI Model Configuration
        </CardTitle>
        <CardDescription>
          Choose your preferred AI model or let smart routing decide
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto-Route Toggle */}
        <div className="flex items-center justify-between" data-testid="auto-route-toggle">
          <div className="space-y-0.5">
            <Label htmlFor="auto-route">Smart Routing</Label>
            <p className="text-sm text-muted-foreground">
              Automatically select the best model for each query
            </p>
          </div>
          <Switch
            id="auto-route"
            checked={preference.autoRoute}
            onCheckedChange={(checked) => onChange({ ...preference, autoRoute: checked })}
          />
        </div>

        {/* Manual Model Selection (when auto-route is off) */}
        {!preference.autoRoute && (
          <div className="space-y-2">
            <Label htmlFor="model-select">Preferred Model</Label>
            <Select
              value={preference.preferredModel}
              onValueChange={(value) => onChange({ ...preference, preferredModel: value as AIModel })}
            >
              <SelectTrigger id="model-select" data-testid="model-select">
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude" data-testid="option-claude">
                  Claude Sonnet 4.5 (Best reasoning)
                </SelectItem>
                <SelectItem value="openai" data-testid="option-openai">
                  GPT-4o (Balanced performance)
                </SelectItem>
                <SelectItem value="gemini" data-testid="option-gemini">
                  Gemini 2.5 Flash (Fastest & cheapest)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Cost Priority Slider (when auto-route is on) */}
        {preference.autoRoute && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="cost-priority">Routing Priority</Label>
              <div className="flex items-center gap-2">
                {costPriorityIcons[preference.costPriority]}
                <span className="text-sm font-medium">
                  {costPriorityLabels[preference.costPriority]}
                </span>
              </div>
            </div>
            
            <Slider
              id="cost-priority"
              min={0}
              max={2}
              step={1}
              value={[getCostPriorityIndex(preference.costPriority)]}
              onValueChange={handleCostPriorityChange}
              className="w-full"
              data-testid="cost-priority-slider"
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>💰 Lowest Cost</span>
              <span>⚖️ Balanced</span>
              <span>🎯 Best Quality</span>
            </div>

            {/* Explanation */}
            <div className="rounded-lg bg-muted/50 p-3 text-sm" data-testid="routing-explanation">
              {preference.costPriority === 'cheap' && (
                <p>
                  <strong>Cost-Optimized:</strong> Prioritizes Gemini 2.5 Flash for simple queries.
                  40-85% cost savings vs. always using premium models.
                </p>
              )}
              {preference.costPriority === 'balanced' && (
                <p>
                  <strong>Balanced:</strong> Routes based on query complexity. Uses Gemini for simple tasks,
                  GPT-4o for medium tasks, Claude for complex reasoning.
                </p>
              )}
              {preference.costPriority === 'quality' && (
                <p>
                  <strong>Maximum Quality:</strong> Prioritizes Claude Sonnet 4.5 for best reasoning and accuracy.
                  7-23% quality improvement on complex tasks.
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
