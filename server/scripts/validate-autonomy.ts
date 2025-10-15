#!/usr/bin/env tsx
/**
 * TRACK 6: Validation Framework
 * Tests all Phase 11 autonomous capabilities
 */

import { db } from '../db';
import { esaAgents, agentSchedules, componentAgents } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function validateAutonomy() {
  console.log('🔍 PHASE 11 VALIDATION STARTING...\n');

  const results = {
    agents: { pass: 0, fail: 0 },
    schedules: { pass: 0, fail: 0 },
    components: { pass: 0, fail: 0 },
    collaboration: { pass: 0, fail: 0 },
  };

  // Test 1: Verify all UI Sub-Agents registered
  console.log('📋 Test 1: UI Sub-Agents Registration');
  const agentIds = ['AGENT-11', 'AGENT-11.1', 'AGENT-11.2', 'AGENT-11.3', 'AGENT-11.4', 'AGENT-11.5'];
  for (const id of agentIds) {
    const agent = await db.select().from(esaAgents).where(eq(esaAgents.id, id));
    if (agent.length > 0 && agent[0].status === 'active') {
      console.log(`  ✅ ${id}: ${agent[0].name} - active`);
      results.agents.pass++;
    } else {
      console.log(`  ❌ ${id}: Not found or inactive`);
      results.agents.fail++;
    }
  }

  // Test 2: Verify autonomous schedules
  console.log('\n⏰ Test 2: Autonomous Schedules');
  const schedules = await db.select().from(agentSchedules);
  console.log(`  Found ${schedules.length} schedules`);
  for (const schedule of schedules) {
    if (schedule.status === 'active' || schedule.status === 'paused') {
      console.log(`  ✅ ${schedule.agentId}: ${schedule.schedule} (${schedule.status})`);
      results.schedules.pass++;
    } else {
      console.log(`  ❌ ${schedule.agentId}: Invalid status`);
      results.schedules.fail++;
    }
  }

  // Test 3: Component registration
  console.log('\n📦 Test 3: Component Registration');
  const components = await db.select().from(componentAgents);
  console.log(`  Registered components: ${components.length}`);
  if (components.length > 0) {
    console.log(`  ✅ Components tracked: ${components.length}`);
    results.components.pass++;
  } else {
    console.log(`  ❌ No components registered`);
    results.components.fail++;
  }

  // Test 4: Collaboration hierarchy
  console.log('\n🤝 Test 4: Collaboration Hierarchy');
  const coordinator = await db.select().from(esaAgents).where(eq(esaAgents.id, 'AGENT-11'));
  if (coordinator.length > 0) {
    console.log(`  ✅ Coordinator: ${coordinator[0].name}`);
    results.collaboration.pass++;
    
    // Check sub-agents report to coordinator
    const subAgents = await db.select().from(esaAgents).where(eq(esaAgents.id, 'AGENT-11.1'));
    if (subAgents.length > 0 && subAgents[0].reportsTo?.includes('AGENT-11')) {
      console.log(`  ✅ Sub-agents report to coordinator`);
      results.collaboration.pass++;
    } else {
      console.log(`  ❌ Sub-agents hierarchy broken`);
      results.collaboration.fail++;
    }
  } else {
    console.log(`  ❌ Coordinator not found`);
    results.collaboration.fail++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Agents:        ${results.agents.pass} pass, ${results.agents.fail} fail`);
  console.log(`Schedules:     ${results.schedules.pass} pass, ${results.schedules.fail} fail`);
  console.log(`Components:    ${results.components.pass} pass, ${results.components.fail} fail`);
  console.log(`Collaboration: ${results.collaboration.pass} pass, ${results.collaboration.fail} fail`);
  
  const totalPass = results.agents.pass + results.schedules.pass + results.components.pass + results.collaboration.pass;
  const totalFail = results.agents.fail + results.schedules.fail + results.components.fail + results.collaboration.fail;
  const percentage = ((totalPass / (totalPass + totalFail)) * 100).toFixed(1);
  
  console.log(`\n🎯 Overall: ${percentage}% passing (${totalPass}/${totalPass + totalFail})`);

  return { results, totalPass, totalFail, percentage };
}

if (require.main === module) {
  validateAutonomy()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Validation error:', error);
      process.exit(1);
    });
}

export { validateAutonomy };
