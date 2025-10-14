/**
 * Base Algorithm Agent Class
 * All algorithm agents (A1-Ax) extend this base class
 */

import { db } from '../db';
import { 
  algorithmAgents, 
  algorithmParameters, 
  algorithmChangelog,
  algorithmChatHistory,
  algorithmMetrics,
  type AlgorithmAgent as AlgorithmAgentType,
  type AlgorithmParameter
} from '@shared/schema';
import { eq } from 'drizzle-orm';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export interface Parameter {
  name: string;
  type: 'number' | 'boolean' | 'string' | 'enum';
  currentValue: any;
  defaultValue: any;
  min?: number;
  max?: number;
  enumValues?: string[];
  description: string;
  impact: string;
}

export interface SimulationResult {
  before: any;
  after: any;
  impact: string;
  changes: string[];
  preview: any[];
}

export interface AgentResponse {
  message: string;
  actionTaken?: {
    type: 'parameter_update' | 'simulation' | 'explanation' | 'debug';
    details: any;
  };
  needsConfirmation?: boolean;
  preview?: any;
}

export abstract class AlgorithmAgent {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract filePath: string;
  abstract algorithmType: 'scoring' | 'ranking' | 'recommendation' | 'optimization' | 'prediction';
  abstract esaLayers: number[];
  
  protected parameters: Map<string, Parameter> = new Map();
  
  /**
   * Initialize the algorithm agent - load from DB or create if not exists
   */
  async initialize(): Promise<void> {
    // Check if agent exists in DB
    const existing = await db
      .select()
      .from(algorithmAgents)
      .where(eq(algorithmAgents.id, this.id))
      .limit(1);
    
    if (existing.length === 0) {
      // Create agent record
      await db.insert(algorithmAgents).values({
        id: this.id,
        name: this.name,
        description: this.description,
        filePath: this.filePath,
        algorithmType: this.algorithmType,
        currentConfig: this.getCurrentConfig(),
        defaultConfig: this.getDefaultConfig(),
        esaLayers: this.esaLayers
      });
      
      // Create parameter records
      const params = this.getParameters();
      for (const param of params) {
        await db.insert(algorithmParameters).values({
          algorithmId: this.id,
          name: param.name,
          type: param.type,
          currentValue: param.currentValue,
          defaultValue: param.defaultValue,
          constraints: {
            min: param.min,
            max: param.max,
            enumValues: param.enumValues
          },
          description: param.description,
          impact: param.impact
        });
      }
    } else {
      // Load parameters from DB
      const dbParams = await db
        .select()
        .from(algorithmParameters)
        .where(eq(algorithmParameters.algorithmId, this.id));
      
      for (const dbParam of dbParams) {
        this.parameters.set(dbParam.name, {
          name: dbParam.name,
          type: dbParam.type as any,
          currentValue: dbParam.currentValue,
          defaultValue: dbParam.defaultValue,
          min: (dbParam.constraints as any)?.min,
          max: (dbParam.constraints as any)?.max,
          enumValues: (dbParam.constraints as any)?.enumValues,
          description: dbParam.description || '',
          impact: dbParam.impact || ''
        });
      }
    }
  }
  
  /**
   * Explain how this algorithm works in simple terms
   */
  abstract explain(): string;
  
  /**
   * Get all adjustable parameters
   */
  abstract getParameters(): Parameter[];
  
  /**
   * Update a parameter value
   */
  async updateParameter(name: string, value: any, reason: string, userId: number): Promise<void> {
    const param = this.parameters.get(name);
    if (!param) {
      throw new Error(`Parameter ${name} not found`);
    }
    
    // Validate constraints
    if (param.type === 'number' && param.min !== undefined && value < param.min) {
      throw new Error(`Value ${value} is below minimum ${param.min}`);
    }
    if (param.type === 'number' && param.max !== undefined && value > param.max) {
      throw new Error(`Value ${value} is above maximum ${param.max}`);
    }
    if (param.type === 'enum' && param.enumValues && !param.enumValues.includes(value)) {
      throw new Error(`Value ${value} not in allowed values: ${param.enumValues.join(', ')}`);
    }
    
    const oldValue = param.currentValue;
    param.currentValue = value;
    this.parameters.set(name, param);
    
    // Update in DB
    await db
      .update(algorithmParameters)
      .set({ 
        currentValue: value,
        updatedAt: new Date()
      })
      .where(eq(algorithmParameters.algorithmId, this.id));
    
    // Log change
    await db.insert(algorithmChangelog).values({
      algorithmId: this.id,
      parameter: name,
      oldValue,
      newValue: value,
      reason,
      modifiedBy: userId
    });
    
    // Apply changes to the actual algorithm
    await this.applyParameterChange(name, value);
  }
  
  /**
   * Apply parameter change to the actual algorithm implementation
   */
  protected abstract applyParameterChange(name: string, value: any): Promise<void>;
  
  /**
   * Simulate what would happen if parameters were changed
   */
  abstract simulate(changes: Record<string, any>): Promise<SimulationResult>;
  
  /**
   * Chat with the algorithm agent using AI
   */
  async chat(userMessage: string, userId: number): Promise<AgentResponse> {
    // Get current state
    const params = Array.from(this.parameters.values());
    const context = {
      algorithm: {
        id: this.id,
        name: this.name,
        description: this.description,
        type: this.algorithmType,
        explanation: this.explain()
      },
      parameters: params.map(p => ({
        name: p.name,
        current: p.currentValue,
        default: p.defaultValue,
        description: p.description,
        impact: p.impact
      }))
    };
    
    // System prompt
    const systemPrompt = `You are ${this.name}, an interactive algorithm agent. 

Your job is to:
1. Explain how you work in simple terms
2. Help users adjust your parameters
3. Simulate what changes would do before applying them
4. Debug issues with your algorithm
5. Learn from user feedback to improve

Current state:
${JSON.stringify(context, null, 2)}

When users want to change parameters:
1. Explain what the change will do
2. Simulate the impact if possible
3. Ask for confirmation before applying
4. Apply the change and confirm

Always be helpful, conversational, and explain things in simple terms.`;
    
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
      });
      
      const response = completion.choices[0]?.message?.content || 'I apologize, I could not process that request.';
      
      // Save to chat history
      await db.insert(algorithmChatHistory).values({
        algorithmId: this.id,
        userId,
        userMessage,
        agentResponse: response,
        actionTaken: null
      });
      
      return {
        message: response
      };
    } catch (error) {
      console.error('Algorithm chat error:', error);
      return {
        message: 'I apologize, I encountered an error. Please try again.'
      };
    }
  }
  
  /**
   * Record metrics
   */
  async recordMetrics(executionTime: number, accuracy?: number): Promise<void> {
    await db.insert(algorithmMetrics).values({
      algorithmId: this.id,
      executionTime,
      callCount: 1,
      errorCount: 0,
      accuracy,
      impactScore: this.calculateImpactScore()
    });
  }
  
  /**
   * Calculate impact score (0-100) for this algorithm
   */
  protected abstract calculateImpactScore(): number;
  
  /**
   * Get current configuration
   */
  protected getCurrentConfig(): any {
    const config: any = {};
    this.parameters.forEach((param, name) => {
      config[name] = param.currentValue;
    });
    return config;
  }
  
  /**
   * Get default configuration
   */
  protected getDefaultConfig(): any {
    const config: any = {};
    this.parameters.forEach((param, name) => {
      config[name] = param.defaultValue;
    });
    return config;
  }
}
