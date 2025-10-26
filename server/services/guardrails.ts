/**
 * AGENT #146: Guardrails & Safety Layer
 * Runtime hallucination detection, PII filtering, toxicity checks
 * MB.MD: Production safety patterns from research
 */

import Anthropic from '@anthropic-ai/sdk';

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface GuardrailCheckResult {
  passed: boolean;
  reason?: string;
  severity?: 'low' | 'medium' | 'high';
  suggestedAction?: 'retry' | 'block' | 'warn';
}

/**
 * Check for hallucinations in AI responses
 * Uses Claude to verify if response is grounded in provided context
 */
export async function detectHallucination(
  response: string,
  context?: string
): Promise<GuardrailCheckResult> {
  if (!context || context.length < 50) {
    // Can't verify without context
    return { passed: true };
  }
  
  try {
    const verificationPrompt = `You are a hallucination detector. Analyze if the following AI response contains information that is NOT supported by the given context.

Context:
${context}

AI Response:
${response}

Does the response contain any unsupported claims or fabricated information? Respond with:
- "SAFE" if response is fully grounded in context
- "HALLUCINATION" if response contains unsupported claims
- Include brief explanation

Response:`;

    const result = await claude.messages.create({
      model: 'claude-3-haiku-20240307', // Fast, cheap model for checks
      max_tokens: 200,
      messages: [{ role: 'user', content: verificationPrompt }],
    });
    
    const verification = result.content[0].type === 'text' ? result.content[0].text : '';
    const isHallucination = verification.toLowerCase().includes('hallucination');
    
    return {
      passed: !isHallucination,
      reason: isHallucination ? 'Response contains unsupported claims' : undefined,
      severity: isHallucination ? 'high' : 'low',
      suggestedAction: isHallucination ? 'retry' : 'warn',
    };
  } catch (error) {
    console.error('❌ [Guardrails] Hallucination check failed:', error);
    // Fail open - don't block on check errors
    return { passed: true };
  }
}

/**
 * Check for PII (Personally Identifiable Information) in text
 */
export function detectPII(text: string): GuardrailCheckResult {
  const patterns = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  };
  
  const detected = [];
  
  for (const [type, pattern] of Object.entries(patterns)) {
    const matches = text.match(pattern);
    if (matches) {
      detected.push(`${type} (${matches.length} instance${matches.length > 1 ? 's' : ''})`);
    }
  }
  
  if (detected.length > 0) {
    return {
      passed: false,
      reason: `Detected PII: ${detected.join(', ')}`,
      severity: 'high',
      suggestedAction: 'block',
    };
  }
  
  return { passed: true };
}

/**
 * Check for toxic or harmful content
 */
export function detectToxicity(text: string): GuardrailCheckResult {
  const toxicPatterns = [
    /\b(kill|murder|harm|attack)\s+(yourself|myself)\b/i,
    /\b(hack|exploit|bypass)\s+(security|auth|login)\b/i,
    /\b(steal|copy)\s+(data|password|credentials)\b/i,
  ];
  
  for (const pattern of toxicPatterns) {
    if (pattern.test(text)) {
      return {
        passed: false,
        reason: 'Detected potentially harmful content',
        severity: 'high',
        suggestedAction: 'block',
      };
    }
  }
  
  return { passed: true };
}

/**
 * Check code validity (for code generation responses)
 */
export function checkCodeValidity(code: string, language: 'typescript' | 'javascript' | 'python' = 'typescript'): GuardrailCheckResult {
  // Basic syntax checks
  const issues = [];
  
  if (language === 'typescript' || language === 'javascript') {
    // Check for unmatched braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      issues.push('Unmatched braces');
    }
    
    // Check for unmatched parentheses
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      issues.push('Unmatched parentheses');
    }
    
    // Check for incomplete strings
    const singleQuotes = (code.match(/'/g) || []).length;
    const doubleQuotes = (code.match(/"/g) || []).length;
    if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
      issues.push('Incomplete strings');
    }
  }
  
  if (issues.length > 0) {
    return {
      passed: false,
      reason: `Code validation failed: ${issues.join(', ')}`,
      severity: 'medium',
      suggestedAction: 'retry',
    };
  }
  
  return { passed: true };
}

/**
 * Comprehensive validation pipeline
 */
export async function validateResponse(
  response: string,
  options: {
    context?: string;
    checkHallucination?: boolean;
    checkPII?: boolean;
    checkToxicity?: boolean;
    checkCode?: boolean;
  } = {}
): Promise<{ passed: boolean; blocked: boolean; issues: GuardrailCheckResult[] }> {
  const checks: GuardrailCheckResult[] = [];
  
  // Run all enabled checks
  if (options.checkPII !== false) {
    checks.push(detectPII(response));
  }
  
  if (options.checkToxicity !== false) {
    checks.push(detectToxicity(response));
  }
  
  if (options.checkCode && response.includes('```')) {
    checks.push(checkCodeValidity(response));
  }
  
  if (options.checkHallucination && options.context) {
    const hallucinationCheck = await detectHallucination(response, options.context);
    checks.push(hallucinationCheck);
  }
  
  const failedChecks = checks.filter(c => !c.passed);
  const shouldBlock = failedChecks.some(c => c.suggestedAction === 'block');
  
  return {
    passed: failedChecks.length === 0,
    blocked: shouldBlock,
    issues: failedChecks,
  };
}

/**
 * Filter/redact PII from text
 */
export function redactPII(text: string): string {
  return text
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]')
    .replace(/\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[PHONE_REDACTED]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]')
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD_REDACTED]');
}
