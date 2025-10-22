/**
 * AI Model Monitoring Service
 * Automatically checks for new models and deprecations 4x daily
 * MB.MD: Prevent deprecated model failures
 */

import Anthropic from '@anthropic-ai/sdk';
import cron from 'node-cron';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ModelInfo {
  id: string;
  created: string;
  display_name: string;
  type: string;
}

interface ModelRegistry {
  lastChecked: string;
  currentModels: ModelInfo[];
  recommendedModel: string;
}

const REGISTRY_PATH = join(process.cwd(), 'server/config/model-registry.json');

/**
 * Fetch all available Claude models from Anthropic API
 */
async function fetchAvailableModels(): Promise<ModelInfo[]> {
  try {
    // Anthropic doesn't have a public models list API yet, so we test known models
    const knownModels = [
      'claude-3-7-sonnet-20250219',
      'claude-sonnet-4-5-20250929',
      'claude-3-5-sonnet-20240620',
      'claude-3-opus-20240229',
    ];

    const availableModels: ModelInfo[] = [];

    for (const modelId of knownModels) {
      try {
        // Test if model is available by making a minimal request
        await anthropic.messages.create({
          model: modelId,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }],
        });

        availableModels.push({
          id: modelId,
          created: new Date().toISOString(),
          display_name: modelId,
          type: 'text',
        });
        console.log(`✅ Model available: ${modelId}`);
      } catch (error: any) {
        if (error.status === 404) {
          console.log(`❌ Model deprecated/unavailable: ${modelId}`);
        } else {
          // Other errors (auth, rate limit, etc.) don't mean model is unavailable
          console.log(`⚠️  Could not verify ${modelId}: ${error.message}`);
        }
      }
    }

    return availableModels;
  } catch (error) {
    console.error('[Model Monitor] Error fetching models:', error);
    return [];
  }
}

/**
 * Get recommended model (newest available Sonnet)
 */
function getRecommendedModel(models: ModelInfo[]): string {
  // Prefer Claude 4.x over 3.x
  const claude4Models = models.filter(m => m.id.includes('claude-sonnet-4'));
  if (claude4Models.length > 0) {
    // Sort by date descending
    claude4Models.sort((a, b) => b.id.localeCompare(a.id));
    return claude4Models[0].id;
  }

  // Fall back to 3.5 Sonnet
  const claude35Models = models.filter(m => m.id.includes('claude-3-5-sonnet'));
  if (claude35Models.length > 0) {
    claude35Models.sort((a, b) => b.id.localeCompare(a.id));
    return claude35Models[0].id;
  }

  // Last resort: any available model
  return models[0]?.id || 'claude-sonnet-4-5-20250929';
}

/**
 * Update model registry with latest information
 */
async function updateModelRegistry(): Promise<void> {
  console.log('[Model Monitor] 🔍 Checking for model updates...');

  const models = await fetchAvailableModels();
  
  if (models.length === 0) {
    console.log('[Model Monitor] ⚠️  No models available - keeping current configuration');
    return;
  }

  const registry: ModelRegistry = {
    lastChecked: new Date().toISOString(),
    currentModels: models,
    recommendedModel: getRecommendedModel(models),
  };

  // Save registry
  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));

  console.log(`[Model Monitor] ✅ Registry updated - ${models.length} models available`);
  console.log(`[Model Monitor] 🎯 Recommended model: ${registry.recommendedModel}`);

  // Auto-update orchestrator if recommended model changed
  await autoUpdateOrchestrator(registry.recommendedModel);
}

/**
 * Auto-update universalToolOrchestrator.ts with new model
 */
async function autoUpdateOrchestrator(newModel: string): Promise<void> {
  try {
    const orchestratorPath = join(process.cwd(), 'server/services/tools/universalToolOrchestrator.ts');
    let content = readFileSync(orchestratorPath, 'utf-8');

    const currentModelMatch = content.match(/model: '([^']+)'/);
    const currentModel = currentModelMatch?.[1];

    if (currentModel === newModel) {
      console.log(`[Model Monitor] 📌 Model already up to date: ${currentModel}`);
      return;
    }

    // Replace all model references
    const updatedContent = content.replace(/model: '[^']+'/g, `model: '${newModel}'`);
    writeFileSync(orchestratorPath, updatedContent);

    console.log(`[Model Monitor] 🔄 Auto-updated model: ${currentModel} → ${newModel}`);
    console.log('[Model Monitor] ⚠️  Please restart the server to apply changes');
  } catch (error) {
    console.error('[Model Monitor] ❌ Failed to auto-update:', error);
  }
}

/**
 * Load saved registry
 */
function loadRegistry(): ModelRegistry | null {
  try {
    const data = readFileSync(REGISTRY_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Start model monitoring cron job (runs 4x daily: 6am, 12pm, 6pm, 12am)
 */
export function startModelMonitoring(): void {
  console.log('[Model Monitor] 🚀 Starting automated model monitoring...');

  // Check immediately on startup
  updateModelRegistry().catch(console.error);

  // Schedule: Every 6 hours (4x daily)
  cron.schedule('0 */6 * * *', () => {
    console.log('[Model Monitor] ⏰ Scheduled check running...');
    updateModelRegistry().catch(console.error);
  });

  console.log('[Model Monitor] ✅ Cron job scheduled - checks every 6 hours');
}

/**
 * Get current recommended model
 */
export function getCurrentModel(): string {
  const registry = loadRegistry();
  return registry?.recommendedModel || 'claude-sonnet-4-5-20250929';
}
