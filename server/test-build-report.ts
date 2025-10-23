/**
 * Test script for Auto-Documentation System
 * STREAM E - Oct 23, 2025
 * 
 * Run with: npx tsx server/test-build-report.ts
 */

import { createBuildReport, type BuildData } from './services/autoDocumentation';

async function testBuildReport() {
  console.log('🧪 Testing Auto-Documentation System...\n');

  const testBuildData: BuildData = {
    projectId: 999,
    projectName: 'Auto-Documentation System Test',
    agent: 'Test Script',
    executionMode: 'FOCUSED',
    summary: 'Built and tested the Auto-Documentation System (STREAM E)',
    reasoning: 'To automatically generate build reports after successful builds with architect approval',
    tasks: [
      {
        id: '1',
        description: 'Create autoDocumentation.ts service file',
        status: 'completed',
        architectApproved: true,
        evidence: [
          'server/services/autoDocumentation.ts created with all 4 functions',
          'TypeScript interfaces defined for BuildData and IntegrationStatus',
        ]
      },
      {
        id: '2',
        description: 'Design markdown template structure',
        status: 'completed',
        architectApproved: true,
        evidence: [
          'Template includes: Header, Summary, Tasks, Evidence, Next Steps',
          'Integration checklist auto-populates based on tasks',
        ]
      },
      {
        id: '3',
        description: 'Hook into chatProjectsRoutes.ts',
        status: 'completed',
        architectApproved: true,
        evidence: [
          'Import added for createBuildReport',
          'Auto-trigger on build completion + architect approval',
          'Manual testing endpoint created',
        ]
      },
      {
        id: '4',
        description: 'Create docs/BUILD_REPORTS/ directory',
        status: 'completed',
        architectApproved: true,
        evidence: [
          'Directory created at docs/BUILD_REPORTS/',
          'Verified with bash mkdir command',
        ]
      },
      {
        id: '5',
        description: 'Test the system',
        status: 'completed',
        architectApproved: false,
        evidence: [
          'Test script created and running',
        ]
      }
    ],
    screenshots: [],
    codeChanges: [
      'server/services/autoDocumentation.ts (NEW)',
      'server/routes/chatProjectsRoutes.ts (MODIFIED - added import and hooks)',
      'docs/BUILD_REPORTS/ (NEW DIRECTORY)',
    ],
    nextSteps: [
      'Integrate with real architect validation flow',
      'Add screenshot capture integration',
      'Configure Git commits for production (optional)',
      'Add webhook notifications when reports are generated',
    ],
    timestamp: new Date(),
  };

  try {
    console.log('📝 Generating build report...');
    
    const result = await createBuildReport(testBuildData, {
      updateStatus: true,
      gitCommit: false, // Don't commit during testing
    });

    console.log('\n✅ Build report generated successfully!');
    console.log(`📄 Report saved to: ${result.filePath}`);
    console.log(`📊 Integration status updated`);
    console.log('\n--- Report Preview ---\n');
    console.log(result.report.substring(0, 500) + '...\n');
    console.log('(See full report in the file)\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testBuildReport();
