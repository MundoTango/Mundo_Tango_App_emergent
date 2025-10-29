// TRACK 3: Voice Output Hook - Text-to-Speech
import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

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

  const isSupported = 'speechSynthesis' in window;

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

  const speak = useCallback((text: string, customOptions?: Partial<UseVoiceOutputOptions>) => {
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
    const finalOptions = { ...options, ...customOptions };

    utterance.lang = finalOptions.language || 'en-US';
    utterance.rate = finalOptions.rate ?? 1.0;
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
  }, [isSupported, options, toast]);

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

  const cancel = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  const getVoicesByLanguage = useCallback((language: string) => {
    return voices.filter(voice => voice.lang.startsWith(language));
  }, [voices]);

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
  };
}
