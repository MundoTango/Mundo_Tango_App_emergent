/**
 * Voice Selector - Premium OpenAI TTS Voice Selector
 * Oct 22, 2025 - Professional voice quality upgrade
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Volume2, Play, Loader2 } from 'lucide-react';
import type { VoiceSettings } from '@/hooks/useVoiceOutput';

interface Voice {
  id: string;
  name: string;
  gender: string;
  description: string;
  recommended: boolean;
}

const VOICES: Voice[] = [
  { id: 'nova', name: 'Nova', gender: 'female', description: 'Energetic, friendly', recommended: true },
  { id: 'alloy', name: 'Alloy', gender: 'neutral', description: 'Balanced, neutral', recommended: false },
  { id: 'echo', name: 'Echo', gender: 'male', description: 'Clear, professional', recommended: false },
  { id: 'fable', name: 'Fable', gender: 'male', description: 'Warm, British accent', recommended: false },
  { id: 'onyx', name: 'Onyx', gender: 'male', description: 'Deep, authoritative', recommended: false },
  { id: 'shimmer', name: 'Shimmer', gender: 'female', description: 'Soft, gentle', recommended: false },
];

interface VoiceSelectorProps {
  settings: VoiceSettings;
  onSettingsChange: (settings: Partial<VoiceSettings>) => void;
  className?: string;
}

export function VoiceSelector({ settings, onSettingsChange, className = '' }: VoiceSelectorProps) {
  const [isTesting, setIsTesting] = useState(false);

  const selectedVoice = VOICES.find(v => v.id === settings.voice) || VOICES[0];

  const handleTestVoice = async () => {
    if (isTesting) return;
    
    try {
      setIsTesting(true);
      
      const testText = `Hello! This is ${selectedVoice.name}. I'm your AI companion, Mr Blue.`;
      
      const response = await fetch('/api/tts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice: settings.voice }),
      });
      
      if (!response.ok) {
        throw new Error('Test failed');
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsTesting(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsTesting(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('[VoiceSelector] Test error:', error);
      setIsTesting(false);
    }
  };

  return (
    <Card className={`p-4 bg-gray-800/50 border-gray-700 space-y-4 ${className}`} data-testid="voice-selector-card">
      {/* Premium Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-white">Premium Voices</Label>
          <p className="text-xs text-gray-400">OpenAI TTS for professional quality</p>
        </div>
        <Switch
          checked={settings.usePremium}
          onCheckedChange={(checked) => onSettingsChange({ usePremium: checked })}
          data-testid="toggle-premium-voices"
        />
      </div>

      {/* Voice Selection */}
      {settings.usePremium && (
        <>
          <div className="space-y-2">
            <Label className="text-white">Select Voice</Label>
            <Select
              value={settings.voice}
              onValueChange={(voice) => onSettingsChange({ voice })}
            >
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white" data-testid="select-voice-trigger">
                <SelectValue placeholder="Choose a voice" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {VOICES.map((voice) => (
                  <SelectItem 
                    key={voice.id} 
                    value={voice.id}
                    className="text-white hover:bg-gray-800"
                    data-testid={`voice-option-${voice.id}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {voice.name}
                          {voice.recommended && (
                            <span className="ml-2 text-xs text-teal-400">Recommended</span>
                          )}
                        </span>
                        <span className="text-xs text-gray-400">{voice.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Voice Info */}
          <div className="p-3 bg-gray-900/50 rounded-lg">
            <div className="flex items-start gap-2">
              <Volume2 className="w-4 h-4 text-teal-400 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-white">{selectedVoice.name}</p>
                <p className="text-xs text-gray-400">
                  {selectedVoice.gender} • {selectedVoice.description}
                </p>
              </div>
            </div>
          </div>

          {/* Test Button */}
          <Button
            onClick={handleTestVoice}
            disabled={isTesting}
            variant="outline"
            className="w-full border-teal-500/30 hover:bg-teal-500/10"
            data-testid="button-test-voice"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Playing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Test Voice
              </>
            )}
          </Button>

          {/* Cost Info */}
          <div className="text-xs text-gray-500 text-center">
            OpenAI TTS • $15 per 1M characters • ~300ms latency
          </div>
        </>
      )}

      {/* Browser TTS Fallback Message */}
      {!settings.usePremium && (
        <div className="p-3 bg-gray-900/50 rounded-lg">
          <p className="text-sm text-gray-400">
            Using browser's built-in voice. Enable Premium Voices for professional quality.
          </p>
        </div>
      )}
    </Card>
  );
}
