#!/usr/bin/env python3
"""
ESA 61×21 Framework Compliance Testing Suite
Tests the implemented ESA layers for Mundo Tango Memories system
"""

import requests
import json
import time
import sys
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

@dataclass
class ESALayerResult:
    layer_number: int
    layer_name: str
    status: str
    compliance_level: str
    details: Dict[str, Any]
    issues: List[str]

class ESAFrameworkComplianceTester:
    def __init__(self, backend_url: str = "http://localhost:8001", node_url: str = "http://localhost:5000"):
        self.backend_url = backend_url
        self.node_url = node_url
        self.session = requests.Session()
        self.session.timeout = 30
        self.results: List[ESALayerResult] = []
        
    def log(self, message: str):
        """Log test messages with timestamp"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")
        
    def test_layer_1_database_architecture(self) -> ESALayerResult:
        """Test Layer 1: Database Architecture - Memory storage and retrieval"""
        self.log("Testing Layer 1: Database Architecture...")
        
        issues = []
        details = {}
        
        try:
            # Test memory storage (create)
            test_memory = {
                "content": "ESA Layer 1 compliance test - database architecture",
                "isPublic": True
            }
            
            create_response = self.session.post(f"{self.backend_url}/api/posts", json=test_memory)
            if create_response.status_code in [200, 201]:
                details["memory_creation"] = "Working"
                created_data = create_response.json()
                memory_id = created_data.get('data', {}).get('id')
                details["created_memory_id"] = memory_id
            else:
                issues.append("Memory creation failed")
                details["memory_creation"] = "Failed"
            
            # Test memory retrieval
            feed_response = self.session.get(f"{self.backend_url}/api/posts/feed")
            if feed_response.status_code == 200:
                feed_data = feed_response.json()
                memories = feed_data.get('data', [])
                details["memory_retrieval"] = "Working"
                details["total_memories"] = len(memories)
                
                # Check if our test memory is retrievable
                if memory_id:
                    found = any(m.get('id') == memory_id for m in memories)
                    details["test_memory_retrievable"] = found
                    if not found:
                        issues.append("Created memory not retrievable from feed")
            else:
                issues.append("Memory retrieval failed")
                details["memory_retrieval"] = "Failed"
            
            # Test data persistence (check memory structure)
            if memories:
                sample_memory = memories[0]
                required_fields = ['id', 'content', 'createdAt', 'user', 'likesCount']
                missing_fields = [field for field in required_fields if field not in sample_memory]
                if missing_fields:
                    issues.append(f"Missing required fields: {missing_fields}")
                else:
                    details["data_structure"] = "Compliant"
            
            compliance_level = "Full" if not issues else "Partial" if len(issues) <= 2 else "Minimal"
            status = "Working" if not issues else "Issues Found"
            
        except Exception as e:
            issues.append(f"Layer 1 test error: {str(e)}")
            compliance_level = "Failed"
            status = "Error"
        
        return ESALayerResult(
            layer_number=1,
            layer_name="Database Architecture",
            status=status,
            compliance_level=compliance_level,
            details=details,
            issues=issues
        )
    
    def test_layer_2_api_structure(self) -> ESALayerResult:
        """Test Layer 2: API Structure - RESTful endpoints"""
        self.log("Testing Layer 2: API Structure...")
        
        issues = []
        details = {}
        
        # Test RESTful endpoint structure
        endpoints_to_test = [
            ("GET", "/api/health", "Health check endpoint"),
            ("GET", "/api/posts/feed", "Memory feed endpoint"),
            ("POST", "/api/posts", "Memory creation endpoint"),
            ("POST", "/api/posts/1/like", "Memory interaction endpoint"),
            ("POST", "/api/memories/enhance", "AI enhancement endpoint")
        ]
        
        working_endpoints = 0
        total_endpoints = len(endpoints_to_test)
        
        for method, endpoint, description in endpoints_to_test:
            try:
                if method == "GET":
                    response = self.session.get(f"{self.backend_url}{endpoint}")
                elif method == "POST":
                    test_data = {"content": "API test", "isPublic": True} if "posts" in endpoint and not "like" in endpoint else {"content": "test"}
                    response = self.session.post(f"{self.backend_url}{endpoint}", json=test_data)
                
                if 200 <= response.status_code < 400:
                    working_endpoints += 1
                    details[f"{method}_{endpoint.replace('/', '_')}"] = "Working"
                else:
                    issues.append(f"{description} returned status {response.status_code}")
                    details[f"{method}_{endpoint.replace('/', '_')}"] = f"Failed ({response.status_code})"
                    
            except Exception as e:
                issues.append(f"{description} error: {str(e)}")
                details[f"{method}_{endpoint.replace('/', '_')}"] = "Error"
        
        details["working_endpoints"] = f"{working_endpoints}/{total_endpoints}"
        
        # Test API response format consistency
        try:
            response = self.session.get(f"{self.backend_url}/api/posts/feed")
            if response.status_code == 200:
                data = response.json()
                if 'success' in data and 'data' in data:
                    details["response_format"] = "Consistent"
                else:
                    issues.append("Inconsistent API response format")
                    details["response_format"] = "Inconsistent"
        except:
            issues.append("Could not test API response format")
        
        compliance_level = "Full" if working_endpoints == total_endpoints and not issues else "Partial" if working_endpoints >= total_endpoints * 0.7 else "Minimal"
        status = "Working" if working_endpoints >= total_endpoints * 0.8 else "Issues Found"
        
        return ESALayerResult(
            layer_number=2,
            layer_name="API Structure",
            status=status,
            compliance_level=compliance_level,
            details=details,
            issues=issues
        )
    
    def test_layer_31_ai_infrastructure(self) -> ESALayerResult:
        """Test Layer 31: AI Infrastructure - Mock AI enhancement"""
        self.log("Testing Layer 31: AI Infrastructure...")
        
        issues = []
        details = {}
        
        try:
            # Test AI enhancement functionality
            test_cases = [
                {
                    "content": "Amazing tango night!",
                    "options": {"enhanceContent": True, "generateTags": True, "analyzeSentiment": True}
                },
                {
                    "content": "Struggling with technique",
                    "options": {"enhanceContent": False, "generateTags": True, "analyzeSentiment": True}
                }
            ]
            
            successful_enhancements = 0
            
            for i, test_case in enumerate(test_cases):
                response = self.session.post(f"{self.backend_url}/api/memories/enhance", json=test_case)
                
                if response.status_code == 200:
                    data = response.json()
                    enhancement_data = data.get('data', {})
                    
                    # Check AI enhancement features
                    if 'enhancedContent' in enhancement_data:
                        details[f"content_enhancement_{i+1}"] = "Working"
                    else:
                        issues.append(f"Test case {i+1}: Missing enhanced content")
                    
                    if 'tags' in enhancement_data:
                        details[f"tag_generation_{i+1}"] = f"Generated {len(enhancement_data['tags'])} tags"
                    else:
                        issues.append(f"Test case {i+1}: Missing tag generation")
                    
                    if 'sentiment' in enhancement_data:
                        details[f"sentiment_analysis_{i+1}"] = enhancement_data['sentiment']
                    else:
                        issues.append(f"Test case {i+1}: Missing sentiment analysis")
                    
                    # Check AI provider information
                    if 'aiProvider' in data:
                        details["ai_provider"] = data['aiProvider']
                    
                    successful_enhancements += 1
                else:
                    issues.append(f"AI enhancement test case {i+1} failed with status {response.status_code}")
            
            details["successful_enhancements"] = f"{successful_enhancements}/{len(test_cases)}"
            
            # Test AI response time
            start_time = time.time()
            response = self.session.post(f"{self.backend_url}/api/memories/enhance", json=test_cases[0])
            ai_response_time = time.time() - start_time
            details["ai_response_time"] = f"{ai_response_time:.3f}s"
            
            if ai_response_time > 2.0:
                issues.append("AI response time too slow (>2s)")
            
            compliance_level = "Full" if successful_enhancements == len(test_cases) and not issues else "Partial" if successful_enhancements > 0 else "Failed"
            status = "Working" if successful_enhancements > 0 else "Failed"
            
        except Exception as e:
            issues.append(f"AI infrastructure test error: {str(e)}")
            compliance_level = "Failed"
            status = "Error"
        
        return ESALayerResult(
            layer_number=31,
            layer_name="AI Infrastructure",
            status=status,
            compliance_level=compliance_level,
            details=details,
            issues=issues
        )
    
    def test_layer_36_memory_systems(self) -> ESALayerResult:
        """Test Layer 36: Memory Systems - Memory processing pipeline"""
        self.log("Testing Layer 36: Memory Systems...")
        
        issues = []
        details = {}
        
        try:
            # Test memory processing pipeline
            initial_response = self.session.get(f"{self.backend_url}/api/posts/feed")
            initial_count = len(initial_response.json().get('data', [])) if initial_response.status_code == 200 else 0
            
            # Create memory with hashtags
            memory_with_hashtags = {
                "content": "Testing memory processing pipeline #tango #milonga #dance",
                "isPublic": True
            }
            
            create_response = self.session.post(f"{self.backend_url}/api/posts", json=memory_with_hashtags)
            if create_response.status_code in [200, 201]:
                created_memory = create_response.json().get('data', {})
                memory_id = created_memory.get('id')
                
                # Check hashtag extraction
                hashtags = created_memory.get('hashtags', [])
                if hashtags:
                    details["hashtag_extraction"] = f"Extracted {len(hashtags)} hashtags: {hashtags}"
                else:
                    issues.append("Hashtag extraction not working")
                
                # Check memory metadata
                required_metadata = ['createdAt', 'likesCount', 'commentsCount', 'user']
                missing_metadata = [field for field in required_metadata if field not in created_memory]
                if missing_metadata:
                    issues.append(f"Missing memory metadata: {missing_metadata}")
                else:
                    details["memory_metadata"] = "Complete"
                
                # Test memory interaction (like)
                if memory_id:
                    like_response = self.session.post(f"{self.backend_url}/api/posts/{memory_id}/like")
                    if like_response.status_code == 200:
                        like_data = like_response.json()
                        new_like_count = like_data.get('data', {}).get('newLikeCount', 0)
                        details["memory_interaction"] = f"Like count updated to {new_like_count}"
                    else:
                        issues.append("Memory interaction (like) failed")
                
                # Test memory filtering
                filter_response = self.session.get(f"{self.backend_url}/api/posts/feed?filterTags=tango")
                if filter_response.status_code == 200:
                    filtered_data = filter_response.json()
                    filtered_memories = filtered_data.get('data', [])
                    details["memory_filtering"] = f"Filter returned {len(filtered_memories)} memories"
                else:
                    issues.append("Memory filtering not working")
                
                # Verify memory appears in feed
                final_response = self.session.get(f"{self.backend_url}/api/posts/feed")
                final_count = len(final_response.json().get('data', [])) if final_response.status_code == 200 else 0
                
                if final_count == initial_count + 1:
                    details["memory_persistence"] = "Working"
                else:
                    issues.append("Memory persistence issue")
                    
            else:
                issues.append("Memory creation failed in processing pipeline test")
            
            compliance_level = "Full" if not issues else "Partial" if len(issues) <= 2 else "Minimal"
            status = "Working" if len(issues) <= 1 else "Issues Found"
            
        except Exception as e:
            issues.append(f"Memory systems test error: {str(e)}")
            compliance_level = "Failed"
            status = "Error"
        
        return ESALayerResult(
            layer_number=36,
            layer_name="Memory Systems",
            status=status,
            compliance_level=compliance_level,
            details=details,
            issues=issues
        )
    
    def run_esa_compliance_tests(self) -> Dict[str, Any]:
        """Run all ESA framework compliance tests"""
        self.log("Starting ESA 61×21 Framework Compliance Tests")
        self.log("=" * 60)
        
        # Test key ESA layers mentioned by main agent
        layer_tests = [
            self.test_layer_1_database_architecture,
            self.test_layer_2_api_structure,
            self.test_layer_31_ai_infrastructure,
            self.test_layer_36_memory_systems
        ]
        
        for test_func in layer_tests:
            result = test_func()
            self.results.append(result)
        
        # Calculate compliance summary
        total_layers = len(self.results)
        fully_compliant = sum(1 for r in self.results if r.compliance_level == "Full")
        partially_compliant = sum(1 for r in self.results if r.compliance_level == "Partial")
        failed_layers = sum(1 for r in self.results if r.compliance_level == "Failed")
        
        overall_compliance = (fully_compliant * 100 + partially_compliant * 50) / (total_layers * 100) * 100
        
        summary = {
            "total_layers_tested": total_layers,
            "fully_compliant": fully_compliant,
            "partially_compliant": partially_compliant,
            "failed_layers": failed_layers,
            "overall_compliance_percentage": overall_compliance,
            "layer_results": self.results
        }
        
        self.log("=" * 60)
        self.log(f"ESA Compliance Summary: {overall_compliance:.1f}% overall compliance")
        
        return summary
    
    def print_detailed_results(self, summary: Dict[str, Any]):
        """Print detailed ESA compliance results"""
        self.log("\nDetailed ESA Framework Compliance Results:")
        self.log("-" * 60)
        
        for result in self.results:
            if result.compliance_level == "Full":
                status_icon = "✅ FULL"
            elif result.compliance_level == "Partial":
                status_icon = "⚠️ PARTIAL"
            else:
                status_icon = "❌ FAILED"
                
            self.log(f"{status_icon} Layer {result.layer_number}: {result.layer_name}")
            self.log(f"    Status: {result.status}")
            self.log(f"    Compliance: {result.compliance_level}")
            
            if result.details:
                self.log("    Details:")
                for key, value in result.details.items():
                    self.log(f"      - {key}: {value}")
            
            if result.issues:
                self.log("    Issues:")
                for issue in result.issues:
                    self.log(f"      - {issue}")
            
            self.log("")

def main():
    """Main test execution function"""
    print("ESA 61×21 Framework Compliance Testing Suite")
    print("=" * 60)
    
    # Initialize tester
    tester = ESAFrameworkComplianceTester()
    
    try:
        # Run all tests
        summary = tester.run_esa_compliance_tests()
        
        # Print detailed results
        tester.print_detailed_results(summary)
        
        # Print final summary
        print("\n" + "=" * 60)
        print("FINAL ESA COMPLIANCE SUMMARY")
        print("=" * 60)
        print(f"Total Layers Tested: {summary['total_layers_tested']}")
        print(f"Fully Compliant: {summary['fully_compliant']}")
        print(f"Partially Compliant: {summary['partially_compliant']}")
        print(f"Failed Layers: {summary['failed_layers']}")
        print(f"Overall Compliance: {summary['overall_compliance_percentage']:.1f}%")
        
        # Determine exit code based on compliance
        if summary['overall_compliance_percentage'] >= 80:
            print("\n✅ ESA 61×21 Framework compliance achieved!")
            sys.exit(0)
        elif summary['overall_compliance_percentage'] >= 60:
            print("\n⚠️ Partial ESA 61×21 Framework compliance - some improvements needed")
            sys.exit(1)
        else:
            print("\n❌ ESA 61×21 Framework compliance not achieved - significant work needed")
            sys.exit(2)
            
    except KeyboardInterrupt:
        print("\n\nTest execution interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nTest execution failed with error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()