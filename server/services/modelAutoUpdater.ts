/**
 * AI MODEL AUTO-UPDATER SERVICE (Stream G - Oct 22, 2025)
 * Automatically detects deprecated models and updates codebase
 * Runs daily via cron job + on-demand API endpoint
 * MB.MD: Prevent "model 404" failures
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ModelStatus {
  modelId: string;
  provider: 'anthropic' | 'google' | 'openai';
  status: 'active' | 'deprecated' | 'unknown';
  recommendedReplacement?: string;
}

interface UpdateResult {
  filesScanned: number;
  filesUpdated: number;
  modelsReplaced: { old: string; new: string }[];
  errors: string[];
}

/**
 * Test if a Claude model is available
 */
async function testClaudeModel(modelId: string): Promise<boolean> {
  try {
    await anthropic.messages.create({
      model: modelId,
      max_tokens: 1,
      messages: [{ role: 'user', content: 'test' }],
    });
    return true;
  } catch (error: any) {
    if (error.status === 404) {
      return false; // Model deprecated
    }
    // Other errors (auth, rate limit) don't mean model is unavailable
    console.warn(`[ModelAutoUpdater] Could not verify ${modelId}: ${error.message}`);
    return true; // Assume available if we can't verify
  }
}

/**
 * Test if a Gemini model is available
 */
async function testGeminiModel(modelId: string): Promise<boolean> {
  try {
    const model = gemini.getGenerativeModel({ model: modelId });
    await model.generateContent('test');
    return true;
  } catch (error: any) {
    if (error.status === 404 || error.message?.includes('not found')) {
      return false;
    }
    console.warn(`[ModelAutoUpdater] Could not verify ${modelId}: ${error.message}`);
    return true;
  }
}

/**
 * Get latest available Claude model
 */
async function getLatestClaudeModel(): Promise<string> {
  const candidateModels = [
    'claude-3-7-sonnet-20250219',  // Latest as of Oct 22, 2025
    'claude-sonnet-4-5-20250929',
    'claude-3-5-sonnet-20240620',
  ];

  for (const model of candidateModels) {
    if (await testClaudeModel(model)) {
      console.log(`[ModelAutoUpdater] ✅ Latest Claude model: ${model}`);
      return model;
    }
  }

  return candidateModels[0]; // Fallback
}

/**
 * Get latest available Gemini model
 */
async function getLatestGeminiModel(): Promise<string> {
  const candidateModels = [
    'gemini-2.0-flash-exp',  // Latest as of Oct 22, 2025
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
  ];

  for (const model of candidateModels) {
    if (await testGeminiModel(model)) {
      console.log(`[ModelAutoUpdater] ✅ Latest Gemini model: ${model}`);
      return model;
    }
  }

  return candidateModels[0];
}

/**
 * Find all TypeScript files that reference AI models
 */
function findModelReferences(): string[] {
  try {
    const output = execSync(
      `grep -rl "claude-3.*sonnet\|gemini-1.*pro" server --include="*.ts" 2>/dev/null || true`,
      { encoding: 'utf-8' }
    );
    
    return output
      .split('\n')
      .filter(line => line.trim())
      .filter(file => !file.includes('node_modules'));
  } catch (error) {
    console.error('[ModelAutoUpdater] Error finding files:', error);
    return [];
  }
}

/**
 * Update deprecated model references in a file
 */
function updateFileModels(
  filePath: string,
  replacements: Map<string, string>
): boolean {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let updated = false;

    for (const [oldModel, newModel] of replacements.entries()) {
      const regex = new RegExp(oldModel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (regex.test(content)) {
        content = content.replace(regex, newModel);
        updated = true;
        console.log(`[ModelAutoUpdater] 📝 ${filePath}: ${oldModel} → ${newModel}`);
      }
    }

    if (updated) {
      writeFileSync(filePath, content, 'utf-8');
    }

    return updated;
  } catch (error: any) {
    console.error(`[ModelAutoUpdater] Error updating ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main auto-update function
 */
export async function autoUpdateDeprecatedModels(): Promise<UpdateResult> {
  console.log('[ModelAutoUpdater] 🔍 Starting model deprecation check...');

  const result: UpdateResult = {
    filesScanned: 0,
    filesUpdated: 0,
    modelsReplaced: [],
    errors: [],
  };

  try {
    // Step 1: Get latest models
    const latestClaude = await getLatestClaudeModel();
    const latestGemini = await getLatestGeminiModel();

    // Step 2: Build replacement map for known deprecated models
    const replacements = new Map<string, string>([
      // Claude deprecations
      ['claude-3-5-sonnet-20241022', latestClaude],
      ['claude-3-5-sonnet-20240620', latestClaude],
      
      // Gemini deprecations
      ['gemini-1.5-pro-latest', latestGemini],
      ['gemini-1.5-pro', latestGemini],
    ]);

    // Step 3: Find all files with model references
    const files = findModelReferences();
    result.filesScanned = files.length;

    console.log(`[ModelAutoUpdater] 📂 Found ${files.length} files with model references`);

    // Step 4: Update each file
    for (const file of files) {
      if (updateFileModels(file, replacements)) {
        result.filesUpdated++;
      }
    }

    // Step 5: Track what was replaced
    for (const [old, newModel] of replacements.entries()) {
      result.modelsReplaced.push({ old, new: newModel });
    }

    console.log(`[ModelAutoUpdater] ✅ Updated ${result.filesUpdated} files`);
    
    // Step 6: Save update log
    const logPath = join(process.cwd(), 'server/logs/model-updates.log');
    const logEntry = `${new Date().toISOString()} - Updated ${result.filesUpdated} files\n${JSON.stringify(result.modelsReplaced, null, 2)}\n`;
    
    try {
      writeFileSync(logPath, logEntry, { flag: 'a' });
    } catch {
      // Log directory might not exist, create it
      execSync('mkdir -p server/logs');
      writeFileSync(logPath, logEntry);
    }

  } catch (error: any) {
    result.errors.push(error.message);
    console.error('[ModelAutoUpdater] ❌ Update failed:', error);
  }

  return result;
}

/**
 * Check for deprecated models without updating
 */
export async function checkDeprecatedModels(): Promise<ModelStatus[]> {
  const statuses: ModelStatus[] = [];

  // Known models to check
  const modelsToCheck = [
    { id: 'claude-3-5-sonnet-20241022', provider: 'anthropic' as const },
    { id: 'claude-3-7-sonnet-20250219', provider: 'anthropic' as const },
    { id: 'gemini-1.5-pro-latest', provider: 'google' as const },
    { id: 'gemini-2.0-flash-exp', provider: 'google' as const },
  ];

  for (const { id, provider } of modelsToCheck) {
    let isActive = false;

    if (provider === 'anthropic') {
      isActive = await testClaudeModel(id);
    } else if (provider === 'google') {
      isActive = await testGeminiModel(id);
    }

    statuses.push({
      modelId: id,
      provider,
      status: isActive ? 'active' : 'deprecated',
      recommendedReplacement: !isActive ? await getLatestClaudeModel() : undefined,
    });
  }

  return statuses;
}

export default {
  autoUpdateDeprecatedModels,
  checkDeprecatedModels,
};
