interface MemoryEnhancementAgent {
  enhanceContent(content: string): Promise<string>;
  generateTags(content: string): Promise<string[]>;
  analyzeSentiment(content: string): Promise<'positive' | 'neutral' | 'negative'>;
  optimizeForEngagement(content: string): Promise<string>;
}

interface EmergentLLMResponse {
  enhanced_content?: string;
  tags?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  engagement_score?: number;
  suggestions?: string[];
}

class EmergentLLMMemoryAgent implements MemoryEnhancementAgent {
  private apiKey: string;
  private baseUrl: string;
  
  constructor() {
    // Use Emergent LLM key as specified by user
    this.apiKey = process.env.EMERGENT_LLM_KEY || 'sk-emergent-default';
    this.baseUrl = process.env.EMERGENT_API_URL || 'https://api.emergent.ai/v1';
  }

  async enhanceContent(content: string): Promise<string> {
    console.log('🤖 AI enhancing memory content...');
    
    try {
      const response = await fetch(`${this.baseUrl}/enhance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          context: 'tango_memory',
          enhancement_type: 'engagement',
          preserve_meaning: true,
          max_length: 500
        })
      });

      if (!response.ok) {
        throw new Error(`AI enhancement failed: ${response.statusText}`);
      }

      const result: EmergentLLMResponse = await response.json();
      return result.enhanced_content || content;
      
    } catch (error) {
      console.error('AI enhancement error:', error);
      // Graceful fallback - return original content
      return content;
    }
  }

  async generateTags(content: string): Promise<string[]> {
    console.log('🏷️  AI generating memory tags...');
    
    try {
      const response = await fetch(`${this.baseUrl}/tags`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          domain: 'tango_dance',
          max_tags: 8,
          include_emotions: true,
          include_locations: true,
          include_techniques: true
        })
      });

      if (!response.ok) {
        throw new Error(`Tag generation failed: ${response.statusText}`);
      }

      const result: EmergentLLMResponse = await response.json();
      return result.tags || this.extractBasicTags(content);
      
    } catch (error) {
      console.error('Tag generation error:', error);
      // Fallback to basic keyword extraction
      return this.extractBasicTags(content);
    }
  }

  async analyzeSentiment(content: string): Promise<'positive' | 'neutral' | 'negative'> {
    console.log('😊 AI analyzing memory sentiment...');
    
    try {
      const response = await fetch(`${this.baseUrl}/sentiment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          context: 'social_memory'
        })
      });

      if (!response.ok) {
        throw new Error(`Sentiment analysis failed: ${response.statusText}`);
      }

      const result: EmergentLLMResponse = await response.json();
      return result.sentiment || 'neutral';
      
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      // Fallback to basic sentiment detection
      return this.detectBasicSentiment(content);
    }
  }

  async optimizeForEngagement(content: string): Promise<string> {
    console.log('📈 AI optimizing for engagement...');
    
    try {
      const response = await fetch(`${this.baseUrl}/optimize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          optimization_goals: ['engagement', 'clarity', 'emotional_impact'],
          platform: 'social_memory',
          preserve_authenticity: true
        })
      });

      if (!response.ok) {
        throw new Error(`Engagement optimization failed: ${response.statusText}`);
      }

      const result: EmergentLLMResponse = await response.json();
      return result.enhanced_content || content;
      
    } catch (error) {
      console.error('Engagement optimization error:', error);
      return content;
    }
  }

  // Fallback methods for when AI is unavailable
  private extractBasicTags(content: string): string[] {
    const commonTangoTerms = [
      'milonga', 'vals', 'tango', 'embrace', 'connection', 
      'music', 'dance', 'partner', 'feeling', 'emotion',
      'performance', 'practice', 'class', 'teacher', 'technique'
    ];
    
    const contentLower = content.toLowerCase();
    return commonTangoTerms.filter(term => 
      contentLower.includes(term)
    ).slice(0, 5);
  }

  private detectBasicSentiment(content: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['amazing', 'beautiful', 'wonderful', 'love', 'great', 'fantastic', 'joy', 'happy'];
    const negativeWords = ['difficult', 'struggling', 'hard', 'frustrated', 'sad', 'disappointed'];
    
    const contentLower = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => contentLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => contentLower.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
}

// Memory Processing Pipeline
export class MemoryProcessingPipeline {
  private agent: EmergentLLMMemoryAgent;
  
  constructor() {
    this.agent = new EmergentLLMMemoryAgent();
  }
  
  async processMemory(content: string, options: {
    enhanceContent?: boolean;
    generateTags?: boolean;
    analyzeSentiment?: boolean;
    optimizeEngagement?: boolean;
  } = {}) {
    console.log('🔄 Processing memory with AI pipeline...');
    
    const results = {
      originalContent: content,
      enhancedContent: content,
      tags: [] as string[],
      sentiment: 'neutral' as 'positive' | 'neutral' | 'negative',
      suggestions: [] as string[]
    };

    try {
      // Run AI enhancements in parallel for better performance
      const promises = [];
      
      if (options.enhanceContent) {
        promises.push(
          this.agent.enhanceContent(content)
            .then(enhanced => { results.enhancedContent = enhanced; })
        );
      }
      
      if (options.generateTags) {
        promises.push(
          this.agent.generateTags(content)
            .then(tags => { results.tags = tags; })
        );
      }
      
      if (options.analyzeSentiment) {
        promises.push(
          this.agent.analyzeSentiment(content)
            .then(sentiment => { results.sentiment = sentiment; })
        );
      }
      
      if (options.optimizeEngagement) {
        promises.push(
          this.agent.optimizeForEngagement(content)
            .then(optimized => { 
              if (optimized !== content) {
                results.suggestions.push(`Suggested: "${optimized}"`);
              }
            })
        );
      }
      
      // Wait for all AI operations to complete
      await Promise.all(promises);
      
      console.log('✅ Memory AI processing completed');
      return results;
      
    } catch (error) {
      console.error('🚨 Memory processing pipeline error:', error);
      return results; // Return original content on error
    }
  }
}

export { EmergentLLMMemoryAgent };
export type { MemoryEnhancementAgent, EmergentLLMResponse };