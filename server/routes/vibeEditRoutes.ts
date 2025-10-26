import express from 'express';
import { EditorCoordinator, EditorRequest } from '../services/editors/editorCoordinator';

const router = express.Router();
const editorCoordinator = new EditorCoordinator();

router.post('/edit-file', async (req, res) => {
  try {
    const request: EditorRequest = req.body;
    
    if (!request.filePath || !request.content) {
      return res.status(400).json({
        error: 'Missing required fields: filePath and content'
      });
    }
    
    if (!request.mode) {
      const userModel = (req.user as any)?.preferredModel || 'gpt-4';
      request.mode = editorCoordinator.selectBestMode(userModel);
    }
    
    const result = await editorCoordinator.applyEdit(request);
    
    return res.json(result);
  } catch (error) {
    console.error('[VibeEditRoutes] Error applying edit:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/preview-diff', async (req, res) => {
  try {
    const request: EditorRequest = req.body;
    
    if (!request.filePath || !request.content) {
      return res.status(400).json({
        error: 'Missing required fields: filePath and content'
      });
    }
    
    if (!request.mode) {
      const userModel = (req.user as any)?.preferredModel || 'gpt-4';
      request.mode = editorCoordinator.selectBestMode(userModel);
    }
    
    const preview = await editorCoordinator.previewEdit(request);
    
    return res.json(preview);
  } catch (error) {
    console.error('[VibeEditRoutes] Error previewing diff:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/apply-batch', async (req, res) => {
  try {
    const requests: EditorRequest[] = req.body.edits;
    
    if (!Array.isArray(requests)) {
      return res.status(400).json({
        error: 'Missing required field: edits (array)'
      });
    }
    
    const userModel = (req.user as any)?.preferredModel || 'gpt-4';
    requests.forEach(request => {
      if (!request.mode) {
        request.mode = editorCoordinator.selectBestMode(userModel);
      }
    });
    
    const result = await editorCoordinator.applyBatchEdits(requests);
    
    return res.json(result);
  } catch (error) {
    console.error('[VibeEditRoutes] Error applying batch edits:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
