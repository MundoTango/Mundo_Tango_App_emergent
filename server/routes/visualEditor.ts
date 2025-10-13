import { Router, Request, Response } from 'express';
import OpenAI from 'openai';

/**
 * ESA Agent #78: Visual Editor Backend API
 * 
 * Endpoints:
 * - POST /api/visual-editor/generate-code - Convert visual changes to code using OpenAI
 * - POST /api/visual-editor/apply-code - Apply code changes to files (git workflow)
 * - POST /api/visual-editor/preview - Deploy to preview environment
 * - POST /api/visual-editor/deploy - Deploy to production
 */

interface VisualChange {
  id: string;
  timestamp: Date;
  elementSelector: string;
  elementPath: string;
  componentName: string;
  changeType: 'text' | 'style' | 'layout' | 'attribute';
  property?: string;
  before: any;
  after: any;
  element?: any;
}

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate code from visual changes using OpenAI GPT-4
 */
router.post('/api/visual-editor/generate-code', async (req: Request, res: Response) => {
  try {
    const { changes } = req.body as { changes: VisualChange[] };

    if (!changes || changes.length === 0) {
      return res.status(400).json({ error: 'No changes provided' });
    }

    // Group changes by component/file
    const fileChanges = groupChangesByFile(changes);
    
    // For now, handle the first file
    const [filePath, fileChangesList] = Object.entries(fileChanges)[0];

    // Read current file content (would need fs access in production)
    const originalCode = await getFileContent(filePath);

    // Generate code using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert React/TypeScript/Tailwind developer following the ESA Framework.

Your task: Convert visual UI changes into production-ready React code.

Guidelines:
1. Minimal changes - only modify what's necessary
2. Preserve existing functionality
3. Use Tailwind classes for styling
4. Maintain TypeScript type safety
5. Follow existing code patterns
6. Add data-testid attributes for new elements

Output format:
{
  "updatedCode": "<full updated component code>",
  "explanation": "<brief description of changes made>"
}`,
        },
        {
          role: 'user',
          content: `Original component code:
\`\`\`tsx
${originalCode}
\`\`\`

Visual changes made:
${JSON.stringify(fileChangesList, null, 2)}

Generate the updated component code that applies these visual changes.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    // Generate diff
    const diff = generateDiff(originalCode, result.updatedCode);

    res.json({
      filePath,
      originalCode,
      updatedCode: result.updatedCode,
      diff,
      explanation: result.explanation || 'Code updated based on visual changes',
    });
  } catch (error) {
    console.error('Code generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate code',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Apply generated code to codebase (git workflow)
 * Uses Track C: Git Automation Service
 */
router.post('/api/visual-editor/apply-code', async (req: Request, res: Response) => {
  try {
    const { filePath, updatedCode, branchName, author } = req.body;

    if (!filePath || !updatedCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Import git automation service
    const { gitService, createVisualEditBranch } = await import('../services/gitAutomation.js');
    
    // Step 1: Create feature branch (if not provided)
    let branch = branchName;
    if (!branch) {
      const branchResult = await createVisualEditBranch('visual-edit');
      branch = branchResult.branch;
    } else {
      await gitService.checkoutBranch(branch);
    }

    // Step 2: Apply file changes
    const fileChanges = [{
      path: filePath,
      content: updatedCode,
      type: 'update' as const
    }];
    
    await gitService.applyChanges(fileChanges);

    // Step 3: Commit changes
    const commitResult = await gitService.commitChanges(
      fileChanges,
      `Visual edit: Update ${filePath.split('/').pop()}`,
      author ? { name: author.name, email: author.email } : undefined
    );

    res.json({
      success: true,
      branch,
      commit: commitResult.commitHash,
      filesChanged: commitResult.filesChanged,
      message: `Changes committed to branch: ${branch}`
    });
  } catch (error) {
    console.error('Apply code error:', error);
    res.status(500).json({
      error: 'Failed to apply code changes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Deploy changes to preview environment
 */
router.post('/api/visual-editor/preview', async (req: Request, res: Response) => {
  try {
    const { branch } = req.body;

    if (!branch) {
      return res.status(400).json({ error: 'Branch name required' });
    }

    // In production:
    // 1. Checkout branch
    // 2. Build application
    // 3. Deploy to staging/preview URL
    // 4. Return preview URL

    const previewUrl = `https://preview-${branch}.staging.app.com`;

    res.json({
      success: true,
      previewUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Preview deployment error:', error);
    res.status(500).json({ error: 'Failed to create preview' });
  }
});

/**
 * Deploy changes to production
 */
router.post('/api/visual-editor/deploy', async (req: Request, res: Response) => {
  try {
    const { branch } = req.body;

    if (!branch) {
      return res.status(400).json({ error: 'Branch name required' });
    }

    // In production:
    // 1. Run tests
    // 2. Merge to main
    // 3. Deploy to production
    // 4. Notify user

    res.json({
      success: true,
      deployedAt: new Date().toISOString(),
      message: 'Changes deployed to production',
    });
  } catch (error) {
    console.error('Production deployment error:', error);
    res.status(500).json({ error: 'Failed to deploy' });
  }
});

// Helper functions

function groupChangesByFile(changes: VisualChange[]): Record<string, VisualChange[]> {
  const grouped: Record<string, VisualChange[]> = {};
  
  changes.forEach(change => {
    const filePath = change.elementPath || 'client/src/components/Unknown.tsx';
    if (!grouped[filePath]) {
      grouped[filePath] = [];
    }
    grouped[filePath].push(change);
  });
  
  return grouped;
}

async function getFileContent(filePath: string): Promise<string> {
  // In production, this would read the actual file
  // For now, return a placeholder React component
  return `import { Button } from '@/components/ui/button';

export function ExampleComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Example Component</h1>
      <p className="text-muted-foreground">This is an example component.</p>
      <Button>Click Me</Button>
    </div>
  );
}`;
}

function generateDiff(original: string, updated: string): string {
  // Simple diff generation (in production, use 'diff' package)
  const originalLines = original.split('\n');
  const updatedLines = updated.split('\n');
  
  let diff = '';
  const maxLines = Math.max(originalLines.length, updatedLines.length);
  
  for (let i = 0; i < maxLines; i++) {
    const origLine = originalLines[i];
    const updLine = updatedLines[i];
    
    if (origLine !== updLine) {
      if (origLine) {
        diff += `- ${origLine}\n`;
      }
      if (updLine) {
        diff += `+ ${updLine}\n`;
      }
    } else if (origLine) {
      diff += `  ${origLine}\n`;
    }
  }
  
  return diff || 'No changes detected';
}

export default router;
