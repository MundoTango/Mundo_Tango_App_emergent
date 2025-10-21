// TRACK 2: Speech Recognition Hook - Voice Input
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  
  // Check browser support
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  
  useEffect(() => {
    if (!isSupported) return;
    
    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = options.interimResults ?? false;
    recognition.lang = options.lang || 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcriptText + ' ';
        } else {
          interimTranscript += transcriptText;
        }
      }
      
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        options.onResult?.(finalTranscript.trim());
      }
      
      if (options.interimResults) {
        setInterimTranscript(interimTranscript);
      }
    };
    
    recognition.onerror = (event: any) => {
      const errorMessage = event.error || 'Unknown error';
      setError(errorMessage);
      setIsListening(false);
      options.onError?.(errorMessage);
    };
    
    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSupported, options.continuous, options.interimResults, options.lang]);
  
  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Speech recognition not supported in this browser');
      return;
    }
    
    if (!recognitionRef.current) return;
    
    try {
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      recognitionRef.current.start();
    } catch (err: any) {
      setError(err.message || 'Failed to start speech recognition');
    }
  }, [isSupported]);
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);
  
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);
  
  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
