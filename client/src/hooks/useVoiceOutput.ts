// TRACK 3: Voice Output Hook - Text-to-Speech
// Updated Oct 22, 2025: Added OpenAI TTS support for professional voices
import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface VoiceSettings {
  voice: string; // OpenAI voice: 'nova', 'alloy', 'echo', 'fable', 'onyx', 'shimmer'
  usePremium: boolean; // true = OpenAI TTS, false = browser fallback
  speed: number;
}

interface UseVoiceOutputOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useVoiceOutput(options: UseVoiceOutputOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  // Voice settings for OpenAI TTS
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mrBlue_voiceSettings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Invalid JSON, use defaults
        }
      }
    }
    return {
      voice: 'nova',
      usePremium: true, // Default to OpenAI TTS
      speed: 1.0,
    };
  });

  const isSupported = 'speechSynthesis' in window;

  // Persist settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mrBlue_voiceSettings', JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  // Speak using OpenAI TTS (PREMIUM)
  const speakWithOpenAI = useCallback(async (text: string) => {
    try {
      setIsSpeaking(true);
      options.onStart?.();
      
      console.log('[Voice] Using OpenAI TTS:', { text: text.slice(0, 50), voice: settings.voice });
      
      const response = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: settings.voice,
          model: 'tts-1-hd',
        }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || 'TTS failed');
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        options.onEnd?.();
        console.log('[Voice] OpenAI TTS playback complete');
      };
      
      audio.onerror = (e) => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        options.onError?.('Audio playback error');
        console.error('[Voice] Audio playback error:', e);
      };
      
      await audio.play();
      console.log('[Voice] OpenAI TTS playing...');
      
    } catch (error) {
      console.error('[Voice] OpenAI TTS error:', error);
      setIsSpeaking(false);
      options.onError?.(error instanceof Error ? error.message : 'TTS error');
      
      // Fallback to browser TTS
      console.log('[Voice] Falling back to browser TTS');
      speakWithBrowser(text);
    }
  }, [settings.voice, options]);

  // Speak using browser (FALLBACK or when premium disabled)
  const speakWithBrowser = useCallback((text: string) => {
    if (!isSupported) {
      toast({
        title: 'Not Supported',
        description: 'Text-to-speech is not supported in your browser',
        variant: 'destructive',
      });
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const finalOptions = options;

    utterance.lang = finalOptions.language || 'en-US';
    utterance.rate = settings.speed;
    utterance.pitch = finalOptions.pitch ?? 1.0;
    utterance.volume = finalOptions.volume ?? 1.0;

    if (finalOptions.voice) {
      utterance.voice = finalOptions.voice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      finalOptions.onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      finalOptions.onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('[VoiceOutput] Error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
      
      const errorMessage = 'Speech synthesis error occurred';
      finalOptions.onError?.(errorMessage);
      toast({
        title: 'Speech Error',
        description: errorMessage,
        variant: 'destructive',
      });
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, options, settings.speed, toast]);

  const cancel = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  // Main speak function - chooses OpenAI or browser
  const speak = useCallback((text: string, customOptions?: Partial<UseVoiceOutputOptions>) => {
    if (!text || text.trim().length === 0) {
      console.warn('[Voice] Empty text, skipping');
      return;
    }

    // Stop any current speech
    cancel();

    // Use premium or fallback
    if (settings.usePremium) {
      speakWithOpenAI(text);
    } else {
      speakWithBrowser(text);
    }
  }, [settings.usePremium, speakWithOpenAI, speakWithBrowser, cancel]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
    }
  }, [isSupported, isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (isSupported && isSpeaking && isPaused) {
      window.speechSynthesis.resume();
    }
  }, [isSupported, isSpeaking, isPaused]);

  const getVoicesByLanguage = useCallback((language: string) => {
    return voices.filter(voice => voice.lang.startsWith(language));
  }, [voices]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      console.log('[Voice] Settings updated:', updated);
      return updated;
    });
  }, []);

  return {
    isSpeaking,
    isPaused,
    voices,
    isSupported,
    speak,
    pause,
    resume,
    cancel,
    getVoicesByLanguage,
    // New OpenAI TTS features
    settings,
    updateSettings,
    stop: cancel, // Alias for cancel
  };
}
