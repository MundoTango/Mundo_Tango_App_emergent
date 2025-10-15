/**
 * Phase 7 Integration Tests - MB.MD V2 Methodology
 * UPDATED: Using actual endpoint paths from agentIntelligenceRoutes.ts
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
// Track 1: ESA Registry & Auto-Fix
// ============================================================================
async function track1_esaRegistryAndAutoFix(): Promise<TestResult> {
  const startTime = Date.now();
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}📋 TRACK 1: ESA Registry & Auto-Fix Engine${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  try {
    // Step 1: Get all ESA agents
    console.log('📊 Step 1: Fetching ESA agent registry...');
    const agentsResponse = await axios.get(`${BASE_URL}/api/agent-intelligence/esa/agents`);
    const agents = agentsResponse.data.agents;
    console.log(`   ✓ Retrieved ${agents.length} agents`);

    // Step 2: Get details for first agent
    const firstAgent = agents[0];
    console.log(`\n🔍 Step 2: Fetching agent details for ${firstAgent.agentId}...`);
    const agentDetail = await axios.get(`${BASE_URL}/api/agent-intelligence/esa/agent/${firstAgent.agentId}`);
    console.log(`   ✓ Agent: ${agentDetail.data.agent.name}`);
    console.log(`   ✓ Division: ${agentDetail.data.agent.division}`);
    console.log(`   ✓ Expertise: ${agentDetail.data.agent.expertise}`);

    // Step 3: Trigger auto-fix for this agent
    console.log(`\n🤖 Step 3: Triggering auto-fix for ${firstAgent.agentId}...`);
    const autoFixResponse = await axios.post(
      `${BASE_URL}/api/agent-intelligence/${firstAgent.agentId}/auto-fix`,
      {
        issue: 'Test schema validation failure',
        severity: 'medium',
        context: {
          file: 'shared/schema.ts',
          error: 'Type mismatch detected'
        }
      }
    );

    console.log(`   ✓ Fix ID: ${autoFixResponse.data.autoFix.id}`);
    console.log(`   ✓ Status: ${autoFixResponse.data.autoFix.status}`);

    // Step 4: Get recent auto-fixes
    console.log(`\n📜 Step 4: Fetching recent auto-fixes...`);
    const recentFixes = await axios.get(`${BASE_URL}/api/agent-intelligence/auto-fixes/recent?limit=5`);
    console.log(`   ✓ Retrieved ${recentFixes.data.autoFixes.length} recent fixes`);

    const duration = Date.now() - startTime;

    console.log(`\n${colors.green}✅ Track 1 Complete!${colors.reset}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Agents in registry: ${agents.length}`);
    console.log(`   Auto-fixes logged: ${recentFixes.data.autoFixes.length}`);

    return {
      track: 'ESA Registry & Auto-Fix',
      passed: agents.length > 0 && duration < 5000,
      duration,
      evidence: {
        agentsCount: agents.length,
        firstAgent: firstAgent.agentId,
        autoFixId: autoFixResponse.data.autoFix.id
      },
      metrics: {
        agentsRegistered: agents.length,
        autoFixesLogged: recentFixes.data.autoFixes.length,
        responseTime: duration
      }
    };

  } catch (error: any) {
    console.error(`${colors.red}❌ Track 1 Failed:${colors.reset}`, error.message);
    return {
      track: 'ESA Registry & Auto-Fix',
      passed: false,
      duration: Date.now() - startTime,
      evidence: { error: error.message },
      metrics: { agentsRegistered: 0, autoFixesLogged: 0, responseTime: -1 }
    };
  }
}

// ============================================================================
// Track 2: ML Confidence & Learning Validation
// ============================================================================
async function track2_mlConfidenceAndLearning(): Promise<TestResult> {
  const startTime = Date.now();
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}🧠 TRACK 2: ML Confidence & Learning Validation${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  try {
    // Step 1: Record a learning
    console.log('📚 Step 1: Recording new learning pattern...');
    const learningResponse = await axios.post(
      `${BASE_URL}/api/agent-intelligence/learn`,
      {
        agentId: 'agent-3',
        learningType: 'pattern-recognition',
        context: 'database-schema-optimization',
        lessonLearned: 'Use indexes for frequently queried columns',
        confidenceScore: 0.92,
        metadata: {
          source: 'integration-test',
          category: 'performance'
        }
      }
    );

    console.log(`   ✓ Learning ID: ${learningResponse.data.learning.id}`);
    console.log(`   ✓ Confidence: ${learningResponse.data.learning.confidenceScore}`);

    // Step 2: Validate learning with ML
    console.log(`\n🎯 Step 2: Calculating ML confidence score...`);
    const validationResponse = await axios.post(
      `${BASE_URL}/api/agent-intelligence/agent-3/validate-learning`,
      {
        pattern: 'database-index-optimization',
        context: {
          domain: 'database',
          complexity: 'medium',
          previousSuccesses: 15
        }
      }
    );

    console.log(`   ✓ ML Confidence: ${(validationResponse.data.confidence * 100).toFixed(1)}%`);
    console.log(`   ✓ Historical Success: ${(validationResponse.data.components.historicalSuccessRate * 100).toFixed(1)}%`);
    console.log(`   ✓ Context Match: ${(validationResponse.data.components.contextSimilarity * 100).toFixed(1)}%`);

    // Step 3: Get recent learnings
    console.log(`\n📖 Step 3: Fetching recent learnings...`);
    const recentLearnings = await axios.get(`${BASE_URL}/api/agent-intelligence/learnings/recent?limit=10`);
    console.log(`   ✓ Retrieved ${recentLearnings.data.count} recent learnings`);

    const duration = Date.now() - startTime;
    const mlConfidence = validationResponse.data.confidence;

    console.log(`\n${colors.green}✅ Track 2 Complete!${colors.reset}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   ML Confidence: ${(mlConfidence * 100).toFixed(1)}%`);

    return {
      track: 'ML Confidence & Learning',
      passed: mlConfidence > 0.7 && duration < 5000,
      duration,
      evidence: {
        learningId: learningResponse.data.learning.id,
        mlConfidence,
        recentLearningsCount: recentLearnings.data.count
      },
      metrics: {
        confidenceScore: mlConfidence,
        historicalSuccess: validationResponse.data.components.historicalSuccessRate,
        learningsCount: recentLearnings.data.count
      }
    };

  } catch (error: any) {
    console.error(`${colors.red}❌ Track 2 Failed:${colors.reset}`, error.message);
    return {
      track: 'ML Confidence & Learning',
      passed: false,
      duration: Date.now() - startTime,
      evidence: { error: error.message },
      metrics: { confidenceScore: 0, historicalSuccess: 0, learningsCount: 0 }
    };
  }
}

// ============================================================================
// Track 3: Collaboration & Voting
// ============================================================================
async function track3_collaborationAndVoting(): Promise<TestResult> {
  const startTime = Date.now();
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}🤝 TRACK 3: Collaboration & Voting System${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  try {
    // Step 1: Start collaboration
    console.log('🚀 Step 1: Starting collaboration session...');
    const collabResponse = await axios.post(
      `${BASE_URL}/api/agent-intelligence/collaborate/start`,
      {
        topic: 'API Performance Optimization',
        description: 'Optimize slow endpoint response times',
        requiredAgents: 3,
        initiatedBy: 'agent-1-3'
      }
    );

    const collabId = collabResponse.data.collaboration.id;
    console.log(`   ✓ Collaboration ID: ${collabId}`);
    console.log(`   ✓ Topic: ${collabResponse.data.collaboration.topic}`);

    // Step 2: Submit votes from 3 agents
    console.log(`\n🗳️  Step 2: Submitting votes from 3 agents...`);
    const agents = [
      { id: 'agent-2-1', weight: 0.8, vote: 'approve' },
      { id: 'agent-1-3', weight: 0.95, vote: 'approve' },
      { id: 'agent-3-2', weight: 0.85, vote: 'approve' }
    ];

    const votePromises = agents.map(agent => 
      axios.post(`${BASE_URL}/api/agent-intelligence/collaborate/${collabId}/vote`, {
        agentId: agent.id,
        decision: agent.vote,
        confidence: agent.weight,
        rationale: `Solution aligns with ${agent.id} expertise`
      })
    );

    const voteResults = await Promise.all(votePromises);
    console.log(`   ✓ ${voteResults.length} votes submitted`);
    const lastVote = voteResults[voteResults.length - 1].data;
    console.log(`   ✓ Current consensus: ${(lastVote.consensus.consensusScore * 100).toFixed(1)}%`);
    console.log(`   ✓ Decision: ${lastVote.consensus.decision}`);

    // Step 3: Check final consensus
    console.log(`\n📊 Step 3: Checking final consensus...`);
    const consensusResponse = await axios.get(
      `${BASE_URL}/api/agent-intelligence/collaborate/${collabId}/consensus`
    );

    console.log(`   ✓ Final consensus: ${(consensusResponse.data.consensus.consensusScore * 100).toFixed(1)}%`);
    console.log(`   ✓ Total votes: ${consensusResponse.data.votes.length}`);
    console.log(`   ✓ Decision: ${consensusResponse.data.consensus.decision}`);

    const duration = Date.now() - startTime;
    const consensusScore = consensusResponse.data.consensus.consensusScore;
    const consensusReached = consensusResponse.data.consensus.decision !== 'pending';

    console.log(`\n${colors.green}✅ Track 3 Complete!${colors.reset}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Consensus: ${consensusReached ? 'Reached' : 'Pending'}`);

    return {
      track: 'Collaboration & Voting',
      passed: consensusReached && consensusScore >= 0.7 && duration < 5000,
      duration,
      evidence: {
        collaborationId: collabId,
        votesCount: consensusResponse.data.votes.length,
        consensusScore,
        decision: consensusResponse.data.consensus.decision
      },
      metrics: {
        consensusTime: duration,
        consensusScore,
        votesCount: consensusResponse.data.votes.length
      }
    };

  } catch (error: any) {
    console.error(`${colors.red}❌ Track 3 Failed:${colors.reset}`, error.message);
    return {
      track: 'Collaboration & Voting',
      passed: false,
      duration: Date.now() - startTime,
      evidence: { error: error.message },
      metrics: { consensusTime: -1, consensusScore: 0, votesCount: 0 }
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
    console.log(`\n   ${status} - ${result.track} (${result.duration}ms)`);
    console.log(`      Evidence: ${JSON.stringify(result.evidence, null, 2).split('\n').map(l => `      ${l}`).join('\n')}`);
    console.log(`      Metrics: ${JSON.stringify(result.metrics, null, 2).split('\n').map(l => `      ${l}`).join('\n')}`);
  });

  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  
  if (passedTests === totalTests) {
    console.log(`${colors.green}🎉 ALL TESTS PASSED - Phase 7 Ready for Production!${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️  ${passedTests}/${totalTests} tests passed - Review failures and optimize${colors.reset}\n`);
  }
}

// ============================================================================
// Main Execution - Parallel Track Execution (MB.MD V2)
// ============================================================================
async function runIntegrationTests() {
  console.log(`\n${colors.blue}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  Phase 7 Integration Tests - MB.MD V2 Methodology        ║${colors.reset}`);
  console.log(`${colors.blue}║  Parallel Execution: 3 Tracks                             ║${colors.reset}`);
  console.log(`${colors.blue}╚═══════════════════════════════════════════════════════════╝${colors.reset}\n`);

  const startTime = Date.now();

  // Execute all tracks in parallel for maximum efficiency
  const [result1, result2, result3] = await Promise.all([
    track1_esaRegistryAndAutoFix(),
    track2_mlConfidenceAndLearning(),
    track3_collaborationAndVoting()
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
