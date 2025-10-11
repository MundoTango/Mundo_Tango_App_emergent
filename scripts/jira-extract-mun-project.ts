#!/usr/bin/env tsx
// Phase 1: Jira Intelligence Extraction (Agent #65 + #67)
// Extract MUN project data (5 Epics, 15 Stories) from Jira

import { jiraIntegrationService } from '../server/services/jiraIntegrationService';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function extractMUNProject() {
  console.log('=== Phase 1: Jira Intelligence Extraction ===');
  console.log('Agent #65 (Project Tracker) + Agent #67 (Community Relations)');
  console.log('Goal: Extract MUN project data from Jira\n');

  try {
    // Check environment variables
    if (!process.env.JIRA_API_TOKEN || !process.env.JIRA_EMAIL || !process.env.JIRA_DOMAIN) {
      console.error('❌ Missing JIRA credentials');
      console.error('Required environment variables: JIRA_API_TOKEN, JIRA_EMAIL, JIRA_DOMAIN');
      process.exit(1);
    }

    console.log(`✅ Connected to Jira: ${process.env.JIRA_DOMAIN}`);
    console.log(`📧 Using: ${process.env.JIRA_EMAIL}\n`);

    // Extract MUN project data
    const projectData = await jiraIntegrationService.fetchProjectData('MUN');

    console.log('\n📊 Extraction Summary:');
    console.log(`   Epics: ${projectData.epics.length}`);
    console.log(`   Stories: ${projectData.stories.length}`);
    console.log(`   Total Issues: ${projectData.epics.length + projectData.stories.length}`);

    if (projectData.epics.length === 0 && projectData.stories.length === 0) {
      console.log('\n⚠️  No data found in MUN project.');
      console.log('   Possible reasons:');
      console.log('   1. Project key "MUN" does not exist');
      console.log('   2. No epics/stories in the project');
      console.log('   3. API credentials lack permission\n');
      
      console.log('💡 Trying alternative project keys...');
      
      // Try MT project as fallback
      const mtData = await jiraIntegrationService.fetchProjectData('MT');
      if (mtData.epics.length > 0 || mtData.stories.length > 0) {
        console.log('\n✅ Found data in MT project instead:');
        console.log(`   Epics: ${mtData.epics.length}`);
        console.log(`   Stories: ${mtData.stories.length}`);
        projectData.epics = mtData.epics;
        projectData.stories = mtData.stories;
      }
    }

    // Save to JSON file
    const outputPath = join(process.cwd(), 'docs', 'jira-exports', 'mun-project-export.json');
    writeFileSync(outputPath, JSON.stringify(projectData, null, 2));
    console.log(`\n✅ Saved export to: ${outputPath}`);

    // Display extracted data
    console.log('\n📋 Extracted Epics:');
    projectData.epics.forEach((epic, index) => {
      console.log(`   ${index + 1}. ${epic.key}: ${epic.fields.summary}`);
      console.log(`      Status: ${epic.fields.status?.name || 'Unknown'}`);
      console.log(`      Priority: ${epic.fields.priority?.name || 'None'}`);
    });

    console.log('\n📋 Extracted Stories:');
    projectData.stories.forEach((story, index) => {
      console.log(`   ${index + 1}. ${story.key}: ${story.fields.summary}`);
      console.log(`      Status: ${story.fields.status?.name || 'Unknown'}`);
      console.log(`      Priority: ${story.fields.priority?.name || 'None'}`);
      console.log(`      Epic: ${story.fields.parent?.key || story.fields.customfield_10014 || 'None'}`);
    });

    console.log('\n🎉 Phase 1 Complete: Jira Intelligence Extracted');
    console.log('\nNext Steps:');
    console.log('1. Review exported data: docs/jira-exports/mun-project-export.json');
    console.log('2. Map Jira fields to database schema');
    console.log('3. Build migration service (Phase 4)');

  } catch (error: any) {
    console.error('\n❌ Extraction failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Execute
extractMUNProject();
