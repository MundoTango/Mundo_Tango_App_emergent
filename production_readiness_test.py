#!/usr/bin/env python3
"""
Mundo Tango Memories - Production Readiness Validation Suite
Tests all production criteria for Task 3: Production Scaling
"""

import requests
import json
import time
import sys
import concurrent.futures
import threading
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import statistics

@dataclass
class PerformanceResult:
    endpoint: str
    response_time: float
    status_code: int
    success: bool
    error: Optional[str] = None

class ProductionReadinessTester:
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.timeout = 30
        self.results: List[PerformanceResult] = []
        
    def log(self, message: str):
        """Log test messages with timestamp"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")
        
    def test_endpoint_performance(self, endpoint: str, method: str = "GET", data: Dict = None, target_time: float = 100.0) -> PerformanceResult:
        """Test individual endpoint performance"""
        try:
            start_time = time.time()
            
            if method.upper() == "GET":
                response = self.session.get(f"{self.base_url}{endpoint}")
            elif method.upper() == "POST":
                response = self.session.post(f"{self.base_url}{endpoint}", json=data)
            else:
                return PerformanceResult(
                    endpoint=endpoint,
                    response_time=0,
                    status_code=0,
                    success=False,
                    error=f"Unsupported method: {method}"
                )
            
            response_time = (time.time() - start_time) * 1000  # Convert to milliseconds
            
            success = response.status_code < 400 and response_time <= target_time
            
            return PerformanceResult(
                endpoint=endpoint,
                response_time=response_time,
                status_code=response.status_code,
                success=success,
                error=None if success else f"Response time {response_time:.2f}ms exceeds target {target_time}ms"
            )
            
        except Exception as e:
            return PerformanceResult(
                endpoint=endpoint,
                response_time=0,
                status_code=0,
                success=False,
                error=str(e)
            )
    
    def test_core_endpoints_performance(self) -> Dict[str, Any]:
        """Test all 5 core endpoints for <100ms response time"""
        self.log("Testing Core Endpoints Performance (<100ms target)...")
        
        core_endpoints = [
            ("/api/health", "GET", None),
            ("/api/posts/feed", "GET", None),
            ("/api/posts", "POST", {"content": "Performance test memory", "isPublic": True}),
            ("/api/posts/1/like", "POST", None),
            ("/api/memories/enhance", "POST", {
                "content": "Performance test for AI enhancement",
                "options": {"enhanceContent": True, "generateTags": True}
            })
        ]
        
        results = []
        for endpoint, method, data in core_endpoints:
            self.log(f"Testing {method} {endpoint}...")
            result = self.test_endpoint_performance(endpoint, method, data, 100.0)
            results.append(result)
            
            status = "✅ PASS" if result.success else "❌ FAIL"
            self.log(f"  {status} {result.response_time:.2f}ms (Status: {result.status_code})")
            
        passed = sum(1 for r in results if r.success)
        total = len(results)
        
        return {
            "test_name": "Core Endpoints Performance",
            "passed": passed,
            "total": total,
            "success_rate": (passed / total * 100) if total > 0 else 0,
            "results": results,
            "target_met": passed == total
        }
    
    def test_concurrent_requests(self, num_concurrent: int = 10, num_requests: int = 50) -> Dict[str, Any]:
        """Test concurrent request handling"""
        self.log(f"Testing Concurrent Request Handling ({num_concurrent} concurrent, {num_requests} total)...")
        
        def make_request():
            try:
                start_time = time.time()
                response = self.session.get(f"{self.base_url}/api/posts/feed")
                response_time = (time.time() - start_time) * 1000
                return {
                    "response_time": response_time,
                    "status_code": response.status_code,
                    "success": response.status_code < 400
                }
            except Exception as e:
                return {
                    "response_time": 0,
                    "status_code": 0,
                    "success": False,
                    "error": str(e)
                }
        
        start_time = time.time()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=num_concurrent) as executor:
            futures = [executor.submit(make_request) for _ in range(num_requests)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        total_time = time.time() - start_time
        
        successful_requests = [r for r in results if r["success"]]
        failed_requests = [r for r in results if not r["success"]]
        
        if successful_requests:
            response_times = [r["response_time"] for r in successful_requests]
            avg_response_time = statistics.mean(response_times)
            median_response_time = statistics.median(response_times)
            max_response_time = max(response_times)
            min_response_time = min(response_times)
        else:
            avg_response_time = median_response_time = max_response_time = min_response_time = 0
        
        success_rate = (len(successful_requests) / num_requests * 100) if num_requests > 0 else 0
        requests_per_second = num_requests / total_time if total_time > 0 else 0
        
        self.log(f"  ✅ Completed {len(successful_requests)}/{num_requests} requests successfully")
        self.log(f"  📊 Success rate: {success_rate:.1f}%")
        self.log(f"  ⚡ Requests/second: {requests_per_second:.2f}")
        self.log(f"  📈 Avg response time: {avg_response_time:.2f}ms")
        
        return {
            "test_name": "Concurrent Request Handling",
            "total_requests": num_requests,
            "successful_requests": len(successful_requests),
            "failed_requests": len(failed_requests),
            "success_rate": success_rate,
            "requests_per_second": requests_per_second,
            "avg_response_time": avg_response_time,
            "median_response_time": median_response_time,
            "max_response_time": max_response_time,
            "min_response_time": min_response_time,
            "total_time": total_time,
            "target_met": success_rate >= 95.0 and avg_response_time <= 200.0
        }
    
    def test_memory_crud_operations(self) -> Dict[str, Any]:
        """Test complete memory CRUD operations end-to-end"""
        self.log("Testing Memory CRUD Operations End-to-End...")
        
        operations = []
        
        # CREATE - Create a new memory
        create_data = {
            "content": "End-to-end CRUD test memory with #testing #production hashtags",
            "isPublic": True
        }
        
        create_result = self.test_endpoint_performance("/api/posts", "POST", create_data, 200.0)
        operations.append(("CREATE", create_result))
        
        if create_result.success:
            self.log("  ✅ CREATE operation successful")
        else:
            self.log("  ❌ CREATE operation failed")
        
        # READ - Get memories feed
        read_result = self.test_endpoint_performance("/api/posts/feed", "GET", None, 100.0)
        operations.append(("READ", read_result))
        
        if read_result.success:
            self.log("  ✅ READ operation successful")
        else:
            self.log("  ❌ READ operation failed")
        
        # UPDATE - Like a memory (simulated update)
        update_result = self.test_endpoint_performance("/api/posts/1/like", "POST", None, 100.0)
        operations.append(("UPDATE", update_result))
        
        if update_result.success:
            self.log("  ✅ UPDATE operation successful")
        else:
            self.log("  ❌ UPDATE operation failed")
        
        successful_ops = sum(1 for _, result in operations if result.success)
        total_ops = len(operations)
        
        return {
            "test_name": "Memory CRUD Operations",
            "operations": operations,
            "successful_operations": successful_ops,
            "total_operations": total_ops,
            "success_rate": (successful_ops / total_ops * 100) if total_ops > 0 else 0,
            "target_met": successful_ops == total_ops
        }
    
    def test_ai_enhancement_pipeline(self) -> Dict[str, Any]:
        """Test AI enhancement pipeline functionality"""
        self.log("Testing AI Enhancement Pipeline...")
        
        test_cases = [
            {
                "content": "I had an amazing tango experience tonight",
                "options": {"enhanceContent": True, "generateTags": True, "analyzeSentiment": True}
            },
            {
                "content": "Struggling with my ocho technique today",
                "options": {"enhanceContent": True, "generateTags": True, "analyzeSentiment": True}
            },
            {
                "content": "Beautiful milonga at the club with great music",
                "options": {"enhanceContent": True, "generateTags": True, "analyzeSentiment": True, "optimizeEngagement": True}
            }
        ]
        
        results = []
        for i, test_case in enumerate(test_cases):
            self.log(f"  Testing AI enhancement case {i+1}...")
            result = self.test_endpoint_performance("/api/memories/enhance", "POST", test_case, 500.0)
            results.append(result)
            
            if result.success:
                self.log(f"    ✅ Case {i+1} successful ({result.response_time:.2f}ms)")
            else:
                self.log(f"    ❌ Case {i+1} failed: {result.error}")
        
        successful = sum(1 for r in results if r.success)
        total = len(results)
        avg_response_time = statistics.mean([r.response_time for r in results if r.success]) if successful > 0 else 0
        
        return {
            "test_name": "AI Enhancement Pipeline",
            "test_cases": total,
            "successful_cases": successful,
            "success_rate": (successful / total * 100) if total > 0 else 0,
            "avg_response_time": avg_response_time,
            "results": results,
            "target_met": successful == total and avg_response_time <= 500.0
        }
    
    def test_system_health_monitoring(self) -> Dict[str, Any]:
        """Test system health monitoring capabilities"""
        self.log("Testing System Health Monitoring...")
        
        health_result = self.test_endpoint_performance("/api/health", "GET", None, 50.0)
        
        health_data = None
        if health_result.success:
            try:
                response = self.session.get(f"{self.base_url}/api/health")
                health_data = response.json()
            except:
                health_data = None
        
        has_detailed_metrics = False
        if health_data:
            required_fields = ["status", "timestamp", "service", "version"]
            has_detailed_metrics = all(field in health_data for field in required_fields)
        
        self.log(f"  Health endpoint: {'✅ Available' if health_result.success else '❌ Unavailable'}")
        self.log(f"  Detailed metrics: {'✅ Present' if has_detailed_metrics else '❌ Missing'}")
        
        return {
            "test_name": "System Health Monitoring",
            "health_endpoint_available": health_result.success,
            "response_time": health_result.response_time,
            "has_detailed_metrics": has_detailed_metrics,
            "health_data": health_data,
            "target_met": health_result.success and has_detailed_metrics
        }
    
    def test_error_handling_recovery(self) -> Dict[str, Any]:
        """Test error handling and recovery"""
        self.log("Testing Error Handling and Recovery...")
        
        error_tests = [
            ("/api/nonexistent", "GET", None, "404 handling"),
            ("/api/posts", "POST", {"invalid": "data"}, "Invalid data handling"),
            ("/api/posts", "POST", {}, "Missing data handling"),
        ]
        
        results = []
        for endpoint, method, data, test_name in error_tests:
            self.log(f"  Testing {test_name}...")
            result = self.test_endpoint_performance(endpoint, method, data, 200.0)
            
            # For error handling tests, we expect 4xx responses, not 5xx
            graceful_error = 400 <= result.status_code < 500
            results.append({
                "test_name": test_name,
                "endpoint": endpoint,
                "status_code": result.status_code,
                "response_time": result.response_time,
                "graceful_error": graceful_error
            })
            
            if graceful_error:
                self.log(f"    ✅ Graceful error handling (Status: {result.status_code})")
            else:
                self.log(f"    ❌ Poor error handling (Status: {result.status_code})")
        
        graceful_errors = sum(1 for r in results if r["graceful_error"])
        total_tests = len(results)
        
        return {
            "test_name": "Error Handling and Recovery",
            "error_tests": results,
            "graceful_errors": graceful_errors,
            "total_tests": total_tests,
            "success_rate": (graceful_errors / total_tests * 100) if total_tests > 0 else 0,
            "target_met": graceful_errors == total_tests
        }
    
    def test_data_persistence(self) -> Dict[str, Any]:
        """Test data consistency and persistence"""
        self.log("Testing Data Consistency and Persistence...")
        
        # Create a memory
        test_memory = {
            "content": "Persistence test memory - should remain after creation",
            "isPublic": True
        }
        
        create_result = self.test_endpoint_performance("/api/posts", "POST", test_memory, 200.0)
        
        if not create_result.success:
            return {
                "test_name": "Data Persistence",
                "create_success": False,
                "target_met": False,
                "error": "Failed to create test memory"
            }
        
        # Wait a moment
        time.sleep(1)
        
        # Retrieve memories and check if our memory persists
        read_result = self.test_endpoint_performance("/api/posts/feed", "GET", None, 100.0)
        
        memory_found = False
        if read_result.success:
            try:
                response = self.session.get(f"{self.base_url}/api/posts/feed")
                data = response.json()
                memories = data.get("data", [])
                memory_found = any("Persistence test memory" in memory.get("content", "") for memory in memories)
            except:
                memory_found = False
        
        self.log(f"  Memory creation: {'✅ Success' if create_result.success else '❌ Failed'}")
        self.log(f"  Memory persistence: {'✅ Found' if memory_found else '❌ Not found'}")
        
        return {
            "test_name": "Data Persistence",
            "create_success": create_result.success,
            "read_success": read_result.success,
            "memory_persisted": memory_found,
            "target_met": create_result.success and read_result.success and memory_found
        }
    
    def run_production_readiness_tests(self) -> Dict[str, Any]:
        """Run all production readiness tests"""
        self.log("🚀 Starting Production Readiness Validation")
        self.log("=" * 80)
        
        test_results = {}
        
        # Test 1: Core Endpoints Performance
        test_results["core_endpoints"] = self.test_core_endpoints_performance()
        
        # Test 2: Concurrent Request Handling
        test_results["concurrent_requests"] = self.test_concurrent_requests()
        
        # Test 3: Memory CRUD Operations
        test_results["crud_operations"] = self.test_memory_crud_operations()
        
        # Test 4: AI Enhancement Pipeline
        test_results["ai_enhancement"] = self.test_ai_enhancement_pipeline()
        
        # Test 5: System Health Monitoring
        test_results["health_monitoring"] = self.test_system_health_monitoring()
        
        # Test 6: Error Handling and Recovery
        test_results["error_handling"] = self.test_error_handling_recovery()
        
        # Test 7: Data Persistence
        test_results["data_persistence"] = self.test_data_persistence()
        
        # Calculate overall results
        total_tests = len(test_results)
        passed_tests = sum(1 for test in test_results.values() if test.get("target_met", False))
        
        overall_success = passed_tests == total_tests
        
        summary = {
            "total_test_categories": total_tests,
            "passed_test_categories": passed_tests,
            "overall_success_rate": (passed_tests / total_tests * 100) if total_tests > 0 else 0,
            "production_ready": overall_success,
            "test_results": test_results
        }
        
        self.log("=" * 80)
        self.log(f"Production Readiness Summary: {passed_tests}/{total_tests} categories passed")
        self.log(f"Overall Success Rate: {summary['overall_success_rate']:.1f}%")
        self.log(f"Production Ready: {'✅ YES' if overall_success else '❌ NO'}")
        
        return summary

def main():
    """Main test execution function"""
    print("Mundo Tango Memories - Production Readiness Validation")
    print("=" * 80)
    
    # Test direct Node.js server (the actual implementation)
    tester = ProductionReadinessTester("http://localhost:5000")
    
    try:
        # Run all production readiness tests
        results = tester.run_production_readiness_tests()
        
        # Print detailed results
        print("\n" + "=" * 80)
        print("DETAILED RESULTS")
        print("=" * 80)
        
        for test_name, test_result in results["test_results"].items():
            status = "✅ PASS" if test_result.get("target_met", False) else "❌ FAIL"
            print(f"\n{status} {test_result.get('test_name', test_name)}")
            
            if "success_rate" in test_result:
                print(f"  Success Rate: {test_result['success_rate']:.1f}%")
            
            if "avg_response_time" in test_result:
                print(f"  Avg Response Time: {test_result['avg_response_time']:.2f}ms")
            
            if "requests_per_second" in test_result:
                print(f"  Requests/Second: {test_result['requests_per_second']:.2f}")
        
        # Print final assessment
        print("\n" + "=" * 80)
        print("PRODUCTION READINESS ASSESSMENT")
        print("=" * 80)
        
        if results["production_ready"]:
            print("🎉 SYSTEM IS PRODUCTION READY!")
            print("✅ All production criteria met")
            print("✅ Performance targets achieved")
            print("✅ System stability confirmed")
            sys.exit(0)
        else:
            print("⚠️  SYSTEM NOT FULLY PRODUCTION READY")
            print(f"📊 {results['passed_test_categories']}/{results['total_test_categories']} test categories passed")
            print("🔧 Review failed tests and optimize before production deployment")
            
            # List failed tests
            failed_tests = [name for name, result in results["test_results"].items() 
                          if not result.get("target_met", False)]
            if failed_tests:
                print("\n❌ Failed Test Categories:")
                for test in failed_tests:
                    print(f"  - {test}")
            
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n\nTest execution interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nTest execution failed with error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()