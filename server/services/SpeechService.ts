// TRACK 3: Speech Service - Dual speech system (Web API + External fallback)
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class SpeechService {
  // Text-to-Speech using OpenAI (fallback for unsupported browsers)
  async synthesizeSpeech(text: string, voice: string = 'alloy'): Promise<Buffer> {
    try {
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
        input: text,
        speed: 1.0,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      return buffer;
    } catch (error) {
      console.error('[SpeechService] TTS error:', error);
      throw error;
    }
  }

  // Speech-to-Text using OpenAI Whisper
  async transcribeAudio(audioFile: Buffer, language?: string): Promise<string> {
    try {
      const file = new File([audioFile], 'audio.webm', { type: 'audio/webm' });
      
      const transcription = await openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        language: language,
        response_format: 'text',
      });

      return transcription as unknown as string;
    } catch (error) {
      console.error('[SpeechService] STT error:', error);
      throw error;
    }
  }

  // Get available voices for OpenAI TTS
  getAvailableVoices() {
    return [
      { id: 'alloy', name: 'Alloy', gender: 'neutral' },
      { id: 'echo', name: 'Echo', gender: 'male' },
      { id: 'fable', name: 'Fable', gender: 'neutral' },
      { id: 'onyx', name: 'Onyx', gender: 'male' },
      { id: 'nova', name: 'Nova', gender: 'female' },
      { id: 'shimmer', name: 'Shimmer', gender: 'female' },
    ];
  }

  // Validate audio format
  isValidAudioFormat(mimeType: string): boolean {
    const supportedFormats = [
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
    ];
    return supportedFormats.includes(mimeType);
  }
}

export const speechService = new SpeechService();
