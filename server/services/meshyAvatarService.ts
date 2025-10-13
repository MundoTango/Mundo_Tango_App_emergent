import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

export class MeshyAvatarService {
  private apiKey = process.env.MESHY_API_KEY;
  private baseUrl = 'https://api.meshy.ai/v2';

  async generateAvatar(prompt: string): Promise<{ taskId: string }> {
    if (!this.apiKey) {
      throw new Error('MESHY_API_KEY is not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-3d`,
        {
          mode: 'preview',
          prompt,
          art_style: 'realistic',
          negative_prompt: 'low quality, blurry, cartoon'
        },
        { 
          headers: { 
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('✅ Meshy.ai avatar generation started:', response.data);
      return { taskId: response.data.result };
    } catch (error: any) {
      console.error('❌ Meshy.ai generation error:', error.response?.data || error.message);
      throw new Error(`Avatar generation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async checkStatus(taskId: string) {
    if (!this.apiKey) {
      throw new Error('MESHY_API_KEY is not configured');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/text-to-3d/${taskId}`,
        {
          headers: { 
            Authorization: `Bearer ${this.apiKey}` 
          }
        }
      );
      
      console.log(`📊 Meshy.ai status for ${taskId}:`, response.data.status);
      return response.data;
    } catch (error: any) {
      console.error('❌ Meshy.ai status check error:', error.response?.data || error.message);
      throw new Error(`Status check failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async downloadGLB(taskId: string): Promise<string> {
    const status = await this.checkStatus(taskId);
    
    if (status.status !== 'SUCCEEDED') {
      throw new Error(`Task not ready: ${status.status}. Current progress: ${status.progress || 0}%`);
    }
    
    if (!status.model_urls?.glb) {
      throw new Error('GLB URL not available in response');
    }

    try {
      const glbUrl = status.model_urls.glb;
      console.log('⬇️ Downloading GLB from:', glbUrl);
      
      const response = await axios.get(glbUrl, { 
        responseType: 'arraybuffer',
        timeout: 60000 // 60 second timeout for download
      });
      
      const savePath = path.join(process.cwd(), 'client/public/models/mr-blue-avatar.glb');
      await fs.writeFile(savePath, response.data);
      
      const stats = await fs.stat(savePath);
      console.log(`✅ GLB saved successfully: ${savePath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      
      return savePath;
    } catch (error: any) {
      console.error('❌ GLB download error:', error.message);
      throw new Error(`GLB download failed: ${error.message}`);
    }
  }

  async getAvatarInfo() {
    const glbPath = path.join(process.cwd(), 'client/public/models/mr-blue-avatar.glb');
    
    try {
      const stats = await fs.stat(glbPath);
      return {
        exists: true,
        path: '/models/mr-blue-avatar.glb',
        size: stats.size,
        sizeInMB: (stats.size / 1024 / 1024).toFixed(2),
        lastModified: stats.mtime
      };
    } catch {
      return {
        exists: false,
        path: '/models/mr-blue-avatar.glb',
        message: 'Avatar not generated yet'
      };
    }
  }
}

export const meshyAvatarService = new MeshyAvatarService();
