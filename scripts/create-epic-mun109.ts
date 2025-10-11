// Script to create Epic MUN-109 with all re-audit tasks
// Run with: npx tsx scripts/create-epic-mun109.ts

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function createEpicMUN109() {
  console.log('🚀 Creating Epic MUN-109: Re-Audit Parallel Execution Results...\n');

  try {
    // 1. Create Master Epic
    console.log('📋 Step 1: Creating Master Epic MUN-109...');
    const epicResponse = await axios.post(`${BASE_URL}/api/tracker/epics`, {
      key: 'MUN-109',
      summary: 'Re-Audit Parallel Execution - 81 Tasks Across 7 Pages',
      description: `# Epic MUN-109: Re-Audit Parallel Execution Results

## Overview
Comprehensive re-audit of 7 previously audited pages with parallel squad execution. Total 81 actionable tasks extracted across accessibility, Aurora Tide compliance, performance, testing, and i18n.

## Scope
- **Pages:** Login, Home, Profile, Life CEO, Housing, Memories, Events
- **Total Tasks:** 81
- **Estimated Effort:** 72-86 hours
- **Squad Execution:** 7 parallel teams

## Documentation
- Task Extraction: \`docs/build-coordination/reaudit-task-extraction-with-agents.md\`
- Audit Reports: \`docs/audit-reports/reaudit-*-2025-10-11.md\`

## Priority Order
1. **HIGHEST:** Home Dashboard (78 score) - 15 tasks
2. **HIGH:** Login (82), Profile (85), Life CEO (85)
3. **MEDIUM:** Events (99) - Performance optimization
4. **LOW:** Housing (88), Memories (99) - Pattern extraction`,
      status: 'in_progress',
      priority: 'critical',
      labels: ['re-audit', 'esa-phase-5', 'aurora-tide', 'accessibility', 'performance']
    });

    const epicId = epicResponse.data.data.id;
    console.log(`✅ Epic MUN-109 created with ID: ${epicId}\n`);

    // 2. Create Story for Login Page
    console.log('📝 Step 2: Creating MUN-109-1 (Login Page - 12 tasks)...');
    await axios.post(`${BASE_URL}/api/tracker/stories`, {
      key: 'MUN-109-1',
      epicId: epicId,
      summary: 'Login Page Improvements - 12 Tasks',
      description: `# Login Page Re-Audit Tasks

**File:** \`client/src/pages/auth/login.tsx\`
**Squad Lead:** Agent #54 (Accessibility)
**Team:** Agents #53, #51, #14
**Effort:** 6-8 hours

## Critical (4 tasks)
1. **TASK-001** - Add complete dark mode (Agent #11) - 2h
2. **TASK-002** - Replace Card with GlassCard (Agent #66) - 1h
3. **TASK-003** - Add ARIA labels to checkbox (Agent #54) - 1h
4. **TASK-004** - Implement ARIA live region for errors (Agent #54) - 1h

## High Priority (3 tasks)
5. **TASK-005** - Password visibility toggle (Agent #51) - 1.5h
6. **TASK-006** - Social login loading states (Agent #52) - 1h
7. **TASK-007** - Keyboard navigation (Agent #54) - 1.5h

## Medium Priority (3 tasks)
8. Autofocus email input - 0.5h
9. Loading skeleton for auth check - 1h
10. Improve error message specificity - 1h

## Low Priority (2 tasks)
11. Add entrance animations - 1h
12. Polish gradient animations - 0.5h

**Audit Report:** \`docs/audit-reports/reaudit-login-2025-10-11.md\``,
      status: 'to_do',
      priority: 'high',
      storyPoints: 8
    });
    console.log('✅ MUN-109-1 created\n');

    // 3. Create Story for Home Dashboard
    console.log('📝 Step 3: Creating MUN-109-2 (Home Dashboard - 15 tasks)...');
    await axios.post(`${BASE_URL}/api/tracker/stories`, {
      key: 'MUN-109-2',
      epicId: epicId,
      summary: 'Home Dashboard Enhancements - 15 Tasks (HIGHEST PRIORITY)',
      description: `# Home Dashboard Re-Audit Tasks

**File:** \`client/src/pages/home.tsx\`
**Squad Lead:** Agent #52 (Performance)
**Team:** Agents #53, #51, #15
**Effort:** 10-12 hours
**Priority:** **HIGHEST** (Score 78 - Lowest)

## Critical (3 tasks)
1. **TASK-008** - Expand testids from 12 to 30+ (Agent #51) - 3h
2. **TASK-009** - Expand i18n from 7 to 40+ keys (Agent #53) - 3h
3. **TASK-010** - Add dark mode to background (Agent #11) - 0.5h

## High Priority (4 tasks)
4. **TASK-011** - Lazy load widgets (Agent #52) - 2h
5. **TASK-012** - Add loading skeletons (Agent #52) - 2h
6. **TASK-013** - Error boundaries per widget (Agent #14) - 2h
7. **TASK-014** - Code splitting PostFeed (Agent #15) - 1.5h

## Medium Priority (4 tasks)
8. Analytics tracking - 1.5h
9. Persist sidebar state - 1h
10. Widget loading priority - 1.5h
11. Progressive enhancement - 1.5h

## Low Priority (4 tasks)
12. Keyboard shortcuts - 1h
13. Service worker toast - 0.5h
14. Widget animations - 1h
15. Drag-drop reordering - 2h

**Audit Report:** \`docs/audit-reports/reaudit-home-2025-10-11.md\``,
      status: 'to_do',
      priority: 'critical',
      storyPoints: 13
    });
    console.log('✅ MUN-109-2 created\n');

    // 4. Create Story for Profile Page
    console.log('📝 Step 4: Creating MUN-109-3 (Profile Page - 13 tasks)...');
    await axios.post(`${BASE_URL}/api/tracker/stories`, {
      key: 'MUN-109-3',
      epicId: epicId,
      summary: 'Profile Page Enhancements - 13 Tasks',
      description: `# Profile Page Re-Audit Tasks

**File:** \`client/src/pages/UserProfile.tsx\`
**Squad Lead:** Agent #51 (Testing)
**Team:** Agents #52, #14, #15
**Effort:** 14-16 hours

## Critical (3 tasks)
1. **TASK-015** - E2E test suite (Agent #51) - 6h
   - File: \`tests/e2e/profile.spec.ts\`
   - Scenarios: Image upload, bio update, tabs, sharing
2. **TASK-016** - Image compression (Agent #52) - 2h
   - Code: Lines 200-250
   - Library: browser-image-compression
3. **TASK-017** - Cache invalidation (Agent #14) - 1h

## High Priority (3 tasks)
4. **TASK-018** - Split 1059-line component (Agent #14) - 4h
   - ProfileHeader.tsx (lines 1-250)
   - ProfileTabs.tsx (lines 251-500)
   - ProfileEditForm.tsx (lines 501-750)
   - ProfileImageCrop.tsx (lines 751-1059)
5. **TASK-019** - Loading states + skeletons (Agent #52) - 2h
6. **TASK-020** - Retry mechanism (Agent #52) - 2h

## Medium Priority (4 tasks)
7. Responsive image variants - 2h
8. OG meta tags - 1h
9. URL state for tabs - 1.5h
10. Optimistic UI - 1.5h

## Low Priority (3 tasks)
11. Profile analytics - 1h
12. Profile-shaped skeleton - 1h
13. PDF export - 2h

**Audit Report:** \`docs/audit-reports/reaudit-profile-2025-10-11.md\``,
      status: 'to_do',
      priority: 'high',
      storyPoints: 16
    });
    console.log('✅ MUN-109-3 created\n');

    // 5. Create Story for Life CEO
    console.log('📝 Step 5: Creating MUN-109-4 (Life CEO - 14 tasks)...');
    await axios.post(`${BASE_URL}/api/tracker/stories`, {
      key: 'MUN-109-4',
      epicId: epicId,
      summary: 'Life CEO AI Enhancements - 14 Tasks',
      description: `# Life CEO Re-Audit Tasks

**File:** \`client/src/pages/LifeCEOEnhanced.tsx\`
**Squad Lead:** Agent #10 (Life CEO System)
**Team:** Agents #1-16 (Life CEO Sub-Agents), #51, #14
**Effort:** 16-20 hours

## Critical (3 tasks)
1. **TASK-021** - Streaming test suite (Agent #51) - 8h
   - File: \`tests/integration/ai-streaming.test.ts\`
   - Tests: Connection drops, partial JSON, rate limits, timeout
2. **TASK-022** - DB persistence for chat (Agent #10) - 4h
   - Table: chat_history (userId, agentId, messages, timestamp)
3. **TASK-023** - Exponential backoff (Agent #52) - 3h
   - Pattern: 1s, 2s, 4s, 8s with jitter, max 5 retries

## High Priority (3 tasks)
4. **TASK-024** - Voice error handling (Agent #54) - 2h
5. **TASK-025** - 30s timeout for AI (Agent #52) - 2h
6. **TASK-026** - Token usage tracking (Agent #10) - 3h

## Medium Priority (4 tasks)
7. Cross-agent context sharing - 3h
8. Markdown sanitization with DOMPurify - 1.5h
9. Mobile voice UX (48x48px) - 1h
10. Optimistic UI - 2h

## Low Priority (4 tasks)
11. Agent personality tuning - 2h
12. Conversation export (PDF/MD) - 2h
13. Conversation search - 2h
14. Agent usage analytics - 1.5h

**Audit Report:** \`docs/audit-reports/reaudit-lifeceo-2025-10-11.md\``,
      status: 'to_do',
      priority: 'high',
      storyPoints: 20
    });
    console.log('✅ MUN-109-4 created\n');

    // 6. Create Story for Housing
    console.log('📝 Step 6: Creating MUN-109-5 (Housing - 8 tasks)...');
    await axios.post(`${BASE_URL}/api/tracker/stories`, {
      key: 'MUN-109-5',
      epicId: epicId,
      summary: 'Housing Marketplace Pattern Extraction - 8 Tasks',
      description: `# Housing Marketplace Re-Audit Tasks

**File:** \`client/src/pages/HousingMarketplace.tsx\`
**Squad Lead:** Agent #54 (Accessibility)
**Team:** Agents #17, #14, #51
**Effort:** 6-8 hours
**Note:** Gold Standard (88 score) - Focus on pattern extraction

## High Priority (2 tasks)
1. **TASK-027** - Responsive images WebP/AVIF (Agent #52) - 3h
2. **TASK-028** - schema.org structured data (Agent #17) - 2h

## Medium Priority (2 tasks)
3. Map marker clustering - 2h
4. Filter state in URL - 1h

## Low Priority (4 tasks - Documentation Focus)
5. **TASK-029** - Extract ARIA patterns (Agent #54) - 2h
   - Output: \`docs/design-specs/aria-label-conventions.md\`
   - Document 57 ARIA labels for other pages
6. **TASK-030** - Extract keyboard nav patterns (Agent #54) - 1h
   - Output: \`docs/design-specs/keyboard-navigation-standards.md\`
7. Fuzzy search with Fuse.js - 1.5h
8. Saved searches feature - 2h

**Audit Report:** \`docs/audit-reports/reaudit-housing-2025-10-11.md\``,
      status: 'to_do',
      priority: 'medium',
      storyPoints: 8
    });
    console.log('✅ MUN-109-5 created\n');

    // 7. Create Story for Memories
    console.log('📝 Step 7: Creating MUN-109-6 (Memories - 7 tasks)...');
    await axios.post(`${BASE_URL}/api/tracker/stories`, {
      key: 'MUN-109-6',
      epicId: epicId,
      summary: 'Memories Feed Pattern Documentation - 7 Tasks',
      description: `# Memories Feed Re-Audit Tasks

**File:** \`client/src/pages/MemoriesFeed.tsx\`
**Squad Lead:** Agent #17 (UI/UX Design)
**Team:** Agents #11, #14, #66
**Effort:** 4-6 hours
**Note:** Aurora Tide Gold Standard (99 score) - Pattern extraction

## High Priority (1 task)
1. **TASK-031** - Virtual scrolling (Agent #52) - 3h
   - Library: react-window
   - Config: Item height 400px, overscan 3
   - Performance: Smooth with 5000+ items

## Medium Priority (2 tasks)
2. Prioritize above-fold images - 1h
3. Search debounce + server-side - 1.5h

## Low Priority (4 tasks - Documentation Focus)
4. **TASK-032** - GlassCard patterns (Agent #11) - 1.5h
   - Output: \`docs/design-specs/aurora-tide-glasscard-patterns.md\`
5. **TASK-033** - Dark mode guide (Agent #11) - 1h
   - Output: \`docs/design-specs/aurora-tide-dark-mode-guide.md\`
6. **TASK-034** - Animation system (Agent #11) - 1h
   - Output: \`docs/design-specs/aurora-tide-animation-system.md\`
7. AI semantic search - 2h

**Audit Report:** \`docs/audit-reports/reaudit-memories-2025-10-11.md\``,
      status: 'to_do',
      priority: 'medium',
      storyPoints: 6
    });
    console.log('✅ MUN-109-6 created\n');

    // 8. Create Story for Events
    console.log('📝 Step 8: Creating MUN-109-7 (Events - 12 tasks)...');
    await axios.post(`${BASE_URL}/api/tracker/stories`, {
      key: 'MUN-109-7',
      epicId: epicId,
      summary: 'Events Performance Optimization - 12 Tasks',
      description: `# Events Page Re-Audit Tasks

**File:** \`client/src/pages/EnhancedEvents.tsx\`
**Squad Lead:** Agent #20 (Search & Discovery)
**Team:** Agents #52, #15, #14
**Effort:** 10-12 hours
**Note:** Feature Excellence (99 score) - Performance focus

## Critical (2 tasks)
1. **TASK-035** - Performance budget (Agent #52) - 2h
   - Tool: webpack-bundle-analyzer, Lighthouse CI
   - Budget: Main < 150KB, Map < 100KB, Calendar < 80KB
2. **TASK-036** - Lazy load calendar (Agent #15) - 2h
   - Save ~80KB on initial load
   - Code: Line 34

## High Priority (3 tasks)
3. **TASK-037** - Lazy load image gallery (Agent #15) - 1.5h
   - Line 39, save ~40KB
4. **TASK-038** - Dynamic import export CSV (Agent #15) - 1h
   - Line 42, save ~20KB
5. **TASK-039** - Lazy load share dialog (Agent #15) - 1.5h
   - Lines 79-86, save ~30KB

## Medium Priority (3 tasks)
6. **TASK-040** - useReducer for filters (Agent #14) - 2h
7. **TASK-041** - Search debounce 300ms (Agent #52) - 1h
8. Cache strategy (staleTime 5min) - 1.5h

## Low Priority (4 tasks)
9. Prefetch event details on hover - 1h
10. Service worker image caching - 1.5h
11. Calendar keyboard nav - 1.5h
12. Calendar accessibility - 1h

**Audit Report:** \`docs/audit-reports/reaudit-events-2025-10-11.md\``,
      status: 'to_do',
      priority: 'medium',
      storyPoints: 12
    });
    console.log('✅ MUN-109-7 created\n');

    console.log('\n🎉 Epic MUN-109 created successfully with 7 stories!');
    console.log('\n📊 Summary:');
    console.log('- Epic: MUN-109');
    console.log('- Stories: 7 (MUN-109-1 through MUN-109-7)');
    console.log('- Total Tasks: 81');
    console.log('- Total Story Points: 83');
    console.log('- Estimated Effort: 72-86 hours');
    console.log('\n🔗 View in Project Tracker: http://localhost:5000/admin/projects');

  } catch (error: any) {
    console.error('❌ Error creating Epic MUN-109:', error.response?.data || error.message);
    process.exit(1);
  }
}

createEpicMUN109();
