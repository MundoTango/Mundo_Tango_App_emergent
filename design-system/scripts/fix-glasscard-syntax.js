#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔧 Fixing GlassCard incomplete JSX tags...\n');

// Pattern: GlassCard tag without closing > before newline with child element
const patterns = [
  // Pattern 1: className="..." followed directly by newline and <
  {
    regex: /(<GlassCard[^>]*className="[^"]*")\s*\n(\s*<)/g,
    replacement: '$1>\n$2',
    description: 'GlassCard with className missing closing >'
  },
  // Pattern 2: depth={} followed by className without >
  {
    regex: /(<GlassCard[^>]*depth=\{[^}]*\}[^>]*className="[^"]*")\s*\n(\s*<)/g,
    replacement: '$1>\n$2',
    description: 'GlassCard with depth and className missing closing >'
  },
  // Pattern 3: any GlassCard prop followed by newline and < (general case)
  {
    regex: /(<GlassCard(?:\s+[a-zA-Z][\w]*(?:=(?:\{[^}]*\}|"[^"]*"|'[^']*'))?)+)\s*\n(\s*<)/g,
    replacement: '$1>\n$2',
    description: 'GlassCard with props missing closing >'
  },
  // Pattern 4: Self-closing GlassCard that shouldn't be (has children on next line)
  {
    regex: /(<GlassCard[^>]*)\s*\/>\s*\n(\s*<)/g,
    replacement: '$1>\n$2',
    description: 'Self-closing GlassCard with children'
  }
];

const filesWithErrors = [
  'client/src/components/Community/WorldMap.tsx',
  'client/src/components/Community/RankingsPanel.tsx',
  'client/src/components/Community/EnhancedCityGroupCard.tsx',
  'client/src/components/Community/CommunityMapWithLayers.tsx',
  'client/src/components/Community/CommunityMapFilters.tsx',
  'client/src/components/Community/CommunityCard.tsx',
  'client/src/components/members/TangoRoleMetrics.tsx',
  'client/src/components/members/RoleChangeModal.tsx',
  'client/src/components/MediaLibrary.tsx',
  'client/src/components/members/MembersList.tsx',
  'client/src/components/members/MemberCard.tsx',
  'client/src/components/profile/ProfileFallbacks.tsx',
  'client/src/components/profile/ProfileErrorBoundary.tsx',
  'client/src/components/EnhancedCommunityMap.tsx',
  'client/src/components/ConsentModal.tsx',
  'client/src/components/universal/UnifiedLocationPicker.tsx',
  'client/src/components/universal/PostCreator.tsx',
  'client/src/components/moments/TrangoTechPostComposer.tsx',
  'client/src/components/moments/PostFeed.tsx',
  'client/src/components/moments/PostDetailModal.tsx',
  'client/src/components/moments/EnhancedPostFeedSimple.tsx',
  'client/src/components/esa/MemoryGrid.tsx',
  'client/src/components/modern/ShareModal.tsx',
  'client/src/components/modern/ModernTagFilter.tsx',
  'client/src/components/_archive/EnhancedPostCreator.tsx',
  'client/src/components/modern/ModernPostComposer.tsx',
  'client/src/components/modern/ModernMemoriesHeader.tsx',
  'client/src/components/modern/ModernCommentsSection.tsx',
  'client/src/components/ui/ReportModal.tsx',
  'client/src/components/reviews/ReviewsList.tsx',
  'client/src/components/reviews/ReviewList.tsx',
  'client/src/components/reviews/ReviewCard.tsx',
  'client/src/components/reviews/RatingSummary.tsx',
  'client/src/components/reviews/HostReviewForm.tsx',
  'client/src/components/reviews/GuestReviewForm.tsx',
  'client/src/components/resilient/ResilientBoundary.tsx',
  'client/src/components/recommendations/RecommendationBadge.tsx',
  'client/src/components/ui-library/modals/MTModal.tsx',
  'client/src/components/MonitoringProvider.tsx',
  'client/src/components/admin/ProjectTrackerDashboard.tsx',
  'client/src/components/admin/LifeCEODashboard.tsx',
  'client/src/components/admin/AdminLayout.tsx',
  'client/src/components/Housing/HostHomesList.tsx',
  'client/src/components/GuestOnboarding/GuestOnboardingFlow.tsx',
  'client/src/components/GuestOnboarding/GuestOnboardingEntrance.tsx',
  'client/src/components/memories/EnhancedMemoriesRealtime.tsx'
];

let totalFixed = 0;
let filesModified = 0;

filesWithErrors.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fixCount = 0;

  patterns.forEach(pattern => {
    const matches = content.match(pattern.regex);
    if (matches) {
      content = content.replace(pattern.regex, pattern.replacement);
      const thisFixCount = matches.length;
      fixCount += thisFixCount;
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    totalFixed += fixCount;
    console.log(`✅ Fixed ${fixCount} issues in ${path.basename(filePath)}`);
  } else {
    console.log(`⏭️  No issues found in ${path.basename(filePath)}`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Files scanned: ${filesWithErrors.length}`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Total fixes: ${totalFixed}`);
console.log(`\n✨ GlassCard syntax fix complete!`);
