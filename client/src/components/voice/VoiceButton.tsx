// TRACK 3: Voice Button Component
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceButtonProps {
  isListening: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceButton({ isListening, onToggle, disabled, className }: VoiceButtonProps) {
  return (
    <Button
      variant={isListening ? 'default' : 'outline'}
      size="icon"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'relative transition-all',
        isListening && 'animate-pulse bg-red-500 hover:bg-red-600',
        className
      )}
      data-testid="button-voice-toggle"
    >
      {isListening ? (
        <>
          <Mic className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-ping" />
        </>
      ) : (
        <MicOff className="h-4 w-4" />
      )}
    </Button>
  );
}
