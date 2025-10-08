#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

const brokenFiles = [
  'client/src/components/ui/PostActionsMenu.tsx',
  'client/src/components/ui/SimpleEmojiPicker.tsx',
  'client/src/components/ui/SimpleLikeButton.tsx',
  'client/src/components/ui/tile-select.tsx',
  'client/src/components/ui/ReactionSelector.tsx',
  'client/src/components/ui/PostContextMenu.tsx',
  'client/src/components/ui/accordion.tsx',
  'client/src/components/ui/alert-dialog.tsx',
  'client/src/components/ui/avatar.tsx',
  'client/src/components/ui/carousel.tsx',
  'client/src/components/ui/input.tsx',
  'client/src/components/ui/pagination.tsx',
  'client/src/components/ui/select.tsx',
  'client/src/components/ui/textarea.tsx'
];

brokenFiles.forEach(file => {
  let content = readFileSync(file, 'utf-8');
  let changes = 0;
  
  // Fix pattern 1: () = data-testid="..." > should be () => 
  const regex1 = /\(\)\s*=\s*data-testid="[^"]+"\s*>/g;
  if (regex1.test(content)) {
    content = content.replace(regex1, '() =>');
    changes++;
  }
  
  // Fix pattern 2: (e) = data-testid="..." > should be (e) =>
  const regex2 = /\(([^)]+)\)\s*=\s*data-testid="[^"]+"\s*>/g;
  if (regex2.test(content)) {
    content = content.replace(regex2, '($1) =>');
    changes++;
  }
  
  // Fix pattern 3: / data-testid="..." > should be removed (bad XML comment)
  const regex3 = /\s*\/\s*data-testid="[^"]+"\s*>/g;
  if (regex3.test(content)) {
    content = content.replace(regex3, '>');
    changes++;
  }
  
  // Fix pattern 4: [& data-testid="..."span] should be [&span]
  const regex4 = /\[&\s*data-testid="[^"]+"\s*>/g;
  if (regex4.test(content)) {
    content = content.replace(regex4, '[&');
    changes++;
  }
  
  if (changes > 0) {
    writeFileSync(file, content);
    console.log(`✅ Fixed ${file} (${changes} fixes)`);
  } else {
    console.log(`⏭️  Skipped ${file} (already fixed or different pattern)`);
  }
});

console.log('\n✅ All broken files processed');
