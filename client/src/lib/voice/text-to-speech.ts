// ESA LIFE CEO 61x21 - Text-to-Speech Service (Layer 47: Advanced AI Features)
import { toast } from "@/hooks/use-toast";

export interface TextToSpeechConfig {
  lang: string;
  voice?: SpeechSynthesisVoice;
  pitch: number;
  rate: number;
  volume: number;
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (error: any) => void;
}

export interface VoiceEmotion {
  type: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm' | 'urgent' | 'empathetic';
  intensity: number; // 0 to 1
}

export class TextToSpeechService {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private config: TextToSpeechConfig;
  private voices: SpeechSynthesisVoice[] = [];
  private voiceQueue: Array<{ text: string; config?: Partial<TextToSpeechConfig> }> = [];
  private currentLanguage: string = 'es-AR';

  // Voice preferences per language
  private preferredVoices: Record<string, string[]> = {
    'es-AR': ['Microsoft Sabina - Spanish (Argentina)', 'Google español de Argentina', 'Spanish (Argentina)'],
    'es-ES': ['Microsoft Laura - Spanish (Spain)', 'Google español', 'Spanish (Spain)'],
    'en-US': ['Microsoft Zira - English (United States)', 'Google US English', 'English (United States)'],
    'en-GB': ['Microsoft Hazel - English (Great Britain)', 'Google UK English Female', 'English (United Kingdom)'],
    'pt-BR': ['Microsoft Maria - Portuguese (Brazil)', 'Google português do Brasil', 'Portuguese (Brazil)'],
    'fr-FR': ['Microsoft Julie - French (France)', 'Google français', 'French (France)'],
    'it-IT': ['Microsoft Elsa - Italian (Italy)', 'Google italiano', 'Italian (Italy)'],
    'de-DE': ['Microsoft Katja - German (Germany)', 'Google Deutsch', 'German (Germany)'],
    'ru-RU': ['Microsoft Irina - Russian (Russia)', 'Google русский', 'Russian (Russia)'],
    'ja-JP': ['Microsoft Haruka - Japanese (Japan)', 'Google 日本語', 'Japanese (Japan)'],
    'ko-KR': ['Microsoft Heami - Korean (Korea)', 'Google 한국의', 'Korean (Korea)'],
    'zh-CN': ['Microsoft Huihui - Chinese (Simplified)', 'Google 普通话（中国大陆）', 'Chinese (China)']
  };

  // Emotion settings
  private emotionSettings: Record<VoiceEmotion['type'], { pitch: number; rate: number; volume: number }> = {
    neutral: { pitch: 1.0, rate: 1.0, volume: 1.0 },
    happy: { pitch: 1.2, rate: 1.1, volume: 1.0 },
    sad: { pitch: 0.9, rate: 0.9, volume: 0.8 },
    excited: { pitch: 1.3, rate: 1.2, volume: 1.1 },
    calm: { pitch: 0.95, rate: 0.85, volume: 0.9 },
    urgent: { pitch: 1.1, rate: 1.3, volume: 1.1 },
    empathetic: { pitch: 1.05, rate: 0.95, volume: 0.95 }
  };

  constructor(config: Partial<TextToSpeechConfig> = {}) {
    this.synthesis = window.speechSynthesis;
    
    this.config = {
      lang: 'es-AR',
      pitch: 1.0,
      rate: 1.0,
      volume: 1.0,
      ...config
    };

    if (!this.synthesis) {
      console.error('Text-to-speech not supported');
      toast({
        title: "Text-to-Speech Unavailable",
        description: "Your browser doesn't support voice synthesis.",
        variant: "destructive"
      });
      return;
    }

    this.loadVoices();
    
    // Handle voice list changes
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices();
    console.log(`🎤 Loaded ${this.voices.length} voices`);
    
    // Auto-select best voice for current language
    if (this.voices.length > 0 && !this.config.voice) {
      this.selectBestVoice(this.currentLanguage);
    }
  }

  private selectBestVoice(lang: string) {
    const preferred = this.preferredVoices[lang] || [];
    
    // Try to find preferred voice
    for (const voiceName of preferred) {
      const voice = this.voices.find(v => 
        v.name.includes(voiceName) || v.name === voiceName
      );
      if (voice) {
        this.config.voice = voice;
        console.log(`✅ Selected voice: ${voice.name}`);
        return;
      }
    }
    
    // Fallback to any voice with matching language
    const fallbackVoice = this.voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (fallbackVoice) {
      this.config.voice = fallbackVoice;
      console.log(`✅ Fallback voice: ${fallbackVoice.name}`);
      return;
    }
    
    // Use default voice
    if (this.voices.length > 0) {
      this.config.voice = this.voices[0];
      console.log(`⚠️ Using default voice: ${this.voices[0].name}`);
    }
  }

  public speak(text: string, options: Partial<TextToSpeechConfig> = {}, emotion?: VoiceEmotion) {
    if (!this.synthesis) {
      console.error('Speech synthesis not available');
      return Promise.reject('Speech synthesis not available');
    }

    return new Promise<void>((resolve, reject) => {
      // Cancel current speech if any
      if (this.isSpeaking) {
        this.synthesis.cancel();
      }

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Apply configuration
      const config = { ...this.config, ...options };
      
      // Apply emotion if provided
      if (emotion) {
        const emotionConfig = this.emotionSettings[emotion.type];
        config.pitch = emotionConfig.pitch * (1 + (emotion.intensity - 0.5) * 0.2);
        config.rate = emotionConfig.rate * (1 + (emotion.intensity - 0.5) * 0.2);
        config.volume = emotionConfig.volume;
      }

      utterance.lang = config.lang;
      utterance.pitch = config.pitch;
      utterance.rate = config.rate;
      utterance.volume = config.volume;
      
      if (config.voice) {
        utterance.voice = config.voice;
      }

      // Set up event handlers
      utterance.onstart = () => {
        this.isSpeaking = true;
        this.isPaused = false;
        config.onStart?.();
        console.log('🔊 Speaking:', text.substring(0, 50) + '...');
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
        config.onEnd?.();
        console.log('🔇 Finished speaking');
        
        // Process next in queue
        this.processQueue();
        resolve();
      };

      utterance.onpause = () => {
        this.isPaused = true;
        config.onPause?.();
        console.log('⏸️ Speech paused');
      };

      utterance.onresume = () => {
        this.isPaused = false;
        config.onResume?.();
        console.log('▶️ Speech resumed');
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
        
        console.error('Speech synthesis error:', event);
        config.onError?.(event);
        
        toast({
          title: "Speech Error",
          description: `Failed to speak: ${event.error}`,
          variant: "destructive"
        });
        
        reject(event);
      };

      // Speak the utterance
      this.synthesis.speak(utterance);
    });
  }

  public speakWithHighlight(text: string, onWordBoundary?: (word: string, charIndex: number) => void) {
    if (!this.synthesis) return Promise.reject('Speech synthesis not available');

    return new Promise<void>((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Apply configuration
      utterance.lang = this.config.lang;
      utterance.pitch = this.config.pitch;
      utterance.rate = this.config.rate;
      utterance.volume = this.config.volume;
      
      if (this.config.voice) {
        utterance.voice = this.config.voice;
      }

      // Word boundary event for highlighting
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const word = text.substring(event.charIndex, event.charIndex + event.charLength);
          onWordBoundary?.(word, event.charIndex);
        }
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        reject(event);
      };

      this.isSpeaking = true;
      this.synthesis.speak(utterance);
    });
  }

  public queueSpeak(text: string, config?: Partial<TextToSpeechConfig>) {
    this.voiceQueue.push({ text, config });
    
    if (!this.isSpeaking) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.voiceQueue.length === 0 || this.isSpeaking) {
      return;
    }

    const item = this.voiceQueue.shift();
    if (item) {
      try {
        await this.speak(item.text, item.config);
      } catch (error) {
        console.error('Failed to speak queued item:', error);
      }
    }
  }

  public pause() {
    if (this.synthesis && this.isSpeaking && !this.isPaused) {
      this.synthesis.pause();
    }
  }

  public resume() {
    if (this.synthesis && this.isPaused) {
      this.synthesis.resume();
    }
  }

  public stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.voiceQueue = [];
    }
  }

  public setLanguage(lang: string) {
    this.currentLanguage = lang;
    this.config.lang = lang;
    this.selectBestVoice(lang);
  }

  public setVoice(voiceIndex: number) {
    if (voiceIndex >= 0 && voiceIndex < this.voices.length) {
      this.config.voice = this.voices[voiceIndex];
    }
  }

  public setRate(rate: number) {
    this.config.rate = Math.max(0.1, Math.min(10, rate));
  }

  public setPitch(pitch: number) {
    this.config.pitch = Math.max(0, Math.min(2, pitch));
  }

  public setVolume(volume: number) {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public getVoicesForLanguage(lang: string): SpeechSynthesisVoice[] {
    return this.voices.filter(v => v.lang.startsWith(lang.split('-')[0]));
  }

  public getCurrentVoice(): SpeechSynthesisVoice | undefined {
    return this.config.voice;
  }

  public isSpeechAvailable(): boolean {
    return !!window.speechSynthesis;
  }

  public getSpeakingState(): boolean {
    return this.isSpeaking;
  }

  public getPausedState(): boolean {
    return this.isPaused;
  }

  // Agent-specific voice methods
  public async speakAsAgent(
    agentId: string, 
    text: string, 
    emotion?: VoiceEmotion
  ) {
    // Map agent personalities to voice characteristics
    const agentVoiceProfiles: Record<string, Partial<TextToSpeechConfig>> = {
      'health-advisor': { pitch: 1.0, rate: 0.95, volume: 0.9 },
      'career-coach': { pitch: 0.95, rate: 1.05, volume: 1.0 },
      'financial-advisor': { pitch: 0.9, rate: 1.0, volume: 0.95 },
      'relationship-counselor': { pitch: 1.05, rate: 0.9, volume: 0.85 },
      'education-mentor': { pitch: 1.1, rate: 0.95, volume: 0.95 },
      'productivity-optimizer': { pitch: 0.95, rate: 1.1, volume: 1.0 },
      'mindfulness-guide': { pitch: 1.0, rate: 0.85, volume: 0.8 },
      'creative-catalyst': { pitch: 1.15, rate: 1.05, volume: 1.0 },
      'travel-planner': { pitch: 1.05, rate: 1.0, volume: 0.95 },
      'home-organizer': { pitch: 1.0, rate: 0.95, volume: 0.9 },
      'nutrition-specialist': { pitch: 1.0, rate: 0.95, volume: 0.9 },
      'fitness-trainer': { pitch: 0.95, rate: 1.1, volume: 1.05 },
      'sleep-optimizer': { pitch: 0.95, rate: 0.8, volume: 0.75 },
      'habit-architect': { pitch: 1.0, rate: 0.95, volume: 0.95 },
      'emergency-advisor': { pitch: 0.9, rate: 1.15, volume: 1.1 },
      'life-strategist': { pitch: 1.0, rate: 0.9, volume: 0.9 }
    };

    const profile = agentVoiceProfiles[agentId] || {};
    return this.speak(text, profile, emotion);
  }

  public destroy() {
    this.stop();
    this.voices = [];
    this.voiceQueue = [];
  }
}

// Export singleton instance
export const textToSpeech = new TextToSpeechService();