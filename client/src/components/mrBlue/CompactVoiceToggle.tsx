/**
 * COMPACT VOICE TOGGLE - Inline Mic Button
 * MB.MD Stream 1: Replace full-screen voice mode with inline toggle
 * 
 * User clicks mic → starts conversation inline (no modal)
 * Visual feedback: Recording indicator, waveform, transcript
 */

import { useState, useCallback } from 'react';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRealtimeConversation } from '@/hooks/useRealtimeConversation';
import { useAudioCapture } from '@/hooks/useAudioCapture';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CompactVoiceToggleProps {
  voiceSettings: {
    selectedVoice: string;
    usePremiumTTS: boolean;
  };
  onTranscriptUpdate?: (transcript: string) => void;
  className?: string;
}

export function CompactVoiceToggle({ 
  voiceSettings, 
  onTranscriptUpdate,
  className 
}: CompactVoiceToggleProps) {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { toast } = useToast();

  // Realtime conversation hook
  const {
    status: realtimeStatus,
    isAssistantSpeaking,
    transcript,
    audioQueue,
    connect,
    disconnect,
    sendAudio,
  } = useRealtimeConversation({
    voice: voiceSettings.selectedVoice as any,
    instructions: 'You are Mr Blue, a helpful AI assistant for the Mundo Tango community. Be conversational, friendly, and concise in your voice responses.',
    onEvent: (event) => {
      if (event.type === 'response.audio_transcript.delta' && onTranscriptUpdate) {
        onTranscriptUpdate(transcript);
      } else if (event.type === 'error') {
        toast({
          title: 'Voice Error',
          description: event.error.message,
          variant: 'destructive'
        });
      }
    }
  });

  // Audio capture
  const {
    status: captureStatus,
    startCapture,
    stopCapture,
    checkPermission
  } = useAudioCapture({
    onAudioData: (audioData) => {
      if (!isMuted && realtimeStatus === 'connected') {
        sendAudio(audioData);
      }
    }
  });

  // Audio playback
  const { queueAudio } = useAudioPlayback();

  // Play incoming audio
  React.useEffect(() => {
    if (audioQueue.length > 0 && !isMuted) {
      audioQueue.forEach(chunk => queueAudio(chunk));
    }
  }, [audioQueue, isMuted, queueAudio]);

  // Toggle voice conversation
  const toggleVoice = useCallback(async () => {
    if (!isActive) {
      // Start conversation
      try {
        const hasPermission = await checkPermission();
        if (!hasPermission) {
          toast({
            title: 'Microphone Required',
            description: 'Please allow microphone access to use voice mode.',
            variant: 'destructive'
          });
          return;
        }

        await connect();
        await startCapture();
        setIsActive(true);

        toast({
          title: '🎤 Voice Active',
          description: 'Speak naturally - Mr Blue is listening!'
        });
      } catch (error: any) {
        console.error('[CompactVoice] Error starting:', error);
        toast({
          title: 'Voice Failed',
          description: error.message || 'Could not start voice mode',
          variant: 'destructive'
        });
      }
    } else {
      // Stop conversation
      stopCapture();
      disconnect();
      setIsActive(false);
      
      toast({
        title: 'Voice Ended',
        description: 'Voice conversation stopped'
      });
    }
  }, [isActive, connect, disconnect, startCapture, stopCapture, checkPermission, toast]);

  // Visual states
  const isRecording = captureStatus === 'recording';
  const isConnected = realtimeStatus === 'connected';
  const isSpeaking = isAssistantSpeaking;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Main mic toggle button */}
      <Button
        variant={isActive ? "default" : "outline"}
        size="icon"
        onClick={toggleVoice}
        className={cn(
          "relative transition-all",
          isActive && "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600",
          isRecording && "animate-pulse"
        )}
        data-testid="button-voice-toggle"
      >
        {isActive ? (
          <PhoneOff className="h-4 w-4 text-white" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        
        {/* Recording indicator dot */}
        {isRecording && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </Button>

      {/* Inline status indicators (only when active) */}
      {isActive && (
        <div className="flex items-center gap-2 text-xs">
          {isConnected && (
            <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              Connected
            </span>
          )}
          {isSpeaking && (
            <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
              <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
              Speaking...
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Fix React import
import * as React from 'react';
