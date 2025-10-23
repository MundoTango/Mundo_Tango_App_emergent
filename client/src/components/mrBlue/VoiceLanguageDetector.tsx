/**
 * TRACK D: Voice Language Detector
 * MB.MD SIMULTANEOUS BUILD - Oct 23, 2025
 * Agent #127 (Voice)
 * 
 * Auto-detect and switch languages in voice conversations
 */

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
];

interface VoiceLanguageDetectorProps {
  currentLanguage: string;
  detectedLanguage?: string;
  onLanguageChange: (language: string) => void;
  autoSwitch?: boolean;
  onAutoSwitchChange?: (enabled: boolean) => void;
}

export function VoiceLanguageDetector({
  currentLanguage,
  detectedLanguage,
  onLanguageChange,
  autoSwitch = false,
  onAutoSwitchChange,
}: VoiceLanguageDetectorProps) {
  const [showDetection, setShowDetection] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  const detectedLang = detectedLanguage && SUPPORTED_LANGUAGES.find(l => l.code === detectedLanguage);

  // Show detection notification when language is detected
  useEffect(() => {
    if (detectedLanguage && detectedLanguage !== currentLanguage && !autoSwitch) {
      setShowDetection(true);
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowDetection(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [detectedLanguage, currentLanguage, autoSwitch]);

  // Auto-switch if enabled
  useEffect(() => {
    if (autoSwitch && detectedLanguage && detectedLanguage !== currentLanguage) {
      onLanguageChange(detectedLanguage);
    }
  }, [autoSwitch, detectedLanguage, currentLanguage, onLanguageChange]);

  const handleSwitchToDetected = () => {
    if (detectedLanguage) {
      onLanguageChange(detectedLanguage);
      setShowDetection(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Language selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            data-testid="button-language-selector"
          >
            <Globe className="w-4 h-4 mr-2" />
            <span className="mr-1">{currentLang.flag}</span>
            {currentLang.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              className="flex items-center justify-between"
              data-testid={`language-option-${lang.code}`}
            >
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
              {lang.code === currentLanguage && (
                <Check className="w-4 h-4 text-purple-500" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Auto-switch toggle */}
      {onAutoSwitchChange && (
        <Badge
          variant={autoSwitch ? 'default' : 'outline'}
          className="cursor-pointer select-none"
          onClick={() => onAutoSwitchChange(!autoSwitch)}
          data-testid="badge-auto-switch"
        >
          Auto-detect
        </Badge>
      )}

      {/* Language detection notification */}
      {showDetection && detectedLang && (
        <div
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg animate-in slide-in-from-right"
          data-testid="notification-language-detected"
        >
          <span className="text-sm">
            {detectedLang.flag} {detectedLang.name} detected
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-xs"
            onClick={handleSwitchToDetected}
            data-testid="button-switch-language"
          >
            Switch
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-xs"
            onClick={() => setShowDetection(false)}
            data-testid="button-dismiss-detection"
          >
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
}
