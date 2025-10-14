#!/usr/bin/env node
/**
 * TRACK 1: TRANSLATION STRING EXTRACTOR
 * Extract all hardcoded strings from 119 pages for i18n
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const translationKeys = new Map();
let totalStrings = 0;

// Extract strings from JSX/TSX content
const extractStrings = (content, filePath) => {
  const strings = [];
  
  // Pattern 1: Hardcoded text in JSX (between > and <)
  const jsxTextRegex = />([^<>{}\n]+)</g;
  let match;
  
  while ((match = jsxTextRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text && 
        text.length > 1 && 
        !text.match(/^[{}\[\]().,;:!?]+$/) && 
        !text.match(/^[\d\s]+$/) &&
        !text.includes('import ') &&
        !text.includes('export ') &&
        !text.includes('const ') &&
        !text.includes('let ') &&
        !text.includes('var ')) {
      strings.push(text);
    }
  }
  
  // Pattern 2: String literals in attributes (title, placeholder, etc.)
  const attrRegex = /(title|placeholder|alt|aria-label)=["']([^"']+)["']/g;
  while ((match = attrRegex.exec(content)) !== null) {
    const text = match[2].trim();
    if (text && text.length > 1) {
      strings.push(text);
    }
  }
  
  return [...new Set(strings)]; // Remove duplicates
};

// Generate translation key from string
const generateKey = (text, category = 'common') => {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
  return `${category}.${cleaned}`;
};

// Process all pages
const processPages = () => {
  const pagesDir = path.join(process.cwd(), 'client/src/pages');
  const files = execSync('find client/src/pages -name "*.tsx" -type f', { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);
  
  console.log(`\n📋 Processing ${files.length} pages...\n`);
  
  const categories = {
    admin: [],
    auth: [],
    profile: [],
    common: []
  };
  
  files.forEach((file, index) => {
    const content = fs.readFileSync(file, 'utf-8');
    const strings = extractStrings(content, file);
    
    if (strings.length > 0) {
      const category = file.includes('/admin/') ? 'admin' :
                      file.includes('/auth/') ? 'auth' :
                      file.includes('/profile/') ? 'profile' : 'common';
      
      strings.forEach(str => {
        const key = generateKey(str, category);
        if (!translationKeys.has(key)) {
          translationKeys.set(key, str);
          categories[category].push({ key, value: str });
          totalStrings++;
        }
      });
      
      console.log(`[${index + 1}/${files.length}] 📄 ${file} - ${strings.length} strings`);
    } else {
      console.log(`[${index + 1}/${files.length}] ✅ ${file} - no hardcoded strings`);
    }
  });
  
  return categories;
};

// Generate translation files
const generateTranslationFiles = (categories) => {
  const localesDir = path.join(process.cwd(), 'client/public/locales/en');
  
  if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true });
  }
  
  // Write category files
  Object.entries(categories).forEach(([category, items]) => {
    if (items.length > 0) {
      const translations = {};
      items.forEach(({ key, value }) => {
        const shortKey = key.replace(`${category}.`, '');
        translations[shortKey] = value;
      });
      
      const filePath = path.join(localesDir, `${category}.json`);
      fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));
      console.log(`✅ Generated: ${filePath} (${items.length} keys)`);
    }
  });
};

// Main execution
console.log('🚀 TRACK 1: TRANSLATION STRING EXTRACTOR\n');

const categories = processPages();
console.log(`\n📊 Extraction Summary:`);
console.log(`   Total strings found: ${totalStrings}`);
console.log(`   Admin: ${categories.admin.length}`);
console.log(`   Auth: ${categories.auth.length}`);
console.log(`   Profile: ${categories.profile.length}`);
console.log(`   Common: ${categories.common.length}`);

console.log(`\n📝 Generating translation files...`);
generateTranslationFiles(categories);

console.log(`\n✅ TRACK 1 COMPLETE: Translation extraction done!`);
console.log(`   Next: Replace hardcoded strings with t() calls`);
