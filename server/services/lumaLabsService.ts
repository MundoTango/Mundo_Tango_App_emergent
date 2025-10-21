// Node 18+ has native fetch, no need for node-fetch
import fs from 'fs';
import path from 'path';

interface AvatarGenerationParams {
  characterName?: string;
  hairColor?: string;
  outfit?: string;
  accessories?: string;
  quality?: 'high' | 'medium' | 'low';
  style?: 'realistic' | 'stylized' | 'cartoon';
  emotionalExpression?: 'neutral' | 'friendly' | 'professional';
  pose?: 'T-pose' | 'A-pose' | 'natural';
}

interface Generation {
  id: string;
  state: 'queued' | 'dreaming' | 'completed' | 'failed';
  assets?: {
    model?: string;
    preview?: string;
  };
  failure_reason?: string;
  created_at: string;
}

interface GenerationStatus {
  id: string;
  state: 'queued' | 'dreaming' | 'completed' | 'failed';
  assets?: {
    model?: string;
    preview?: string;
  };
  failure_reason?: string;
}

export class LumaLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.lumalabs.ai/dream-machine/v1';
  
  constructor() {
    this.apiKey = process.env.LUMA_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('LUMA_API_KEY not set - Luma Labs features will be disabled');
    }
  }
  
  /**
   * Generate 3D avatar from text description
   */
  async generateAvatar(params: AvatarGenerationParams = {}): Promise<Generation> {
    if (!this.apiKey) {
      throw new Error('LUMA_API_KEY not configured');
    }
    
    const prompt = this.buildPrompt(params);
    
    try {
      const response = await fetch(`${this.baseUrl}/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          aspect_ratio: '1:1',
          model: 'v1.6',
          callback_url: process.env.REPL_URL ? `${process.env.REPL_URL}/api/webhooks/luma` : undefined
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Luma API error: ${response.status} - ${errorText}`);
      }
      
      const generation = await response.json() as Generation;
      
      console.log('Luma generation started:', {
        id: generation.id,
        state: generation.state,
        prompt: prompt.substring(0, 100)
      });
      
      return generation;
    } catch (error) {
      console.error('Failed to generate avatar with Luma Labs:', error);
      throw error;
    }
  }
  
  /**
   * Check generation status
   */
  async checkStatus(generationId: string): Promise<GenerationStatus> {
    if (!this.apiKey) {
      throw new Error('LUMA_API_KEY not configured');
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/generations/${generationId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to check status: ${response.status}`);
      }
      
      const status = await response.json() as GenerationStatus;
      return status;
    } catch (error) {
      console.error('Failed to check generation status:', error);
      throw error;
    }
  }
  
  /**
   * Download generated GLB model
   */
  async downloadModel(generationId: string): Promise<string> {
    const status = await this.checkStatus(generationId);
    
    if (status.state !== 'completed') {
      throw new Error(`Generation not complete. Current state: ${status.state}`);
    }
    
    if (!status.assets?.model) {
      throw new Error('No model asset available');
    }
    
    const modelUrl = status.assets.model;
    
    try {
      // Download GLB file
      const response = await fetch(modelUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download model: ${response.status}`);
      }
      
      const buffer = await response.arrayBuffer();
      
      // Save to assets directory
      const assetsDir = path.join(process.cwd(), 'client', 'public', 'assets');
      
      // Ensure directory exists
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }
      
      const filePath = path.join(assetsDir, `scott-avatar-luma-${generationId}.glb`);
      fs.writeFileSync(filePath, Buffer.from(buffer));
      
      console.log('Model downloaded successfully:', filePath);
      
      // Return public URL path
      return `/assets/scott-avatar-luma-${generationId}.glb`;
    } catch (error) {
      console.error('Failed to download model:', error);
      throw error;
    }
  }
  
  /**
   * Poll generation until complete (with timeout)
   */
  async waitForCompletion(
    generationId: string, 
    timeoutMs: number = 600000, // 10 minutes default
    pollIntervalMs: number = 5000 // 5 seconds
  ): Promise<GenerationStatus> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const status = await this.checkStatus(generationId);
      
      if (status.state === 'completed') {
        return status;
      }
      
      if (status.state === 'failed') {
        throw new Error(`Generation failed: ${status.failure_reason || 'Unknown error'}`);
      }
      
      // Still processing, wait and try again
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
    
    throw new Error('Generation timeout - took longer than expected');
  }
  
  /**
   * Build optimized prompt from parameters
   */
  private buildPrompt(params: AvatarGenerationParams): string {
    const {
      characterName = 'Scott',
      hairColor = 'blue',
      outfit = 'dark gray vest over casual shirt',
      accessories = 'turquoise jewelry (earrings, necklace)',
      quality = 'high',
      style = 'stylized',
      emotionalExpression = 'friendly',
      pose = 'T-pose'
    } = params;
    
    const qualityDescriptors = {
      high: 'highly detailed, sharp textures, clean topology',
      medium: 'balanced detail, optimized geometry',
      low: 'simplified geometry, efficient rendering'
    };
    
    return `
Professional ${style} 3D character avatar named ${characterName},
${hairColor} hair styled upward,
wearing ${outfit},
with ${accessories},
${emotionalExpression} facial expression,
${pose} for rigging,
${qualityDescriptors[quality]},
optimized for real-time rendering in web browser,
PBR materials, game-ready asset,
suitable for AI assistant interface
    `.trim().replace(/\s+/g, ' ');
  }
  
  /**
   * Get default Scott avatar prompt
   */
  getScottPrompt(): string {
    return this.buildPrompt({
      characterName: 'Scott',
      hairColor: 'blue',
      outfit: 'dark gray vest over casual shirt',
      accessories: 'turquoise jewelry',
      quality: 'high',
      style: 'stylized',
      emotionalExpression: 'friendly',
      pose: 'T-pose'
    });
  }
}

// Export both class and singleton instance
export default LumaLabsService;
export const lumaLabsService = new LumaLabsService();
