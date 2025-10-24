import { Router } from 'express';

// Import all autonomous agent routes
import fileReadRoutes from './fileReadRoutes.js';
import codebaseSearchRoutes from './codebaseSearchRoutes.js';
import astParserRoutes from './astParserRoutes.js';
import fileWriteRoutes from './fileWriteRoutes.js';
import diffPreviewRoutes from './diffPreviewRoutes.js';
import batchWriteRoutes from './batchWriteRoutes.js';
import terminalExecutionRoutes from './terminalExecutionRoutes.js';
import browserTestingRoutes from './browserTestingRoutes.js';
import errorParserRoutes from './errorParserRoutes.js';
import checkpointRoutes from './checkpointRoutes.js';
import rollbackRoutes from './rollbackRoutes.js';
import approvalRoutes from './approvalRoutes.js';
import orchestrationEngine from './orchestrationEngine.js';

const router = Router();

console.log('🤖 [MR BLUE AUTONOMOUS] Initializing all routes...');

// BATCH 1: Code Reading APIs
router.use('/', fileReadRoutes);  // POST /read-file
router.use('/', codebaseSearchRoutes);  // POST /search-codebase
router.use('/', astParserRoutes);  // POST /analyze-component

console.log('✅ BATCH 1: Code Reading APIs mounted');

// BATCH 2: Code Writing APIs
router.use('/', fileWriteRoutes);  // POST /write-file
router.use('/', diffPreviewRoutes);  // POST /preview-diff
router.use('/', batchWriteRoutes);  // POST /batch-write

console.log('✅ BATCH 2: Code Writing APIs mounted');

// BATCH 3: Testing & Validation APIs
router.use('/', terminalExecutionRoutes);  // POST /execute-command
router.use('/', browserTestingRoutes);  // POST /test-change
router.use('/', errorParserRoutes);  // POST /analyze-error

console.log('✅ BATCH 3: Testing & Validation APIs mounted');

// BATCH 4: Safety & Checkpoints APIs
router.use('/', checkpointRoutes);  // POST /create-checkpoint, GET /checkpoints
router.use('/', rollbackRoutes);  // POST /rollback
router.use('/', approvalRoutes);  // POST /request-approval, POST /approve/:id, GET /pending-approvals

console.log('✅ BATCH 4: Safety & Checkpoints APIs mounted');

// BATCH 5: Orchestration Engine
router.use('/autonomous', orchestrationEngine);  // POST /autonomous/execute, GET /autonomous/status/:id

console.log('✅ BATCH 5: Orchestration Engine mounted');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 [MR BLUE AUTONOMOUS] All 12 APIs ready!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

/**
 * API Endpoints Summary:
 * 
 * CODE READING:
 * POST /api/mrblue/read-file
 * POST /api/mrblue/search-codebase
 * POST /api/mrblue/analyze-component
 * 
 * CODE WRITING:
 * POST /api/mrblue/write-file
 * POST /api/mrblue/preview-diff
 * POST /api/mrblue/batch-write
 * 
 * TESTING & VALIDATION:
 * POST /api/mrblue/execute-command
 * POST /api/mrblue/test-change
 * POST /api/mrblue/analyze-error
 * 
 * SAFETY & CHECKPOINTS:
 * POST /api/mrblue/create-checkpoint
 * GET  /api/mrblue/checkpoints
 * POST /api/mrblue/rollback
 * POST /api/mrblue/request-approval
 * POST /api/mrblue/approve/:approvalId
 * GET  /api/mrblue/pending-approvals
 * 
 * ORCHESTRATION:
 * POST /api/mrblue/autonomous/execute
 * GET  /api/mrblue/autonomous/status/:taskId
 */

export default router;
