#!/usr/bin/env node
// TRACK 5: Translation Extraction (ES Module)
import fs from 'fs';
import { glob } from 'glob';

console.log('🔍 Extracting hardcoded strings from codebase...');

const files = glob.sync('client/src/**/*.tsx');
const hardcodedStrings = new Set();

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/>([^<{]+)</g);
  if (matches) {
    matches.forEach(match => {
      const text = match.replace(/>/g, '').replace(/</g, '').trim();
      if (text.length > 2 && !text.includes('{') && !/^\d+$/.test(text)) {
        hardcodedStrings.add(text);
      }
    });
  }
});

console.log(`✅ Found ${hardcodedStrings.size} potential hardcoded strings`);
console.log('Sample strings:', [...hardcodedStrings].slice(0, 10));
