// TRACK 1: Avatar GLB Conversion Routes
// TRACK 2: Meshy.ai 3D Avatar Generation
import { Router } from 'express';
import { glbConversionService } from '../services/GLBConversionService';
import { meshyAvatarService } from '../services/meshyAvatarService';

const router = Router();

// Get conversion status
router.get('/conversion-status', async (req, res) => {
  try {
    const status = await glbConversionService.getConversionStatus();
    res.json(status);
  } catch (error) {
    console.error('[AvatarRoutes] Status error:', error);
    res.status(500).json({ error: 'Failed to get conversion status' });
  }
});

// Check GLB files availability
router.get('/glb-files', async (req, res) => {
  try {
    const result = await glbConversionService.checkGLBFiles();
    res.json(result);
  } catch (error) {
    console.error('[AvatarRoutes] GLB check error:', error);
    res.status(500).json({ error: 'Failed to check GLB files' });
  }
});

// Trigger conversion (NOTE: Returns instructions for manual conversion)
router.post('/convert', async (req, res) => {
  try {
    const result = await glbConversionService.convertFBXtoGLB();
    res.json(result);
  } catch (error) {
    console.error('[AvatarRoutes] Conversion error:', error);
    res.status(500).json({ error: 'Conversion failed' });
  }
});

// Create GLB directory
router.post('/setup-directory', async (req, res) => {
  try {
    await glbConversionService.createGLBDirectory();
    res.json({
      success: true,
      message: 'GLB directory created successfully',
      path: 'public/models/x-bot-glb/',
    });
  } catch (error) {
    console.error('[AvatarRoutes] Directory setup error:', error);
    res.status(500).json({ error: 'Failed to create directory' });
  }
});

// ============= TRACK 2: Meshy.ai 3D Avatar Generation Routes =============

// POST /api/avatar/generate - Start avatar generation
router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await meshyAvatarService.generateAvatar(prompt);
    res.json({
      success: true,
      taskId: result.taskId,
      message: 'Avatar generation started'
    });
  } catch (error: any) {
    console.error('[Meshy] Generation error:', error);
    res.status(500).json({ 
      error: 'Failed to start avatar generation',
      details: error.message 
    });
  }
});

// GET /api/avatar/status/:taskId - Check generation status
router.get('/status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const status = await meshyAvatarService.checkStatus(taskId);
    
    res.json({
      success: true,
      status: status.status,
      progress: status.progress || 0,
      taskId,
      modelUrls: status.model_urls
    });
  } catch (error: any) {
    console.error('[Meshy] Status check error:', error);
    res.status(500).json({ 
      error: 'Failed to check status',
      details: error.message 
    });
  }
});

// POST /api/avatar/download/:taskId - Download completed GLB
router.post('/download/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const filePath = await meshyAvatarService.downloadGLB(taskId);
    
    res.json({
      success: true,
      message: 'Avatar downloaded successfully',
      path: '/models/mr-blue-avatar.glb',
      localPath: filePath
    });
  } catch (error: any) {
    console.error('[Meshy] Download error:', error);
    res.status(500).json({ 
      error: 'Failed to download avatar',
      details: error.message 
    });
  }
});

// GET /api/avatar/info - Get current avatar info
router.get('/info', async (req, res) => {
  try {
    const info = await meshyAvatarService.getAvatarInfo();
    res.json(info);
  } catch (error: any) {
    console.error('[Meshy] Info error:', error);
    res.status(500).json({ 
      error: 'Failed to get avatar info',
      details: error.message 
    });
  }
});

export default router;
