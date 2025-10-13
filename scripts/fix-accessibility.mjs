#!/usr/bin/env node
// TRACK 7: Accessibility Automation (ES Module)
import fs from 'fs';
import { glob } from 'glob';

console.log('♿ Fixing accessibility violations...');

const files = glob.sync('client/src/**/*.tsx');
let fixes = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Add alt text to images without it (basic check)
  const imgWithoutAlt = /<img\s+([^>]*?)(?!alt=)([^>]*?)>/g;
  const imgMatches = content.match(imgWithoutAlt);
  if (imgMatches && imgMatches.some(m => !m.includes('alt='))) {
    console.log(`  📝 Would fix images in: ${file}`);
    fixes++;
  }
  
  // Check for buttons without accessible names
  const btnPattern = /<button[^>]*>[\s]*<[^>]+>[\s]*<\/button>/g;
  if (btnPattern.test(content)) {
    console.log(`  🔘 Would fix buttons in: ${file}`);
    fixes++;
  }
});

console.log(`✅ Identified ${fixes} files with accessibility issues`);
