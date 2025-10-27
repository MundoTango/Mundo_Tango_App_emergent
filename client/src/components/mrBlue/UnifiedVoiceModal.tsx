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
import { executeVibeCoding, applyCodeChange } from '@/lib/vibeApi';
import { useVisualEditorOptional } from '@/contexts/VisualEditorContext';

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
  
  // ✅ FIX #1 (Oct 27): Removed duplicate state - use realtimeStatus directly from hook
  
  // 🚀 STREAM 3: Voice-to-vibe coding integration (Oct 25, 2025)
  const [isExecutingCode, setIsExecutingCode] = useState(false);
  const [lastProcessedLength, setLastProcessedLength] = useState(0); // Track processed transcript
  const visualEditorContext = useVisualEditorOptional();
  
  // 🎯 BATCH 1 FIX: Manual start button for permission request (Oct 26, 2025)
  const [sessionState, setSessionState] = useState<'idle' | 'starting' | 'active' | 'error'>('idle');
  
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
      // ✅ FIX #5 (Oct 27, FINAL): Add comprehensive debug logging
      console.log('🎤 [Voice] Realtime event:', event.type, event);
      
      if (event.type === 'response.audio_transcript.delta') {
        setTranscript(prev => prev + event.delta);
      } else if (event.type === 'error') {
        console.error('🎤 [Voice] ERROR event received:', event.error);
        toast({
          title: 'Voice Error',
          description: event.error.message,
          variant: 'destructive'
        });
      }
    }
  });
  
  // ✅ FIX #1 (Oct 27): Removed state sync useEffect - using realtimeStatus directly

  // Audio capture
  const {
    status: captureStatus,
    startCapture,
    stopCapture,
    checkPermission
  } = useAudioCapture({
    onAudioData: (audioData) => {
      console.log('🎤 [VoiceModal] Audio captured:', audioData.byteLength, 'bytes');
      console.log('🔗 [VoiceModal] Realtime status:', realtimeStatus);
      
      // ✅ FIX #1 (Oct 27): Use realtimeStatus directly - single source of truth
      if (realtimeStatus === 'connected') {
        console.log('✅ [VoiceModal] Sending audio to WebSocket...');
        sendAudio(audioData);
      } else {
        console.error('❌ [VoiceModal] NOT sending audio - WebSocket not connected!');
        console.error('   Realtime status:', realtimeStatus);
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

  // 🎯 BATCH 1 FIX: DON'T auto-start - wait for user click (Oct 26, 2025)
  // Clean up when modal closes
  useEffect(() => {
    if (!isOpen) {
      endSession();
      setSessionState('idle');
    }
  }, [isOpen]);

  // 🎯 BATCH 1 FIX: Request permission via getUserMedia (Oct 26, 2025)
  const startSession = async () => {
    console.log('[UnifiedVoiceModal] 🎬 Starting session...');
    console.log('[UnifiedVoiceModal] 🔍 Debug - connect function exists?', typeof connect === 'function');
    console.log('[UnifiedVoiceModal] 🔍 Debug - realtime status before connect:', realtimeStatus);
    setSessionState('starting');
    
    try {
      // ✅ FIX: Request permission by calling startCapture (triggers getUserMedia)
      // This shows the browser permission popup
      console.log('[UnifiedVoiceModal] 📡 Connecting to OpenAI...');
      console.log('[UnifiedVoiceModal] 📡 About to call connect()...');
      await connect();
      console.log('[UnifiedVoiceModal] 📡 connect() returned successfully');
      
      // ✅ FIX #1 (Oct 27): Poll realtimeStatus directly - no ref needed
      console.log('[UnifiedVoiceModal] ⏳ Waiting for connection...');
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error('[UnifiedVoiceModal] ⏱️ Connection timeout after 10s, status was:', realtimeStatus);
          reject(new Error('Connection timeout'));
        }, 10000); // 10 second timeout
        
        // Check every 100ms - realtimeStatus updated by hook
        const checkConnection = setInterval(() => {
          console.log('[UnifiedVoiceModal] 🔍 Polling realtime status:', realtimeStatus);
          
          if (realtimeStatus === 'connected') {
            clearTimeout(timeout);
            clearInterval(checkConnection);
            console.log('[UnifiedVoiceModal] ✅ Connection confirmed!');
            resolve();
          } else if (realtimeStatus === 'error') {
            clearTimeout(timeout);
            clearInterval(checkConnection);
            console.error('[UnifiedVoiceModal] ❌ Connection error detected');
            reject(new Error('Connection failed'));
          }
        }, 100);
      });
      
      console.log('[UnifiedVoiceModal] ✅ Connected! Starting audio capture...');
      await startCapture();

      setSessionState('active');
      toast({
        title: '🎧 Voice Session Started',
        description: 'Speak naturally - I\'m listening and taking notes!'
      });
    } catch (error: any) {
      console.error('[UnifiedVoiceModal] ❌ Error starting session:', error);
      console.error('[UnifiedVoiceModal] ❌ Error type:', error?.constructor?.name);
      console.error('[UnifiedVoiceModal] ❌ Error message:', error?.message);
      console.error('[UnifiedVoiceModal] ❌ Error stack:', error?.stack);
      console.error('[UnifiedVoiceModal] ❌ Full error object:', JSON.stringify(error, null, 2));
      setSessionState('error');
      toast({
        title: 'Voice Session Failed',
        description: error.message || 'Could not start voice mode',
        variant: 'destructive'
      });
    }
  };

  const endSession = () => {
    stopCapture();
    disconnect();
    setTranscript('');
    setSummaryBullets([]);
    setLastProcessedLength(0); // 🔧 ARCHITECT FIX: Reset processed tracker
  };

  // 🚀 STREAM 3: Execute vibe coding from voice transcript (Oct 25, 2025)
  // 🔧 ARCHITECT FIX: Only process NEW portion of transcript, not entire accumulation
  const executeVibeFromVoice = async () => {
    if (!visualEditorContext) {
      console.log('🎧 [Voice] Not in Visual Editor - skipping vibe execution');
      return;
    }
    
    if (isExecutingCode || transcript.trim().length < 10) return;
    
    // 🔧 ARCHITECT FIX: Extract only the NEW command (after last processed point)
    const newTranscript = transcript.slice(lastProcessedLength).trim();
    if (newTranscript.length < 5) return; // Ignore very short additions
    
    console.log(`🎧 [Voice] Processing NEW command only: "${newTranscript}" (prev length: ${lastProcessedLength})`);
    
    setIsExecutingCode(true);
    try {
      const result = await executeVibeCoding(newTranscript, {
        selectedElement: selectedElement || null,
        previewPath: visualEditorContext.previewPath || '/'
      });
      
      console.log(`🎧 [Voice] Generated ${result.codeChanges.length} code changes`);
      
      // 🚀 STREAM 3.2: Apply changes immediately (real-time)
      for (const change of result.codeChanges) {
        const editType = change.type === 'new_file' ? 'unified_diff' : change.type;
        await applyCodeChange(change.filePath, change.diff, editType);
      }
      
      // 🔧 ARCHITECT FIX: Mark this portion as processed
      setLastProcessedLength(transcript.length);
      
      toast({
        title: 'Voice Command Applied! ✨',
        description: `Modified ${result.codeChanges.length} file(s) instantly`,
      });
    } catch (error) {
      console.error('🎧 [Voice] Vibe execution failed:', error);
      toast({
        title: 'Could not apply changes',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      // 🔧 ARCHITECT FIX: Still mark as processed to avoid retry loops
      setLastProcessedLength(transcript.length);
    } finally {
      setIsExecutingCode(false);
    }
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
  
  // 🚀 STREAM 3: Trigger vibe coding when user finishes speaking (Oct 25, 2025)
  useEffect(() => {
    if (transcript.length > 0 && transcript.endsWith('.')) {
      // User finished a sentence - execute vibe coding
      executeVibeFromVoice();
    }
  }, [transcript]);

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
            {sessionState === 'idle' && '🎤 Click "Start" to begin voice conversation'}
            {sessionState === 'starting' && '⏳ Requesting microphone permission...'}
            {sessionState === 'active' && '💡 Tip: AI summarizes in real-time. Expand bullets for details.'}
            {sessionState === 'error' && '❌ Failed to start - try again'}
          </div>
          <div className="flex items-center gap-2">
            {/* 🎯 BATCH 1 FIX: Manual start button (Oct 26, 2025) */}
            {sessionState === 'idle' && (
              <Button
                onClick={() => {
                  console.log('🎤 [DEBUG] Start Voice button clicked!');
                  console.log('🎤 [DEBUG] Current sessionState:', sessionState);
                  console.log('🎤 [DEBUG] Realtime status:', realtimeStatus);
                  startSession();
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white"
                data-testid="button-start-voice"
              >
                <Headphones className="h-4 w-4 mr-2" />
                Start Voice Conversation
              </Button>
            )}
            {sessionState === 'starting' && (
              <Button
                disabled
                className="bg-gray-400 text-white"
                data-testid="button-starting-voice"
              >
                Starting...
              </Button>
            )}
            {sessionState === 'error' && (
              <Button
                onClick={startSession}
                variant="destructive"
                data-testid="button-retry-voice"
              >
                Retry
              </Button>
            )}
            {sessionState === 'active' && (
              <Button
                variant="destructive"
                onClick={onClose}
                data-testid="button-end-session"
              >
                End Session
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
