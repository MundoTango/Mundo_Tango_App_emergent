#!/usr/bin/env node

/**
 * Emergency Fix: useTranslation() misplaced in function parameters
 * Fixes: const Component = ({ const { t } = useTranslation(); propName, ... }) => {
 * To: const Component = ({ propName, ... }) => { const { t } = useTranslation();
 */

import fs from 'fs';

console.log('🔧 Fixing useTranslation() parameter placement\n');

const filesToFix = [
  'client/src/components/admin/ProjectTrackerDashboard.tsx',
  'client/src/components/life-ceo/Framework41x21sDashboard.tsx',
  'client/src/components/moments/EnhancedPostItem.tsx',
  'client/src/components/moments/EnhancedPostComposer.tsx',
  'client/src/components/moments/EnhancedPostFeedSimple.tsx',
  'client/src/components/moments/PostDetailModal.tsx',
  'client/src/components/moments/EnhancedPostFeed.tsx',
  'client/src/components/profile/AddTravelDetailModal.tsx',
  'client/src/components/profile/EditTravelDetailModal.tsx',
  'client/src/pages/CreateCommunity.tsx',
  'client/src/pages/EnhancedFriends.tsx',
  'client/src/pages/ResumePage.tsx',
  'client/src/pages/ttfiles-help-center.tsx',
  'client/src/utils/lazyComponents.tsx'
];

let totalFixed = 0;

for (const filePath of filesToFix) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Pattern: const { t } = useTranslation(); followed by other code on same line
  const regex = /^(\s+)const { t } = useTranslation\(\);\s+(.+)$/gm;
  
  content = content.replace(regex, (match, indent, rest) => {
    modified = true;
    // If rest starts with a word (not destructuring/opening brace), it's likely a variable/const
    if (rest.match(/^(id:|value:|data:|children:|filters:)/)) {
      return `${indent}${rest}`;
    }
    return match; // Keep original if unsure
  });
  
  if (modified) {
    totalFixed++;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filePath}: Fixed useTranslation() placement`);
  }
}

console.log(`\n✨ Fixed ${totalFixed} files\n`);
