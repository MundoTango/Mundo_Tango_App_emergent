/**
 * Phase 7 Integration Tests - MB.MD V2 Methodology
 * Evidence-based validation with parallel execution
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

interface TestResult {
  track: string;
  passed: boolean;
  duration: number;
  evidence: any;
  metrics: Record<string, number>;
}

const results: TestResult[] = [];

// ============================================================================
// Track 1: Autonomous Cycle Test
// ============================================================================
async function track1_autonomousCycle(): Promise<TestResult> {
  const startTime = Date.now();
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}📋 TRACK 1: Autonomous Cycle Validation${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  try {
    // Step 1: Trigger a test failure scenario
    console.log('⚡ Step 1: Triggering schema validation test...');
    const testPayload = {
      agentId: 'agent-3',
      testType: 'schema-validation',
      errorMessage: 'Column type mismatch: expected integer, got varchar',
      context: {
        file: 'shared/schema.ts',
        table: 'users',
        column: 'age'
      }
    };

    // Step 2: Auto-fix should trigger
    console.log('🤖 Step 2: Initiating auto-fix engine...');
    const fixResponse = await axios.post(
      `${BASE_URL}/api/agent-intelligence/auto-fix/trigger`,
      testPayload
    );

    console.log(`   Fix ID: ${fixResponse.data.fixId}`);
    console.log(`   Confidence: ${(fixResponse.data.confidence * 100).toFixed(1)}%`);

    // Step 3: Validate the fix
    console.log('✅ Step 3: Validating proposed fix...');
    const validateResponse = await axios.post(
      `${BASE_URL}/api/agent-intelligence/auto-fix/${fixResponse.data.fixId}/validate`,
      { testResults: { passed: true, testsRun: 12, testsPassed: 12 } }
    );

    console.log(`   Validation: ${validateResponse.data.status}`);

    // Step 4: Capture learning
    console.log('📚 Step 4: Capturing learning pattern...');
    const learningResponse = await axios.post(
      `${BASE_URL}/api/agent-intelligence/learnings`,
      {
        agentId: 'agent-3',
        pattern: 'schema-type-mismatch-fix',
        solution: fixResponse.data.solution,
        confidence: fixResponse.data.confidence,
        metadata: {
          fixId: fixResponse.data.fixId,
          automationRate: 0.85
        }
      }
    );

    const duration = Date.now() - startTime;
    const automationRate = fixResponse.data.confidence;

    console.log(`\n${colors.green}✅ Track 1 Complete!${colors.reset}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Automation Rate: ${(automationRate * 100).toFixed(1)}%`);
    console.log(`   Learning ID: ${learningResponse.data.learningId}`);

    return {
      track: 'Autonomous Cycle',
      passed: duration < 30000 && automationRate > 0.75,
      duration,
      evidence: {
        fixId: fixResponse.data.fixId,
        learningId: learningResponse.data.learningId,
        confidence: fixResponse.data.confidence
      },
      metrics: {
        cycleTime: duration,
        automationRate,
        confidenceScore: fixResponse.data.confidence
      }
    };

  } catch (error: any) {
    console.error(`${colors.red}❌ Track 1 Failed:${colors.reset}`, error.message);
    return {
      track: 'Autonomous Cycle',
      passed: false,
      duration: Date.now() - startTime,
      evidence: { error: error.message },
      metrics: { cycleTime: -1, automationRate: 0, confidenceScore: 0 }
    };
  }
}

// ============================================================================
// Track 2: Cross-Division Collaboration
// ============================================================================
async function track2_collaboration(): Promise<TestResult> {
  const startTime = Date.now();
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}🤝 TRACK 2: Cross-Division Collaboration${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  try {
    // Step 1: Submit 3 agent solutions
    console.log('📊 Step 1: Submitting solutions from 3 agents...');
    
    const agents = [
      { id: 'agent-2-1', division: 'Frontend', confidence: 0.88, solution: 'Implement React.memo for heavy components' },
      { id: 'agent-1-3', division: 'Backend', confidence: 0.92, solution: 'Add Redis caching layer for API responses' },
      { id: 'agent-3-2', division: 'Database', confidence: 0.85, solution: 'Create materialized view for slow queries' }
    ];

    const votingPromises = agents.map(agent => 
      axios.post(`${BASE_URL}/api/agent-intelligence/collaboration/vote`, {
        issueId: 'api-performance-001',
        agentId: agent.id,
        solution: agent.solution,
        confidence: agent.confidence,
        expertise: agent.division === 'Backend' ? 0.95 : 0.8
      })
    );

    await Promise.all(votingPromises);
    console.log(`   ✓ 3 solutions submitted`);

    // Step 2: Calculate consensus
    console.log('🗳️  Step 2: Calculating weighted consensus...');
    const consensusResponse = await axios.post(
      `${BASE_URL}/api/agent-intelligence/collaboration/consensus`,
      { issueId: 'api-performance-001' }
    );

    console.log(`   Winner: ${consensusResponse.data.winner.agentId}`);
    console.log(`   Weighted Score: ${(consensusResponse.data.winner.weightedScore * 100).toFixed(1)}%`);
    console.log(`   Consensus Reached: ${consensusResponse.data.consensusReached ? 'Yes' : 'No'}`);

    // Step 3: Log collaboration
    console.log('📡 Step 3: Logging inter-agent communication...');
    const logResponse = await axios.post(
      `${BASE_URL}/api/agent-intelligence/collaboration/log`,
      {
        participants: agents.map(a => a.id),
        outcome: consensusResponse.data.winner.solution,
        consensusTime: Date.now() - startTime
      }
    );

    const duration = Date.now() - startTime;
    const consensusReached = consensusResponse.data.consensusReached;

    console.log(`\n${colors.green}✅ Track 2 Complete!${colors.reset}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Consensus: ${consensusReached}`);
    console.log(`   Participants: ${agents.length}`);

    return {
      track: 'Cross-Division Collaboration',
      passed: duration < 60000 && consensusReached,
      duration,
      evidence: {
        winner: consensusResponse.data.winner,
        participants: agents.length
      },
      metrics: {
        consensusTime: duration,
        participantCount: agents.length,
        winnerConfidence: consensusResponse.data.winner.weightedScore
      }
    };

  } catch (error: any) {
    console.error(`${colors.red}❌ Track 2 Failed:${colors.reset}`, error.message);
    return {
      track: 'Cross-Division Collaboration',
      passed: false,
      duration: Date.now() - startTime,
      evidence: { error: error.message },
      metrics: { consensusTime: -1, participantCount: 0, winnerConfidence: 0 }
    };
  }
}

// ============================================================================
// Track 3: Agent Detail Page Navigation
// ============================================================================
async function track3_agentDetailPage(): Promise<TestResult> {
  const startTime = Date.now();
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}🖥️  TRACK 3: Agent Detail Page Navigation${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  try {
    const agentId = 'agent-15';
    
    // Test all 5 tabs data endpoints
    console.log(`📄 Testing 5-tab data for ${agentId}...`);
    
    const [overview, tests, learnings, fixes, metrics] = await Promise.all([
      axios.get(`${BASE_URL}/api/agent-intelligence/registry/agents/${agentId}`),
      axios.get(`${BASE_URL}/api/agent-intelligence/tests/${agentId}`),
      axios.get(`${BASE_URL}/api/agent-intelligence/learnings/${agentId}`),
      axios.get(`${BASE_URL}/api/agent-intelligence/auto-fix/history/${agentId}`),
      axios.get(`${BASE_URL}/api/agent-intelligence/metrics/${agentId}`)
    ]);

    console.log(`   ✓ Overview: ${overview.data.name}`);
    console.log(`   ✓ Tests: ${tests.data.tests?.length || 0} tests`);
    console.log(`   ✓ Learnings: ${learnings.data.learnings?.length || 0} patterns`);
    console.log(`   ✓ Fixes: ${fixes.data.fixes?.length || 0} auto-fixes`);
    console.log(`   ✓ Metrics: ${Object.keys(metrics.data).length} KPIs`);

    const duration = Date.now() - startTime;

    console.log(`\n${colors.green}✅ Track 3 Complete!${colors.reset}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   All tabs loaded successfully`);

    return {
      track: 'Agent Detail Page',
      passed: duration < 2000,
      duration,
      evidence: {
        agentId,
        tabsLoaded: 5,
        agentName: overview.data.name
      },
      metrics: {
        loadTime: duration,
        testsCount: tests.data.tests?.length || 0,
        learningsCount: learnings.data.learnings?.length || 0,
        fixesCount: fixes.data.fixes?.length || 0
      }
    };

  } catch (error: any) {
    console.error(`${colors.red}❌ Track 3 Failed:${colors.reset}`, error.message);
    return {
      track: 'Agent Detail Page',
      passed: false,
      duration: Date.now() - startTime,
      evidence: { error: error.message },
      metrics: { loadTime: -1, testsCount: 0, learningsCount: 0, fixesCount: 0 }
    };
  }
}

// ============================================================================
// MB.MD V2 Evidence Report
// ============================================================================
function generateReport(results: TestResult[]) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}📊 MB.MD V2 VALIDATION REPORT - Phase 7 Integration${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`${colors.yellow}Summary:${colors.reset}`);
  console.log(`   Tests Executed: ${totalTests}`);
  console.log(`   Passed: ${colors.green}${passedTests}${colors.reset}`);
  console.log(`   Failed: ${colors.red}${totalTests - passedTests}${colors.reset}`);
  console.log(`   Total Duration: ${totalDuration}ms`);
  console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  console.log(`${colors.yellow}Detailed Results:${colors.reset}`);
  results.forEach(result => {
    const status = result.passed ? `${colors.green}✅ PASS${colors.reset}` : `${colors.red}❌ FAIL${colors.reset}`;
    console.log(`   ${status} - ${result.track} (${result.duration}ms)`);
    console.log(`      Evidence:`, JSON.stringify(result.evidence, null, 2).split('\n').map(l => `      ${l}`).join('\n'));
    console.log(`      Metrics:`, JSON.stringify(result.metrics, null, 2).split('\n').map(l => `      ${l}`).join('\n'));
  });

  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  
  if (passedTests === totalTests) {
    console.log(`${colors.green}🎉 ALL TESTS PASSED - Phase 7 Ready for Production!${colors.reset}\n`);
  } else {
    console.log(`${colors.red}⚠️  Some tests failed - Review and fix before production${colors.reset}\n`);
  }
}

// ============================================================================
// Main Execution - Parallel Track Execution
// ============================================================================
async function runIntegrationTests() {
  console.log(`\n${colors.blue}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  Phase 7 Integration Tests - MB.MD V2 Methodology        ║${colors.reset}`);
  console.log(`${colors.blue}║  Parallel Execution: 3 Tracks                             ║${colors.reset}`);
  console.log(`${colors.blue}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

  const startTime = Date.now();

  // Execute all tracks in parallel for maximum efficiency
  const [result1, result2, result3] = await Promise.all([
    track1_autonomousCycle(),
    track2_collaboration(),
    track3_agentDetailPage()
  ]);

  results.push(result1, result2, result3);

  const totalDuration = Date.now() - startTime;
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.green}All tracks completed in ${totalDuration}ms${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  generateReport(results);
}

// Execute tests
runIntegrationTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
