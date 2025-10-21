/**
 * Multi-AI Consensus Engine
 * All models debate, compare, and reach consensus
 * MB.MD Track 3 - Multi-AI Collaboration
 */

import { multiModelOrchestrator } from './multiModelOrchestrator';

export interface ModelResponse {
  model: string;
  approach: string;
  reasoning: string;
  solution: string;
  confidence: number;
}

export interface ConsensusResult {
  finalAnswer: string;
  confidence: number;
  modelContributions: ModelResponse[];
  debateLog: string[];
  consensusReasoning: string;
}

export class ConsensusEngine {
  /**
   * All models answer, debate, and reach consensus
   */
  async queryWithConsensus(
    question: string,
    models: string[] = ['gpt-4o', 'claude-3-sonnet', 'gemini-pro']
  ): Promise<ConsensusResult> {
    console.log(`[Consensus] Starting multi-model query with ${models.length} models`);
    
    // Phase 1: Get initial responses from all models
    const initialResponses = await this.getInitialResponses(question, models);
    
    // Phase 2: Models debate and compare approaches
    const debateLog = await this.conductDebate(question, initialResponses);
    
    // Phase 3: Synthesize consensus
    const consensus = await this.synthesizeConsensus(initialResponses, debateLog);
    
    return consensus;
  }

  /**
   * Phase 1: Get initial responses from all models
   */
  private async getInitialResponses(
    question: string,
    models: string[]
  ): Promise<ModelResponse[]> {
    const messages = [
      { role: 'system', content: 'You are an AI assistant analyzing a problem. Provide your approach, reasoning, and solution.' },
      { role: 'user', content: `Question: ${question}\n\nProvide:\n1. Your approach\n2. Your reasoning\n3. Your solution` }
    ];

    const responses = await Promise.all(
      models.map(async (model) => {
        try {
          let fullResponse = '';
          for await (const chunk of multiModelOrchestrator.streamResponse(messages, model)) {
            fullResponse += chunk;
          }

          // Parse response into structured format
          const parsed = this.parseModelResponse(fullResponse);
          
          return {
            model,
            approach: parsed.approach,
            reasoning: parsed.reasoning,
            solution: parsed.solution,
            confidence: 0.8 // TODO: Calculate based on response quality
          };
        } catch (error) {
          console.error(`[Consensus] Error with model ${model}:`, error);
          return {
            model,
            approach: 'Error',
            reasoning: `Failed to get response: ${error}`,
            solution: '',
            confidence: 0
          };
        }
      })
    );

    return responses.filter(r => r.confidence > 0);
  }

  /**
   * Phase 2: Models debate and compare approaches
   */
  private async conductDebate(
    question: string,
    responses: ModelResponse[]
  ): Promise<string[]> {
    const debateLog: string[] = [];
    
    // Present all approaches to each model for critique
    const approaches = responses.map(r => 
      `${r.model}:\nApproach: ${r.approach}\nReasoning: ${r.reasoning}\nSolution: ${r.solution}`
    ).join('\n\n---\n\n');

    debateLog.push('=== DEBATE PHASE ===');
    debateLog.push(`Question: ${question}`);
    debateLog.push('\n=== ALL APPROACHES ===');
    debateLog.push(approaches);

    // Get each model's critique of other approaches
    for (const model of responses.map(r => r.model)) {
      try {
        const critiqueMessages = [
          { 
            role: 'system', 
            content: 'You are reviewing multiple AI approaches to a problem. Analyze their strengths, weaknesses, and suggest the best path forward.' 
          },
          { 
            role: 'user', 
            content: `Question: ${question}\n\nHere are the different approaches:\n\n${approaches}\n\nProvide your critique and identify the strongest approach(es).` 
          }
        ];

        let critique = '';
        for await (const chunk of multiModelOrchestrator.streamResponse(critiqueMessages, model)) {
          critique += chunk;
        }

        debateLog.push(`\n=== ${model.toUpperCase()} CRITIQUE ===`);
        debateLog.push(critique);
      } catch (error) {
        debateLog.push(`\n=== ${model.toUpperCase()} CRITIQUE ===`);
        debateLog.push(`Error: ${error}`);
      }
    }

    return debateLog;
  }

  /**
   * Phase 3: Synthesize consensus from debate
   */
  private async synthesizeConsensus(
    responses: ModelResponse[],
    debateLog: string[]
  ): Promise<ConsensusResult> {
    // Use the most confident model to synthesize
    const synthesizer = 'claude-3-sonnet'; // Claude is best at synthesis
    
    const synthesisPrompt = [
      { 
        role: 'system', 
        content: 'You are synthesizing multiple AI responses into a single consensus answer. Consider all perspectives and reasoning.' 
      },
      { 
        role: 'user', 
        content: `Based on the following debate between AI models, provide the consensus answer:\n\n${debateLog.join('\n')}\n\nProvide:\n1. The final consensus answer\n2. Why this is the best approach\n3. How you integrated the different perspectives` 
      }
    ];

    let synthesizedResponse = '';
    try {
      for await (const chunk of multiModelOrchestrator.streamResponse(synthesisPrompt, synthesizer)) {
        synthesizedResponse += chunk;
      }
    } catch (error) {
      console.error('[Consensus] Synthesis failed:', error);
      // Fallback: use highest confidence response
      const best = responses.reduce((prev, curr) => 
        curr.confidence > prev.confidence ? curr : prev
      );
      synthesizedResponse = best.solution;
    }

    return {
      finalAnswer: synthesizedResponse,
      confidence: responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length,
      modelContributions: responses,
      debateLog,
      consensusReasoning: 'Synthesized from all model responses after debate phase'
    };
  }

  /**
   * Parse model response into structured format
   */
  private parseModelResponse(response: string): { approach: string; reasoning: string; solution: string } {
    // Try to extract structured sections
    const approachMatch = response.match(/approach[:\s]*(.+?)(?=reasoning|$)/is);
    const reasoningMatch = response.match(/reasoning[:\s]*(.+?)(?=solution|$)/is);
    const solutionMatch = response.match(/solution[:\s]*(.+)$/is);

    return {
      approach: approachMatch?.[1]?.trim() || response.substring(0, 200),
      reasoning: reasoningMatch?.[1]?.trim() || response.substring(200, 400),
      solution: solutionMatch?.[1]?.trim() || response
    };
  }
}

export const consensusEngine = new ConsensusEngine();
