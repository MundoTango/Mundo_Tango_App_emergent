import { Router, Request, Response } from 'express';
import OpenAI from 'openai';

/**
 * Agent #77: AI Site Builder Backend API
 * Generate entire pages from text descriptions
 */

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const COMPONENT_LIBRARY = [
  { name: 'Button', import: '@/components/ui/button' },
  { name: 'Card', import: '@/components/ui/card' },
  { name: 'Input', import: '@/components/ui/input' },
  { name: 'Badge', import: '@/components/ui/badge' },
  { name: 'Tabs', import: '@/components/ui/tabs' },
  { name: 'Table', import: '@/components/ui/table' },
  { name: 'Dialog', import: '@/components/ui/dialog' },
  { name: 'Select', import: '@/components/ui/select' },
  { name: 'Chart (Recharts)', import: 'recharts' }
];

/**
 * Generate page from description
 */
router.post('/api/site-builder/generate', async (req: Request, res: Response) => {
  try {
    const { description, template, componentLibrary } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description required' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are Agent #77 (AI Site Builder) - an expert at generating React/TypeScript pages.

Your task: Generate a complete, production-ready React component based on the user's description.

Available components (use these):
${(componentLibrary || COMPONENT_LIBRARY).map((c: any) => `- ${c.name} (import from '${c.import}')`).join('\n')}

Requirements:
1. Use TypeScript with proper types
2. Use Tailwind CSS for styling
3. Follow shadcn/ui patterns
4. Mobile-first responsive design
5. Include proper data-testid attributes
6. Add comments for complex logic
7. Export default component

Output JSON format:
{
  "code": "<complete React component code>",
  "preview": "<HTML preview for iframe>",
  "components": ["<list of shadcn components used>"],
  "explanation": "<brief description of what was generated>"
}`
        },
        {
          role: 'user',
          content: `Generate a React page: ${description}${template ? `\n\nUsing template: ${template}` : ''}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    res.json({
      code: result.code || 'export default function GeneratedPage() { return <div>Error generating page</div>; }',
      preview: result.preview || '<div>Preview unavailable</div>',
      components: result.components || [],
      explanation: result.explanation || 'Page generated from AI'
    });
  } catch (error) {
    console.error('Page generation error:', error);
    res.status(500).json({
      error: 'Failed to generate page',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get available templates
 */
router.get('/api/site-builder/templates', (req: Request, res: Response) => {
  const templates = [
    {
      id: 'dashboard',
      name: 'User Dashboard',
      description: 'Stats cards, charts, recent activity',
      category: 'app',
      code: `export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {/* Stats cards */}
      {/* Charts */}
      {/* Recent activity */}
    </div>
  );
}`
    },
    {
      id: 'landing',
      name: 'Landing Page',
      description: 'Hero section, features, CTA, testimonials',
      category: 'marketing',
      code: `export default function LandingPage() {
  return (
    <div>
      {/* Hero section */}
      {/* Features */}
      {/* CTA */}
      {/* Testimonials */}
    </div>
  );
}`
    }
  ];

  res.json(templates);
});

export default router;
