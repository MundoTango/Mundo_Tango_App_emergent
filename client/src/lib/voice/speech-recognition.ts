// ESA LIFE CEO 61x21 - Voice Recognition System (Layer 47: Advanced AI Features)
import { toast } from "@/hooks/use-toast";

export interface SpeechRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onResult?: (transcript: string, confidence: number) => void;
  onError?: (error: any) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onNoMatch?: () => void;
}

export interface VoiceCommand {
  command: string;
  patterns: string[];
  action: (params?: any) => void;
  category: string;
  requiresConfirmation?: boolean;
}

export class VoiceRecognitionService {
  private recognition: any = null;
  private isListening: boolean = false;
  private config: SpeechRecognitionConfig;
  private commands: VoiceCommand[] = [];
  private audioContext: AudioContext | null = null;
  private noiseGate: GainNode | null = null;
  private currentLanguage: string = 'es-AR'; // Default to Spanish (Argentina)

  // Supported languages for Mundo Tango
  private supportedLanguages = {
    'es-AR': 'Español (Argentina)',
    'es-ES': 'Español (España)',
    'en-US': 'English (US)',
    'en-GB': 'English (UK)',
    'pt-BR': 'Português (Brasil)',
    'fr-FR': 'Français',
    'it-IT': 'Italiano',
    'de-DE': 'Deutsch',
    'ru-RU': 'Русский',
    'ja-JP': '日本語',
    'ko-KR': '한국어',
    'zh-CN': '中文 (简体)'
  };

  constructor(config: Partial<SpeechRecognitionConfig> = {}) {
    this.config = {
      language: 'es-AR',
      continuous: true,
      interimResults: true,
      maxAlternatives: 3,
      ...config
    };

    this.initializeRecognition();
    this.initializeAudioProcessing();
    this.registerDefaultCommands();
  }

  private initializeRecognition() {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || 
                             (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      toast({
        title: "Voice Recognition Unavailable",
        description: "Your browser doesn't support voice commands. Try Chrome or Edge.",
        variant: "destructive"
      });
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.config.language;
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    // Set up event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      this.config.onStart?.();
      console.log('🎤 Voice recognition started');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.config.onEnd?.();
      console.log('🔇 Voice recognition ended');
      
      // Auto-restart if continuous mode
      if (this.config.continuous && this.isListening) {
        setTimeout(() => this.start(), 100);
      }
    };

    this.recognition.onresult = (event: any) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      
      if (lastResult) {
        const transcript = lastResult[0].transcript;
        const confidence = lastResult[0].confidence || 0.9;
        const isFinal = lastResult.isFinal;

        console.log(`📝 Transcript: "${transcript}" (confidence: ${(confidence * 100).toFixed(1)}%)`);

        // Process commands if final result
        if (isFinal) {
          this.processCommand(transcript, confidence);
        }

        // Call user callback
        this.config.onResult?.(transcript, confidence);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      const errorMessages: Record<string, string> = {
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'Microphone not found. Please check your settings.',
        'not-allowed': 'Microphone permission denied. Please allow access.',
        'network': 'Network error. Please check your connection.',
        'aborted': 'Voice recognition was cancelled.',
        'language-not-supported': 'Language not supported. Switching to English.'
      };

      const message = errorMessages[event.error] || `Voice error: ${event.error}`;
      
      toast({
        title: "Voice Recognition Error",
        description: message,
        variant: "destructive"
      });

      this.config.onError?.(event);
      this.isListening = false;
    };

    this.recognition.onnomatch = () => {
      console.log('No speech match found');
      this.config.onNoMatch?.();
    };

    // Handle speech detection
    this.recognition.onspeechstart = () => {
      console.log('🗣️ Speech detected');
    };

    this.recognition.onspeechend = () => {
      console.log('🤐 Speech ended');
    };
  }

  private initializeAudioProcessing() {
    // Set up audio context for noise cancellation
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a gain node for noise gating
      this.noiseGate = this.audioContext.createGain();
      this.noiseGate.gain.value = 1.0;

      // Set up noise reduction parameters
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100
          } 
        }).then(stream => {
          const source = this.audioContext!.createMediaStreamSource(stream);
          const analyser = this.audioContext!.createAnalyser();
          
          source.connect(analyser);
          analyser.fftSize = 256;
          
          // Monitor audio levels for voice activity detection
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          
          const checkAudioLevel = () => {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            
            // Adjust noise gate based on audio level
            if (average > 30) { // Voice detected threshold
              this.noiseGate!.gain.exponentialRampToValueAtTime(
                1.0, 
                this.audioContext!.currentTime + 0.1
              );
            } else {
              this.noiseGate!.gain.exponentialRampToValueAtTime(
                0.1, 
                this.audioContext!.currentTime + 0.1
              );
            }
            
            if (this.isListening) {
              requestAnimationFrame(checkAudioLevel);
            }
          };

          if (this.isListening) {
            checkAudioLevel();
          }
        }).catch(err => {
          console.error('Error accessing microphone:', err);
        });
      }
    } catch (err) {
      console.error('Error initializing audio processing:', err);
    }
  }

  private registerDefaultCommands() {
    // Navigation commands
    this.registerCommand({
      command: 'go to events',
      patterns: ['ir a eventos', 'go to events', 'show events', 'mostrar eventos'],
      action: () => window.location.href = '/events',
      category: 'navigation'
    });

    this.registerCommand({
      command: 'go to profile',
      patterns: ['ir a perfil', 'go to profile', 'show profile', 'mostrar perfil', 'mi perfil', 'my profile'],
      action: () => window.location.href = '/profile',
      category: 'navigation'
    });

    this.registerCommand({
      command: 'go home',
      patterns: ['ir a inicio', 'go home', 'inicio', 'home', 'volver al inicio'],
      action: () => window.location.href = '/',
      category: 'navigation'
    });

    // Action commands
    this.registerCommand({
      command: 'create post',
      patterns: ['crear publicación', 'create post', 'new post', 'nueva publicación', 'publicar'],
      action: () => {
        const event = new CustomEvent('voice-create-post');
        window.dispatchEvent(event);
      },
      category: 'action'
    });

    this.registerCommand({
      command: 'search',
      patterns: ['buscar', 'search', 'find', 'encontrar'],
      action: () => {
        const event = new CustomEvent('voice-search');
        window.dispatchEvent(event);
      },
      category: 'action'
    });

    // Agent commands
    this.registerCommand({
      command: 'call agent',
      patterns: ['llamar agente', 'call agent', 'help', 'ayuda', 'asistente', 'assistant'],
      action: () => {
        const event = new CustomEvent('voice-call-agent');
        window.dispatchEvent(event);
      },
      category: 'agent'
    });

    // Settings commands
    this.registerCommand({
      command: 'stop listening',
      patterns: ['parar de escuchar', 'stop listening', 'detener', 'stop', 'silencio'],
      action: () => this.stop(),
      category: 'control'
    });

    this.registerCommand({
      command: 'change language',
      patterns: ['cambiar idioma', 'change language', 'switch language', 'otro idioma'],
      action: () => {
        const event = new CustomEvent('voice-change-language');
        window.dispatchEvent(event);
      },
      category: 'settings'
    });
  }

  public registerCommand(command: VoiceCommand) {
    this.commands.push(command);
  }

  private processCommand(transcript: string, confidence: number) {
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    // Find matching command
    for (const command of this.commands) {
      for (const pattern of command.patterns) {
        if (normalizedTranscript.includes(pattern.toLowerCase())) {
          console.log(`✅ Command matched: ${command.command}`);
          
          // Check if confirmation is required
          if (command.requiresConfirmation && confidence < 0.8) {
            this.requestConfirmation(command, transcript);
            return;
          }
          
          // Execute command
          command.action({ transcript, confidence });
          
          // Provide feedback
          toast({
            title: "Voice Command",
            description: `Executing: ${command.command}`,
          });
          
          return;
        }
      }
    }
    
    // No command matched - send to AI agent
    console.log('No command matched, sending to AI agent...');
    const event = new CustomEvent('voice-unmatched-command', { 
      detail: { transcript, confidence } 
    });
    window.dispatchEvent(event);
  }

  private requestConfirmation(command: VoiceCommand, transcript: string) {
    toast({
      title: "Confirm Command",
      description: `Did you mean to: ${command.command}?`,
      action: (
        <div className="flex gap-2">
          <button 
            onClick={() => command.action({ transcript })}
            className="px-3 py-1 bg-ocean-500 text-white rounded"
          >
            Yes
          </button>
          <button 
            className="px-3 py-1 bg-gray-500 text-white rounded"
          >
            No
          </button>
        </div>
      ) as any
    });
  }

  public start() {
    if (!this.recognition) {
      console.error('Speech recognition not initialized');
      return;
    }

    if (this.isListening) {
      console.log('Already listening');
      return;
    }

    try {
      this.recognition.start();
      toast({
        title: "🎤 Listening",
        description: "Voice commands activated",
      });
    } catch (err) {
      console.error('Failed to start recognition:', err);
      toast({
        title: "Voice Error",
        description: "Failed to start voice recognition",
        variant: "destructive"
      });
    }
  }

  public stop() {
    if (!this.recognition || !this.isListening) {
      return;
    }

    try {
      this.recognition.stop();
      this.isListening = false;
      toast({
        title: "🔇 Stopped",
        description: "Voice commands deactivated",
      });
    } catch (err) {
      console.error('Failed to stop recognition:', err);
    }
  }

  public setLanguage(languageCode: string) {
    if (!this.supportedLanguages[languageCode as keyof typeof this.supportedLanguages]) {
      console.error(`Language ${languageCode} not supported`);
      return;
    }

    this.currentLanguage = languageCode;
    this.config.language = languageCode;
    
    if (this.recognition) {
      this.recognition.lang = languageCode;
      
      // Restart if currently listening
      if (this.isListening) {
        this.stop();
        setTimeout(() => this.start(), 100);
      }
    }

    toast({
      title: "Language Changed",
      description: `Voice language set to ${this.supportedLanguages[languageCode as keyof typeof this.supportedLanguages]}`,
    });
  }

  public getSupportedLanguages() {
    return this.supportedLanguages;
  }

  public isAvailable(): boolean {
    return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  }

  public getListeningState(): boolean {
    return this.isListening;
  }

  public destroy() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.commands = [];
    this.recognition = null;
  }
}

// Export singleton instance
export const voiceRecognition = new VoiceRecognitionService();