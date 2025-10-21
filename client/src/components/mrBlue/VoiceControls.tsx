import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useVoiceOutput } from '@/hooks/useVoiceOutput';
import { VoiceVisualizer } from '@/components/voice/VoiceVisualizer';
import { useToast } from '@/hooks/use-toast';

interface VoiceControlsProps {
  onTranscript?: (text: string) => void;
  lastMessage?: string;
  autoSpeak?: boolean;
  onRecordingChange?: (isRecording: boolean) => void;
}

export default function VoiceControls({ onTranscript, lastMessage, autoSpeak = false, onRecordingChange }: VoiceControlsProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const { speak, cancel, isSpeaking: voiceActive } = useVoiceOutput();
  
  const {
    isListening: recognitionActive,
    transcript,
    startListening,
    stopListening,
    isSupported
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true
  });
  
  useEffect(() => {
    setIsListening(recognitionActive);
    onRecordingChange?.(recognitionActive);
  }, [recognitionActive, onRecordingChange]);
  
  useEffect(() => {
    setIsSpeaking(voiceActive);
  }, [voiceActive]);
  
  useEffect(() => {
    if (transcript && !recognitionActive) {
      onTranscript?.(transcript);
    }
  }, [transcript, recognitionActive, onTranscript]);
  
  useEffect(() => {
    if (autoSpeak && lastMessage && !isSpeaking) {
      handleSpeak();
    }
  }, [lastMessage, autoSpeak]);
  
  const handleListen = async () => {
    if (!isSupported) {
      toast({
        title: 'Voice Input Not Supported',
        description: 'Your browser does not support speech recognition.',
        variant: 'destructive'
      });
      return;
    }
    
    if (isListening) {
      stopListening();
    } else {
      try {
        await startListening();
        toast({
          title: 'Listening...',
          description: 'Speak now to send a message to Mr Blue',
        });
      } catch (error) {
        toast({
          title: 'Microphone Access Denied',
          description: 'Please allow microphone access to use voice input.',
          variant: 'destructive'
        });
      }
    }
  };
  
  const handleSpeak = () => {
    if (isSpeaking) {
      cancel();
    } else if (lastMessage) {
      speak(lastMessage, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => {
          setIsSpeaking(false);
          toast({
            title: 'Speech Error',
            description: 'Failed to speak the message.',
            variant: 'destructive'
          });
        }
      });
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      {isListening && (
        <VoiceVisualizer 
          isActive={isListening}
          className="mr-2"
        />
      )}
      
      <Button
        onClick={handleListen}
        variant={isListening ? 'default' : 'outline'}
        size="icon"
        className={
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'border-cyan-500/30 hover:bg-cyan-500/10'
        }
        title={isListening ? 'Stop listening' : 'Start voice input'}
        data-testid="button-voice-listen"
      >
        {isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      
      <Button
        onClick={handleSpeak}
        variant={isSpeaking ? 'default' : 'outline'}
        size="icon"
        className={
          isSpeaking 
            ? 'bg-cyan-500 hover:bg-cyan-600'
            : 'border-cyan-500/30 hover:bg-cyan-500/10'
        }
        title={isSpeaking ? 'Stop speaking' : 'Speak last message'}
        disabled={!lastMessage}
        data-testid="button-voice-speak"
      >
        {isSpeaking ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
      
      {(isListening || isSpeaking) && (
        <span className="text-xs text-cyan-400 animate-pulse">
          {isListening ? 'Listening...' : 'Speaking...'}
        </span>
      )}
    </div>
  );
}
