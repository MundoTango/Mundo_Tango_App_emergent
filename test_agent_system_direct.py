#!/usr/bin/env python3
"""
Direct test of ESA LIFE CEO 61x21 Framework Agent System
Tests the agent system by importing it directly from the TypeScript files
"""

import subprocess
import json
import sys
import os

def run_node_test(test_script):
    """Run a Node.js test script and return the result"""
    try:
        result = subprocess.run(
            ['node', '--loader', 'tsx/esm', test_script],
            cwd='/app',
            capture_output=True,
            text=True,
            timeout=30
        )
        return {
            'success': result.returncode == 0,
            'stdout': result.stdout,
            'stderr': result.stderr,
            'returncode': result.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'stdout': '',
            'stderr': 'Test timed out after 30 seconds',
            'returncode': -1
        }
    except Exception as e:
        return {
            'success': False,
            'stdout': '',
            'stderr': str(e),
            'returncode': -1
        }

def create_agent_test_script():
    """Create a Node.js test script to test the agent system"""
    test_script = """
// ESA Agent System Direct Test
import { agentCoordinator } from './server/agents/agent-coordinator.js';

async function testAgentSystem() {
    console.log('=== ESA LIFE CEO 61x21 Framework Agent System Test ===');
    
    try {
        // Test 1: Get registered layers
        const registeredLayers = agentCoordinator.getRegisteredLayers();
        console.log(`✅ Registered Layers: ${registeredLayers.join(', ')}`);
        
        // Test 2: Get coordinator status
        const status = agentCoordinator.getStatus();
        console.log(`✅ Total Agents: ${status.totalAgents}`);
        console.log(`✅ Active Agents: ${status.activeAgents}`);
        console.log(`✅ Overall Compliance: ${status.overallCompliance}%`);
        
        // Test 3: Test individual layer agents
        for (const layerId of registeredLayers) {
            const agent = agentCoordinator.getLayerAgent(layerId);
            if (agent) {
                const agentStatus = agent.getStatus();
                console.log(`✅ Layer ${layerId} Agent: Available`);
            }
        }
        
        // Test 4: Run full audit (this might take a moment)
        console.log('🔍 Running full platform audit...');
        const auditResult = await agentCoordinator.runFullAudit();
        console.log(`✅ Audit Complete - Overall Compliance: ${auditResult.overallCompliance}%`);
        console.log(`✅ Critical Issues: ${auditResult.criticalIssues.length}`);
        
        // Test 5: Generate human readable report
        console.log('📊 Generating comprehensive report...');
        const report = await agentCoordinator.generateHumanReadableReport();
        console.log(`✅ Report Generated (${report.length} characters)`);
        
        console.log('\\n=== Test Results Summary ===');
        console.log(`Total Framework Layers: ${auditResult.totalAgents}`);
        console.log(`Implemented Agents: ${auditResult.activeAgents}`);
        console.log(`Overall Compliance: ${auditResult.overallCompliance}%`);
        console.log(`Critical Issues Found: ${auditResult.criticalIssues.length}`);
        
        if (auditResult.criticalIssues.length > 0) {
            console.log('\\n⚠️ Critical Issues:');
            auditResult.criticalIssues.forEach(issue => {
                console.log(`  - ${issue}`);
            });
        }
        
        console.log('\\n✅ ESA Agent System Test Completed Successfully');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Agent System Test Failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testAgentSystem();
"""
    
    with open('/app/test_agent_system.mjs', 'w') as f:
        f.write(test_script)
    
    return '/app/test_agent_system.mjs'

def main():
    print("ESA LIFE CEO 61x21 Framework - Direct Agent System Test")
    print("=" * 60)
    
    # Create the test script
    test_script_path = create_agent_test_script()
    print(f"Created test script: {test_script_path}")
    
    # Run the test
    print("Running agent system test...")
    result = run_node_test(test_script_path)
    
    print("\n" + "=" * 60)
    print("TEST RESULTS")
    print("=" * 60)
    
    if result['success']:
        print("✅ Agent System Test PASSED")
        print("\nOutput:")
        print(result['stdout'])
    else:
        print("❌ Agent System Test FAILED")
        print(f"Return Code: {result['returncode']}")
        if result['stdout']:
            print("\nStdout:")
            print(result['stdout'])
        if result['stderr']:
            print("\nStderr:")
            print(result['stderr'])
    
    # Cleanup
    try:
        os.remove(test_script_path)
    except:
        pass
    
    return 0 if result['success'] else 1

if __name__ == "__main__":
    sys.exit(main())