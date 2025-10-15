#!/usr/bin/env tsx
/**
 * TRACK 5: Phase 11 Integration Script
 * Runs all integration tasks in parallel where possible
 * 
 * Execute: npx tsx server/scripts/run-phase11-integration.ts
 */

import { componentRegistrationService } from '../services/ComponentRegistrationService';
import { scheduleSetupService } from '../services/ScheduleSetupService';
import { seedEsaAgents } from '../db/seed-esa-agents';

async function runPhase11Integration() {
  console.log('🚀 PHASE 11: TRACK 5 INTEGRATION STARTING...\n');
  
  const startTime = Date.now();

  try {
    // PARALLEL EXECUTION: Step 1 & 2
    console.log('⚡ Running parallel tasks (Agents + Schedules)...');
    const [agentResult, scheduleResult] = await Promise.all([
      // Task 1: Seed UI Sub-Agents (#11.1-11.5)
      (async () => {
        console.log('  📋 Seeding UI Sub-Agents to ESA registry...');
        const result = await seedEsaAgents();
        console.log(`  ✅ Seeded ${result.count} agents total (including #11.1-11.5)`);
        return result;
      })(),
      
      // Task 2: Setup autonomous schedules
      (async () => {
        console.log('  ⏰ Setting up autonomous schedules...');
        const result = await scheduleSetupService.setupAllSchedules();
        console.log(`  ✅ Created ${result.created} schedules for agents #11.1-11.5`);
        return result;
      })()
    ]);

    // Step 3: Register all components (depends on DB being ready)
    console.log('\n📦 Registering all UI components as agents...');
    const componentResult = await componentRegistrationService.registerAllComponents();
    console.log(`✅ Registered ${componentResult.registered} new components`);
    console.log(`✅ Updated ${componentResult.updated} existing components`);
    console.log(`📊 Total: ${componentResult.total} components tracked`);

    // Calculate next run times for all schedules
    console.log('\n⏰ Calculating next run times...');
    const schedules = await scheduleSetupService.getAllSchedules();
    await Promise.all(
      schedules.map(s => scheduleSetupService.updateNextRun(s.agentId))
    );
    console.log(`✅ Updated ${schedules.length} schedule next-run times`);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('✅ PHASE 11: TRACK 5 INTEGRATION COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📊 Integration Summary:');
    console.log(`  ├─ Agents: ${agentResult.count} total (5 UI Sub-Agents added)`);
    console.log(`  ├─ Schedules: ${scheduleResult.schedules.length} autonomous schedules`);
    console.log(`  ├─ Components: ${componentResult.total} registered`);
    console.log(`  └─ Time: ${elapsed}s`);
    console.log('\n🎯 Next: Track 6 Execution (Run agents, validate, report)');

    return {
      success: true,
      agents: agentResult,
      schedules: scheduleResult,
      components: componentResult,
      elapsed,
    };

  } catch (error) {
    console.error('\n❌ Integration failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  runPhase11Integration()
    .then((result) => {
      console.log('\n✨ Integration complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Integration error:', error);
      process.exit(1);
    });
}

export { runPhase11Integration };
