import OpenAI from 'openai';
import { promises as fs } from 'fs';
import path from 'path';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cache for translations to avoid repeated API calls
const translationCache = new Map<string, any>();

// Lunfardo dictionary for Argentine Spanish customization
const lunfardoDictionary: Record<string, string> = {
  // Greetings
  'Hello': '¿Qué hacés, che?',
  'Hi': '¿Qué onda?',
  'Good morning': 'Buen día, maestro',
  'Welcome': 'Bienvenido, pibe',
  
  // Common terms
  'friend': 'pibe',
  'friends': 'la muchachada',
  'work': 'laburo',
  'working': 'laburando',
  'eat': 'morfar',
  'money': 'guita',
  'great': 'bárbaro',
  'cool': 'piola',
  'dance': 'milonguear',
  'party': 'milonga',
  
  // Tango specific
  'dance floor': 'pista',
  'dance partner': 'compañero de tango',
  'practice': 'práctica',
  'social dance': 'milonga',
  'dance event': 'milonga',
  'tango shoes': 'zapatos de tango',
  'embrace': 'abrazo',
  'connection': 'conexión',
  'musicality': 'musicalidad',
  'improvisation': 'improvisación',
};

// Language configurations with special instructions
const languageConfigs: Record<string, string> = {
  'es-AR-lunfardo': `Translate to Argentine Spanish with Lunfardo (Buenos Aires street language). 
    Use "vos" instead of "tú", include expressions like "che", "pibe", "bárbaro", "piola", "morfar", "laburar".
    For tango terms use: "milonguear", "milonga", "tanda", "cortina", "cabeceo".
    Keep the warm, passionate, slightly rebellious spirit of Buenos Aires.`,
  
  'it': 'Translate to Italian with a warm, expressive tone suitable for the tango community.',
  'fr': 'Translate to French with elegance and sophistication appropriate for dance culture.',
  'ko': 'Translate to Korean using appropriate honorifics and formality levels for a community platform.',
  'zh': 'Translate to Simplified Chinese with clarity and cultural appropriateness.',
  'ja': 'Translate to Japanese using appropriate politeness levels for a social platform.',
};

// Master translation prompt
const getMasterPrompt = (targetLanguage: string, isDocumentation: boolean = false) => {
  const basePrompt = `You are the ESA Layer 53 Internationalization Agent for Mundo Tango platform.
    
    Platform Context:
    - Mundo Tango: A global social community for tango dancers
    - Theme: MT Ocean Theme with turquoise-cyan gradients
    - Tone: Warm, inclusive, passionate about tango culture
    - Users: Global tango dancers, from beginners to professionals
    
    Translation Requirements:
    1. Maintain native-speaker quality and natural flow
    2. Keep brand names unchanged: "Mundo Tango", "Life CEO", "ESA"
    3. Preserve placeholders: {{userName}}, {count}, etc.
    4. Use culturally appropriate expressions
    5. ${isDocumentation ? 'Keep code blocks and technical terms in English' : 'Adapt UI for the target culture'}
    
    Target Language: ${targetLanguage}
    ${languageConfigs[targetLanguage] || `Translate to ${targetLanguage} with appropriate cultural context.`}
    
    Return ONLY the translated text, no explanations.`;
    
  return basePrompt;
};

// Translate a single text string
export async function translateText(
  text: string, 
  targetLanguage: string,
  context?: string
): Promise<string> {
  try {
    // Check cache first
    const cacheKey = `${text}-${targetLanguage}-${context}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }
    
    // Skip translation for English
    if (targetLanguage === 'en') {
      return text;
    }
    
    const prompt = getMasterPrompt(targetLanguage, false);
    const contextInfo = context ? `\nContext: ${context}` : '';
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `${contextInfo}\n\nTranslate: ${text}` }
      ],
      temperature: 0.3, // Lower temperature for consistency
      max_tokens: 500,
    });
    
    const translation = response.choices[0]?.message?.content?.trim() || text;
    
    // Apply Lunfardo post-processing for Argentine Spanish
    let finalTranslation = translation;
    if (targetLanguage === 'es-AR-lunfardo') {
      finalTranslation = applyLunfardoReplacements(translation);
    }
    
    // Cache the translation
    translationCache.set(cacheKey, finalTranslation);
    
    return finalTranslation;
  } catch (error) {
    console.error(`Translation error for ${targetLanguage}:`, error);
    return text; // Fallback to original text
  }
}

// Apply Lunfardo replacements to translated text
function applyLunfardoReplacements(text: string): string {
  let result = text;
  
  // Apply dictionary replacements
  for (const [standard, lunfardo] of Object.entries(lunfardoDictionary)) {
    const regex = new RegExp(`\\b${standard}\\b`, 'gi');
    result = result.replace(regex, lunfardo);
  }
  
  // Ensure "vos" usage instead of "tú"
  result = result.replace(/\btú\b/gi, 'vos');
  result = result.replace(/\btienes\b/gi, 'tenés');
  result = result.replace(/\beres\b/gi, 'sos');
  result = result.replace(/\bpuedes\b/gi, 'podés');
  
  return result;
}

// Translate a JSON object of strings
export async function translateObject(
  obj: any, 
  targetLanguage: string,
  context?: string
): Promise<any> {
  if (typeof obj === 'string') {
    return translateText(obj, targetLanguage, context);
  }
  
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(item => translateObject(item, targetLanguage, context)));
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const translated: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Skip translating certain keys
      if (['id', 'code', 'key', 'url', 'path', 'icon'].includes(key)) {
        translated[key] = value;
      } else {
        translated[key] = await translateObject(value, targetLanguage, context);
      }
    }
    
    return translated;
  }
  
  return obj;
}

// Translate a markdown document
export async function translateMarkdown(
  markdown: string,
  targetLanguage: string
): Promise<string> {
  try {
    // Skip translation for English
    if (targetLanguage === 'en') {
      return markdown;
    }
    
    const prompt = getMasterPrompt(targetLanguage, true);
    
    // Split markdown into chunks to handle large documents
    const chunks = splitMarkdownIntoChunks(markdown, 2000);
    const translatedChunks: string[] = [];
    
    for (const chunk of chunks) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: prompt },
          { 
            role: 'user', 
            content: `Translate this markdown documentation while preserving all formatting, code blocks, and links:\n\n${chunk}` 
          }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      });
      
      const translation = response.choices[0]?.message?.content?.trim() || chunk;
      translatedChunks.push(translation);
    }
    
    return translatedChunks.join('\n\n');
  } catch (error) {
    console.error(`Markdown translation error for ${targetLanguage}:`, error);
    return markdown;
  }
}

// Split markdown into manageable chunks
function splitMarkdownIntoChunks(markdown: string, maxLength: number): string[] {
  const lines = markdown.split('\n');
  const chunks: string[] = [];
  let currentChunk = '';
  let inCodeBlock = false;
  
  for (const line of lines) {
    // Check for code block markers
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }
    
    // If adding this line would exceed max length and we're not in a code block
    if (currentChunk.length + line.length + 1 > maxLength && !inCodeBlock && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = line;
    } else {
      currentChunk += (currentChunk ? '\n' : '') + line;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

// Get all supported languages
export function getSupportedLanguages(): string[] {
  return [
    'en', 'es-AR-lunfardo', 'es', 'es-419', 'pt', 'pt-BR', // Americas
    'fr', 'de', 'it', 'nl', 'pl', 'ru', 'el', 'sv', 'no', 'da', 'fi', // Europe
    'cs', 'hu', 'ro', 'bg', 'uk', 'hr', 'sr', 'sk', 'sl', 'et', 'lv', 'lt',
    'is', 'mk', 'mt', 'cy', 'lb', 'ca', 'gl', 'eu', 'sq', 'be', 'bs', 'ka',
    'zh', 'zh-tw', 'ja', 'ko', 'hi', 'th', 'vi', 'id', 'ms', 'fil', // Asia
    'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ne', 'si', 'lo', 'my',
    'ar', 'he', 'tr', 'fa', 'ur', 'af', 'am', 'ps', // MEA
  ];
}

// Batch translate multiple texts efficiently
export async function batchTranslate(
  texts: string[],
  targetLanguage: string,
  context?: string
): Promise<string[]> {
  try {
    // Skip for English
    if (targetLanguage === 'en') {
      return texts;
    }
    
    const prompt = getMasterPrompt(targetLanguage, false);
    const contextInfo = context ? `Context: ${context}\n\n` : '';
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { 
          role: 'user', 
          content: `${contextInfo}Translate each line separately, maintaining the same order. Return ONLY the translations, one per line:\n\n${texts.join('\n')}` 
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });
    
    const translations = response.choices[0]?.message?.content?.trim().split('\n') || texts;
    
    // Apply Lunfardo if needed
    if (targetLanguage === 'es-AR-lunfardo') {
      return translations.map(t => applyLunfardoReplacements(t));
    }
    
    return translations;
  } catch (error) {
    console.error(`Batch translation error for ${targetLanguage}:`, error);
    return texts;
  }
}

// Export cache management functions
export function clearTranslationCache(): void {
  translationCache.clear();
}

export function getCacheSize(): number {
  return translationCache.size;
}