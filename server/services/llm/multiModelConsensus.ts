/**
 * TRACK 4A: Multi-Model Consensus Engine
 * MB.MD Vibe Coding - 100% Plan
 * 
 * Features:
 * - 3-model voting: Claude 3.5 Sonnet, GPT-4o, Gemini Pro
 * - Arbiter breaks ties (Claude as default arbiter)
 * - Confidence scoring
 * - Cost tracking per model
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ConsensusRequest {
  prompt: string;
  models?: ('claude' | 'openai' | 'gemini')[];
  arbiter?: 'claude' | 'openai' | 'gemini';
  maxTokens?: number;
  requireUnanimous?: boolean;
}

export interface ModelResponse {
  model: string;
  response: string;
  confidence: number;
  tokensUsed: number;
  cost: number;
  latency: number;
}

export interface ConsensusResult {
  consensus: string;
  confidence: number;
  votes: ModelResponse[];
  arbiterUsed: boolean;
  totalCost: number;
  totalLatency: number;
  agreement: 'unanimous' | 'majority' | 'split';
}

export class MultiModelConsensus {
  private anthropic: Anthropic;
  private openai: OpenAI;
  private gemini: GoogleGenerativeAI;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.gemini = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY || ''
    );
  }

  /**
   * Get consensus from multiple models
   */
  async getConsensus(request: ConsensusRequest): Promise<ConsensusResult> {
    const {
      prompt,
      models = ['claude', 'openai', 'gemini'],
      arbiter = 'claude',
      maxTokens = 1000,
      requireUnanimous = false
    } = request;

    console.log(`[Consensus] 🗳️ Requesting consensus from ${models.length} models...`);
    const startTime = Date.now();

    // Step 1: Query all models in parallel
    const votes = await Promise.all(
      models.map(model => this.queryModel(model, prompt, maxTokens))
    );

    // Step 2: Analyze responses
    const analysis = this.analyzeVotes(votes);
    
    console.log(`[Consensus] 📊 Agreement: ${analysis.agreement}`);
    console.log(`[Consensus] 💰 Total cost: $${analysis.totalCost.toFixed(4)}`);

    // Step 3: Check if arbiter needed
    let arbiterUsed = false;
    let finalConsensus = analysis.consensus;
    let finalConfidence = analysis.confidence;

    if (analysis.agreement === 'split' || (requireUnanimous && analysis.agreement !== 'unanimous')) {
      console.log(`[Consensus] ⚖️ Calling arbiter (${arbiter})...`);
      
      const arbiterResponse = await this.queryArbiter(arbiter, prompt, votes, maxTokens);
      arbiterUsed = true;
      finalConsensus = arbiterResponse.response;
      finalConfidence = arbiterResponse.confidence;
      
      votes.push(arbiterResponse);
    }

    const totalLatency = Date.now() - startTime;

    return {
      consensus: finalConsensus,
      confidence: finalConfidence,
      votes,
      arbiterUsed,
      totalCost: votes.reduce((sum, v) => sum + v.cost, 0),
      totalLatency,
      agreement: analysis.agreement
    };
  }

  /**
   * Query a single model
   */
  private async queryModel(
    model: 'claude' | 'openai' | 'gemini',
    prompt: string,
    maxTokens: number
  ): Promise<ModelResponse> {
    const startTime = Date.now();

    try {
      let response: string;
      let tokensUsed: number;
      let cost: number;

      switch (model) {
        case 'claude':
          const claudeResponse = await this.anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: maxTokens,
            messages: [{ role: 'user', content: prompt }]
          });
          
          const claudeContent = claudeResponse.content[0];
          response = claudeContent.type === 'text' ? claudeContent.text : '';
          tokensUsed = claudeResponse.usage.input_tokens + claudeResponse.usage.output_tokens;
          cost = this.calculateCost('claude', claudeResponse.usage.input_tokens, claudeResponse.usage.output_tokens);
          break;

        case 'openai':
          const gptResponse = await this.openai.chat.completions.create({
            model: 'gpt-4o-2024-11-20',
            max_tokens: maxTokens,
            messages: [{ role: 'user', content: prompt }]
          });
          
          response = gptResponse.choices[0]?.message?.content || '';
          tokensUsed = gptResponse.usage?.total_tokens || 0;
          cost = this.calculateCost('openai', gptResponse.usage?.prompt_tokens || 0, gptResponse.usage?.completion_tokens || 0);
          break;

        case 'gemini':
          const geminiModel = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
          const geminiResponse = await geminiModel.generateContent(prompt);
          
          response = geminiResponse.response.text();
          tokensUsed = 0; // Gemini doesn't expose token counts
          cost = this.calculateCost('gemini', 500, 500); // Estimate
          break;

        default:
          throw new Error(`Unknown model: ${model}`);
      }

      const latency = Date.now() - startTime;

      return {
        model,
        response: response.trim(),
        confidence: this.calculateConfidence(response),
        tokensUsed,
        cost,
        latency
      };

    } catch (error) {
      console.error(`[Consensus] ❌ ${model} failed:`, error);
      return {
        model,
        response: '',
        confidence: 0,
        tokensUsed: 0,
        cost: 0,
        latency: Date.now() - startTime
      };
    }
  }

  /**
   * Query arbiter with context of other votes
   */
  private async queryArbiter(
    arbiter: 'claude' | 'openai' | 'gemini',
    originalPrompt: string,
    votes: ModelResponse[],
    maxTokens: number
  ): Promise<ModelResponse> {
    const arbiterPrompt = `You are an AI arbiter. Multiple models were asked the same question but gave different answers.

Original question:
${originalPrompt}

Model responses:
${votes.map((v, i) => `${i + 1}. ${v.model}: ${v.response.substring(0, 200)}${v.response.length > 200 ? '...' : ''}`).join('\n\n')}

Please provide the BEST answer, combining insights from all models. Be concise and accurate.`;

    return this.queryModel(arbiter, arbiterPrompt, maxTokens);
  }

  /**
   * Analyze votes to determine consensus
   */
  private analyzeVotes(votes: ModelResponse[]): {
    consensus: string;
    confidence: number;
    agreement: 'unanimous' | 'majority' | 'split';
    totalCost: number;
  } {
    // Simple similarity check (for demo - production would use embeddings)
    const responses = votes.map(v => v.response.toLowerCase().trim());
    
    // Check if all responses are very similar
    const firstResponse = responses[0];
    const allSimilar = responses.every(r => 
      this.calculateSimilarity(r, firstResponse) > 0.8
    );

    if (allSimilar) {
      return {
        consensus: votes[0].response,
        confidence: votes.reduce((sum, v) => sum + v.confidence, 0) / votes.length,
        agreement: 'unanimous',
        totalCost: votes.reduce((sum, v) => sum + v.cost, 0)
      };
    }

    // Check for majority (2 out of 3)
    const similarityMatrix = responses.map((r1, i) =>
      responses.map((r2, j) => i === j ? 1 : this.calculateSimilarity(r1, r2))
    );

    let bestResponse = votes[0];
    let maxSimilarity = 0;

    votes.forEach((vote, i) => {
      const avgSimilarity = similarityMatrix[i].reduce((sum, s) => sum + s, 0) / responses.length;
      if (avgSimilarity > maxSimilarity) {
        maxSimilarity = avgSimilarity;
        bestResponse = vote;
      }
    });

    return {
      consensus: bestResponse.response,
      confidence: bestResponse.confidence,
      agreement: maxSimilarity > 0.6 ? 'majority' : 'split',
      totalCost: votes.reduce((sum, v) => sum + v.cost, 0)
    };
  }

  /**
   * Calculate confidence score from response
   */
  private calculateConfidence(response: string): number {
    // Simple heuristic: longer responses with definitive language = higher confidence
    const length = response.length;
    const hasDefinitiveWords = /\b(definitely|certainly|clearly|obviously|sure)\b/i.test(response);
    const hasUncertainWords = /\b(maybe|perhaps|possibly|might|could)\b/i.test(response);

    let confidence = 0.5;
    
    if (length > 200) confidence += 0.2;
    if (hasDefinitiveWords) confidence += 0.2;
    if (hasUncertainWords) confidence -= 0.2;

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Calculate similarity between two responses (simple Jaccard)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Calculate cost per model
   */
  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'claude': { input: 3, output: 15 },
      'openai': { input: 2.5, output: 10 },
      'gemini': { input: 1.25, output: 5 }
    };

    const prices = pricing[model];
    if (!prices) return 0;

    return (
      (inputTokens * prices.input / 1_000_000) +
      (outputTokens * prices.output / 1_000_000)
    );
  }
}
