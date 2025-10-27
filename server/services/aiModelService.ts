/**
 * AI Model Service - Real AI Integration
 * Provides consistent interface for Mr Blue chat with actual AI model calls
 * MB.MD Phase: Backend AI Integration - PRODUCTION READY
 */

/**
 * Call AI model with message history
 * Uses multiModelOrchestrator for real AI responses (Claude, GPT, Gemini)
 */
async function callAI(messages: any[], model: string = 'claude-3-sonnet') {
  console.log(`🤖 [AI Service] Calling ${model} with ${messages.length} messages`);
  
  try {
    // Dynamic import of ESM module
    const { MultiModelOrchestrator } = await import('../services/multiModelOrchestrator.js');
    const orchestrator = new MultiModelOrchestrator();

    // Stream response from AI model
    let fullContent = '';
    for await (const chunk of orchestrator.streamResponse(messages, model)) {
      fullContent += chunk;
    }

    console.log(`✅ [AI Service] Got response: ${fullContent.substring(0, 100)}...`);

    return {
      content: fullContent,
      model,
      usage: {
        totalTokens: Math.ceil(fullContent.length / 4)
      }
    };
  } catch (error) {
    console.error(`❌ [AI Service] Error calling AI:`, error);
    
    // Fallback to helpful error message
    return {
      content: `I encountered an error connecting to the AI service. Please check that your API keys are configured in Secrets. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      model,
      usage: { totalTokens: 0 }
    };
  }
}

// CommonJS export matching the require() pattern in mrBlueRoutes.ts
module.exports = {
  aiModelService: {
    callAI
  }
};
