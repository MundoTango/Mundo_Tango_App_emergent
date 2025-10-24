/**
 * UNIFIED VOICE MODAL - Single Headphone Button Interface
 * MB.MD Stream 1: Consolidate all voice features into one modal
 * 
 * Features:
 * - Live transcript (auto-scrolling raw text)
 * - Real-time AI summary (expandable bullets)
 * - Voice settings submenu
 * - Session controls
 */

import { useState, useEffect, useRef } from 'react';
import { X, Headphones, ChevronDown, ChevronRight, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealtimeConversation } from '@/hooks/useRealtimeConversation';
import { useAudioCapture } from '@/hooks/useAudioCapture';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';
import { VoiceSelector } from './VoiceSelector';
import { useToast } from '@/hooks/use-toast';

interface SelectedElement {
  tagName: string;
  id?: string;
  className?: string;
  attributes?: Record<string, string>;
}

interface UnifiedVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceSettings: {
    voice: string;
    usePremium: boolean;
    speed: number;
  };
  onVoiceSettingsChange: (settings: Partial<{
    voice: string;
    usePremium: boolean;
    speed: number;
  }>) => void;
  selectedElement?: SelectedElement | null;
}

interface SummaryBullet {
  id: string;
  text: string;
  expanded: boolean;
  details?: string;
}

export function UnifiedVoiceModal({
  isOpen,
  onClose,
  voiceSettings,
  onVoiceSettingsChange,
  selectedElement
}: UnifiedVoiceModalProps) {
  const [transcript, setTranscript] = useState<string>('');
  const [summaryBullets, setSummaryBullets] = useState<SummaryBullet[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessingSummary, setIsProcessingSummary] = useState(false);
  
  // 🎯 WEEK 0 FIX: Connection status tracking (Oct 24, 2025)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  // 🎯 ARCHITECT FIX: Use ref for live polling access (Oct 24, 2025)
  const connectionStatusRef = useRef<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  const transcriptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // 🐛 PHASE 2 DEBUG: Log selectedElement prop
  useEffect(() => {
    if (selectedElement) {
      console.log('🎧 [UnifiedVoiceModal] Received selectedElement prop:', selectedElement);
    } else {
      console.log('⚪ [UnifiedVoiceModal] No selectedElement prop (null)');
    }
  }, [selectedElement]);

  // Realtime conversation hook
  const {
    status: realtimeStatus,
    isAssistantSpeaking,
    transcript: realtimeTranscript,
    audioQueue,
    connect,
    disconnect,
    sendAudio,
  } = useRealtimeConversation({
    voice: voiceSettings.voice as any,
    instructions: 'You are Mr Blue, a helpful AI assistant for the Mundo Tango community. Be conversational, friendly, and concise in your voice responses.',
    onEvent: (event) => {
      if (event.type === 'response.audio_transcript.delta') {
        setTranscript(prev => prev + event.delta);
      } else if (event.type === 'error') {
        toast({
          title: 'Voice Error',
          description: event.error.message,
          variant: 'destructive'
        });
      }
    }
  });
  
  // 🎯 WEEK 0 FIX: Update connection status when realtime status changes (Oct 24, 2025)
  // 🎯 ARCHITECT FIX: Also update ref for live polling access (Oct 24, 2025)
  useEffect(() => {
    let newStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
    
    if (realtimeStatus === 'connected') {
      newStatus = 'connected';
    } else if (realtimeStatus === 'connecting') {
      newStatus = 'connecting';
    } else {
      newStatus = 'disconnected';
    }
    
    setConnectionStatus(newStatus);
    connectionStatusRef.current = newStatus; // Update ref for live polling
  }, [realtimeStatus]);

  // Audio capture
  const {
    status: captureStatus,
    startCapture,
    stopCapture,
    checkPermission
  } = useAudioCapture({
    onAudioData: (audioData) => {
      console.log('[VoiceModal] Audio captured:', audioData.byteLength, 'bytes, status:', connectionStatus);
      
      // 🎯 WEEK 0 FIX: Use connectionStatus instead of realtimeStatus (Oct 24, 2025)
      if (connectionStatus === 'connected') {
        console.log('[VoiceModal] ✅ Sending audio to OpenAI...');
        sendAudio(audioData);
      } else {
        console.warn('[VoiceModal] ❌ Not sending - not connected. Status:', connectionStatus);
      }
    }
  });

  // Audio playback
  const { queueAudio } = useAudioPlayback();

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  // Play incoming audio
  useEffect(() => {
    if (audioQueue.length > 0) {
      audioQueue.forEach(chunk => queueAudio(chunk));
    }
  }, [audioQueue, queueAudio]);

  // Real-time AI summarization
  useEffect(() => {
    if (transcript.length > 0 && transcript.endsWith('.')) {
      generateSummary();
    }
  }, [transcript]);

  // Start session when modal opens
  useEffect(() => {
    if (isOpen) {
      startSession();
    } else {
      endSession();
    }
  }, [isOpen]);

  const startSession = async () => {
    console.log('[UnifiedVoiceModal] 🎬 Starting session...');
    try {
      console.log('[UnifiedVoiceModal] 🎤 Checking microphone permission...');
      const hasPermission = await checkPermission();
      console.log('[UnifiedVoiceModal] Permission result:', hasPermission);
      
      if (!hasPermission) {
        console.error('[UnifiedVoiceModal] ❌ Microphone permission denied');
        toast({
          title: 'Microphone Required',
          description: 'Please allow microphone access to use voice mode.',
          variant: 'destructive'
        });
        onClose();
        return;
      }

      console.log('[UnifiedVoiceModal] 📡 Connecting to OpenAI...');
      await connect();
      
      // 🎯 ARCHITECT FIX: Wait for connection via ref (live), not state (stale closure) (Oct 24, 2025)
      // Use connectionStatusRef.current - updated by useEffect, readable in closure
      console.log('[UnifiedVoiceModal] ⏳ Waiting for connection...');
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error('[UnifiedVoiceModal] ⏱️ Connection timeout after 10s, status was:', connectionStatusRef.current);
          reject(new Error('Connection timeout'));
        }, 10000); // 10 second timeout
        
        // Check every 100ms - ref.current reads LIVE value from useEffect
        const checkConnection = setInterval(() => {
          const currentStatus = connectionStatusRef.current; // ✅ Reads live value
          console.log('[UnifiedVoiceModal] 🔍 Polling live status via ref:', currentStatus);
          
          if (currentStatus === 'connected') {
            clearTimeout(timeout);
            clearInterval(checkConnection);
            console.log('[UnifiedVoiceModal] ✅ Connection confirmed via ref!');
            resolve();
          } else if (currentStatus === 'disconnected' && realtimeStatus === 'error') {
            // Error state detected
            clearTimeout(timeout);
            clearInterval(checkConnection);
            console.error('[UnifiedVoiceModal] ❌ Connection error detected');
            reject(new Error('Connection failed'));
          }
        }, 100);
      });
      
      console.log('[UnifiedVoiceModal] ✅ Connected! Starting audio capture...');
      await startCapture();

      toast({
        title: '🎧 Voice Session Started',
        description: 'Speak naturally - I\'m listening and taking notes!'
      });
    } catch (error: any) {
      console.error('[UnifiedVoiceModal] Error starting session:', error);
      toast({
        title: 'Voice Session Failed',
        description: error.message || 'Could not start voice mode',
        variant: 'destructive'
      });
      onClose();
    }
  };

  const endSession = () => {
    stopCapture();
    disconnect();
    setTranscript('');
    setSummaryBullets([]);
  };

  const generateSummary = async () => {
    if (isProcessingSummary) return;
    
    setIsProcessingSummary(true);
    try {
      // Call backend to summarize transcript (Agent #128: Include visual context)
      const response = await fetch('/api/chat/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          text: transcript,
          visualContext: selectedElement ? {
            tagName: selectedElement.tagName,
            id: selectedElement.id,
            className: selectedElement.className
          } : undefined
        })
      });

      if (!response.ok) throw new Error('Summarization failed');

      const data = await response.json();
      
      // Add new bullets (don't replace existing ones)
      const newBullets: SummaryBullet[] = data.bullets.map((text: string, idx: number) => ({
        id: `bullet-${Date.now()}-${idx}`,
        text,
        expanded: false,
        details: data.details?.[idx]
      }));

      setSummaryBullets(prev => [...prev, ...newBullets]);
    } catch (error) {
      console.error('[UnifiedVoiceModal] Summarization error:', error);
    } finally {
      setIsProcessingSummary(false);
    }
  };

  const toggleBullet = (id: string) => {
    setSummaryBullets(prev =>
      prev.map(bullet =>
        bullet.id === id ? { ...bullet, expanded: !bullet.expanded } : bullet
      )
    );
  };

  const isRecording = captureStatus === 'recording';
  const isConnected = realtimeStatus === 'connected';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Headphones className="h-5 w-5 text-cyan-600" />
              <DialogTitle className="text-lg font-bold">Voice Session Active</DialogTitle>
              
              {/* Status Indicators */}
              <div className="flex items-center gap-2 text-xs">
                {isConnected && (
                  <span className="flex items-center gap-1 text-teal-600">
                    <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                    Connected
                  </span>
                )}
                {isRecording && (
                  <span className="flex items-center gap-1 text-red-600">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    Recording
                  </span>
                )}
                {isAssistantSpeaking && (
                  <span className="flex items-center gap-1 text-cyan-600">
                    <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                    Speaking...
                  </span>
                )}
                {/* Agent #128: Visual Element Context Badge */}
                {selectedElement && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 border border-purple-500 rounded-lg">
                    <Sparkles className="h-3 w-3 text-purple-400" />
                    <span className="text-purple-300 font-mono">
                      &lt;{selectedElement.tagName}&gt;
                      {selectedElement.id && ` #${selectedElement.id}`}
                    </span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                data-testid="button-voice-settings-toggle"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                data-testid="button-close-voice-modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Voice Settings Panel (collapsible) */}
        {showSettings && (
          <div className="p-4 border-b border-cyan-200 bg-white/50">
            <VoiceSelector 
              settings={voiceSettings}
              onSettingsChange={onVoiceSettingsChange}
            />
          </div>
        )}

        {/* Main Content - Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Live Transcript */}
          <div className="flex-1 flex flex-col border-r border-cyan-200">
            <div className="p-3 bg-cyan-50 border-b border-cyan-200">
              <h3 className="text-sm font-semibold text-cyan-900">📝 Live Transcript</h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div 
                ref={transcriptRef}
                className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed"
                data-testid="live-transcript"
              >
                {transcript || <span className="text-gray-400 italic">Start speaking to see transcript...</span>}
              </div>
            </ScrollArea>
          </div>

          {/* Right: AI Summary */}
          <div className="flex-1 flex flex-col">
            <div className="p-3 bg-purple-50 border-b border-purple-200">
              <h3 className="text-sm font-semibold text-purple-900">
                🤖 AI Summary
                {isProcessingSummary && (
                  <span className="ml-2 text-xs text-purple-600 animate-pulse">Updating...</span>
                )}
              </h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              {summaryBullets.length === 0 ? (
                <p className="text-sm text-gray-400 italic">AI will summarize your conversation here...</p>
              ) : (
                <div className="space-y-2" data-testid="summary-bullets">
                  {summaryBullets.map((bullet) => (
                    <div key={bullet.id} className="group">
                      <button
                        onClick={() => toggleBullet(bullet.id)}
                        className="w-full text-left flex items-start gap-2 p-2 rounded hover:bg-purple-50 transition-colors"
                        data-testid={`summary-bullet-${bullet.id}`}
                      >
                        {bullet.details ? (
                          bullet.expanded ? (
                            <ChevronDown className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                          )
                        ) : (
                          <span className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span className="text-sm text-gray-700">• {bullet.text}</span>
                      </button>
                      
                      {/* Expanded Details */}
                      {bullet.expanded && bullet.details && (
                        <div className="ml-8 mt-1 p-3 bg-purple-50 rounded text-xs text-gray-600 border-l-2 border-purple-300">
                          {bullet.details}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Footer - Session Controls */}
        <div className="p-4 border-t border-cyan-200 bg-white flex items-center justify-between">
          <div className="text-xs text-gray-500">
            💡 Tip: AI summarizes in real-time. Expand bullets for details.
          </div>
          <Button
            variant="destructive"
            onClick={onClose}
            data-testid="button-end-session"
          >
            End Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
