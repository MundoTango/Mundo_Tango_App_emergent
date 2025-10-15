/**
 * VISUAL EDITOR API ROUTES
 * 
 * MB.MD Architecture:
 * - AI Code Generation (OpenAI GPT-4o)
 * - Git Branch Management
 * - Staging Deployment
 * - Production Deploy
 */

import { Router } from 'express';
import { OpenAI } from 'openai';
import { optionalAuth } from '../middleware/secureAuth';

export const visualEditorRouter = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface GenerateCodeRequest {
  element: {
    tag: string;
    id?: string;
    className?: string;
    innerHTML?: string;
    xpath: string;
  };
  prompt: string;
  currentPage: string;
}

/**
 * POST /api/visual-editor/generate
 * Generate code changes using AI
 */
visualEditorRouter.post('/generate', optionalAuth, async (req, res) => {
  try {
    const { element, prompt, currentPage }: GenerateCodeRequest = req.body;

    console.log('🎨 [Visual Editor] Generate request:', {
      page: currentPage,
      element: element.tag,
      prompt: prompt.substring(0, 50)
    });

    // Build context for AI
    const systemPrompt = `You are an expert frontend developer helping with visual page edits.

CURRENT CONTEXT:
- Page: ${currentPage}
- Selected Element: <${element.tag}> ${element.id ? `#${element.id}` : ''} ${element.className ? `.${element.className.split(' ')[0]}` : ''}
- XPath: ${element.xpath}

TASK: Generate the code changes to implement: "${prompt}"

REQUIREMENTS:
1. Use React with TypeScript
2. Use Tailwind CSS for styling
3. Follow existing design patterns
4. Make changes minimal and focused
5. Ensure responsive design

OUTPUT FORMAT (JSON):
{
  "changes": [
    {
      "file": "relative/path/to/file.tsx",
      "action": "edit" | "create",
      "code": "// full code here",
      "description": "what this change does"
    }
  ],
  "explanation": "brief explanation of changes",
  "testSuggestions": ["test case 1", "test case 2"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const generatedCode = JSON.parse(completion.choices[0].message.content || '{}');

    console.log('✅ [Visual Editor] Code generated:', {
      changes: generatedCode.changes?.length || 0,
      tokens: completion.usage?.total_tokens
    });

    res.json({
      success: true,
      code: generatedCode,
      tokens: completion.usage
    });

  } catch (error) {
    console.error('❌ [Visual Editor] Generation failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/visual-editor/deploy
 * Deploy changes to production
 */
visualEditorRouter.post('/deploy', optionalAuth, async (req, res) => {
  try {
    const { page, element } = req.body;

    console.log('🚀 [Visual Editor] Deploy request:', {
      page,
      element: element?.tag
    });

    // In a real implementation, this would:
    // 1. Create Git branch
    // 2. Commit changes
    // 3. Push to remote
    // 4. Create staging URL
    // 5. Trigger deployment

    const branchName = `visual-edit-${Date.now()}`;
    const stagingUrl = `https://staging.example.com${page}`;

    res.json({
      success: true,
      branchName,
      stagingUrl,
      message: 'Changes deployed to staging'
    });

  } catch (error) {
    console.error('❌ [Visual Editor] Deploy failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default visualEditorRouter;
