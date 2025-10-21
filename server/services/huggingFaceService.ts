/**
 * Hugging Face Integration Service
 * Vision, Speech, Embeddings, Sentiment Analysis
 * MB.MD Track 6: HuggingFace Models - Oct 21, 2025
 */

import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_TOKEN);

export class HuggingFaceService {
  /**
   * Image Analysis (Vision)
   */
  async analyzeImage(imageUrl: string): Promise<{ labels: Array<{ label: string; score: number }> }> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const result = await hf.imageClassification({
        data: blob,
        model: 'google/vit-base-patch16-224',
      });

      return {
        labels: result.map(r => ({
          label: r.label,
          score: r.score,
        })),
      };
    } catch (error) {
      console.error('[HF] Image analysis error:', error);
      throw error;
    }
  }

  /**
   * Generate Text Embeddings for semantic search
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await hf.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: text,
      });

      return Array.isArray(result) ? result : [result];
    } catch (error) {
      console.error('[HF] Embedding generation error:', error);
      throw error;
    }
  }

  /**
   * Sentiment Analysis
   */
  async analyzeSentiment(text: string): Promise<{ label: string; score: number }> {
    try {
      const result = await hf.textClassification({
        model: 'distilbert-base-uncased-finetuned-sst-2-english',
        inputs: text,
      });

      return result[0];
    } catch (error) {
      console.error('[HF] Sentiment analysis error:', error);
      throw error;
    }
  }

  /**
   * Speech-to-Text (Whisper)
   */
  async transcribeAudio(audioBlob: Blob): Promise<{ text: string }> {
    try {
      const result = await hf.automaticSpeechRecognition({
        model: 'openai/whisper-large-v3',
        data: audioBlob,
      });

      return { text: result.text };
    } catch (error) {
      console.error('[HF] Speech transcription error:', error);
      throw error;
    }
  }

  /**
   * Text-to-Speech
   */
  async synthesizeSpeech(text: string): Promise<Blob> {
    try {
      const result = await hf.textToSpeech({
        model: 'facebook/mms-tts-eng',
        inputs: text,
      });

      return result;
    } catch (error) {
      console.error('[HF] Speech synthesis error:', error);
      throw error;
    }
  }

  /**
   * Content Moderation
   */
  async moderateContent(text: string): Promise<{ toxic: boolean; score: number }> {
    try {
      const result = await hf.textClassification({
        model: 'unitary/toxic-bert',
        inputs: text,
      });

      const toxicResult = result.find(r => r.label === 'toxic');
      return {
        toxic: (toxicResult?.score || 0) > 0.5,
        score: toxicResult?.score || 0,
      };
    } catch (error) {
      console.error('[HF] Content moderation error:', error);
      return { toxic: false, score: 0 };
    }
  }

  /**
   * Auto-Tagging for posts/events
   */
  async generateTags(text: string): Promise<string[]> {
    try {
      const result = await hf.zeroShotClassification({
        model: 'facebook/bart-large-mnli',
        inputs: text,
        parameters: {
          candidate_labels: [
            'tango',
            'milonga',
            'music',
            'dance',
            'event',
            'social',
            'lesson',
            'performance',
            'festival',
            'community',
          ],
        },
      });

      return result.labels.filter((_, i) => result.scores[i] > 0.3);
    } catch (error) {
      console.error('[HF] Tag generation error:', error);
      return [];
    }
  }
}

export const huggingFaceService = new HuggingFaceService();
