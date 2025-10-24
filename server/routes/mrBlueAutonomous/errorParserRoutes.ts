import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ErrorAnalysis {
  cause: string;
  suggestedFix: string;
  affectedFiles: string[];
  severity: 'low' | 'medium' | 'high';
  category: string;
}

/**
 * POST /api/mrblue/analyze-error
 * Parse error and suggest fixes using AI
 */
router.post('/analyze-error', async (req, res) => {
  try {
    const { error, context, stackTrace } = req.body;

    if (!error || typeof error !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'error is required and must be a string'
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 [MR BLUE - ERROR ANALYSIS]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ Error:', error.substring(0, 200));

    // Use Claude to analyze error
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929', // Claude Sonnet 4.5 - replacement for deprecated 3.5 Sonnet
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Analyze this error and provide a fix.

Error: ${error}

${context ? `Context: ${context}` : ''}
${stackTrace ? `Stack Trace: ${stackTrace}` : ''}

Provide your analysis in this exact JSON format:
{
  "cause": "brief explanation of the root cause",
  "suggestedFix": "specific code fix or action to take",
  "affectedFiles": ["list", "of", "files"],
  "severity": "low|medium|high",
  "category": "syntax|runtime|logic|dependency|configuration"
}

Return ONLY valid JSON, no other text.`
      }]
    });

    // Parse Claude's response
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    let analysis: ErrorAnalysis;
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if AI didn't return JSON
        analysis = {
          cause: 'Unknown error',
          suggestedFix: responseText || 'Review the error message and stack trace',
          affectedFiles: [],
          severity: 'medium',
          category: 'unknown'
        };
      }
    } catch (parseError) {
      // Fallback parsing
      analysis = {
        cause: error,
        suggestedFix: responseText,
        affectedFiles: [],
        severity: 'medium',
        category: 'unknown'
      };
    }

    console.log('✅ Error analyzed');
    console.log('📊 Analysis:', {
      cause: analysis.cause.substring(0, 100),
      severity: analysis.severity,
      category: analysis.category
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.json({
      success: true,
      data: analysis
    });

  } catch (error: any) {
    console.error('❌ [ERROR ANALYSIS ERROR]:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
