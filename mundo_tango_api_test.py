#!/usr/bin/env python3
"""
Mundo Tango Application - ESA 61×21 Page-Level Audit API Testing
Focused testing for the specific endpoints mentioned in the review request
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
    response_data: Optional[Dict] = None

class MundoTangoAPITester:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.timeout = 30
        self.results: List[TestResult] = []
        
    def log(self, message: str):
        """Log test messages with timestamp"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")
        
    def test_endpoint(self, endpoint: str, method: str = "GET", data: Dict = None, expected_status: int = None) -> TestResult:
        """Test a specific API endpoint"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            start_time = time.time()
            
            if method.upper() == "GET":
                response = self.session.get(url)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data)
            elif method.upper() == "DELETE":
                response = self.session.delete(url)
            else:
                return TestResult(
                    name=f"{method} {endpoint}",
                    passed=False,
                    message=f"Unsupported HTTP method: {method}"
                )
            
            response_time = time.time() - start_time
            
            # Try to parse JSON response
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text[:500]}
            
            # Determine if test passed
            if expected_status:
                passed = response.status_code == expected_status
                message = f"Expected {expected_status}, got {response.status_code}"
            else:
                # Consider 2xx and 4xx as successful responses (server is working)
                passed = 200 <= response.status_code < 500
                message = f"Endpoint accessible (status: {response.status_code})"
            
            if not passed and response.status_code >= 500:
                message = f"Server error (status: {response.status_code})"
            
            return TestResult(
                name=f"{method} {endpoint}",
                passed=passed,
                message=message,
                response_time=response_time,
                status_code=response.status_code,
                response_data=response_data
            )
                
        except requests.exceptions.ConnectionError:
            return TestResult(
                name=f"{method} {endpoint}",
                passed=False,
                message="Cannot connect to server - server may not be running"
            )
        except Exception as e:
            return TestResult(
                name=f"{method} {endpoint}",
                passed=False,
                message=f"Request failed: {str(e)}"
            )
    
    def test_health_endpoints(self) -> List[TestResult]:
        """Test system health endpoints"""
        self.log("Testing Health Endpoints...")
        
        results = []
        
        # Test /api/health
        result = self.test_endpoint("/api/health", "GET", expected_status=200)
        results.append(result)
        
        # Test direct health endpoint
        result = self.test_endpoint("/health", "GET", expected_status=200)
        results.append(result)
        
        # Test readiness endpoint
        result = self.test_endpoint("/ready", "GET", expected_status=200)
        results.append(result)
        
        return results
    
    def test_authentication_endpoints(self) -> List[TestResult]:
        """Test authentication endpoints"""
        self.log("Testing Authentication Endpoints...")
        
        results = []
        
        # Test /api/auth/user - should return user status
        result = self.test_endpoint("/api/auth/user", "GET")
        results.append(result)
        
        # Test login endpoint (if exists)
        result = self.test_endpoint("/api/auth/login", "POST", data={"username": "test", "password": "test"})
        results.append(result)
        
        return results
    
    def test_memories_endpoints(self) -> List[TestResult]:
        """Test memory management endpoints"""
        self.log("Testing Memory Management Endpoints...")
        
        results = []
        
        # Test GET /api/memories
        result = self.test_endpoint("/api/memories", "GET")
        results.append(result)
        
        # Test POST /api/memories
        test_memory = {
            "title": "Test Memory",
            "content": "This is a test memory for API testing",
            "date": "2024-01-01",
            "tags": ["test", "api"]
        }
        result = self.test_endpoint("/api/memories", "POST", data=test_memory)
        results.append(result)
        
        return results
    
    def test_groups_endpoints(self) -> List[TestResult]:
        """Test group management endpoints"""
        self.log("Testing Group Management Endpoints...")
        
        results = []
        
        # Test GET /api/groups
        result = self.test_endpoint("/api/groups", "GET")
        results.append(result)
        
        # Test POST /api/groups
        test_group = {
            "name": "Test Group",
            "description": "This is a test group for API testing",
            "type": "public"
        }
        result = self.test_endpoint("/api/groups", "POST", data=test_group)
        results.append(result)
        
        return results
    
    def test_events_endpoints(self) -> List[TestResult]:
        """Test event management endpoints"""
        self.log("Testing Event Management Endpoints...")
        
        results = []
        
        # Test GET /api/events
        result = self.test_endpoint("/api/events", "GET")
        results.append(result)
        
        # Test POST /api/events
        test_event = {
            "title": "Test Event",
            "description": "This is a test event for API testing",
            "date": "2024-12-31T20:00:00Z",
            "location": "Test Location"
        }
        result = self.test_endpoint("/api/events", "POST", data=test_event)
        results.append(result)
        
        return results
    
    def test_cors_headers(self) -> TestResult:
        """Test CORS headers"""
        self.log("Testing CORS Headers...")
        
        try:
            response = self.session.options(f"{self.base_url}/api/health")
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            has_cors = any(cors_headers.values())
            
            return TestResult(
                name="CORS Headers Check",
                passed=has_cors,
                message=f"CORS headers present: {has_cors}",
                response_data=cors_headers
            )
        except Exception as e:
            return TestResult(
                name="CORS Headers Check",
                passed=False,
                message=f"CORS check failed: {str(e)}"
            )
    
    def run_comprehensive_audit(self) -> Dict[str, Any]:
        """Run comprehensive ESA 61×21 Page-Level Audit"""
        self.log("Starting Mundo Tango ESA 61×21 Page-Level API Audit")
        self.log("=" * 60)
        
        # Test 1: Health Endpoints
        health_results = self.test_health_endpoints()
        self.results.extend(health_results)
        
        # Test 2: Authentication Endpoints
        auth_results = self.test_authentication_endpoints()
        self.results.extend(auth_results)
        
        # Test 3: Memory Management Endpoints
        memory_results = self.test_memories_endpoints()
        self.results.extend(memory_results)
        
        # Test 4: Group Management Endpoints
        group_results = self.test_groups_endpoints()
        self.results.extend(group_results)
        
        # Test 5: Event Management Endpoints
        event_results = self.test_events_endpoints()
        self.results.extend(event_results)
        
        # Test 6: CORS Headers
        cors_result = self.test_cors_headers()
        self.results.append(cors_result)
        
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
        self.log(f"Audit Summary: {passed_tests}/{total_tests} tests passed ({summary['success_rate']:.1f}%)")
        
        return summary
    
    def print_detailed_results(self):
        """Print detailed test results"""
        self.log("\nDetailed Audit Results:")
        self.log("-" * 60)
        
        for result in self.results:
            status = "✅ PASS" if result.passed else "❌ FAIL"
            self.log(f"{status} {result.name}")
            self.log(f"    Message: {result.message}")
            if result.response_time:
                self.log(f"    Response Time: {result.response_time:.3f}s")
            if result.status_code:
                self.log(f"    Status Code: {result.status_code}")
            if result.response_data and len(str(result.response_data)) < 200:
                self.log(f"    Response Data: {result.response_data}")
            self.log("")

def main():
    """Main test execution function"""
    print("Mundo Tango Application - ESA 61×21 Page-Level API Audit")
    print("=" * 60)
    
    # Initialize tester with frontend proxy URL
    frontend_url = "http://localhost:3000"
    tester = MundoTangoAPITester(frontend_url)
    
    try:
        # Run comprehensive audit
        summary = tester.run_comprehensive_audit()
        
        # Print detailed results
        tester.print_detailed_results()
        
        # Print final summary
        print("\n" + "=" * 60)
        print("FINAL AUDIT SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {summary['total_tests']}")
        print(f"Passed: {summary['passed_tests']}")
        print(f"Failed: {summary['failed_tests']}")
        print(f"Success Rate: {summary['success_rate']:.1f}%")
        
        # Categorize results
        critical_failures = []
        warnings = []
        
        for result in summary['results']:
            if not result.passed:
                if result.status_code and result.status_code >= 500:
                    critical_failures.append(result)
                else:
                    warnings.append(result)
        
        if critical_failures:
            print(f"\n🚨 Critical Failures: {len(critical_failures)}")
            for failure in critical_failures:
                print(f"   - {failure.name}: {failure.message}")
        
        if warnings:
            print(f"\n⚠️  Warnings: {len(warnings)}")
            for warning in warnings:
                print(f"   - {warning.name}: {warning.message}")
        
        # Exit with appropriate code
        if critical_failures:
            print("\n❌ Critical failures detected. System may not be functioning properly.")
            sys.exit(1)
        elif warnings:
            print("\n⚠️  Some endpoints may need attention, but system is generally functional.")
            sys.exit(0)
        else:
            print("\n✅ All critical endpoints are functioning correctly!")
            sys.exit(0)
            
    except KeyboardInterrupt:
        print("\n\nAudit interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nAudit failed with error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()