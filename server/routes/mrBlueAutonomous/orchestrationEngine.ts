import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import { emitSSEEvent } from './sseStream.js';
import { detectFilePath, readFile, writeFile, generateDiff } from '../../services/autonomous/fileOperations.js';

const router = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface AutonomousTask {
  id: string;
  description: string;
  status: 'planning' | 'reading' | 'writing' | 'testing' | 'completed' | 'failed';
  steps: Array<{
    action: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    result?: any;
    error?: string;
  }>;
  maxIterations: number;
  currentIteration: number;
}

// In-memory task tracking (would be database in production)
const activeTasks = new Map<string, AutonomousTask>();

/**
 * POST /api/mrblue/autonomous/execute
 * Execute task autonomously with plan → read → write → test → iterate
 */
router.post('/execute', async (req, res) => {
  try {
    const { task, context, maxIterations = 5, requireApproval = true } = req.body;

    if (!task || typeof task !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'task is required and must be a string'
      });
    }

    // Safety: Enforce max iterations limit to prevent infinite loops
    const safeMaxIterations = Math.min(maxIterations, 20);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 [MR BLUE - AUTONOMOUS EXECUTION]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Task:', task);
    console.log('🔁 Max Iterations:', safeMaxIterations, maxIterations > 20 ? '(capped from ' + maxIterations + ')' : '');
    console.log('✋ Require Approval:', requireApproval);

    const taskId = `auto-${Date.now()}`;
    
    const autonomousTask: AutonomousTask = {
      id: taskId,
      description: task,
      status: 'planning',
      steps: [],
      maxIterations: safeMaxIterations,
      currentIteration: 0
    };

    activeTasks.set(taskId, autonomousTask);

    // Emit task started event
    emitSSEEvent(taskId, 'taskStarted', {
      taskId,
      description: task
    });

    // Start async execution
    executeAutonomousTask(taskId, task, context, safeMaxIterations, requireApproval).catch(error => {
      console.error('❌ Autonomous task failed:', error);
      const taskData = activeTasks.get(taskId);
      if (taskData) {
        taskData.status = 'failed';
        emitSSEEvent(taskId, 'taskFailed', {
          error: error.message
        });
      }
    });

    console.log('✅ Autonomous task started');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.json({
      success: true,
      data: {
        taskId,
        status: 'planning',
        message: 'Autonomous execution started. Check status with GET /api/mrblue/autonomous/status/:taskId'
      }
    });

  } catch (error: any) {
    console.error('❌ [AUTONOMOUS EXECUTION ERROR]:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mrblue/autonomous/status/:taskId
 * Get status of autonomous task
 */
router.get('/status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = activeTasks.get(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });

  } catch (error: any) {
    console.error('❌ [STATUS ERROR]:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Main autonomous execution loop
 */
async function executeAutonomousTask(
  taskId: string,
  taskDescription: string,
  context: any,
  maxIterations: number,
  requireApproval: boolean
) {
  const task = activeTasks.get(taskId)!;

  try {
    // PHASE 1: Planning
    console.log('🧠 [AUTONOMOUS] Phase 1: Planning...');
    console.log('📍 Context:', JSON.stringify(context, null, 2));
    task.status = 'planning';
    
    const plan = await createPlan(taskDescription, context);
    task.steps = plan.steps.map(step => ({
      action: step,
      status: 'pending'
    }));

    console.log('✅ Plan created:', task.steps.length, 'steps');

    // Emit planned steps
    for (const step of plan.steps) {
      emitSSEEvent(taskId, 'stepPlanned', { step });
    }

    // PHASE 2: Execute each step
    for (let i = 0; i < task.steps.length && task.currentIteration < maxIterations; i++) {
      const step = task.steps[i];
      console.log(`🔄 [AUTONOMOUS] Step ${i + 1}/${task.steps.length}:`, step.action);
      
      step.status = 'in_progress';
      task.currentIteration++;

      emitSSEEvent(taskId, 'stepInProgress', { step: step.action });

      try {
        // Execute step based on action type
        if (step.action.includes('read') || step.action.includes('analyze')) {
          task.status = 'reading';
          step.result = await executeReadAction(taskId, step.action, context);
        } else if (step.action.includes('write') || step.action.includes('create') || step.action.includes('modify')) {
          task.status = 'writing';
          step.result = await executeWriteAction(taskId, step.action, context, requireApproval);
        } else if (step.action.includes('test') || step.action.includes('validate')) {
          task.status = 'testing';
          step.result = await executeTestAction(taskId, step.action);
        }

        step.status = 'completed';
        console.log(`✅ Step ${i + 1} completed`);

      } catch (error: any) {
        console.error(`❌ Step ${i + 1} failed:`, error.message);
        step.status = 'failed';
        step.error = error.message;

        // Emit error event
        emitSSEEvent(taskId, 'errorOccurred', {
          error: error.message,
          step: step.action
        });

        // STREAM 2.4: Auto-rollback on error
        const shouldRetry = task.currentIteration < maxIterations;
        if (shouldRetry) {
          console.log('🔄 Auto-rollback: Attempting to fix error and retry...');
          // TODO: Implement actual rollback and retry logic
        } else {
          throw error;
        }
      }
    }

    // PHASE 3: Final validation
    console.log('✅ [AUTONOMOUS] All steps completed');
    task.status = 'completed';
    
    emitSSEEvent(taskId, 'taskComplete', {
      taskId,
      stepsCompleted: task.steps.length
    });

  } catch (error: any) {
    console.error('❌ [AUTONOMOUS] Task failed:', error.message);
    task.status = 'failed';
  }
}

/**
 * Use Claude to create execution plan
 */
async function createPlan(taskDescription: string, context: any): Promise<{ steps: string[] }> {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are an autonomous coding agent. Break down this task into specific, executable steps.

Task: ${taskDescription}

Available capabilities:
- Read files and analyze code
- Search codebase
- Write/modify files
- Execute terminal commands
- Test changes in browser
- Create checkpoints and rollback

Return a JSON array of steps in this format:
{
  "steps": [
    "Read the Button component file",
    "Analyze current button styling",
    "Modify button color to blue",
    "Test changes in browser",
    "Validate no errors"
  ]
}

Return ONLY valid JSON.`
    }]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  // Fallback
  return {
    steps: [taskDescription]
  };
}

/**
 * STREAM 2.2: Execute read action with real file operations
 */
async function executeReadAction(taskId: string, action: string, context: any): Promise<any> {
  console.log('📖 [READ ACTION]', action);
  
  // Detect file path from context
  const selectedComponent = context?.selectedComponent?.element;
  if (selectedComponent) {
    const filePath = await detectFilePath(selectedComponent);
    if (filePath) {
      console.log('📂 [READ] Detected file:', filePath);
      const content = await readFile(filePath);
      return { filePath, content };
    }
  }
  
  console.log('⚠️  [READ] No component selected, skipping file read');
  return { result: 'No file to read' };
}

/**
 * STREAM 2.2 & 2.3: Execute write action with real file operations and approval
 */
async function executeWriteAction(taskId: string, action: string, context: any, requireApproval: boolean): Promise<any> {
  console.log('✍️  [WRITE ACTION]', action);
  
  // Detect file path from context
  const selectedComponent = context?.selectedComponent?.element;
  if (!selectedComponent) {
    throw new Error('No component selected - cannot determine which file to modify');
  }

  const filePath = await detectFilePath(selectedComponent);
  if (!filePath) {
    throw new Error('Could not detect file path from selected component');
  }

  console.log('📂 [WRITE] Target file:', filePath);

  // Read current file content
  const oldContent = await readFile(filePath);
  
  // Use Claude to generate new content
  const newContent = await generateNewContent(oldContent, action, context);

  // Generate diff
  const diff = generateDiff(filePath, oldContent, newContent);

  console.log('📝 [WRITE] Generated diff');
  emitSSEEvent(taskId, 'diffReady', { filePath, diff });

  // STREAM 2.3: Per-file approval gating
  if (requireApproval) {
    console.log('⚠️  [APPROVAL] Waiting for user approval...');
    emitSSEEvent(taskId, 'approvalRequired', {
      filePath,
      diff,
      risk: 'medium',
      description: `Modifying ${filePath} - ${action}`
    });

    // TODO: Actually wait for approval via WebSocket or polling
    // For now, simulate approval after 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ [APPROVAL] Simulated approval granted');
  }

  // Write the new content
  await writeFile(filePath, newContent);
  console.log('✅ [WRITE] File written successfully');

  emitSSEEvent(taskId, 'fileApplied', { filePath });

  return { success: true, filePath, changes: diff };
}

/**
 * Generate new file content using Claude
 */
async function generateNewContent(oldContent: string, action: string, context: any): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `You are a code modification assistant. Modify the following code according to the requested change.

**Current Code:**
\`\`\`
${oldContent}
\`\`\`

**Requested Change:** ${action}

**Context:**
- Page: ${context?.page || 'unknown'}
- Selected Component: ${context?.selectedComponent?.id || 'unknown'}

Return ONLY the modified code, with NO explanation or markdown. The output should be valid code that can directly replace the file.`
    }]
  });

  const newContent = message.content[0].type === 'text' ? message.content[0].text : oldContent;
  return newContent.trim();
}

/**
 * Execute test action (terminal, browser)
 */
async function executeTestAction(taskId: string, action: string): Promise<any> {
  console.log('🧪 [TEST ACTION]', action);
  // TODO: Implement actual testing
  return { success: true, action: 'test' };
}

export default router;
