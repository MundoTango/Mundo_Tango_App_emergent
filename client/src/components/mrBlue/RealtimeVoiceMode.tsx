/**
 * STREAM 4: UI Integration - Realtime Voice Mode Component
 * Full two-way voice conversation UI for Mr Blue
 * Integrates with GPT-4o Realtime API
 */

import { useState, useEffect, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRealtimeConversation } from '@/hooks/useRealtimeConversation';
import { useAudioCapture } from '@/hooks/useAudioCapture';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';
import { useToast } from '@/hooks/use-toast';

interface RealtimeVoiceModeProps {
  voiceSettings: {
    selectedVoice: string;
    usePremiumTTS: boolean;
  };
  onClose?: () => void;
}

export function RealtimeVoiceMode({ voiceSettings, onClose }: RealtimeVoiceModeProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const { toast } = useToast();

  // Realtime conversation hook
  const {
    status: realtimeStatus,
    isAssistantSpeaking,
    transcript: liveTranscript,
    audioQueue,
    connect,
    disconnect,
    sendAudio,
    sendText,
    interrupt
  } = useRealtimeConversation({
    voice: voiceSettings.selectedVoice as any,
    instructions: 'You are Mr Blue, a helpful AI assistant for the Mundo Tango community. Be conversational, friendly, and concise in your voice responses.',
    onEvent: (event) => {
      if (event.type === 'response.audio_transcript.delta') {
        // Add to transcript display
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
    error: captureError,
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
  const { isPlaying, queueAudio, clearQueue } = useAudioPlayback();

  // Play incoming audio
  useEffect(() => {
    if (audioQueue.length > 0 && !isSpeakerMuted) {
      audioQueue.forEach(chunk => queueAudio(chunk));
    }
  }, [audioQueue, isSpeakerMuted, queueAudio]);

  // Start call
  const startCall = useCallback(async () => {
    try {
      // Check microphone permission first
      const hasPermission = await checkPermission();
      if (!hasPermission) {
        toast({
          title: 'Microphone Required',
          description: 'Please allow microphone access to use voice mode.',
          variant: 'destructive'
        });
        return;
      }

      // Connect to Realtime API
      await connect();

      // Start audio capture
      await startCapture();

      toast({
        title: 'Voice Call Started',
        description: 'Speak naturally - Mr Blue is listening!'
      });
    } catch (error: any) {
      console.error('[RealtimeVoice] Error starting call:', error);
      toast({
        title: 'Call Failed',
        description: error.message || 'Could not start voice call',
        variant: 'destructive'
      });
    }
  }, [connect, startCapture, checkPermission, toast]);

  // End call
  const endCall = useCallback(() => {
    stopCapture();
    disconnect();
    clearQueue();
    toast({ title: 'Voice Call Ended' });
    if (onClose) onClose();
  }, [stopCapture, disconnect, clearQueue, onClose, toast]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Toggle speaker
  const toggleSpeaker = useCallback(() => {
    setIsSpeakerMuted(prev => {
      if (!prev) clearQueue(); // Clear queue when muting
      return !prev;
    });
  }, [clearQueue]);

  // Auto-start call on mount
  useEffect(() => {
    startCall();
    return () => {
      stopCapture();
      disconnect();
      clearQueue();
    };
  }, []);

  const isConnected = realtimeStatus === 'connected';
  const isRecording = captureStatus === 'recording';

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-8">
      {/* Status Indicator */}
      <div className="mb-8">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
          isConnected 
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse' 
            : 'bg-gray-300 dark:bg-gray-700'
        }`}>
          <Phone className="w-16 h-16 text-white" />
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {isConnected ? (
            isAssistantSpeaking ? 'Mr Blue is speaking...' : 'Listening...'
          ) : (
            realtimeStatus === 'connecting' ? 'Connecting...' : 'Disconnected'
          )}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isConnected 
            ? 'Speak naturally - no need to click anything' 
            : 'Setting up voice connection...'}
        </p>
      </div>

      {/* Live Transcript */}
      {liveTranscript && (
        <div className="mb-6 max-w-md text-center">
          <p className="text-gray-700 dark:text-gray-300 italic">
            "{liveTranscript}"
          </p>
        </div>
      )}

      {/* Error Display */}
      {captureError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{captureError}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4">
        {/* Mute Button */}
        <Button
          onClick={toggleMute}
          variant={isMuted ? 'destructive' : 'outline'}
          size="lg"
          className="w-16 h-16 rounded-full"
          disabled={!isConnected}
          data-testid="button-mute-microphone"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>

        {/* End Call Button */}
        <Button
          onClick={endCall}
          variant="destructive"
          size="lg"
          className="w-16 h-16 rounded-full"
          data-testid="button-end-call"
          title="End Call"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>

        {/* Speaker Button */}
        <Button
          onClick={toggleSpeaker}
          variant={isSpeakerMuted ? 'destructive' : 'outline'}
          size="lg"
          className="w-16 h-16 rounded-full"
          disabled={!isConnected}
          data-testid="button-mute-speaker"
          title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
        >
          {isSpeakerMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </Button>
      </div>

      {/* Connection Indicators */}
      <div className="mt-8 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span>Connection: {realtimeStatus}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
          <span>Microphone: {isRecording ? 'active' : 'inactive'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
          <span>Speaker: {isPlaying ? 'active' : 'inactive'}</span>
        </div>
      </div>
    </div>
  );
}
