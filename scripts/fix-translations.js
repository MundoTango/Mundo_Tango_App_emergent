#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

/**
 * Translation Fixer - Auto-detect and wrap hardcoded strings in t() calls
 * Handles JSX text, button labels, placeholders, and aria-labels
 */

// Configuration
const CONFIG = {
  // Patterns to detect hardcoded strings in JSX
  patterns: {
    // JSX text content: <div>Text here</div>
    jsxText: />([^<>{}\n]+)</g,
    // String literals in JSX attributes
    stringAttr: /(\w+)=["']([^"']+)["']/g,
    // Common UI text patterns
    buttonText: /<Button[^>]*>([^<]+)<\/Button>/g,
    placeholder: /placeholder=["']([^"']+)["']/g,
    ariaLabel: /aria-label=["']([^"']+)["']/g,
    title: /title=["']([^"']+)["']/g,
  },
  
  // Words/patterns to ignore (common JSX/JS keywords)
  ignorePatterns: [
    /^\s*$/,  // Empty strings
    /^[0-9]+$/,  // Pure numbers
    /^[\W_]+$/,  // Pure symbols
    /^(true|false|null|undefined)$/,  // JS keywords
    /^(className|onClick|onChange|onSubmit|key|id|type|name|value)$/,  // Common props
    /^(src|href|alt|width|height|style)$/,  // HTML attrs
    /^\/[\w\-\/]*$/,  // URLs/paths
    /^[\w-]+\.[\w-]+$/,  // File names
    /^data-/,  // Data attributes
    /^\{.*\}$/,  // Already in braces
    /^t\(/,  // Already using t()
  ],
  
  // Aurora Tide i18n key prefixes by context
  keyPrefixes: {
    button: 'common.buttons',
    input: 'common.inputs',
    label: 'common.labels',
    message: 'common.messages',
    error: 'common.errors',
    title: 'common.titles',
    nav: 'navigation',
  }
};

/**
 * Generate a translation key from text
 */
function generateKey(text, context = 'common') {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .substring(0, 50);
  
  return `${context}.${cleaned}`;
}

/**
 * Check if text should be ignored
 */
function shouldIgnore(text) {
  if (!text || typeof text !== 'string') return true;
  
  return CONFIG.ignorePatterns.some(pattern => pattern.test(text.trim()));
}

/**
 * Extract hardcoded strings from file content
 */
function extractHardcodedStrings(content) {
  const findings = [];
  
  // Find JSX text content
  const jsxMatches = content.matchAll(CONFIG.patterns.jsxText);
  for (const match of jsxMatches) {
    const text = match[1].trim();
    if (!shouldIgnore(text) && text.length > 0) {
      findings.push({
        type: 'jsx-text',
        text,
        original: match[0],
        key: generateKey(text, 'common'),
        line: content.substring(0, match.index).split('\n').length
      });
    }
  }
  
  // Find placeholder attributes
  const placeholderMatches = content.matchAll(CONFIG.patterns.placeholder);
  for (const match of placeholderMatches) {
    const text = match[1].trim();
    if (!shouldIgnore(text)) {
      findings.push({
        type: 'placeholder',
        text,
        original: match[0],
        key: generateKey(text, 'common.inputs'),
        line: content.substring(0, match.index).split('\n').length
      });
    }
  }
  
  // Find aria-label attributes
  const ariaMatches = content.matchAll(CONFIG.patterns.ariaLabel);
  for (const match of ariaMatches) {
    const text = match[1].trim();
    if (!shouldIgnore(text)) {
      findings.push({
        type: 'aria-label',
        text,
        original: match[0],
        key: generateKey(text, 'common.labels'),
        line: content.substring(0, match.index).split('\n').length
      });
    }
  }
  
  return findings;
}

/**
 * Add useTranslation hook if missing
 */
function ensureTranslationHook(content) {
  // Check if already has useTranslation
  if (content.includes('useTranslation')) {
    return content;
  }
  
  // Find the imports section
  const importIndex = content.indexOf('import');
  if (importIndex === -1) {
    return `import { useTranslation } from 'react-i18next';\n\n${content}`;
  }
  
  // Find the last import statement
  let lastImportEnd = 0;
  const importMatches = content.matchAll(/import[^;]+;/g);
  for (const match of importMatches) {
    lastImportEnd = match.index + match[0].length;
  }
  
  // Insert after last import
  const before = content.substring(0, lastImportEnd);
  const after = content.substring(lastImportEnd);
  
  return `${before}\nimport { useTranslation } from 'react-i18next';${after}`;
}

/**
 * Add t() hook declaration in component
 */
function ensureTDeclaration(content) {
  // Check if already has t() declaration
  if (/const\s*{\s*t\s*}\s*=\s*useTranslation/.test(content)) {
    return content;
  }
  
  // Find the component function
  const componentMatch = content.match(/(const|function)\s+\w+\s*=?\s*(?:\([^)]*\))?\s*(?::\s*\w+)?\s*=>\s*{/);
  if (!componentMatch) {
    console.warn('Could not find component function');
    return content;
  }
  
  const insertIndex = componentMatch.index + componentMatch[0].length;
  const before = content.substring(0, insertIndex);
  const after = content.substring(insertIndex);
  
  return `${before}\n  const { t } = useTranslation();${after}`;
}

/**
 * Replace hardcoded strings with t() calls
 */
function replaceStrings(content, findings) {
  let updated = content;
  
  // Sort findings by position (descending) to replace from end to start
  findings.sort((a, b) => b.line - a.line);
  
  for (const finding of findings) {
    const { type, text, original, key } = finding;
    
    let replacement;
    
    switch (type) {
      case 'jsx-text':
        // Replace: <div>Text</div> → <div>{t('key')}</div>
        replacement = `>{t('${key}')}<`;
        updated = updated.replace(original, replacement);
        break;
        
      case 'placeholder':
        // Replace: placeholder="Text" → placeholder={t('key')}
        replacement = `placeholder={t('${key}')}`;
        updated = updated.replace(original, replacement);
        break;
        
      case 'aria-label':
        // Replace: aria-label="Text" → aria-label={t('key')}
        replacement = `aria-label={t('${key}')}`;
        updated = updated.replace(original, replacement);
        break;
    }
  }
  
  return updated;
}

/**
 * Generate translation JSON for extracted strings
 */
function generateTranslationJSON(findings) {
  const translations = {};
  
  for (const finding of findings) {
    const { key, text } = finding;
    const parts = key.split('.');
    
    let current = translations;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = text;
  }
  
  return translations;
}

/**
 * Fix a single file
 */
export function fixTranslations(filePath) {
  try {
    console.log(`\n📝 Processing: ${filePath}`);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract hardcoded strings
    const findings = extractHardcodedStrings(content);
    
    if (findings.length === 0) {
      console.log('  ✅ No hardcoded strings found');
      return { success: true, findings: 0, translations: {} };
    }
    
    console.log(`  🔍 Found ${findings.length} hardcoded strings`);
    
    // Add translation hook
    let updated = ensureTranslationHook(content);
    updated = ensureTDeclaration(updated);
    
    // Replace strings
    updated = replaceStrings(updated, findings);
    
    // Write back
    fs.writeFileSync(filePath, updated, 'utf-8');
    
    // Generate translation JSON
    const translations = generateTranslationJSON(findings);
    
    console.log(`  ✅ Fixed ${findings.length} strings`);
    
    return {
      success: true,
      findings: findings.length,
      translations,
      fixed: findings.length
    };
    
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return {
      success: false,
      error: error.message,
      findings: 0
    };
  }
}

/**
 * CLI entry point
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('Usage: node fix-translations.js <file-path>');
    process.exit(1);
  }
  
  const result = fixTranslations(filePath);
  
  if (result.translations && Object.keys(result.translations).length > 0) {
    console.log('\n📋 Translation JSON:');
    console.log(JSON.stringify(result.translations, null, 2));
  }
  
  process.exit(result.success ? 0 : 1);
}
