import { promises as fs } from 'fs';
import path from 'path';
import { translateMarkdown, getSupportedLanguages } from './translationService';

interface TranslationResult {
  language: string;
  file: string;
  success: boolean;
  error?: string;
}

interface DocumentationIndex {
  totalPages: number;
  sections: DocumentationSection[];
}

interface DocumentationSection {
  name: string;
  path: string;
  files: string[];
}

// Scan the documentation directory structure
export async function scanDocumentationPages(docsPath: string): Promise<DocumentationSection[]> {
  const sections: DocumentationSection[] = [];
  
  try {
    // Read the main docs/pages directory
    const entries = await fs.readdir(docsPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(docsPath, entry.name);
      
      if (entry.isDirectory()) {
        // Scan subdirectory for markdown files
        const files = await fs.readdir(fullPath);
        const mdFiles = files.filter(f => f.endsWith('.md'));
        
        if (mdFiles.length > 0) {
          sections.push({
            name: entry.name,
            path: fullPath,
            files: mdFiles,
          });
        }
      } else if (entry.name.endsWith('.md')) {
        // Add root-level markdown files
        const existingRoot = sections.find(s => s.name === 'root');
        if (existingRoot) {
          existingRoot.files.push(entry.name);
        } else {
          sections.push({
            name: 'root',
            path: docsPath,
            files: [entry.name],
          });
        }
      }
    }
    
    return sections;
  } catch (error) {
    console.error('Error scanning documentation:', error);
    return [];
  }
}

// Translate a single documentation file
export async function translateDocumentationFile(
  filePath: string,
  targetLanguage: string,
  outputDir: string
): Promise<TranslationResult> {
  try {
    // Read the original markdown file
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Skip if file is empty or very small
    if (content.length < 10) {
      return {
        language: targetLanguage,
        file: filePath,
        success: false,
        error: 'File too small or empty',
      };
    }
    
    // Translate the content
    console.log(`Translating ${path.basename(filePath)} to ${targetLanguage}...`);
    const translatedContent = await translateMarkdown(content, targetLanguage);
    
    // Create output directory structure
    const relativePath = path.relative(path.join(process.cwd(), 'docs/pages'), filePath);
    const outputPath = path.join(outputDir, targetLanguage, relativePath);
    const outputDirPath = path.dirname(outputPath);
    
    await fs.mkdir(outputDirPath, { recursive: true });
    
    // Write translated file
    await fs.writeFile(outputPath, translatedContent, 'utf-8');
    
    return {
      language: targetLanguage,
      file: filePath,
      success: true,
    };
  } catch (error) {
    console.error(`Error translating ${filePath} to ${targetLanguage}:`, error);
    return {
      language: targetLanguage,
      file: filePath,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Translate all documentation pages to all languages
export async function translateAllDocumentation(
  progressCallback?: (current: number, total: number, details: string) => void
): Promise<TranslationResult[]> {
  const results: TranslationResult[] = [];
  const docsPath = path.join(process.cwd(), 'docs/pages');
  const outputDir = path.join(process.cwd(), 'docs/translations');
  
  try {
    // Scan all documentation sections
    const sections = await scanDocumentationPages(docsPath);
    
    // Get list of all files to translate
    const allFiles: string[] = [];
    for (const section of sections) {
      for (const file of section.files) {
        allFiles.push(path.join(section.path, file));
      }
    }
    
    console.log(`Found ${allFiles.length} documentation files to translate`);
    
    // Get target languages (exclude English)
    const languages = getSupportedLanguages().filter(lang => lang !== 'en');
    
    // Priority languages to translate first
    const priorityLanguages = ['es-AR-lunfardo', 'it', 'fr', 'ko', 'zh'];
    const otherLanguages = languages.filter(l => !priorityLanguages.includes(l));
    const orderedLanguages = [...priorityLanguages, ...otherLanguages];
    
    const totalTasks = allFiles.length * orderedLanguages.length;
    let currentTask = 0;
    
    // Translate each file to each language
    for (const language of orderedLanguages) {
      console.log(`\nStarting translations for ${language}...`);
      
      for (const file of allFiles) {
        currentTask++;
        
        if (progressCallback) {
          const fileName = path.basename(file);
          progressCallback(currentTask, totalTasks, `Translating ${fileName} to ${language}`);
        }
        
        const result = await translateDocumentationFile(file, language, outputDir);
        results.push(result);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Create an index file for translated documentation
    await createTranslationIndex(outputDir, sections, orderedLanguages);
    
    return results;
  } catch (error) {
    console.error('Error in bulk translation:', error);
    throw error;
  }
}

// Create an index of all translated documentation
async function createTranslationIndex(
  outputDir: string,
  sections: DocumentationSection[],
  languages: string[]
): Promise<void> {
  const index = {
    generatedAt: new Date().toISOString(),
    languages: languages,
    sections: sections.map(s => ({
      name: s.name,
      fileCount: s.files.length,
      files: s.files,
    })),
    totalFiles: sections.reduce((sum, s) => sum + s.files.length, 0),
    totalTranslations: sections.reduce((sum, s) => sum + s.files.length, 0) * languages.length,
  };
  
  const indexPath = path.join(outputDir, 'translation-index.json');
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');
  
  console.log(`Translation index created at ${indexPath}`);
}

// Get translation status for all languages
export async function getTranslationStatus(): Promise<any> {
  const outputDir = path.join(process.cwd(), 'docs/translations');
  
  try {
    const indexPath = path.join(outputDir, 'translation-index.json');
    const indexContent = await fs.readFile(indexPath, 'utf-8');
    const index = JSON.parse(indexContent);
    
    // Check actual translated files
    const status: any = {
      lastUpdated: index.generatedAt,
      languages: {},
    };
    
    for (const language of index.languages) {
      const langDir = path.join(outputDir, language);
      
      try {
        const files = await countFilesRecursively(langDir);
        status.languages[language] = {
          filesTranslated: files,
          totalFiles: index.totalFiles,
          percentage: Math.round((files / index.totalFiles) * 100),
        };
      } catch (error) {
        status.languages[language] = {
          filesTranslated: 0,
          totalFiles: index.totalFiles,
          percentage: 0,
        };
      }
    }
    
    return status;
  } catch (error) {
    console.error('Error getting translation status:', error);
    return null;
  }
}

// Count files recursively in a directory
async function countFilesRecursively(dir: string): Promise<number> {
  let count = 0;
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        count += await countFilesRecursively(fullPath);
      } else if (entry.name.endsWith('.md')) {
        count++;
      }
    }
  } catch (error) {
    // Directory might not exist
  }
  
  return count;
}

// Translate specific documentation sections only
export async function translateDocumentationSection(
  sectionName: string,
  targetLanguages: string[]
): Promise<TranslationResult[]> {
  const results: TranslationResult[] = [];
  const docsPath = path.join(process.cwd(), 'docs/pages');
  const outputDir = path.join(process.cwd(), 'docs/translations');
  
  try {
    const sections = await scanDocumentationPages(docsPath);
    const section = sections.find(s => s.name === sectionName);
    
    if (!section) {
      throw new Error(`Section ${sectionName} not found`);
    }
    
    for (const language of targetLanguages) {
      for (const file of section.files) {
        const filePath = path.join(section.path, file);
        const result = await translateDocumentationFile(filePath, language, outputDir);
        results.push(result);
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error translating section ${sectionName}:`, error);
    throw error;
  }
}