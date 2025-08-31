/**
 * Test script for the ESA LIFE CEO 61x21 Framework Agent System
 * This will generate comprehensive compliance reports for human reviewers
 */

async function testAgentSystem() {
  try {
    console.log('🤖 Testing ESA LIFE CEO 61x21 Framework Agent System...\n');

    // Import the Agent Coordinator
    const { agentCoordinator } = await import('./server/agents/agent-coordinator.js');
    
    console.log('📊 Running full platform audit...');
    
    // Run full audit
    const auditResults = await agentCoordinator.runFullAudit();
    
    console.log('\n=== AUDIT RESULTS SUMMARY ===');
    console.log(`Overall Compliance: ${auditResults.overallCompliance}%`);
    console.log(`Active Agents: ${auditResults.activeAgents}/61`);
    console.log(`Critical Issues: ${auditResults.criticalIssues.length}`);
    
    console.log('\n=== LAYER STATUS ===');
    Object.entries(auditResults.layerStatus).forEach(([layerId, status]) => {
      const statusIcon = status.status === 'healthy' ? '✅' : 
                        status.status === 'warning' ? '⚠️' : '❌';
      console.log(`Layer ${layerId}: ${statusIcon} ${status.name} (${status.compliance}%)`);
    });
    
    if (auditResults.criticalIssues.length > 0) {
      console.log('\n=== CRITICAL ISSUES ===');
      auditResults.criticalIssues.forEach(issue => {
        console.log(`⚠️ ${issue}`);
      });
    }
    
    console.log('\n📄 Generating human-readable report...');
    
    // Generate comprehensive report
    const report = await agentCoordinator.generateHumanReadableReport();
    
    // Save report to file
    const fs = await import('fs');
    const reportPath = '/app/ESA_COMPLIANCE_REPORT.md';
    fs.writeFileSync(reportPath, report);
    
    console.log(`✅ Comprehensive report saved to: ${reportPath}`);
    
    console.log('\n🎯 Testing individual layer agents...');
    
    // Test individual agents
    const registeredLayers = agentCoordinator.getRegisteredLayers();
    console.log(`Registered Layers: ${registeredLayers.join(', ')}`);
    
    // Test a few specific agents
    for (const layerId of registeredLayers.slice(0, 3)) {
      const agent = agentCoordinator.getLayerAgent(layerId);
      if (agent) {
        console.log(`\n--- Testing Layer ${layerId} Agent ---`);
        const status = agent.getStatus();
        console.log(`Compliance: ${status.compliance?.layerCompliance || 'N/A'}%`);
        
        if (status.compliance?.criticalIssues?.length > 0) {
          console.log('Critical Issues:');
          status.compliance.criticalIssues.forEach(issue => {
            console.log(`  - ${issue}`);
          });
        }
      }
    }
    
    console.log('\n🚀 Agent system test completed successfully!');
    console.log('Human reviewers can now examine the detailed compliance report.');
    
  } catch (error) {
    console.error('❌ Agent system test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testAgentSystem().then(() => {
  console.log('\n✨ Test execution finished.');
}).catch(error => {
  console.error('Test execution failed:', error);
});