#!/usr/bin/env node

/**
 * Emergency Fix: aria-label inside if/else statements
 * Fixes: code;} aria-label="Button" else {
 * To: code;} else {
 */

import fs from 'fs';

console.log('🔧 Fixing if/else aria-label placement\n');

const filesToFix = [
  'client/src/components/memories/EnhancedMemoriesUI.tsx',
  'client/src/components/moments/EnhancedPostComposer.tsx',
  'client/src/components/moments/PostComposer.tsx',
  'client/src/components/_archive/EnhancedPostCreator.tsx'
];

let totalFixed = 0;

for (const filePath of filesToFix) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Pattern: ;} aria-label="..." else {
  const regex = /;}\s*aria-label="[^"]*"\s*else\s*{/g;
  
  if (content.match(regex)) {
    content = content.replace(regex, ';} else {');
    totalFixed++;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filePath}: Fixed if/else aria-label`);
  }
}

console.log(`\n✨ Fixed ${totalFixed} files\n`);
