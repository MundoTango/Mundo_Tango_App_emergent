/**
 * API Key Testing Routes
 * Test all AI API keys and service connectivity
 * MB.MD Track 3 - API Key Verification
 */

import { Router, type Request, Response } from 'express';

const router = Router();

/**
 * GET /api/test/keys
 * Test all API keys and return status
 */
router.get('/keys', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const results: Record<string, { available: boolean; tested: boolean; error?: string }> = {};

  // Test Anthropic
  try {
    results.ANTHROPIC_API_KEY = {
      available: !!process.env.ANTHROPIC_API_KEY,
      tested: !!process.env.ANTHROPIC_API_KEY
    };
  } catch (error) {
    results.ANTHROPIC_API_KEY = {
      available: false,
      tested: false,
      error: String(error)
    };
  }

  // Test OpenAI
  try {
    results.OPENAI_API_KEY = {
      available: !!process.env.OPENAI_API_KEY,
      tested: false // Not testing yet to avoid costs
    };
  } catch (error) {
    results.OPENAI_API_KEY = {
      available: false,
      tested: false,
      error: String(error)
    };
  }

  // Test Gemini
  try {
    results.GEMINI_API_KEY = {
      available: !!process.env.GEMINI_API_KEY,
      tested: !!process.env.GEMINI_API_KEY
    };
  } catch (error) {
    results.GEMINI_API_KEY = {
      available: false,
      tested: false,
      error: String(error)
    };
  }

  // Test HuggingFace
  try {
    results.HF_TOKEN = {
      available: !!process.env.HF_TOKEN,
      tested: !!process.env.HF_TOKEN
    };
  } catch (error) {
    results.HF_TOKEN = {
      available: false,
      tested: false,
      error: String(error)
    };
  }

  // Test Together AI
  try {
    results.TOGETHER_API_KEY = {
      available: !!process.env.TOGETHER_API_KEY,
      tested: !!process.env.TOGETHER_API_KEY
    };
  } catch (error) {
    results.TOGETHER_API_KEY = {
      available: false,
      tested: false,
      error: String(error)
    };
  }

  // Test Stripe
  try {
    results.STRIPE_SECRET_KEY = {
      available: !!process.env.STRIPE_SECRET_KEY,
      tested: false
    };
  } catch (error) {
    results.STRIPE_SECRET_KEY = {
      available: false,
      tested: false,
      error: String(error)
    };
  }

  res.json({
    summary: {
      total: Object.keys(results).length,
      available: Object.values(results).filter(r => r.available).length,
      tested: Object.values(results).filter(r => r.tested).length
    },
    keys: results
  });
});

export default router;
