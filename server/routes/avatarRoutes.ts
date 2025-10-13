// TRACK 1: Avatar GLB Conversion Routes
import { Router } from 'express';
import { glbConversionService } from '../services/GLBConversionService';

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

export default router;
