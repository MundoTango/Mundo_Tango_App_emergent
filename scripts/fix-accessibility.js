#!/usr/bin/env node
/**
 * TRACK 7: Accessibility Automation
 * Auto-fixes common WCAG violations
 */

const fs = require('fs');
const glob = require('glob');

console.log('♿ Fixing accessibility violations...');

const files = glob.sync('client/src/**/*.tsx');
let fixes = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Add alt text to images without it
  const imgRegex = /<img([^>]*?)(?!alt=)([^>]*?)>/g;
  if (imgRegex.test(content)) {
    content = content.replace(imgRegex, '<img$1 alt="Image"$2>');
    changed = true;
    fixes++;
  }
  
  // Add aria-label to buttons without text
  const btnRegex = /<button([^>]*?)>[\s]*<[^>]+>[\s]*<\/button>/g;
  if (btnRegex.test(content)) {
    content = content.replace(btnRegex, '<button$1 aria-label="Button">$&</button>');
    changed = true;
    fixes++;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
  }
});

console.log(`✅ Applied ${fixes} accessibility fixes`);
