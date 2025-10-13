import { Router, Request, Response } from 'express';
import OpenAI from 'openai';

/**
 * Agent #79: Quality Validator Backend API
 * Root cause analysis, pattern library search, agent collaboration
 */

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Pattern {
  id: string;
  issue: string;
  rootCause: string;
  solution: string;
  codeExample: string;
  similarityScore: number;
  timesReused: number;
  effectiveness: number;
  agentId: string;
}

// In-memory pattern library (production would use LanceDB)
const patternLibrary: Pattern[] = [
  {
    id: '1',
    issue: 'Form submission not working',
    rootCause: 'Event handler missing preventDefault()',
    solution: 'Add e.preventDefault() to form onSubmit handler',
    codeExample: `const handleSubmit = (e: FormEvent) => {\n  e.preventDefault();\n  // form logic\n};`,
    similarityScore: 0,
    timesReused: 15,
    effectiveness: 0.95,
    agentId: 'AGENT_2'
  },
  {
    id: '2',
    issue: 'Data not displaying after API call',
    rootCause: 'Missing useEffect dependency',
    solution: 'Add all dependencies to useEffect dependency array',
    codeExample: `useEffect(() => {\n  fetchData();\n}, [fetchData]); // Add dependencies`,
    similarityScore: 0,
    timesReused: 22,
    effectiveness: 0.92,
    agentId: 'AGENT_1'
  }
];

/**
 * Analyze issue and find root cause
 */
router.post('/api/quality-validator/analyze', async (req: Request, res: Response) => {
  try {
    const { issue } = req.body;

    if (!issue) {
      return res.status(400).json({ error: 'Issue description required' });
    }

    // Use OpenAI to analyze root cause
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are Agent #79 (Quality Validator) - an expert at diagnosing software issues and finding root causes.

Analyze the issue and provide:
1. Root cause (technical reason)
2. Suggested fix (specific solution)
3. Preventive measure (avoid future occurrences)

Be concise and technical. Focus on actionable insights.`
        },
        {
          role: 'user',
          content: `Issue: ${issue}\n\nAnalyze the root cause and suggest a fix.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    // Search for related patterns (semantic similarity)
    const relatedPatterns = patternLibrary
      .map(pattern => ({
        ...pattern,
        similarityScore: calculateSimilarity(issue, pattern.issue)
      }))
      .filter(p => p.similarityScore > 0.7)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 3);

    res.json({
      issue,
      rootCause: analysis.rootCause || 'Unable to determine root cause',
      suggestedFix: analysis.suggestedFix || 'No fix suggested',
      relatedPatterns
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze issue',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Search pattern library
 */
router.post('/api/quality-validator/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }

    // Semantic search (simple keyword matching for now, use LanceDB in production)
    const results = patternLibrary
      .map(pattern => ({
        ...pattern,
        similarityScore: calculateSimilarity(query, pattern.issue + ' ' + pattern.solution)
      }))
      .filter(p => p.similarityScore > 0.5)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 10);

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Pattern search failed' });
  }
});

/**
 * Request help from peer agents (A2A communication)
 */
router.post('/api/quality-validator/collaborate', async (req: Request, res: Response) => {
  try {
    const { issue, agentIds } = req.body;

    if (!issue || !agentIds || !Array.isArray(agentIds)) {
      return res.status(400).json({ error: 'Issue and agent IDs required' });
    }

    // In production: Send A2A messages to specified agents
    // For now: Log collaboration request
    console.log('[Agent #79] Requesting collaboration:', {
      issue,
      requestedAgents: agentIds,
      timestamp: new Date().toISOString()
    });

    // Simulate agent responses
    const responses = agentIds.map(agentId => ({
      agentId,
      response: `Agent ${agentId} is analyzing the issue...`,
      status: 'pending'
    }));

    res.json({
      collaborationId: `collab-${Date.now()}`,
      issue,
      agents: responses,
      status: 'initiated'
    });
  } catch (error) {
    console.error('Collaboration error:', error);
    res.status(500).json({ error: 'Collaboration request failed' });
  }
});

/**
 * Add pattern to library
 */
router.post('/api/quality-validator/add-pattern', async (req: Request, res: Response) => {
  try {
    const { issue, rootCause, solution, codeExample, agentId } = req.body;

    const newPattern: Pattern = {
      id: `pattern-${Date.now()}`,
      issue,
      rootCause,
      solution,
      codeExample: codeExample || '',
      similarityScore: 0,
      timesReused: 0,
      effectiveness: 0,
      agentId: agentId || 'UNKNOWN'
    };

    patternLibrary.push(newPattern);

    res.json({
      success: true,
      pattern: newPattern,
      totalPatterns: patternLibrary.length
    });
  } catch (error) {
    console.error('Add pattern error:', error);
    res.status(500).json({ error: 'Failed to add pattern' });
  }
});

/**
 * Helper: Calculate text similarity (simple implementation)
 * Production would use vector embeddings (LanceDB)
 */
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const commonWords = words1.filter(word => words2.includes(word));
  const similarity = commonWords.length / Math.max(words1.length, words2.length);
  
  return Math.min(similarity * 2, 1); // Boost score, cap at 1
}

export default router;
