#!/usr/bin/env python3
"""
Mundo Tango Memories System Performance Testing Suite
Tests response times, memory data consistency, and ESA 61×21 compliance
"""

import requests
import json
import time
import sys
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import statistics

@dataclass
class PerformanceResult:
    endpoint: str
    method: str
    avg_response_time: float
    min_response_time: float
    max_response_time: float
    success_rate: float
    total_requests: int
    successful_requests: int
    failed_requests: int

class MundoTangoPerformanceTester:
    def __init__(self, backend_url: str = "http://localhost:8001", node_url: str = "http://localhost:5000"):
        self.backend_url = backend_url
        self.node_url = node_url
        self.session = requests.Session()
        self.session.timeout = 30
        self.results: List[PerformanceResult] = []
        
    def log(self, message: str):
        """Log test messages with timestamp"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")
        
    def test_endpoint_performance(self, endpoint: str, method: str = "GET", data: Dict = None, iterations: int = 10) -> PerformanceResult:
        """Test endpoint performance over multiple iterations"""
        self.log(f"Testing {method} {endpoint} performance ({iterations} iterations)...")
        
        response_times = []
        successful_requests = 0
        failed_requests = 0
        
        for i in range(iterations):
            try:
                start_time = time.time()
                
                if method.upper() == "GET":
                    response = self.session.get(f"{self.backend_url}{endpoint}")
                elif method.upper() == "POST":
                    response = self.session.post(f"{self.backend_url}{endpoint}", json=data)
                else:
                    continue
                
                response_time = time.time() - start_time
                response_times.append(response_time)
                
                if 200 <= response.status_code < 400:
                    successful_requests += 1
                else:
                    failed_requests += 1
                    
            except Exception as e:
                failed_requests += 1
                self.log(f"Request {i+1} failed: {str(e)}")
        
        if response_times:
            avg_time = statistics.mean(response_times)
            min_time = min(response_times)
            max_time = max(response_times)
        else:
            avg_time = min_time = max_time = 0
            
        success_rate = (successful_requests / iterations) * 100 if iterations > 0 else 0
        
        return PerformanceResult(
            endpoint=endpoint,
            method=method,
            avg_response_time=avg_time,
            min_response_time=min_time,
            max_response_time=max_time,
            success_rate=success_rate,
            total_requests=iterations,
            successful_requests=successful_requests,
            failed_requests=failed_requests
        )
    
    def test_memory_data_consistency(self) -> Dict[str, Any]:
        """Test memory data consistency across multiple requests"""
        self.log("Testing Memory Data Consistency...")
        
        consistency_results = {
            "test_name": "Memory Data Consistency",
            "passed": True,
            "issues": [],
            "details": {}
        }
        
        try:
            # Get initial memory count
            response1 = self.session.get(f"{self.backend_url}/api/posts/feed")
            if response1.status_code == 200:
                data1 = response1.json()
                initial_count = len(data1.get('data', []))
                consistency_results["details"]["initial_memory_count"] = initial_count
            else:
                consistency_results["passed"] = False
                consistency_results["issues"].append("Failed to get initial memory feed")
                return consistency_results
            
            # Create a new memory
            test_memory = {
                "content": f"Performance test memory - {time.time()}",
                "isPublic": True
            }
            
            create_response = self.session.post(f"{self.backend_url}/api/posts", json=test_memory)
            if create_response.status_code in [200, 201]:
                created_memory = create_response.json()
                memory_id = created_memory.get('data', {}).get('id')
                consistency_results["details"]["created_memory_id"] = memory_id
            else:
                consistency_results["passed"] = False
                consistency_results["issues"].append("Failed to create test memory")
                return consistency_results
            
            # Verify memory appears in feed
            response2 = self.session.get(f"{self.backend_url}/api/posts/feed")
            if response2.status_code == 200:
                data2 = response2.json()
                new_count = len(data2.get('data', []))
                consistency_results["details"]["final_memory_count"] = new_count
                
                if new_count != initial_count + 1:
                    consistency_results["passed"] = False
                    consistency_results["issues"].append(f"Memory count inconsistency: expected {initial_count + 1}, got {new_count}")
                
                # Check if our memory is in the feed
                memories = data2.get('data', [])
                found_memory = any(m.get('content') == test_memory['content'] for m in memories)
                if not found_memory:
                    consistency_results["passed"] = False
                    consistency_results["issues"].append("Created memory not found in feed")
                else:
                    consistency_results["details"]["memory_found_in_feed"] = True
            else:
                consistency_results["passed"] = False
                consistency_results["issues"].append("Failed to get updated memory feed")
            
            # Test memory like functionality
            if memory_id:
                like_response = self.session.post(f"{self.backend_url}/api/posts/{memory_id}/like")
                if like_response.status_code == 200:
                    like_data = like_response.json()
                    consistency_results["details"]["like_test"] = {
                        "success": True,
                        "new_like_count": like_data.get('data', {}).get('newLikeCount', 0)
                    }
                else:
                    consistency_results["issues"].append("Like functionality test failed")
                    
        except Exception as e:
            consistency_results["passed"] = False
            consistency_results["issues"].append(f"Consistency test error: {str(e)}")
        
        return consistency_results
    
    def test_ai_enhancement_performance(self) -> Dict[str, Any]:
        """Test AI enhancement endpoint performance and functionality"""
        self.log("Testing AI Enhancement Performance...")
        
        ai_test_cases = [
            {
                "content": "Amazing tango night at the milonga!",
                "options": {"enhanceContent": True, "generateTags": True, "analyzeSentiment": True}
            },
            {
                "content": "Struggling with my ocho technique today",
                "options": {"enhanceContent": True, "generateTags": True, "analyzeSentiment": True}
            },
            {
                "content": "Beautiful vals with my partner",
                "options": {"enhanceContent": False, "generateTags": True, "analyzeSentiment": True}
            }
        ]
        
        ai_results = {
            "test_name": "AI Enhancement Performance",
            "passed": True,
            "response_times": [],
            "enhancement_results": [],
            "issues": []
        }
        
        for i, test_case in enumerate(ai_test_cases):
            try:
                start_time = time.time()
                response = self.session.post(f"{self.backend_url}/api/memories/enhance", json=test_case)
                response_time = time.time() - start_time
                
                ai_results["response_times"].append(response_time)
                
                if response.status_code == 200:
                    data = response.json()
                    enhancement_data = data.get('data', {})
                    
                    result = {
                        "test_case": i + 1,
                        "original_content": test_case['content'],
                        "enhanced": enhancement_data.get('enhancedContent', ''),
                        "tags": enhancement_data.get('tags', []),
                        "sentiment": enhancement_data.get('sentiment', 'unknown'),
                        "response_time": response_time
                    }
                    ai_results["enhancement_results"].append(result)
                    
                    # Validate enhancement worked
                    if test_case['options'].get('enhanceContent') and enhancement_data.get('enhancedContent') == test_case['content']:
                        ai_results["issues"].append(f"Test case {i+1}: Content not enhanced when requested")
                    
                    if test_case['options'].get('generateTags') and not enhancement_data.get('tags'):
                        ai_results["issues"].append(f"Test case {i+1}: No tags generated when requested")
                        
                else:
                    ai_results["passed"] = False
                    ai_results["issues"].append(f"Test case {i+1}: AI enhancement failed with status {response.status_code}")
                    
            except Exception as e:
                ai_results["passed"] = False
                ai_results["issues"].append(f"Test case {i+1}: AI enhancement error: {str(e)}")
        
        if ai_results["response_times"]:
            ai_results["avg_response_time"] = statistics.mean(ai_results["response_times"])
            ai_results["max_response_time"] = max(ai_results["response_times"])
        
        return ai_results
    
    def test_cors_compliance(self) -> Dict[str, Any]:
        """Test CORS header compliance"""
        self.log("Testing CORS Compliance...")
        
        cors_results = {
            "test_name": "CORS Compliance",
            "passed": True,
            "issues": [],
            "headers_found": {}
        }
        
        try:
            # Test OPTIONS request
            response = self.session.options(f"{self.backend_url}/api/health")
            headers = dict(response.headers)
            
            cors_results["headers_found"] = {
                "access_control_allow_origin": headers.get('access-control-allow-origin', 'Not found'),
                "access_control_allow_methods": headers.get('access-control-allow-methods', 'Not found'),
                "access_control_allow_headers": headers.get('access-control-allow-headers', 'Not found')
            }
            
            # Check for required CORS headers
            if 'access-control-allow-origin' not in headers:
                cors_results["passed"] = False
                cors_results["issues"].append("Missing Access-Control-Allow-Origin header")
            
            if 'access-control-allow-methods' not in headers:
                cors_results["passed"] = False
                cors_results["issues"].append("Missing Access-Control-Allow-Methods header")
                
        except Exception as e:
            cors_results["passed"] = False
            cors_results["issues"].append(f"CORS test error: {str(e)}")
        
        return cors_results
    
    def run_performance_tests(self) -> Dict[str, Any]:
        """Run all performance tests"""
        self.log("Starting Mundo Tango Performance Tests")
        self.log("=" * 60)
        
        # Test 1: Core endpoint performance
        endpoints_to_test = [
            ("/api/health", "GET", None),
            ("/api/posts/feed", "GET", None),
            ("/api/posts", "POST", {"content": "Performance test memory", "isPublic": True}),
            ("/api/memories/enhance", "POST", {"content": "Test content", "options": {"enhanceContent": True}})
        ]
        
        for endpoint, method, data in endpoints_to_test:
            result = self.test_endpoint_performance(endpoint, method, data, iterations=5)
            self.results.append(result)
        
        # Test 2: Memory data consistency
        consistency_result = self.test_memory_data_consistency()
        
        # Test 3: AI enhancement performance
        ai_result = self.test_ai_enhancement_performance()
        
        # Test 4: CORS compliance
        cors_result = self.test_cors_compliance()
        
        # Calculate summary
        total_endpoints = len(self.results)
        fast_endpoints = sum(1 for r in self.results if r.avg_response_time < 0.1)
        slow_endpoints = sum(1 for r in self.results if r.avg_response_time > 0.5)
        
        summary = {
            "total_endpoints_tested": total_endpoints,
            "fast_endpoints": fast_endpoints,
            "slow_endpoints": slow_endpoints,
            "performance_results": self.results,
            "consistency_test": consistency_result,
            "ai_enhancement_test": ai_result,
            "cors_test": cors_result
        }
        
        self.log("=" * 60)
        self.log(f"Performance Summary: {fast_endpoints}/{total_endpoints} endpoints under 100ms")
        
        return summary
    
    def print_detailed_results(self, summary: Dict[str, Any]):
        """Print detailed performance results"""
        self.log("\nDetailed Performance Results:")
        self.log("-" * 60)
        
        # Endpoint performance
        for result in self.results:
            status = "🚀 FAST" if result.avg_response_time < 0.1 else "⚠️ SLOW" if result.avg_response_time > 0.5 else "✅ OK"
            self.log(f"{status} {result.method} {result.endpoint}")
            self.log(f"    Avg Response Time: {result.avg_response_time:.3f}s")
            self.log(f"    Min/Max: {result.min_response_time:.3f}s / {result.max_response_time:.3f}s")
            self.log(f"    Success Rate: {result.success_rate:.1f}% ({result.successful_requests}/{result.total_requests})")
            self.log("")
        
        # Consistency test
        consistency = summary["consistency_test"]
        status = "✅ PASS" if consistency["passed"] else "❌ FAIL"
        self.log(f"{status} Memory Data Consistency")
        if consistency["issues"]:
            for issue in consistency["issues"]:
                self.log(f"    Issue: {issue}")
        else:
            self.log("    All consistency checks passed")
        self.log("")
        
        # AI enhancement test
        ai_test = summary["ai_enhancement_test"]
        status = "✅ PASS" if ai_test["passed"] else "❌ FAIL"
        self.log(f"{status} AI Enhancement Performance")
        if "avg_response_time" in ai_test:
            self.log(f"    Avg AI Response Time: {ai_test['avg_response_time']:.3f}s")
        if ai_test["issues"]:
            for issue in ai_test["issues"]:
                self.log(f"    Issue: {issue}")
        self.log("")
        
        # CORS test
        cors_test = summary["cors_test"]
        status = "✅ PASS" if cors_test["passed"] else "❌ FAIL"
        self.log(f"{status} CORS Compliance")
        if cors_test["issues"]:
            for issue in cors_test["issues"]:
                self.log(f"    Issue: {issue}")
        self.log("")

def main():
    """Main test execution function"""
    print("Mundo Tango Memories System - Performance Testing Suite")
    print("=" * 60)
    
    # Initialize tester
    tester = MundoTangoPerformanceTester()
    
    try:
        # Run all tests
        summary = tester.run_performance_tests()
        
        # Print detailed results
        tester.print_detailed_results(summary)
        
        # Print final summary
        print("\n" + "=" * 60)
        print("FINAL PERFORMANCE SUMMARY")
        print("=" * 60)
        print(f"Total Endpoints Tested: {summary['total_endpoints_tested']}")
        print(f"Fast Endpoints (<100ms): {summary['fast_endpoints']}")
        print(f"Slow Endpoints (>500ms): {summary['slow_endpoints']}")
        
        # Check for critical issues
        critical_issues = []
        if not summary['consistency_test']['passed']:
            critical_issues.append("Memory data consistency")
        if not summary['ai_enhancement_test']['passed']:
            critical_issues.append("AI enhancement functionality")
        if not summary['cors_test']['passed']:
            critical_issues.append("CORS compliance")
        
        if critical_issues:
            print(f"\n🚨 CRITICAL ISSUES: {', '.join(critical_issues)}")
            sys.exit(1)
        else:
            print("\n✅ All performance tests passed successfully!")
            sys.exit(0)
            
    except KeyboardInterrupt:
        print("\n\nTest execution interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nTest execution failed with error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()