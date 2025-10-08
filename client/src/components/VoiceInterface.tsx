// ESA LIFE CEO 61x21 - Voice Interface Component (Layer 47: Advanced AI Features)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Languages,
  Settings,
  X,
  ChevronDown,
  Bot,
  Loader2
} from 'lucide-react';
import { voiceRecognition } from '@/lib/voice/speech-recognition';
import { textToSpeech } from '@/lib/voice/text-to-speech';
import { voiceCommandParser } from '@/lib/voice/voice-commands';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface VoiceInterfaceProps {
  agentId?: string;
  onCommand?: (command: any) => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  autoStart?: boolean;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  agentId,
  onCommand,
  className,
  position = 'bottom-right',
  autoStart = false
}) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('es-AR');
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    autoSpeak: true,
    continuousListening: false,
    soundEffects: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null data-testid="link-element">(null);
  const analyserRef = useRef<AnalyserNode | null data-testid="link-element">(null);
  const animationFrameRef = useRef<number>();

  const supportedLanguages = {
    'es-AR': { name: 'Español (Argentina)', flag: '🇦🇷' },
    'es-ES': { name: 'Español (España)', flag: '🇪🇸' },
    'en-US': { name: 'English (US)', flag: '🇺🇸' },
    'en-GB': { name: 'English (UK)', flag: '🇬🇧' },
    'pt-BR': { name: 'Português (Brasil)', flag: '🇧🇷' },
    'fr-FR': { name: 'Français', flag: '🇫🇷' },
    'it-IT': { name: 'Italiano', flag: '🇮🇹' },
    'de-DE': { name: 'Deutsch', flag: '🇩🇪' }
  };

  // Initialize audio visualization
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          analyserRef.current = audioContextRef.current.createAnalyser();
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
          analyserRef.current.fftSize = 256;
        })
        .catch(err => console.log('Audio visualization not available:', err));
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Monitor voice level
  const monitorVoiceLevel = useCallback(() => {
    if (!analyserRef.current || !isListening) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setVoiceLevel(average / 255);

    animationFrameRef.current = requestAnimationFrame(monitorVoiceLevel);
  }, [isListening]);

  useEffect(() => {
    if (isListening) {
      monitorVoiceLevel();
    } else {
      setVoiceLevel(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [isListening, monitorVoiceLevel]);

  // Initialize voice services
  useEffect(() => {
    // Set up voice recognition callbacks
    voiceRecognition.config.onResult = (text, confidence) => {
      if (confidence > 0.8) {
        setTranscript(text);
        setInterimTranscript('');
      } else {
        setInterimTranscript(text);
      }
    };

    voiceRecognition.config.onStart = () => {
      setIsListening(true);
      playSound('start');
    };

    voiceRecognition.config.onEnd = () => {
      setIsListening(false);
      playSound('stop');
    };

    voiceRecognition.config.onError = (error) => {
      setIsListening(false);
      toast({
        title: "Voice Error",
        description: "Failed to process voice input",
        variant: "destructive"
      });
    };

    // Set up text-to-speech callbacks
    textToSpeech.config.onStart = () => {
      setIsSpeaking(true);
    };

    textToSpeech.config.onEnd = () => {
      setIsSpeaking(false);
    };

    // Set initial language
    voiceRecognition.setLanguage(selectedLanguage);
    textToSpeech.setLanguage(selectedLanguage);

    // Auto-start if requested
    if (autoStart && voiceRecognition.isAvailable()) {
      setTimeout(() => toggleListening(), 1000);
    }

    // Listen for voice command events
    const handleVoiceCommand = (event: CustomEvent) => {
      processCommand(event.detail.transcript);
    };

    const handleUnmatchedCommand = (event: CustomEvent) => {
      sendToAgent(event.detail.transcript);
    };

    window.addEventListener('voice-unmatched-command', handleUnmatchedCommand as any);
    window.addEventListener('voice-action', handleVoiceCommand as any);

    return () => {
      window.removeEventListener('voice-unmatched-command', handleUnmatchedCommand as any);
      window.removeEventListener('voice-action', handleVoiceCommand as any);
      voiceRecognition.stop();
      textToSpeech.stop();
    };
  }, []);

  const playSound = (type: 'start' | 'stop' | 'success' | 'error') => {
    if (!voiceSettings.soundEffects) return;
    
    // Play system sounds (you can replace with actual audio files)
    const audio = new Audio();
    const sounds = {
      start: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAR...',
      stop: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAR...',
      success: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAR...',
      error: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAR...'
    };
    
    // Use a simple beep for now
    const oscillator = audioContextRef.current?.createOscillator();
    const gainNode = audioContextRef.current?.createGain();
    
    if (oscillator && gainNode && audioContextRef.current) {
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      const frequencies = {
        start: 800,
        stop: 400,
        success: 1000,
        error: 200
      };
      
      oscillator.frequency.value = frequencies[type];
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.1);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      voiceRecognition.stop();
    } else {
      voiceRecognition.start();
    }
  };

  const processCommand = async (text: string) => {
    setIsProcessing(true);
    
    try {
      const parsed = voiceCommandParser.parse(text, selectedLanguage);
      console.log('Parsed command:', parsed);
      
      // Execute command
      if (parsed.intent !== 'unknown') {
        playSound('success');
        onCommand?.(parsed);
        
        // Speak confirmation if enabled
        if (voiceSettings.autoSpeak) {
          const confirmations = {
            'navigate': `Navigating to ${parsed.entities.destination || 'location'}`,
            'create': `Creating ${parsed.entities.type || 'item'}`,
            'search': `Searching for ${parsed.entities.query || 'content'}`,
            'agent': 'Calling AI assistant',
            'query': 'Processing your query'
          };
          
          const message = confirmations[parsed.intent] || 'Command executed';
          await speakResponse(message);
        }
      } else {
        // Send to AI agent
        await sendToAgent(text);
      }
    } catch (error) {
      console.error('Command processing error:', error);
      playSound('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const sendToAgent = async (text: string) => {
    setIsProcessing(true);
    
    try {
      // Send to AI agent API
      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: text,
          agentId: agentId || 'life-strategist',
          language: selectedLanguage,
          context: {
            timestamp: new Date().toISOString(),
            source: 'voice'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Speak the response
        if (voiceSettings.autoSpeak && data.response) {
          await speakResponse(data.response, data.emotion);
        }
        
        // Show in UI
        toast({
          title: "AI Response",
          description: data.response,
        });
      }
    } catch (error) {
      console.error('Agent processing error:', error);
      playSound('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = async (text: string, emotion?: any) => {
    await textToSpeech.speak(text, {
      rate: voiceSettings.rate,
      pitch: voiceSettings.pitch,
      volume: voiceSettings.volume
    }, emotion);
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    voiceRecognition.setLanguage(lang);
    textToSpeech.setLanguage(lang);
    
    toast({
      title: "Language Changed",
      description: `Voice interface set to ${supportedLanguages[lang as keyof typeof supportedLanguages].name}`,
    });
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4'
  };

  return (
    <>
      {/* Main Voice Button */}
      <motion.div
        className={cn(
          'fixed z-50',
          positionClasses[position],
          className
        )}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        <AnimatePresence data-testid="link-element">
          {isExpanded ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 w-80"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-ocean-500" />
                  <span className="font-semibold">Voice Assistant</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() = data-testid="button-element"> setIsExpanded(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Transcript Display */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-4 min-h-[100px]">
                {isProcessing ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-5 h-5 animate-spin text-ocean-500" />
                  </div>
                ) : (
                  <div>
                    {transcript && (
                      <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                        {transcript}
                      </p>
                    )}
                    {interimTranscript && (
                      <p className="text-sm text-gray-400 italic">
                        {interimTranscript}
                      </p>
                    )}
                    {!transcript && !interimTranscript && (
                      <p className="text-sm text-gray-400 italic">
                        {isListening ? 'Listening...' : 'Click the microphone to start'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Voice Level Indicator */}
              {isListening && (
                <div className="mb-4">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-teal-400 to-teal-600"
                      animate={{ width: `${voiceLevel * 100}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-2">
                <Button
                  variant={isListening ? "default" : "outline"}
                  size="icon"
                  onClick={toggleListening}
                  disabled={isProcessing}
                  className={cn(
                    isListening && "bg-red-500 hover:bg-red-600"
                  )}
                 data-testid="button-element">
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() = data-testid="button-element"> textToSpeech.stop()}
                  disabled={!isSpeaking}
                >
                  {isSpeaking ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" data-testid="button-element">
                      <Languages className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Object.entries(supportedLanguages).map(([code, lang]) => (
                      <DropdownMenuItem
                        key={code}
                        onClick={() => handleLanguageChange(code)}
                        className={cn(
                          selectedLanguage === code && "bg-gray-100 dark:bg-gray-800"
                        )}
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() = data-testid="button-element"> setShowSettings(true)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(true)}
              className={cn(
                "relative w-14 h-14 rounded-full shadow-lg",
                "bg-gradient-to-br from-teal-400 to-teal-600",
                "flex items-center justify-center",
                "hover:shadow-xl transition-shadow",
                isListening && "animate-pulse"
              )}
            >
              {isListening ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
              
              {/* Status indicator */}
              {isListening && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voice Settings</DialogTitle>
            <DialogDescription>
              Customize your voice interaction experience
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Speech Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Speech Settings</h3>
              
              <div className="space-y-2">
                <Label htmlFor="rate">Speed: {voiceSettings.rate.toFixed(1)}x</Label>
                <Slider
                  id="rate"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[voiceSettings.rate]}
                  onValueChange={([value]) => {
                    setVoiceSettings(prev => ({ ...prev, rate: value }));
                    textToSpeech.setRate(value);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pitch">Pitch: {voiceSettings.pitch.toFixed(1)}</Label>
                <Slider
                  id="pitch"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[voiceSettings.pitch]}
                  onValueChange={([value]) => {
                    setVoiceSettings(prev => ({ ...prev, pitch: value }));
                    textToSpeech.setPitch(value);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volume">Volume: {Math.round(voiceSettings.volume * 100)}%</Label>
                <Slider
                  id="volume"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[voiceSettings.volume]}
                  onValueChange={([value]) => {
                    setVoiceSettings(prev => ({ ...prev, volume: value }));
                    textToSpeech.setVolume(value);
                  }}
                />
              </div>
            </div>

            {/* Behavior Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Behavior</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-speak">Auto-speak responses</Label>
                <Switch
                  id="auto-speak"
                  checked={voiceSettings.autoSpeak}
                  onCheckedChange={(checked) => 
                    setVoiceSettings(prev => ({ ...prev, autoSpeak: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="continuous">Continuous listening</Label>
                <Switch
                  id="continuous"
                  checked={voiceSettings.continuousListening}
                  onCheckedChange={(checked) => 
                    setVoiceSettings(prev => ({ ...prev, continuousListening: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sounds">Sound effects</Label>
                <Switch
                  id="sounds"
                  checked={voiceSettings.soundEffects}
                  onCheckedChange={(checked) => 
                    setVoiceSettings(prev => ({ ...prev, soundEffects: checked }))
                  }
                />
              </div>
            </div>

            {/* Test Voice */}
            <div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() = data-testid="button-w-full"> speakResponse("Hello! This is a test of the voice settings.")}
              >
                Test Voice Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VoiceInterface;