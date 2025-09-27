import { Router, Request, Response } from 'express';
import { 
  translateText, 
  translateObject, 
  getSupportedLanguages, 
  clearTranslationCache,
  getCacheSize 
} from '../services/translationService';
import {
  translateAllDocumentation,
  translateDocumentationSection,
  getTranslationStatus,
  scanDocumentationPages,
} from '../services/documentationTranslator';
import {
  generateUITranslations,
  updateI18nConfig,
  generateSectionTranslations,
  extractStringsFromComponents,
} from '../services/uiTranslationGenerator';
import path from 'path';

const router = Router();

// Get list of supported languages
router.get('/languages', (req: Request, res: Response) => {
  const languages = getSupportedLanguages();
  const languageDetails = languages.map(code => ({
    code,
    name: getLanguageName(code),
    rtl: ['ar', 'he', 'ur', 'fa', 'ps'].includes(code),
  }));
  
  res.json({ languages: languageDetails });
});

// Translate text endpoint
router.post('/translate', async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage, context } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const translation = await translateText(text, targetLanguage, context);
    res.json({ translation });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// Batch translate endpoint
router.post('/translate/batch', async (req: Request, res: Response) => {
  try {
    const { texts, targetLanguage, context } = req.body;
    
    if (!texts || !targetLanguage || !Array.isArray(texts)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    const translations = await Promise.all(
      texts.map(text => translateText(text, targetLanguage, context))
    );
    
    res.json({ translations });
  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({ error: 'Batch translation failed' });
  }
});

// Generate UI translations for all languages
router.post('/generate-ui-translations', async (req: Request, res: Response) => {
  try {
    const { languages } = req.body;
    
    // Start generation in background
    res.json({ 
      status: 'started',
      message: 'UI translation generation started. Check status endpoint for progress.' 
    });
    
    // Generate translations asynchronously
    generateUITranslations(languages, (current, total, language) => {
      console.log(`Progress: ${current}/${total} - Translating UI to ${language}`);
    })
      .then(async (translations) => {
        // Update the i18n config with new translations
        await updateI18nConfig(translations);
        console.log('UI translations generated and saved successfully');
      })
      .catch(error => {
        console.error('UI translation generation failed:', error);
      });
  } catch (error) {
    console.error('Error starting UI translation:', error);
    res.status(500).json({ error: 'Failed to start UI translation generation' });
  }
});

// Generate UI translations for specific sections
router.post('/generate-section-translations', async (req: Request, res: Response) => {
  try {
    const { sections, languages } = req.body;
    
    if (!sections || !languages) {
      return res.status(400).json({ error: 'Missing sections or languages' });
    }
    
    const translations = await generateSectionTranslations(sections, languages);
    res.json({ translations });
  } catch (error) {
    console.error('Section translation error:', error);
    res.status(500).json({ error: 'Section translation failed' });
  }
});

// Translate documentation endpoint
router.post('/translate-documentation', async (req: Request, res: Response) => {
  try {
    const { section, languages } = req.body;
    
    // Start translation in background
    res.json({ 
      status: 'started',
      message: 'Documentation translation started. Check status endpoint for progress.' 
    });
    
    // Translate asynchronously
    if (section) {
      translateDocumentationSection(section, languages || getSupportedLanguages())
        .then(results => {
          const successful = results.filter(r => r.success).length;
          console.log(`Documentation section translation complete: ${successful}/${results.length} successful`);
        })
        .catch(error => {
          console.error('Documentation section translation failed:', error);
        });
    } else {
      translateAllDocumentation((current, total, details) => {
        console.log(`Progress: ${current}/${total} - ${details}`);
      })
        .then(results => {
          const successful = results.filter(r => r.success).length;
          console.log(`Documentation translation complete: ${successful}/${results.length} successful`);
        })
        .catch(error => {
          console.error('Documentation translation failed:', error);
        });
    }
  } catch (error) {
    console.error('Error starting documentation translation:', error);
    res.status(500).json({ error: 'Failed to start documentation translation' });
  }
});

// Get documentation structure
router.get('/documentation-structure', async (req: Request, res: Response) => {
  try {
    const docsPath = path.join(process.cwd(), 'docs/pages');
    const sections = await scanDocumentationPages(docsPath);
    
    const structure = sections.map(s => ({
      name: s.name,
      fileCount: s.files.length,
      files: s.files,
    }));
    
    res.json({ sections: structure });
  } catch (error) {
    console.error('Error getting documentation structure:', error);
    res.status(500).json({ error: 'Failed to get documentation structure' });
  }
});

// Get translation status
router.get('/translation-status', async (req: Request, res: Response) => {
  try {
    const status = await getTranslationStatus();
    
    if (!status) {
      return res.json({ 
        status: 'not_started',
        message: 'No translations generated yet' 
      });
    }
    
    res.json(status);
  } catch (error) {
    console.error('Error getting translation status:', error);
    res.status(500).json({ error: 'Failed to get translation status' });
  }
});

// Extract strings from components
router.post('/extract-component-strings', async (req: Request, res: Response) => {
  try {
    const componentsDir = path.join(process.cwd(), 'client/src');
    const strings = await extractStringsFromComponents(componentsDir);
    
    res.json({ 
      stringsFound: Array.from(strings),
      count: strings.size,
    });
  } catch (error) {
    console.error('Error extracting component strings:', error);
    res.status(500).json({ error: 'Failed to extract component strings' });
  }
});

// Clear translation cache
router.post('/clear-cache', (req: Request, res: Response) => {
  clearTranslationCache();
  res.json({ message: 'Translation cache cleared' });
});

// Get cache statistics
router.get('/cache-stats', (req: Request, res: Response) => {
  res.json({ 
    cacheSize: getCacheSize(),
    message: `Translation cache contains ${getCacheSize()} entries`,
  });
});

// Get translations for a specific language (for progressive loading)
router.get('/language/:languageCode', async (req: Request, res: Response) => {
  try {
    const { languageCode } = req.params;
    const translationsPath = path.join(process.cwd(), 'client/src/i18n/translations.json');
    
    // Check if translations file exists
    const fs = await import('fs/promises');
    try {
      await fs.access(translationsPath);
    } catch {
      return res.status(404).json({ error: 'Translations not found' });
    }
    
    // Read the translations file
    const translationsData = await fs.readFile(translationsPath, 'utf-8');
    const allTranslations = JSON.parse(translationsData);
    
    // Check if the requested language exists
    if (!allTranslations[languageCode]) {
      // Try to generate translations for this language on the fly
      console.log(`Generating translations for ${languageCode} on demand...`);
      
      // Get base English translations as reference
      const baseTranslations = allTranslations['en']?.translation || {};
      
      // Generate translations for this language
      const newTranslations: any = { translation: {} };
      
      for (const [section, strings] of Object.entries(baseTranslations)) {
        newTranslations.translation[section] = {};
        
        for (const [key, value] of Object.entries(strings as any)) {
          try {
            const translated = await translateText(value as string, languageCode, 'en');
            newTranslations.translation[section][key] = translated;
          } catch (error) {
            console.error(`Failed to translate ${key} to ${languageCode}`);
            newTranslations.translation[section][key] = value; // Fallback to English
          }
        }
      }
      
      // Cache the generated translations
      allTranslations[languageCode] = newTranslations;
      await fs.writeFile(translationsPath, JSON.stringify(allTranslations, null, 2));
      
      return res.json(newTranslations.translation);
    }
    
    // Return the translations for the requested language
    res.json(allTranslations[languageCode].translation || {});
  } catch (error) {
    console.error('Error fetching language translations:', error);
    res.status(500).json({ error: 'Failed to fetch translations' });
  }
});

// Helper function to get language names
function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    'en': 'English',
    'es-AR-lunfardo': 'Argentine Spanish (Lunfardo)',
    'es': 'Spanish',
    'es-419': 'Latin American Spanish',
    'pt': 'Portuguese',
    'pt-BR': 'Brazilian Portuguese',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'nl': 'Dutch',
    'pl': 'Polish',
    'ru': 'Russian',
    'el': 'Greek',
    'sv': 'Swedish',
    'no': 'Norwegian',
    'da': 'Danish',
    'fi': 'Finnish',
    'cs': 'Czech',
    'hu': 'Hungarian',
    'ro': 'Romanian',
    'bg': 'Bulgarian',
    'uk': 'Ukrainian',
    'hr': 'Croatian',
    'sr': 'Serbian',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'et': 'Estonian',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'is': 'Icelandic',
    'mk': 'Macedonian',
    'mt': 'Maltese',
    'cy': 'Welsh',
    'lb': 'Luxembourgish',
    'ca': 'Catalan',
    'gl': 'Galician',
    'eu': 'Basque',
    'sq': 'Albanian',
    'be': 'Belarusian',
    'bs': 'Bosnian',
    'ka': 'Georgian',
    'zh': 'Chinese (Simplified)',
    'zh-tw': 'Chinese (Traditional)',
    'ja': 'Japanese',
    'ko': 'Korean',
    'hi': 'Hindi',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'id': 'Indonesian',
    'ms': 'Malay',
    'fil': 'Filipino',
    'bn': 'Bengali',
    'ta': 'Tamil',
    'te': 'Telugu',
    'mr': 'Marathi',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi',
    'ne': 'Nepali',
    'si': 'Sinhala',
    'lo': 'Lao',
    'my': 'Burmese',
    'ar': 'Arabic',
    'he': 'Hebrew',
    'tr': 'Turkish',
    'fa': 'Persian/Farsi',
    'ur': 'Urdu',
    'af': 'Afrikaans',
    'am': 'Amharic',
    'ps': 'Pashto',
  };
  
  return names[code] || code;
}

export default router;