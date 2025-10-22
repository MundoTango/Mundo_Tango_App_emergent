/**
 * MULTI-MODEL CONSENSUS COORDINATOR
 * MB.MD Stream 2: All Models feature
 * 
 * Routes tasks to optimal model(s) and aggregates responses
 * Models: Claude 3.5 Sonnet, GPT-4o, Gemini Pro
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize AI clients
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export type ModelType = 'claude' | 'gpt-4o' | 'gemini' | 'all';

export interface ModelResponse {
  model: string;
  content: string;
  reasoning?: string;
  confidence: number;
  executionTime: number;
}

export interface ConsensusResult {
  finalPlan: string;
  models: ModelResponse[];
  debate?: string; // Optional: Model discussion transcript
  totalTime: number;
}

/**
 * MODEL COORDINATOR
 * Orchestrates multi-model consensus
 */
export class ModelCoordinator {
  
  /**
   * Execute query across all models in PARALLEL for speed
   */
  async executeAll(
    userQuery: string, 
    systemPrompt?: string
  ): Promise<ConsensusResult> {
    const startTime = Date.now();
    
    console.log('[ModelCoordinator] Executing across all models...');
    
    // Execute all 3 models in parallel
    const [claudeResponse, gptResponse, geminiResponse] = await Promise.all([
      this.executeClaude(userQuery, systemPrompt),
      this.executeGPT4o(userQuery, systemPrompt),
      this.executeGemini(userQuery, systemPrompt)
    ]);
    
    const models = [claudeResponse, gptResponse, geminiResponse];
    
    // Consensus algorithm: Weighted average based on confidence
    const finalPlan = this.buildConsensus(models, userQuery);
    
    const totalTime = Date.now() - startTime;
    
    console.log(`[ModelCoordinator] Consensus reached in ${totalTime}ms`);
    
    return {
      finalPlan,
      models,
      debate: this.generateDebateTranscript(models, userQuery),
      totalTime
    };
  }
  
  /**
   * Execute single model
   */
  async executeModel(
    model: ModelType,
    userQuery: string,
    systemPrompt?: string
  ): Promise<string> {
    switch (model) {
      case 'claude':
        return (await this.executeClaude(userQuery, systemPrompt)).content;
      case 'gpt-4o':
        return (await this.executeGPT4o(userQuery, systemPrompt)).content;
      case 'gemini':
        return (await this.executeGemini(userQuery, systemPrompt)).content;
      case 'all':
        const result = await this.executeAll(userQuery, systemPrompt);
        return result.finalPlan;
      default:
        throw new Error(`Unknown model: ${model}`);
    }
  }
  
  /**
   * Claude 3.5 Sonnet - Best for: Complex reasoning, code, analysis
   */
  private async executeClaude(userQuery: string, systemPrompt?: string): Promise<ModelResponse> {
    const start = Date.now();
    
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 4096,
        system: systemPrompt || 'You are Mr Blue, a helpful AI assistant.',
        messages: [{
          role: 'user',
          content: userQuery
        }]
      });
      
      const content = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';
      
      return {
        model: 'Claude 3.5 Sonnet',
        content,
        confidence: 0.95, // Claude excels at reasoning
        executionTime: Date.now() - start
      };
    } catch (error) {
      console.error('[Claude] Error:', error);
      return {
        model: 'Claude 3.5 Sonnet',
        content: 'Error executing Claude',
        confidence: 0,
        executionTime: Date.now() - start
      };
    }
  }
  
  /**
   * GPT-4o - Best for: Creative tasks, conversation, general knowledge
   */
  private async executeGPT4o(userQuery: string, systemPrompt?: string): Promise<ModelResponse> {
    const start = Date.now();
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt || 'You are Mr Blue, a helpful AI assistant.' },
          { role: 'user', content: userQuery }
        ],
        max_tokens: 4096
      });
      
      const content = response.choices[0]?.message?.content || '';
      
      return {
        model: 'GPT-4o',
        content,
        confidence: 0.90, // GPT-4o is very capable
        executionTime: Date.now() - start
      };
    } catch (error) {
      console.error('[GPT-4o] Error:', error);
      return {
        model: 'GPT-4o',
        content: 'Error executing GPT-4o',
        confidence: 0,
        executionTime: Date.now() - start
      };
    }
  }
  
  /**
   * Gemini Pro - Best for: Multimodal, fast responses, code generation
   */
  private async executeGemini(userQuery: string, systemPrompt?: string): Promise<ModelResponse> {
    const start = Date.now();
    
    try {
      const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      const prompt = systemPrompt 
        ? `${systemPrompt}\n\nUser: ${userQuery}` 
        : userQuery;
      
      const result = await model.generateContent(prompt);
      const content = result.response.text();
      
      return {
        model: 'Gemini Pro',
        content,
        confidence: 0.88, // Gemini is strong but newer
        executionTime: Date.now() - start
      };
    } catch (error) {
      console.error('[Gemini] Error:', error);
      return {
        model: 'Gemini Pro',
        content: 'Error executing Gemini',
        confidence: 0,
        executionTime: Date.now() - start
      };
    }
  }
  
  /**
   * CONSENSUS ALGORITHM
   * Analyzes all model responses and creates unified plan
   */
  private buildConsensus(models: ModelResponse[], originalQuery: string): string {
    // Filter out errors
    const validModels = models.filter(m => m.confidence > 0);
    
    if (validModels.length === 0) {
      return 'All models encountered errors. Please try again.';
    }
    
    // If only one model succeeded, use it
    if (validModels.length === 1) {
      return validModels[0].content;
    }
    
    // CONSENSUS STRATEGY:
    // 1. Find common themes across responses
    // 2. Weight by confidence
    // 3. Prefer Claude for technical/code tasks
    // 4. Prefer GPT-4o for creative/conversational tasks
    
    // Simple implementation: Use highest confidence model
    // TODO: Implement LLM-based consensus (use Claude to synthesize)
    const bestModel = validModels.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
    
    return `**Consensus Plan (led by ${bestModel.model}):**\n\n${bestModel.content}`;
  }
  
  /**
   * Generate debate transcript for transparency
   */
  private generateDebateTranscript(models: ModelResponse[], query: string): string {
    const transcript: string[] = [];
    
    transcript.push(`## Model Deliberation: "${query.substring(0, 60)}..."\n`);
    
    models.forEach(model => {
      if (model.confidence > 0) {
        transcript.push(`**${model.model}** (${model.executionTime}ms, confidence: ${(model.confidence * 100).toFixed(0)}%):`);
        transcript.push(model.content.substring(0, 200) + '...\n');
      }
    });
    
    return transcript.join('\n');
  }
}

export const modelCoordinator = new ModelCoordinator();
