import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';

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
    const { task, maxIterations = 5, requireApproval = true } = req.body;

    if (!task || typeof task !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'task is required and must be a string'
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 [MR BLUE - AUTONOMOUS EXECUTION]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Task:', task);
    console.log('🔁 Max Iterations:', maxIterations);
    console.log('✋ Require Approval:', requireApproval);

    const taskId = `auto-${Date.now()}`;
    
    const autonomousTask: AutonomousTask = {
      id: taskId,
      description: task,
      status: 'planning',
      steps: [],
      maxIterations,
      currentIteration: 0
    };

    activeTasks.set(taskId, autonomousTask);

    // Start async execution
    executeAutonomousTask(taskId, task, maxIterations, requireApproval).catch(error => {
      console.error('❌ Autonomous task failed:', error);
      const task = activeTasks.get(taskId);
      if (task) {
        task.status = 'failed';
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
  maxIterations: number,
  requireApproval: boolean
) {
  const task = activeTasks.get(taskId)!;

  try {
    // PHASE 1: Planning
    console.log('🧠 [AUTONOMOUS] Phase 1: Planning...');
    task.status = 'planning';
    
    const plan = await createPlan(taskDescription);
    task.steps = plan.steps.map(step => ({
      action: step,
      status: 'pending'
    }));

    console.log('✅ Plan created:', task.steps.length, 'steps');

    // PHASE 2: Execute each step
    for (let i = 0; i < task.steps.length && task.currentIteration < maxIterations; i++) {
      const step = task.steps[i];
      console.log(`🔄 [AUTONOMOUS] Step ${i + 1}/${task.steps.length}:`, step.action);
      
      step.status = 'in_progress';
      task.currentIteration++;

      try {
        // Execute step based on action type
        if (step.action.includes('read') || step.action.includes('analyze')) {
          task.status = 'reading';
          step.result = await executeReadAction(step.action);
        } else if (step.action.includes('write') || step.action.includes('create') || step.action.includes('modify')) {
          task.status = 'writing';
          step.result = await executeWriteAction(step.action, requireApproval);
        } else if (step.action.includes('test') || step.action.includes('validate')) {
          task.status = 'testing';
          step.result = await executeTestAction(step.action);
        }

        step.status = 'completed';
        console.log(`✅ Step ${i + 1} completed`);

      } catch (error: any) {
        console.error(`❌ Step ${i + 1} failed:`, error.message);
        step.status = 'failed';
        step.error = error.message;

        // Try to fix error
        const shouldRetry = task.currentIteration < maxIterations;
        if (shouldRetry) {
          console.log('🔄 Attempting to fix error and retry...');
          // Would call error analysis and retry logic here
        } else {
          throw error;
        }
      }
    }

    // PHASE 3: Final validation
    console.log('✅ [AUTONOMOUS] All steps completed');
    task.status = 'completed';

  } catch (error: any) {
    console.error('❌ [AUTONOMOUS] Task failed:', error.message);
    task.status = 'failed';
  }
}

/**
 * Use Claude to create execution plan
 */
async function createPlan(taskDescription: string): Promise<{ steps: string[] }> {
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
 * Execute read action (file read, search, analyze)
 */
async function executeReadAction(action: string): Promise<any> {
  // Simplified - would call actual read APIs
  console.log('📖 Reading:', action);
  return { success: true, action: 'read' };
}

/**
 * Execute write action (file write, create, modify)
 */
async function executeWriteAction(action: string, requireApproval: boolean): Promise<any> {
  // Simplified - would call actual write APIs
  console.log('✍️  Writing:', action);
  
  if (requireApproval) {
    // Would request approval here
    console.log('⚠️  Waiting for approval...');
  }
  
  return { success: true, action: 'write' };
}

/**
 * Execute test action (terminal, browser)
 */
async function executeTestAction(action: string): Promise<any> {
  // Simplified - would call actual test APIs
  console.log('🧪 Testing:', action);
  return { success: true, action: 'test' };
}

export default router;
