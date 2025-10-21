import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Heart, GraduationCap, Bug } from 'lucide-react';

export type PersonalityMode = 'professional' | 'friendly' | 'mentor' | 'debug';

interface PersonalitySelectorProps {
  value: PersonalityMode;
  onChange: (mode: PersonalityMode) => void;
}

const personalityOptions = [
  {
    value: 'professional' as PersonalityMode,
    label: 'Professional',
    icon: Brain,
    description: 'Formal, concise, business-focused'
  },
  {
    value: 'friendly' as PersonalityMode,
    label: 'Friendly',
    icon: Heart,
    description: 'Warm, conversational, approachable'
  },
  {
    value: 'mentor' as PersonalityMode,
    label: 'Mentor',
    icon: GraduationCap,
    description: 'Teaching-focused, detailed explanations'
  },
  {
    value: 'debug' as PersonalityMode,
    label: 'Debug',
    icon: Bug,
    description: 'Technical, verbose, shows reasoning'
  }
];

export default function PersonalitySelector({ value, onChange }: PersonalitySelectorProps) {
  const currentPersonality = personalityOptions.find(p => p.value === value) || personalityOptions[1];
  const Icon = currentPersonality.icon;
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">Mr Blue Personality</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          className="w-full bg-black/30 border-cyan-500/30 text-white hover:bg-cyan-500/10"
          data-testid="select-personality"
        >
          <SelectValue>
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-cyan-400" />
              <span>{currentPersonality.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-cyan-500/30">
          {personalityOptions.map((option) => {
            const OptionIcon = option.icon;
            return (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="text-white hover:bg-cyan-500/20 cursor-pointer"
              >
                <div className="flex items-start gap-3 py-1">
                  <OptionIcon className="h-5 w-5 text-cyan-400 mt-0.5" />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-400">{option.description}</div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
