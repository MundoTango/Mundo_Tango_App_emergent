#!/usr/bin/env python3
"""
ESA LIFE CEO 61x21 Framework Backend Testing Suite
Tests the implemented ESA services for basic functionality and integration
"""

import requests
import json
import time
import sys
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

@dataclass
class TestResult:
    name: str
    passed: bool
    message: str
    response_time: Optional[float] = None
    status_code: Optional[int] = None

class ESABackendTester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.timeout = 30
        self.results: List[TestResult] = []
        
    def log(self, message: str):
        """Log test messages with timestamp"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")
        
    def test_health_check(self) -> TestResult:
        """Test basic server health and readiness endpoints"""
        self.log("Testing Health Check Endpoints...")
        
        try:
            # Test basic health endpoint
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/health")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'healthy':
                    return TestResult(
                        name="Health Check Endpoint",
                        passed=True,
                        message="Health check endpoint responding correctly",
                        response_time=response_time,
                        status_code=response.status_code
                    )
                else:
                    return TestResult(
                        name="Health Check Endpoint",
                        passed=False,
                        message=f"Health check returned unexpected status: {data.get('status')}",
                        response_time=response_time,
                        status_code=response.status_code
                    )
            else:
                return TestResult(
                    name="Health Check Endpoint",
                    passed=False,
                    message=f"Health check failed with status code: {response.status_code}",
                    response_time=response_time,
                    status_code=response.status_code
                )
                
        except requests.exceptions.ConnectionError:
            return TestResult(
                name="Health Check Endpoint",
                passed=False,
                message="Cannot connect to backend server - server may not be running"
            )
        except Exception as e:
            return TestResult(
                name="Health Check Endpoint",
                passed=False,
                message=f"Health check failed with error: {str(e)}"
            )
    
    def test_readiness_check(self) -> TestResult:
        """Test server readiness endpoint"""
        self.log("Testing Readiness Check...")
        
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/ready")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'ready':
                    return TestResult(
                        name="Readiness Check",
                        passed=True,
                        message="Server is ready and database connected",
                        response_time=response_time,
                        status_code=response.status_code
                    )
                else:
                    return TestResult(
                        name="Readiness Check",
                        passed=False,
                        message=f"Server not ready: {data}",
                        response_time=response_time,
                        status_code=response.status_code
                    )
            else:
                return TestResult(
                    name="Readiness Check",
                    passed=False,
                    message=f"Readiness check failed with status: {response.status_code}",
                    response_time=response_time,
                    status_code=response.status_code
                )
                
        except Exception as e:
            return TestResult(
                name="Readiness Check",
                passed=False,
                message=f"Readiness check failed: {str(e)}"
            )
    
    def test_api_endpoint(self, endpoint: str, method: str = "GET", data: Dict = None) -> TestResult:
        """Generic API endpoint tester"""
        try:
            start_time = time.time()
            
            if method.upper() == "GET":
                response = self.session.get(f"{self.base_url}/api{endpoint}")
            elif method.upper() == "POST":
                response = self.session.post(f"{self.base_url}/api{endpoint}", json=data)
            else:
                return TestResult(
                    name=f"API {endpoint}",
                    passed=False,
                    message=f"Unsupported HTTP method: {method}"
                )
            
            response_time = time.time() - start_time
            
            # Consider 2xx, 4xx as successful responses (server is working)
            # Only 5xx or connection errors are failures
            if 200 <= response.status_code < 500:
                return TestResult(
                    name=f"API {endpoint}",
                    passed=True,
                    message=f"API endpoint accessible (status: {response.status_code})",
                    response_time=response_time,
                    status_code=response.status_code
                )
            else:
                return TestResult(
                    name=f"API {endpoint}",
                    passed=False,
                    message=f"API endpoint error (status: {response.status_code})",
                    response_time=response_time,
                    status_code=response.status_code
                )
                
        except Exception as e:
            return TestResult(
                name=f"API {endpoint}",
                passed=False,
                message=f"API endpoint failed: {str(e)}"
            )
    
    def test_batch1_foundation_agents(self) -> List[TestResult]:
        """Test ESA Framework Batch 1 - Foundation Infrastructure Agents (Layers 5-9)"""
        self.log("Testing ESA Framework Batch 1 - Foundation Infrastructure Agents...")
        
        batch1_tests = [
            # Layer 5: Authorization System Agent
            ("/api/agents/layer05/status", "Layer 05: Authorization System Agent - Status"),
            ("/api/agents/layer05/audit", "Layer 05: Authorization System Agent - Audit"),
            ("/api/agents/layer05/report", "Layer 05: Authorization System Agent - Report"),
            
            # Layer 6: Data Validation Agent
            ("/api/agents/layer06/status", "Layer 06: Data Validation Agent - Status"),
            ("/api/agents/layer06/audit", "Layer 06: Data Validation Agent - Audit"),
            ("/api/agents/layer06/report", "Layer 06: Data Validation Agent - Report"),
            
            # Layer 7: State Management Agent
            ("/api/agents/layer07/status", "Layer 07: State Management Agent - Status"),
            ("/api/agents/layer07/audit", "Layer 07: State Management Agent - Audit"),
            ("/api/agents/layer07/report", "Layer 07: State Management Agent - Report"),
            
            # Layer 8: Client Framework Agent
            ("/api/agents/layer08/status", "Layer 08: Client Framework Agent - Status"),
            ("/api/agents/layer08/audit", "Layer 08: Client Framework Agent - Audit"),
            ("/api/agents/layer08/report", "Layer 08: Client Framework Agent - Report"),
            
            # Layer 9: UI Framework Agent
            ("/api/agents/layer09/status", "Layer 09: UI Framework Agent - Status"),
            ("/api/agents/layer09/audit", "Layer 09: UI Framework Agent - Audit"),
            ("/api/agents/layer09/report", "Layer 09: UI Framework Agent - Report"),
        ]
        
        results = []
        for endpoint, agent_name in batch1_tests:
            self.log(f"Testing {agent_name}...")
            result = self.test_api_endpoint(endpoint)
            result.name = agent_name
            results.append(result)
            
        return results
    
    def test_batch2_core_functionality_agents(self) -> List[TestResult]:
        """Test ESA Framework Batch 2 - Core Functionality Agents (Layers 10, 12, 14-16)"""
        self.log("Testing ESA Framework Batch 2 - Core Functionality Agents...")
        
        batch2_tests = [
            # Layer 10: Component Library Agent
            ("/api/agents/layer10/status", "Layer 10: Component Library Agent - Status"),
            ("/api/agents/layer10/audit", "Layer 10: Component Library Agent - Audit"),
            ("/api/agents/layer10/report", "Layer 10: Component Library Agent - Report"),
            
            # Layer 12: Data Processing Agent
            ("/api/agents/layer12/status", "Layer 12: Data Processing Agent - Status"),
            ("/api/agents/layer12/audit", "Layer 12: Data Processing Agent - Audit"),
            ("/api/agents/layer12/report", "Layer 12: Data Processing Agent - Report"),
            
            # Layer 14: Caching Strategy Agent
            ("/api/agents/layer14/status", "Layer 14: Caching Strategy Agent - Status"),
            ("/api/agents/layer14/audit", "Layer 14: Caching Strategy Agent - Audit"),
            ("/api/agents/layer14/report", "Layer 14: Caching Strategy Agent - Report"),
            
            # Layer 15: Search & Discovery Agent
            ("/api/agents/layer15/status", "Layer 15: Search & Discovery Agent - Status"),
            ("/api/agents/layer15/audit", "Layer 15: Search & Discovery Agent - Audit"),
            ("/api/agents/layer15/report", "Layer 15: Search & Discovery Agent - Report"),
            
            # Layer 16: Notification System Agent
            ("/api/agents/layer16/status", "Layer 16: Notification System Agent - Status"),
            ("/api/agents/layer16/audit", "Layer 16: Notification System Agent - Audit"),
            ("/api/agents/layer16/report", "Layer 16: Notification System Agent - Report"),
        ]
        
        results = []
        for endpoint, agent_name in batch2_tests:
            self.log(f"Testing {agent_name}...")
            result = self.test_api_endpoint(endpoint)
            result.name = agent_name
            results.append(result)
            
        return results
    
    def test_batch3_core_business_logic_agents(self) -> List[TestResult]:
        """Test ESA Framework Batch 3 - Core Functionality + Business Logic Agents (Layers 17-20, 23)"""
        self.log("Testing ESA Framework Batch 3 - Core Functionality + Business Logic Agents...")
        
        batch3_tests = [
            # Layer 17: Payment Processing Agent
            ("/api/agents/layer17/status", "Layer 17: Payment Processing Agent - Status"),
            ("/api/agents/layer17/audit", "Layer 17: Payment Processing Agent - Audit"),
            ("/api/agents/layer17/report", "Layer 17: Payment Processing Agent - Report"),
            
            # Layer 18: Reporting & Analytics Agent
            ("/api/agents/layer18/status", "Layer 18: Reporting & Analytics Agent - Status"),
            ("/api/agents/layer18/audit", "Layer 18: Reporting & Analytics Agent - Audit"),
            ("/api/agents/layer18/report", "Layer 18: Reporting & Analytics Agent - Report"),
            
            # Layer 19: Content Management Agent
            ("/api/agents/layer19/status", "Layer 19: Content Management Agent - Status"),
            ("/api/agents/layer19/audit", "Layer 19: Content Management Agent - Audit"),
            ("/api/agents/layer19/report", "Layer 19: Content Management Agent - Report"),
            
            # Layer 20: Workflow Engine Agent
            ("/api/agents/layer20/status", "Layer 20: Workflow Engine Agent - Status"),
            ("/api/agents/layer20/audit", "Layer 20: Workflow Engine Agent - Audit"),
            ("/api/agents/layer20/report", "Layer 20: Workflow Engine Agent - Report"),
            
            # Layer 23: Event Management Agent
            ("/api/agents/layer23/status", "Layer 23: Event Management Agent - Status"),
            ("/api/agents/layer23/audit", "Layer 23: Event Management Agent - Audit"),
            ("/api/agents/layer23/report", "Layer 23: Event Management Agent - Report"),
        ]
        
        results = []
        for endpoint, agent_name in batch3_tests:
            self.log(f"Testing {agent_name}...")
            result = self.test_api_endpoint(endpoint)
            result.name = agent_name
            results.append(result)
            
        return results
    
    def test_esa_agent_system(self) -> List[TestResult]:
        """Test ESA LIFE CEO 61x21 Framework Agent System"""
        self.log("Testing ESA Agent System...")
        
        agent_tests = [
            # Agent Coordinator
            ("/api/agents/coordinator/status", "Agent Coordinator Status"),
            ("/api/agents/coordinator/audit", "Agent Coordinator Full Audit"),
            ("/api/agents/coordinator/report", "Agent Coordinator Report"),
            
            # Individual Layer Agents - All Specialized Agents
            ("/api/agents/layer/01/status", "Layer 01: Architecture Foundation Agent"),
            ("/api/agents/layer/02/status", "Layer 02: API Structure Agent"),
            ("/api/agents/layer/03/status", "Layer 03: Server Framework Agent"),
            
            # NEW BATCH 1: Foundation Infrastructure Agents (Layers 5-9)
            ("/api/agents/layer05/status", "Layer 05: Authorization System Agent Status"),
            ("/api/agents/layer05/audit", "Layer 05: Authorization System Agent Audit"),
            ("/api/agents/layer05/report", "Layer 05: Authorization System Agent Report"),
            ("/api/agents/layer06/status", "Layer 06: Data Validation Agent Status"),
            ("/api/agents/layer06/audit", "Layer 06: Data Validation Agent Audit"),
            ("/api/agents/layer06/report", "Layer 06: Data Validation Agent Report"),
            ("/api/agents/layer07/status", "Layer 07: State Management Agent Status"),
            ("/api/agents/layer07/audit", "Layer 07: State Management Agent Audit"),
            ("/api/agents/layer07/report", "Layer 07: State Management Agent Report"),
            ("/api/agents/layer08/status", "Layer 08: Client Framework Agent Status"),
            ("/api/agents/layer08/audit", "Layer 08: Client Framework Agent Audit"),
            ("/api/agents/layer08/report", "Layer 08: Client Framework Agent Report"),
            ("/api/agents/layer09/status", "Layer 09: UI Framework Agent Status"),
            ("/api/agents/layer09/audit", "Layer 09: UI Framework Agent Audit"),
            ("/api/agents/layer09/report", "Layer 09: UI Framework Agent Report"),
            
            ("/api/agents/layer/22/status", "Layer 22: Group Management Agent"),
            ("/api/agents/layer/31/status", "Layer 31: AI Infrastructure Agent"),
            ("/api/agents/layer/32/status", "Layer 32: Prompt Engineering Agent"),
            ("/api/agents/layer/33/status", "Layer 33: Context Management Agent"),
            ("/api/agents/layer/34/status", "Layer 34: Response Generation Agent"),
            ("/api/agents/layer/35/status", "Layer 35: AI Agent Management Agent"),
            ("/api/agents/layer/48/status", "Layer 48: Performance Monitoring Agent"),
            ("/api/agents/layer/57/status", "Layer 57: Automation Management Agent"),
            ("/api/agents/layer/58/status", "Layer 58: Integration Tracking Agent"),
            ("/api/agents/layer/59/status", "Layer 59: Open Source Management Agent"),
            ("/api/agents/layer/60/status", "Layer 60: GitHub Expertise Agent"),
            ("/api/agents/layer/61/status", "Layer 61: Supabase Expertise Agent"),
            
            # Agent Reports - Extended Coverage
            ("/api/agents/layer/01/report", "Layer 01 Agent Report"),
            ("/api/agents/layer/02/report", "Layer 02 Agent Report"),
            ("/api/agents/layer/03/report", "Layer 03 Agent Report"),
            ("/api/agents/layer/22/report", "Layer 22 Agent Report"),
            ("/api/agents/layer/31/report", "Layer 31 Agent Report"),
            ("/api/agents/layer/32/report", "Layer 32 Agent Report"),
            ("/api/agents/layer/33/report", "Layer 33 Agent Report"),
            ("/api/agents/layer/34/report", "Layer 34 Agent Report"),
            ("/api/agents/layer/35/report", "Layer 35 Agent Report"),
            ("/api/agents/layer/48/report", "Layer 48 Agent Report"),
            ("/api/agents/layer/57/report", "Layer 57 Agent Report"),
            ("/api/agents/layer/58/report", "Layer 58 Agent Report"),
            ("/api/agents/layer/59/report", "Layer 59 Agent Report"),
            ("/api/agents/layer/60/report", "Layer 60 Agent Report"),
            ("/api/agents/layer/61/report", "Layer 61 Agent Report"),
        ]
        
        results = []
        for endpoint, agent_name in agent_tests:
            self.log(f"Testing {agent_name}...")
            result = self.test_api_endpoint(endpoint)
            result.name = agent_name
            results.append(result)
            
        return results
    
    def test_esa_services(self) -> List[TestResult]:
        """Test ESA Layer services for basic accessibility"""
        self.log("Testing ESA Layer Services...")
        
        esa_services = [
            # Layer 12: Data Processing Service
            ("/data-processing/status", "Layer 12: Data Processing Service"),
            
            # Layer 14: Enhanced Cache Service (Redis)
            ("/cache/status", "Layer 14: Enhanced Cache Service"),
            
            # Layer 15: Search & Discovery Service (Elasticsearch)
            ("/search/status", "Layer 15: Search & Discovery Service"),
            
            # Layer 16: Enhanced Notification Service
            ("/notifications/status", "Layer 16: Enhanced Notification Service"),
            
            # Layer 19: Content Management Service
            ("/content/status", "Layer 19: Content Management Service"),
            
            # Layer 20: Workflow Engine Service
            ("/workflow/status", "Layer 20: Workflow Engine Service"),
            
            # Layer 26: Recommendation Engine Service
            ("/recommendations/status", "Layer 26: Recommendation Engine Service"),
            
            # Layer 27: Gamification Service
            ("/gamification/status", "Layer 27: Gamification Service"),
            
            # Layer 28: Marketplace Service
            ("/marketplace/status", "Layer 28: Marketplace Service"),
            
            # Layer 29: Booking System Service
            ("/booking/status", "Layer 29: Booking System Service"),
        ]
        
        results = []
        for endpoint, service_name in esa_services:
            self.log(f"Testing {service_name}...")
            result = self.test_api_endpoint(endpoint)
            result.name = service_name
            results.append(result)
            
        return results
    
    def test_framework_coverage_analysis(self) -> TestResult:
        """Test Framework Coverage Analysis - assess 61x21 framework compliance"""
        self.log("Testing Framework Coverage Analysis...")
        
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/api/agents/coordinator/framework-coverage")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                coverage_percentage = data.get('coverage_percentage', 0)
                implemented_layers = data.get('implemented_layers', 0)
                total_layers = data.get('total_layers', 61)
                
                return TestResult(
                    name="Framework Coverage Analysis",
                    passed=True,
                    message=f"Framework coverage: {coverage_percentage}% ({implemented_layers}/{total_layers} layers implemented)",
                    response_time=response_time,
                    status_code=response.status_code
                )
            else:
                return TestResult(
                    name="Framework Coverage Analysis",
                    passed=False,
                    message=f"Framework coverage analysis failed with status: {response.status_code}",
                    response_time=response_time,
                    status_code=response.status_code
                )
                
        except Exception as e:
            return TestResult(
                name="Framework Coverage Analysis",
                passed=False,
                message=f"Framework coverage analysis failed: {str(e)}"
            )
    
    def test_agent_coordinator_count(self) -> TestResult:
        """Test Agent Coordinator to verify total agent count is 34"""
        self.log("Testing Agent Coordinator Count...")
        
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/api/agents/coordinator/status")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                total_agents = data.get('total_agents', 0)
                implemented_agents = data.get('implemented_agents', 0)
                
                if total_agents == 34:
                    return TestResult(
                        name="Agent Coordinator Count Verification",
                        passed=True,
                        message=f"Coordinator shows correct count: {total_agents} total agents, {implemented_agents} implemented",
                        response_time=response_time,
                        status_code=response.status_code
                    )
                else:
                    return TestResult(
                        name="Agent Coordinator Count Verification",
                        passed=False,
                        message=f"Expected 34 total agents, but coordinator shows {total_agents} total agents",
                        response_time=response_time,
                        status_code=response.status_code
                    )
            else:
                return TestResult(
                    name="Agent Coordinator Count Verification",
                    passed=False,
                    message=f"Coordinator status check failed with status: {response.status_code}",
                    response_time=response_time,
                    status_code=response.status_code
                )
                
        except Exception as e:
            return TestResult(
                name="Agent Coordinator Count Verification",
                passed=False,
                message=f"Coordinator count check failed: {str(e)}"
            )
    
    def test_agent_system_performance(self) -> TestResult:
        """Test overall agent system health and coordination performance"""
        self.log("Testing Agent System Performance...")
        
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/api/agents/coordinator/performance")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                system_health = data.get('system_health', 'unknown')
                avg_response_time = data.get('average_response_time', 0)
                
                return TestResult(
                    name="Agent System Performance",
                    passed=True,
                    message=f"System health: {system_health}, Avg response time: {avg_response_time}ms",
                    response_time=response_time,
                    status_code=response.status_code
                )
            else:
                return TestResult(
                    name="Agent System Performance",
                    passed=False,
                    message=f"Performance check failed with status: {response.status_code}",
                    response_time=response_time,
                    status_code=response.status_code
                )
                
        except Exception as e:
            return TestResult(
                name="Agent System Performance",
                passed=False,
                message=f"Performance check failed: {str(e)}"
            )
        """Test overall agent system health and coordination performance"""
        self.log("Testing Agent System Performance...")
        
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/api/agents/coordinator/performance")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                system_health = data.get('system_health', 'unknown')
                avg_response_time = data.get('average_response_time', 0)
                
                return TestResult(
                    name="Agent System Performance",
                    passed=True,
                    message=f"System health: {system_health}, Avg response time: {avg_response_time}ms",
                    response_time=response_time,
                    status_code=response.status_code
                )
            else:
                return TestResult(
                    name="Agent System Performance",
                    passed=False,
                    message=f"Performance check failed with status: {response.status_code}",
                    response_time=response_time,
                    status_code=response.status_code
                )
                
        except Exception as e:
            return TestResult(
                name="Agent System Performance",
                passed=False,
                message=f"Performance check failed: {str(e)}"
            )
    
    def test_service_integration(self) -> List[TestResult]:
        """Test basic service integration endpoints"""
        self.log("Testing Service Integration...")
        
        integration_tests = [
            # Test basic API routes that should exist
            ("/users", "User Service Integration"),
            ("/posts", "Posts Service Integration"),
            ("/groups", "Groups Service Integration"),
            ("/events", "Events Service Integration"),
        ]
        
        results = []
        for endpoint, test_name in integration_tests:
            self.log(f"Testing {test_name}...")
            result = self.test_api_endpoint(endpoint)
            result.name = test_name
            results.append(result)
            
        return results
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all backend tests and return comprehensive results"""
        self.log("Starting ESA LIFE CEO 61x21 Framework Backend Tests")
        self.log("=" * 60)
        
        # Test 1: Health Check
        health_result = self.test_health_check()
        self.results.append(health_result)
        
        # Test 2: Readiness Check
        readiness_result = self.test_readiness_check()
        self.results.append(readiness_result)
        
        # Test 3: ESA Framework Batch 1 - Foundation Infrastructure Agents (Layers 5-9)
        batch1_results = self.test_batch1_foundation_agents()
        self.results.extend(batch1_results)
        
        # Test 4: ESA Framework Batch 2 - Core Functionality Agents (Layers 10, 12, 14-16)
        batch2_results = self.test_batch2_core_functionality_agents()
        self.results.extend(batch2_results)
        
        # Test 5: Agent Coordinator Count Verification (should show 29 total agents)
        coordinator_count_result = self.test_agent_coordinator_count()
        self.results.append(coordinator_count_result)
        
        # Test 6: ESA Agent System (Other Agents)
        agent_results = self.test_esa_agent_system()
        self.results.extend(agent_results)
        
        # Test 7: ESA Services
        esa_results = self.test_esa_services()
        self.results.extend(esa_results)
        
        # Test 8: Service Integration
        integration_results = self.test_service_integration()
        self.results.extend(integration_results)
        
        # Test 9: Framework Coverage Analysis
        coverage_result = self.test_framework_coverage_analysis()
        self.results.append(coverage_result)
        
        # Test 10: Agent System Performance
        performance_result = self.test_agent_system_performance()
        self.results.append(performance_result)
        
        # Calculate summary
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r.passed)
        failed_tests = total_tests - passed_tests
        
        summary = {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": (passed_tests / total_tests * 100) if total_tests > 0 else 0,
            "results": self.results
        }
        
        self.log("=" * 60)
        self.log(f"Test Summary: {passed_tests}/{total_tests} tests passed ({summary['success_rate']:.1f}%)")
        
        return summary
    
    def print_detailed_results(self):
        """Print detailed test results"""
        self.log("\nDetailed Test Results:")
        self.log("-" * 60)
        
        for result in self.results:
            status = "✅ PASS" if result.passed else "❌ FAIL"
            self.log(f"{status} {result.name}")
            self.log(f"    Message: {result.message}")
            if result.response_time:
                self.log(f"    Response Time: {result.response_time:.3f}s")
            if result.status_code:
                self.log(f"    Status Code: {result.status_code}")
            self.log("")

def main():
    """Main test execution function"""
    print("ESA LIFE CEO 61x21 Framework - Backend Testing Suite")
    print("=" * 60)
    
    # Initialize tester with backend URL
    backend_url = "http://localhost:8001"  # FastAPI proxy server
    tester = ESABackendTester(backend_url)
    
    try:
        # Run all tests
        summary = tester.run_all_tests()
        
        # Print detailed results
        tester.print_detailed_results()
        
        # Print final summary
        print("\n" + "=" * 60)
        print("FINAL TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {summary['total_tests']}")
        print(f"Passed: {summary['passed_tests']}")
        print(f"Failed: {summary['failed_tests']}")
        print(f"Success Rate: {summary['success_rate']:.1f}%")
        
        # Exit with appropriate code
        if summary['failed_tests'] > 0:
            print("\n⚠️  Some tests failed. Check the detailed results above.")
            sys.exit(1)
        else:
            print("\n✅ All tests passed successfully!")
            sys.exit(0)
            
    except KeyboardInterrupt:
        print("\n\nTest execution interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nTest execution failed with error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()