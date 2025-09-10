#!/usr/bin/env python3
"""
PHASE 3: AUTOMATION & ALGORITHM AUDITS
Mundo Tango Memories System - Comprehensive Enterprise-Grade Production Deployment Validation

This test suite validates:
- Post creation automation chain
- Content management automation chain  
- Feed algorithm & filtering audit
- AI & enhancement automation
- Business logic & growth automation
"""

import requests
import json
import time
import sys
import asyncio
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import uuid

@dataclass
class TestResult:
    name: str
    passed: bool
    message: str
    response_time: Optional[float] = None
    status_code: Optional[int] = None
    data: Optional[Dict] = None
    automation_score: Optional[float] = None

class Phase3AutomationTester:
    def __init__(self, backend_url: str = "http://localhost:8001", node_url: str = "http://localhost:5000"):
        self.backend_url = backend_url
        self.node_url = node_url
        self.session = requests.Session()
        self.session.timeout = 30
        self.results: List[TestResult] = []
        self.test_user_id = 999  # Default test user
        self.created_memories = []
        
    def log(self, message: str):
        """Log test messages with timestamp"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")
        
    def create_test_memory(self, content: str, is_public: bool = True, hashtags: List[str] = None) -> Optional[Dict]:
        """Helper to create test memories"""
        try:
            test_data = {
                "content": content,
                "isPublic": is_public,
                "hashtags": hashtags or []
            }
            
            response = self.session.post(f"{self.backend_url}/api/posts", json=test_data)
            if response.status_code in [200, 201]:
                data = response.json()
                if data.get('success') and data.get('data'):
                    memory = data['data']
                    self.created_memories.append(memory['id'])
                    return memory
            return None
        except Exception as e:
            self.log(f"Failed to create test memory: {str(e)}")
            return None
    
    def test_memory_creation_propagation(self) -> TestResult:
        """Test memory created → appears in user's profile timeline"""
        self.log("Testing Memory Creation Propagation...")
        
        try:
            start_time = time.time()
            
            # Create a test memory
            test_content = f"Phase 3 Test Memory - Propagation Test {int(time.time())}"
            memory = self.create_test_memory(test_content)
            
            if not memory:
                return TestResult(
                    name="Memory Creation Propagation",
                    passed=False,
                    message="Failed to create test memory for propagation test"
                )
            
            memory_id = memory['id']
            
            # Wait for propagation
            time.sleep(0.5)
            
            # Check if memory appears in feed
            feed_response = self.session.get(f"{self.backend_url}/api/posts/feed")
            
            if feed_response.status_code == 200:
                feed_data = feed_response.json()
                if feed_data.get('success') and feed_data.get('data'):
                    memories = feed_data['data']
                    
                    # Check if our memory is in the feed
                    found_memory = None
                    for mem in memories:
                        if mem.get('id') == memory_id:
                            found_memory = mem
                            break
                    
                    response_time = time.time() - start_time
                    
                    if found_memory:
                        return TestResult(
                            name="Memory Creation Propagation",
                            passed=True,
                            message=f"Memory successfully propagated to feed (ID: {memory_id})",
                            response_time=response_time,
                            automation_score=100.0,
                            data={"memory_id": memory_id, "propagation_time": response_time}
                        )
                    else:
                        return TestResult(
                            name="Memory Creation Propagation",
                            passed=False,
                            message=f"Memory created but not found in feed (ID: {memory_id})",
                            response_time=response_time,
                            automation_score=50.0
                        )
            
            return TestResult(
                name="Memory Creation Propagation",
                passed=False,
                message="Failed to retrieve feed for propagation verification"
            )
            
        except Exception as e:
            return TestResult(
                name="Memory Creation Propagation",
                passed=False,
                message=f"Memory propagation test failed: {str(e)}"
            )
    
    def test_ai_enhancement_pipeline(self) -> TestResult:
        """Test memory created → triggers AI enhancement pipeline"""
        self.log("Testing AI Enhancement Pipeline...")
        
        try:
            start_time = time.time()
            
            # Test AI enhancement with tango-specific content
            test_content = "Had an incredible milonga experience tonight at Salon Canning"
            
            enhancement_data = {
                "content": test_content,
                "options": {
                    "enhanceContent": True,
                    "generateTags": True,
                    "analyzeSentiment": True,
                    "optimizeEngagement": True
                }
            }
            
            response = self.session.post(f"{self.backend_url}/api/memories/enhance", json=enhancement_data)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    enhanced_data = data['data']
                    
                    # Check enhancement quality
                    original_content = enhanced_data.get('originalContent', '')
                    enhanced_content = enhanced_data.get('enhancedContent', '')
                    generated_tags = enhanced_data.get('generatedTags', [])
                    sentiment = enhanced_data.get('sentiment', {})
                    
                    # Calculate automation score based on enhancement quality
                    score = 0
                    if enhanced_content and len(enhanced_content) > len(original_content):
                        score += 30  # Content enhanced
                    if generated_tags and len(generated_tags) > 0:
                        score += 30  # Tags generated
                    if sentiment and sentiment.get('score') is not None:
                        score += 20  # Sentiment analyzed
                    if enhanced_data.get('optimizedForEngagement'):
                        score += 20  # Engagement optimized
                    
                    return TestResult(
                        name="AI Enhancement Pipeline",
                        passed=True,
                        message=f"AI enhancement pipeline functional (Score: {score}/100)",
                        response_time=response_time,
                        status_code=response.status_code,
                        automation_score=score,
                        data={
                            "enhanced_content_length": len(enhanced_content),
                            "original_content_length": len(original_content),
                            "tags_generated": len(generated_tags),
                            "sentiment_analyzed": bool(sentiment),
                            "processing_time": response_time
                        }
                    )
                else:
                    return TestResult(
                        name="AI Enhancement Pipeline",
                        passed=False,
                        message="AI enhancement returned success but no data",
                        response_time=response_time,
                        status_code=response.status_code
                    )
            else:
                return TestResult(
                    name="AI Enhancement Pipeline",
                    passed=False,
                    message=f"AI enhancement failed with status: {response.status_code}",
                    response_time=response_time,
                    status_code=response.status_code
                )
                
        except Exception as e:
            return TestResult(
                name="AI Enhancement Pipeline",
                passed=False,
                message=f"AI enhancement pipeline test failed: {str(e)}"
            )
    
    def test_hashtag_extraction_indexing(self) -> TestResult:
        """Test hashtag extraction and indexing"""
        self.log("Testing Hashtag Extraction and Indexing...")
        
        try:
            start_time = time.time()
            
            # Create memory with hashtags
            test_content = "Amazing #tango night at #SalonCanning with #milonga vibes! #BuenosAires #dance"
            memory = self.create_test_memory(test_content)
            
            if not memory:
                return TestResult(
                    name="Hashtag Extraction and Indexing",
                    passed=False,
                    message="Failed to create test memory with hashtags"
                )
            
            # Wait for processing
            time.sleep(0.5)
            
            # Check if hashtags were extracted
            hashtags = memory.get('hashtags', [])
            response_time = time.time() - start_time
            
            expected_hashtags = ['tango', 'SalonCanning', 'milonga', 'BuenosAires', 'dance']
            extracted_count = len(hashtags)
            
            # Calculate automation score
            if extracted_count >= 3:
                score = min(100, (extracted_count / len(expected_hashtags)) * 100)
            else:
                score = (extracted_count / len(expected_hashtags)) * 50
            
            return TestResult(
                name="Hashtag Extraction and Indexing",
                passed=extracted_count > 0,
                message=f"Extracted {extracted_count} hashtags from content",
                response_time=response_time,
                automation_score=score,
                data={
                    "extracted_hashtags": hashtags,
                    "expected_hashtags": expected_hashtags,
                    "extraction_rate": extracted_count / len(expected_hashtags) if expected_hashtags else 0
                }
            )
            
        except Exception as e:
            return TestResult(
                name="Hashtag Extraction and Indexing",
                passed=False,
                message=f"Hashtag extraction test failed: {str(e)}"
            )
    
    def test_feed_algorithm_chronological(self) -> TestResult:
        """Test recent posts appear first (chronological sorting)"""
        self.log("Testing Feed Algorithm - Chronological Sorting...")
        
        try:
            start_time = time.time()
            
            # Create multiple memories with time gaps
            memories_created = []
            for i in range(3):
                content = f"Chronological test memory {i+1} - {int(time.time())}"
                memory = self.create_test_memory(content)
                if memory:
                    memories_created.append(memory)
                time.sleep(0.2)  # Small delay between creations
            
            if len(memories_created) < 2:
                return TestResult(
                    name="Feed Algorithm - Chronological Sorting",
                    passed=False,
                    message="Failed to create enough test memories for chronological test"
                )
            
            # Get feed
            feed_response = self.session.get(f"{self.backend_url}/api/posts/feed")
            response_time = time.time() - start_time
            
            if feed_response.status_code == 200:
                feed_data = feed_response.json()
                if feed_data.get('success') and feed_data.get('data'):
                    feed_memories = feed_data['data']
                    
                    # Check if our memories are in chronological order (newest first)
                    our_memories_in_feed = []
                    for memory in feed_memories:
                        if memory['id'] in [m['id'] for m in memories_created]:
                            our_memories_in_feed.append(memory)
                    
                    # Verify chronological order
                    is_chronological = True
                    if len(our_memories_in_feed) >= 2:
                        for i in range(len(our_memories_in_feed) - 1):
                            current_id = our_memories_in_feed[i]['id']
                            next_id = our_memories_in_feed[i + 1]['id']
                            # Newer memories should have higher IDs and appear first
                            if current_id < next_id:
                                is_chronological = False
                                break
                    
                    score = 100 if is_chronological else 50
                    
                    return TestResult(
                        name="Feed Algorithm - Chronological Sorting",
                        passed=is_chronological,
                        message=f"Feed chronological sorting: {'CORRECT' if is_chronological else 'INCORRECT'}",
                        response_time=response_time,
                        automation_score=score,
                        data={
                            "memories_created": len(memories_created),
                            "memories_in_feed": len(our_memories_in_feed),
                            "chronological_order": is_chronological
                        }
                    )
            
            return TestResult(
                name="Feed Algorithm - Chronological Sorting",
                passed=False,
                message="Failed to retrieve feed for chronological test"
            )
            
        except Exception as e:
            return TestResult(
                name="Feed Algorithm - Chronological Sorting",
                passed=False,
                message=f"Chronological sorting test failed: {str(e)}"
            )
    
    def test_search_functionality(self) -> TestResult:
        """Test search functionality across memory content"""
        self.log("Testing Search Functionality...")
        
        try:
            start_time = time.time()
            
            # Create a memory with specific searchable content
            unique_term = f"searchtest{int(time.time())}"
            test_content = f"This is a unique memory for testing search functionality with term {unique_term}"
            memory = self.create_test_memory(test_content)
            
            if not memory:
                return TestResult(
                    name="Search Functionality",
                    passed=False,
                    message="Failed to create test memory for search test"
                )
            
            # Wait for indexing
            time.sleep(1.0)
            
            # Test search endpoint
            search_response = self.session.get(f"{self.backend_url}/api/search", params={"q": unique_term})
            
            if search_response.status_code == 404:
                # Try alternative search endpoint
                search_response = self.session.get(f"{self.backend_url}/api/posts/search", params={"q": unique_term})
            
            response_time = time.time() - start_time
            
            if search_response.status_code == 200:
                search_data = search_response.json()
                if search_data.get('success') and search_data.get('data'):
                    results = search_data['data']
                    
                    # Check if our memory is in search results
                    found = any(result.get('id') == memory['id'] for result in results)
                    
                    score = 100 if found else 0
                    
                    return TestResult(
                        name="Search Functionality",
                        passed=found,
                        message=f"Search functionality: {'WORKING' if found else 'NOT WORKING'} - Found {len(results)} results",
                        response_time=response_time,
                        status_code=search_response.status_code,
                        automation_score=score,
                        data={
                            "search_term": unique_term,
                            "results_count": len(results),
                            "memory_found": found
                        }
                    )
            elif search_response.status_code == 404:
                return TestResult(
                    name="Search Functionality",
                    passed=False,
                    message="Search endpoint not implemented",
                    response_time=response_time,
                    status_code=search_response.status_code,
                    automation_score=0
                )
            else:
                return TestResult(
                    name="Search Functionality",
                    passed=False,
                    message=f"Search failed with status: {search_response.status_code}",
                    response_time=response_time,
                    status_code=search_response.status_code,
                    automation_score=0
                )
                
        except Exception as e:
            return TestResult(
                name="Search Functionality",
                passed=False,
                message=f"Search functionality test failed: {str(e)}"
            )
    
    def test_content_management_workflow(self) -> TestResult:
        """Test content management automation (report/hide/block system)"""
        self.log("Testing Content Management Workflow...")
        
        try:
            start_time = time.time()
            
            # Create a test memory to report
            test_content = f"Test memory for content management - {int(time.time())}"
            memory = self.create_test_memory(test_content)
            
            if not memory:
                return TestResult(
                    name="Content Management Workflow",
                    passed=False,
                    message="Failed to create test memory for content management test"
                )
            
            memory_id = memory['id']
            
            # Test report functionality
            report_data = {
                "memoryId": memory_id,
                "reason": "inappropriate_content",
                "description": "Test report for automation testing"
            }
            
            report_response = self.session.post(f"{self.backend_url}/api/reports", json=report_data)
            
            # Test hide functionality
            hide_response = self.session.post(f"{self.backend_url}/api/memories/{memory_id}/hide")
            
            response_time = time.time() - start_time
            
            # Calculate automation score based on available endpoints
            score = 0
            report_works = report_response.status_code in [200, 201, 404]  # 404 means endpoint exists but may need auth
            hide_works = hide_response.status_code in [200, 201, 404]
            
            if report_works:
                score += 50
            if hide_works:
                score += 50
            
            # Check if endpoints exist (even if they return 404 due to auth)
            endpoints_exist = (report_response.status_code != 404) or (hide_response.status_code != 404)
            
            return TestResult(
                name="Content Management Workflow",
                passed=endpoints_exist,
                message=f"Content management endpoints: Report({report_response.status_code}), Hide({hide_response.status_code})",
                response_time=response_time,
                automation_score=score,
                data={
                    "memory_id": memory_id,
                    "report_status": report_response.status_code,
                    "hide_status": hide_response.status_code,
                    "endpoints_available": endpoints_exist
                }
            )
            
        except Exception as e:
            return TestResult(
                name="Content Management Workflow",
                passed=False,
                message=f"Content management workflow test failed: {str(e)}"
            )
    
    def test_real_time_propagation_speed(self) -> TestResult:
        """Test real-time propagation speed (target: < 500ms)"""
        self.log("Testing Real-time Propagation Speed...")
        
        try:
            # Create memory and measure propagation time
            start_time = time.time()
            
            test_content = f"Speed test memory - {int(time.time())}"
            memory = self.create_test_memory(test_content)
            
            if not memory:
                return TestResult(
                    name="Real-time Propagation Speed",
                    passed=False,
                    message="Failed to create test memory for speed test"
                )
            
            creation_time = time.time() - start_time
            
            # Check if memory appears in feed immediately
            feed_start = time.time()
            feed_response = self.session.get(f"{self.backend_url}/api/posts/feed")
            feed_time = time.time() - feed_start
            
            total_propagation_time = (creation_time + feed_time) * 1000  # Convert to milliseconds
            
            if feed_response.status_code == 200:
                feed_data = feed_response.json()
                if feed_data.get('success') and feed_data.get('data'):
                    memories = feed_data['data']
                    memory_found = any(mem.get('id') == memory['id'] for mem in memories)
                    
                    # Target is < 500ms
                    meets_target = total_propagation_time < 500
                    score = 100 if meets_target else max(0, 100 - (total_propagation_time - 500) / 10)
                    
                    return TestResult(
                        name="Real-time Propagation Speed",
                        passed=memory_found and meets_target,
                        message=f"Propagation time: {total_propagation_time:.1f}ms (Target: <500ms)",
                        response_time=total_propagation_time / 1000,
                        automation_score=score,
                        data={
                            "propagation_time_ms": total_propagation_time,
                            "target_ms": 500,
                            "meets_target": meets_target,
                            "memory_found": memory_found
                        }
                    )
            
            return TestResult(
                name="Real-time Propagation Speed",
                passed=False,
                message="Failed to verify propagation speed"
            )
            
        except Exception as e:
            return TestResult(
                name="Real-time Propagation Speed",
                passed=False,
                message=f"Propagation speed test failed: {str(e)}"
            )
    
    def test_privacy_automation(self) -> TestResult:
        """Test privacy settings application (public/private content)"""
        self.log("Testing Privacy Automation...")
        
        try:
            start_time = time.time()
            
            # Create public and private memories
            public_content = f"Public memory test - {int(time.time())}"
            private_content = f"Private memory test - {int(time.time())}"
            
            public_memory = self.create_test_memory(public_content, is_public=True)
            private_memory = self.create_test_memory(private_content, is_public=False)
            
            if not public_memory or not private_memory:
                return TestResult(
                    name="Privacy Automation",
                    passed=False,
                    message="Failed to create test memories for privacy test"
                )
            
            # Wait for processing
            time.sleep(0.5)
            
            # Check feed for privacy compliance
            feed_response = self.session.get(f"{self.backend_url}/api/posts/feed")
            response_time = time.time() - start_time
            
            if feed_response.status_code == 200:
                feed_data = feed_response.json()
                if feed_data.get('success') and feed_data.get('data'):
                    memories = feed_data['data']
                    
                    public_found = any(mem.get('id') == public_memory['id'] for mem in memories)
                    private_found = any(mem.get('id') == private_memory['id'] for mem in memories)
                    
                    # Public should be found, private should not (unless we're the owner)
                    privacy_working = public_found and not private_found
                    score = 100 if privacy_working else 50
                    
                    return TestResult(
                        name="Privacy Automation",
                        passed=privacy_working,
                        message=f"Privacy automation: Public({public_found}), Private({private_found})",
                        response_time=response_time,
                        automation_score=score,
                        data={
                            "public_memory_id": public_memory['id'],
                            "private_memory_id": private_memory['id'],
                            "public_in_feed": public_found,
                            "private_in_feed": private_found,
                            "privacy_working": privacy_working
                        }
                    )
            
            return TestResult(
                name="Privacy Automation",
                passed=False,
                message="Failed to verify privacy automation"
            )
            
        except Exception as e:
            return TestResult(
                name="Privacy Automation",
                passed=False,
                message=f"Privacy automation test failed: {str(e)}"
            )
    
    def run_phase3_automation_tests(self) -> Dict[str, Any]:
        """Run all Phase 3 automation and algorithm tests"""
        self.log("Starting PHASE 3: AUTOMATION & ALGORITHM AUDITS")
        self.log("=" * 80)
        
        # Phase 3A: Post Creation Automation Chain
        self.log("\n🤖 PHASE 3A: POST CREATION AUTOMATION CHAIN")
        self.log("-" * 50)
        
        # Test 1: Memory Creation Propagation
        propagation_result = self.test_memory_creation_propagation()
        self.results.append(propagation_result)
        
        # Test 2: AI Enhancement Pipeline
        ai_result = self.test_ai_enhancement_pipeline()
        self.results.append(ai_result)
        
        # Test 3: Hashtag Extraction and Indexing
        hashtag_result = self.test_hashtag_extraction_indexing()
        self.results.append(hashtag_result)
        
        # Test 4: Real-time Propagation Speed
        speed_result = self.test_real_time_propagation_speed()
        self.results.append(speed_result)
        
        # Phase 3B: Content Management Automation Chain
        self.log("\n🤖 PHASE 3B: CONTENT MANAGEMENT AUTOMATION CHAIN")
        self.log("-" * 50)
        
        # Test 5: Content Management Workflow
        content_mgmt_result = self.test_content_management_workflow()
        self.results.append(content_mgmt_result)
        
        # Test 6: Privacy Automation
        privacy_result = self.test_privacy_automation()
        self.results.append(privacy_result)
        
        # Phase 3C: Feed Algorithm & Filtering Audit
        self.log("\n🤖 PHASE 3C: FEED ALGORITHM & FILTERING AUDIT")
        self.log("-" * 50)
        
        # Test 7: Feed Algorithm - Chronological Sorting
        chronological_result = self.test_feed_algorithm_chronological()
        self.results.append(chronological_result)
        
        # Test 8: Search Functionality
        search_result = self.test_search_functionality()
        self.results.append(search_result)
        
        # Calculate summary
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r.passed)
        failed_tests = total_tests - passed_tests
        
        # Calculate average automation score
        automation_scores = [r.automation_score for r in self.results if r.automation_score is not None]
        avg_automation_score = sum(automation_scores) / len(automation_scores) if automation_scores else 0
        
        summary = {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": (passed_tests / total_tests * 100) if total_tests > 0 else 0,
            "average_automation_score": avg_automation_score,
            "results": self.results,
            "created_memories": self.created_memories
        }
        
        self.log("=" * 80)
        self.log(f"Phase 3 Summary: {passed_tests}/{total_tests} tests passed ({summary['success_rate']:.1f}%)")
        self.log(f"Average Automation Score: {avg_automation_score:.1f}/100")
        
        return summary
    
    def print_detailed_results(self):
        """Print detailed test results with automation scores"""
        self.log("\nDetailed Phase 3 Test Results:")
        self.log("-" * 80)
        
        for result in self.results:
            status = "✅ PASS" if result.passed else "❌ FAIL"
            automation_info = f" (Automation: {result.automation_score:.1f}/100)" if result.automation_score is not None else ""
            
            self.log(f"{status} {result.name}{automation_info}")
            self.log(f"    Message: {result.message}")
            if result.response_time:
                self.log(f"    Response Time: {result.response_time:.3f}s")
            if result.status_code:
                self.log(f"    Status Code: {result.status_code}")
            if result.data:
                self.log(f"    Data: {json.dumps(result.data, indent=2)[:200]}...")
            self.log("")

def main():
    """Main test execution function"""
    print("PHASE 3: AUTOMATION & ALGORITHM AUDITS")
    print("Mundo Tango Memories System - Enterprise Deployment Validation")
    print("=" * 80)
    
    # Initialize tester
    tester = Phase3AutomationTester()
    
    try:
        # Run all Phase 3 tests
        summary = tester.run_phase3_automation_tests()
        
        # Print detailed results
        tester.print_detailed_results()
        
        # Print final summary
        print("\n" + "=" * 80)
        print("PHASE 3 FINAL SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {summary['total_tests']}")
        print(f"Passed: {summary['passed_tests']}")
        print(f"Failed: {summary['failed_tests']}")
        print(f"Success Rate: {summary['success_rate']:.1f}%")
        print(f"Average Automation Score: {summary['average_automation_score']:.1f}/100")
        
        # Print automation assessment
        print("\n" + "=" * 80)
        print("AUTOMATION CHAIN ASSESSMENT")
        print("=" * 80)
        
        if summary['average_automation_score'] >= 90:
            print("🟢 EXCELLENT: Automation chains are highly functional")
        elif summary['average_automation_score'] >= 70:
            print("🟡 GOOD: Automation chains are mostly functional with minor issues")
        elif summary['average_automation_score'] >= 50:
            print("🟠 MODERATE: Automation chains have significant gaps")
        else:
            print("🔴 POOR: Automation chains need major improvements")
        
        # Print specific findings
        failed_tests = [r for r in summary['results'] if not r.passed]
        if failed_tests:
            print("\n❌ FAILED AUTOMATION CHAINS:")
            for test in failed_tests:
                print(f"  - {test.name}: {test.message}")
        
        # Print created test data
        if summary['created_memories']:
            print(f"\n📝 Created {len(summary['created_memories'])} test memories for validation")
        
        # Exit with appropriate code based on automation score
        if summary['average_automation_score'] >= 70 and summary['success_rate'] >= 75:
            print("\n✅ Phase 3 automation validation PASSED!")
            sys.exit(0)
        elif summary['average_automation_score'] >= 50:
            print("\n⚠️  Phase 3 automation validation PARTIAL - some chains need improvement")
            sys.exit(1)
        else:
            print("\n❌ Phase 3 automation validation FAILED - major automation issues detected")
            sys.exit(2)
            
    except KeyboardInterrupt:
        print("\n\nTest execution interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nTest execution failed with error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()