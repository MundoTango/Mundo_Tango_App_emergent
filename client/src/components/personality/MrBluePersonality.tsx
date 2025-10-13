import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Heart, GraduationCap, Bug } from "lucide-react";

export type PersonalityMode = 'professional' | 'friendly' | 'mentor' | 'debug';

interface PersonalityConfig {
  mode: PersonalityMode;
  name: string;
  description: string;
  icon: React.ReactNode;
  systemPrompt: string;
  greeting: string;
  color: string;
}

const personalityConfigs: Record<PersonalityMode, PersonalityConfig> = {
  professional: {
    mode: 'professional',
    name: 'Professional',
    description: 'Formal, technical, business-focused',
    icon: <Briefcase className="w-5 h-5" />,
    systemPrompt: 'You are a professional AI assistant. Communicate formally, use technical terminology appropriately, and focus on efficiency and results.',
    greeting: 'Good day. I am Mr. Blue, your AI companion. How may I assist you today?',
    color: 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700'
  },
  friendly: {
    mode: 'friendly',
    name: 'Friendly',
    description: 'Warm, conversational, approachable',
    icon: <Heart className="w-5 h-5" />,
    systemPrompt: 'You are a friendly AI companion. Use warm, conversational language, show empathy, and make interactions feel personal and welcoming.',
    greeting: 'Hey there! 👋 I\'m Mr. Blue, and I\'m here to help make your day awesome! What can I do for you?',
    color: 'bg-pink-100 dark:bg-pink-900 border-pink-300 dark:border-pink-700'
  },
  mentor: {
    mode: 'mentor',
    name: 'Mentor',
    description: 'Teaching, guiding, educational',
    icon: <GraduationCap className="w-5 h-5" />,
    systemPrompt: 'You are a mentor and teacher. Guide users through learning, explain concepts thoroughly, encourage questions, and help them grow their understanding.',
    greeting: 'Welcome, student! I\'m Mr. Blue, your learning companion. Let\'s explore and grow together. What would you like to learn today?',
    color: 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700'
  },
  debug: {
    mode: 'debug',
    name: 'Debug',
    description: 'Technical diagnostics, system analysis',
    icon: <Bug className="w-5 h-5" />,
    systemPrompt: 'You are a technical debugging assistant. Provide detailed diagnostics, system analysis, error traces, and technical solutions. Use developer terminology.',
    greeting: '[DEBUG MODE] Mr. Blue AI Companion initialized. System status: OPERATIONAL. Awaiting diagnostic query...',
    color: 'bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700'
  }
};

interface MrBluePersonalityProps {
  currentMode: PersonalityMode;
  onModeChange: (mode: PersonalityMode) => void;
  showGreeting?: boolean;
}

export function MrBluePersonality({ currentMode, onModeChange, showGreeting = true }: MrBluePersonalityProps) {
  const [selectedMode, setSelectedMode] = useState<PersonalityMode>(currentMode);
  const config = personalityConfigs[selectedMode];

  const handleModeChange = (mode: PersonalityMode) => {
    setSelectedMode(mode);
    onModeChange(mode);
  };

  return (
    <div className="space-y-4">
      {/* Personality Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {config.icon}
            Mr. Blue Personality
          </CardTitle>
          <CardDescription>
            Choose how Mr. Blue communicates with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(personalityConfigs).map(([key, personality]) => (
              <Button
                key={key}
                variant={selectedMode === key ? "default" : "outline"}
                onClick={() => handleModeChange(key as PersonalityMode)}
                className="flex flex-col items-center gap-2 h-auto py-3"
                data-testid={`button-personality-${key}`}
              >
                {personality.icon}
                <span className="text-xs">{personality.name}</span>
              </Button>
            ))}
          </div>

          {/* Current Mode Info */}
          <div className={`p-4 rounded-lg border ${config.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{config.name} Mode</Badge>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {config.description}
            </p>
          </div>

          {/* Greeting Preview */}
          {showGreeting && (
            <div className="bg-gray-50 dark:bg-gray-800 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Greeting Preview:
              </p>
              <p className="text-gray-900 dark:text-white dark:text-white" data-testid="text-greeting">
                {config.greeting}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function usePersonality(initialMode: PersonalityMode = 'friendly') {
  const [mode, setMode] = useState<PersonalityMode>(initialMode);
  const config = personalityConfigs[mode];

  return {
    mode,
    setMode,
    config,
    systemPrompt: config.systemPrompt,
    greeting: config.greeting
  };
}
